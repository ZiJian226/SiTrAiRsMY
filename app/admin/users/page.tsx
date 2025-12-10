'use client'

import { useAuth, type Profile } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Container from '@/components/Container'
import Footer from '@/components/Footer'
import PageBackground from '@/components/PageBackground'
import Link from 'next/link'

export default function AdminUsersPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  
  const [users, setUsers] = useState<Profile[]>([
    {
      id: '1',
      email: 'admin@starmy.com',
      full_name: 'Admin User',
      role: 'admin',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      bio: 'System administrator',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      email: 'talent@starmy.com',
      full_name: 'Sakura Hoshino',
      role: 'talent',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=talent',
      bio: 'Virtual talent and content creator',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      email: 'artist@starmy.com',
      full_name: 'Luna Artworks',
      role: 'artist',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=artist',
      bio: 'Digital artist and illustrator',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<Profile | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'talent' as 'talent' | 'artist' | 'admin',
    avatar_url: '',
    bio: ''
  })

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

  function openCreateModal() {
    setEditingUser(null)
    setFormData({
      email: '',
      full_name: '',
      role: 'talent',
      avatar_url: '',
      bio: ''
    })
    setShowModal(true)
  }

  function openEditModal(user: Profile) {
    setEditingUser(user)
    setFormData({
      email: user.email,
      full_name: user.full_name || '',
      role: user.role,
      avatar_url: user.avatar_url || '',
      bio: user.bio || ''
    })
    setShowModal(true)
  }

  function handleSave() {
    if (editingUser) {
      // Update existing user
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...formData, updated_at: new Date().toISOString() }
          : u
      ))
    } else {
      // Create new user
      const newUser: Profile = {
        id: Date.now().toString(),
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setUsers([...users, newUser])
    }
    setShowModal(false)
  }

  function handleDelete(id: string) {
    if (profile && id === profile.id) {
      alert('Cannot delete your own account!')
      return
    }
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(users.filter(u => u.id !== id))
    }
  }

  function getRoleBadgeColor(role: string) {
    switch (role) {
      case 'admin': return 'badge-error'
      case 'talent': return 'badge-primary'
      case 'artist': return 'badge-secondary'
      default: return 'badge-ghost'
    }
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
              <h1 className="text-4xl font-bold text-primary mb-2">User Management</h1>
              <p className="text-lg opacity-70">Manage all user accounts and roles</p>
            </div>
            <button onClick={openCreateModal} className="btn btn-primary">
              + Create User
            </button>
          </div>

          <div className="alert alert-warning mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 h-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>⚠️ Mock Mode: Changes won't persist after refresh</span>
          </div>

          {/* Users Table */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Bio</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-12 rounded-full">
                                <img 
                                  src={u.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
                                  alt={u.full_name || u.email}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="font-bold">{u.full_name || 'No name'}</div>
                              <div className="text-xs opacity-70">ID: {u.id}</div>
                            </div>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge ${getRoleBadgeColor(u.role)} capitalize`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <div className="max-w-xs truncate opacity-70">
                            {u.bio || 'No bio'}
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => openEditModal(u)}
                              className="btn btn-sm btn-ghost"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(u.id)}
                              className="btn btn-sm btn-error btn-outline"
                              disabled={u.id === profile.id}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="stats shadow mt-6">
                <div className="stat">
                  <div className="stat-title">Total Users</div>
                  <div className="stat-value text-primary">{users.length}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Admins</div>
                  <div className="stat-value text-error">{users.filter(u => u.role === 'admin').length}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Talents</div>
                  <div className="stat-value text-primary">{users.filter(u => u.role === 'talent').length}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Artists</div>
                  <div className="stat-value text-secondary">{users.filter(u => u.role === 'artist').length}</div>
                </div>
              </div>
            </div>
          </div>
        </Container>
        <Footer />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-2xl mb-6">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h3>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Email</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={!!editingUser}
                />
                {editingUser && (
                  <label className="label">
                    <span className="label-text-alt opacity-70">Email cannot be changed</span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Full Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="Enter full name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Role</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                >
                  <option value="talent">Talent</option>
                  <option value="artist">Artist</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Avatar URL</span>
                </label>
                <input
                  type="url"
                  className="input input-bordered"
                  placeholder="https://example.com/avatar.jpg"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Bio</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  placeholder="User bio..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <div className="modal-action">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)}></div>
        </div>
      )}
    </div>
  )
}
