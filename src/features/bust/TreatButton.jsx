import { useEffect, useRef, useState } from 'react'
import TreatIcon from './components/TreatIcon'
import './treat.css'

// How long he's said to be full for, after a click past the day's treats.
const FULL_NOTE_MS = 2600

// The treat to give Shourdo, over the canvas beside him: a button like the
// way back, in the same gold. A click throws one into his mouth
// (`throwRef`, see Bust) and counts it (`treats`, see useTreats) — unless
// he's had today's, when it says so instead. One in the air at a time.
//
// Placed and shown by the bust, through `ref`, as the way back is (see
// hooks/useBustOverlay); `open` while he's being looked at.
export default function TreatButton({ ref, open, treats, throwRef }) {
  const [fullNote, setFullNote] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => {
    if (!open) setFullNote(false)
  }, [open])

  if (!open) return null

  const give = () => {
    if (treats.full()) {
      setFullNote(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setFullNote(false), FULL_NOTE_MS)
      return
    }
    if (throwRef.current?.()) treats.give()
  }

  return (
    <div ref={ref} className="treat-control">
      <button type="button" className="treat-button" onClick={give} aria-label="Dar una galleta" title="Dar una galleta">
        <TreatIcon className="treat-button__icon" />
        <span className="treat-button__label">Dar una galleta</span>
      </button>
      <div className={fullNote ? 'treat-note treat-note--shown' : 'treat-note'} role="status">
        {fullNote ? 'Gordo se siente satisfecho' : ''}
      </div>
    </div>
  )
}
