import { randomUUID } from "node:crypto";
import path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import { AppError } from "../utils/error.js";
import {
  getPresignSchema,
  addMediaToPostSchema,
  deleteMediaSchema,
} from "../utils/zodschemas.js";
import { db } from "../drizzle.js";
import { mediaTable, postsTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { logger } from "../middlewares/logger.js";

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/jpg",
]);
const VIDEO_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/mov"
]);

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl: string;
};

let r2ConfigCache: R2Config | null = null;
let r2Client: S3Client | null = null;

// Fail fast on missing env so misconfiguration is visible at request time.
function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new AppError(500, "INTERNAL_ERROR", `${name} is not configured`);
  }
  return value;
}

function getRequiredPublicBaseUrl() {
  return getRequiredEnv("R2_PUBLIC_BASE_URL").trim();
}

function getR2Config(): R2Config {
  if (r2ConfigCache) {
    return r2ConfigCache;
  }

  r2ConfigCache = {
    accountId: getRequiredEnv("R2_ACCOUNT_ID"),
    accessKeyId: getRequiredEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: getRequiredEnv("R2_SECRET_ACCESS_KEY"),
    bucket: getRequiredEnv("R2_BUCKET"),
    publicBaseUrl: getRequiredPublicBaseUrl(),
  };

  return r2ConfigCache;
}

function getR2Client() {
  if (r2Client) {
    return r2Client;
  }

  const config = getR2Config();
  r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return r2Client;
}

// Normalize user-provided file names before placing them in object keys.
function sanitizeFileName(fileName: string) {
  const parsed = path.parse(fileName);
  const safeBase =
    parsed.name.replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 80) || "file";
  const safeExt = parsed.ext.replace(/[^a-zA-Z0-9.]/g, "").slice(0, 10);
  return `${safeBase}${safeExt}`;
}

// Validate MIME and size by media type before generating an upload URL.
function ensureValidMediaInput(input: z.infer<typeof getPresignSchema>) {
  const isPhoto = input.media_type === "photo";
  const allowedTypes = isPhoto ? IMAGE_TYPES : VIDEO_TYPES;
  const maxSizeBytes = isPhoto ? 50 * 1024 * 1024 : 100 * 1024 * 1024;

  if (!allowedTypes.has(input.content_type)) {
    logger.warn(
      {
        action: "media.presign",
        mediaType: input.media_type,
        contentType: input.content_type,
      },
      "presign failed: invalid file type",
    );
    throw new AppError(400, "INVALID_FILE_TYPE", "Unsupported media type");
  }
  if (input.file_size > maxSizeBytes) {
    logger.warn(
      {
        action: "media.presign",
        mediaType: input.media_type,
        fileSize: input.file_size,
        maxSizeBytes,
      },
      "presign failed: file too large",
    );
    throw new AppError(413, "FILE_TOO_LARGE", "File exceeds the size limit");
  }
}

function buildPublicUrl(baseUrl: string, objectKey: string) {
  return `${baseUrl.replace(/\/+$/, "")}/${objectKey}`;
}

function assertObjectKeyForUser(userId: number, objectKey: string) {
  const expectedPrefix = `media/${userId}/`;
  if (!objectKey.startsWith(expectedPrefix)) {
    logger.warn(
      { action: "media.add", userId, objectKey },
      "add media forbidden: object key prefix mismatch",
    );
    throw new AppError(403, "FORBIDDEN", "Invalid object key for current user");
  }
}

export async function getPresignService(
  userId: number,
  input: z.infer<typeof getPresignSchema>,
) {
  // 1) Input gate: reject unsupported content up front.
  ensureValidMediaInput(input);

  // 2) Resolve R2 credentials and public URL base.
  const config = getR2Config();

  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const safeName = sanitizeFileName(input.file_name);
  // user/date/uuid layout helps avoid key collisions and improves traceability.
  const objectKey = `media/${userId}/${year}/${month}/${randomUUID()}-${safeName}`;

  // 3) Create an S3-compatible client targeting Cloudflare R2.
  const client = getR2Client();

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: objectKey,
    ContentType: input.content_type,
    ContentLength: input.file_size,
  });

  // 4) Generate a short-lived presigned PUT URL for direct browser upload.
  const expiresIn = 900;
  const uploadUrl = await getSignedUrl(client, command, { expiresIn });
  logger.info(
    { action: "media.presign", userId, objectKey, mediaType: input.media_type },
    "presign created",
  );

  // 5) Return everything the frontend needs for upload + later DB association.
  return {
    upload_url: uploadUrl,
    method: "PUT" as const,
    headers: {
      "Content-Type": input.content_type,
    },
    object_key: objectKey,
    public_url: buildPublicUrl(config.publicBaseUrl, objectKey),
    expires_in: expiresIn,
  };
}

export const addMediaToPostService = async (
  userId: number,
  userRole: string,
  postId: number,
  input: z.infer<typeof addMediaToPostSchema>,
) => {
  const postRows = await db
    .select({
      id: postsTable.id,
      submittedBy: postsTable.submittedBy,
    })
    .from(postsTable)
    .where(eq(postsTable.id, postId))
    .limit(1);

  const post = postRows[0];
  if (!post) {
    logger.warn({ action: "media.add", userId, postId }, "add media failed: post not found");
    throw new AppError(404, "NOT_FOUND", "Post not found");
  }

  if (userRole !== "admin" && post.submittedBy !== userId) {
    logger.warn(
      { action: "media.add", userId, userRole, ownerId: post.submittedBy, postId },
      "add media forbidden",
    );
    throw new AppError(403, "FORBIDDEN", "you are not the author of this content");
  }

  const payload = {
    postId,
    mediaType: input.media_type,
    url: input.url,
    objectKey: input.object_key,
    ...(input.thumbnail_url !== undefined && {
      thumbnailUrl: input.thumbnail_url,
    }),
    ...(input.display_order !== undefined && {
      displayOrder: input.display_order,
    }),
    fileSize: BigInt(input.file_size),
  };

  assertObjectKeyForUser(userId, input.object_key);

  const expectedUrl = buildPublicUrl(
    getR2Config().publicBaseUrl,
    input.object_key,
  );

  if (input.url !== expectedUrl) {
    logger.warn(
      { action: "media.add", userId, postId, objectKey: input.object_key },
      "add media failed: url and object_key mismatch",
    );
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "URL does not match object_key",
    );
  }

  const result = await db.insert(mediaTable).values(payload).returning({
    id: mediaTable.id,
    post_id: mediaTable.postId,
    media_type: mediaTable.mediaType,
    url: mediaTable.url,
    display_order: mediaTable.displayOrder,
  });

  if (!result[0]) {
    logger.error(
      { action: "media.add", userId, postId },
      "add media failed: insert returned empty",
    );
    throw new AppError(
      500,
      "DATABASE_ERROR",
      "failed to add this media, please try again",
    );
  }

  logger.info(
    { action: "media.add", userId, postId, mediaId: result[0].id },
    "add media success",
  );
  return result[0];
};

export const deleteMediaService = async (
  userId: number,
  userRole: string,
  data: z.infer<typeof deleteMediaSchema>,
) => {
  const postRoleId = await db
    .select({ submitBy: postsTable.submittedBy })
    .from(postsTable)
    .where(eq(postsTable.id, data.post_id));

  const mediaRow = await db
    .select()
    .from(mediaTable)
    .where(eq(mediaTable.id, data.media_id));

  if (!mediaRow[0]) {
    logger.warn(
      {
        action: "media.delete",
        userId,
        postId: data.post_id,
        mediaId: data.media_id,
      },
      "delete media failed: media not found",
    );
    throw new AppError(
      404,
      "NOT_FOUND",
      "error occured, this content is not found",
    );
  }

  if (!postRoleId[0] || mediaRow[0].postId !== data.post_id) {
    logger.warn(
      {
        action: "media.delete",
        userId,
        postId: data.post_id,
        mediaId: data.media_id,
      },
      "delete media failed: post/media mismatch",
    );
    throw new AppError(
      404,
      "NOT_FOUND",
      "postId or mediaId has something wrong",
    );
  }

  if (userRole !== "admin" && postRoleId[0].submitBy !== userId) {
    logger.warn(
      {
        action: "media.delete",
        userId,
        ownerId: postRoleId[0].submitBy,
        userRole,
        postId: data.post_id,
        mediaId: data.media_id,
      },
      "delete media forbidden",
    );
    throw new AppError(
      403,
      "FORBIDDEN",
      "you are not the author of this content",
    );
  }

  try {
    await db.delete(mediaTable).where(eq(mediaTable.id, data.media_id));
  } catch (err) {
    logger.error(
      {
        action: "media.delete",
        userId,
        postId: data.post_id,
        mediaId: data.media_id,
        err,
      },
      "delete media failed",
    );
    throw new AppError(500, "DATABASE_ERROR", "failed to delete");
  }

  logger.info(
    {
      action: "media.delete",
      userId,
      postId: data.post_id,
      mediaId: data.media_id,
    },
    "delete media success",
  );
  return { message: "delete success" };
};
