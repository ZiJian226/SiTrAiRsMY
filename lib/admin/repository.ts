import 'server-only';

import { dbPool, dbQuery } from '@/lib/database';
import { resolveRenderableImageUrl } from '@/lib/objectStorage';
import type {
  AdminEvent,
  AdminGalleryItem,
  AdminMerchandiseItem,
  AdminProfile,
  AdminStatistics,
  AdminUser,
} from './types';

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=starmy';
const schemaColumnCache = new Map<string, boolean>();

type AdminUserRow = {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: AdminUser['role'];
  avatar_url: string;
  avatar_object_key: string | null;
  bio: string;
  created_at: string;
  updated_at: string;
};

type AdminEventRow = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  image_url: string | null;
  image_object_key: string | null;
  category: string | null;
  is_published: boolean;
  featured: boolean;
};

type AdminGalleryItemRow = {
  id: string;
  title: string;
  image_url: string | null;
  image_object_key: string | null;
  description: string | null;
  category: string | null;
  artist_name: string | null;
  is_published: boolean;
  featured: boolean;
};

type AdminProfileRow = {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: AdminUser['role'];
  avatar_url: string;
  avatar_object_key: string | null;
  bio: string;
  created_at: string;
  updated_at: string;
  character_description: string | null;
  tags: string[] | null;
  social_links: unknown;
};

type RecentUserRow = { id: string; full_name: string | null; created_at: string };
type RecentEventRow = { id: string; title: string | null; updated_at: string };
type RecentGalleryRow = { id: string; title: string | null; updated_at: string };
type RecentMerchRow = { id: string; name: string | null; updated_at: string };

function formatRelativeTime(isoDate: string): string {
  const then = new Date(isoDate).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - then);
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

function safeString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

async function hasColumn(tableName: string, columnName: string): Promise<boolean> {
  const cacheKey = `${tableName}.${columnName}`;
  const cached = schemaColumnCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const result = await dbQuery(
      `
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = $2
      LIMIT 1
      `,
      [tableName, columnName],
    );

    const supported = result.rowCount > 0;
    schemaColumnCache.set(cacheKey, supported);
    return supported;
  } catch {
    schemaColumnCache.set(cacheKey, false);
    return false;
  }
}

async function ensureColumn(tableName: string, columnDefinition: string, columnName: string): Promise<void> {
  if (await hasColumn(tableName, columnName)) {
    return;
  }

  await dbQuery(`ALTER TABLE IF EXISTS ${tableName} ADD COLUMN IF NOT EXISTS ${columnDefinition}`);
  schemaColumnCache.set(`${tableName}.${columnName}`, true);
}

async function hasProfileAvatarObjectKey(): Promise<boolean> {
  return hasColumn('profiles', 'avatar_object_key');
}

async function hasArtistProfilesTable(): Promise<boolean> {
  return hasColumn('artist_profiles', 'user_id');
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const supportsAvatarObjectKey = await hasProfileAvatarObjectKey();
  const result = await dbQuery(
    supportsAvatarObjectKey
      ? `
    SELECT
      p.id,
      p.user_id,
      p.email,
      COALESCE(p.full_name, '') AS full_name,
      p.role,
      COALESCE(p.avatar_url, '') AS avatar_url,
      p.avatar_object_key,
      COALESCE(p.bio, '') AS bio,
      p.created_at,
      p.updated_at
    FROM profiles p
    ORDER BY p.created_at DESC
    `
      : `
    SELECT
      p.id,
      p.user_id,
      p.email,
      COALESCE(p.full_name, '') AS full_name,
      p.role,
      COALESCE(p.avatar_url, '') AS avatar_url,
      NULL::text AS avatar_object_key,
      COALESCE(p.bio, '') AS bio,
      p.created_at,
      p.updated_at
    FROM profiles p
    ORDER BY p.created_at DESC
    `,
  );

  const rows = result.rows as AdminUserRow[];

  return rows.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    email: row.email,
    full_name: safeString(row.full_name, 'No name'),
    role: row.role,
    avatar_url: safeString(row.avatar_url, DEFAULT_AVATAR),
    avatar_object_key: row.avatar_object_key || undefined,
    bio: safeString(row.bio),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export async function createAdminEvent(input: Omit<AdminEvent, 'id'>): Promise<AdminEvent> {
  await ensureColumn('events', 'featured BOOLEAN NOT NULL DEFAULT false', 'featured');
  const supportsImageObjectKey = await hasColumn('events', 'image_object_key');
  const supportsFeatured = await hasColumn('events', 'featured');
  const result = await dbQuery(
    supportsImageObjectKey && supportsFeatured
      ? `
    INSERT INTO events (title, description, event_date, location, image_url, image_object_key, category, is_published, featured)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, title, description, event_date, location, image_url, image_object_key, category, is_published, featured
    `
      : supportsImageObjectKey
      ? `
    INSERT INTO events (title, description, event_date, location, image_url, image_object_key, category, is_published)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, title, description, event_date, location, image_url, image_object_key, category, is_published, false AS featured
    `
      : supportsFeatured
      ? `
    INSERT INTO events (title, description, event_date, location, image_url, category, is_published, featured)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, title, description, event_date, location, image_url, NULL::text AS image_object_key, category, is_published, featured
    `
      : `
    INSERT INTO events (title, description, event_date, location, image_url, category, is_published)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, title, description, event_date, location, image_url, NULL::text AS image_object_key, category, is_published, false AS featured
    `,
    supportsImageObjectKey && supportsFeatured
      ? [input.title, input.description, input.event_date, input.location, input.image_url, input.image_object_key || null, input.category, input.is_published, input.featured]
      : supportsImageObjectKey
        ? [input.title, input.description, input.event_date, input.location, input.image_url, input.image_object_key || null, input.category, input.is_published]
        : supportsFeatured
          ? [input.title, input.description, input.event_date, input.location, input.image_url, input.category, input.is_published, input.featured]
          : [input.title, input.description, input.event_date, input.location, input.image_url, input.category, input.is_published],
  );

  const row = result.rows[0] as AdminEventRow;

  return {
    id: row.id,
    title: row.title,
    description: safeString(row.description),
    event_date: row.event_date,
    location: safeString(row.location),
    image_url: resolveRenderableImageUrl(row.image_url, row.image_object_key),
    image_object_key: row.image_object_key || undefined,
    category: safeString(row.category, 'other'),
    is_published: Boolean(row.is_published),
    featured: Boolean(row.featured),
  };
}

export async function updateAdminEvent(id: string, input: Partial<Omit<AdminEvent, 'id'>>): Promise<AdminEvent | null> {
  await ensureColumn('events', 'featured BOOLEAN NOT NULL DEFAULT false', 'featured');
  const supportsImageObjectKey = await hasColumn('events', 'image_object_key');
  const supportsFeatured = await hasColumn('events', 'featured');
  const currentResult = await dbQuery(
    supportsImageObjectKey && supportsFeatured
      ? `
    SELECT id, title, description, event_date, location, image_url, image_object_key, category, is_published, featured
    FROM events
    WHERE id = $1
    LIMIT 1
    `
      : supportsImageObjectKey
      ? `
    SELECT id, title, description, event_date, location, image_url, image_object_key, category, is_published, false AS featured
    FROM events
    WHERE id = $1
    LIMIT 1
    `
      : `
    SELECT id, title, description, event_date, location, image_url, NULL::text AS image_object_key, category, is_published, false AS featured
    FROM events
    WHERE id = $1
    LIMIT 1
    `,
    [id],
  );

  if (currentResult.rowCount === 0) {
    return null;
  }

  const currentRow = currentResult.rows[0] as AdminEventRow;
  const merged = {
    title: input.title ?? currentRow.title,
    description: input.description ?? safeString(currentRow.description),
    event_date: input.event_date ?? currentRow.event_date,
    location: input.location ?? safeString(currentRow.location),
    image_url: input.image_url ?? safeString(currentRow.image_url),
    image_object_key: input.image_object_key ?? currentRow.image_object_key ?? undefined,
    category: input.category ?? safeString(currentRow.category, 'other'),
    is_published: typeof input.is_published === 'boolean' ? input.is_published : Boolean(currentRow.is_published),
    featured: typeof input.featured === 'boolean' ? input.featured : Boolean(currentRow.featured),
  };

  const result = await dbQuery(
    supportsImageObjectKey && supportsFeatured
      ? `
    UPDATE events
    SET title = $2,
        description = $3,
        event_date = $4,
        location = $5,
        image_url = $6,
        image_object_key = $7,
        category = $8,
        is_published = $9,
        featured = $10,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, title, description, event_date, location, image_url, image_object_key, category, is_published, featured
    `
      : supportsImageObjectKey
      ? `
    UPDATE events
    SET title = $2,
        description = $3,
        event_date = $4,
        location = $5,
        image_url = $6,
        image_object_key = $7,
        category = $8,
        is_published = $9,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, title, description, event_date, location, image_url, image_object_key, category, is_published, false AS featured
    `
      : supportsFeatured
      ? `
    UPDATE events
    SET title = $2,
        description = $3,
        event_date = $4,
        location = $5,
        image_url = $6,
        category = $7,
        is_published = $8,
        featured = $9,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, title, description, event_date, location, image_url, NULL::text AS image_object_key, category, is_published, featured
    `
      : `
    UPDATE events
    SET title = $2,
        description = $3,
        event_date = $4,
        location = $5,
        image_url = $6,
        category = $7,
        is_published = $8,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, title, description, event_date, location, image_url, NULL::text AS image_object_key, category, is_published, false AS featured
    `,
    supportsImageObjectKey && supportsFeatured
      ? [id, merged.title, merged.description, merged.event_date, merged.location, merged.image_url, merged.image_object_key || null, merged.category, merged.is_published, merged.featured]
      : supportsImageObjectKey
        ? [id, merged.title, merged.description, merged.event_date, merged.location, merged.image_url, merged.image_object_key || null, merged.category, merged.is_published]
        : supportsFeatured
          ? [id, merged.title, merged.description, merged.event_date, merged.location, merged.image_url, merged.category, merged.is_published, merged.featured]
          : [id, merged.title, merged.description, merged.event_date, merged.location, merged.image_url, merged.category, merged.is_published],
  );

  return result.rowCount ? (result.rows[0] as AdminEvent) : null;
}

export async function deleteAdminEvent(id: string): Promise<boolean> {
  const result = await dbQuery('DELETE FROM events WHERE id = $1', [id]);
  return (result.rowCount || 0) > 0;
}

export async function getAdminGalleryItems(): Promise<AdminGalleryItem[]> {
  await ensureColumn('gallery_items', 'featured BOOLEAN NOT NULL DEFAULT false', 'featured');
  const supportsImageObjectKey = await hasColumn('gallery_items', 'image_object_key');
  const supportsFeatured = await hasColumn('gallery_items', 'featured');
  const result = await dbQuery(
    supportsImageObjectKey && supportsFeatured
      ? `
    SELECT id, title, image_url, image_object_key, description, category, artist_name, is_published, featured
    FROM gallery_items
    ORDER BY created_at DESC
    `
      : supportsImageObjectKey
      ? `
    SELECT id, title, image_url, image_object_key, description, category, artist_name, is_published, false AS featured
    FROM gallery_items
    ORDER BY created_at DESC
    `
      : supportsFeatured
      ? `
    SELECT id, title, image_url, NULL::text AS image_object_key, description, category, artist_name, is_published, featured
    FROM gallery_items
    ORDER BY created_at DESC
    `
      : `
    SELECT id, title, image_url, NULL::text AS image_object_key, description, category, artist_name, is_published, false AS featured
    FROM gallery_items
    ORDER BY created_at DESC
    `,
  );

  const rows = result.rows as AdminGalleryItemRow[];

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    image_url: resolveRenderableImageUrl(row.image_url, row.image_object_key),
    image_object_key: row.image_object_key || undefined,
    description: safeString(row.description),
    category: safeString(row.category, 'other'),
    artist_name: safeString(row.artist_name, 'Unknown Artist'),
    is_published: Boolean(row.is_published),
    featured: Boolean(row.featured),
  }));
}

export async function createAdminUser(input: {
  email: string;
  full_name?: string;
  role: 'admin' | 'talent' | 'artist';
  avatar_url?: string;
  avatar_object_key?: string;
  bio?: string;
  password?: string;
}): Promise<AdminUser & { temporary_password?: string }> {
  const tempPassword = input.password || generateTemporaryPassword();
  const supportsAvatarObjectKey = await hasProfileAvatarObjectKey();
  const supportsArtistProfiles = await hasArtistProfilesTable();

  if (!dbPool) {
    throw new Error('DATABASE_URL is not set. Configure it in your environment variables.');
  }

  const client = await dbPool.connect();

  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      `
      INSERT INTO users (email, password_hash, is_active)
      VALUES ($1, crypt($2, gen_salt('bf')), true)
      RETURNING id
      `,
      [input.email, tempPassword],
    );

    const userId = userResult.rows[0]?.id as string;

    const profileResult = await client.query(
      supportsAvatarObjectKey
        ? `
      INSERT INTO profiles (user_id, email, full_name, role, avatar_url, avatar_object_key, bio)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, user_id, email, full_name, role, avatar_url, avatar_object_key, bio, created_at, updated_at
      `
        : `
      INSERT INTO profiles (user_id, email, full_name, role, avatar_url, bio)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, user_id, email, full_name, role, avatar_url, NULL::text AS avatar_object_key, bio, created_at, updated_at
      `,
      supportsAvatarObjectKey
        ? [
            userId,
            input.email,
            input.full_name || '',
            input.role,
            input.avatar_url || DEFAULT_AVATAR,
            input.avatar_object_key || null,
            input.bio || '',
          ]
        : [userId, input.email, input.full_name || '', input.role, input.avatar_url || DEFAULT_AVATAR, input.bio || ''],
    );

    const row = profileResult.rows[0];

    if (input.role === 'talent') {
      await client.query(
        `
        INSERT INTO talent_profiles (user_id, stage_name, character_description, social_links, tags, is_published)
        VALUES ($1, $2, $3, $4::jsonb, $5, true)
        `,
        [
          userId,
          input.full_name || input.email,
          input.bio || null,
          JSON.stringify({ youtubeUrl: null, twitchUrl: null, tiktokUrl: null }),
          [],
        ],
      );
    }

    if (input.role === 'artist' && supportsArtistProfiles) {
      await client.query(
        `
        INSERT INTO artist_profiles (user_id, specialty, portfolio_links, social_media_links, is_published)
        VALUES ($1, $2, $3, $4::jsonb, true)
        `,
        [userId, [], [], JSON.stringify({ twitter: null, instagram: null, website: null })],
      );
    }

    await client.query('COMMIT');

    return {
      id: row.id,
      user_id: row.user_id,
      email: row.email,
      full_name: safeString(row.full_name, 'No name'),
      role: row.role,
      avatar_url: safeString(row.avatar_url, DEFAULT_AVATAR),
      avatar_object_key: row.avatar_object_key || undefined,
      bio: safeString(row.bio),
      created_at: row.created_at,
      updated_at: row.updated_at,
      temporary_password: !input.password ? tempPassword : undefined,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

function generateTemporaryPassword(): string {
  // Generate a secure temporary password
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function updateAdminUser(
  profileId: string,
  input: { full_name: string; role: 'admin' | 'talent' | 'artist'; avatar_url: string; avatar_object_key?: string; bio: string },
): Promise<AdminUser | null> {
  const supportsAvatarObjectKey = await hasProfileAvatarObjectKey();
  const supportsArtistProfiles = await hasArtistProfilesTable();
  const result = await dbQuery(
    supportsAvatarObjectKey
      ? `
    UPDATE profiles
    SET full_name = $2,
        role = $3,
        avatar_url = $4,
        avatar_object_key = $5,
        bio = $6,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, user_id, email, full_name, role, avatar_url, avatar_object_key, bio, created_at, updated_at
    `
      : `
    UPDATE profiles
    SET full_name = $2,
        role = $3,
        avatar_url = $4,
        bio = $5,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, user_id, email, full_name, role, avatar_url, NULL::text AS avatar_object_key, bio, created_at, updated_at
    `,
    supportsAvatarObjectKey
      ? [profileId, input.full_name, input.role, input.avatar_url, input.avatar_object_key || null, input.bio]
      : [profileId, input.full_name, input.role, input.avatar_url, input.bio],
  );

  if (result.rowCount === 0) {
    return null;
  }

  const row = result.rows[0] as {
    id: string;
    user_id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'talent' | 'artist';
    avatar_url: string;
    avatar_object_key: string | null;
    bio: string;
    created_at: string;
    updated_at: string;
  };

  if (input.role === 'talent') {
    const talentUpdateResult = await dbQuery(
      `
      UPDATE talent_profiles
      SET stage_name = $2,
          character_description = $3,
          social_links = $4::jsonb,
          tags = $5,
          is_published = true,
          updated_at = NOW()
      WHERE user_id = $1
      `,
      [
        row.user_id,
        input.full_name || row.email,
        input.bio || null,
        JSON.stringify({ youtubeUrl: null, twitchUrl: null, tiktokUrl: null }),
        [],
      ],
    );

    if ((talentUpdateResult.rowCount || 0) === 0) {
      await dbQuery(
        `
        INSERT INTO talent_profiles (user_id, stage_name, character_description, social_links, tags, is_published)
        VALUES ($1, $2, $3, $4::jsonb, $5, true)
        `,
        [
          row.user_id,
          input.full_name || row.email,
          input.bio || null,
          JSON.stringify({ youtubeUrl: null, twitchUrl: null, tiktokUrl: null }),
          [],
        ],
      );
    }
  }

  if (input.role === 'artist' && supportsArtistProfiles) {
    const artistUpdateResult = await dbQuery(
      `
      UPDATE artist_profiles
      SET updated_at = NOW()
      WHERE user_id = $1
      `,
      [row.user_id],
    );

    if ((artistUpdateResult.rowCount || 0) === 0) {
      await dbQuery(
        `
        INSERT INTO artist_profiles (user_id, specialty, portfolio_links, social_media_links, is_published)
        VALUES ($1, $2, $3, $4::jsonb, true)
        `,
        [row.user_id, [], [], JSON.stringify({ twitter: null, instagram: null, website: null })],
      );
    }
  }

  return {
    id: row.id,
    user_id: row.user_id,
    email: row.email,
    full_name: safeString(row.full_name, 'No name'),
    role: row.role,
    avatar_url: safeString(row.avatar_url, DEFAULT_AVATAR),
    avatar_object_key: row.avatar_object_key || undefined,
    bio: safeString(row.bio),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function deleteAdminUser(profileId: string): Promise<boolean> {
  const result = await dbQuery(
    `
    DELETE FROM users
    WHERE id = (
      SELECT user_id FROM profiles WHERE id = $1
    )
    `,
    [profileId],
  );

  return (result.rowCount || 0) > 0;
}

export async function getAdminProfiles(): Promise<AdminProfile[]> {
  const supportsAvatarObjectKey = await hasProfileAvatarObjectKey();
  const result = await dbQuery(
    supportsAvatarObjectKey
      ? `
    SELECT
      p.id,
      p.user_id,
      p.email,
      COALESCE(p.full_name, '') AS full_name,
      p.role,
      COALESCE(p.avatar_url, '') AS avatar_url,
      p.avatar_object_key,
      COALESCE(p.bio, '') AS bio,
      p.created_at,
      p.updated_at,
      tp.character_description,
      tp.tags,
      tp.social_links
    FROM profiles p
    LEFT JOIN talent_profiles tp ON tp.user_id = p.user_id
    ORDER BY p.created_at DESC
    `
      : `
    SELECT
      p.id,
      p.user_id,
      p.email,
      COALESCE(p.full_name, '') AS full_name,
      p.role,
      COALESCE(p.avatar_url, '') AS avatar_url,
      NULL::text AS avatar_object_key,
      COALESCE(p.bio, '') AS bio,
      p.created_at,
      p.updated_at,
      tp.character_description,
      tp.tags,
      tp.social_links
    FROM profiles p
    LEFT JOIN talent_profiles tp ON tp.user_id = p.user_id
    ORDER BY p.created_at DESC
    `,
  );

  const rows = result.rows as AdminProfileRow[];

  return rows.map((row) => {
    const social = typeof row.social_links === 'object' && row.social_links !== null
      ? (row.social_links as Record<string, unknown>)
      : {};

    return {
      id: row.id,
      user_id: row.user_id,
      email: row.email,
      full_name: safeString(row.full_name, 'No name'),
      role: row.role,
      avatar_url: safeString(row.avatar_url, DEFAULT_AVATAR),
      avatar_object_key: row.avatar_object_key || undefined,
      bio: safeString(row.bio),
      created_at: row.created_at,
      updated_at: row.updated_at,
      lore: safeString(row.character_description) || undefined,
      tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
      youtubeUrl: typeof social.youtubeUrl === 'string' ? social.youtubeUrl : undefined,
      twitchUrl: typeof social.twitchUrl === 'string' ? social.twitchUrl : undefined,
      tiktokUrl: typeof social.tiktokUrl === 'string' ? social.tiktokUrl : undefined,
    };
  });
}

export async function updateAdminProfile(
  profileId: string,
  input: {
    full_name: string;
    role: 'admin' | 'talent' | 'artist';
    avatar_url: string;
    avatar_object_key?: string;
    bio: string;
    lore?: string;
    tags?: string[];
    youtubeUrl?: string;
    twitchUrl?: string;
    tiktokUrl?: string;
  },
): Promise<AdminProfile | null> {
  const profileResult = await dbQuery(
    `
    UPDATE profiles
    SET full_name = $2,
        role = $3,
        avatar_url = $4,
      avatar_object_key = $5,
      bio = $6,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, user_id, email, full_name, role, avatar_url, avatar_object_key, bio, created_at, updated_at
    `,
    [profileId, input.full_name, input.role, input.avatar_url, input.avatar_object_key || null, input.bio],
  );

  if (profileResult.rowCount === 0) {
    return null;
  }

  const profileRow = profileResult.rows[0];

  if (input.role === 'talent') {
    const talentUpdateResult = await dbQuery(
      `
      UPDATE talent_profiles
      SET stage_name = $2,
        character_description = $3,
        social_links = $4::jsonb,
        tags = $5,
        updated_at = NOW()
      WHERE user_id = $1
      `,
      [
        profileRow.user_id,
        input.full_name || profileRow.email,
        input.lore || null,
        JSON.stringify({
          youtubeUrl: input.youtubeUrl || null,
          twitchUrl: input.twitchUrl || null,
          tiktokUrl: input.tiktokUrl || null,
        }),
        input.tags || [],
      ],
    );

    if ((talentUpdateResult.rowCount || 0) === 0) {
      await dbQuery(
        `
        INSERT INTO talent_profiles (user_id, stage_name, character_description, social_links, tags, is_published)
        VALUES ($1, $2, $3, $4::jsonb, $5, true)
        `,
        [
          profileRow.user_id,
          input.full_name || profileRow.email,
          input.lore || null,
          JSON.stringify({
            youtubeUrl: input.youtubeUrl || null,
            twitchUrl: input.twitchUrl || null,
            tiktokUrl: input.tiktokUrl || null,
          }),
          input.tags || [],
        ],
      );
    }
  }

  return {
    id: profileRow.id,
    user_id: profileRow.user_id,
    email: profileRow.email,
    full_name: safeString(profileRow.full_name, 'No name'),
    role: profileRow.role,
    avatar_url: safeString(profileRow.avatar_url, DEFAULT_AVATAR),
    avatar_object_key: profileRow.avatar_object_key || undefined,
    bio: safeString(profileRow.bio),
    created_at: profileRow.created_at,
    updated_at: profileRow.updated_at,
    lore: input.lore,
    tags: input.tags || [],
    youtubeUrl: input.youtubeUrl,
    twitchUrl: input.twitchUrl,
    tiktokUrl: input.tiktokUrl,
  };
}

export async function deleteAdminProfile(profileId: string): Promise<boolean> {
  return deleteAdminUser(profileId);
}

export async function getAdminEvents(): Promise<AdminEvent[]> {
  await ensureColumn('events', 'featured BOOLEAN NOT NULL DEFAULT false', 'featured');
  const supportsImageObjectKey = await hasColumn('events', 'image_object_key');
  const supportsFeatured = await hasColumn('events', 'featured');
  const result = await dbQuery(
    supportsImageObjectKey && supportsFeatured
      ? `
    SELECT id, title, description, event_date, location, image_url, image_object_key, category, is_published, featured
    FROM events
    ORDER BY event_date DESC
    `
      : supportsImageObjectKey
      ? `
    SELECT id, title, description, event_date, location, image_url, image_object_key, category, is_published, false AS featured
    FROM events
    ORDER BY event_date DESC
    `
      : supportsFeatured
      ? `
    SELECT id, title, description, event_date, location, image_url, NULL::text AS image_object_key, category, is_published, featured
    FROM events
    ORDER BY event_date DESC
    `
      : `
    SELECT id, title, description, event_date, location, image_url, NULL::text AS image_object_key, category, is_published, false AS featured
    FROM events
    ORDER BY event_date DESC
    `,
  );

  const rows = result.rows as AdminEventRow[];

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: safeString(row.description),
    event_date: row.event_date,
    location: safeString(row.location),
    image_url: resolveRenderableImageUrl(row.image_url, row.image_object_key),
    image_object_key: row.image_object_key || undefined,
    category: safeString(row.category, 'other'),
    is_published: Boolean(row.is_published),
    featured: Boolean(row.featured),
  }));
}

export async function createAdminGalleryItem(input: Omit<AdminGalleryItem, 'id'>): Promise<AdminGalleryItem> {
  await ensureColumn('gallery_items', 'featured BOOLEAN NOT NULL DEFAULT false', 'featured');
  const supportsImageObjectKey = await hasColumn('gallery_items', 'image_object_key');
  const supportsFeatured = await hasColumn('gallery_items', 'featured');
  const result = await dbQuery(
    supportsImageObjectKey && supportsFeatured
      ? `
    INSERT INTO gallery_items (title, image_url, image_object_key, description, category, artist_name, is_published, featured)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, title, image_url, image_object_key, description, category, artist_name, is_published, featured
    `
      : supportsImageObjectKey
      ? `
    INSERT INTO gallery_items (title, image_url, image_object_key, description, category, artist_name, is_published)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, title, image_url, image_object_key, description, category, artist_name, is_published, false AS featured
    `
      : supportsFeatured
      ? `
    INSERT INTO gallery_items (title, image_url, description, category, artist_name, is_published, featured)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, title, image_url, NULL::text AS image_object_key, description, category, artist_name, is_published, featured
    `
      : `
    INSERT INTO gallery_items (title, image_url, description, category, artist_name, is_published)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, title, image_url, NULL::text AS image_object_key, description, category, artist_name, is_published, false AS featured
    `,
    supportsImageObjectKey && supportsFeatured
      ? [input.title, input.image_url, input.image_object_key || null, input.description, input.category, input.artist_name, input.is_published, input.featured]
      : supportsImageObjectKey
        ? [input.title, input.image_url, input.image_object_key || null, input.description, input.category, input.artist_name, input.is_published]
        : supportsFeatured
          ? [input.title, input.image_url, input.description, input.category, input.artist_name, input.is_published, input.featured]
          : [input.title, input.image_url, input.description, input.category, input.artist_name, input.is_published],
  );

  const row = result.rows[0] as AdminGalleryItemRow;

  return {
    id: row.id,
    title: row.title,
    image_url: resolveRenderableImageUrl(row.image_url, row.image_object_key),
    image_object_key: row.image_object_key || undefined,
    description: safeString(row.description),
    category: safeString(row.category, 'other'),
    artist_name: safeString(row.artist_name, 'Unknown Artist'),
    is_published: Boolean(row.is_published),
    featured: Boolean(row.featured),
  };
}

export async function updateAdminGalleryItem(id: string, input: Partial<Omit<AdminGalleryItem, 'id'>>): Promise<AdminGalleryItem | null> {
  await ensureColumn('gallery_items', 'featured BOOLEAN NOT NULL DEFAULT false', 'featured');
  const supportsImageObjectKey = await hasColumn('gallery_items', 'image_object_key');
  const supportsFeatured = await hasColumn('gallery_items', 'featured');
  const currentResult = await dbQuery(
    supportsImageObjectKey && supportsFeatured
      ? `
    SELECT id, title, image_url, image_object_key, description, category, artist_name, is_published, featured
    FROM gallery_items
    WHERE id = $1
    LIMIT 1
    `
      : supportsImageObjectKey
      ? `
    SELECT id, title, image_url, image_object_key, description, category, artist_name, is_published, false AS featured
    FROM gallery_items
    WHERE id = $1
    LIMIT 1
    `
      : supportsFeatured
      ? `
    SELECT id, title, image_url, NULL::text AS image_object_key, description, category, artist_name, is_published, featured
    FROM gallery_items
    WHERE id = $1
    LIMIT 1
    `
      : `
    SELECT id, title, image_url, NULL::text AS image_object_key, description, category, artist_name, is_published, false AS featured
    FROM gallery_items
    WHERE id = $1
    LIMIT 1
    `,
    [id],
  );

  if (currentResult.rowCount === 0) {
    return null;
  }

  const currentRow = currentResult.rows[0] as AdminGalleryItemRow;
  const merged = {
    title: input.title ?? currentRow.title,
    image_url: input.image_url ?? safeString(currentRow.image_url),
    image_object_key: input.image_object_key ?? currentRow.image_object_key ?? undefined,
    description: input.description ?? safeString(currentRow.description),
    category: input.category ?? safeString(currentRow.category, 'other'),
    artist_name: input.artist_name ?? safeString(currentRow.artist_name, 'Unknown Artist'),
    is_published: typeof input.is_published === 'boolean' ? input.is_published : Boolean(currentRow.is_published),
    featured: typeof input.featured === 'boolean' ? input.featured : Boolean(currentRow.featured),
  };

  const result = await dbQuery(
    supportsImageObjectKey && supportsFeatured
      ? `
    UPDATE gallery_items
    SET title = $2,
        image_url = $3,
        image_object_key = $4,
        description = $5,
        category = $6,
        artist_name = $7,
        is_published = $8,
        featured = $9,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, title, image_url, image_object_key, description, category, artist_name, is_published, featured
    `
      : supportsImageObjectKey
      ? `
    UPDATE gallery_items
    SET title = $2,
        image_url = $3,
        image_object_key = $4,
        description = $5,
        category = $6,
        artist_name = $7,
        is_published = $8,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, title, image_url, image_object_key, description, category, artist_name, is_published, false AS featured
    `
      : supportsFeatured
      ? `
    UPDATE gallery_items
    SET title = $2,
        image_url = $3,
        description = $4,
        category = $5,
        artist_name = $6,
        is_published = $7,
        featured = $8,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, title, image_url, NULL::text AS image_object_key, description, category, artist_name, is_published, featured
    `
      : `
    UPDATE gallery_items
    SET title = $2,
        image_url = $3,
        description = $4,
        category = $5,
        artist_name = $6,
        is_published = $7,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, title, image_url, NULL::text AS image_object_key, description, category, artist_name, is_published, false AS featured
    `,
    supportsImageObjectKey && supportsFeatured
      ? [id, merged.title, merged.image_url, merged.image_object_key || null, merged.description, merged.category, merged.artist_name, merged.is_published, merged.featured]
      : supportsImageObjectKey
      ? [id, merged.title, merged.image_url, merged.image_object_key || null, merged.description, merged.category, merged.artist_name, merged.is_published]
      : supportsFeatured
      ? [id, merged.title, merged.image_url, merged.description, merged.category, merged.artist_name, merged.is_published, merged.featured]
      : [id, merged.title, merged.image_url, merged.description, merged.category, merged.artist_name, merged.is_published],
  );

  if (!result.rowCount) {
    return null;
  }

  const row = result.rows[0] as AdminGalleryItemRow;
  return {
    id: row.id,
    title: row.title,
    image_url: resolveRenderableImageUrl(row.image_url, row.image_object_key),
    image_object_key: row.image_object_key || undefined,
    description: safeString(row.description),
    category: safeString(row.category, 'other'),
    artist_name: safeString(row.artist_name, 'Unknown Artist'),
    is_published: Boolean(row.is_published),
    featured: Boolean(row.featured),
  };
}

export async function deleteAdminGalleryItem(id: string): Promise<boolean> {
  const result = await dbQuery('DELETE FROM gallery_items WHERE id = $1', [id]);
  return (result.rowCount || 0) > 0;
}

export async function getAdminMerchandise(): Promise<AdminMerchandiseItem[]> {
  const supportsImageObjectKey = await hasColumn('merchandise', 'image_object_key');
  const result = await dbQuery(
    supportsImageObjectKey
      ? `
    SELECT
      m.id,
      m.name,
      m.description,
      m.price,
      m.category,
      m.stock,
      m.image_url,
      m.image_object_key,
      COALESCE(tp.stage_name, 'StarMy') AS talent_name,
      m.is_published
    FROM merchandise m
    LEFT JOIN talent_profiles tp ON tp.id = m.talent_id
    ORDER BY m.created_at DESC
    `
      : `
    SELECT
      m.id,
      m.name,
      m.description,
      m.price,
      m.category,
      m.stock,
      m.image_url,
      NULL::text AS image_object_key,
      COALESCE(tp.stage_name, 'StarMy') AS talent_name,
      m.is_published
    FROM merchandise m
    LEFT JOIN talent_profiles tp ON tp.id = m.talent_id
    ORDER BY m.created_at DESC
    `,
  );

  const rows = result.rows as Array<{
    id: string;
    name: string | null;
    description: string | null;
    price: string | number | null;
    category: string | null;
    stock: string | number | null;
    image_url: string | null;
    image_object_key: string | null;
    talent_name: string | null;
    is_published: boolean;
  }>;

  return rows.map((row) => ({
    id: row.id,
    name: safeString(row.name, 'Unnamed item'),
    description: safeString(row.description),
    price: Number(row.price),
    category: safeString(row.category, 'other'),
    stock: Number(row.stock),
    image_url: resolveRenderableImageUrl(row.image_url, row.image_object_key),
    image_object_key: row.image_object_key || undefined,
    talent_name: safeString(row.talent_name, 'StarMy'),
    is_published: Boolean(row.is_published),
  }));
}

async function resolveTalentProfileId(talentName: string): Promise<string | null> {
  const trimmedName = talentName.trim();
  if (!trimmedName) {
    return null;
  }

  const result = await dbQuery(
    `
    SELECT id
    FROM talent_profiles
    WHERE id = $1 OR stage_name = $1
    LIMIT 1
    `,
    [trimmedName],
  );

  return (result.rows[0]?.id as string | undefined) ?? null;
}

export async function createAdminMerchandise(input: Omit<AdminMerchandiseItem, 'id'>): Promise<AdminMerchandiseItem> {
  const supportsImageObjectKey = await hasColumn('merchandise', 'image_object_key');
  const talentId = await resolveTalentProfileId(input.talent_name);

  const result = await dbQuery(
    supportsImageObjectKey
      ? `
    INSERT INTO merchandise (name, description, price, image_url, image_object_key, category, talent_id, stock, is_published)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, name, description, price, category, stock, image_url, image_object_key, is_published
    `
      : `
    INSERT INTO merchandise (name, description, price, image_url, category, talent_id, stock, is_published)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, name, description, price, category, stock, image_url, NULL::text AS image_object_key, is_published
    `,
    supportsImageObjectKey
      ? [input.name, input.description, input.price, input.image_url, input.image_object_key || null, input.category, talentId, input.stock, input.is_published]
      : [input.name, input.description, input.price, input.image_url, input.category, talentId, input.stock, input.is_published],
  );

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    description: safeString(row.description),
    price: Number(row.price),
    category: safeString(row.category, 'other'),
    stock: Number(row.stock),
    image_url: resolveRenderableImageUrl(row.image_url, row.image_object_key),
    image_object_key: row.image_object_key || undefined,
    talent_name: input.talent_name,
    is_published: Boolean(row.is_published),
  };
}

export async function updateAdminMerchandise(id: string, input: Partial<Omit<AdminMerchandiseItem, 'id'>>): Promise<AdminMerchandiseItem | null> {
  const supportsImageObjectKey = await hasColumn('merchandise', 'image_object_key');
  const currentResult = await dbQuery(
    supportsImageObjectKey
      ? `
    SELECT id, name, description, price, category, stock, image_url, image_object_key, is_published, talent_id
    FROM merchandise
    WHERE id = $1
    LIMIT 1
    `
      : `
    SELECT id, name, description, price, category, stock, image_url, NULL::text AS image_object_key, is_published, talent_id
    FROM merchandise
    WHERE id = $1
    LIMIT 1
    `,
    [id],
  );

  if (currentResult.rowCount === 0) {
    return null;
  }

  const currentRow = currentResult.rows[0] as {
    id: string;
    name: string;
    description: string | null;
    price: string | number;
    category: string;
    stock: string | number | null;
    image_url: string | null;
    image_object_key: string | null;
    is_published: boolean;
    talent_id: string | null;
  };

  const merged = {
    name: input.name ?? currentRow.name,
    description: input.description ?? safeString(currentRow.description),
    price: typeof input.price === 'number' ? input.price : Number(currentRow.price),
    category: input.category ?? safeString(currentRow.category, 'other'),
    stock: typeof input.stock === 'number' ? input.stock : Number(currentRow.stock || 0),
    image_url: input.image_url ?? safeString(currentRow.image_url),
    image_object_key: input.image_object_key ?? currentRow.image_object_key ?? undefined,
    talent_name: input.talent_name ?? (currentRow.talent_id ? currentRow.talent_id : 'StarMy'),
    is_published: typeof input.is_published === 'boolean' ? input.is_published : Boolean(currentRow.is_published),
  };

  const talentId = await resolveTalentProfileId(merged.talent_name);

  const result = await dbQuery(
    supportsImageObjectKey
      ? `
    UPDATE merchandise
    SET name = $2,
        description = $3,
        price = $4,
        image_url = $5,
        image_object_key = $6,
        category = $7,
        talent_id = $8,
        stock = $9,
        is_published = $10,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, name, description, price, category, stock, image_url, image_object_key, is_published
    `
      : `
    UPDATE merchandise
    SET name = $2,
        description = $3,
        price = $4,
        image_url = $5,
        category = $6,
        talent_id = $7,
        stock = $8,
        is_published = $9,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, name, description, price, category, stock, image_url, NULL::text AS image_object_key, is_published
    `,
    supportsImageObjectKey
      ? [id, merged.name, merged.description, merged.price, merged.image_url, merged.image_object_key || null, merged.category, talentId, merged.stock, merged.is_published]
      : [id, merged.name, merged.description, merged.price, merged.image_url, merged.category, talentId, merged.stock, merged.is_published],
  );

  if (result.rowCount === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    description: safeString(row.description),
    price: Number(row.price),
    category: safeString(row.category, 'other'),
    stock: Number(row.stock),
    image_url: resolveRenderableImageUrl(row.image_url, row.image_object_key),
    image_object_key: row.image_object_key || undefined,
    talent_name: merged.talent_name,
    is_published: Boolean(row.is_published),
  };
}

export async function deleteAdminMerchandise(id: string): Promise<boolean> {
  const result = await dbQuery('DELETE FROM merchandise WHERE id = $1', [id]);
  return (result.rowCount || 0) > 0;
}

export async function getAdminStatistics(): Promise<AdminStatistics> {
  const usersResult = await dbQuery(
    `
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE role = 'admin')::int AS admins,
      COUNT(*) FILTER (WHERE role = 'talent')::int AS talents,
      COUNT(*) FILTER (WHERE role = 'artist')::int AS artists,
      COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW()))::int AS new_this_month
    FROM profiles
    `,
  );

  const contentResult = await dbQuery(
    `
    SELECT
      (SELECT COUNT(*)::int FROM events) AS total_events,
      (SELECT COUNT(*)::int FROM events WHERE event_date >= NOW()) AS upcoming_events,
      (SELECT COUNT(*)::int FROM gallery_items) AS gallery_items,
      (SELECT COUNT(*)::int FROM merchandise) AS merchandise_items,
      (SELECT COUNT(*)::int FROM merchandise WHERE is_published = true) AS published_merch
    `,
  );

  const revenueResult = await dbQuery(
    `
    SELECT
      COALESCE(SUM(price * stock), 0)::numeric AS total_sales,
      COALESCE(AVG(NULLIF(price, 0)), 0)::numeric AS avg_order_value,
      COUNT(*)::int AS top_selling_items
    FROM merchandise
    WHERE is_published = true
    `,
  );

  const recentUsers = await dbQuery(
    `
    SELECT id::text AS id, full_name, created_at
    FROM profiles
    ORDER BY created_at DESC
    LIMIT 2
    `,
  );
  const recentEvents = await dbQuery(
    `
    SELECT id::text AS id, title, updated_at
    FROM events
    ORDER BY updated_at DESC
    LIMIT 1
    `,
  );
  const recentGallery = await dbQuery(
    `
    SELECT id::text AS id, title, updated_at
    FROM gallery_items
    ORDER BY updated_at DESC
    LIMIT 1
    `,
  );
  const recentMerch = await dbQuery(
    `
    SELECT id::text AS id, name, updated_at
    FROM merchandise
    ORDER BY updated_at DESC
    LIMIT 1
    `,
  );

  const usersRow = usersResult.rows[0];
  const contentRow = contentResult.rows[0];
  const revenueRow = revenueResult.rows[0];

  const recentUserRows = recentUsers.rows as RecentUserRow[];
  const recentEventRows = recentEvents.rows as RecentEventRow[];
  const recentGalleryRows = recentGallery.rows as RecentGalleryRow[];
  const recentMerchRows = recentMerch.rows as RecentMerchRow[];

  const recentActivity: AdminStatistics['recentActivity'] = [
    ...recentUserRows.map((row) => ({
      id: `user-${row.id}`,
      type: 'user' as const,
      action: 'New user profile created',
      detail: safeString(row.full_name, 'Unnamed user'),
      time: formatRelativeTime(row.created_at),
    })),
    ...recentEventRows.map((row) => ({
      id: `event-${row.id}`,
      type: 'event' as const,
      action: 'Event updated',
      detail: safeString(row.title),
      time: formatRelativeTime(row.updated_at),
    })),
    ...recentGalleryRows.map((row) => ({
      id: `gallery-${row.id}`,
      type: 'gallery' as const,
      action: 'Gallery item updated',
      detail: safeString(row.title),
      time: formatRelativeTime(row.updated_at),
    })),
    ...recentMerchRows.map((row) => ({
      id: `merch-${row.id}`,
      type: 'merch' as const,
      action: 'Merchandise updated',
      detail: safeString(row.name),
      time: formatRelativeTime(row.updated_at),
    })),
  ].slice(0, 6);

  return {
    users: {
      total: Number(usersRow.total || 0),
      admins: Number(usersRow.admins || 0),
      talents: Number(usersRow.talents || 0),
      artists: Number(usersRow.artists || 0),
      newThisMonth: Number(usersRow.new_this_month || 0),
    },
    content: {
      totalEvents: Number(contentRow.total_events || 0),
      upcomingEvents: Number(contentRow.upcoming_events || 0),
      galleryItems: Number(contentRow.gallery_items || 0),
      merchandiseItems: Number(contentRow.merchandise_items || 0),
      publishedMerch: Number(contentRow.published_merch || 0),
    },
    engagement: {
      pageViews: 0,
      uniqueVisitors: 0,
      avgSessionDuration: 'N/A',
      bounceRate: 'N/A',
    },
    revenue: {
      totalSales: Number(revenueRow.total_sales || 0),
      avgOrderValue: Number(revenueRow.avg_order_value || 0),
      topSellingItems: Number(revenueRow.top_selling_items || 0),
      conversionRate: 'N/A',
    },
    recentActivity,
  };
}
