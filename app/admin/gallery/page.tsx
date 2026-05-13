'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Container from '@/components/Container'
import Footer from '@/components/Footer'
import PageBackground from '@/components/PageBackground'
import Link from 'next/link'
import GalleryMediaShowcase, { type GalleryMediaItem } from '@/components/GalleryMediaShowcase'

interface GalleryItem {
  id: string
  title: string
  image_url: string
  image_object_key?: string
  description: string
  category: string
  artist_name: string
  is_published: boolean
  featured: boolean
  media?: Array<GalleryMediaItem & { media_object_key?: string; sort_order?: number }>
}

interface EditableMedia {
  media_type: 'photo' | 'video'
  media_url: string
  media_object_key?: string
  is_primary: boolean
  sort_order: number
}

function ensurePrimary(media: EditableMedia[]): EditableMedia[] {
  if (media.length === 0) {
    return [{ media_type: 'photo', media_url: '', is_primary: true, sort_order: 0 }]
  }

  if (media.some((item) => item.is_primary)) {
    return media
  }

  return media.map((item, index) => ({ ...item, is_primary: index === 0 }))
}

function invalidateContentCaches() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem('starmy:content:gallery:v2')
  window.localStorage.removeItem('starmy:content:gallery:v3')
}

export default function AdminGalleryPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  
  const [items, setItems] = useState<GalleryItem[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingMediaIndex, setUploadingMediaIndex] = useState<number | null>(null)
  const [imageUploadError, setImageUploadError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    image_object_key: '',
    description: '',
    category: 'artwork',
    artist_name: '',
    is_published: false,
    featured: false,
    media: [{ media_type: 'photo', media_url: '', is_primary: true, sort_order: 0 }] as EditableMedia[]
  })
  const [filterCategory, setFilterCategory] = useState('all')

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

    void refreshItems()
  }, [user, profile])

  async function refreshItems() {
    setDataLoading(true)
    setLoadError(null)
    try {
      const response = await fetch('/api/admin/gallery', { cache: 'no-store' })
      const payload = (await response.json().catch(() => null)) as GalleryItem[] | { error?: string } | null
      if (!response.ok) {
        throw new Error((payload as { error?: string } | null)?.error || 'Failed to load gallery items')
      }

      const data = (payload || []) as GalleryItem[]
      setItems(data)
    } catch (error) {
      console.error(error)
      setItems([])
      setLoadError(error instanceof Error ? error.message : 'Failed to load gallery items')
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

  const filteredItems = filterCategory === 'all' 
    ? items 
    : items.filter(item => item.category === filterCategory)

  function openCreateModal() {
    setEditingItem(null)
    setFormData({
      title: '',
      image_url: '',
      image_object_key: '',
      description: '',
      category: 'artwork',
      artist_name: '',
      is_published: false,
      featured: false,
      media: [{ media_type: 'photo', media_url: '', is_primary: true, sort_order: 0 }]
    })
    setShowModal(true)
  }

  function openEditModal(item: GalleryItem) {
    const incomingMedia = Array.isArray(item.media)
      ? item.media
          .map((entry, index) => ({
            media_type: entry.media_type,
            media_url: entry.media_url,
            media_object_key: entry.media_object_key,
            is_primary: Boolean(entry.is_primary),
            sort_order: Number.isFinite(entry.sort_order) ? Number(entry.sort_order) : index,
          }))
          .filter((entry) => entry.media_url.trim().length > 0)
      : []

    const normalizedMedia = ensurePrimary(
      incomingMedia.length > 0
        ? incomingMedia
        : [{ media_type: 'photo', media_url: item.image_url, media_object_key: item.image_object_key, is_primary: true, sort_order: 0 }],
    )

    setEditingItem(item)
    setFormData({
      title: item.title,
      image_url: item.image_url,
      image_object_key: item.image_object_key || '',
      description: item.description,
      category: item.category,
      artist_name: item.artist_name,
      is_published: item.is_published,
      featured: item.featured,
      media: normalizedMedia,
    })
    setShowModal(true)
  }

  function updateMedia(index: number, patch: Partial<EditableMedia>) {
    setFormData((prev) => {
      const updated = prev.media.map((entry, idx) => (idx === index ? { ...entry, ...patch } : entry))
      return {
        ...prev,
        media: updated,
      }
    })
  }

  function setPrimaryMedia(index: number) {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.map((entry, idx) => ({ ...entry, is_primary: idx === index })),
    }))
  }

  function addMedia(type: 'photo' | 'video') {
    setFormData((prev) => ({
      ...prev,
      media: [...prev.media, { media_type: type, media_url: '', is_primary: false, sort_order: prev.media.length }],
    }))
  }

  function removeMedia(index: number) {
    setFormData((prev) => {
      const next = prev.media.filter((_, idx) => idx !== index).map((entry, idx) => ({ ...entry, sort_order: idx }))
      return {
        ...prev,
        media: ensurePrimary(next),
      }
    })
  }

  async function handleSave() {
    setSaving(true)

    try {
      const normalizedMedia = ensurePrimary(
        formData.media
          .map((entry, index) => ({
            media_type: entry.media_type,
            media_url: entry.media_url.trim(),
            media_object_key: entry.media_object_key?.trim() || undefined,
            is_primary: Boolean(entry.is_primary),
            sort_order: index,
          }))
          .filter((entry) => entry.media_url.length > 0),
      )

      if (normalizedMedia.length === 0 || normalizedMedia.every((entry) => entry.media_url.length === 0)) {
        throw new Error('Please add at least one media URL or upload one file.')
      }

      const primary = normalizedMedia.find((entry) => entry.is_primary) ?? normalizedMedia[0]
      const payload = {
        ...formData,
        image_url: primary.media_url,
        image_object_key: primary.media_object_key || '',
        media: normalizedMedia,
      }

      const response = await fetch(
        editingItem ? `/api/admin/gallery/${editingItem.id}` : '/api/admin/gallery',
        {
          method: editingItem ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error || 'Failed to save gallery item')
      }

      invalidateContentCaches()
      await refreshItems()
      setShowModal(false)
    } catch (error) {
      console.error(error)
      alert('Unable to save gallery item. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this gallery item?')) {
      try {
        const response = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' })
        if (!response.ok) {
          throw new Error('Failed to delete gallery item')
        }

        await refreshItems()
      } catch (error) {
        console.error(error)
        alert('Unable to delete gallery item. Please try again.')
      }
    }
  }

  async function togglePublish(item: GalleryItem) {
    const nextPublished = !item.is_published
    setItems(prev => prev.map(current => current.id === item.id ? { ...current, is_published: nextPublished } : current))
    try {
      const response = await fetch(`/api/admin/gallery/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: nextPublished }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle gallery publish status')
      }

      const updated = (await response.json()) as GalleryItem
      setItems(prev => prev.map(current => current.id === item.id ? updated : current))
      invalidateContentCaches()
    } catch (error) {
      console.error(error)
      setItems(prev => prev.map(current => current.id === item.id ? { ...current, is_published: item.is_published } : current))
      alert('Unable to update publish status.')
    }
  }

  async function toggleFeatured(item: GalleryItem) {
    const nextFeatured = !item.featured
    setItems(prev => prev.map(current => current.id === item.id ? { ...current, featured: nextFeatured } : current))
    try {
      const response = await fetch(`/api/admin/gallery/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: nextFeatured }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle gallery featured status')
      }

      const updated = (await response.json()) as GalleryItem
      setItems(prev => prev.map(current => current.id === item.id ? updated : current))
      invalidateContentCaches()
    } catch (error) {
      console.error(error)
      await refreshItems()
      alert('Unable to update featured status. Please try again.')
    }
  }

  async function handleGalleryMediaFileChange(file: File, index: number) {
    setUploadingMediaIndex(index)
    setImageUploadError(null)

    try {
      const payload = new FormData()
      payload.append('file', file)
      payload.append('folder', 'gallery')

      const response = await fetch('/api/admin/uploads/media', {
        method: 'POST',
        body: payload,
      })

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(errorData?.error || 'Failed to upload media')
      }

      const data = (await response.json()) as { url: string; key: string; mediaType?: 'photo' | 'video' }
      updateMedia(index, {
        media_url: data.url,
        media_object_key: data.key,
        media_type: data.mediaType ?? formData.media[index]?.media_type ?? 'photo',
      })
    } catch (error) {
      setImageUploadError(error instanceof Error ? error.message : 'Failed to upload media')
    } finally {
      setUploadingMediaIndex(null)
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
              <h1 className="text-4xl font-bold text-primary mb-2">Gallery Management</h1>
              <p className="text-lg opacity-70">Upload and organize gallery items</p>
            </div>
            <button onClick={openCreateModal} className="btn btn-primary">
              + Upload Item
            </button>
          </div>

          <div className="alert alert-info mb-6">
            <span>Gallery items are loaded from PostgreSQL via admin API.</span>
          </div>

          {loadError && (
            <div className="alert alert-error mb-6">
              <span>{loadError}</span>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="tabs tabs-boxed mb-6">
            <a 
              className={`tab ${filterCategory === 'all' ? 'tab-active' : ''}`}
              onClick={() => setFilterCategory('all')}
            >
              All ({items.length})
            </a>
            <a 
              className={`tab ${filterCategory === 'artwork' ? 'tab-active' : ''}`}
              onClick={() => setFilterCategory('artwork')}
            >
              Artwork ({items.filter(i => i.category === 'artwork').length})
            </a>
            <a 
              className={`tab ${filterCategory === 'illustration' ? 'tab-active' : ''}`}
              onClick={() => setFilterCategory('illustration')}
            >
              Illustrations ({items.filter(i => i.category === 'illustration').length})
            </a>
            <a 
              className={`tab ${filterCategory === 'fanart' ? 'tab-active' : ''}`}
              onClick={() => setFilterCategory('fanart')}
            >
              Fan Art ({items.filter(i => i.category === 'fanart').length})
            </a>
            <a 
              className={`tab ${filterCategory === 'photo' ? 'tab-active' : ''}`}
              onClick={() => setFilterCategory('photo')}
            >
              Photos ({items.filter(i => i.category === 'photo').length})
            </a>
            <a 
              className={`tab ${filterCategory === 'video' ? 'tab-active' : ''}`}
              onClick={() => setFilterCategory('video')}
            >
              Videos ({items.filter(i => i.category === 'video').length})
            </a>
          </div>

          {/* Gallery Grid */}
          {dataLoading && (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className="card bg-base-200 shadow-xl group">
                <figure className="relative overflow-hidden">
                  {item.media && item.media.length > 0 ? (
                    <GalleryMediaShowcase media={item.media} title={item.title} height="h-64" />
                  ) : (
                    <img 
                      src={item.image_url} 
                      alt={item.title}
                      className="h-64 w-full object-cover transition-transform group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/800x600/333/FFF/png?text=No+Image'
                      }}
                    />
                  )}
                  <div className="absolute top-2 right-2">
                    <div className={`badge ${item.is_published ? 'badge-success' : 'badge-ghost'}`}>
                      {item.is_published ? '✓ Published' : '✗ Draft'}
                    </div>
                      <div className={`badge ${item.featured ? 'badge-secondary' : 'badge-ghost'}`}>
                        {item.featured ? '★ Featured' : '☆ Not Featured'}
                      </div>
                  </div>
                </figure>
                <div className="card-body">
                  <h2 className="card-title text-lg">{item.title}</h2>
                  <p className="text-sm opacity-70 line-clamp-2">{item.description}</p>
                  
                  <div className="flex gap-2 mt-2">
                    <div className="badge badge-primary capitalize">{item.category}</div>
                    <div className="badge badge-ghost text-xs">by {item.artist_name}</div>
                    <div className="badge badge-outline text-xs">{item.media?.length ?? 1} media</div>
                  </div>

                  <div className="card-actions justify-between mt-4">
                    <div className="form-control">
                      <label className="label cursor-pointer gap-2">
                        <span className="label-text text-xs">Publish</span>
                        <input 
                          type="checkbox" 
                          className="toggle toggle-sm toggle-primary" 
                          checked={item.is_published}
                          onChange={() => togglePublish(item)}
                        />
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="label cursor-pointer gap-2">
                        <span className="label-text text-xs">Featured</span>
                        <input 
                          type="checkbox" 
                          className="toggle toggle-sm toggle-secondary" 
                          checked={item.featured}
                          onChange={() => toggleFeatured(item)}
                        />
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openEditModal(item)}
                        className="btn btn-sm btn-ghost"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="btn btn-sm btn-error btn-outline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredItems.length === 0 && (
              <div className="col-span-full text-center py-16">
                <p className="text-xl opacity-70 mb-4">No items in this category</p>
                <button onClick={openCreateModal} className="btn btn-primary">
                  Upload First Item
                </button>
              </div>
            )}
          </div>
        </Container>
        <Footer />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-2xl mb-6">
              {editingItem ? 'Edit Gallery Item' : 'Upload New Item'}
            </h3>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Title</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="Enter item title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="divider my-2">Media (multiple photos/videos)</div>

              <div className="space-y-4">
                {formData.media.map((media, index) => (
                  <div key={`media-${index}`} className="card bg-base-200 border border-base-300">
                    <div className="card-body p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Media #{index + 1}</h4>
                        <div className="flex items-center gap-2">
                          <label className="label cursor-pointer gap-2 p-0">
                            <span className="label-text text-xs">Primary</span>
                            <input
                              type="radio"
                              name="primary-media"
                              className="radio radio-sm radio-primary"
                              checked={media.is_primary}
                              onChange={() => setPrimaryMedia(index)}
                            />
                          </label>
                          <button type="button" className="btn btn-xs btn-error btn-outline" onClick={() => removeMedia(index)}>
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <select
                          className="select select-bordered"
                          value={media.media_type}
                          onChange={(e) => updateMedia(index, { media_type: e.target.value as 'photo' | 'video' })}
                        >
                          <option value="photo">Photo</option>
                          <option value="video">Video</option>
                        </select>

                        <input
                          type="text"
                          className="input input-bordered"
                          placeholder={media.media_type === 'video' ? 'YouTube/Twitch/TikTok/direct video URL' : 'Image URL'}
                          value={media.media_url}
                          onChange={(e) => updateMedia(index, { media_url: e.target.value, media_object_key: undefined })}
                        />
                      </div>

                      <div>
                        <input
                          type="file"
                          className="file-input file-input-bordered w-full"
                          accept={media.media_type === 'video' ? 'video/*' : 'image/*'}
                          disabled={uploadingMediaIndex === index}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              void handleGalleryMediaFileChange(file, index)
                            }
                            e.currentTarget.value = ''
                          }}
                        />
                        {uploadingMediaIndex === index && (
                          <p className="text-xs text-primary mt-2">Uploading media...</p>
                        )}
                      </div>

                      {media.media_url && media.media_type === 'photo' && (
                        <img
                          src={media.media_url}
                          alt={`Media ${index + 1}`}
                          className="rounded-lg max-h-44 w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/400x220/333/FFF/png?text=Invalid+Image'
                          }}
                        />
                      )}

                      {media.media_url && media.media_type === 'video' && (
                        <p className="text-xs opacity-70 break-all">Video URL: {media.media_url}</p>
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex gap-2">
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => addMedia('photo')}>
                    + Add Photo
                  </button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => addMedia('video')}>
                    + Add Video
                  </button>
                </div>

                {imageUploadError && <p className="text-sm text-error">{imageUploadError}</p>}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  placeholder="Describe the artwork..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Category</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="artwork">Artwork</option>
                    <option value="illustration">Illustration</option>
                    <option value="fanart">Fan Art</option>
                    <option value="photo">Photo</option>
                    <option value="video">Video</option>
                    <option value="3d">3D Model</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Artist Name</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="Artist name"
                    value={formData.artist_name}
                    onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  />
                  <span className="label-text font-semibold">Publish immediately</span>
                </label>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-secondary"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <span className="label-text font-semibold">Pin to Featured Gallery</span>
                </label>
              </div>

              <div className="modal-action">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Upload Item'}
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
