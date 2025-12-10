export interface VTuber {
  id: string;
  name: string;
  description: string;
  avatar: string;
  tags: string[];
  tiktokUrl?: string;
  twitchUrl?: string;
  youtubeUrl?: string;
  featured: boolean;
  schedule?: StreamSchedule[];
  lore?: string;
  characterInfo?: {
    dateOfBirth?: string;
    debutDate?: string;
    height?: string;
    species?: string;
    likes?: string[];
    dislikes?: string[];
    [key: string]: any;
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
  name: string;
  description: string;
  avatar: string;
  specialty: string[];
  portfolio: string[];
  commissionsOpen: boolean;
  priceRange: string;
  contactEmail: string;
  socialLinks?: {
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
}
