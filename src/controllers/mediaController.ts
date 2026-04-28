import type { RequestHandler } from "express";
import { sendSuccessResponse } from "../utils/response.js";
import { getUserId, getUserRole } from "../middlewares/authorization.js";

import {
  getPresignSchema,
  addMediaToPostSchema,
  addMediaToPostParamsSchema,
  deleteMediaSchema,
} from "../utils/zodschemas.js";
import { getPresignService, addMediaToPostService, deleteMediaService } from "../services/mediaService.js";



export const getPresign: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  const parsed = getPresignSchema.parse(req.body);
  const result = await getPresignService(userId, parsed);
  return sendSuccessResponse(res, 200, result, "Presign created successfully");
};

export const addMediaToPost: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  const params = addMediaToPostParamsSchema.parse(req.params);
  const body = addMediaToPostSchema.parse(req.body);
  const userRole = getUserRole(res);
  const result = await addMediaToPostService(userId, userRole, params.post_id, body);
  return sendSuccessResponse(res, 200, result, "added successfully");
}

export const deleteMedia: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  const userRole = getUserRole(res);
  const parsed = deleteMediaSchema.parse(req.params);
  const result = await deleteMediaService(userId, userRole, parsed);
  return sendSuccessResponse(res, 200, result, "delete successfully");
}
