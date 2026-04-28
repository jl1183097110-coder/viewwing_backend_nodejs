import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { AppError, isAppError } from "../utils/error.js";
import { sendErrorResponse } from "../utils/response.js";
import { logger } from "./logger.js";

function zodDetails(error: ZodError) {
  return error.issues.map((i) => ({
    path: i.path.join("."),
    message: i.message,
    code: i.code,
  }));
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const requestLogger = (req as { log?: typeof logger }).log ?? logger;

  if (
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    (err as { type?: string }).type === "entity.too.large"
  ) {
    requestLogger.warn({ err }, "payload too large");
    return sendErrorResponse(
      res,
      "FILE_TOO_LARGE",
      413,
      "Request payload too large",
    );
  }

  if (isAppError(err)) {
    const payload = { err, code: err.code, status: err.status };
    if (err.status >= 500) {
      requestLogger.error(payload, "app error");
    } else {
      requestLogger.warn(payload, "app error");
    }
    return sendErrorResponse(
      res,
      err.code,
      err.status,
      err.message,
      err.details,
    );
  }

  if (err instanceof ZodError) {
    requestLogger.warn({ err }, "validation error");
    return sendErrorResponse(
      res,
      "VALIDATION_ERROR",
      400,
      "Validation error",
      zodDetails(err),
    );
  }

  requestLogger.error({ err }, "unhandled error");
  return sendErrorResponse(res, "INTERNAL_ERROR", 500, "Internal server error");
};

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  return next(
    new AppError(
      404,
      "NOT_FOUND",
      `Resource not found: ${req.method} ${req.originalUrl}`,
    ),
  );
};
