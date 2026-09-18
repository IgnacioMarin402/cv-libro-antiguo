import * as THREE from 'three'
import { rand } from '@/shared/math/random'

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
