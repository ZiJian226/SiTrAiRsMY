import type { Artist, NewsEvent, VTuber } from '@/lib/types';

export type Talent = VTuber;
export type ArtistProfile = Artist;
export type EventArticle = NewsEvent;

export interface StoreItem {
  id: string;
  name: string;
  talent: string;
  price: number;
  currency: string;
  image: string;
  category: string;
  inStock: boolean;
  description: string;
}

export interface GalleryEntry {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  date: string;
  featured?: boolean;
}

export interface HomePayload {
  talents: Talent[];
  artists: ArtistProfile[];
  events: EventArticle[];
}
