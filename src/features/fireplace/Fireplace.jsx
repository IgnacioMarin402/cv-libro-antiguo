import { Suspense, useLayoutEffect } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Flame, FireAudio } from '@/features/candle'
import {
  FIREPLACE_SCALE,
  FIRE_FLAMES,
  FIRE_LIGHT_FLAME,
  FIRE_INTENSITY,
  FIRE_SOUND_POSITION,
  FIRE_SOUND,
} from './domain/fireplace'

// Loaded from a file, like the bookshelf.
const MODEL_URL = '/models/brick-fireplace.glb'

// Casts the candle's shadows and receives them, like the bookshelf: its mesh
// is single-sided too.
function FireplaceModel() {
  const { scene } = useLoader(GLTFLoader, MODEL_URL)

  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true
    })
  }, [scene])

  return (
    <group scale={FIREPLACE_SCALE}>
      <primitive object={scene} />
    </group>
  )
}

// The fireplace, the fire in it and its crackle. The flames burn on no wick, so nothing
// brings their cards forward of where they stand: the logs in front hide
// their bases, as logs do.
export default function Fireplace({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Its own Suspense, like the sconces': the fire doesn't wait for
          the file. */}
      <Suspense fallback={null}>
        <FireplaceModel />
      </Suspense>

      {FIRE_FLAMES.map((flame, i) => (
        <Flame
          key={i}
          position={flame.position}
          wickRadius={0}
          size={flame.size}
          phase={flame.phase}
          light={i === FIRE_LIGHT_FLAME}
          intensity={FIRE_INTENSITY}
        />
      ))}

      <FireAudio position={FIRE_SOUND_POSITION} {...FIRE_SOUND} />
    </group>
  )
}
