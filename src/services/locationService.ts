import { and, desc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import {
  locationsTable,
  mediaTable,
  postsTable,
  regionTable,
  spotsTable,
  usersTable,
} from "../db/schema.js";
import { db } from "../drizzle.js";
import { logger } from "../middlewares/logger.js";
import { AppError } from "../utils/error.js";
import {
  createLocationSchema,
  getLocationPostsQuerySchema,
  getLocationSchema,
  getNearLocationSchema,
  searchLocationSchema,
  updateLocationSchema,
} from "../utils/zodschemas.js";

type LocationListRow = {
  id: number;
  name: string;
  region_id: number;
  category: string;
  description: string | null;
  cover_url: string;
  center_point: { lat: number; lng: number };
  submitted_by_id: number;
  submitted_by_username: string;
  created_at: Date;
};

type LocationListItem = {
  id: number;
  name: string;
  region_id: number;
  category: string;
  description: string | null;
  cover_url: string;
  center_point: { lat: number; lng: number };
  submitted_by: {
    id: number;
    username: string;
  };
  created_at: Date;
};

const ensureLocationManagePermission = async (
  userId: number,
  userRole: string,
  locationId: number,
) => {
  const existingRows = await db
    .select({
      id: locationsTable.id,
      submitted_by: locationsTable.submittedBy,
    })
    .from(locationsTable)
    .where(eq(locationsTable.id, locationId))
    .limit(1);

  const existing = existingRows[0];
  if (!existing) {
    throw new AppError(404, "NOT_FOUND", "Location not found");
  }

  if (existing.submitted_by !== userId && userRole !== "admin") {
    throw new AppError(403, "FORBIDDEN", "You do not have permission to modify this location");
  }

  return existing;
};

const buildLocationListConditions = (params: {
  region_id?: number;
  category?: string;
  keyword?: string;
}): SQL[] => {
  const conditions: SQL[] = [eq(locationsTable.status, "approved")];

  if (params.region_id !== undefined) {
    conditions.push(eq(locationsTable.regionId, params.region_id));
  }
  if (params.category !== undefined) {
    conditions.push(eq(locationsTable.category, params.category));
  }
  if (params.keyword !== undefined) {
    const searchCondition = or(
      ilike(locationsTable.name, params.keyword),
      ilike(locationsTable.nameEn, params.keyword),
      ilike(locationsTable.category, params.keyword),
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  return conditions;
};

const mapLocationListRows = (rows: LocationListRow[]): LocationListItem[] =>
  rows.map((row) => ({
    id: row.id,
    name: row.name,
    region_id: row.region_id,
    category: row.category,
    description: row.description,
    cover_url: row.cover_url,
    center_point: row.center_point,
    submitted_by: {
      id: row.submitted_by_id,
      username: row.submitted_by_username,
    },
    created_at: row.created_at,
  }));

const runLocationListQuery = async (
  params: { page?: number; pageSize?: number },
  conditions: SQL[],
  orderBySql: SQL,
) => {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;

  let query = db
    .select({
      id: locationsTable.id,
      name: locationsTable.name,
      region_id: locationsTable.regionId,
      category: locationsTable.category,
      description: locationsTable.description,
      cover_url: locationsTable.coverUrl,
      center_point: sql<{ lat: number; lng: number }>`
        json_build_object('lat', ${locationsTable.centerLat}, 'lng', ${locationsTable.centerLng})
      `,
      submitted_by_id: usersTable.id,
      submitted_by_username: usersTable.name,
      created_at: locationsTable.createdAt,
    })
    .from(locationsTable)
    .innerJoin(usersTable, eq(locationsTable.submittedBy, usersTable.id))
    .$dynamic();

  let countQuery = db
    .select({ total: sql<number>`count(*)` })
    .from(locationsTable)
    .$dynamic();

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
    countQuery = countQuery.where(and(...conditions));
  }

  const rows = (await query
    .orderBy(orderBySql)
    .limit(pageSize)
    .offset((page - 1) * pageSize)) as LocationListRow[];
  const countRows = await countQuery;
  const total = Number(countRows[0]?.total ?? 0);

  return {
    pagination: {
      total,
      page,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
    data: mapLocationListRows(rows),
  };
};

export const getLocationService = async (
  params: z.infer<typeof getLocationSchema>,
) => {
  const conditions = buildLocationListConditions({
    region_id: params.region_id,
    category: params.category,
  });
  const orderBySql =
    params.sort === "popular"
      ? desc(locationsTable.updatedAt)
      : desc(locationsTable.createdAt);

  return runLocationListQuery(params, conditions, orderBySql);
};

export const searchLocationService = async (
  params: z.infer<typeof searchLocationSchema>,
) => {
  const conditions = buildLocationListConditions({
    region_id: params.region_id,
    category: params.category,
    keyword: `%${params.q}%`,
  });
  return runLocationListQuery(params, conditions, desc(locationsTable.updatedAt));
};

//not use temprarily
export const getNearLocationService = async (
  params: z.infer<typeof getNearLocationSchema>,
) => {
  const { lat, lng, radius } = params;
  const earthRadiusKm = 6371;
  const latDelta = radius / 111.32;
  const safeCos = Math.max(Math.cos((lat * Math.PI) / 180), 0.000001);
  const lngDelta = radius / (111.32 * safeCos);
  const minLat = lat - latDelta;
  const maxLat = lat + latDelta;
  const minLng = lng - lngDelta;
  const maxLng = lng + lngDelta;

  const distance = sql<number>`
    ${earthRadiusKm} * 2 * asin(
      sqrt(
        power(sin(radians((${locationsTable.centerLat} - ${lat}) / 2)), 2) +
        cos(radians(${lat})) *
        cos(radians(${locationsTable.centerLat})) *
        power(sin(radians((${locationsTable.centerLng} - ${lng}) / 2)), 2)
      )
    )
  `;

  return db
    .select({
      id: locationsTable.id,
      name: locationsTable.name,
      category: locationsTable.category,
      distance_km: distance,
      center_point: sql<{ lat: number; lng: number }>`
        json_build_object('lat', ${locationsTable.centerLat}, 'lng', ${locationsTable.centerLng})
      `,
    })
    .from(locationsTable)
    .where(
      and(
        eq(locationsTable.status, "approved"),
        sql`${locationsTable.centerLat} BETWEEN ${minLat} AND ${maxLat}`,
        sql`${locationsTable.centerLng} BETWEEN ${minLng} AND ${maxLng}`,
        sql`${distance} <= ${radius}`,
      ),
    )
    .orderBy(distance);
};

export const getLocationDetailService = async (locationId: number) => {
  const locationRows = await db
    .select({
      id: locationsTable.id,
      name: locationsTable.name,
      region_id: locationsTable.regionId,
      cover_url: locationsTable.coverUrl,
      category: locationsTable.category,
      description: locationsTable.description,
      key_points: locationsTable.keyPoints,
      center_point: sql<{ lat: number; lng: number }>`
        json_build_object('lat', ${locationsTable.centerLat}, 'lng', ${locationsTable.centerLng})
      `,
      submitted_by_id: locationsTable.submittedBy,
      created_at: locationsTable.createdAt,
    })
    .from(locationsTable)
    .where(and(eq(locationsTable.id, locationId), eq(locationsTable.status, "approved")))
    .limit(1);

  const locationRow = locationRows[0];
  if (!locationRow) {
    logger.warn(
      { action: "location.getDetail", locationId },
      "location not found",
    );
    throw new AppError(404, "NOT_FOUND", "Location not found");
  }

  const spots = await db
    .select({
      id: spotsTable.id,
      name: spotsTable.name,
      description: spotsTable.description,
      image_url: spotsTable.imageUrl,
      point: sql<{ lat: number; lng: number }>`
        json_build_object('lat', ${spotsTable.pointLat}, 'lng', ${spotsTable.pointLng})
      `,
    })
    .from(spotsTable)
    .where(
      and(
        eq(spotsTable.locationId, locationId),
        eq(spotsTable.status, "approved"),
      ),
    );

  const posts = await db
    .select({
      id: postsTable.id,
      title: postsTable.title,
      post_type: postsTable.postType,
      submitted_by_id: postsTable.submittedBy,
      created_at: postsTable.createdAt,
    })
    .from(postsTable)
    .where(
      and(
        eq(postsTable.locationId, locationId),
        eq(postsTable.status, "approved"),
      ),
    )
    .orderBy(desc(postsTable.createdAt));

  const userIdSet = new Set<number>();
  userIdSet.add(locationRow.submitted_by_id);
  for (const post of posts) userIdSet.add(post.submitted_by_id);

  const userIds = Array.from(userIdSet);
  const users =
    userIds.length === 0
      ? []
      : await db
          .select({
            id: usersTable.id,
            username: usersTable.name,
            avatar_url: usersTable.avatar_url,
          })
          .from(usersTable)
          .where(inArray(usersTable.id, userIds));

  const userMap = new Map(users.map((user) => [user.id, user]));

  return {
    location: {
      id: locationRow.id,
      name: locationRow.name,
      region_id: locationRow.region_id,
      cover_url: locationRow.cover_url,
      category: locationRow.category,
      description: locationRow.description,
      key_points: locationRow.key_points,
      center_point: locationRow.center_point,
      submitted_by: userMap.get(locationRow.submitted_by_id) ?? {
        id: locationRow.submitted_by_id,
        username: "",
        avatar_url: null,
      },
      created_at: locationRow.created_at,
    },
    spots,
    posts: posts.map((post) => ({
      id: post.id,
      title: post.title,
      post_type: post.post_type,
      submitted_by: userMap.get(post.submitted_by_id) ?? {
        id: post.submitted_by_id,
        username: "",
      },
      created_at: post.created_at,
    })),
  };
};

export const getLocationSpotsService = async (locationId: number) => {
  const locationRows = await db
    .select({ id: locationsTable.id })
    .from(locationsTable)
    .where(eq(locationsTable.id, locationId))
    .limit(1);

  if (!locationRows[0]) {
    logger.warn(
      { action: "location.getSpots", locationId },
      "location not found",
    );
    throw new AppError(404, "NOT_FOUND", "Location not found");
  }

  return db
    .select({
      id: spotsTable.id,
      name: spotsTable.name,
      description: spotsTable.description,
      image_url: spotsTable.imageUrl,
      point: sql<{ lat: number; lng: number }>`
        json_build_object('lat', ${spotsTable.pointLat}, 'lng', ${spotsTable.pointLng})
      `,
      submitted_by: sql<{ id: number; username: string }>`
        json_build_object('id', ${usersTable.id}, 'username', ${usersTable.name})
      `,
    })
    .from(spotsTable)
    .innerJoin(usersTable, eq(spotsTable.submittedBy, usersTable.id))
    .where(
      and(
        eq(spotsTable.locationId, locationId),
        eq(spotsTable.status, "approved"),
      ),
    )
    .orderBy(desc(spotsTable.createdAt));
};

export const createLocationService = async (
  userId: number,
  input: z.infer<typeof createLocationSchema>,
) => {
  const regionRows = await db
    .select({ id: regionTable.id })
    .from(regionTable)
    .where(eq(regionTable.id, input.region_id))
    .limit(1);

  if (regionRows.length === 0) {
    logger.warn(
      { action: "location.create", userId, regionId: input.region_id },
      "create location failed: region not found",
    );
    throw new AppError(404, "NOT_FOUND", "Region not found");
  }

  const existingLocationRows = await db
    .select({ id: locationsTable.id })
    .from(locationsTable)
    .where(eq(locationsTable.name, input.name))
    .limit(1);

  if (existingLocationRows.length > 0) {
    logger.warn(
      { action: "location.create", userId, locationName: input.name },
      "create location failed: location with same name already exists",
    );
    throw new AppError(409, "ALREADY_EXISTS", "Location with same name already exists");
  }

  const [created] = await db
    .insert(locationsTable)
    .values({
      name: input.name,
      regionId: input.region_id,
      category: input.category,
      coverUrl: input.cover_url,
      description: input.description,
      keyPoints: input.key_points,
      centerLat: input.center_point.lat,
      centerLng: input.center_point.lng,
      status: "approved",
      submittedBy: userId,
    })
    .returning({
      id: locationsTable.id,
      status: locationsTable.status,
    });

  if (!created) {
    logger.error(
      { action: "location.create", userId, regionId: input.region_id },
      "create location failed: insert returned empty",
    );
    throw new AppError(500, "DATABASE_ERROR", "Location creation failed");
  }

  logger.info(
    { action: "location.create", userId, locationId: created.id },
    "create location success",
  );

  return {
    id: created.id,
    status: created.status,
    message: "upload success",
  };
};

export const updateLocationService = async (
  userId: number,
  userRole: string,
  replacesId: number,
  input: z.infer<typeof updateLocationSchema>,
) => {
  await ensureLocationManagePermission(userId, userRole, replacesId);

  const existingRows = await db
    .select({
      id: locationsTable.id,
      name: locationsTable.name,
      region_id: locationsTable.regionId,
      category: locationsTable.category,
      cover_url: locationsTable.coverUrl,
      description: locationsTable.description,
      key_points: locationsTable.keyPoints,
      center_lat: locationsTable.centerLat,
      center_lng: locationsTable.centerLng,
    })
    .from(locationsTable)
    .where(eq(locationsTable.id, replacesId))
    .limit(1);

  const existing = existingRows[0];

  if (!existing) {
    logger.warn(
      { action: "location.update", userId, replacesId },
      "update location failed: location not found after permission check",
    );
    throw new AppError(404, "NOT_FOUND", "Location not found");
  }

  const nextRegionId = input.region_id ?? existing.region_id;
  if (nextRegionId !== existing.region_id) {
    const regionRows = await db
      .select({ id: regionTable.id })
      .from(regionTable)
      .where(eq(regionTable.id, nextRegionId))
      .limit(1);

    if (regionRows.length === 0) {
      logger.warn(
        {
          action: "location.update",
          userId,
          replacesId,
          regionId: nextRegionId,
        },
        "update location failed: region not found",
      );
      throw new AppError(404, "NOT_FOUND", "Region not found");
    }
  }

  const nextCenterLat = input.center_point
    ? input.center_point.lat
    : existing.center_lat;
  const nextCenterLng = input.center_point
    ? input.center_point.lng
    : existing.center_lng;

  const existingLocationWithSameNameRows = await db
    .select({ id: locationsTable.id })
    .from(locationsTable)
    .where(eq(locationsTable.name, input.name ?? existing.name))
    .limit(1);

  if (existingLocationWithSameNameRows.length > 0) {
    const existingLocationWithSameName = existingLocationWithSameNameRows[0];
    if (existingLocationWithSameName.id !== replacesId) {
      logger.warn(
        {
          action: "location.update",
          userId,
          replacesId,
          name: input.name ?? existing.name,
        },
        "update location failed: location with same name already exists",
      );
      throw new AppError(409, "ALREADY_EXISTS", "Location with same name already exists");
    }
  }

  const [updated] = await db
    .update(locationsTable)
    .set({
      name: input.name ?? existing.name,
      regionId: nextRegionId,
      category: input.category ?? existing.category,
      coverUrl: input.cover_url ?? existing.cover_url,
      description:
        input.description !== undefined
          ? input.description
          : existing.description,
      keyPoints:
        input.key_points !== undefined ? input.key_points : existing.key_points,
      centerLat: nextCenterLat,
      centerLng: nextCenterLng,
    })
    .where(eq(locationsTable.id, replacesId))
    .returning({
      id: locationsTable.id,
      status: locationsTable.status,
      replaces_id: locationsTable.replacesId,
    });

  if (!updated) {
    logger.error(
      { action: "location.update", userId, replacesId },
      "update location failed: update returned empty",
    );
    throw new AppError(500, "DATABASE_ERROR", "Location update failed");
  }

  logger.info(
    { action: "location.update", userId, replacesId, locationId: updated.id },
    "update location success",
  );

  return {
    id: updated.id,
    status: updated.status,
    replaces_id: updated.replaces_id,
    message: "update success",
  };
};

export const deleteLocationService = async (
  userId: number,
  userRole: string,
  locationId: number,
) => {
  await ensureLocationManagePermission(userId, userRole, locationId);

  const [deleted] = await db
    .delete(locationsTable)
    .where(eq(locationsTable.id, locationId))
    .returning({
      deleted_id: locationsTable.id,
      message: sql<string>`'Location deleted successfully'`,
    });

  if (!deleted) {
    logger.error(
      { action: "location.delete", userId, locationId },
      "delete location failed: delete returned empty",
    );
    throw new AppError(500, "DATABASE_ERROR", "Location deletion failed");
  }

  logger.info({ action: "location.delete", userId, locationId }, "delete location success");
  return deleted;
};

export const getLocationPostsService = async (
  locationId: number,
  query: z.infer<typeof getLocationPostsQuerySchema>,
) => {
  const { spot_id, post_type } = query;
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;

  const locationRows = await db
    .select({ id: locationsTable.id })
    .from(locationsTable)
    .where(eq(locationsTable.id, locationId))
    .limit(1);

  if (!locationRows[0]) {
    logger.warn(
      { action: "location.getPosts", locationId },
      "location not found",
    );
    throw new AppError(404, "NOT_FOUND", "Location not found");
  }

  const whereConditions = [
    eq(postsTable.locationId, locationId),
    eq(postsTable.status, "approved"),
    spot_id ? eq(postsTable.spotId, spot_id) : undefined,
    post_type ? eq(postsTable.postType, post_type) : undefined,
  ].filter(Boolean) as SQL[];

  const rows = await db
    .select({
      id: postsTable.id,
      title: postsTable.title,
      content: postsTable.content,
      post_type: postsTable.postType,
      like_count: postsTable.likeCount,
      created_at: postsTable.createdAt,
      submitted_by_id: usersTable.id,
      submitted_by_username: usersTable.name,
    })
    .from(postsTable)
    .innerJoin(usersTable, eq(postsTable.submittedBy, usersTable.id))
    .where(and(...whereConditions))
    .orderBy(desc(postsTable.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const postIds = rows.map((row) => row.id);
  const mediaRows =
    postIds.length === 0
      ? []
      : await db
          .select({
            post_id: mediaTable.postId,
            media_type: mediaTable.mediaType,
            url: mediaTable.url,
            thumbnail_url: mediaTable.thumbnailUrl,
            display_order: mediaTable.displayOrder,
          })
          .from(mediaTable)
          .where(inArray(mediaTable.postId, postIds))
          .orderBy(mediaTable.displayOrder);

  const mediaByPostId = new Map<
    number,
    Array<{ media_type: string; url: string; thumbnail_url: string | null }>
  >();

  for (const media of mediaRows) {
    const list = mediaByPostId.get(media.post_id) ?? [];
    list.push({
      media_type: media.media_type,
      url: media.url,
      thumbnail_url: media.thumbnail_url ?? null,
    });
    mediaByPostId.set(media.post_id, list);
  }

  const countRows = await db
    .select({ total: sql<number>`count(*)` })
    .from(postsTable)
    .where(and(...whereConditions));

  const total = Number(countRows[0]?.total ?? 0);

  return {
    data: rows.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      post_type: row.post_type,
      media: mediaByPostId.get(row.id) ?? [],
      submitted_by: {
        id: row.submitted_by_id,
        username: row.submitted_by_username,
      },
      like_count: row.like_count,
      created_at: row.created_at,
    })),
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};
