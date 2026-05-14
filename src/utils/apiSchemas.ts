import { z } from "zod";

// Validates the request body for POST /auth/login.
const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

// Validates the request body for POST /auth/register.
const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().min(2).max(20),
});

// Validates the request body for PUT /auth/profile.
// At least one updatable profile field must be provided.
const updateProfileSchema = z
  .object({
    name: z.string().min(2).max(20).optional(),
    avatarUrl: z.url().optional(),
    bio: z.string().max(500).optional(),
  })
  .refine((val) => Object.values(val).some((v) => v !== undefined), {
    message: "At least one field is required",
  });

// Validates the request body for POST /regions.
const createRegionSchema = z.object({
  name: z.string().min(1).max(100),
  name_en: z.string().min(1).max(100).optional(),
  level: z.number().int().min(1).max(7),
  parent_id: z.number().int().min(1).max(999999).optional(),
});

// Validates the query string for GET /regions.
// Supports parent-based lookup and the all=true flag.
const getSubRegionSchema = z.object({
  parent_id: z.preprocess((val) => {
    if (val === "" || val === undefined || val === null) return undefined;
    if (typeof val === "string") return Number(val);
    return val;
  }, z.number().int().min(1).max(999999).optional()),
  all: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
});

// Validates route params for GET /regions/:id/path.
const getPathSchema = z.object({
  id: z.preprocess((val) => {
    if (val === "" || val === undefined || val === null) return undefined;
    if (typeof val === "string") return Number(val);
    return val;
  }, z.number().int().min(1).max(999999)),
});

// Validates the query string for GET /locations.
const getLocationSchema = z.object({
  region_id: z.coerce.number().int().min(1).max(999999).optional(),
  category: z.string().min(1).max(1000).optional(),
  sort: z.enum(["newest", "popular"]).default("newest").optional(),
  page: z.preprocess(
    (val) => (typeof val === "string" ? Number(val) : val),
    z.number().int().min(1).default(1).optional(),
  ),
  pageSize: z.preprocess(
    (val) => (typeof val === "string" ? Number(val) : val),
    z.number().int().min(1).max(100).default(20).optional(),
  ),
});

// Validates the query string for GET /locations/search.
const searchLocationSchema = z.object({
  q: z.string().min(1).max(200),
  region_id: z.coerce.number().int().min(1).max(999999).optional(),
  category: z.string().optional(),
  page: z.coerce.number().min(1).default(1).optional(),
  pageSize: z.coerce.number().min(1).max(100).default(20).optional(),
});

// Validates the query string for GET /locations/nearby.
const getNearLocationSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(0).max(1000).default(10),
});

// Validates route params for GET /locations/:id and PUT /locations/:id.
const getLocationDetailSchema = z.object({
  id: z.coerce.number().int().min(1),
});

// Validates route params for GET /locations/:id/spots.
const getLocationSpotsSchema = z.object({
  id: z.coerce.number().int().min(1),
});

// Validates the request body for POST /locations.
const createLocationSchema = z.object({
  name: z.string().min(1).max(255),
  region_id: z.coerce.number().int().min(1).max(999999),
  category: z.string().min(1).max(50),
  description: z.string().max(20000).optional(),
  cover_url: z.url().max(500),
  key_points: z.array(z.string().min(1).max(500)).max(100).optional(),
  center_point: z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
  }),
});

// Validates the request body for PUT /locations/:id.
// Supports partial updates but requires at least one field.
const updateLocationSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    region_id: z.coerce.number().int().min(1).max(999999).optional(),
    category: z.string().min(1).max(50).optional(),
    description: z.string().max(20000).nullable().optional(),
    cover_url: z.url().max(500).optional(),
    key_points: z
      .array(z.string().min(1).max(500))
      .max(100)
      .nullable()
      .optional(),
    center_point: z
      .object({
        lat: z.coerce.number().min(-90).max(90),
        lng: z.coerce.number().min(-180).max(180),
      })
      .optional(),
  })
  .refine((val) => Object.values(val).some((v) => v !== undefined), {
    message: "At least one field is required",
  });

// Validates route params for DELETE /locations/:id.
const deleteLocationSchema = z.object({
  id: z.coerce.number().int().min(1).max(999999),
});

// Validates route params for GET /locations/:id/posts.
const getLocationPostsParamsSchema = z.object({
  id: z.coerce.number().int().min(1),
});

// Validates the query string for GET /locations/:id/posts.
const getLocationPostsQuerySchema = z.object({
  spot_id: z.coerce.number().int().min(1).optional(),
  post_type: z.enum(["photo", "video", "article"]).optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(200).default(20).optional(),
});

// Validates the request body for POST /spots.
const createSpotSchema = z.object({
  name: z.string().min(1).max(255),
  location_id: z.coerce.number().int().min(1).max(999999),
  description: z.string().max(200000),
  image_url: z.url().max(500).optional(),
  point: z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
  }),
});

// Validates the request body for PUT /spots/:spot_id.
const editSpotSchema = z.object({
  name: z.string().min(1).max(255),
  location_id: z.coerce.number().int().min(1).max(999999).optional(),
  description: z.string().max(200000),
  image_url: z.url().max(500).optional(),
  point: z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
  }),
});

// Validates route params for DELETE /spots/:spot_id.
const deleteSpotSchema = z.object({
  spot_id: z.coerce.number().int().min(1).max(999999),
});

// Validates route params for GET /spots/:spot_id and PUT /spots/:spot_id.
const getSpotSchema = z.object({
  spot_id: z.coerce.number().int().min(1).max(999999),
});

// Validates the query string for GET /posts.
const getPostsSchema = z.object({
  location_id: z.coerce.number().int().min(1).max(999999).optional(),
  spot_id: z.coerce.number().int().min(1).max(999999).optional(),
  post_type: z.enum(["photo", "video", "article"]).optional(),
  page: z.coerce.number().int().min(1).max(100).default(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).default(20).optional(),
});

// Validates route params for GET /posts/:post_id, PUT /posts/:post_id, and DELETE /posts/:post_id.
const getPostByIdSchema = z.object({
  post_id: z.coerce.number().int().min(1).max(999999),
});

// Shared body validation for post creation and post updates.
const createOrUpdatePostSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().max(200000),
  post_type: z.enum(["photo", "video", "article"]),
  location_id: z.coerce.number().int().min(1).max(999999).optional(),
  spot_id: z.coerce.number().int().min(1).max(999999).optional(),
});

// Validates the request body for POST /posts.
// Requires at least one of location_id or spot_id.
const createPostSchema = createOrUpdatePostSchema.refine(
  (value) => value.location_id !== undefined || value.spot_id !== undefined,
  {
    message: "location_id or spot_id is required",
    path: ["location_id"],
  },
);

// Validates the request body for PUT /posts/:post_id.
const updatePostSchema = createOrUpdatePostSchema;

// Validates route params for DELETE /posts/:post_id when a dedicated delete schema is preferred.
const deletePostSchema = z.object({
  post_id: z.coerce.number().int().min(1).max(999999),
});

// Validates the request body for POST /media/presign.
const getPresignSchema = z.object({
  file_name: z.string().min(1).max(500),
  content_type: z.string().min(1).max(255),
  file_size: z.coerce.number().int().min(1).max(104857600),
  media_type: z.enum(["photo", "video"]),
});

// Validates the request body for media association endpoints:
// POST /posts/:post_id/media, POST /spots/:spot_id/media, and POST /locations/:location_id/media.
const addMediaToPostSchema = z.object({
  media_type: z.enum(["photo", "video"]),
  url: z.url().max(500),
  object_key: z.string().min(1).max(500),
  thumbnail_url: z.url().max(500).optional(),
  display_order: z.coerce.number().int().min(0).optional(),
  file_size: z.coerce.number().int().min(1).max(104857600),
});

// Validates route params for POST /posts/:post_id/media.
const addMediaToPostParamsSchema = z.object({
  post_id: z.coerce.number().int().min(1).max(999999),
});

// Validates route params for DELETE /posts/:post_id/media/:media_id.
const deleteMediaSchema = z.object({
  post_id: z.coerce.number().int().min(1).max(999999),
  media_id: z.coerce.number().int().min(1).max(999999),
});

// Validates the request body for POST /comments.
const createCommentSchema = z.object({
  post_id: z.coerce.number().int().min(1).max(999999),
  content: z.string().min(1).max(2000),
});

// Validates route params for GET /posts/:post_id/comments.
const getPostCommentsParamsSchema = z.object({
  post_id: z.coerce.number().int().min(1).max(999999),
});

// Validates the query string for GET /posts/:post_id/comments.
const getPostCommentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).default(20).optional(),
});

// Validates the request body for PUT /comments/:comment_id.
const editCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

// Validates route params for DELETE /comments/:comment_id.
const deleteCommentSchema = z.object({
  comment_id: z.coerce.number().int().min(1).max(999999),
});

// Validates the query string for GET /profile/submissions.
const getMySubmissionsSchema = z.object({
  type: z.enum(["location", "spot", "post", "comment"]).optional(),
  status: z.enum(["pending", "rejected", "approved"]).optional(),
});

// --- New polymorphic favorites schemas ---

// Shared enum for favorites endpoints that accept a target entity type.
export const favouriteTargetTypeSchema = z.enum(["post", "spot", "location"]);

// Validates the request body for POST /favourites and DELETE /favourites.
export const favouriteBodySchema = z.object({
  type: favouriteTargetTypeSchema,
  id: z.number().int().min(1).max(999999),
});

// Validates the query string for GET /favourites.
export const getFavouritesQuerySchema = z.object({
  type: favouriteTargetTypeSchema.optional(),
});

// Validates the query string for GET /favourites/check.
export const checkFavouriteSchema = z.object({
  type: favouriteTargetTypeSchema,
  id: z.coerce.number().int().min(1).max(999999),
});

// --- New polymorphic media schemas ---

// Validates route params for POST /spots/:spot_id/media.
export const spotMediaParamsSchema = z.object({
  spot_id: z.coerce.number().int().min(1).max(999999),
});

// Validates route params for POST /locations/:location_id/media.
export const locationMediaParamsSchema = z.object({
  location_id: z.coerce.number().int().min(1).max(999999),
});

// Validates route params for DELETE /spots/:spot_id/media/:media_id.
export const deleteSpotMediaSchema = z.object({
  spot_id: z.coerce.number().int().min(1).max(999999),
  media_id: z.coerce.number().int().min(1).max(999999),
});

// Validates route params for DELETE /locations/:location_id/media/:media_id.
export const deleteLocationMediaSchema = z.object({
  location_id: z.coerce.number().int().min(1).max(999999),
  media_id: z.coerce.number().int().min(1).max(999999),
});

export {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  createRegionSchema,
  getSubRegionSchema,
  getPathSchema,
  getLocationSchema,
  searchLocationSchema,
  getNearLocationSchema,
  getLocationDetailSchema,
  getLocationSpotsSchema,
  createLocationSchema,
  updateLocationSchema,
  deleteLocationSchema,
  getLocationPostsParamsSchema,
  getLocationPostsQuerySchema,
  createSpotSchema,
  editSpotSchema,
  deleteSpotSchema,
  getSpotSchema,
  getPostsSchema,
  getPostByIdSchema,
  createPostSchema,
  updatePostSchema,
  deletePostSchema,
  getPresignSchema,
  addMediaToPostSchema,
  addMediaToPostParamsSchema,
  deleteMediaSchema,
  createCommentSchema,
  getPostCommentsParamsSchema,
  getPostCommentsQuerySchema,
  editCommentSchema,
  deleteCommentSchema,
  getMySubmissionsSchema,
};
