'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Container from '@/components/Container'
import Footer from '@/components/Footer'
import PageBackground from '@/components/PageBackground'
import Link from 'next/link'

interface Event {
  id: string
  title: string
  description: string
  event_date: string
  location: string
  image_url: string
  image_object_key?: string
  category: string
  is_published: boolean
  featured: boolean
}

function invalidateContentCaches() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem('starmy:content:events:v2')
  window.localStorage.removeItem('starmy:content:events:v3')
}

export default function AdminEventsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  
  const [events, setEvents] = useState<Event[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [imageUploadError, setImageUploadError] = useState<string | null>(null)
  
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    image_url: '',
    image_object_key: '',
    category: 'showcase',
    is_published: false,
    featured: false
  })

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

    void refreshEvents()
  }, [user, profile])

  async function refreshEvents() {
    setDataLoading(true)
    try {
      const response = await fetch('/api/admin/events', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Failed to load events')
      }

      const data = (await response.json()) as Event[]
      setEvents(data)
    } catch (error) {
      console.error(error)
      setEvents([])
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
    setEditingEvent(null)
    setFormData({
      title: '',
      description: '',
      event_date: '',
      location: '',
      image_url: '',
      image_object_key: '',
      category: 'showcase',
      is_published: false,
      featured: false
    })
    setShowModal(true)
  }

  function openEditModal(event: Event) {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description,
      event_date: event.event_date,
      location: event.location,
      image_url: event.image_url,
      image_object_key: event.image_object_key || '',
      category: event.category,
      is_published: event.is_published,
      featured: event.featured
    })
    setShowModal(true)
  }

  async function handleSave() {
    setSaving(true)

    try {
      const response = await fetch(
        editingEvent ? `/api/admin/events/${editingEvent.id}` : '/api/admin/events',
        {
          method: editingEvent ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        },
      )

      if (!response.ok) {
        throw new Error('Failed to save event')
      }

      invalidateContentCaches()
      await refreshEvents()
      setShowModal(false)
    } catch (error) {
      console.error(error)
      alert('Unable to save event. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' })
        if (!response.ok) {
          throw new Error('Failed to delete event')
        }

        await refreshEvents()
      } catch (error) {
        console.error(error)
        alert('Unable to delete event. Please try again.')
      }
    }
  }

  async function togglePublish(event: Event) {
    const nextPublished = !event.is_published
    setEvents(prev => prev.map(item => item.id === event.id ? { ...item, is_published: nextPublished } : item))
    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: nextPublished }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle event publish status')
      }

      const updated = (await response.json()) as Event
      setEvents(prev => prev.map(item => item.id === event.id ? updated : item))
      invalidateContentCaches()
    } catch (error) {
      console.error(error)
      setEvents(prev => prev.map(item => item.id === event.id ? { ...item, is_published: event.is_published } : item))
      alert('Unable to update publish status.')
    }
  }

  async function toggleFeatured(event: Event) {
    const nextFeatured = !event.featured
    setEvents(prev => prev.map(item => item.id === event.id ? { ...item, featured: nextFeatured } : item))
    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: nextFeatured }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle event featured status')
      }

      const updated = (await response.json()) as Event
      setEvents(prev => prev.map(item => item.id === event.id ? updated : item))
      invalidateContentCaches()
    } catch (error) {
      console.error(error)
      await refreshEvents()
      alert('Unable to update featured status. Please try again.')
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  async function handleEventImageFileChange(file: File) {
    setImageUploading(true)
    setImageUploadError(null)

    try {
      const payload = new FormData()
      payload.append('file', file)
      payload.append('folder', 'events')

      const response = await fetch('/api/admin/uploads/image', {
        method: 'POST',
        body: payload,
      })

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(errorData?.error || 'Failed to upload event image')
      }

      const data = (await response.json()) as { url: string; key: string }
      setFormData({ ...formData, image_url: data.url, image_object_key: data.key })
    } catch (error) {
      setImageUploadError(error instanceof Error ? error.message : 'Failed to upload event image')
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
              <h1 className="text-4xl font-bold text-primary mb-2">Events Management</h1>
              <p className="text-lg opacity-70">Create and manage all events</p>
            </div>
            <button onClick={openCreateModal} className="btn btn-primary">
              + Create Event
            </button>
          </div>

          <div className="alert alert-info mb-6">
            <span>Events are loaded from PostgreSQL via admin API.</span>
          </div>

          {/* Events List */}
          <div className="space-y-4">
            {dataLoading && (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            )}
            {events.map(event => (
              <div key={event.id} className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Event Image */}
                    <div className="flex-shrink-0">
                      <img 
                        src={event.image_url} 
                        alt={event.title}
                        className="rounded-lg w-full md:w-64 h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/600x400/333/FFF/png?text=No+Image'
                        }}
                      />
                    </div>

                    {/* Event Details */}
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h2 className="card-title text-2xl">{event.title}</h2>
                          <div className="flex gap-2 mt-2">
                            <div className={`badge ${event.is_published ? 'badge-success' : 'badge-ghost'}`}>
                              {event.is_published ? '✓ Published' : '✗ Draft'}
                            </div>
                            <div className={`badge ${event.featured ? 'badge-secondary' : 'badge-ghost'}`}>
                              {event.featured ? '★ Featured' : '☆ Not Featured'}
                            </div>
                            <div className="badge badge-primary capitalize">{event.category}</div>
                          </div>
                        </div>
                      </div>

                      <p className="opacity-70 mb-4">{event.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatDate(event.event_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{event.location}</span>
                        </div>
                      </div>

                      <div className="card-actions justify-between mt-6">
                        <div className="form-control">
                          <label className="label cursor-pointer gap-2">
                            <span className="label-text">Publish</span>
                            <input 
                              type="checkbox" 
                              className="toggle toggle-primary" 
                              checked={event.is_published}
                                onChange={() => togglePublish(event)}
                            />
                          </label>
                        </div>
                          <div className="form-control">
                            <label className="label cursor-pointer gap-2">
                              <span className="label-text">Featured</span>
                              <input 
                                type="checkbox" 
                                className="toggle toggle-secondary" 
                                checked={event.featured}
                                onChange={() => toggleFeatured(event)}
                              />
                            </label>
                          </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openEditModal(event)}
                            className="btn btn-sm btn-ghost"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(event.id)}
                            className="btn btn-sm btn-error btn-outline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {events.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl opacity-70 mb-4">No events yet</p>
                <button onClick={openCreateModal} className="btn btn-primary">
                  Create Your First Event
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
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </h3>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Event Title</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="Enter event title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  placeholder="Describe the event..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Date & Time</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="input input-bordered"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
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
                    <option value="showcase">Showcase</option>
                    <option value="community">Community</option>
                    <option value="collab">Collaboration</option>
                    <option value="special">Special</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Location</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="e.g., YouTube Live, Discord, etc."
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                  placeholder="https://example.com/event-image.jpg"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value, image_object_key: '' })}
                  disabled={imageUploading}
                />
                <label className="label">
                  <span className="label-text-alt opacity-70">Or upload event image to Oracle Object Storage</span>
                </label>
                <input
                  type="file"
                  className="file-input file-input-bordered"
                  accept="image/*"
                  disabled={imageUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      void handleEventImageFileChange(file)
                    }
                    e.currentTarget.value = ''
                  }}
                />
                {imageUploading && (
                  <label className="label">
                    <span className="label-text-alt text-primary">Uploading event image...</span>
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

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-secondary"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <span className="label-text font-semibold">Pin to Featured News</span>
                </label>
              </div>

              <div className="modal-action">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingEvent ? 'Save Changes' : 'Create Event'}
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
