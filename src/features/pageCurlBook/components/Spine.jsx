import { useMemo, useRef } from 'react'
import { createSpineGeometry } from '../geometry/spineGeometry'
import { useSpineSkin } from '../hooks/useSpineSkin'

// The leather over the fold. It is mounted as a sibling of the leaves,
// inside the same tilted group, and finds the two boards through the refs
// the book hands it — it owns no pose of its own, it only follows theirs
// (see useSpineSkin).
export default function Spine({ material, frontRef, backRef }) {
  const geometry = useMemo(() => createSpineGeometry(), [])
  const mesh = useRef()
  useSpineSkin(geometry, mesh, frontRef, backRef)

  return <mesh ref={mesh} geometry={geometry} material={material} castShadow receiveShadow visible={false} />
}
