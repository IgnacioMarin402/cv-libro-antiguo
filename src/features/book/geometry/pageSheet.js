import * as THREE from 'three'
import { rand } from '@/shared/math/random'

// --- Bendable page sheet -----------------------------------------------
// A page needs to curve two ways: permanently near the spine (so it grows
// out of the rounded half-cylinder instead of meeting it as a flat-cut
// slab) and dynamically along its whole length while turning (so a flip
// bends like paper instead of swinging like a rigid card). Both are vertex
// displacements over a shared grid, so building the grid — topology plus
// jittered rest coordinates, done once — is split from evaluating it —
// positions for a given bend, redone every frame for whichever page is
// mid-flip.

// Rest-grid topology and jittered (x, z) coordinates for a page sheet,
// centered at the origin like wornRect: x spans the bend axis (spine at
// -width/2, fore-edge at +width/2), z spans the spine-length axis. Jitter
// only touches the outer boundary ring, so the interior stays a regular
// grid that bends smoothly — the hand-cut irregularity lives on the
// visible edges only, same intent as wornRect's own perimeter jitter.
export function buildPageGrid(width, height, opts = {}) {
  const { segsX = 18, segsZ = 6, edgeJitter = 0, spineJitter = 0 } = opts
  const cols = segsX + 1
  const rows = segsZ + 1
  const halfW = width / 2
  const halfH = height / 2
  const restX = new Float32Array(cols * rows)
  const restZ = new Float32Array(cols * rows)
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      let x = -halfW + (width * i) / segsX
      let z = -halfH + (height * j) / segsZ
      if (i === 0) x += rand(-spineJitter, spineJitter)
      else if (i === segsX) x += rand(-edgeJitter, edgeJitter)
      if (j === 0) z += rand(-edgeJitter * 0.55, edgeJitter * 0.55)
      else if (j === segsZ) z += rand(-edgeJitter * 0.55, edgeJitter * 0.55)
      const idx = j * cols + i
      restX[idx] = x
      restZ[idx] = z
    }
  }
  return { segsX, segsZ, width, height, restX, restZ }
}

// A permanent hook near the hinge that wraps a leaf toward the spine
// (-X) and up (+Y) before releasing it flat, instead of just lifting it —
// once a cover swings open, a leaf that only rose in Y still ends its flat
// run short of the spine strip standing behind the hinge, reading as a
// separate floating slab rather than paper that grows out of it. Both
// the wrap (`wrapShape`) and the lift (`ease`) are zero-value/zero-
// slope at u = 0 (tangent to the flat hinge) and the wrap is *also*
// zero-slope at u = transition (so it releases into the flat continuation
// without a crease); the lift's ease has zero slope there too, so what's
// left after the hook is a flat leaf, just permanently shifted up.
export function pageSpineBend(wrap, lift, transition) {
  if (transition <= 0 || (lift === 0 && wrap === 0)) return () => ({ x: 0, y: 0, angle: 0 })
  return (u) => {
    if (u >= transition) return { x: 0, y: lift, angle: 0 }
    const p = u / transition
    const ease = (1 - Math.cos(Math.PI * p)) / 2
    const wrapShape = (1 - Math.cos(2 * Math.PI * p)) / 2
    const dySlope = lift * (Math.PI / (2 * transition)) * Math.sin(Math.PI * p)
    return { x: -wrap * wrapShape, y: lift * ease, angle: Math.atan(dySlope) }
  }
}

// Evaluates a page grid's positions for a given rest-bend curve plus an
// optional extra curl (a function of u/width — e.g. a traveling flex mid-
// flip). Writes both the top and bottom face layers, each offset from the
// bent centerline by `thickness`/2 along that point's local normal, so the
// leaf keeps a constant thickness through the bend instead of pinching.
// Reuses `target` when given, so an in-progress flip can update a page's
// geometry in place every frame without reallocating.
export function computeBentPositions(grid, thickness, bendFn, curl, target) {
  const { segsX, segsZ, width, restX, restZ } = grid
  const cols = segsX + 1
  const rows = segsZ + 1
  const halfW = width / 2
  const halfT = thickness / 2
  const count = cols * rows
  const arr = target || new Float32Array(count * 2 * 3)
  for (let layer = 0; layer < 2; layer++) {
    const sign = layer === 0 ? 1 : -1
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const idx = j * cols + i
        const x0 = restX[idx]
        const u = x0 + halfW
        const { x, y, angle } = bendFn(u)
        const extra = curl ? curl(u / width) : 0
        const nx = -Math.sin(angle)
        const ny = Math.cos(angle)
        const off = extra + sign * halfT
        const base = (layer * count + idx) * 3
        arr[base] = x0 + x + nx * off
        arr[base + 1] = y + ny * off
        arr[base + 2] = restZ[idx]
      }
    }
  }
  return arr
}

// Builds a full page-sheet BufferGeometry (top + bottom faces plus a thin
// perimeter skirt) from a grid, evaluated at the given rest bend. Used both
// for the shared, static geometry every page starts from and as the
// template a flipping page clones in order to animate its own curl.
export function pageGridGeometry(grid, thickness, bendFn) {
  const { segsX, segsZ } = grid
  const cols = segsX + 1
  const rows = segsZ + 1
  const count = cols * rows
  const positions = computeBentPositions(grid, thickness, bendFn)
  const uvs = new Float32Array(count * 2 * 2)
  for (let layer = 0; layer < 2; layer++) {
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const idx = j * cols + i
        const base = (layer * count + idx) * 2
        uvs[base] = i / segsX
        uvs[base + 1] = j / segsZ
      }
    }
  }

  const topIdx = (i, j) => j * cols + i
  const botIdx = (i, j) => count + j * cols + i
  const indices = []
  // Top cap (+Y at rest) and bottom cap (-Y at rest), sharing the same i/j
  // walk so both caps stay in lockstep as the grid bends.
  for (let j = 0; j < segsZ; j++) {
    for (let i = 0; i < segsX; i++) {
      const a = topIdx(i, j)
      const b = topIdx(i + 1, j)
      const c = topIdx(i + 1, j + 1)
      const d = topIdx(i, j + 1)
      indices.push(a, d, c, a, c, b)
      const a2 = botIdx(i, j)
      const b2 = botIdx(i + 1, j)
      const c2 = botIdx(i + 1, j + 1)
      const d2 = botIdx(i, j + 1)
      indices.push(a2, b2, c2, a2, c2, d2)
    }
  }
  // Thin perimeter skirt connecting the top and bottom rings around all
  // four edges (hinge, fore-edge, and the two long spine-length edges).
  for (let j = 0; j < segsZ; j++) {
    const at = topIdx(0, j), bt = topIdx(0, j + 1), ab = botIdx(0, j), bb = botIdx(0, j + 1)
    indices.push(at, bt, bb, at, bb, ab)
    const at2 = topIdx(segsX, j), bt2 = topIdx(segsX, j + 1), ab2 = botIdx(segsX, j), bb2 = botIdx(segsX, j + 1)
    indices.push(at2, ab2, bb2, at2, bb2, bt2)
  }
  for (let i = 0; i < segsX; i++) {
    const at = topIdx(i, 0), bt = topIdx(i + 1, 0), ab = botIdx(i, 0), bb = botIdx(i + 1, 0)
    indices.push(at, ab, bb, at, bb, bt)
    const at2 = topIdx(i, segsZ), bt2 = topIdx(i + 1, segsZ), ab2 = botIdx(i, segsZ), bb2 = botIdx(i + 1, segsZ)
    indices.push(at2, bt2, bb2, at2, bb2, ab2)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}
