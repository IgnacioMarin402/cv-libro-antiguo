import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { wornRect, extrudeFlat } from '../utils/geometry'
import { createCoverTexture, createCoverBumpTexture, createCoverInnerTexture, createPagesTexture } from '../utils/textures'
import { BOOK, OPEN_ANGLE, BACK_OPEN_ANGLE, SPINE_TILT_ANGLE } from '../utils/constants'

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

const MAX_PAGES = Math.max(1, Number(import.meta.env.VITE_MAX_PAGES) || 16)

// A half-ellipse cross-section extruded along Z, flat side at local X = 0
// bulging toward -X — the shape behind the spine. `bulge` scales how far it
// sticks out sideways independently of its height (2 * radius, pinned to
// the book's full thickness so it still caps the spine edge to edge) — a
// true half-circle (bulge = 1) sticks out as far as the book is thick,
// which reads as a fat, rounded spine rather than a gentle curve.
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

// Animates a pivot group's Z rotation between 0 and `angle`, for a panel
// whose hinge height never changes (a cover: front or back, each always
// swinging around its own fixed axis). Captures the live angle whenever
// `open` flips, so reversing mid-swing continues smoothly instead of
// jumping. `sharedAngleRef`, if given, is used as the angle store instead
// of a private one — lets another object (the resting pages) read the
// cover's live *absolute* angle each frame without re-deriving it.
// `parentAngleRef`, if given, is subtracted from the angle actually applied
// to the group's rotation — for a cover nested inside the spine's own
// tilting group (see Cover), `angle` is still its absolute open target, but
// the parent already contributes `parentAngleRef.current` of rotation, so
// only the remainder needs to be applied locally. Without this, nesting
// would add the two, over-rotating the cover past its intended angle.
function useHingeRotation(groupRef, open, angle, style, sharedAngleRef, parentAngleRef) {
  const ownAngleRef = useRef(0)
  const angleRef = sharedAngleRef || ownAngleRef
  const animRef = useRef(null)
  const prevRef = useRef(open)

  useEffect(() => {
    if (open !== prevRef.current) {
      animRef.current = { from: angleRef.current, to: open ? angle : 0, start: performance.now() }
      prevRef.current = open
    }
  }, [open, angle])

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

// Animates a page leaf's hinge. Unlike a cover, a page's resting spot
// differs depending on which pile it's in: flat, it sits at its original
// height in the right-hand (unread) stack — tilted up in step with the back
// cover via `backAngleRef`, since it's physically resting on it — while
// flipped, it should land on top of whatever's already piled on the left,
// which grows as more pages turn. Rather than rotating around a fixed axis
// (which would leave every flipped page fanned out at its *original* stack
// height — later pages ending up lower, not higher), the flip interpolates
// the visible far edge's height directly and backs out the pivot position
// each frame so the edge always lands exactly on `flatFarY` or `openFarY`,
// regardless of the rotation's own easing curve.
function usePageFlip(groupRef, flipped, { flatFarY, openFarY, sweepRadius, angle, coverAngleRef, backAngleRef, restTilt = 0 }) {
  const angleRef = useRef(0)
  const farYRef = useRef(flatFarY)
  const animRef = useRef(null)
  const prevRef = useRef(flipped)

  useEffect(() => {
    if (flipped !== prevRef.current) {
      const style = flipped ? FLIP_STYLES[Math.floor(Math.random() * FLIP_STYLES.length)] : PAGE_CLOSE_STYLE
      animRef.current = {
        fromAngle: angleRef.current,
        toAngle: flipped ? angle : 0,
        fromFarY: farYRef.current,
        toFarY: flipped ? openFarY : flatFarY,
        start: performance.now(),
        style,
      }
      prevRef.current = flipped
    }
  }, [flipped, angle, flatFarY, openFarY])

  useFrame(() => {
    const anim = animRef.current
    if (anim) {
      const elapsed = performance.now() - anim.start
      const t = Math.min(1, elapsed / anim.style.duration)
      const eased = anim.style.ease(t)
      const bump = anim.style.lift * Math.sin(Math.min(1, t) * Math.PI)
      angleRef.current = anim.fromAngle + (anim.toAngle - anim.fromAngle) * eased
      farYRef.current = anim.fromFarY + (anim.toFarY - anim.fromFarY) * eased + bump
    if (elapsed >= anim.style.duration) animRef.current = null
    } else if (!flipped && backAngleRef) {
      // Resting leaves rigidly follow the back cover's own tilt (hinge
      // fixed at flatFarY, so the near/spine edge never drifts — see
      // Cover), plus a small extra lift on just the topmost few, tracking
      // the front cover's live progress, so the flat stack doesn't meet
      // its curved edge as a hard, unmoving corner.
      const extra = restTilt > 0 && coverAngleRef ? restTilt * (coverAngleRef.current / angle) : 0
      const restAngle = backAngleRef.current + extra
      angleRef.current = restAngle
      farYRef.current = flatFarY + sweepRadius * Math.sin(restAngle)
    }
    const g = groupRef.current
    if (g) {
      g.rotation.z = angleRef.current
      g.position.y = farYRef.current - sweepRadius * Math.sin(angleRef.current)
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
function Cover({ geometry, material, hingeX, hingeY, farX, angle, open, angleRef, parentAngleRef, onClick, onPointerOver, onPointerOut }) {
  const hingeRef = useRef(null)
  useHingeRotation(hingeRef, open, angle, COVER_STYLE, angleRef, parentAngleRef)

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
// too, not just its rotation.
function PageLeaf({ geometry, material, flatFarY, openFarY, sweepRadius, flipped, coverAngleRef, backAngleRef, restTilt, onClick, onPointerOver, onPointerOut }) {
  const hingeRef = useRef(null)
  usePageFlip(hingeRef, flipped, { flatFarY, openFarY, sweepRadius, angle: OPEN_ANGLE, coverAngleRef, backAngleRef, restTilt })

  return (
    <group ref={hingeRef} position-x={-BOOK.coverW / 2} position-z={0}>
      <mesh
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

  const pageW = coverW * 0.985
  const pageT = pagesT / MAX_PAGES
  const pageGeo = useMemo(
    () => extrudeFlat(wornRect(pageW, coverH * 0.98, { jitter: 0.004, spineJitter: 0.0003, segs: 9 }), pageT),
    [pageW, coverH, pageT]
  )

  // Spine: rigid and undeformed, but not static — it leans left in sync
  // with the covers (see spineAngleRef below), pivoting around its own
  // circular center so it rocks in place rather than sliding. Both covers'
  // near edges are pinned to hinge lines within its radius of that same
  // center, so a modest lean like this still keeps the joint covered.
  const spineR = (2 * coverT + pagesT) / 2 + 0.0003
  const spineGeo = useMemo(() => halfCylinderGeo(spineR, coverH, 20, 0.4), [spineR, coverH])

  // How many leaves (counting from the front cover inward) have been turned
  // onto the left pile. Resets whenever the book closes.
  const [pagesTurned, setPagesTurned] = useState(0)
  useEffect(() => {
    if (!open) setPagesTurned(0)
  }, [open])

  // The front cover's live opening angle, shared with the topmost page
  // leaves so their extra resting lift can track it (see usePageFlip).
  const coverAngleRef = useRef(0)
  // The back cover's live opening angle, shared with every resting page
  // leaf so the whole unread stack lifts together with it instead of
  // staying glued flat to the table while only the front cover moves.
  const backAngleRef = useRef(0)

  // The spine's own lean, animated on the same open/close trigger and
  // timing as the covers so it visibly moves with them, not after them.
  const spineHingeRef = useRef(null)
  const spineAngleRef = useRef(0)
  useHingeRotation(spineHingeRef, open, SPINE_TILT_ANGLE, COVER_STYLE, spineAngleRef)

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

  // Where the open cover's own far edge rests — the reference height turned
  // pages stack up from, not the hinge line they started at.
  const coverFarY = coverT + pagesT + coverW * Math.sin(OPEN_ANGLE)

  return (
    <group rotation-y={0.06}>
      {Array.from({ length: MAX_PAGES }, (_, i) => {
        const flipped = i < pagesTurned
        // Flat (unread, right-hand stack): leaf i keeps its original slot,
        // i = 0 topmost, right under the front cover.
        const flatFarY = coverT + pagesT - (i + 1) * pageT
        // Flipped (read, left-hand stack): leaves land on top of the open
        // cover, not at the hinge line — the cover itself rests at
        // coverFarY once open, so leaf i (the (i+1)-th one ever turned)
        // stacks i leaf-thicknesses above *that*.
        const openFarY = coverFarY + i * pageT
        const restTilt = REST_TILT_BASE * Math.pow(REST_TILT_FALLOFF, i)
        return (
          <PageLeaf
            key={i}
            geometry={pageGeo}
            material={pagesMat}
            flatFarY={flatFarY}
            openFarY={openFarY}
            sweepRadius={pageW}
            flipped={flipped}
            coverAngleRef={coverAngleRef}
            backAngleRef={backAngleRef}
            restTilt={restTilt}
            onClick={flipped ? handleCloseClick : handleTurnClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          />
        )
      })}

      {/* The spine's own tilt group is the shared parent for both covers:
          their hinges sit right at its flat face, so they're carried along
          rigidly as it leans, instead of hinging from a point it has
          rotated away from (see Cover). */}
      <group ref={spineHingeRef} position={[-coverW / 2 + 0.003, spineR, 0]}>
        <mesh geometry={spineGeo} material={spineMat} position={[0, -spineR, 0]} castShadow />
        <Cover
          geometry={topCoverGeo}
          material={topCoverMaterials}
          hingeX={-0.003}
          hingeY={coverT + pagesT - spineR}
          farX={coverW / 2}
          angle={OPEN_ANGLE}
          open={open}
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
          angle={BACK_OPEN_ANGLE}
          open={open}
          angleRef={backAngleRef}
          parentAngleRef={spineAngleRef}
        />
      </group>
    </group>
  )
}
