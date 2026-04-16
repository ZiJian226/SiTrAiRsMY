import { ApiAuthService } from './apiAuthService';
import type { AuthService } from './types';

let authService: AuthService | null = null;

export function getAuthService(): AuthService {
  if (!authService) {
    authService = new ApiAuthService();
  }

  return authService;
}
