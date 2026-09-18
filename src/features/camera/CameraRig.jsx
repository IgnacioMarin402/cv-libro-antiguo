import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { easeInOutCubic } from '@/shared/math/easing'
import { useOrbitControls } from './hooks/useOrbitControls'
import { SHOTS, shotFor, INTRO_DURATION, OPEN_ZOOM_DURATION } from './domain/shots'

// Orbits the book once idle. Opens on a slow dolly-in from a wide shot, then
// dollies to a closer, frontal framing whenever the book is opened, and back
// out again when it's closed.
export default function CameraRig({ open = false }) {
  const { camera } = useThree()
  const controlsRef = useOrbitControls(SHOTS.rest.target)
  const introStart = useRef(performance.now())
  const tmpTarget = useMemo(() => new THREE.Vector3(), [])

  // phase: 'intro' (fixed dolly-in) -> 'idle' (user-orbitable) -> 'zoom'
  // (dolly to the open- or closed-book framing, triggered by `open`
  // flipping either way) -> 'idle' again.
  const phaseRef = useRef('intro')
  const requestedOpen = useRef(null)
  const zoomAnim = useRef(null)
  const wasOpenRef = useRef(open)

  useEffect(() => {
    if (open !== wasOpenRef.current) requestedOpen.current = open
    wasOpenRef.current = open
  }, [open])

  useFrame(() => {
    const controls = controlsRef.current
    if (!controls) return

    if (phaseRef.current === 'intro') {
      const elapsed = performance.now() - introStart.current
      const p = easeInOutCubic(Math.min(1, elapsed / INTRO_DURATION))
      camera.position.lerpVectors(SHOTS.intro.position, SHOTS.rest.position, p)
      tmpTarget.lerpVectors(SHOTS.intro.target, SHOTS.rest.target, p)
      camera.lookAt(tmpTarget)
      controls.target.copy(tmpTarget)
      if (elapsed >= INTRO_DURATION) {
        controls.enabled = true
        phaseRef.current = 'idle'
      }
    } else if (requestedOpen.current !== null) {
      // Always re-aims from wherever the visitor left the camera, not from
      // the shot it nominally sat at.
      const shot = shotFor(requestedOpen.current)
      requestedOpen.current = null
      zoomAnim.current = {
        fromPos: camera.position.clone(),
        fromTarget: controls.target.clone(),
        toPos: shot.position,
        toTarget: shot.target,
        start: performance.now(),
      }
      controls.enabled = false
      phaseRef.current = 'zoom'
    } else if (phaseRef.current === 'zoom') {
      const anim = zoomAnim.current
      const elapsed = performance.now() - anim.start
      const p = easeInOutCubic(Math.min(1, elapsed / OPEN_ZOOM_DURATION))
      camera.position.lerpVectors(anim.fromPos, anim.toPos, p)
      tmpTarget.lerpVectors(anim.fromTarget, anim.toTarget, p)
      camera.lookAt(tmpTarget)
      controls.target.copy(tmpTarget)
      if (elapsed >= OPEN_ZOOM_DURATION) {
        controls.enabled = true
        phaseRef.current = 'idle'
      }
    }
    controls.update()
  })

  return null
}
