import { useMemo } from 'react'
import * as THREE from 'three'
import { wornRect, extrudeFlat } from '../utils/geometry'
import { createCoverTexture, createCoverBumpTexture, createPagesTexture } from '../utils/textures'
import { BOOK, topSurfaceY } from '../utils/constants'

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
        bumpScale: 0.006,
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
  const brassMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0x6b4a24, roughness: 0.5, metalness: 0.55 }),
    []
  )
  const darkGrooveMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0x2c1c0f, roughness: 0.9, metalness: 0.1 }),
    []
  )

  const topCoverGeo = useMemo(
    () => extrudeFlat(wornRect(coverW, coverH, { jitter: 0.0018, spineJitter: 0.0004, segs: 8 }), coverT),
    [coverW, coverH, coverT]
  )
  const bottomCoverGeo = useMemo(
    () => extrudeFlat(wornRect(coverW, coverH, { jitter: 0.0018, spineJitter: 0.0004, segs: 8 }), coverT),
    [coverW, coverH, coverT]
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

  const bossR = coverW * 0.16
  const barH = bossR * 1.1

  return (
    <group rotation-y={0.06}>
      <mesh geometry={topCoverGeo} material={coverMat} position-y={coverT + pagesT} castShadow receiveShadow />
      <mesh geometry={bottomCoverGeo} material={coverMat} receiveShadow />
      <mesh geometry={pagesGeo} material={pagesMat} position-y={coverT} castShadow receiveShadow />
      <mesh geometry={spineGeo} material={coverMat} position={[-coverW / 2 + 0.003, 0, 0]} castShadow />

      {/* emblem: raised brass boss + ring + roman numeral I */}
      <group position={[0, 0, -coverH * 0.16]}>
        <mesh material={darkGrooveMat} position-y={topSurfaceY + 0.001} castShadow>
          <cylinderGeometry args={[bossR * 1.16, bossR * 1.2, 0.004, 40]} />
        </mesh>
        <mesh material={brassMat} position-y={topSurfaceY + 0.008} castShadow>
          <cylinderGeometry args={[bossR, bossR * 1.04, 0.014, 40]} />
        </mesh>
        <mesh material={darkGrooveMat} position-y={topSurfaceY + 0.017} rotation-x={Math.PI / 2} castShadow>
          <torusGeometry args={[bossR * 0.88, 0.006, 10, 48]} />
        </mesh>
        <mesh material={darkGrooveMat} position-y={topSurfaceY + 0.017} castShadow>
          <boxGeometry args={[bossR * 0.22, 0.02, barH]} />
        </mesh>
        {[1, -1].map((s) => (
          <mesh key={s} material={darkGrooveMat} position={[0, topSurfaceY + 0.017, (s * barH) / 2]} castShadow>
            <boxGeometry args={[bossR * 0.55, 0.02, bossR * 0.18]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
