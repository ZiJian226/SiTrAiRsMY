import { NextRequest, NextResponse } from 'next/server';
import { deleteAdminEvent, updateAdminEvent } from '@/lib/admin/repository';
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
      description?: string;
      event_date?: string;
      location?: string;
      image_url?: string;
      image_object_key?: string;
      category?: string;
      is_published?: boolean;
      featured?: boolean;
    };

    if (!body.title && !body.description && !body.event_date && !body.location && !body.image_url && !body.image_object_key && !body.category && typeof body.is_published !== 'boolean' && typeof body.featured !== 'boolean') {
      return NextResponse.json({ error: 'No fields provided to update' }, { status: 400 });
    }

    const currentResult = await dbQuery(`SELECT title, category, is_published, featured FROM events WHERE id = $1 LIMIT 1`, [id]);
    const currentRow = currentResult.rows[0] as { title: string; category: string | null; is_published: boolean; featured: boolean } | undefined;

    const updated = await updateAdminEvent(id, {
      title: body.title,
      description: body.description,
      event_date: body.event_date,
      location: body.location,
      image_url: body.image_url,
      image_object_key: body.image_object_key,
      category: body.category,
      is_published: body.is_published,
      featured: body.featured,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    await logUserAuditEvent({
      actorUserId: guard.user.id,
      actorRole: 'admin',
      action: 'content.event.update',
      category: 'content',
      eventType: 'update',
      resourceType: 'event',
      resourceId: updated.id,
      entityType: 'event',
      entityId: updated.id,
      metadata: {
        updatedFields: Object.keys(body).filter((key) => body[key as keyof typeof body] !== undefined),
        previous: currentRow || null,
      },
      ...auditContext,
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update event';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guard = await requireAdminUser(_);
    if ('response' in guard) return guard.response;
    const auditContext = getAuditRequestContext(_.headers);
    const { id } = await params;
    const currentResult = await dbQuery(`SELECT id, title, category FROM events WHERE id = $1 LIMIT 1`, [id]);
    const currentRow = currentResult.rows[0] as { id: string; title: string; category: string | null } | undefined;
    const deleted = await deleteAdminEvent(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (currentRow) {
      await logUserAuditEvent({
        actorUserId: guard.user.id,
        actorRole: 'admin',
        action: 'content.event.delete',
        category: 'content',
        eventType: 'delete',
        resourceType: 'event',
        resourceId: currentRow.id,
        entityType: 'event',
        entityId: currentRow.id,
        metadata: currentRow,
        ...auditContext,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete event';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
