import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { easeInOutCubic } from '@/shared/math/easing'
import { useOrbitControls } from './hooks/useOrbitControls'
import { useKeyboardPan } from './hooks/useKeyboardPan'
import { SHOTS, shotFor, INTRO_DURATION, OPEN_ZOOM_DURATION, ORBIT_LIMITS } from './domain/shots'
import { focusShot, FOCUS_DURATION, climbProgress } from './domain/focus'

// Orbits the book once idle. Opens on a slow dolly-in from a wide shot, then
// dollies to a closer, frontal framing whenever the book is opened, and back
// out again when it's closed.
//
// An open book also hands the visitor the keyboard: WASD slides the frame
// over the spread, and the lens is allowed much closer in. Both are the
// same gesture really — pick a corner, then go and read it — and both
// belong to the open book only, which is why they live here next to the
// phase that knows.
//
// `focus`, when set, is something on a wall the visitor asked to look at
// (see domain/focus): the rig crosses the room to stand square in front of
// it and holds there, the visitor's controls off, until it's cleared — and
// then goes back to the book, as the book is by then.
export default function CameraRig({ open = false, ready = true, focus = null }) {
  const { camera } = useThree()
  const controlsRef = useOrbitControls(SHOTS.rest.target)
  const panStep = useKeyboardPan()
  const introStart = useRef(performance.now())
  const tmpTarget = useMemo(() => new THREE.Vector3(), [])

  // phase: 'intro' (fixed dolly-in) -> 'idle' (user-orbitable) -> 'zoom'
  // (dolly to the open- or closed-book framing, triggered by `open`
  // flipping either way) -> 'idle' again. Or from 'idle', 'zoom' across the
  // room to a focus -> 'focus' (held on it) -> 'zoom' back -> 'idle'.
  const phaseRef = useRef('intro')
  const requestedOpen = useRef(null)
  const zoomAnim = useRef(null)
  const wasOpenRef = useRef(open)
  // undefined when nothing is asked; otherwise the focus asked for, or null
  // to come back from one.
  const requestedFocus = useRef(undefined)
  const focusRef = useRef(null)
  const wasFocusRef = useRef(focus)

  useEffect(() => {
    if (open !== wasOpenRef.current) requestedOpen.current = open
    wasOpenRef.current = open
  }, [open])

  useEffect(() => {
    if (focus !== wasFocusRef.current) requestedFocus.current = focus
    wasFocusRef.current = focus
  }, [focus])

  // Where the lens stands for a focus, written into a move's toPos and
  // toTarget. Worked out again every frame, from the canvas as it is: a
  // resized window or a turned phone keeps the framing.
  const aimAt = (target, { size }, into) => {
    const shot = focusShot(target, size.width / size.height, camera.fov)
    into.toPos.fromArray(shot.position)
    into.toTarget.fromArray(shot.target)
  }

  useFrame((state, delta) => {
    const controls = controlsRef.current
    if (!controls) return

    if (phaseRef.current === 'intro') {
      // Held on the wide shot until the loading screen lifts (`ready`):
      // the dolly-in is the visit's first move, not something to spend
      // behind the curtain.
      if (!ready) introStart.current = performance.now()
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
    } else if (requestedFocus.current !== undefined) {
      // To the focus, or back from it to the book's shot for the book as it
      // is now — which takes care of any opening asked for meanwhile.
      focusRef.current = requestedFocus.current
      requestedFocus.current = undefined
      requestedOpen.current = null
      const anim = {
        fromPos: camera.position.clone(),
        fromTarget: controls.target.clone(),
        toPos: new THREE.Vector3(),
        toTarget: new THREE.Vector3(),
        start: performance.now(),
        duration: FOCUS_DURATION,
        climb: true,
      }
      if (focusRef.current) {
        aimAt(focusRef.current, state, anim)
      } else {
        const shot = shotFor(open)
        anim.toPos.copy(shot.position)
        anim.toTarget.copy(shot.target)
      }
      zoomAnim.current = anim
      controls.enabled = false
      phaseRef.current = 'zoom'
    } else if (requestedOpen.current !== null && !focusRef.current) {
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
        duration: OPEN_ZOOM_DURATION,
        climb: false,
      }
      controls.enabled = false
      phaseRef.current = 'zoom'
    } else if (phaseRef.current === 'zoom') {
      const anim = zoomAnim.current
      if (focusRef.current) aimAt(focusRef.current, state, anim)
      const elapsed = performance.now() - anim.start
      const t = Math.min(1, elapsed / anim.duration)
      const p = easeInOutCubic(t)
      camera.position.lerpVectors(anim.fromPos, anim.toPos, p)
      // Across the room, the height changes first going up and last coming
      // down, so the lens passes over what's in the way (see domain/focus).
      if (anim.climb) {
        const rise = anim.toPos.y - anim.fromPos.y
        camera.position.y = anim.fromPos.y + rise * climbProgress(t, rise > 0)
      }
      tmpTarget.lerpVectors(anim.fromTarget, anim.toTarget, p)
      camera.lookAt(tmpTarget)
      controls.target.copy(tmpTarget)
      if (elapsed >= anim.duration) {
        controls.enabled = !focusRef.current
        phaseRef.current = focusRef.current ? 'focus' : 'idle'
      }
    } else if (phaseRef.current === 'focus') {
      const anim = zoomAnim.current
      aimAt(focusRef.current, state, anim)
      camera.position.copy(anim.toPos)
      camera.lookAt(anim.toTarget)
      controls.target.copy(anim.toTarget)
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
    // Nor a ceiling or a lowest angle: those are the visitor's, round the
    // book. A focus is looked at level, past maxPolarAngle, and from a phone
    // held upright the portrait is framed from 4 m off, past maxDistance —
    // update() would lift the lens and pull it in.
    controls.maxDistance = idle ? ORBIT_LIMITS.maxDistance : Infinity
    controls.maxPolarAngle = idle ? ORBIT_LIMITS.maxPolarAngle : Math.PI
    controls.update()
  })

  return null
}
