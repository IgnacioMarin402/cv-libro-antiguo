import { latheFromProfile } from '@/shared/three/latheProfile'
import { TREAT_PROFILE, TREAT_RADIUS } from '../domain/treat'

// The treat, lathed from its silhouette (see domain/treat): a flat disc in
// XZ with a rounded rim. The lathe's own UVs run round it and up the
// profile, which would wrap the chips round the rim in rings; they're laid
// on flat from above instead, so both faces show the same biscuit and the
// rim takes its edge.
export function createTreatGeometry() {
  const geometry = latheFromProfile(TREAT_PROFILE, 32)
  const position = geometry.attributes.position
  const uv = geometry.attributes.uv
  for (let i = 0; i < position.count; i++) {
    uv.setXY(i, 0.5 + position.getX(i) / (2 * TREAT_RADIUS), 0.5 + position.getZ(i) / (2 * TREAT_RADIUS))
  }
  uv.needsUpdate = true
  return geometry
}
