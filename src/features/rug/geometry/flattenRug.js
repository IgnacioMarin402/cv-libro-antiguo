import { flattenRugHeight, rugSquashAt } from '../domain/rug'

// Presses the rug's mesh flat, in place, by its domain's rule. A normal
// under a squash by s in y turns as (s·nx, ny, s·nz): the inverse transpose
// of the squash, so the pressed heads light flat like the field around
// them instead of keeping the shading of their old relief.
//
// The geometry is the loader's own, cached and shared, and React runs a
// mount's effects twice in development: it's marked once pressed, so a
// second call leaves it alone.
export function flattenRug(geometry) {
  if (geometry.userData.flattened) return
  const position = geometry.attributes.position
  const normal = geometry.attributes.normal

  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i)
    const s = rugSquashAt(y)
    position.setY(i, flattenRugHeight(y))
    if (!normal) continue
    const nx = normal.getX(i) * s
    const ny = normal.getY(i)
    const nz = normal.getZ(i) * s
    const length = Math.hypot(nx, ny, nz) || 1
    normal.setXYZ(i, nx / length, ny / length, nz / length)
  }

  position.needsUpdate = true
  if (normal) normal.needsUpdate = true
  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()
  geometry.userData.flattened = true
}
