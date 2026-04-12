import { MockAuthService } from './mockAuthService';
import type { AuthService } from './types';

let authService: AuthService | null = null;

export function getAuthService(): AuthService {
  if (!authService) {
    authService = new MockAuthService();
  }

  return authService;
}
