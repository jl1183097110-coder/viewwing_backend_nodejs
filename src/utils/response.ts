import type { Response } from "express";
import type { ErrorStatus } from "./error.js";

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  message: string;
};

export type ApiErrorResponse<T> = {
  success: false;
  error: {
    code: ErrorStatus;
    status: number;
    message: string;
    details?: T;
  };
};

export function sendSuccessResponse<T>(
  res: Response,
  status: number,
  data: T,
  message: string = "Success",
) {
  const payload: ApiSuccessResponse<T> = {
    success: true,
    data,
    message,
  };
  return res.status(status).json(payload);
}

export function sendErrorResponse<T>(
  res: Response,
  code: ErrorStatus,
  status: number,
  message: string,
  details?: T,
) {
  const payload: ApiErrorResponse<T> = {
    success: false,
    error: {
      code,
      status,
      message,
      details,
    },
  };
  return res.status(status).json(payload);
}
