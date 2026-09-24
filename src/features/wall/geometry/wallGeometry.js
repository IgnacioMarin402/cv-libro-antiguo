import * as THREE from 'three'
import {
  CORNER_U,
  REPEAT_LENGTH,
  WALL_HALF_SPAN,
  WALL_HEIGHT,
  wallShade,
} from '../domain/wall'

// One wall: an upright panel standing on y = 0, facing +z. The fade rides on
// vertex colours and only changes with height, so it's cut into 25 cm rows
// and not at all across. U is in repeats, measured in metres, so the
// panelling repeats at its real size; V spans the image once.
//
// With an opening ({ centerX, halfWidth(y), breaks }), each row is two
// strips either side of it instead of one, their inner edges set by the
// opening's width at the row's own top and bottom — so the hole is traced
// by the rows themselves, and `breaks` adds rows where its edge bends.
export function buildWallGeometry(opening = null) {
  const heights = new Set()
  const rows = Math.ceil(WALL_HEIGHT / 0.25)
  for (let r = 0; r <= rows; r++) heights.add((r / rows) * WALL_HEIGHT)
  if (opening) for (const y of opening.breaks) if (y > 0 && y < WALL_HEIGHT) heights.add(y)
  const ys = [...heights].sort((a, b) => a - b)

  const positions = []
  const uvs = []
  const colors = []
  const indices = []
  const vertex = (x, y) => {
    positions.push(x, y, 0)
    uvs.push((x + WALL_HALF_SPAN) / REPEAT_LENGTH + CORNER_U, y / WALL_HEIGHT)
    const shade = wallShade(y)
    colors.push(shade, shade, shade)
    return positions.length / 3 - 1
  }
  // A strip between two heights, its left and right edges given at each.
  const strip = (y0, y1, left0, right0, left1, right1) => {
    const a = vertex(left0, y0)
    const b = vertex(right0, y0)
    const c = vertex(right1, y1)
    const d = vertex(left1, y1)
    indices.push(a, b, c, a, c, d)
  }

  for (let i = 1; i < ys.length; i++) {
    const y0 = ys[i - 1]
    const y1 = ys[i]
    const h0 = opening ? opening.halfWidth(y0) : 0
    const h1 = opening ? opening.halfWidth(y1) : 0
    if (h0 === 0 && h1 === 0) {
      strip(y0, y1, -WALL_HALF_SPAN, WALL_HALF_SPAN, -WALL_HALF_SPAN, WALL_HALF_SPAN)
      continue
    }
    const cx = opening.centerX
    strip(y0, y1, -WALL_HALF_SPAN, cx - h0, -WALL_HALF_SPAN, cx - h1)
    strip(y0, y1, cx + h0, WALL_HALF_SPAN, cx + h1, WALL_HALF_SPAN)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}
