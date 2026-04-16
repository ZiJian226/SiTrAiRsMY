import type { AuthService, Profile } from './types';

type MockUserRecord = {
  password: string;
  profile: Profile;
};

const now = () => new Date().toISOString();

const MOCK_USERS: Record<string, MockUserRecord> = {
  'admin@starmy.com': {
    password: 'admin123',
    profile: {
      id: '1',
      email: 'admin@starmy.com',
      full_name: 'Admin User',
      role: 'admin',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      bio: 'System administrator',
      created_at: now(),
      updated_at: now(),
    },
  },
  'talent@starmy.com': {
    password: 'talent123',
    profile: {
      id: '2',
      email: 'talent@starmy.com',
      full_name: 'Sakura Hoshino',
      role: 'talent',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=talent',
      bio: 'Virtual talent and content creator',
      created_at: now(),
      updated_at: now(),
    },
  },
  'artist@starmy.com': {
    password: 'artist123',
    profile: {
      id: '3',
      email: 'artist@starmy.com',
      full_name: 'Luna Artworks',
      role: 'artist',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=artist',
      bio: 'Digital artist and illustrator',
      created_at: now(),
      updated_at: now(),
    },
  },
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockAuthService implements AuthService {
  async signIn(email: string, password: string) {
    await wait(500);

    const user = MOCK_USERS[email];

    if (!user) {
      return { error: 'User not found' };
    }

    if (user.password !== password) {
      return { error: 'Invalid password' };
    }

    return {
      error: null,
      session: {
        user: {
          id: user.profile.id,
          email: user.profile.email,
        },
        profile: user.profile,
      },
    };
  }

  async signOut() {
    return Promise.resolve();
  }
}
