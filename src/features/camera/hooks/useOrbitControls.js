import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ORBIT_LIMITS } from '../domain/shots'

// How far (px) a pressed pointer travels before it's a drag, not a click.
const DRAG_THRESHOLD_PX = 4

// The visitor's own orbit control, created disabled: the rig hands it over
// only between its own moves (see CameraRig's phases) so a scripted dolly
// and a drag never fight over the camera.
//
// While the visitor drags the room round, nothing in it is hovered, so
// R3F's hit-testing is off: it would raycast every hover target on every
// pointer move, and the book's ten leaves are skinned — a raycast skins
// each vertex it tests. Measured: 3.7 ms per move, 2.8 of them the
// leaves, against 1.9 ms for the whole of the rest of the frame. It goes
// off only once the pointer has moved, because R3F clicks only what the
// pointerdown hit; and it comes back on the pointerup, which reaches this
// canvas listener before R3F's, on the canvas's parent.
export function useOrbitControls(initialTarget) {
  const { camera, gl } = useThree()
  const setEvents = useThree((state) => state.setEvents)
  const controlsRef = useRef(null)

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement)
    controls.enabled = false
    controls.enableDamping = true
    controls.dampingFactor = ORBIT_LIMITS.dampingFactor
    controls.target.copy(initialTarget)
    controls.minDistance = ORBIT_LIMITS.minDistance
    controls.maxDistance = ORBIT_LIMITS.maxDistance
    controls.minPolarAngle = ORBIT_LIMITS.minPolarAngle
    controls.maxPolarAngle = ORBIT_LIMITS.maxPolarAngle
    controls.enablePan = false
    controlsRef.current = controls

    const canvas = gl.domElement
    let down = null
    let dragging = false
    const onDown = (e) => {
      down = [e.clientX, e.clientY]
    }
    const onMove = (e) => {
      if (!down || dragging || !controls.enabled) return
      if (Math.hypot(e.clientX - down[0], e.clientY - down[1]) < DRAG_THRESHOLD_PX) return
      dragging = true
      setEvents({ enabled: false })
    }
    const onUp = () => {
      down = null
      if (!dragging) return
      dragging = false
      setEvents({ enabled: true })
    }
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onUp)

    return () => {
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
      if (dragging) setEvents({ enabled: true })
      controls.dispose()
      controlsRef.current = null
    }
  }, [camera, gl, initialTarget, setEvents])

  return controlsRef
}
