import 'server-only';

import { dbQuery } from '@/lib/database';
import {
  fallbackArtists,
  fallbackEvents,
  fallbackGalleryItems,
  fallbackStoreItems,
  fallbackTalents,
} from './fallback';
import type { ArtistProfile, EventArticle, GalleryEntry, StoreItem, Talent } from './types';

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=starmy';
const DEFAULT_IMAGE = 'https://placehold.co/800x400/a855f7/ffffff?text=StarMy';
const schemaColumnCache = new Map<string, boolean>();

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

async function tryQuery<T>(text: string, params: unknown[] = []): Promise<T[] | null> {
  try {
    const result = await dbQuery(text, params);
    return result.rows as T[];
  } catch {
    return null;
  }
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

export async function getTalents(): Promise<Talent[]> {
  const supportsTalentProfiles = await hasColumn('talent_profiles', 'user_id');
  const supportsTalentPublished = supportsTalentProfiles && (await hasColumn('talent_profiles', 'is_published'));

  const rows = await tryQuery<{
    id: string;
    stage_name: string | null;
    full_name: string | null;
    character_description: string | null;
    bio: string | null;
    avatar_url: string | null;
    tags: string[] | null;
    social_links: unknown;
  }>(
    supportsTalentProfiles
      ? `
    SELECT
      COALESCE(tp.id::text, p.id::text) AS id,
      tp.stage_name,
      p.full_name,
      tp.character_description,
      p.bio,
      p.avatar_url,
      tp.tags,
      tp.social_links
    FROM profiles p
    LEFT JOIN talent_profiles tp ON tp.user_id = p.user_id
    WHERE p.role = 'talent'
      AND ${supportsTalentPublished ? 'COALESCE(tp.is_published, true) = true' : '1=1'}
    ORDER BY p.created_at DESC
    `
      : `
    SELECT
      p.id::text AS id,
      NULL::text AS stage_name,
      p.full_name,
      NULL::text AS character_description,
      p.bio,
      p.avatar_url,
      NULL::text[] AS tags,
      NULL::jsonb AS social_links
    FROM profiles p
    WHERE p.role = 'talent'
    ORDER BY p.created_at DESC
    `,
  );

  if (!rows || rows.length === 0) {
    return fallbackTalents;
  }

  return rows.map((row) => {
    const social = asRecord(row.social_links);

    const tiktok = typeof social.tiktok === 'string' ? social.tiktok : typeof social.tiktokUrl === 'string' ? social.tiktokUrl : undefined;
    const twitch = typeof social.twitch === 'string' ? social.twitch : typeof social.twitchUrl === 'string' ? social.twitchUrl : undefined;
    const youtube = typeof social.youtube === 'string' ? social.youtube : typeof social.youtubeUrl === 'string' ? social.youtubeUrl : undefined;

    return {
      id: row.id,
      name: row.stage_name || row.full_name || 'Unnamed Talent',
      description: row.character_description || row.bio || 'No description available yet.',
      avatar: row.avatar_url || DEFAULT_AVATAR,
      tags: row.tags || [],
      tiktokUrl: tiktok,
      twitchUrl: twitch,
      youtubeUrl: youtube,
      featured: false,
      lore: undefined,
      characterInfo: undefined,
      schedule: Array.isArray(social.schedule) ? (social.schedule as Talent['schedule']) : undefined,
      portfolio: [],
    };
  });
}

export async function getTalentById(id: string): Promise<Talent | null> {
  const talents = await getTalents();
  return talents.find(talent => talent.id === id) || null;
}

export async function getArtists(): Promise<ArtistProfile[]> {
  const rows = await tryQuery<{
    id: string;
    full_name: string | null;
    email: string | null;
    bio: string | null;
    avatar_url: string | null;
  }>(
    `
    SELECT
      p.id,
      p.full_name,
      p.email,
      p.bio,
      p.avatar_url
    FROM profiles p
    WHERE p.role = 'artist'
    ORDER BY p.created_at DESC
    `,
  );

  if (!rows || rows.length === 0) {
    return fallbackArtists;
  }

  return rows.map((row) => ({
    id: row.id,
    name: row.full_name || 'Unnamed Artist',
    description: row.bio || 'Artist profile is being updated.',
    avatar: row.avatar_url || DEFAULT_AVATAR,
    specialty: ['Digital Art'],
    portfolio: [],
    commissionsOpen: true,
    priceRange: 'Contact for quote',
    contactEmail: row.email || 'contact@starmy.app',
    socialLinks: {},
  }));
}

export async function getArtistById(id: string): Promise<ArtistProfile | null> {
  const artists = await getArtists();
  return artists.find(artist => artist.id === id) || null;
}

export async function getEvents(): Promise<EventArticle[]> {
  await ensureColumn('events', 'featured BOOLEAN NOT NULL DEFAULT false', 'featured');
  const supportsFeatured = await hasColumn('events', 'featured');
  const rows = await tryQuery<{
    id: string;
    title: string;
    description: string | null;
    event_date: string;
    category: string | null;
    image_url: string | null;
    featured: boolean | null;
  }>(
    supportsFeatured
      ? `
    SELECT id, title, description, event_date, category, image_url, featured
    FROM events
    WHERE is_published = true
    ORDER BY event_date DESC
    `
      : `
    SELECT id, title, description, event_date, category, image_url, false AS featured
    FROM events
    WHERE is_published = true
    ORDER BY event_date DESC
    `,
  );

  if (!rows || rows.length === 0) {
    return fallbackEvents;
  }

  return rows.map(row => ({
    id: row.id,
    title: row.title,
    excerpt: row.description || 'No summary available yet.',
    content: row.description || '',
    date: row.event_date,
    category: (row.category as EventArticle['category']) || 'Events',
    image: row.image_url || DEFAULT_IMAGE,
    author: 'StarMy Team',
    featured: Boolean(row.featured),
  }));
}

export async function getStoreItems(): Promise<StoreItem[]> {
  const rows = await tryQuery<{
    id: string;
    name: string;
    description: string | null;
    price: number | string;
    image_url: string | null;
    category: string;
    stock: number;
    stage_name: string | null;
  }>(
    `
    SELECT
      m.id,
      m.name,
      m.description,
      m.price,
      m.image_url,
      m.category,
      m.stock,
      tp.stage_name
    FROM merchandise m
    LEFT JOIN talent_profiles tp ON tp.id = m.talent_id
    WHERE m.is_published = true
    ORDER BY m.created_at DESC
    `,
  );

  if (!rows || rows.length === 0) {
    return fallbackStoreItems;
  }

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    talent: row.stage_name || 'StarMy',
    price: Number(row.price),
    currency: 'MYR',
    image: row.image_url || 'https://placehold.co/400x400/a855f7/ffffff?text=Merchandise',
    category: row.category,
    inStock: row.stock > 0,
    description: row.description || 'No description available yet.',
  }));
}

export async function getGalleryItems(): Promise<GalleryEntry[]> {
  await ensureColumn('gallery_items', 'featured BOOLEAN NOT NULL DEFAULT false', 'featured');
  const supportsFeatured = await hasColumn('gallery_items', 'featured');
  const rows = await tryQuery<{
    id: string;
    title: string;
    description: string | null;
    image_url: string;
    category: string;
    created_at: string;
    featured: boolean | null;
  }>(
    supportsFeatured
      ? `
    SELECT id, title, description, image_url, category, created_at, featured
    FROM gallery_items
    WHERE is_published = true
    ORDER BY created_at DESC
    `
      : `
    SELECT id, title, description, image_url, category, created_at, false AS featured
    FROM gallery_items
    WHERE is_published = true
    ORDER BY created_at DESC
    `,
  );

  if (!rows || rows.length === 0) {
    return fallbackGalleryItems;
  }

  return rows.map(row => ({
    id: row.id,
    title: row.title,
    description: row.description || 'No description available yet.',
    image: row.image_url,
    category: row.category,
    date: row.created_at,
    featured: Boolean(row.featured),
  }));
}
