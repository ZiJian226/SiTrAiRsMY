import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/apiAuth'
import { dbQuery } from '@/lib/database'
import { ensureAuditLogTable } from '@/lib/auditLog'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const roleResult = await dbQuery(
      'SELECT role FROM profiles WHERE user_id = $1 LIMIT 1',
      [user.id],
    )

    const requesterRole = roleResult.rows[0]?.role
    if (requesterRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await ensureAuditLogTable()

    const { searchParams } = new URL(request.url)
    const parsedLimit = Number.parseInt(searchParams.get('limit') || '100', 10)
    const limit = Number.isNaN(parsedLimit)
      ? 100
      : Math.max(1, Math.min(parsedLimit, 500))

    const result = await dbQuery(
      `
      SELECT
        logs.id,
        logs.actor_user_id,
        logs.actor_role,
        logs.action,
        logs.resource_type,
        logs.resource_id,
        logs.target_user_id,
        logs.metadata,
        logs.ip_address,
        logs.user_agent,
        logs.created_at,
        actor.email AS actor_email,
        actor.full_name AS actor_name,
        target.email AS target_email,
        target.full_name AS target_name
      FROM user_audit_logs logs
      LEFT JOIN profiles actor ON actor.user_id = logs.actor_user_id
      LEFT JOIN profiles target ON target.user_id = logs.target_user_id
      ORDER BY logs.created_at DESC
      LIMIT $1
      `,
      [limit],
    )

    return NextResponse.json(result.rows, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load audit logs'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
