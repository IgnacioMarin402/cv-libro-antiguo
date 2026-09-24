import { Suspense, useLayoutEffect } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { TABLE_SCALE, TABLE_OFFSET_Y } from './domain/table'
import { recolorCloth } from './shaders/clothRecolor'

// Loaded from a file, like the wizard and the helmet.
const MODEL_URL = '/models/ornate-table.glb'

// Receives the candle's shadows, and casts them onto the floor — without
// that the flame would light the stones under the top straight through it.
// Its mesh is single-sided, so the shadow pass draws only its back faces
// and the cloth doesn't stripe the way the double-sided props did. Its
// cloth is repainted in the wizard cat's colours on load (see domain/cloth).
function TableModel() {
  const { scene } = useLoader(GLTFLoader, MODEL_URL)

  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true
      recolorCloth(object.material)
    })
  }, [scene])

  return (
    <group position-y={TABLE_OFFSET_Y} scale={TABLE_SCALE}>
      <primitive object={scene} />
    </group>
  )
}

// Its own Suspense, so the file loads without holding up the rest of the
// scene.
export default function Table() {
  return (
    <Suspense fallback={null}>
      <TableModel />
    </Suspense>
  )
}
