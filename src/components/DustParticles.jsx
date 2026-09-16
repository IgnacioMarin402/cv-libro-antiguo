import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { rand } from '../utils/random'
import { createDustTexture } from '../utils/textures'

const DUST_COUNT = 260

export default function DustParticles() {
  const pointsRef = useRef()
  const dustTex = useMemo(() => createDustTexture(), [])

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(DUST_COUNT * 3)
    const vel = new Float32Array(DUST_COUNT * 3)
    for (let i = 0; i < DUST_COUNT; i++) {
      pos[i * 3] = rand(-1.4, 1.4)
      pos[i * 3 + 1] = rand(0.02, 1.6)
      pos[i * 3 + 2] = rand(-1.4, 1.4)
      vel[i * 3] = rand(-0.004, 0.004)
      vel[i * 3 + 1] = rand(0.006, 0.02)
      vel[i * 3 + 2] = rand(-0.004, 0.004)
    }
    return [pos, vel]
  }, [])

  useFrame(() => {
    const attr = pointsRef.current.geometry.attributes.position
    const pos = attr.array
    for (let i = 0; i < DUST_COUNT; i++) {
      pos[i * 3] += velocities[i * 3]
      pos[i * 3 + 1] += velocities[i * 3 + 1]
      pos[i * 3 + 2] += velocities[i * 3 + 2]
      if (pos[i * 3 + 1] > 1.7) pos[i * 3 + 1] = 0.02
    }
    attr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={DUST_COUNT} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.012}
        map={dustTex}
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
