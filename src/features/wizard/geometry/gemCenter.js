import * as THREE from 'three'

// Where the gem's centre is, in the space of the bone it rides on: the
// average of its vertices, weighted by how much gem the texture has under
// each. Taken from the bind pose (bone inverse × bind matrix), so it is the
// same whatever pose the figure is in when it is asked.
export function gemCenter(mesh, bone, weightAt) {
  const { geometry, skeleton, bindMatrix } = mesh
  const toBone = new THREE.Matrix4()
    .copy(skeleton.boneInverses[skeleton.bones.indexOf(bone)])
    .multiply(bindMatrix)
  const uv = geometry.attributes.uv
  const pos = geometry.attributes.position
  const v = new THREE.Vector3()
  const center = new THREE.Vector3()
  let total = 0
  for (let i = 0; i < uv.count; i++) {
    const w = weightAt(uv.getX(i), uv.getY(i))
    if (!w) continue
    center.addScaledVector(v.fromBufferAttribute(pos, i), w)
    total += w
  }
  return center.divideScalar(total).applyMatrix4(toBone)
}
