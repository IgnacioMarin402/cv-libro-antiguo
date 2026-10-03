import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FRAME } from '../domain/portrait'
import { SQUARE_OFFSET, SQUARE_ANGLE, FRAME_MIDDLE_Y } from '../domain/names'

// Whether the lens stands square in front of the painting: in front of the
// frame, on the line out of its middle, and looking straight down it.
function standsSquare(root, camera, { eye, look, facing, turn }) {
  root.worldToLocal(eye.copy(camera.position))
  if (eye.z <= FRAME.front) return false
  if (Math.hypot(eye.x, eye.y - FRAME_MIDDLE_Y) > SQUARE_OFFSET) return false
  camera.getWorldDirection(look)
  facing.set(0, 0, 1).applyQuaternion(root.getWorldQuaternion(turn))
  return -look.dot(facing) > Math.cos(SQUARE_ANGLE)
}

// When, in this visit, the lens first stood square in front of the painting
// (the clock's seconds), or null while it hasn't yet — which is when the
// visitor has arrived: the names start writing then, and the way back
// appears beside the frame. Once set it holds for the rest of the visit,
// and clears when the visitor leaves (`focused` false).
//
// `root` is the portrait's own group, in the frame model's units.
export function useLensSquare(focused, root) {
  const since = useRef(null)
  const scratch = useMemo(
    () => ({ eye: new THREE.Vector3(), look: new THREE.Vector3(), facing: new THREE.Vector3(), turn: new THREE.Quaternion() }),
    []
  )

  useFrame((state) => {
    if (!focused) {
      since.current = null
      return
    }
    if (since.current === null && root.current && standsSquare(root.current, state.camera, scratch)) {
      since.current = state.clock.elapsedTime
    }
  })

  return since
}
