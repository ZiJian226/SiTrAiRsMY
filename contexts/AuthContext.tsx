'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getAuthService } from '@/lib/auth/createAuthService'
import { MockAuthService } from '@/lib/auth/mockAuthService'
import { BrowserSessionStorage } from '@/lib/auth/sessionStorage'
import type { AuthUser, Profile, SignInResult } from '@/lib/auth/types'

export type { Profile } from '@/lib/auth/types'

interface AuthContextType {
  user: AuthUser | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<SignInResult>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: false,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
})

function getInitialSession() {
  if (typeof window === 'undefined') {
    return null
  }

  return new BrowserSessionStorage().load()
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialSession = useMemo(() => getInitialSession(), [])
  const [user, setUser] = useState<AuthUser | null>(initialSession?.user ?? null)
  const [profile, setProfile] = useState<Profile | null>(initialSession?.profile ?? null)
  const [loading] = useState(false)

  const authService = useMemo(() => getAuthService(), [])
  const sessionStorageService = useMemo(() => new BrowserSessionStorage(), [])

  // Save session to sessionStorage whenever it changes
  useEffect(() => {
    if (user && profile) {
      sessionStorageService.save({ user, profile })
    } else {
      sessionStorageService.clear()
    }
  }, [profile, sessionStorageService, user])

  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn(email, password)

    if (!result.error) {
      const maybeMockAuthService = authService as MockAuthService
      const session = maybeMockAuthService.getSession?.(email)

      if (session) {
        setUser(session.user)
        setProfile(session.profile)
      }
    }

    return result
  }

  const signOut = async () => {
    await authService.signOut()
    setUser(null)
    setProfile(null)
    sessionStorageService.clear()
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
