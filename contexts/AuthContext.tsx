'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getAuthService } from '@/lib/auth/createAuthService'
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
  loading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [authBusy, setAuthBusy] = useState(false)
  const loading = !hydrated || authBusy

  const authService = useMemo(() => getAuthService(), [])
  const sessionStorageService = useMemo(() => new BrowserSessionStorage(), [])

  // Hydrate auth session on client after mount to keep SSR and initial client render identical.
  useEffect(() => {
    const session = sessionStorageService.load()
    setUser(session?.user ?? null)
    setProfile(session?.profile ?? null)
    setHydrated(true)
  }, [sessionStorageService])

  // Save session to sessionStorage whenever it changes
  useEffect(() => {
    if (!hydrated) {
      return
    }

    if (user && profile) {
      sessionStorageService.save({ user, profile })
    } else {
      sessionStorageService.clear()
    }
  }, [hydrated, profile, sessionStorageService, user])

  const signIn = async (email: string, password: string) => {
    setAuthBusy(true)
    try {
      const result = await authService.signIn(email, password)

      if (!result.error && result.session) {
        setUser(result.session.user)
        setProfile(result.session.profile)
      }

      return result
    } finally {
      setAuthBusy(false)
    }
  }

  const signOut = async () => {
    setAuthBusy(true)
    try {
      await authService.signOut()
      setUser(null)
      setProfile(null)
      sessionStorageService.clear()
    } finally {
      setAuthBusy(false)
    }
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
