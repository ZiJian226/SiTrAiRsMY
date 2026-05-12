'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import Container from '@/components/Container'
import Footer from '@/components/Footer'
import PageBackground from '@/components/PageBackground'

interface CommissionRequestRecord {
  id: string
  artist_profile_id: string
  client_name: string
  client_email: string
  description: string
  budget: string
  deadline: string | null
  status: 'pending' | 'accepted' | 'rejected'
  accepted_at: string | null
  rejected_at: string | null
  created_at: string
  updated_at: string
}

interface CommissionDashboardResponse {
  artistProfileId: string | null
  artistName: string | null
  pending: CommissionRequestRecord[]
  ongoing: CommissionRequestRecord[]
}

export default function ArtistCommissionsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [dashboard, setDashboard] = useState<CommissionDashboardResponse | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [actionBusyId, setActionBusyId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (!loading && profile && profile.role !== 'artist') {
      router.push('/dashboard')
    }
  }, [loading, user, profile, router])

  useEffect(() => {
    if (!user || !profile || profile.role !== 'artist') {
      return
    }

    const loadDashboard = async () => {
      setPageLoading(true)
      try {
        const response = await fetch('/api/dashboard/commissions', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Failed to load commission requests')
        }

        const data = (await response.json()) as { data?: CommissionDashboardResponse }
        setDashboard(data.data ?? null)
      } catch (error) {
        setDashboard(null)
      } finally {
        setPageLoading(false)
      }
    }

    void loadDashboard()
  }, [user, profile])

  const stats = useMemo(() => {
    return {
      pending: dashboard?.pending.length ?? 0,
      ongoing: dashboard?.ongoing.length ?? 0,
    }
  }, [dashboard])

  async function refreshDashboard() {
    const response = await fetch('/api/dashboard/commissions', { cache: 'no-store' })
    if (!response.ok) {
      throw new Error('Failed to refresh commission requests')
    }

    const data = (await response.json()) as { data?: CommissionDashboardResponse }
    setDashboard(data.data ?? null)
  }

  async function handleAction(requestId: string, action: 'accepted' | 'rejected') {
    setActionBusyId(requestId)
    try {
      const response = await fetch(`/api/dashboard/commissions/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error || 'Failed to update commission request')
      }

      await refreshDashboard()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update commission request')
    } finally {
      setActionBusyId(null)
    }
  }

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  if (!user || !profile || profile.role !== 'artist') {
    return null
  }

  return (
    <div className="min-h-screen bg-base-100 relative flex flex-col">
      <PageBackground rotate={true} blur={true} opacity={50} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <Container className="py-12 flex-grow">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-sm uppercase tracking-wider opacity-70">Artist Dashboard</p>
              <h1 className="text-4xl font-bold text-primary">Commission Requests</h1>
              <p className="text-lg opacity-70 mt-2">Review requests, accept them, and track active commissions.</p>
            </div>
            <Link href="/dashboard" className="btn btn-outline btn-primary">
              ← Back to Dashboard
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="card bg-base-200 shadow">
              <div className="card-body">
                <h3 className="card-title text-sm">Pending Requests</h3>
                <p className="text-3xl font-bold text-warning">{stats.pending}</p>
              </div>
            </div>
            <div className="card bg-base-200 shadow">
              <div className="card-body">
                <h3 className="card-title text-sm">Ongoing Commissions</h3>
                <p className="text-3xl font-bold text-success">{stats.ongoing}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-primary">Request Commission</h2>
                <p className="opacity-70 text-sm mb-4">New requests are shown here until you accept or reject them.</p>
                <div className="space-y-4">
                  {dashboard?.pending.length ? dashboard.pending.map((request) => (
                    <div key={request.id} className="rounded-2xl bg-base-100 p-4 border border-base-300">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-lg">{request.client_name}</h3>
                          <p className="text-sm opacity-70 break-all">{request.client_email}</p>
                        </div>
                        <div className="badge badge-warning">Pending</div>
                      </div>

                      <div className="mt-3 space-y-2 text-sm">
                        <p className="opacity-80 whitespace-pre-line">{request.description}</p>
                        <p><span className="font-semibold">Budget:</span> {request.budget}</p>
                        <p><span className="font-semibold">Deadline:</span> {request.deadline || 'No deadline'}</p>
                        <p className="text-xs opacity-60">Requested on {new Date(request.created_at).toLocaleString()}</p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          className="btn btn-success btn-sm"
                          disabled={actionBusyId === request.id}
                          onClick={() => handleAction(request.id, 'accepted')}
                        >
                          {actionBusyId === request.id ? 'Working...' : 'Accept'}
                        </button>
                        <button
                          className="btn btn-error btn-outline btn-sm"
                          disabled={actionBusyId === request.id}
                          onClick={() => handleAction(request.id, 'rejected')}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="alert alert-info">
                      <span>No pending commission requests.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-success">Ongoing Commission</h2>
                <p className="opacity-70 text-sm mb-4">Accepted requests move here automatically.</p>
                <div className="space-y-4">
                  {dashboard?.ongoing.length ? dashboard.ongoing.map((request) => (
                    <div key={request.id} className="rounded-2xl bg-base-100 p-4 border border-success/30">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-lg">{request.client_name}</h3>
                          <p className="text-sm opacity-70 break-all">{request.client_email}</p>
                        </div>
                        <div className="badge badge-success">Accepted</div>
                      </div>

                      <div className="mt-3 space-y-2 text-sm">
                        <p className="opacity-80 whitespace-pre-line">{request.description}</p>
                        <p><span className="font-semibold">Budget:</span> {request.budget}</p>
                        <p><span className="font-semibold">Deadline:</span> {request.deadline || 'No deadline'}</p>
                        <p className="text-xs opacity-60">Accepted on {request.accepted_at ? new Date(request.accepted_at).toLocaleString() : 'Just now'}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="alert alert-info">
                      <span>No ongoing commissions yet.</span>
                    </div>
                  )}
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
