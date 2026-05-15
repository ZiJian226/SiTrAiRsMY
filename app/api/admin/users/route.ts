import { NextRequest, NextResponse } from 'next/server';
import { createAdminUser, getAdminUsers } from '@/lib/admin/repository';
import { sendEmail, generateWelcomeEmail } from '@/lib/email/emailService';
import { createPasswordResetToken } from '@/lib/auth/passwordReset';
import { logUserAuditEvent, getAuditRequestContext } from '@/lib/auditLog';
import { requireAdminUser } from '@/lib/auth/authorization';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdminUser(request);
    if ('response' in guard) return guard.response;

    const users = await getAdminUsers();
    return NextResponse.json(users, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load users';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await requireAdminUser(request);
    if ('response' in guard) return guard.response;
    const auditContext = getAuditRequestContext(request.headers);

    const body = (await request.json()) as {
      email?: string;
      full_name?: string;
      role?: 'admin' | 'talent' | 'staff' | 'artist';
      avatar_url?: string;
      avatar_object_key?: string;
      bio?: string;
      password?: string;
    };

    if (!body.email || !body.role) {
      return NextResponse.json({ error: 'email and role are required' }, { status: 400 });
    }

    const actorRole = 'admin';
    const created = await createAdminUser({
      email: body.email,
      full_name: body.full_name,
      role: body.role,
      avatar_url: body.avatar_url,
      avatar_object_key: body.avatar_object_key,
      bio: body.bio,
      password: body.password,
    });

    await logUserAuditEvent({
      actorUserId: guard.user.id,
      actorRole,
      action: 'admin.user.create',
      category: 'admin',
      eventType: 'create',
      resourceType: 'user',
      resourceId: created.user_id,
      entityType: 'user',
      entityId: created.user_id,
      targetUserId: created.user_id,
      metadata: {
        email: created.email,
        role: created.role,
      },
      ...auditContext,
    });

    let warning: string | undefined;

    if (created.temporary_password) {
      try {
        const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const resetToken = await createPasswordResetToken(created.user_id);
        const resetUrl = `${baseUrl}/login/reset-password?token=${resetToken}`;
        const emailContent = generateWelcomeEmail(created.full_name || created.email, created.temporary_password, resetUrl);

        const sent = await sendEmail(
          {
            to: created.email,
            subject: 'Welcome to StarMy - Your account is ready',
            html: emailContent.html,
            text: emailContent.text,
          },
          created.user_id,
        );

        if (!sent) {
          warning = 'User created, but welcome email could not be sent.';
        }
      } catch (emailError) {
        console.error('User created but welcome email flow failed:', emailError);
        warning = 'User created, but welcome email setup is incomplete (password reset token/email).';
      }
    }

    return NextResponse.json({ ...created, warning }, { status: 201 });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const pgError = error as { code?: string; detail?: string };
      if (pgError.code === '23505') {
        return NextResponse.json({ error: 'Email already exists.' }, { status: 409 });
      }
      if (pgError.code === '23503') {
        return NextResponse.json({ error: 'Related profile data is missing. Please try again.' }, { status: 400 });
      }
      if (pgError.code === '42P01') {
        return NextResponse.json({ error: 'Required database table is missing. Please run latest DB migrations.' }, { status: 500 });
      }
    }

    const message = error instanceof Error ? error.message : 'Failed to create user';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
