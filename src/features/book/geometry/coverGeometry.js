import { wornRect } from '@/shared/three/wornRect'
import { extrudeFlat } from '@/shared/three/extrudeFlat'
import { BOOK } from '../domain/binding'

// A cover board: a hand-cut rectangle — jittered on the three exposed
// edges, near-straight along the spine edge where it's bound — extruded to
// the board's thickness.
//
// splitCaps gives it three material groups (inside / side / outside)
// instead of one, so the doublure can use a different material from the
// gilt-tooled outer face. Called once per board rather than shared: each
// gets its own jitter, so the two don't read as the same cut twice.
export function createCoverGeometry() {
  const { coverW, coverH, coverT } = BOOK
  return extrudeFlat(wornRect(coverW, coverH, { jitter: 0.0018, spineJitter: 0.0004, segs: 8 }), coverT, {
    uv: { width: coverW, height: coverH },
    splitCaps: true,
  })
}
