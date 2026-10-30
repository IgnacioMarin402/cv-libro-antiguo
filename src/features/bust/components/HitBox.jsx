import { useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { occluded } from '@/shared/three/occluded'
import { HIT_BOX } from '../domain/bust'

// What a click on him lands on: a box round him, never drawn (see HIT_BOX),
// as the portrait's frame has its flat face. Once the visitor is looking at
// him, or at something else (no onFocus), it's not something to click.
//
// Nor where something stands between him and the lens: he's on the floor,
// mostly seen past the table and the thrones, which R3F doesn't test — of
// 1,728 rays to his head and shoulders from 288 places round the table,
// 390 went through the table, a throne or the tankard before reaching the
// box, and a click there flew the camera to him. So a click checks the
// whole scene along its ray first (see shared/three/occluded); the hover,
// on every move of the pointer, doesn't.
export default function HitBox({ focused, onFocus }) {
  const scene = useThree((state) => state.scene)
  const material = useMemo(() => new THREE.MeshBasicMaterial({ visible: false }), [])
  const live = !focused && !!onFocus

  const handleClick = (e) => {
    if (!live || occluded(scene, e.ray, e.distance, e.object.parent)) return
    e.stopPropagation()
    document.body.style.cursor = 'auto'
    onFocus()
  }
  const handlePointerOver = (e) => {
    if (!live) return
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
  }
  const handlePointerOut = () => {
    document.body.style.cursor = 'auto'
  }

  return (
    <mesh
      position={HIT_BOX.center}
      material={material}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <boxGeometry args={HIT_BOX.size} />
    </mesh>
  )
}
