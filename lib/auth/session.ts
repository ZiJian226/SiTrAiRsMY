import crypto from 'crypto';

export const AUTH_SESSION_COOKIE_NAME = 'starmy_auth_session';
export const AUTH_SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;
export const AUTH_SESSION_INACTIVITY_WARNING_SECONDS = 60 * 30;
export const AUTH_SESSION_INACTIVITY_GRACE_SECONDS = 60 * 10;
export const AUTH_SESSION_INACTIVITY_TIMEOUT_SECONDS = AUTH_SESSION_INACTIVITY_WARNING_SECONDS + AUTH_SESSION_INACTIVITY_GRACE_SECONDS;

export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}