import type { AuthService, SignInResult } from './types';

export class ApiAuthService implements AuthService {
  async signIn(email: string, password: string): Promise<SignInResult> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as SignInResult;

      if (!response.ok) {
        return { error: payload.error || 'Sign in failed' };
      }

      return payload;
    } catch {
      return { error: 'Unable to connect to authentication service' };
    }
  }

  async signOut() {
    await fetch('/api/auth/logout', {
      method: 'POST',
    }).catch(() => undefined);
  }
}
