'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'

interface ImageSlideshowProps {
  images: string[]
  alt: string
  videoUrl?: string
}

export default function ImageSlideshow({ images, alt, videoUrl }: ImageSlideshowProps) {
  // Build media items: video first (if any), then images
  const mediaItems: { type: 'image' | 'video'; url: string }[] = [
    ...(videoUrl ? [{ type: 'video' as const, url: videoUrl }] : []),
    ...images.map(url => ({ type: 'image' as const, url })),
  ]
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const goTo = useCallback((index: number) => {
    if (isAnimating) return
    setIsAnimating(true)
    setTimeout(() => {
      setCurrent(index)
      setIsAnimating(false)
    }, 200)
  }, [isAnimating])

  const prev = useCallback(() => goTo((current - 1 + mediaItems.length) % mediaItems.length), [current, mediaItems.length, goTo])
  const next = useCallback(() => goTo((current + 1) % mediaItems.length), [current, mediaItems.length, goTo])

  // Auto-advance every 4 seconds (pause when lightbox open or on video)
  useEffect(() => {
    if (mediaItems.length <= 1 || lightboxOpen || mediaItems[current]?.type === 'video') return
    const timer = setInterval(next, 4000)
    return () => clearInterval(timer)
  }, [next, mediaItems, current, lightboxOpen])

  // Close lightbox on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next])

  if (!mediaItems.length) return null

  const currentItem = mediaItems[current]

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Main image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-yellow-900/40 group cursor-zoom-in"
          onClick={() => currentItem.type === 'image' && setLightboxOpen(true)}>
          <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'} w-full h-full`}>
            {currentItem.type === 'video' ? (
              <video
                src={currentItem.url}
                controls
                className="w-full h-full object-cover"
                style={{ cursor: 'default' }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <Image
                src={currentItem.url}
                alt={`${alt} - image ${current + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 384px"
                priority={current === 0}
              />
            )}
          </div>

          {/* Expand hint — images only */}
          {currentItem.type === 'image' && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded px-2 py-1 text-xs"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'var(--gold)' }}>
              ⤢ Click to expand
            </div>
          )}

          {/* Prev/Next arrows */}
          {mediaItems.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prev() }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'var(--gold)' }}>
                ‹
              </button>
              <button onClick={e => { e.stopPropagation(); next() }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'var(--gold)' }}>
                ›
              </button>
            </>
          )}

          {/* Dot indicators */}
          {mediaItems.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {mediaItems.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); goTo(i) }}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{ backgroundColor: i === current ? 'var(--gold)' : 'rgba(201,168,76,0.3)' }} />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {mediaItems.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {mediaItems.map((item, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={`relative flex-shrink-0 w-14 h-14 rounded overflow-hidden border transition-all ${i === current ? 'border-yellow-500' : 'border-yellow-900/40 opacity-60 hover:opacity-100'}`}>
                {item.type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center text-xl" style={{ backgroundColor: '#1a1a1a', color: 'var(--gold)' }}>▶</div>
                ) : (
                  <Image src={item.url} alt={`${alt} thumbnail ${i + 1}`} fill className="object-cover" sizes="56px" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && currentItem.type === 'image' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative w-full max-w-3xl max-h-screen p-4" onClick={e => e.stopPropagation()}>
            {/* Close button */}
            <button onClick={() => setLightboxOpen(false)}
              className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-lg"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'var(--gold)' }}>
              ✕
            </button>

            {/* Main lightbox image */}
            <div className="relative w-full" style={{ aspectRatio: '1' }}>
              <Image
                src={images[current]}
                alt={`${alt} - image ${current + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>

            {/* Lightbox nav */}
            {mediaItems.length > 1 && (
              <div className="flex items-center justify-between mt-4">
                <button onClick={prev}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                  style={{ backgroundColor: 'rgba(201,168,76,0.15)', color: 'var(--gold)' }}>
                  ‹
                </button>
                <span className="text-xs text-gray-400">{current + 1} / {mediaItems.length}</span>
                <button onClick={next}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                  style={{ backgroundColor: 'rgba(201,168,76,0.15)', color: 'var(--gold)' }}>
                  ›
                </button>
              </div>
            )}

            {/* Lightbox thumbnails */}
            {mediaItems.length > 1 && (
              <div className="flex gap-2 justify-center mt-3 overflow-x-auto">
                {mediaItems.map((item, i) => (
                  item.type === 'image' && (
                    <button key={i} onClick={() => goTo(i)}
                      className={`relative flex-shrink-0 w-12 h-12 rounded overflow-hidden border transition-all ${i === current ? 'border-yellow-500' : 'border-yellow-900/40 opacity-50 hover:opacity-100'}`}>
                      <Image src={item.url} alt="" fill className="object-cover" sizes="48px" />
                    </button>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
