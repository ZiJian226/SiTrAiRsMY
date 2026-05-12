import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/apiAuth';
import { getArtistCommissionDashboard } from '@/lib/commissions/repository';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dashboard = await getArtistCommissionDashboard(user.id);

    if (!dashboard.artistProfileId) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: dashboard });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load commission requests';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
