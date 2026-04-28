CREATE TYPE "public"."content_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('photo', 'video');--> statement-breakpoint
CREATE TYPE "public"."post_type" AS ENUM('photo', 'video', 'article');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"content" text NOT NULL,
	"user_id" integer NOT NULL,
	"content_status" "content_status" DEFAULT 'approved' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"spot_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "location" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"nameEn" varchar(255),
	"region_id" integer NOT NULL,
	"category" varchar(50) NOT NULL,
	"coverUrl" varchar(500) NOT NULL,
	"description" text,
	"key_points" text[],
	"center_lat" double precision NOT NULL,
	"center_lng" double precision NOT NULL,
	"content_status" "content_status" DEFAULT 'approved' NOT NULL,
	"replaces_id" integer,
	"rejection_reason" text,
	"submitted_by" integer NOT NULL,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"object_key" varchar(500) NOT NULL,
	"media_type" "media_type" NOT NULL,
	"url" varchar(500) NOT NULL,
	"thumbnail_url" varchar(500),
	"file_size" bigint,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"location_id" integer NOT NULL,
	"spot_id" integer,
	"post_type" "post_type" DEFAULT 'article' NOT NULL,
	"content_status" "content_status" DEFAULT 'approved' NOT NULL,
	"rejection_reason" text,
	"submitted_by" integer NOT NULL,
	"like_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "region" (
	"id" serial PRIMARY KEY NOT NULL,
	"nameLocal" varchar(100) NOT NULL,
	"nameEn" varchar(100),
	"path" varchar(500) NOT NULL,
	"level" integer NOT NULL,
	"parent_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spots" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"location_id" integer NOT NULL,
	"description" text,
	"image_url" varchar(500),
	"point_lat" double precision NOT NULL,
	"point_lng" double precision NOT NULL,
	"content_status" "content_status" DEFAULT 'approved' NOT NULL,
	"rejection_reason" text,
	"submitted_by" integer NOT NULL,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"passwordHash" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"avatar_url" varchar(500) DEFAULT 'https://www.flaticon.com/free-icon/people_14643189',
	"bio" varchar(500) DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_name_unique" UNIQUE("name"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_spot_id_spots_id_fk" FOREIGN KEY ("spot_id") REFERENCES "public"."spots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location" ADD CONSTRAINT "location_region_id_region_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."region"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location" ADD CONSTRAINT "location_replaces_id_location_id_fk" FOREIGN KEY ("replaces_id") REFERENCES "public"."location"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location" ADD CONSTRAINT "location_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location" ADD CONSTRAINT "location_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_spot_id_spots_id_fk" FOREIGN KEY ("spot_id") REFERENCES "public"."spots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "region" ADD CONSTRAINT "region_parent_id_region_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."region"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spots" ADD CONSTRAINT "spots_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spots" ADD CONSTRAINT "spots_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spots" ADD CONSTRAINT "spots_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comments_post_status_idx" ON "comments" USING btree ("post_id","content_status");--> statement-breakpoint
CREATE INDEX "comments_user_status_idx" ON "comments" USING btree ("user_id","content_status");--> statement-breakpoint
CREATE UNIQUE INDEX "favorites_user_spot_unique_idx" ON "favorites" USING btree ("user_id","spot_id");--> statement-breakpoint
CREATE INDEX "favorites_user_created_idx" ON "favorites" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "location_submitted_by_status_idx" ON "location" USING btree ("submitted_by","content_status");--> statement-breakpoint
CREATE INDEX "media_post_display_order_idx" ON "media" USING btree ("post_id","display_order");--> statement-breakpoint
CREATE INDEX "posts_status_created_idx" ON "posts" USING btree ("content_status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "posts_location_status_created_idx" ON "posts" USING btree ("location_id","content_status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "posts_spot_status_created_idx" ON "posts" USING btree ("spot_id","content_status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "posts_submitted_by_idx" ON "posts" USING btree ("submitted_by");--> statement-breakpoint
CREATE INDEX "spots_location_status_created_idx" ON "spots" USING btree ("location_id","content_status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "spots_submitted_by_idx" ON "spots" USING btree ("submitted_by");