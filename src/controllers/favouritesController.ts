import { type RequestHandler } from "express";
import { sendSuccessResponse } from "../utils/response.js";
import { getUserId } from "../middlewares/authorization.js";
import {
  getFavouritesQuerySchema,
  favouriteBodySchema,
  checkFavouriteSchema,
} from "../utils/apiSchemas.js";
import {
  getFavouritesService,
  addFavouriteService,
  removeFavouriteService,
  checkIsFavouritedService,
} from "../services/favouritesService.js";

export const getFavourites: RequestHandler = async (_req, res) => {
  const userId = getUserId(res);
  const { type } = getFavouritesQuerySchema.parse(_req.query);
  const result = await getFavouritesService(userId, type);
  return sendSuccessResponse(res, 200, result, "Favourites retrieved successfully");
};

export const addFavourite: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  const { type, id } = favouriteBodySchema.parse(req.body);
  const result = await addFavouriteService(userId, { type, id });
  return sendSuccessResponse(res, 201, result, "Favourite added successfully");
};

export const removeFavourite: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  const { type, id } = favouriteBodySchema.parse(req.body);
  await removeFavouriteService(userId, { type, id });
  return sendSuccessResponse(res, 200, null, "Favourite removed successfully");
};

export const checkFavourite: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  const { type, id } = checkFavouriteSchema.parse(req.query);
  const result = await checkIsFavouritedService(userId, { type, id });
  return sendSuccessResponse(res, 200, result, "Favourite check completed");
};
