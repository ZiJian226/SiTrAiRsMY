import { dbQuery } from '@/lib/database'

export interface ProfileImage {
  url: string
  object_key?: string
}

// ============================================
// TALENT PROFILE TYPES
// ============================================

export interface TalentProfile {
  id: string
  user_id: string
  stage_name: string
  character_description: string
  debut_date: string | null
  bio: string | null
  avatar_url: string | null
  avatar_object_key: string | null
  date_of_birth: string | null
  height: string | null
  species: string | null
  likes: string[]
  dislikes: string[]
  tags: string[]
  portfolio_links: string[]
  vtuber_model_url: string | null
  profile_picture_url: string | null
  profile_picture_object_key: string | null
  portrait_picture_url: string | null
  portrait_picture_object_key: string | null
  portrait_pictures: ProfileImage[]
  profile_card_url: string | null
  support_url: string | null
  featured_video_url: string | null
  featured: boolean
  /** numeric ordering for featured display; lower = earlier */
  featuredOrder?: number
  social_links: Record<string, string | null>
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface ArtistProfile {
  id: string
  user_id: string
  specialty: string[]
  portfolio_links: string[]
  portfolio_art: string[]
  portfolio_art_images: ProfileImage[]
  commissions_open: boolean
  price_range: string | null
  contact_email: string | null
  featured: boolean
  /** numeric ordering for featured display; lower = earlier */
  featuredOrder?: number
  social_media_links: {
    twitter?: string | null
    x?: string | null
    instagram?: string | null
    website?: string | null
  }
  is_published: boolean
  created_at: string
  updated_at: string
}

// ============================================
// MERCHANDISE TYPES
// ============================================

export interface UserMerchandiseItem {
  id: string
  user_id: string
  name: string
  description: string | null
  price: string
  image_url: string | null
  image_object_key: string | null
  category: string
  stock: number
  is_published: boolean
  created_at: string
  updated_at: string
}

const schemaColumnCache = new Map<string, boolean>()

async function hasColumn(tableName: string, columnName: string): Promise<boolean> {
  const cacheKey = `${tableName}.${columnName}`
  const cached = schemaColumnCache.get(cacheKey)
  if (cached !== undefined) {
    return cached
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
    )

    const supported = result.rowCount > 0
    schemaColumnCache.set(cacheKey, supported)
    return supported
  } catch {
    schemaColumnCache.set(cacheKey, false)
    return false
  }
}

async function ensureColumn(tableName: string, columnDefinition: string, columnName: string): Promise<void> {
  if (await hasColumn(tableName, columnName)) {
    return
  }

  await dbQuery(`ALTER TABLE IF EXISTS ${tableName} ADD COLUMN IF NOT EXISTS ${columnDefinition}`)
  schemaColumnCache.set(`${tableName}.${columnName}`, true)
}

function normalizeProfileImages(value: unknown): ProfileImage[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => ({
      url: typeof item.url === 'string' ? item.url.trim() : '',
      object_key:
        typeof item.object_key === 'string'
          ? item.object_key
          : typeof item.key === 'string'
            ? item.key
            : undefined,
    }))
    .filter((item) => item.url.length > 0)
}

// ============================================
// TALENT PROFILE QUERIES
// ============================================

export async function getTalentProfileByUserId(userId: string): Promise<TalentProfile | null> {
  const supportsBioColumn = await hasColumn('talent_profiles', 'bio')
  const supportsDebutDateColumn = await hasColumn('talent_profiles', 'debut_date')
  const supportsVtuberModelColumn = await hasColumn('talent_profiles', 'vtuber_model_url')
  const supportsProfilePicture = await hasColumn('talent_profiles', 'profile_picture_url')
  const supportsPortraitPicture = await hasColumn('talent_profiles', 'portrait_picture_url')
  const supportsSupportUrl = await hasColumn('talent_profiles', 'support_url')
  const supportsPortraitPictures = await hasColumn('talent_profiles', 'portrait_pictures')
  const supportsFeaturedVideo = await hasColumn('talent_profiles', 'featured_video_url')
  const supportsFeatured = await hasColumn('talent_profiles', 'featured')
  const supportsProfileCardUrl = await hasColumn('talent_profiles', 'profile_card_url')
  const supportsFeaturedOrder = await hasColumn('talent_profiles', 'featured_order')
  const result = await dbQuery(
    `SELECT 
      id, user_id, stage_name, character_description,
      ${supportsDebutDateColumn ? 'debut_date' : 'NULL::date AS debut_date'},
      ${supportsBioColumn ? 'bio' : 'character_description AS bio'},
      avatar_url, avatar_object_key, date_of_birth, 
      height, species, likes, dislikes, tags, portfolio_links,
      ${supportsVtuberModelColumn ? 'vtuber_model_url' : 'NULL::text AS vtuber_model_url'},
      ${supportsProfilePicture ? 'profile_picture_url' : 'NULL::text AS profile_picture_url'},
      ${supportsProfilePicture ? 'profile_picture_object_key' : 'NULL::text AS profile_picture_object_key'},
      ${supportsPortraitPicture ? 'portrait_picture_url' : 'NULL::text AS portrait_picture_url'},
        ${supportsProfileCardUrl ? 'profile_card_url' : 'NULL::text AS profile_card_url'},
      ${supportsSupportUrl ? 'support_url' : 'NULL::text AS support_url'},
      ${supportsPortraitPicture ? 'portrait_picture_object_key' : 'NULL::text AS portrait_picture_object_key'},
      ${supportsPortraitPictures ? 'portrait_pictures' : "'[]'::jsonb AS portrait_pictures"},
      ${supportsFeaturedVideo ? 'featured_video_url' : 'NULL::text AS featured_video_url'},
      ${supportsFeatured ? 'featured' : 'false AS featured'},
      ${supportsFeaturedOrder ? 'featured_order' : 'NULL::integer AS featured_order'},
      social_links, is_published, created_at, updated_at
     FROM talent_profiles 
     WHERE user_id = $1`,
    [userId]
  )
  const row = result.rows[0]
  if (!row) {
    return null
  }

  const portraitPictures = normalizeProfileImages(row.portrait_pictures)
  return {
    ...row,
      profile_card_url: row.profile_card_url || null,
    support_url: row.support_url || null,
    portrait_pictures: portraitPictures.length > 0
      ? portraitPictures
      : row.portrait_picture_url
        ? [{ url: row.portrait_picture_url, object_key: row.portrait_picture_object_key || undefined }]
        : [],
  }
}

export async function updateTalentProfile(
  userId: string,
  data: Partial<TalentProfile>
): Promise<TalentProfile> {
  // Get user's email/name for fallback stage_name
  const userResult = await dbQuery(
    `SELECT email, full_name FROM profiles WHERE user_id = $1 LIMIT 1`,
    [userId],
  )
  const userRow = userResult.rows[0] as { email: string; full_name: string | null } | undefined
  const defaultStageName = userRow?.full_name || userRow?.email || 'User'

  // Ensure a talent_profiles row exists for this user so UPDATE statements succeed
  await dbQuery(
    `INSERT INTO talent_profiles (user_id, stage_name)
     VALUES ($1, $2)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId, defaultStageName],
  )
  const supportsBioColumn = await hasColumn('talent_profiles', 'bio')
  const supportsDebutDateColumn = await hasColumn('talent_profiles', 'debut_date')
  const supportsVtuberModelColumn = await hasColumn('talent_profiles', 'vtuber_model_url')
  const supportsProfilePicture = await hasColumn('talent_profiles', 'profile_picture_url')
  const supportsPortraitPicture = await hasColumn('talent_profiles', 'portrait_picture_url')
  const supportsProfileCardUrl = await hasColumn('talent_profiles', 'profile_card_url')
  await ensureColumn('talent_profiles', "portrait_pictures JSONB DEFAULT '[]'::jsonb", 'portrait_pictures')
  await ensureColumn('talent_profiles', 'profile_card_url TEXT', 'profile_card_url')
  await ensureColumn('talent_profiles', "support_url TEXT", 'support_url')
  // ensure featured_order column exists for ordering featured profiles
  await ensureColumn('talent_profiles', 'featured_order INTEGER', 'featured_order')
  const supportsPortraitPictures = await hasColumn('talent_profiles', 'portrait_pictures')
  const supportsSupportUrl = await hasColumn('talent_profiles', 'support_url')
  const supportsFeaturedVideo = await hasColumn('talent_profiles', 'featured_video_url')
  const supportsFeatured = await hasColumn('talent_profiles', 'featured')
  const updates: string[] = []
  const values: unknown[] = []
  let paramCount = 1

  if (data.stage_name !== undefined) {
    updates.push(`stage_name = $${paramCount++}`)
    // Ensure stage_name is never empty - database requires NOT NULL
    values.push(data.stage_name && data.stage_name.trim() ? data.stage_name : '')
  }
  if (data.character_description !== undefined) {
    updates.push(`character_description = $${paramCount++}`)
    values.push(data.character_description)
  }
  if (data.bio !== undefined) {
    updates.push(`${supportsBioColumn ? 'bio' : 'character_description'} = $${paramCount++}`)
    values.push(data.bio)
  }
  if (data.avatar_url !== undefined) {
    updates.push(`avatar_url = $${paramCount++}`)
    values.push(data.avatar_url)
  }
  if (data.avatar_object_key !== undefined) {
    updates.push(`avatar_object_key = $${paramCount++}`)
    values.push(data.avatar_object_key)
  }
  if (data.date_of_birth !== undefined) {
    updates.push(`date_of_birth = $${paramCount++}`)
    values.push(data.date_of_birth)
  }
  if (data.debut_date !== undefined && supportsDebutDateColumn) {
    updates.push(`debut_date = $${paramCount++}`)
    values.push(data.debut_date)
  }
  if (data.height !== undefined) {
    updates.push(`height = $${paramCount++}`)
    values.push(data.height)
  }
  if (data.species !== undefined) {
    updates.push(`species = $${paramCount++}`)
    values.push(data.species)
  }
  if (data.likes !== undefined) {
    updates.push(`likes = $${paramCount++}`)
    values.push(data.likes)
  }
  if (data.dislikes !== undefined) {
    updates.push(`dislikes = $${paramCount++}`)
    values.push(data.dislikes)
  }
  if (data.tags !== undefined) {
    updates.push(`tags = $${paramCount++}`)
    values.push(data.tags)
  }
  if (data.portfolio_links !== undefined) {
    updates.push(`portfolio_links = $${paramCount++}`)
    values.push(data.portfolio_links)
  }
  if (data.vtuber_model_url !== undefined && supportsVtuberModelColumn) {
    updates.push(`vtuber_model_url = $${paramCount++}`)
    values.push(data.vtuber_model_url)
  }
  if (data.profile_picture_url !== undefined && supportsProfilePicture) {
    updates.push(`profile_picture_url = $${paramCount++}`)
    values.push(data.profile_picture_url)
  }
  if (data.profile_picture_object_key !== undefined && supportsProfilePicture) {
    updates.push(`profile_picture_object_key = $${paramCount++}`)
    values.push(data.profile_picture_object_key)
  }
  if (data.portrait_picture_url !== undefined && supportsPortraitPicture) {
    updates.push(`portrait_picture_url = $${paramCount++}`)
    values.push(data.portrait_picture_url)
  }
  if (data.portrait_picture_object_key !== undefined && supportsPortraitPicture) {
    updates.push(`portrait_picture_object_key = $${paramCount++}`)
    values.push(data.portrait_picture_object_key)
  }
  if (data.profile_card_url !== undefined && supportsProfileCardUrl) {
    updates.push(`profile_card_url = $${paramCount++}`)
    values.push(data.profile_card_url)
  }
  if (data.support_url !== undefined && supportsSupportUrl) {
    updates.push(`support_url = $${paramCount++}`)
    values.push(data.support_url)
  }
  if (data.portrait_pictures !== undefined && supportsPortraitPictures) {
    updates.push(`portrait_pictures = $${paramCount++}::jsonb`)
    values.push(JSON.stringify(normalizeProfileImages(data.portrait_pictures)))
  }
  if (data.featured_video_url !== undefined && supportsFeaturedVideo) {
    updates.push(`featured_video_url = $${paramCount++}`)
    values.push(data.featured_video_url)
  }
  if (data.featured !== undefined && supportsFeatured) {
    updates.push(`featured = $${paramCount++}`)
    values.push(data.featured)
  }
  if ((data as any).featuredOrder !== undefined) {
    updates.push(`featured_order = $${paramCount++}`)
    values.push((data as any).featuredOrder)
  }
  if (data.social_links !== undefined) {
    updates.push(`social_links = $${paramCount++}`)
    values.push(JSON.stringify(data.social_links))
  }
  if (data.is_published !== undefined) {
    updates.push(`is_published = $${paramCount++}`)
    values.push(data.is_published)
  }

  // Always update updated_at timestamp
  updates.push(`updated_at = NOW()`)

  values.push(userId)

  const result = await dbQuery(
    `UPDATE talent_profiles 
     SET ${updates.join(', ')}
     WHERE user_id = $${paramCount}
     RETURNING id, user_id, stage_name, character_description,
       ${supportsDebutDateColumn ? 'debut_date' : 'NULL::date AS debut_date'},
       ${supportsBioColumn ? 'bio' : 'character_description AS bio'},
      avatar_url, avatar_object_key, date_of_birth, 
       height, species, likes, dislikes, tags, portfolio_links,
       ${supportsVtuberModelColumn ? 'vtuber_model_url' : 'NULL::text AS vtuber_model_url'},
      ${supportsProfilePicture ? 'profile_picture_url' : 'NULL::text AS profile_picture_url'},
      ${supportsProfilePicture ? 'profile_picture_object_key' : 'NULL::text AS profile_picture_object_key'},
      ${supportsPortraitPicture ? 'portrait_picture_url' : 'NULL::text AS portrait_picture_url'},
      ${supportsProfileCardUrl ? 'profile_card_url' : 'NULL::text AS profile_card_url'},
      ${supportsSupportUrl ? 'support_url' : 'NULL::text AS support_url'},
      ${supportsPortraitPicture ? 'portrait_picture_object_key' : 'NULL::text AS portrait_picture_object_key'},
      ${supportsPortraitPictures ? 'portrait_pictures' : "'[]'::jsonb AS portrait_pictures"},
       ${supportsFeaturedVideo ? 'featured_video_url' : 'NULL::text AS featured_video_url'},
       ${supportsFeatured ? 'featured' : 'false AS featured'},
       featured_order,
       social_links, is_published, created_at, updated_at`,
    values
  )

  if (!result.rows[0]) {
    throw new Error('Failed to update talent profile')
  }

  const row = result.rows[0]
  return {
    ...row,
    portrait_pictures: normalizeProfileImages(row.portrait_pictures),
  }
}

// ============================================
// ARTIST PROFILE QUERIES
// ============================================

export async function getArtistProfileByUserId(userId: string): Promise<ArtistProfile | null> {
  const supportsPortfolioArtColumn = await hasColumn('artist_profiles', 'portfolio_art')
  const supportsPortfolioArtImagesColumn = await hasColumn('artist_profiles', 'portfolio_art_images')
  const supportsFeaturedColumn = await hasColumn('artist_profiles', 'featured')
  const supportsFeaturedOrderColumn = await hasColumn('artist_profiles', 'featured_order')
  const result = await dbQuery(
    `SELECT 
      id, user_id, specialty, portfolio_links,
      ${supportsPortfolioArtColumn ? 'portfolio_art' : 'ARRAY[]::text[] AS portfolio_art'},
      ${supportsPortfolioArtImagesColumn ? 'portfolio_art_images' : "'[]'::jsonb AS portfolio_art_images"},
      commissions_open,
      price_range, contact_email, social_media_links, ${supportsFeaturedColumn ? 'featured' : 'false AS featured'}, ${supportsFeaturedOrderColumn ? 'featured_order' : 'NULL::integer AS featured_order'}, is_published, 
      created_at, updated_at
     FROM artist_profiles 
     WHERE user_id = $1`,
    [userId]
  )
  const row = result.rows[0]
  return row ? { ...row, portfolio_art_images: normalizeProfileImages(row.portfolio_art_images) } : null
}

export async function createArtistProfile(userId: string): Promise<ArtistProfile> {
  const supportsPortfolioArtColumn = await hasColumn('artist_profiles', 'portfolio_art')
  const supportsPortfolioArtImagesColumn = await hasColumn('artist_profiles', 'portfolio_art_images')
  const supportsFeaturedColumn = await hasColumn('artist_profiles', 'featured')
  const supportsFeaturedOrderColumn = await hasColumn('artist_profiles', 'featured_order')
  const result = await dbQuery(
    supportsPortfolioArtColumn
      ? (supportsFeaturedColumn
          ? `INSERT INTO artist_profiles (user_id, specialty, portfolio_links, portfolio_art, social_media_links, featured)
             VALUES ($1, '{}', '{}', '{}', '{"twitter": null, "instagram": null, "website": null}', false)
             RETURNING id, user_id, specialty, portfolio_links, portfolio_art, commissions_open,
               ${supportsPortfolioArtImagesColumn ? 'portfolio_art_images' : "'[]'::jsonb AS portfolio_art_images"},
               price_range, contact_email, social_media_links, featured, ${supportsFeaturedOrderColumn ? 'featured_order' : 'NULL::integer AS featured_order'}, is_published,
               created_at, updated_at`
          : `INSERT INTO artist_profiles (user_id, specialty, portfolio_links, portfolio_art, social_media_links)
             VALUES ($1, '{}', '{}', '{}', '{"twitter": null, "instagram": null, "website": null}')
             RETURNING id, user_id, specialty, portfolio_links, portfolio_art, commissions_open,
               ${supportsPortfolioArtImagesColumn ? 'portfolio_art_images' : "'[]'::jsonb AS portfolio_art_images"},
               price_range, contact_email, social_media_links, false AS featured, ${supportsFeaturedOrderColumn ? 'featured_order' : 'NULL::integer AS featured_order'}, is_published,
               created_at, updated_at`)
      : (supportsFeaturedColumn
          ? `INSERT INTO artist_profiles (user_id, specialty, portfolio_links, social_media_links, featured)
             VALUES ($1, '{}', '{}', '{"twitter": null, "instagram": null, "website": null}', false)
             RETURNING id, user_id, specialty, portfolio_links, ARRAY[]::text[] AS portfolio_art, commissions_open,
               ${supportsPortfolioArtImagesColumn ? 'portfolio_art_images' : "'[]'::jsonb AS portfolio_art_images"},
               price_range, contact_email, social_media_links, featured, ${supportsFeaturedOrderColumn ? 'featured_order' : 'NULL::integer AS featured_order'}, is_published,
               created_at, updated_at`
          : `INSERT INTO artist_profiles (user_id, specialty, portfolio_links, social_media_links)
             VALUES ($1, '{}', '{}', '{"twitter": null, "instagram": null, "website": null}')
             RETURNING id, user_id, specialty, portfolio_links, ARRAY[]::text[] AS portfolio_art, commissions_open,
               ${supportsPortfolioArtImagesColumn ? 'portfolio_art_images' : "'[]'::jsonb AS portfolio_art_images"},
               price_range, contact_email, social_media_links, false AS featured, ${supportsFeaturedOrderColumn ? 'featured_order' : 'NULL::integer AS featured_order'}, is_published,
               created_at, updated_at`),
    [userId]
  )
  const row = result.rows[0]
  return {
    ...row,
    portfolio_art_images: normalizeProfileImages(row.portfolio_art_images),
  }
}

export async function updateArtistProfile(
  userId: string,
  data: Partial<ArtistProfile>
): Promise<ArtistProfile> {
  const supportsPortfolioArtColumn = await hasColumn('artist_profiles', 'portfolio_art')
  await ensureColumn('artist_profiles', "portfolio_art_images JSONB DEFAULT '[]'::jsonb", 'portfolio_art_images')
  const supportsPortfolioArtImagesColumn = await hasColumn('artist_profiles', 'portfolio_art_images')
  const supportsFeaturedColumn = await hasColumn('artist_profiles', 'featured')
  // ensure featured_order column exists for ordering featured artists
  await ensureColumn('artist_profiles', 'featured_order INTEGER', 'featured_order')

  await dbQuery(
    supportsPortfolioArtColumn
      ? `
        INSERT INTO artist_profiles (user_id, specialty, portfolio_links, portfolio_art, social_media_links)
        VALUES ($1, '{}', '{}', '{}', '{"twitter": null, "instagram": null, "website": null}')
        ON CONFLICT (user_id) DO NOTHING
      `
      : `
        INSERT INTO artist_profiles (user_id, specialty, portfolio_links, social_media_links)
        VALUES ($1, '{}', '{}', '{"twitter": null, "instagram": null, "website": null}')
        ON CONFLICT (user_id) DO NOTHING
      `,
    [userId],
  )

  const updates: string[] = []
  const values: unknown[] = []
  let paramCount = 1

  if (data.specialty !== undefined) {
    updates.push(`specialty = $${paramCount++}`)
    values.push(data.specialty)
  }
  if (data.portfolio_links !== undefined) {
    updates.push(`portfolio_links = $${paramCount++}`)
    values.push(data.portfolio_links)
  }
  if (data.portfolio_art !== undefined && supportsPortfolioArtColumn) {
    updates.push(`portfolio_art = $${paramCount++}`)
    values.push(data.portfolio_art)
  }
  if (data.portfolio_art_images !== undefined && supportsPortfolioArtImagesColumn) {
    updates.push(`portfolio_art_images = $${paramCount++}::jsonb`)
    values.push(JSON.stringify(normalizeProfileImages(data.portfolio_art_images)))
  }
  if (data.commissions_open !== undefined) {
    updates.push(`commissions_open = $${paramCount++}`)
    values.push(data.commissions_open)
  }
  if (data.price_range !== undefined) {
    updates.push(`price_range = $${paramCount++}`)
    values.push(data.price_range)
  }
  if (data.contact_email !== undefined) {
    updates.push(`contact_email = $${paramCount++}`)
    values.push(data.contact_email)
  }
  if (data.featured !== undefined && supportsFeaturedColumn) {
    updates.push(`featured = $${paramCount++}`)
    values.push(data.featured)
  }
  if ((data as any).featuredOrder !== undefined) {
    updates.push(`featured_order = $${paramCount++}`)
    values.push((data as any).featuredOrder)
  }
  if (data.social_media_links !== undefined) {
    updates.push(`social_media_links = $${paramCount++}`)
    values.push(JSON.stringify(data.social_media_links))
  }
  if (data.is_published !== undefined) {
    updates.push(`is_published = $${paramCount++}`)
    values.push(data.is_published)
  }

  // Always update updated_at timestamp
  updates.push(`updated_at = NOW()`)

  values.push(userId)

  const result = await dbQuery(
    `UPDATE artist_profiles 
     SET ${updates.join(', ')}
     WHERE user_id = $${paramCount}
     RETURNING id, user_id, specialty, portfolio_links,
       ${supportsPortfolioArtColumn ? 'portfolio_art' : 'ARRAY[]::text[] AS portfolio_art'},
       ${supportsPortfolioArtImagesColumn ? 'portfolio_art_images' : "'[]'::jsonb AS portfolio_art_images"},
       commissions_open,
       price_range, contact_email, social_media_links, ${supportsFeaturedColumn ? 'featured' : 'false AS featured'}, featured_order, is_published, 
       created_at, updated_at`,
    values
  )

  if (!result.rows[0]) {
    throw new Error('Failed to update artist profile')
  }

  const row = result.rows[0]
  return {
    ...row,
    portfolio_art_images: normalizeProfileImages(row.portfolio_art_images),
  }
}

// ============================================
// MERCHANDISE QUERIES
// ============================================

export async function getUserMerchandise(userId: string): Promise<UserMerchandiseItem[]> {
  const result = await dbQuery(
    `SELECT 
      id, user_id, name, description, price, image_url, image_object_key,
      category, stock, is_published, created_at, updated_at
     FROM merchandise 
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  )
  return result.rows
}

export async function getUserMerchandiseById(
  userId: string,
  merchandiseId: string
): Promise<UserMerchandiseItem | null> {
  const result = await dbQuery(
    `SELECT 
      id, user_id, name, description, price, image_url, image_object_key,
      category, stock, is_published, created_at, updated_at
     FROM merchandise 
     WHERE id = $1 AND user_id = $2`,
    [merchandiseId, userId]
  )
  return result.rows[0] || null
}

export async function createUserMerchandise(
  userId: string,
  data: {
    name: string
    description?: string
    price: number
    image_url?: string
    image_object_key?: string
    category: string
    stock: number
    is_published?: boolean
  }
): Promise<UserMerchandiseItem> {
  const result = await dbQuery(
    `INSERT INTO merchandise 
      (user_id, name, description, price, image_url, image_object_key, category, stock, is_published)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, user_id, name, description, price, image_url, image_object_key,
       category, stock, is_published, created_at, updated_at`,
    [
      userId,
      data.name,
      data.description || null,
      data.price,
      data.image_url || null,
      data.image_object_key || null,
      data.category,
      data.stock,
      data.is_published ?? false
    ]
  )

  if (!result.rows[0]) {
    throw new Error('Failed to create merchandise item')
  }

  return result.rows[0]
}

export async function updateUserMerchandise(
  userId: string,
  merchandiseId: string,
  data: Partial<UserMerchandiseItem>
): Promise<UserMerchandiseItem> {
  const updates: string[] = []
  const values: (string | number | boolean | null)[] = []
  let paramCount = 1

  if (data.name !== undefined) {
    updates.push(`name = $${paramCount++}`)
    values.push(data.name)
  }
  if (data.description !== undefined) {
    updates.push(`description = $${paramCount++}`)
    values.push(data.description)
  }
  if (data.price !== undefined) {
    updates.push(`price = $${paramCount++}`)
    values.push(data.price)
  }
  if (data.image_url !== undefined) {
    updates.push(`image_url = $${paramCount++}`)
    values.push(data.image_url)
  }
  if (data.image_object_key !== undefined) {
    updates.push(`image_object_key = $${paramCount++}`)
    values.push(data.image_object_key)
  }
  if (data.category !== undefined) {
    updates.push(`category = $${paramCount++}`)
    values.push(data.category)
  }
  if (data.stock !== undefined) {
    updates.push(`stock = $${paramCount++}`)
    values.push(data.stock)
  }
  if (data.is_published !== undefined) {
    updates.push(`is_published = $${paramCount++}`)
    values.push(data.is_published)
  }

  values.push(merchandiseId, userId)

  const result = await dbQuery(
    `UPDATE merchandise 
     SET ${updates.join(', ')}
     WHERE id = $${paramCount++} AND user_id = $${paramCount++}
     RETURNING id, user_id, name, description, price, image_url, image_object_key,
       category, stock, is_published, created_at, updated_at`,
    values
  )

  if (!result.rows[0]) {
    throw new Error('Failed to update merchandise item')
  }

  return result.rows[0]
}

export async function deleteUserMerchandise(
  userId: string,
  merchandiseId: string
): Promise<boolean> {
  const result = await dbQuery(
    `DELETE FROM merchandise 
     WHERE id = $1 AND user_id = $2`,
    [merchandiseId, userId]
  )

  return result.rowCount > 0
}
