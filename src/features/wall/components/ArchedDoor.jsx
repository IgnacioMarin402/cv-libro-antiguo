import { useLayoutEffect } from 'react'
import * as THREE from 'three'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { wallShade } from '../domain/wall'
import { DOOR_SCALE } from '../domain/door'

// Loaded from a file, like the window.
const MODEL_URL = '/models/arched-door.glb'

// Shaded like the window, and for the same reason: its arch rises into
// where the panelling darkens (from 1.8 m up, down to 61% at its apex), so
// it's darkened on the same curve, in vertex colours from each vertex's
// height, or the flat ambient would keep it lit brighter than the wall
// beside it. Single-sided, so it
// receives the candle's shadow without striping; it casts none, like the
// window.
export default function ArchedDoor({ position, rotationY }) {
  const { scene } = useLoader(GLTFLoader, MODEL_URL)

  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return
      const pos = object.geometry.attributes.position
      const colors = new Float32Array(pos.count * 3)
      for (let i = 0; i < pos.count; i++) {
        const shade = wallShade(pos.getY(i) * DOOR_SCALE)
        colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = shade
      }
      object.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      object.material.vertexColors = true
      object.material.needsUpdate = true
      object.receiveShadow = true
    })
  }, [scene])

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={DOOR_SCALE}>
      <primitive object={scene} />
    </group>
  )
}
