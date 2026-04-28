import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { commentsTable, postsTable, usersTable } from "../db/schema.js";
import { db } from "../drizzle.js";
import { logger } from "../middlewares/logger.js";
import { AppError } from "../utils/error.js";
import {
  createCommentSchema,
  editCommentSchema,
  getPostCommentsQuerySchema,
} from "../utils/zodschemas.js";

export async function createCommentService(
  userId: number,
  commentData: z.infer<typeof createCommentSchema>,
) {
  const post = await db
    .select({ id: postsTable.id })
    .from(postsTable)
    .where(eq(postsTable.id, commentData.post_id))
    .limit(1);

  if (!post[0]) {
    logger.warn(
      { action: "comment.create", userId, postId: commentData.post_id },
      "create comment failed: post not found",
    );
    throw new AppError(404, "NOT_FOUND", "Post not found");
  }

  const result = await db
    .insert(commentsTable)
    .values({
      postId: commentData.post_id,
      content: commentData.content,
      userId,
    })
    .returning({
      id: commentsTable.id,
      status: commentsTable.status,
    });

  if (!result[0]) {
    logger.error(
      { action: "comment.create", userId, postId: commentData.post_id },
      "create comment failed: insert returned empty",
    );
    throw new AppError(500, "DATABASE_ERROR", "Failed to create comment");
  }

  logger.info(
    {
      action: "comment.create",
      userId,
      commentId: result[0].id,
      postId: commentData.post_id,
    },
    "create comment success",
  );
  return result[0];
}

export async function getPostCommentsService(
  postId: number,
  params: z.infer<typeof getPostCommentsQuerySchema>,
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;

  const post = await db
    .select({ id: postsTable.id })
    .from(postsTable)
    .where(eq(postsTable.id, postId))
    .limit(1);

  if (!post[0]) {
    logger.warn({ action: "comment.listByPost", postId }, "post not found");
    throw new AppError(404, "NOT_FOUND", "Post not found");
  }

  const rows = await db
    .select({
      id: commentsTable.id,
      content: commentsTable.content,
      created_at: commentsTable.createdAt,
      user_id: usersTable.id,
      username: usersTable.name,
      avatar_url: usersTable.avatar_url,
    })
    .from(commentsTable)
    .innerJoin(usersTable, eq(commentsTable.userId, usersTable.id))
    .where(
      and(eq(commentsTable.postId, postId), eq(commentsTable.status, "approved")),
    )
    .orderBy(desc(commentsTable.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const countRows = await db
    .select({ total: sql<number>`count(*)` })
    .from(commentsTable)
    .where(
      and(eq(commentsTable.postId, postId), eq(commentsTable.status, "approved")),
    );

  const total = Number(countRows[0]?.total ?? 0);

  return {
    data: rows.map((row) => ({
      id: row.id,
      content: row.content,
      user: {
        id: row.user_id,
        username: row.username,
        avatar_url: row.avatar_url,
      },
      created_at: row.created_at,
    })),
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export const editCommentService = async (
  userId: number,
  userRole: string,
  commentId: number,
  commentData: z.infer<typeof editCommentSchema>,
) => {
  const commentInfo = await db
    .select({ userId: commentsTable.userId, commentId: commentsTable.id })
    .from(commentsTable)
    .where(eq(commentsTable.id, commentId))
    .limit(1);

  if (!commentInfo[0] || !commentInfo[0].commentId) {
    logger.warn(
      { action: "comment.edit", userId, commentId },
      "edit comment failed: comment not found",
    );
    throw new AppError(404, "NOT_FOUND", "Comment not found");
  }

  if (commentInfo[0].userId !== userId && userRole !== "admin") {
    logger.warn(
      {
        action: "comment.edit",
        userId,
        commentId,
        ownerId: commentInfo[0].userId,
        userRole,
      },
      "edit comment forbidden",
    );
    throw new AppError(
      403,
      "FORBIDDEN",
      "You are not authorized to edit this comment",
    );
  }

  const result = await db
    .update(commentsTable)
    .set({
      content: commentData.content,
      updatedAt: new Date(),
    })
    .where(eq(commentsTable.id, commentInfo[0].commentId))
    .returning({
      id: commentsTable.id,
      status: commentsTable.status,
    });

  if (!result[0]) {
    logger.error(
      { action: "comment.edit", userId, commentId },
      "edit comment failed: update returned empty",
    );
    throw new AppError(500, "DATABASE_ERROR", "Failed to update comment");
  }

  logger.info(
    { action: "comment.edit", userId, commentId },
    "edit comment success",
  );
  return result[0];
};

export async function deleteCommentService(
  userId: number,
  userRole: string,
  commentId: number,
) {
  const commentInfo = await db
    .select({ userId: commentsTable.userId, commentId: commentsTable.id })
    .from(commentsTable)
    .where(eq(commentsTable.id, commentId))
    .limit(1);

  if (!commentInfo[0] || !commentInfo[0].commentId) {
    logger.warn(
      { action: "comment.delete", userId, commentId },
      "delete comment failed: comment not found",
    );
    throw new AppError(404, "NOT_FOUND", "Comment not found");
  }

  if (commentInfo[0].userId !== userId && userRole !== "admin") {
    logger.warn(
      {
        action: "comment.delete",
        userId,
        commentId,
        ownerId: commentInfo[0].userId,
        userRole,
      },
      "delete comment forbidden",
    );
    throw new AppError(
      403,
      "FORBIDDEN",
      "You are not authorized to delete this comment",
    );
  }

  try {
    await db.delete(commentsTable).where(eq(commentsTable.id, commentId));
  } catch (error) {
    logger.error(
      { action: "comment.delete", userId, commentId, err: error },
      "delete comment failed",
    );
    throw new AppError(500, "DATABASE_ERROR", "Failed to delete comment");
  }

  logger.info(
    { action: "comment.delete", userId, commentId },
    "delete comment success",
  );
  return { message: "Comment deleted successfully" };
}
