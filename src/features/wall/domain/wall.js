// The room's walls: gothic oak panelling from a single image, not painted in
// code (see Wall.jsx), standing on the floor in a square around the table.
// Where they stand is the layout's call — on the floor, centred on the table.

// How far each wall stands from the table's centre. It has to clear the
// camera: the orbit reaches 3.6 m from its aim, and the aim pans at most
// 0.33 m off the book (0.85 of a page), so the lens gets to 3.93 m on
// either axis. 4.2 m keeps it 27 cm inside the walls from every angle.
export const WALL_HALF_SPAN = 4.2

// The image isn't tileable across as it comes: 1024 px holds 3.7 bays, and
// its two edges fall in different places of a bay. So one repeat is cut
// out of it — three bays, from the middle of a panel to the middle of the
// panel three bays on. A bay measures 278 px (the autocorrelation peak of
// its columns), and 836 is the span, near three of them, whose two edges
// match best over the whole height; the plain board mid-panel is where a
// seam shows least.
export const CROP_X_PX = 177
export const CROP_WIDTH_PX = 836
export const TEXTURE_HEIGHT_PX = 1024

// Even at the best cut the grain on either side isn't the same board, so
// the last strip of the repeat is blended into what the image has just
// before its left edge, and the right edge runs on into the left one.
export const SEAM_BLEND_PX = 32

// Three repeats — nine bays — to a wall, so every wall ends where it
// starts in the pattern and the corners all look alike. At 8.4 m a wall
// that makes a bay 0.93 m, and sets the scale of everything else: the
// image stands 3.43 m tall, the dado rail 1.15 m off the floor and the
// plinth 35 cm, against a table 1.01 m tall.
export const REPEATS_PER_WALL = 3
export const REPEAT_LENGTH = (WALL_HALF_SPAN * 2) / REPEATS_PER_WALL
export const WALL_HEIGHT = (TEXTURE_HEIGHT_PX * REPEAT_LENGTH) / CROP_WIDTH_PX

// Where in the repeat each wall begins: on a column (the one at 380 px in
// the image), so the corners are two half-columns meeting rather than two
// half-panels.
export const CORNER_U = (380 - CROP_X_PX) / CROP_WIDTH_PX

// There's no ceiling, and the canvas above is black. The image's top edge
// cuts through the tracery, so the wall darkens into that black instead:
// whole up to FADE_START, gone at its top.
export const WALL_FADE_START = 1.8

// How lit the wall's colour is at a height y above the floor: 1 up to
// WALL_FADE_START, easing to 0 at the wall's top.
export function wallShade(y) {
  const t = Math.min(Math.max((y - WALL_FADE_START) / (WALL_HEIGHT - WALL_FADE_START), 0), 1)
  return 1 - t * t * (3 - 2 * t)
}

// How much relief the bump takes from the image's own brightness — the
// mouldings catch light that the recessed panels don't, so they stand
// proud of them.
export const BUMP_SCALE = 2

// The four walls, facing in. Each is the same panel, turned about y so its
// face points at the table.
export const WALL_SIDES = [
  { position: [0, 0, -WALL_HALF_SPAN], rotationY: 0 },
  { position: [WALL_HALF_SPAN, 0, 0], rotationY: -Math.PI / 2 },
  { position: [0, 0, WALL_HALF_SPAN], rotationY: Math.PI },
  { position: [-WALL_HALF_SPAN, 0, 0], rotationY: Math.PI / 2 },
]
