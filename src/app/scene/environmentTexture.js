import * as THREE from 'three'

// Warm, dim equirectangular gradient used as the scene's environment map so
// metal (the candlestick) has something moody to reflect instead of going
// flat black — a candlelit room stand-in, not a real HDRI.
export function createEnvironmentTexture() {
  const w = 256
  const h = 128
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')

  const sky = ctx.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, '#0d0906')
  sky.addColorStop(0.55, '#241b10')
  sky.addColorStop(1, '#3c2b17')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h)

  const glow = ctx.createRadialGradient(w * 0.32, h * 0.45, 0, w * 0.32, h * 0.45, w * 0.22)
  glow.addColorStop(0, 'rgba(255,190,110,0.9)')
  glow.addColorStop(1, 'rgba(255,190,110,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)

  const cool = ctx.createRadialGradient(w * 0.78, h * 0.3, 0, w * 0.78, h * 0.3, w * 0.18)
  cool.addColorStop(0, 'rgba(120,140,180,0.25)')
  cool.addColorStop(1, 'rgba(120,140,180,0)')
  ctx.fillStyle = cool
  ctx.fillRect(0, 0, w, h)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.mapping = THREE.EquirectangularReflectionMapping
  return tex
}
