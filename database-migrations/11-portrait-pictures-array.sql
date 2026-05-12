-- Migration: Support multiple portrait pictures for talent/staff
-- Date: 2026-05-12

-- ============================================
-- TALENT PROFILES - Add portrait_pictures array
-- ============================================
ALTER TABLE IF EXISTS talent_profiles ADD COLUMN IF NOT EXISTS portrait_pictures JSONB DEFAULT '[]'::jsonb;

-- Backfill: Convert existing single portrait picture to array
UPDATE talent_profiles 
SET portrait_pictures = CASE 
  WHEN portrait_picture_url IS NOT NULL THEN jsonb_build_array(
    jsonb_build_object('url', portrait_picture_url, 'object_key', portrait_picture_object_key)
  )
  ELSE '[]'::jsonb
END
WHERE portrait_pictures = '[]'::jsonb;

-- ============================================
-- ARTIST PROFILES - Add portfolio_art_images array for uploaded images
-- ============================================
ALTER TABLE IF EXISTS artist_profiles ADD COLUMN IF NOT EXISTS portfolio_art_images JSONB DEFAULT '[]'::jsonb;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_talent_profiles_portrait_pictures ON talent_profiles USING gin(portrait_pictures);
CREATE INDEX IF NOT EXISTS idx_artist_profiles_portfolio_art_images ON artist_profiles USING gin(portfolio_art_images);
