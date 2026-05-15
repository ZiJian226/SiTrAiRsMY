import 'server-only';

import { dbQuery } from '@/lib/database';

let auditLogTableReady = false;

export type AuditCategory = 'auth' | 'session' | 'profile' | 'content' | 'application' | 'admin' | 'system';

export type AuditAction = string;

export type AuditRequestContext = {
  ipAddress: string | null;
  locationCountry: string | null;
  userAgent: string | null;
};

function readHeader(headers: Headers, names: string[]): string | null {
  for (const name of names) {
    const value = headers.get(name);
    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function normalizeCountry(country: string | null): string | null {
  if (!country) {
    return null;
  }

  const trimmed = country.trim().toUpperCase();
  if (!trimmed || trimmed === 'XX' || trimmed === 'UNKNOWN') {
    return null;
  }

  return trimmed;
}

function normalizeIp(ipAddress: string | null): string | null {
  if (!ipAddress) {
    return null;
  }

  const firstIp = ipAddress.split(',')[0]?.trim();
  return firstIp && firstIp.length > 0 ? firstIp : null;
}

export function getAuditRequestContext(headers: Headers): AuditRequestContext {
  return {
    ipAddress: normalizeIp(
      readHeader(headers, ['x-forwarded-for', 'x-real-ip', 'x-vercel-forwarded-for', 'cf-connecting-ip'])
    ),
    locationCountry: normalizeCountry(
      readHeader(headers, ['x-vercel-ip-country', 'cf-ipcountry', 'x-country-code'])
    ),
    userAgent: readHeader(headers, ['user-agent']),
  };
}

export function deriveAuditCategory(action: string, resourceType?: string | null): AuditCategory {
  const normalizedAction = action.toLowerCase();
  const normalizedResourceType = (resourceType || '').toLowerCase();

  if (normalizedAction.startsWith('auth.')) {
    return 'auth';
  }

  if (normalizedAction.startsWith('session.')) {
    return 'session';
  }

  if (normalizedAction.startsWith('profile.')) {
    return 'profile';
  }

  if (normalizedAction.includes('application') || normalizedResourceType.includes('application')) {
    return 'application';
  }

  if (
    normalizedAction.includes('user.') ||
    normalizedAction.includes('admin.') ||
    ['user', 'admin_profile', 'admin_user'].includes(normalizedResourceType)
  ) {
    return 'admin';
  }

  if (
    normalizedResourceType.includes('event') ||
    normalizedResourceType.includes('gallery') ||
    normalizedResourceType.includes('merchandise') ||
    normalizedAction.includes('content')
  ) {
    return 'content';
  }

  return 'system';
}

export async function ensureAuditLogTable(): Promise<void> {
  if (auditLogTableReady) {
    return;
  }

  await dbQuery('CREATE EXTENSION IF NOT EXISTS pgcrypto');

  await dbQuery(`
    CREATE TABLE IF NOT EXISTS user_audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      actor_role TEXT,
      category TEXT NOT NULL DEFAULT 'content',
      action TEXT NOT NULL,
      event_type TEXT NOT NULL DEFAULT 'activity',
      resource_type TEXT NOT NULL,
      resource_id TEXT,
      entity_type TEXT,
      entity_id TEXT,
      page_key TEXT,
      target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      session_id UUID REFERENCES auth_sessions(id) ON DELETE SET NULL,
      status_before TEXT,
      status_after TEXT,
      location_country TEXT,
      metadata JSONB DEFAULT '{}'::jsonb,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await dbQuery(`ALTER TABLE IF EXISTS user_audit_logs ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'content'`);
  await dbQuery(`ALTER TABLE IF EXISTS user_audit_logs ADD COLUMN IF NOT EXISTS event_type TEXT NOT NULL DEFAULT 'activity'`);
  await dbQuery(`ALTER TABLE IF EXISTS user_audit_logs ADD COLUMN IF NOT EXISTS entity_type TEXT`);
  await dbQuery(`ALTER TABLE IF EXISTS user_audit_logs ADD COLUMN IF NOT EXISTS entity_id TEXT`);
  await dbQuery(`ALTER TABLE IF EXISTS user_audit_logs ADD COLUMN IF NOT EXISTS page_key TEXT`);
  await dbQuery(`ALTER TABLE IF EXISTS user_audit_logs ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES auth_sessions(id) ON DELETE SET NULL`);
  await dbQuery(`ALTER TABLE IF EXISTS user_audit_logs ADD COLUMN IF NOT EXISTS status_before TEXT`);
  await dbQuery(`ALTER TABLE IF EXISTS user_audit_logs ADD COLUMN IF NOT EXISTS status_after TEXT`);
  await dbQuery(`ALTER TABLE IF EXISTS user_audit_logs ADD COLUMN IF NOT EXISTS location_country TEXT`);

  await dbQuery(`ALTER TABLE IF EXISTS auth_sessions ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ`);
  await dbQuery(`ALTER TABLE IF EXISTS auth_sessions ADD COLUMN IF NOT EXISTS last_seen_ip_address TEXT`);
  await dbQuery(`ALTER TABLE IF EXISTS auth_sessions ADD COLUMN IF NOT EXISTS last_seen_country TEXT`);
  await dbQuery(`ALTER TABLE IF EXISTS auth_sessions ADD COLUMN IF NOT EXISTS last_seen_user_agent TEXT`);

  await dbQuery('CREATE INDEX IF NOT EXISTS idx_user_audit_logs_actor_user_id ON user_audit_logs(actor_user_id)');
  await dbQuery('CREATE INDEX IF NOT EXISTS idx_user_audit_logs_target_user_id ON user_audit_logs(target_user_id)');
  await dbQuery('CREATE INDEX IF NOT EXISTS idx_user_audit_logs_action ON user_audit_logs(action)');
  await dbQuery('CREATE INDEX IF NOT EXISTS idx_user_audit_logs_category ON user_audit_logs(category)');
  await dbQuery('CREATE INDEX IF NOT EXISTS idx_user_audit_logs_created_at ON user_audit_logs(created_at DESC)');
  await dbQuery('CREATE INDEX IF NOT EXISTS idx_user_audit_logs_session_id ON user_audit_logs(session_id)');
  await dbQuery('CREATE INDEX IF NOT EXISTS idx_user_audit_logs_location_country ON user_audit_logs(location_country)');
  await dbQuery('CREATE INDEX IF NOT EXISTS idx_auth_sessions_last_seen_at ON auth_sessions(last_seen_at DESC)');

  auditLogTableReady = true;
}

export async function logUserAuditEvent(input: {
  actorUserId: string;
  actorRole?: string | null;
  action: AuditAction;
  resourceType: string;
  resourceId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  pageKey?: string | null;
  targetUserId?: string | null;
  sessionId?: string | null;
  category?: AuditCategory;
  eventType?: string | null;
  statusBefore?: string | null;
  statusAfter?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  locationCountry?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  try {
    await ensureAuditLogTable();

    await dbQuery(
      `
      INSERT INTO user_audit_logs (
        actor_user_id,
        actor_role,
        category,
        action,
        event_type,
        resource_type,
        resource_id,
        entity_type,
        entity_id,
        page_key,
        target_user_id,
        session_id,
        status_before,
        status_after,
        location_country,
        metadata,
        ip_address,
        user_agent
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16::jsonb, $17, $18)
      `,
      [
        input.actorUserId,
        input.actorRole || null,
        input.category || deriveAuditCategory(input.action, input.resourceType),
        input.action,
        input.eventType || 'activity',
        input.resourceType,
        input.resourceId || null,
        input.entityType || null,
        input.entityId || null,
        input.pageKey || null,
        input.targetUserId || null,
        input.sessionId || null,
        input.statusBefore || null,
        input.statusAfter || null,
        input.locationCountry || null,
        JSON.stringify(input.metadata || {}),
        input.ipAddress || null,
        input.userAgent || null,
      ],
    );
  } catch (error) {
    console.error('Failed to write audit log event:', error)
  }
}
