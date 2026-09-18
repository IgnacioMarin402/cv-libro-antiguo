import * as THREE from 'three'

// Draws into an offscreen 2D canvas and wraps it as an sRGB texture — the
// base every procedural texture in the project is painted on.
export function canvasTexture(draw, size) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  draw(ctx, size)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
