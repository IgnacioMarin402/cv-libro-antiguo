import { useRef } from 'react'
import { usePageFlip } from '../hooks/usePageFlip'
import { HINGE_X } from '../domain/binding'
import { COVER_MAX_ANGLE } from '../domain/opening'

// A single page leaf. See usePageFlip for why its hinge height animates
// too, not just its rotation — and why the mesh needs its own ref, not
// just the hinge group's: a flipping leaf swaps onto a private bent
// geometry for the duration of its turn.
export default function PageLeaf({
  geometry,
  material,
  flatFarY,
  stackOffset,
  sweepRadius,
  flipped,
  coverAngleRef,
  coverFarYRef,
  backAngleRef,
  restTilt,
  pageGrid,
  pageT,
  restBend,
  curlAmplitude,
  parentAngleRef,
  pivotYOffset,
  onClick,
  onPointerOver,
  onPointerOut,
}) {
  const hingeRef = useRef(null)
  const meshRef = useRef(null)
  usePageFlip(hingeRef, meshRef, flipped, {
    flatFarY,
    stackOffset,
    sweepRadius,
    maxAngle: COVER_MAX_ANGLE,
    coverAngleRef,
    coverFarYRef,
    backAngleRef,
    restTilt,
    baseGeometry: geometry,
    pageGrid,
    pageT,
    restBend,
    curlAmplitude,
    parentAngleRef,
    pivotYOffset,
  })

  // position.x starts at HINGE_X (the same hinge line the covers use) and is
  // then adjusted every frame in usePageFlip's useFrame, so it isn't set
  // here as a static prop.
  return (
    <group ref={hingeRef} position-x={HINGE_X} position-z={0}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        position={[sweepRadius / 2, 0, 0]}
        castShadow
        receiveShadow
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      />
    </group>
  )
}
