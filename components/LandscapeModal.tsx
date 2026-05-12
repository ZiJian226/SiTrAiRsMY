'use client'

import { useEffect, useState } from 'react'

interface LandscapeModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  imageUrl: string
  imageAlt?: string
  showDetails?: boolean
}

export default function LandscapeModal({
  isOpen,
  onClose,
  title,
  description,
  imageUrl,
  imageAlt = 'Modal image',
  showDetails = true,
}: LandscapeModalProps) {
  const [isImageLoading, setIsImageLoading] = useState(true)

  useEffect(() => {
    if (!isOpen) {
      document.body.classList.remove('landscape-modal-open')
      return
    }

    document.body.classList.add('landscape-modal-open')
    return () => {
      document.body.classList.remove('landscape-modal-open')
    }
  }, [isOpen])

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
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            )}
            <img
              src={imageUrl}
              alt={imageAlt}
              className="w-auto h-auto max-w-full max-h-full object-contain"
              onLoad={() => setIsImageLoading(false)}
              onError={() => setIsImageLoading(false)}
            />
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
