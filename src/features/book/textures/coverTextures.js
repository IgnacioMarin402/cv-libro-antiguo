import * as THREE from 'three'
import { canvasTexture } from '@/shared/three/canvasTexture'
import { rand } from '@/shared/math/random'
import { buildCoverOrnamentPaths, paintGiltColor, paintGiltBump } from './giltOrnament'

// Leather cover: mottled worn brown with rubbed corners, fine scratches, and
// a tooled gold-leaf border/corner/cartouche design (see buildCoverOrnamentPaths).
export function createCoverTexture() {
  const tex = canvasTexture((ctx, s) => {
    ctx.fillStyle = '#6b4423'
    ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 3200; i++) {
      const x = Math.random() * s
      const y = Math.random() * s
      const r = rand(4, 40)
      const shade = Math.random() > 0.5 ? 'rgba(30,18,10,' : 'rgba(150,110,70,'
      ctx.fillStyle = shade + rand(0.03, 0.12) + ')'
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
    const g = ctx.createRadialGradient(s * 0.02, s * 0.02, 2, s * 0.02, s * 0.02, s * 0.4)
    g.addColorStop(0, 'rgba(190,150,100,0.35)')
    g.addColorStop(1, 'rgba(190,150,100,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
    ctx.save()
    ctx.translate(s, s)
    ctx.scale(-1, -1)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
    ctx.restore()
    ctx.strokeStyle = 'rgba(20,12,6,0.15)'
    for (let i = 0; i < 220; i++) {
      ctx.beginPath()
      const x = Math.random() * s
      const y = Math.random() * s
      const a = Math.random() * Math.PI * 2
      const len = rand(20, 120)
      ctx.moveTo(x, y)
      ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len)
      ctx.lineWidth = rand(1, 3)
      ctx.stroke()
    }
    paintGiltColor(ctx, s, buildCoverOrnamentPaths(s))
  }, 1024)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

// Grayscale bump map matching the cover's leather grain, with the gilt
// border/corners/cartouche embossed on top and the cartouche interior
// recessed like an inset nameplate. Tagged NoColorSpace (not sRGB) since
// this is height data, not color — canvasTexture() defaults to sRGB.
export function createCoverBumpTexture() {
  const tex = canvasTexture((ctx, s) => {
    ctx.fillStyle = '#808080'
    ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 9000; i++) {
      const v = rand(-30, 30)
      ctx.fillStyle = `rgba(${128 + v},${128 + v},${128 + v},0.5)`
      ctx.fillRect(Math.random() * s, Math.random() * s, 1.2, 1.2)
    }
    paintGiltBump(ctx, s, buildCoverOrnamentPaths(s))
  }, 1024)
  tex.colorSpace = THREE.NoColorSpace
  return tex
}

// Inside cover: plain smooth leather, same family of brown as the outer
// cover but with no gilt tooling and only soft mottling — a bare doublure
// rather than the decorated face.
export function createCoverInnerTexture() {
  const tex = canvasTexture((ctx, s) => {
    ctx.fillStyle = '#5c3a21'
    ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 1200; i++) {
      const x = Math.random() * s
      const y = Math.random() * s
      const r = rand(8, 46)
      const shade = Math.random() > 0.5 ? 'rgba(30,18,10,' : 'rgba(140,100,65,'
      ctx.fillStyle = shade + rand(0.02, 0.07) + ')'
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
    const g = ctx.createRadialGradient(s * 0.5, s * 0.5, s * 0.08, s * 0.5, s * 0.5, s * 0.72)
    g.addColorStop(0, 'rgba(150,110,70,0.16)')
    g.addColorStop(1, 'rgba(15,9,5,0.3)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
  }, 512)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}
