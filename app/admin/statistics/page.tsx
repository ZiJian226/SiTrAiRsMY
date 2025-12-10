'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Container from '@/components/Container'
import Footer from '@/components/Footer'
import PageBackground from '@/components/PageBackground'
import Link from 'next/link'

export default function AdminStatisticsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  
  // Mock statistics data
  const [stats] = useState({
    users: {
      total: 127,
      admins: 3,
      talents: 58,
      artists: 66,
      newThisMonth: 12
    },
    content: {
      totalEvents: 45,
      upcomingEvents: 8,
      galleryItems: 234,
      merchandiseItems: 89,
      publishedMerch: 67
    },
    engagement: {
      pageViews: 15420,
      uniqueVisitors: 3248,
      avgSessionDuration: '4m 32s',
      bounceRate: '42%'
    },
    revenue: {
      totalSales: 24580,
      avgOrderValue: 125.50,
      topSellingItems: 12,
      conversionRate: '3.2%'
    }
  })

  const [recentActivity] = useState([
    { id: 1, type: 'user', action: 'New talent registered', user: 'Neko Starlight', time: '2 hours ago' },
    { id: 2, type: 'event', action: 'Event published', title: 'Summer Festival 2025', time: '5 hours ago' },
    { id: 3, type: 'gallery', action: 'New artwork uploaded', user: 'Aria Designs', time: '1 day ago' },
    { id: 4, type: 'merch', action: 'Merchandise restocked', item: 'Luna Sparkle Acrylic Stand', time: '1 day ago' },
    { id: 5, type: 'user', action: 'Profile updated', user: 'Cyber Phoenix', time: '2 days ago' }
  ])

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
                  {recentActivity.map((activity) => (
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
                          {activity.user || activity.title || activity.item}
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
              <div className="font-semibold">Mock Statistics Mode</div>
              <div className="text-sm">
                These statistics are mock data for demonstration. In production, they would be fetched from your database and analytics service.
              </div>
            </div>
          </div>
        </Container>
        <Footer />
      </div>
    </div>
  )
}
