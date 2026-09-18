import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { computeBentPositions } from '../geometry/pageSheet'
import { HINGE_X } from '../domain/binding'
import { leafFlipStyle, arcLift, travelingCurl } from '../domain/flipMotion'

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
export function usePageFlip(
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
      const style = leafFlipStyle(flipped)
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
      const bump = arcLift(anim.style, t)
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

      // While it moves, the leaf also flexes along its own length (see
      // travelingCurl) — on top of the permanent spine curve it always has.
      const dyn = dynGeoRef.current
      if (dyn) {
        const curl = travelingCurl(curlAmplitude, t)
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
      // stackRef used to translate the whole pivot off of whatever the leaf
      // rests on, which separated it from the pile below but also dragged
      // its near/hinge edge away from the spine bridge by the same amount —
      // a settled leaf several sheets deep in the read pile would visibly
      // float clear of the gutter instead of growing out of it. A real
      // riffled stack doesn't slide its bound edge away from the spine
      // either: each sheet stays pinned at the same point and just opens a
      // hair wider than the one under it. Turning the offset into a small
      // extra rotation around the *same* fixed pivot reproduces that: the
      // near edge never moves (rotation doesn't displace its own origin),
      // while the far edge still swings clear by approximately stackRef
      // (arc length ≈ radius × angle for a small angle).
      const stackTilt = -stackRef.current / sweepRadius
      g.rotation.z = angleRef.current - parentAngle + stackTilt
      g.position.x = HINGE_X
      g.position.y = farYRef.current - sweepRadius * Math.sin(angleRef.current) - pivotYOffset
    }
  })
}

