import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { createPageGeometry, createPageSkeleton, BOARD_CUT, PAPER_CUT } from '../geometry/pageGeometry'
import { usePageCurl } from '../hooks/usePageCurl'
import { useStackOffset } from '../hooks/useStackOffset'

// One leaf: a skinned sheet bound to its own bone chain, wrapped in a group
// that IS bone 0 — usePageCurl drives the group's own rotation as if it
// were the first bone, so the whole leaf swings at the hinge while the
// rest of the chain curls inside it, and useStackOffset rides that same
// group to its place in its pile.
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
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.frustumCulled = false
    mesh.add(skeleton.bones[0])
    mesh.bind(skeleton)
    return mesh
  }, [geometry, materials, cut])

  usePageCurl(group, skinnedMeshRef, number, opened, closedBook)
  useStackOffset(group, number, page)

  return (
    <group ref={group} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      <primitive object={skinnedMesh} ref={skinnedMeshRef} />
    </group>
  )
}
