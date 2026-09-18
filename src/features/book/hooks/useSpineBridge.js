import { useFrame } from '@react-three/fiber'
import { updateSpineBridge } from '../geometry/spineGeometry'

// Keeps the spine bridge flush with both covers every frame, however far
// their angles have drifted apart (see geometry/spineGeometry). The covers
// hinge inside the spine's own tilting group with the group's live lean
// already subtracted out (see Cover, useHingeRotation's parentAngleRef) —
// the bridge is built in that same local frame, so it needs that lean
// backed out of the raw angle refs here too, the same way.
export function useSpineBridge(geometry, frontAngleRef, backAngleRef, spineAngleRef) {
  useFrame(() => {
    const parent = spineAngleRef.current
    updateSpineBridge(geometry, backAngleRef.current - parent, frontAngleRef.current - parent)
  })
}
