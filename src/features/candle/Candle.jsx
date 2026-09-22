import { useMemo } from 'react'
import * as THREE from 'three'
import { createGlowTexture } from './textures/glowTexture'
import { useFlame } from './hooks/useFlame'
import { CANDLE, CANDLE_SCALE, FLAME_OFFSET_Y } from './domain/candle'
import { FLAME } from './domain/flame'

// The candle and its fire: a wax cylinder, a wick, and a flame made of a
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
    <group position={position} scale={CANDLE_SCALE}>
      <mesh position-y={CANDLE.height / 2} castShadow>
        <cylinderGeometry args={[CANDLE.radius, CANDLE.radius, CANDLE.height, 20]} />
        <meshStandardMaterial color={0xe9dcb8} roughness={0.6} />
      </mesh>
      {/* Unlit: the candle's light burns 3.5 cm over the wick's tip and
          saturated any lit material there, however dark, into a bright grey
          cap in the flame's base. A charred wick seen through its own flame
          is a dark silhouette. */}
      <mesh position-y={CANDLE.height + CANDLE.wickHeight / 2}>
        <cylinderGeometry args={[CANDLE.wickRadius, CANDLE.wickRadius, CANDLE.wickHeight, 6]} />
        <meshBasicMaterial color={0x1a1208} />
      </mesh>

      <group position-y={FLAME_OFFSET_Y}>
        <mesh ref={cardRef} geometry={cardGeometry} material={material} position-y={-FLAME.sink} />
        <sprite ref={glowRef} position-y={0.028} scale={[0.16, 0.16, 1]}>
          <spriteMaterial map={glowTex} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>
      </group>

      <pointLight
        ref={lightRef}
        position={[0, 0.4, 0]}
        color={0xffb066}
        intensity={6.5}
        distance={9}
        decay={1.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
    </group>
  )
}
