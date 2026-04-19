'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Container from '@/components/Container'
import Footer from '@/components/Footer'
import PageBackground from '@/components/PageBackground'
import Link from 'next/link'

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
  const [imageUploading, setImageUploading] = useState(false)
  const [imageUploadError, setImageUploadError] = useState<string | null>(null)
  
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
    featured: false
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
    try {
      const response = await fetch('/api/admin/gallery', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Failed to load gallery items')
      }

      const data = (await response.json()) as GalleryItem[]
      setItems(data)
    } catch (error) {
      console.error(error)
      setItems([])
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
      featured: false
    })
    setShowModal(true)
  }

  function openEditModal(item: GalleryItem) {
    setEditingItem(item)
    setFormData({
      title: item.title,
      image_url: item.image_url,
      image_object_key: item.image_object_key || '',
      description: item.description,
      category: item.category,
      artist_name: item.artist_name,
      is_published: item.is_published,
      featured: item.featured
    })
    setShowModal(true)
  }

  async function handleSave() {
    setSaving(true)

    try {
      const response = await fetch(
        editingItem ? `/api/admin/gallery/${editingItem.id}` : '/api/admin/gallery',
        {
          method: editingItem ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        },
      )

      if (!response.ok) {
        throw new Error('Failed to save gallery item')
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

  async function handleGalleryImageFileChange(file: File) {
    setImageUploading(true)
    setImageUploadError(null)

    try {
      const payload = new FormData()
      payload.append('file', file)
      payload.append('folder', 'gallery')

      const response = await fetch('/api/admin/uploads/image', {
        method: 'POST',
        body: payload,
      })

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(errorData?.error || 'Failed to upload gallery image')
      }

      const data = (await response.json()) as { url: string; key: string }
      setFormData({ ...formData, image_url: data.url, image_object_key: data.key })
    } catch (error) {
      setImageUploadError(error instanceof Error ? error.message : 'Failed to upload gallery image')
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
                  <img 
                    src={item.image_url} 
                    alt={item.title}
                    className="h-64 w-full object-cover transition-transform group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/800x600/333/FFF/png?text=No+Image'
                    }}
                  />
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

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Image URL</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="https://example.com/image.jpg or /api/media/gallery/..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value, image_object_key: '' })}
                  required
                  disabled={imageUploading}
                />
                <label className="label">
                  <span className="label-text-alt opacity-70">Or upload image to Oracle Object Storage</span>
                </label>
                <input
                  type="file"
                  className="file-input file-input-bordered"
                  accept="image/*"
                  disabled={imageUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      void handleGalleryImageFileChange(file)
                    }
                    e.currentTarget.value = ''
                  }}
                />
                {imageUploading && (
                  <label className="label">
                    <span className="label-text-alt text-primary">Uploading gallery image...</span>
                  </label>
                )}
                {imageUploadError && (
                  <label className="label">
                    <span className="label-text-alt text-error">{imageUploadError}</span>
                  </label>
                )}
                {formData.image_url && (
                  <div className="mt-2">
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="rounded-lg max-h-48 mx-auto"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/400x300/333/FFF/png?text=Invalid+URL'
                      }}
                    />
                  </div>
                )}
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
