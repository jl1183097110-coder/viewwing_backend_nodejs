import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppError } from "../../src/utils/error.js";
import { mockDb } from "../helpers/dbMock.js";

vi.mock("../../src/drizzle.js", () => ({
  db: mockDb.mock,
  pool: {},
}));

import {
  createSpotService,
  updateSpotService,
  deleteSpotService,
} from "../../src/services/spotService.js";

async function captureError<T>(promise: Promise<T>): Promise<any> {
  try {
    await promise;
    throw new Error("Expected promise to reject, but it resolved");
  } catch (err) {
    return err;
  }
}

describe("spotService", () => {
  beforeEach(() => {
    mockDb.reset();
  });

  describe("createSpotService", () => {
    it("should throw 404 NOT_FOUND when location_id does not exist", async () => {
      mockDb.setResult([]); // location lookup returns empty

      const err = await captureError(
        createSpotService(1, "Test Spot", 999, "Description", undefined, {
          lat: 10,
          lng: 20,
        }),
      );

      expect(err).toBeInstanceOf(AppError);
      expect(err).toMatchObject({
        status: 404,
        code: "NOT_FOUND",
        message: "Location not found",
      });
      expect(mockDb.mock.insert).not.toHaveBeenCalled();
    });

    it("should create spot when location exists", async () => {
      // 1st query: location lookup
      mockDb.setResult([{ id: 100 }]);
      // 2nd query: insert returning
      mockDb.setResult([{ id: 11, status: "approved", message: "posted" }]);

      const result = await createSpotService(
        1,
        "Test Spot",
        100,
        "Description",
        undefined,
        { lat: 10, lng: 20 },
      );

      expect(result).toEqual({ id: 11, status: "approved", message: "posted" });
      expect(mockDb.mock.insert).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateSpotService", () => {
    it("should throw 403 FORBIDDEN when user is not author and not admin", async () => {
      // 1st query: location existence check
      mockDb.setResult([{ id: 100 }]);
      // 2nd query: spot lookup (owned by different user)
      mockDb.setResult([{ id: 1, submittedBy: 999 }]);

      const err = await captureError(
        updateSpotService(
          1,
          1,
          "user",
          "Updated Spot",
          100,
          "Updated description",
          undefined,
          { lat: 10, lng: 20 },
        ),
      );

      expect(err).toBeInstanceOf(AppError);
      expect(err).toMatchObject({ status: 403, code: "FORBIDDEN" });
      expect(mockDb.mock.update).not.toHaveBeenCalled();
    });

    it("should allow admin to update another user's spot", async () => {
      // 1st query: location existence check
      mockDb.setResult([{ id: 100 }]);
      // 2nd query: spot lookup (owned by different user)
      mockDb.setResult([{ id: 1, submittedBy: 999 }]);
      // 3rd query: update returning
      mockDb.setResult([{ id: 1, status: "approved", message: "posted" }]);

      const result = await updateSpotService(
        1,
        1,
        "admin",
        "Updated Spot",
        100,
        "Updated description",
        undefined,
        { lat: 10, lng: 20 },
      );

      expect(result).toEqual({ id: 1, status: "approved", message: "posted" });
      expect(mockDb.mock.update).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteSpotService", () => {
    it("should throw 403 FORBIDDEN when user is not author and not admin", async () => {
      mockDb.setResult([{ id: 1, submittedBy: 999 }]); // spot owned by different user

      const err = await captureError(deleteSpotService(1, 1, "user"));

      expect(err).toBeInstanceOf(AppError);
      expect(err).toMatchObject({ status: 403, code: "FORBIDDEN" });
      expect(mockDb.mock.delete).not.toHaveBeenCalled();
    });

    it("should allow author to delete and return deleted_id", async () => {
      // 1st query: spot existence check (owned by user 1)
      mockDb.setResult([{ id: 1, submittedBy: 1 }]);
      // 2nd query: delete returning
      mockDb.setResult([
        { deleted_id: 1, message: "Spot deleted successfully" },
      ]);

      const result = await deleteSpotService(1, 1, "user");

      expect(result).toEqual({
        deleted_id: 1,
        message: "Spot deleted successfully",
      });
    });
  });
});
