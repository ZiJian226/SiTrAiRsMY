import type { AuthSession, AuthSessionStorage } from './types';

const AUTH_SESSION_KEY = 'mock_auth_session';

export class BrowserSessionStorage implements AuthSessionStorage {
  load(): AuthSession | null {
    const raw = sessionStorage.getItem(AUTH_SESSION_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthSession;
    } catch (error) {
      console.error('Failed to parse saved auth session:', error);
      this.clear();
      return null;
    }
  }

  save(session: AuthSession): void {
    sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  }

  clear(): void {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
  }
}
