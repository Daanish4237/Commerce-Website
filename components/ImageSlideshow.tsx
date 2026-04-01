'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'

interface ImageSlideshowProps {
  images: string[]
  alt: string
}

export default function ImageSlideshow({ images, alt }: ImageSlideshowProps) {
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const goTo = useCallback((index: number) => {
    if (isAnimating) return
    setIsAnimating(true)
    setTimeout(() => {
      setCurrent(index)
      setIsAnimating(false)
    }, 200)
  }, [isAnimating])

  const prev = () => goTo((current - 1 + images.length) % images.length)
  const next = useCallback(() => goTo((current + 1) % images.length), [current, images.length, goTo])

  // Auto-advance every 4 seconds
  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(next, 4000)
    return () => clearInterval(timer)
  }, [next, images.length])

  if (!images.length) return null

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-yellow-900/40 group">
        <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'} w-full h-full`}>
          <Image
            src={images[current]}
            alt={`${alt} - image ${current + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 384px"
            priority={current === 0}
          />
        </div>

        {/* Prev/Next arrows */}
        {images.length > 1 && (
          <>
            <button onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'var(--gold)' }}>
              ‹
            </button>
            <button onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'var(--gold)' }}>
              ›
            </button>
          </>
        )}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ backgroundColor: i === current ? 'var(--gold)' : 'rgba(201,168,76,0.3)' }} />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((url, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`relative flex-shrink-0 w-14 h-14 rounded overflow-hidden border transition-all ${i === current ? 'border-yellow-500' : 'border-yellow-900/40 opacity-60 hover:opacity-100'}`}>
              <Image src={url} alt={`${alt} thumbnail ${i + 1}`} fill className="object-cover" sizes="56px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
