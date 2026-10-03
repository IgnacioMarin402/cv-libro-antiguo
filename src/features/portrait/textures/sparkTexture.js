import { canvasTexture } from '@/shared/three/canvasTexture'

// The sprite every spark off the names is drawn with: a white-hot point in
// a soft gold halo, crossed by two thin rays — a glint, the way a point of
// light catches in the eye, where the book's motes are round and cold (see
// features/pageCurlBook). Near-white at the core so the spark's colour is
// what tints it.
export function createSparkTexture() {
  return canvasTexture((ctx, s) => {
    const c = s / 2
    const glow = ctx.createRadialGradient(c, c, 0, c, c, c)
    glow.addColorStop(0, 'rgba(255,255,255,1)')
    glow.addColorStop(0.15, 'rgba(255,242,210,0.85)')
    glow.addColorStop(0.45, 'rgba(255,205,130,0.22)')
    glow.addColorStop(1, 'rgba(255,175,90,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, s, s)

    // The rays: a hair wide, brightest through the middle, gone at the edge.
    ctx.globalCompositeOperation = 'lighter'
    const hair = s * 0.035
    for (const across of [true, false]) {
      const ray = across ? ctx.createLinearGradient(0, c, s, c) : ctx.createLinearGradient(c, 0, c, s)
      ray.addColorStop(0, 'rgba(255,230,180,0)')
      ray.addColorStop(0.5, 'rgba(255,246,222,0.9)')
      ray.addColorStop(1, 'rgba(255,230,180,0)')
      ctx.fillStyle = ray
      if (across) ctx.fillRect(0, c - hair / 2, s, hair)
      else ctx.fillRect(c - hair / 2, 0, hair, s)
    }
  }, 64)
}
