'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PageBackground from '@/components/PageBackground'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const pagesWithTheirOwnShell = [
    '/admin/dashboard',
    '/admin/users',
    '/admin/events',
    '/admin/gallery',
    '/admin/merchandise',
  ]
  const usePageShell = !pagesWithTheirOwnShell.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (!loading && profile && profile.role !== 'admin' && profile.role !== 'staff') {
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

  // If not admin or staff, render nothing (redirects handled in effect)
  if (!user || !profile || (profile.role !== 'admin' && profile.role !== 'staff')) return null

  if (!usePageShell) {
    return <main className="min-h-screen bg-base-100">{children}</main>
  }

  return (
    <div className="min-h-screen bg-base-100 relative flex flex-col">
      <PageBackground rotate={true} blur={true} opacity={50} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </div>
  )
}
