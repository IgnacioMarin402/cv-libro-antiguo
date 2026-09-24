import { Suspense, useLayoutEffect, useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'
import { createGlowTexture } from './textures/glowTexture'
import { useFlame } from './hooks/useFlame'
import { MODEL_SCALE, FLAME_SCALE, FLAME_Y, LIGHT_Y } from './domain/candle'
import { FLAME } from './domain/flame'

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

// The candle and its fire: the model, and on its wick a flame made of a
// shader card that turns to face the viewer plus a glow sprite. Everything
// that moves here is driven by one reading of the draft per frame (see
// domain/flame), so the light, the flame's lean and its brightness move
// together.
export default function Candle({ position = [0, 0, 0] }) {
  const { cardRef, glowRef, lightRef, material } = useFlame()
  const glowTex = useMemo(() => createGlowTexture(), [])
  // The card's corners are placed by the vertex shader; the plane only
  // supplies its uvs, split along the height so the flame can bend.
  const cardGeometry = useMemo(() => new THREE.PlaneGeometry(1, 1, 1, 24), [])

  return (
    <group position={position}>
      {/* Its own Suspense: the fire is the room's only light, and it
          doesn't wait for the file. */}
      <Suspense fallback={null}>
        <CandleModel />
      </Suspense>

      <group position-y={FLAME_Y} scale={FLAME_SCALE}>
        <mesh ref={cardRef} geometry={cardGeometry} material={material} position-y={-FLAME.sink} />
        <sprite ref={glowRef} position-y={0.028} scale={[0.16, 0.16, 1]}>
          <spriteMaterial map={glowTex} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>

        <pointLight
          ref={lightRef}
          position={[0, LIGHT_Y, 0]}
          color={0xffb066}
          intensity={6.5}
          distance={9}
          decay={1.8}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
      </group>
    </group>
  )
}
