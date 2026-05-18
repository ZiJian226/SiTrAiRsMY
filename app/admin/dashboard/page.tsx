"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { AdminStatistics } from "@/lib/admin/types";

export default function AdminDashboard() {
  const router = useRouter();
  const [statsData, setStatsData] = useState<AdminStatistics | null>(null);
  const [pendingApps, setPendingApps] = useState({ career: 0, agency: 0 });

  const handleLogout = () => {
    // TODO: Implement actual logout with your Oracle-backed auth/session endpoint
    router.push("/admin/login");
  };

  useEffect(() => {
    let mounted = true;

    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/statistics', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to load dashboard stats');
        }

        const data = (await response.json()) as AdminStatistics;
        if (mounted) {
          setStatsData(data);
        }
      } catch (error) {
        console.error(error);
        if (mounted) {
          setStatsData(null);
        }
      }
    }

    void fetchStats();
    void fetchPendingApplications();

    return () => {
      mounted = false;
    };
  }, []);

  async function fetchPendingApplications() {
    try {
      const careerRes = await fetch('/api/admin/applications?type=career');
      const agencyRes = await fetch('/api/admin/applications?type=agency');
      if (!careerRes.ok || !agencyRes.ok) return;
      const careerJson = await careerRes.json();
      const agencyJson = await agencyRes.json();
      const careerCount = (careerJson.data?.data || careerJson.data || []).filter((a: any) => a.status === 'pending').length;
      const agencyCount = (agencyJson.data?.data || agencyJson.data || []).filter((a: any) => a.status === 'pending').length;
      setPendingApps({ career: careerCount, agency: agencyCount });
    } catch (err) {
      // ignore
    }
  }

  const stats = [
    { label: "Total Users", value: String(statsData?.users.total ?? 0), icon: "👥", color: "text-primary" },
    { label: "Talents", value: String(statsData?.users.talents ?? 0), icon: "🎮", color: "text-secondary" },
    { label: "Artists", value: String(statsData?.users.artists ?? 0), icon: "🎨", color: "text-accent" },
    { label: "Events", value: String(statsData?.content.totalEvents ?? 0), icon: "📅", color: "text-info" },
  ];

  const quickActions = [
    { title: "Users", href: "/admin/users", icon: "👥", color: "btn-primary" },
    { title: "Profiles", href: "/admin/profiles", icon: "📋", color: "btn-secondary" },
    { title: "Events", href: "/admin/events", icon: "📅", color: "btn-accent" },
    { title: "Gallery", href: "/admin/gallery", icon: "🖼️", color: "btn-info" },
    { title: "Merchandise", href: "/admin/merchandise", icon: "🛍️", color: "btn-success" },
    { title: "Applications", href: "/admin/applications", icon: "📨", color: "btn-warning" },
    { title: "Audit Logs", href: "/admin/audit-logs", icon: "🧾", color: "btn-ghost" },
    { title: "Statistics", href: "/admin/statistics", icon: "📊", color: "btn-info" },
  ];

  return (
    <div className="min-h-screen bg-base-100">
      {/* Admin Header */}
      <div className="navbar bg-base-200 shadow-lg">
        <div className="navbar-start">
          <Link href="/" className="btn btn-ghost text-xl font-bold text-primary">
            ⭐ StarMy Admin
          </Link>
        </div>
        <div className="navbar-end gap-2">
          <Link href="/dashboard" className="btn btn-ghost btn-sm">
            Back to Dashboard
          </Link>
          <Link href="/" className="btn btn-ghost btn-sm">
            View Site
          </Link>
          <button onClick={handleLogout} className="btn btn-error btn-sm">
            Logout
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin" className="btn btn-ghost btn-sm">← Back to Admin</Link>
          <h1 className="text-4xl font-bold mb-0">Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-70">{stat.label}</p>
                    <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className="text-5xl">{stat.icon}</div>
                </div>
              </div>
            </div>
          ))}

          {/* Admin-specific quick metrics */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <p className="text-sm opacity-70">Pending Career Applications</p>
              <p className="text-4xl font-bold text-warning">{pendingApps.career}</p>
            </div>
          </div>
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <p className="text-sm opacity-70">Pending Community Applications</p>
              <p className="text-4xl font-bold text-warning">{pendingApps.agency}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions + Create Shortcuts + User Search */}
        <div className="card bg-base-200 shadow-xl mb-8">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title text-2xl">Quick Actions</h2>
              <div className="flex items-center gap-2">
                <input id="admin-user-search" placeholder="Search users..." className="input input-sm" />
                <button
                  onClick={() => {
                    const el = document.getElementById('admin-user-search') as HTMLInputElement | null;
                    const q = el?.value?.trim();
                    if (q) window.location.href = `/admin/users?query=${encodeURIComponent(q)}`;
                  }}
                  className="btn btn-sm"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <Link href="/admin/events/new" className="btn btn-accent btn-lg justify-start">🎫 Create Event</Link>
              <Link href="/admin/gallery/new" className="btn btn-secondary btn-lg justify-start">🖼️ New Gallery Item</Link>
              <Link href="/admin/merchandise/new" className="btn btn-success btn-lg justify-start">➕ Add Merchandise</Link>
              <Link href="/admin/commissions" className="btn btn-info btn-lg justify-start">💼 Commission Requests</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href} className={`btn ${action.color} btn-lg justify-start`}>
                  <span className="text-2xl mr-2">{action.icon}</span>
                  {action.title}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {(statsData?.recentActivity ?? []).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-base-100 rounded-lg">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                      <div className="badge badge-primary">{activity.type}</div>
                      <span className="font-semibold">{activity.action}</span>
                    </div>
                    {activity.detail && (
                      <div className="text-sm opacity-70 mt-1">{activity.detail}</div>
                    )}
                  </div>
                  <span className="text-sm opacity-70">{activity.time}</span>
                </div>
              ))}
              {(statsData?.recentActivity.length ?? 0) === 0 && (
                <div className="p-4 bg-base-100 rounded-lg text-sm opacity-70">No recent activity yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
