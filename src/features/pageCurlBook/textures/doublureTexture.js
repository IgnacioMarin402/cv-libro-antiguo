import * as THREE from 'three'
import { canvasTexture } from '@/shared/three/canvasTexture'
import { rand } from '@/shared/math/random'

// The inside of the boards: plain leather, the same hide as the cover's
// field and the spine (see LEATHER_COLOR in hooks/usePageMaterials), with
// no tooling — soft mottling, a fine pebbled grain, and the edges a shade
// darker where the turn-ins are. It used to be features/book's doublure,
// which is green, for that book's green cover; inside this red one it read
// as another book altogether.
//
// `ground` is the leather's own colour, sRGB, as the canvas paints it.
export function createDoublureTexture(ground) {
  const tex = canvasTexture((ctx, s) => {
    ctx.fillStyle = ground
    ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 1400; i++) {
      const shade = Math.random() > 0.5 ? 'rgba(26,8,6,' : 'rgba(126,60,44,'
      ctx.fillStyle = shade + rand(0.01, 0.04) + ')'
      ctx.beginPath()
      ctx.arc(Math.random() * s, Math.random() * s, rand(8, 46), 0, Math.PI * 2)
      ctx.fill()
    }
    // Pebbling: the grain the bump raises, darkened in its pits and caught
    // light on its tops — dense and fine, which is what makes it read as
    // hide rather than as a painted red.
    for (let i = 0; i < 70000; i++) {
      ctx.fillStyle = Math.random() < 0.6 ? `rgba(20,6,4,${rand(0.06, 0.18)})` : `rgba(150,74,56,${rand(0.05, 0.14)})`
      ctx.fillRect(Math.random() * s, Math.random() * s, rand(0.8, 1.8), rand(0.8, 1.8))
    }
    const g = ctx.createRadialGradient(s * 0.5, s * 0.5, s * 0.1, s * 0.5, s * 0.5, s * 0.74)
    g.addColorStop(0, 'rgba(120,58,42,0.1)')
    g.addColorStop(1, 'rgba(14,4,3,0.36)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
  }, 1024)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

// The same grain as height, for the bump map: no gilt to emboss in here,
// only the leather. NoColorSpace, since it is height and not colour.
export function createLeatherGrainTexture() {
  const tex = canvasTexture((ctx, s) => {
    ctx.fillStyle = '#808080'
    ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 70000; i++) {
      const v = rand(-34, 34)
      ctx.fillStyle = `rgba(${128 + v},${128 + v},${128 + v},0.55)`
      ctx.fillRect(Math.random() * s, Math.random() * s, rand(0.8, 1.8), rand(0.8, 1.8))
    }
  }, 1024)
  tex.colorSpace = THREE.NoColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}
