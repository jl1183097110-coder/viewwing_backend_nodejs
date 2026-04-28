import type { RequestHandler } from "express";

import { sendSuccessResponse } from "../utils/response.js";
import { getUserId } from "../middlewares/authorization.js";

import { getUserProfileService, loginService, registerService, updateUserProfileService } from "../services/authService.js";

import { loginSchema, registerSchema, updateProfileSchema } from "../utils/zodschemas.js";

export const login: RequestHandler = async (req, res) => {
  const parsed = loginSchema.parse(req.body);
  const result = await loginService(parsed);
  return sendSuccessResponse(res, 200, result, "Login successful");
};

export const logout: RequestHandler = async (_req, res) => {
  
  return sendSuccessResponse(res, 200, {}, "Logout successful");
};

export const register: RequestHandler = async (req, res) => {
  const parsed = registerSchema.parse(req.body);
  const result = await registerService(parsed);
  return sendSuccessResponse(res, 201, result, "Registration successful");
};

export const profile: RequestHandler = async (_req, res) => {
 
  const userId = getUserId(res);
  const result = await getUserProfileService(userId);
  return sendSuccessResponse(res, 200, result, "Profile information");
};

export const updateProfile: RequestHandler = async (req, res) => {
  const parsed = updateProfileSchema.parse(req.body);
  const userId = getUserId(res);
  const result = await updateUserProfileService(userId, parsed);
  return sendSuccessResponse(res, 200, result, "Profile updated");
};

