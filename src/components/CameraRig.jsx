import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as THREE from 'three'
import { BOOK, topSurfaceY } from '../utils/constants'

const startPos = new THREE.Vector3(0.15, 1.9, 2.5)
const startTarget = new THREE.Vector3(0, 0.3, 0)
const restPos = new THREE.Vector3(0.35, 0.62, 0.95)
const openPos = new THREE.Vector3(0.05, 0.78, 1.05)
const INTRO_DURATION = 2000
const OPEN_ZOOM_DURATION = 1700
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

// Orbits the book once idle. Opens on a slow dolly-in from a wide shot, then
// dollies to a closer, frontal framing whenever the book is opened, and back
// out again when it's closed.
export default function CameraRig({ open = false }) {
  const { camera, gl } = useThree()
  const controlsRef = useRef(null)
  const introStart = useRef(performance.now())
  const tmpTarget = useMemo(() => new THREE.Vector3(), [])
  const restTarget = useMemo(() => new THREE.Vector3(0, topSurfaceY, -BOOK.coverH * 0.05), [])
  const openTarget = useMemo(() => new THREE.Vector3(-BOOK.coverW * 0.45, topSurfaceY + 0.05, 0.03), [])

  // phase: 'intro' (fixed dolly-in) -> 'idle' (user-orbitable) -> 'zoom'
  // (dolly to the open- or closed-book framing, triggered by `open`
  // flipping either way) -> 'idle' again.
  const phaseRef = useRef('intro')
  const requestedOpen = useRef(null)
  const zoomAnim = useRef(null)
  const wasOpenRef = useRef(open)

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement)
    controls.enabled = false
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.target.copy(restTarget)
    controls.minDistance = 0.35
    controls.maxDistance = 2.4
    controls.minPolarAngle = 0.25
    controls.maxPolarAngle = 1.45
    controls.enablePan = false
    controlsRef.current = controls

    return () => {
      controls.dispose()
      controlsRef.current = null
    }
  }, [camera, gl, restTarget])

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
      camera.position.lerpVectors(startPos, restPos, p)
      tmpTarget.lerpVectors(startTarget, restTarget, p)
      camera.lookAt(tmpTarget)
      controls.target.copy(tmpTarget)
      if (elapsed >= INTRO_DURATION) {
        controls.enabled = true
        phaseRef.current = 'idle'
      }
    } else if (requestedOpen.current !== null) {
      const toOpen = requestedOpen.current
      requestedOpen.current = null
      zoomAnim.current = {
        fromPos: camera.position.clone(),
        fromTarget: controls.target.clone(),
        toPos: toOpen ? openPos : restPos,
        toTarget: toOpen ? openTarget : restTarget,
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
