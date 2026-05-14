/**
 * Production-safe seed script for Viewwing.
 *
 * This script writes directly to PostgreSQL through Drizzle instead of calling
 * the running API, so it works in environments where only DATABASE_URL is
 * available.
 */

import bcrypt from "bcryptjs";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { ensureRuntimeEnv } from "./lib/runtimeEnv.js";
import {
  locationsTable,
  mediaTable,
  postsTable,
  regionTable,
  spotsTable,
  usersTable,
} from "../db/schema.js";
import { locations, media, posts, regions, spots } from "./seedData/data.js";

ensureRuntimeEnv();

const { db, pool } = await import("../drizzle.js");

const SEED_USER = {
  name: "seeduser",
  email: "seed@viewwing.dev",
  password: "SeedPassword123!",
};

const regionIdMap = new Map<string, number>();
const regionPathMap = new Map<string, string>();
const locationIdMap = new Map<string, number>();
const spotIdMap = new Map<string, number>();
const postIdMap = new Map<string, number>();

let seedUserId = 0;

const getParentRegion = async (parentId: number) => {
  const rows = await db
    .select({ id: regionTable.id, path: regionTable.path })
    .from(regionTable)
    .where(eq(regionTable.id, parentId))
    .limit(1);

  return rows[0];
};

const ensureSeedUser = async () => {
  const byEmail = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, SEED_USER.email))
    .limit(1);

  if (byEmail[0]) {
    return byEmail[0].id;
  }

  const byName = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.name, SEED_USER.name))
    .limit(1);

  if (byName[0]) {
    return byName[0].id;
  }

  const passwordHash = await bcrypt.hash(SEED_USER.password, 10);
  const [created] = await db
    .insert(usersTable)
    .values({
      name: SEED_USER.name,
      email: SEED_USER.email,
      passwordHash,
      avatar_url: "default",
      bio: "System seed user",
    })
    .returning({ id: usersTable.id });

  if (!created) {
    throw new Error("Failed to create seed user");
  }

  return created.id;
};

const upsertRegion = async (region: (typeof regions)[number]) => {
  const parentId = region.parentKey ? regionIdMap.get(region.parentKey) : undefined;
  const parentPath =
    region.parentKey && parentId !== undefined
      ? regionPathMap.get(region.parentKey) ??
        (await getParentRegion(parentId))?.path ??
        null
      : null;

  const existingRows = await db
    .select({
      id: regionTable.id,
      path: regionTable.path,
      nameEn: regionTable.nameEn,
      level: regionTable.level,
    })
    .from(regionTable)
    .where(
      parentId !== undefined
        ? and(
            eq(regionTable.nameLocal, region.nameLocal),
            eq(regionTable.parentId, parentId),
          )
        : and(eq(regionTable.nameLocal, region.nameLocal), isNull(regionTable.parentId)),
    )
    .limit(1);

  let regionId: number;
  let regionPath: string;

  if (existingRows[0]) {
    regionId = existingRows[0].id;
    regionPath = parentPath ? `${parentPath}${regionId}/` : `/${regionId}/`;

    await db
      .update(regionTable)
      .set({
        nameLocal: region.nameLocal,
        nameEn: region.nameEn,
        level: region.level,
        parentId,
        path: regionPath,
      })
      .where(eq(regionTable.id, regionId));
  } else {
    const [created] = await db
      .insert(regionTable)
      .values({
        nameLocal: region.nameLocal,
        nameEn: region.nameEn,
        level: region.level,
        parentId,
        path: "/",
      })
      .returning({ id: regionTable.id });

    if (!created) {
      throw new Error(`Failed to create region ${region.nameEn}`);
    }

    regionId = created.id;
    regionPath = parentPath ? `${parentPath}${regionId}/` : `/${regionId}/`;

    await db
      .update(regionTable)
      .set({ path: regionPath })
      .where(eq(regionTable.id, regionId));
  }

  regionIdMap.set(region.key, regionId);
  regionPathMap.set(region.key, regionPath);
};

const upsertLocation = async (location: (typeof locations)[number]) => {
  const regionId = regionIdMap.get(location.regionKey);
  if (!regionId) {
    throw new Error(`Missing region for location ${location.name}`);
  }

  const existingRows = await db
    .select({ id: locationsTable.id })
    .from(locationsTable)
    .where(
      and(eq(locationsTable.name, location.name), eq(locationsTable.regionId, regionId)),
    )
    .limit(1);

  if (existingRows[0]) {
    await db
      .update(locationsTable)
      .set({
        category: location.category,
        description: location.description,
        keyPoints: location.keyPoints,
        coverUrl: location.coverUrl,
        centerLat: location.centerLat,
        centerLng: location.centerLng,
        status: "approved",
        updatedAt: new Date(),
      })
      .where(eq(locationsTable.id, existingRows[0].id));

    locationIdMap.set(location.key, existingRows[0].id);
    return;
  }

  const [created] = await db
    .insert(locationsTable)
    .values({
      name: location.name,
      regionId,
      category: location.category,
      description: location.description,
      keyPoints: location.keyPoints,
      coverUrl: location.coverUrl,
      centerLat: location.centerLat,
      centerLng: location.centerLng,
      status: "approved",
      submittedBy: seedUserId,
    })
    .returning({ id: locationsTable.id });

  if (!created) {
    throw new Error(`Failed to create location ${location.name}`);
  }

  locationIdMap.set(location.key, created.id);
};

const upsertSpot = async (spot: (typeof spots)[number]) => {
  const locationId = locationIdMap.get(spot.locationKey);
  if (!locationId) {
    throw new Error(`Missing location for spot ${spot.name}`);
  }

  const existingRows = await db
    .select({ id: spotsTable.id })
    .from(spotsTable)
    .where(and(eq(spotsTable.name, spot.name), eq(spotsTable.locationId, locationId)))
    .limit(1);

  if (existingRows[0]) {
    await db
      .update(spotsTable)
      .set({
        description: spot.description,
        imageUrl: spot.imageUrl,
        pointLat: spot.pointLat,
        pointLng: spot.pointLng,
        status: "approved",
        updatedAt: new Date(),
      })
      .where(eq(spotsTable.id, existingRows[0].id));

    spotIdMap.set(spot.key, existingRows[0].id);
    return;
  }

  const [created] = await db
    .insert(spotsTable)
    .values({
      name: spot.name,
      locationId,
      description: spot.description,
      imageUrl: spot.imageUrl,
      pointLat: spot.pointLat,
      pointLng: spot.pointLng,
      status: "approved",
      submittedBy: seedUserId,
    })
    .returning({ id: spotsTable.id });

  if (!created) {
    throw new Error(`Failed to create spot ${spot.name}`);
  }

  spotIdMap.set(spot.key, created.id);
};

const upsertPost = async (post: (typeof posts)[number]) => {
  const locationId = locationIdMap.get(post.locationKey);
  const spotId = spotIdMap.get(post.spotKey);

  if (!locationId || !spotId) {
    throw new Error(`Missing relation for post ${post.title}`);
  }

  const existingRows = await db
    .select({ id: postsTable.id })
    .from(postsTable)
    .where(
      and(
        eq(postsTable.title, post.title),
        eq(postsTable.locationId, locationId),
        eq(postsTable.spotId, spotId),
      ),
    )
    .limit(1);

  if (existingRows[0]) {
    await db
      .update(postsTable)
      .set({
        content: post.content,
        postType: post.postType,
        status: "approved",
        updatedAt: new Date(),
      })
      .where(eq(postsTable.id, existingRows[0].id));

    postIdMap.set(post.key, existingRows[0].id);
    return;
  }

  const [created] = await db
    .insert(postsTable)
    .values({
      title: post.title,
      content: post.content,
      locationId,
      spotId,
      postType: post.postType,
      status: "approved",
      submittedBy: seedUserId,
    })
    .returning({ id: postsTable.id });

  if (!created) {
    throw new Error(`Failed to create post ${post.title}`);
  }

  postIdMap.set(post.key, created.id);
};

const buildObjectKey = (postKey: string, fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "jpg";
  return `seed/${postKey}.${extension}`;
};

const upsertMedia = async (entry: (typeof media)[number]) => {
  const postId = postIdMap.get(entry.postKey);
  if (!postId) {
    throw new Error(`Missing post for media ${entry.postKey}`);
  }

  const objectKey = buildObjectKey(entry.postKey, entry.fileName);
  const existingRows = await db
    .select({ id: mediaTable.id })
    .from(mediaTable)
    .where(and(isNotNull(mediaTable.postId), eq(mediaTable.postId, postId), eq(mediaTable.objectKey, objectKey)))
    .limit(1);

  if (existingRows[0]) {
    await db
      .update(mediaTable)
      .set({
        mediaType: entry.mediaType,
        url: entry.url,
        thumbnailUrl: entry.thumbnailUrl,
        fileSize: 0n,
        displayOrder: entry.displayOrder,
      })
      .where(eq(mediaTable.id, existingRows[0].id));
    return;
  }

  await db.insert(mediaTable).values({
    postId,
    objectKey,
    mediaType: entry.mediaType,
    url: entry.url,
    thumbnailUrl: entry.thumbnailUrl,
    fileSize: 0n,
    displayOrder: entry.displayOrder,
  });
};

const seedRegions = async () => {
  console.log("🌍 Upserting regions...");
  const sorted = [...regions].sort((a, b) => a.level - b.level);
  for (const region of sorted) {
    await upsertRegion(region);
    console.log(`   ✓ ${region.nameEn}`);
  }
};

const seedLocations = async () => {
  console.log("📍 Upserting locations...");
  for (const location of locations) {
    await upsertLocation(location);
    console.log(`   ✓ ${location.name}`);
  }
};

const seedSpots = async () => {
  console.log("🎯 Upserting spots...");
  for (const spot of spots) {
    await upsertSpot(spot);
    console.log(`   ✓ ${spot.name}`);
  }
};

const seedPosts = async () => {
  console.log("📝 Upserting posts...");
  for (const post of posts) {
    await upsertPost(post);
    console.log(`   ✓ ${post.title}`);
  }
};

const seedMedia = async () => {
  console.log("🖼️  Upserting media...");
  for (const item of media) {
    await upsertMedia(item);
    console.log(`   ✓ ${item.postKey}`);
  }
};

async function main() {
  console.log("╔════════════════════════════════════════╗");
  console.log("║     Viewwing Production Seed Script    ║");
  console.log("╚════════════════════════════════════════╝\n");

  seedUserId = await ensureSeedUser();
  console.log(`Seed user ready: ${seedUserId}\n`);

  await seedRegions();
  await seedLocations();
  await seedSpots();
  await seedPosts();
  await seedMedia();

  console.log("\n═══════════════════════════════════════");
  console.log("✅ Seed data upsert complete");
  console.log("═══════════════════════════════════════");
  console.log(`   Regions:   ${regions.length}`);
  console.log(`   Locations: ${locations.length}`);
  console.log(`   Spots:     ${spots.length}`);
  console.log(`   Posts:     ${posts.length}`);
  console.log(`   Media:     ${media.length}`);
}

main()
  .catch((error) => {
    console.error("\n❌ Fatal error:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
