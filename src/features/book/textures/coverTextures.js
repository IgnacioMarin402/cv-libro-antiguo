import * as THREE from 'three'
import { canvasTexture } from '@/shared/three/canvasTexture'
import { rand } from '@/shared/math/random'
import { buildCoverOrnamentPaths, paintGiltColor, paintGiltBump } from './giltOrnament'

// Leather cover: mottled dark green, rubbed pale at the corners, scratched,
// with old warm brown bleeding through where the dye has worn thin — and a
// bronze border/corner/centre design tooled on top (buildCoverOrnamentPaths).
export function createCoverTexture() {
  const tex = canvasTexture((ctx, s) => {
    ctx.fillStyle = '#1f342e'
    ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 3200; i++) {
      const x = Math.random() * s
      const y = Math.random() * s
      const r = rand(4, 40)
      const shade = Math.random() > 0.5 ? 'rgba(10,18,16,' : 'rgba(84,118,106,'
      ctx.fillStyle = shade + rand(0.03, 0.12) + ')'
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
    // Sparser and warmer than the mottling above: green dye over tanned hide
    // goes brown where it rubs through, and only in patches.
    for (let i = 0; i < 420; i++) {
      ctx.fillStyle = 'rgba(92,66,34,' + rand(0.02, 0.07) + ')'
      ctx.beginPath()
      ctx.arc(Math.random() * s, Math.random() * s, rand(10, 64), 0, Math.PI * 2)
      ctx.fill()
    }
    const g = ctx.createRadialGradient(s * 0.02, s * 0.02, 2, s * 0.02, s * 0.02, s * 0.4)
    g.addColorStop(0, 'rgba(98,128,118,0.24)')
    g.addColorStop(1, 'rgba(98,128,118,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
    ctx.save()
    ctx.translate(s, s)
    ctx.scale(-1, -1)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
    ctx.restore()
    // Vignette: the boards darken toward the edges where they are handled
    // and shelved, which is also what lets the bronze border read against it.
    const vig = ctx.createRadialGradient(s * 0.5, s * 0.46, s * 0.12, s * 0.5, s * 0.5, s * 0.78)
    vig.addColorStop(0, 'rgba(84,114,104,0.12)')
    vig.addColorStop(0.6, 'rgba(0,0,0,0)')
    vig.addColorStop(1, 'rgba(8,12,9,0.42)')
    ctx.fillStyle = vig
    ctx.fillRect(0, 0, s, s)
    ctx.strokeStyle = 'rgba(14,20,16,0.16)'
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

// Inside cover: plain smooth leather, the same green as the outer boards but
// a shade deeper — it never saw the light — with no tooling and only soft
// mottling. A bare doublure rather than the decorated face.
export function createCoverInnerTexture() {
  const tex = canvasTexture((ctx, s) => {
    ctx.fillStyle = '#1a2825'
    ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 1200; i++) {
      const x = Math.random() * s
      const y = Math.random() * s
      const r = rand(8, 46)
      const shade = Math.random() > 0.5 ? 'rgba(18,26,21,' : 'rgba(112,126,106,'
      ctx.fillStyle = shade + rand(0.02, 0.07) + ')'
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
    const g = ctx.createRadialGradient(s * 0.5, s * 0.5, s * 0.08, s * 0.5, s * 0.5, s * 0.72)
    g.addColorStop(0, 'rgba(118,132,110,0.16)')
    g.addColorStop(1, 'rgba(8,12,9,0.32)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
  }, 512)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}
