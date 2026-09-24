import { useMemo } from 'react'
import * as THREE from 'three'
import { createGlowTexture } from '../textures/glowTexture'
import { useFlame } from '../hooks/useFlame'
import { FLAME_SCALE, LIGHT_Y } from '../domain/candle'
import { FLAME, LIGHT_COLOR, BASE_INTENSITY } from '../domain/flame'

// A candle flame on a wick whose tip stands at `position`: a shader card
// that turns to face the viewer plus a glow sprite, and — on the flame that
// carries its candle's light — that light. Everything that moves here is
// driven by one reading of the draft per frame (see domain/flame), so the
// light, the flame's lean and its brightness move together. `phase` and
// `wickRadius` are useFlame's.
export default function Flame({ position, wickRadius, phase = 0, light = false, castShadow = false }) {
  const { cardRef, glowRef, lightRef, material } = useFlame({ wickRadius, phase })
  const glowTex = useMemo(() => createGlowTexture(), [])
  // The card's corners are placed by the vertex shader; the plane only
  // supplies its uvs, split along the height so the flame can bend.
  const cardGeometry = useMemo(() => new THREE.PlaneGeometry(1, 1, 1, 24), [])

  return (
    <group position={position} scale={FLAME_SCALE}>
      <mesh ref={cardRef} geometry={cardGeometry} material={material} position-y={-FLAME.sink} />
      <sprite ref={glowRef} position-y={0.028} scale={[0.16, 0.16, 1]}>
        <spriteMaterial map={glowTex} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>

      {light && (
        <pointLight
          ref={lightRef}
          position={[0, LIGHT_Y, 0]}
          color={LIGHT_COLOR}
          intensity={BASE_INTENSITY}
          distance={0}
          decay={2}
          castShadow={castShadow}
          shadow-mapSize={[1024, 1024]}
        />
      )}
    </group>
  )
}
