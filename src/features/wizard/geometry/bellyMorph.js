import * as THREE from 'three'
import { bellyWeight, BELLY_SWELL } from '../domain/breathing'

// The belly's swell as a morph target on the figure's own geometry: each
// vertex pushed straight ahead by its share of the swell. Morphs apply
// before skinning, in the geometry's space — the bind pose, since the
// GLB's bind matrix is the identity — so the swell turns and bends with
// the body. Straight ahead rather than along the normals: split vertices
// on a seam share a position but not a normal, and would tear apart.
// Returns the target's index, for morphTargetInfluences.
export function addBellyMorph(mesh) {
  const { geometry } = mesh
  const pos = geometry.attributes.position
  const swell = new Float32Array(pos.count * 3)
  for (let i = 0; i < pos.count; i++) {
    swell[i * 3 + 2] = BELLY_SWELL * bellyWeight(pos.getX(i), pos.getY(i), pos.getZ(i))
  }
  const targets = geometry.morphAttributes.position ?? []
  geometry.morphAttributes.position = [...targets, new THREE.BufferAttribute(swell, 3)]
  geometry.morphTargetsRelative = true
  mesh.updateMorphTargets()
  return targets.length
}
