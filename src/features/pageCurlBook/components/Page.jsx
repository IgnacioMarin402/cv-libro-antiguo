import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { createPageGeometry, createPageSkeleton } from '../geometry/pageGeometry'
import { usePageCurl } from '../hooks/usePageCurl'
import { useStackOffset } from '../hooks/useStackOffset'

// One leaf: a skinned sheet bound to its own bone chain, wrapped in a group
// that IS bone 0 — usePageCurl drives the group's own rotation as if it
// were the first bone, so the whole leaf swings at the hinge while the
// rest of the chain curls inside it, and useStackOffset rides that same
// group to its place in its pile.
export default function Page({ number, page, opened, closedBook, materials, onClick, onPointerOver, onPointerOut }) {
  const geometry = useMemo(() => createPageGeometry(), [])
  const group = useRef()
  const skinnedMeshRef = useRef()

  const skinnedMesh = useMemo(() => {
    const skeleton = createPageSkeleton()
    const mesh = new THREE.SkinnedMesh(geometry, materials)
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.frustumCulled = false
    mesh.add(skeleton.bones[0])
    mesh.bind(skeleton)
    return mesh
  }, [geometry, materials])

  usePageCurl(group, skinnedMeshRef, number, opened, closedBook)
  useStackOffset(group, number, page)

  return (
    <group ref={group} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      <primitive object={skinnedMesh} ref={skinnedMeshRef} />
    </group>
  )
}
