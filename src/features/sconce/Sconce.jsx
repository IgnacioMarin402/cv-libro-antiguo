import { Suspense, useLayoutEffect, useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Flame } from '@/features/candle'
import {
  SCONCE_SCALE,
  FLAME_POSITIONS,
  WICK_RADIUS_IN_SCENE,
  LIT_FLAME,
  FLAME_PHASES,
} from './domain/sconce'

// Loaded from a file, like the candlestick.
const MODEL_URL = '/models/wrought-iron-sconce.glb'

// The ironwork and its candles. Every sconce loads the one file and hangs
// its own copy of it, sharing the meshes' geometry and material. Casts its
// shadow and receives none, like the candlestick: the candle's shadow has
// no bias, and a Tripo mesh stripes itself with it.
function SconceModel() {
  const { scene } = useLoader(GLTFLoader, MODEL_URL)
  const model = useMemo(() => scene.clone(), [scene])

  useLayoutEffect(() => {
    model.traverse((object) => {
      if (object.isMesh) object.castShadow = true
    })
  }, [model])

  return <primitive object={model} scale={SCONCE_SCALE} />
}

// A sconce on the wall, and a candle flame on each of its three wicks.
// `phase` (seconds) shifts when the whole sconce reads the room's draft, so
// two of them don't flicker in step with each other or with the candle.
export default function Sconce({ position, rotation, phase = 0 }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Its own Suspense, like the candle's: the flames don't wait for
          the file. */}
      <Suspense fallback={null}>
        <SconceModel />
      </Suspense>

      {FLAME_POSITIONS.map((tip, i) => (
        <Flame
          key={i}
          position={tip}
          wickRadius={WICK_RADIUS_IN_SCENE}
          phase={phase + FLAME_PHASES[i]}
          light={i === LIT_FLAME}
        />
      ))}
    </group>
  )
}
