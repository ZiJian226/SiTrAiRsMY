import { NextRequest, NextResponse } from 'next/server';
import { logUserAuditEvent, getAuditRequestContext } from '@/lib/auditLog';
import { deleteAdminUser, updateAdminUser } from '@/lib/admin/repository';
import { requireAdminUser } from '@/lib/auth/authorization';
import { dbQuery } from '@/lib/database';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guard = await requireAdminUser(request);
    if ('response' in guard) return guard.response;
    const auditContext = getAuditRequestContext(request.headers);
    const { id } = await params;
    const body = (await request.json()) as {
      email?: string;
      full_name?: string;
      role?: 'admin' | 'talent' | 'staff' | 'artist';
      avatar_url?: string;
      avatar_object_key?: string;
      bio?: string;
    };

    if (!body.email || !body.full_name || !body.role) {
      return NextResponse.json({ error: 'email, full_name and role are required' }, { status: 400 });
    }

    const currentResult = await dbQuery(
      `SELECT email, full_name, role FROM profiles WHERE id = $1 LIMIT 1`,
      [id],
    );
    const currentRow = currentResult.rows[0] as { email: string; full_name: string | null; role: string } | undefined;

    const updated = await updateAdminUser(id, {
      email: body.email,
      full_name: body.full_name,
      role: body.role,
      avatar_url: body.avatar_url || '',
      avatar_object_key: body.avatar_object_key,
      bio: body.bio || '',
    });

    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await logUserAuditEvent({
      actorUserId: guard.user.id,
      actorRole: 'admin',
      action: 'admin.user.update',
      category: 'admin',
      eventType: 'update',
      resourceType: 'user',
      resourceId: updated.user_id,
      entityType: 'user',
      entityId: updated.user_id,
      targetUserId: updated.user_id,
      metadata: {
        updatedFields: Object.keys(body).filter((key) => body[key as keyof typeof body] !== undefined),
        previous: currentRow || null,
        next: {
          email: updated.email,
          full_name: updated.full_name,
          role: updated.role,
        },
      },
      ...auditContext,
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guard = await requireAdminUser(_);
    if ('response' in guard) return guard.response;
    const auditContext = getAuditRequestContext(_.headers);
    const { id } = await params;

    const currentResult = await dbQuery(
      `SELECT u.id AS user_id, p.email, p.full_name, p.role
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE p.id = $1 OR u.id = $1
       LIMIT 1`,
      [id],
    );
    const currentRow = currentResult.rows[0] as { user_id: string; email: string | null; full_name: string | null; role: string | null } | undefined;

    const deleted = await deleteAdminUser(id);

    if (!deleted) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (currentRow?.user_id) {
      await logUserAuditEvent({
        actorUserId: guard.user.id,
        actorRole: 'admin',
        action: 'admin.user.delete',
        category: 'admin',
        eventType: 'delete',
        resourceType: 'user',
        resourceId: currentRow.user_id,
        entityType: 'user',
        entityId: currentRow.user_id,
        targetUserId: currentRow.user_id,
        metadata: currentRow,
        ...auditContext,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
