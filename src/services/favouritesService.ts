import { AppError } from "../utils/error.js";
import { db } from "../drizzle.js";
import { favoritesTable, spotsTable } from "../db/schema.js";
import { eq, sql, and } from "drizzle-orm";
import { isPgUniqueViolation } from "../utils/db.js";

export async function getFavouritesService(userId: number) {
  const favourites = await db
    .select({
      id: favoritesTable.id,
      spot: {
        id: spotsTable.id,
        name: spotsTable.name,
        description: spotsTable.description,
        center_point: sql<{
          lat: number;
          lng: number;
        }>`json_build_object('lat', ${spotsTable.pointLat}, 'lng', ${spotsTable.pointLng})`,
      },
      created_at: favoritesTable.createdAt,
    })
    .from(favoritesTable)
    .innerJoin(spotsTable, eq(favoritesTable.spotId, spotsTable.id))
    .where(
      and(
        eq(favoritesTable.userId, userId),
        eq(spotsTable.status, "approved"),
      ),
    );
  return favourites;
}

export async function addFavouriteService(userId: number, spotId: number) {
  const existingSpot = await db
    .select({ id: spotsTable.id })
    .from(spotsTable)
    .where(eq(spotsTable.id, spotId))
    .limit(1);

  if (!existingSpot[0]) {
    throw new AppError(404, "NOT_FOUND", "Spot not found");
  }

  const existingFavourite = await db
    .select()
    .from(favoritesTable)
    .where(
      and(eq(favoritesTable.userId, userId), eq(favoritesTable.spotId, spotId)),
    )
    .limit(1);
  if (existingFavourite.length > 0) {
    throw new AppError(409, "ALREADY_EXISTS", "Favourite already exists");
  }

  try {
    const result = await db
      .insert(favoritesTable)
      .values({
        userId,
        spotId,
      })
      .returning({
        id: favoritesTable.id,
        spot_id: favoritesTable.spotId,
        created_at: favoritesTable.createdAt,
      });

    if (!result[0]) {
      throw new AppError(500, "INTERNAL_ERROR", "Favourite not added");
    }

    return result[0];
  } catch (error) {
    if (isPgUniqueViolation(error, "favorites_user_spot_unique_idx")) {
      throw new AppError(409, "ALREADY_EXISTS", "Favourite already exists");
    }

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(500, "INTERNAL_ERROR", "Favourite not added", error);
  }
}

export async function removeFavouriteService(userId: number, spotId: number) {
  const existingFavourite = await db
    .select()
    .from(favoritesTable)
    .where(
      and(eq(favoritesTable.userId, userId), eq(favoritesTable.spotId, spotId)),
    )
    .limit(1);
  if (existingFavourite.length === 0) {
    throw new AppError(404, "NOT_FOUND", "Favourite not found");
  }

  try {
    await db
      .delete(favoritesTable)
      .where(
        and(eq(favoritesTable.userId, userId), eq(favoritesTable.spotId, spotId)),
      );
  } catch (error) {
    throw new AppError(500, "INTERNAL_ERROR", "Favourite not removed", error);
  }
}
