import { getPostsSchema, getPostByIdSchema, createPostSchema, updatePostSchema, deletePostSchema } from "../utils/apiSchemas.js";
import type { RequestHandler } from "express";
import { sendSuccessResponse } from "../utils/response.js";
import { getUserId, getUserRole } from "../middlewares/authorization.js";
import {
  getPostsService,
  getPostsByIdService,
  createPostService,
  updatePostService,
  deletePostService
} from "../services/postService.js";

export const getPosts: RequestHandler = async (req, res) => {
  const parsed = getPostsSchema.parse(req.query);
  const result = await getPostsService(parsed);
  return sendSuccessResponse(res, 200, result, "Posts list retrieved successfully");
};

export const getPostsById: RequestHandler = async (req, res) => {
  const parsed = getPostByIdSchema.parse(req.params);
  const result = await getPostsByIdService(parsed.post_id);
  return sendSuccessResponse(res, 200, result, "Post retrieved successfully");
}

export const createPost: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  const parsed = createPostSchema.parse(req.body);
  const result = await createPostService(userId, parsed);
  return sendSuccessResponse(res, 201, result, "Post created successfully");
};

export const updatePost: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  const userRole = getUserRole(res);
  const body = updatePostSchema.parse(req.body);
  const params = getPostByIdSchema.parse(req.params);
  const result = await updatePostService(userId, userRole, body, params.post_id);
  return sendSuccessResponse(res, 200, result, "Post updated successfully");
}

export const deletePost: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  const userRole = getUserRole(res);
  const params = deletePostSchema.parse(req.params);
  const result = await deletePostService(userId, userRole, params.post_id);
  return sendSuccessResponse(res, 200, result, "post deleted successfully")
}
