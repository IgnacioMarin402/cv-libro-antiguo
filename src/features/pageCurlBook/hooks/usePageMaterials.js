import { useMemo } from 'react'
import * as THREE from 'three'
import { createCoverBumpTexture, createCoverInnerTexture } from '@/features/book'

// Three material sets: blank paper for the leaves, and leather for the two
// boards. The boards' outer face is a picture, asked for: the front board
// cut out of a render of the whole book, spine and table trimmed off. The
// cut is 431 x 603 px, 0.715 wide-to-tall against the board's 0.740, so it
// is stretched 3.5% across — less than the cut can be moved by a pixel of
// shadow at its edges. The relief is that same picture read as height, as
// the floor does: the gilt is the brightest thing on it, and stands up.
// The inside of the boards is still features/book's painted doublure.
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
// the red the cover picture is — otherwise the four edges give the binding
// away from every angle but straight on. Averaged in linear light over the
// plain field between the top corner plates (#50231d) and the bottom ones
// (#3c1612, darker under the picture's vignette), and taken about midway.
const LEATHER_COLOR = 0x461d18
const COVER_URL = '/textures/book/cover.webp'

// Not useLoader: that suspends, and the whole book would wait on one
// picture. The board shows untextured for the moment it takes to load.
// Loaded twice, once per colour space; the second is the browser's cache.
function loadCover(colorSpace) {
  const tex = new THREE.TextureLoader().load(COVER_URL)
  tex.colorSpace = colorSpace
  return tex
}

export function usePageMaterials() {
  return useMemo(() => {
    const paper = () => new THREE.MeshStandardMaterial({ color: PAPER_COLOR })
    const gutter = new THREE.MeshStandardMaterial({ color: GUTTER_COLOR })
    const face = new THREE.MeshStandardMaterial({ color: PAPER_COLOR, roughness: 0.1 })

    const tooled = new THREE.MeshStandardMaterial({
      map: loadCover(THREE.SRGBColorSpace),
      bumpMap: loadCover(THREE.NoColorSpace),
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
    // red as the cover picture, so the back reads as one piece with
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
