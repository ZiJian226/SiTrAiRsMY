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
