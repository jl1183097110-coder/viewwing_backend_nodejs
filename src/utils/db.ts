import type { DatabaseError } from "pg";

export const PG_UNIQUE_VIOLATION = "23505";

type PgErrorLike = Partial<DatabaseError> & {
  code?: string;
  constraint?: string;
  detail?: string;
};

export function isPgUniqueViolation(
  error: unknown,
  constraint?: string,
): error is PgErrorLike {
  if (!error || typeof error !== "object") {
    return false;
  }

  const pgError = error as PgErrorLike;
  if (pgError.code !== PG_UNIQUE_VIOLATION) {
    return false;
  }

  if (!constraint) {
    return true;
  }

  return pgError.constraint === constraint;
}
