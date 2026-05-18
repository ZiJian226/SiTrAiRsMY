-- Migration 008: Add homepage hero background configuration
-- Supports either a muted video hero or a rotating slideshow of photos/videos on the homepage only.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS homepage_hero_settings (
  config_key TEXT PRIMARY KEY DEFAULT 'default',
  mode TEXT NOT NULL DEFAULT 'slideshow' CHECK (mode IN ('video', 'slideshow')),
  slideshow_interval_ms INTEGER NOT NULL DEFAULT 3000,
  overlay_opacity INTEGER NOT NULL DEFAULT 30 CHECK (overlay_opacity >= 0 AND overlay_opacity <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS homepage_hero_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  media_url TEXT NOT NULL,
  media_object_key TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO homepage_hero_settings (config_key, mode, slideshow_interval_ms, overlay_opacity)
VALUES ('default', 'slideshow', 3000, 30)
ON CONFLICT (config_key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_homepage_hero_media_is_active ON homepage_hero_media(is_active);
CREATE INDEX IF NOT EXISTS idx_homepage_hero_media_sort_order ON homepage_hero_media(sort_order);