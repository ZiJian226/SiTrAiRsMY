import 'server-only';

import { dbPool, dbQuery } from '@/lib/database';

export type HomepageHeroMode = 'video' | 'slideshow';
export type HomepageHeroMediaType = 'photo' | 'video';

export interface HomepageHeroSettings {
  config_key: string;
  mode: HomepageHeroMode;
  slideshow_interval_ms: number;
  overlay_opacity: number;
  background_color: string | null;
  background_fit: string;
  created_at: string;
  updated_at: string;
}

export interface HomepageHeroMedia {
  id: string;
  label: string | null;
  media_type: HomepageHeroMediaType;
  media_url: string;
  media_object_key: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HomepageHeroConfig {
  settings: HomepageHeroSettings | null;
  media: HomepageHeroMedia[];
}

export interface HomepageHeroMediaInput {
  id?: string;
  label?: string | null;
  media_type: HomepageHeroMediaType;
  media_url: string;
  media_object_key?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface HomepageHeroSettingsInput {
  mode: HomepageHeroMode;
  slideshow_interval_ms?: number;
  overlay_opacity?: number;
  background_color?: string | null;
  background_fit?: string;
}

type HomepageHeroSettingsRow = {
  config_key: string;
  mode: string;
  slideshow_interval_ms: number;
  overlay_opacity: number;
  background_color: string | null;
  background_fit: string;
  created_at: string;
  updated_at: string;
};

type HomepageHeroMediaRow = {
  id: string;
  label: string | null;
  media_type: string;
  media_url: string;
  media_object_key: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

let homepageHeroTablesReady = false;

async function ensureHomepageHeroTables(): Promise<void> {
  if (homepageHeroTablesReady) {
    return;
  }

  await dbQuery('CREATE EXTENSION IF NOT EXISTS pgcrypto');

  await dbQuery(`
    CREATE TABLE IF NOT EXISTS homepage_hero_settings (
      config_key TEXT PRIMARY KEY DEFAULT 'default',
      mode TEXT NOT NULL DEFAULT 'slideshow' CHECK (mode IN ('video', 'slideshow')),
      slideshow_interval_ms INTEGER NOT NULL DEFAULT 3000,
      overlay_opacity INTEGER NOT NULL DEFAULT 30 CHECK (overlay_opacity >= 0 AND overlay_opacity <= 100),
      background_color TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await dbQuery(`
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
    )
  `);

  await dbQuery(`ALTER TABLE IF EXISTS homepage_hero_settings ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'slideshow'`);
  await dbQuery(`ALTER TABLE IF EXISTS homepage_hero_settings ADD COLUMN IF NOT EXISTS slideshow_interval_ms INTEGER NOT NULL DEFAULT 3000`);
  await dbQuery(`ALTER TABLE IF EXISTS homepage_hero_settings ADD COLUMN IF NOT EXISTS overlay_opacity INTEGER NOT NULL DEFAULT 30`);
  await dbQuery(`ALTER TABLE IF EXISTS homepage_hero_settings ADD COLUMN IF NOT EXISTS background_color TEXT`);
  await dbQuery(`ALTER TABLE IF EXISTS homepage_hero_settings ADD COLUMN IF NOT EXISTS background_fit TEXT NOT NULL DEFAULT 'fit'`);
  await dbQuery(`ALTER TABLE IF EXISTS homepage_hero_settings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`);
  await dbQuery(`ALTER TABLE IF EXISTS homepage_hero_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`);

  await dbQuery(`ALTER TABLE IF EXISTS homepage_hero_media ADD COLUMN IF NOT EXISTS label TEXT`);
  await dbQuery(`ALTER TABLE IF EXISTS homepage_hero_media ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'photo'`);
  await dbQuery(`ALTER TABLE IF EXISTS homepage_hero_media ADD COLUMN IF NOT EXISTS media_url TEXT NOT NULL DEFAULT ''`);
  await dbQuery(`ALTER TABLE IF EXISTS homepage_hero_media ADD COLUMN IF NOT EXISTS media_object_key TEXT`);
  await dbQuery(`ALTER TABLE IF EXISTS homepage_hero_media ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0`);
  await dbQuery(`ALTER TABLE IF EXISTS homepage_hero_media ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true`);
  await dbQuery(`ALTER TABLE IF EXISTS homepage_hero_media ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`);
  await dbQuery(`ALTER TABLE IF EXISTS homepage_hero_media ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`);

  await dbQuery(`
    UPDATE homepage_hero_media
    SET media_type = 'photo'
    WHERE media_type IS NULL OR media_type NOT IN ('photo', 'video')
  `);

  await dbQuery(`
    UPDATE homepage_hero_media
    SET media_url = ''
    WHERE media_url IS NULL
  `);

  await dbQuery(`
    INSERT INTO homepage_hero_settings (config_key, mode, slideshow_interval_ms, overlay_opacity)
    VALUES ('default', 'slideshow', 3000, 30)
    ON CONFLICT (config_key) DO NOTHING
  `);

  homepageHeroTablesReady = true;
}

function mapSettingsRow(row: HomepageHeroSettingsRow): HomepageHeroSettings {
  return {
    config_key: row.config_key,
    mode: row.mode === 'video' ? 'video' : 'slideshow',
    slideshow_interval_ms: row.slideshow_interval_ms,
    overlay_opacity: row.overlay_opacity,
    background_color: row.background_color,
    background_fit: row.background_fit || 'fit',
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapMediaRow(row: HomepageHeroMediaRow): HomepageHeroMedia {
  return {
    id: row.id,
    label: row.label,
    media_type: row.media_type === 'video' ? 'video' : 'photo',
    media_url: row.media_url,
    media_object_key: row.media_object_key,
    sort_order: row.sort_order,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getHomepageHeroConfig(): Promise<HomepageHeroConfig> {
  await ensureHomepageHeroTables();

  const settingsResult = await dbQuery(
    `
      SELECT config_key, mode, slideshow_interval_ms, overlay_opacity, background_color, background_fit, created_at, updated_at
      FROM homepage_hero_settings
      ORDER BY updated_at DESC, created_at DESC
      LIMIT 1
    `,
  );

  const mediaResult = await dbQuery(
    `
      SELECT id, label, media_type, media_url, media_object_key, sort_order, is_active, created_at, updated_at
      FROM homepage_hero_media
      WHERE is_active = true
      ORDER BY sort_order ASC, created_at ASC
    `,
  );

  return {
    settings: (settingsResult.rows[0] as HomepageHeroSettingsRow | undefined)
      ? mapSettingsRow(settingsResult.rows[0] as HomepageHeroSettingsRow)
      : null,
    media: (mediaResult.rows as HomepageHeroMediaRow[]).map(mapMediaRow),
  };
}

export async function replaceHomepageHeroConfig(
  settings: HomepageHeroSettingsInput,
  media: HomepageHeroMediaInput[],
): Promise<HomepageHeroConfig> {
  await ensureHomepageHeroTables();

  const client = await dbPool.connect();

  try {
    await client.query('BEGIN');

    await client.query(
      `
        INSERT INTO homepage_hero_settings (config_key, mode, slideshow_interval_ms, overlay_opacity, background_color, background_fit, updated_at)
        VALUES ('default', $1, $2, $3, $4, $5, NOW())
        ON CONFLICT (config_key)
        DO UPDATE SET
          mode = EXCLUDED.mode,
          slideshow_interval_ms = EXCLUDED.slideshow_interval_ms,
          overlay_opacity = EXCLUDED.overlay_opacity,
          background_color = EXCLUDED.background_color,
          background_fit = EXCLUDED.background_fit,
          updated_at = NOW()
      `,
      [
        settings.mode,
        settings.slideshow_interval_ms ?? 3000,
        settings.overlay_opacity ?? 30,
        settings.background_color ?? null,
        settings.background_fit ?? 'fit',
      ],
    );

    await client.query('DELETE FROM homepage_hero_media');

    for (let index = 0; index < media.length; index += 1) {
      const item = media[index];
      await client.query(
        `
          INSERT INTO homepage_hero_media (
            id,
            label,
            media_type,
            media_url,
            media_object_key,
            sort_order,
            is_active,
            created_at,
            updated_at
          ) VALUES (
            COALESCE($1::uuid, gen_random_uuid()),
            $2,
            $3,
            $4,
            $5,
            COALESCE($6::integer, $7::integer),
            COALESCE($8::boolean, true),
            NOW(),
            NOW()
          )
        `,
        [
          item.id || null,
          item.label || null,
          item.media_type,
          item.media_url,
          item.media_object_key || null,
          Number.isFinite(Number(item.sort_order)) ? Number(item.sort_order) : null,
          Number(index),
          typeof item.is_active === 'boolean' ? item.is_active : null,
        ],
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  return getHomepageHeroConfig();
}
