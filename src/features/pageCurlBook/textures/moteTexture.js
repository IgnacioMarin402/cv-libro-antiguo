import { canvasTexture } from '@/shared/three/canvasTexture'

// The sprite every mote is drawn with: a white-hot pinpoint in a cold halo
// that falls off to violet. Kept near-white at the core so the per-mote
// tint (see domain/motes) is what colors it, and deliberately nothing like
// the room's warm dust (see features/dust) — this light doesn't come from
// the candle.
export function createMoteTexture() {
  return canvasTexture((ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.18, 'rgba(232,246,255,0.95)')
    g.addColorStop(0.5, 'rgba(165,205,255,0.5)')
    g.addColorStop(1, 'rgba(120,90,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
  }, 64)
}
