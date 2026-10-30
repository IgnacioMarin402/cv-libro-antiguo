import { useEffect, useRef, useState } from 'react'
import CookieIcon from './components/CookieIcon'
import './cookie.css'

// How long he's said to be full for, after a click past the day's cookies.
const FULL_NOTE_MS = 2600

// The cookie to give Shourdo, over the canvas beside him: a button like the
// way back, in the same gold. A click throws one into his mouth
// (`throwRef`, see Bust) and counts it (`cookies`, see useCookies) — unless
// he's had today's, when it says so instead. One in the air at a time.
//
// Placed and shown by the bust, through `ref`, as the way back is (see
// hooks/useBustOverlay); `open` while he's being looked at.
export default function CookieButton({ ref, open, cookies, throwRef }) {
  const [fullNote, setFullNote] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => {
    if (!open) setFullNote(false)
  }, [open])

  if (!open) return null

  const give = () => {
    if (cookies.full()) {
      setFullNote(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setFullNote(false), FULL_NOTE_MS)
      return
    }
    if (throwRef.current?.()) cookies.give()
  }

  return (
    <div ref={ref} className="cookie-control">
      <button type="button" className="cookie-button" onClick={give} aria-label="Dar una galleta" title="Dar una galleta">
        <CookieIcon className="cookie-button__icon" />
        <span className="cookie-button__label">Dar una galleta</span>
      </button>
      <div className={fullNote ? 'cookie-note cookie-note--shown' : 'cookie-note'} role="status">
        {fullNote ? 'Gordo se siente satisfecho' : ''}
      </div>
    </div>
  )
}
