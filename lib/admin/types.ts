export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'talent' | 'artist';
  avatar_url: string;
  avatar_object_key?: string;
  bio: string;
  created_at: string;
  updated_at: string;
}

export interface AdminProfile extends AdminUser {
  lore?: string;
  tags?: string[];
  youtubeUrl?: string;
  twitchUrl?: string;
  tiktokUrl?: string;
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
