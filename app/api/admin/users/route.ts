import { NextRequest, NextResponse } from 'next/server';
import { createAdminUser, getAdminUsers } from '@/lib/admin/repository';
import { sendEmail, generateWelcomeEmail } from '@/lib/email/emailService';
import { createPasswordResetToken } from '@/lib/auth/passwordReset';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const users = await getAdminUsers();
    return NextResponse.json(users, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load users';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      full_name?: string;
      role?: 'admin' | 'talent' | 'artist';
      avatar_url?: string;
      avatar_object_key?: string;
      bio?: string;
      password?: string;
    };

    if (!body.email || !body.role) {
      return NextResponse.json({ error: 'email and role are required' }, { status: 400 });
    }

    const created = await createAdminUser({
      email: body.email,
      full_name: body.full_name,
      role: body.role,
      avatar_url: body.avatar_url,
      avatar_object_key: body.avatar_object_key,
      bio: body.bio,
      password: body.password,
    });

    if (created.temporary_password) {
      const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const resetToken = await createPasswordResetToken(created.user_id);
      const resetUrl = `${baseUrl}/login/reset-password?token=${resetToken}`;
      const emailContent = generateWelcomeEmail(created.full_name || created.email, created.temporary_password, resetUrl);

      await sendEmail({
        to: created.email,
        subject: 'Welcome to StarMy - Your account is ready',
        html: emailContent.html,
        text: emailContent.text,
      }, created.user_id);
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create user';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
