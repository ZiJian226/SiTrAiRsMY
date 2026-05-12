import 'server-only';

import { dbQuery } from '@/lib/database';
import { resolveRenderableImageUrl } from '@/lib/objectStorage';
import {
  fallbackArtists,
  fallbackEvents,
  fallbackGalleryItems,
  fallbackStoreItems,
  fallbackTalents,
} from './fallback';
import type { PortraitPicture } from '@/lib/types';
import type { ArtistProfile, EventArticle, GalleryEntry, StoreItem, Talent } from './types';

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=starmy';
const DEFAULT_IMAGE = 'https://placehold.co/800x400/a855f7/ffffff?text=StarMy';
const schemaColumnCache = new Map<string, boolean>();

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function normalizeProfileImages(value: unknown): PortraitPicture[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => ({
      url: normalizeOptionalString(item.url) || '',
      object_key: normalizeOptionalString(item.object_key) || normalizeOptionalString(item.key),
    }))
    .filter((item) => item.url.length > 0);
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeDateValue(value: unknown): string | undefined {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return undefined;
    }
    return value.toISOString().slice(0, 10);
  }

  return normalizeOptionalString(value);
}

function normalizeSchedule(value: unknown): Talent['schedule'] {
  if (!Array.isArray(value)) {
    return undefined;
  }

  type NormalizedScheduleSlot = {
    id: string;
    day: string;
    time: string;
    title: string;
    platform: 'youtube' | 'twitch' | 'tiktok';
  };

  const normalized = value
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item, index) => {
      const day = normalizeOptionalString(item.day);
      const time = normalizeOptionalString(item.time);
      const title = normalizeOptionalString(item.title);
      const rawPlatform = normalizeOptionalString(item.platform)?.toLowerCase();
      const platform = rawPlatform === 'youtube' || rawPlatform === 'twitch' || rawPlatform === 'tiktok'
        ? rawPlatform
        : undefined;

      if (!day || !time || !title || !platform) {
        return null;
      }

      const id = normalizeOptionalString(item.id) || `slot-${index}`;

      return {
        id,
        day,
        time,
        title,
        platform,
      } as NormalizedScheduleSlot;
    })
    .filter((slot): slot is NormalizedScheduleSlot => Boolean(slot));

  return normalized.length > 0 ? normalized : undefined;
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

async function getProfilesByRole(role: 'talent' | 'staff'): Promise<Talent[]> {
  const supportsTalentProfiles = await hasColumn('talent_profiles', 'user_id');
  if (supportsTalentProfiles) {
    await ensureColumn('talent_profiles', "portrait_pictures JSONB DEFAULT '[]'::jsonb", 'portrait_pictures');
  }
  const supportsTalentPublished = supportsTalentProfiles && (await hasColumn('talent_profiles', 'is_published'));
  const supportsVtuberModel = supportsTalentProfiles && (await hasColumn('talent_profiles', 'vtuber_model_url'));
  const supportsProfilePicture = supportsTalentProfiles && (await hasColumn('talent_profiles', 'profile_picture_url'));
  const supportsPortraitPicture = supportsTalentProfiles && (await hasColumn('talent_profiles', 'portrait_picture_url'));
  const supportsPortraitPictures = supportsTalentProfiles && (await hasColumn('talent_profiles', 'portrait_pictures'));
  const supportsTalentFeatured = supportsTalentProfiles && (await hasColumn('talent_profiles', 'featured'));
  const supportsTalentDob = supportsTalentProfiles && (await hasColumn('talent_profiles', 'date_of_birth'));
  const supportsTalentDebut = supportsTalentProfiles && (await hasColumn('talent_profiles', 'debut_date'));
  const supportsTalentHeight = supportsTalentProfiles && (await hasColumn('talent_profiles', 'height'));
  const supportsTalentSpecies = supportsTalentProfiles && (await hasColumn('talent_profiles', 'species'));
  const supportsTalentLikes = supportsTalentProfiles && (await hasColumn('talent_profiles', 'likes'));
  const supportsTalentDislikes = supportsTalentProfiles && (await hasColumn('talent_profiles', 'dislikes'));
  const supportsTalentPortfolio = supportsTalentProfiles && (await hasColumn('talent_profiles', 'portfolio_links'));
  const supportsFeaturedVideo = supportsTalentProfiles && (await hasColumn('talent_profiles', 'featured_video_url'));

  const rows = await tryQuery<{
    id: string;
    role: string | null;
    stage_name: string | null;
    full_name: string | null;
    character_description: string | null;
    bio: string | null;
    avatar_url: string | null;
    tags: string[] | null;
    social_links: unknown;
    featured_video_url: string | null;
    vtuber_model_url: string | null;
    profile_picture_url: string | null;
    portrait_picture_url: string | null;
    portrait_pictures: unknown;
    featured: boolean | null;
    date_of_birth: string | null;
    debut_date: string | null;
    height: string | null;
    species: string | null;
    likes: string[] | null;
    dislikes: string[] | null;
    portfolio_links: string[] | null;
  }>(
    supportsTalentProfiles
      ? `
    SELECT
      COALESCE(tp.id::text, p.id::text) AS id,
      p.role,
      tp.stage_name,
      p.full_name,
      tp.character_description,
      p.bio,
      p.avatar_url,
      tp.tags,
      tp.social_links,
      ${supportsFeaturedVideo ? 'tp.featured_video_url' : 'NULL::text AS featured_video_url'},
      ${supportsVtuberModel ? 'tp.vtuber_model_url' : 'NULL::text AS vtuber_model_url'},
      ${supportsProfilePicture ? 'tp.profile_picture_url' : 'NULL::text AS profile_picture_url'},
      ${supportsPortraitPicture ? 'tp.portrait_picture_url' : 'NULL::text AS portrait_picture_url'},
      ${supportsPortraitPictures ? 'tp.portrait_pictures' : 'NULL::jsonb AS portrait_pictures'},
      ${supportsTalentFeatured ? 'tp.featured' : 'false AS featured'},
      ${supportsTalentDob ? 'tp.date_of_birth' : 'NULL::date AS date_of_birth'},
      ${supportsTalentDebut ? 'tp.debut_date' : 'NULL::date AS debut_date'},
      ${supportsTalentHeight ? 'tp.height' : 'NULL::text AS height'},
      ${supportsTalentSpecies ? 'tp.species' : 'NULL::text AS species'},
      ${supportsTalentLikes ? 'tp.likes' : 'ARRAY[]::text[] AS likes'},
      ${supportsTalentDislikes ? 'tp.dislikes' : 'ARRAY[]::text[] AS dislikes'},
      ${supportsTalentPortfolio ? 'tp.portfolio_links' : 'ARRAY[]::text[] AS portfolio_links'}
    FROM profiles p
    LEFT JOIN talent_profiles tp ON tp.user_id = p.user_id
    WHERE p.role = '${role}'
      AND ${supportsTalentPublished ? 'COALESCE(tp.is_published, true) = true' : '1=1'}
    ORDER BY p.created_at DESC
    `
      : `
    SELECT
      p.id::text AS id,
      p.role,
      NULL::text AS stage_name,
      p.full_name,
      NULL::text AS character_description,
      p.bio,
      p.avatar_url,
      NULL::text[] AS tags,
      NULL::jsonb AS social_links,
      NULL::text AS featured_video_url,
      NULL::text AS vtuber_model_url,
      NULL::text AS profile_picture_url,
      NULL::text AS portrait_picture_url,
      NULL::jsonb AS portrait_pictures,
      false AS featured,
      NULL::date AS date_of_birth,
      NULL::date AS debut_date,
      NULL::text AS height,
      NULL::text AS species,
      ARRAY[]::text[] AS likes,
      ARRAY[]::text[] AS dislikes,
      ARRAY[]::text[] AS portfolio_links
    FROM profiles p
    WHERE p.role = '${role}'
    ORDER BY p.created_at DESC
    `,
  );

  if (!rows || rows.length === 0) {
    return role === 'talent' ? fallbackTalents : [];
  }

  return rows.map((row) => {
    const social = asRecord(row.social_links);
    const tags = normalizeStringArray(row.tags);
    const likes = normalizeStringArray(row.likes);
    const dislikes = normalizeStringArray(row.dislikes);
    const portfolio = normalizeStringArray(row.portfolio_links);

    const tiktok = normalizeOptionalString(social.tiktok) || normalizeOptionalString(social.tiktokUrl);
    const twitch = normalizeOptionalString(social.twitch) || normalizeOptionalString(social.twitchUrl);
    const youtube = normalizeOptionalString(social.youtube) || normalizeOptionalString(social.youtubeUrl);

    const portraitPictures = normalizeProfileImages(row.portrait_pictures);

    return {
      id: row.id,
      role: row.role === 'staff' ? 'staff' : 'talent',
      name: row.stage_name || row.full_name || 'Unnamed Talent',
      description: row.character_description || row.bio || 'No description available yet.',
      avatar: row.avatar_url || DEFAULT_AVATAR,
      tags,
      tiktokUrl: tiktok,
      twitchUrl: twitch,
      youtubeUrl: youtube,
      featuredVideoUrl: normalizeOptionalString(row.featured_video_url),
      featured: Boolean(row.featured),
      characterInfo: {
        dateOfBirth: normalizeDateValue(row.date_of_birth),
        debutDate: normalizeDateValue(row.debut_date),
        height: row.height || undefined,
        species: row.species || undefined,
        likes,
        dislikes,
      },
      schedule: normalizeSchedule(social.schedule),
      portfolio,
      vtuberModelUrl: row.vtuber_model_url || undefined,
      profilePictureUrl: row.profile_picture_url || undefined,
      portraitPictureUrl: row.portrait_picture_url || undefined,
      portraitPictures: portraitPictures.length > 0 ? portraitPictures : undefined,
    };
  });
}

export async function getTalents(): Promise<Talent[]> {
  return getProfilesByRole('talent');
}

export async function getStaffs(): Promise<Talent[]> {
  return getProfilesByRole('staff');
}

export async function getTalentById(id: string): Promise<Talent | null> {
  const talents = await getProfilesByRole('talent');
  return talents.find(talent => talent.id === id) || null;
}

export async function getStaffById(id: string): Promise<Talent | null> {
  const staffs = await getProfilesByRole('staff');
  return staffs.find(staff => staff.id === id) || null;
}

export async function getArtists(): Promise<ArtistProfile[]> {
  const supportsArtistProfiles = await hasColumn('artist_profiles', 'user_id');
  if (supportsArtistProfiles) {
    await ensureColumn('artist_profiles', "portfolio_art_images JSONB DEFAULT '[]'::jsonb", 'portfolio_art_images');
  }
  const supportsArtistFeatured = supportsArtistProfiles && (await hasColumn('artist_profiles', 'featured'));
  const supportsPortfolioArt = supportsArtistProfiles && (await hasColumn('artist_profiles', 'portfolio_art'));
  const supportsPortfolioArtImages = supportsArtistProfiles && (await hasColumn('artist_profiles', 'portfolio_art_images'));
  const rows = await tryQuery<{
    id: string;
    artist_profile_id: string | null;
    full_name: string | null;
    email: string | null;
    bio: string | null;
    avatar_url: string | null;
    specialty: string[] | null;
    portfolio_links: string[] | null;
    commissions_open: boolean | null;
    price_range: string | null;
    contact_email: string | null;
    social_media_links: unknown;
    portfolio_art: string[] | null;
    portfolio_art_images: unknown;
    featured: boolean | null;
  }>(
    supportsArtistProfiles
      ? `
    SELECT
      p.id,
      ap.id AS artist_profile_id,
      p.full_name,
      p.email,
      p.bio,
      p.avatar_url,
      ap.specialty,
      ap.portfolio_links,
      ap.commissions_open,
      ap.price_range,
      ap.contact_email,
      ap.social_media_links,
      ${supportsPortfolioArt ? 'ap.portfolio_art' : 'ARRAY[]::text[] AS portfolio_art'},
      ${supportsPortfolioArtImages ? 'ap.portfolio_art_images' : 'NULL::jsonb AS portfolio_art_images'},
      ${supportsArtistFeatured ? 'ap.featured' : 'false AS featured'}
    FROM profiles p
    LEFT JOIN artist_profiles ap ON ap.user_id = p.user_id
    WHERE p.role = 'artist'
    ORDER BY p.created_at DESC
    `
      : `
    SELECT
      p.id,
      NULL::text AS artist_profile_id,
      p.full_name,
      p.email,
      p.bio,
      p.avatar_url,
      ARRAY['Digital Art']::text[] AS specialty,
      ARRAY[]::text[] AS portfolio_links,
      true AS commissions_open,
      'Contact for quote'::text AS price_range,
      NULL::text AS contact_email,
      NULL::jsonb AS social_media_links,
      ARRAY[]::text[] AS portfolio_art,
      NULL::jsonb AS portfolio_art_images,
      false AS featured
    FROM profiles p
    WHERE p.role = 'artist'
    ORDER BY p.created_at DESC
    `,
  );

  if (!rows || rows.length === 0) {
    return fallbackArtists;
  }

  const tablePortfolioArtImages = new Map<string, PortraitPicture[]>();
  const artistProfileIds = rows
    .map((row) => row.artist_profile_id)
    .filter((id): id is string => Boolean(id));

  if (artistProfileIds.length > 0) {
    const artRows = await tryQuery<{
      artist_id: string;
      image_url: string | null;
      image_object_key: string | null;
    }>(
      `SELECT artist_id, image_url, image_object_key
       FROM portfolio_art_images
       WHERE artist_id IN (${artistProfileIds.map((_, index) => `$${index + 1}`).join(',')})
       ORDER BY artist_id, sort_order`,
      artistProfileIds,
    );

    for (const artRow of artRows || []) {
      const url = normalizeOptionalString(artRow.image_url);
      if (!url) {
        continue;
      }

      const images = tablePortfolioArtImages.get(artRow.artist_id) || [];
      images.push({
        url,
        object_key: normalizeOptionalString(artRow.image_object_key),
      });
      tablePortfolioArtImages.set(artRow.artist_id, images);
    }
  }

  return rows.map((row) => {
    const social = asRecord(row.social_media_links);
    const x = typeof social.x === 'string' ? social.x : typeof social.twitter === 'string' ? social.twitter : undefined;
    const instagram = typeof social.instagram === 'string' ? social.instagram : undefined;
    const website = typeof social.website === 'string' ? social.website : undefined;

    const jsonPortfolioArtImages = normalizeProfileImages(row.portfolio_art_images);
    const fallbackPortfolioArtImages = row.artist_profile_id
      ? tablePortfolioArtImages.get(row.artist_profile_id) || []
      : [];
    const portfolioArtImages = jsonPortfolioArtImages.length > 0 ? jsonPortfolioArtImages : fallbackPortfolioArtImages;

    return {
      id: row.id,
      name: row.full_name || 'Unnamed Artist',
      description: row.bio || 'Artist profile is being updated.',
      avatar: row.avatar_url || DEFAULT_AVATAR,
      specialty: row.specialty && row.specialty.length > 0 ? row.specialty : ['Digital Art'],
      portfolio: row.portfolio_links || [],
      portfolioArt: row.portfolio_art || [],
      portfolioArtImages: portfolioArtImages.length > 0 ? portfolioArtImages : undefined,
      commissionsOpen: Boolean(row.commissions_open),
      priceRange: row.price_range || 'Contact for quote',
      contactEmail: row.contact_email || row.email || 'contact@starmy.app',
      socialLinks: {
        x,
        twitter: x,
        instagram,
        website,
      },
      featured: Boolean(row.featured),
    };
  });
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
    image: resolveRenderableImageUrl(row.image_url) || DEFAULT_IMAGE,
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
    image: resolveRenderableImageUrl(row.image_url) || 'https://placehold.co/400x400/a855f7/ffffff?text=Merchandise',
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

  return Promise.all(rows.map(async row => {
    // Fetch media items for this gallery item
    const mediaRows = await tryQuery<{
      id: string;
      media_type: string;
      media_url: string;
      is_primary: boolean;
    }>(
      `
      SELECT id, media_type, media_url, is_primary
      FROM gallery_media
      WHERE gallery_item_id = $1
      ORDER BY sort_order ASC, created_at ASC
      `,
      [row.id]
    );

    const media = mediaRows ? mediaRows.map(m => ({
      id: m.id,
      media_type: m.media_type as 'photo' | 'video',
      media_url: resolveRenderableImageUrl(m.media_url),
      is_primary: Boolean(m.is_primary),
    })) : undefined;

    return {
      id: row.id,
      title: row.title,
      description: row.description || 'No description available yet.',
      image: resolveRenderableImageUrl(row.image_url),
      category: row.category,
      date: row.created_at,
      featured: Boolean(row.featured),
      media: media && media.length > 0 ? media : undefined,
    };
  }));
}
