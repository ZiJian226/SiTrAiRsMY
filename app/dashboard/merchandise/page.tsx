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
  is_published: boolean
}

export default function MerchandiseManagerPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  
  const [items, setItems] = useState<MerchandiseItem[]>([])
  const [loadingItems, setLoadingItems] = useState(true)
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
    is_published: false
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [imageuploading, setImageUploading] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && !loading) {
      loadMerchandise()
    }
  }, [user, loading])

  async function loadMerchandise() {
    if (!user) return
    
    setLoadingItems(true)
    try {
      const response = await fetch('/api/dashboard/merchandise', {
        headers: {
          'x-user-id': user.id
        }
      })

      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (err) {
      console.error('Failed to load merchandise:', err)
    } finally {
      setLoadingItems(false)
    }
  }

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
      is_published: false
    })
    setFormError(null)
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
      is_published: item.is_published
    })
    setFormError(null)
    setShowModal(true)
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setImageUploading(true)
    setFormError(null)

    try {
      const formDataObj = new FormData()
      formDataObj.append('file', file)
      formDataObj.append('folder', 'user-merchandise')

      const response = await fetch('/api/admin/uploads/image', {
        method: 'POST',
        body: formDataObj
      })

      if (!response.ok) {
        setFormError('Failed to upload image')
        return
      }

      const { url, key } = await response.json()
      setFormData(prev => ({
        ...prev,
        image_url: url,
        image_object_key: key
      }))
    } catch (err) {
      console.error('Upload error:', err)
      setFormError('Error uploading image')
    } finally {
      setImageUploading(false)
    }
  }

  async function handleSave() {
    if (!user) return

    setFormError(null)

    if (!formData.name || !formData.category || formData.price < 0) {
      setFormError('Name, category, and price are required')
      return
    }

    try {
      if (editingItem) {
        // Update existing item
        const response = await fetch(`/api/dashboard/merchandise/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id
          },
          body: JSON.stringify(formData)
        })

        if (!response.ok) {
          setFormError('Failed to update product')
          return
        }

        const updated = await response.json()
        setItems(items.map(item => item.id === editingItem.id ? updated : item))
      } else {
        // Create new item
        const response = await fetch('/api/dashboard/merchandise', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id
          },
          body: JSON.stringify(formData)
        })

        if (!response.ok) {
          setFormError('Failed to create product')
          return
        }

        const newItem = await response.json()
        setItems([...items, newItem])
      }
      setShowModal(false)
    } catch (err) {
      console.error('Save error:', err)
      setFormError('Failed to save product')
    }
  }

  async function handleDelete(id: string) {
    if (!user || !confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`/api/dashboard/merchandise/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id
        }
      })

      if (response.ok) {
        setItems(items.filter(item => item.id !== id))
      }
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  function togglePublish(id: string) {
    const item = items.find(i => i.id === id)
    if (!item || !user) return

    const updatedItem = { ...item, is_published: !item.is_published }
    
    fetch(`/api/dashboard/merchandise/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id
      },
      body: JSON.stringify({ is_published: !item.is_published })
    })
      .then(res => res.json())
      .then(updated => {
        setItems(items.map(i => i.id === id ? updated : i))
      })
      .catch(err => console.error('Toggle error:', err))
  }

  if (loading || loadingItems) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-base-100 relative flex flex-col">
      <PageBackground rotate={true} blur={true} opacity={50} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <Container className="py-12 flex-grow">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/dashboard" className="btn btn-ghost btn-sm">
              ← Back to Dashboard
            </Link>
          </div>

          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">My Merchandise</h1>
              <p className="text-lg opacity-70">Manage your store products</p>
            </div>
            <button onClick={openCreateModal} className="btn btn-primary">
              + Add Product
            </button>
          </div>

          <div className="alert alert-success mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>✓ Your merchandise persists in PostgreSQL database with Oracle Object Storage for images</span>
          </div>

          {/* Merchandise Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <div key={item.id} className="card bg-base-200 shadow-xl">
                <figure className="px-4 pt-4">
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="rounded-xl h-48 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/400x300/333/FFF/png?text=No+Image'
                    }}
                  />
                </figure>
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <h2 className="card-title text-lg">{item.name}</h2>
                    <div className="badge badge-sm">
                      {item.is_published ? '✓ Published' : '✗ Draft'}
                    </div>
                  </div>
                  <p className="text-sm opacity-70 line-clamp-2">{item.description}</p>
                  
                  <div className="flex gap-2 mt-2">
                    <div className="badge badge-primary">${item.price}</div>
                    <div className="badge badge-ghost">Stock: {item.stock}</div>
                    <div className="badge badge-ghost capitalize">{item.category}</div>
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

            {items.length === 0 && (
              <div className="col-span-full text-center py-16">
                <p className="text-xl opacity-70 mb-4">No merchandise yet</p>
                <button onClick={openCreateModal} className="btn btn-primary">
                  Create Your First Product
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
              {editingItem ? 'Edit Product' : 'Create New Product'}
            </h3>

            {formError && (
              <div className="alert alert-error mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formError}</span>
              </div>
            )}
            
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Product Image</span>
                </label>
                {formData.image_url && (
                  <div className="mb-3 relative">
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="rounded-lg max-h-40 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/400x300/333/FFF/png?text=No+Image'
                      }}
                    />
                  </div>
                )}
                <div className="join w-full">
                  <input
                    type="file"
                    accept="image/*"
                    className="file-input file-input-bordered join-item flex-1"
                    onChange={handleImageUpload}
                    disabled={imageuploading}
                  />
                  {imageuploading && <span className="join-item flex items-center px-3"><span className="loading loading-spinner loading-sm"></span></span>}
                </div>
              </div>

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
                  placeholder="Describe your product..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                />
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
                  {editingItem ? 'Save Changes' : 'Create Product'}
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
