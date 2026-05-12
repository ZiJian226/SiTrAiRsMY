'use client'

import { useState, useMemo } from 'react'

interface ArtistCardShowcaseProps {
  artUrls: string[]
  artistName: string
}

export default function ArtistCardShowcase({ artUrls, artistName }: ArtistCardShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showControls, setShowControls] = useState(false)

  const validArtUrls = useMemo(() => {
    return artUrls.filter(url => url && url.length > 0)
  }, [artUrls])

  const canNavigate = validArtUrls.length > 1
  const currentArt = validArtUrls[currentIndex] || '/api/placeholder'

  const goToPrev = () => {
    if (canNavigate) {
      setCurrentIndex((prev) => (prev === 0 ? validArtUrls.length - 1 : prev - 1))
    }
  }

  const goToNext = () => {
    if (canNavigate) {
      setCurrentIndex((prev) => (prev === validArtUrls.length - 1 ? 0 : prev + 1))
    }
  }

  return (
    <div
      className="relative w-full h-48 rounded-lg overflow-hidden bg-base-100 group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Main Image */}
      <img
        src={currentArt}
        alt={`${artistName} art ${currentIndex + 1}`}
        className="w-auto h-auto max-w-full max-h-full object-cover transition-opacity"
        loading="lazy"
      />

      {/* Image Counter */}
      {canNavigate && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-base-100 bg-opacity-80 px-2 py-1 rounded text-xs font-semibold">
          {currentIndex + 1} / {validArtUrls.length}
        </div>
      )}

      {/* Navigation Controls */}
      {canNavigate && showControls && (
        <>
          {/* Previous Button */}
          <button
            onClick={goToPrev}
            className="absolute left-1 top-1/2 -translate-y-1/2 btn btn-circle btn-sm btn-outline opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-base-100"
            aria-label="Previous art"
          >
            ❮
          </button>

          {/* Next Button */}
          <button
            onClick={goToNext}
            className="absolute right-1 top-1/2 -translate-y-1/2 btn btn-circle btn-sm btn-outline opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-base-100"
            aria-label="Next art"
          >
            ❯
          </button>
        </>
      )}
    </div>
  )
}
