import * as THREE from 'three'
import { BOOK, SPINE_DEPTH, FRONT_COVER_HINGE_Y, BACK_COVER_HINGE_Y, HINGE_X } from '../domain/binding'

// The spine as a flexible strip bridging the two covers, not a rigid cap:
// a cover swings independently of the other (the front one jumps to its
// full angle the instant the book opens, while the back one only catches
// up as pages are read — see domain/opening), so any *fixed* cross-section
// eventually reads as a separate piece glued on, wedged open between
// whichever board has swung furthest and whichever hasn't. A strip that
// keeps re-shaping itself every frame to stay flush with both, however far
// apart they've drifted, is what keeps it looking like one continuous
// object instead (see updateSpineBridge for the actual bend).

// Height samples the bridge is built from, along the axis running from the
// back cover's hinge to the front cover's — needs enough of them to read
// as a smooth curve at the widest swing (book just opened, front cover
// already at its resting angle, back cover still lying flat).
const BRIDGE_SEGS = 24

// Shared topology: a plain quad strip, (BRIDGE_SEGS + 1) rows by 2 columns
// (one at each end of the book's length, Z). No thickness of its own —
// see useBookMaterials' spineMat, rendered DoubleSide so a zero-volume
// sheet still reads solid from inside the open book — only the row
// positions change frame to frame (updateSpineBridge), the index buffer
// never does.
export function createSpineGeometry() {
  const rows = BRIDGE_SEGS + 1
  const positions = new Float32Array(rows * 2 * 3)
  const indices = []
  for (let j = 0; j < BRIDGE_SEGS; j++) {
    const a = j * 2, b = a + 1, c = a + 2, d = a + 3
    indices.push(a, c, b, b, c, d)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setIndex(indices)
  updateSpineBridge(geo, 0, 0)
  return geo
}

// Re-shapes the bridge for the covers' current angles (already relative to
// the spine's own tilt — see hooks/useSpineBridge). At v = 0 (the bottom,
// where the back cover hinges) the strip's edge sits exactly where that
// board's own plane would land if extended straight through the fold —
// i.e. it continues the board's surface rather than meeting it edge-on —
// and at v = 1 (the top, front cover) the same for the front cover's
// angle. In between the direction eases from one to the other, so the
// strip always stays flush with whichever board is nearest instead of
// leaving a wedge-shaped gap open wherever they've swung apart.
export function updateSpineBridge(geo, backAngle, frontAngle) {
  const pos = geo.attributes.position.array
  const halfDepth = BOOK.coverH / 2
  for (let j = 0; j <= BRIDGE_SEGS; j++) {
    const v = j / BRIDGE_SEGS
    const ease = (1 - Math.cos(Math.PI * v)) / 2
    const angle = backAngle + (frontAngle - backAngle) * ease
    const y = BACK_COVER_HINGE_Y + (FRONT_COVER_HINGE_Y - BACK_COVER_HINGE_Y) * v
    const x = HINGE_X - Math.cos(angle) * SPINE_DEPTH
    const yOff = y - Math.sin(angle) * SPINE_DEPTH
    const base = j * 2 * 3
    pos[base] = x
    pos[base + 1] = yOff
    pos[base + 2] = -halfDepth
    pos[base + 3] = x
    pos[base + 4] = yOff
    pos[base + 5] = halfDepth
  }
  geo.attributes.position.needsUpdate = true
  geo.computeVertexNormals()
}
