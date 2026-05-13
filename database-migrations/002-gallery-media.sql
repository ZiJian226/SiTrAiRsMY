-- ============================================
-- GALLERY MEDIA BACKFILL MIGRATION
-- ============================================
-- Adds gallery_media to existing databases and backfills a primary photo row
-- for gallery items that only had the legacy single-image fields.

CREATE TABLE IF NOT EXISTS gallery_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_item_id UUID NOT NULL REFERENCES gallery_items(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  media_url TEXT NOT NULL,
  media_object_key TEXT,
  thumbnail_url TEXT,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_media_gallery_item_id ON gallery_media(gallery_item_id);
CREATE INDEX IF NOT EXISTS idx_gallery_media_is_primary ON gallery_media(gallery_item_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_gallery_media_sort_order ON gallery_media(gallery_item_id, sort_order);

DROP TRIGGER IF EXISTS update_gallery_media_updated_at ON gallery_media;
CREATE TRIGGER update_gallery_media_updated_at BEFORE UPDATE ON gallery_media
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Backfill a primary photo row for legacy gallery items that do not yet have any media.
INSERT INTO gallery_media (
  gallery_item_id,
  media_type,
  media_url,
  media_object_key,
  thumbnail_url,
  is_primary,
  sort_order
)
SELECT
  g.id,
  'photo',
  g.image_url,
  g.image_object_key,
  g.thumbnail_url,
  true,
  0
FROM gallery_items g
WHERE NOT EXISTS (
  SELECT 1
  FROM gallery_media gm
  WHERE gm.gallery_item_id = g.id
);
