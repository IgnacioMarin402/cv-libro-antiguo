import { Suspense, useLayoutEffect } from 'react'
import { useGLTF } from '@/shared/three/useGLTF'
import { RUG_SCALE } from './domain/rug'
import { flattenRug } from './geometry/flattenRug'

// Loaded from a file, like the table.
const MODEL_URL = '/models/dragon-lion-rug.glb'

// Pressed flat as it loads (see domain/rug). Receives the shadows of the
// table and the thrones over it; casts none, lying on the floor with
// nothing under it but the floor, like the floor itself.
function RugModel(props) {
  const { scene } = useGLTF(MODEL_URL)

  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return
      flattenRug(object.geometry)
      object.receiveShadow = true
    })
  }, [scene])

  return (
    <group {...props} scale={RUG_SCALE}>
      <primitive object={scene} />
    </group>
  )
}

// Its own Suspense, so the file loads without holding up the rest of the
// scene.
export default function Rug(props) {
  return (
    <Suspense fallback={null}>
      <RugModel {...props} />
    </Suspense>
  )
}
