import type { RequestHandler } from "express";
import { getUserId, getUserRole } from "../middlewares/authorization.js";
import {
  createCommentService,
  deleteCommentService,
  editCommentService,
  getPostCommentsService,
} from "../services/commentService.js";
import {
  createCommentSchema,
  deleteCommentSchema,
  editCommentSchema,
  getPostCommentsParamsSchema,
  getPostCommentsQuerySchema,
} from "../utils/apiSchemas.js";
import { AppError } from "../utils/error.js";
import { sendSuccessResponse } from "../utils/response.js";

export const createComment: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  if (!userId) {
    throw new AppError(401, "AUTH_REQUIRED", "User not authenticated");
  }
  const parsed = createCommentSchema.parse(req.body);
  const result = await createCommentService(userId, parsed);
  return sendSuccessResponse(res, 201, result, "Comment created successfully");
};

export const getPostComments: RequestHandler = async (req, res) => {
  const params = getPostCommentsParamsSchema.parse(req.params);
  const query = getPostCommentsQuerySchema.parse(req.query);
  const result = await getPostCommentsService(params.post_id, query);
  return sendSuccessResponse(
    res,
    200,
    result,
    "Post comments retrieved successfully",
  );
};

export const editComment: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  if (!userId) {
    throw new AppError(401, "AUTH_REQUIRED", "User not authenticated");
  }
  const userRole = getUserRole(res);
  const parsed = editCommentSchema.parse(req.body);
  const commentId = deleteCommentSchema.parse(req.params);
  const result = await editCommentService(
    userId,
    userRole,
    commentId.comment_id,
    parsed,
  );
  return sendSuccessResponse(res, 200, result, "Comment updated successfully");
};

export const deleteComment: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  if (!userId) {
    throw new AppError(401, "AUTH_REQUIRED", "User not authenticated");
  }
  const userRole = getUserRole(res);
  const parsed = deleteCommentSchema.parse(req.params);
  await deleteCommentService(userId, userRole, parsed.comment_id);
  return sendSuccessResponse(res, 200, null, "Comment deleted successfully");
};
