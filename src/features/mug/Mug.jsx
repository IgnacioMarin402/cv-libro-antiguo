import { Suspense, useLayoutEffect } from 'react'
import { useGLTF } from '@/shared/three/useGLTF'
import { MUG_SCALE } from './domain/mug'

// Loaded from a file, like the helmet. Its relief looks down +z as
// exported; the layout turns it.
const MODEL_URL = '/models/dragon-mug.glb'

// Casts the candle's shadows and receives them: single-sided, like the
// shield, so the candle's shadow doesn't stripe it the way it did the
// double-sided wizard and helmet.
function MugModel(props) {
  const { scene } = useGLTF(MODEL_URL)

  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true
    })
  }, [scene])

  return (
    <group {...props} scale={MUG_SCALE}>
      <primitive object={scene} />
    </group>
  )
}

// Its own Suspense, so the file loads without holding up the rest of the
// scene.
export default function Mug(props) {
  return (
    <Suspense fallback={null}>
      <MugModel {...props} />
    </Suspense>
  )
}
