import * as THREE from 'three'
import { canvasTexture } from '@/shared/three/canvasTexture'
import { rand } from '@/shared/math/random'

// Wood table top: dark stained planks with wavy grain lines.
export function createWoodTexture() {
  const tex = canvasTexture((ctx, s) => {
    ctx.fillStyle = '#241408'
    ctx.fillRect(0, 0, s, s)
    for (let y = 0; y < s; y += rand(4, 10)) {
      ctx.strokeStyle = `rgba(60,32,14,${rand(0.2, 0.5)})`
      ctx.lineWidth = rand(1, 3)
      ctx.beginPath()
      ctx.moveTo(0, y)
      for (let x = 0; x <= s; x += 40) ctx.lineTo(x, y + Math.sin(x * 0.02 + y) * 6)
      ctx.stroke()
    }
  }, 512)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(6, 6)
  return tex
}
