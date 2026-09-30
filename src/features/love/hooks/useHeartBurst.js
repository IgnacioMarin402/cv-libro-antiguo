import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { createSparkTexture } from '../textures/glowTextures'
import { createBurst, scatterBurst, driftBurst, burstOpacity } from '../domain/heart'

// The sparks a click throws off. They stay where they were thrown while the
// heart floats on, so they live beside it, not on it. Hidden, and not
// advanced at all, when there's no burst in the air.
export function useHeartBurst() {
  const points = useRef()
  const burst = useMemo(() => createBurst(), [])
  const firedAt = useRef(-Infinity)
  const clock = useThree((state) => state.clock)

  const material = useMemo(() => new THREE.PointsMaterial({
    size: 0.014,
    map: createSparkTexture(),
    vertexColors: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [])

  useFrame((_, delta) => {
    const mesh = points.current
    if (!mesh) return
    const opacity = burstOpacity(clock.elapsedTime - firedAt.current)
    mesh.visible = opacity > 0
    if (!mesh.visible) return
    material.opacity = opacity
    driftBurst(burst, delta)
    mesh.geometry.attributes.position.needsUpdate = true
  })

  // Throws a new burst from `origin`, in the same frame the heart is in.
  const fire = (origin) => {
    scatterBurst(burst, origin)
    firedAt.current = clock.elapsedTime
    points.current.geometry.attributes.color.needsUpdate = true
  }

  return { points, burst, material, fire }
}
