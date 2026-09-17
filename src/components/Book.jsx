import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { wornRect, extrudeFlat, buildPageGrid, pageGridGeometry, pageSpineBend, computeBentPositions } from '../utils/geometry'
import { createCoverTexture, createCoverBumpTexture, createCoverInnerTexture, createPagesTexture } from '../utils/textures'
import { BOOK, COVER_MAX_ANGLE, SPINE_TILT_ANGLE } from '../utils/constants'

const OPEN_DURATION = 1600
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5)
const easeOutBack = (t) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

// Three page-turn "personalities" — duration, easing and how high the page
// arcs above a straight path mid-flip — picked at random per leaf so pages
// don't all turn with the exact same mechanical motion.
const FLIP_STYLES = [
  { duration: 560, ease: easeInOutCubic, lift: 0.018 },
  { duration: 760, ease: easeOutQuint, lift: 0.055 },
  { duration: 400, ease: easeOutBack, lift: 0.026 },
]
const PAGE_CLOSE_STYLE = { duration: 420, ease: easeInOutCubic, lift: 0 }
const COVER_STYLE = { duration: OPEN_DURATION, ease: easeInOutCubic, lift: 0 }

// The topmost leaves lift slightly as the cover opens (falling off fast
// with depth), so the flat stack meets the curved spine with a soft edge
// instead of a hard corner. Leaf i's max tilt is REST_TILT_BASE *
// REST_TILT_FALLOFF^i.
const REST_TILT_BASE = 0.22
const REST_TILT_FALLOFF = 0.35

// How much to exaggerate a settled leaf's lift off of whatever it's piled
// on, beyond its own physical thickness — see the stackOffset comment in
// Book for why a literal leaf thickness isn't enough to read visually.
const STACK_LIFT_SCALE = 4

const MAX_PAGES = Math.max(1, Number(import.meta.env.VITE_MAX_PAGES) || 16)

// A page leaf's hinge sits right at the spine's flat hinge face, mirroring
// Cover's own hingeX — see PageLeaf for why this is a leftover offset
// rather than the full spine position.
const PAGE_HINGE_X = -0.003

// A half-ellipse cross-section extruded along Z, flat side at local X = 0
// bulging toward -X — the shape behind the spine. `bulge` scales how far it
// sticks out sideways independently of its height (2 * radius, pinned to
// the book's full thickness so it still caps the spine edge to edge) — a
// true half-circle (bulge = 1) sticks out as far as the book is thick,
// which reads as a fat, rounded spine rather than a gentle curve. Also
// what visually hides the hinge-side edge of each cover (and each page's
// own permanent wrap toward the spine, see pageSpineBend) from view —
// without it, that raw edge is exposed at an angle where it can clip
// through the cover it's meant to tuck behind.
function halfCylinderGeo(radius, depth, segs = 20, bulge = 1) {
  const shape = new THREE.Shape()
  shape.moveTo(0, 2 * radius)
  for (let i = 1; i <= segs; i++) {
    const t = i / segs
    const angle = Math.PI / 2 + Math.PI * t
    shape.lineTo(radius * bulge * Math.cos(angle), radius + radius * Math.sin(angle))
  }
  shape.lineTo(0, 2 * radius)
  shape.closePath()
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 1 })
  geo.translate(0, 0, -depth / 2)
  return geo
}

// Animates a pivot group's Z rotation toward `targetAngle`, for a panel
// whose hinge height never changes (a cover: front or back, each always
// swinging around its own fixed axis). Captures the live angle whenever
// the target changes, so retargeting mid-swing continues smoothly instead
// of jumping — this is what lets the target drift continuously (as the
// covers trade places over the course of reading, see Book) rather than
// only ever toggling between two fixed endpoints. `sharedAngleRef`, if
// given, is used as the angle store instead of a private one — lets
// another object (the resting pages) read the cover's live *absolute*
// angle each frame without re-deriving it. `parentAngleRef`, if given, is
// subtracted from the angle actually applied to the group's rotation — for
// a cover nested inside the spine's own tilting group (see Cover),
// `targetAngle` is still its absolute open target, but the parent already
// contributes `parentAngleRef.current` of rotation, so only the remainder
// needs to be applied locally. Without this, nesting would add the two,
// over-rotating the cover past its intended angle.
function useHingeRotation(groupRef, targetAngle, style, sharedAngleRef, parentAngleRef) {
  const ownAngleRef = useRef(0)
  const angleRef = sharedAngleRef || ownAngleRef
  const animRef = useRef(null)
  const prevTargetRef = useRef(targetAngle)

  useEffect(() => {
    if (targetAngle !== prevTargetRef.current) {
      animRef.current = { from: angleRef.current, to: targetAngle, start: performance.now() }
      prevTargetRef.current = targetAngle
    }
  }, [targetAngle])

  useFrame(() => {
    const anim = animRef.current
    if (anim) {
      const elapsed = performance.now() - anim.start
      const p = style.ease(Math.min(1, elapsed / style.duration))
      angleRef.current = anim.from + (anim.to - anim.from) * p
      if (elapsed >= style.duration) animRef.current = null
    }
    if (groupRef.current) {
      groupRef.current.rotation.z = angleRef.current - (parentAngleRef ? parentAngleRef.current : 0)
    }
  })
}

// A leaf's local hinge-thickness axis (perpendicular to its own flat face)
// mapped into world space at opening angle `angle` — i.e. the direction a
// stack of leaves piles up along, not the direction they sweep open in.
// At angle 0 this points straight up (+Y); as the leaf opens it rotates
// like everything else. Used to lift a settled leaf off of whatever it's
// resting on *along its face*, rather than straight up in world Y, which
// only approximates the right direction while that face is still close to
// horizontal (see usePageFlip's stacking below).
function faceNormal(angle) {
  return { x: Math.sin(angle), y: -Math.cos(angle) }
}

// Animates a page leaf's hinge. Unlike a cover, a page's resting spot
// differs depending on which pile it's in: flat, it sits at its original
// height in the right-hand (unread) stack — tilted up in step with the back
// cover via `backAngleRef`, since it's physically resting on it — while
// flipped, it should land on top of whatever's already piled on the left,
// which grows as more pages turn — and keep following that pile, since the
// front cover itself keeps lowering as reading progresses (see Book), so a
// page can't just settle at a fixed height once its own flip ends. Rather
// than rotating around a fixed axis (which would leave every flipped page
// fanned out at its *original* stack height — later pages ending up lower,
// not higher), the flip interpolates the visible far edge's height directly
// and backs out the pivot position each frame so the edge always lands
// exactly on `flatFarY` or the live front-cover shelf, regardless of the
// rotation's own easing curve.
function usePageFlip(
  groupRef,
  meshRef,
  flipped,
  {
    flatFarY,
    stackOffset,
    sweepRadius,
    maxAngle,
    coverAngleRef,
    coverFarYRef,
    backAngleRef,
    restTilt = 0,
    baseGeometry,
    pageGrid,
    pageT,
    restBend,
    curlAmplitude = 0,
    parentAngleRef,
    pivotYOffset = 0,
  }
) {
  const angleRef = useRef(0)
  const farYRef = useRef(flatFarY)
  // How far along its own face this leaf currently sits off of whatever
  // it's resting on — 0 flat in the unread stack, ramping up to
  // `stackOffset` once it's settled on the read pile (see the stacking
  // comment in the useFrame below).
  const stackRef = useRef(0)
  const animRef = useRef(null)
  const prevRef = useRef(flipped)
  // A private, mutable clone of the shared rest geometry — lazily created
  // on this leaf's first flip and reused for every flip after, so a page
  // mid-turn can bend without disturbing every other leaf sharing
  // `baseGeometry`. The mesh sits back on the shared geometry once a
  // transition ends, so idle pages stay cheap (one geometry for all of
  // them) and only the leaves actually in motion pay for their own copy.
  const dynGeoRef = useRef(null)

  useEffect(() => {
    if (flipped !== prevRef.current) {
      const style = flipped ? FLIP_STYLES[Math.floor(Math.random() * FLIP_STYLES.length)] : PAGE_CLOSE_STYLE
      animRef.current = {
        fromAngle: angleRef.current,
        fromFarY: farYRef.current,
        fromStack: stackRef.current,
        toStack: flipped ? stackOffset : 0,
        start: performance.now(),
        style,
      }
      prevRef.current = flipped
      if (meshRef.current) {
        if (!dynGeoRef.current) dynGeoRef.current = baseGeometry.clone()
        meshRef.current.geometry = dynGeoRef.current
      }
    }
  }, [flipped, stackOffset])

  useFrame(() => {
    const anim = animRef.current
    if (anim) {
      const elapsed = performance.now() - anim.start
      const t = Math.min(1, elapsed / anim.style.duration)
      const eased = anim.style.ease(t)
      const bump = anim.style.lift * Math.sin(Math.min(1, t) * Math.PI)
      // Chases the cover's *live* angle/height each frame rather than a
      // value snapshotted when the flip started — a page's own flip
      // (≤760ms) can finish well before the cover's own 1600ms opening
      // swing does, and interpolating toward a stale snapshot would leave
      // it to snap onto the cover's real position the instant it hands off
      // to the settled branch below, instead of arriving already there.
      const toAngle = flipped ? coverAngleRef.current : 0
      const toFarY = flipped ? coverFarYRef.current : flatFarY
      angleRef.current = anim.fromAngle + (toAngle - anim.fromAngle) * eased
      farYRef.current = anim.fromFarY + (toFarY - anim.fromFarY) * eased + bump
      stackRef.current = anim.fromStack + (anim.toStack - anim.fromStack) * eased

      // A traveling S-shaped flex along the leaf's length, on top of its
      // permanent spine curve — zero at the hinge and fore-edge, peaking
      // mid-turn (elapsed t, not the eased angle) so the page visibly
      // bends as it moves instead of swinging as a rigid flat card.
      const dyn = dynGeoRef.current
      if (dyn) {
        const envelope = Math.sin(Math.PI * t)
        const curl = curlAmplitude > 0 ? (tp) => -curlAmplitude * envelope * Math.sin(Math.PI * 2 * tp) : null
        computeBentPositions(pageGrid, pageT, restBend, curl, dyn.attributes.position.array)
        dyn.attributes.position.needsUpdate = true
        dyn.computeVertexNormals()
      }

      if (elapsed >= anim.style.duration) {
        animRef.current = null
        if (meshRef.current) meshRef.current.geometry = baseGeometry
      }
    } else if (flipped) {
      // Settled on the left (read) pile: lies flat against the front
      // cover's own live surface, so it keeps riding that surface down as
      // more pages join the pile and the front cover keeps lowering.
      angleRef.current = coverAngleRef.current
      farYRef.current = coverFarYRef.current
      stackRef.current = stackOffset
    } else if (backAngleRef) {
      // Resting leaves rigidly follow the back cover's own tilt (hinge
      // fixed at flatFarY, so the near/spine edge never drifts — see
      // Cover), plus a small extra lift on just the topmost few, tracking
      // the front cover's live angle, so the flat stack doesn't meet its
      // curved edge as a hard, unmoving corner right as the book opens.
      const extra = restTilt > 0 && coverAngleRef ? restTilt * (coverAngleRef.current / maxAngle) : 0
      const restAngle = backAngleRef.current + extra
      angleRef.current = restAngle
      farYRef.current = flatFarY + sweepRadius * Math.sin(restAngle)
      stackRef.current = 0
    }
    const g = groupRef.current
    if (g) {
      // Nested inside the spine's own tilting group (see Book), exactly
      // like Cover: subtracting the parent's live lean keeps this leaf's
      // *absolute* opening angle equal to angleRef regardless of how much
      // the spine has rocked, while the pivot itself — being a child of
      // that group — still physically swings along with the spine instead
      // of staying anchored to a point the spine has rotated away from.
      const parentAngle = parentAngleRef ? parentAngleRef.current : 0
      g.rotation.z = angleRef.current - parentAngle
      // stackRef lifts a settled leaf off of whatever it's piled on *along
      // the leaf's own face* (faceNormal), not straight up in world Y. A
      // Y-only lift only clears the surface it's resting on while that
      // surface is still close to horizontal; once open, the front cover
      // rests well past vertical (see COVER_MAX_ANGLE), where a Y-only
      // nudge barely separates a leaf from its face — and can even settle
      // it fractionally *behind*, since the leaf shares the cover's exact
      // rotation. Projecting the offset onto the face normal instead keeps
      // it visibly clear of whatever it's stacked on at any opening angle.
      const n = faceNormal(angleRef.current)
      g.position.x = PAGE_HINGE_X + stackRef.current * n.x
      g.position.y = farYRef.current - sweepRadius * Math.sin(angleRef.current) - pivotYOffset + stackRef.current * n.y
    }
  })
}

// A cover panel (front or back): hinges at (hingeX, hingeY), swinging open
// like a real cover. Rendered as a child of the spine's own tilting group
// (see Book), at a hingeX right at the spine's flat hinge face, so the
// cover's near edge stays pinned to the spine — and tilts rigidly with it —
// instead of hinging from a fixed point the spine has rotated away from. No
// separate rolled-edge cap is needed: rotating one around this pivot would
// sweep its bulge to the wrong side past ~90° (it'd point into the book
// instead of away from it), carving a visible notch into the spine.
function Cover({ geometry, material, hingeX, hingeY, farX, targetAngle, angleRef, parentAngleRef, onClick, onPointerOver, onPointerOut }) {
  const hingeRef = useRef(null)
  useHingeRotation(hingeRef, targetAngle, COVER_STYLE, angleRef, parentAngleRef)

  return (
    <group ref={hingeRef} position={[hingeX, hingeY, 0]}>
      <mesh
        geometry={geometry}
        material={material}
        position={[farX, 0, 0]}
        castShadow
        receiveShadow
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      />
    </group>
  )
}

// A single page leaf. See usePageFlip for why its hinge height animates
// too, not just its rotation — and why the mesh needs its own ref, not
// just the hinge group's: a flipping leaf swaps onto a private bent
// geometry for the duration of its turn.
function PageLeaf({
  geometry,
  material,
  flatFarY,
  stackOffset,
  sweepRadius,
  flipped,
  coverAngleRef,
  coverFarYRef,
  backAngleRef,
  restTilt,
  pageGrid,
  pageT,
  restBend,
  curlAmplitude,
  parentAngleRef,
  pivotYOffset,
  onClick,
  onPointerOver,
  onPointerOut,
}) {
  const hingeRef = useRef(null)
  const meshRef = useRef(null)
  usePageFlip(hingeRef, meshRef, flipped, {
    flatFarY,
    stackOffset,
    sweepRadius,
    maxAngle: COVER_MAX_ANGLE,
    coverAngleRef,
    coverFarYRef,
    backAngleRef,
    restTilt,
    baseGeometry: geometry,
    pageGrid,
    pageT,
    restBend,
    curlAmplitude,
    parentAngleRef,
    pivotYOffset,
  })

  // position.x starts at PAGE_HINGE_X (mirroring Cover's own hingeX) and is
  // then adjusted every frame in usePageFlip's useFrame, so it isn't set
  // here as a static prop.
  return (
    <group ref={hingeRef} position-x={PAGE_HINGE_X} position-z={0}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        position={[sweepRadius / 2, 0, 0]}
        castShadow
        receiveShadow
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      />
    </group>
  )
}

export default function Book({ open = false, onOpenChange }) {
  const { coverW, coverH, coverT, pagesT } = BOOK

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
  // corner ornament onto the spine edge.
  const spineMat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.9, metalness: 0.03 }), [])
  const coverUV = useMemo(() => ({ width: coverW, height: coverH }), [coverW, coverH])
  // splitCaps gives each cover three material groups (inside / side /
  // outside) instead of one, so the doublure can use coverInnerMat while
  // the outer face keeps the gilt-tooled coverMat.
  const topCoverGeo = useMemo(
    () =>
      extrudeFlat(wornRect(coverW, coverH, { jitter: 0.0018, spineJitter: 0.0004, segs: 8 }), coverT, {
        uv: coverUV,
        splitCaps: true,
      }),
    [coverW, coverH, coverT, coverUV]
  )
  // Front cover: underside (facing the pages when closed) is the plain
  // doublure, outward face is the gilt-tooled leather.
  const topCoverMaterials = useMemo(() => [coverInnerMat, coverMat, coverMat], [coverInnerMat, coverMat])
  const bottomCoverGeo = useMemo(
    () =>
      extrudeFlat(wornRect(coverW, coverH, { jitter: 0.0018, spineJitter: 0.0004, segs: 8 }), coverT, {
        uv: coverUV,
        splitCaps: true,
      }),
    [coverW, coverH, coverT, coverUV]
  )
  // Back cover: underside (facing the table) is the gilt-tooled leather —
  // antique bindings are typically tooled on both boards — top face
  // (facing the pages) is the plain doublure, matching the front cover's
  // convention. Without this split, turning every page away exposes the
  // ornate outer texture where the bare inner one belongs (see PageLeaf).
  const bottomCoverMaterials = useMemo(() => [coverMat, coverMat, coverInnerMat], [coverMat, coverInnerMat])

  // Radius of the book's spine curve, used to position the covers' and
  // pages' hinges. Also rendered as the rounded spine cap itself (see
  // spineGeo) — without a mesh there, the covers' and pages' hinge-side
  // edges sit exposed instead of tucked behind it.
  const spineR = (2 * coverT + pagesT) / 2 + 0.0003
  const spineGeo = useMemo(() => halfCylinderGeo(spineR, coverH, 20, 0.4), [spineR, coverH])

  const pageW = coverW * 0.985
  const pageT = pagesT / MAX_PAGES
  // Grid topology (+ jittered rest coordinates) for a leaf, built once and
  // shared by every page's geometry — bending only ever moves these same
  // vertices, never reshapes the mesh itself. segsX subdivides the bend
  // axis (spine → fore-edge) finely enough to curve smoothly; segsZ just
  // needs enough rows for a believably uneven fore-edge.
  const pageGrid = useMemo(
    () => buildPageGrid(pageW, coverH * 0.98, { segsX: 18, segsZ: 6, edgeJitter: 0.004, spineJitter: 0.0003 }),
    [pageW, coverH]
  )
  // Permanent curve every leaf keeps near its hinge — a graceful sweep
  // spanning a good third of the leaf's own length, not a tight bump
  // confined to the first few millimeters, so it reads the way a real
  // page's own give does (a long, soft droop) rather than as a hard crease
  // stamped right at the edge. The peak height is still capped well under
  // a cover's thickness (closed pages sit flush under one — see
  // pageSpineBend), so stretching the run out doesn't risk poking through
  // it; it only makes the curve gentler per unit length.
  const pageRestBend = useMemo(() => pageSpineBend(spineR * 0.15, spineR * 0.18, pageW * 0.3), [spineR, pageW])
  // The shared, static geometry every leaf renders with at rest. Leaves
  // only ever swap onto a private clone of this while actively flipping
  // (see usePageFlip) — idle pages stay a single cheap instance.
  const pageGeo = useMemo(() => pageGridGeometry(pageGrid, pageT, pageRestBend), [pageGrid, pageT, pageRestBend])
  // How far a flipping leaf's traveling S-curl bulges, scaled to the page
  // size so it reads as paper bending rather than a fixed, size-blind wobble.
  const pageCurlAmplitude = pageW * 0.07

  // How many leaves (counting from the front cover inward) have been turned
  // onto the left pile. Resets whenever the book closes.
  const [pagesTurned, setPagesTurned] = useState(0)
  useEffect(() => {
    if (!open) setPagesTurned(0)
  }, [open])

  // The front cover's live opening angle, shared with the topmost page
  // leaves so their extra resting lift can track it (see usePageFlip), and
  // with every already-flipped leaf so the read pile keeps riding the
  // cover's surface down as it lowers (see below).
  const coverAngleRef = useRef(0)
  // The back cover's live opening angle, shared with every resting page
  // leaf so the whole unread stack lifts together with it instead of
  // staying glued flat to the table while only the front cover moves.
  const backAngleRef = useRef(0)
  // The front cover's live far-edge height — the shelf the read pile
  // stacks up from. Recomputed every frame from coverAngleRef rather than
  // once from a fixed angle, since the cover itself keeps lowering as more
  // pages are turned (see the front/back target split below).
  const coverFarYRef = useRef(coverT + pagesT)
  useFrame(() => {
    coverFarYRef.current = coverT + pagesT + coverW * Math.sin(coverAngleRef.current)
  })

  const frontTarget = open ? COVER_MAX_ANGLE : 0
  // The back cover stays flat, pinned under the full unread stack, until
  // pages start moving off of it onto the front cover — then it rises
  // toward the same resting angle in step with how much of that stack has
  // been read away, reaching it only once every page has turned.
  const backTarget = open ? COVER_MAX_ANGLE * (pagesTurned / MAX_PAGES) : 0

  // The spine's own lean, animated on the same open/close trigger and
  // timing as the covers so it visibly moves with them, not after them.
  const spineHingeRef = useRef(null)
  const spineAngleRef = useRef(0)
  useHingeRotation(spineHingeRef, open ? SPINE_TILT_ANGLE : 0, COVER_STYLE, spineAngleRef)

  const handleCoverClick = (e) => {
    e.stopPropagation()
    onOpenChange?.(!open)
  }
  const handleCloseClick = (e) => {
    if (!open) return
    e.stopPropagation()
    onOpenChange?.(false)
  }
  const handleTurnClick = (e) => {
    if (!open) return
    e.stopPropagation()
    setPagesTurned((n) => Math.min(MAX_PAGES, n + 1))
  }
  const handlePointerOver = (e) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
  }
  const handlePointerOut = () => {
    document.body.style.cursor = 'auto'
  }

  return (
    <group rotation-y={0.06}>
      {/* The spine's own tilt group is the shared parent for the covers
          *and* the pages: all three hinge right at its flat face, so
          they're carried along rigidly as it leans, instead of hinging
          from a point it has rotated away from (see Cover and
          usePageFlip's parentAngleRef compensation) — without this, pages
          would stay anchored to a fixed point while the spine rocked away
          from them, opening a visible gap at the gutter. */}
      <group ref={spineHingeRef} position={[-coverW / 2 + 0.003, spineR, 0]}>
        <mesh geometry={spineGeo} material={spineMat} position={[0, -spineR, 0]} castShadow />
        {Array.from({ length: MAX_PAGES }, (_, i) => {
          const flipped = i < pagesTurned
          // Flat (unread, right-hand stack): leaf i keeps its original slot,
          // i = 0 topmost, right under the front cover.
          const flatFarY = coverT + pagesT - (i + 1) * pageT
          // Flipped (read, left-hand stack): leaves land on top of the
          // front cover's own live surface, not at the hinge line — leaf i
          // stacks i leaf-thicknesses above leaf 0, same as a real pile
          // (see coverFarYRef). STACK_LIFT_SCALE only pads the *base*
          // clearance off the cover itself, not the per-leaf spacing above
          // it — it must stay an additive offset, not a multiplier, or
          // every leaf ends up STACK_LIFT_SCALE thicknesses from its
          // neighbor instead of one, fanning the whole pile out. The pad is
          // needed because at the cover's own steep resting angle, a single
          // true pageT of separation along the face normal (see faceNormal
          // in usePageFlip) projects to only a couple of screen pixels from
          // a normal viewing distance — not enough to read as "on top of
          // the cover" rather than fused with it.
          const stackOffset = (i + STACK_LIFT_SCALE) * pageT
          const restTilt = REST_TILT_BASE * Math.pow(REST_TILT_FALLOFF, i)
          return (
            <PageLeaf
              key={i}
              geometry={pageGeo}
              material={pagesMat}
              flatFarY={flatFarY}
              stackOffset={stackOffset}
              sweepRadius={pageW}
              flipped={flipped}
              coverAngleRef={coverAngleRef}
              coverFarYRef={coverFarYRef}
              backAngleRef={backAngleRef}
              restTilt={restTilt}
              pageGrid={pageGrid}
              pageT={pageT}
              restBend={pageRestBend}
              curlAmplitude={pageCurlAmplitude}
              parentAngleRef={spineAngleRef}
              pivotYOffset={spineR}
              onClick={flipped ? handleCloseClick : handleTurnClick}
              onPointerOver={handlePointerOver}
              onPointerOut={handlePointerOut}
            />
          )
        })}
        <Cover
          geometry={topCoverGeo}
          material={topCoverMaterials}
          hingeX={-0.003}
          hingeY={coverT + pagesT - spineR}
          farX={coverW / 2}
          targetAngle={frontTarget}
          angleRef={coverAngleRef}
          parentAngleRef={spineAngleRef}
          onClick={handleCoverClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        />
        <Cover
          geometry={bottomCoverGeo}
          material={bottomCoverMaterials}
          hingeX={-0.003}
          hingeY={-spineR}
          farX={coverW / 2}
          targetAngle={backTarget}
          angleRef={backAngleRef}
          parentAngleRef={spineAngleRef}
        />
      </group>
    </group>
  )
}
