'use client'

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { getAuthService } from '@/lib/auth/createAuthService'
import { BrowserSessionStorage } from '@/lib/auth/sessionStorage'
import Modal from '@/components/Modal'
import {
  AUTH_SESSION_INACTIVITY_GRACE_SECONDS,
  AUTH_SESSION_INACTIVITY_WARNING_SECONDS,
} from '@/lib/auth/session'
import type { AuthUser, Profile, SignInResult } from '@/lib/auth/types'

export type { Profile } from '@/lib/auth/types'

interface AuthContextType {
  user: AuthUser | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<SignInResult>
  signOut: (reason?: 'manual' | 'timeout') => Promise<void>
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
  const [sessionWarningOpen, setSessionWarningOpen] = useState(false)
  const [sessionEndedMessage, setSessionEndedMessage] = useState<string | null>(null)
  const [sessionGraceSecondsLeft, setSessionGraceSecondsLeft] = useState(AUTH_SESSION_INACTIVITY_GRACE_SECONDS)
  const loading = !hydrated || authBusy

  const authService = useMemo(() => getAuthService(), [])
  const sessionStorageService = useMemo(() => new BrowserSessionStorage(), [])
  const inactivityWarningTimerRef = useRef<number | null>(null)
  const inactivityLogoutTimerRef = useRef<number | null>(null)
  const inactivityCountdownTimerRef = useRef<number | null>(null)
  const keepAliveRequestRef = useRef(false)
  const sessionWarningOpenRef = useRef(false)

  useEffect(() => {
    sessionWarningOpenRef.current = sessionWarningOpen
  }, [sessionWarningOpen])

  function clearInactivityTimers() {
    if (inactivityWarningTimerRef.current) {
      window.clearTimeout(inactivityWarningTimerRef.current)
      inactivityWarningTimerRef.current = null
    }

    if (inactivityLogoutTimerRef.current) {
      window.clearTimeout(inactivityLogoutTimerRef.current)
      inactivityLogoutTimerRef.current = null
    }

    if (inactivityCountdownTimerRef.current) {
      window.clearInterval(inactivityCountdownTimerRef.current)
      inactivityCountdownTimerRef.current = null
    }
  }

  function scheduleInactivityTimers() {
    clearInactivityTimers()

    if (!hydrated || !user || !profile) {
      return
    }

    setSessionWarningOpen(false)
    setSessionGraceSecondsLeft(AUTH_SESSION_INACTIVITY_GRACE_SECONDS)

    inactivityWarningTimerRef.current = window.setTimeout(() => {
      setSessionWarningOpen(true)
      setSessionGraceSecondsLeft(AUTH_SESSION_INACTIVITY_GRACE_SECONDS)

      inactivityCountdownTimerRef.current = window.setInterval(() => {
        setSessionGraceSecondsLeft((current) => (current <= 1 ? 0 : current - 1))
      }, 1000)

      inactivityLogoutTimerRef.current = window.setTimeout(() => {
        void handleForceLogout()
      }, AUTH_SESSION_INACTIVITY_GRACE_SECONDS * 1000)
    }, AUTH_SESSION_INACTIVITY_WARNING_SECONDS * 1000)
  }

  async function handleKeepSessionAlive() {
    if (!user || !profile || keepAliveRequestRef.current) {
      return
    }

    keepAliveRequestRef.current = true
    try {
      const response = await fetch('/api/auth/session/keepalive', {
        method: 'POST',
        cache: 'no-store',
      })

      if (!response.ok) {
        // session revoked server-side; show message and force logout
        setSessionEndedMessage('Your session has been terminated. Please sign in again.')
        await handleForceLogout()
        return
      }

      setSessionWarningOpen(false)
      scheduleInactivityTimers()
    } catch {
        setSessionEndedMessage('Unable to reach authentication service. You have been signed out.')
        await handleForceLogout()
    } finally {
      keepAliveRequestRef.current = false
    }
  }

  async function handleForceLogout() {
    clearInactivityTimers()
    setSessionWarningOpen(false)
    await signOut('timeout')
  }

  function handleUserActivity() {
    if (!hydrated || !user || !profile || authBusy) {
      return
    }

    if (sessionWarningOpenRef.current) {
      return
    }

    scheduleInactivityTimers()
  }

  // Hydrate auth session on client after mount to keep SSR and initial client render identical.
  useEffect(() => {
    const session = sessionStorageService.load()
    setUser(session?.user ?? null)
    setProfile(session?.profile ?? null)
    setHydrated(true)
  }, [sessionStorageService])

  // Handle tab close: terminate session on beforeunload/pagehide (NOT on blur/minimize)
  useEffect(() => {
    if (!hydrated) {
      return
    }

    async function terminateSessionOnTabClose() {
      try {
        await fetch('/api/auth/session/terminate', { method: 'POST' })
      } catch (error) {
        // Silently fail - best effort cleanup
        console.error('Failed to terminate session on tab close:', error)
      }
    }

    // Use 'beforeunload' and 'pagehide' (not 'unload') for better reliability
    // These events fire when the tab is actually closing, not on minimize/blur
    window.addEventListener('beforeunload', terminateSessionOnTabClose)
    window.addEventListener('pagehide', terminateSessionOnTabClose)

    return () => {
      window.removeEventListener('beforeunload', terminateSessionOnTabClose)
      window.removeEventListener('pagehide', terminateSessionOnTabClose)
    }
  }, [hydrated])

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

  useEffect(() => {
    if (!hydrated || !user || !profile) {
      clearInactivityTimers()
      setSessionWarningOpen(false)
      setSessionGraceSecondsLeft(AUTH_SESSION_INACTIVITY_GRACE_SECONDS)
      return
    }

    scheduleInactivityTimers()

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'] as const
    events.forEach((eventName) => window.addEventListener(eventName, handleUserActivity, { passive: true }))

    return () => {
      clearInactivityTimers()
      events.forEach((eventName) => window.removeEventListener(eventName, handleUserActivity))
    }
  }, [authBusy, hydrated, profile, user])

  useEffect(() => {
    if (!hydrated || !user || !profile) {
      return
    }

    const pingKeepAlive = () => {
      void fetch('/api/auth/session/keepalive', {
        method: 'POST',
        cache: 'no-store',
        credentials: 'same-origin',
      }).catch(() => undefined)
    }

    pingKeepAlive()
    const timer = window.setInterval(pingKeepAlive, 5 * 60 * 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [hydrated, profile, user])

  const signIn = async (email: string, password: string) => {
    setAuthBusy(true)
    try {
      const result = await authService.signIn(email, password)

      if (!result.error && result.session) {
        setUser(result.session.user)
        setProfile(result.session.profile)
        setSessionWarningOpen(false)
      }

      return result
    } finally {
      setAuthBusy(false)
    }
  }

  const signOut = async (reason: 'manual' | 'timeout' = 'manual') => {
    setAuthBusy(true)
    try {
      clearInactivityTimers()
      setSessionWarningOpen(false)
      await authService.signOut(reason)
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
      <Modal
        isOpen={sessionWarningOpen}
        onClose={() => {
          void handleForceLogout()
        }}
        title="Session inactivity warning"
        size="md"
        actions={(
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-end">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                void handleForceLogout()
              }}
            >
              Log out now
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                void handleKeepSessionAlive()
              }}
            >
              Stay signed in
            </button>
          </div>
        )}
      >
        <p>
          You have been inactive for 30 minutes. If you do not respond within 10 minutes, your session will end automatically.
        </p>
        <p className="font-semibold text-error">
          Time remaining: {Math.floor(sessionGraceSecondsLeft / 60)}:{String(sessionGraceSecondsLeft % 60).padStart(2, '0')}
        </p>
      </Modal>
      <Modal
        isOpen={!!sessionEndedMessage}
        onClose={() => setSessionEndedMessage(null)}
        title="Signed out"
        size="md"
        actions={(
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-end">
            <a href="/login" className="btn btn-primary">Sign in</a>
          </div>
        )}
      >
        <p>{sessionEndedMessage}</p>
      </Modal>
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
