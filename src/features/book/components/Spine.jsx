import { useRef } from 'react'
import { useHingeRotation } from '../hooks/useHingeRotation'
import { useSpineBridge } from '../hooks/useSpineBridge'
import { SPINE_ORIGIN } from '../domain/binding'
import { spineTiltAngle } from '../domain/opening'
import { COVER_STYLE } from '../domain/flipMotion'

// The spine: its flexible bridge strip, plus the tilting group that is the
// shared parent for the covers *and* the pages. All three hinge right at
// its flat face, so they're carried along rigidly as it leans, instead of
// hinging from a point it has rotated away from (see Cover and
// usePageFlip's parentAngleRef compensation) — without this, pages would
// stay anchored to a fixed point while the spine rocked away from them,
// opening a visible gap at the gutter. The bridge itself re-shapes every
// frame to stay flush with both covers regardless of how far apart their
// own angles have drifted (see useSpineBridge).
export default function Spine({ geometry, material, open, angleRef, frontAngleRef, backAngleRef, children }) {
  const hingeRef = useRef(null)
  useHingeRotation(hingeRef, spineTiltAngle(open), COVER_STYLE, angleRef)
  useSpineBridge(geometry, frontAngleRef, backAngleRef, angleRef)

  return (
    <group ref={hingeRef} position={SPINE_ORIGIN}>
      <mesh geometry={geometry} material={material} castShadow />
      {children}
    </group>
  )
}
