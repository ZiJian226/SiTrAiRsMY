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
  is_published: boolean
}

export default function MerchandiseManagerPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  
  const [items, setItems] = useState<MerchandiseItem[]>([
    {
      id: '1',
      name: 'Acrylic Stand',
      description: 'Cute acrylic standee featuring character artwork',
      price: 15.99,
      category: 'collectibles',
      stock: 50,
      image_url: 'https://placehold.co/200x200/5B21B6/FFFFFF/png?text=Acrylic',
      is_published: true
    },
    {
      id: '2',
      name: 'Sticker Pack',
      description: 'Set of 10 waterproof vinyl stickers',
      price: 8.99,
      category: 'stickers',
      stock: 100,
      image_url: 'https://placehold.co/200x200/7C3AED/FFFFFF/png?text=Stickers',
      is_published: true
    }
  ])
  
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<MerchandiseItem | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'collectibles',
    stock: 0,
    image_url: '',
    is_published: false
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  if (!user || !profile) {
    return null
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
      is_published: item.is_published
    })
    setShowModal(true)
  }

  function handleSave() {
    if (editingItem) {
      // Update existing item
      setItems(items.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...formData }
          : item
      ))
    } else {
      // Create new item
      const newItem: MerchandiseItem = {
        id: Date.now().toString(),
        ...formData
      }
      setItems([...items, newItem])
    }
    setShowModal(false)
  }

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this item?')) {
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

          <div className="alert alert-warning mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>⚠️ Mock Mode: Changes won't persist after refresh</span>
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
