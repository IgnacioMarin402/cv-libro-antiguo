import { useRef } from 'react'
import { useHingeRotation } from '../hooks/useHingeRotation'
import { BOOK, HINGE_X } from '../domain/binding'
import { COVER_STYLE } from '../domain/flipMotion'

// A cover board (front or back): hinges at (HINGE_X, hingeY), swinging open
// like a real cover. Rendered as a child of the spine's own tilting group
// (see Spine), hinged right at the spine's flat hinge face, so the
// cover's near edge stays pinned to the spine — and tilts rigidly with it —
// instead of hinging from a fixed point the spine has rotated away from. No
// separate rolled-edge cap is needed: rotating one around this pivot would
// sweep its bulge to the wrong side past ~90° (it'd point into the book
// instead of away from it), carving a visible notch into the spine.
export default function Cover({ geometry, material, hingeY, targetAngle, angleRef, parentAngleRef, onClick, onPointerOver, onPointerOut }) {
  const hingeRef = useRef(null)
  useHingeRotation(hingeRef, targetAngle, COVER_STYLE, angleRef, parentAngleRef)

  return (
    <group ref={hingeRef} position={[HINGE_X, hingeY, 0]}>
      <mesh
        geometry={geometry}
        material={material}
        position={[BOOK.coverW / 2, 0, 0]}
        castShadow
        receiveShadow
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      />
    </group>
  )
}
