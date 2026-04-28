import type { RequestHandler } from "express";
import { getUserId, getUserRole } from "../middlewares/authorization.js";
import {
  createSpotService,
  deleteSpotService,
  getSpotService,
  updateSpotService,
} from "../services/spotService.js";
import {
  createSpotSchema,
  deleteSpotSchema,
  getSpotSchema,
  editSpotSchema,
} from "../utils/zodschemas.js";
import { AppError } from "../utils/error.js";
import { sendSuccessResponse } from "../utils/response.js";

export const createSpots: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  const { name, location_id, description, image_url, point } =
    createSpotSchema.parse(req.body);
  const result = await createSpotService(
    userId,
    name,
    location_id,
    description,
    image_url,
    point,
  );
  sendSuccessResponse(res, 201, result, "create spot successfully");
};

export const updateSpots: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  const userRole = getUserRole(res);
  const spotId = Number(req.params.id);

  if (!spotId || Number.isNaN(spotId)) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid spot ID");
  }

  const { name, location_id, description, image_url, point } =
    editSpotSchema.parse(req.body);
  const result = await updateSpotService(
    spotId,
    userId,
    userRole,
    name,
    location_id ?? undefined,
    description,
    image_url,
    point,
  );
  sendSuccessResponse(res, 200, result, "update spot successfully");
};

export const deleteSpot: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  const userRole = res.locals.userRole || "user";

  const { spot_id } = deleteSpotSchema.parse(req.params);
  if (!spot_id || Number.isNaN(spot_id)) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid spot ID");
  }

  const result = await deleteSpotService(userId, spot_id, userRole);
  sendSuccessResponse(res, 200, result, "delete spot successfully");
};

export const getSpot: RequestHandler = async (req, res) => {
  const { spot_id } = getSpotSchema.parse(req.params);
  if (!spot_id || Number.isNaN(spot_id)) {
    throw new AppError(400, "VALIDATION_ERROR", "No spot ID provided");
  }
  const result = await getSpotService(spot_id);
  sendSuccessResponse(res, 200, result, "get spot successfully");
};
