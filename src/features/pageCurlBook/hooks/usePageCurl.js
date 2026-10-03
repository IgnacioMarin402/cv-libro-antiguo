import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { smoothDampAngle } from '@/shared/math/easing'
import {
  PAGE_SEGMENTS,
  TURN_DURATION,
  TURNING_CURVE_STRENGTH,
  ROTATION_SMOOTH_TIME,
  FOLD_SMOOTH_TIME,
} from '../domain/pageCurl'

// Bends a page's bone chain toward its pose at rest, plus a traveling flex
// while a turn is actively in progress. The rest pose is `restAngles`, one
// per bone: where this leaf lies in its pile (see domain/pile), or flat
// when the book is closed. On top of it, the tutorial's turning curve:
// every bone gets an extra sine-shaped flex for TURN_DURATION after a turn
// starts, so the sheet visibly ripples through the turn instead of
// snapping between two poses. `opened` says which way that flex bends;
// `closedBook` (true only at the very first/last page) lays the chain flat
// without it.
export function usePageCurl(groupRef, skinnedMeshRef, restAngles, opened, closedBook) {
  const turnedAt = useRef(0)
  const lastOpened = useRef(opened)
  // smoothDamp carries velocity between frames and the caller owns it, so
  // every bone needs its own holder per axis (see shared/math/easing).
  const velocities = useMemo(
    () => Array.from({ length: PAGE_SEGMENTS + 1 }, () => ({ spin: { value: 0 }, fold: { value: 0 } })),
    []
  )

  useEffect(() => {
    if (opened !== lastOpened.current) {
      turnedAt.current = performance.now()
      lastOpened.current = opened
    }
  }, [opened])

  useFrame((_, delta) => {
    const mesh = skinnedMeshRef.current
    if (!mesh) return

    let turningTime = Math.min(TURN_DURATION, performance.now() - turnedAt.current) / TURN_DURATION
    turningTime = Math.sin(turningTime * Math.PI)

    const targetRotation = opened ? -Math.PI / 2 : Math.PI / 2

    const bones = mesh.skeleton.bones

    for (let i = 0; i < bones.length; i++) {
      const target = i === 0 ? groupRef.current : bones[i]

      const turningIntensity = Math.sin((i * Math.PI) / bones.length) * turningTime
      let rotationAngle = restAngles[i] + TURNING_CURVE_STRENGTH * turningIntensity * targetRotation

      const foldIntensity = i > 8 ? Math.sin((i * Math.PI) / bones.length - 0.5) * turningTime : 0
      let foldRotationAngle = THREE.MathUtils.degToRad(Math.sign(targetRotation) * 2)

      if (closedBook) {
        rotationAngle = restAngles[i]
        foldRotationAngle = 0
      }

      const velocity = velocities[i]
      target.rotation.y = smoothDampAngle(
        target.rotation.y,
        rotationAngle,
        velocity.spin,
        ROTATION_SMOOTH_TIME,
        delta
      )
      target.rotation.x = smoothDampAngle(
        target.rotation.x,
        foldRotationAngle * foldIntensity,
        velocity.fold,
        FOLD_SMOOTH_TIME,
        delta
      )
    }
  })
}
