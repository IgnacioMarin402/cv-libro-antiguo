import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  TURN_DURATION,
  INSIDE_CURVE_STRENGTH,
  OUTSIDE_CURVE_STRENGTH,
  TURNING_CURVE_STRENGTH,
  ROTATION_DAMPING,
  FOLD_DAMPING,
} from '../domain/pageCurl'

// Bends a page's bone chain toward its flat-open or flat-closed pose, plus
// a traveling flex while a turn is actively in progress — the tutorial's
// own recipe: bones near the spine lean toward the target angle (inside
// curve), bones near the fore-edge resist it (outside curve), and every
// bone gets an extra sine-shaped flex for TURN_DURATION after a turn
// starts (turning curve), so the sheet visibly ripples through the turn
// instead of snapping between two flat poses. `opened` sets which flat
// pose is the target; `closedBook` (true only at the very first/last page)
// collapses the whole chain flat against the cover instead of curving it.
export function usePageCurl(groupRef, skinnedMeshRef, opened, closedBook) {
  const turnedAt = useRef(0)
  const lastOpened = useRef(opened)

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

      const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0
      const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0
      const turningIntensity = Math.sin((i * Math.PI) / bones.length) * turningTime

      let rotationAngle =
        INSIDE_CURVE_STRENGTH * insideCurveIntensity * targetRotation -
        OUTSIDE_CURVE_STRENGTH * outsideCurveIntensity * targetRotation +
        TURNING_CURVE_STRENGTH * turningIntensity * targetRotation

      const foldIntensity = i > 8 ? Math.sin((i * Math.PI) / bones.length - 0.5) * turningTime : 0
      let foldRotationAngle = THREE.MathUtils.degToRad(Math.sign(targetRotation) * 2)

      if (closedBook) {
        rotationAngle = i === 0 ? targetRotation : 0
        foldRotationAngle = 0
      }

      target.rotation.y = THREE.MathUtils.damp(target.rotation.y, rotationAngle, ROTATION_DAMPING, delta)
      target.rotation.x = THREE.MathUtils.damp(target.rotation.x, foldRotationAngle * foldIntensity, FOLD_DAMPING, delta)
    }
  })
}
