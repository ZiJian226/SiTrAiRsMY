import { dbQuery } from '@/lib/database'
import crypto from 'crypto'

export async function createPasswordResetToken(userId: string, expiresInHours: number = 24): Promise<string> {
  // Generate a random token
  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000)

  // Invalidate any existing tokens for this user
  await dbQuery(
    `UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL`,
    [userId]
  )

  // Create new token
  await dbQuery(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  )

  return token
}

export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

  const result = await dbQuery(
    `SELECT user_id FROM password_reset_tokens
     WHERE token_hash = $1 AND expires_at > NOW() AND used_at IS NULL
     LIMIT 1`,
    [tokenHash]
  )

  if (result.rows.length === 0) {
    return null
  }

  return result.rows[0].user_id
}

export async function usePasswordResetToken(token: string): Promise<boolean> {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

  const result = await dbQuery(
    `UPDATE password_reset_tokens
     SET used_at = NOW()
     WHERE token_hash = $1 AND expires_at > NOW() AND used_at IS NULL`,
    [tokenHash]
  )

  return result.rowCount > 0
}

export async function resetUserPassword(userId: string, newPassword: string): Promise<boolean> {
  const result = await dbQuery(
    `UPDATE users
     SET password_hash = crypt($2, gen_salt('bf'))
     WHERE id = $1`,
    [userId, newPassword]
  )

  return result.rowCount > 0
}
