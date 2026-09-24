import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { addBlinkMorph } from '../geometry/blinkMorph'
import { blink } from '../domain/blink'

// The eyes blinking, on their own clock: through the gestures too, as
// nothing a figure does stops it blinking.
export function useBlink(scene) {
  const eyes = useMemo(() => {
    let mesh
    scene.traverse((o) => {
      if (o.isSkinnedMesh) mesh = o
    })
    return { mesh, index: addBlinkMorph(mesh) }
  }, [scene])

  useFrame(({ clock }) => {
    eyes.mesh.morphTargetInfluences[eyes.index] = blink(clock.elapsedTime)
  })
}
