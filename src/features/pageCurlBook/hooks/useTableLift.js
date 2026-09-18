import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { smoothDamp } from '@/shared/math/easing'
import { OPEN_LIFT, LIFT_SMOOTH_TIME, LIFT_FALL_SMOOTH_TIME } from '../domain/pageCurl'

// An open leaf's curl hangs below the hinge line, so the book has to ride
// higher while it's open — and sit back down on the table when it closes,
// where the stack is flat and needs no room underneath (see OPEN_LIFT).
// Returns the ref for the group that does the riding.
export function useTableLift(closedBook) {
  const ref = useRef()
  const velocity = useRef({ value: 0 })

  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.position.y = smoothDamp(
      ref.current.position.y,
      closedBook ? 0 : OPEN_LIFT,
      velocity.current,
      closedBook ? LIFT_FALL_SMOOTH_TIME : LIFT_SMOOTH_TIME,
      delta
    )
  })

  return ref
}
