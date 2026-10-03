import { useEffect } from 'react'
import './portrait.css'

// The way back from the portrait: a button with an arrow pointing back, over
// the canvas while the visitor is looking at the portrait. It's there from
// the click but shows only once the camera has come, beside the frame's
// top-left corner — the portrait places and shows it itself, through `ref`
// (see hooks/useWayBack). It — or Escape — hands the camera back to the book.
export default function PortraitBack({ ref, open, onBack }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onBack])

  if (!open) return null
  return (
    <button
      ref={ref}
      type="button"
      className="portrait-back"
      onClick={onBack}
      aria-label="Volver al libro"
      title="Volver al libro"
    >
      <svg className="portrait-back__icon" viewBox="0 0 24 24" aria-hidden="true">
        <line x1="19" y1="12" x2="5.5" y2="12" />
        <polyline points="11.5 6 5.5 12 11.5 18" />
      </svg>
    </button>
  )
}
