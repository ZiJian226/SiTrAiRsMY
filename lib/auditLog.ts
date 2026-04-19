import 'server-only';

import { dbQuery } from '@/lib/database';

let auditLogTableReady = false;

export type AuditAction =
  | 'profile.update'
  | 'merchandise.create'
  | 'merchandise.update'
  | 'merchandise.delete';

export async function ensureAuditLogTable(): Promise<void> {
  if (auditLogTableReady) {
    return;
  }

  await dbQuery(`
    CREATE TABLE IF NOT EXISTS user_audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      actor_role TEXT,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT,
      target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      metadata JSONB DEFAULT '{}'::jsonb,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await dbQuery('CREATE INDEX IF NOT EXISTS idx_user_audit_logs_actor_user_id ON user_audit_logs(actor_user_id)');
  await dbQuery('CREATE INDEX IF NOT EXISTS idx_user_audit_logs_target_user_id ON user_audit_logs(target_user_id)');
  await dbQuery('CREATE INDEX IF NOT EXISTS idx_user_audit_logs_action ON user_audit_logs(action)');
  await dbQuery('CREATE INDEX IF NOT EXISTS idx_user_audit_logs_created_at ON user_audit_logs(created_at DESC)');

  auditLogTableReady = true;
}

export async function logUserAuditEvent(input: {
  actorUserId: string;
  actorRole?: string | null;
  action: AuditAction;
  resourceType: string;
  resourceId?: string | null;
  targetUserId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  try {
    await ensureAuditLogTable();

    await dbQuery(
      `
      INSERT INTO user_audit_logs (
        actor_user_id,
        actor_role,
        action,
        resource_type,
        resource_id,
        target_user_id,
        metadata,
        ip_address,
        user_agent
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9)
      `,
      [
        input.actorUserId,
        input.actorRole || null,
        input.action,
        input.resourceType,
        input.resourceId || null,
        input.targetUserId || null,
        JSON.stringify(input.metadata || {}),
        input.ipAddress || null,
        input.userAgent || null,
      ],
    );
  } catch (error) {
    console.error('Failed to write audit log event:', error);
  }
}
