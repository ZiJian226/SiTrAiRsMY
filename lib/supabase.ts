import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For server-side operations that require elevated permissions
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

// Type definitions
export type Profile = {
  id: string
  email: string
  full_name: string | null
  role: 'talent' | 'artist' | 'admin'
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type TalentProfile = {
  id: string
  user_id: string
  slug: string
  display_name: string
  bio: string | null
  avatar: string | null
  youtube_url: string | null
  twitch_url: string | null
  tiktok_url: string | null
  twitter_url: string | null
  tags: string[]
  schedule: any[]
  is_published: boolean
  created_at: string
  updated_at: string
}

export type Merchandise = {
  id: string
  user_id: string
  name: string
  description: string | null
  price: number
  currency: string
  image_url: string | null
  category: string
  in_stock: boolean
  is_published: boolean
  created_at: string
  updated_at: string
}

export type Event = {
  id: string
  title: string
  excerpt: string | null
  content: string
  image_url: string | null
  category: string
  author_id: string | null
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export type GalleryItem = {
  id: string
  title: string
  description: string | null
  image_url: string
  category: string
  event_date: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}
