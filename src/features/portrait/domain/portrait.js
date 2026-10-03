// The portrait on the wall: a painting of four dogs in cloaks, given as an
// image and hung as it is, in a carved gilt frame that is a mesh and not
// built in code (see Portrait.jsx).
//
// The frame comes from a Tripo model of the same painting, which also had
// the dogs in relief; asked for the image instead, only its frame is kept.
// That model was one fused mesh, its frame leaning back 2.9° and the dogs'
// cloaks grown into its bottom rail, so the file is cut from it: stood
// upright, the top half of the frame kept — the top rail and the side
// rails' upper halves, closed boxes there — and mirrored about its middle
// for the bottom half.

// The frame as cut: 0.98 wide and 0.976 tall in the file's units, its bottom
// on y = 0, facing +z, its back the plane z = -0.0434 (a few ornaments go
// 6 mm past it, into the wall). Its rails, from the back to 0.046 in front
// of the origin and the ornaments to 0.074, close in on an opening ±0.428
// across and from 0.077 to 0.9 up.
const MODEL_WIDTH = 0.9797
const MODEL_BACK_Z = -0.0434
const OPENING = { halfWidth: 0.428, bottom: 0.077, top: 0.9 }

// The canvas the image is on, a flat panel in the frame: halfway through the
// rails' depth, 4.7 cm in from their front at scale, and running 2 cm into
// them on every side, so its edges are buried in their boxes and it shows
// only through the opening.
export const CANVAS = { z: 0, halfWidth: 0.45, bottom: 0.057, top: 0.92 }

// The image is the painting in a frame of its own, painted, on white: the
// painting inside it spans x 78–947 and y 70–915 of its 1024 px (where the
// gilt gives way to the dark ground, measured along rows and columns). That
// is fitted to the opening across, at 1015 px to the unit, and left at
// its own proportions: 1.2% squarer than the opening, it loses 4.7 px off
// its top and its bottom. What the canvas runs on under the rails takes in
// some of the painted frame, out of sight.
const IMAGE_SIZE = 1024
const IMAGE_INNER = { left: 78, right: 947, top: 70, bottom: 915 }

// The part of the image the canvas shows, as a texture's offset and repeat
// (v counted from the image's bottom, as a texture flips it).
export function canvasImageWindow() {
  const pxPerUnit = (IMAGE_INNER.right - IMAGE_INNER.left) / (OPENING.halfWidth * 2)
  const centreX = (IMAGE_INNER.left + IMAGE_INNER.right) / 2
  const centreY = (IMAGE_INNER.top + IMAGE_INNER.bottom) / 2
  const openingMiddle = (OPENING.bottom + OPENING.top) / 2
  const left = centreX - CANVAS.halfWidth * pxPerUnit
  const right = centreX + CANVAS.halfWidth * pxPerUnit
  const top = centreY - (CANVAS.top - openingMiddle) * pxPerUnit
  const bottom = centreY + (openingMiddle - CANVAS.bottom) * pxPerUnit
  return {
    offset: [left / IMAGE_SIZE, 1 - bottom / IMAGE_SIZE],
    repeat: [(right - left) / IMAGE_SIZE, (bottom - top) / IMAGE_SIZE],
  }
}

// 1 m across the frame, which makes it 1 m tall too, and the painting in
// it 87 by 84 cm.
export const PORTRAIT_WIDTH = 1
export const PORTRAIT_SCALE = PORTRAIT_WIDTH / MODEL_WIDTH

// Hung like the shield across the window from it, its bottom 1.35 m off the
// floor, so its top reaches 2.35 m — as high as the sconce beside it, 2.32.
export const PORTRAIT_FLOOR_OFFSET = 1.35

// How far the model's origin stands, once scaled, from the wall it hangs
// on — its back against it.
export const PORTRAIT_BACK_OFFSET = -MODEL_BACK_Z * PORTRAIT_SCALE
