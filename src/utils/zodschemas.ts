import { z } from "zod";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().min(2).max(20),
});

const updateProfileSchema = z
  .object({
    name: z.string().min(2).max(20).optional(),
    avatarUrl: z.url().optional(),
    bio: z.string().max(500).optional(),
  })
  .refine((val) => Object.values(val).some((v) => v !== undefined), {
    message: "At least one field is required",
  });

const createRegionSchema = z.object({
  name: z.string().min(1).max(100),
  name_en: z.string().min(1).max(100).optional(),
  level: z.number().int().min(1).max(7),
  parent_id: z.number().int().min(1).max(999999).optional(),
});

const getSubRegionSchema = z.object({
  parent_id: z.preprocess((val) => {
    if (val === "" || val === undefined || val === null) return undefined;
    if (typeof val === "string") return Number(val);
    return val;
  }, z.number().int().min(1).max(999999).optional()),
  all: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
});

const getPathSchema = z.object({
  id: z.preprocess((val) => {
    if (val === "" || val === undefined || val === null) return undefined;
    if (typeof val === "string") return Number(val);
    return val;
  }, z.number().int().min(1).max(999999)),
});

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

const searchLocationSchema = z.object({
  q: z.string().min(1).max(200),
  region_id: z.coerce.number().int().min(1).max(999999).optional(),
  category: z.string().optional(),
  page: z.coerce.number().min(1).default(1).optional(),
  pageSize: z.coerce.number().min(1).max(100).default(20).optional(),
});

const getNearLocationSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(0).max(1000).default(10),
});

const getLocationDetailSchema = z.object({
  id: z.coerce.number().int().min(1),
});

const getLocationSpotsSchema = z.object({
  id: z.coerce.number().int().min(1),
});

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

const deleteLocationSchema = z.object({
  id: z.coerce.number().int().min(1).max(999999),
});

const getLocationPostsParamsSchema = z.object({
  id: z.coerce.number().int().min(1),
});

const getLocationPostsQuerySchema = z.object({
  spot_id: z.coerce.number().int().min(1).optional(),
  post_type: z.enum(["photo", "video", "article"]).optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(200).default(20).optional(),
});

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

const deleteSpotSchema = z.object({
  spot_id: z.coerce.number().int().min(1).max(999999),
});

const getSpotSchema = z.object({
  spot_id: z.coerce.number().int().min(1).max(999999),
});


const getPostsSchema = z.object({
  location_id: z.coerce.number().int().min(1).max(999999).optional(),
  spot_id: z.coerce.number().int().min(1).max(999999).optional(),
  post_type: z.enum(["photo", "video", "article"]).optional(),
  page: z.coerce.number().int().min(1).max(100).default(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).default(20).optional(),
});

const getPostByIdSchema = z.object({
  post_id: z.coerce.number().int().min(1).max(999999),
});

const createOrUpdatePostSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().max(200000),
  post_type: z.enum(["photo", "video", "article"]),
  location_id: z.coerce.number().int().min(1).max(999999).optional(),
  spot_id: z.coerce.number().int().min(1).max(999999).optional(),
});

const createPostSchema = createOrUpdatePostSchema.refine(
  (value) => value.location_id !== undefined || value.spot_id !== undefined,
  {
    message: "location_id or spot_id is required",
    path: ["location_id"],
  },
);

const updatePostSchema = createOrUpdatePostSchema;

const deletePostSchema = z.object({
  post_id: z.coerce.number().int().min(1).max(999999),
});

const getPresignSchema = z.object({
  file_name: z.string().min(1).max(500),
  content_type: z.string().min(1).max(255),
  file_size: z.coerce.number().int().min(1).max(104857600),
  media_type: z.enum(["photo", "video"]),
});

const addMediaToPostSchema = z.object({
  media_type: z.enum(["photo", "video"]),
  url: z.url().max(500),
  object_key: z.string().min(1).max(500),
  thumbnail_url: z.url().max(500).optional(),
  display_order: z.coerce.number().int().min(0).optional(),
  file_size: z.coerce.number().int().min(1).max(104857600),
});

const addMediaToPostParamsSchema = z.object({
  post_id: z.coerce.number().int().min(1).max(999999),
});

const deleteMediaSchema = z.object({
  post_id: z.coerce.number().int().min(1).max(999999),
  media_id: z.coerce.number().int().min(1).max(999999),
});

const createCommentSchema = z.object({
  post_id: z.coerce.number().int().min(1).max(999999),
  content: z.string().min(1).max(2000),
});

const getPostCommentsParamsSchema = z.object({
  post_id: z.coerce.number().int().min(1).max(999999),
});

const getPostCommentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).default(20).optional(),
});

const editCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

const deleteCommentSchema = z.object({
  comment_id: z.coerce.number().int().min(1).max(999999),
});

const addFavouriteSchema = z.object({
  spot_id: z.coerce.number().int().min(1).max(999999),
});

const getMySubmissionsSchema = z.object({
  type: z.enum(["location", "spot", "post", "comment"]).optional(),
  status: z.enum(["pending", "rejected", "approved"]).optional(),
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
  addFavouriteSchema,
  getMySubmissionsSchema,
};
