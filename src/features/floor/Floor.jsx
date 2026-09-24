import { Suspense, useMemo } from 'react'
import * as THREE from 'three'
import { useLoader, useThree } from '@react-three/fiber'
import { buildFloorGeometry } from './geometry/floorGeometry'
import { BUMP_SCALE } from './domain/floor'

// Loaded from a file, asked for like the table: only the colour map. The
// relief is taken from that same image, read as height.
const TEXTURE_URL = '/textures/floor/wood-floor.webp'

// Receives the shadows of the table and all it holds; casts none, there's
// nothing under it.
function FloorMesh() {
  const map = useLoader(THREE.TextureLoader, TEXTURE_URL)
  const gl = useThree((state) => state.gl)

  const geometry = useMemo(() => buildFloorGeometry(), [])
  const material = useMemo(() => {
    // Seen at a grazing angle from most of the orbit, so it takes the most
    // anisotropic filtering the GPU has, or the far planks smear.
    const anisotropy = gl.capabilities.getMaxAnisotropy()
    const color = map.clone()
    color.colorSpace = THREE.SRGBColorSpace
    const bump = map.clone()
    bump.colorSpace = THREE.NoColorSpace
    for (const tex of [color, bump]) {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping
      tex.anisotropy = anisotropy
      tex.needsUpdate = true
    }
    return new THREE.MeshStandardMaterial({
      map: color,
      bumpMap: bump,
      bumpScale: BUMP_SCALE,
      vertexColors: true,
      roughness: 0.9,
      metalness: 0,
    })
  }, [map, gl])

  return <mesh geometry={geometry} material={material} receiveShadow />
}

export default function Floor({ position }) {
  return (
    <group position={position}>
      <Suspense fallback={null}>
        <FloorMesh />
      </Suspense>
    </group>
  )
}
