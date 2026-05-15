import { NextRequest, NextResponse } from 'next/server';
import { deleteAdminGalleryItem, updateAdminGalleryItem } from '@/lib/admin/repository';
import { requireAdminUser } from '@/lib/auth/authorization';
import { getAuditRequestContext, logUserAuditEvent } from '@/lib/auditLog';
import { dbQuery } from '@/lib/database';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guard = await requireAdminUser(request);
    if ('response' in guard) return guard.response;
    const auditContext = getAuditRequestContext(request.headers);
    const { id } = await params;
    const body = (await request.json()) as {
      title?: string;
      image_url?: string;
      image_object_key?: string;
      description?: string;
      category?: string;
      artist_name?: string;
      is_published?: boolean;
      featured?: boolean;
      media?: Array<{
        media_type: 'photo' | 'video';
        media_url: string;
        media_object_key?: string;
        thumbnail_url?: string;
        is_primary?: boolean;
        sort_order?: number;
      }>;
    };

    if (!body.title && !body.image_url && !body.image_object_key && !body.description && !body.category && !body.artist_name && typeof body.is_published !== 'boolean' && typeof body.featured !== 'boolean' && !Array.isArray(body.media)) {
      return NextResponse.json({ error: 'No fields provided to update' }, { status: 400 });
    }

    const currentResult = await dbQuery(`SELECT id, title, category, artist_name FROM gallery_items WHERE id = $1 LIMIT 1`, [id]);
    const currentRow = currentResult.rows[0] as { id: string; title: string; category: string | null; artist_name: string | null } | undefined;

    const updated = await updateAdminGalleryItem(id, {
      title: body.title,
      image_url: body.image_url,
      image_object_key: body.image_object_key,
      description: body.description,
      category: body.category,
      artist_name: body.artist_name,
      is_published: body.is_published,
      featured: body.featured,
      media: body.media?.map((item, index) => ({
        id: '',
        gallery_item_id: '',
        media_type: item.media_type,
        media_url: item.media_url,
        media_object_key: item.media_object_key,
        thumbnail_url: item.thumbnail_url,
        is_primary: Boolean(item.is_primary),
        sort_order: Number.isFinite(item.sort_order) ? Number(item.sort_order) : index,
      })),
    });

    if (!updated) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    await logUserAuditEvent({
      actorUserId: guard.user.id,
      actorRole: 'admin',
      action: 'content.gallery.update',
      category: 'content',
      eventType: 'update',
      resourceType: 'gallery_item',
      resourceId: updated.id,
      entityType: 'gallery_item',
      entityId: updated.id,
      metadata: {
        updatedFields: Object.keys(body).filter((key) => body[key as keyof typeof body] !== undefined),
        previous: currentRow || null,
      },
      ...auditContext,
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update gallery item';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guard = await requireAdminUser(_);
    if ('response' in guard) return guard.response;
    const auditContext = getAuditRequestContext(_.headers);
    const { id } = await params;
    const currentResult = await dbQuery(`SELECT id, title, category, artist_name FROM gallery_items WHERE id = $1 LIMIT 1`, [id]);
    const currentRow = currentResult.rows[0] as { id: string; title: string; category: string | null; artist_name: string | null } | undefined;
    const deleted = await deleteAdminGalleryItem(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    if (currentRow) {
      await logUserAuditEvent({
        actorUserId: guard.user.id,
        actorRole: 'admin',
        action: 'content.gallery.delete',
        category: 'content',
        eventType: 'delete',
        resourceType: 'gallery_item',
        resourceId: currentRow.id,
        entityType: 'gallery_item',
        entityId: currentRow.id,
        metadata: currentRow,
        ...auditContext,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete gallery item';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
