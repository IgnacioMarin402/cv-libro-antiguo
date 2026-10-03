import * as THREE from 'three'

// Neither colour nor depth: in the view it's drawn and leaves nothing.
const material = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false })

// What casts a multi-material mesh's shadow, in one draw. three draws a
// mesh with an array of materials one group at a time, and its shadow pass
// does the same: a box's six faces under a point light's six cube faces is
// 36 draws a frame for one shadow. The twin is the same geometry with one
// material, so it's six. Its FrontSide casts from the back faces (three's
// shadowSide default), which is what the original's FrontSide materials
// did — so the shadow is the same one; leave the original castShadow off.
//
// Hang it from the mesh itself: with the same matrixWorld, a skinned twin
// sharing the skeleton and the bind poses exactly as the original does.
// It takes no raycasts — the original answers those.
export function createShadowTwin(mesh) {
  const twin = mesh.isSkinnedMesh ? new THREE.SkinnedMesh(mesh.geometry, material) : new THREE.Mesh(mesh.geometry, material)
  if (mesh.isSkinnedMesh) twin.bind(mesh.skeleton, mesh.bindMatrix)
  twin.castShadow = true
  twin.frustumCulled = mesh.frustumCulled
  twin.raycast = () => {}
  return twin
}
