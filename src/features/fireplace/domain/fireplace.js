// The fireplace on the east wall: a brick chimney-piece under a wooden
// mantel, a mesh generated in Tripo like the bookshelf and not built in
// code (see Fireplace.jsx). A fire burns in it: the candle's own flame,
// several of them and grown to a hearth's size (see features/candle).

// The model exports 96.9 wide, 97.2 tall and 40.9 deep, standing on y = 0
// and facing +z. The mantel shelf is what spans the full width, its top at
// 78.7; the brick body under it is 84 wide and the firebox opens from 10 to
// about 50. What stands over 78.7 is the ornaments on the shelf. Its back is
// flat at z = -19.7 from the floor to the shelf (measured by raycasting it);
// only the hearth's foot reaches 0.7 further back, into the wall.
const MODEL_BACK_Z = -19.7
const MODEL_WIDTH = 96.86

// 2.1 m across the mantel, which stands its shelf 1.71 m off the floor and
// the firebox's mouth 78 cm tall, the hearth 87 cm into the room. The orbit
// then ran right up to 27 cm off the walls, so the mantel's corners stood
// in its way, and this size let the lens in. At 1.55 m, the largest it kept
// clear of (3.3 cm, outside the near plane's 2, swept over every orbit and
// aim with the polar limit), it was asked bigger, and this was chosen of
// what that costs: with the camera backed all the way out and turned to the
// fireplace, the lens goes inside it in 0.07% of the views — into the
// shelf's corner, 25 cm at the deepest. Two bays of panelling (1.87 m, the
// window's width) cost under 0.005%, 2.4 m 0.24%. The lens was later caught
// in there, so the orbit was brought in to where it can't reach it: now it
// keeps 6.2 cm from the mantel (see features/camera).
export const FIREPLACE_WIDTH = 2.1
export const FIREPLACE_SCALE = FIREPLACE_WIDTH / MODEL_WIDTH

// How far the model's origin stands, once scaled, from the wall its back is
// pushed against.
export const FIREPLACE_BACK_OFFSET = -MODEL_BACK_Z * FIREPLACE_SCALE

// The firebox, in the file's units (measured by raycasting it from the
// front and from above): its mouth opens from x = -16 to 24 and from the
// hearth's floor at 8 up to 46 under the arch's crown, and runs back to
// z = -19 behind the brick face at -2. The logs lie across it from x = -10
// to 20 and z = -2 to -16, piled highest — 24 to 27 — toward the back.
//
// The fire is eight flames on that pile, each on the logs where it stands
// and as tall as the space over it allows. A candle's flame is a flat card
// turned to the viewer, so one card grown big still reads flat; set in
// three rows, the tall ones at the back and the short ones in front, the
// cards stand at different depths and overlap, and it's that which gives
// the fire its body. `size` is how many times a candle's flame each is,
// with the fireplace 1.55 m wide, where it was set, and it grows with the
// fireplace. At 6 the flame's body is 18.5 units tall and 6 wide — 40 cm
// by 14 at 2.1 m — its tip at 44 under the crown's 46; the front row's, at
// 2.5 to 3, half as tall, under the brick lintel's line. Each reads the room's draft at its own moment, less than
// two seconds apart, so one gust leans the whole fire but each flame
// flickers on its own (see features/candle/domain/flame).
const MODEL_FLAMES = [
  // back row
  { at: [-4, 22, -12], size: 5, phase: 0 },
  { at: [5, 26, -12], size: 6, phase: 1.1 },
  { at: [14, 21, -12], size: 4.5, phase: 0.5 },
  // middle
  { at: [0, 22, -8], size: 4, phase: 1.6 },
  { at: [10, 20, -8], size: 4.5, phase: 0.3 },
  // front
  { at: [-6, 16, -4], size: 2.5, phase: 0.8 },
  { at: [4, 17, -4], size: 3, phase: 1.9 },
  { at: [14, 20, -4], size: 2.5, phase: 1.3 },
]

const FLAME_GROWTH = FIREPLACE_WIDTH / 1.55

// Where each flame burns, in metres within the fireplace (its origin, not
// yet turned to its wall), and how big.
export const FIRE_FLAMES = MODEL_FLAMES.map(({ at, size, phase }) => ({
  position: at.map((v) => v * FIREPLACE_SCALE),
  size: size * FLAME_GROWTH,
  phase,
}))

// One light for the whole fire, as one light carries a sconce's three
// candles: the front row's middle flame's, out at the firebox's mouth,
// 51 cm off the floor. 6.5 against the candle's 6.3, flickering with the fire
// the way the candle's does.
//
// It casts no shadow, like the sconces' (it would cost six more renders a
// frame), so nothing stands between it and the firebox around it, and how
// near it burns to that is what sets how bright the fire looks. It first
// rode on the tallest flame, at the back, at 40: 17 cm off the firebox's
// back, which took 174 times the light the candle puts on the book and
// burned white — it looked like a sun. Here it's 33 cm from the back and
// 34 over the hearth's floor. At 8 they took 7.6 and 7 times the book's
// light, and it was asked a little lower still; at 6.5 they take 6.1 and
// 5.7 times: a hearth glowing, not blazing. Out in the room the floor
// 1.25 m from it gets 13% of the book's light and the cloth's drape on
// that side 8%; it burns 50 cm under the table's surface, so the table
// top and the book stay the candle's. (Worked out by inverse square and
// incidence.)
export const FIRE_LIGHT_FLAME = 6
export const FIRE_INTENSITY = 6.5

// The fire's sound: the candle's crackle, the same file, from the fire's
// middle — over the logs, between the back row and the front. The candle's
// falls off from 40 cm, and from the resting shot, 1.5 m from it, plays at
// 21% of its volume; the fireplace is 3.9 m from there, and from 1.05 m it
// plays at that same 21%, so the two are heard about evenly from where the
// visit starts — the near one small, the far one big. Up at the hearth it
// fills in. It falls on to 8 m, the room's width, where the candle's stops
// at 4. Started halfway through the loop, against the candle's start.
export const FIRE_SOUND_POSITION = [5, 26, -8].map((v) => v * FIREPLACE_SCALE)
export const FIRE_SOUND = { refDistance: 1.05, maxDistance: 8, offset: 0.5 }
