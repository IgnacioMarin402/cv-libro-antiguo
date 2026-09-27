import { useEffect, useRef, useState } from 'react'
import { READY_HOLD_MS, REVEAL_MS } from '../domain/loading'

// The loading screen's last two beats, once the room is ready: hold the
// finished screen for a moment, then lift it — telling the scene the visit
// can start as it begins to — and unmount once it's gone.
//
// phase: 'loading' -> 'ready' (held) -> 'revealing' -> 'gone'
export function useRevealTimeline(ready, onReveal) {
  const [phase, setPhase] = useState('loading')
  const revealRef = useRef(onReveal)
  revealRef.current = onReveal

  useEffect(() => {
    if (!ready) return
    setPhase('ready')
    const lift = setTimeout(() => {
      setPhase('revealing')
      revealRef.current()
    }, READY_HOLD_MS)
    const gone = setTimeout(() => setPhase('gone'), READY_HOLD_MS + REVEAL_MS)
    return () => {
      clearTimeout(lift)
      clearTimeout(gone)
    }
  }, [ready])

  return phase
}
