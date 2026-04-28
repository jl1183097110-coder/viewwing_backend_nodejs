import { sendSuccessResponse } from "../utils/response.js";
import { type RequestHandler } from "express";
import { addFavouriteService, removeFavouriteService, getFavouritesService } from "../services/favouritesService.js";
import { AppError } from "../utils/error.js";
import { getUserId } from "../middlewares/authorization.js";
import { addFavouriteSchema } from "../utils/zodschemas.js";


export const getFavourites: RequestHandler = async (_req, res) => {
  const userId = getUserId(res);
  if(!userId) {
    throw new AppError(401, "AUTH_REQUIRED", "Auth required");
  }
  const result = await getFavouritesService(userId);
  sendSuccessResponse(res, 200, result, 'Favourites retrieved successfully');
};

export const addFavourite: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  if(!userId) {
    throw new AppError(401, "AUTH_REQUIRED", "Auth required");
  }
  const spotId = addFavouriteSchema.parse(req.body).spot_id;
  const result = await addFavouriteService(userId, spotId);
  sendSuccessResponse(res, 201, result, 'Favourite added successfully');
};

export const removeFavourite: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  if(!userId) {
    throw new AppError(401, "AUTH_REQUIRED", "Auth required");
  }
  const spotId = addFavouriteSchema.parse(req.body).spot_id;
  await removeFavouriteService(userId, spotId);
  sendSuccessResponse(res, 200, null, 'Favourite removed successfully');
};

