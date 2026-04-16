export type UserRole = 'talent' | 'artist' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  user: AuthUser;
  profile: Profile;
}

export interface SignInResult {
  error: string | null;
  session?: AuthSession;
}

export interface AuthService {
  signIn(email: string, password: string): Promise<SignInResult>;
  signOut(): Promise<void>;
}

export interface AuthSessionStorage {
  load(): AuthSession | null;
  save(session: AuthSession): void;
  clear(): void;
}
