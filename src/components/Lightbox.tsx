import { useEffect, useState } from 'react'

interface LightboxProps {
  photos: string[]           // URLs
  indexInitial?: number
  onFermer: () => void
}

export default function Lightbox({ photos, indexInitial = 0, onFermer }: LightboxProps) {
  const [index, setIndex] = useState(indexInitial)

  const precedent = () => setIndex((i) => (i - 1 + photos.length) % photos.length)
  const suivant   = () => setIndex((i) => (i + 1) % photos.length)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      onFermer()
      if (e.key === 'ArrowLeft')   precedent()
      if (e.key === 'ArrowRight')  suivant()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [photos.length]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!photos.length) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Barre supérieure */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <span className="text-white/60 text-sm">
          {index + 1} / {photos.length}
        </span>
        <button
          onClick={onFermer}
          className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          aria-label="Fermer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Image principale */}
      <div className="flex-1 flex items-center justify-center relative px-12 min-h-0">
        <img
          key={index}
          src={photos[index]}
          alt={`Photo ${index + 1}`}
          className="max-h-full max-w-full object-contain rounded-xl"
        />

        {/* Flèches (uniquement si > 1 photo) */}
        {photos.length > 1 && (
          <>
            <button
              onClick={precedent}
              className="absolute left-2 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label="Photo précédente"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={suivant}
              className="absolute right-2 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label="Photo suivante"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Miniatures */}
      {photos.length > 1 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto justify-center shrink-0">
          {photos.map((url, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${
                i === index ? 'border-white' : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
