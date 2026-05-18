export interface PortraitPicture {
  url: string;
  object_key?: string;
}

export interface VTuber {
  id: string;
  name: string;
  description: string;
  avatar: string;
  role?: 'talent' | 'staff';
  tags: string[];
  tiktokUrl?: string;
  twitchUrl?: string;
  youtubeUrl?: string;
  featuredVideoUrl?: string;
  featured: boolean;
  schedule?: StreamSchedule[];
  portfolio?: string[];
  vtuberModelUrl?: string;
  profilePictureUrl?: string;
  portraitPictureUrl?: string;
  portraitPictures?: PortraitPicture[];
  profileCardUrl?: string;
  supportUrl?: string;
  instagramUrl?: string;
  xUrl?: string;
  vtuberLore?: string;
  characterInfo?: {
    dateOfBirth?: string;
    debutDate?: string;
    height?: string;
    species?: string;
    likes?: string[];
    dislikes?: string[];
    vtuberLore?: string;
    [key: string]: unknown;
  };
}

export interface StreamSchedule {
  id: string;
  day: string;
  time: string;
  title: string;
  platform: "youtube" | "twitch" | "tiktok";
}

export interface Artist {
  id: string;
  artistProfileId?: string;
  name: string;
  description: string;
  avatar: string;
  specialty: string[];
  portfolio: string[];
  portfolioArt?: string[];
  portfolioArtImages?: PortraitPicture[];
  featured?: boolean;
  commissionsOpen: boolean;
  priceRange: string;
  contactEmail: string;
  socialLinks?: {
    x?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
}

export interface CommissionRequest {
  name: string;
  email: string;
  description: string;
  budget: string;
  deadline?: string;
}

export interface NewsEvent {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: "Announcement" | "Spotlight" | "Guide" | "Events" | "News";
  image: string;
  author: string;
  featured?: boolean;
}

export interface AgencyRequirement {
  id: string;
  role: 'general' | 'artist' | 'talent';
  title: string;
  description: string;
  emoji?: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgencyBenefit {
  id: string;
  category: 'identity' | 'connection' | 'guidance' | 'freedom' | 'promotion' | 'opportunities' | 'safety' | 'experience';
  title: string;
  description: string;
  emoji?: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgencyApplication {
  id: string;
  name: string;
  email: string;
  country?: string;
  discord_name?: string;
  is_malaysian?: boolean;
  supporting_info?: string;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

// Legacy type alias for backward compatibility
export type CommunityApplication = AgencyApplication;

export type HomepageHeroMode = 'video' | 'slideshow';
export type HomepageHeroMediaType = 'photo' | 'video';
export type BackgroundFitMode = 'fill' | 'fit' | 'stretch' | 'tile' | 'center' | 'span';

export interface HomepageHeroSettings {
  config_key: string;
  mode: HomepageHeroMode;
  slideshow_interval_ms: number;
  overlay_opacity: number;
  background_color: string | null;
  background_fit: BackgroundFitMode;
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
