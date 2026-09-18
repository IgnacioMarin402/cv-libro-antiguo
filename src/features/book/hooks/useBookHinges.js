import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { coverShelfY } from '../domain/opening'

// The live angles the book's hinged parts are actually at this frame — as
// opposed to the targets they're heading for (domain/opening). Shared by
// reference because the parts read each other every frame: resting leaves
// follow the back cover, the read pile rides the front cover's surface, and
// all of them hang off the spine's own lean.
export function useBookHinges() {
  const frontAngleRef = useRef(0)
  const backAngleRef = useRef(0)
  const spineAngleRef = useRef(0)
  // The front cover's live far-edge height — the shelf the read pile stacks
  // up from. Recomputed every frame from that cover's own angle rather than
  // once from a fixed one, since it keeps lowering as more pages are turned
  // (see backCoverAngle).
  const shelfYRef = useRef(coverShelfY(0))

  useFrame(() => {
    shelfYRef.current = coverShelfY(frontAngleRef.current)
  })

  return { frontAngleRef, backAngleRef, spineAngleRef, shelfYRef }
}
