import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppError } from "../../src/utils/error.js";
import { mockDb } from "../helpers/dbMock.js";

// Mock the db module before importing services
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

// Import after mocking
import {
  getPostsByIdService,
  createPostService,
  updatePostService,
  deletePostService,
} from "../../src/services/postService.js";

/**
 * Capture rejected promise error for multiple assertions without re-invoking the service.
 */
async function captureError<T>(promise: Promise<T>): Promise<any> {
  try {
    await promise;
    throw new Error("Expected promise to reject, but it resolved");
  } catch (err) {
    return err;
  }
}

describe("postService", () => {
  beforeEach(() => {
    mockDb.reset();
  });

  describe("getPostsByIdService", () => {
    it("should throw 404 NOT_FOUND when post not found", async () => {
      // Service makes two awaits: media lookup, then post lookup
      mockDb.setResult([]); // media rows (empty is fine)
      mockDb.setResult([]); // post rows (empty → triggers 404)

      const err = await captureError(getPostsByIdService(99999));
      expect(err).toBeInstanceOf(AppError);
      expect(err).toMatchObject({
        status: 404,
        code: "NOT_FOUND",
        message: "Post not found",
      });
    });
  });

  describe("createPostService", () => {
    it("should derive locationId from spot when location_id is not provided", async () => {
      // 1st query: fetch spot by spot_id
      mockDb.setResult([{ locationId: 100 }]);
      // 2nd query: insert post
      mockDb.setResult([{ id: 1, status: "approved" }]);

      const result = await createPostService(1, {
        title: "Test Post",
        content: "Test content",
        post_type: "article",
        spot_id: 10,
      });

      expect(result).toEqual({ id: 1, status: "approved" });
      expect(mockDb.mock.insert).toHaveBeenCalledTimes(1);
    });

    it("should throw 404 NOT_FOUND when spot_id does not exist", async () => {
      mockDb.setResult([]); // spot lookup returns empty

      const err = await captureError(
        createPostService(1, {
          title: "Test Post",
          content: "Test content",
          post_type: "article",
          spot_id: 999,
        }),
      );

      expect(err).toBeInstanceOf(AppError);
      expect(err).toMatchObject({
        status: 404,
        code: "NOT_FOUND",
        message: "Spot not found",
      });
      expect(mockDb.mock.insert).not.toHaveBeenCalled();
    });

    it("should throw 400 VALIDATION_ERROR when neither location_id nor spot_id is provided", async () => {
      // No DB call expected — service should fail fast before touching db
      const err = await captureError(
        createPostService(1, {
          title: "Test Post",
          content: "Test content",
          post_type: "article",
        }),
      );

      expect(err).toBeInstanceOf(AppError);
      expect(err).toMatchObject({
        status: 400,
        code: "VALIDATION_ERROR",
      });
      expect(mockDb.mock.select).not.toHaveBeenCalled();
      expect(mockDb.mock.insert).not.toHaveBeenCalled();
    });
  });

  describe("updatePostService", () => {
    it("should throw 403 FORBIDDEN when user is not author and not admin", async () => {
      // Author lookup returns a different user
      mockDb.setResult([{ submittedBy: 999 }]);

      const err = await captureError(
        updatePostService(
          1,
          "user",
          {
            title: "Updated Title",
            content: "Updated content",
            post_type: "article",
            location_id: 100,
            spot_id: 10,
          },
          1,
        ),
      );

      expect(err).toBeInstanceOf(AppError);
      expect(err).toMatchObject({ status: 403, code: "FORBIDDEN" });
      expect(mockDb.mock.update).not.toHaveBeenCalled();
    });

    it("should allow admin to update post even if not author", async () => {
      // 1st query: author lookup (different user)
      mockDb.setResult([{ submittedBy: 999 }]);
      // 2nd query: update returning
      mockDb.setResult([
        { id: 1, status: "approved", message: "Post updated successfully" },
      ]);

      const result = await updatePostService(
        1,
        "admin",
        {
          title: "Updated Title",
          content: "Updated content",
          post_type: "article",
          location_id: 100,
          spot_id: 10,
        },
        1,
      );

      expect(result).toEqual({
        id: 1,
        status: "approved",
        message: "Post updated successfully",
      });
    });
  });

  describe("deletePostService", () => {
    it("should throw 403 FORBIDDEN when user is not author and not admin", async () => {
      mockDb.setResult([{ submittedBy: 999 }]); // post owned by different user

      const err = await captureError(deletePostService(1, "user", 1));

      expect(err).toBeInstanceOf(AppError);
      expect(err).toMatchObject({ status: 403, code: "FORBIDDEN" });
      expect(mockDb.mock.delete).not.toHaveBeenCalled();
    });

    it("should delete post when user is author", async () => {
      // 1st query: author lookup (owned by user 1)
      mockDb.setResult([{ submittedBy: 1 }]);
      // 2nd query: delete execution
      mockDb.setResult([]);

      const result = await deletePostService(1, "user", 1);

      expect(result).toEqual({ message: "deleted successfully" });
      expect(mockDb.mock.delete).toHaveBeenCalledTimes(1);
    });
  });
});
