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
import { CABINET_WIDTH, CABINET_BACK_OFFSET } from '@/features/cabinet'
import { SHIELD_WIDTH, SHIELD_BACK_OFFSET, SHIELD_FLOOR_OFFSET } from '@/features/shield'
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

// West of the book, across from the helmet, turned to face it. What sets
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

// East of the book, where the wizard's mirror image stood before it grew and
// moved: 0.76 m from the book, turned to face it the same way — its face is
// +z as exported, like the wizard's. It stayed put rather than follow the
// wizard. Nothing of it moves, so the only reach to clear is the book's: on
// this side the book goes out to 39.3 cm right of the spine over a whole
// visit, and the helmet keeps 24.2 cm from it at its nearest (measured with
// the book's levitation).
export const HELMET_POSITION = [0.7, 0, -0.3]
export const HELMET_ROTATION = [
  0,
  Math.atan2(BOOK_POSITION[0] - HELMET_POSITION[0], BOOK_POSITION[2] - HELMET_POSITION[2]),
  0,
]

// The love heart, behind the book on the candle's right: the middle of its
// lap (8 cm round, see features/love), 20 cm over the table. Chosen by
// sweeping the table's back half for where the whole lap stays in frame:
// from here it is in every frame of the intro and the resting shot, on a
// 16:9 screen and on a phone held upright, and of the open shot on 16:9;
// upright, the open shot takes 44% of the lap. Out on the table's right,
// where there is room, it fell out of every phone frame. Along its lap it
// keeps 15.7 cm from the leaves, 4 cm from the candlestick's foot (10.5 from
// its axis) and 44 cm from the helmet's axis.
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
// diagonals. The two on the north, behind the helmet and the wizard, show
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
