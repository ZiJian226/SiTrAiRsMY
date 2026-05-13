'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAudio } from '@/contexts/AudioContext'

type ModalMediaItem = {
  media_type: 'photo' | 'video'
  media_url: string
  is_primary?: boolean
}

interface LandscapeModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  imageUrl: string
  imageAlt?: string
  showDetails?: boolean
  mediaItems?: ModalMediaItem[]
}

export default function LandscapeModal({
  isOpen,
  onClose,
  title,
  description,
  imageUrl,
  imageAlt = 'Modal image',
  showDetails = true,
  mediaItems,
}: LandscapeModalProps) {
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const { setVideoPlaying } = useAudio()
  const [isEmbedPlaying, setIsEmbedPlaying] = useState(false)

  const normalizedMedia = useMemo<ModalMediaItem[]>(() => {
    const fromProps = (mediaItems || [])
      .filter((item) => item?.media_url?.trim().length > 0)
      .map((item) => ({ ...item, media_url: item.media_url.trim() }))

    if (fromProps.length > 0) {
      return fromProps
    }

    return [{ media_type: 'photo', media_url: imageUrl, is_primary: true }]
  }, [imageUrl, mediaItems])

  const safeIndex = Math.min(currentIndex, Math.max(0, normalizedMedia.length - 1))
  const currentItem = normalizedMedia[safeIndex]
  const canNavigate = normalizedMedia.length > 1

  const youtubeId = currentItem?.media_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1] || null
  const twitchVideoId = currentItem?.media_url.match(/twitch\.tv\/videos\/(\d+)/)?.[1] || null
  const tiktokVideoId = (currentItem?.media_url && currentItem.media_url.includes('tiktok'))
    ? currentItem.media_url.match(/tiktok\.com\/.*?\/(?:video\/)?(\d+)/)?.[1]
    : null

  const urlLooksLikeVideo = !!(currentItem?.media_url && currentItem.media_url.match(/\.(mp4|webm|ogg|mov|mkv)(?:\?|$)/i))
  const isVideo = currentItem?.media_type === 'video' || urlLooksLikeVideo
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost'

  function goPrev() {
    if (!canNavigate) return
    setCurrentIndex((prev) => (prev === 0 ? normalizedMedia.length - 1 : prev - 1))
  }

  function goNext() {
    if (!canNavigate) return
    setCurrentIndex((prev) => (prev === normalizedMedia.length - 1 ? 0 : prev + 1))
  }

  useEffect(() => {
    if (!isOpen) {
      document.body.classList.remove('landscape-modal-open')
      setVideoPlaying(false)
      return
    }

    document.body.classList.add('landscape-modal-open')
    // Check if current media is a video (infer from URL as fallback)
    const isCurrentVideo = currentItem?.media_type === 'video' || !!(currentItem?.media_url && currentItem.media_url.match(/\.(mp4|webm|ogg|mov|mkv)(?:\?|$)/i))
    setVideoPlaying(isCurrentVideo || isEmbedPlaying)
    
    return () => {
      document.body.classList.remove('landscape-modal-open')
      setVideoPlaying(false)
    }
  }, [isOpen, setVideoPlaying, currentItem?.media_type, isEmbedPlaying])

  useEffect(() => {
    const primaryIndex = normalizedMedia.findIndex((item) => item.is_primary)
    setCurrentIndex(primaryIndex >= 0 ? primaryIndex : 0)
  }, [normalizedMedia])

  useEffect(() => {
    setIsImageLoading(true)
  }, [safeIndex, isOpen])

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/80 z-[90] transition-opacity"
        onClick={onClose}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose()
          if (e.key === 'ArrowLeft') goPrev()
          if (e.key === 'ArrowRight') goNext()
        }}
        aria-label="Close modal"
      />

      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4">
        <div
          className={`relative bg-base-100 rounded-lg shadow-2xl w-full overflow-hidden flex flex-col ${showDetails ? 'max-w-6xl max-h-[92vh]' : 'max-w-[96vw] max-h-[96vh]'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 btn btn-ghost btn-circle z-10"
            aria-label="Close modal"
          >
            ✕
          </button>

          <div className="relative w-full bg-base-300 flex items-center justify-center overflow-hidden flex-1 min-h-0" style={{ aspectRatio: showDetails ? '16 / 9' : 'auto' }}>
            {isImageLoading && !isVideo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            )}

            {!isVideo && (
              <img
                src={currentItem.media_url}
                alt={imageAlt}
                className="w-auto h-auto max-w-full max-h-full object-contain"
                onLoad={() => setIsImageLoading(false)}
                onError={() => setIsImageLoading(false)}
              />
            )}

            {isVideo && youtubeId && (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title={title || 'Video preview'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                onLoad={() => {
                  setIsImageLoading(false)
                  setIsEmbedPlaying(true)
                  setVideoPlaying(true)
                }}
              />
            )}

            {isVideo && !youtubeId && twitchVideoId && (
              <iframe
                src={`https://player.twitch.tv/?video=${twitchVideoId}&parent=${host}`}
                height="100%"
                width="100%"
                title={title || 'Twitch video preview'}
                allowFullScreen
                className="w-full h-full"
                onLoad={() => {
                  setIsImageLoading(false)
                  setIsEmbedPlaying(true)
                  setVideoPlaying(true)
                }}
              />
            )}

            {isVideo && !youtubeId && !twitchVideoId && tiktokVideoId && (
              <iframe
                src={`https://www.tiktok.com/player/v1/${tiktokVideoId}`}
                height="100%"
                width="100%"
                title={title || 'TikTok video preview'}
                allowFullScreen
                className="w-full h-full"
                onLoad={() => {
                  setIsImageLoading(false)
                  setIsEmbedPlaying(true)
                  setVideoPlaying(true)
                }}
              />
            )}

            {isVideo && !youtubeId && !twitchVideoId && !tiktokVideoId && (
              <video
                src={currentItem.media_url}
                controls
                className="w-full h-full object-contain"
                onLoadedData={() => setIsImageLoading(false)}
                onError={() => setIsImageLoading(false)}
                onPlay={() => {
                  setIsEmbedPlaying(true)
                  setVideoPlaying(true)
                }}
                onPause={() => {
                  setIsEmbedPlaying(false)
                  setVideoPlaying(false)
                }}
                onEnded={() => {
                  setIsEmbedPlaying(false)
                  setVideoPlaying(false)
                }}
              />
            )}

            {canNavigate && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 badge badge-neutral">
                {safeIndex + 1} / {normalizedMedia.length}
              </div>
            )}

            {canNavigate && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 btn btn-circle btn-sm"
                  aria-label="Previous media"
                >
                  ❮
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-circle btn-sm"
                  aria-label="Next media"
                >
                  ❯
                </button>
              </>
            )}
          </div>

          {showDetails && (title || description) && (
            <div className="p-6 overflow-y-auto flex-1">
              {title && (
                <h2 className="text-3xl font-bold text-primary mb-3">{title}</h2>
              )}
              {description && (
                <p className="text-lg leading-relaxed whitespace-pre-line text-base-content">
                  {description}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 p-4 border-t border-base-300 bg-base-200">
            <button
              onClick={onClose}
              className="btn btn-primary flex-1"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
