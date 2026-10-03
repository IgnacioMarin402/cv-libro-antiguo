import { Suspense, useLayoutEffect } from 'react'
import { useGLTF } from '@/shared/three/useGLTF'
import { BUST_SCALE } from './domain/bust'
import { useBustMotion } from './hooks/useBustMotion'
import { animateBust } from './shaders/bustMotion'

// Loaded from a file, like the shield.
const MODEL_URL = '/models/shourdo-bust.glb'

// Casts the candle's shadows and receives them, like the shield: its mesh
// is single-sided too. His head moves a little and he blinks, in the
// mesh's own shaders (see domain/head and domain/eyes).
function BustModel(props) {
  const { scene } = useGLTF(MODEL_URL)
  const uniforms = useBustMotion()

  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true
      animateBust(object, uniforms)
    })
  }, [scene, uniforms])

  return (
    <group {...props} scale={BUST_SCALE}>
      <primitive object={scene} />
    </group>
  )
}

// Its own Suspense, so the file loads without holding up the rest of the
// scene.
export default function Bust(props) {
  return (
    <Suspense fallback={null}>
      <BustModel {...props} />
    </Suspense>
  )
}
