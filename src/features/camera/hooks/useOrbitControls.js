import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ORBIT_LIMITS } from '../domain/shots'

// The visitor's own orbit control, created disabled: the rig hands it over
// only between its own moves (see CameraRig's phases) so a scripted dolly
// and a drag never fight over the camera.
export function useOrbitControls(initialTarget) {
  const { camera, gl } = useThree()
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

    return () => {
      controls.dispose()
      controlsRef.current = null
    }
  }, [camera, gl, initialTarget])

  return controlsRef
}
