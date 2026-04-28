import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { setTestJwtSecret, signTestToken } from "../helpers/auth.js";

// Mock the index module to avoid DATABASE_URL error
vi.mock("../../src/drizzle.js", () => ({
  db: {},
  pool: {},
}));

// Mock the services
vi.mock("../../src/services/postService.js", () => ({
  getPostsByIdService: vi.fn(),
  createPostService: vi.fn(),
}));

vi.mock("../../src/middlewares/logger.js", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
  logMiddleWare: vi.fn((req, res, next) => next()),
}));

// Import after mocking
import {
  getPostsByIdService,
  createPostService,
} from "../../src/services/postService.js";

describe("app integration", () => {
  let app: any;

  beforeEach(() => {
    setTestJwtSecret();
    app = createApp();
    vi.clearAllMocks();
  });

  it("GET /api/health should return 200 with success response", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { ok: true },
      message: "OK",
    });
  });

  it("GET /api/posts/99999 should return 404 when service throws NOT_FOUND error", async () => {
    const { AppError } = await import("../../src/utils/error.js");
    vi.mocked(getPostsByIdService).mockRejectedValue(
      new AppError(404, "NOT_FOUND", "Post not found"),
    );

    const response = await request(app).get("/api/posts/99999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "NOT_FOUND",
        status: 404,
        message: "Post not found",
      },
    });
    expect(getPostsByIdService).toHaveBeenCalledTimes(1);
    expect(getPostsByIdService).toHaveBeenCalledWith(99999);
  });

  it("POST /api/posts should return 401 when no Authorization header", async () => {
    const response = await request(app).post("/api/posts").send({
      title: "Test Post",
      content: "Test content",
      post_type: "article",
      location_id: 100,
      spot_id: 10,
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "AUTH_REQUIRED",
        status: 401,
        message: "Auth required",
      },
    });
    expect(createPostService).not.toHaveBeenCalled();
  });

  it("POST /api/posts should return 401 INVALID_TOKEN when token is malformed", async () => {
    const response = await request(app)
      .post("/api/posts")
      .set("Authorization", "Bearer malformed-token")
      .send({
        title: "Test Post",
        content: "Test content",
        post_type: "article",
        location_id: 100,
        spot_id: 10,
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        status: 401,
        message: "Invalid token",
      },
    });
    expect(createPostService).not.toHaveBeenCalled();
  });

  it("POST /api/posts should return 400 when body missing title", async () => {
    const token = signTestToken(1, "user");

    const response = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        content: "Test content",
        post_type: "article",
        location_id: 100,
        spot_id: 10,
      });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        status: 400,
        message: "Validation error",
      },
    });
    expect(Array.isArray(response.body.error.details)).toBe(true);
    expect(
      response.body.error.details.some((detail: { path?: string }) => detail.path === "title"),
    ).toBe(true);
    expect(createPostService).not.toHaveBeenCalled();
  });

  it("POST /api/posts should return 201 with valid JWT and body", async () => {
    const token = signTestToken(1, "user");
    const payload = {
      title: "Test Post",
      content: "Test content",
      post_type: "article",
      location_id: 100,
      spot_id: 10,
    };

    vi.mocked(createPostService).mockResolvedValue({
      id: 1,
      status: "approved",
    });

    const response = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      data: { id: 1, status: "approved" },
      message: "Post created successfully",
    });
    expect(createPostService).toHaveBeenCalledTimes(1);
    expect(createPostService).toHaveBeenCalledWith(1, payload);
  });

  it("POST /api/posts should return 413 when JSON payload exceeds limit", async () => {
    const response = await request(app).post("/api/posts").send({
      title: "A".repeat(10),
      content: "B".repeat(1024 * 1024 + 64),
      post_type: "article",
      location_id: 100,
    });

    expect(response.status).toBe(413);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "FILE_TOO_LARGE",
        status: 413,
        message: "Request payload too large",
      },
    });
    expect(createPostService).not.toHaveBeenCalled();
  });
});
