/**
 * Seed Data Script
 *
 * Injects sample data into the database via API calls.
 * Run with: pnpm tsx src/scripts/seedData.ts
 */

import {
  regions,
  locations,
  spots,
  posts,
  comments,
  media,
  favorites,
} from "./seedData/data.js";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000/api";

// Store ID mappings
const regionIdMap = new Map<string, number>();
const locationIdMap = new Map<string, number>();
const spotIdMap = new Map<string, number>();
const postIdMap = new Map<string, number>();

let authToken = "";
let userId = 0;

// ============ HTTP Helpers ============

interface ApiError {
  error?: { message?: string };
}

async function apiRequest<T>(
  method: string,
  endpoint: string,
  body?: unknown,
  requiresAuth = false,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (requiresAuth && authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = (await response.json()) as T & ApiError;

  if (!response.ok) {
    throw new Error(`API Error: ${data.error?.message || response.statusText}`);
  }

  return data;
}

// ============ Auth ============

async function registerAndLogin(): Promise<void> {
  const seedUser = {
    name: "seeduser",
    email: "seed@viewwing.dev",
    password: "SeedPassword123!",
  };

  console.log("🔐 Registering/logging in seed user...");

  // Try to register first
  try {
    await apiRequest("POST", "/auth/register", seedUser);
    console.log("   ✓ User registered");
  } catch (error) {
    // User might already exist, that's fine
    console.log("   ℹ User already exists, proceeding to login");
  }

  // Login
  const loginResponse = await apiRequest<{
    data: { token: string; user: { id: number } };
  }>("POST", "/auth/login", {
    email: seedUser.email,
    password: seedUser.password,
  });

  authToken = loginResponse.data.token;
  userId = loginResponse.data.user.id;
  console.log(`   ✓ Logged in successfully (User ID: ${userId})\n`);
}

// ============ Seed Regions ============

async function seedRegions(): Promise<void> {
  console.log("🌍 Seeding regions...");

  // Sort by level to ensure parents are created first
  const sortedRegions = [...regions].sort((a, b) => a.level - b.level);

  for (const region of sortedRegions) {
    const parentId = region.parentKey
      ? regionIdMap.get(region.parentKey)
      : undefined;

    try {
      const payload: Record<string, unknown> = {
        name: region.nameLocal,
        name_en: region.nameEn,
        level: region.level,
      };

      // Only include parent_id if it exists (not for top-level regions)
      if (parentId !== undefined) {
        payload.parent_id = parentId;
      }

      const response = await apiRequest<{ data: { id: number } }>(
        "POST",
        "/regions",
        payload,
        true,
      );

      regionIdMap.set(region.key, response.data.id);
      console.log(`   ✓ ${region.nameEn} (ID: ${response.data.id})`);
    } catch (error) {
      console.log(`   ⚠ ${region.nameEn}: ${(error as Error).message}`);
    }
  }

  console.log(`   Total: ${regionIdMap.size} regions created\n`);
}

// ============ Seed Locations ============

async function seedLocations(): Promise<void> {
  console.log("📍 Seeding locations...");

  for (const location of locations) {
    const regionId = regionIdMap.get(location.regionKey);

    if (!regionId) {
      console.log(
        `   ⚠ ${location.name}: Region not found (${location.regionKey})`,
      );
      continue;
    }

    try {
      const response = await apiRequest<{ data: { id: number } }>(
        "POST",
        "/locations",
        {
          name: location.name,
          region_id: regionId,
          category: location.category,
          description: location.description,
          key_points: location.keyPoints,
          cover_url: location.coverUrl,
          center_point: {
            lat: location.centerLat,
            lng: location.centerLng,
          },
        },
        true,
      );

      locationIdMap.set(location.key, response.data.id);
      console.log(`   ✓ ${location.name} (ID: ${response.data.id})`);
    } catch (error) {
      console.log(`   ⚠ ${location.name}: ${(error as Error).message}`);
    }
  }

  console.log(`   Total: ${locationIdMap.size} locations created\n`);
}

// ============ Seed Spots ============

async function seedSpots(): Promise<void> {
  console.log("🎯 Seeding spots...");

  for (const spot of spots) {
    const locationId = locationIdMap.get(spot.locationKey);

    if (!locationId) {
      console.log(
        `   ⚠ ${spot.name}: Location not found (${spot.locationKey})`,
      );
      continue;
    }

    try {
      const response = await apiRequest<{ data: { id: number } }>(
        "POST",
        "/spots",
        {
          name: spot.name,
          location_id: locationId,
          description: spot.description,
          image_url: spot.imageUrl,
          point: {
            lat: spot.pointLat,
            lng: spot.pointLng,
          },
        },
        true,
      );

      spotIdMap.set(spot.key, response.data.id);
      console.log(`   ✓ ${spot.name} (ID: ${response.data.id})`);
    } catch (error) {
      console.log(`   ⚠ ${spot.name}: ${(error as Error).message}`);
    }
  }

  console.log(`   Total: ${spotIdMap.size} spots created\n`);
}

// ============ Seed Posts ============

async function seedPosts(): Promise<void> {
  console.log("📝 Seeding posts...");

  let count = 0;

  for (const post of posts) {
    const locationId = locationIdMap.get(post.locationKey);
    const spotId = spotIdMap.get(post.spotKey);

    if (!locationId) {
      console.log(
        `   ⚠ "${post.title}": Location not found (${post.locationKey})`,
      );
      continue;
    }

    if (!spotId) {
      console.log(`   ⚠ "${post.title}": Spot not found (${post.spotKey})`);
      continue;
    }

    try {
      const response = await apiRequest<{ data: { id: number } }>(
        "POST",
        "/posts",
        {
          title: post.title,
          content: post.content,
          location_id: locationId,
          spot_id: spotId,
          post_type: post.postType,
        },
        true,
      );

      postIdMap.set(post.key, response.data.id);
      count++;
      console.log(`   ✓ "${post.title}" (ID: ${response.data.id})`);
    } catch (error) {
      console.log(`   ⚠ "${post.title}": ${(error as Error).message}`);
    }
  }

  console.log(`   Total: ${count} posts created\n`);
}

// ============ Seed Comments ============

async function seedComments(): Promise<void> {
  console.log("💬 Seeding comments...");

  let count = 0;

  for (const comment of comments) {
    const postId = postIdMap.get(comment.postKey);

    if (!postId) {
      console.log(`   ⚠ Comment: Post not found (${comment.postKey})`);
      continue;
    }

    try {
      await apiRequest<{ data: { id: number } }>(
        "POST",
        "/comments",
        {
          post_id: postId,
          content: comment.content,
        },
        true,
      );

      count++;
      console.log(`   ✓ Comment on post ${comment.postKey}`);
    } catch (error) {
      console.log(`   ⚠ Comment: ${(error as Error).message}`);
    }
  }

  console.log(`   Total: ${count} comments created\n`);
}

// ============ Seed Media ============

async function seedMedia(): Promise<void> {
  console.log("🖼️  Seeding media...");

  let count = 0;

  for (const item of media) {
    const postId = postIdMap.get(item.postKey);

    if (!postId) {
      console.log(`   ⚠ Media: Post not found (${item.postKey})`);
      continue;
    }

    try {
      // object_key must start with media/{userId}/ to pass validation
      const objectKey = `media/${userId}/${item.postKey}-${item.displayOrder}.jpg`;

      await apiRequest<{ data: { id: number } }>(
        "POST",
        `/posts/${postId}/media`,
        {
          media_type: item.mediaType,
          url: item.url,
          object_key: objectKey,
          thumbnail_url: item.thumbnailUrl,
          display_order: item.displayOrder,
          file_size: 500000, // Approximate size for seed data
        },
        true,
      );

      count++;
      console.log(
        `   ✓ Media for post ${item.postKey} (order: ${item.displayOrder})`,
      );
    } catch (error) {
      console.log(`   ⚠ Media: ${(error as Error).message}`);
    }
  }

  console.log(`   Total: ${count} media items created\n`);
}

// ============ Seed Favorites ============

async function seedFavorites(): Promise<void> {
  console.log("⭐ Seeding favorites...");

  let count = 0;

  for (const fav of favorites) {
    const spotId = spotIdMap.get(fav.spotKey);

    if (!spotId) {
      console.log(`   ⚠ Favorite: Spot not found (${fav.spotKey})`);
      continue;
    }

    try {
      await apiRequest<{ data: { id: number } }>(
        "POST",
        "/favourites",
        {
          spot_id: spotId,
        },
        true,
      );

      count++;
      console.log(`   ✓ Favorited spot ${fav.spotKey}`);
    } catch (error) {
      console.log(`   ⚠ Favorite: ${(error as Error).message}`);
    }
  }

  console.log(`   Total: ${count} favorites created\n`);
}

// ============ Main ============

async function main(): Promise<void> {
  console.log("╔════════════════════════════════════════╗");
  console.log("║     Viewwing Seed Data Script          ║");
  console.log("╚════════════════════════════════════════╝\n");
  console.log(`API Base URL: ${API_BASE_URL}\n`);

  try {
    await registerAndLogin();
    await seedRegions();
    await seedLocations();
    await seedSpots();
    await seedPosts();
    await seedComments();
    await seedMedia();
    await seedFavorites();

    console.log("═══════════════════════════════════════");
    console.log("✅ Seed data injection complete!");
    console.log("═══════════════════════════════════════");
    console.log(`   Regions:   ${regionIdMap.size}`);
    console.log(`   Locations: ${locationIdMap.size}`);
    console.log(`   Spots:     ${spotIdMap.size}`);
    console.log(`   Posts:     ${postIdMap.size}`);
    console.log(`   Comments:  ${comments.length}`);
    console.log(`   Media:     ${media.length}`);
    console.log(`   Favorites: ${favorites.length}`);
  } catch (error) {
    console.error("\n❌ Fatal error:", (error as Error).message);
    process.exit(1);
  }
}

main();
