-- Insert media records for seed posts (robust version)
-- Matches posts by title instead of hardcoding IDs
-- Run this SQL directly in your PostgreSQL database

INSERT INTO media (post_id, object_key, media_type, url, thumbnail_url, file_size, display_order, created_at)
SELECT 
    p.id as post_id,
    vals.object_key,
    vals.media_type::media_type,
    vals.url,
    vals.thumbnail_url,
    vals.file_size,
    vals.display_order,
    NOW() as created_at
FROM posts p
CROSS JOIN (VALUES
    -- Mount Fuji posts media
    ('seed/fuji-sunrise-0.jpg', 'photo', 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1200', 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400', 500000, 0, 'Sunrise at Mount Fuji Summit'),
    ('seed/fuji-sunrise-1.jpg', 'photo', 'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=1200', 'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=400', 500000, 1, 'Sunrise at Mount Fuji Summit'),
    ('seed/kawaguchi-reflection-0.jpg', 'photo', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400', 500000, 0, 'Perfect Fuji Reflection at Kawaguchi'),
    ('seed/chureito-pagoda-0.jpg', 'photo', 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=1200', 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400', 500000, 0, 'Cherry Blossoms at Chureito Pagoda'),
    ('seed/chureito-pagoda-1.jpg', 'photo', 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=1200', 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=400', 500000, 1, 'Cherry Blossoms at Chureito Pagoda'),
    -- Jade Dragon posts media
    ('seed/jade-glacier-0.jpg', 'photo', 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200', 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400', 500000, 0, 'Above the Clouds at Jade Dragon'),
    ('seed/blue-moon-guide-0.jpg', 'photo', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', 500000, 0, 'Blue Moon Valley Photography Guide'),
    -- Matterhorn posts media
    ('seed/matterhorn-golden-0.jpg', 'photo', 'https://images.unsplash.com/photo-1531210483974-4f8205670c70?w=1200', 'https://images.unsplash.com/photo-1531210483974-4f8205670c70?w=400', 500000, 0, 'Matterhorn at Golden Hour'),
    ('seed/matterhorn-golden-1.jpg', 'photo', 'https://images.unsplash.com/photo-1473654729523-203e25dfda10?w=1200', 'https://images.unsplash.com/photo-1473654729523-203e25dfda10?w=400', 500000, 1, 'Matterhorn at Golden Hour'),
    ('seed/riffelsee-reflection-0.jpg', 'photo', 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=1200', 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=400', 500000, 0, 'Perfect Reflection at Riffelsee'),
    -- Geirangerfjord posts media
    ('seed/seven-sisters-0.jpg', 'photo', 'https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?w=1200', 'https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?w=400', 500000, 0, 'Seven Sisters in Full Flow'),
    ('seed/seven-sisters-1.jpg', 'photo', 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1200', 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400', 500000, 1, 'Seven Sisters in Full Flow'),
    ('seed/geirangerfjord-guide-0.jpg', 'photo', 'https://images.unsplash.com/photo-1520769945061-0a448c463865?w=1200', 'https://images.unsplash.com/photo-1520769945061-0a448c463865?w=400', 500000, 0, 'Complete Guide to Geirangerfjord'),
    -- Lake Brienz posts media
    ('seed/giessbach-falls-0.jpg', 'photo', 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=1200', 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=400', 500000, 0, 'Giessbach Falls from the Historic Hotel'),
    ('seed/giessbach-falls-1.jpg', 'photo', 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200', 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=400', 500000, 1, 'Giessbach Falls from the Historic Hotel'),
    ('seed/brienz-village-post-0.jpg', 'photo', 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200', 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=400', 500000, 0, 'Swiss Village Life in Brienz')
) AS vals(
    object_key,
    media_type,
    url,
    thumbnail_url,
    file_size,
    display_order,
    post_title
)
WHERE p.title = vals.post_title
ON CONFLICT DO NOTHING;

-- Verify insertion
SELECT 
    COUNT(*) as total_media,
    COUNT(DISTINCT post_id) as posts_with_media
FROM media 
WHERE object_key LIKE 'seed/%';
