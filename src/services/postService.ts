import { db } from "../drizzle.js";
import {
  locationsTable,
  mediaTable,
  postsTable,
  spotsTable,
  usersTable,
} from "../db/schema.js";
import { and, desc, eq, inArray, sql, SQL } from "drizzle-orm";
import {
  getPostsSchema,
  createPostSchema,
  updatePostSchema,
} from "../utils/zodschemas.js";
import { z } from "zod";
import { AppError } from "../utils/error.js";
import { logger } from "../middlewares/logger.js";

const getLocationById = async (locationId: number) => {
  const rows = await db
    .select({ id: locationsTable.id })
    .from(locationsTable)
    .where(eq(locationsTable.id, locationId))
    .limit(1);
  return rows[0] ?? null;
};

const getSpotById = async (spotId: number) => {
  const rows = await db
    .select({ id: spotsTable.id, locationId: spotsTable.locationId })
    .from(spotsTable)
    .where(eq(spotsTable.id, spotId))
    .limit(1);
  return rows[0] ?? null;
};

const ensureLocationExists = async (
  locationId: number,
  context: { action: string; userId: number },
) => {
  const location = await getLocationById(locationId);
  if (!location) {
    logger.warn(
      { action: context.action, userId: context.userId, locationId },
      "location not found",
    );
    throw new AppError(404, "NOT_FOUND", "Location not found");
  }
};

const ensureSpotExists = async (
  spotId: number,
  context: { action: string; userId: number },
) => {
  const spot = await getSpotById(spotId);
  if (!spot) {
    logger.warn(
      { action: context.action, userId: context.userId, spotId },
      "spot not found",
    );
    throw new AppError(404, "NOT_FOUND", "Spot not found");
  }
  return spot;
};

const validateLocationSpotPair = (
  locationId: number,
  spotLocationId: number,
) => {
  if (locationId !== spotLocationId) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "spot_id does not belong to the provided location_id",
    );
  }
};

export const getPostsService = async (
  params: z.infer<typeof getPostsSchema>,
) => {
  const { page = 1, pageSize = 20, post_type, location_id, spot_id } = params;
  const offset = (page - 1) * pageSize;

  const filters: SQL[] = [eq(postsTable.status, "approved")];
  if (post_type) {
    filters.push(eq(postsTable.postType, post_type));
  }
  if (location_id) {
    filters.push(eq(postsTable.locationId, location_id));
  }
  if (spot_id) {
    filters.push(eq(postsTable.spotId, spot_id));
  }

  const buildWhere = <T>(query: T) =>
    filters.length > 0 ? (query as any).where(and(...filters)) : query;

  const baseQuery = db
    .select({
      id: postsTable.id,
      title: postsTable.title,
      content: postsTable.content,
      post_type: postsTable.postType,
      like_count: postsTable.likeCount,
      created_at: postsTable.createdAt,
      updated_at: postsTable.updatedAt,
      location: {
        id: locationsTable.id,
        name: locationsTable.name,
      },
      spot: {
        id: spotsTable.id,
        name: spotsTable.name,
      },
      submitted_by: {
        id: usersTable.id,
        username: usersTable.name,
        avatar_url: usersTable.avatar_url,
      },
    })
    .from(postsTable)
    .leftJoin(locationsTable, eq(postsTable.locationId, locationsTable.id))
    .leftJoin(spotsTable, eq(postsTable.spotId, spotsTable.id))
    .leftJoin(usersTable, eq(postsTable.submittedBy, usersTable.id));

  const posts: any[] = await buildWhere(baseQuery)
    .orderBy(desc(postsTable.createdAt))
    .limit(pageSize)
    .offset(offset);

  const countResult = await buildWhere(
    db.select({ count: sql<number>`count(*)` }).from(postsTable),
  );
  const total = Number(countResult[0]?.count ?? 0);

  const postIds = posts.map((post) => post.id);
  let mediaMap = new Map<
    number,
    { media_type: string; url: string; thumbnail_url: string | null }[]
  >();
  if (postIds.length > 0) {
    const mediaRows = await db
      .select({
        post_id: mediaTable.postId,
        media_type: mediaTable.mediaType,
        url: mediaTable.url,
        thumbnail_url: mediaTable.thumbnailUrl,
      })
      .from(mediaTable)
      .where(inArray(mediaTable.postId, postIds))
      .orderBy(mediaTable.displayOrder);

    mediaMap = mediaRows.reduce((map, media) => {
      if (!map.has(media.post_id)) {
        map.set(media.post_id, []);
      }
      map.get(media.post_id)!.push({
        media_type: media.media_type,
        url: media.url,
        thumbnail_url: media.thumbnail_url,
      });
      return map;
    }, new Map<number, { media_type: string; url: string; thumbnail_url: string | null }[]>());
  }

  const formattedPosts = posts.map((post) => ({
    ...post,
    location: post.location?.id
      ? { id: post.location.id, name: post.location.name }
      : null,
    spot: post.spot?.id ? { id: post.spot.id, name: post.spot.name } : null,
    submitted_by: post.submitted_by?.id
      ? {
          id: post.submitted_by.id,
          username: post.submitted_by.username,
          avatar_url: post.submitted_by.avatar_url,
        }
      : null,
    media: mediaMap.get(post.id) ?? [],
  }));

  return {
    data: formattedPosts,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: pageSize === 0 ? 0 : Math.ceil(total / pageSize),
    },
  };
};

export const getPostsByIdService = async (post_id: number) => {
  const postRows = await db
    .select({
      id: postsTable.id,
      title: postsTable.title,
      content: postsTable.content,
      post_type: postsTable.postType,
      location_id: postsTable.locationId,
      spot_id: postsTable.spotId,
      location_name: locationsTable.name,
      spot_name: spotsTable.name,
      like_count: postsTable.likeCount,
      created_at: postsTable.createdAt,
      updated_at: postsTable.updatedAt,
      submitted_by: {
        id: usersTable.id,
        username: usersTable.name,
        avatar_url: usersTable.avatar_url,
      },
    })
    .from(postsTable)
    .leftJoin(locationsTable, eq(postsTable.locationId, locationsTable.id))
    .leftJoin(spotsTable, eq(postsTable.spotId, spotsTable.id))
    .leftJoin(usersTable, eq(postsTable.submittedBy, usersTable.id))
    .where(and(eq(postsTable.id, post_id), eq(postsTable.status, "approved")))
    .limit(1);

  if (postRows.length === 0) {
    logger.warn({ action: "post.getById", postId: post_id }, "post not found");
    throw new AppError(404, "NOT_FOUND", "Post not found");
  }

  const mediaRows = await db
    .select({
      id: mediaTable.id,
      url: mediaTable.url,
      thumbnail_url: mediaTable.thumbnailUrl,
      media_type: mediaTable.mediaType,
      display_order: mediaTable.displayOrder,
    })
    .from(mediaTable)
    .where(eq(mediaTable.postId, post_id))
    .orderBy(mediaTable.displayOrder);

  const post = postRows[0];
  return { ...post, media: mediaRows };
};

export const createPostService = async (
  userId: number,
  data: z.infer<typeof createPostSchema>,
) => {
  const { title, content, post_type, location_id, spot_id } = data;

  if (!location_id && !spot_id) {
    logger.warn(
      { action: "post.create", userId },
      "create post failed: missing location and spot",
    );
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "location_id is required when spot_id is not provided",
    );
  }

  if (location_id) {
    await ensureLocationExists(location_id, { action: "post.create", userId });
  }

  let resolvedLocationId = location_id;
  if (spot_id) {
    const spot = await ensureSpotExists(spot_id, { action: "post.create", userId });
    if (location_id) {
      validateLocationSpotPair(location_id, spot.locationId);
    } else {
      resolvedLocationId = spot.locationId;
    }
  }

  if (!resolvedLocationId) {
    logger.error(
      { action: "post.create", userId, location_id, spot_id },
      "create post failed: resolved location missing",
    );
    throw new AppError(500, "DATABASE_ERROR", "Post creation failed");
  }

  const result = await db
    .insert(postsTable)
    .values({
      title,
      content,
      locationId: resolvedLocationId,
      spotId: spot_id,
      postType: post_type,
      submittedBy: userId,
    })
    .returning({ id: postsTable.id, status: postsTable.status });

  if (!result[0]) {
    logger.error(
      { action: "post.create", userId },
      "create post failed: insert returned empty",
    );
    throw new AppError(500, "DATABASE_ERROR", "Post creation failed");
  }

  logger.info(
    { action: "post.create", userId, postId: result[0].id },
    "create post success",
  );
  return result[0];
};

export const updatePostService = async (
  userId: number,
  userRole: string,
  data: z.infer<typeof updatePostSchema>,
  postId: number,
) => {
  const { title, content, post_type, location_id, spot_id } = data;

  const postRows = await db
    .select({
      id: postsTable.id,
      submittedBy: postsTable.submittedBy,
      spotId: postsTable.spotId,
    })
    .from(postsTable)
    .where(eq(postsTable.id, postId))
    .limit(1);

  const post = postRows[0];
  if (!post) {
    logger.warn({ action: "post.update", userId, postId }, "post not found");
    throw new AppError(404, "NOT_FOUND", "Post not found");
  }

  if (post.submittedBy !== userId && userRole !== "admin") {
    logger.warn(
      { action: "post.update", userId, userRole, postId },
      "update post forbidden",
    );
    throw new AppError(403, "FORBIDDEN", "You are not the owner of this post");
  }

  let resolvedLocationId = location_id;
  if (location_id !== undefined) {
    await ensureLocationExists(location_id, { action: "post.update", userId });
  }

  if (spot_id !== undefined) {
    const spot = await ensureSpotExists(spot_id, { action: "post.update", userId });
    if (location_id !== undefined) {
      validateLocationSpotPair(location_id, spot.locationId);
    } else {
      resolvedLocationId = spot.locationId;
    }
  } else if (location_id !== undefined && post.spotId !== null) {
    const currentSpot = await getSpotById(post.spotId);
    if (currentSpot) {
      validateLocationSpotPair(location_id, currentSpot.locationId);
    }
  }

  const result = await db
    .update(postsTable)
    .set({
      title,
      content,
      postType: post_type,
      locationId: resolvedLocationId,
      spotId: spot_id,
    })
    .where(eq(postsTable.id, postId))
    .returning({
      id: postsTable.id,
      status: postsTable.status,
      message: sql<string>`'Post updated successfully'`,
    });

  if (!result[0]) {
    logger.error(
      { action: "post.update", userId, postId },
      "update post failed: update returned empty",
    );
    throw new AppError(500, "DATABASE_ERROR", "Post update failed");
  }

  logger.info({ action: "post.update", userId, postId }, "update post success");
  return result[0];
};

export const deletePostService = async (
  userId: number,
  userRole: string,
  postId: number,
) => {
  const postRows = await db
    .select({
      id: postsTable.id,
      submittedBy: postsTable.submittedBy,
    })
    .from(postsTable)
    .where(eq(postsTable.id, postId))
    .limit(1);

  const post = postRows[0];
  if (!post) {
    logger.warn({ action: "post.delete", userId, postId }, "post not found");
    throw new AppError(404, "NOT_FOUND", "Post not found");
  }

  if (post.submittedBy !== userId && userRole !== "admin") {
    logger.warn(
      { action: "post.delete", userId, userRole, postId },
      "delete post forbidden",
    );
    throw new AppError(403, "FORBIDDEN", "You are not the owner of this post");
  }

  try {
    await db.delete(postsTable).where(eq(postsTable.id, postId));
    logger.info({ action: "post.delete", userId, postId }, "delete post success");
    return { message: "deleted successfully" };
  } catch (err) {
    logger.error(
      { action: "post.delete", userId, postId, err },
      "delete post failed",
    );
    throw new AppError(500, "DATABASE_ERROR", "delete failed");
  }
};
