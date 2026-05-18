import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/apiAuth';
import { dbQuery } from '@/lib/database';
import { getAuditRequestContext, logUserAuditEvent } from '@/lib/auditLog';
import {
  getHomepageHeroConfig,
  replaceHomepageHeroConfig,
  type HomepageHeroMediaType,
  type HomepageHeroMediaInput,
} from '@/lib/admin/homepageBackgroundRepository';

function normalizeHexColor(input: unknown): string | null {
  if (typeof input !== 'string') {
    return null;
  }

  const value = input.trim();
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)) {
    return null;
  }

  return value;
}

async function requireAdminOrStaff(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return { error: Response.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const roleResult = await dbQuery('SELECT role FROM profiles WHERE user_id = $1 LIMIT 1', [user.id]);
  const role = roleResult.rows[0]?.role as string | undefined;

  if (role !== 'admin' && role !== 'staff') {
    return { error: Response.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { user, role };
}

export async function GET(request: NextRequest) {
  try {
    const access = await requireAdminOrStaff(request);
    if ('error' in access) {
      return access.error;
    }

    const config = await getHomepageHeroConfig();
    return Response.json({ success: true, data: config });
  } catch (error) {
    console.error('Error fetching homepage background config:', error);
    return Response.json(
      { error: 'Failed to fetch homepage background config' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const access = await requireAdminOrStaff(request);
    if ('error' in access) {
      return access.error;
    }

    const auditContext = getAuditRequestContext(request.headers);
    const body = await request.json();
    const mode = body.mode === 'video' ? 'video' : 'slideshow';
    const slideshowIntervalMs = Number(body.slideshow_interval_ms ?? 3000);
    const overlayOpacity = Number(body.overlay_opacity ?? 30);
    const backgroundColor = normalizeHexColor(body.background_color);
    const media = Array.isArray(body.media) ? body.media : [];

    const normalizedMedia = (media as Array<Record<string, unknown>>)
      .map((item: Record<string, unknown>, index: number): HomepageHeroMediaInput => ({
        id: typeof item.id === 'string' ? item.id : undefined,
        label: typeof item.label === 'string' ? item.label.trim() : null,
        media_type: (item.media_type === 'video' ? 'video' : 'photo') as HomepageHeroMediaType,
        media_url: typeof item.media_url === 'string' ? item.media_url.trim() : '',
        media_object_key: typeof item.media_object_key === 'string' && item.media_object_key.trim().length > 0
          ? item.media_object_key.trim()
          : null,
        sort_order: Number.isFinite(Number(item.sort_order)) ? Number(item.sort_order) : index,
        is_active: item.is_active !== false,
      }))
      .filter((item): item is HomepageHeroMediaInput => item.media_url.length > 0);

    const config = await replaceHomepageHeroConfig(
      {
        mode,
        slideshow_interval_ms: Number.isFinite(slideshowIntervalMs) && slideshowIntervalMs > 0 ? slideshowIntervalMs : 3000,
        overlay_opacity: Number.isFinite(overlayOpacity) ? Math.min(100, Math.max(0, overlayOpacity)) : 30,
        background_color: backgroundColor,
      },
      normalizedMedia,
    );

    try {
      await logUserAuditEvent({
        actorUserId: access.user.id,
        actorRole: access.role,
        action: 'homepage_background.updated',
        category: 'content',
        eventType: 'update',
        resourceType: 'homepage_hero_settings',
        resourceId: 'default',
        entityType: 'homepage_background',
        entityId: 'default',
        metadata: {
          mode,
          slideshow_interval_ms: config.settings?.slideshow_interval_ms,
          overlay_opacity: config.settings?.overlay_opacity,
          background_color: config.settings?.background_color,
          media_count: config.media.length,
        },
        ...auditContext,
      });
    } catch (auditError) {
      console.warn('Homepage background updated, but audit logging failed:', auditError);
    }

    return Response.json({ success: true, data: config });
  } catch (error) {
    console.error('Error updating homepage background config:', error);
    const message = error instanceof Error ? error.message : 'Failed to update homepage background config';
    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}
