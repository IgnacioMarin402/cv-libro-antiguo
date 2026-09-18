import { useMemo } from 'react'
import * as THREE from 'three'
import { createCoverTexture, createCoverBumpTexture, createCoverInnerTexture } from '../textures/coverTextures'
import { createPagesTexture } from '../textures/pagesTexture'

// Every surface the book is made of, built once and shared by all its
// parts. Which face of a board gets which material is a binding decision,
// so it lives here rather than in the components that render them.
export function useBookMaterials() {
  const coverTex = useMemo(() => createCoverTexture(), [])
  const coverBump = useMemo(() => createCoverBumpTexture(), [])
  const coverInnerTex = useMemo(() => createCoverInnerTexture(), [])
  const pagesTex = useMemo(() => createPagesTexture(), [])

  const coverMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: coverTex,
        bumpMap: coverBump,
        bumpScale: 0.005,
        roughness: 0.92,
        metalness: 0.02,
        color: 0xffffff,
      }),
    [coverTex, coverBump]
  )
  // Plain, untooled leather for the doublure (inside face) — same leather
  // family as the outer cover, but no gilt, so opening the book reveals a
  // deliberately bare surface instead of a mirrored front.
  const coverInnerMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: coverInnerTex, roughness: 0.88, metalness: 0.015, color: 0xffffff }),
    [coverInnerTex]
  )
  // DoubleSide guards the thin perimeter skirt of the bendable page mesh
  // (see pageGridGeometry): once a leaf curls, its skirt triangles can tilt
  // enough that a strict front-face-only material would cull them from
  // some viewing angles, showing a gap through the edge of the page.
  const pagesMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: pagesTex, roughness: 0.95, metalness: 0, color: 0xffffff, side: 0 }),
    [pagesTex]
  )
  // Plain leather tone (no map) rather than reusing coverMat: the spine's
  // extrusion isn't UV-normalized like the cover faces, so sampling the
  // gilt-covered coverTex there would smear a stray fragment of border or
  // corner ornament onto the spine edge. DoubleSide because the spine is a
  // zero-thickness bridge strip (see geometry/spineGeometry) rather than a
  // solid cap — a single-sided sheet would vanish when its curve turns it
  // away from the camera, e.g. viewed from inside the open book.
  const spineMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.9, metalness: 0.03, side: THREE.DoubleSide }),
    []
  )
  // Front cover: underside (facing the pages when closed) is the plain
  // doublure, outward face is the gilt-tooled leather.
  const topCoverMaterials = useMemo(() => [coverInnerMat, coverMat, coverMat], [coverInnerMat, coverMat])
  // Back cover: underside (facing the table) is the gilt-tooled leather —
  // antique bindings are typically tooled on both boards — top face
  // (facing the pages) is the plain doublure, matching the front cover's
  // convention. Without this split, turning every page away exposes the
  // ornate outer texture where the bare inner one belongs (see PageLeaf).
  const bottomCoverMaterials = useMemo(() => [coverMat, coverMat, coverInnerMat], [coverMat, coverInnerMat])

  return { pagesMat, spineMat, frontCoverMaterials: topCoverMaterials, backCoverMaterials: bottomCoverMaterials }
}
