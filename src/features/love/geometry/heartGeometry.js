import * as THREE from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { heartCurve, HEART_WIDTH, RIM_WIDTH, EMBER_SCALE, EMBER_DEPTH, EMBER_BEVEL } from '../domain/heart'

// The heart's three pieces, standing up in XY and facing +z, all centred on
// the same middle: the hairline, the ember inside it, and the flat shape
// the pointer hits.

function heartShape(width) {
  const { start, segments } = heartCurve(width)
  const shape = new THREE.Shape()
  shape.moveTo(...start)
  for (const [c1, c2, end] of segments) shape.bezierCurveTo(...c1, ...c2, ...end)
  return shape
}

// The gold hairline: a thin tube run once round the whole curve.
export function createRimGeometry() {
  const { start, segments } = heartCurve(HEART_WIDTH)
  const path = new THREE.CurvePath()
  let from = start
  for (const [c1, c2, end] of segments) {
    path.add(new THREE.CubicBezierCurve3(...[from, c1, c2, end].map(([x, y]) => new THREE.Vector3(x, y, 0))))
    from = end
  }
  return new THREE.TubeGeometry(path, 240, RIM_WIDTH / 2, 6, true)
}

// The ember: the curve at EMBER_SCALE, extruded into a thin plate with its
// edges rounded. The bevel grows the outline outward by its own size, so
// the curve is cut that much narrower for the plate to come out the
// ember's width.
//
// ExtrudeGeometry comes unindexed, one normal per triangle; welded, its
// rounded edge is one surface. Its own UVs are the shape's raw coordinates
// on the faces and something else down the sides; the gradient is laid on
// flat instead, front to back, across the plate's box — so the edge takes
// the gradient's outer colour from every side, as the counter's does.
export function createEmberGeometry() {
  const extruded = new THREE.ExtrudeGeometry(heartShape(HEART_WIDTH * EMBER_SCALE - 2 * EMBER_BEVEL), {
    depth: EMBER_DEPTH,
    bevelEnabled: true,
    bevelThickness: EMBER_BEVEL,
    bevelSize: EMBER_BEVEL,
    bevelSegments: 3,
    curveSegments: 16,
  })
  extruded.deleteAttribute('normal')
  extruded.deleteAttribute('uv')
  extruded.clearGroups()
  const geometry = mergeVertices(extruded)
  extruded.dispose()
  geometry.computeVertexNormals()
  geometry.center()

  geometry.computeBoundingBox()
  const { min, max } = geometry.boundingBox
  const position = geometry.attributes.position
  const uv = new Float32Array(position.count * 2)
  for (let i = 0; i < position.count; i++) {
    uv[i * 2] = (position.getX(i) - min.x) / (max.x - min.x)
    uv[i * 2 + 1] = (position.getY(i) - min.y) / (max.y - min.y)
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  return geometry
}

// What the pointer hits: the whole heart, hairline to hairline, flat. The
// dark gap between the hairline and the ember is part of the heart, and a
// click there has to count as much as one on the ember.
export function createHitGeometry() {
  return new THREE.ShapeGeometry(heartShape(HEART_WIDTH), 16)
}
