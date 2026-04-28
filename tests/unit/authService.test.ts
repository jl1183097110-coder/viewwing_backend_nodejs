import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../src/utils/error.js";
import { mockDb } from "../helpers/dbMock.js";

vi.mock("../../src/drizzle.js", () => ({
  db: mockDb.mock,
  pool: {},
}));

vi.mock("../../src/middlewares/logger.js", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

import { registerService } from "../../src/services/authService.js";

async function captureError<T>(promise: Promise<T>): Promise<unknown> {
  try {
    await promise;
    throw new Error("Expected promise to reject, but it resolved");
  } catch (error) {
    return error;
  }
}

describe("authService", () => {
  beforeEach(() => {
    mockDb.reset();
    process.env.JWT_SECRET = "test-secret";
  });

  describe("registerService", () => {
    it("should return 409 when username already exists", async () => {
      mockDb.setResult([{ id: 1 }]);

      const error = await captureError(
        registerService({
          name: "taken-name",
          email: "new@example.com",
          password: "password123",
        }),
      );

      expect(error).toBeInstanceOf(AppError);
      expect(error).toMatchObject({
        status: 409,
        code: "ALREADY_EXISTS",
        message: "Username already exists",
      });
    });

    it("should map database unique violations to 409 on concurrent email conflicts", async () => {
      mockDb.setResult([]);
      mockDb.setResult([]);
      mockDb.setThrow({
        code: "23505",
        constraint: "users_email_unique",
      } as Error);

      const error = await captureError(
        registerService({
          name: "fresh-name",
          email: "fresh@example.com",
          password: "password123",
        }),
      );

      expect(error).toBeInstanceOf(AppError);
      expect(error).toMatchObject({
        status: 409,
        code: "ALREADY_EXISTS",
        message: "Email already exists",
      });
    });
  });
});
