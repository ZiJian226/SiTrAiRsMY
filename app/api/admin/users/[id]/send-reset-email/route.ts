import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';
import { createPasswordResetToken } from '@/lib/auth/passwordReset';
import { sendEmail, generatePasswordResetRequestEmail } from '@/lib/email/emailService';
import { requireAdminUser } from '@/lib/auth/authorization';
import { getAuditRequestContext, logUserAuditEvent } from '@/lib/auditLog';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const guard = await requireAdminUser(request);
    if ('response' in guard) return guard.response;
    const auditContext = getAuditRequestContext(request.headers);

    const actorRoleResult = await dbQuery('SELECT role FROM profiles WHERE user_id = $1 LIMIT 1', [guard.user.id]);
    if (actorRoleResult.rows[0]?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const result = await dbQuery(
      `
      SELECT u.id, u.email, p.full_name
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.id = $1 OR p.id = $1
      LIMIT 1
      `,
      [id],
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = result.rows[0] as {
      id: string;
      email: string;
      full_name: string | null;
    };

    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const resetToken = await createPasswordResetToken(user.id);

    const resetUrl = `${baseUrl}/login/reset-password?token=${resetToken}`;
    const emailContent = generatePasswordResetRequestEmail(user.full_name || user.email, resetUrl);

    const emailSent = await sendEmail(
      {
        to: user.email,
        subject: 'StarMy - Password Reset Request',
        html: emailContent.html,
        text: emailContent.text,
      },
      user.id,
    );

    if (!emailSent) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    await logUserAuditEvent({
      actorUserId: guard.user.id,
      actorRole: 'admin',
      action: 'admin.user.send_reset_email',
      category: 'admin',
      eventType: 'create',
      resourceType: 'password_reset_request',
      resourceId: user.id,
      entityType: 'user',
      entityId: user.id,
      targetUserId: user.id,
      metadata: {
        email: user.email,
      },
      ...auditContext,
    });

    return NextResponse.json({ success: true, message: `Reset email sent to ${user.email}` });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 });
  }
}
