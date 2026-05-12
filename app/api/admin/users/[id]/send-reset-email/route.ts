import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';
import { createPasswordResetToken } from '@/lib/auth/passwordReset';
import { sendEmail, generatePasswordResetRequestEmail } from '@/lib/email/emailService';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  console.log('[RESET-EMAIL-API] POST handler called!')
  try {
    const { id } = await params;
    console.log('[RESET-EMAIL-API] Request received for user:', id)

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
      console.log('[RESET-EMAIL-API] User not found:', id)
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = result.rows[0] as {
      id: string;
      email: string;
      full_name: string | null;
    };
    console.log('[RESET-EMAIL-API] User found:', user.email)

    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    console.log('[RESET-EMAIL-API] Base URL:', baseUrl)
    
    const resetToken = await createPasswordResetToken(user.id);
    console.log('[RESET-EMAIL-API] Reset token created')
    
    const resetUrl = `${baseUrl}/login/reset-password?token=${resetToken}`;
    const emailContent = generatePasswordResetRequestEmail(user.full_name || user.email, resetUrl);
    console.log('[RESET-EMAIL-API] Email content generated')

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
      console.log('[RESET-EMAIL-API] Email send returned false')
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    console.log('[RESET-EMAIL-API] Success, email sent to:', user.email)
    return NextResponse.json({ success: true, message: `Reset email sent to ${user.email}` });
  } catch (error) {
    console.error('[RESET-EMAIL-API] Caught exception:', error);
    return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 });
  }
}
