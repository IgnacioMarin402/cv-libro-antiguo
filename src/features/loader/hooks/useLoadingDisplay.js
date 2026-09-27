import { useEffect, useRef, useState } from 'react'
import { loadState } from '@/shared/three/loadTracker'
import { loadingProgress, loadingStage } from '../domain/loading'
import { RING_RADIUS, ringPoint } from '../geometry/seal'

// How quickly the ring catches up with the real progress, per second. The
// loaders' count moves in jumps (an item only counts once it ends); this
// turns each jump into a sweep of about half a second.
const CATCH_UP = 6

// Runs the loading screen frame by frame, writing straight into its DOM
// rather than through React state: the ring moves every frame, and a
// re-render per frame is what the rest of the scene avoids too. Only the
// stage — which line of text shows — is state, since it changes three
// times in all.
//
// The ring only ever moves forward. The items' total grows as models
// unpack their textures, so the raw fraction can step back; shown, that
// reads as a fault.
export function useLoadingDisplay(warmupRef, ready) {
  const rootRef = useRef(null)
  const meterRef = useRef(null)
  const arcRef = useRef(null)
  const beadRef = useRef(null)
  const percentRef = useRef(null)
  const shown = useRef(0)
  const [stage, setStage] = useState('fetch')

  useEffect(() => {
    let frame
    let last = performance.now()
    const tick = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      const state = loadState()
      const target = ready ? 1 : loadingProgress(state, warmupRef.current)
      const step = (target - shown.current) * (1 - Math.exp(-CATCH_UP * dt))
      shown.current = Math.min(1, shown.current + Math.max(0, step))
      // The last sliver of an exponential never arrives on its own.
      if (ready && 1 - shown.current < 0.002) shown.current = 1

      const p = shown.current
      const percent = Math.round(p * 100)
      rootRef.current?.style.setProperty('--p', p.toFixed(4))
      arcRef.current?.setAttribute('stroke-dashoffset', (1 - p).toFixed(4))
      if (beadRef.current) {
        const [x, y] = ringPoint(p, RING_RADIUS)
        beadRef.current.setAttribute('cx', x.toFixed(2))
        beadRef.current.setAttribute('cy', y.toFixed(2))
      }
      if (percentRef.current && percentRef.current.textContent !== String(percent)) {
        percentRef.current.textContent = percent
        meterRef.current?.setAttribute('aria-valuenow', percent)
      }
      setStage(loadingStage(state, warmupRef.current, ready))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [ready, warmupRef])

  return { stage, rootRef, meterRef, arcRef, beadRef, percentRef }
}
