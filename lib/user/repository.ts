import { dbQuery } from '@/lib/database'

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
  lore: string | null
  date_of_birth: string | null
  height: string | null
  species: string | null
  likes: string[]
  dislikes: string[]
  tags: string[]
  portfolio_links: string[]
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
  commissions_open: boolean
  price_range: string | null
  contact_email: string | null
  social_media_links: {
    twitter?: string | null
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

// ============================================
// TALENT PROFILE QUERIES
// ============================================

export async function getTalentProfileByUserId(userId: string): Promise<TalentProfile | null> {
  const result = await dbQuery(
    `SELECT 
      id, user_id, stage_name, character_description, debut_date,
      bio, avatar_url, avatar_object_key, lore, date_of_birth, 
      height, species, likes, dislikes, tags, portfolio_links, 
      social_links, is_published, created_at, updated_at
     FROM talent_profiles 
     WHERE user_id = $1`,
    [userId]
  )
  return result.rows[0] || null
}

export async function updateTalentProfile(
  userId: string,
  data: Partial<TalentProfile>
): Promise<TalentProfile> {
  const updates: string[] = []
  const values: (string | string[] | Record<string, unknown> | boolean | null)[] = []
  let paramCount = 1

  if (data.stage_name !== undefined) {
    updates.push(`stage_name = $${paramCount++}`)
    values.push(data.stage_name)
  }
  if (data.character_description !== undefined) {
    updates.push(`character_description = $${paramCount++}`)
    values.push(data.character_description)
  }
  if (data.bio !== undefined) {
    updates.push(`bio = $${paramCount++}`)
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
  if (data.lore !== undefined) {
    updates.push(`lore = $${paramCount++}`)
    values.push(data.lore)
  }
  if (data.date_of_birth !== undefined) {
    updates.push(`date_of_birth = $${paramCount++}`)
    values.push(data.date_of_birth)
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
  if (data.social_links !== undefined) {
    updates.push(`social_links = $${paramCount++}`)
    values.push(JSON.stringify(data.social_links))
  }
  if (data.is_published !== undefined) {
    updates.push(`is_published = $${paramCount++}`)
    values.push(data.is_published)
  }

  values.push(userId)

  const result = await dbQuery(
    `UPDATE talent_profiles 
     SET ${updates.join(', ')}
     WHERE user_id = $${paramCount}
     RETURNING id, user_id, stage_name, character_description, debut_date,
       bio, avatar_url, avatar_object_key, lore, date_of_birth, 
       height, species, likes, dislikes, tags, portfolio_links, 
       social_links, is_published, created_at, updated_at`,
    values
  )

  if (!result.rows[0]) {
    throw new Error('Failed to update talent profile')
  }

  return result.rows[0]
}

// ============================================
// ARTIST PROFILE QUERIES
// ============================================

export async function getArtistProfileByUserId(userId: string): Promise<ArtistProfile | null> {
  const result = await dbQuery(
    `SELECT 
      id, user_id, specialty, portfolio_links, commissions_open,
      price_range, contact_email, social_media_links, is_published, 
      created_at, updated_at
     FROM artist_profiles 
     WHERE user_id = $1`,
    [userId]
  )
  return result.rows[0] || null
}

export async function createArtistProfile(userId: string): Promise<ArtistProfile> {
  const result = await dbQuery(
    `INSERT INTO artist_profiles (user_id, specialty, portfolio_links, social_media_links)
     VALUES ($1, '{}', '{}', '{"twitter": null, "instagram": null, "website": null}')
     RETURNING id, user_id, specialty, portfolio_links, commissions_open,
       price_range, contact_email, social_media_links, is_published, 
       created_at, updated_at`,
    [userId]
  )
  return result.rows[0]
}

export async function updateArtistProfile(
  userId: string,
  data: Partial<ArtistProfile>
): Promise<ArtistProfile> {
  const updates: string[] = []
  const values: (string | string[] | Record<string, unknown> | boolean | null)[] = []
  let paramCount = 1

  if (data.specialty !== undefined) {
    updates.push(`specialty = $${paramCount++}`)
    values.push(data.specialty)
  }
  if (data.portfolio_links !== undefined) {
    updates.push(`portfolio_links = $${paramCount++}`)
    values.push(data.portfolio_links)
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
  if (data.social_media_links !== undefined) {
    updates.push(`social_media_links = $${paramCount++}`)
    values.push(JSON.stringify(data.social_media_links))
  }
  if (data.is_published !== undefined) {
    updates.push(`is_published = $${paramCount++}`)
    values.push(data.is_published)
  }

  values.push(userId)

  const result = await dbQuery(
    `UPDATE artist_profiles 
     SET ${updates.join(', ')}
     WHERE user_id = $${paramCount}
     RETURNING id, user_id, specialty, portfolio_links, commissions_open,
       price_range, contact_email, social_media_links, is_published, 
       created_at, updated_at`,
    values
  )

  if (!result.rows[0]) {
    throw new Error('Failed to update artist profile')
  }

  return result.rows[0]
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
