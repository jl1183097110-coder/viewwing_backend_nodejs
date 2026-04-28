import type { RequestHandler } from "express";
import { AppError } from "../utils/error.js";
import jwt from "jsonwebtoken";
import { Response } from "express";


export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError(500, "INTERNAL_ERROR", "JWT secret not configured");
  }
  return secret;
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new AppError(401, "AUTH_REQUIRED", "Auth required");
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new AppError(401, "INVALID_TOKEN", "Invalid authorization header");
  }
  
  try {
    const payload = jwt.verify(token, getJwtSecret());
    const userId = Number((payload as { id?: number }).id);
    const userRole = (payload as { role?: string }).role;
    if (!userId || Number.isNaN(userId)) {
      throw new AppError(401, "INVALID_TOKEN", "Invalid token");
    }
    res.locals.userId = userId;
    res.locals.userRole = userRole;
  } catch (error) {
    throw new AppError(401, "INVALID_TOKEN", "Invalid token");
  }

  return next();
};

export const requireAdmin: RequestHandler = (_req, res, next) => {
  const userRole = res.locals.userRole;
  if (!userRole || typeof userRole !== "string") {
    throw new AppError(401, "AUTH_REQUIRED", "Auth required");
  }

  if (userRole !== "admin") {
    throw new AppError(403, "FORBIDDEN", "Admin permission required");
  }

  return next();
};

export const getUserId = (res: Response) => {
  const userId = Number(res.locals.userId);
  if (!userId || Number.isNaN(userId)) {
    throw new AppError(401, "AUTH_REQUIRED", "Auth required");
  }
  return userId;
};

export const getUserRole = (res: Response) => {
  const userRole = res.locals.userRole;
  if (!userRole || typeof userRole !== "string") {
    throw new AppError(401, "AUTH_REQUIRED", "Auth required");
  }
  return userRole;
};