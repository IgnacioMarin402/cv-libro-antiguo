import { Suspense, useLayoutEffect } from 'react'
import { useGLTF } from '@/shared/three/useGLTF'
import { QUILL_SCALE } from './domain/quill'

// Loaded from a file, like the helmet. Its front looks down +z as
// exported; the layout turns it.
const MODEL_URL = '/models/quill-pen.glb'

// Casts the candle's shadows and receives them: single-sided, like the
// shield, so the candle's shadow doesn't stripe it the way it did the
// double-sided wizard and helmet.
function QuillModel(props) {
  const { scene } = useGLTF(MODEL_URL)

  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true
    })
  }, [scene])

  return (
    <group {...props} scale={QUILL_SCALE}>
      <primitive object={scene} />
    </group>
  )
}

// Its own Suspense, so the file loads without holding up the rest of the
// scene.
export default function Quill(props) {
  return (
    <Suspense fallback={null}>
      <QuillModel {...props} />
    </Suspense>
  )
}
