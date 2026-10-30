import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FRAMING, LOOK_DOWN, ARRIVED_OFFSET, ARRIVED_ANGLE } from '../domain/beer'

// When, in this visit to it, the lens first stood where the camera frames
// the tankard (the clock's seconds), or null while it hasn't yet: on the
// line out of the framing's middle, looking down it — the portrait's and
// the bust's test, along a line that comes down at LOOK_DOWN. Clears when
// the visitor leaves (`focused` false). `root` is the tankard's own group,
// in the model's units; `scale` is how many metres one of them is.
export function useLensArrived(focused, root, scale) {
  const since = useRef(null)
  const scratch = useMemo(
    () => ({
      eye: new THREE.Vector3(),
      look: new THREE.Vector3(),
      line: new THREE.Vector3(0, Math.sin(LOOK_DOWN), Math.cos(LOOK_DOWN)),
      center: new THREE.Vector3(...FRAMING.center),
      facing: new THREE.Vector3(),
      turn: new THREE.Quaternion(),
    }),
    []
  )

  useFrame((state) => {
    if (!focused) {
      since.current = null
      return
    }
    if (since.current !== null || !root.current) return
    const { eye, look, line, center, facing, turn } = scratch
    root.current.worldToLocal(eye.copy(state.camera.position)).sub(center)
    const along = eye.dot(line)
    if (along <= 0) return
    if (eye.addScaledVector(line, -along).length() > ARRIVED_OFFSET / scale) return
    state.camera.getWorldDirection(look)
    facing.copy(line).applyQuaternion(root.current.getWorldQuaternion(turn))
    if (-look.dot(facing) > Math.cos(ARRIVED_ANGLE)) since.current = state.clock.elapsedTime
  })

  return since
}
