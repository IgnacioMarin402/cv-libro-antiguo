import { Suspense, useLayoutEffect } from 'react'
import { useGLTF } from '@/shared/three/useGLTF'
import Painting from './components/Painting'
import { PORTRAIT_SCALE } from './domain/portrait'

// Loaded from a file, like the shield.
const MODEL_URL = '/models/portrait-frame.glb'

// Casts the candle's shadows and receives them, like the shield: its mesh
// is single-sided too.
function Frame() {
  const { scene } = useGLTF(MODEL_URL)

  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true
    })
  }, [scene])

  return <primitive object={scene} />
}

// Its own Suspense, so the files load without holding up the rest of the
// scene; the painting and its frame wait for each other, so neither hangs
// on the wall alone.
export default function Portrait(props) {
  return (
    <group {...props} scale={PORTRAIT_SCALE}>
      <Suspense fallback={null}>
        <Frame />
        <Painting />
      </Suspense>
    </group>
  )
}
