import { AppError } from "../utils/error.js";
import { db } from "../drizzle.js";
import {
  favoritesTable,
  mediaTable,
  postsTable,
  spotsTable,
  locationsTable,
} from "../db/schema.js";
import { eq, sql, and, or, desc, isNotNull } from "drizzle-orm";
import { isPgUniqueViolation } from "../utils/db.js";

export type FavouriteTargetType = "post" | "spot" | "location";

export interface FavouriteTarget {
  type: FavouriteTargetType;
  id: number;
}

export interface FavouriteListItem {
  id: number;
  type: string;
  target_id: number;
  name: string | null;
  description: string | null;
  cover_image: string | null;
  created_at: Date;
}

/**
 * Get the user's favourites list with optional type filtering.
 * Uses three LEFT JOINs + COALESCE for a single-query mixed list.
 * Only returns favourites whose target entity has status = 'approved'.
 */
export async function getFavouritesService(
  userId: number,
  type?: FavouriteTargetType,
): Promise<FavouriteListItem[]> {
  const favourites = await db
    .select({
      id: favoritesTable.id,
      type: sql<string>`CASE
        WHEN ${favoritesTable.postId} IS NOT NULL THEN 'post'
        WHEN ${favoritesTable.spotId} IS NOT NULL THEN 'spot'
        ELSE 'location' END`,
      target_id: sql<number>`COALESCE(${favoritesTable.postId}, ${favoritesTable.spotId}, ${favoritesTable.locationId})`,
      name: sql<string | null>`COALESCE(${postsTable.title}, ${spotsTable.name}, ${locationsTable.name})`,
      description: sql<string | null>`COALESCE(${postsTable.content}, ${spotsTable.description}, ${locationsTable.description})`,
      cover_image: sql<string | null>`COALESCE(
        ${spotsTable.imageUrl},
        ${locationsTable.coverUrl},
        (
          SELECT COALESCE(${mediaTable.thumbnailUrl}, ${mediaTable.url})
          FROM ${mediaTable}
          WHERE ${mediaTable.postId} = ${postsTable.id}
          ORDER BY ${mediaTable.displayOrder}
          LIMIT 1
        )
      )`,
      created_at: favoritesTable.createdAt,
    })
    .from(favoritesTable)
    .leftJoin(postsTable, eq(favoritesTable.postId, postsTable.id))
    .leftJoin(spotsTable, eq(favoritesTable.spotId, spotsTable.id))
    .leftJoin(locationsTable, eq(favoritesTable.locationId, locationsTable.id))
    .where(
      and(
        eq(favoritesTable.userId, userId),
        or(
          and(isNotNull(favoritesTable.postId), eq(postsTable.status, "approved")),
          and(isNotNull(favoritesTable.spotId), eq(spotsTable.status, "approved")),
          and(isNotNull(favoritesTable.locationId), eq(locationsTable.status, "approved")),
        ),
        type ? isNotNull(favoritesTable[`${type}Id`]) : undefined,
      ),
    )
    .orderBy(desc(favoritesTable.createdAt));

  return favourites;
}

/**
 * Add a favourite for the given user and target entity.
 * Looks up the entity, checks for duplicates, inserts with the correct FK column.
 * Handles concurrent duplicate inserts via unique violation catch (409).
 */
export async function addFavouriteService(
  userId: number,
  target: FavouriteTarget,
): Promise<{ id: number; type: FavouriteTargetType; target_id: number; created_at: Date }> {
  // 1. Look up entity exists
  const entityExists = await lookupEntity(target);
  if (!entityExists) {
    throw new AppError(404, "NOT_FOUND", `${capitalize(target.type)} not found`);
  }

  // 2. Check for existing duplicate favourite
  const fkColumn = getFkColumn(target.type);
  const existingFavourite = await db
    .select({ id: favoritesTable.id })
    .from(favoritesTable)
    .where(
      and(
        eq(favoritesTable.userId, userId),
        eq(fkColumn, target.id),
      ),
    )
    .limit(1);

  if (existingFavourite.length > 0) {
    throw new AppError(409, "ALREADY_EXISTS", "Favourite already exists");
  }

  // 3. Insert with the correct FK column set
  const insertValues: Record<string, unknown> = {
    userId,
    [`${target.type}Id`]: target.id,
  };

  try {
    const result = await db
      .insert(favoritesTable)
      .values(insertValues as typeof favoritesTable.$inferInsert)
      .returning({
        id: favoritesTable.id,
        created_at: favoritesTable.createdAt,
      });

    if (!result[0]) {
      throw new AppError(500, "INTERNAL_ERROR", "Favourite not added");
    }

    return {
      id: result[0].id,
      type: target.type,
      target_id: target.id,
      created_at: result[0].created_at,
    };
  } catch (error) {
    // Handle concurrent duplicate inserts (unique index violation)
    if (isPgUniqueViolation(error)) {
      throw new AppError(409, "ALREADY_EXISTS", "Favourite already exists");
    }

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(500, "INTERNAL_ERROR", "Favourite not added", error);
  }
}

/**
 * Remove a favourite for the given user and target entity.
 * Looks up the existing favourite by type+id, then deletes it.
 */
export async function removeFavouriteService(
  userId: number,
  target: FavouriteTarget,
): Promise<void> {
  const fkColumn = getFkColumn(target.type);

  const existingFavourite = await db
    .select({ id: favoritesTable.id })
    .from(favoritesTable)
    .where(
      and(
        eq(favoritesTable.userId, userId),
        eq(fkColumn, target.id),
      ),
    )
    .limit(1);

  if (existingFavourite.length === 0) {
    throw new AppError(404, "NOT_FOUND", "Favourite not found");
  }

  await db
    .delete(favoritesTable)
    .where(
      and(
        eq(favoritesTable.userId, userId),
        eq(fkColumn, target.id),
      ),
    );
}

/**
 * Check if the user has already favourited the given target entity.
 */
export async function checkIsFavouritedService(
  userId: number,
  target: FavouriteTarget,
): Promise<{ isFavourited: boolean }> {
  const fkColumn = getFkColumn(target.type);

  const result = await db
    .select({ id: favoritesTable.id })
    .from(favoritesTable)
    .where(
      and(
        eq(favoritesTable.userId, userId),
        eq(fkColumn, target.id),
      ),
    )
    .limit(1);

  return { isFavourited: result.length > 0 };
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

/**
 * Look up whether the target entity exists in the database.
 */
async function lookupEntity(target: FavouriteTarget): Promise<boolean> {
  let result: { id: number }[];

  switch (target.type) {
    case "post":
      result = await db
        .select({ id: postsTable.id })
        .from(postsTable)
        .where(eq(postsTable.id, target.id))
        .limit(1);
      break;
    case "spot":
      result = await db
        .select({ id: spotsTable.id })
        .from(spotsTable)
        .where(eq(spotsTable.id, target.id))
        .limit(1);
      break;
    case "location":
      result = await db
        .select({ id: locationsTable.id })
        .from(locationsTable)
        .where(eq(locationsTable.id, target.id))
        .limit(1);
      break;
  }

  return result.length > 0;
}

/**
 * Get the Drizzle column reference for the given target type.
 */
function getFkColumn(type: FavouriteTargetType) {
  switch (type) {
    case "post":
      return favoritesTable.postId;
    case "spot":
      return favoritesTable.spotId;
    case "location":
      return favoritesTable.locationId;
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
