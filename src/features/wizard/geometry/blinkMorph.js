import * as THREE from 'three'
import { eyeWeight, LID_LINE } from '../domain/blink'

// The blink as a morph target on the figure's own geometry: each vertex
// around an eye pulled toward the lid line by its share of the squash, so
// at full weight the eye is a line. Only up and down, never along the
// normals, for the reason bellyMorph gives. The pull grows with distance
// from the line and fades out at the edge of the patch, so the surface
// never folds over itself. Returns the target's index.
export function addBlinkMorph(mesh) {
  const { geometry } = mesh
  const pos = geometry.attributes.position
  const squash = new Float32Array(pos.count * 3)
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    squash[i * 3 + 1] = (LID_LINE - y) * eyeWeight(pos.getX(i), y, pos.getZ(i))
  }
  const targets = geometry.morphAttributes.position ?? []
  geometry.morphAttributes.position = [...targets, new THREE.BufferAttribute(squash, 3)]
  geometry.morphTargetsRelative = true
  mesh.updateMorphTargets()
  return targets.length
}
