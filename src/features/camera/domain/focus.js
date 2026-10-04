import { easeInOutCubic } from '@/shared/math/easing'

// Going to look at something on a wall, and coming back to the book.
//
// A focus is something flat and upright the visitor has asked to see up
// close — today the dogs' portrait, which the layout describes (see
// PORTRAIT_FOCUS in app/scene/layout): its middle, the way its face points,
// and its width and height, in metres. The lens stands square in front of
// it, level with its middle, so nothing of it is foreshortened.

// How much of the screen it takes, in whichever dimension is tighter: four
// fifths, leaving a band of the wall round it, so it reads as hanging in
// the room and not as a picture pasted over it. For the portrait, on a
// 16:9 screen that's its height, and the lens stops 1.81 m out from its
// face; on a phone held upright it's its width, and 3.95 m. Nothing in the
// room comes within 60 cm of the lens at either.
export const FOCUS_FILL = 0.8

export function focusShot({ center, normal, width, height }, aspect, fovDegrees) {
  const tan = Math.tan((fovDegrees * Math.PI) / 360)
  const distance = Math.max(height / (2 * FOCUS_FILL * tan), width / (2 * FOCUS_FILL * tan * aspect))
  return {
    position: center.map((c, i) => c + normal[i] * distance),
    target: center,
  }
}

// Longer than the book's own move (OPEN_ZOOM_DURATION), since it crosses
// the room: from where the book is read to the portrait is about 3.7 m.
export const FOCUS_DURATION = 2600

// The route. A straight line from wherever the visitor left the lens runs
// through whatever stands in between: from low beside the table, where the
// portrait shows over the book, it went through the south-west throne's
// back, the helmet (then on the table) or the wizard — within 5 cm of
// something from 9 of the 114 places it can be clicked from with the book
// closed. So the lens does all its climbing in the first fifth of the move
// and all its coming down in the last, and crosses at the height of the
// higher end; the portrait's middle, 84 cm over the table, clears
// everything on it and round it. Measured from the same places: nothing
// comes closer than 17.7 cm with the book closed and 10.9 cm with it open
// (aim panned to the spread's corners), both in the first 7% of the move,
// beside where the lens already stood; on the way back to the book, the
// north-east throne keeps 39 cm. The tankard and the quill, on the table
// since, keep 17.5 cm from every route there and 59 from the way back.
export const CLIMB_SHARE = 0.2

// How far through its change of height the lens is, `t` (0..1) of the way
// through the move: the whole climb early, or the whole descent late.
// Eased at both ends, so it neither jolts off nor lands hard.
export function climbProgress(t, rising) {
  const share = rising ? t / CLIMB_SHARE : (t - (1 - CLIMB_SHARE)) / CLIMB_SHARE
  return easeInOutCubic(Math.min(1, Math.max(0, share)))
}
