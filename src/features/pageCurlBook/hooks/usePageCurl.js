import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { smoothDampAngle } from '@/shared/math/easing'
import {
  PAGE_SEGMENTS,
  TURN_DURATION,
  INSIDE_CURVE_STRENGTH,
  OUTSIDE_CURVE_STRENGTH,
  TURNING_CURVE_STRENGTH,
  ROTATION_SMOOTH_TIME,
  FOLD_SMOOTH_TIME,
  FAN_STEP,
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
export function usePageCurl(groupRef, skinnedMeshRef, number, opened, closedBook) {
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

    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2
    // Once the book is open every sheet stops a little short of flat, one
    // step further per sheet, so the turned half rests fanned out above the
    // cover instead of every leaf lying in the same plane.
    if (!closedBook) targetRotation += number * FAN_STEP

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
