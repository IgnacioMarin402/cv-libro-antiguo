import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { createShadowTwin } from '@/shared/three/shadowTwin'
import { createPageGeometry, createPageSkeleton, BOARD_CUT, PAPER_CUT } from '../geometry/pageGeometry'
import { leafPose } from '../domain/pile'
import { usePageCurl } from '../hooks/usePageCurl'
import { useLeafRoot } from '../hooks/useLeafRoot'

// One leaf: a skinned sheet bound to its own bone chain, wrapped in a group
// that IS bone 0 — usePageCurl drives the group's own rotation as if it
// were the first bone, so the whole leaf swings at the hinge while the
// rest of the chain curls inside it, and useLeafRoot keeps that same group
// bound to its place on the spine. Both read one pose per reading state
// (see leafPose), which is worked out once per page, not per frame.
//
// `board` picks the cut: the two boards keep the book's full footprint and
// the paper is trimmed by the square (see SQUARE), so the paper's edge
// never lands on the board's.
//
// `hingeRef` is how the two boards hand their live pose to the spine, which
// has to be glued to them every frame (see components/Spine). A leaf that
// nothing else reads keeps its own ref and nobody is the wiser.
export default function Page({ number, page, opened, closedBook, board, hingeRef, materials, onClick, onPointerOver, onPointerOut }) {
  const cut = board ? BOARD_CUT : PAPER_CUT
  const geometry = useMemo(() => createPageGeometry(cut.width, cut.height), [cut])
  const ownGroup = useRef()
  const group = hingeRef || ownGroup
  const skinnedMeshRef = useRef()

  const skinnedMesh = useMemo(() => {
    const skeleton = createPageSkeleton(cut.segmentWidth)
    const mesh = new THREE.SkinnedMesh(geometry, materials)
    mesh.receiveShadow = true
    mesh.frustumCulled = false
    mesh.add(skeleton.bones[0])
    mesh.bind(skeleton)
    // Its shadow is cast by a twin with one material instead of its own
    // six: the candle's shadow pass draws a leaf once per group per cube
    // face, and the ten leaves were 360 of the frame's 494 draw calls.
    mesh.add(createShadowTwin(mesh))
    return mesh
  }, [geometry, materials, cut])

  const pose = useMemo(() => leafPose(number, page), [number, page])
  usePageCurl(group, skinnedMeshRef, pose.angles, opened, closedBook)
  useLeafRoot(group, pose, page)

  return (
    <group ref={group} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      <primitive object={skinnedMesh} ref={skinnedMeshRef} />
    </group>
  )
}
