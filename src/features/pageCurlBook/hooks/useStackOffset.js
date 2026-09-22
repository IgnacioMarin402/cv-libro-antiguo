import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { smoothDamp } from '@/shared/math/easing'
import { stackOffset, flightArc, STACK_LEAN, STACK_SMOOTH_TIME } from '../domain/pageCurl'

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
//
// On top of the glide, a leaf in the air rides over its own slot and
// settles into it (see flightArc). The arc is added AFTER the damping and
// along the stacking direction rather than fed into it as a target: the
// damping would smear a bump that has to be over in TURN_DURATION, and the
// leaf has to clear along the same axis its pile grows on, not straight up.
export function useStackOffset(groupRef, number, page) {
  const velocities = useRef({ up: { value: 0 }, lateral: { value: 0 } })
  const opened = page > number
  const wasOpened = useRef(opened)
  const turnedAt = useRef(-Infinity)
  // The damped slot, kept apart from what the group ends up at: reading the
  // arc back in as the next frame's starting point would let the damping
  // chase its own bump.
  const settled = useRef({ up: 0, lateral: 0 })

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return
    if (opened !== wasOpened.current) {
      turnedAt.current = performance.now()
      wasOpened.current = opened
    }
    const [up, lateral] = stackOffset(number, page)
    const slot = settled.current
    slot.up = smoothDamp(slot.up, up, velocities.current.up, STACK_SMOOTH_TIME, delta)
    slot.lateral = smoothDamp(slot.lateral, lateral, velocities.current.lateral, STACK_SMOOTH_TIME, delta)
    // The arc rides the stacking direction, so it lifts the leaf off the
    // pile it is leaving and drops it onto the one it is joining instead of
    // cutting across both.
    const arc = flightArc(performance.now() - turnedAt.current)
    group.position.x = slot.up + arc * Math.cos(STACK_LEAN)
    group.position.z = slot.lateral + arc * Math.sin(STACK_LEAN) * (opened ? -1 : 1)
  })
}
