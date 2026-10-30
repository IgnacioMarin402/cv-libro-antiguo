import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ARRIVED } from '../domain/bust'

// Whether the lens stands square in front of him: in front of the framing,
// on the line out of its middle, and looking straight down it — the
// portrait's test (see features/portrait's useLensSquare), on his framing.
function standsSquare(root, camera, { eye, look, facing, turn }) {
  const [cx, cy, cz] = ARRIVED.center
  root.worldToLocal(eye.copy(camera.position))
  if (eye.z <= cz) return false
  if (Math.hypot(eye.x - cx, eye.y - cy) > ARRIVED.offset) return false
  camera.getWorldDirection(look)
  facing.set(0, 0, 1).applyQuaternion(root.getWorldQuaternion(turn))
  return -look.dot(facing) > Math.cos(ARRIVED.angle)
}

// When, in this visit to him, the lens first stood square in front of him
// (the clock's seconds), or null while it hasn't yet: that's when the
// visitor has arrived, and the cookie and the way back show. Clears when
// the visitor leaves (`focused` false). `root` is the bust's own group.
export function useLensArrived(focused, root) {
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
