import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// Animates a pivot group's Z rotation toward `targetAngle`, for a panel
// whose hinge height never changes (a cover: front or back, each always
// swinging around its own fixed axis). Captures the live angle whenever
// the target changes, so retargeting mid-swing continues smoothly instead
// of jumping — this is what lets the target drift continuously (as the
// covers trade places over the course of reading, see Book) rather than
// only ever toggling between two fixed endpoints. `sharedAngleRef`, if
// given, is used as the angle store instead of a private one — lets
// another object (the resting pages) read the cover's live *absolute*
// angle each frame without re-deriving it. `parentAngleRef`, if given, is
// subtracted from the angle actually applied to the group's rotation — for
// a cover nested inside the spine's own tilting group (see Cover),
// `targetAngle` is still its absolute open target, but the parent already
// contributes `parentAngleRef.current` of rotation, so only the remainder
// needs to be applied locally. Without this, nesting would add the two,
// over-rotating the cover past its intended angle.
export function useHingeRotation(groupRef, targetAngle, style, sharedAngleRef, parentAngleRef) {
  const ownAngleRef = useRef(0)
  const angleRef = sharedAngleRef || ownAngleRef
  const animRef = useRef(null)
  const prevTargetRef = useRef(targetAngle)

  useEffect(() => {
    if (targetAngle !== prevTargetRef.current) {
      animRef.current = { from: angleRef.current, to: targetAngle, start: performance.now() }
      prevTargetRef.current = targetAngle
    }
  }, [targetAngle])

  useFrame(() => {
    const anim = animRef.current
    if (anim) {
      const elapsed = performance.now() - anim.start
      const p = style.ease(Math.min(1, elapsed / style.duration))
      angleRef.current = anim.from + (anim.to - anim.from) * p
      if (elapsed >= style.duration) animRef.current = null
    }
    if (groupRef.current) {
      groupRef.current.rotation.z = angleRef.current - (parentAngleRef ? parentAngleRef.current : 0)
    }
  })
}
