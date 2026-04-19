'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import Navbar from '@/components/Navbar'
import Container from '@/components/Container'
import Footer from '@/components/Footer'
import PageBackground from '@/components/PageBackground'
import Link from 'next/link'

type AuditLogItem = {
  id: string
  actor_user_id: string | null
  actor_role: string | null
  action: string
  resource_type: string
  resource_id: string | null
  target_user_id: string | null
  metadata: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  actor_email: string | null
  actor_name: string | null
  target_email: string | null
  target_name: string | null
}

export default function AdminAuditLogsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  const [items, setItems] = useState<AuditLogItem[]>([])
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

    void loadAuditLogs()
  }, [user, profile])

  async function loadAuditLogs() {
    setDataLoading(true)
    try {
      const response = await fetch('/api/admin/audit-logs?limit=200', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Failed to load audit logs')
      }

      const data = (await response.json()) as AuditLogItem[]
      setItems(data)
    } catch (error) {
      console.error(error)
      setItems([])
    } finally {
      setDataLoading(false)
    }
  }

  const totalCount = useMemo(() => items.length, [items])

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

  return (
    <div className="min-h-screen bg-base-100 relative flex flex-col">
      <PageBackground rotate={true} blur={true} opacity={50} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <Container className="py-12 flex-grow">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/admin" className="btn btn-ghost btn-sm">
              ← Back to Admin Panel
            </Link>
          </div>

          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">Audit Logs</h1>
              <p className="text-lg opacity-70">Recent account changes from users and admins</p>
            </div>
            <div className="badge badge-outline badge-lg">{totalCount} entries</div>
          </div>

          {dataLoading ? (
            <div className="flex justify-center py-16">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : items.length === 0 ? (
            <div className="alert alert-info">
              <span>No audit logs found yet.</span>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
              <table className="table table-zebra table-sm md:table-md">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Actor</th>
                    <th>Action</th>
                    <th>Resource</th>
                    <th>Target</th>
                    <th>IP</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="whitespace-nowrap">{new Date(item.created_at).toLocaleString()}</td>
                      <td>
                        <div className="font-semibold">{item.actor_name || item.actor_email || 'Unknown'}</div>
                        <div className="text-xs opacity-60">{item.actor_role || '-'}</div>
                      </td>
                      <td>
                        <span className="badge badge-outline">{item.action}</span>
                      </td>
                      <td>
                        <div>{item.resource_type}</div>
                        <div className="text-xs opacity-60 break-all">{item.resource_id || '-'}</div>
                      </td>
                      <td>{item.target_name || item.target_email || '-'}</td>
                      <td className="text-xs break-all">{item.ip_address || '-'}</td>
                      <td>
                        <details>
                          <summary className="cursor-pointer text-primary">View</summary>
                          <pre className="text-xs whitespace-pre-wrap break-all mt-2">
                            {JSON.stringify(item.metadata || {}, null, 2)}
                          </pre>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Container>
        <Footer />
      </div>
    </div>
  )
}
