-- Adds object storage key columns used for reliable media lifecycle management.
-- Safe to run multiple times.

ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS avatar_object_key TEXT;

ALTER TABLE IF EXISTS events
  ADD COLUMN IF NOT EXISTS image_object_key TEXT;

ALTER TABLE IF EXISTS events
  ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE IF EXISTS gallery_items
  ADD COLUMN IF NOT EXISTS image_object_key TEXT;

ALTER TABLE IF EXISTS gallery_items
  ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE IF EXISTS merchandise
  ADD COLUMN IF NOT EXISTS image_object_key TEXT;
