import type { ArtistProfile, EventArticle, GalleryEntry, StoreItem, Talent } from './types';

export const fallbackTalents: Talent[] = [
	{
		id: 'fallback-talent-1',
		name: 'Sakura Hoshino',
		description: 'Gaming and singing VTuber with cozy streams.',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=talent',
		tags: ['Gaming', 'Singing', 'Cozy'],
		tiktokUrl: 'https://tiktok.com/@sakurahoshino',
		twitchUrl: 'https://twitch.tv/sakurahoshino',
		youtubeUrl: 'https://youtube.com/@sakurahoshino',
		featured: true,
		schedule: [],
		lore: 'Virtual talent and content creator.',
		characterInfo: {
			likes: ['RPGs', 'Karaoke', 'Cute plushies'],
			dislikes: ['Bugs', 'Loud noises'],
		},
	},
];

export const fallbackArtists: ArtistProfile[] = [
	{
		id: 'fallback-artist-1',
		name: 'Luna Artworks',
		description: 'Digital artist and illustrator',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=artist',
		specialty: ['Character Design', 'Illustration', 'VTuber Assets'],
		portfolio: [
			'https://placehold.co/600x800/a855f7/ffffff?text=Portfolio+1',
			'https://placehold.co/600x800/8b5cf6/ffffff?text=Portfolio+2',
		],
		commissionsOpen: true,
		priceRange: 'Contact for quote',
		contactEmail: 'artist@starmy.com',
		socialLinks: {
			website: 'https://example.com',
		},
	},
];

export const fallbackEvents: EventArticle[] = [
	{
		id: 'fallback-event-1',
		title: 'Welcome to StarMy',
		excerpt: 'Platform launch announcement for StarMy community.',
		content: 'Platform launch announcement for StarMy community.',
		date: new Date().toISOString(),
		category: 'Announcement',
		image: 'https://placehold.co/800x400/a855f7/ffffff?text=StarMy+Launch',
		author: 'StarMy Team',
		featured: true,
	},
];

export const fallbackStoreItems: StoreItem[] = [];
export const fallbackGalleryItems: GalleryEntry[] = [
	{
		id: 'fallback-gallery-1',
		title: 'StarMy Community Meetup',
		description: 'Our first offline community gathering.',
		image: 'https://placehold.co/800x600/a855f7/ffffff?text=Community+Meetup',
		category: 'artwork',
		date: new Date().toISOString(),
		featured: true,
	},
];
