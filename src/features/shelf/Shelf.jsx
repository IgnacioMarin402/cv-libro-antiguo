import { Suspense, useLayoutEffect } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { SHELF_SCALE } from './domain/shelf'

// Loaded from a file, like the bookshelf.
const MODEL_URL = '/models/ornate-shelf.glb'

// Casts the candle's shadows and receives them, like the bookshelf: its mesh
// is single-sided too.
function ShelfModel(props) {
  const { scene } = useLoader(GLTFLoader, MODEL_URL)

  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true
    })
  }, [scene])

  return (
    <group {...props} scale={SHELF_SCALE}>
      <primitive object={scene} />
    </group>
  )
}

// Its own Suspense, so the file loads without holding up the rest of the
// scene.
export default function Shelf(props) {
  return (
    <Suspense fallback={null}>
      <ShelfModel {...props} />
    </Suspense>
  )
}
