import { canvasTexture } from '@/shared/three/canvasTexture'
import { COOKIE_COLORS, COOKIE_CHIPS } from '../domain/cookie'

// The cookie's face, seen from above (see geometry/cookieGeometry): the
// dough baked darker toward the rim, a fine speckle of crumbs, and its
// chocolate chips — irregular, in the middle four-fifths, where the face is
// flat.
export function createCookieTexture() {
  return canvasTexture((ctx, s) => {
    const r = s / 2
    const g = ctx.createRadialGradient(r, r, 0, r, r, r)
    g.addColorStop(0, COOKIE_COLORS.dough)
    g.addColorStop(0.7, COOKIE_COLORS.dough)
    g.addColorStop(1, COOKIE_COLORS.baked)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)

    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = `rgba(${Math.random() < 0.5 ? '90, 50, 20' : '240, 200, 140'}, ${0.15 + Math.random() * 0.2})`
      ctx.beginPath()
      ctx.arc(Math.random() * s, Math.random() * s, 0.6 + Math.random() * 1.6, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.fillStyle = COOKIE_COLORS.chip
    for (let i = 0; i < COOKIE_CHIPS; i++) {
      const a = Math.random() * Math.PI * 2
      const d = Math.sqrt(Math.random()) * r * 0.75
      const x = r + Math.cos(a) * d
      const y = r + Math.sin(a) * d
      const size = s * (0.035 + Math.random() * 0.025)
      ctx.beginPath()
      for (let k = 0; k < 6; k++) {
        const b = (k / 6) * Math.PI * 2 + Math.random() * 0.5
        const reach = size * (0.7 + Math.random() * 0.5)
        ctx[k ? 'lineTo' : 'moveTo'](x + Math.cos(b) * reach, y + Math.sin(b) * reach)
      }
      ctx.closePath()
      ctx.fill()
    }
  }, 256)
}
