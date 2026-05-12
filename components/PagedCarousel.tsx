'use client'

import { Children, useMemo, useState } from 'react'

interface PagedCarouselProps {
  title?: string
  children: React.ReactNode
  pageSize?: number
}

export default function PagedCarousel({ title, children, pageSize = 5 }: PagedCarouselProps) {
  const items = useMemo(() => Children.toArray(children), [children])
  const [pageIndex, setPageIndex] = useState(0)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const canGoPrev = pageIndex > 0
  const canGoNext = pageIndex < totalPages - 1
  const visibleItems = items.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize)

  const goPrev = () => setPageIndex((current) => Math.max(0, current - 1))
  const goNext = () => setPageIndex((current) => Math.min(totalPages - 1, current + 1))

  return (
    <div className="w-full">
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}

      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          className="btn btn-circle btn-sm btn-outline"
          onClick={goPrev}
          disabled={!canGoPrev}
          aria-label="Previous items"
        >
          ❮
        </button>
        <div className="text-sm opacity-70">
          {pageIndex + 1} / {totalPages}
        </div>
        <button
          type="button"
          className="btn btn-circle btn-sm btn-outline"
          onClick={goNext}
          disabled={!canGoNext}
          aria-label="Next items"
        >
          ❯
        </button>
      </div>

      <div className="overflow-hidden">
        <div
          key={pageIndex}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 animate-carousel-in"
        >
          {visibleItems}
        </div>
      </div>

      <style>{`
        @keyframes carouselIn {
          from {
            opacity: 0;
            transform: translateX(32px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-carousel-in {
          animation: carouselIn 280ms ease-out;
        }
      `}</style>
    </div>
  )
}