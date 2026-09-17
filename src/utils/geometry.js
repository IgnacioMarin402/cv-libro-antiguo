import * as THREE from 'three'
import { rand } from './random'

// A rectangle whose edges are jittered outward/inward, so extruded shapes
// (covers, page block) read as hand-cut instead of laser-straight.
export function wornRect(w, h, opts = {}) {
  const { segs = 12, jitter = 0, spineJitter = 0 } = opts
  const halfW = w / 2
  const halfH = h / 2
  const pts = []

  function edge(x0, y0, x1, y1, n, jit) {
    for (let i = 1; i <= n; i++) {
      const t = i / n
      let x = x0 + (x1 - x0) * t
      let y = y0 + (y1 - y0) * t
      if (jit > 0) {
        const dx = x1 - x0
        const dy = y1 - y0
        const len = Math.hypot(dx, dy) || 1
        const nx = -dy / len
        const ny = dx / len
        const j = rand(-jit, jit)
        x += nx * j
        y += ny * j
      }
      pts.push(x, y)
    }
  }

  pts.push(-halfW, -halfH)
  edge(-halfW, -halfH, halfW, -halfH, segs, jitter * 0.55)
  edge(halfW, -halfH, halfW, halfH, segs, jitter)
  edge(halfW, halfH, -halfW, halfH, segs, jitter * 0.55)
  edge(-halfW, halfH, -halfW, -halfH, segs, spineJitter)

  const shape = new THREE.Shape()
  shape.moveTo(pts[0], pts[1])
  for (let i = 2; i < pts.length; i += 2) shape.lineTo(pts[i], pts[i + 1])
  shape.closePath()
  return shape
}

// Extrudes a flat XY shape along Z, then lays it down on the XZ plane.
//
// When `uv` ({ width, height }) is given, top/bottom face UVs are remapped
// to a standard 0..1 box spanning that size instead of three.js's default
// (which uses the shape's raw local coordinates as UV, so a centered shape
// samples the texture around its wrap seam rather than corner-to-corner).
// This lets a texture be authored as a normal "(0,0) = one corner, (1,1) =
// the opposite corner" image.
//
// When `splitCaps` is set, the geometry gets three material groups instead
// of ExtrudeGeometry's default two (lid faces combined + sides): 0 = bottom
// cap (the face at local Y 0 after the rotate below — i.e. the underside,
// facing the hinge), 1 = side walls, 2 = top cap (the outward-facing side).
// This lets a hinged panel (e.g. a book cover) use a different material for
// its inside vs. outside face. Safe because three.js emits the bottom cap's
// triangles first and the top cap's second, in equal counts.
export function extrudeFlat(shape, depth, { uv, splitCaps = false } = {}) {
  const uvGenerator = uv && {
    generateTopUV(geometry, vertices, a, b, c) {
      return [a, b, c].map((i) => {
        const x = vertices[i * 3]
        const y = vertices[i * 3 + 1]
        return new THREE.Vector2(x / uv.width + 0.5, y / uv.height + 0.5)
      })
    },
    generateSideWallUV(geometry, vertices, a, b, c, d) {
      const alongX = Math.abs(vertices[a * 3 + 1] - vertices[b * 3 + 1]) < Math.abs(vertices[a * 3] - vertices[b * 3])
      return [a, b, c, d].map((i) => {
        const u = alongX ? vertices[i * 3] / uv.width + 0.5 : vertices[i * 3 + 1] / uv.height + 0.5
        return new THREE.Vector2(u, 1 - vertices[i * 3 + 2] / depth)
      })
    },
  }

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    curveSegments: 1,
    ...(uvGenerator ? { UVGenerator: uvGenerator } : {}),
  })
  geo.rotateX(-Math.PI / 2)

  if (splitCaps) {
    const [lid, sides] = geo.groups
    const half = lid.count / 2
    geo.groups = [
      { start: lid.start, count: half, materialIndex: 0 },
      { start: sides.start, count: sides.count, materialIndex: 1 },
      { start: lid.start + half, count: half, materialIndex: 2 },
    ]
  }

  return geo
}
