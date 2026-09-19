import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { easeInOutCubic } from '@/shared/math/easing'
import { useOrbitControls } from './hooks/useOrbitControls'
import { useKeyboardPan } from './hooks/useKeyboardPan'
import { SHOTS, shotFor, INTRO_DURATION, OPEN_ZOOM_DURATION, ORBIT_LIMITS } from './domain/shots'

// Orbits the book once idle. Opens on a slow dolly-in from a wide shot, then
// dollies to a closer, frontal framing whenever the book is opened, and back
// out again when it's closed.
//
// An open book also hands the visitor the keyboard: WASD slides the frame
// over the spread, and the lens is allowed much closer in. Both are the
// same gesture really — pick a corner, then go and read it — and both
// belong to the open book only, which is why they live here next to the
// phase that knows.
export default function CameraRig({ open = false }) {
  const { camera } = useThree()
  const controlsRef = useOrbitControls(SHOTS.rest.target)
  const panStep = useKeyboardPan()
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

  useFrame((state, delta) => {
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
    // Everything below hands the camera over to the visitor, so it reads
    // the phase the block above may have just changed.
    const idle = phaseRef.current === 'idle'
    // Only an open book, and only between the rig's own moves: a scripted
    // dolly and a held key must never write the camera on the same frame.
    panStep(controls, delta, open && idle)
    // How close the lens may get is the book's state too: a closed book is
    // one object and is read whole, an open one is a page you want your
    // nose in (see ORBIT_LIMITS). No floor at all while the rig itself is
    // moving the camera — update() clamps the distance even with the
    // controls disabled, and would pop a dolly that leaves from closer in
    // than the floor it is arriving at.
    controls.minDistance = !idle ? 0 : open ? ORBIT_LIMITS.openMinDistance : ORBIT_LIMITS.minDistance
    controls.update()
  })

  return null
}
