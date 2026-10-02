import { Suspense, useLayoutEffect } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { ANTIQUE_TABLE_SCALE } from './domain/antiqueTable'

// Loaded from a file, like the shelf.
const MODEL_URL = '/models/antique-table.glb'

// Casts the candle's shadows and receives them, like the shelf: its mesh
// is single-sided too.
function AntiqueTableModel(props) {
  const { scene } = useLoader(GLTFLoader, MODEL_URL)

  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true
    })
  }, [scene])

  return (
    <group {...props} scale={ANTIQUE_TABLE_SCALE}>
      <primitive object={scene} />
    </group>
  )
}

// Its own Suspense, so the file loads without holding up the rest of the
// scene.
export default function AntiqueTable(props) {
  return (
    <Suspense fallback={null}>
      <AntiqueTableModel {...props} />
    </Suspense>
  )
}
