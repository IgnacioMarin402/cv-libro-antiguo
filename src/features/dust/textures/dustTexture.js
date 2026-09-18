import { canvasTexture } from '@/shared/three/canvasTexture'

// Soft warm radial dot used as the sprite for each dust particle.
export function createDustTexture() {
  return canvasTexture((ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    g.addColorStop(0, 'rgba(255,220,160,0.9)')
    g.addColorStop(1, 'rgba(255,220,160,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
  }, 64)
}
