'use client'

import { useState } from 'react'
import Image from 'next/image'

interface LandscapeModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  imageUrl: string
  imageAlt?: string
}

export default function LandscapeModal({
  isOpen,
  onClose,
  title,
  description,
  imageUrl,
  imageAlt = 'Modal image'
}: LandscapeModalProps) {
  const [isImageLoading, setIsImageLoading] = useState(true)

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-70 z-40 transition-opacity"
        onClick={onClose}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose()
        }}
        aria-label="Close modal"
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative bg-base-100 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 btn btn-ghost btn-circle z-10"
            aria-label="Close modal"
          >
            ✕
          </button>

          {/* Image Container - Landscape fit */}
          <div className="relative w-full bg-base-300 flex items-center justify-center overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            )}
            <img
              src={imageUrl}
              alt={imageAlt}
              className="w-full h-full object-contain"
              onLoad={() => setIsImageLoading(false)}
              onError={() => setIsImageLoading(false)}
            />
          </div>

          {/* Content Section */}
          {(title || description) && (
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

          {/* Action Bar */}
          <div className="flex gap-3 p-6 border-t border-base-300 bg-base-200">
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
