import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createDustTexture } from './textures/dustTexture'
import { createDustField, driftDust, DUST_COUNT } from './domain/dustField'

export default function DustParticles() {
  const pointsRef = useRef()
  const dustTex = useMemo(() => createDustTexture(), [])
  const { positions, velocities } = useMemo(() => createDustField(), [])

  useFrame(() => {
    const attr = pointsRef.current.geometry.attributes.position
    driftDust(attr.array, velocities)
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
