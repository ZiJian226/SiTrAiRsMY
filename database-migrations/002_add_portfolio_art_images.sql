-- Migration 002: Add Portfolio Art Images table
-- This migration adds a table to store portfolio art images for artists
-- similar to how portrait pictures are handled for talent profiles

-- ============================================
-- PORTFOLIO ART IMAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS portfolio_art_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_object_key TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_portfolio_art_images_artist_id ON portfolio_art_images(artist_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_art_images_sort_order ON portfolio_art_images(artist_id, sort_order);

-- Apply trigger to portfolio_art_images
CREATE TRIGGER IF NOT EXISTS update_portfolio_art_images_updated_at BEFORE UPDATE ON portfolio_art_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
