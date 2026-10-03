import { Suspense, useLayoutEffect } from 'react'
import { useGLTF } from '@/shared/three/useGLTF'
import { Flame } from '@/features/candle'
import Embers from './components/Embers'
import { CAULDRON_SCALE, CAULDRON_FLAMES, CAULDRON_FLAME_SWAY, CAULDRON_FLAME_PACE } from './domain/cauldron'

// Loaded from a file, like the fireplace.
const MODEL_URL = '/models/medieval-cauldron.glb'

// Casts the candle's shadows and receives them, like the fireplace: its
// mesh is single-sided too.
function CauldronModel() {
  const { scene } = useGLTF(MODEL_URL)

  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true
    })
  }, [scene])

  return (
    <group scale={CAULDRON_SCALE}>
      <primitive object={scene} />
    </group>
  )
}

// The cauldron, the low fire under it and the orbs rising off its brew. The
// flames burn on no wick, like the hearth's: the wood and the pot hide
// what's behind them.
export default function Cauldron({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Its own Suspense, like the fireplace's: the fire doesn't wait for
          the file. */}
      <Suspense fallback={null}>
        <CauldronModel />
      </Suspense>

      {CAULDRON_FLAMES.map((flame, i) => (
        <Flame
          key={i}
          position={flame.position}
          wickRadius={0}
          size={flame.size}
          phase={flame.phase}
          sway={CAULDRON_FLAME_SWAY}
          pace={CAULDRON_FLAME_PACE}
        />
      ))}

      <Embers />
    </group>
  )
}
