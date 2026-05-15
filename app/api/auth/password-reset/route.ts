import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/apiAuth'
import { dbQuery } from '@/lib/database'
import { createPasswordResetToken } from '@/lib/auth/passwordReset'
import { sendEmail, generatePasswordResetEmail } from '@/lib/email/emailService'
import { getAuditRequestContext, logUserAuditEvent } from '@/lib/auditLog'

export const runtime = 'nodejs'

/**
 * Request password reset for a user
 * Can be called by the authenticated user for their own account,
 * or by an authenticated admin for another user.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string
    }
    const actor = await getAuthenticatedUser(request)
    const auditContext = getAuditRequestContext(request.headers)

    if (!actor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const actorRoleResult = await dbQuery('SELECT role FROM profiles WHERE user_id = $1 LIMIT 1', [actor.id])
    const actorRole = actorRoleResult.rows[0]?.role as 'talent' | 'staff' | 'artist' | 'admin' | undefined

    // Get user to send email to
    let userEmail: string
    let userFromDb: { id: string; email: string; full_name: string | null } | null = null

    if (!body.email || body.email.trim().length === 0) {
      // Authenticated user requesting their own password reset
      const result = await dbQuery(
        `SELECT u.id, u.email, p.full_name FROM users u 
         LEFT JOIN profiles p ON p.user_id = u.id
         WHERE u.id = $1`,
        [actor.id]
      )
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      userFromDb = result.rows[0]
        userEmail = userFromDb!.email
    } else {
      if (actorRole !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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

    await logUserAuditEvent({
      actorUserId: actor.id,
      actorRole,
      action: 'auth.password_reset.request',
      category: actorRole === 'admin' ? 'admin' : 'auth',
      eventType: 'request',
      resourceType: 'password_reset',
      resourceId: userFromDb!.id,
      entityType: 'user',
      entityId: userFromDb!.id,
      targetUserId: userFromDb!.id,
      metadata: {
        requestedEmail: userEmail,
        requestedBySelf: !body.email || body.email.trim().length === 0,
      },
      ...auditContext,
    })

    return NextResponse.json({
      success: true,
      message: `Password reset email sent to ${userEmail}`
    })
  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json({ error: 'Failed to process password reset request' }, { status: 500 })
  }
}
