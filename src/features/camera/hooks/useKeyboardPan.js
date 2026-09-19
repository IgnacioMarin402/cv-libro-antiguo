import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { smoothDamp } from '@/shared/math/easing'
import { PAN_KEYS, PAN_SMOOTH_TIME, clampAim, panSpeed } from '../domain/keyboardPan'

// WASD while the book is open: slides the aim point across the table and
// the camera with it, so the frame travels and the angle never changes.
//
// It keeps no useFrame of its own. It hands the rig a step to call inside
// the one the rig already runs, which is what guarantees the pan lands
// after any scripted move and before controls.update() reads the result.
export function useKeyboardPan() {
  const { camera } = useThree()
  const pressed = useRef(new Set())
  const speed = useRef({ right: 0, forward: 0 })
  const accel = useRef({ right: { value: 0 }, forward: { value: 0 } })
  const vectors = useMemo(
    () => ({ right: new THREE.Vector3(), forward: new THREE.Vector3(), step: new THREE.Vector3() }),
    []
  )

  useEffect(() => {
    const down = (e) => {
      if (PAN_KEYS[e.code]) pressed.current.add(e.code)
    }
    const up = (e) => pressed.current.delete(e.code)
    // A key held while the window loses focus never sends its keyup, and
    // the frame would keep sliding on its own for good.
    const clear = () => pressed.current.clear()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', clear)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', clear)
    }
  }, [])

  return useCallback(
    (controls, delta, enabled) => {
      const velocity = speed.current
      // A scripted move owns the camera outright: no coasting into it.
      if (!enabled) {
        velocity.right = velocity.forward = 0
        accel.current.right.value = accel.current.forward.value = 0
        return
      }

      let right = 0
      let forward = 0
      for (const code of pressed.current) {
        const [r, f] = PAN_KEYS[code]
        right += r
        forward += f
      }
      // Normalized, so a diagonal doesn't travel faster than a straight
      // one, and so two opposite keys cancel instead of fighting.
      const length = Math.hypot(right, forward)
      if (length > 1) {
        right /= length
        forward /= length
      }

      const top = panSpeed(camera.position.distanceTo(controls.target), camera.fov)
      velocity.right = smoothDamp(velocity.right, right * top, accel.current.right, PAN_SMOOTH_TIME, delta)
      velocity.forward = smoothDamp(velocity.forward, forward * top, accel.current.forward, PAN_SMOOTH_TIME, delta)
      if (velocity.right === 0 && velocity.forward === 0) return

      // The camera's own ground plane: its right axis, and the horizontal
      // direction pointing away from it. Panning along the table rather
      // than along the screen is what keeps a book that LIES on one in its
      // plane — and it stays defined looking straight down, where a
      // screen-space pan would drift the camera off the table.
      vectors.right.setFromMatrixColumn(camera.matrixWorld, 0).setY(0).normalize()
      vectors.forward.crossVectors(camera.up, vectors.right).normalize()
      vectors.step
        .copy(vectors.right)
        .multiplyScalar(velocity.right * delta)
        .addScaledVector(vectors.forward, velocity.forward * delta)

      const [x, z] = clampAim(controls.target.x + vectors.step.x, controls.target.z + vectors.step.z)
      // Both by the same delta is what makes this a pan: OrbitControls
      // rebuilds the camera as target + offset, so moving the target alone
      // would swing the angle instead of sliding the frame.
      vectors.step.set(x - controls.target.x, 0, z - controls.target.z)
      controls.target.add(vectors.step)
      camera.position.add(vectors.step)
    },
    [camera, vectors]
  )
}
