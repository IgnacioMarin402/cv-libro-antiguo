import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { smoothDamp } from '@/shared/math/easing'
import { rand } from '@/shared/math/random'
import { NAME_Z, FADE_OUT_TIME, SPARKS_WRITING, SPARKS_RESTING, writtenTo } from '../domain/names'

// Plays the names (see domain/names): once the visitor has come to look and
// the lens stands square (`squareSince`, see useLensSquare), they write
// themselves one after another, throwing sparks; while the visitor stays
// they glint and breathe and shed a spark now and then; when the visitor
// leaves they go out together. A new visit writes them afresh.
//
// `group` holds them all; it's hidden whenever they aren't written, so the
// names cost nothing the rest of the time.
export function useNameReveal({ focused, squareSince, group, names, sparks }) {
  const writingSince = useRef(null)
  const wasFocused = useRef(false)
  const presence = useRef(0)
  const fade = useRef({ value: 0 })
  // Sparks owed and not yet thrown, one count per name and one for all of
  // them at rest: each frame adds its share of the rate.
  const owed = useRef(new Float32Array(names.length + 1))

  useFrame((state, delta) => {
    const root = group.current
    if (!root) return
    const t = state.clock.elapsedTime

    if (focused && !wasFocused.current) {
      writingSince.current = null
      fade.current.value = 0
      owed.current.fill(0)
      sparks.clear()
    }
    wasFocused.current = focused
    // Kept past the visit's end, while they fade.
    if (focused && writingSince.current === null && squareSince.current !== null) {
      writingSince.current = squareSince.current
    }

    presence.current = focused ? 1 : smoothDamp(presence.current, 0, fade.current, FADE_OUT_TIME, delta)
    if (!focused && presence.current === 0) writingSince.current = null
    root.visible = writingSince.current !== null
    if (!root.visible) return

    const since = t - writingSince.current
    let resting = true
    names.forEach((name, i) => {
      const front = name.start - name.lead + writtenTo(since, i)
      const { uniforms } = name.material
      uniforms.uFront.value = front / name.width
      uniforms.uPresence.value = presence.current
      uniforms.uTime.value = t
      if (front < name.end) resting = false
      // Off the front, while it's crossing the letters.
      if (focused && front > name.start && front < name.end) {
        owed.current[i] += SPARKS_WRITING * delta
        for (; owed.current[i] >= 1; owed.current[i]--) {
          sparks.emit(name.left + front, rand(name.foot, name.head), NAME_Z)
        }
      }
    })
    // And off any of them, anywhere along it, once they're all written.
    const atRest = names.length
    if (focused && resting) {
      owed.current[atRest] += SPARKS_RESTING * delta
      for (; owed.current[atRest] >= 1; owed.current[atRest]--) {
        const name = names[Math.floor(Math.random() * names.length)]
        sparks.emit(name.left + rand(name.start, name.end), rand(name.foot, name.head), NAME_Z)
      }
    }
    sparks.advance(delta, presence.current)
  })
}
