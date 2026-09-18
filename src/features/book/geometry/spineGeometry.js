import * as THREE from 'three'
import { BOOK, SPINE_RADIUS, SPINE_BULGE } from '../domain/binding'

// A half-ellipse cross-section extruded along Z, flat side at local X = 0
// bulging toward -X — the shape behind the spine. `bulge` scales how far it
// sticks out sideways independently of its height (2 * radius, pinned to
// the book's full thickness so it still caps the spine edge to edge). Also
// what visually hides the hinge-side edge of each cover (and each page's
// own permanent wrap toward the spine, see pageSpineBend) from view —
// without it, that raw edge is exposed at an angle where it can clip
// through the cover it's meant to tuck behind.
function halfCylinderGeo(radius, depth, segs = 20, bulge = 1) {
  const shape = new THREE.Shape()
  shape.moveTo(0, 2 * radius)
  for (let i = 1; i <= segs; i++) {
    const t = i / segs
    const angle = Math.PI / 2 + Math.PI * t
    shape.lineTo(radius * bulge * Math.cos(angle), radius + radius * Math.sin(angle))
  }
  shape.lineTo(0, 2 * radius)
  shape.closePath()
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 1 })
  geo.translate(0, 0, -depth / 2)
  return geo
}

// This book's rounded spine cap: as tall as the block is thick, as long as
// its covers, bulging only gently (see SPINE_BULGE).
export function createSpineGeometry() {
  return halfCylinderGeo(SPINE_RADIUS, BOOK.coverH, 20, SPINE_BULGE)
}
