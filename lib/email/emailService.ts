import nodemailer from 'nodemailer'
import { dbQuery } from '@/lib/database'

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// Initialize transporter based on environment
function getTransporter() {
  const provider = process.env.EMAIL_PROVIDER || 'smtp'

  if (provider === 'sendgrid') {
    // SendGrid configuration
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY not configured')
    }
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    })
  } else if (provider === 'gmail') {
    // Gmail configuration
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
      throw new Error('GMAIL_USER and GMAIL_PASSWORD not configured')
    }
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
      }
    })
  } else {
    // SMTP configuration (default)
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT) {
      throw new Error('SMTP_HOST and SMTP_PORT not configured')
    }
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
          }
        : undefined
    })
  }
}

export async function sendEmail(options: EmailOptions, userId?: string): Promise<boolean> {
  try {
    const transporter = getTransporter()
    const from = process.env.EMAIL_FROM || 'noreply@starmy.app'

    // Send email
    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html
    })

    // Log email send
    if (userId) {
      await logEmail({
        userId,
        emailTo: options.to,
        emailType: 'password_reset',
        subject: options.subject,
        status: 'sent'
      })
    }

    return true
  } catch (error) {
    console.error('Email send failed:', error)

    // Log failed email
    if (userId) {
      await logEmail({
        userId,
        emailTo: options.to,
        emailType: 'password_reset',
        subject: options.subject,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    return false
  }
}

async function logEmail(data: {
  userId: string
  emailTo: string
  emailType: string
  subject: string
  status: 'sent' | 'failed'
  errorMessage?: string
}) {
  try {
    await dbQuery(
      `INSERT INTO email_logs (user_id, email_to, email_type, subject, status, error_message)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [data.userId, data.emailTo, data.emailType, data.subject, data.status, data.errorMessage || null]
    )
  } catch (err) {
    console.error('Failed to log email:', err)
  }
}

export function generatePasswordResetEmail(userName: string, resetUrl: string): { html: string; text: string } {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #7c3aed;">StarMy - Password Reset</h1>
      <p>Hello ${userName || 'User'},</p>
      <p>An administrator has created an account for you on StarMy. Please use the link below to set your password:</p>
      
      <div style="margin: 30px 0;">
        <a href="${resetUrl}" style="
          background-color: #7c3aed;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          display: inline-block;
          font-weight: bold;
        ">
          Set Your Password
        </a>
      </div>
      
      <p style="color: #666;">Or copy this link: <code style="background: #f5f5f5; padding: 4px 8px;">${resetUrl}</code></p>
      
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        This link will expire in 24 hours. If you did not expect this email, please contact support.
      </p>
    </div>
  `

  const text = `
StarMy - Password Reset

Hello ${userName || 'User'},

An administrator has created an account for you on StarMy. Please use the link below to set your password:

${resetUrl}

This link will expire in 24 hours. If you did not expect this email, please contact support.
  `

  return { html, text }
}

export function generatePasswordResetRequestEmail(userName: string, resetUrl: string): { html: string; text: string } {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #7c3aed;">StarMy - Password Reset Request</h1>
      <p>Hello ${userName || 'User'},</p>
      <p>Someone has requested a password reset for your StarMy account. If this was you, please use the link below to reset your password:</p>
      
      <div style="margin: 30px 0;">
        <a href="${resetUrl}" style="
          background-color: #7c3aed;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          display: inline-block;
          font-weight: bold;
        ">
          Reset Password
        </a>
      </div>
      
      <p style="color: #666;">Or copy this link: <code style="background: #f5f5f5; padding: 4px 8px;">${resetUrl}</code></p>
      
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        This link will expire in 24 hours. If you did not request a password reset, please ignore this email.
      </p>
    </div>
  `

  const text = `
StarMy - Password Reset Request

Hello ${userName || 'User'},

Someone has requested a password reset for your StarMy account. If this was you, please use the link below to reset your password:

${resetUrl}

This link will expire in 24 hours. If you did not request a password reset, please ignore this email.
  `

  return { html, text }
}

export function generateWelcomeEmail(userName: string, temporaryPassword: string, resetUrl: string): { html: string; text: string } {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #7c3aed;">Welcome to StarMy</h1>
      <p>Hello ${userName || 'User'},</p>
      <p>Your account has been created by an administrator. Use the temporary password below to sign in, then reset it right away for security.</p>

      <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0 0 8px; font-weight: bold;">Temporary password</p>
        <code style="font-size: 18px;">${temporaryPassword}</code>
      </div>

      <div style="margin: 30px 0;">
        <a href="${resetUrl}" style="
          background-color: #7c3aed;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          display: inline-block;
          font-weight: bold;
        ">
          Reset Password Now
        </a>
      </div>

      <p style="color: #666;">Reset link: <code style="background: #f5f5f5; padding: 4px 8px;">${resetUrl}</code></p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        Please change your password after signing in.
      </p>
    </div>
  `

  const text = `
Welcome to StarMy

Hello ${userName || 'User'},

Your account has been created by an administrator. Use the temporary password below to sign in, then reset it right away for security.

Temporary password: ${temporaryPassword}

Reset your password here: ${resetUrl}

Please change your password after signing in.
  `

  return { html, text }
}
