import type { RequestHandler } from "express";
import { sendSuccessResponse } from "../utils/response.js";
import { getUserId, getUserRole } from "../middlewares/authorization.js";

import {
  getPresignSchema,
  addMediaToPostSchema,
  addMediaToPostParamsSchema,
  deleteMediaSchema,
  spotMediaParamsSchema,
  locationMediaParamsSchema,
  deleteSpotMediaSchema,
  deleteLocationMediaSchema,
} from "../utils/apiSchemas.js";
import {
  getPresignService,
  addMediaToOwnerService,
  deleteMediaFromOwnerService,
} from "../services/mediaService.js";



export const getPresign: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  const parsed = getPresignSchema.parse(req.body);
  const result = await getPresignService(userId, parsed);
  return sendSuccessResponse(res, 200, result, "Presign created successfully");
};

export const addMediaToPost: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  const userRole = getUserRole(res);
  const params = addMediaToPostParamsSchema.parse(req.params);
  const body = addMediaToPostSchema.parse(req.body);
  const result = await addMediaToOwnerService(
    userId,
    userRole,
    { type: "post", id: params.post_id },
    body,
  );
  return sendSuccessResponse(res, 200, result, "added successfully");
}

export const deleteMedia: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  const userRole = getUserRole(res);
  const parsed = deleteMediaSchema.parse(req.params);
  const result = await deleteMediaFromOwnerService(
    userId,
    userRole,
    { type: "post", id: parsed.post_id },
    parsed.media_id,
  );
  return sendSuccessResponse(res, 200, result, "delete successfully");
}

export const addMediaToSpot: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  const userRole = getUserRole(res);
  const params = spotMediaParamsSchema.parse(req.params);
  const body = addMediaToPostSchema.parse(req.body);
  const result = await addMediaToOwnerService(userId, userRole, { type: "spot", id: params.spot_id }, body);
  return sendSuccessResponse(res, 200, result, "added successfully");
}

export const deleteMediaFromSpot: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  const userRole = getUserRole(res);
  const params = deleteSpotMediaSchema.parse(req.params);
  const result = await deleteMediaFromOwnerService(userId, userRole, { type: "spot", id: params.spot_id }, params.media_id);
  return sendSuccessResponse(res, 200, result, "delete successfully");
}

export const addMediaToLocation: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  const userRole = getUserRole(res);
  const params = locationMediaParamsSchema.parse(req.params);
  const body = addMediaToPostSchema.parse(req.body);
  const result = await addMediaToOwnerService(userId, userRole, { type: "location", id: params.location_id }, body);
  return sendSuccessResponse(res, 200, result, "added successfully");
}

export const deleteMediaFromLocation: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  const userRole = getUserRole(res);
  const params = deleteLocationMediaSchema.parse(req.params);
  const result = await deleteMediaFromOwnerService(userId, userRole, { type: "location", id: params.location_id }, params.media_id);
  return sendSuccessResponse(res, 200, result, "delete successfully");
}
