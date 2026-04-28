import { and, eq, sql } from "drizzle-orm";
import { locationsTable, spotsTable, usersTable } from "../db/schema.js";
import { db } from "../drizzle.js";
import { AppError } from "../utils/error.js";

export async function createSpotService(
  userId: number,
  name: string,
  location_id: number,
  description: string,
  image_url: string | undefined,
  point: {
    lat: number;
    lng: number;
  },
) {
  const locationRows = await db
    .select({ id: locationsTable.id })
    .from(locationsTable)
    .where(eq(locationsTable.id, location_id))
    .limit(1);

  if (!locationRows[0]) {
    throw new AppError(404, "NOT_FOUND", "Location not found");
  }

  const [created] = await db
    .insert(spotsTable)
    .values({
      submittedBy: userId,
      name,
      locationId: location_id,
      description,
      imageUrl: image_url,
      pointLat: point.lat,
      pointLng: point.lng,
    })
    .returning({
      id: spotsTable.id,
      status: spotsTable.status,
      message: sql`CASE WHEN ${spotsTable.status} = 'pending' THEN 'send' ELSE 'posted' END`,
    });

  if (!created) {
    throw new AppError(500, "DATABASE_ERROR", "Spot creation failed");
  }

  return created;
}

export async function updateSpotService(
  spotId: number,
  userId: number,
  userRole: string,
  name: string,
  location_id: number | undefined,
  description: string,
  image_url: string | undefined,
  point: {
    lat: number;
    lng: number;
  },
) {
  if (location_id !== undefined) {
    const locationRows = await db
      .select({ id: locationsTable.id })
      .from(locationsTable)
      .where(eq(locationsTable.id, location_id))
      .limit(1);

    if (!locationRows[0]) {
      throw new AppError(404, "NOT_FOUND", "Location not found");
    }
  }

  const spotRows = await db
    .select({
      id: spotsTable.id,
      submittedBy: spotsTable.submittedBy,
    })
    .from(spotsTable)
    .where(eq(spotsTable.id, spotId))
    .limit(1);

  if (!spotRows[0]) {
    throw new AppError(404, "NOT_FOUND", "Spot not found");
  }

  if (spotRows[0].submittedBy !== userId && userRole !== "admin") {
    throw new AppError(403, "FORBIDDEN", "You can only edit your own spots");
  }

  const [updated] = await db
    .update(spotsTable)
    .set({
      name,
      ...(location_id !== undefined && { locationId: location_id }),
      description,
      imageUrl: image_url,
      pointLat: point.lat,
      pointLng: point.lng,
    })
    .where(eq(spotsTable.id, spotId))
    .returning({
      id: spotsTable.id,
      status: spotsTable.status,
      message: sql`CASE WHEN ${spotsTable.status} = 'pending' THEN 'send' ELSE 'posted' END`,
    });

  if (!updated) {
    throw new AppError(500, "DATABASE_ERROR", "Spot update failed");
  }

  return updated;
}

export async function deleteSpotService(
  userId: number,
  spotId: number,
  userRole: string = "user",
) {
  const existingSpot = await db
    .select({
      id: spotsTable.id,
      submittedBy: spotsTable.submittedBy,
    })
    .from(spotsTable)
    .where(eq(spotsTable.id, spotId))
    .limit(1);

  if (!existingSpot[0]) {
    throw new AppError(404, "NOT_FOUND", "Spot not found");
  }

  if (existingSpot[0].submittedBy !== userId && userRole !== "admin") {
    throw new AppError(403, "FORBIDDEN", "You can only delete your own spots");
  }

  const [deleted] = await db
    .delete(spotsTable)
    .where(eq(spotsTable.id, spotId))
    .returning({
      deleted_id: spotsTable.id,
      message: sql`'Spot deleted successfully'`,
    });

  if (!deleted) {
    throw new AppError(500, "DATABASE_ERROR", "Spot deletion failed");
  }

  return deleted;
}

export async function getSpotService(spotId: number) {
  const [spot] = await db
    .select({
      id: spotsTable.id,
      name: spotsTable.name,
      location_id: spotsTable.locationId,
      description: spotsTable.description,
      image_url: spotsTable.imageUrl,
      point: {
        lat: spotsTable.pointLat,
        lng: spotsTable.pointLng,
      },
      submitted_by: {
        id: usersTable.id,
        username: usersTable.name,
        avatar_url: usersTable.avatar_url,
      },
      created_at: spotsTable.createdAt,
      updated_at: spotsTable.updatedAt,
    })
    .from(spotsTable)
    .leftJoin(usersTable, eq(spotsTable.submittedBy, usersTable.id))
    .where(
      and(
        eq(spotsTable.id, spotId),
        eq(spotsTable.status, "approved"),
      ),
    )
    .limit(1);

  if (!spot) {
    throw new AppError(404, "NOT_FOUND", "Spot not found");
  }

  return spot;
}
