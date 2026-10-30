import * as THREE from 'three'

// The head's bubbles as relief: rings of every size, most of them small,
// each a little cup — bright rim, dark middle — on a mid-grey, for a bump
// map. Not colour: NoColorSpace (see shared/three/canvasTexture, which is
// for colour).
export function createFoamBumpTexture() {
  const size = 512
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, size, size)
  for (let i = 0; i < 900; i++) {
    const r = 1.5 + Math.pow(Math.random(), 3) * 9
    const x = Math.random() * size
    const y = Math.random() * size
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, 'rgba(70, 70, 70, 0.9)')
    g.addColorStop(0.7, 'rgba(110, 110, 110, 0.6)')
    g.addColorStop(0.92, 'rgba(210, 210, 210, 0.9)')
    g.addColorStop(1, 'rgba(128, 128, 128, 0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  const texture = new THREE.CanvasTexture(c)
  texture.colorSpace = THREE.NoColorSpace
  return texture
}
