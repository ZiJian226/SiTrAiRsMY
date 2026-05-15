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
  characterInfo?: {
    dateOfBirth?: string;
    debutDate?: string;
    height?: string;
    species?: string;
    likes?: string[];
    dislikes?: string[];
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
