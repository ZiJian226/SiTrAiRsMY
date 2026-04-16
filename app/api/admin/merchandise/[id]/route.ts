import { NextRequest, NextResponse } from 'next/server';
import { deleteAdminMerchandise, updateAdminMerchandise } from '@/lib/admin/repository';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
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

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update merchandise';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = await deleteAdminMerchandise(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Merchandise not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete merchandise';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
