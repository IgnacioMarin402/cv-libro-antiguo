import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as THREE from 'three'
import { BOOK, topSurfaceY } from '../utils/constants'

const startPos = new THREE.Vector3(0.15, 1.9, 2.5)
const startTarget = new THREE.Vector3(0, 0.3, 0)
const finalPos = new THREE.Vector3(0.35, 0.62, 0.95)
const INTRO_DURATION = 2000
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

// Orbits the book once idle, but opens on a slow dolly-in from a wide shot.
export default function CameraRig() {
  const { camera, gl } = useThree()
  const controlsRef = useRef(null)
  const introStart = useRef(performance.now())
  const tmpTarget = useMemo(() => new THREE.Vector3(), [])
  const finalTarget = useMemo(() => new THREE.Vector3(0, topSurfaceY, -BOOK.coverH * 0.05), [])

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement)
    controls.enabled = false
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.target.copy(finalTarget)
    controls.minDistance = 0.55
    controls.maxDistance = 2.4
    controls.minPolarAngle = 0.35
    controls.maxPolarAngle = 1.45
    controls.enablePan = false
    controlsRef.current = controls

    return () => {
      controls.dispose()
      controlsRef.current = null
    }
  }, [camera, gl, finalTarget])

  useFrame(() => {
    const controls = controlsRef.current
    if (!controls) return

    const elapsed = performance.now() - introStart.current
    if (elapsed < INTRO_DURATION) {
      const p = easeInOutCubic(Math.min(1, elapsed / INTRO_DURATION))
      camera.position.lerpVectors(startPos, finalPos, p)
      tmpTarget.lerpVectors(startTarget, finalTarget, p)
      camera.lookAt(tmpTarget)
      controls.target.copy(tmpTarget)
    } else if (!controls.enabled) {
      controls.enabled = true
      camera.position.copy(finalPos)
      controls.target.copy(finalTarget)
    }
    controls.update()
  })

  return null
}
