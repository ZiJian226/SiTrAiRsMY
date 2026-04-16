import { NextRequest, NextResponse } from 'next/server';
import { createAdminEvent, getAdminEvents } from '@/lib/admin/repository';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const events = await getAdminEvents();
    return NextResponse.json(events, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load events';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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

    if (!body.title || !body.event_date) {
      return NextResponse.json({ error: 'title and event_date are required' }, { status: 400 });
    }

    const created = await createAdminEvent({
      title: body.title,
      description: body.description || '',
      event_date: body.event_date,
      location: body.location || '',
      image_url: body.image_url || '',
      image_object_key: body.image_object_key,
      category: body.category || 'other',
      is_published: Boolean(body.is_published),
      featured: Boolean(body.featured),
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create event';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
