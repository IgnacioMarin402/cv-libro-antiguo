import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createGlowTexture } from '../utils/textures'

export default function Candle({ position = [0.34, 0, 0.42] }) {
  const flameGroupRef = useRef()
  const lightRef = useRef()
  const glowTex = useMemo(() => createGlowTexture(), [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const flicker = 6.5 + Math.sin(t * 9.3) * 0.5 + Math.sin(t * 23.1) * 0.3 + (Math.random() - 0.5) * 0.6
    lightRef.current.intensity = Math.max(4.5, flicker)
    flameGroupRef.current.scale.y = 1 + Math.sin(t * 14) * 0.08 + Math.sin(t * 31) * 0.04
    flameGroupRef.current.rotation.z = Math.sin(t * 6) * 0.05
  })

  return (
    <group position={position}>
      <mesh position-y={0.16} castShadow>
        <cylinderGeometry args={[0.045, 0.05, 0.32, 20]} />
        <meshStandardMaterial color={0xe9dcb8} roughness={0.6} />
      </mesh>
      <mesh position-y={0.335}>
        <cylinderGeometry args={[0.004, 0.004, 0.03, 6]} />
        <meshStandardMaterial color={0x1a1208} />
      </mesh>

      <group ref={flameGroupRef} position-y={0.35}>
        <mesh position-y={0.021}>
          <coneGeometry args={[0.014, 0.042, 12]} />
          <meshBasicMaterial color={0xff7a1e} transparent opacity={0.85} />
        </mesh>
        <mesh position-y={0.013}>
          <coneGeometry args={[0.007, 0.022, 12]} />
          <meshBasicMaterial color={0xfff0b0} />
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
