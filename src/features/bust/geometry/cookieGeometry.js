import { latheFromProfile } from '@/shared/three/latheProfile'
import { COOKIE_PROFILE, COOKIE_RADIUS } from '../domain/cookie'

// The cookie, lathed from its silhouette (see domain/cookie): a flat disc in
// XZ with a rounded rim. The lathe's own UVs run round it and up the
// profile, which would wrap the chips round the rim in rings; they're laid
// on flat from above instead, so both faces show the same biscuit and the
// rim takes its edge.
export function createCookieGeometry() {
  const geometry = latheFromProfile(COOKIE_PROFILE, 32)
  const position = geometry.attributes.position
  const uv = geometry.attributes.uv
  for (let i = 0; i < position.count; i++) {
    uv.setXY(i, 0.5 + position.getX(i) / (2 * COOKIE_RADIUS), 0.5 + position.getZ(i) / (2 * COOKIE_RADIUS))
  }
  uv.needsUpdate = true
  return geometry
}
