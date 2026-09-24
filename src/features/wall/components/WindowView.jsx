import { useMemo } from 'react'
import * as THREE from 'three'
import { useLoader, useThree } from '@react-three/fiber'
import {
  BACKDROP_DEPTH,
  BACKDROP_HALF_WIDTH,
  BACKDROP_HEIGHT,
  VIEW_FOV,
  VIEW_PITCH,
} from '../domain/view'
import { viewFragmentShader, viewVertexShader } from '../shaders/viewShader'

// Loaded from a file, asked for like the panelling.
const TEXTURE_URL = '/textures/wall/night-sky.webp'

// The night outside, on a panel behind the window's hole. Unlit and left
// out of the tone mapping: it's a photograph, and it should read as the one
// that was given — the candle doesn't reach it, nor the room's haze. Past
// the photo's edge it runs on mirrored (see domain/view).
export default function WindowView({ position, rotationY }) {
  const map = useLoader(THREE.TextureLoader, TEXTURE_URL)
  const gl = useThree((state) => state.gl)

  const material = useMemo(() => {
    const photo = map.clone()
    photo.colorSpace = THREE.SRGBColorSpace
    photo.wrapS = photo.wrapT = THREE.MirroredRepeatWrapping
    photo.anisotropy = gl.capabilities.getMaxAnisotropy()
    photo.needsUpdate = true
    return new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: photo },
        uTanHalfFov: { value: Math.tan((VIEW_FOV * Math.PI) / 360) },
        uPitch: { value: (VIEW_PITCH * Math.PI) / 180 },
      },
      vertexShader: viewVertexShader,
      fragmentShader: viewFragmentShader,
      toneMapped: false,
    })
  }, [map, gl])

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, BACKDROP_HEIGHT / 2, -BACKDROP_DEPTH]} material={material}>
        <planeGeometry args={[BACKDROP_HALF_WIDTH * 2, BACKDROP_HEIGHT]} />
      </mesh>
    </group>
  )
}
