import { Suspense, useLayoutEffect } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Flame from './components/Flame'
import { MODEL_SCALE, FLAME_Y, WICK_RADIUS_IN_SCENE } from './domain/candle'

const MODEL_URL = '/models/candle-holder.glb'

// The candlestick, candle and wick, loaded from a file like the wizard.
// Casts its shadow on the table but doesn't receive any, like the wizard
// and the helmet: the candle's shadow has no bias, and a double-sided
// Tripo mesh shadows itself in fine stripes (shadow acne).
function CandleModel() {
  const { scene } = useLoader(GLTFLoader, MODEL_URL)

  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (object.isMesh) object.castShadow = true
    })
  }, [scene])

  return <primitive object={scene} scale={MODEL_SCALE} />
}

// The candle and its fire: the model, and on its wick a flame (see
// components/Flame) carrying the candle's light — the one light in the
// room that casts shadows.
export default function Candle({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Its own Suspense: the fire is the room's main light, and it
          doesn't wait for the file. */}
      <Suspense fallback={null}>
        <CandleModel />
      </Suspense>

      <Flame position={[0, FLAME_Y, 0]} wickRadius={WICK_RADIUS_IN_SCENE} light castShadow />
    </group>
  )
}
