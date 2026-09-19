import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createGlowTexture } from './textures/glowTexture'
import { flameVertexShader, flameFragmentShader } from './shaders/flameShader'
import { CANDLE, CANDLE_SCALE, FLAME_OFFSET_Y } from './domain/candle'
import { flicker, lightIntensity, flameStretch, flameBrightness } from './domain/flame'

// The candle and its fire: a wax cylinder, a wick, and a flame made of a
// camera-facing shader plane plus a glow sprite. Everything that moves here
// is driven by one flicker value per frame (see domain/flame), so the
// light, the flame's stretch and its shader brightness gutter together.
export default function Candle({ position = [0, 0, 0] }) {
  const flameGroupRef = useRef()
  const flameMeshRef = useRef()
  const lightRef = useRef()
  const glowTex = useMemo(() => createGlowTexture(), [])
  const flameUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uFlicker: { value: 1 },
  }), [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const f = flicker(t)
    lightRef.current.intensity = lightIntensity(f)
    flameGroupRef.current.scale.y = flameStretch(t)
    // The flame plane always faces the camera — a flat billboard reads as a
    // volume as long as it's never seen edge-on.
    flameMeshRef.current.quaternion.copy(state.camera.quaternion)
    flameUniforms.uTime.value = t
    flameUniforms.uFlicker.value = flameBrightness(f)
  })

  return (
    <group position={position} scale={CANDLE_SCALE}>
      <mesh position-y={CANDLE.height / 2} castShadow>
        <cylinderGeometry args={[CANDLE.radius, CANDLE.radius, CANDLE.height, 20]} />
        <meshStandardMaterial color={0xe9dcb8} roughness={0.6} />
      </mesh>
      <mesh position-y={CANDLE.height + CANDLE.wickHeight / 2}>
        <cylinderGeometry args={[CANDLE.wickRadius, CANDLE.wickRadius, CANDLE.wickHeight, 6]} />
        <meshStandardMaterial color={0x1a1208} />
      </mesh>

      <group ref={flameGroupRef} position-y={FLAME_OFFSET_Y}>
        <mesh ref={flameMeshRef} position-y={0.04}>
          <planeGeometry args={[0.05, 0.09]} />
          <shaderMaterial
            uniforms={flameUniforms}
            vertexShader={flameVertexShader}
            fragmentShader={flameFragmentShader}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
        <sprite position-y={0.03} scale={[0.11, 0.11, 1]}>
          <spriteMaterial map={glowTex} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>
      </group>

      <pointLight
        ref={lightRef}
        position={[0, 0.4, 0]}
        color={0xffb066}
        intensity={7.5}
        distance={9}
        decay={1.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
    </group>
  )
}
