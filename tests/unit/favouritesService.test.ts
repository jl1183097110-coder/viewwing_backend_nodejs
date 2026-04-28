import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../src/utils/error.js";
import { mockDb } from "../helpers/dbMock.js";

vi.mock("../../src/drizzle.js", () => ({
  db: mockDb.mock,
  pool: {},
}));

import { addFavouriteService } from "../../src/services/favouritesService.js";

async function captureError<T>(promise: Promise<T>): Promise<unknown> {
  try {
    await promise;
    throw new Error("Expected promise to reject, but it resolved");
  } catch (error) {
    return error;
  }
}

describe("favouritesService", () => {
  beforeEach(() => {
    mockDb.reset();
  });

  describe("addFavouriteService", () => {
    it("should return 409 when favourite already exists from pre-check", async () => {
      mockDb.setResult([{ id: 10 }]);
      mockDb.setResult([{ id: 1 }]);

      const error = await captureError(addFavouriteService(1, 10));

      expect(error).toBeInstanceOf(AppError);
      expect(error).toMatchObject({
        status: 409,
        code: "ALREADY_EXISTS",
        message: "Favourite already exists",
      });
    });

    it("should map unique index violations to 409 on concurrent duplicate inserts", async () => {
      mockDb.setResult([{ id: 10 }]);
      mockDb.setResult([]);
      mockDb.setThrow({
        code: "23505",
        constraint: "favorites_user_spot_unique_idx",
      } as Error);

      const error = await captureError(addFavouriteService(1, 10));

      expect(error).toBeInstanceOf(AppError);
      expect(error).toMatchObject({
        status: 409,
        code: "ALREADY_EXISTS",
        message: "Favourite already exists",
      });
    });
  });
});
