import { NextRequest, NextResponse } from 'next/server';
import { deleteAdminMerchandise, updateAdminMerchandise } from '@/lib/admin/repository';
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
      name?: string;
      description?: string;
      price?: number;
      category?: string;
      stock?: number;
      image_url?: string;
      image_object_key?: string;
      talent_name?: string;
      is_published?: boolean;
    };

    if (!body.name || typeof body.price !== 'number') {
      return NextResponse.json({ error: 'name and price are required' }, { status: 400 });
    }

    const currentResult = await dbQuery(`SELECT id, name, category, stock, is_published FROM merchandise WHERE id = $1 LIMIT 1`, [id]);
    const currentRow = currentResult.rows[0] as { id: string; name: string; category: string | null; stock: number | null; is_published: boolean } | undefined;

    const updated = await updateAdminMerchandise(id, {
      name: body.name,
      description: body.description || '',
      price: body.price,
      category: body.category || 'other',
      stock: body.stock ?? 0,
      image_url: body.image_url || '',
      image_object_key: body.image_object_key,
      talent_name: body.talent_name || 'StarMy',
      is_published: Boolean(body.is_published),
    });

    if (!updated) {
      return NextResponse.json({ error: 'Merchandise not found' }, { status: 404 });
    }

    await logUserAuditEvent({
      actorUserId: guard.user.id,
      actorRole: 'admin',
      action: 'content.merchandise.update',
      category: 'content',
      eventType: 'update',
      resourceType: 'merchandise',
      resourceId: updated.id,
      entityType: 'merchandise',
      entityId: updated.id,
      metadata: {
        updatedFields: Object.keys(body).filter((key) => body[key as keyof typeof body] !== undefined),
        previous: currentRow || null,
      },
      ...auditContext,
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update merchandise';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guard = await requireAdminUser(_);
    if ('response' in guard) return guard.response;
    const auditContext = getAuditRequestContext(_.headers);
    const { id } = await params;
    const currentResult = await dbQuery(`SELECT id, name, category FROM merchandise WHERE id = $1 LIMIT 1`, [id]);
    const currentRow = currentResult.rows[0] as { id: string; name: string; category: string | null } | undefined;
    const deleted = await deleteAdminMerchandise(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Merchandise not found' }, { status: 404 });
    }

    if (currentRow) {
      await logUserAuditEvent({
        actorUserId: guard.user.id,
        actorRole: 'admin',
        action: 'content.merchandise.delete',
        category: 'content',
        eventType: 'delete',
        resourceType: 'merchandise',
        resourceId: currentRow.id,
        entityType: 'merchandise',
        entityId: currentRow.id,
        metadata: currentRow,
        ...auditContext,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete merchandise';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
