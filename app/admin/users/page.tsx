'use client'

import { useAuth, type Profile } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Container from '@/components/Container'
import Footer from '@/components/Footer'
import PageBackground from '@/components/PageBackground'
import FormField from '@/components/FormField'
import FormSection from '@/components/FormSection'
import Link from 'next/link'
import type { UserRole } from '@/lib/auth/types'
import type { AdminUser } from '@/lib/admin/types'

export default function AdminUsersPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  
  const [users, setUsers] = useState<AdminUser[]>([])
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
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
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

      const data = (await response.json()) as AdminUser[]
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

  function openEditModal(user: AdminUser) {
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
          const errorData = (await response.json().catch(() => null)) as { error?: string } | null
          throw new Error(errorData?.error || 'Failed to update user')
        }
      } else {
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const errorData = (await response.json().catch(() => null)) as { error?: string } | null
          throw new Error(errorData?.error || 'Failed to create user')
        }

        const created = (await response.json()) as { email?: string; temporary_password?: string; warning?: string }
        if (created.email && created.temporary_password) {
          setCreatedUserCredentials({
            email: created.email,
            tempPassword: created.temporary_password,
          })
        }

        if (created.warning) {
          alert(created.warning)
        }
      }

      invalidateContentCaches()
      await refreshUsers()
      setShowModal(false)
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : 'Unable to save user. Please try again.')
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
      case 'staff': return 'badge-info'
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
                              onClick={() => handleSendResetEmail(u.user_id)}
                              className="btn btn-sm btn-secondary"
                              disabled={sendingResetEmail === u.user_id}
                            >
                              {sendingResetEmail === u.user_id ? 'Sending...' : 'Send Reset Email'}
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
                <div className="stat">
                  <div className="stat-title">Staffs</div>
                  <div className="stat-value text-secondary">{users.filter(u => u.role === 'staff').length}</div>
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
          <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-2xl mb-6">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h3>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="">
              <FormSection title="Account Information" description="Basic user account details">
                <FormField 
                  label="Email" 
                  required
                  help={editingUser ? "Changing email updates both login and profile records." : "User login email address"}
                >
                  <input
                    type="email"
                    className="input input-bordered w-full"
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={saving}
                    required
                  />
                </FormField>

                <FormField label="Full Name">
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Enter full name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    disabled={saving}
                  />
                </FormField>

                <FormField 
                  label="Role" 
                  required
                  sublabel="User type and permissions"
                >
                  <select
                    className="select select-bordered w-full"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    disabled={saving}
                  >
                    <option value="talent">Talent</option>
                    <option value="artist">Artist</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </FormField>
              </FormSection>

              <FormSection title="Avatar & Profile" description="Profile picture and bio">
                <FormField 
                  label="Avatar" 
                  help="Upload or provide URL for profile picture"
                >
                  <div className="space-y-2">
                    <input
                      type="file"
                      className="file-input file-input-bordered w-full"
                      accept="image/*"
                      disabled={saving || imageUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          void handleAvatarFileChange(file)
                        }
                        e.currentTarget.value = ''
                      }}
                    />
                    {imageUploading && (
                      <div className="flex items-center gap-2 text-primary text-sm">
                        <span className="loading loading-spinner loading-sm"></span>
                        Uploading avatar...
                      </div>
                    )}
                    {imageUploadError && (
                      <p className="text-error text-sm font-semibold">{imageUploadError}</p>
                    )}
                  </div>
                </FormField>

                <FormField 
                  label="Avatar URL" 
                  help="Or paste direct URL to image"
                >
                  <input
                    type="text"
                    className="input input-bordered w-full text-sm"
                    placeholder="https://example.com/avatar.jpg or /api/media/..."
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value, avatar_object_key: '' })}
                    disabled={saving || imageUploading}
                  />
                </FormField>

                <FormField label="Bio">
                  <textarea
                    className="textarea textarea-bordered w-full h-24"
                    placeholder="User bio or description..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={saving}
                  />
                </FormField>
              </FormSection>

              <div className="modal-action pt-4 border-t border-base-300">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="btn btn-ghost"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={saving}
                >
                  {saving ? 'Saving...' : editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => !saving && setShowModal(false)}></div>
        </div>
      )}
    </div>
  )
}
