'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import Container from '@/components/Container'
import PageBackground from '@/components/PageBackground'
import Footer from '@/components/Footer'

export default function SignInPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: signInError } = await signIn(email, password)

    if (signInError) {
      setError(signInError)
      setLoading(false)
    } else {
      // Successful sign in
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-base-100 relative flex flex-col">
      <PageBackground rotate={true} blur={true} opacity={50} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <Container className="py-16 flex-grow flex items-center justify-center">
          <div className="max-w-md w-full">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-3xl text-center text-primary mb-6">Sign In</h2>
                
                {error && (
                  <div className="alert alert-error mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Email</span>
                    </label>
                    <input
                      type="email"
                      className="input input-bordered"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Password</span>
                    </label>
                    <input
                      type="password"
                      className="input input-bordered"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full mt-6"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>

                <div className="divider">Demo Accounts</div>

                <div className="alert alert-info">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div className="text-sm">
                    <p className="font-semibold mb-2">Test Credentials:</p>
                    <div className="space-y-1">
                      <p><strong>Admin:</strong> admin@starmy.com / admin123</p>
                      <p><strong>Talent:</strong> talent@starmy.com / talent123</p>
                      <p><strong>Artist:</strong> artist@starmy.com / artist123</p>
                    </div>
                    <p className="mt-2 opacity-70">Session data clears on browser refresh</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
        <Footer />
      </div>
    </div>
  )
}
