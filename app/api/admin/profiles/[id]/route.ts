import { NextRequest, NextResponse } from 'next/server';
import { deleteAdminProfile, updateAdminProfile } from '@/lib/admin/repository';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      full_name?: string;
      role?: 'admin' | 'talent' | 'staff' | 'artist';
      avatar_url?: string;
      avatar_object_key?: string;
      bio?: string;
      tags?: string[];
      youtubeUrl?: string;
      twitchUrl?: string;
      tiktokUrl?: string;
      vtuberModelUrl?: string;
      profilePictureUrl?: string;
      profilePictureObjectKey?: string;
      portraitPictureUrl?: string;
      portraitPictureObjectKey?: string;
      portraitPictures?: Array<{ url: string; object_key?: string }>;
      featuredVideoUrl?: string;
      featured?: boolean;
      characterInfo?: {
        dateOfBirth?: string;
        debutDate?: string;
        height?: string;
        species?: string;
        likes?: string[];
        dislikes?: string[];
      };
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
    };

    if (!body.full_name || !body.role) {
      return NextResponse.json({ error: 'full_name and role are required' }, { status: 400 });
    }

    const updated = await updateAdminProfile(id, {
      full_name: body.full_name,
      role: body.role,
      avatar_url: body.avatar_url || '',
      avatar_object_key: body.avatar_object_key,
      bio: body.bio || '',
      tags: body.tags || [],
      youtubeUrl: body.youtubeUrl,
      twitchUrl: body.twitchUrl,
      tiktokUrl: body.tiktokUrl,
      vtuberModelUrl: body.vtuberModelUrl,
      profilePictureUrl: body.profilePictureUrl,
      profilePictureObjectKey: body.profilePictureObjectKey,
      portraitPictureUrl: body.portraitPictureUrl,
      portraitPictureObjectKey: body.portraitPictureObjectKey,
      portraitPictures: body.portraitPictures,
      featuredVideoUrl: body.featuredVideoUrl,
      featured: body.featured,
      characterInfo: body.characterInfo,
      specialty: body.specialty,
      portfolio: body.portfolio,
      portfolioArt: body.portfolioArt,
      portfolioArtImages: body.portfolioArtImages,
      commissionsOpen: body.commissionsOpen,
      priceRange: body.priceRange,
      contactEmail: body.contactEmail,
      websiteUrl: body.websiteUrl,
      twitterUrl: body.twitterUrl,
      instagramUrl: body.instagramUrl,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = await deleteAdminProfile(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
