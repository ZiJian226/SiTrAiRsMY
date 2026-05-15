import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';
import { ensureAuditLogTable } from '@/lib/auditLog';
import { requireAdminUser } from '@/lib/auth/authorization';

export const runtime = 'nodejs';

type AuditTab = 'all' | 'auth' | 'session' | 'profile' | 'content' | 'application' | 'admin' | 'status';

function normalizeTab(value: string | null): AuditTab {
  const allowed: AuditTab[] = ['all', 'auth', 'session', 'profile', 'content', 'application', 'admin', 'status'];
  return (allowed as string[]).includes(value || '') ? (value as AuditTab) : 'all';
}

function normalizePage(value: string | null): number {
  const parsed = Number.parseInt(value || '1', 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdminUser(request);
    if ('response' in guard) return guard.response;

    await ensureAuditLogTable();

    const { searchParams } = new URL(request.url);
    const tab = normalizeTab(searchParams.get('tab'));
    const page = normalizePage(searchParams.get('page'));
    const pageSize = 10;
    const offset = (page - 1) * pageSize;

    const categoryCountsResult = await dbQuery(
      `
      SELECT category, COUNT(*)::int AS count
      FROM user_audit_logs
      GROUP BY category
      `,
    );

    const categoryRows = categoryCountsResult.rows as Array<{ category: string; count: number }>;
    const categoryCounts = categoryRows.reduce((acc: Record<string, number>, row) => {
      acc[row.category as string] = Number(row.count) || 0;
      return acc;
    }, {} as Record<string, number>);

    const statusSummaryResult = await dbQuery(
      `
      SELECT
        COUNT(*) FILTER (WHERE session_state.is_online) ::int AS online_count,
        COUNT(*) FILTER (WHERE NOT session_state.is_online) ::int AS offline_count,
        COUNT(*)::int AS total_count
      FROM (
        SELECT
          u.id,
          EXISTS (
            SELECT 1
            FROM auth_sessions s
            WHERE s.user_id = u.id
              AND s.revoked_at IS NULL
              AND s.expires_at > NOW()
          ) AS is_online
        FROM users u
      ) session_state
      `,
    );

    const statusSummary = statusSummaryResult.rows[0] || {
      online_count: 0,
      offline_count: 0,
      total_count: 0,
    };

    if (tab === 'status') {
      const totalResult = await dbQuery('SELECT COUNT(*)::int AS count FROM users');
      const totalCount = Number(totalResult.rows[0]?.count) || 0;
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

      const result = await dbQuery(
        `
        SELECT
          u.id AS user_id,
          p.email,
          p.full_name,
          p.role,
          EXISTS (
            SELECT 1
            FROM auth_sessions s
            WHERE s.user_id = u.id
              AND s.revoked_at IS NULL
              AND s.expires_at > NOW()
          ) AS is_online,
          MAX(s.last_seen_at) AS last_seen_at,
          MAX(s.last_seen_ip_address) AS last_seen_ip_address,
          MAX(s.last_seen_country) AS last_seen_country,
          COUNT(s.id) FILTER (WHERE s.revoked_at IS NULL AND s.expires_at > NOW())::int AS active_session_count,
          MAX(s.created_at) AS latest_session_started_at
        FROM users u
        LEFT JOIN profiles p ON p.user_id = u.id
        LEFT JOIN auth_sessions s ON s.user_id = u.id
        GROUP BY u.id, p.email, p.full_name, p.role
        ORDER BY is_online DESC, MAX(s.last_seen_at) DESC NULLS LAST, p.full_name ASC NULLS LAST, p.email ASC
        LIMIT $1 OFFSET $2
        `,
        [pageSize, offset],
      );

      return NextResponse.json(
        {
          tab,
          page,
          pageSize,
          totalCount,
          totalPages,
          categoryCounts,
          statusSummary: {
            onlineCount: Number(statusSummary.online_count) || 0,
            offlineCount: Number(statusSummary.offline_count) || 0,
            totalCount: Number(statusSummary.total_count) || 0,
          },
          rows: result.rows,
        },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const categoryFilter = tab === 'all' ? null : tab;
    const totalResult = categoryFilter
      ? await dbQuery('SELECT COUNT(*)::int AS count FROM user_audit_logs WHERE category = $1', [categoryFilter])
      : await dbQuery('SELECT COUNT(*)::int AS count FROM user_audit_logs');
    const totalCount = Number(totalResult.rows[0]?.count) || 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const result = categoryFilter
      ? await dbQuery(
          `
          SELECT
            logs.id,
            logs.actor_user_id,
            logs.actor_role,
            logs.category,
            logs.action,
            logs.event_type,
            logs.resource_type,
            logs.resource_id,
            logs.entity_type,
            logs.entity_id,
            logs.page_key,
            logs.target_user_id,
            logs.session_id,
            logs.status_before,
            logs.status_after,
            logs.location_country,
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
          WHERE logs.category = $1
          ORDER BY logs.created_at DESC
          LIMIT $2 OFFSET $3
          `,
          [categoryFilter, pageSize, offset],
        )
      : await dbQuery(
          `
          SELECT
            logs.id,
            logs.actor_user_id,
            logs.actor_role,
            logs.category,
            logs.action,
            logs.event_type,
            logs.resource_type,
            logs.resource_id,
            logs.entity_type,
            logs.entity_id,
            logs.page_key,
            logs.target_user_id,
            logs.session_id,
            logs.status_before,
            logs.status_after,
            logs.location_country,
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
          LIMIT $1 OFFSET $2
          `,
          [pageSize, offset],
        );

    return NextResponse.json(
      {
        tab,
        page,
        pageSize,
        totalCount,
        totalPages,
        categoryCounts,
        statusSummary: {
          onlineCount: Number(statusSummary.online_count) || 0,
          offlineCount: Number(statusSummary.offline_count) || 0,
          totalCount: Number(statusSummary.total_count) || 0,
        },
        rows: result.rows,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load audit logs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
