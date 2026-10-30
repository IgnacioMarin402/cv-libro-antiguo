import * as THREE from 'three'
import { latheFromProfile } from '@/shared/three/latheProfile'
import { BEER_RADIUS, FOAM_PROFILE, FOAM_LUMPS } from '../domain/beer'

// The beer's surface: a flat disc, facing up, centred on the tankard's axis
// (the hook sets it there and at its level).
export function createBeerGeometry() {
  return new THREE.CircleGeometry(BEER_RADIUS, 48).rotateX(-Math.PI / 2)
}

// A fixed lumpy field, the same on every run: three sine waves at angles
// to each other, made small and uneven by multiplying them.
const lumps = (x, y, z) =>
  Math.sin(x * 61 + y * 17) * Math.sin(z * 53 - x * 29) * Math.sin(y * 71 + z * 37)

// The head: lathed from its silhouette (see domain/beer), its base on the
// beer at y = 0, and every vertex pushed out or in along its normal by the
// lumps, so its surface is froth. The rim of the lathe's seam is welded
// first, or the lumps would tear it open down one side.
export function createFoamGeometry() {
  const lathe = latheFromProfile(FOAM_PROFILE, 64)
  lathe.deleteAttribute('uv')
  const geometry = mergeSeam(lathe)
  geometry.computeVertexNormals()
  const position = geometry.attributes.position
  const normal = geometry.attributes.normal
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i)
    const y = position.getY(i)
    const z = position.getZ(i)
    const d = FOAM_LUMPS * lumps(x, y, z)
    position.setXYZ(i, x + normal.getX(i) * d, y + normal.getY(i) * d, z + normal.getZ(i) * d)
  }
  geometry.computeVertexNormals()
  // Laid on flat from above, for the bubbles' bump map.
  const uv = new Float32Array(position.count * 2)
  const span = 2 * BEER_RADIUS * 1.2
  for (let i = 0; i < position.count; i++) {
    uv[i * 2] = 0.5 + position.getX(i) / span
    uv[i * 2 + 1] = 0.5 + position.getZ(i) / span
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  return geometry
}

// Welds the lathe's first and last columns, which sit on each other.
function mergeSeam(geometry) {
  const position = geometry.attributes.position
  const key = (i) => `${position.getX(i).toFixed(5)},${position.getY(i).toFixed(5)},${position.getZ(i).toFixed(5)}`
  const first = new Map()
  const remap = new Uint32Array(position.count)
  for (let i = 0; i < position.count; i++) {
    const k = key(i)
    if (!first.has(k)) first.set(k, i)
    remap[i] = first.get(k)
  }
  const index = geometry.index
  for (let i = 0; i < index.count; i++) index.setX(i, remap[index.getX(i)])
  return geometry
}
