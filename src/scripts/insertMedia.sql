-- Insert media records for seed posts
-- Run this SQL directly in your PostgreSQL database

-- Mount Fuji posts media
INSERT INTO media (post_id, object_key, media_type, url, thumbnail_url, file_size, display_order, created_at)
VALUES
-- Post ID 111: Sunrise at Mount Fuji Summit
(111, 'seed/fuji-sunrise-0.jpg', 'photo', 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1200', 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400', 500000, 0, NOW()),
(111, 'seed/fuji-sunrise-1.jpg', 'photo', 'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=1200', 'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=400', 500000, 1, NOW()),

-- Post ID 112: Perfect Fuji Reflection at Kawaguchi
(112, 'seed/kawaguchi-reflection-0.jpg', 'photo', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400', 500000, 0, NOW()),

-- Post ID 113: Cherry Blossoms at Chureito Pagoda
(113, 'seed/chureito-pagoda-0.jpg', 'photo', 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=1200', 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400', 500000, 0, NOW()),
(113, 'seed/chureito-pagoda-1.jpg', 'photo', 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=1200', 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=400', 500000, 1, NOW()),

-- Jade Dragon posts media
-- Post ID 114: Above the Clouds at Jade Dragon
(114, 'seed/jade-glacier-0.jpg', 'photo', 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200', 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400', 500000, 0, NOW()),

-- Post ID 115: Blue Moon Valley Photography Guide
(115, 'seed/blue-moon-guide-0.jpg', 'photo', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', 500000, 0, NOW()),

-- Matterhorn posts media
-- Post ID 116: Matterhorn at Golden Hour
(116, 'seed/matterhorn-golden-0.jpg', 'photo', 'https://images.unsplash.com/photo-1531210483974-4f8205670c70?w=1200', 'https://images.unsplash.com/photo-1531210483974-4f8205670c70?w=400', 500000, 0, NOW()),
(116, 'seed/matterhorn-golden-1.jpg', 'photo', 'https://images.unsplash.com/photo-1473654729523-203e25dfda10?w=1200', 'https://images.unsplash.com/photo-1473654729523-203e25dfda10?w=400', 500000, 1, NOW()),

-- Post ID 117: Perfect Reflection at Riffelsee
(117, 'seed/riffelsee-reflection-0.jpg', 'photo', 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=1200', 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=400', 500000, 0, NOW()),

-- Geirangerfjord posts media
-- Post ID 118: Seven Sisters in Full Flow
(118, 'seed/seven-sisters-0.jpg', 'photo', 'https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?w=1200', 'https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?w=400', 500000, 0, NOW()),
(118, 'seed/seven-sisters-1.jpg', 'photo', 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1200', 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400', 500000, 1, NOW()),

-- Post ID 119: Complete Guide to Geirangerfjord
(119, 'seed/geirangerfjord-guide-0.jpg', 'photo', 'https://images.unsplash.com/photo-1520769945061-0a448c463865?w=1200', 'https://images.unsplash.com/photo-1520769945061-0a448c463865?w=400', 500000, 0, NOW()),

-- Lake Brienz posts media
-- Post ID 120: Giessbach Falls from the Historic Hotel
(120, 'seed/giessbach-falls-0.jpg', 'photo', 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=1200', 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=400', 500000, 0, NOW()),
(120, 'seed/giessbach-falls-1.jpg', 'photo', 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200', 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=400', 500000, 1, NOW()),

-- Post ID 121: Swiss Village Life in Brienz
(121, 'seed/brienz-village-post-0.jpg', 'photo', 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200', 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=400', 500000, 0, NOW());

-- Verify insertion
SELECT COUNT(*) as total_media FROM media WHERE object_key LIKE 'seed/%';
