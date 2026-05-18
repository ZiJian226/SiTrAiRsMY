import { NextRequest, NextResponse } from 'next/server';
import { cleanupInactiveSessions, cleanupExpiredSessions } from '@/lib/auth/sessionService';
import { requireAdminUser } from '@/lib/auth/authorization';

export const runtime = 'nodejs';

/**
 * Admin-only session cleanup endpoint.
 * Allows an admin to trigger server-side revocation of inactive sessions and deletion of expired sessions.
 */
export async function POST(request: NextRequest) {
  try {
    const guard = await requireAdminUser(request);
    if ('response' in guard) return guard.response;

    // Default inactivity threshold: 40 minutes (30min warning + 10min grace)
    const inactiveCount = await cleanupInactiveSessions(40);
    const expiredCount = await cleanupExpiredSessions();

    return NextResponse.json({ success: true, inactiveSessionsRevoked: inactiveCount, expiredSessionsDeleted: expiredCount });
  } catch (error) {
    console.error('Admin session cleanup error:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
