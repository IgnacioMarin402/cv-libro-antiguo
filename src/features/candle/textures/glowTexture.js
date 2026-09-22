import { canvasTexture } from '@/shared/three/canvasTexture'

// Soft warm glow around the candle flame. It falls off steeply and then
// trails away, roughly as light scattering in the air does, so the halo
// has no edge: a straight two-stop ramp read as a flat disc behind the
// flame, its rim plainly visible against the dark room.
export function createGlowTexture() {
  return canvasTexture((ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    g.addColorStop(0, 'rgba(255,190,110,0.85)')
    g.addColorStop(0.08, 'rgba(255,170,90,0.5)')
    g.addColorStop(0.22, 'rgba(255,150,70,0.18)')
    g.addColorStop(0.45, 'rgba(255,135,60,0.05)')
    g.addColorStop(1, 'rgba(255,120,50,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
  }, 128)
}
