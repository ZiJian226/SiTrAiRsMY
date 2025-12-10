'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Container from '@/components/Container'
import Footer from '@/components/Footer'
import PageBackground from '@/components/PageBackground'
import Link from 'next/link'

interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string
  bio: string
  role: 'admin' | 'talent' | 'artist'
  lore?: string
  characterInfo?: {
    dateOfBirth?: string
    debutDate?: string
    height?: string
    species?: string
    likes?: string[]
    dislikes?: string[]
  }
  // Talent-specific
  tags?: string[]
  youtubeUrl?: string
  twitchUrl?: string
  tiktokUrl?: string
  // Artist-specific
  specialty?: string[]
  portfolio?: string[]
  commissionsOpen?: boolean
  priceRange?: string
  contactEmail?: string
  websiteUrl?: string
  twitterUrl?: string
  instagramUrl?: string
  // Visibility toggles
  showLore?: boolean
  showCharacterInfo?: boolean
  showSocialLinks?: boolean
  showPortfolio?: boolean
  created_at: string
}

export default function AdminProfilesPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  
  const [profiles, setProfiles] = useState<Profile[]>([
    {
      id: '1',
      email: 'admin@starmy.com',
      full_name: 'Admin User',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      bio: 'Platform administrator',
      role: 'admin',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      email: 'talent@starmy.com',
      full_name: 'Luna Sparkle',
      avatar_url: 'https://placehold.co/400x400/a855f7/ffffff?text=LS',
      bio: 'Gaming and singing VTuber',
      role: 'talent',
      lore: 'Luna Sparkle is a celestial being who descended from the stars...',
      characterInfo: {
        dateOfBirth: 'December 25',
        debutDate: 'January 15, 2023',
        height: '158 cm',
        species: 'Star Spirit',
        likes: ['RPGs', 'Karaoke', 'Cute plushies'],
        dislikes: ['Bugs in games', 'Loud noises']
      },
      tags: ['Gaming', 'Singing', 'Cozy Streams'],
      youtubeUrl: 'https://youtube.com/@lunasparkle',
      twitchUrl: 'https://twitch.tv/lunasparkle',
      tiktokUrl: 'https://tiktok.com/@lunasparkle',
      showLore: true,
      showCharacterInfo: true,
      showSocialLinks: true,
      created_at: '2024-02-01T00:00:00Z'
    },
    {
      id: '3',
      email: 'artist@starmy.com',
      full_name: 'Aria Designs',
      avatar_url: 'https://placehold.co/400x400/8b5cf6/ffffff?text=AD',
      bio: 'Professional character designer',
      role: 'artist',
      specialty: ['Character Design', '2D Illustration', 'Live2D'],
      portfolio: ['https://example.com/art1.jpg', 'https://example.com/art2.jpg'],
      commissionsOpen: true,
      priceRange: '$50 - $200',
      contactEmail: 'aria@starmy.com',
      websiteUrl: 'https://ariadesigns.com',
      twitterUrl: 'https://twitter.com/ariadesigns',
      instagramUrl: 'https://instagram.com/ariadesigns',
      showSocialLinks: true,
      showPortfolio: true,
      created_at: '2024-02-15T00:00:00Z'
    }
  ])

  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState<Profile | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [saving, setSaving] = useState(false)

  // Edit form input helpers
  const [tagInput, setTagInput] = useState('')
  const [likesInput, setLikesInput] = useState('')
  const [dislikesInput, setDislikesInput] = useState('')
  const [specialtyInput, setSpecialtyInput] = useState('')
  const [portfolioInput, setPortfolioInput] = useState('')

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

  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = 
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.bio.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || p.role === roleFilter
    return matchesSearch && matchesRole
  })

  function handleViewProfile(profile: Profile) {
    setSelectedProfile(profile)
    setIsViewModalOpen(true)
  }

  function handleEditProfile(profile: Profile) {
    setEditForm({ 
      ...profile,
      // Initialize defaults for visibility toggles if not set
      showLore: profile.showLore ?? true,
      showCharacterInfo: profile.showCharacterInfo ?? true,
      showSocialLinks: profile.showSocialLinks ?? true,
      showPortfolio: profile.showPortfolio ?? true,
      // Initialize empty arrays if not set
      tags: profile.tags || [],
      specialty: profile.specialty || [],
      portfolio: profile.portfolio || [],
      characterInfo: profile.characterInfo || {}
    })
    // Reset input helpers
    setTagInput('')
    setLikesInput('')
    setDislikesInput('')
    setSpecialtyInput('')
    setPortfolioInput('')
    setIsEditModalOpen(true)
  }

  async function handleSaveEdit() {
    if (!editForm) return
    
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
    
    setProfiles(profiles.map(p => p.id === editForm.id ? editForm : p))
    setSaving(false)
    setIsEditModalOpen(false)
    setEditForm(null)
  }

  function handleDeleteProfile(id: string) {
    if (confirm('Are you sure you want to delete this profile?')) {
      setProfiles(profiles.filter(p => p.id !== id))
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
              ← Back to Admin
            </Link>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">Profile Management</h1>
              <p className="text-lg opacity-70">View and manage all user profiles</p>
            </div>
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-title">Total Profiles</div>
                <div className="stat-value text-primary">{profiles.length}</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card bg-base-200 shadow-xl mb-6">
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <input
                    type="text"
                    placeholder="Search profiles..."
                    className="input input-bordered"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <select
                    className="select select-bordered"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admins</option>
                    <option value="talent">Talents</option>
                    <option value="artist">Artists</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Profiles Table */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Profile</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProfiles.map((p) => (
                      <tr key={p.id} className="hover">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                <img
                                  src={p.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + p.id}
                                  alt={p.full_name}
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + p.id
                                  }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="font-semibold">{p.full_name}</div>
                              <div className="text-sm opacity-70 line-clamp-1">{p.bio}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-sm">{p.email}</td>
                        <td>
                          <span className={`badge ${
                            p.role === 'admin' ? 'badge-error' :
                            p.role === 'talent' ? 'badge-primary' :
                            'badge-secondary'
                          }`}>
                            {p.role}
                          </span>
                        </td>
                        <td className="text-sm">{new Date(p.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-sm btn-ghost"
                              onClick={() => handleViewProfile(p)}
                            >
                              👁️ View
                            </button>
                            <button
                              className="btn btn-sm btn-primary btn-outline"
                              onClick={() => handleEditProfile(p)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn btn-sm btn-error btn-outline"
                              onClick={() => handleDeleteProfile(p.id)}
                              disabled={p.email === profile?.email}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredProfiles.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-lg opacity-70">No profiles found matching your search.</p>
                </div>
              )}
            </div>
          </div>

          {/* View Profile Modal */}
          {isViewModalOpen && selectedProfile && (
            <div className="modal modal-open">
              <div className="modal-box max-w-3xl">
                <button
                  className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  ✕
                </button>
                
                <h3 className="font-bold text-2xl mb-4">Profile Details</h3>

                <div className="space-y-6">
                  {/* Avatar and Basic Info */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="avatar">
                      <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-4">
                        <img
                          src={selectedProfile.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + selectedProfile.id}
                          alt={selectedProfile.full_name}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <h4 className="text-xl font-semibold">{selectedProfile.full_name}</h4>
                      <p className="text-sm opacity-70">{selectedProfile.email}</p>
                      <span className={`badge badge-lg mt-2 ${
                        selectedProfile.role === 'admin' ? 'badge-error' :
                        selectedProfile.role === 'talent' ? 'badge-primary' :
                        'badge-secondary'
                      }`}>
                        {selectedProfile.role}
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <p className="font-semibold text-primary mb-2">Bio:</p>
                    <p className="text-base">{selectedProfile.bio || 'No bio provided'}</p>
                  </div>

                  {/* Character Info for Talent/Artist */}
                  {(selectedProfile.role === 'talent' || selectedProfile.role === 'artist') && (
                    <>
                      {selectedProfile.lore && (
                        <div>
                          <p className="font-semibold text-primary mb-2">Lore / Backstory:</p>
                          <p className="text-base whitespace-pre-line">{selectedProfile.lore}</p>
                        </div>
                      )}

                      {selectedProfile.characterInfo && (
                        <div>
                          <p className="font-semibold text-primary mb-2">Character Information:</p>
                          <div className="grid grid-cols-2 gap-4">
                            {selectedProfile.characterInfo.dateOfBirth && (
                              <div>
                                <span className="text-sm opacity-70">Date of Birth:</span>
                                <p>{selectedProfile.characterInfo.dateOfBirth}</p>
                              </div>
                            )}
                            {selectedProfile.characterInfo.debutDate && (
                              <div>
                                <span className="text-sm opacity-70">Debut Date:</span>
                                <p>{selectedProfile.characterInfo.debutDate}</p>
                              </div>
                            )}
                            {selectedProfile.characterInfo.height && (
                              <div>
                                <span className="text-sm opacity-70">Height:</span>
                                <p>{selectedProfile.characterInfo.height}</p>
                              </div>
                            )}
                            {selectedProfile.characterInfo.species && (
                              <div>
                                <span className="text-sm opacity-70">Species:</span>
                                <p>{selectedProfile.characterInfo.species}</p>
                              </div>
                            )}
                          </div>
                          {selectedProfile.characterInfo.likes && selectedProfile.characterInfo.likes.length > 0 && (
                            <div className="mt-4">
                              <span className="text-sm opacity-70">Likes:</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {selectedProfile.characterInfo.likes.map((like, idx) => (
                                  <span key={idx} className="badge badge-success">{like}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {selectedProfile.characterInfo.dislikes && selectedProfile.characterInfo.dislikes.length > 0 && (
                            <div className="mt-4">
                              <span className="text-sm opacity-70">Dislikes:</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {selectedProfile.characterInfo.dislikes.map((dislike, idx) => (
                                  <span key={idx} className="badge badge-error">{dislike}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* Metadata */}
                  <div className="text-sm opacity-70">
                    <p>Profile ID: {selectedProfile.id}</p>
                    <p>Created: {new Date(selectedProfile.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <div className="modal-action">
                  <button className="btn" onClick={() => setIsViewModalOpen(false)}>
                    Close
                  </button>
                </div>
              </div>
              <div className="modal-backdrop" onClick={() => setIsViewModalOpen(false)} />
            </div>
          )}

          {/* Edit Profile Modal */}
          {isEditModalOpen && editForm && (
            <div className="modal modal-open">
              <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
                <button
                  className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  ✕
                </button>
                
                <h3 className="font-bold text-2xl mb-6">Edit Profile - {editForm.full_name}</h3>

                <div className="space-y-6">
                  {/* Profile Header Card */}
                  <div className="card bg-base-200">
                    <div className="card-body">
                      <h4 className="card-title text-primary">📋 Profile Header</h4>
                      
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Full Name</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered"
                          value={editForm.full_name}
                          onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                          disabled={saving}
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Email</span>
                        </label>
                        <input
                          type="email"
                          className="input input-bordered"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          disabled={saving}
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Avatar URL</span>
                        </label>
                        <input
                          type="url"
                          className="input input-bordered"
                          value={editForm.avatar_url}
                          onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
                          disabled={saving}
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Bio</span>
                          <span className="label-text-alt">{editForm.bio.length}/200</span>
                        </label>
                        <textarea
                          className="textarea textarea-bordered h-24"
                          value={editForm.bio}
                          onChange={(e) => setEditForm({ ...editForm, bio: e.target.value.slice(0, 200) })}
                          disabled={saving}
                          maxLength={200}
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Role</span>
                        </label>
                        <select
                          className="select select-bordered"
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'admin' | 'talent' | 'artist' })}
                          disabled={saving}
                        >
                          <option value="admin">Admin</option>
                          <option value="talent">Talent</option>
                          <option value="artist">Artist</option>
                        </select>
                      </div>

                      {/* Talent: Tags */}
                      {editForm.role === 'talent' && (
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">Tags</span>
                          </label>
                          <div className="join w-full">
                            <input
                              type="text"
                              className="input input-bordered join-item flex-1"
                              placeholder="Add a tag and press Enter"
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  if (tagInput.trim()) {
                                    setEditForm({ ...editForm, tags: [...(editForm.tags || []), tagInput.trim()] })
                                    setTagInput('')
                                  }
                                }
                              }}
                              disabled={saving}
                            />
                            <button
                              type="button"
                              className="btn btn-secondary join-item"
                              onClick={() => {
                                if (tagInput.trim()) {
                                  setEditForm({ ...editForm, tags: [...(editForm.tags || []), tagInput.trim()] })
                                  setTagInput('')
                                }
                              }}
                              disabled={saving}
                            >
                              Add
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {(editForm.tags || []).map((tag, idx) => (
                              <div key={idx} className="badge badge-secondary badge-lg gap-2">
                                {tag}
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-xs btn-circle"
                                  onClick={() => setEditForm({ ...editForm, tags: editForm.tags?.filter((_, i) => i !== idx) })}
                                  disabled={saving}
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Artist: Specialty */}
                      {editForm.role === 'artist' && (
                        <>
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text font-semibold">Specialty Tags</span>
                            </label>
                            <div className="join w-full">
                              <input
                                type="text"
                                className="input input-bordered join-item flex-1"
                                placeholder="Add specialty and press Enter"
                                value={specialtyInput}
                                onChange={(e) => setSpecialtyInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    if (specialtyInput.trim()) {
                                      setEditForm({ ...editForm, specialty: [...(editForm.specialty || []), specialtyInput.trim()] })
                                      setSpecialtyInput('')
                                    }
                                  }
                                }}
                                disabled={saving}
                              />
                              <button
                                type="button"
                                className="btn btn-accent join-item"
                                onClick={() => {
                                  if (specialtyInput.trim()) {
                                    setEditForm({ ...editForm, specialty: [...(editForm.specialty || []), specialtyInput.trim()] })
                                    setSpecialtyInput('')
                                  }
                                }}
                                disabled={saving}
                              >
                                Add
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {(editForm.specialty || []).map((spec, idx) => (
                                <div key={idx} className="badge badge-accent badge-lg gap-2">
                                  {spec}
                                  <button
                                    type="button"
                                    className="btn btn-ghost btn-xs btn-circle"
                                    onClick={() => setEditForm({ ...editForm, specialty: editForm.specialty?.filter((_, i) => i !== idx) })}
                                    disabled={saving}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="form-control">
                            <label className="label cursor-pointer justify-start gap-3">
                              <input
                                type="checkbox"
                                className="checkbox checkbox-secondary"
                                checked={editForm.commissionsOpen || false}
                                onChange={(e) => setEditForm({ ...editForm, commissionsOpen: e.target.checked })}
                                disabled={saving}
                              />
                              <span className="label-text font-semibold">Commissions Open</span>
                            </label>
                          </div>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text font-semibold">Price Range</span>
                            </label>
                            <input
                              type="text"
                              className="input input-bordered"
                              placeholder="e.g., $50 - $200"
                              value={editForm.priceRange || ''}
                              onChange={(e) => setEditForm({ ...editForm, priceRange: e.target.value })}
                              disabled={saving}
                            />
                          </div>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text font-semibold">Contact Email</span>
                            </label>
                            <input
                              type="email"
                              className="input input-bordered"
                              placeholder="contact@example.com"
                              value={editForm.contactEmail || ''}
                              onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                              disabled={saving}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Talent: Social Links */}
                  {editForm.role === 'talent' && (
                    <div className="card bg-base-200">
                      <div className="card-body">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="card-title text-primary">🔗 Social Links</h4>
                          <label className="label cursor-pointer gap-3">
                            <span className="label-text">Show on profile</span>
                            <input
                              type="checkbox"
                              className="toggle toggle-primary"
                              checked={editForm.showSocialLinks ?? true}
                              onChange={(e) => setEditForm({ ...editForm, showSocialLinks: e.target.checked })}
                              disabled={saving}
                            />
                          </label>
                        </div>

                        {editForm.showSocialLinks && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="form-control">
                              <label className="label">
                                <span className="label-text font-semibold">📺 YouTube URL</span>
                              </label>
                              <input
                                type="url"
                                className="input input-bordered"
                                placeholder="https://youtube.com/@yourname"
                                value={editForm.youtubeUrl || ''}
                                onChange={(e) => setEditForm({ ...editForm, youtubeUrl: e.target.value })}
                                disabled={saving}
                              />
                            </div>

                            <div className="form-control">
                              <label className="label">
                                <span className="label-text font-semibold">🎮 Twitch URL</span>
                              </label>
                              <input
                                type="url"
                                className="input input-bordered"
                                placeholder="https://twitch.tv/yourname"
                                value={editForm.twitchUrl || ''}
                                onChange={(e) => setEditForm({ ...editForm, twitchUrl: e.target.value })}
                                disabled={saving}
                              />
                            </div>

                            <div className="form-control">
                              <label className="label">
                                <span className="label-text font-semibold">🎵 TikTok URL</span>
                              </label>
                              <input
                                type="url"
                                className="input input-bordered"
                                placeholder="https://tiktok.com/@yourname"
                                value={editForm.tiktokUrl || ''}
                                onChange={(e) => setEditForm({ ...editForm, tiktokUrl: e.target.value })}
                                disabled={saving}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Artist: Social Links */}
                  {editForm.role === 'artist' && (
                    <div className="card bg-base-200">
                      <div className="card-body">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="card-title text-primary">🔗 Social Links</h4>
                          <label className="label cursor-pointer gap-3">
                            <span className="label-text">Show on profile</span>
                            <input
                              type="checkbox"
                              className="toggle toggle-secondary"
                              checked={editForm.showSocialLinks ?? true}
                              onChange={(e) => setEditForm({ ...editForm, showSocialLinks: e.target.checked })}
                              disabled={saving}
                            />
                          </label>
                        </div>

                        {editForm.showSocialLinks && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="form-control">
                              <label className="label">
                                <span className="label-text font-semibold">🌐 Website URL</span>
                              </label>
                              <input
                                type="url"
                                className="input input-bordered"
                                placeholder="https://yourwebsite.com"
                                value={editForm.websiteUrl || ''}
                                onChange={(e) => setEditForm({ ...editForm, websiteUrl: e.target.value })}
                                disabled={saving}
                              />
                            </div>

                            <div className="form-control">
                              <label className="label">
                                <span className="label-text font-semibold">🐦 Twitter URL</span>
                              </label>
                              <input
                                type="url"
                                className="input input-bordered"
                                placeholder="https://twitter.com/yourname"
                                value={editForm.twitterUrl || ''}
                                onChange={(e) => setEditForm({ ...editForm, twitterUrl: e.target.value })}
                                disabled={saving}
                              />
                            </div>

                            <div className="form-control">
                              <label className="label">
                                <span className="label-text font-semibold">📷 Instagram URL</span>
                              </label>
                              <input
                                type="url"
                                className="input input-bordered"
                                placeholder="https://instagram.com/yourname"
                                value={editForm.instagramUrl || ''}
                                onChange={(e) => setEditForm({ ...editForm, instagramUrl: e.target.value })}
                                disabled={saving}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Talent: Lore Section */}
                  {editForm.role === 'talent' && (
                    <div className="card bg-base-200">
                      <div className="card-body">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="card-title text-primary">📖 Introduction / Lore</h4>
                          <label className="label cursor-pointer gap-3">
                            <span className="label-text">Show on profile</span>
                            <input
                              type="checkbox"
                              className="toggle toggle-primary"
                              checked={editForm.showLore ?? true}
                              onChange={(e) => setEditForm({ ...editForm, showLore: e.target.checked })}
                              disabled={saving}
                            />
                          </label>
                        </div>

                        {editForm.showLore && (
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text font-semibold">Character Backstory</span>
                              <span className="label-text-alt">{(editForm.lore || '').length}/1000</span>
                            </label>
                            <textarea
                              className="textarea textarea-bordered h-40"
                              placeholder="Your character's backstory, lore, or detailed introduction..."
                              value={editForm.lore || ''}
                              onChange={(e) => setEditForm({ ...editForm, lore: e.target.value.slice(0, 1000) })}
                              disabled={saving}
                              maxLength={1000}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Talent: Character Info */}
                  {editForm.role === 'talent' && (
                    <div className="card bg-base-200">
                      <div className="card-body">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="card-title text-primary">ℹ️ Character Info</h4>
                          <label className="label cursor-pointer gap-3">
                            <span className="label-text">Show on profile</span>
                            <input
                              type="checkbox"
                              className="toggle toggle-primary"
                              checked={editForm.showCharacterInfo ?? true}
                              onChange={(e) => setEditForm({ ...editForm, showCharacterInfo: e.target.checked })}
                              disabled={saving}
                            />
                          </label>
                        </div>

                        {editForm.showCharacterInfo && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="form-control">
                                <label className="label">
                                  <span className="label-text font-semibold">Date of Birth</span>
                                </label>
                                <input
                                  type="text"
                                  className="input input-bordered"
                                  placeholder="e.g., December 25"
                                  value={editForm.characterInfo?.dateOfBirth || ''}
                                  onChange={(e) => setEditForm({
                                    ...editForm,
                                    characterInfo: { ...editForm.characterInfo, dateOfBirth: e.target.value }
                                  })}
                                  disabled={saving}
                                />
                              </div>

                              <div className="form-control">
                                <label className="label">
                                  <span className="label-text font-semibold">Debut Date</span>
                                </label>
                                <input
                                  type="text"
                                  className="input input-bordered"
                                  placeholder="e.g., January 15, 2023"
                                  value={editForm.characterInfo?.debutDate || ''}
                                  onChange={(e) => setEditForm({
                                    ...editForm,
                                    characterInfo: { ...editForm.characterInfo, debutDate: e.target.value }
                                  })}
                                  disabled={saving}
                                />
                              </div>

                              <div className="form-control">
                                <label className="label">
                                  <span className="label-text font-semibold">Height</span>
                                </label>
                                <input
                                  type="text"
                                  className="input input-bordered"
                                  placeholder="e.g., 158 cm"
                                  value={editForm.characterInfo?.height || ''}
                                  onChange={(e) => setEditForm({
                                    ...editForm,
                                    characterInfo: { ...editForm.characterInfo, height: e.target.value }
                                  })}
                                  disabled={saving}
                                />
                              </div>

                              <div className="form-control">
                                <label className="label">
                                  <span className="label-text font-semibold">Species</span>
                                </label>
                                <input
                                  type="text"
                                  className="input input-bordered"
                                  placeholder="e.g., Star Spirit, Cat, Dragon"
                                  value={editForm.characterInfo?.species || ''}
                                  onChange={(e) => setEditForm({
                                    ...editForm,
                                    characterInfo: { ...editForm.characterInfo, species: e.target.value }
                                  })}
                                  disabled={saving}
                                />
                              </div>
                            </div>

                            <div className="form-control">
                              <label className="label">
                                <span className="label-text font-semibold">Likes</span>
                              </label>
                              <div className="join w-full">
                                <input
                                  type="text"
                                  className="input input-bordered join-item flex-1"
                                  placeholder="Add a like and press Enter"
                                  value={likesInput}
                                  onChange={(e) => setLikesInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault()
                                      if (likesInput.trim()) {
                                        setEditForm({
                                          ...editForm,
                                          characterInfo: {
                                            ...editForm.characterInfo,
                                            likes: [...(editForm.characterInfo?.likes || []), likesInput.trim()]
                                          }
                                        })
                                        setLikesInput('')
                                      }
                                    }
                                  }}
                                  disabled={saving}
                                />
                                <button
                                  type="button"
                                  className="btn btn-success join-item"
                                  onClick={() => {
                                    if (likesInput.trim()) {
                                      setEditForm({
                                        ...editForm,
                                        characterInfo: {
                                          ...editForm.characterInfo,
                                          likes: [...(editForm.characterInfo?.likes || []), likesInput.trim()]
                                        }
                                      })
                                      setLikesInput('')
                                    }
                                  }}
                                  disabled={saving}
                                >
                                  Add
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {(editForm.characterInfo?.likes || []).map((like, idx) => (
                                  <div key={idx} className="badge badge-success badge-lg gap-2">
                                    ❤️ {like}
                                    <button
                                      type="button"
                                      className="btn btn-ghost btn-xs btn-circle"
                                      onClick={() => setEditForm({
                                        ...editForm,
                                        characterInfo: {
                                          ...editForm.characterInfo,
                                          likes: editForm.characterInfo?.likes?.filter((_, i) => i !== idx)
                                        }
                                      })}
                                      disabled={saving}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="form-control">
                              <label className="label">
                                <span className="label-text font-semibold">Dislikes</span>
                              </label>
                              <div className="join w-full">
                                <input
                                  type="text"
                                  className="input input-bordered join-item flex-1"
                                  placeholder="Add a dislike and press Enter"
                                  value={dislikesInput}
                                  onChange={(e) => setDislikesInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault()
                                      if (dislikesInput.trim()) {
                                        setEditForm({
                                          ...editForm,
                                          characterInfo: {
                                            ...editForm.characterInfo,
                                            dislikes: [...(editForm.characterInfo?.dislikes || []), dislikesInput.trim()]
                                          }
                                        })
                                        setDislikesInput('')
                                      }
                                    }
                                  }}
                                  disabled={saving}
                                />
                                <button
                                  type="button"
                                  className="btn btn-error join-item"
                                  onClick={() => {
                                    if (dislikesInput.trim()) {
                                      setEditForm({
                                        ...editForm,
                                        characterInfo: {
                                          ...editForm.characterInfo,
                                          dislikes: [...(editForm.characterInfo?.dislikes || []), dislikesInput.trim()]
                                        }
                                      })
                                      setDislikesInput('')
                                    }
                                  }}
                                  disabled={saving}
                                >
                                  Add
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {(editForm.characterInfo?.dislikes || []).map((dislike, idx) => (
                                  <div key={idx} className="badge badge-error badge-lg gap-2">
                                    💔 {dislike}
                                    <button
                                      type="button"
                                      className="btn btn-ghost btn-xs btn-circle"
                                      onClick={() => setEditForm({
                                        ...editForm,
                                        characterInfo: {
                                          ...editForm.characterInfo,
                                          dislikes: editForm.characterInfo?.dislikes?.filter((_, i) => i !== idx)
                                        }
                                      })}
                                      disabled={saving}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Artist: Portfolio */}
                  {editForm.role === 'artist' && (
                    <div className="card bg-base-200">
                      <div className="card-body">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="card-title text-primary">🎨 Portfolio</h4>
                          <label className="label cursor-pointer gap-3">
                            <span className="label-text">Show on profile</span>
                            <input
                              type="checkbox"
                              className="toggle toggle-secondary"
                              checked={editForm.showPortfolio ?? true}
                              onChange={(e) => setEditForm({ ...editForm, showPortfolio: e.target.checked })}
                              disabled={saving}
                            />
                          </label>
                        </div>

                        {editForm.showPortfolio && (
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text font-semibold">Portfolio URLs</span>
                            </label>
                            <div className="join w-full">
                              <input
                                type="url"
                                className="input input-bordered join-item flex-1"
                                placeholder="Add portfolio URL and press Enter"
                                value={portfolioInput}
                                onChange={(e) => setPortfolioInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    if (portfolioInput.trim()) {
                                      setEditForm({ ...editForm, portfolio: [...(editForm.portfolio || []), portfolioInput.trim()] })
                                      setPortfolioInput('')
                                    }
                                  }
                                }}
                                disabled={saving}
                              />
                              <button
                                type="button"
                                className="btn btn-accent join-item"
                                onClick={() => {
                                  if (portfolioInput.trim()) {
                                    setEditForm({ ...editForm, portfolio: [...(editForm.portfolio || []), portfolioInput.trim()] })
                                    setPortfolioInput('')
                                  }
                                }}
                                disabled={saving}
                              >
                                Add
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                              {(editForm.portfolio || []).map((url, idx) => (
                                <div key={idx} className="card bg-base-300 shadow-md">
                                  <div className="card-body p-3">
                                    <div className="flex justify-between items-center gap-2">
                                      <p className="text-xs truncate flex-1">{url}</p>
                                      <button
                                        type="button"
                                        className="btn btn-ghost btn-xs btn-circle"
                                        onClick={() => setEditForm({ ...editForm, portfolio: editForm.portfolio?.filter((_, i) => i !== idx) })}
                                        disabled={saving}
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-action">
                  <button 
                    className="btn btn-ghost" 
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSaveEdit}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
              <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)} />
            </div>
          )}
        </Container>
        <Footer />
      </div>
    </div>
  )
}
