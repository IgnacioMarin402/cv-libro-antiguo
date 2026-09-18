import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { smoothDamp } from '@/shared/math/easing'
import { stackOffset, STACK_SMOOTH_TIME } from '../domain/pageCurl'

// Rides a leaf to its place in its pile. Where that is, is a straight
// function of the reading state (see stackOffset); what this adds is the
// glide, because a leaf that turns moves from one pile to the other — the
// front cover falls the whole height of the block — and that has to happen
// over the turn, not between two frames.
//
// It moves the hinge group, whose frame is the book's own tilt: x is the
// table's up and z runs from the spine outward (see PageCurlBook). So the
// leaves stack against the table and the leaning is measured from it, not
// from whatever plane a leaf happens to be lying in.
export function useStackOffset(groupRef, number, page) {
  const velocities = useRef({ up: { value: 0 }, lateral: { value: 0 } })

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return
    const [up, lateral] = stackOffset(number, page)
    group.position.x = smoothDamp(group.position.x, up, velocities.current.up, STACK_SMOOTH_TIME, delta)
    group.position.z = smoothDamp(group.position.z, lateral, velocities.current.lateral, STACK_SMOOTH_TIME, delta)
  })
}
