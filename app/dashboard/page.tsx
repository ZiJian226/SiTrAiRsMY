'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Container from '@/components/Container'
import Footer from '@/components/Footer'
import PageBackground from '@/components/PageBackground'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-base-100 relative flex flex-col">
      <PageBackground rotate={true} blur={true} opacity={50} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <Container className="py-12 flex-grow">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-primary">
                Welcome, {profile.full_name || profile.email}
              </h1>
              <p className="text-lg opacity-70 mt-2">
                Role: <span className="badge badge-primary capitalize">{profile.role}</span>
              </p>
            </div>
            <button onClick={handleSignOut} className="btn btn-outline btn-error">
              Sign Out
            </button>
          </div>
          
          {(profile.role === 'admin' || profile.role === 'staff') && (
            <div className="alert alert-info mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>
                You have {profile.role === 'admin' ? 'admin privileges' : 'staff access'}. Open the{' '}
                {profile.role === 'admin' && (
                  <>
                    <Link href="/admin" className="link link-primary font-semibold">
                      Admin Panel
                    </Link>
                    {' '}or{' '}
                  </>
                )}
                <Link href="/dashboard/applications" className="link link-primary font-semibold">
                  Applications Dashboard
                </Link>
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(profile.role === 'talent' || profile.role === 'staff' || profile.role === 'artist') && (
              <>
                <Link href="/dashboard/profile" className="card bg-base-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                  <div className="card-body">
                    <h2 className="card-title text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </h2>
                    <p className="opacity-70">
                      Edit your profile, bio, avatar, and social links
                    </p>
                  </div>
                </Link>
                
                <Link href="/dashboard/merchandise" className="card bg-base-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                  <div className="card-body">
                    <h2 className="card-title text-secondary">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      My Merchandise
                    </h2>
                    <p className="opacity-70">
                      Manage your store products and inventory
                    </p>
                  </div>
                </Link>

                {profile.role === 'artist' && (
                  <Link href="/dashboard/commissions" className="card bg-gradient-to-br from-accent to-success shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                    <div className="card-body">
                      <h2 className="card-title text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Manage Commission Requests
                      </h2>
                      <p className="text-white opacity-90">
                        Review pending requests and move accepted work into ongoing commissions
                      </p>
                    </div>
                  </Link>
                )}
              </>
            )}

            {(profile.role === 'admin' || profile.role === 'staff') && (
              <>
                <Link href="/dashboard/homepage-background" className="card bg-gradient-to-br from-accent to-primary shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                  <div className="card-body">
                    <h2 className="card-title text-white">
                      🎬 Homepage Background
                    </h2>
                    <p className="text-white opacity-90">
                      Manage the homepage video or slideshow
                    </p>
                  </div>
                </Link>

                <Link href="/dashboard/agency-settings" className="card bg-gradient-to-br from-secondary to-accent shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                  <div className="card-body">
                    <h2 className="card-title text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Agency Settings
                    </h2>
                    <p className="text-white opacity-90">
                      Manage requirements and benefits for the Join page
                    </p>
                  </div>
                </Link>

                {profile.role === 'admin' && (
                  <>
                    <Link href="/admin" className="card bg-gradient-to-br from-primary to-secondary shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                      <div className="card-body">
                        <h2 className="card-title text-white">👑 Admin Panel</h2>
                        <p className="text-white opacity-90">Manage users, profiles, events, gallery, and merchandise</p>
                      </div>
                    </Link>

                    {/* <Link href="/admin/dashboard" className="card bg-gradient-to-br from-primary to-secondary shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                      <div className="card-body">
                        <h2 className="card-title text-white">📊 Admin Dashboard</h2>
                        <p className="text-white opacity-90">View high-level analytics and system status</p>
                      </div>
                    </Link> */}
                  </>
                )}
                
                <Link href="/dashboard/applications" className="card bg-gradient-to-br from-primary to-secondary shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                  <div className="card-body">
                    <h2 className="card-title text-white">📨 Applications Dashboard</h2>
                    <p className="text-white opacity-90">Review career and community applications</p>
                  </div>
                </Link>
              </>
            )}
          </div>
        </Container>
        <Footer />
      </div>
    </div>
  )
}
