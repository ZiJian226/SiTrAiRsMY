'use client'

import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'

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

function extractYouTubeVideoId(url: string): string | null {
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/)
  if (watchMatch?.[1]) return watchMatch[1]

  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/)
  if (shortMatch?.[1]) return shortMatch[1]

  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/)
  if (embedMatch?.[1]) return embedMatch[1]

  return null
}

function extractTwitchVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (!/twitch\.tv$/i.test(parsed.hostname)) return null
    const match = parsed.pathname.match(/\/videos\/(\d+)/)
    if (match) return match[1]
    return null
  } catch {
    const match = url.match(/twitch\.tv\/videos\/(\d+)/i)
    return match?.[1] || null
  }
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

function getTwitchParents(): string[] {
  const parents = new Set<string>(['localhost'])

  if (typeof window !== 'undefined' && window.location.hostname) {
    parents.add(window.location.hostname)
  }

  return Array.from(parents)
}

export default function ContentHighlightsSection() {
  const [highlights, setHighlights] = useState<ContentHighlight[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedVideo, setSelectedVideo] = useState<ContentHighlight | null>(null)
  const [videoMetadata, setVideoMetadata] = useState<Record<string, { source: VideoSource; youtubeId?: string; twitchVideoId?: string; tiktokId?: string }>>({})

  useEffect(() => {
    async function fetchHighlights() {
      try {
        const res = await fetch('/api/content/homepage-content-highlights', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          const highlightsData = data.data || []
          setHighlights(highlightsData)

          // Resolve video metadata for each highlight
          const metadata: Record<string, { source: VideoSource; youtubeId?: string; twitchVideoId?: string; tiktokId?: string }> = {}
          for (const highlight of highlightsData) {
            const source = detectVideoSource(highlight.video_url)
            metadata[highlight.id] = { source }

            if (source === 'youtube') {
              metadata[highlight.id].youtubeId = extractYouTubeVideoId(highlight.video_url) || undefined
            } else if (source === 'twitch') {
              metadata[highlight.id].twitchVideoId = extractTwitchVideoId(highlight.video_url) || undefined
            } else if (source === 'tiktok') {
              const tiktokId = await resolveTikTokVideoId(highlight.video_url)
              if (tiktokId) {
                metadata[highlight.id].tiktokId = tiktokId
              }
            }
          }
          setVideoMetadata(metadata)
        }
      } catch (error) {
        console.error('Failed to fetch content highlights:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHighlights()
  }, [])


  if (loading || highlights.length === 0) {
    return null
  }

  // Get current pair of videos
  const videoPair = highlights.slice(currentIndex, currentIndex + 2)
  const canGoNext = currentIndex + 2 < highlights.length
  const canGoPrev = currentIndex > 0

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (canGoNext) {
      setCurrentIndex(currentIndex + 2)
    }
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (canGoPrev) {
      setCurrentIndex(Math.max(0, currentIndex - 2))
    }
  }

  const renderMedia = (
    video: ContentHighlight,
    meta?: { source: VideoSource; youtubeId?: string; twitchVideoId?: string; tiktokId?: string }
  ) => {
    if (!meta) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-base-300">
          <span className="loading loading-spinner loading-sm"></span>
        </div>
      )
    }

    if (meta.source === 'youtube' && meta.youtubeId) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${meta.youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${meta.youtubeId}&playsinline=1`}
          className="absolute inset-0 h-full w-full pointer-events-none"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          title={video.title}
          style={{ border: 'none' }}
        />
      )
    }

    if (meta.source === 'twitch' && meta.twitchVideoId) {
      const twitchParentQuery = getTwitchParents().map(p => `parent=${encodeURIComponent(p)}`).join('&')
      return (
        <iframe
          src={`https://player.twitch.tv/?video=${meta.twitchVideoId}&${twitchParentQuery}&autoplay=true&loop=true&muted=true&controls=false`}
          className="absolute inset-0 h-full w-full pointer-events-none"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          title={video.title}
          style={{ border: 'none' }}
        />
      )
    }

    if (meta.source === 'tiktok' && meta.tiktokId) {
      return (
        <iframe
          src={`https://www.tiktok.com/player/v1/${meta.tiktokId}?autoplay=1&mute=1&loop=1`}
          className="absolute inset-0 h-full w-full pointer-events-none"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          title={video.title}
          style={{ border: 'none' }}
        />
      )
    }

    return (
      <video
        src={video.video_url}
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />
    )
  }

  return (
    <section className="bg-base-100 relative overflow-visible">
      <div
        className="relative min-h-[520px] md:min-h-[720px] overflow-hidden"
        style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)' }}
      >
        <div className="absolute inset-0">
          {videoPair.map((video, idx) => {
            const meta = videoMetadata[video.id]
            const clipPath = idx === 0
              ? 'polygon(0 0, 100% 0, 0 100%)'
              : 'polygon(100% 0, 100% 100%, 0 100%)'
            const clickPosition = idx === 0
              ? 'top-1/3 left-1/4'
              : 'bottom-1/3 right-1/4'

            return (
              <div
                key={video.id}
                role="button"
                tabIndex={0}
                className="absolute inset-0 block bg-black group cursor-pointer outline-none"
                style={{ clipPath }}
                onClick={() => setSelectedVideo(video)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setSelectedVideo(video)
                  }
                }}
                aria-label={`Open ${video.title}`}
              >
                <div className="absolute inset-0 overflow-hidden">
                  {renderMedia(video, meta)}
                </div>

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 pointer-events-none">
                  <div className={`absolute ${clickPosition} opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-3 pointer-events-none`}>
                    <svg className="w-20 h-20 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <p className="text-white font-bold text-xl drop-shadow-lg">Click to View</p>
                  </div>
                </div>
              </div>
            )
          })}

          <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30">
            <button
              type="button"
              onClick={handlePrev}
              onMouseDown={handlePrev}
              disabled={!canGoPrev}
              className={`btn btn-circle btn-lg shadow-lg transition-all ${canGoPrev ? 'btn-primary hover:scale-110' : 'btn-disabled opacity-50'}`}
              aria-label="Previous videos"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30">
            <button
              type="button"
              onClick={handleNext}
              onMouseDown={handleNext}
              disabled={!canGoNext}
              className={`btn btn-circle btn-lg shadow-lg transition-all ${canGoNext ? 'btn-primary hover:scale-110' : 'btn-disabled opacity-50'}`}
              aria-label="Next videos"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="absolute bottom-6 left-0 right-0 flex justify-center z-30 pointer-events-none">
            <div className="flex gap-2 pointer-events-auto">
              {Array.from({ length: Math.ceil(highlights.length / 2) }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentIndex(i * 2)}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={`h-2 rounded-full transition-all ${i * 2 === currentIndex ? 'bg-primary w-8' : 'bg-white/50 hover:bg-white/70 w-2'}`}
                  aria-label={`Go to video group ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Popout Modal for Full Video */}
      <Modal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        title=""
        size="2xl"
      >
        <div className="space-y-4">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {(() => {
              if (!selectedVideo) return null
              const meta = videoMetadata[selectedVideo.id]
              if (!meta) {
                return (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="loading loading-spinner loading-sm"></span>
                  </div>
                )
              }

              if (meta.source === 'youtube' && meta.youtubeId) {
                return (
                  <iframe
                    src={`https://www.youtube.com/embed/${meta.youtubeId}?autoplay=1&loop=1&controls=1&playsinline=1`}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    title={selectedVideo.title}
                  />
                )
              }

              if (meta.source === 'twitch' && meta.twitchVideoId) {
                const twitchParentQuery = getTwitchParents().map(p => `parent=${encodeURIComponent(p)}`).join('&')
                return (
                  <iframe
                    src={`https://player.twitch.tv/?video=${meta.twitchVideoId}&${twitchParentQuery}&autoplay=true&loop=true&muted=false&controls=true`}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                    allowFullScreen
                    title={selectedVideo.title}
                    style={{ border: 'none' }}
                  />
                )
              }

              if (meta.source === 'tiktok' && meta.tiktokId) {
                return (
                  <iframe
                    src={`https://www.tiktok.com/player/v1/${meta.tiktokId}?autoplay=1&loop=1&mute=0`}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    title={selectedVideo.title}
                  />
                )
              }

              // Direct video
              return (
                <video
                  src={selectedVideo.video_url}
                  className="w-full h-full object-contain bg-black"
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                />
              )
            })()}
          </div>
          {selectedVideo?.description && <p className="text-base-content">{selectedVideo.description}</p>}
        </div>
      </Modal>
    </section>
  )
}
