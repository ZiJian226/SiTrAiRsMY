'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Container from '@/components/Container'
import Link from 'next/link'

type ContentHighlight = {
  id: string
  title: string
  description: string | null
  video_url: string
  video_object_key: string | null
  thumbnail_url: string | null
  thumbnail_object_key: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function AdminContentHighlightsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  const [highlights, setHighlights] = useState<ContentHighlight[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    video_object_key: '',
    thumbnail_url: '',
    thumbnail_object_key: '',
    sort_order: 0,
    is_active: true,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (!loading && profile && profile.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [user, profile, loading, router])

  useEffect(() => {
    if (user && profile && profile.role === 'admin') {
      void loadHighlights()
    }
  }, [user, profile])

  async function loadHighlights() {
    setDataLoading(true)
    try {
      const response = await fetch('/api/admin/homepage-content-highlights', {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Failed to load highlights')
      }

      const data = await response.json()
      setHighlights(data.data || [])
    } catch (error) {
      console.error(error)
      alert('Failed to load content highlights')
    } finally {
      setDataLoading(false)
    }
  }

  async function handleSave() {
    if (!formData.title || !formData.video_url) {
      alert('Title and video URL are required')
      return
    }

    try {
      const url = '/api/admin/homepage-content-highlights'
      const method = editingId ? 'PUT' : 'POST'
      const payload = editingId ? { ...formData, id: editingId } : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to save')
      }

      void loadHighlights()
      resetForm()
      alert('Content highlight saved successfully')
    } catch (error) {
      console.error(error)
      alert('Failed to save content highlight')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this content highlight?')) return

    try {
      const response = await fetch(`/api/admin/homepage-content-highlights?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete')
      }

      void loadHighlights()
      alert('Content highlight deleted successfully')
    } catch (error) {
      console.error(error)
      alert('Failed to delete content highlight')
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      description: '',
      video_url: '',
      video_object_key: '',
      thumbnail_url: '',
      thumbnail_object_key: '',
      sort_order: 0,
      is_active: true,
    })
    setEditingId(null)
    setIsCreating(false)
  }

  function handleEdit(highlight: ContentHighlight) {
    setFormData({
      title: highlight.title,
      description: highlight.description || '',
      video_url: highlight.video_url,
      video_object_key: highlight.video_object_key || '',
      thumbnail_url: highlight.thumbnail_url || '',
      thumbnail_object_key: highlight.thumbnail_object_key || '',
      sort_order: highlight.sort_order,
      is_active: highlight.is_active,
    })
    setEditingId(highlight.id)
    setIsCreating(true)
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

  return (
    <Container className="py-12 flex-grow">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/dashboard" className="btn btn-ghost btn-sm">
          ← Back to Dashboard
        </Link>
      </div>

      <h1 className="text-4xl font-bold mb-2">Content Highlights</h1>
      <p className="text-lg opacity-70 mb-8">Manage homepage content highlight videos (2-column grid with autoplay)</p>

      {/* Create Form */}
      <div className="card bg-base-200 shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">{editingId ? 'Edit' : 'Add'} Content Highlight</h2>

        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Title *</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Content title"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Video URL *</span>
            </label>
            <input
              type="url"
              className="input input-bordered"
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Video Object Key</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={formData.video_object_key}
              onChange={(e) => setFormData({ ...formData, video_object_key: e.target.value })}
              placeholder="Oracle Object Storage key (optional)"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Thumbnail URL</span>
            </label>
            <input
              type="url"
              className="input input-bordered"
              value={formData.thumbnail_url}
              onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
              placeholder="https://... (optional)"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Thumbnail Object Key</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={formData.thumbnail_object_key}
              onChange={(e) => setFormData({ ...formData, thumbnail_object_key: e.target.value })}
              placeholder="Oracle Object Storage key (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Sort Order</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Active</span>
              </label>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button className="btn btn-primary flex-1" onClick={handleSave}>
              {editingId ? 'Update' : 'Create'} Highlight
            </button>
            {editingId && (
              <button className="btn btn-ghost" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Highlights List */}
      <div className="card bg-base-100 shadow-lg overflow-hidden">
        <div className="card-body">
          <h2 className="card-title">Existing Highlights</h2>

          {dataLoading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : highlights.length === 0 ? (
            <p className="text-center opacity-70 py-8">No content highlights yet. Create one above!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra table-sm">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Sort</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {highlights.map((highlight) => (
                    <tr key={highlight.id}>
                      <td>
                        <div className="font-semibold truncate max-w-xs">{highlight.title}</div>
                        {highlight.description && <div className="text-xs opacity-60 truncate">{highlight.description}</div>}
                      </td>
                      <td>{highlight.sort_order}</td>
                      <td>{highlight.is_active ? '✓' : '✗'}</td>
                      <td className="flex gap-2">
                        <button className="btn btn-sm btn-outline" onClick={() => handleEdit(highlight)}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-error" onClick={() => handleDelete(highlight.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}
