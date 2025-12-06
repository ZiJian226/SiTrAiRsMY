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
}

export interface StreamSchedule {
  id: string;
  day: string; // Monday, Tuesday, etc.
  time: string; // e.g., "20:00 - 22:00"
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
