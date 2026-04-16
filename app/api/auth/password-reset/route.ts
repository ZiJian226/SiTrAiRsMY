import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/database'
import { createPasswordResetToken } from '@/lib/auth/passwordReset'
import { sendEmail, generatePasswordResetEmail } from '@/lib/email/emailService'

export const runtime = 'nodejs'

/**
 * Request password reset for a user
 * Can be called by:
 * 1. User themselves (with x-user-id header)
 * 2. Admin (with admin-email query param or body email)
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string
    }
    const userId = request.headers.get('x-user-id')
    const adminEmail = request.headers.get('x-admin-email')

    // Get user to send email to
    let userEmail: string
    let userFromDb: { id: string; email: string; full_name: string | null } | null = null

    if (userId) {
      // User requesting their own password reset
      const result = await dbQuery(
        `SELECT u.id, u.email, p.full_name FROM users u 
         LEFT JOIN profiles p ON p.user_id = u.id
         WHERE u.id = $1`,
        [userId]
      )
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      userFromDb = result.rows[0]
        userEmail = userFromDb!.email
    } else if (body.email) {
      // Admin requesting reset for another user
      if (!adminEmail) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const result = await dbQuery(
        `SELECT u.id, u.email, p.full_name FROM users u 
         LEFT JOIN profiles p ON p.user_id = u.id
         WHERE u.email = $1`,
        [body.email]
      )
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      userFromDb = result.rows[0]
        userEmail = userFromDb!.email
    } else {
      return NextResponse.json({ error: 'Email or user ID required' }, { status: 400 })
    }

    // Create password reset token
    const token = await createPasswordResetToken(userFromDb!.id)

    // Build reset URL
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/login/reset-password?token=${token}`

    // Send email
    const emailContent = generatePasswordResetEmail(userFromDb!.full_name || userEmail, resetUrl)
    const emailSent = await sendEmail(
      {
        to: userEmail,
        subject: 'StarMy - Password Reset Request',
        html: emailContent.html,
        text: emailContent.text
      },
      userFromDb!.id
    )

    if (!emailSent) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Password reset email sent to ${userEmail}`
    })
  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json({ error: 'Failed to process password reset request' }, { status: 500 })
  }
}
