import { useFrame } from '@react-three/fiber'
import { updateSpineSkin } from '../geometry/spineGeometry'

// Re-lays the spine's leather over the two boards every frame. It has to be
// every frame and not on a state change: the boards curl continuously
// through a turn and drift to different angles (the front one swings the
// moment the book opens, the back one only as the block empties), and a
// strip built once for one pose reads as a separate piece wedged into the
// fold as soon as they move apart.
//
// The book mounts it after the leaves so that, per-frame hooks running in
// mount order, the bones it reads are the ones this frame has already
// posed rather than the previous frame's.
export function useSpineSkin(geometry, spineRef, frontRef, backRef) {
  useFrame(() => {
    const mesh = spineRef.current
    if (!mesh) return
    mesh.visible = updateSpineSkin(geometry, frontRef.current, backRef.current, mesh.parent)
  })
}
