import { Suspense, useLayoutEffect, useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { THRONE_SCALE } from './domain/throne'

// Loaded from a file, like the table.
const MODEL_URL = '/models/ornate-throne.glb'

// Every throne loads the one file and stands its own copy of it, sharing
// the meshes' geometry and material, like the sconces. Casts the candle's
// shadows and receives them, like the table: its mesh is single-sided too.
function ThroneModel(props) {
  const { scene } = useLoader(GLTFLoader, MODEL_URL)
  const model = useMemo(() => scene.clone(), [scene])

  useLayoutEffect(() => {
    model.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true
    })
  }, [model])

  return (
    <group {...props} scale={THRONE_SCALE}>
      <primitive object={model} />
    </group>
  )
}

// Its own Suspense, so the file loads without holding up the rest of the
// scene.
export default function Throne(props) {
  return (
    <Suspense fallback={null}>
      <ThroneModel {...props} />
    </Suspense>
  )
}
