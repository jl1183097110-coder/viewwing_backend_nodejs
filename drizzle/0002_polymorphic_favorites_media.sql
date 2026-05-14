BEGIN;

-- favorites 表多态扩展
ALTER TABLE favorites ALTER COLUMN spot_id DROP NOT NULL;
ALTER TABLE favorites
  ADD COLUMN post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  ADD COLUMN location_id INTEGER REFERENCES location(id) ON DELETE CASCADE;

DROP INDEX IF EXISTS favorites_user_spot_unique_idx;
CREATE UNIQUE INDEX favorites_user_spot_unique_idx
  ON favorites (user_id, spot_id) WHERE spot_id IS NOT NULL;
CREATE UNIQUE INDEX favorites_user_post_unique_idx
  ON favorites (user_id, post_id) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX favorites_user_location_unique_idx
  ON favorites (user_id, location_id) WHERE location_id IS NOT NULL;

ALTER TABLE favorites ADD CONSTRAINT favorites_single_target_check CHECK (
  (CASE WHEN post_id IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN spot_id IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN location_id IS NOT NULL THEN 1 ELSE 0 END) = 1
);

-- media 表多态扩展
ALTER TABLE media ALTER COLUMN post_id DROP NOT NULL;
ALTER TABLE media
  ADD COLUMN spot_id INTEGER REFERENCES spots(id) ON DELETE CASCADE,
  ADD COLUMN location_id INTEGER REFERENCES location(id) ON DELETE CASCADE;

DROP INDEX IF EXISTS media_post_display_order_idx;
CREATE INDEX media_post_display_order_idx
  ON media (post_id, display_order) WHERE post_id IS NOT NULL;
CREATE INDEX media_spot_display_order_idx
  ON media (spot_id, display_order) WHERE spot_id IS NOT NULL;
CREATE INDEX media_location_display_order_idx
  ON media (location_id, display_order) WHERE location_id IS NOT NULL;

ALTER TABLE media ADD CONSTRAINT media_single_owner_check CHECK (
  (CASE WHEN post_id IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN spot_id IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN location_id IS NOT NULL THEN 1 ELSE 0 END) = 1
);

COMMIT;
