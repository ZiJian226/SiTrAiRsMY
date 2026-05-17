'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Container from '@/components/Container'
import Link from 'next/link'

export default function AdminPage() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // layout handles redirect; keep sign-out functionality here
  }, [])

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  return (
    <Container className="py-12">
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
            <Link href="/dashboard/agency-settings" className="card bg-base-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
              <div className="card-body">
                <h2 className="card-title text-accent">⚙️ Agency Settings</h2>
                <p className="opacity-70">Staff-facing shortcut for content management</p>
              </div>
            </Link>

            <Link href="/dashboard/homepage-background" className="card bg-gradient-to-br from-accent to-primary shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
              <div className="card-body">
                <h2 className="card-title text-white">🎬 Homepage Background</h2>
                <p className="text-white opacity-90">Manage the video or slideshow shown on the homepage hero</p>
              </div>
            </Link>

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

            <Link href="/admin/audit-logs" className="card bg-base-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
              <div className="card-body">
                <h2 className="card-title text-accent">🧾 Audit Logs</h2>
                <p className="opacity-70">Track profile and merchandise account changes</p>
              </div>
            </Link>
            
            <Link href="/dashboard/applications" className="card bg-base-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
              <div className="card-body">
                <h2 className="card-title text-primary">📨 Applications</h2>
                <p className="opacity-70">Review career & community applications</p>
              </div>
            </Link>
          </div>
        </Container>
  )
}
