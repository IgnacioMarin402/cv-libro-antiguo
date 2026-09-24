import * as THREE from 'three'
import { FADE_END, FLOOR_TILE_SIZE, floorDistance, floorShade } from '../domain/floor'

// A flat square out to where the floor has faded to black, lying in the XZ
// plane. The fade rides on vertex colours, so the square is cut into a grid
// fine enough (25 cm) that the linear blend between vertices reads as the
// curve. UVs are in tiles, measured in metres, so the image repeats at its
// real size.
export function buildFloorGeometry() {
  const side = FADE_END * 2
  const segments = Math.round(side / 0.25)
  const geometry = new THREE.PlaneGeometry(side, side, segments, segments)
  geometry.rotateX(-Math.PI / 2)

  const pos = geometry.attributes.position
  const uv = geometry.attributes.uv
  const colors = new Float32Array(pos.count * 3)
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    uv.setXY(i, x / FLOOR_TILE_SIZE, -z / FLOOR_TILE_SIZE)
    const shade = floorShade(floorDistance(x, z))
    colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = shade
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  return geometry
}
