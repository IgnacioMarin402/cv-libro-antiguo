import * as THREE from 'three'
import { canvasTexture } from '@/shared/three/canvasTexture'
import { rand } from '@/shared/math/random'

// Page-block edge: fine horizontal strata with foxed/aged tone spots.
export function createPagesTexture() {
  const tex = canvasTexture((ctx, s) => {
    ctx.fillStyle = '#e2cd9c'
    ctx.fillRect(0, 0, s, s)
    for (let y = 0; y < s; y += rand(2, 4)) {
      ctx.strokeStyle = `rgba(90,65,35,${rand(0.06, 0.22)})`
      ctx.lineWidth = rand(0.5, 1.4)
      ctx.beginPath()
      ctx.moveTo(0, y + rand(-1, 1))
      ctx.lineTo(s, y + rand(-1, 1))
      ctx.stroke()
    }
    for (let i = 0; i < 260; i++) {
      const x = Math.random() * s
      const y = Math.random() * s
      const r = rand(3, 16)
      ctx.fillStyle = `rgba(120,80,30,${rand(0.05, 0.18)})`
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }, 512)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 3)
  return tex
}
