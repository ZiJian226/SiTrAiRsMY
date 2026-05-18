import { NextRequest, NextResponse } from 'next/server';
import { cleanupInactiveSessions, cleanupExpiredSessions } from '@/lib/auth/sessionService';

export const runtime = 'nodejs';

/**
 * Cleanup API endpoint for session maintenance
 * Runs server-side to revoke inactive and expired sessions
 * Can be called periodically (e.g., every 10 minutes via cron)
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add a cron secret check for security
    const cronSecret = request.headers.get('x-cron-secret');
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clean up inactive sessions (40 min inactivity threshold = 30 min warning + 10 min grace)
    const inactiveCount = await cleanupInactiveSessions(40);

    // Clean up expired sessions
    const expiredCount = await cleanupExpiredSessions();

    return NextResponse.json(
      {
        success: true,
        message: 'Session cleanup completed',
        inactiveSessionsRevoked: inactiveCount,
        expiredSessionsDeleted: expiredCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session cleanup error:', error);
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}
