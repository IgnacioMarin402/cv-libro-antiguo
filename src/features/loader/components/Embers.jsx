import { useMemo } from 'react'
import { rand } from '@/shared/math/random'

// The motes drifting up through the candlelight, like the scene's own dust
// (features/dust), on the screen that stands in for it. Each is a CSS
// animation of transform and opacity only, which the browser runs off the
// main thread: they keep drifting while the GPU warm-up blocks it.
const EMBER_COUNT = 22

export default function Embers() {
  const embers = useMemo(
    () =>
      Array.from({ length: EMBER_COUNT }, () => {
        const duration = rand(7, 14)
        return {
          '--x': `${rand(-42, 42).toFixed(1)}vw`,
          '--drift': `${rand(-6, 6).toFixed(1)}vw`,
          '--rise': `${rand(45, 85).toFixed(0)}vh`,
          '--size': `${rand(1, 3).toFixed(1)}px`,
          '--peak': rand(0.35, 0.8).toFixed(2),
          // Negative, so the screen opens mid-drift instead of empty.
          animationDelay: `${(-rand(0, duration)).toFixed(2)}s`,
          animationDuration: `${duration.toFixed(2)}s`,
        }
      }),
    [],
  )
  return (
    <div className="loader__embers" aria-hidden="true">
      {embers.map((style, i) => (
        <span key={i} style={style} />
      ))}
    </div>
  )
}
