// A blackletter hand, in vectors — no font file, for the same reason there
// are no GLTFs or images in this repo.
//
// The trick is to model the TOOL rather than the letterforms. Textura was
// written with a broad chisel nib held at a fixed angle, and every thick and
// thin in the alphabet falls out of that one fact: a stroke drawn across the
// nib comes out full width, a stroke drawn along it comes out a hairline.
// So each glyph here is just a skeleton — a list of polylines — and the nib
// gives it its weight. That is why these are 7 short arrays instead of 7
// hand-drawn outlines, and why changing NIB_ANGLE restyles the whole
// alphabet at once.

// Pen angle, measured in canvas space (y down), so a negative angle is the
// nib tilted up to the right the way a right-handed scribe holds it. At -35
// degrees a vertical stem comes out 0.82 of the nib width and a horizontal
// one 0.57 — the contrast Textura is built on. Shallower flattens the hand,
// steeper turns it spidery.
const NIB_ANGLE = (-35 * Math.PI) / 180

// Nib width as a fraction of the em. Textura is a dense, dark hand: at 0.26
// the stems are about 0.21em and the counters close up until the line reads
// as a woven texture, which is where the name comes from.
const NIB_WIDTH = 0.26

// Space between glyphs, on top of each one's advance. Blackletter is set
// tight — the stems are meant to beat at an even rhythm with the gaps.
const TRACKING = 0.015

// Glyph skeletons, in em units: x runs left to right from the glyph origin,
// y is 0 at the baseline and NEGATIVE upward. x-height top sits at -0.48,
// ascenders reach -0.80, descenders drop to +0.24.
//
// Only the letters the cover needs are cut. Adding one means adding its
// skeleton here, nothing else.
const GLYPHS = {
  I: {
    adv: 0.7,
    strokes: [
      [[0.1, -0.6], [0.2, -0.76], [0.4, -0.8], [0.54, -0.71]], // head swash
      [[0.4, -0.74], [0.4, -0.06]], // stem
      [[0.15, -0.03], [0.4, -0.08], [0.63, 0.01]], // foot
      [[0.26, -0.45], [0.545, -0.37]], // the barred flourish across the stem
    ],
  },
  g: {
    adv: 0.64,
    strokes: [
      [[0.33, -0.5], [0.5, -0.42], [0.5, -0.2], [0.33, -0.12], [0.16, -0.2], [0.16, -0.42], [0.33, -0.5]],
      [[0.5, -0.26], [0.5, 0.08], [0.37, 0.22], [0.15, 0.21], [0.06, 0.11]], // descender
    ],
  },
  n: {
    adv: 0.72,
    strokes: [
      [[0.16, -0.48], [0.16, 0]],
      [[0.16, -0.42], [0.28, -0.5], [0.5, -0.5], [0.58, -0.42]], // shoulder
      [[0.58, -0.44], [0.58, 0]],
    ],
  },
  a: {
    adv: 0.64,
    strokes: [
      [[0.52, -0.48], [0.52, 0]],
      [[0.18, -0.4], [0.3, -0.5], [0.52, -0.48]], // top arch
      [[0.52, -0.22], [0.34, -0.26], [0.18, -0.18], [0.2, -0.05], [0.36, 0], [0.52, -0.02]], // bowl
    ],
  },
  c: {
    adv: 0.56,
    strokes: [[[0.5, -0.43], [0.33, -0.5], [0.16, -0.42], [0.16, -0.08], [0.33, 0], [0.5, -0.05]]],
  },
  i: {
    adv: 0.34,
    strokes: [
      [[0.17, -0.48], [0.17, 0]],
      [[0.12, -0.61], [0.22, -0.67]], // the lozenge tittle
    ],
  },
  o: {
    adv: 0.64,
    strokes: [[[0.33, -0.5], [0.51, -0.42], [0.51, -0.08], [0.33, 0], [0.15, -0.08], [0.15, -0.42], [0.33, -0.5]]],
  },
}

// One footprint of the nib, swept from one skeleton point to the next.
//
// The quads are wound consistently on purpose: under nonzero fill, two
// overlapping quads of OPPOSITE winding cancel and punch a hole, which is
// exactly what happens where a stroke crosses a stem (the I's bar). Flipping
// the negative ones keeps crossings solid.
//
// Consecutive quads need no joins: the nib's footprint at a point is the same
// segment whichever way the pen then travels, so quad n ends on the very two
// points quad n+1 starts from.
function nibQuad(path, x0, y0, x1, y1, dx, dy) {
  const wound = (x1 - x0) * dy - (y1 - y0) * dx >= 0
  const a = [x0 + dx, y0 + dy]
  const b = [x1 + dx, y1 + dy]
  const c = [x1 - dx, y1 - dy]
  const d = [x0 - dx, y0 - dy]
  const q = wound ? [a, b, c, d] : [d, c, b, a]
  path.moveTo(q[0][0], q[0][1])
  for (let i = 1; i < 4; i++) path.lineTo(q[i][0], q[i][1])
  path.closePath()
}

// How wide `text` sets at a given em size, so a caller can centre it without
// painting it first.
export function blackletterWidth(text, size) {
  let w = 0
  let n = 0
  for (const ch of text) {
    const g = GLYPHS[ch]
    if (!g) continue
    w += g.adv
    n++
  }
  return (w + Math.max(0, n - 1) * TRACKING) * size
}

// `text` set in the hand above, as one Path2D. (cx, baseline) is the centre
// of the line and the baseline it sits on; `size` is the em in the same
// units. Fill it nonzero.
export function blackletterPath(text, cx, baseline, size) {
  const path = new Path2D()
  const dx = (Math.cos(NIB_ANGLE) * NIB_WIDTH * size) / 2
  const dy = (Math.sin(NIB_ANGLE) * NIB_WIDTH * size) / 2

  let pen = cx - blackletterWidth(text, size) / 2
  for (const ch of text) {
    const g = GLYPHS[ch]
    if (!g) continue
    for (const stroke of g.strokes) {
      for (let i = 0; i < stroke.length - 1; i++) {
        const [ax, ay] = stroke[i]
        const [bx, by] = stroke[i + 1]
        nibQuad(
          path,
          pen + ax * size,
          baseline + ay * size,
          pen + bx * size,
          baseline + by * size,
          dx,
          dy
        )
      }
    }
    pen += (g.adv + TRACKING) * size
  }
  return path
}
