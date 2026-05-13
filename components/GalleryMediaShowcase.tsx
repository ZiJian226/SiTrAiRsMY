'use client'

import { useState, useMemo } from 'react'

export interface GalleryMediaItem {
  id: string;
  media_type: 'photo' | 'video';
  media_url: string;
  is_primary: boolean;
}

interface GalleryMediaShowcaseProps {
  media: GalleryMediaItem[]
  title: string
  height?: string
  isPreview?: boolean
  previewImage?: string | null
}

export default function GalleryMediaShowcase({
  media,
  title,
  height = 'h-64',
  isPreview = false,
  previewImage = null,
}: GalleryMediaShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showControls, setShowControls] = useState(false)

  const validMedia = useMemo(() => {
    return media.filter(m => m && m.media_url && m.media_url.length > 0)
  }, [media])

  const canNavigate = validMedia.length > 1
  const currentItem = validMedia[currentIndex]

  if (!currentItem) {
    return (
      <div className={`relative w-full ${height} rounded-lg overflow-hidden bg-base-300 flex items-center justify-center`}>
        <p className="text-sm opacity-70">No media available</p>
      </div>
    )
  }

  const isVideo = currentItem.media_type === 'video'
  const mediaUrl = currentItem.media_url
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost'

  const goToPrev = () => {
    if (canNavigate) {
      setCurrentIndex((prev) => (prev === 0 ? validMedia.length - 1 : prev - 1))
    }
  }

  const goToNext = () => {
    if (canNavigate) {
      setCurrentIndex((prev) => (prev === validMedia.length - 1 ? 0 : prev + 1))
    }
  }

  const renderMedia = () => {
    // If collapsed preview requested, prefer the current media item (so navigating shows correct preview).
    if (isPreview) {
      // If current item exists, show it (video first-frame or image)
      if (currentItem && currentItem.media_url) {
        const currentUrlIsVideo = currentItem.media_type === 'video' || !!currentItem.media_url.match(/\.(mp4|webm|ogg|mov|mkv)(?:\?|$)/i)
        if (currentUrlIsVideo) {
          return (
            <video
              src={currentItem.media_url}
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
              onLoadedData={(e) => {
                try {
                  const v = e.currentTarget as HTMLVideoElement
                  v.currentTime = 0
                  v.pause()
                } catch (err) {
                  // ignore
                }
              }}
            />
          )
        }

        return (
          <img
            src={currentItem.media_url}
            alt={`${title} - Preview ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-opacity"
            loading="lazy"
          />
        )
      }

      // Fallback to provided previewImage or YouTube thumbnail
      if (previewImage) {
        return (
          <img
            src={previewImage}
            alt={`${title} - Preview ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-opacity"
            loading="lazy"
          />
        )
      }

      const youtubeThumbMatch = mediaUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
      const youtubeThumbId = youtubeThumbMatch ? youtubeThumbMatch[1] : null
      if (youtubeThumbId) {
        return (
          <img
            src={`https://img.youtube.com/vi/${youtubeThumbId}/hqdefault.jpg`}
            alt={`${title} - Preview ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-opacity"
            loading="lazy"
          />
        )
      }

      return (
        <div className="w-full h-full flex items-center justify-center bg-base-200">
          <img
            src={'https://placehold.co/800x450/111/FFF/png?text=Preview'}
            alt={`${title} - Preview ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )
    }

    if (isVideo) {
      // Check if it's a YouTube URL
      const youtubeMatch = mediaUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
      const youtubeId = youtubeMatch ? youtubeMatch[1] : null

      if (youtubeId) {
        return (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={`${title} - Video ${currentIndex + 1}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        )
      }

      // Check if it's a Twitch URL
      const twitchMatch = mediaUrl.match(/twitch\.tv\/videos\/(\d+)/)
      const twitchId = twitchMatch ? twitchMatch[1] : null

      if (twitchId) {
        return (
          <iframe
            src={`https://player.twitch.tv/?video=${twitchId}&parent=${host}`}
            height="100%"
            width="100%"
            title={`${title} - Video ${currentIndex + 1}`}
            allowFullScreen
            className="w-full h-full"
          />
        )
      }

      // Check if it's a TikTok URL
      const tiktokMatch = mediaUrl.match(/(?:tiktok\.com\/.*?\/)?(?:video\/)?(\d+)/)
      const tiktokId = tiktokMatch ? tiktokMatch[1] : null

      if (tiktokId && mediaUrl.includes('tiktok')) {
        return (
          <iframe
            src={`https://www.tiktok.com/player/v1/${tiktokId}`}
            height="100%"
            width="100%"
            title={`${title} - Video ${currentIndex + 1}`}
            allowFullScreen
            className="w-full h-full"
          />
        )
      }

      // Fallback to HTML5 video
      return (
        <video
          src={mediaUrl}
          controls
          className="w-full h-full object-cover"
          title={`${title} - Video ${currentIndex + 1}`}
        />
      )
    }

    // Photo/Image
    return (
      <img
        src={mediaUrl}
        alt={`${title} - Photo ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-opacity"
        loading="lazy"
      />
    )
  }

  return (
    <div
      className={`relative w-full ${height} rounded-lg overflow-hidden bg-base-100 group`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Media Display */}
      <div className="w-full h-full flex items-center justify-center bg-base-200">
        {renderMedia()}
      </div>

      {/* Media Type Badge */}
      <div className="absolute top-2 left-2 badge badge-sm bg-base-100 text-base-content">
        {isVideo ? '🎥 Video' : '📷 Photo'}
      </div>

      {/* Media Counter */}
      {canNavigate && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-base-100 bg-opacity-80 px-2 py-1 rounded text-xs font-semibold">
          {currentIndex + 1} / {validMedia.length}
        </div>
      )}

      {/* Navigation Controls */}
      {canNavigate && showControls && (
        <>
          {/* Previous Button */}
          <button
            onClick={goToPrev}
            className="absolute left-1 top-1/2 -translate-y-1/2 btn btn-circle btn-sm btn-outline opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-base-100"
            aria-label="Previous media"
          >
            ❮
          </button>

          {/* Next Button */}
          <button
            onClick={goToNext}
            className="absolute right-1 top-1/2 -translate-y-1/2 btn btn-circle btn-sm btn-outline opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-base-100"
            aria-label="Next media"
          >
            ❯
          </button>
        </>
      )}
    </div>
  )
}
