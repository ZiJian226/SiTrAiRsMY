'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Container from '@/components/Container'
import Footer from '@/components/Footer'
import PageBackground from '@/components/PageBackground'
import Link from 'next/link'

export default function AdminPage() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (!loading && profile && profile.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [user, profile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  if (!user || !profile || profile.role !== 'admin') {
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
              <h1 className="text-4xl font-bold text-primary flex items-center gap-3">
                Admin Panel
              </h1>
              <p className="text-lg opacity-70 mt-2">
                Full system control and management
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard" className="btn btn-outline btn-primary">
                My Dashboard
              </Link>
              <button onClick={handleSignOut} className="btn btn-outline btn-error">
                Sign Out
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/admin/users" className="card bg-base-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
              <div className="card-body">
                <h2 className="card-title text-primary">👥 Users</h2>
                <p className="opacity-70">Manage user accounts and roles</p>
              </div>
            </Link>

            <Link href="/admin/profiles" className="card bg-base-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
              <div className="card-body">
                <h2 className="card-title text-secondary">📋 Profiles</h2>
                <p className="opacity-70">View all talent and artist profiles</p>
              </div>
            </Link>

            <Link href="/admin/events" className="card bg-base-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
              <div className="card-body">
                <h2 className="card-title text-accent">📅 Events</h2>
                <p className="opacity-70">Create and manage events</p>
              </div>
            </Link>

            <Link href="/admin/gallery" className="card bg-base-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
              <div className="card-body">
                <h2 className="card-title text-primary">🖼️ Gallery</h2>
                <p className="opacity-70">Upload and organize gallery items</p>
              </div>
            </Link>

            <Link href="/admin/merchandise" className="card bg-base-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
              <div className="card-body">
                <h2 className="card-title text-secondary">🛍️ Merchandise</h2>
                <p className="opacity-70">Manage store products</p>
              </div>
            </Link>

            <Link href="/admin/statistics" className="card bg-gradient-to-br from-primary to-secondary shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
              <div className="card-body">
                <h2 className="card-title text-white">📊 Statistics</h2>
                <p className="text-white opacity-90">View analytics and reports</p>
              </div>
            </Link>
          </div>
        </Container>
        <Footer />
      </div>
    </div>
  )
}
