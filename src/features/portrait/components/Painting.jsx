import { useMemo } from 'react'
import * as THREE from 'three'
import { useLoader, useThree } from '@react-three/fiber'
import { CANVAS, canvasImageWindow } from '../domain/portrait'

// Loaded from a file: the painting as it was given, frame and all — only
// the part inside its painted frame shows (see domain/portrait).
const IMAGE_URL = '/textures/portrait/dog-portrait.webp'

const { z, halfWidth, bottom, top } = CANVAS

// The painting on its canvas, in the frame model's units. Lit like the
// rest of the room, not like the window's photograph: it hangs in it. It
// takes the frame's shadow from the candle and casts none, lying inside
// it. Single-sided, so the candle's unbiased shadow doesn't stripe it.
export default function Painting() {
  const image = useLoader(THREE.TextureLoader, IMAGE_URL)
  const gl = useThree((state) => state.gl)

  const material = useMemo(() => {
    const { offset, repeat } = canvasImageWindow()
    const map = image.clone()
    map.colorSpace = THREE.SRGBColorSpace
    map.offset.set(...offset)
    map.repeat.set(...repeat)
    map.anisotropy = gl.capabilities.getMaxAnisotropy()
    map.needsUpdate = true
    return new THREE.MeshStandardMaterial({ map, roughness: 0.75, metalness: 0 })
  }, [image, gl])

  return (
    <mesh position={[0, (bottom + top) / 2, z]} material={material} receiveShadow>
      <planeGeometry args={[halfWidth * 2, top - bottom]} />
    </mesh>
  )
}
