import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import {
  commentsTable,
  locationsTable,
  mediaTable,
  postsTable,
  spotsTable,
} from "../db/schema.js";
import { db } from "../drizzle.js";
import { getMySubmissionsSchema } from "../utils/zodschemas.js";

export async function getMySubmissionsService(
  userId: number,
  parsed: z.infer<typeof getMySubmissionsSchema>,
) {
  const result: Record<string, unknown> = {};

  if (!parsed.type || parsed.type === "location") {
    const locations = await db
      .select({
        id: locationsTable.id,
        name: locationsTable.name,
        description: locationsTable.description,
        cover_image: locationsTable.coverUrl,
        status: locationsTable.status,
        created_at: locationsTable.createdAt,
      })
      .from(locationsTable)
      .where(
        parsed.status
          ? and(
              eq(locationsTable.submittedBy, userId),
              eq(locationsTable.status, parsed.status),
            )
          : eq(locationsTable.submittedBy, userId),
      );
    result.locations = locations;
  }

  if (!parsed.type || parsed.type === "spot") {
    const spots = await db
      .select({
        id: spotsTable.id,
        name: spotsTable.name,
        description: spotsTable.description,
        cover_image: spotsTable.imageUrl,
        status: spotsTable.status,
        location: {
          id: locationsTable.id,
          name: locationsTable.name,
        },
        created_at: spotsTable.createdAt,
      })
      .from(spotsTable)
      .innerJoin(locationsTable, eq(spotsTable.locationId, locationsTable.id))
      .where(
        parsed.status
          ? and(
              eq(spotsTable.submittedBy, userId),
              eq(spotsTable.status, parsed.status),
            )
          : eq(spotsTable.submittedBy, userId),
      );
    result.spots = spots;
  }

  if (!parsed.type || parsed.type === "post") {
    const posts = await db
      .select({
        id: postsTable.id,
        title: postsTable.title,
        description: postsTable.content,
        status: postsTable.status,
        post_type: postsTable.postType,
        created_at: postsTable.createdAt,
      })
      .from(postsTable)
      .where(
        parsed.status
          ? and(
              eq(postsTable.submittedBy, userId),
              eq(postsTable.status, parsed.status),
            )
          : eq(postsTable.submittedBy, userId),
      );

    const postIds = posts.map((post) => post.id);
    let postCoverImageMap = new Map<number, string>();

    if (postIds.length > 0) {
      const mediaRows = await db
        .select({
          post_id: mediaTable.postId,
          url: mediaTable.url,
        })
        .from(mediaTable)
        .where(inArray(mediaTable.postId, postIds))
        .orderBy(mediaTable.postId, mediaTable.displayOrder);

      postCoverImageMap = mediaRows.reduce((map, media) => {
        if (!map.has(media.post_id)) {
          map.set(media.post_id, media.url);
        }
        return map;
      }, new Map<number, string>());
    }

    result.posts = posts.map((post) => ({
      ...post,
      cover_image: postCoverImageMap.get(post.id) ?? null,
    }));
  }

  if (!parsed.type || parsed.type === "comment") {
    const comments = await db
      .select({
        id: commentsTable.id,
        content: commentsTable.content,
        status: commentsTable.status,
        post: {
          id: postsTable.id,
          title: postsTable.title,
        },
        created_at: commentsTable.createdAt,
      })
      .from(commentsTable)
      .innerJoin(postsTable, eq(commentsTable.postId, postsTable.id))
      .where(
        parsed.status
          ? and(
              eq(commentsTable.userId, userId),
              eq(commentsTable.status, parsed.status),
            )
          : eq(commentsTable.userId, userId),
      );
    result.comments = comments;
  }

  return result;
}
