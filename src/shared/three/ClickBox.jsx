import { useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { occluded } from './occluded'

// What a click on something heavy lands on: a box round it, never drawn —
// 12 triangles, where a ray through a model from Tripo tests hundreds of
// thousands on every press and, for the hover, on every move.
//
// `onClick` is called when it's clicked, and only while it's `live`; off,
// it's not something to click and doesn't show the pointer. A click checks
// first that nothing drawn stands between it and the lens, which R3F
// doesn't (see occluded): it only tests what answers the pointer, so a
// table in front of the box doesn't stop the click reaching it. The hover,
// on every move, doesn't check.
//
// `center` and `size` in its parent's units.
export default function ClickBox({ center, size, live, onClick }) {
  const scene = useThree((state) => state.scene)
  const material = useMemo(() => new THREE.MeshBasicMaterial({ visible: false }), [])

  const handleClick = (e) => {
    if (!live || occluded(scene, e.ray, e.distance, e.object.parent)) return
    e.stopPropagation()
    document.body.style.cursor = 'auto'
    onClick()
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
      position={center}
      material={material}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <boxGeometry args={size} />
    </mesh>
  )
}
