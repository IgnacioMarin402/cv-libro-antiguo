import { Suspense, useLayoutEffect } from 'react'
import { useGLTF } from '@/shared/three/useGLTF'
import { CABINET_SCALE } from './domain/cabinet'

// Loaded from a file, like the bookshelf.
const MODEL_URL = '/models/ornate-cabinet.glb'

// Casts the candle's shadows and receives them, like the bookshelf: its mesh
// is single-sided too.
function CabinetModel(props) {
  const { scene } = useGLTF(MODEL_URL)

  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true
    })
  }, [scene])

  return (
    <group {...props} scale={CABINET_SCALE}>
      <primitive object={scene} />
    </group>
  )
}

// Its own Suspense, so the file loads without holding up the rest of the
// scene.
export default function Cabinet(props) {
  return (
    <Suspense fallback={null}>
      <CabinetModel {...props} />
    </Suspense>
  )
}
