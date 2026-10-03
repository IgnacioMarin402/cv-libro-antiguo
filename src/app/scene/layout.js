import { FLAME_Y } from '@/features/candle'
import { TABLE_CLEARANCE_Y } from '@/features/pageCurlBook'
import { TABLE_FOOT_Y } from '@/features/table'
import {
  WALL_HALF_SPAN,
  REPEAT_LENGTH,
  DOOR_CENTER_X,
  WINDOW_CENTER_X,
  WINDOW_HALF_WIDTH,
} from '@/features/wall'
import { BOOKSHELF_BACK_OFFSET, BOOKSHELF_SIDE_OFFSET } from '@/features/bookshelf'
import { SCONCE_WIDTH, SCONCE_BACK_OFFSET } from '@/features/sconce'
import { FIREPLACE_WIDTH, FIREPLACE_BACK_OFFSET } from '@/features/fireplace'
import { SHELF_WIDTH, SHELF_BACK_OFFSET, SHELF_FLOOR_OFFSET } from '@/features/shelf'
import { SOFA_BACK_OFFSET, SOFA_SIDE_OFFSET } from '@/features/sofa'
import { CABINET_WIDTH, CABINET_BACK_OFFSET, CABINET_TOP_HEIGHT } from '@/features/cabinet'
import { SHOTS } from '@/features/camera'
import { SHIELD_WIDTH, SHIELD_BACK_OFFSET, SHIELD_FLOOR_OFFSET } from '@/features/shield'
import {
  PORTRAIT_WIDTH,
  PORTRAIT_HEIGHT,
  PORTRAIT_BACK_OFFSET,
  PORTRAIT_FLOOR_OFFSET,
  PORTRAIT_FRONT_OFFSET,
} from '@/features/portrait'
import { BUST_WIDTH, BUST_BACK_OFFSET } from '@/features/bust'
import { ANTIQUE_TABLE_BACK_OFFSET, ANTIQUE_TABLE_HALF_WIDTH } from '@/features/antiqueTable'
import { CAULDRON_RADIUS } from '@/features/cauldron'

// Where each prop stands on the table. The book holds the origin — it's what
// the scene is about and what the camera frames against — and everything
// else is placed around it.

// Due north of the book, clear of its far edge — the light now comes from
// behind it rather than raking across the cover.
const CANDLE_X = 0
const CANDLE_Z = -0.45

// The candlestick stands on the table on its own foot, and the fire's
// ambience is anchored at the flame on its wick, so the crackle comes from
// where the light visibly does.
export const CANDLE_POSITION = [CANDLE_X, 0, CANDLE_Z]
export const FLAME_POSITION = [CANDLE_X, FLAME_Y, CANDLE_Z]

// The book itself holds the origin — it is what the scene is about and
// what the camera frames against. Lifted just enough that it rests on the
// table on its bottom leaf (see TABLE_CLEARANCE_Y).
export const BOOK_POSITION = [0, TABLE_CLEARANCE_Y, 0]

// West of the book, across from the tankard, turned to face it. What sets
// the spot is its staff clip, which thrusts straight ahead at the book,
// since it faces it — 35 cm at the wizard's size, the tip 17 cm off the
// table — against everything the book sweeps over a whole visit with its
// levitation (out to 39.3 cm left of the spine mid-turn). It stood at
// (-0.7, -0.3) when it was 39 cm tall; grown to 58 cm there, the staff
// went 0.2 cm into the leaves. So it stands on that same line, 82 cm out
// instead of 76: the staff stops 3.5 cm short, and the figure keeps
// 15.7 cm standing and 17.3 cm waving; its feet reach 85 cm from the book,
// inside the cloth's flat top (1 m). Along the line, 88 cm out keeps
// 9.2 cm but puts the feet 9 cm from the edge, 85 cm keeps 6.0 — it stood
// there first and was asked closer — and 80 cm only 1.7. The fixed shots
// cut it from above wherever it stands at this size — here they take in
// 32% of the figure at rest and 68% open.
export const WIZARD_POSITION = [-0.754, 0, -0.323]
// Facing the book's origin — the spine, and the middle of the open spread.
export const WIZARD_ROTATION = [
  0,
  Math.atan2(BOOK_POSITION[0] - WIZARD_POSITION[0], BOOK_POSITION[2] - WIZARD_POSITION[2]),
  0,
]

// The dragon tankard behind the book's right-hand side, where it was marked
// on a screenshot (the camera rebuilt from the book's corners and the
// candle, to 2.75 px): 9 cm west and 16 cm north of where the helmet stood.
// It keeps 17.3 cm from the book's reach over a visit (39.3 cm right of the
// spine), 15.4 cm from the heart's lap and 46.7 cm from the candle's axis,
// and every fixed shot takes it whole. Turned halfway between the resting
// camera and the book — asked to look a little toward the book. At its
// height the free orbit can bring the lens onto it in 0.1–0.14% of the
// reachable views (measured with the polar limit), like the thrones.
export const MUG_POSITION = [0.61, 0, -0.46]
const MUG_TO_CAMERA = Math.atan2(SHOTS.rest.position.x - MUG_POSITION[0], SHOTS.rest.position.z - MUG_POSITION[2])
const MUG_TO_BOOK = Math.atan2(BOOK_POSITION[0] - MUG_POSITION[0], BOOK_POSITION[2] - MUG_POSITION[2])
export const MUG_ROTATION = [0, (MUG_TO_CAMERA + MUG_TO_BOOK) / 2, 0]

// The quill and its inkwell west of the book, toward the reader, where they
// were marked on the same screenshot as the tankard. They keep 15.5 cm from
// the book's reach on this side and 33.6 cm from the wizard, and the lens
// never touches them (3.8 cm at the nearest, before their last 10%). Turned
// to face the south-west, on the diagonal, as asked. The intro takes them
// whole and the open shot 83%; the resting shot doesn't reach them.
export const QUILL_POSITION = [-0.61, 0, 0.32]
export const QUILL_ROTATION = [0, -Math.PI / 4, 0]

// The love heart, behind the book on the candle's right: the middle of its
// lap (8 cm round, see features/love), 20 cm over the table. Chosen by
// sweeping the table's back half for where the whole lap stays in frame:
// from here it is in every frame of the intro and the resting shot, on a
// 16:9 screen and on a phone held upright, and of the open shot on 16:9;
// upright, the open shot takes 44% of the lap. Out on the table's right,
// where there is room, it fell out of every phone frame. Along its lap it
// keeps 15.7 cm from the leaves, 4 cm from the candlestick's foot (10.5 from
// its axis) and 44 cm from the tankard's axis, where the helmet stood.
export const LOVE_HEART_POSITION = [0.2, 0.2, -0.53]

// Under the table, where its feet stand, centred on it like everything else.
export const FLOOR_POSITION = [0, TABLE_FOOT_Y, 0]

// The rug lies on that floor, centred under the table, the way the model
// comes: its long side east–west and its lion and dragon upright for the
// resting camera, which looks at them from the south. The thrones stand on
// it whole (see features/rug); the table's feet and theirs sink into its
// 1 cm of pile.
export const RUG_POSITION = FLOOR_POSITION

// The walls stand on that same floor, around the same centre.
export const WALL_POSITION = FLOOR_POSITION

// In the north-west corner — at the right-hand end of the west wall, seen
// from the room — its back to that wall and its right side against the
// north one, the window's. It faces +z as exported; a quarter turn faces
// it east, across the room at the table. It runs south along the west wall
// from the corner, 2.8 m of it, and stands 40 cm into the room at most;
// over every orbit and aim the lens keeps 45 cm from it (measured with the
// polar limit; 15.5 cm, from the shelf's south end, when the orbit reached
// 3.6 m).
export const BOOKSHELF_POSITION = [
  WALL_POSITION[0] - WALL_HALF_SPAN + BOOKSHELF_BACK_OFFSET,
  WALL_POSITION[1],
  WALL_POSITION[2] - WALL_HALF_SPAN + BOOKSHELF_SIDE_OFFSET,
]
export const BOOKSHELF_ROTATION = [0, Math.PI / 2, 0]

// The cabinet on the bookshelf's wall, the west one, further along it to
// the south, three bays of the panelling wide like the bookshelf — half a
// bay left bare between them, 47 cm, so they stand apart but together. It
// was a whole bay off, and was asked closer; the half also makes room past
// its other end for the antique table, 74 cm clear. Its back on the wall, turned with it to face the table. It
// stands 41 cm into the room, and over every orbit and aim the lens keeps
// 23 cm from it (measured with the polar limit). When the orbit reached
// 3.6 m it went 6.5 cm into its middle; at two bays it kept 12.2 cm clear
// there, and nothing over about 2.1 m wide did.
const CABINET_GAP = REPEAT_LENGTH / 6
export const CABINET_POSITION = [
  WALL_POSITION[0] - WALL_HALF_SPAN + CABINET_BACK_OFFSET,
  WALL_POSITION[1],
  WALL_POSITION[2] - WALL_HALF_SPAN + REPEAT_LENGTH + CABINET_GAP + CABINET_WIDTH / 2,
]
export const CABINET_ROTATION = BOOKSHELF_ROTATION

// The fantasy helmet up on the cabinet, asked off the table, where it stood
// east of the book (the tankard has its place now). On the bare stretch of
// the cabinet's top north of its ornaments, in the middle of it — 90 cm
// north of the cabinet's middle — and over the cabinet's own origin in
// depth, so its stand keeps 7 cm from the wall and 10 cm from the top's
// front edge. Turned to face the book, as it did on the table. Up there
// the lens keeps 47 cm from it over every orbit and aim (measured with the
// polar limit).
const HELMET_ALONG_CABINET = -0.9
export const HELMET_POSITION = [
  CABINET_POSITION[0],
  WALL_POSITION[1] + CABINET_TOP_HEIGHT,
  CABINET_POSITION[2] + HELMET_ALONG_CABINET,
]
export const HELMET_ROTATION = [
  0,
  Math.atan2(BOOK_POSITION[0] - HELMET_POSITION[0], BOOK_POSITION[2] - HELMET_POSITION[2]),
  0,
]

// Two sconces on the door's wall — the south one, behind the resting
// camera — one to each side of the door, high up beside its arch. Each
// hangs from the height the arch springs from, 1.82 m, so it reaches
// 2.32 m and its flames burn at 2.19, halfway up the arch. 1 m either side
// of the door's axis: the middle of the stretch of panel between the
// door's frame (0.68 m out) and the next column (1.3 m), 16.2 cm clear of
// the frame at the nearest, where the arch has started to close in. Their
// backs are on the wall and they turn with it to face the room; they
// stand 27 cm out from it, and over every orbit and aim the lens keeps
// 56 cm from them (measured with the polar limit; the same sweep gives the
// door frame's 57).
// The door's x is measured along its own wall, which runs round the room
// the other way, hence the sign.
//
// Two more the same on the window's wall, the north one, one to each side
// of the window: as high, and as far past its frame as the door's are past
// the door's, 32 cm — 1.2 m from the window's axis, since its frame stands
// 88 cm out. That keeps 7.8 cm between each and the frame at the nearest,
// where the frame still runs straight up (the window's arch only springs
// at 2.49 m, over them). Over every orbit and aim the lens keeps 60 cm
// from them (measured with the polar limit).
//
// Each reads the room's draft half a minute from the candle and from every
// other one, so no two of the four flicker in step.
const DOOR_SCONCE_OFFSET = 1.0
const WINDOW_SCONCE_OFFSET = WINDOW_HALF_WIDTH + 0.32
const SCONCE_Y = 1.82
const DOOR_SCONCES = [-1, 1].map((side) => ({
  position: [
    WALL_POSITION[0] - DOOR_CENTER_X + side * DOOR_SCONCE_OFFSET,
    WALL_POSITION[1] + SCONCE_Y,
    WALL_POSITION[2] + WALL_HALF_SPAN - SCONCE_BACK_OFFSET,
  ],
  rotation: [0, Math.PI, 0],
}))
const WINDOW_SCONCES = [-1, 1].map((side) => ({
  position: [
    WALL_POSITION[0] + WINDOW_CENTER_X + side * WINDOW_SCONCE_OFFSET,
    WALL_POSITION[1] + SCONCE_Y,
    WALL_POSITION[2] - WALL_HALF_SPAN + SCONCE_BACK_OFFSET,
  ],
  rotation: [0, 0, 0],
}))
export const SCONCES = [...DOOR_SCONCES, ...WINDOW_SCONCES].map((sconce, i) => ({
  ...sconce,
  phase: 30 * (i + 1),
}))

// The shield on the window's wall, the north one, west of the window, on
// the bookshelf's side — past the sconce there, 30 cm clear of it, its back
// on the wall and facing the room. It was moved along to make room for the
// sconce; between it and the bookshelf in the corner there's still 96 cm
// of bare panel. It stands 23 cm out, from 1.35 m off the floor to 2.52,
// and over every orbit and aim the lens keeps 88 cm from it (measured with
// the polar limit).
const SHIELD_SCONCE_GAP = 0.3
export const SHIELD_POSITION = [
  WINDOW_SCONCES[0].position[0] - SCONCE_WIDTH / 2 - SHIELD_SCONCE_GAP - SHIELD_WIDTH / 2,
  WALL_POSITION[1] + SHIELD_FLOOR_OFFSET,
  WALL_POSITION[2] - WALL_HALF_SPAN + SHIELD_BACK_OFFSET,
]

// The dogs' portrait on the same wall, across the window from the shield:
// east of it, past the sconce on that side, 30 cm clear of it as the shield
// is of its own, its back on the wall and facing the room. It hangs from
// 1.35 m off the floor to 2.35, like the shield, over the left end of the
// cauldron in the corner — 18 cm over its top, 1.17 m — and short of the
// orbs rising off its brew, which keep 5 cm past the frame's right edge.
// The frame stands 12 cm out from the wall, and over every orbit and aim
// the lens keeps 81 cm from it (measured with the polar limit).
const PORTRAIT_SCONCE_GAP = SHIELD_SCONCE_GAP
export const PORTRAIT_POSITION = [
  WINDOW_SCONCES[1].position[0] + SCONCE_WIDTH / 2 + PORTRAIT_SCONCE_GAP + PORTRAIT_WIDTH / 2,
  WALL_POSITION[1] + PORTRAIT_FLOOR_OFFSET,
  WALL_POSITION[2] - WALL_HALF_SPAN + PORTRAIT_BACK_OFFSET,
]

// What the camera goes to look at when the portrait is clicked (see
// features/camera's focus): the face of its frame, its middle, facing the
// room — the wall's way, +z — and its size.
export const PORTRAIT_FOCUS = {
  center: [
    PORTRAIT_POSITION[0],
    PORTRAIT_POSITION[1] + PORTRAIT_HEIGHT / 2,
    PORTRAIT_POSITION[2] + PORTRAIT_FRONT_OFFSET,
  ],
  normal: [0, 0, 1],
  width: PORTRAIT_WIDTH,
  height: PORTRAIT_HEIGHT,
}

// Shourdo's bust on the floor below them, beside the window: its cape's hem
// 14 cm clear of the window's frame. At half its size it stood halfway from
// the frame to under the portrait's left edge, 14 cm from each; grown, it's
// wider than that stretch, 1.15 m against 86 cm, and centred there its hem
// came within 2 mm of the frame's foot and stood in front of 14 cm of it.
// So it kept its gap to the window and grew toward the portrait: it now
// stands under its left half, 35 cm below it, and 41 cm short of the
// cauldron's wood. The hem's back on the wall, facing the room as the model
// does. Off the rug, which stops a metre short of it. Over every orbit and
// aim the lens keeps 45 cm from it, from the top of his head (measured with
// the polar limit): the orbit never comes down past the table's top, and
// his head is level with it.
const WINDOW_FRAME_EDGE_X = WINDOW_CENTER_X + WINDOW_HALF_WIDTH
const BUST_WINDOW_GAP = 0.14
export const BUST_POSITION = [
  WINDOW_FRAME_EDGE_X + BUST_WINDOW_GAP + BUST_WIDTH / 2,
  WALL_POSITION[1],
  WALL_POSITION[2] - WALL_HALF_SPAN + BUST_BACK_OFFSET,
]

// The fireplace on the east wall, the one that stood bare — across the room
// from the bookshelf's — centred on it, its back on the wall and turned with
// it to face the table. It stands 87 cm into the room, the hearth's front
// 3.33 m from the table's centre. It's what sets how far out the orbit
// reaches: over every orbit and aim the lens keeps 6.2 cm from its mantel
// (see features/camera and features/fireplace).
export const FIREPLACE_POSITION = [
  WALL_POSITION[0] + WALL_HALF_SPAN - FIREPLACE_BACK_OFFSET,
  WALL_POSITION[1],
  WALL_POSITION[2],
]
export const FIREPLACE_ROTATION = [0, -Math.PI / 2, 0]

// The cauldron in the north-east corner, to the fireplace's own right — on
// the left seen from the room, between the fireplace's wall and the
// window's — its wood 15 cm off each, turned like the fireplace. Its rim
// stands 14 cm over the table's surface, and over every orbit and aim the
// lens keeps 43 cm from it (measured with the polar limit). The opening
// shot takes in 67% of it, the open one 1%, the resting one none.
const CAULDRON_WALL_GAP = 0.15
export const CAULDRON_POSITION = [
  WALL_POSITION[0] + WALL_HALF_SPAN - CAULDRON_WALL_GAP - CAULDRON_RADIUS,
  WALL_POSITION[1],
  WALL_POSITION[2] - WALL_HALF_SPAN + CAULDRON_WALL_GAP + CAULDRON_RADIUS,
]
export const CAULDRON_ROTATION = FIREPLACE_ROTATION

// The wall shelf on the fireplace's other side from the cauldron — its own
// left, the right seen from the room, toward the door's wall — hung on the
// same wall and turned with it, 30 cm clear of the mantel's end; it runs
// to 10 cm short of the corner. It stands 59 cm out from the wall at the
// lens's height there, and over every orbit and aim the lens keeps 27.5 cm
// from it (measured with the polar limit). When the orbit reached 3.6 m it
// went 2.6 cm into its end nearest the fireplace; there, at 2.2 m wide it
// kept 6.4 cm clear, at 1.1 m 25.1; 15 cm from the mantel it went 7.8 cm
// in, and at 3 m, filling the wall, 13.6.
const SHELF_FIREPLACE_GAP = 0.3
export const SHELF_POSITION = [
  WALL_POSITION[0] + WALL_HALF_SPAN - SHELF_BACK_OFFSET,
  WALL_POSITION[1] + SHELF_FLOOR_OFFSET,
  FIREPLACE_POSITION[2] + FIREPLACE_WIDTH / 2 + SHELF_FIREPLACE_GAP + SHELF_WIDTH / 2,
]
export const SHELF_ROTATION = FIREPLACE_ROTATION

// The cushion nook in the south-east corner, under the wall shelf's south
// end: its back on the door's wall, the south one — the cushions leant on
// it — and facing north along the shelf's wall, toward the fireplace. It
// faced west first, its back on the shelf's wall, which had it looking
// along the door's wall at the door, and was asked turned to the fire.
// Right into the corner, against both walls: it stood 15 cm off the
// shelf's wall, as the cauldron stands off its two, and was asked against
// it. It runs 1.73 m along the door's wall and as far out from it, ending
// 1.4 m short of the hearth's corner, 39 cm from the rug's edge and 1.35 m
// from the nearest throne. Over it, the shelf keeps 28 cm over the
// cushions at the nearest (its brackets come down to 85 cm off the floor;
// what hangs from it to 59 cm is at its other end, 2.6 m from the
// corner). Over every orbit and aim the lens keeps 1.32 m from it
// (measured with the polar limit).
export const SOFA_POSITION = [
  WALL_POSITION[0] + WALL_HALF_SPAN - SOFA_SIDE_OFFSET,
  WALL_POSITION[1],
  WALL_POSITION[2] + WALL_HALF_SPAN - SOFA_BACK_OFFSET,
]
export const SOFA_ROTATION = [0, Math.PI, 0]

// The antique table in the south-west corner, beside the cabinet, running
// along the door's wall from the corner toward the door: its back to that
// wall, facing the room. It stood 3 cm off both walls, and was asked out of
// the corner: it's moved along its own wall half a bay of the panelling,
// 47 cm — what the cabinet stands from the bookshelf — and then, so it
// wouldn't stand flat against the wall, a touch out from it, 13 cm. It
// keeps 64 cm from the cabinet's end and stops 90 cm short of the door's
// frame, and 34 cm short of where the door's sconce on that side hangs over
// it. Over every orbit and aim the lens keeps 36 cm from what stands on it
// (measured with the polar limit); grown half again, in the corner, with
// the orbit reaching 3.6 m, it went 7 cm in.
const ANTIQUE_TABLE_WALL_GAP = 0.13
const ANTIQUE_TABLE_CORNER_GAP = REPEAT_LENGTH / 6
export const ANTIQUE_TABLE_POSITION = [
  WALL_POSITION[0] - WALL_HALF_SPAN + ANTIQUE_TABLE_CORNER_GAP + ANTIQUE_TABLE_HALF_WIDTH,
  WALL_POSITION[1],
  WALL_POSITION[2] + WALL_HALF_SPAN - ANTIQUE_TABLE_WALL_GAP - ANTIQUE_TABLE_BACK_OFFSET,
]
export const ANTIQUE_TABLE_ROTATION = [0, Math.PI, 0]

// Four thrones round the table, one to each quarter of the cloth's cross,
// each turned to face the table's centre and so the one across from it.
// The cross's arms run along the axes — at 0.1°, 90.1°, 179.3° and 268.5°
// round from +z, measured from the red in the model's texture over its
// flat top — so the quarters between them, and the thrones, fall on the
// diagonals. The two on the north, behind the tankard and the wizard, show
// 69–76% of themselves in the resting and open shots on a 16:9 screen; the
// two on the reader's side, the south, stand behind the lens in every
// fixed shot and only come into view with the orbit. None covers the book
// in any of them.
//
// All 1.42 m from the centre, which brings the front of each seat and arms
// to 1.05 m — in under the cloth's drape — while keeping more than 10 cm
// off the table everywhere. Like any prop off the table, the free orbit can
// put the lens inside one, low and close on its side — under 1% of the
// reachable views for each.
const THRONE_RADIUS = 1.42
export const THRONES = [1, 3, 5, 7].map((eighth) => {
  const angle = (eighth * Math.PI) / 4
  const x = THRONE_RADIUS * Math.sin(angle)
  const z = THRONE_RADIUS * Math.cos(angle)
  return {
    position: [x, FLOOR_POSITION[1], z],
    rotation: [0, Math.atan2(-x, -z), 0],
  }
})
