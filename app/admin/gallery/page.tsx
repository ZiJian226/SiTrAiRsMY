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
  description: string
  category: string
  artist_name: string
  is_published: boolean
}

export default function AdminGalleryPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  
  const [items, setItems] = useState<GalleryItem[]>([
    {
      id: '1',
      title: 'Character Concept Art',
      image_url: 'https://placehold.co/800x600/5B21B6/FFFFFF/png?text=Concept+Art',
      description: 'Original character design concept for debut',
      category: 'artwork',
      artist_name: 'Luna Artworks',
      is_published: true
    },
    {
      id: '2',
      title: 'Anniversary Illustration',
      image_url: 'https://placehold.co/800x600/7C3AED/FFFFFF/png?text=Anniversary',
      description: 'Special anniversary celebration artwork',
      category: 'illustration',
      artist_name: 'Starlight Studios',
      is_published: true
    },
    {
      id: '3',
      title: 'Fan Art Showcase',
      image_url: 'https://placehold.co/800x600/A78BFA/FFFFFF/png?text=Fan+Art',
      description: 'Amazing fan art from our community',
      category: 'fanart',
      artist_name: 'Community',
      is_published: false
    }
  ])
  
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    description: '',
    category: 'artwork',
    artist_name: '',
    is_published: false
  })
  const [filterCategory, setFilterCategory] = useState('all')

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

  const filteredItems = filterCategory === 'all' 
    ? items 
    : items.filter(item => item.category === filterCategory)

  function openCreateModal() {
    setEditingItem(null)
    setFormData({
      title: '',
      image_url: '',
      description: '',
      category: 'artwork',
      artist_name: '',
      is_published: false
    })
    setShowModal(true)
  }

  function openEditModal(item: GalleryItem) {
    setEditingItem(item)
    setFormData({
      title: item.title,
      image_url: item.image_url,
      description: item.description,
      category: item.category,
      artist_name: item.artist_name,
      is_published: item.is_published
    })
    setShowModal(true)
  }

  function handleSave() {
    if (editingItem) {
      setItems(items.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...formData }
          : item
      ))
    } else {
      const newItem: GalleryItem = {
        id: Date.now().toString(),
        ...formData
      }
      setItems([...items, newItem])
    }
    setShowModal(false)
  }

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this gallery item?')) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  function togglePublish(id: string) {
    setItems(items.map(item =>
      item.id === id
        ? { ...item, is_published: !item.is_published }
        : item
    ))
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

          <div className="alert alert-warning mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>⚠️ Mock Mode: Changes won't persist after refresh</span>
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
                          onChange={() => togglePublish(item.id)}
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
                  type="url"
                  className="input input-bordered"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  required
                />
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

              <div className="modal-action">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Save Changes' : 'Upload Item'}
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
