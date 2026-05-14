import { sendSuccessResponse } from "../utils/response.js";
import { getMySubmissionsSchema } from "../utils/apiSchemas.js";
import { getMySubmissionsService } from "../services/profileService.js";
import { AppError } from "../utils/error.js";
import { RequestHandler } from "express";
import { getUserId } from "../middlewares/authorization.js";

export const getMySubmissions: RequestHandler = async (req, res) => {
  const userId = getUserId(res);
  if (!userId) {
    throw new AppError(401, "AUTH_REQUIRED", "Unauthorized");
  }

  const parsed = getMySubmissionsSchema.parse(req.query);
  const result = await getMySubmissionsService(userId, parsed);

  return sendSuccessResponse(
    res,
    200,
    result,
    "My submissions retrieved successfully",
  );
};
