const commonsFileUrl = (fileName: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;

export interface RegionSeed {
  key: string;
  nameLocal: string;
  nameEn: string;
  level: number;
  parentKey?: string;
}

export interface CountrySeed {
  key: string;
  name: string;
}

export interface LocationSeed {
  key: string;
  name: string;
  regionKey: string;
  category: string;
  description: string;
  keyPoints: string[];
  coverUrl: string;
  centerLat: number;
  centerLng: number;
}

export interface SpotSeed {
  key: string;
  name: string;
  locationKey: string;
  description: string;
  imageUrl: string;
  pointLat: number;
  pointLng: number;
}

export interface PostSeed {
  key: string;
  title: string;
  content: string;
  locationKey: string;
  spotKey: string;
  postType: "photo" | "article";
}

export interface MediaSeed {
  postKey: string;
  mediaType: "photo";
  url: string;
  thumbnailUrl: string;
  displayOrder: number;
  fileName: string;
}

interface SpotCatalogEntry {
  key: string;
  name: string;
  description: string;
  pointLat: number;
  pointLng: number;
  imageFileName: string;
}

interface PostCatalogEntry {
  key: string;
  title: string;
  content: string;
  spotKey: string;
  postType: "photo" | "article";
  mediaFileName: string;
}

interface LocationCatalogEntry {
  key: string;
  name: string;
  category: string;
  description: string;
  keyPoints: string[];
  centerLat: number;
  centerLng: number;
  coverFileName?: string;
  spots: SpotCatalogEntry[];
  posts: PostCatalogEntry[];
}

interface CountryCatalogEntry {
  key: string;
  name: string;
  locations: LocationCatalogEntry[];
}

interface TopRegionCatalogEntry {
  key: string;
  name: string;
  countries: CountryCatalogEntry[];
}

export const seedCatalog: TopRegionCatalogEntry[] = [
  {
    key: "east-asia",
    name: "East Asia",
    countries: [
      {
        key: "japan",
        name: "Japan",
        locations: [
          {
            key: "mount-fuji",
            name: "Mount Fuji",
            category: "mountain",
            description:
              "Mount Fuji is Japan's highest mountain at 3,776 metres and a UNESCO World Heritage site. The volcanic cone anchors the Fuji Five Lakes region and is one of the country's most recognizable natural landmarks.",
            keyPoints: [
              "Best hiking season is early July through early September.",
              "Clear dawn views are most reliable in autumn and winter.",
              "Popular viewpoints cluster around Fujiyoshida and Lake Kawaguchi.",
            ],
            centerLat: 35.3606,
            centerLng: 138.7274,
            spots: [
              {
                key: "chureito-pagoda",
                name: "Chureito Pagoda",
                description:
                  "Chureito Pagoda in Arakurayama Sengen Park is the classic postcard viewpoint pairing Mount Fuji with a five-storied pagoda and seasonal cherry blossoms.",
                pointLat: 35.5003,
                pointLng: 138.7996,
                imageFileName: "Chureito Pagoda.jpg",
              },
              {
                key: "lake-kawaguchi",
                name: "Lake Kawaguchi",
                description:
                  "Lake Kawaguchi is the most accessible of the Fuji Five Lakes and is especially famous for calm-water reflections of Mount Fuji.",
                pointLat: 35.5172,
                pointLng: 138.7519,
                imageFileName: "Lake Kawaguchi (Kawaguchi-ko).jpg",
              },
            ],
            posts: [
              {
                key: "mount-fuji-sunrise-framing",
                title: "Why Chureito Pagoda Still Delivers the Best Fuji Framing",
                content:
                  "I arrived before sunrise at Arakurayama Sengen Park and the climb paid off. Chureito Pagoda gives a layered composition that feels distinctly Japanese: pagoda in the foreground, Fujiyoshida below, and Mount Fuji rising behind everything. Morning light works best because the mountain face stays crisp before haze builds over the basin.",
                spotKey: "chureito-pagoda",
                postType: "article",
                mediaFileName: "Chureito Pagoda.jpg",
              },
              {
                key: "mount-fuji-kawaguchi-reflection",
                title: "Calm Water and Clear Air at Lake Kawaguchi",
                content:
                  "Lake Kawaguchi was glassy just after dawn, which made the reflection almost as memorable as the mountain itself. The shoreline viewpoints are easy to access, but the best images came when the breeze dropped completely and the snow line on Fuji stayed sharply visible above the lake.",
                spotKey: "lake-kawaguchi",
                postType: "photo",
                mediaFileName: "Lake Kawaguchi (Kawaguchi-ko).jpg",
              },
            ],
          },
        ],
      },
      {
        key: "china",
        name: "China",
        locations: [
          {
            key: "zhangjiajie-national-forest-park",
            name: "Zhangjiajie National Forest Park",
            category: "national-park",
            description:
              "Zhangjiajie National Forest Park in Hunan is part of the larger Wulingyuan Scenic Area, known for thousands of quartz-sandstone pillars that rise above forested ravines and misty valleys.",
            keyPoints: [
              "Cable cars and elevators connect the major scenic plateaus.",
              "Mist and low cloud often create the area's most dramatic views.",
              "Tianzi Mountain and Yuanjiajie are two signature pillar-view zones.",
            ],
            centerLat: 29.324,
            centerLng: 110.401,
            spots: [
              {
                key: "tianzi-mountain",
                name: "Tianzi Mountain",
                description:
                  "Tianzi Mountain is one of the highest scenic platforms in Wulingyuan and is celebrated for elevated views across pillar formations and drifting cloud.",
                pointLat: 29.3433,
                pointLng: 110.4306,
                imageFileName:
                  "Tianzi Mountain(天子山）from the top of the cable car.jpg",
              },
              {
                key: "yuanjiajie",
                name: "Yuanjiajie",
                description:
                  "Yuanjiajie is a cliff-top scenic area famous for pillar clusters and bridges of rock, including formations that helped popularize Zhangjiajie's 'Avatar mountain' nickname.",
                pointLat: 29.3422,
                pointLng: 110.4475,
                imageFileName:
                  "Stunning rock formations from the top of Bailong (白龙), in the Yuanjiajie （袁家界）scenic area.jpg",
              },
            ],
            posts: [
              {
                key: "zhangjiajie-tianzi-clouds",
                title: "Tianzi Mountain Looks Best When the Forecast Is Slightly Bad",
                content:
                  "Clear skies are nice, but Tianzi Mountain becomes unforgettable when thin fog starts moving between the sandstone pillars. The platform views constantly change shape as the clouds lift and settle, which is exactly what makes this section of Zhangjiajie feel so cinematic.",
                spotKey: "tianzi-mountain",
                postType: "article",
                mediaFileName:
                  "Tianzi Mountain(天子山）from the top of the cable car.jpg",
              },
              {
                key: "zhangjiajie-yuanjiajie-pillars",
                title: "Pillar Lines and Vertical Drops in Yuanjiajie",
                content:
                  "Yuanjiajie is where the scale of Wulingyuan really clicks. Standing near the cliff edge, the stone pillars appear in layers and the drop-offs make the whole plateau feel suspended above the valley floor.",
                spotKey: "yuanjiajie",
                postType: "photo",
                mediaFileName:
                  "Stunning rock formations from the top of Bailong (白龙), in the Yuanjiajie （袁家界）scenic area.jpg",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "southeast-asia",
    name: "Southeast Asia",
    countries: [
      {
        key: "cambodia",
        name: "Cambodia",
        locations: [
          {
            key: "angkor-wat",
            name: "Angkor Wat",
            category: "temple-complex",
            description:
              "Angkor Wat is the best-preserved temple of the Angkor complex and the largest religious monument in the world. Built in the 12th century, it remains the defining landmark of Cambodia.",
            keyPoints: [
              "Sunrise crowds gather at the western entrance and reflecting pools.",
              "The central temple, galleries, and causeways reward slow visits.",
              "Nearby Angkor Thom and Bayon pair naturally with an Angkor Wat day.",
            ],
            centerLat: 13.4125,
            centerLng: 103.867,
            spots: [
              {
                key: "angkor-wat-causeway",
                name: "Angkor Wat Causeway",
                description:
                  "The sandstone causeway is the ceremonial approach to Angkor Wat and one of the best places to appreciate the scale of the moat, towers, and outer enclosure.",
                pointLat: 13.4126,
                pointLng: 103.8606,
                imageFileName: "Angkor Wat from causeway.jpg",
              },
              {
                key: "bayon-temple",
                name: "Bayon Temple",
                description:
                  "Bayon stands at the heart of Angkor Thom and is famous for its serene carved stone faces rising from multiple towers.",
                pointLat: 13.4412,
                pointLng: 103.8596,
                imageFileName: "Bayon temple (47).jpg",
              },
            ],
            posts: [
              {
                key: "angkor-causeway-approach",
                title: "The Causeway Makes Angkor Wat Feel Monumental Before You Even Enter",
                content:
                  "Walking the main causeway changes the pace of the visit. The moat, long balustrades, and perfectly aligned towers make the approach feel ceremonial, which helps explain why Angkor Wat still feels overwhelming even after years of seeing it in photos.",
                spotKey: "angkor-wat-causeway",
                postType: "article",
                mediaFileName: "Angkor Wat from causeway.jpg",
              },
              {
                key: "bayon-faces-close-up",
                title: "Bayon Temple's Stone Faces Hold Up at Every Distance",
                content:
                  "Bayon works both as a grand silhouette and in close detail. As I moved through the galleries, different towers lined up and the face carvings kept appearing from new angles, which makes this temple feel more intimate than Angkor Wat despite its scale.",
                spotKey: "bayon-temple",
                postType: "photo",
                mediaFileName: "Bayon temple (47).jpg",
              },
            ],
          },
        ],
      },
      {
        key: "vietnam",
        name: "Vietnam",
        locations: [
          {
            key: "ha-long-bay",
            name: "Ha Long Bay",
            category: "bay",
            description:
              "Ha Long Bay is a UNESCO World Heritage seascape of limestone towers, sheltered coves, and floating fishing communities in Quang Ninh province, northeastern Vietnam.",
            keyPoints: [
              "Boat routes usually combine caves, lookouts, and swimming stops.",
              "Sung Sot Cave is one of the bay's busiest but most dramatic caverns.",
              "Ti Top Island provides one of the easiest elevated bay panoramas.",
            ],
            centerLat: 20.9101,
            centerLng: 107.1839,
            spots: [
              {
                key: "sung-sot-cave",
                name: "Sung Sot Cave",
                description:
                  "Sung Sot Cave, also called Surprise Cave, is one of Ha Long Bay's best-known limestone caverns, with large chambers and elevated openings back toward the bay.",
                pointLat: 20.8444,
                pointLng: 107.0914,
                imageFileName:
                  "Sung Sot Cave, Ha Long Bay, northern Vietnam (13) (38489285896).jpg",
              },
              {
                key: "ti-top-island",
                name: "Ti Top Island",
                description:
                  "Ti Top Island is a popular stop for its small beach and short but steep staircase to a panoramic summit over central Ha Long Bay.",
                pointLat: 20.8581,
                pointLng: 107.081,
                imageFileName: "Ti Top Island.jpg",
              },
            ],
            posts: [
              {
                key: "ha-long-sung-sot-scale",
                title: "Sung Sot Cave Is Crowded for a Reason",
                content:
                  "Sung Sot Cave is firmly on the classic cruise circuit, but the scale inside is impressive enough to justify the crowds. The lighting can be theatrical, yet the real highlight for me was the view looking back out toward the karst towers after leaving the main chamber.",
                spotKey: "sung-sot-cave",
                postType: "article",
                mediaFileName:
                  "Sung Sot Cave, Ha Long Bay, northern Vietnam (13) (38489285896).jpg",
              },
              {
                key: "ha-long-ti-top-lookout",
                title: "Ti Top Island Gives You the Quickest Big View in the Bay",
                content:
                  "The staircase on Ti Top Island is short enough to fit into almost any cruise stop, and the summit delivers an excellent overview of anchored boats and limestone stacks. It is one of the easiest ways to understand the layout of the bay from above.",
                spotKey: "ti-top-island",
                postType: "photo",
                mediaFileName: "Ti Top Island.jpg",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "africa",
    name: "Africa",
    countries: [
      {
        key: "tanzania",
        name: "Tanzania",
        locations: [
          {
            key: "serengeti-national-park",
            name: "Serengeti National Park",
            category: "safari",
            description:
              "Serengeti National Park is one of Africa's best-known wildlife reserves, spanning grassland plains, river corridors, and kopjes across northern Tanzania.",
            keyPoints: [
              "The Seronera area is productive year-round for predator sightings.",
              "Water sources like hippo pools concentrate wildlife during the day.",
              "Light changes quickly, so game drives reward early starts and late finishes.",
            ],
            centerLat: -2.3333,
            centerLng: 34.8333,
            spots: [
              {
                key: "seronera-valley",
                name: "Seronera Valley",
                description:
                  "Seronera Valley is the park's central wildlife hub, combining open savannah, riverine vegetation, and frequent sightings of big cats and large herbivores.",
                pointLat: -2.45,
                pointLng: 34.8333,
                imageFileName:
                  "Zebras, Seronera Valley, Serengeti, Tanzania.jpg",
              },
              {
                key: "retima-hippo-pool",
                name: "Retima Hippo Pool",
                description:
                  "Retima Hippo Pool is a reliable viewing stop where dozens of hippos gather in the Seronera River system, often alongside birds and other nearby wildlife.",
                pointLat: -2.4368,
                pointLng: 34.8225,
                imageFileName:
                  "Hippopotamus, Seronera Valley, Serengeti, Tanzania.jpg",
              },
            ],
            posts: [
              {
                key: "serengeti-seronera-morning",
                title: "Seronera Valley Feels Different Every Hour",
                content:
                  "Seronera Valley was most active just after sunrise, when zebra groups moved through the grass and the low light stretched the acacia silhouettes across the plain. Even within a small radius, the mix of open country and river cover made the valley feel constantly alive.",
                spotKey: "seronera-valley",
                postType: "article",
                mediaFileName:
                  "Zebras, Seronera Valley, Serengeti, Tanzania.jpg",
              },
              {
                key: "serengeti-hippo-pool-noise",
                title: "Retima Hippo Pool Is a Wildlife Stop You Hear Before You See",
                content:
                  "The sound came first: grunts, splashes, and the constant churn of water in the pool. Retima is not a wide-open vista like the plains, but it gives a very different side of the Serengeti and makes a great contrast to the surrounding grassland drives.",
                spotKey: "retima-hippo-pool",
                postType: "photo",
                mediaFileName:
                  "Hippopotamus, Seronera Valley, Serengeti, Tanzania.jpg",
              },
            ],
          },
        ],
      },
      {
        key: "south-africa",
        name: "South Africa",
        locations: [
          {
            key: "table-mountain",
            name: "Table Mountain",
            category: "mountain",
            description:
              "Table Mountain dominates Cape Town with its flat summit plateau, cliff faces, and network of walking routes inside Table Mountain National Park.",
            keyPoints: [
              "The cableway is fast, but hiking routes show the mountain's terrain best.",
              "Cloud cover can roll over the summit quickly even on clear city mornings.",
              "Platteklip Gorge is the most direct summit route from the city side.",
            ],
            centerLat: -33.9628,
            centerLng: 18.4098,
            spots: [
              {
                key: "platteklip-gorge",
                name: "Platteklip Gorge",
                description:
                  "Platteklip Gorge is the classic steep ascent to Table Mountain's upper plateau, cutting through the front face of the mountain above Cape Town.",
                pointLat: -33.9589,
                pointLng: 18.4148,
                imageFileName: "Platteklip Gorge path with proteas.jpg",
              },
              {
                key: "maclears-beacon",
                name: "Maclear's Beacon",
                description:
                  "Maclear's Beacon is the stone cairn on Table Mountain's highest point, built as a survey marker in the 19th century.",
                pointLat: -33.9669,
                pointLng: 18.4256,
                imageFileName: "MBea.jpg",
              },
            ],
            posts: [
              {
                key: "table-mountain-gorge-climb",
                title: "Platteklip Gorge Is Direct, Honest, and Steeper Than It Looks",
                content:
                  "Platteklip Gorge wastes no time. The trail rises hard from the lower slopes and gives broad city views whenever you turn around. It is the most straightforward route to explain, but it still feels like a real mountain climb rather than a casual walk.",
                spotKey: "platteklip-gorge",
                postType: "article",
                mediaFileName: "Platteklip Gorge path with proteas.jpg",
              },
              {
                key: "table-mountain-highest-point",
                title: "Maclear's Beacon Adds Context to the Flat Summit",
                content:
                  "Reaching Maclear's Beacon helped me understand how large the top of Table Mountain really is. The summit is not a single lookout but a wide plateau, and the beacon marks the point where the landmark becomes a place you can actually traverse.",
                spotKey: "maclears-beacon",
                postType: "photo",
                mediaFileName: "MBea.jpg",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "oceania",
    name: "Oceania",
    countries: [
      {
        key: "new-zealand",
        name: "New Zealand",
        locations: [
          {
            key: "milford-sound",
            name: "Milford Sound / Piopiotahi",
            category: "fjord",
            description:
              "Milford Sound / Piopiotahi is the best-known fiord in Fiordland National Park, with sheer cliffs, rainforest, hanging valleys, and major waterfalls dropping straight into the water.",
            keyPoints: [
              "Rain intensifies the waterfall network and changes the scenery completely.",
              "Boat cruises provide the best access to waterfall faces and cliff walls.",
              "Mitre Peak is the most recognizable mountain profile in the fiord.",
            ],
            centerLat: -44.6718,
            centerLng: 167.925,
            spots: [
              {
                key: "mitre-peak",
                name: "Mitre Peak",
                description:
                  "Mitre Peak rises directly from Milford Sound and is one of New Zealand's most iconic mountain silhouettes.",
                pointLat: -44.6538,
                pointLng: 167.8873,
                imageFileName: "Milford Sound - Mitre Peak.jpg",
              },
              {
                key: "stirling-falls",
                name: "Stirling Falls",
                description:
                  "Stirling Falls drops about 155 metres into Milford Sound and is one of the fiord's signature waterfalls on cruise routes.",
                pointLat: -44.61,
                pointLng: 167.8706,
                imageFileName:
                  "Cascada Stirling, Milford Sound-Nueva Zelanda07.jpg",
              },
            ],
            posts: [
              {
                key: "milford-mitre-peak-scale",
                title: "Mitre Peak Sets the Scale for Everything in Milford Sound",
                content:
                  "Mitre Peak makes every boat, cliff, and waterfall around it look smaller than expected. Once the clouds began to lift, the mountain shape anchored the entire fiord and made the cruise route feel much more dramatic than the map suggested.",
                spotKey: "mitre-peak",
                postType: "article",
                mediaFileName: "Milford Sound - Mitre Peak.jpg",
              },
              {
                key: "milford-stirling-close-pass",
                title: "Cruising Near Stirling Falls Feels Like Entering the Spray",
                content:
                  "The approach to Stirling Falls is one of the best moments on the water. From a distance it reads as a thin white line, but close up the volume and wind-blown spray make it feel much more powerful than photos usually show.",
                spotKey: "stirling-falls",
                postType: "photo",
                mediaFileName:
                  "Cascada Stirling, Milford Sound-Nueva Zelanda07.jpg",
              },
            ],
          },
        ],
      },
      {
        key: "australia",
        name: "Australia",
        locations: [
          {
            key: "great-barrier-reef",
            name: "Great Barrier Reef",
            category: "reef",
            description:
              "The Great Barrier Reef is the world's largest coral reef system, stretching along Queensland's coast and encompassing coral cays, lagoons, and outer reef sites.",
            keyPoints: [
              "Scenic flights reveal reef patterns that are impossible to see from boats.",
              "The Whitsundays combine reef viewpoints with world-class beaches.",
              "Heart Reef and Whitehaven Beach are two of the region's most recognizable icons.",
            ],
            centerLat: -18.2871,
            centerLng: 147.6992,
            spots: [
              {
                key: "heart-reef",
                name: "Heart Reef",
                description:
                  "Heart Reef is a naturally heart-shaped coral formation in Hardy Reef, best seen from the air in the Whitsundays.",
                pointLat: -19.7736,
                pointLng: 149.247,
                imageFileName: "Heart Reef and Lagoon Great Barrier Reef.jpg",
              },
              {
                key: "whitehaven-beach",
                name: "Whitehaven Beach",
                description:
                  "Whitehaven Beach on Whitsunday Island is known for bright silica sand, shifting tidal patterns, and turquoise water.",
                pointLat: -20.282,
                pointLng: 149.0381,
                imageFileName: "Whitehaven Beach - Northern End.jpg",
              },
            ],
            posts: [
              {
                key: "gbr-heart-reef-flight",
                title: "Heart Reef Makes the Scenic Flight Worth It",
                content:
                  "Heart Reef is one of those places where the aerial perspective is the attraction. The coral outline only really resolves from above, and the surrounding lagoon colours explain why the Whitsundays are so strongly associated with scenic flights.",
                spotKey: "heart-reef",
                postType: "article",
                mediaFileName: "Heart Reef and Lagoon Great Barrier Reef.jpg",
              },
              {
                key: "gbr-whitehaven-tidal-lines",
                title: "Whitehaven Beach Is All About Sand Texture and Tidal Colour",
                content:
                  "Whitehaven Beach looked different from every angle: bright sand from the lookout, deeper blue water from the shoreline, and constantly shifting lines where the tide braided through the northern inlet. It is easy to see why this beach appears in so many Australian destination campaigns.",
                spotKey: "whitehaven-beach",
                postType: "photo",
                mediaFileName: "Whitehaven Beach - Northern End.jpg",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "central-asia",
    name: "Central Asia",
    countries: [
      {
        key: "kazakhstan",
        name: "Kazakhstan",
        locations: [
          {
            key: "charyn-canyon",
            name: "Charyn Canyon",
            category: "canyon",
            description:
              "Charyn Canyon in southeastern Kazakhstan is a deeply eroded river canyon famous for red rock towers and branching ravines within Charyn National Park.",
            keyPoints: [
              "The Valley of Castles is the park's best-known accessible section.",
              "Road conditions and shade can change the pace of desert hiking quickly.",
              "Temirlik Canyon offers a quieter and greener contrast within the wider system.",
            ],
            centerLat: 43.3503,
            centerLng: 79.0833,
            spots: [
              {
                key: "valley-of-castles",
                name: "Valley of Castles",
                description:
                  "The Valley of Castles is the signature section of Charyn Canyon, where erosion has produced tall red formations resembling fortress walls and towers.",
                pointLat: 43.3511,
                pointLng: 79.0797,
                imageFileName: "Charyn Canyon (3991842679).jpg",
              },
              {
                key: "temirlik-canyon",
                name: "Temirlik Canyon",
                description:
                  "Temirlik Canyon is a narrower side canyon within Charyn National Park, known for high walls, a quieter atmosphere, and greener vegetation along the river corridor.",
                pointLat: 43.2594,
                pointLng: 79.28,
                imageFileName: "KZ Temirlik Canyon.jpg",
              },
            ],
            posts: [
              {
                key: "charyn-castles-light",
                title: "The Valley of Castles Changes Colour by the Hour",
                content:
                  "The red walls in the Valley of Castles looked muted at midday but gained much more depth later in the afternoon. The scale is also deceptive until you start walking between the rock towers and realize how high the canyon walls actually rise around the trail.",
                spotKey: "valley-of-castles",
                postType: "article",
                mediaFileName: "Charyn Canyon (3991842679).jpg",
              },
              {
                key: "charyn-temirlik-contrast",
                title: "Temirlik Canyon Feels Like a Different Park",
                content:
                  "Temirlik Canyon was quieter and more enclosed than the Valley of Castles, with a very different mix of shadow, vegetation, and river-carved walls. It makes a strong second stop if you want more than the headline viewpoint in Charyn.",
                spotKey: "temirlik-canyon",
                postType: "photo",
                mediaFileName: "KZ Temirlik Canyon.jpg",
              },
            ],
          },
        ],
      },
      {
        key: "kyrgyzstan",
        name: "Kyrgyzstan",
        locations: [
          {
            key: "issyk-kul",
            name: "Issyk-Kul",
            category: "lake",
            description:
              "Issyk-Kul is a large alpine lake ringed by the Tian Shan mountains in eastern Kyrgyzstan. The surrounding region mixes red rock formations, hot springs, beaches, and high-altitude scenery.",
            keyPoints: [
              "The southern shore is less developed and stronger for landscape stops.",
              "Jeti-Oguz and Skazka are two of the area's best-known red rock sites.",
              "Mountain weather can change rapidly even near the lakeshore.",
            ],
            centerLat: 42.425,
            centerLng: 77.25,
            spots: [
              {
                key: "jeti-oguz-rocks",
                name: "Jeti-Oguz Rocks",
                description:
                  "Jeti-Oguz is a red sandstone ridge whose name means 'Seven Bulls', one of the best-known landmark formations east of Issyk-Kul.",
                pointLat: 42.3693,
                pointLng: 78.219,
                imageFileName: "Jeti-Oguz.jpg",
              },
              {
                key: "skazka-canyon",
                name: "Skazka Canyon",
                description:
                  "Skazka Canyon, also called Fairytale Canyon, is a maze of colourful eroded ridges and gullies on the south shore of Issyk-Kul.",
                pointLat: 42.1581,
                pointLng: 77.3082,
                imageFileName:
                  "Skazka Canyon, Kyrgyzstan (44623799891).jpg",
              },
            ],
            posts: [
              {
                key: "issyk-kul-jeti-oguz-shape",
                title: "Jeti-Oguz Is Even More Striking Than the Postcards Suggest",
                content:
                  "The rock colour at Jeti-Oguz is the first thing that stands out, but the shape of the ridge is what keeps your eye moving. The formation is simple to access, and the contrast between the red cliffs and surrounding greenery makes it one of the most photogenic stops around Issyk-Kul.",
                spotKey: "jeti-oguz-rocks",
                postType: "article",
                mediaFileName: "Jeti-Oguz.jpg",
              },
              {
                key: "issyk-kul-skazka-ridges",
                title: "Skazka Canyon Rewards Slow Wandering",
                content:
                  "Skazka Canyon is best experienced by moving through the ridges rather than rushing to a single viewpoint. The shapes keep changing with each short climb, and the soft red and ochre bands make the whole place look sculpted rather than merely eroded.",
                spotKey: "skazka-canyon",
                postType: "photo",
                mediaFileName:
                  "Skazka Canyon, Kyrgyzstan (44623799891).jpg",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "southern-europe",
    name: "Southern Europe",
    countries: [
      {
        key: "italy",
        name: "Italy",
        locations: [
          {
            key: "amalfi-coast",
            name: "Amalfi Coast",
            category: "coast",
            description:
              "The Amalfi Coast is a UNESCO-listed stretch of steep shoreline in Campania, known for cliffside towns, sea views, and historic footpaths connecting the mountains above the coast.",
            keyPoints: [
              "Travel times can be slow because roads are narrow and busy.",
              "Positano is the coast's most instantly recognizable townscape.",
              "The Path of the Gods offers some of the best elevated coastal views.",
            ],
            centerLat: 40.6333,
            centerLng: 14.6029,
            spots: [
              {
                key: "positano",
                name: "Positano",
                description:
                  "Positano is the Amalfi Coast's most famous vertical town, with pastel buildings stacked above the beach and church dome.",
                pointLat: 40.6281,
                pointLng: 14.4849,
                imageFileName: "Positano (1).jpg",
              },
              {
                key: "path-of-the-gods",
                name: "Path of the Gods",
                description:
                  "The Path of the Gods is a scenic hiking route between Bomerano and Nocelle, tracing cliffs and terraces high above the Amalfi Coast.",
                pointLat: 40.6212,
                pointLng: 14.5223,
                imageFileName: "Il Sentiero degli dei.jpg",
              },
            ],
            posts: [
              {
                key: "amalfi-positano-layers",
                title: "Positano Works Best From the Waterline and From Above",
                content:
                  "Positano looks compact on the map, but from the shore you can see how deeply it climbs the hillside. The layered streets, church dome, and vertical layout make it one of the few places on the Amalfi Coast that feels instantly recognizable from almost any angle.",
                spotKey: "positano",
                postType: "article",
                mediaFileName: "Positano (1).jpg",
              },
              {
                key: "amalfi-path-of-the-gods",
                title: "The Path of the Gods Gives the Coast Its Best Perspective",
                content:
                  "From the Path of the Gods, the Amalfi Coast stops feeling like a string of towns and starts reading as a whole landscape. The trail mixes limestone cliffs, terraces, and long sea views, which is why it remains one of the region's signature hikes.",
                spotKey: "path-of-the-gods",
                postType: "photo",
                mediaFileName: "Il Sentiero degli dei.jpg",
              },
            ],
          },
        ],
      },
      {
        key: "spain",
        name: "Spain",
        locations: [
          {
            key: "alhambra",
            name: "Alhambra",
            category: "palace-complex",
            description:
              "The Alhambra in Granada is a Nasrid palace and fortress complex renowned for Islamic architecture, courtyards, carved stucco, gardens, and mountain-backed views over Andalusia.",
            keyPoints: [
              "Timed entry management means planning ahead matters.",
              "The Court of the Lions is the most famous interior courtyard.",
              "Generalife gardens add a quieter, greener counterpoint to the palaces.",
            ],
            centerLat: 37.1761,
            centerLng: -3.5881,
            spots: [
              {
                key: "court-of-the-lions",
                name: "Court of the Lions",
                description:
                  "The Court of the Lions is the Alhambra's best-known courtyard, framed by slender columns and centered on the historic fountain supported by carved lions.",
                pointLat: 37.1765,
                pointLng: -3.589,
                imageFileName: "Court of the lions .jpg",
              },
              {
                key: "generalife",
                name: "Generalife",
                description:
                  "The Generalife served as the Nasrid rulers' summer palace and gardens, balancing water channels, plantings, terraces, and elevated views.",
                pointLat: 37.1803,
                pointLng: -3.5913,
                imageFileName: "Palacio Generalife.jpg",
              },
            ],
            posts: [
              {
                key: "alhambra-court-proportions",
                title: "The Court of the Lions Feels Precise From Every Angle",
                content:
                  "The Court of the Lions is one of those spaces where proportion does most of the work. The rhythm of the arcades, the marble paving, and the fountain geometry all pull attention inward, which makes the courtyard feel calm even when the complex is busy.",
                spotKey: "court-of-the-lions",
                postType: "article",
                mediaFileName: "Court of the lions .jpg",
              },
              {
                key: "alhambra-generalife-gardens",
                title: "Generalife Adds Air and Water to the Alhambra Visit",
                content:
                  "After the denser palace interiors, Generalife feels open and restorative. The garden terraces and water channels create a different rhythm, and the elevated setting gives you a clearer sense of how the entire Alhambra sits above Granada.",
                spotKey: "generalife",
                postType: "photo",
                mediaFileName: "Palacio Generalife.jpg",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "northern-europe",
    name: "Northern Europe",
    countries: [
      {
        key: "norway",
        name: "Norway",
        locations: [
          {
            key: "geirangerfjord",
            name: "Geirangerfjord",
            category: "fjord",
            description:
              "Geirangerfjord is a UNESCO-listed fjord in western Norway, known for steep mountain walls, cruise traffic, farm ledges, and powerful waterfalls.",
            keyPoints: [
              "Lookout points change dramatically with cloud cover and season.",
              "Boat views are best for the classic waterfall walls.",
              "Flydalsjuvet is one of the fjord's signature elevated viewpoints.",
            ],
            centerLat: 62.1048,
            centerLng: 7.0942,
            spots: [
              {
                key: "flydalsjuvet",
                name: "Flydalsjuvet",
                description:
                  "Flydalsjuvet is one of the best-known roadside viewpoints above Geiranger, offering a wide look down the fjord toward the village and cruise ships.",
                pointLat: 62.095,
                pointLng: 7.205,
                imageFileName: "Flydalsjuvet Geiranger.jpg",
              },
              {
                key: "seven-sisters-waterfall",
                name: "Seven Sisters Waterfall",
                description:
                  "The Seven Sisters is a famous set of parallel falls dropping down the fjord wall opposite the abandoned Knivsflå farm.",
                pointLat: 62.1077,
                pointLng: 7.0949,
                imageFileName:
                  "Seven Sisters Waterfall - Geirangerfjord, Norway - panoramio.jpg",
              },
            ],
            posts: [
              {
                key: "geiranger-flydalsjuvet-overview",
                title: "Flydalsjuvet Explains the Geometry of Geirangerfjord",
                content:
                  "Flydalsjuvet is where the whole landscape lines up: village, ships, water, and the steep walls closing around the fjord. It is an easy place to linger because every passing cloud changes the contrast between rock, water, and snow patches.",
                spotKey: "flydalsjuvet",
                postType: "article",
                mediaFileName: "Flydalsjuvet Geiranger.jpg",
              },
              {
                key: "geiranger-seven-sisters-flow",
                title: "The Seven Sisters Are Best Seen From the Water",
                content:
                  "From shore the falls are part of the scenery, but from a boat their height becomes much more obvious. The separate streams read clearly against the rock face and make the middle section of the fjord feel especially vertical.",
                spotKey: "seven-sisters-waterfall",
                postType: "photo",
                mediaFileName:
                  "Seven Sisters Waterfall - Geirangerfjord, Norway - panoramio.jpg",
              },
            ],
          },
        ],
      },
      {
        key: "iceland",
        name: "Iceland",
        locations: [
          {
            key: "thingvellir-national-park",
            name: "Thingvellir National Park",
            category: "national-park",
            description:
              "Thingvellir National Park is one of Iceland's most important historic and geologic sites, combining the Alþing assembly plain with visible rift structures between tectonic plates.",
            keyPoints: [
              "The park combines heritage history with accessible geology.",
              "Walking routes connect the main rift, church area, and waterfall.",
              "Almannagjá and Öxarárfoss are two of the easiest signature stops.",
            ],
            centerLat: 64.2559,
            centerLng: -21.1297,
            spots: [
              {
                key: "almannagja",
                name: "Almannagjá",
                description:
                  "Almannagjá is the great faulted rift valley cutting through Thingvellir, marking the visible edge of the North American tectonic plate.",
                pointLat: 64.2551,
                pointLng: -21.1296,
                imageFileName:
                  "Almannagjá, Þingvellir National Park (Iceland).jpg",
              },
              {
                key: "oxararfoss",
                name: "Öxarárfoss",
                description:
                  "Öxarárfoss is the park's best-known waterfall, spilling over dark volcanic rock into the Almannagjá fault system.",
                pointLat: 64.2658,
                pointLng: -21.1179,
                imageFileName:
                  "Öxarárfoss, Þingvellir National Park, Iceland, 20230502 0950 4138.jpg",
              },
            ],
            posts: [
              {
                key: "thingvellir-rift-walk",
                title: "Walking Through Almannagjá Makes the Plate Boundary Feel Real",
                content:
                  "Almannagjá is not just a viewpoint; it is a corridor you move through. The cliff walls, fractured lava, and open plain beyond make the tectonic story easy to read even if you arrive with zero geology background.",
                spotKey: "almannagja",
                postType: "article",
                mediaFileName:
                  "Almannagjá, Þingvellir National Park (Iceland).jpg",
              },
              {
                key: "thingvellir-oxararfoss-basalts",
                title: "Öxarárfoss Is Small by Icelandic Standards but Very Well Framed",
                content:
                  "Öxarárfoss is not Iceland's biggest waterfall, but it is one of the most satisfying to photograph because the basalt blocks and narrow approach create a clean composition. It also works well as a short walk paired with the main rift route.",
                spotKey: "oxararfoss",
                postType: "photo",
                mediaFileName:
                  "Öxarárfoss, Þingvellir National Park, Iceland, 20230502 0950 4138.jpg",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "north-america",
    name: "North America",
    countries: [
      {
        key: "united-states",
        name: "United States",
        locations: [
          {
            key: "grand-canyon-national-park",
            name: "Grand Canyon National Park",
            category: "canyon",
            description:
              "Grand Canyon National Park protects one of the world's most famous river gorges, where layered rock, dramatic overlooks, and historic trails reveal immense geologic scale.",
            keyPoints: [
              "South Rim viewpoints are accessible year-round and cover huge distances.",
              "Mather Point is one of the easiest first-stop overlooks near the visitor center.",
              "Bright Angel Trail is the park's classic corridor trail into the canyon.",
            ],
            centerLat: 36.1069,
            centerLng: -112.1129,
            spots: [
              {
                key: "mather-point",
                name: "Mather Point",
                description:
                  "Mather Point is a popular South Rim overlook with wide views into the central Grand Canyon and the layered formations beyond.",
                pointLat: 36.0598,
                pointLng: -112.1097,
                imageFileName: "Mather Point.jpg",
              },
              {
                key: "bright-angel-trail",
                name: "Bright Angel Trail",
                description:
                  "Bright Angel Trail is the park's best-known South Rim descent, historically important and still one of the main hiking routes into the canyon.",
                pointLat: 36.0572,
                pointLng: -112.1438,
                imageFileName: "Bright Angel Trailhead.jpg",
              },
            ],
            posts: [
              {
                key: "grand-canyon-mather-first-view",
                title: "Mather Point Is a Strong First Look at Grand Canyon Scale",
                content:
                  "Mather Point works well because it gets you oriented quickly. The layers, side canyons, and depth are all visible without a long walk, and it gives a useful overview before deciding whether to spend the day on overlooks or on a rim-to-canyon trail.",
                spotKey: "mather-point",
                postType: "article",
                mediaFileName: "Mather Point.jpg",
              },
              {
                key: "grand-canyon-bright-angel-start",
                title: "Bright Angel Trail Starts with an Immediate Change in Perspective",
                content:
                  "Even the first section of Bright Angel Trail changes the experience completely. Looking back toward the rim makes the canyon feel taller, and the engineered switchbacks help you understand how historic trail building shaped access here.",
                spotKey: "bright-angel-trail",
                postType: "photo",
                mediaFileName: "Bright Angel Trailhead.jpg",
              },
            ],
          },
        ],
      },
      {
        key: "canada",
        name: "Canada",
        locations: [
          {
            key: "moraine-lake",
            name: "Moraine Lake",
            category: "lake",
            description:
              "Moraine Lake in Banff National Park is a glacier-fed alpine lake in the Valley of the Ten Peaks, famous for vivid blue water and towering mountain backdrops.",
            keyPoints: [
              "Seasonal access is tightly managed because of demand and wildlife concerns.",
              "The Rockpile gives the classic elevated panorama over the lake.",
              "Canoe launches on the shoreline offer a lower, water-level perspective.",
            ],
            centerLat: 51.3217,
            centerLng: -116.186,
            spots: [
              {
                key: "rockpile-trail",
                name: "Rockpile Trail",
                description:
                  "The Rockpile Trail climbs a short rise above Moraine Lake for the iconic view toward the Valley of the Ten Peaks.",
                pointLat: 51.3215,
                pointLng: -116.1864,
                imageFileName: "Moraine lake , banff national park.jpg",
              },
              {
                key: "moraine-lake-canoe-dock",
                name: "Canoe Dock",
                description:
                  "The Moraine Lake canoe dock is the launch area on the lakeshore where paddlers and photographers get a low-angle perspective across the water.",
                pointLat: 51.3202,
                pointLng: -116.1847,
                imageFileName: "Moraine Lake Kayak.jpg",
              },
            ],
            posts: [
              {
                key: "moraine-rockpile-classic",
                title: "The Rockpile View Is Famous Because It Really Is That Good",
                content:
                  "The Rockpile Trail is short, but the payoff is immediate. From the top, the lake colour, shoreline, and Valley of the Ten Peaks align in the exact composition that made Moraine Lake internationally recognizable.",
                spotKey: "rockpile-trail",
                postType: "article",
                mediaFileName: "Moraine lake , banff national park.jpg",
              },
              {
                key: "moraine-shoreline-paddling",
                title: "The Shoreline View Makes Moraine Lake Feel More Intimate",
                content:
                  "At lake level, Moraine feels less like a panorama and more like an enclosed alpine basin. The boats, ripples, and surrounding peaks give the scene scale in a way that complements the bigger Rockpile overlook.",
                spotKey: "moraine-lake-canoe-dock",
                postType: "photo",
                mediaFileName: "Moraine Lake Kayak.jpg",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "south-america",
    name: "South America",
    countries: [
      {
        key: "peru",
        name: "Peru",
        locations: [
          {
            key: "machu-picchu",
            name: "Machu Picchu",
            category: "archaeological-site",
            description:
              "Machu Picchu is the Inca royal estate and mountain citadel above the Urubamba Valley, one of the best-known archaeological sites in the world.",
            keyPoints: [
              "Weather shifts quickly because of elevation and cloud forest conditions.",
              "Timed circuits control how long you can stay in many sectors.",
              "Intihuatana and Intipunku are two of the site's most referenced landmarks.",
            ],
            centerLat: -13.1631,
            centerLng: -72.545,
            spots: [
              {
                key: "intihuatana",
                name: "Intihuatana",
                description:
                  "The Intihuatana stone is one of Machu Picchu's most significant ritual and astronomical features, positioned on a high sculpted outcrop within the citadel.",
                pointLat: -13.1631,
                pointLng: -72.545,
                imageFileName: "Intihuatana.jpg",
              },
              {
                key: "sun-gate",
                name: "Sun Gate",
                description:
                  "The Sun Gate, or Intipunku, is the traditional entrance on the Inca Trail and a classic elevated viewpoint back toward Machu Picchu.",
                pointLat: -13.1587,
                pointLng: -72.5383,
                imageFileName: "Machu Picchu from the Sun Gate.jpg",
              },
            ],
            posts: [
              {
                key: "machu-picchu-intihuatana-context",
                title: "Intihuatana Feels Important Even Before You Read the Signage",
                content:
                  "The Intihuatana occupies such a commanding position that it immediately stands apart from the surrounding masonry. Its carved geometry and placement make it one of the few features at Machu Picchu that still feels ceremonial at first glance.",
                spotKey: "intihuatana",
                postType: "article",
                mediaFileName: "Intihuatana.jpg",
              },
              {
                key: "machu-picchu-sun-gate-view",
                title: "The Sun Gate Gives Machu Picchu Its Best Arrival View",
                content:
                  "Seeing the citadel from the Sun Gate explains why this approach matters historically. The terraces, central ruins, and surrounding peaks all come together from above, giving a broader sense of how the site occupies its ridge.",
                spotKey: "sun-gate",
                postType: "photo",
                mediaFileName: "Machu Picchu from the Sun Gate.jpg",
              },
            ],
          },
        ],
      },
      {
        key: "argentina",
        name: "Argentina",
        locations: [
          {
            key: "iguazu-falls",
            name: "Iguazu Falls",
            category: "waterfall",
            description:
              "Iguazu Falls is a vast waterfall system on the border of Argentina and Brazil, spread across multiple cataracts, islands, and walkway circuits inside two protected national parks.",
            keyPoints: [
              "The Argentine side emphasizes close walkway access and multiple circuits.",
              "Devil's Throat is the most powerful and famous single section.",
              "Upper Circuit walkways provide panoramic views across multiple falls.",
            ],
            centerLat: -25.6953,
            centerLng: -54.4367,
            spots: [
              {
                key: "devils-throat",
                name: "Devil's Throat",
                description:
                  "Devil's Throat, known locally as Garganta del Diablo, is the largest and most forceful curtain of water in the Iguazu system.",
                pointLat: -25.6953,
                pointLng: -54.4367,
                imageFileName: "Garganta del diablo (39244565080).jpg",
              },
              {
                key: "upper-circuit-panoramic-walkway",
                name: "Upper Circuit Panoramic Walkway",
                description:
                  "The Upper Circuit on the Argentine side links elevated walkways and overlooks above several major cascades, giving broad panoramic views across the falls.",
                pointLat: -25.6831,
                pointLng: -54.4452,
                imageFileName: "Circuito Superior - Iguazu (4812283568).jpg",
              },
            ],
            posts: [
              {
                key: "iguazu-devils-throat-power",
                title: "Devil's Throat Is More About Force Than Height",
                content:
                  "At Devil's Throat, the experience is mostly about scale and sound. The platform puts you close enough to feel the spray while still seeing how the river compresses into a single roaring semicircle before plunging out of sight.",
                spotKey: "devils-throat",
                postType: "article",
                mediaFileName: "Garganta del diablo (39244565080).jpg",
              },
              {
                key: "iguazu-upper-circuit-overview",
                title: "The Upper Circuit Helps You See Iguazu as a System",
                content:
                  "The Upper Circuit was the best place to understand how the falls spread across multiple drops and islands. Instead of focusing on one cataract, the walkways open up a panoramic read of the entire river edge, which makes a good complement to the more concentrated drama at Devil's Throat.",
                spotKey: "upper-circuit-panoramic-walkway",
                postType: "photo",
                mediaFileName: "Circuito Superior - Iguazu (4812283568).jpg",
              },
            ],
          },
        ],
      },
    ],
  },
];

const topRegions = seedCatalog.map((region) => ({
  key: region.key,
  nameLocal: region.name,
  nameEn: region.name,
  level: 1,
}));

const countryRegions = seedCatalog.flatMap((region) =>
  region.countries.map((country) => ({
    key: country.key,
    nameLocal: country.name,
    nameEn: country.name,
    level: 2,
    parentKey: region.key,
  })),
);

export const regions: RegionSeed[] = [...topRegions, ...countryRegions];

export const countries: CountrySeed[] = seedCatalog.flatMap((region) =>
  region.countries.map((country) => ({
    key: country.key,
    name: country.name,
  })),
);

export const locations: LocationSeed[] = seedCatalog.flatMap((region) =>
  region.countries.flatMap((country) =>
    country.locations.map((location) => {
      const coverFileName =
        location.coverFileName ?? location.spots[0]?.imageFileName ?? "";
      return {
        key: location.key,
        name: location.name,
        regionKey: country.key,
        category: location.category,
        description: location.description,
        keyPoints: location.keyPoints,
        coverUrl: commonsFileUrl(coverFileName),
        centerLat: location.centerLat,
        centerLng: location.centerLng,
      };
    }),
  ),
);

export const spots: SpotSeed[] = seedCatalog.flatMap((region) =>
  region.countries.flatMap((country) =>
    country.locations.flatMap((location) =>
      location.spots.map((spot) => ({
        key: spot.key,
        name: spot.name,
        locationKey: location.key,
        description: spot.description,
        imageUrl: commonsFileUrl(spot.imageFileName),
        pointLat: spot.pointLat,
        pointLng: spot.pointLng,
      })),
    ),
  ),
);

export const posts: PostSeed[] = seedCatalog.flatMap((region) =>
  region.countries.flatMap((country) =>
    country.locations.flatMap((location) =>
      location.posts.map((post) => ({
        key: post.key,
        title: post.title,
        content: post.content,
        locationKey: location.key,
        spotKey: post.spotKey,
        postType: post.postType,
      })),
    ),
  ),
);

export const media: MediaSeed[] = seedCatalog.flatMap((region) =>
  region.countries.flatMap((country) =>
    country.locations.flatMap((location) =>
      location.posts.map((post) => ({
        postKey: post.key,
        mediaType: "photo",
        url: commonsFileUrl(post.mediaFileName),
        thumbnailUrl: commonsFileUrl(post.mediaFileName),
        displayOrder: 0,
        fileName: post.mediaFileName,
      })),
    ),
  ),
);
