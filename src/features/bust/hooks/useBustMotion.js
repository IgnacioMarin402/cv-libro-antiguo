import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { headPose } from '../domain/head'
import { blink } from '../domain/eyes'

// The head's pose and the blink, written every frame into the uniforms the
// bust's shaders read (see shaders/bustMotion). Built here and not handed to
// a <shaderMaterial uniforms>, which R3F would copy (see candle/hooks/useFlame).
// The pose goes in as one axis and angle, so each vertex can take its share
// of the whole turn.
export function useBustMotion() {
  const uniforms = useMemo(
    () => ({
      uHeadAxis: { value: new THREE.Vector3(0, 1, 0) },
      uHeadAngle: { value: 0 },
      uBlink: { value: 0 },
    }),
    [],
  )
  const turn = useMemo(() => ({ euler: new THREE.Euler(0, 0, 0, 'YXZ'), quaternion: new THREE.Quaternion() }), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const { nod, turn: yaw, tilt } = headPose(t)
    turn.quaternion.setFromEuler(turn.euler.set(nod, yaw, tilt))
    const { x, y, z, w } = turn.quaternion
    const s = Math.sqrt(Math.max(0, 1 - w * w))
    if (s > 1e-6) uniforms.uHeadAxis.value.set(x / s, y / s, z / s)
    uniforms.uHeadAngle.value = 2 * Math.acos(Math.min(1, w))
    uniforms.uBlink.value = blink(t)
  })

  return uniforms
}
