import { Suspense, useMemo } from 'react'
import * as THREE from 'three'
import { useLoader, useThree } from '@react-three/fiber'
import { buildWallGeometry } from './geometry/wallGeometry'
import { buildWallCanvas } from './textures/wallCanvas'
import { BUMP_SCALE, WALL_SIDES } from './domain/wall'
import {
  OPENING_BREAKS,
  WINDOW_CENTER_X,
  WINDOW_WALL,
  openingHalfWidth,
  windowPlacement,
} from './domain/window'
import GothicWindow from './components/GothicWindow'

// Loaded from a file, asked for like the floor: only the colour map. The
// relief is taken from that same image, read as height.
const TEXTURE_URL = '/textures/wall/gothic-panelling.webp'

// Faces in only: the camera never leaves the room, and single-sided keeps
// the candle's unbiased shadow from striping the back of a DoubleSide face.
// Receives the table's shadow; casts none, there's nothing behind it.
function WallMeshes() {
  const source = useLoader(THREE.TextureLoader, TEXTURE_URL)
  const gl = useThree((state) => state.gl)

  // The window's wall is cut around it; the other three are whole.
  const plain = useMemo(() => buildWallGeometry(), [])
  const pierced = useMemo(
    () => buildWallGeometry({ centerX: WINDOW_CENTER_X, halfWidth: openingHalfWidth, breaks: OPENING_BREAKS }),
    [],
  )
  const material = useMemo(() => {
    const canvas = buildWallCanvas(source.image)
    const anisotropy = gl.capabilities.getMaxAnisotropy()
    const color = new THREE.CanvasTexture(canvas)
    color.colorSpace = THREE.SRGBColorSpace
    const bump = new THREE.CanvasTexture(canvas)
    bump.colorSpace = THREE.NoColorSpace
    for (const tex of [color, bump]) {
      tex.wrapS = THREE.RepeatWrapping
      tex.wrapT = THREE.ClampToEdgeWrapping
      tex.anisotropy = anisotropy
    }
    return new THREE.MeshStandardMaterial({
      map: color,
      bumpMap: bump,
      bumpScale: BUMP_SCALE,
      vertexColors: true,
      roughness: 0.85,
      metalness: 0,
    })
  }, [source, gl])

  return WALL_SIDES.map(({ position, rotationY }, i) => (
    <mesh
      key={i}
      geometry={i === WINDOW_WALL ? pierced : plain}
      material={material}
      position={position}
      rotation={[0, rotationY, 0]}
      receiveShadow
    />
  ))
}

export default function Wall({ position }) {
  return (
    <group position={position}>
      <Suspense fallback={null}>
        <WallMeshes />
      </Suspense>
      {/* Its own Suspense: the model is the heavier file, and the walls
          shouldn't wait on it. */}
      <Suspense fallback={null}>
        <GothicWindow {...windowPlacement(WALL_SIDES[WINDOW_WALL])} />
      </Suspense>
    </group>
  )
}
