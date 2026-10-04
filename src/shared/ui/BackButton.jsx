import { useEffect, useState } from 'react'
import './backButton.css'

// A way back out of a view the camera holds — the portrait's today — as a
// round button with an arrow pointing back, over the canvas. It knows
// nothing of what it leaves: where it hangs and when it shows are the
// business of what took the visitor there, which writes its transform and
// data-shown through `ref` every frame (see features/portrait/hooks/
// useWayBack). Until then it's in the page but unseen and out of reach.
//
// `open` while the view lasts; `onBack` leaves it, and so does Escape;
// `label` says where back to. Like the magnifier and the CV link, it wasn't
// there before, so it glows until the visitor has clicked it once — one
// button for every such view, so once is enough for all of them.
export default function BackButton({ ref, open, onBack, label }) {
  const [used, setUsed] = useState(false)

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
      className={used ? 'back-button' : 'back-button back-button--new'}
      onClick={() => {
        setUsed(true)
        onBack()
      }}
      aria-label={label}
      title={label}
    >
      <svg className="back-button__icon" viewBox="0 0 24 24" aria-hidden="true">
        <line x1="19" y1="12" x2="5.5" y2="12" />
        <polyline points="11.5 6 5.5 12 11.5 18" />
      </svg>
    </button>
  )
}
