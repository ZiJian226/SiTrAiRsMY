-- Migration 010: Add homepage hero background color
-- Stores the hero filler color used behind contain-fit slideshow media.

ALTER TABLE IF EXISTS homepage_hero_settings
  ADD COLUMN IF NOT EXISTS background_color TEXT;