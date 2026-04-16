import { NextRequest, NextResponse } from 'next/server';
import { deleteAdminEvent, updateAdminEvent } from '@/lib/admin/repository';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
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

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update event';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = await deleteAdminEvent(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete event';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
