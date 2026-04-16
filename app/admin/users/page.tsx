'use client'

import { useAuth, type Profile } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Container from '@/components/Container'
import Footer from '@/components/Footer'
import PageBackground from '@/components/PageBackground'
import Link from 'next/link'
import type { UserRole } from '@/lib/auth/types'

export default function AdminUsersPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  
  const [users, setUsers] = useState<Profile[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [imageUploadError, setImageUploadError] = useState<string | null>(null)

  const [createdUserCredentials, setCreatedUserCredentials] = useState<{
    email: string
    tempPassword: string
  } | null>(null)
  const [sendingResetEmail, setSendingResetEmail] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<Profile | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'talent' as UserRole,
    avatar_url: '',
    avatar_object_key: '',
    bio: ''
  })

  function invalidateContentCaches() {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.removeItem('starmy:content:talents:v2')
    window.localStorage.removeItem('starmy:content:talents:v3')
    window.localStorage.removeItem('starmy:content:artists:v2')
    window.localStorage.removeItem('starmy:content:artists:v3')
  }

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

    void refreshUsers()
  }, [user, profile])

  async function refreshUsers() {
    setDataLoading(true)
    try {
      const response = await fetch('/api/admin/users', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Failed to load users')
      }

      const data = (await response.json()) as Profile[]
      setUsers(data)
    } catch (error) {
      console.error(error)
      setUsers([])
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

  function openCreateModal() {
    setEditingUser(null)
    setFormData({
      email: '',
      full_name: '',
      role: 'talent',
      avatar_url: '',
      avatar_object_key: '',
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
      avatar_object_key: '',
      bio: user.bio || ''
    })
    setShowModal(true)
  }

  async function handleSave() {
    setSaving(true)

    try {
      if (editingUser) {
        const response = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          throw new Error('Failed to update user')
        }
      } else {
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          throw new Error('Failed to create user')
        }

        const created = (await response.json()) as { email?: string; temporary_password?: string }
        if (created.email && created.temporary_password) {
          setCreatedUserCredentials({
            email: created.email,
            tempPassword: created.temporary_password,
          })
        }
      }

      invalidateContentCaches()
      await refreshUsers()
      setShowModal(false)
    } catch (error) {
      console.error(error)
      alert('Unable to save user. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (profile && id === profile.id) {
      alert('Cannot delete your own account!')
      return
    }
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/admin/users/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete user')
        }

        invalidateContentCaches()
        await refreshUsers()
      } catch (error) {
        console.error(error)
        alert('Unable to delete user. Please try again.')
      }
    }
  }

  async function handleSendResetEmail(userId: string) {
    setSendingResetEmail(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}/send-reset-email`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to send reset email')
      }

      alert('Password reset email sent')
    } catch (error) {
      console.error(error)
      alert('Unable to send password reset email')
    } finally {
      setSendingResetEmail(null)
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

  async function handleAvatarFileChange(file: File) {
    setImageUploading(true)
    setImageUploadError(null)

    try {
      const payload = new FormData()
      payload.append('file', file)
      payload.append('folder', 'users/avatars')

      const response = await fetch('/api/admin/uploads/image', {
        method: 'POST',
        body: payload,
      })

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(errorData?.error || 'Failed to upload avatar')
      }

      const data = (await response.json()) as { url: string; key: string }
      setFormData({ ...formData, avatar_url: data.url, avatar_object_key: data.key })
    } catch (error) {
      setImageUploadError(error instanceof Error ? error.message : 'Failed to upload avatar')
    } finally {
      setImageUploading(false)
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

          {createdUserCredentials && (
            <div className="alert alert-success mb-6 items-start">
              <div>
                <div className="font-semibold">New account created and emailed successfully.</div>
                <div className="text-sm mt-1">Email: <span className="font-mono">{createdUserCredentials.email}</span></div>
                <div className="text-sm">Temporary password: <span className="font-mono">{createdUserCredentials.tempPassword}</span></div>
                <div className="text-xs opacity-70 mt-1">The user should reset this password after first login.</div>
              </div>
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => setCreatedUserCredentials(null)}>
                ✕
              </button>
            </div>
          )}

          <div className="alert alert-info mb-6">
            <span>Users are loaded from PostgreSQL via admin API.</span>
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
                    {dataLoading && (
                      <tr>
                        <td colSpan={5} className="text-center py-8">
                          <span className="loading loading-spinner loading-md text-primary"></span>
                        </td>
                      </tr>
                    )}
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
                              onClick={() => handleSendResetEmail(u.id)}
                              className="btn btn-sm btn-secondary"
                              disabled={sendingResetEmail === u.id}
                            >
                              {sendingResetEmail === u.id ? 'Sending...' : 'Send Reset Email'}
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
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value, avatar_object_key: '' })}
                  disabled={imageUploading}
                />
                <label className="label">
                  <span className="label-text-alt opacity-70">Or upload avatar to Oracle Object Storage</span>
                </label>
                <input
                  type="file"
                  className="file-input file-input-bordered"
                  accept="image/*"
                  disabled={imageUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      void handleAvatarFileChange(file)
                    }
                    e.currentTarget.value = ''
                  }}
                />
                {imageUploading && (
                  <label className="label">
                    <span className="label-text-alt text-primary">Uploading avatar...</span>
                  </label>
                )}
                {imageUploadError && (
                  <label className="label">
                    <span className="label-text-alt text-error">{imageUploadError}</span>
                  </label>
                )}
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
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingUser ? 'Save Changes' : 'Create User'}
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
