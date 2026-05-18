'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import Container from '@/components/Container'
import Link from 'next/link'

type AuditTab = 'all' | 'auth' | 'session' | 'profile' | 'content' | 'application' | 'admin' | 'status'

type AuditRow = {
  id: string
  actor_user_id: string | null
  actor_role: string | null
  category: string | null
  action: string | null
  event_type: string | null
  resource_type: string | null
  resource_id: string | null
  entity_type: string | null
  entity_id: string | null
  page_key: string | null
  target_user_id: string | null
  session_id: string | null
  status_before: string | null
  status_after: string | null
  location_country: string | null
  metadata: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  actor_email: string | null
  actor_name: string | null
  target_email: string | null
  target_name: string | null
  user_id?: string
  email?: string | null
  full_name?: string | null
  role?: string | null
  is_online?: boolean
  last_seen_at?: string | null
  last_seen_ip_address?: string | null
  last_seen_country?: string | null
  active_session_count?: number
  latest_session_started_at?: string | null
}

type AuditResponse = {
  tab: AuditTab
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  categoryCounts: Record<string, number>
  statusSummary: {
    onlineCount: number
    offlineCount: number
    totalCount: number
  }
  rows: AuditRow[]
}

const tabs: Array<{ key: AuditTab; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'auth', label: 'Auth' },
  { key: 'session', label: 'Sessions' },
  { key: 'profile', label: 'Profiles' },
  { key: 'content', label: 'Content' },
  { key: 'application', label: 'Applications' },
  { key: 'admin', label: 'Admin' },
  { key: 'status', label: 'Live Status' },
]

export default function AdminAuditLogsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<AuditTab>('all')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<AuditResponse | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (!loading && profile && profile.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [user, profile, loading, router])

  useEffect(() => {
    if (!user || !profile || profile.role !== 'admin') {
      return
    }

    void loadAuditLogs(activeTab, page)
  }, [user, profile, activeTab, page])

  async function loadAuditLogs(tab: AuditTab, pageNumber: number) {
    setDataLoading(true)
    try {
      const response = await fetch(`/api/admin/audit-logs?tab=${tab}&page=${pageNumber}`, {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Failed to load audit logs')
      }

      const payload = (await response.json()) as AuditResponse
      setData(payload)
    } catch (error) {
      console.error(error)
      setData(null)
    } finally {
      setDataLoading(false)
    }
  }

  function switchTab(tab: AuditTab) {
    setActiveTab(tab)
    setPage(1)
  }

  const categoryCountLabel = useMemo(() => {
    if (!data) {
      return '0 entries'
    }

    return activeTab === 'status'
      ? `${data.statusSummary.totalCount} users`
      : `${data.totalCount} entries`
  }, [activeTab, data])

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

  const rows = data?.rows || []
  const totalPages = data?.totalPages || 1
  const currentPage = data?.page || page
  const isStatusTab = activeTab === 'status'

  return (
    <Container className="py-12 flex-grow">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin" className="btn btn-ghost btn-sm">
          ← Back to Admin Panel
        </Link>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">Audit Logs</h1>
          <p className="text-lg opacity-70">
            Track logins, session presence, profile changes, content edits, and application updates.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="badge badge-outline badge-lg">{categoryCountLabel}</div>
          <div className="badge badge-secondary badge-outline badge-lg">{data?.statusSummary.onlineCount ?? 0} online</div>
          <div className="badge badge-ghost badge-lg">{data?.statusSummary.offlineCount ?? 0} offline</div>
          <button
            type="button"
            className="btn btn-sm btn-warning"
            onClick={async () => {
              if (!confirm('Run session cleanup now? This will revoke inactive sessions.')) return;
              try {
                const res = await fetch('/api/admin/sessions/cleanup', { method: 'POST' });
                const payload = await res.json();
                if (res.ok) {
                  alert(`Cleanup complete. Revoked: ${payload.inactiveSessionsRevoked}, Deleted: ${payload.expiredSessionsDeleted}`);
                  // Reload logs to reflect updated status
                  void loadAuditLogs(activeTab, page);
                } else {
                  alert(`Cleanup failed: ${payload.error || 'unknown'}`);
                }
              } catch (err) {
                console.error(err);
                alert('Cleanup request failed');
              }
            }}
          >
            Run session cleanup
          </button>
        </div>
      </div>

      <div role="tablist" className="tabs tabs-boxed mb-6 flex-wrap gap-2">
        {tabs.map((tab) => {
          const count = tab.key === 'status'
            ? data?.statusSummary.totalCount ?? 0
            : data?.categoryCounts?.[tab.key] ?? 0

          return (
            <button
              key={tab.key}
              role="tab"
              type="button"
              aria-selected={activeTab === tab.key}
              className={`tab ${activeTab === tab.key ? 'tab-active' : ''}`}
              onClick={() => switchTab(tab.key)}
            >
              <span>{tab.label}</span>
              <span className="badge badge-sm ml-2">{count}</span>
            </button>
          )
        })}
      </div>

      {dataLoading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : rows.length === 0 ? (
        <div className="alert alert-info">
          <span>No records found for this section yet.</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
            <table className="table table-zebra table-sm md:table-md">
              <thead>
                {isStatusTab ? (
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Seen</th>
                    <th>IP</th>
                    <th>Country</th>
                    <th>Sessions</th>
                  </tr>
                ) : (
                  <tr>
                    <th>When</th>
                    <th>Actor</th>
                    <th>Action</th>
                    <th>Target / Resource</th>
                    <th>IP / Country</th>
                    <th>Details</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    {isStatusTab ? (
                      <>
                        <td>
                          <div className="font-semibold">{item.full_name || item.email || 'Unknown'}</div>
                          <div className="text-xs opacity-60 break-all">{item.email || '-'}</div>
                        </td>
                        <td>
                          <span className="badge badge-outline">{item.role || '-'}</span>
                        </td>
                        <td>
                          <span className={`badge ${item.is_online ? 'badge-success' : 'badge-ghost'}`}>
                            {item.is_online ? 'Online' : 'Offline'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap">{item.last_seen_at ? new Date(item.last_seen_at).toLocaleString() : '-'}</td>
                        <td className="text-xs break-all">{item.last_seen_ip_address || '-'}</td>
                        <td>{item.last_seen_country || '-'}</td>
                        <td>{item.active_session_count ?? 0}</td>
                      </>
                    ) : (
                      <>
                        <td className="whitespace-nowrap">{new Date(item.created_at).toLocaleString()}</td>
                        <td>
                          <div className="font-semibold">{item.actor_name || item.actor_email || 'Unknown'}</div>
                          <div className="text-xs opacity-60">{item.actor_role || '-'}</div>
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="badge badge-outline">{item.category || 'system'}</span>
                            <span className="badge badge-secondary badge-outline">{item.event_type || 'activity'}</span>
                          </div>
                          <div className="text-xs opacity-60 mt-1 break-all">{item.action || '-'}</div>
                        </td>
                        <td>
                          <div className="font-medium">{item.resource_type || item.entity_type || '-'}</div>
                          <div className="text-xs opacity-60 break-all">
                            {item.resource_id || item.entity_id || '-'}
                          </div>
                          <div className="text-xs opacity-60 break-all mt-1">
                            Target: {item.target_name || item.target_email || '-'}
                          </div>
                          {item.status_before || item.status_after ? (
                            <div className="text-xs opacity-60 mt-1">
                              {item.status_before || '-'} → {item.status_after || '-'}
                            </div>
                          ) : null}
                        </td>
                        <td className="text-xs break-all">
                          <div>{item.ip_address || '-'}</div>
                          <div className="opacity-60">{item.location_country || '-'}</div>
                        </td>
                        <td>
                          <details>
                            <summary className="cursor-pointer text-primary">View</summary>
                            <pre className="text-xs whitespace-pre-wrap break-all mt-2 max-w-xl">
                              {JSON.stringify(item.metadata || {}, null, 2)}
                            </pre>
                          </details>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-sm opacity-70">
              Page {currentPage} of {totalPages}
            </div>
            <div className="join">
              <button
                className="btn btn-sm join-item"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={currentPage <= 1 || dataLoading}
              >
                Previous
              </button>
              <button className="btn btn-sm join-item btn-disabled">{currentPage}</button>
              <button
                className="btn btn-sm join-item"
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                disabled={currentPage >= totalPages || dataLoading}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  )
}


