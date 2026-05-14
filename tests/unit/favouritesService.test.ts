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
    // --- Success cases for each type ---

    it("should add a spot favourite successfully", async () => {
      // 1. Entity lookup: spot exists
      mockDb.setResult([{ id: 10 }]);
      // 2. Duplicate check: no existing favourite
      mockDb.setResult([]);
      // 3. Insert: returns new favourite
      mockDb.setResult([{ id: 1, created_at: new Date("2024-01-01") }]);

      const result = await addFavouriteService(1, { type: "spot", id: 10 });

      expect(result).toEqual({
        id: 1,
        type: "spot",
        target_id: 10,
        created_at: new Date("2024-01-01"),
      });
    });

    it("should add a post favourite successfully", async () => {
      // 1. Entity lookup: post exists
      mockDb.setResult([{ id: 20 }]);
      // 2. Duplicate check: no existing favourite
      mockDb.setResult([]);
      // 3. Insert: returns new favourite
      mockDb.setResult([{ id: 2, created_at: new Date("2024-02-01") }]);

      const result = await addFavouriteService(1, { type: "post", id: 20 });

      expect(result).toEqual({
        id: 2,
        type: "post",
        target_id: 20,
        created_at: new Date("2024-02-01"),
      });
    });

    it("should add a location favourite successfully", async () => {
      // 1. Entity lookup: location exists
      mockDb.setResult([{ id: 30 }]);
      // 2. Duplicate check: no existing favourite
      mockDb.setResult([]);
      // 3. Insert: returns new favourite
      mockDb.setResult([{ id: 3, created_at: new Date("2024-03-01") }]);

      const result = await addFavouriteService(1, { type: "location", id: 30 });

      expect(result).toEqual({
        id: 3,
        type: "location",
        target_id: 30,
        created_at: new Date("2024-03-01"),
      });
    });

    // --- 404: Target entity does not exist ---

    it("should return 404 when the target entity does not exist", async () => {
      // 1. Entity lookup: returns empty (entity not found)
      mockDb.setResult([]);

      const error = await captureError(
        addFavouriteService(1, { type: "spot", id: 999 }),
      );

      expect(error).toBeInstanceOf(AppError);
      expect(error).toMatchObject({
        status: 404,
        code: "NOT_FOUND",
        message: "Spot not found",
      });
    });

    // --- 409: Pre-check duplicate detection ---

    it("should return 409 when favourite already exists from pre-check", async () => {
      // 1. Entity lookup: entity exists
      mockDb.setResult([{ id: 10 }]);
      // 2. Duplicate check: existing favourite found
      mockDb.setResult([{ id: 5 }]);

      const error = await captureError(
        addFavouriteService(1, { type: "spot", id: 10 }),
      );

      expect(error).toBeInstanceOf(AppError);
      expect(error).toMatchObject({
        status: 409,
        code: "ALREADY_EXISTS",
        message: "Favourite already exists",
      });
    });

    // --- 409: Concurrent unique index violation ---

    it("should map unique index violations to 409 on concurrent duplicate inserts", async () => {
      // 1. Entity lookup: entity exists
      mockDb.setResult([{ id: 10 }]);
      // 2. Duplicate check: no existing favourite (race condition)
      mockDb.setResult([]);
      // 3. Insert: throws unique constraint violation
      mockDb.setThrow({
        code: "23505",
        constraint: "favorites_user_spot_unique_idx",
      } as unknown as Error);

      const error = await captureError(
        addFavouriteService(1, { type: "spot", id: 10 }),
      );

      expect(error).toBeInstanceOf(AppError);
      expect(error).toMatchObject({
        status: 409,
        code: "ALREADY_EXISTS",
        message: "Favourite already exists",
      });
    });
  });
});
