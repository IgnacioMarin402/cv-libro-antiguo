import { Suspense, useLayoutEffect } from 'react'
import { useGLTF } from '@/shared/three/useGLTF'
import { SHIELD_SCALE } from './domain/shield'

// Loaded from a file, like the shelf.
const MODEL_URL = '/models/medieval-shield.glb'

// Casts the candle's shadows and receives them, like the shelf: its mesh
// is single-sided too.
function ShieldModel(props) {
  const { scene } = useGLTF(MODEL_URL)

  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true
    })
  }, [scene])

  return (
    <group {...props} scale={SHIELD_SCALE}>
      <primitive object={scene} />
    </group>
  )
}

// Its own Suspense, so the file loads without holding up the rest of the
// scene.
export default function Shield(props) {
  return (
    <Suspense fallback={null}>
      <ShieldModel {...props} />
    </Suspense>
  )
}
