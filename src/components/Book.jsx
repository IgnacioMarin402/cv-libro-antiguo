import { useMemo } from 'react'
import * as THREE from 'three'
import { wornRect, extrudeFlat } from '../utils/geometry'
import { createCoverTexture, createCoverBumpTexture, createPagesTexture } from '../utils/textures'
import { BOOK } from '../utils/constants'

export default function Book() {
  const { coverW, coverH, coverT, pagesT } = BOOK

  const coverTex = useMemo(() => createCoverTexture(), [])
  const coverBump = useMemo(() => createCoverBumpTexture(), [])
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
  const pagesMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: pagesTex, roughness: 0.95, metalness: 0, color: 0xffffff }),
    [pagesTex]
  )
  // Plain leather tone (no map) rather than reusing coverMat: the spine's
  // extrusion isn't UV-normalized like the cover faces, so sampling the
  // gilt-covered coverTex there would smear a stray fragment of border or
  // corner ornament onto the spine edge.
  const spineMat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.9, metalness: 0.03 }), [])

  const coverUV = useMemo(() => ({ width: coverW, height: coverH }), [coverW, coverH])
  const topCoverGeo = useMemo(
    () => extrudeFlat(wornRect(coverW, coverH, { jitter: 0.0018, spineJitter: 0.0004, segs: 8 }), coverT, { uv: coverUV }),
    [coverW, coverH, coverT, coverUV]
  )
  const bottomCoverGeo = useMemo(
    () => extrudeFlat(wornRect(coverW, coverH, { jitter: 0.0018, spineJitter: 0.0004, segs: 8 }), coverT, { uv: coverUV }),
    [coverW, coverH, coverT, coverUV]
  )
  const pagesGeo = useMemo(
    () =>
      extrudeFlat(wornRect(coverW * 0.985, coverH * 0.98, { jitter: 0.005, spineJitter: 0.0004, segs: 9 }), pagesT),
    [coverW, coverH, pagesT]
  )

  // Spine: half-circle cross-section extruded along the book's length (Z).
  const spineGeo = useMemo(() => {
    const spineR = (2 * coverT + pagesT) / 2 + 0.0003
    const spineSegs = 20
    const spineShape = new THREE.Shape()
    spineShape.moveTo(0, 2 * spineR)
    for (let i = 1; i <= spineSegs; i++) {
      const t = i / spineSegs
      const angle = Math.PI / 2 + Math.PI * t
      spineShape.lineTo(spineR * Math.cos(angle), spineR + spineR * Math.sin(angle))
    }
    spineShape.lineTo(0, 2 * spineR)
    spineShape.closePath()
    const spineDepth = coverH * 1.0
    const geo = new THREE.ExtrudeGeometry(spineShape, { depth: spineDepth, bevelEnabled: false, curveSegments: 1 })
    geo.translate(0, 0, -spineDepth / 2)
    return geo
  }, [coverT, pagesT, coverH])

  return (
    <group rotation-y={0.06}>
      <mesh geometry={topCoverGeo} material={coverMat} position-y={coverT + pagesT} castShadow receiveShadow />
      <mesh geometry={bottomCoverGeo} material={coverMat} receiveShadow />
      <mesh geometry={pagesGeo} material={pagesMat} position-y={coverT} castShadow receiveShadow />
      <mesh geometry={spineGeo} material={spineMat} position={[-coverW / 2 + 0.003, 0, 0]} castShadow />
    </group>
  )
}
