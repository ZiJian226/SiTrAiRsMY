'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Container from '@/components/Container'
import Footer from '@/components/Footer'
import PageBackground from '@/components/PageBackground'
import Link from 'next/link'

interface MerchandiseItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  image_url: string
  image_object_key?: string
  talent_name: string
  is_published: boolean
}

export default function AdminMerchandisePage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  
  const [items, setItems] = useState<MerchandiseItem[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [imageUploadError, setImageUploadError] = useState<string | null>(null)
  
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<MerchandiseItem | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'collectibles',
    stock: 0,
    image_url: '',
    image_object_key: '',
    talent_name: '',
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

  useEffect(() => {
    if (!user || !profile || profile.role !== 'admin') {
      return
    }

    void refreshItems()
  }, [user, profile])

  async function refreshItems() {
    setDataLoading(true)
    try {
      const response = await fetch('/api/admin/merchandise', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Failed to load merchandise')
      }

      const data = (await response.json()) as MerchandiseItem[]
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
      name: '',
      description: '',
      price: 0,
      category: 'collectibles',
      stock: 0,
      image_url: '',
      image_object_key: '',
      talent_name: '',
      is_published: false
    })
    setShowModal(true)
  }

  function openEditModal(item: MerchandiseItem) {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      stock: item.stock,
      image_url: item.image_url,
      image_object_key: item.image_object_key || '',
      talent_name: item.talent_name,
      is_published: item.is_published
    })
    setShowModal(true)
  }

  async function handleSave() {
    setSaving(true)

    try {
      const response = await fetch(
        editingItem ? `/api/admin/merchandise/${editingItem.id}` : '/api/admin/merchandise',
        {
          method: editingItem ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        },
      )

      if (!response.ok) {
        throw new Error('Failed to save merchandise')
      }

      await refreshItems()
      setShowModal(false)
    } catch (error) {
      console.error(error)
      alert('Unable to save merchandise. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/admin/merchandise/${id}`, { method: 'DELETE' })
        if (!response.ok) {
          throw new Error('Failed to delete merchandise')
        }

        await refreshItems()
      } catch (error) {
        console.error(error)
        alert('Unable to delete merchandise. Please try again.')
      }
    }
  }

  async function togglePublish(item: MerchandiseItem) {
    try {
      const response = await fetch(`/api/admin/merchandise/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, is_published: !item.is_published }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle merchandise publish status')
      }

      await refreshItems()
    } catch (error) {
      console.error(error)
      alert('Unable to update publish status.')
    }
  }

  async function handleMerchImageFileChange(file: File) {
    setImageUploading(true)
    setImageUploadError(null)

    try {
      const payload = new FormData()
      payload.append('file', file)
      payload.append('folder', 'merchandise')

      const response = await fetch('/api/admin/uploads/image', {
        method: 'POST',
        body: payload,
      })

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(errorData?.error || 'Failed to upload merchandise image')
      }

      const data = (await response.json()) as { url: string; key: string }
      setFormData({ ...formData, image_url: data.url, image_object_key: data.key })
    } catch (error) {
      setImageUploadError(error instanceof Error ? error.message : 'Failed to upload merchandise image')
    } finally {
      setImageUploading(false)
    }
  }

  const totalValue = items.reduce((sum, item) => sum + (item.price * item.stock), 0)

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
              <h1 className="text-4xl font-bold text-primary mb-2">Merchandise Management</h1>
              <p className="text-lg opacity-70">Manage all store products across all talents</p>
            </div>
            <button onClick={openCreateModal} className="btn btn-primary">
              + Add Product
            </button>
          </div>

          <div className="alert alert-info mb-6">
            <span>Merchandise is loaded from PostgreSQL via admin API.</span>
          </div>

          {/* Stats */}
          <div className="stats shadow mb-6 w-full">
            <div className="stat">
              <div className="stat-title">Total Products</div>
              <div className="stat-value text-primary">{items.length}</div>
              <div className="stat-desc">Across all talents</div>
            </div>
            <div className="stat">
              <div className="stat-title">Published</div>
              <div className="stat-value text-success">{items.filter(i => i.is_published).length}</div>
              <div className="stat-desc">Live on store</div>
            </div>
            <div className="stat">
              <div className="stat-title">Total Stock</div>
              <div className="stat-value text-secondary">{items.reduce((sum, i) => sum + i.stock, 0)}</div>
              <div className="stat-desc">Units available</div>
            </div>
            <div className="stat">
              <div className="stat-title">Inventory Value</div>
              <div className="stat-value text-accent">${totalValue.toFixed(2)}</div>
              <div className="stat-desc">At retail price</div>
            </div>
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
              className={`tab ${filterCategory === 'collectibles' ? 'tab-active' : ''}`}
              onClick={() => setFilterCategory('collectibles')}
            >
              Collectibles ({items.filter(i => i.category === 'collectibles').length})
            </a>
            <a 
              className={`tab ${filterCategory === 'apparel' ? 'tab-active' : ''}`}
              onClick={() => setFilterCategory('apparel')}
            >
              Apparel ({items.filter(i => i.category === 'apparel').length})
            </a>
            <a 
              className={`tab ${filterCategory === 'stickers' ? 'tab-active' : ''}`}
              onClick={() => setFilterCategory('stickers')}
            >
              Stickers ({items.filter(i => i.category === 'stickers').length})
            </a>
            <a 
              className={`tab ${filterCategory === 'accessories' ? 'tab-active' : ''}`}
              onClick={() => setFilterCategory('accessories')}
            >
              Accessories ({items.filter(i => i.category === 'accessories').length})
            </a>
          </div>

          {/* Products Table */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Talent</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataLoading && (
                      <tr>
                        <td colSpan={7} className="text-center py-8">
                          <span className="loading loading-spinner loading-md text-primary"></span>
                        </td>
                      </tr>
                    )}
                    {filteredItems.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-12 rounded">
                                <img 
                                  src={item.image_url} 
                                  alt={item.name}
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://placehold.co/100x100/333/FFF/png?text=?'
                                  }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="font-bold">{item.name}</div>
                              <div className="text-xs opacity-70 line-clamp-1">{item.description}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-ghost">{item.talent_name}</span>
                        </td>
                        <td>
                          <span className="badge badge-primary capitalize">{item.category}</span>
                        </td>
                        <td className="font-semibold">${item.price.toFixed(2)}</td>
                        <td>
                          <span className={`badge ${item.stock > 10 ? 'badge-success' : item.stock > 0 ? 'badge-warning' : 'badge-error'}`}>
                            {item.stock} units
                          </span>
                        </td>
                        <td>
                          <div className="form-control">
                            <input 
                              type="checkbox" 
                              className="toggle toggle-sm toggle-primary" 
                              checked={item.is_published}
                              onChange={() => togglePublish(item)}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => openEditModal(item)}
                              className="btn btn-xs btn-ghost"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="btn btn-xs btn-error btn-outline"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredItems.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-xl opacity-70 mb-4">No products in this category</p>
                    <button onClick={openCreateModal} className="btn btn-primary">
                      Add First Product
                    </button>
                  </div>
                )}
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
              {editingItem ? 'Edit Product' : 'Create New Product'}
            </h3>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Product Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  placeholder="Describe the product..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Price ($)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="input input-bordered"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Stock</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input input-bordered"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Category</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="collectibles">Collectibles</option>
                    <option value="apparel">Apparel</option>
                    <option value="stickers">Stickers</option>
                    <option value="accessories">Accessories</option>
                    <option value="digital">Digital</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Talent Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="Which talent is this for?"
                  value={formData.talent_name}
                  onChange={(e) => setFormData({ ...formData, talent_name: e.target.value })}
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
                  placeholder="https://example.com/image.jpg or /api/media/merchandise/..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value, image_object_key: '' })}
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
                      void handleMerchImageFileChange(file)
                    }
                    e.currentTarget.value = ''
                  }}
                />
                {imageUploading && (
                  <label className="label">
                    <span className="label-text-alt text-primary">Uploading merchandise image...</span>
                  </label>
                )}
                {imageUploadError && (
                  <label className="label">
                    <span className="label-text-alt text-error">{imageUploadError}</span>
                  </label>
                )}
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
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Product'}
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
