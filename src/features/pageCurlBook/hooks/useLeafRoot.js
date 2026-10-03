import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { smoothDamp } from '@/shared/math/easing'
import { PAGE_COUNT } from '../domain/pageCurl'
import { spineRoot, spineTurnTime, ROOT_SMOOTH_TIME } from '../domain/pile'

// Keeps a leaf bound to the spine. Where its root goes is a straight
// function of the reading state (see leafPose); what this adds is the
// motion, twice over:
//
//   · along the open spine, the glide of the one leaf that turns, about
//     3 mm from beside one pile to beside the other;
//   · and the spine itself turning over as the book opens or closes, from
//     the closed block's column of roots to the open book's row
//     (see spineRoot), which is what `openness` tracks.
//
// It moves the hinge group, whose frame is the book's own tilt: x is the
// table's up and z runs across the spine (see PageCurlBook). The leaf's
// bones curl inside that group; nothing here bends it.
export function useLeafRoot(groupRef, pose, page) {
  const closedBook = page === 0 || page === PAGE_COUNT
  const velocities = useRef({ up: { value: 0 }, lateral: { value: 0 }, openness: { value: 0 } })
  // The damped root on the open spine and how far open the spine is, kept
  // apart from what the group ends up at: the spine's turn is laid over the
  // root's glide, not fed back into it.
  const state = useRef({ up: 0, lateral: 0, openness: 0 })

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return
    const s = state.current
    const v = velocities.current
    s.up = smoothDamp(s.up, pose.openRoot[0], v.up, ROOT_SMOOTH_TIME, delta)
    s.lateral = smoothDamp(s.lateral, pose.openRoot[1], v.lateral, ROOT_SMOOTH_TIME, delta)
    s.openness = smoothDamp(s.openness, closedBook ? 0 : 1, v.openness, spineTurnTime(page), delta)
    const [up, lateral] = spineRoot(pose, [s.up, s.lateral], s.openness)
    group.position.x = up
    group.position.z = lateral
  })
}
