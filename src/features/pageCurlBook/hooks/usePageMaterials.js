import { useMemo } from 'react'
import * as THREE from 'three'
import { createCoverBumpTexture } from '@/features/book'
import { PAGE_COUNT } from '../domain/pageCurl'
import { createPaperTexture, createPaperBumpTexture } from '../textures/paperTexture'
import { printBook, createPageTexture } from '../textures/pageTexture'
import { createDoublureTexture, createLeatherGrainTexture } from '../textures/doublureTexture'

// The book's materials: paper for the leaves, each with its own two pages
// printed on it (see textures/pageTexture), and leather for the two
// boards. The boards' outer face is a picture, asked for: the front board
// cut out of a render of the whole book, spine and table trimmed off. The
// cut is 431 x 603 px, 0.715 wide-to-tall against the board's 0.740, so it
// is stretched 3.5% across — less than the cut can be moved by a pixel of
// shadow at its edges. The relief is that same picture read as height, as
// the floor does: the gilt is the brightest thing on it, and stands up.
// The inside of the boards is plain leather of the same hide (see
// textures/doublureTexture).
//
// The paper is an old book's (see textures/paperTexture): ivory, matte, its
// cut edges toned darker still, and a near-black gutter down the spine
// edge. It started as the tutorial's set — white all round and the faces
// glossy, roughness 0.1, for photographs — which under the candle read as
// a magazine. BoxGeometry's face-group order is +x, -x, +y, -y, +z, -z —
// -x is the hinge side, and the last two are the faces: +z looks up out of
// the closed book (the front board's tooled face) and -z down at the table
// (the back board's). The boards' four edges get flat leather, not the
// map: a 3mm strip takes the whole texture across itself and would smear a
// fragment of gilt border along the cut.
//
// The paper's edges: the toned colour old paper takes where it is cut and
// exposed, darker than the face it bounds.
const PAPER_EDGE_COLOR = 0xd8c59c
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

// `pages` is what the book prints, in reading order (see textures/
// pageTexture for what a page is). Painting is done once, here: sixteen
// canvases of paper and type.
export function usePageMaterials(pages = []) {
  return useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({ color: PAPER_EDGE_COLOR, roughness: 0.95 })
    const gutter = new THREE.MeshStandardMaterial({ color: GUTTER_COLOR })
    const paperBump = createPaperBumpTexture()
    const face = (map) =>
      new THREE.MeshStandardMaterial({ map, bumpMap: paperBump, bumpScale: 0.002, roughness: 0.9, metalness: 0, color: 0xffffff })
    const blank = face(createPaperTexture())
    // The pages, in reading order. The first lands on leaf 1's front — the
    // right-hand page opposite the front board — and its back is the next
    // left-hand page, so leaf n carries pages 2n-2 and 2n-1. A leaf with no
    // page left to print stays blank paper.
    const printed = printBook(pages).map((sheet) => face(createPageTexture(sheet)))
    const paper = Array.from({ length: PAGE_COUNT }, (_, n) => [
      edge,
      gutter,
      edge,
      edge,
      printed[2 * n - 2] || blank,
      printed[2 * n - 1] || blank,
    ])

    const tooled = new THREE.MeshStandardMaterial({
      map: loadCover(THREE.SRGBColorSpace),
      bumpMap: loadCover(THREE.NoColorSpace),
      bumpScale: 0.005,
      roughness: 0.92,
      metalness: 0.02,
      color: 0xffffff,
    })
    const doublure = new THREE.MeshStandardMaterial({
      map: createDoublureTexture('#' + LEATHER_COLOR.toString(16).padStart(6, '0')),
      bumpMap: createLeatherGrainTexture(),
      bumpScale: 0.003,
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
    // shadow map, so the strip shadowed itself — the candle had no bias —
    // in fine arcs over the part lying on the front board (shadow acne).
    // Only the faces whose outside looks away from the light cast, which
    // are dark anyway. That measured 20.2 -> 0.58 in neighbour-pixel detail
    // on a close-up of the strip, the same as not receiving shadow at all,
    // while it still receives the rest's. The strip is wound facing out now
    // (see spineGeometry), so those faces are its back ones: BackSide, which
    // measured as clean as FrontSide did before (3.25 against 3.23).
    const spine = new THREE.MeshStandardMaterial({
      color: LEATHER_COLOR,
      bumpMap: createCoverBumpTexture(),
      bumpScale: 0.004,
      roughness: 0.88,
      metalness: 0.03,
      side: THREE.DoubleSide,
      shadowSide: THREE.BackSide,
    })

    return {
      paper,
      frontCover: [cut, cut, cut, cut, tooled, doublure],
      backCover: [cut, cut, cut, cut, doublure, tooled],
      spine,
    }
  }, [pages])
}
