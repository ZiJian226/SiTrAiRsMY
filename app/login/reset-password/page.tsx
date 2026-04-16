'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Container from '@/components/Container'
import Footer from '@/components/Footer'
import PageBackground from '@/components/PageBackground'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [token, setToken] = useState<string>('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const t = searchParams.get('token')
    if (!t) {
      setError('Invalid or missing reset token')
    } else {
      setToken(t)
    }
  }, [searchParams])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!token) {
      setError('Invalid reset token')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== passwordConfirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to reset password')
      }

      setSuccess(true)
      setPassword('')
      setPasswordConfirm('')

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base-100 relative flex flex-col">
      <PageBackground rotate={true} blur={true} opacity={50} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <Container className="py-12 flex-grow">
          <div className="max-w-md mx-auto">
            <Link href="/login" className="btn btn-ghost btn-sm mb-6">
              ← Back to Login
            </Link>

            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h1 className="card-title text-2xl mb-6">Reset Password</h1>

                {!token ? (
                  <div className="alert alert-error">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="stroke-current shrink-0 h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Invalid or missing reset token. Please check your email link.</span>
                  </div>
                ) : success ? (
                  <div className="space-y-4">
                    <div className="alert alert-success">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="stroke-current shrink-0 h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Password reset successfully!</span>
                    </div>
                    <p className="text-center text-sm opacity-70">
                      Redirecting to login in a few seconds...
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleReset} className="space-y-4">
                    {error && (
                      <div className="alert alert-error">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="stroke-current shrink-0 h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">New Password</span>
                      </label>
                      <div className="join">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="input input-bordered join-item flex-1"
                          placeholder="Enter new password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading}
                          minLength={8}
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-ghost join-item"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                      </div>
                      <label className="label">
                        <span className="label-text-alt">Minimum 8 characters</span>
                      </label>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Confirm Password</span>
                      </label>
                      <input
                        type="password"
                        className="input input-bordered"
                        placeholder="Confirm new password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        disabled={loading}
                        minLength={8}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-full"
                      disabled={loading || !password || !passwordConfirm}
                    >
                      {loading ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          Resetting...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </button>
                  </form>
                )}

                <div className="divider"></div>

                <p className="text-center text-sm opacity-70">
                  <Link href="/login" className="link link-primary">
                    Back to Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </Container>

        <Footer />
      </div>
    </div>
  )
}
