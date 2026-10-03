import { useEffect, useMemo, useState } from 'react'
import { printBook } from './textures/pageTexture'
import { PAGE_COUNT } from './domain/pageCurl'
import './reader.css'

// The magnifier: a button in the corner, first in its row — left of the
// link to the CV, so it comes in without moving the others — while the book
// is open, and what it opens: the two pages the book is showing, laid flat
// over the canvas at a size meant for reading. In the book the body text is
// 8 px from where the camera stands (see domain/typography); here it is the
// page as it was printed, the very same sheets (see printBook).
//
// It wasn't there before the book opened, and up in the corner it went
// unseen; so until the visitor has used it once it glows, gold breathing
// round it, and from then on it's a button like the others. It hung beside
// the book itself for a while, but from low down the camera saw it right
// over the pages.
//
// It turns the book's own page, so the book behind it turns with it and is
// open where the reader left off when it closes. It stays between the two
// boards: from here the book can be read through, not shut.
const FIRST = 1
const LAST = PAGE_COUNT - 1

// At spread s the left page is the back of leaf s-1 and the right one the
// front of leaf s: pages 2s-3 and 2s-2 in reading order, counting from 0.
// The first spread's left is the front board's leather and the last one's
// right the back board's, so there is no page to show there.
const facing = (spread) => [2 * spread - 3, 2 * spread - 2]

export default function BookReader({ pages, page, onPageChange, open }) {
  const [reading, setReading] = useState(false)
  const [used, setUsed] = useState(false)
  const spread = Math.min(Math.max(page, FIRST), LAST)
  // A sheet becomes an image the first time it is shown, and stays one.
  const images = useMemo(() => new Map(), [pages])
  const image = (i) => {
    if (i < 0 || i >= pages.length) return null
    if (!images.has(i)) images.set(i, printBook(pages)[i].canvas.toDataURL('image/jpeg', 0.92))
    return images.get(i)
  }

  useEffect(() => {
    if (!open) setReading(false)
  }, [open])

  const turn = (step) => {
    const next = spread + step
    if (next >= FIRST && next <= LAST) onPageChange(next)
  }

  // While it is up it owns the keyboard: caught on the way down, before the
  // camera's WASD (see features/camera) can slide the view behind it.
  useEffect(() => {
    if (!reading) return
    const onKey = (e) => {
      e.stopPropagation()
      if (e.key === 'Escape') setReading(false)
      if (e.key === 'ArrowLeft') turn(-1)
      if (e.key === 'ArrowRight') turn(1)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  })

  const [left, right] = reading ? facing(spread).map(image) : [null, null]

  return (
    <>
      {open && (
        <button
          type="button"
          className={used ? 'reader-button' : 'reader-button reader-button--new'}
          onClick={() => {
            setUsed(true)
            setReading(true)
          }}
          aria-label="Leer las páginas en grande"
          title="Leer las páginas en grande"
        >
          <svg className="reader-button__icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10" cy="10" r="6" />
            <line x1="14.5" y1="14.5" x2="20.5" y2="20.5" />
          </svg>
        </button>
      )}
      {reading && (
        <div className="reader" role="dialog" aria-modal="true" aria-label="Páginas del libro" onClick={() => setReading(false)}>
          <div className="reader__spread" onClick={(e) => e.stopPropagation()}>
            {left && <img className="reader__page" src={left} alt={`Página ${2 * spread - 2}`} />}
            {right && <img className="reader__page" src={right} alt={`Página ${2 * spread - 1}`} />}
          </div>
          <button
            type="button"
            className="reader__turn reader__turn--prev"
            disabled={spread <= FIRST}
            onClick={(e) => {
              e.stopPropagation()
              turn(-1)
            }}
            aria-label="Página anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className="reader__turn reader__turn--next"
            disabled={spread >= LAST}
            onClick={(e) => {
              e.stopPropagation()
              turn(1)
            }}
            aria-label="Página siguiente"
          >
            ›
          </button>
          <button type="button" className="reader__close" onClick={() => setReading(false)} aria-label="Cerrar">
            ×
          </button>
        </div>
      )}
    </>
  )
}
