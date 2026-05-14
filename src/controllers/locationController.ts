import type { RequestHandler } from "express";
import { getUserId, getUserRole } from "../middlewares/authorization.js";
import {
  createLocationService,
  deleteLocationService,
  getLocationDetailService,
  getLocationPostsService,
  getLocationService,
  getLocationSpotsService,
  getNearLocationService,
  searchLocationService,
  updateLocationService,
} from "../services/locationService.js";
import {
  createLocationSchema,
  deleteLocationSchema,
  getLocationDetailSchema,
  getLocationPostsParamsSchema,
  getLocationPostsQuerySchema,
  getLocationSchema,
  getLocationSpotsSchema,
  getNearLocationSchema,
  searchLocationSchema,
  updateLocationSchema,
} from "../utils/apiSchemas.js";
import { sendSuccessResponse } from "../utils/response.js";

export const getLocations: RequestHandler = async (req, res) => {
  const params = getLocationSchema.parse(req.query);
  const result = await getLocationService(params);
  sendSuccessResponse(res, 200, result, "get all locations successfully");
};

export const searchLocations: RequestHandler = async (req, res) => {
  const params = searchLocationSchema.parse(req.query);
  const result = await searchLocationService(params);
  sendSuccessResponse(res, 200, result, "search locations successfully");
};

export const getNearLocations: RequestHandler = async (req, res) => {
  const params = getNearLocationSchema.parse(req.query);
  const result = await getNearLocationService(params);
  sendSuccessResponse(res, 200, result, "get near locations successfully");
};

export const getLocationDetail: RequestHandler = async (req, res) => {
  const params = getLocationDetailSchema.parse(req.params);
  const result = await getLocationDetailService(params.id);
  sendSuccessResponse(res, 200, result, "get location detail successfully");
};

export const getLocationSpots: RequestHandler = async (req, res) => {
  const params = getLocationSpotsSchema.parse(req.params);
  const result = await getLocationSpotsService(params.id);
  sendSuccessResponse(res, 200, result, "get location spots successfully");
};

export const createLocation: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  const body = createLocationSchema.parse(req.body);
  const result = await createLocationService(userId, body);
  sendSuccessResponse(res, 200, result, "create location successfully");
};

export const updateLocation: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  const userRole = getUserRole(res);
  const params = getLocationDetailSchema.parse(req.params);
  const body = updateLocationSchema.parse(req.body);
  const result = await updateLocationService(userId, userRole, params.id, body);
  sendSuccessResponse(res, 200, result, "update location successfully");
};

export const deleteLocation: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  const userRole = getUserRole(res);
  const params = deleteLocationSchema.parse(req.params);
  const result = await deleteLocationService(userId, userRole, params.id);
  sendSuccessResponse(res, 200, result, "delete location successfully");
};

export const getLocationPosts: RequestHandler = async (req, res) => {
  const params = getLocationPostsParamsSchema.parse(req.params);
  const query = getLocationPostsQuerySchema.parse(req.query);
  const result = await getLocationPostsService(params.id, query);
  sendSuccessResponse(res, 200, result, "get location posts successfully");
};
