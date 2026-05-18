-- Migration 011: Add homepage hero background fit mode
-- Stores the fit mode for hero media (Fill, Fit, Stretch, Tile, Center, Span).

ALTER TABLE IF NOT EXISTS homepage_hero_settings
  ADD COLUMN IF NOT EXISTS background_fit TEXT DEFAULT 'fit';