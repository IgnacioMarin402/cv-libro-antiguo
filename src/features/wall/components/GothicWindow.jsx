import { useLayoutEffect } from 'react'
import * as THREE from 'three'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { wallShade } from '../domain/wall'
import { WINDOW_SCALE } from '../domain/window'

// Loaded from a file, like the table.
const MODEL_URL = '/models/gothic-window.glb'

// Darkened toward the top on the same curve as the panelling around it, in
// vertex colours from each vertex's height: the flat ambient would
// otherwise keep its arch lit where the wall beside it has gone black.
// Single-sided, so it receives the candle's shadow without striping; it
// casts none, there's nothing behind it to fall on.
export default function GothicWindow({ position, rotationY }) {
  const { scene } = useLoader(GLTFLoader, MODEL_URL)

  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return
      const pos = object.geometry.attributes.position
      const colors = new Float32Array(pos.count * 3)
      for (let i = 0; i < pos.count; i++) {
        const shade = wallShade(pos.getY(i) * WINDOW_SCALE)
        colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = shade
      }
      object.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      object.material.vertexColors = true
      object.material.needsUpdate = true
      object.receiveShadow = true
    })
  }, [scene])

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={WINDOW_SCALE}>
      <primitive object={scene} />
    </group>
  )
}
