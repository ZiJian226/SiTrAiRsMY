'use client'

import { Children, useMemo, useState, useEffect } from 'react'

interface PagedCarouselProps {
  title?: string
  children: React.ReactNode
  /** legacy single value */
  pageSize?: number
  /** page size to use for desktop (>=1280px) */
  pageSizeDesktop?: number
  /** page size to use for mobile (<1280px) */
  pageSizeMobile?: number
}

export default function PagedCarousel({ title, children, pageSize, pageSizeDesktop, pageSizeMobile }: PagedCarouselProps) {
  const items = useMemo(() => Children.toArray(children), [children])
  const [pageIndex, setPageIndex] = useState(0)

  const [isDesktop, setIsDesktop] = useState<boolean>(false)

  // detect desktop breakpoint (match Tailwind's xl = 1280px)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(min-width: 1280px)')
    const handler = (ev: MediaQueryListEvent | MediaQueryList) => setIsDesktop(Boolean((ev as any).matches))
    // initialize
    setIsDesktop(mq.matches)
    if (mq.addEventListener) mq.addEventListener('change', handler)
    else mq.addListener(handler)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler)
      else mq.removeListener(handler)
    }
  }, [])

  // determine effective page size (priority: pageSize -> responsive props)
  const effectivePageSize: number | undefined = (() => {
    if (typeof pageSize === 'number') return pageSize
    if (isDesktop && typeof pageSizeDesktop === 'number') return pageSizeDesktop
    if (!isDesktop && typeof pageSizeMobile === 'number') return pageSizeMobile
    // fallback to any provided desktop/mobile
    if (isDesktop && typeof pageSizeMobile === 'number') return pageSizeMobile
    if (!isDesktop && typeof pageSizeDesktop === 'number') return pageSizeDesktop
    return undefined
  })()

  const unlimited = typeof effectivePageSize !== 'number' || effectivePageSize <= 0
  const totalPages = unlimited ? 1 : Math.max(1, Math.ceil(items.length / effectivePageSize))
  const canGoPrev = !unlimited && pageIndex > 0
  const canGoNext = !unlimited && pageIndex < totalPages - 1
  const visibleItems = unlimited ? items : items.slice(pageIndex * (effectivePageSize as number), pageIndex * (effectivePageSize as number) + (effectivePageSize as number))

  // ensure pageIndex is valid when breakpoint or items change
  if (!unlimited && pageIndex > totalPages - 1) {
    setPageIndex(Math.max(0, totalPages - 1))
  }

  const goPrev = () => setPageIndex((current) => Math.max(0, current - 1))
  const goNext = () => setPageIndex((current) => Math.min(totalPages - 1, current + 1))

  return (
    <div className="w-full">
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}

      {!unlimited && (
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
      )}

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