import * as THREE from 'three'
import { FADE_END, FLOOR_TILE_SIZE, floorShade } from '../domain/floor'

// A flat disc out to where the floor has faded to black, lying in the XZ
// plane. The fade rides on vertex colours, so the disc is cut into rings
// fine enough (25 cm) that the linear blend between them reads as the curve.
// UVs are in tiles, measured in metres, so the image repeats at its real size.
export function buildFloorGeometry() {
  const geometry = new THREE.RingGeometry(0, FADE_END, 96, 24)
  geometry.rotateX(-Math.PI / 2)

  const pos = geometry.attributes.position
  const uv = geometry.attributes.uv
  const colors = new Float32Array(pos.count * 3)
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    uv.setXY(i, x / FLOOR_TILE_SIZE, -z / FLOOR_TILE_SIZE)
    const shade = floorShade(Math.hypot(x, z))
    colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = shade
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  return geometry
}
