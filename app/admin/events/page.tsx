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
  category: string
  is_published: boolean
}

export default function AdminEventsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Winter Showcase 2025',
      description: 'Join us for an amazing winter showcase featuring all our talents!',
      event_date: '2025-12-25T18:00:00',
      location: 'Virtual Event - Discord',
      image_url: 'https://placehold.co/600x400/5B21B6/FFFFFF/png?text=Winter+Showcase',
      category: 'showcase',
      is_published: true
    },
    {
      id: '2',
      title: 'Karaoke Night',
      description: 'Sing along with your favorite talents in this special karaoke event!',
      event_date: '2025-12-15T20:00:00',
      location: 'YouTube Live',
      image_url: 'https://placehold.co/600x400/7C3AED/FFFFFF/png?text=Karaoke+Night',
      category: 'community',
      is_published: true
    }
  ])
  
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    image_url: '',
    category: 'showcase',
    is_published: false
  })

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

  function openCreateModal() {
    setEditingEvent(null)
    setFormData({
      title: '',
      description: '',
      event_date: '',
      location: '',
      image_url: '',
      category: 'showcase',
      is_published: false
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
      category: event.category,
      is_published: event.is_published
    })
    setShowModal(true)
  }

  function handleSave() {
    if (editingEvent) {
      setEvents(events.map(e => 
        e.id === editingEvent.id 
          ? { ...e, ...formData }
          : e
      ))
    } else {
      const newEvent: Event = {
        id: Date.now().toString(),
        ...formData
      }
      setEvents([...events, newEvent])
    }
    setShowModal(false)
  }

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(e => e.id !== id))
    }
  }

  function togglePublish(id: string) {
    setEvents(events.map(e =>
      e.id === id
        ? { ...e, is_published: !e.is_published }
        : e
    ))
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

          <div className="alert alert-warning mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>⚠️ Mock Mode: Changes won't persist after refresh</span>
          </div>

          {/* Events List */}
          <div className="space-y-4">
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
                              onChange={() => togglePublish(event.id)}
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
                  {editingEvent ? 'Save Changes' : 'Create Event'}
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
