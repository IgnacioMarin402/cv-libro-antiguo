// Gilt tooling for the book's covers — the vector artwork and the two
// painting passes (color and height) that stamp it onto a leather texture.
//
// Everything is authored ONCE and mirrored into place: one corner becomes
// the four (CORNER_TRANSFORMS), one profile becomes the pair flanking the
// centre piece. That isn't only less code — it's why the four corners match
// exactly, the way one brass stamp struck four times would. Author in the
// top-left frame and let the mirrors do the rest.

import { blackletterPath } from './blackletter'

const TAU = Math.PI * 2

// Whose book it is. The centre opening was always a blank waiting for a
// name — that is what a cartouche is for.
const COVER_NAME = 'Ignacio'

// Path2D has no spiral, so the volute that finishes every acanthus scroll is
// a chain of short segments whose radius decays as the angle sweeps. 44
// steps is smooth at the 1024px the cover is painted at.
function volute(path, cx, cy, r, a0, dir, turns = 1.5, decay = 0.42) {
  const steps = 44
  const sweep = TAU * turns
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const a = a0 + dir * sweep * t
    const rr = r * Math.pow(decay, t)
    const x = cx + Math.cos(a) * rr
    const y = cy + Math.sin(a) * rr
    if (i) path.lineTo(x, y)
    else path.moveTo(x, y)
  }
}

// A leaf: out along a fat quadratic and back along a flatter one, so the
// silhouette is a teardrop rather than a symmetrical lens.
function leaf(path, x0, y0, x1, y1, bulge) {
  const dx = x1 - x0
  const dy = y1 - y0
  const mx = (x0 + x1) / 2
  const my = (y0 + y1) / 2
  path.moveTo(x0, y0)
  path.quadraticCurveTo(mx - dy * bulge, my + dx * bulge, x1, y1)
  path.quadraticCurveTo(mx + dy * bulge * 0.4, my - dx * bulge * 0.4, x0, y0)
  path.closePath()
}

// A closed superellipse ring with a gentle scallop. `n` sets how square the
// shape is — 2 is a plain ellipse, and anything above 3 reads as a rounded
// rectangle — while `depth` breathes the radius `lobes` times around.
//
// The exponent is the whole point: at the 2:1 the centre piece wants, a
// plain ellipse comes out an almond with two sharp points, which is not
// what a cut cartouche looks like. Pushing n past 3 keeps the long sides
// flat and rounds the ends off.
function lobedRing(path, cx, cy, rx, ry, lobes, depth, n = 2) {
  const steps = 260
  const p = 2 / n
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * TAU
    const ca = Math.cos(a)
    const sa = Math.sin(a)
    const k = 1 + depth * Math.cos(a * lobes)
    const x = cx + Math.sign(ca) * Math.pow(Math.abs(ca), p) * rx * k
    const y = cy + Math.sign(sa) * Math.pow(Math.abs(sa), p) * ry * k
    if (i) path.lineTo(x, y)
    else path.moveTo(x, y)
  }
  path.closePath()
}

// One cameo head in profile, facing -x, drawn into a box of height `h` whose
// top-left corner is (ox, oy). Authored as a normalised silhouette — skull,
// nape, neck, jaw, chin, lips, nose, brow, forehead — then scaled, so the
// same curve serves whatever size the centre piece ends up at.
function profile(path, ox, oy, h) {
  const w = h * 0.78
  const X = (u) => ox + u * w
  const Y = (v) => oy + v * h
  path.moveTo(X(0.58), Y(0.02))
  path.bezierCurveTo(X(0.9), Y(0.05), X(1.0), Y(0.3), X(0.92), Y(0.46)) // back of skull
  path.bezierCurveTo(X(0.88), Y(0.58), X(0.9), Y(0.66), X(0.86), Y(0.74)) // nape
  path.lineTo(X(0.84), Y(1.0))
  path.lineTo(X(0.46), Y(1.0))
  path.bezierCurveTo(X(0.45), Y(0.88), X(0.36), Y(0.84), X(0.3), Y(0.78)) // jaw
  path.bezierCurveTo(X(0.24), Y(0.73), X(0.2), Y(0.7), X(0.19), Y(0.66)) // chin
  path.bezierCurveTo(X(0.185), Y(0.635), X(0.235), Y(0.625), X(0.215), Y(0.605))
  path.bezierCurveTo(X(0.195), Y(0.59), X(0.225), Y(0.575), X(0.205), Y(0.56)) // mouth
  path.bezierCurveTo(X(0.185), Y(0.545), X(0.22), Y(0.535), X(0.2), Y(0.52))
  path.bezierCurveTo(X(0.185), Y(0.505), X(0.16), Y(0.5), X(0.145), Y(0.485))
  path.bezierCurveTo(X(0.06), Y(0.455), X(0.02), Y(0.42), X(0.085), Y(0.375)) // nose
  path.bezierCurveTo(X(0.12), Y(0.345), X(0.115), Y(0.3), X(0.135), Y(0.26)) // bridge
  path.bezierCurveTo(X(0.145), Y(0.235), X(0.125), Y(0.215), X(0.155), Y(0.185)) // brow
  path.bezierCurveTo(X(0.21), Y(0.09), X(0.4), Y(0.0), X(0.58), Y(0.02)) // forehead
  path.closePath()
}

// Shared vector geometry for the cover's tooling. Built fresh for both the
// color and the bump pass from `s` alone, so the two land on the same pixels
// without sharing canvas state.
export function buildCoverOrnamentPaths(s) {
  // --- border ------------------------------------------------------------
  const o = s * 0.043
  const bandW = s * 0.0085
  const hi = s * 0.069 // inner hairline, and where the corner plates start

  const borderBand = new Path2D()
  borderBand.rect(o, o, s - 2 * o, s - 2 * o)
  borderBand.rect(o + bandW, o + bandW, s - 2 * (o + bandW), s - 2 * (o + bandW))

  const borderHairline = new Path2D()
  borderHairline.rect(hi, hi, s - 2 * hi, s - 2 * hi)

  // --- corner ornament, authored for the top-left ------------------------
  // A solid bronze plate: square where it meets the border, bulging back
  // along the diagonal toward the centre of the cover.
  const C = s * 0.33
  const t = C - hi

  const cornerPlate = new Path2D()
  cornerPlate.moveTo(hi, hi)
  cornerPlate.lineTo(C, hi)
  cornerPlate.lineTo(C, hi + t * 0.54)
  cornerPlate.quadraticCurveTo(C - t * 0.05, hi + t * 0.74, hi + t * 0.85, hi + t * 0.85)
  cornerPlate.quadraticCurveTo(hi + t * 0.74, C - t * 0.05, hi + t * 0.54, C)
  cornerPlate.lineTo(hi, C)
  cornerPlate.closePath()

  // The linework cut into the plate: an inset outline, a pair of volutes
  // mirrored about the plate's own diagonal, and leaves filling the bulge.
  const cornerEngrave = new Path2D()
  const e = hi + t * 0.1
  cornerEngrave.moveTo(e, e)
  cornerEngrave.lineTo(C - t * 0.08, e)
  cornerEngrave.quadraticCurveTo(C - t * 0.12, hi + t * 0.66, hi + t * 0.75, hi + t * 0.75)
  cornerEngrave.quadraticCurveTo(hi + t * 0.66, C - t * 0.12, e, C - t * 0.08)
  cornerEngrave.closePath()

  volute(cornerEngrave, hi + t * 0.7, hi + t * 0.3, t * 0.17, Math.PI * 0.55, 1)
  volute(cornerEngrave, hi + t * 0.3, hi + t * 0.7, t * 0.17, Math.PI * 1.95, -1)
  leaf(cornerEngrave, hi + t * 0.34, hi + t * 0.34, hi + t * 0.76, hi + t * 0.76, 0.2)
  leaf(cornerEngrave, hi + t * 0.18, hi + t * 0.5, hi + t * 0.5, hi + t * 0.18, 0.13)

  // A square boss with a diamond inside it, sitting on the plate's diagonal
  // — the one flat, bright element that keeps the corner from reading as
  // nothing but curls.
  const cornerBoss = new Path2D()
  const bx = hi + t * 0.43
  const bSize = t * 0.125
  cornerBoss.rect(bx - bSize, bx - bSize, bSize * 2, bSize * 2)
  cornerBoss.moveTo(bx, bx - bSize * 0.55)
  cornerBoss.lineTo(bx + bSize * 0.55, bx)
  cornerBoss.lineTo(bx, bx + bSize * 0.55)
  cornerBoss.lineTo(bx - bSize * 0.55, bx)
  cornerBoss.closePath()

  // A tendril running off the plate along the top edge. Mirrored, the two
  // corners of each edge send one each and they meet at the middle.
  const cornerTendril = new Path2D()
  const ty = hi + t * 0.17
  cornerTendril.moveTo(C, ty)
  cornerTendril.bezierCurveTo(s * 0.34, ty - t * 0.1, s * 0.4, ty + t * 0.22, s * 0.455, ty + t * 0.05)
  volute(cornerTendril, s * 0.472, ty + t * 0.02, t * 0.1, Math.PI * 1.1, 1, 1.3)
  leaf(cornerTendril, s * 0.35, ty + t * 0.02, s * 0.4, ty - t * 0.28, 0.3)
  leaf(cornerTendril, s * 0.38, ty + t * 0.06, s * 0.43, ty + t * 0.36, -0.3)

  // --- centre piece ------------------------------------------------------
  const cx = s * 0.5
  const cy = s * 0.475
  const rx = s * 0.225
  const ry = s * 0.115

  // The dark opening, and the bronze band framing it: the same lobed ring
  // twice at different scales, filled evenodd.
  const centreOpening = new Path2D()
  lobedRing(centreOpening, cx, cy, rx, ry, 8, 0.022, 3.4)

  const centreFrame = new Path2D()
  lobedRing(centreFrame, cx, cy, rx * 1.135, ry * 1.3, 8, 0.024, 3.4)
  lobedRing(centreFrame, cx, cy, rx, ry, 8, 0.022, 3.4)

  // Scrollwork hung off the frame: volutes at the two tips, leaves above and
  // below, so the centre reads as cut metal rather than a picture frame.
  const centreScroll = new Path2D()
  for (const dir of [-1, 1]) {
    const tipX = cx + dir * rx * 1.2
    volute(centreScroll, tipX + dir * s * 0.03, cy - s * 0.022, s * 0.032, Math.PI * (dir > 0 ? 1.25 : 1.75), dir, 1.4)
    volute(centreScroll, tipX + dir * s * 0.03, cy + s * 0.022, s * 0.032, Math.PI * (dir > 0 ? 0.75 : 0.25), -dir, 1.4)
  }
  for (const sgn of [-1, 1]) {
    const ay = cy + sgn * ry * 1.35
    leaf(centreScroll, cx - s * 0.075, ay, cx, ay + sgn * s * 0.05, 0.3 * sgn)
    leaf(centreScroll, cx + s * 0.075, ay, cx, ay + sgn * s * 0.05, -0.3 * sgn)
    volute(centreScroll, cx - s * 0.105, ay + sgn * s * 0.012, s * 0.027, Math.PI * (sgn > 0 ? 0.6 : 1.4), sgn, 1.3)
    volute(centreScroll, cx + s * 0.105, ay + sgn * s * 0.012, s * 0.027, Math.PI * (sgn > 0 ? 0.4 : 1.6), -sgn, 1.3)
  }

  // --- cameo profiles ----------------------------------------------------
  // Authored once at the left tip, facing out; the paint pass mirrors it
  // about cameoPivot for the right-hand one.
  // Big enough that the nose and lips survive: at s * 0.15 the features were
  // a few pixels across and the head read as a thumb.
  const cameoH = s * 0.2
  const cameoX = cx - rx * 1.13 - cameoH * 0.56
  const cameoY = cy - cameoH * 0.5

  const cameo = new Path2D()
  profile(cameo, cameoX, cameoY, cameoH)

  // --- the name, lettered into the opening -------------------------------
  // Sized off the opening rather than off `s`: the em that makes the word
  // span 0.38s leaves a clear margin inside the 2*rx the opening gives.
  // The ink runs from -0.80em (the I's swash) to +0.24em (the g's tail), so
  // its optical centre sits 0.28em above the baseline — drop the baseline by
  // that much and the word centres on the cartouche instead of riding high.
  const nameSize = s * 0.088
  const nameplate = blackletterPath(COVER_NAME, cx, cy + nameSize * 0.28, nameSize)

  // The hair mass, cut as its own shape so the color pass can sink it a
  // shade darker than the face and the profile does not read as a flat chip.
  const cameoHair = new Path2D()
  const hw = cameoH * 0.78
  const HX = (u) => cameoX + u * hw
  const HY = (v) => cameoY + v * cameoH
  cameoHair.moveTo(HX(0.58), HY(0.02))
  cameoHair.bezierCurveTo(HX(0.9), HY(0.05), HX(1.0), HY(0.3), HX(0.92), HY(0.46))
  cameoHair.bezierCurveTo(HX(0.82), HY(0.4), HX(0.74), HY(0.29), HX(0.6), HY(0.25))
  cameoHair.bezierCurveTo(HX(0.44), HY(0.2), HX(0.3), HY(0.23), HX(0.2), HY(0.29))
  cameoHair.bezierCurveTo(HX(0.15), HY(0.2), HX(0.26), HY(0.06), HX(0.58), HY(0.02))
  cameoHair.closePath()

  return {
    borderBand,
    borderHairline,
    cornerPlate,
    cornerEngrave,
    cornerBoss,
    cornerTendril,
    centreOpening,
    centreFrame,
    centreScroll,
    cameo,
    cameoHair,
    cameoPivot: cx,
    centreY: cy,
    nameplate,
  }
}

const CORNER_TRANSFORMS = [
  [0, 0, 1, 1],
  [1, 0, -1, 1],
  [0, 1, 1, -1],
  [1, 1, -1, -1],
]

// Aged bronze rather than bright gold leaf: the fittings on a binding like
// this are cast and rubbed, so the range runs from near-black in the
// recesses to a pale warm highlight on the raised edges, mid browns between.
const BRONZE = {
  shadow: '#160c03',
  deep: '#4a3114',
  mid: '#9a7130',
  warm: '#c99b45',
  bright: '#e8c97e',
  hot: '#f7ecc4',
}

// A diagonal sweep across a shape's box, so every plate looks lit from the
// same corner. Built in the CURRENT transform's space, which means the
// mirrored corners get a mirrored sweep — exactly what four strikes of one
// stamp would do.
function metal(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1)
  g.addColorStop(0, BRONZE.bright)
  g.addColorStop(0.22, BRONZE.warm)
  g.addColorStop(0.46, BRONZE.mid)
  g.addColorStop(0.68, BRONZE.deep)
  g.addColorStop(0.86, BRONZE.mid)
  g.addColorStop(1, BRONZE.warm)
  return g
}

// Bronze-on-leather styling. Solid fittings (the corner plates, the centre
// band, the cameos) are filled with the metal sweep and outlined dark so
// they sit proud of the leather; the linework cut into them is stroked dark
// with a finer bright stroke on top, which is what reads as engraving.
export function paintGiltColor(ctx, s, paths) {
  const {
    borderBand, borderHairline, cornerPlate, cornerEngrave, cornerBoss, cornerTendril,
    centreOpening, centreFrame, centreScroll, cameo, cameoHair, cameoPivot, nameplate, centreY,
  } = paths

  // `lw` is the dark edge painted under the fill. It has to scale with the
  // piece, not with the canvas: the default reads as a cast edge on a plate
  // a third of the cover wide, and swallows a cameo's nose and lips whole.
  const plate = (path, x0, y0, x1, y1, rule, lw = s * 0.005) => {
    ctx.strokeStyle = BRONZE.shadow
    ctx.lineWidth = lw
    ctx.stroke(path)
    ctx.fillStyle = metal(ctx, x0, y0, x1, y1)
    ctx.fill(path, rule)
  }
  const engrave = (path, lw) => {
    ctx.strokeStyle = BRONZE.shadow
    ctx.lineWidth = lw * 2.1
    ctx.stroke(path)
    ctx.strokeStyle = BRONZE.hot
    ctx.lineWidth = lw
    ctx.stroke(path)
  }

  // The opening is a hole punched through to something darker than the
  // leather, not a painted patch — hence near-black rather than a tint.
  ctx.fillStyle = 'rgba(8,10,9,0.88)'
  ctx.fill(centreOpening)

  plate(borderBand, 0, 0, s, s, 'evenodd')
  engrave(borderHairline, s * 0.0022)

  for (const [txf, tyf, sx, sy] of CORNER_TRANSFORMS) {
    ctx.save()
    ctx.translate(txf * s, tyf * s)
    ctx.scale(sx, sy)
    plate(cornerPlate, s * 0.06, s * 0.06, s * 0.34, s * 0.34)
    engrave(cornerEngrave, s * 0.0028)
    plate(cornerBoss, s * 0.12, s * 0.12, s * 0.24, s * 0.24, 'evenodd')
    plate(cornerTendril, s * 0.3, s * 0.05, s * 0.5, s * 0.16)
    ctx.restore()
  }

  plate(centreFrame, s * 0.26, s * 0.34, s * 0.74, s * 0.62, 'evenodd')
  plate(centreScroll, s * 0.26, s * 0.34, s * 0.74, s * 0.62)

  for (const dir of [1, -1]) {
    ctx.save()
    if (dir < 0) {
      ctx.translate(cameoPivot * 2, 0)
      ctx.scale(-1, 1)
    }
    plate(cameo, s * 0.14, s * 0.38, s * 0.34, s * 0.58, undefined, s * 0.0016)
    ctx.fillStyle = 'rgba(42,26,8,0.3)'
    ctx.fill(cameoHair)
    ctx.strokeStyle = BRONZE.shadow
    ctx.lineWidth = s * 0.0016
    ctx.stroke(cameoHair)
    ctx.restore()
  }

  // The name last, so it sits on the opening rather than under anything. The
  // gradient runs across the word, not across the canvas, so the sweep plays
  // over the letters instead of tinting them all one flat tone.
  plate(nameplate, cameoPivot - s * 0.2, centreY - s * 0.06, cameoPivot + s * 0.2, centreY + s * 0.06, 'nonzero', s * 0.0014)
}

// Emboss styling for the bump map: the fittings raised bright against the
// mid-gray leather, their engraving cut back dark, and the centre opening
// sunk deepest so it reads as a recess rather than a painted panel.
export function paintGiltBump(ctx, s, paths) {
  const {
    borderBand, borderHairline, cornerPlate, cornerEngrave, cornerBoss, cornerTendril,
    centreOpening, centreFrame, centreScroll, cameo, cameoHair, cameoPivot, nameplate, centreY,
  } = paths

  const raise = (path, rule) => {
    ctx.fillStyle = '#efe8d2'
    ctx.fill(path, rule)
  }
  const cut = (path, lw) => {
    ctx.strokeStyle = '#2a2a2a'
    ctx.lineWidth = lw
    ctx.stroke(path)
  }

  ctx.fillStyle = 'rgba(0,0,0,0.55)'
  ctx.fill(centreOpening)

  raise(borderBand, 'evenodd')
  cut(borderHairline, s * 0.0024)

  for (const [txf, tyf, sx, sy] of CORNER_TRANSFORMS) {
    ctx.save()
    ctx.translate(txf * s, tyf * s)
    ctx.scale(sx, sy)
    raise(cornerPlate)
    cut(cornerEngrave, s * 0.0034)
    raise(cornerBoss, 'evenodd')
    raise(cornerTendril)
    ctx.restore()
  }

  raise(centreFrame, 'evenodd')
  raise(centreScroll)

  for (const dir of [1, -1]) {
    ctx.save()
    if (dir < 0) {
      ctx.translate(cameoPivot * 2, 0)
      ctx.scale(-1, 1)
    }
    raise(cameo)
    cut(cameoHair, s * 0.003)
    ctx.restore()
  }
  // Raised, not cut: a gilt letter is stamped INTO the leather and then
  // laid with gold, so it stands proud of a panel that is itself sunk.
  raise(nameplate)
}
