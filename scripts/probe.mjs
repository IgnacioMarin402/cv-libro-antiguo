// The book's measuring bench (see "Medir antes de tocar" in CLAUDE.md).
//
// It rebuilds the same Object3D hierarchy PageCurlBook mounts, poses it
// with the same domain functions and advances it with the same damping at
// 60 fps, then reads world positions off it — no browser, no renderer, no
// guessing from a screenshot. `node scripts/probe.mjs` prints the three
// things the book's constants have to satisfy:
//
//   · two leaves of the same pile never interpenetrate (>= PAGE_DEPTH apart)
//   · nothing reaches the table, at rest OR mid-turn
//   · the closed book rests ON the table instead of hovering over it
//
// Nothing imports this and it is not part of the build. Run it whenever a
// constant in pageCurlBook/domain/ changes — leaf thickness, the curl, the
// page size, the stacking, the lift: their relations are not intuitive.
// The curl's dip scales with page width and the leaf separation doesn't;
// the settled pose is nowhere near the pose the targets describe, because
// the damping never arrives; and a vertical gap means nothing near the
// spine, where the leaves stand almost upright.
//
// It measures the book's own rig, so it knows nothing about where the book
// stands on the table: the root sits at TABLE_CLEARANCE_Y and every height
// below is meters above the table surface (y = 0).
import { pathToFileURL } from 'node:url'
import * as THREE from 'three'
import { smoothDamp, smoothDampAngle } from '../src/shared/math/easing.js'
import {
  PAGE_COUNT,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
  SEGMENT_WIDTH,
  TILT_ROTATION,
  TURN_DURATION,
  INSIDE_CURVE_STRENGTH,
  OUTSIDE_CURVE_STRENGTH,
  TURNING_CURVE_STRENGTH,
  ROTATION_SMOOTH_TIME,
  STACK_SMOOTH_TIME,
  FAN_STEP,
  stackOffset,
  TABLE_CLEARANCE_Y,
  OPEN_LIFT,
  LIFT_SMOOTH_TIME,
  LIFT_FALL_SMOOTH_TIME,
} from '../src/features/pageCurlBook/domain/pageCurl.js'

const FRAME = 1 / 60

// The hierarchy of PageCurlBook + Page, minus the meshes: root -> lift ->
// tilt -> one group per leaf -> its bone chain. The leaf's skinned mesh
// carries no offset of its own, so hanging the bones off the leaf group
// puts them exactly where the component does.
export function createRig() {
  const root = new THREE.Group()
  root.position.y = TABLE_CLEARANCE_Y
  const lift = new THREE.Group()
  root.add(lift)
  const tilt = new THREE.Group()
  tilt.rotation.fromArray(TILT_ROTATION)
  lift.add(tilt)

  const leaves = []
  for (let n = 0; n < PAGE_COUNT; n++) {
    const group = new THREE.Group()
    tilt.add(group)
    const bones = []
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      const bone = new THREE.Bone()
      bone.position.x = i === 0 ? 0 : SEGMENT_WIDTH
      if (i === 0) group.add(bone)
      else bones[i - 1].add(bone)
      bones.push(bone)
    }
    leaves.push({
      group,
      bones,
      turnedAt: -1e9,
      lastOpened: false,
      spin: Array.from({ length: PAGE_SEGMENTS + 1 }, () => ({ value: 0 })),
      up: { value: 0 },
      lateral: { value: 0 },
    })
  }

  const liftVelocity = { value: 0 }
  let now = 0

  // One frame of useTableLift + useStackOffset + usePageCurl, in that
  // order, reading `page` the way the component's turn queue hands it over.
  const step = (page) => {
    const closedBook = page === 0 || page === PAGE_COUNT
    lift.position.y = smoothDamp(
      lift.position.y,
      closedBook ? 0 : OPEN_LIFT,
      liftVelocity,
      closedBook ? LIFT_FALL_SMOOTH_TIME : LIFT_SMOOTH_TIME,
      FRAME
    )
    leaves.forEach((leaf, n) => {
      const opened = page > n
      if (opened !== leaf.lastOpened) {
        leaf.turnedAt = now
        leaf.lastOpened = opened
      }
      const [up, lateral] = stackOffset(n, page)
      leaf.group.position.x = smoothDamp(leaf.group.position.x, up, leaf.up, STACK_SMOOTH_TIME, FRAME)
      leaf.group.position.z = smoothDamp(leaf.group.position.z, lateral, leaf.lateral, STACK_SMOOTH_TIME, FRAME)

      let turningTime = Math.min(TURN_DURATION, (now - leaf.turnedAt) * 1000) / TURN_DURATION
      turningTime = Math.sin(turningTime * Math.PI)
      let target = opened ? -Math.PI / 2 : Math.PI / 2
      if (!closedBook) target += n * FAN_STEP

      for (let i = 0; i < leaf.bones.length; i++) {
        const inside = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0
        const outside = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0
        const turning = Math.sin((i * Math.PI) / leaf.bones.length) * turningTime
        let angle =
          INSIDE_CURVE_STRENGTH * inside * target -
          OUTSIDE_CURVE_STRENGTH * outside * target +
          TURNING_CURVE_STRENGTH * turning * target
        if (closedBook) angle = i === 0 ? target : 0
        const node = i === 0 ? leaf.group : leaf.bones[i]
        node.rotation.y = smoothDampAngle(node.rotation.y, angle, leaf.spin[i], ROTATION_SMOOTH_TIME, FRAME)
      }
    })
    now += FRAME
    root.updateMatrixWorld(true)
  }

  const scratch = new THREE.Vector3()

  // The lowest point any leaf reaches, as a height above the table: the
  // bone chain is the leaf's centerline, so half a leaf hangs below it.
  const lowestPoint = () => {
    let lowest = Infinity
    for (const { bones } of leaves) {
      for (const bone of bones) {
        bone.getWorldPosition(scratch)
        if (scratch.y < lowest) lowest = scratch.y
      }
    }
    return lowest - PAGE_DEPTH / 2
  }

  // Holds a page state long enough for the damping to arrive, and returns
  // the lowest point reached on the way — the mid-turn flex dips deeper
  // than either pose it travels between. The default has to clear the
  // slowest thing in the book, which is the lift coming back down
  // (LIFT_FALL_SMOOTH_TIME): read it too early and a book still descending
  // reads as a book hovering.
  const settle = (page, seconds = 6) => {
    let worst = Infinity
    for (let i = 0; i < Math.round(seconds / FRAME); i++) {
      step(page)
      worst = Math.min(worst, lowestPoint())
    }
    return worst
  }

  const centerline = (n) => leaves[n].bones.map((bone) => bone.getWorldPosition(new THREE.Vector3()))

  // True 3D distance between two leaves, not a vertical gap: near the
  // spine the leaves stand almost upright and a vertical reading there
  // says nothing. Point-to-segment both ways, so a crossing reads as 0.
  const leafGap = (a, b) => {
    const A = centerline(a)
    const B = centerline(b)
    const distance = (p, u, v) => {
      const uv = new THREE.Vector3().subVectors(v, u)
      const t = THREE.MathUtils.clamp(new THREE.Vector3().subVectors(p, u).dot(uv) / uv.lengthSq(), 0, 1)
      return p.distanceTo(new THREE.Vector3().copy(u).addScaledVector(uv, t))
    }
    let closest = Infinity
    for (const p of A) for (let i = 0; i < B.length - 1; i++) closest = Math.min(closest, distance(p, B[i], B[i + 1]))
    for (const p of B) for (let i = 0; i < A.length - 1; i++) closest = Math.min(closest, distance(p, A[i], A[i + 1]))
    return closest
  }

  return { root, lift, leaves, step, settle, lowestPoint, leafGap, centerline }
}

const mm = (meters) => (meters * 1000).toFixed(1).padStart(6)
const verdict = (ok) => (ok ? 'OK' : '<-- MAL')

function report() {
  const rig = createRig()
  rig.settle(0, 5)

  console.log(`hoja de ${mm(PAGE_DEPTH)} mm de grosor  |  libro de ${PAGE_COUNT} hojas\n`)

  let worstGap = { gap: Infinity }
  let worstSettled = Infinity
  let worstOpening = Infinity
  const settledByPage = []

  for (let page = 1; page <= PAGE_COUNT; page++) {
    worstOpening = Math.min(worstOpening, rig.settle(page))
    const settled = rig.lowestPoint()
    // Only the open states are supposed to keep their distance: a closed
    // book reads 0 because it is resting on the table, which is the point.
    if (page < PAGE_COUNT) worstSettled = Math.min(worstSettled, settled)
    settledByPage.push(`p${page}:${(settled * 1000).toFixed(1)}`)
    for (let n = 0; n < PAGE_COUNT - 1; n++) {
      // Only leaves on the same side of the spine can pile on each other.
      if (page > n !== page > n + 1) continue
      const gap = rig.leafGap(n, n + 1)
      if (gap < worstGap.gap) worstGap = { gap, page, pair: `${n}-${n + 1}` }
    }
  }

  let worstClosing = Infinity
  for (let page = PAGE_COUNT - 1; page >= 0; page--) worstClosing = Math.min(worstClosing, rig.settle(page))
  const closedRest = rig.lowestPoint()

  console.log(
    `separacion minima entre hojas vecinas ${mm(worstGap.gap)} mm  (page ${worstGap.page}, hojas ${worstGap.pair})  ${verdict(worstGap.gap >= PAGE_DEPTH)}`
  )
  console.log(`  >= el grosor de hoja o la tapa asoma a traves de la hoja que la cubre\n`)

  console.log('altura del punto mas bajo, ya en reposo, por pagina (mm sobre la mesa):')
  console.log(`  ${settledByPage.join('  ')}`)
  console.log(`libro abierto en reposo, peor holgura ${mm(worstSettled)} mm   ${verdict(worstSettled > 0)}`)
  console.log(`en pleno giro: abriendo ${mm(worstOpening)} mm, cerrando ${mm(worstClosing)} mm   ${verdict(Math.min(worstOpening, worstClosing) >= 0)}`)
  console.log('  la flexion de mitad de giro baja mas que las dos poses entre las que viaja\n')

  console.log(`libro cerrado, cara inferior a ${mm(closedRest)} mm de la mesa   ${verdict(Math.abs(closedRest) < 0.0005)}`)
  console.log('  cerrado tiene que APOYAR: la pila cerrada es plana y no necesita hueco debajo')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) report()
