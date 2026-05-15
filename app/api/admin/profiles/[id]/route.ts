import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/apiAuth';
import { dbQuery } from '@/lib/database';
import { deleteAdminProfile, updateAdminProfile } from '@/lib/admin/repository';
import { getAuditRequestContext, logUserAuditEvent } from '@/lib/auditLog';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roleResult = await dbQuery('SELECT role FROM profiles WHERE user_id = $1 LIMIT 1', [user.id]);
    if (roleResult.rows[0]?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
  const auditContext = getAuditRequestContext(request.headers);
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
      instagramUrl?: string;
      xUrl?: string;
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
      supportUrl?: string;
      profileCardUrl?: string;
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
      instagramUrl: body.instagramUrl,
      xUrl: body.xUrl,
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
      supportUrl: body.supportUrl,
      profileCardUrl: body.profileCardUrl,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    await logUserAuditEvent({
      actorUserId: user.id,
      actorRole: 'admin',
      action: 'profile.admin_update',
      category: 'profile',
      eventType: 'update',
      resourceType: 'profile',
      resourceId: updated.id,
      entityType: 'profile',
      entityId: updated.id,
      targetUserId: updated.user_id,
      metadata: {
        updatedFields: Object.keys(body).filter((key) => body[key as keyof typeof body] !== undefined),
      },
      ...auditContext,
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(_);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roleResult = await dbQuery('SELECT role FROM profiles WHERE user_id = $1 LIMIT 1', [user.id]);
    if (roleResult.rows[0]?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const auditContext = getAuditRequestContext(_.headers);
    const currentResult = await dbQuery(
      `SELECT id, user_id, email, full_name, role FROM profiles WHERE id = $1 LIMIT 1`,
      [id],
    );
    const currentRow = currentResult.rows[0] as { id: string; user_id: string; email: string; full_name: string | null; role: string } | undefined;
    const deleted = await deleteAdminProfile(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (currentRow) {
      await logUserAuditEvent({
        actorUserId: user.id,
        actorRole: 'admin',
        action: 'profile.admin_delete',
        category: 'profile',
        eventType: 'delete',
        resourceType: 'profile',
        resourceId: currentRow.id,
        entityType: 'profile',
        entityId: currentRow.id,
        targetUserId: currentRow.user_id,
        metadata: currentRow,
        ...auditContext,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
