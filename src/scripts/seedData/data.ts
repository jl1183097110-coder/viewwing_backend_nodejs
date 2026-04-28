// Seed data for viewwing - All in English

export interface RegionSeed {
  nameLocal: string;
  nameEn: string;
  level: number;
  parentKey?: string; // Used to reference parent during seeding
  key: string; // Unique key for referencing
}

export interface LocationSeed {
  name: string;
  regionKey: string;
  category: string;
  description: string;
  keyPoints: string[];
  coverUrl: string;
  centerLat: number;
  centerLng: number;
  key: string;
}

export interface SpotSeed {
  name: string;
  locationKey: string;
  description: string;
  imageUrl: string;
  pointLat: number;
  pointLng: number;
  key: string;
}

export interface PostSeed {
  title: string;
  content: string;
  locationKey: string;
  spotKey: string;
  postType: "photo" | "article";
  key: string;
}

// ============ REGIONS ============
export const regions: RegionSeed[] = [
  // Level 1 - Continents
  { nameLocal: "EastAsia", nameEn: "East Asia", level: 1, key: "eastasia" },
  { nameLocal: "Europe", nameEn: "Europe", level: 1, key: "europe" },

  // Level 2 - Countries (Asia)
  {
    nameLocal: "Japan",
    nameEn: "Japan",
    level: 2,
    parentKey: "eastasia",
    key: "japan",
  },
  {
    nameLocal: "China",
    nameEn: "China",
    level: 2,
    parentKey: "eastasia",
    key: "china",
  },

  // Level 2 - Countries (Europe)
  {
    nameLocal: "Switzerland",
    nameEn: "Switzerland",
    level: 2,
    parentKey: "europe",
    key: "switzerland",
  },
  {
    nameLocal: "Norway",
    nameEn: "Norway",
    level: 2,
    parentKey: "europe",
    key: "norway",
  },

  // Level 3 - Provinces/States
  {
    nameLocal: "Shizuoka Prefecture",
    nameEn: "Shizuoka Prefecture",
    level: 3,
    parentKey: "japan",
    key: "shizuoka",
  },
  {
    nameLocal: "Yunnan Province",
    nameEn: "Yunnan Province",
    level: 3,
    parentKey: "china",
    key: "yunnan",
  },
  {
    nameLocal: "Valais",
    nameEn: "Valais",
    level: 3,
    parentKey: "switzerland",
    key: "valais",
  },
  {
    nameLocal: "More og Romsdal",
    nameEn: "More og Romsdal",
    level: 3,
    parentKey: "norway",
    key: "more-og-romsdal",
  },
];

// ============ LOCATIONS ============
export const locations: LocationSeed[] = [
  {
    name: "Mount Fuji",
    regionKey: "shizuoka",
    category: "mountain",
    description:
      "Mount Fuji is Japan's highest peak at 3,776 meters. This iconic stratovolcano is a UNESCO World Heritage Site and has been a sacred site for centuries. The climbing season runs from July to September.",
    keyPoints: [
      "Best climbing season: July to September",
      "Requires mountain hut reservation",
      "Sunrise viewing (Goraiko) is a must-see",
    ],
    coverUrl:
      "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800",
    centerLat: 35.3606,
    centerLng: 138.7274,
    key: "mount-fuji",
  },
  {
    name: "Jade Dragon Snow Mountain",
    regionKey: "yunnan",
    category: "mountain",
    description:
      "Jade Dragon Snow Mountain is a mountain range in Yunnan Province, China. Its highest peak rises to 5,596 meters and remains unclimbed. The mountain is sacred to the Naxi people.",
    keyPoints: [
      "Cable car reaches 4,506m elevation",
      "Best visited April to October",
      "Altitude sickness precautions recommended",
    ],
    coverUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800",
    centerLat: 27.1215,
    centerLng: 100.2286,
    key: "jade-dragon",
  },
  {
    name: "Matterhorn",
    regionKey: "valais",
    category: "mountain",
    description:
      "The Matterhorn is one of the highest peaks in the Alps at 4,478 meters. Its distinctive pyramid shape makes it one of the most recognizable mountains in the world.",
    keyPoints: [
      "Technical climbing experience required",
      "Best season: July to September",
      "Gornergrat railway offers spectacular views",
    ],
    coverUrl:
      "https://images.unsplash.com/photo-1531210483974-4f8205670c70?w=800",
    centerLat: 45.9763,
    centerLng: 7.6586,
    key: "matterhorn",
  },
  {
    name: "Geirangerfjord",
    regionKey: "more-og-romsdal",
    category: "fjord",
    description:
      "Geirangerfjord is a UNESCO World Heritage Site and one of Norway's most visited natural attractions. The fjord stretches 15 kilometers inland with dramatic cliffs and waterfalls.",
    keyPoints: [
      "Best visited May to September",
      "Famous waterfalls: Seven Sisters, Suitor",
      "Kayaking and boat tours available",
    ],
    coverUrl:
      "https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?w=800",
    centerLat: 62.1008,
    centerLng: 7.094,
    key: "geirangerfjord",
  },
  {
    name: "Lake Brienz",
    regionKey: "switzerland",
    category: "lake",
    description:
      "Lake Brienz is known for its stunning turquoise waters, fed by glacial meltwater. The lake is surrounded by mountains and traditional Swiss villages.",
    keyPoints: [
      "Famous for turquoise glacial water",
      "Giessbach Falls nearby",
      "Historic paddle steamer cruises",
    ],
    coverUrl:
      "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=800",
    centerLat: 46.7275,
    centerLng: 7.9644,
    key: "lake-brienz",
  },
];

// ============ SPOTS ============
export const spots: SpotSeed[] = [
  // Mount Fuji spots
  {
    name: "Fifth Station",
    locationKey: "mount-fuji",
    description:
      "The most popular starting point for climbers at 2,300m elevation. Features shops, restaurants, and a shrine.",
    imageUrl:
      "https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=800",
    pointLat: 35.3753,
    pointLng: 138.731,
    key: "fuji-fifth-station",
  },
  {
    name: "Lake Kawaguchi Viewpoint",
    locationKey: "mount-fuji",
    description:
      "One of the Fuji Five Lakes offering iconic reflections of Mount Fuji, especially during cherry blossom season.",
    imageUrl:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800",
    pointLat: 35.5161,
    pointLng: 138.7519,
    key: "kawaguchi-viewpoint",
  },
  {
    name: "Chureito Pagoda",
    locationKey: "mount-fuji",
    description:
      "A five-storied pagoda offering one of the most famous views of Mount Fuji, especially beautiful with cherry blossoms.",
    imageUrl:
      "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800",
    pointLat: 35.5003,
    pointLng: 138.7996,
    key: "chureito-pagoda",
  },

  // Jade Dragon spots
  {
    name: "Glacier Park",
    locationKey: "jade-dragon",
    description:
      "Accessible by cable car, this area at 4,506m offers close views of the glacier and snow-capped peaks.",
    imageUrl:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
    pointLat: 27.118,
    pointLng: 100.235,
    key: "jade-glacier-park",
  },
  {
    name: "Blue Moon Valley",
    locationKey: "jade-dragon",
    description:
      "A scenic valley with crystal-clear blue lakes formed by glacial meltwater at the base of the mountain.",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    pointLat: 27.089,
    pointLng: 100.218,
    key: "blue-moon-valley",
  },

  // Matterhorn spots
  {
    name: "Gornergrat Observatory",
    locationKey: "matterhorn",
    description:
      "Reached by Europe's highest open-air cog railway, offering panoramic views of the Matterhorn and surrounding peaks.",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    pointLat: 45.9836,
    pointLng: 7.7856,
    key: "gornergrat",
  },
  {
    name: "Riffelsee Lake",
    locationKey: "matterhorn",
    description:
      "A small alpine lake famous for its perfect reflections of the Matterhorn, best visited in early morning.",
    imageUrl:
      "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800",
    pointLat: 45.9891,
    pointLng: 7.7698,
    key: "riffelsee",
  },

  // Geirangerfjord spots
  {
    name: "Seven Sisters Waterfall",
    locationKey: "geirangerfjord",
    description:
      "A series of seven separate streams that plunge 250 meters down the cliff face into the fjord.",
    imageUrl:
      "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800",
    pointLat: 62.1167,
    pointLng: 7.05,
    key: "seven-sisters",
  },
  {
    name: "Flydalsjuvet Viewpoint",
    locationKey: "geirangerfjord",
    description:
      "A famous viewpoint offering dramatic views of the fjord and cruise ships far below.",
    imageUrl:
      "https://images.unsplash.com/photo-1520769945061-0a448c463865?w=800",
    pointLat: 62.0833,
    pointLng: 7.1,
    key: "flydalsjuvet",
  },

  // Lake Brienz spots
  {
    name: "Giessbach Falls",
    locationKey: "lake-brienz",
    description:
      "A spectacular series of 14 cascades dropping 500 meters through the forest to Lake Brienz.",
    imageUrl:
      "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800",
    pointLat: 46.7333,
    pointLng: 8.0167,
    key: "giessbach-falls",
  },
  {
    name: "Brienz Village",
    locationKey: "lake-brienz",
    description:
      "A charming lakeside village known for traditional woodcarving and the historic Ballenberg open-air museum.",
    imageUrl:
      "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800",
    pointLat: 46.7544,
    pointLng: 8.0372,
    key: "brienz-village",
  },
];

// ============ POSTS ============
export interface CommentSeed {
  postKey: string;
  content: string;
}

export interface MediaSeed {
  postKey: string;
  mediaType: "photo" | "video";
  url: string;
  thumbnailUrl: string;
  displayOrder: number;
}

export interface FavoriteSeed {
  spotKey: string;
}

export const posts: PostSeed[] = [
  // Mount Fuji posts
  {
    title: "Sunrise at Mount Fuji Summit",
    content:
      "Witnessing Goraiko (sunrise) from the summit of Mount Fuji is a life-changing experience. I started my climb from the Fifth Station at 10 PM and reached the summit just before dawn. The sea of clouds below turned golden as the sun emerged. Here are my tips for the climb...",
    locationKey: "mount-fuji",
    spotKey: "fuji-fifth-station",
    postType: "article",
    key: "fuji-sunrise",
  },
  {
    title: "Perfect Fuji Reflection at Kawaguchi",
    content:
      "Captured this stunning reflection of Mount Fuji at Lake Kawaguchi during golden hour. The conditions were perfect - no wind and clear skies.",
    locationKey: "mount-fuji",
    spotKey: "kawaguchi-viewpoint",
    postType: "photo",
    key: "kawaguchi-reflection",
  },
  {
    title: "Cherry Blossoms at Chureito Pagoda",
    content:
      "The iconic view of Mount Fuji framed by cherry blossoms and the Chureito Pagoda. Arrived at 5 AM to avoid crowds and catch the morning light.",
    locationKey: "mount-fuji",
    spotKey: "chureito-pagoda",
    postType: "photo",
    key: "chureito-pagoda",
  },

  // Jade Dragon posts
  {
    title: "Above the Clouds at Jade Dragon",
    content:
      "The cable car ride to Glacier Park was breathtaking. At 4,506 meters, the air is thin but the views are incredible. Make sure to acclimatize properly before visiting.",
    locationKey: "jade-dragon",
    spotKey: "jade-glacier-park",
    postType: "photo",
    key: "jade-glacier",
  },
  {
    title: "Blue Moon Valley Photography Guide",
    content:
      "A comprehensive guide to photographing the stunning turquoise lakes of Blue Moon Valley. Best times, camera settings, and composition tips included.",
    locationKey: "jade-dragon",
    spotKey: "blue-moon-valley",
    postType: "article",
    key: "blue-moon-guide",
  },

  // Matterhorn posts
  {
    title: "Matterhorn at Golden Hour",
    content:
      "The Matterhorn glowing in the evening light as seen from Gornergrat. This is why they call it the most beautiful mountain in the world.",
    locationKey: "matterhorn",
    spotKey: "gornergrat",
    postType: "photo",
    key: "matterhorn-golden",
  },
  {
    title: "Perfect Reflection at Riffelsee",
    content:
      "Woke up at 4 AM to hike to Riffelsee for this mirror-perfect reflection. The early morning effort was absolutely worth it.",
    locationKey: "matterhorn",
    spotKey: "riffelsee",
    postType: "photo",
    key: "riffelsee-reflection",
  },

  // Geirangerfjord posts
  {
    title: "Seven Sisters in Full Flow",
    content:
      "After heavy rainfall, the Seven Sisters waterfall was at its most spectacular. The seven streams merged into a thundering cascade.",
    locationKey: "geirangerfjord",
    spotKey: "seven-sisters",
    postType: "photo",
    key: "seven-sisters",
  },
  {
    title: "Complete Guide to Geirangerfjord",
    content:
      "Everything you need to know about visiting Geirangerfjord - best viewpoints, boat tours, hiking trails, and when to visit. A UNESCO World Heritage Site that deserves at least 2 days of exploration.",
    locationKey: "geirangerfjord",
    spotKey: "flydalsjuvet",
    postType: "article",
    key: "geirangerfjord-guide",
  },

  // Lake Brienz posts
  {
    title: "Giessbach Falls from the Historic Hotel",
    content:
      "Staying at the Grand Hotel Giessbach offers front-row seats to this magnificent waterfall. The funicular ride up is an experience in itself.",
    locationKey: "lake-brienz",
    spotKey: "giessbach-falls",
    postType: "photo",
    key: "giessbach-falls",
  },
  {
    title: "Swiss Village Life in Brienz",
    content:
      "Exploring the traditional woodcarving workshops and lakeside promenades of Brienz village. A perfect day trip from Interlaken.",
    locationKey: "lake-brienz",
    spotKey: "brienz-village",
    postType: "article",
    key: "brienz-village-post",
  },
];

// ============ COMMENTS ============
export const comments: CommentSeed[] = [
  // Mount Fuji comments
  {
    postKey: "fuji-sunrise",
    content:
      "Absolutely breathtaking! The sunrise from the summit is truly a once-in-a-lifetime experience.",
  },
  {
    postKey: "fuji-sunrise",
    content:
      "Great tips! I'm planning my climb for next summer. How crowded was it?",
  },
  {
    postKey: "kawaguchi-reflection",
    content:
      "Perfect timing! The reflection is so clear. What time did you take this shot?",
  },
  {
    postKey: "chureito-pagoda",
    content: "This is the iconic Japan shot! Adding this to my bucket list.",
  },

  // Jade Dragon comments
  {
    postKey: "jade-glacier",
    content: "The altitude really is no joke. Make sure to take it slow!",
  },
  {
    postKey: "blue-moon-guide",
    content: "Very helpful guide! The turquoise color is unreal.",
  },

  // Matterhorn comments
  {
    postKey: "matterhorn-golden",
    content: "The Matterhorn never disappoints. Such a majestic peak!",
  },
  {
    postKey: "riffelsee-reflection",
    content: "Worth the early wake-up call! The reflection is perfect.",
  },

  // Geirangerfjord comments
  {
    postKey: "seven-sisters",
    content: "The waterfalls are incredible after rain. Great capture!",
  },
  {
    postKey: "geirangerfjord-guide",
    content:
      "This guide is super comprehensive. Bookmarked for my Norway trip!",
  },

  // Lake Brienz comments
  {
    postKey: "giessbach-falls",
    content: "The historic hotel looks amazing! Is it expensive to stay there?",
  },
  {
    postKey: "brienz-village-post",
    content: "Swiss villages are so charming. Love the woodcarving tradition!",
  },
];

// ============ MEDIA ============
// Using high-quality Unsplash images for each location
export const media: MediaSeed[] = [
  // Mount Fuji media
  {
    postKey: "fuji-sunrise",
    mediaType: "photo",
    url: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1200",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400",
    displayOrder: 0,
  },
  {
    postKey: "fuji-sunrise",
    mediaType: "photo",
    url: "https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=1200",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=400",
    displayOrder: 1,
  },
  {
    postKey: "kawaguchi-reflection",
    mediaType: "photo",
    url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400",
    displayOrder: 0,
  },
  {
    postKey: "chureito-pagoda",
    mediaType: "photo",
    url: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=1200",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400",
    displayOrder: 0,
  },
  {
    postKey: "chureito-pagoda",
    mediaType: "photo",
    url: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=1200",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=400",
    displayOrder: 1,
  },

  // Jade Dragon media
  {
    postKey: "jade-glacier",
    mediaType: "photo",
    url: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400",
    displayOrder: 0,
  },
  {
    postKey: "blue-moon-guide",
    mediaType: "photo",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
    displayOrder: 0,
  },

  // Matterhorn media
  {
    postKey: "matterhorn-golden",
    mediaType: "photo",
    url: "https://images.unsplash.com/photo-1531210483974-4f8205670c70?w=1200",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1531210483974-4f8205670c70?w=400",
    displayOrder: 0,
  },
  {
    postKey: "matterhorn-golden",
    mediaType: "photo",
    url: "https://images.unsplash.com/photo-1473654729523-203e25dfda10?w=1200",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1473654729523-203e25dfda10?w=400",
    displayOrder: 1,
  },
  {
    postKey: "riffelsee-reflection",
    mediaType: "photo",
    url: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=1200",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=400",
    displayOrder: 0,
  },

  // Geirangerfjord media
  {
    postKey: "seven-sisters",
    mediaType: "photo",
    url: "https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?w=1200",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?w=400",
    displayOrder: 0,
  },
  {
    postKey: "seven-sisters",
    mediaType: "photo",
    url: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1200",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400",
    displayOrder: 1,
  },
  {
    postKey: "geirangerfjord-guide",
    mediaType: "photo",
    url: "https://images.unsplash.com/photo-1520769945061-0a448c463865?w=1200",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1520769945061-0a448c463865?w=400",
    displayOrder: 0,
  },

  // Lake Brienz media
  {
    postKey: "giessbach-falls",
    mediaType: "photo",
    url: "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=1200",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=400",
    displayOrder: 0,
  },
  {
    postKey: "giessbach-falls",
    mediaType: "photo",
    url: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=400",
    displayOrder: 1,
  },
  {
    postKey: "brienz-village-post",
    mediaType: "photo",
    url: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=400",
    displayOrder: 0,
  },
];

// ============ FAVORITES ============
// Favorite some spots
export const favorites: FavoriteSeed[] = [
  { spotKey: "fuji-fifth-station" },
  { spotKey: "chureito-pagoda" },
  { spotKey: "gornergrat" },
  { spotKey: "seven-sisters" },
  { spotKey: "giessbach-falls" },
  { spotKey: "blue-moon-valley" },
];
