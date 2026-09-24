import { WALL_HEIGHT } from './wall'

// What the window looks out on: a night photograph — a snowy peak over a
// mountain lake, under the Milky Way — from a single image, asked for as is
// and not painted in code (see components/WindowView.jsx).
//
// All of it is far enough off to be at infinity, so what shows through the
// lights depends only on which way the lens looks through them, never on
// where it stands. The photo isn't pasted on a plane, then: it's mapped by
// direction, the way it was taken — square and rectilinear, VIEW_FOV across,
// its axis straight out of the window and tipped VIEW_PITCH off level.
// Orbiting slides the landscape across the window the way a real one would.

// The pitch sets how high the room stands over the landscape. It's tipped up
// 3.8° so the summit (row 492 of the 1024 px image) stands 5° above eye
// level, and the water line (row 825) falls 14° below it: a room on a rise
// by the lake, looking up at the peak. Tipped down 15°, as it first was, the
// summit fell 14° below the eye and the lake 33°, and the room seemed to
// hang over the mountain. Level with the lake would be truer still, but out
// of reach: the summit would stand 19° up, and no orbit looks through the
// window higher than 12°.
//
// That's because the camera aims at the book: every orbit the visitor can
// reach, swept, looks through the window from 41° below level to 12° above
// it, and at most 43° to either side, and the fixed shots all look down
// through its bottom, between 12° and 23° below level. So resting, the lens
// sees rows 789–889 — the far shore and the lake — and the summit shows only
// with the camera brought all the way down, in 18% of the views that see
// the window. 56° across keeps the photo big enough to meet the lens that
// low. What falls off it runs on mirrored: sideways in 10% of those views,
// all from near a side wall at a slant, and under its bottom edge (24°
// below level) in 22%, all from high up.
export const VIEW_FOV = 56
export const VIEW_PITCH = 3.8

// The panel it's drawn on stands just behind the wall's hole and only has to
// catch every ray through it. 20 cm back clears the window's own back (15 cm
// behind the wall); there, the sweep's rays cross within 1.02 m of the
// window's centre and never above 3.19 m. Nothing is needed below the floor:
// it runs on past the wall and takes those rays first.
export const BACKDROP_DEPTH = 0.2
export const BACKDROP_HALF_WIDTH = 1.1
export const BACKDROP_HEIGHT = WALL_HEIGHT
