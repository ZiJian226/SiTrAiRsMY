'use client'

import { createContext, useContext, useEffect, useState } from 'react'

// Mock user type (simplified)
interface MockUser {
  id: string
  email: string
}

// Profile type (kept from original)
export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: 'talent' | 'artist' | 'admin'
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: MockUser | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
})

// Mock users database (for dev session only)
const MOCK_USERS = {
  'admin@starmy.com': {
    password: 'admin123',
    profile: {
      id: '1',
      email: 'admin@starmy.com',
      full_name: 'Admin User',
      role: 'admin' as const,
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      bio: 'System administrator',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  'talent@starmy.com': {
    password: 'talent123',
    profile: {
      id: '2',
      email: 'talent@starmy.com',
      full_name: 'Sakura Hoshino',
      role: 'talent' as const,
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=talent',
      bio: 'Virtual talent and content creator',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  'artist@starmy.com': {
    password: 'artist123',
    profile: {
      id: '3',
      email: 'artist@starmy.com',
      full_name: 'Luna Artworks',
      role: 'artist' as const,
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=artist',
      bio: 'Digital artist and illustrator',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Load session from sessionStorage on mount
  useEffect(() => {
    const savedSession = sessionStorage.getItem('mock_auth_session')
    if (savedSession) {
      try {
        const { user: savedUser, profile: savedProfile } = JSON.parse(savedSession)
        setUser(savedUser)
        setProfile(savedProfile)
      } catch (e) {
        console.error('Failed to parse saved session:', e)
      }
    }
    setLoading(false)
  }, [])

  // Save session to sessionStorage whenever it changes
  useEffect(() => {
    if (user && profile) {
      sessionStorage.setItem('mock_auth_session', JSON.stringify({ user, profile }))
    } else {
      sessionStorage.removeItem('mock_auth_session')
    }
  }, [user, profile])

  const signIn = async (email: string, password: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const mockUser = MOCK_USERS[email as keyof typeof MOCK_USERS]
    
    if (!mockUser) {
      return { error: 'User not found' }
    }

    if (mockUser.password !== password) {
      return { error: 'Invalid password' }
    }

    // Set user and profile
    const user = { id: mockUser.profile.id, email: mockUser.profile.email }
    setUser(user)
    setProfile(mockUser.profile)

    return { error: null }
  }

  const signOut = async () => {
    setUser(null)
    setProfile(null)
    sessionStorage.removeItem('mock_auth_session')
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
