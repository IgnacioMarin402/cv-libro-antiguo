import { Suspense, useLayoutEffect } from 'react'
import { useGLTF } from '@/shared/three/useGLTF'
import { SOFA_SCALE } from './domain/sofa'

// Loaded from a file, like the shield.
const MODEL_URL = '/models/cozy-sofa.glb'

// Casts the candle's shadows and receives them, like the shield: its mesh
// is single-sided too.
function SofaModel(props) {
  const { scene } = useGLTF(MODEL_URL)

  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true
    })
  }, [scene])

  return (
    <group {...props} scale={SOFA_SCALE}>
      <primitive object={scene} />
    </group>
  )
}

// Its own Suspense, so the file loads without holding up the rest of the
// scene.
export default function Sofa(props) {
  return (
    <Suspense fallback={null}>
      <SofaModel {...props} />
    </Suspense>
  )
}
