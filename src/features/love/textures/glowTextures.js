import { canvasTexture } from '@/shared/three/canvasTexture'
import { EMBER_STOPS, EMBER_DROP, EMBER_RADIUS } from '../domain/heart'

// The ember's light, laid over it flat across its box (see
// geometry/heartGeometry): the counter's gradient, the same circle on the
// same heart. The square is stretched over a box `aspect` times taller
// than wide, so the circle is drawn squashed by that much and comes out
// round on the ember. Past its last stop the colour carries on to the
// edge, as the SVG's does.
export function createEmberTexture(aspect) {
  return canvasTexture((ctx, s) => {
    ctx.fillStyle = EMBER_STOPS.at(-1)[1]
    ctx.fillRect(0, 0, s, s)
    ctx.translate(s / 2, s * (0.5 + EMBER_DROP / aspect))
    ctx.scale(1, 1 / aspect)
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, EMBER_RADIUS * s)
    for (const [at, color] of EMBER_STOPS) g.addColorStop(at, color)
    ctx.fillStyle = g
    ctx.fillRect(-s, -2 * s * aspect, 2 * s, 4 * s * aspect)
  }, 256)
}

// The light around the heart: the candle's own glow (see features/candle),
// trailing off with no rim — a two-stop ramp reads as a disc.
export function createHaloTexture() {
  return canvasTexture((ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    g.addColorStop(0, 'rgba(255,200,120,0.85)')
    g.addColorStop(0.1, 'rgba(255,175,90,0.5)')
    g.addColorStop(0.28, 'rgba(255,150,60,0.16)')
    g.addColorStop(0.55, 'rgba(255,135,50,0.04)')
    g.addColorStop(1, 'rgba(255,120,40,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
  }, 128)
}

// A spark of the burst: a white-hot point in a soft falloff. White, so each
// spark's own colour (see domain/heart) is what tints it.
export function createSparkTexture() {
  return canvasTexture((ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.2, 'rgba(255,255,255,0.85)')
    g.addColorStop(0.5, 'rgba(255,255,255,0.25)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
  }, 64)
}
