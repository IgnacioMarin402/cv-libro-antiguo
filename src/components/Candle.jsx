import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createGlowTexture } from '../utils/textures'
import { flameVertexShader, flameFragmentShader } from '../utils/flameShader'

export default function Candle({ position = [0.34, 0, 0.42] }) {
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
    const flicker = 6.5 + Math.sin(t * 9.3) * 0.5 + Math.sin(t * 23.1) * 0.3 + (Math.random() - 0.5) * 0.6
    lightRef.current.intensity = Math.max(4.5, flicker)
    flameGroupRef.current.scale.y = 1 + Math.sin(t * 5) * 0.025 + Math.sin(t * 11) * 0.012
    flameMeshRef.current.quaternion.copy(state.camera.quaternion)
    flameUniforms.uTime.value = t
    flameUniforms.uFlicker.value = THREE.MathUtils.clamp(flicker / 7.5, 0.85, 1.1)
  })

  return (
    <group position={position}>
      <mesh position-y={0.16} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.32, 20]} />
        <meshStandardMaterial color={0xe9dcb8} roughness={0.6} />
      </mesh>
      <mesh position-y={0.335}>
        <cylinderGeometry args={[0.004, 0.004, 0.03, 6]} />
        <meshStandardMaterial color={0x1a1208} />
      </mesh>

      <group ref={flameGroupRef} position-y={0.35}>
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
