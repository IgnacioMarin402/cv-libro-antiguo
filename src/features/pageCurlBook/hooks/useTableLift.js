import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { smoothDamp } from '@/shared/math/easing'
import { OPEN_LIFT, LIFT_SMOOTH_TIME, LIFT_FALL_SMOOTH_TIME, levitationRise } from '../domain/pageCurl'

// An open leaf's curl hangs below the hinge line, so the book has to ride
// higher while it's open — and sit back down on the table when it closes,
// where the stack is flat and needs no room underneath (see OPEN_LIFT).
// On top of that ride it levitates: a slow breath that only ever adds
// height, never takes any, so the clearance underneath stays whatever the
// lift measured out. Returns the ref for the group that does both.
export function useTableLift(closedBook) {
  const ref = useRef()
  const velocity = useRef({ value: 0 })
  const lift = useRef(0)
  const openedAt = useRef(0)

  // The breath starts when the book opens, so its first move is upward.
  useEffect(() => {
    if (!closedBook) openedAt.current = performance.now()
  }, [closedBook])

  useFrame((_, delta) => {
    if (!ref.current) return
    lift.current = smoothDamp(
      lift.current,
      closedBook ? 0 : OPEN_LIFT,
      velocity.current,
      closedBook ? LIFT_FALL_SMOOTH_TIME : LIFT_SMOOTH_TIME,
      delta
    )
    // Scaled by how far up the book already is: a book on the table
    // doesn't breathe, and one on its way up doesn't snap into the float.
    const risen = lift.current / OPEN_LIFT
    ref.current.position.y = lift.current + levitationRise((performance.now() - openedAt.current) / 1000) * risen
  })

  return ref
}
