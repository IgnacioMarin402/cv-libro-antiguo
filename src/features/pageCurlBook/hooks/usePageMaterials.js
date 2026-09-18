import { useMemo } from 'react'
import * as THREE from 'three'

// Two blank material sets — no canvas textures, no photographs. The paper
// is the tutorial's own set: white all round, a near-black gutter down the
// spine edge, and the two faces glossy (roughness 0.1, their value) so the
// candle catches a sheet as it turns. The covers are the same leather
// brown the real book's spine uses (see features/book/hooks/useBookMaterials),
// so the closed block reads as a bound book and not as a ream of paper.
// BoxGeometry's face-group order is +x, -x, +y, -y, +z, -z — -x is the
// hinge side and the last two are the leaf's faces. Every leaf shares one
// of the two sets, the same material-sharing convention the real book uses.
const PAPER_COLOR = 0xffffff
const GUTTER_COLOR = 0x111111
const LEATHER_COLOR = 0x6b4423

export function usePageMaterials() {
  return useMemo(() => {
    const paper = () => new THREE.MeshStandardMaterial({ color: PAPER_COLOR })
    const gutter = new THREE.MeshStandardMaterial({ color: GUTTER_COLOR })
    const face = new THREE.MeshStandardMaterial({ color: PAPER_COLOR, roughness: 0.1 })
    const leather = new THREE.MeshStandardMaterial({ color: LEATHER_COLOR, roughness: 0.9, metalness: 0.03 })
    return {
      paper: [paper(), gutter, paper(), paper(), face, face],
      cover: new Array(6).fill(leather),
    }
  }, [])
}
