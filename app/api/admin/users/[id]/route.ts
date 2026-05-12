import { NextRequest, NextResponse } from 'next/server';
import { deleteAdminUser, updateAdminUser } from '@/lib/admin/repository';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
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

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = await deleteAdminUser(id);

    if (!deleted) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
