import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';
import { createPasswordResetToken } from '@/lib/auth/passwordReset';
import { sendEmail, generatePasswordResetRequestEmail } from '@/lib/email/emailService';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const result = await dbQuery(
      `
      SELECT u.id, u.email, p.full_name
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.id = $1
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

    return NextResponse.json({ success: true, message: `Reset email sent to ${user.email}` });
  } catch (error) {
    console.error('Failed to send reset email:', error);
    return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 });
  }
}
