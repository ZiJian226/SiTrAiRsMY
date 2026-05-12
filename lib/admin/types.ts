export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'talent' | 'staff' | 'artist';
  avatar_url: string;
  avatar_object_key?: string;
  bio: string;
  created_at: string;
  updated_at: string;
}

export interface AdminProfile extends AdminUser {
  featured?: boolean;
  characterInfo?: {
    dateOfBirth?: string;
    debutDate?: string;
    height?: string;
    species?: string;
    likes?: string[];
    dislikes?: string[];
  };
  tags?: string[];
  vtuberModelUrl?: string;
  profilePictureUrl?: string;
  profilePictureObjectKey?: string;
  portraitPictureUrl?: string;
  portraitPictureObjectKey?: string;
  portraitPictures?: Array<{ url: string; object_key?: string }>;
  featuredVideoUrl?: string;
  youtubeUrl?: string;
  twitchUrl?: string;
  tiktokUrl?: string;
  specialty?: string[];
  portfolio?: string[];
  portfolioArt?: string[];
  portfolioArtImages?: Array<{ url: string; object_key?: string }>;
  commissionsOpen?: boolean;
  priceRange?: string;
  contactEmail?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
}

export interface AdminEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  image_url: string;
  image_object_key?: string;
  category: string;
  is_published: boolean;
  featured: boolean;
}

export interface AdminGalleryItem {
  id: string;
  title: string;
  image_url: string;
  image_object_key?: string;
  description: string;
  category: string;
  artist_name: string;
  is_published: boolean;
  featured: boolean;
  media?: AdminGalleryMedia[];
}

export interface AdminGalleryMedia {
  id: string;
  gallery_item_id: string;
  media_type: 'photo' | 'video';
  media_url: string;
  media_object_key?: string;
  thumbnail_url?: string;
  is_primary: boolean;
  sort_order: number;
}

export interface AdminMerchandiseItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image_url: string;
  image_object_key?: string;
  talent_name: string;
  is_published: boolean;
}

export interface AdminStatistics {
  users: {
    total: number;
    admins: number;
    talents: number;
    staffs: number;
    artists: number;
    newThisMonth: number;
  };
  content: {
    totalEvents: number;
    upcomingEvents: number;
    galleryItems: number;
    merchandiseItems: number;
    publishedMerch: number;
  };
  engagement: {
    pageViews: number;
    uniqueVisitors: number;
    avgSessionDuration: string;
    bounceRate: string;
  };
  revenue: {
    totalSales: number;
    avgOrderValue: number;
    topSellingItems: number;
    conversionRate: string;
  };
  recentActivity: Array<{
    id: string;
    type: 'user' | 'event' | 'gallery' | 'merch';
    action: string;
    detail: string;
    time: string;
  }>;
}
