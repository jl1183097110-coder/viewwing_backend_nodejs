import {
  bigint,
  doublePrecision,
  integer,
  index,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["user", "admin"]);

export const contentStatus = pgEnum("content_status", [
  "pending",
  "approved",
  "rejected",
]);

export const postType = pgEnum("post_type", ["photo", "video", "article"]);
export const mediaType = pgEnum("media_type", ["photo", "video"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar({ length: 255 }).notNull().unique(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: varchar({ length: 255 }).notNull(),
  role: userRole("role").notNull().default("user"),
  avatar_url: varchar({ length: 500 }).default(
    "https://www.flaticon.com/free-icon/people_14643189",
  ),
  bio: varchar({ length: 500 }).default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const regionTable = pgTable("region", {
  id: serial("id").primaryKey(),
  nameLocal: varchar({ length: 100 }).notNull(),
  nameEn: varchar({ length: 100 }),
  path: varchar({ length: 500 }).notNull(),
  level: integer("level").notNull(),
  parentId: integer("parent_id").references((): any => regionTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const locationsTable = pgTable(
  "location",
  {
    id: serial("id").primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    nameEn: varchar({ length: 255 }),
    regionId: integer("region_id")
      .references((): any => regionTable.id)
      .notNull(),
    category: varchar({ length: 50 }).notNull(),
    coverUrl: varchar({ length: 500 }).notNull(),
    description: text("description"),
    keyPoints: text("key_points").array(),
    centerLat: doublePrecision("center_lat").notNull(),
    centerLng: doublePrecision("center_lng").notNull(),
    status: contentStatus("content_status").notNull().default("approved"),
    replacesId: integer("replaces_id").references((): any => locationsTable.id),
    rejectionReason: text("rejection_reason"),
    submittedBy: integer("submitted_by")
      .references((): any => usersTable.id)
      .notNull(),
    reviewedBy: integer("reviewed_by").references((): any => usersTable.id),
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("location_submitted_by_status_idx").on(
      table.submittedBy,
      table.status,
    ),
  ],
);

export const spotsTable = pgTable(
  "spots",
  {
    id: serial("id").primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    locationId: integer("location_id")
      .references((): any => locationsTable.id, { onDelete: "cascade" })
      .notNull(),
    description: text("description"),
    imageUrl: varchar("image_url", { length: 500 }),
    pointLat: doublePrecision("point_lat").notNull(),
    pointLng: doublePrecision("point_lng").notNull(),
    status: contentStatus("content_status").notNull().default("approved"),
    rejectionReason: text("rejection_reason"),
    submittedBy: integer("submitted_by")
      .references((): any => usersTable.id)
      .notNull(),
    reviewedBy: integer("reviewed_by").references(() => usersTable.id),
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("spots_location_status_created_idx").on(
      table.locationId,
      table.status,
      table.createdAt.desc(),
    ),
    index("spots_submitted_by_idx").on(table.submittedBy),
  ],
);

export const postsTable = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    title: varchar({ length: 255 }).notNull(),
    content: text("content").notNull(),
    locationId: integer("location_id")
      .references(() => locationsTable.id, { onDelete: "cascade" })
      .notNull(),
    spotId: integer("spot_id")
      .references(() => spotsTable.id, {
        onDelete: "set null",
      }),
    postType: postType("post_type").default("article").notNull(),
    status: contentStatus("content_status").default("approved").notNull(),
    rejectionReason: text("rejection_reason"),
    submittedBy: integer("submitted_by")
      .references(() => usersTable.id)
      .notNull(),
    likeCount: integer("like_count").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("posts_status_created_idx").on(
      table.status,
      table.createdAt.desc(),
    ),
    index("posts_location_status_created_idx").on(
      table.locationId,
      table.status,
      table.createdAt.desc(),
    ),
    index("posts_spot_status_created_idx").on(
      table.spotId,
      table.status,
      table.createdAt.desc(),
    ),
    index("posts_submitted_by_idx").on(table.submittedBy),
  ],
);

export const mediaTable = pgTable(
  "media",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id")
      .references(() => postsTable.id, { onDelete: "cascade" })
      .notNull(),
    objectKey: varchar("object_key", { length: 500 }).notNull(),
    mediaType: mediaType("media_type").notNull(),
    url: varchar({ length: 500 }).notNull(),
    thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
    fileSize: bigint("file_size", { mode: "bigint" }),
    displayOrder: integer("display_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("media_post_display_order_idx").on(table.postId, table.displayOrder),
  ],
);

export const commentsTable = pgTable(
  "comments",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id")
      .references(() => postsTable.id, { onDelete: "cascade" })
      .notNull(),
    content: text("content").notNull(),
    userId: integer("user_id")
      .references(() => usersTable.id)
      .notNull(),
    status: contentStatus("content_status").default("approved").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("comments_post_status_idx").on(table.postId, table.status),
    index("comments_user_status_idx").on(table.userId, table.status),
  ],
);

export const favoritesTable = pgTable(
  "favorites",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    spotId: integer("spot_id")
      .references(() => spotsTable.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("favorites_user_spot_unique_idx").on(table.userId, table.spotId),
    index("favorites_user_created_idx").on(table.userId, table.createdAt.desc()),
  ],
);
