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
  talent_name: string
  is_published: boolean
}

export default function AdminMerchandisePage() {
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
      talent_name: 'Sakura Hoshino',
      is_published: true
    },
    {
      id: '2',
      name: 'T-Shirt - Black',
      description: 'Premium cotton t-shirt with character print',
      price: 29.99,
      category: 'apparel',
      stock: 25,
      image_url: 'https://placehold.co/200x200/7C3AED/FFFFFF/png?text=T-Shirt',
      talent_name: 'Luna Artworks',
      is_published: true
    },
    {
      id: '3',
      name: 'Sticker Pack',
      description: 'Set of 10 waterproof vinyl stickers',
      price: 8.99,
      category: 'stickers',
      stock: 100,
      image_url: 'https://placehold.co/200x200/A78BFA/FFFFFF/png?text=Stickers',
      talent_name: 'Sakura Hoshino',
      is_published: false
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
      talent_name: item.talent_name,
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
      const newItem: MerchandiseItem = {
        id: Date.now().toString(),
        ...formData
      }
      setItems([...items, newItem])
    }
    setShowModal(false)
  }

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
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

          <div className="alert alert-warning mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>⚠️ Mock Mode: Changes won't persist after refresh</span>
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
                              onChange={() => togglePublish(item.id)}
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
