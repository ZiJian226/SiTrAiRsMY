import { NextResponse } from 'next/server';
import { getAdminProfiles } from '@/lib/admin/repository';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const profiles = await getAdminProfiles();
    return NextResponse.json(profiles, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load profiles';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
