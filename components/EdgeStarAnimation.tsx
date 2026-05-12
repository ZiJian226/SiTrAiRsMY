'use client'

import React, { useEffect, useState } from 'react'

interface EdgeStarAnimationProps {
  count?: number
  cycleMs?: number
}

type EdgeStar = {
  id: number
  x: string
  y: string
  duration: number
  size: number
  delay: number
  hueShift: number
}

export default function EdgeStarAnimation({ count = 14, cycleMs = 4200 }: EdgeStarAnimationProps) {
  const [stars, setStars] = useState<EdgeStar[]>([])

  useEffect(() => {
    const generateStars = () => {
      const newStars = Array.from({ length: count }, (_, i) => {
        const isVertical = Math.random() > 0.5
        const isLeadingEdge = Math.random() > 0.5
        const offset = 1 + Math.random() * 7

        let x: string, y: string
        if (isVertical) {
          x = isLeadingEdge ? `${offset}%` : `${100 - offset}%`
          y = `${Math.random() * 100}%`
        } else {
          y = isLeadingEdge ? `${offset}%` : `${100 - offset}%`
          x = `${Math.random() * 100}%`
        }

        return {
          id: i,
          x,
          y,
          duration: 3.2 + Math.random() * 1.8,
          size: 10 + Math.random() * 14,
          delay: Math.random() * 2,
          hueShift: -12 + Math.random() * 24,
        }
      })

      setStars(newStars)
    }

    generateStars()

    const timer = window.setInterval(generateStars, cycleMs)
    return () => window.clearInterval(timer)
  }, [count, cycleMs])

  return (
    <>
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute pointer-events-none"
          style={{
            left: star.x,
            top: star.y,
            width: `${star.size}px`,
            height: `${star.size}px`,
            transform: 'translate(-50%, -50%)',
            animation: `edgeStarGlow ${star.duration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
            filter: `drop-shadow(0 0 8px hsl(${48 + star.hueShift} 92% 68% / 0.85))`,
          }}
        >
          <svg viewBox="0 0 24 24" className="w-full h-full" aria-hidden="true">
            <path
              d="M12 1.8 14.85 9.15 22.2 12 14.85 14.85 12 22.2 9.15 14.85 1.8 12 9.15 9.15Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-yellow-300"
            />
            <path
              d="M12 5.6 13.7 10.3 18.4 12 13.7 13.7 12 18.4 10.3 13.7 5.6 12 10.3 10.3Z"
              fill="currentColor"
              className="text-yellow-200/50"
            />
          </svg>
        </div>
      ))}

      <style>{`
        @keyframes edgeStarGlow {
          0%, 100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.72) rotate(0deg);
          }
          50%, 60% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.06) rotate(8deg);
          }
          85% {
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(0.9) rotate(-4deg);
          }
        }
      `}</style>
    </>
  )
}
