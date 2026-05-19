'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import PageLayout from '@/components/PageLayout'
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

type VideoSource = 'youtube' | 'twitch' | 'tiktok' | 'direct'

function detectVideoSource(url: string): VideoSource {
  if (!url) return 'direct'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('twitch.tv')) return 'twitch'
  if (url.includes('tiktok.com') || url.includes('vm.tiktok.com')) return 'tiktok'
  return 'direct'
}

function extractTikTokVideoId(url: string): string | null {
  const match = url.match(/\/video\/(\d+)/)
  return match?.[1] || null
}

function extractTikTokVideoIdFromHtml(html: string): string | null {
  const match = html.match(/data-video-id="(\d+)"/)
  return match?.[1] || null
}

async function resolveTikTokVideoId(url: string): Promise<string | null> {
  const direct = extractTikTokVideoId(url)
  if (direct) {
    return direct
  }

  try {
    const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as { html?: string }
    if (!data.html) {
      return null
    }

    return extractTikTokVideoIdFromHtml(data.html)
  } catch {
    return null
  }
}

function extractEmbedUrl(url: string, source: VideoSource, tiktokVideoId?: string | null): string {
  if (!url) return url

  switch (source) {
    case 'youtube': {
      const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
      const videoId = videoIdMatch?.[1]
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url
    }
    case 'twitch': {
      const videoIdMatch = url.match(/twitch\.tv\/videos\/(\d+)/)
      const videoId = videoIdMatch?.[1]
      if (videoId) return `https://player.twitch.tv/?video=${videoId}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}`
      
      const clipMatch = url.match(/twitch\.tv\/\w+\/clip\/([^?&\n]+)/)
      const clipId = clipMatch?.[1]
      if (clipId) return `https://clips.twitch.tv/embed?clip=${clipId}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}`
      return url
    }
    case 'tiktok': {
      return tiktokVideoId ? `https://www.tiktok.com/player/v1/${tiktokVideoId}` : url
    }
    default:
      return url
  }
}

export default function DashboardContentHighlightsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  const [highlights, setHighlights] = useState<ContentHighlight[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [videoUploading, setVideoUploading] = useState(false)
  const [tiktokVideoId, setTiktokVideoId] = useState<string | null>(null)
  const [resolvingTiktok, setResolvingTiktok] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    video_url: '',
    video_object_key: '',
    sort_order: 0,
    is_active: true,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (!loading && profile && profile.role !== 'admin' && profile.role !== 'staff') {
      router.push('/dashboard')
    }
  }, [user, profile, loading, router])

  useEffect(() => {
    if (user && profile && (profile.role === 'admin' || profile.role === 'staff')) {
      void loadHighlights()
    }
  }, [user, profile])

  useEffect(() => {
    const videoSource = detectVideoSource(formData.video_url)
    if (videoSource === 'tiktok' && formData.video_url) {
      setResolvingTiktok(true)
      resolveTikTokVideoId(formData.video_url).then((id) => {
        setTiktokVideoId(id)
        setResolvingTiktok(false)
      }).catch(() => {
        setTiktokVideoId(null)
        setResolvingTiktok(false)
      })
    } else {
      setTiktokVideoId(null)
    }
  }, [formData.video_url])

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
      setFormError('Failed to load content highlights')
    } finally {
      setDataLoading(false)
    }
  }

  async function handleVideoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setVideoUploading(true)
    setFormError(null)

    try {
      const formDataObj = new FormData()
      formDataObj.append('file', file)
      formDataObj.append('folder', 'homepage-content-highlights')

      const response = await fetch('/api/admin/uploads/media', {
        method: 'POST',
        body: formDataObj
      })

      if (!response.ok) {
        setFormError('Failed to upload video')
        return
      }

      const { url, key } = await response.json()
      setFormData(prev => ({
        ...prev,
        video_url: url,
        video_object_key: key
      }))
    } catch (err) {
      console.error('Upload error:', err)
      setFormError('Error uploading video')
    } finally {
      setVideoUploading(false)
    }
  }

  async function handleThumbnailUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setVideoUploading(true)
    setFormError(null)

    try {
      const formDataObj = new FormData()
      formDataObj.append('file', file)
      formDataObj.append('folder', 'homepage-content-highlights')

      const response = await fetch('/api/admin/uploads/media', {
        method: 'POST',
        body: formDataObj
      })

      if (!response.ok) {
        setFormError('Failed to upload video')
        return
      }

      const { url, key } = await response.json()
      setFormData(prev => ({
        ...prev,
        video_url: url,
        video_object_key: key
      }))
    } catch (err) {
      console.error('Upload error:', err)
      setFormError('Error uploading video')
    } finally {
      setVideoUploading(false)
    }
  }

  async function handleSave() {
    if (!formData.title || !formData.video_url) {
      setFormError('Title and video URL are required')
      return
    }

    try {
      const method = editingId ? 'PUT' : 'POST'
      const payload = editingId ? { ...formData, id: editingId, description: null, thumbnail_url: null, thumbnail_object_key: null } : { ...formData, description: null, thumbnail_url: null, thumbnail_object_key: null }

      const response = await fetch('/api/admin/homepage-content-highlights', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to save')
      }

      await loadHighlights()
      resetForm()
      setFormError(null)
      alert('Content highlight saved successfully')
    } catch (error) {
      console.error(error)
      setFormError('Failed to save content highlight')
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

      await loadHighlights()
      setFormError(null)
      alert('Content highlight deleted successfully')
    } catch (error) {
      console.error(error)
      setFormError('Failed to delete content highlight')
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      video_url: '',
      video_object_key: '',
      sort_order: 0,
      is_active: true,
    })
    setEditingId(null)
  }

  function handleEdit(highlight: ContentHighlight) {
    setFormData({
      title: highlight.title,
      video_url: highlight.video_url,
      video_object_key: highlight.video_object_key || '',
      sort_order: highlight.sort_order,
      is_active: highlight.is_active,
    })
    setEditingId(highlight.id)
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-base-100 flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </PageLayout>
    )
  }

  if (!user || !profile || (profile.role !== 'admin' && profile.role !== 'staff')) {
    return null
  }

  const videoSource = detectVideoSource(formData.video_url)

  return (
    <PageLayout>
      <Container className="py-12 flex-grow">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="btn btn-ghost btn-sm">
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-2">Homepage Content Highlights</h1>
        <p className="text-lg opacity-70 mb-8">Add highlight videos from YouTube, Twitch, TikTok, or direct uploads. Only needs video URL and sort order.</p>

        <div className="card bg-base-200 shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">{editingId ? 'Edit' : 'Add'} Highlight</h2>

          {formError && (
            <div className="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m8-8l-2 2m0 0l-2-2m2 2l2-2m-2 2l-2 2M9 7h6m0 0v6m0-6l-6 6" />
              </svg>
              <span>{formError}</span>
            </div>
          )}

        <div className="space-y-4">
          {/* Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Title *</span>
              <span className="label-text-alt opacity-60">Identify this highlight in the list</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Concert Teaser, Live Stream Highlight"
            />
          </div>

          {/* Video Source Selector */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Video Source</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {(['youtube', 'twitch', 'tiktok', 'direct'] as const).map((source) => (
                <label key={source} className="label cursor-pointer flex items-center gap-2">
                  <input
                    type="radio"
                    name="video-source"
                    className="radio radio-sm"
                    checked={videoSource === source}
                    readOnly
                  />
                  <span className="label-text capitalize">{source}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Video URL or Upload */}
          <div className="space-y-3">
            <div className="divider my-2">OR</div>

            {/* Direct Upload */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Upload Video File</span>
                <span className="label-text-alt opacity-60">MP4, WebM, MOV (max 250MB)</span>
              </label>
              <div className="join">
                <input
                  type="file"
                  accept="video/*"
                  className="input input-bordered join-item flex-1 file-input file-input-bordered"
                  onChange={handleVideoUpload}
                  disabled={videoUploading}
                />
                {videoUploading && <span className="join-item flex items-center px-3"><span className="loading loading-spinner loading-sm"></span></span>}
              </div>
              {formData.video_object_key && (
                <div className="mt-2 text-sm text-success">✓ Video uploaded successfully</div>
              )}
            </div>

            <div className="divider my-2">OR</div>

            {/* Platform URLs */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Video URL from Platform</span>
                <span className="label-text-alt opacity-60">YouTube, Twitch, TikTok links</span>
              </label>
              <input
                type="url"
                className="input input-bordered"
                value={formData.video_url}
                onChange={(e) => {
                  setFormData({ ...formData, video_url: e.target.value })
                  setFormError(null)
                }}
                placeholder={
                  videoSource === 'youtube' ? 'https://www.youtube.com/watch?v=...' :
                  videoSource === 'twitch' ? 'https://twitch.tv/videos/...' :
                  videoSource === 'tiktok' ? 'https://www.tiktok.com/@.../video/...' :
                  'https://...'
                }
              />
              <label className="label">
                <span className="label-text-alt opacity-60">
                  {videoSource === 'youtube' && 'Paste YouTube video URL (watch or short link)'}
                  {videoSource === 'twitch' && 'Paste Twitch video or clip URL'}
                  {videoSource === 'tiktok' && 'Paste TikTok video link'}
                  {videoSource === 'direct' && 'Paste direct video URL or upload above'}
                </span>
              </label>
            </div>
          </div>

          {/* Sort Order & Active */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Sort Order</span>
                <span className="label-text-alt opacity-60">0 = first</span>
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

          {/* Preview */}
          {formData.video_url && (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Preview</span>
              </label>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {videoSource === 'youtube' && (
                  <iframe
                    src={extractEmbedUrl(formData.video_url, 'youtube')}
                    className="w-full h-full"
                    allowFullScreen
                    title="YouTube preview"
                  />
                )}
                {videoSource === 'tiktok' && (
                  <>
                    {resolvingTiktok ? (
                      <div className="flex items-center justify-center h-full">
                        <span className="loading loading-spinner loading-sm"></span>
                      </div>
                    ) : tiktokVideoId ? (
                      <iframe
                        src={`https://www.tiktok.com/player/v1/${tiktokVideoId}`}
                        className="w-full h-full"
                        allowFullScreen
                        title="TikTok preview"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-center opacity-60">
                        <div>
                          <p className="font-semibold">Unable to load TikTok video</p>
                          <p className="text-sm">Check the video URL and try again</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
                {videoSource === 'twitch' && (
                  <iframe
                    src={extractEmbedUrl(formData.video_url, 'twitch')}
                    className="w-full h-full"
                    allowFullScreen
                    title="Twitch preview"
                  />
                )}
                {videoSource === 'direct' && (
                  <video
                    src={formData.video_url}
                    controls
                    className="w-full h-full"
                  />
                )}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex gap-3 pt-4">
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
                    <th>Source</th>
                    <th>Sort</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {highlights.map((highlight) => (
                    <tr key={highlight.id}>
                      <td className="font-semibold">{highlight.title}</td>
                      <td>
                        <span className="badge badge-sm">
                          {detectVideoSource(highlight.video_url).toUpperCase()}
                        </span>
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
    </PageLayout>
  )
}
