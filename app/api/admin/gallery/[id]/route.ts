import { NextRequest, NextResponse } from 'next/server';
import { deleteAdminGalleryItem, updateAdminGalleryItem } from '@/lib/admin/repository';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
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
    };

    if (!body.title && !body.image_url && !body.image_object_key && !body.description && !body.category && !body.artist_name && typeof body.is_published !== 'boolean' && typeof body.featured !== 'boolean') {
      return NextResponse.json({ error: 'No fields provided to update' }, { status: 400 });
    }

    const updated = await updateAdminGalleryItem(id, {
      title: body.title,
      image_url: body.image_url,
      image_object_key: body.image_object_key,
      description: body.description,
      category: body.category,
      artist_name: body.artist_name,
      is_published: body.is_published,
      featured: body.featured,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update gallery item';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = await deleteAdminGalleryItem(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete gallery item';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
