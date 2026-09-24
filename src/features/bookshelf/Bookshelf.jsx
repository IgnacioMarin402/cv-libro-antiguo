import { Suspense, useLayoutEffect } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { BOOKSHELF_SCALE } from './domain/bookshelf'

// Loaded from a file, like the table.
const MODEL_URL = '/models/wooden-bookshelf.glb'

// Casts the candle's shadows and receives them, like the table: its mesh is
// single-sided too, so it doesn't stripe the way the double-sided props did.
function BookshelfModel(props) {
  const { scene } = useLoader(GLTFLoader, MODEL_URL)

  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true
    })
  }, [scene])

  return (
    <group {...props} scale={BOOKSHELF_SCALE}>
      <primitive object={scene} />
    </group>
  )
}

// Its own Suspense, so the file loads without holding up the rest of the
// scene.
export default function Bookshelf(props) {
  return (
    <Suspense fallback={null}>
      <BookshelfModel {...props} />
    </Suspense>
  )
}
