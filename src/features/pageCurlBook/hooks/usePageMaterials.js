import { useMemo } from 'react'
import * as THREE from 'three'
import { createCoverTexture, createCoverBumpTexture, createCoverInnerTexture } from '@/features/book'

// Three material sets: blank paper for the leaves, and the real book's own
// leather for the two boards, so the second book reads as the same edition
// rather than a different prop. The tooling is painted on a square canvas
// and stretched over whatever face it lands on; the two books' covers are
// 0.740 and 0.744 wide-to-tall, so the design arrives here at the same
// proportions it has over there. Each book paints its own leather, so the
// gilt matches but the grain and the wear don't repeat.
//
// The paper is the tutorial's own set: white all round, a near-black
// gutter down the spine edge, and the two faces glossy (roughness 0.1,
// their value) so the candle catches a leaf as it turns. BoxGeometry's
// face-group order is +x, -x, +y, -y, +z, -z — -x is the hinge side, and
// the last two are the faces: +z looks up out of the closed book (the
// front board's tooled face) and -z down at the table (the back board's).
// The boards' four edges get flat leather, not the map: a 3mm strip takes
// the whole texture across itself and would smear a fragment of gilt
// border along the cut.
const PAPER_COLOR = 0xffffff
const GUTTER_COLOR = 0x111111
// The flat leather on the boards' cut edges. It has no map, so it has to be
// the green the cover texture is painted at — otherwise the four edges give
// the binding away as brown from every angle but straight on.
const LEATHER_COLOR = 0x1f342e

export function usePageMaterials() {
  return useMemo(() => {
    const paper = () => new THREE.MeshStandardMaterial({ color: PAPER_COLOR })
    const gutter = new THREE.MeshStandardMaterial({ color: GUTTER_COLOR })
    const face = new THREE.MeshStandardMaterial({ color: PAPER_COLOR, roughness: 0.1 })

    const tooled = new THREE.MeshStandardMaterial({
      map: createCoverTexture(),
      bumpMap: createCoverBumpTexture(),
      bumpScale: 0.005,
      roughness: 0.92,
      metalness: 0.02,
      color: 0xffffff,
    })
    const doublure = new THREE.MeshStandardMaterial({
      map: createCoverInnerTexture(),
      roughness: 0.88,
      metalness: 0.015,
      color: 0xffffff,
    })
    const cut = new THREE.MeshStandardMaterial({ color: LEATHER_COLOR, roughness: 0.9, metalness: 0.03 })
    // The spine's leather. Same hide as the boards' cut edges, and the same
    // green the cover is painted at, so the back reads as one piece with
    // them. DoubleSide because the strip has no thickness of its own and
    // the fold is looked into from both sides; the bump gives the grain
    // something to catch the candle with, since it carries no map.
    //
    // shadowSide: a DoubleSide material also draws both sides into the
    // shadow map, so the strip shadowed itself — the candle has no bias —
    // in fine arcs over the part lying on the front board (shadow acne).
    // The strip's winding faces in, toward the boards (see spineGeometry),
    // so FrontSide casts only from the parts whose outside looks away from
    // the light, which are dark anyway. Measured on a close-up of the
    // strip, neighbour-pixel detail went from 20.2 to 0.58 — the same as
    // not receiving shadow at all — while it still receives the rest's.
    const spine = new THREE.MeshStandardMaterial({
      color: LEATHER_COLOR,
      bumpMap: createCoverBumpTexture(),
      bumpScale: 0.004,
      roughness: 0.88,
      metalness: 0.03,
      side: THREE.DoubleSide,
      shadowSide: THREE.FrontSide,
    })

    return {
      paper: [paper(), gutter, paper(), paper(), face, face],
      frontCover: [cut, cut, cut, cut, tooled, doublure],
      backCover: [cut, cut, cut, cut, doublure, tooled],
      spine,
    }
  }, [])
}
