import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { smoothDamp } from '@/shared/math/easing'
import { createMoteTexture } from '../textures/moteTexture'
import { createMoteField, driftMotes, MOTE_COUNT, MOTE_OPACITY, MOTE_FADE_SMOOTH_TIME } from '../domain/motes'

// The book's own light, spiralling off it while it's open. Mounted outside
// the book's tilt and outside its levitation, so the column keeps its own
// axis while the book breathes underneath it. Each mote carries its own
// color so it can flicker on its own — the material's opacity belongs to
// the whole column and only says how present the column is. Invisible
// costs nothing: once faded out nothing is advanced at all.
export default function MagicMotes({ active }) {
  const points = useRef()
  const texture = useMemo(() => createMoteTexture(), [])
  const field = useMemo(() => createMoteField(), [])
  const fade = useRef({ value: 0 })

  useFrame((state, delta) => {
    const mesh = points.current
    if (!mesh) return
    mesh.material.opacity = smoothDamp(
      mesh.material.opacity,
      active ? MOTE_OPACITY : 0,
      fade.current,
      MOTE_FADE_SMOOTH_TIME,
      delta
    )
    mesh.visible = mesh.material.opacity > 0.001
    if (!mesh.visible) return
    driftMotes(field, state.clock.elapsedTime, delta)
    mesh.geometry.attributes.position.needsUpdate = true
    mesh.geometry.attributes.color.needsUpdate = true
  })

  return (
    <points ref={points} visible={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={MOTE_COUNT} array={field.positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={MOTE_COUNT} array={field.colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        map={texture}
        vertexColors
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
