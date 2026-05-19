import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

export const runtime = 'nodejs';

type ContentHighlight = {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  video_object_key: string | null;
  thumbnail_url: string | null;
  thumbnail_object_key: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * GET: Fetch all active content highlights ordered by sort_order
 */
export async function GET() {
  try {
    const result = await dbQuery(
      `SELECT id, title, description, video_url, video_object_key, thumbnail_url, thumbnail_object_key, sort_order, is_active, created_at, updated_at
       FROM homepage_content_highlights
       WHERE is_active = true
       ORDER BY sort_order ASC`,
    );

    const highlights = (result.rows as ContentHighlight[]) || [];

    return NextResponse.json(
      { success: true, data: highlights },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('Failed to fetch content highlights:', error);
    return NextResponse.json({ error: 'Failed to fetch content highlights' }, { status: 500 });
  }
}
