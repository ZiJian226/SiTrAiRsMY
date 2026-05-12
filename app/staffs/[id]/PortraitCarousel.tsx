'use client'

import { useState } from 'react'
import type { PortraitPicture } from '@/lib/types'

interface PortraitCarouselProps {
  name: string
  portraitPictures: PortraitPicture[]
  tags: string[]
}

export default function PortraitCarousel({ name, portraitPictures, tags }: PortraitCarouselProps) {
  const [pageIndex, setPageIndex] = useState(0)

  const totalPages = Math.max(1, portraitPictures.length)
  const canGoPrev = pageIndex > 0
  const canGoNext = pageIndex < totalPages - 1
  const currentImage = portraitPictures[pageIndex]

  const goPrev = () => setPageIndex((current) => Math.max(0, current - 1))
  const goNext = () => setPageIndex((current) => Math.min(totalPages - 1, current + 1))

  return (
    <div className="card bg-base-200 shadow-xl lg:sticky lg:top-24 h-full">
      <div className="card-body p-4 h-full flex flex-col">
        <div className="rounded-xl overflow-hidden bg-base-300 border border-base-300 min-h-[520px] flex-1 flex items-center justify-center relative">
          {currentImage && (
            <img
              src={currentImage.url}
              alt={`${name} portrait picture ${pageIndex + 1}`}
              className="w-full h-full object-contain"
            />
          )}

          {totalPages > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                disabled={!canGoPrev}
                className="btn btn-circle btn-sm btn-primary absolute left-3 top-1/2 -translate-y-1/2"
                aria-label="Previous portrait"
              >
                {'<'}
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={!canGoNext}
                className="btn btn-circle btn-sm btn-primary absolute right-3 top-1/2 -translate-y-1/2"
                aria-label="Next portrait"
              >
                {'>'}
              </button>
            </>
          )}
        </div>

        {totalPages > 1 && (
          <div className="text-sm opacity-70 text-center mt-3">
            {pageIndex + 1} / {totalPages}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <span key={tag} className="badge badge-secondary">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
