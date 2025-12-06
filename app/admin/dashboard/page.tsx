"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    // TODO: Implement actual logout with Supabase
    router.push("/admin/login");
  };

  const stats = [
    { label: "Total VTubers", value: "4", icon: "🎮", color: "text-primary" },
    { label: "Total Artists", value: "4", icon: "🎨", color: "text-secondary" },
    { label: "News Articles", value: "4", icon: "📰", color: "text-accent" },
    { label: "Applications", value: "12", icon: "📝", color: "text-info" },
  ];

  const quickActions = [
    { title: "Manage VTubers", href: "/admin/vtubers", icon: "🎮", color: "btn-primary" },
    { title: "Manage Artists", href: "/admin/artists", icon: "🎨", color: "btn-secondary" },
    { title: "Manage News", href: "/admin/news", icon: "📰", color: "btn-accent" },
    { title: "View Applications", href: "/admin/applications", icon: "📝", color: "btn-info" },
    { title: "Commission Requests", href: "/admin/commissions", icon: "💼", color: "btn-success" },
    { title: "Site Settings", href: "/admin/settings", icon: "⚙️", color: "btn-ghost" },
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
          <Link href="/" className="btn btn-ghost btn-sm">
            View Site
          </Link>
          <button onClick={handleLogout} className="btn btn-error btn-sm">
            Logout
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

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
        </div>

        {/* Quick Actions */}
        <div className="card bg-base-200 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className={`btn ${action.color} btn-lg justify-start`}
                >
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
              {[
                { action: "New application received", type: "VTuber", time: "5 minutes ago", color: "badge-primary" },
                { action: "Commission request submitted", type: "Artist", time: "1 hour ago", color: "badge-secondary" },
                { action: "New news article published", type: "News", time: "3 hours ago", color: "badge-accent" },
                { action: "VTuber profile updated", type: "Luna Sparkle", time: "5 hours ago", color: "badge-info" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-base-100 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`badge ${activity.color}`}>{activity.type}</div>
                    <span>{activity.action}</span>
                  </div>
                  <span className="text-sm opacity-70">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
