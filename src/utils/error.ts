export type ErrorStatus = 
  | "AUTH_REQUIRED"
  | "INVALID_TOKEN"
  | "INVALID_CREDENTIALS"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "ALREADY_EXISTS"
  | "VALIDATION_ERROR"
  | "FILE_TOO_LARGE"
  | "INVALID_FILE_TYPE"
  | "PENDING_APPROVAL"
  | "ALREADY_SUBMITTED"
  | "INTERNAL_ERROR"
  | "DATABASE_ERROR";

export class AppError extends Error {
    constructor(
        public status: number,
        public code: ErrorStatus,
        public message: string,
        public details?: unknown,
    ) {
        super(message);
        this.code = code;
        this.status = status;
        this.details = details;
    }
}

export function isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
}
