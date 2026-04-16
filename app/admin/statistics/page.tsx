'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Container from '@/components/Container'
import Footer from '@/components/Footer'
import PageBackground from '@/components/PageBackground'
import Link from 'next/link'
import type { AdminStatistics } from '@/lib/admin/types'

export default function AdminStatisticsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  
  const [stats, setStats] = useState<AdminStatistics | null>(null)
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

    void fetchStats()
  }, [user, profile])

  async function fetchStats() {
    setDataLoading(true)
    try {
      const response = await fetch('/api/admin/statistics', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Failed to load statistics')
      }

      const data = (await response.json()) as AdminStatistics
      setStats(data)
    } catch (error) {
      console.error(error)
      setStats(null)
    } finally {
      setDataLoading(false)
    }
  }

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

  if (dataLoading || !stats) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100 relative flex flex-col">
      <PageBackground rotate={true} blur={true} opacity={50} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <Container className="py-12 flex-grow">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/admin" className="btn btn-ghost btn-sm">
              ← Back to Admin
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">📊 Platform Statistics</h1>
            <p className="text-lg opacity-70">Overview of platform activity and metrics</p>
          </div>

          {/* User Statistics */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">👥 Users</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Total Users</div>
                  <div className="stat-value text-primary">{stats.users.total}</div>
                  <div className="stat-desc">+{stats.users.newThisMonth} this month</div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Admins</div>
                  <div className="stat-value text-error">{stats.users.admins}</div>
                  <div className="stat-desc">Platform moderators</div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Talents</div>
                  <div className="stat-value text-secondary">{stats.users.talents}</div>
                  <div className="stat-desc">VTuber creators</div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Artists</div>
                  <div className="stat-value text-accent">{stats.users.artists}</div>
                  <div className="stat-desc">Content creators</div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">New Users</div>
                  <div className="stat-value text-success">{stats.users.newThisMonth}</div>
                  <div className="stat-desc">This month</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Statistics */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">📝 Content</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Total Events</div>
                  <div className="stat-value text-primary">{stats.content.totalEvents}</div>
                  <div className="stat-desc">{stats.content.upcomingEvents} upcoming</div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Gallery Items</div>
                  <div className="stat-value text-secondary">{stats.content.galleryItems}</div>
                  <div className="stat-desc">Artworks & photos</div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Merchandise</div>
                  <div className="stat-value text-accent">{stats.content.merchandiseItems}</div>
                  <div className="stat-desc">{stats.content.publishedMerch} published</div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Upcoming</div>
                  <div className="stat-value text-info">{stats.content.upcomingEvents}</div>
                  <div className="stat-desc">Events scheduled</div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Published</div>
                  <div className="stat-value text-success">{stats.content.publishedMerch}</div>
                  <div className="stat-desc">Merchandise items</div>
                </div>
              </div>
            </div>
          </div>

          {/* Engagement Statistics */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">📈 Engagement</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Page Views</div>
                  <div className="stat-value text-primary">{stats.engagement.pageViews.toLocaleString()}</div>
                  <div className="stat-desc">↗︎ 12% vs last month</div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Unique Visitors</div>
                  <div className="stat-value text-secondary">{stats.engagement.uniqueVisitors.toLocaleString()}</div>
                  <div className="stat-desc">↗︎ 8% vs last month</div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Avg Session</div>
                  <div className="stat-value text-accent">{stats.engagement.avgSessionDuration}</div>
                  <div className="stat-desc">Time on site</div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Bounce Rate</div>
                  <div className="stat-value text-info">{stats.engagement.bounceRate}</div>
                  <div className="stat-desc">↘︎ 3% vs last month</div>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Statistics */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">💰 Revenue</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Total Sales</div>
                  <div className="stat-value text-success">${stats.revenue.totalSales.toLocaleString()}</div>
                  <div className="stat-desc">↗︎ 15% vs last month</div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Avg Order Value</div>
                  <div className="stat-value text-primary">${stats.revenue.avgOrderValue}</div>
                  <div className="stat-desc">Per transaction</div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Top Sellers</div>
                  <div className="stat-value text-secondary">{stats.revenue.topSellingItems}</div>
                  <div className="stat-desc">Best performing</div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Conversion</div>
                  <div className="stat-value text-accent">{stats.revenue.conversionRate}</div>
                  <div className="stat-desc">Purchase rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">🕒 Recent Activity</h2>
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <div className="space-y-4">
                  {stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 bg-base-100 rounded-lg">
                      <div className="text-3xl">
                        {activity.type === 'user' && '👤'}
                        {activity.type === 'event' && '📅'}
                        {activity.type === 'gallery' && '🖼️'}
                        {activity.type === 'merch' && '🛍️'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{activity.action}</p>
                        <p className="text-sm opacity-70">
                          {activity.detail}
                        </p>
                      </div>
                      <div className="text-sm opacity-70 whitespace-nowrap">
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Charts Placeholder */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">📊 Analytics Charts</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">User Growth</h3>
                  <div className="h-64 bg-base-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-lg mb-2">📈 Line Chart</p>
                      <p className="text-sm opacity-70">User registration over time</p>
                      <p className="text-xs opacity-50 mt-2">
                        Chart library integration needed<br />
                        (e.g., Chart.js, Recharts, Victory)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">User Distribution</h3>
                  <div className="h-64 bg-base-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-lg mb-2">🍰 Pie Chart</p>
                      <p className="text-sm opacity-70">Users by role</p>
                      <p className="text-xs opacity-50 mt-2">
                        Chart library integration needed<br />
                        (e.g., Chart.js, Recharts, Victory)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">Revenue Trends</h3>
                  <div className="h-64 bg-base-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-lg mb-2">📊 Bar Chart</p>
                      <p className="text-sm opacity-70">Monthly revenue comparison</p>
                      <p className="text-xs opacity-50 mt-2">
                        Chart library integration needed<br />
                        (e.g., Chart.js, Recharts, Victory)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">Content Activity</h3>
                  <div className="h-64 bg-base-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-lg mb-2">📈 Area Chart</p>
                      <p className="text-sm opacity-70">Content uploads over time</p>
                      <p className="text-xs opacity-50 mt-2">
                        Chart library integration needed<br />
                        (e.g., Chart.js, Recharts, Victory)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <div className="font-semibold">Database-backed Statistics</div>
              <div className="text-sm">
                Core metrics are fetched from PostgreSQL. Engagement metrics remain placeholders until analytics tracking is wired.
              </div>
            </div>
          </div>
        </Container>
        <Footer />
      </div>
    </div>
  )
}
