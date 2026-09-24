import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { addBellyMorph } from '../geometry/bellyMorph'
import { breath, CLAVICLES, UPPER_ARMS, SHOULDER_RISE, NECK, CHIN_LIFT } from '../domain/breathing'
import { headSway, HEAD, HEAD_SWAY } from '../domain/headSway'

// The GLB's own axes: it faces +z, so +x runs across it, side to side.
const ACROSS = new THREE.Vector3(1, 0, 0)
const AHEAD = new THREE.Vector3(0, 0, 1)
const UP = new THREE.Vector3(0, 1, 0)

const parentQ = new THREE.Quaternion()
const modelQ = new THREE.Quaternion()
const turn = new THREE.Quaternion()
const axis = new THREE.Vector3()

// Turns a bone about an axis given in the model's own space, whichever way
// its parents happen to be turned: the axis is carried into the parent's
// frame and the turn put before the bone's own.
function turnInModel(bone, modelAxis, angle) {
  bone.parent.getWorldQuaternion(parentQ)
  axis.copy(modelAxis).applyQuaternion(modelQ).applyQuaternion(parentQ.invert())
  bone.quaternion.premultiply(turn.setFromAxisAngle(axis, angle))
}

// The breathing laid over the standing pose: the shoulders and chin by
// turning bones, the belly by a morph target — and with it the head's slow
// sway from side to side (domain/headSway.js). It runs after the mixer, so it
// is called after useWizardClips. The mixer only writes a bone when the
// clips give it a new value, and the standing pose is held still, so most
// frames it writes nothing: each bone keeps the pose it had before the
// turns (base) and what it was left with (out). A bone still holding out
// wasn't written, and goes back to base; otherwise the mixer's value is the
// new base. Without it the turns piled up — 18 cm in 12 s at the shoulder.
function restore(bone, pose) {
  if (bone.quaternion.equals(pose.out)) bone.quaternion.copy(pose.base)
  else pose.base.copy(bone.quaternion)
}

// It weighs as much as the standing clip does, so it fades out with it
// into a gesture and comes back as the figure stands again.
export function useBreathing(scene, standing) {
  const bones = useMemo(() => {
    let mesh
    scene.traverse((o) => {
      if (o.isSkinnedMesh) mesh = o
    })
    const bone = (name) => mesh.skeleton.getBoneByName(name)
    scene.updateMatrixWorld(true)
    // Which way is up for each shoulder: turning about the axis ahead
    // raises the one on +x and lowers the other.
    const side = (b) => Math.sign(scene.worldToLocal(b.getWorldPosition(new THREE.Vector3())).x)
    const shoulders = CLAVICLES.map((name, i) => {
      const clavicle = bone(name)
      return { clavicle, arm: bone(UPPER_ARMS[i]), side: side(clavicle) }
    })
    const neck = bone(NECK)
    const head = bone(HEAD)
    const turned = [...shoulders.flatMap((s) => [s.clavicle, s.arm]), neck, head]
    // out starts as no pose at all, so the first frame takes the mixer's.
    const poses = new Map(turned.map((b) => [b, { base: new THREE.Quaternion(), out: new THREE.Quaternion(0, 0, 0, 0) }]))
    return { shoulders, neck, head, poses, mesh, belly: addBellyMorph(mesh) }
  }, [scene])

  useFrame(({ clock }) => {
    for (const [bone, pose] of bones.poses) restore(bone, pose)
    const weight = standing.isScheduled() ? standing.getEffectiveWeight() : 0
    const b = breath(clock.elapsedTime) * weight
    scene.getWorldQuaternion(modelQ)
    for (const { clavicle, arm, side } of bones.shoulders) {
      turnInModel(clavicle, AHEAD, SHOULDER_RISE * b * side)
      turnInModel(arm, AHEAD, -SHOULDER_RISE * b * side)
    }
    // Chin up is a negative turn about the axis across (measured: the snout
    // goes up and back).
    turnInModel(bones.neck, ACROSS, -CHIN_LIFT * b)
    turnInModel(bones.head, UP, HEAD_SWAY * headSway(clock.elapsedTime) * weight)
    bones.mesh.morphTargetInfluences[bones.belly] = b
    for (const [bone, pose] of bones.poses) pose.out.copy(bone.quaternion)
  })
}
