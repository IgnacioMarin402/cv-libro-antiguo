import { Suspense, useLayoutEffect } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { HELMET_SCALE } from './domain/helmet'

// Loaded from a file, like the wizard. Its face looks down +z as exported;
// the layout turns it toward the book.
const MODEL_URL = '/models/fantasy-helmet.glb'

function HelmetModel(props) {
  const { scene } = useLoader(GLTFLoader, MODEL_URL)

  // Casts its shadow on the table but doesn't receive any, like the wizard:
  // the candle's shadow has no bias, and a double-sided Tripo mesh shadows
  // itself in fine stripes (shadow acne).
  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (object.isMesh) object.castShadow = true
    })
  }, [scene])

  return (
    <group {...props} scale={HELMET_SCALE}>
      <primitive object={scene} />
    </group>
  )
}

// Its own Suspense, so the file loads without holding up the rest of the
// scene.
export default function Helmet(props) {
  return (
    <Suspense fallback={null}>
      <HelmetModel {...props} />
    </Suspense>
  )
}
