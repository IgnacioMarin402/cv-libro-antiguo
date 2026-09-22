// The book's measuring bench (see "Medir antes de tocar" in CLAUDE.md).
//
// It rebuilds the same Object3D hierarchy PageCurlBook mounts, poses it
// with the same domain functions and advances it with the same damping at
// 60 fps, then reads world positions off it — no browser, no renderer, no
// guessing from a screenshot. `node scripts/probe.mjs` prints the things
// the book's constants have to satisfy:
//
//   · two leaves never interpenetrate, at rest OR mid-turn
//   · nothing reaches the table, at rest OR mid-turn
//   · the closed book rests ON the table instead of hovering over it
//   · the boards overhang the text block on the three free edges
//
// Nothing imports this and it is not part of the build. Run it whenever a
// constant in pageCurlBook/domain/ changes — leaf thickness, the curl, the
// page size, the stacking, the lift: their relations are not intuitive.
// The curl's dip scales with page width and the leaf separation doesn't;
// the settled pose is nowhere near the pose the targets describe, because
// the damping never arrives; and a vertical gap means nothing near the
// spine, where the leaves stand almost upright.
//
// THREE THINGS THIS MEASURES THAT AN EARLIER VERSION DID NOT, each of which
// hid a real overlap behind a passing verdict:
//
//   · the SURFACE, not the bone joints. Linear blend skinning puts the skin
//     INSIDE the polyline of the bones — 0.36 mm at this bone spacing, more
//     than the whole clearance the stacking used to leave over. Sampling
//     only at the joints read 3.14 mm where the surfaces were 2.78 apart,
//     i.e. 0.22 mm inside each other. So every line below is sampled SUB
//     times per bone segment.
//   · MID-TURN, not just settled. The leaf that lands spent most of a turn
//     inside the leaf it was landing on; the settled pose never showed it.
//   · the FOLD (rotation.x). It moves the chain as soon as there is any
//     curl in y, and it only exists while a turn is in progress.
//
// It measures the book's own rig, so it knows nothing about where the book
// stands on the table: the root sits at TABLE_CLEARANCE_Y and every height
// below is meters above the table surface (y = 0).
import { pathToFileURL } from 'node:url'
import * as THREE from 'three'
import { smoothDamp, smoothDampAngle } from '../src/shared/math/easing.js'
import {
  PAGE_COUNT,
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
  SEGMENT_WIDTH,
  PAPER_WIDTH,
  PAPER_HEIGHT,
  PAPER_SEGMENT_WIDTH,
  SQUARE,
  TILT_ROTATION,
  TURN_DURATION,
  INSIDE_CURVE_STRENGTH,
  OUTSIDE_CURVE_STRENGTH,
  TURNING_CURVE_STRENGTH,
  ROTATION_SMOOTH_TIME,
  FOLD_SMOOTH_TIME,
  STACK_SMOOTH_TIME,
  STACK_LEAN,
  FAN_STEP,
  OPEN_PITCH,
  stackOffset,
  flightArc,
  TABLE_CLEARANCE_Y,
  OPEN_LIFT,
  LIFT_SMOOTH_TIME,
  LIFT_FALL_SMOOTH_TIME,
} from '../src/features/pageCurlBook/domain/pageCurl.js'

const FRAME = 1 / 60

// How many samples per bone segment every measured line carries. 4 puts a
// sample every 3.2 mm of a 390 mm page, which resolves the skinning sag
// (0.36 mm) an order of magnitude over.
const SUB = 4
const SAMPLES = PAGE_SEGMENTS * SUB

// The first columns live inside the fold of the book, where leaves
// legitimately converge and little of it is visible. Reported apart from
// the open sheet, because a millimetre means different things there.
const GUTTER_SAMPLES = 4 * SUB

// The hierarchy of PageCurlBook + Page, minus the meshes: root -> lift ->
// tilt -> one group per leaf -> its bone chain. The leaf's skinned mesh
// carries no offset of its own, so hanging the bones off the leaf group
// puts them exactly where the component does. The two boards run on the
// board cut and everything between them on the trimmed paper cut, which is
// what SQUARE means.
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
    const board = n === 0 || n === PAGE_COUNT - 1
    const segmentWidth = board ? SEGMENT_WIDTH : PAPER_SEGMENT_WIDTH
    const width = board ? PAGE_WIDTH : PAPER_WIDTH
    const height = board ? PAGE_HEIGHT : PAPER_HEIGHT
    const group = new THREE.Group()
    tilt.add(group)
    const bones = []
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      const bone = new THREE.Bone()
      bone.position.x = i === 0 ? 0 : segmentWidth
      if (i === 0) group.add(bone)
      else bones[i - 1].add(bone)
      bones.push(bone)
    }
    leaves.push({
      group,
      bones,
      board,
      width,
      height,
      segmentWidth,
      turnedAt: -1e9,
      lastOpened: false,
      spin: Array.from({ length: PAGE_SEGMENTS + 1 }, () => ({ value: 0 })),
      fold: Array.from({ length: PAGE_SEGMENTS + 1 }, () => ({ value: 0 })),
      up: { value: 0 },
      lateral: { value: 0 },
      slot: { up: 0, lateral: 0 },
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
      leaf.slot.up = smoothDamp(leaf.slot.up, up, leaf.up, STACK_SMOOTH_TIME, FRAME)
      leaf.slot.lateral = smoothDamp(leaf.slot.lateral, lateral, leaf.lateral, STACK_SMOOTH_TIME, FRAME)
      // The arc rides over the damped slot, not into it (see useStackOffset).
      const arc = flightArc((now - leaf.turnedAt) * 1000)
      leaf.group.position.x = leaf.slot.up + arc * Math.cos(STACK_LEAN)
      leaf.group.position.z = leaf.slot.lateral + arc * Math.sin(STACK_LEAN) * (opened ? -1 : 1)

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
        const foldIntensity = i > 8 ? Math.sin((i * Math.PI) / leaf.bones.length - 0.5) * turningTime : 0
        let foldAngle = THREE.MathUtils.degToRad(Math.sign(target) * 2)
        if (closedBook) {
          angle = i === 0 ? target : 0
          foldAngle = 0
        }
        const node = i === 0 ? leaf.group : leaf.bones[i]
        node.rotation.y = smoothDampAngle(node.rotation.y, angle, leaf.spin[i], ROTATION_SMOOTH_TIME, FRAME)
        node.rotation.x = smoothDampAngle(
          node.rotation.x,
          foldAngle * foldIntensity,
          leaf.fold[i],
          FOLD_SMOOTH_TIME,
          FRAME
        )
      }
    })
    now += FRAME
    root.updateMatrixWorld(true)
  }

  // Where a point of the sheet ends up in the world, exactly as the GPU
  // puts it there: mesh.bind() re-runs calculateInverses with the chain
  // already built, so bone i's inverse just undoes its rest offset, and the
  // attached bindMatrixInverse cancels the mesh's own matrix. What is left
  // is the plain two-bone blend below — which is also where the sag comes
  // from, because blending two rigid transforms is not the same as
  // following the bend between them.
  const _a = new THREE.Vector3()
  const _b = new THREE.Vector3()
  // The same two-bone pairing createPageGeometry bakes into skinIndex, so
  // the bench reads the sheet the GPU draws and not a second opinion.
  const skinPoint = (leaf, x, y, z, out = new THREE.Vector3()) => {
    const sw = leaf.segmentWidth
    const i0 = Math.min(Math.max(0, Math.floor(x / sw)), PAGE_SEGMENTS - 1)
    const i1 = i0 + 1
    const w = THREE.MathUtils.clamp((x - i0 * sw) / sw, 0, 1)
    _a.set(x - i0 * sw, y, z).applyMatrix4(leaf.bones[i0].matrixWorld)
    _b.set(x - i1 * sw, y, z).applyMatrix4(leaf.bones[i1].matrixWorld)
    return out.copy(_a).multiplyScalar(1 - w).addScaledVector(_b, w)
  }

  // A line across the sheet at height y, from the hinge to the fore-edge.
  const line = (leaf, y) => {
    const out = []
    for (let k = 0; k <= SAMPLES; k++) out.push(skinPoint(leaf, (k * leaf.width) / SAMPLES, y, 0))
    return out
  }

  const _uv = new THREE.Vector3()
  const _t = new THREE.Vector3()
  const pointToSegment = (p, u, v) => {
    _uv.subVectors(v, u)
    const t = THREE.MathUtils.clamp(_t.subVectors(p, u).dot(_uv) / _uv.lengthSq(), 0, 1)
    return p.distanceTo(_t.copy(u).addScaledVector(_uv, t))
  }

  const polylineGap = (A, B, from) => {
    let closest = Infinity
    for (let k = from; k < A.length; k++)
      for (let i = from; i < B.length - 1; i++) closest = Math.min(closest, pointToSegment(A[k], B[i], B[i + 1]))
    for (let k = from; k < B.length; k++)
      for (let i = from; i < A.length - 1; i++) closest = Math.min(closest, pointToSegment(B[k], A[i], A[i + 1]))
    return closest
  }

  // How much room is left BETWEEN THE FACES of two leaves: the distance
  // between their mid-surfaces, less a whole leaf thickness (half from
  // each). Negative means they are inside each other. Point-to-polyline
  // both ways, so a sample of one landing between two samples of the other
  // still reads — which is the case a vertical stack falls into, where the
  // sheets slide along each other near the spine instead of parting.
  const leafGap = (a, b, from = 0) => {
    let closest = Infinity
    for (const y of [-1, 0, 1]) {
      const A = line(leaves[a], (y * leaves[a].height) / 2)
      const B = line(leaves[b], (y * leaves[b].height) / 2)
      closest = Math.min(closest, polylineGap(A, B, from))
    }
    return closest - PAGE_DEPTH
  }

  // The lowest point the sheet itself reaches, as a height above the table
  // — both faces of all three lines, not the centreline the bones trace.
  const lowestPoint = () => {
    let lowest = Infinity
    const p = new THREE.Vector3()
    for (const leaf of leaves)
      for (let k = 0; k <= SAMPLES; k++)
        for (const y of [-leaf.height / 2, 0, leaf.height / 2])
          for (const z of [-PAGE_DEPTH / 2, PAGE_DEPTH / 2]) {
            skinPoint(leaf, (k * leaf.width) / SAMPLES, y, z, p)
            if (p.y < lowest) lowest = p.y
          }
    return lowest
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

  // How far the fore-edge of a leaf reaches from the hinge line, flat on
  // the table — what the boards have to overhang.
  const foreEdgeReach = (n) => {
    const hinge = leaves[0].bones[0].getWorldPosition(new THREE.Vector3())
    const tip = skinPoint(leaves[n], leaves[n].width, 0, 0)
    return Math.hypot(tip.x - hinge.x, tip.z - hinge.z)
  }

  return { root, lift, leaves, step, settle, lowestPoint, leafGap, line, skinPoint, foreEdgeReach }
}

const mm = (meters) => (meters * 1000).toFixed(2).padStart(7)
const verdict = (ok) => (ok ? 'OK' : '<-- MAL')

function report() {
  const rig = createRig()
  rig.settle(0, 5)

  console.log(
    `hoja de ${mm(PAGE_DEPTH)} mm  |  libro de ${PAGE_COUNT} hojas  |  pitch abierto ${mm(OPEN_PITCH)} mm  |  ceja ${mm(SQUARE)} mm`
  )
  console.log(`superficie muestreada cada ${mm(PAGE_WIDTH / SAMPLES)} mm (${SUB} por hueso)\n`)

  // ---- 1. leaves against each other -------------------------------------
  const restGutter = { gap: Infinity }
  const restSheet = { gap: Infinity }
  const restFacingGutter = { gap: Infinity }
  const restFacingSheet = { gap: Infinity }
  let turnGutter = { gap: Infinity }
  let turnSheet = { gap: Infinity }
  let turnFrames = 0
  let badFrames = 0
  let worstSettled = Infinity
  let worstOpening = Infinity
  const settledByPage = []

  for (let page = 1; page <= PAGE_COUNT; page++) {
    // The turn itself, frame by frame. The leaf that matters is the one in
    // the air — leaf page-1 — against the two it passes between.
    const flier = page - 1
    for (let f = 0; f < 100; f++) {
      rig.step(page)
      worstOpening = Math.min(worstOpening, rig.lowestPoint())
      let overlapped = false
      for (const other of [flier - 1, flier + 1]) {
        if (other < 0 || other >= PAGE_COUNT) continue
        const all = rig.leafGap(flier, other)
        const sheet = rig.leafGap(flier, other, GUTTER_SAMPLES)
        if (all < turnGutter.gap) turnGutter = { gap: all, page, pair: `${Math.min(flier, other)}-${Math.max(flier, other)}` }
        if (sheet < turnSheet.gap) turnSheet = { gap: sheet, page, pair: `${Math.min(flier, other)}-${Math.max(flier, other)}` }
        // Counted on the sheet, not in the fold: down in the fold the
        // leaves overlap all the time and always will (see STACK_LEAN), so
        // counting there would just read 100% for every setting.
        if (sheet < 0) overlapped = true
      }
      turnFrames++
      if (overlapped) badFrames++
    }

    worstOpening = Math.min(worstOpening, rig.settle(page))
    const settled = rig.lowestPoint()
    // Only the open states are supposed to keep their distance: a closed
    // book reads 0 because it is resting on the table, which is the point.
    if (page < PAGE_COUNT) worstSettled = Math.min(worstSettled, settled)
    settledByPage.push(`p${page}:${(settled * 1000).toFixed(1)}`)

    if (page === PAGE_COUNT) continue
    for (let n = 0; n < PAGE_COUNT - 1; n++) {
      const facing = page > n !== page > n + 1
      const all = rig.leafGap(n, n + 1)
      const sheet = rig.leafGap(n, n + 1, GUTTER_SAMPLES)
      // The two innermost leaves, one from each pile, never pile on each
      // other — but near the spine both stand almost upright on either side
      // of the fold, and that is where they meet. Kept apart from the piles
      // because it is a different question with a different answer.
      const bucket = facing ? [restFacingGutter, restFacingSheet] : [restGutter, restSheet]
      if (all < bucket[0].gap) Object.assign(bucket[0], { gap: all, page, pair: `${n}-${n + 1}` })
      if (sheet < bucket[1].gap) Object.assign(bucket[1], { gap: sheet, page, pair: `${n}-${n + 1}` })
    }
  }

  let worstClosing = Infinity
  for (let page = PAGE_COUNT - 1; page >= 0; page--) worstClosing = Math.min(worstClosing, rig.settle(page))
  const closedRest = rig.lowestPoint()

  const row = (label, r, check = true) =>
    console.log(`  ${label.padEnd(30)}${mm(r.gap)} mm  (page ${r.page}, hojas ${r.pair})${check ? `  ${verdict(r.gap > 0)}` : ''}`)

  console.log('HOLGURA ENTRE CARAS VECINAS (negativa = se meten una en otra)')
  console.log(' dentro de una pila, en reposo')
  row('junto al lomo', restGutter)
  row('en la hoja', restSheet)
  console.log(' las dos hojas enfrentadas a traves del lomo, en reposo')
  row('junto al lomo', restFacingGutter)
  row('en la hoja', restFacingSheet)
  console.log(' la hoja que vuela, contra las dos entre las que pasa')
  row('junto al lomo', turnGutter, false)
  row('en la hoja', turnSheet)
  console.log(`  frames del giro con solape: ${badFrames} de ${turnFrames} (${((100 * badFrames) / turnFrames).toFixed(1)}%)`)
  console.log('  lo de la hoja se ve; lo del lomo vive dentro del pliegue\n')

  // ---- 2. the table -----------------------------------------------------
  console.log('ALTURA DEL PUNTO MAS BAJO (mm sobre la mesa)')
  console.log(`  ya en reposo, por pagina:  ${settledByPage.join('  ')}`)
  console.log(`  libro abierto en reposo, peor holgura ${mm(worstSettled)} mm   ${verdict(worstSettled > 0)}`)
  // The sweep passes through the closed states, where the book is MEANT to
  // touch the table, so this reads 0 by design; what it has to catch is a
  // leaf going under it.
  const TOUCHING = -0.0005
  console.log(
    `  en pleno giro: abriendo ${mm(worstOpening)} mm, cerrando ${mm(worstClosing)} mm   ${verdict(Math.min(worstOpening, worstClosing) >= TOUCHING)}`
  )
  console.log('  la flexion de mitad de giro baja mas que las dos poses entre las que viaja')
  console.log('  el barrido pasa por el libro cerrado, que APOYA: 0 aqui es lo correcto\n')

  console.log(`LIBRO CERRADO, cara inferior a ${mm(closedRest)} mm de la mesa   ${verdict(Math.abs(closedRest) < 0.0005)}`)
  console.log('  cerrado tiene que APOYAR: la pila cerrada es plana y no necesita hueco debajo\n')

  // ---- 3. the square ----------------------------------------------------
  const flat = createRig()
  flat.settle(0, 5)
  const headBoard = flat.skinPoint(flat.leaves[0], PAGE_WIDTH / 2, PAGE_HEIGHT / 2, 0)
  const headPaper = flat.skinPoint(flat.leaves[1], PAPER_WIDTH / 2, PAPER_HEIGHT / 2, 0)
  const head = Math.abs(headBoard.z - headPaper.z)
  flat.settle(5, 8)
  const fore = flat.foreEdgeReach(0) - flat.foreEdgeReach(1)
  console.log('CEJA DE LA ENCUADERNACION (cuanto sobresale la tapa del bloque de papel)')
  console.log(`  cabeza y pie, libro cerrado  ${mm(head)} mm   ${verdict(head > 0.001)}`)
  console.log(`  corte delantero, libro abierto ${mm(fore)} mm   ${verdict(fore > 0.001)}`)
  console.log('  a cero, el canto de la tapa y el del papel caen sobre la misma linea')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) report()
