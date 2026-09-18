// Gilt tooling for the book's covers — the vector artwork and the two
// painting passes (color and height) that stamp it onto a leather texture.

// Shared vector geometry for the cover's gilt tooling: a double border band,
// a quarter-fan-and-scroll flourish authored once for the top-left corner
// (then mirrored into the other three via translate+scale), and a central
// oval cartouche with tip scrolls. Built fresh for both the color and bump
// textures from `s` alone so the two passes land on the same pixels without
// sharing canvas state.
export function buildCoverOrnamentPaths(s) {
  const o = s * 0.052 // border band outer inset
  const bandW = s * 0.013
  const hairlineInset = o + bandW + s * 0.016

  const borderBand = new Path2D()
  borderBand.rect(o, o, s - 2 * o, s - 2 * o)
  borderBand.rect(o + bandW, o + bandW, s - 2 * (o + bandW), s - 2 * (o + bandW))

  const borderHairline = new Path2D()
  borderHairline.rect(hairlineInset, hairlineInset, s - 2 * hairlineInset, s - 2 * hairlineInset)

  // Corner flourish, authored for the top-left corner at local (0,0): a
  // nested quarter-circle fan plus a two-arc spiral volute on the diagonal.
  const corner = new Path2D()
  const fanRings = [0.052, 0.078, 0.104, 0.13, 0.156]
  for (const f of fanRings) {
    const r = s * f
    corner.moveTo(r, 0)
    corner.arc(0, 0, r, 0, Math.PI / 2)
  }
  const vx = s * 0.205
  const vy = s * 0.205
  const r1 = s * 0.052
  corner.moveTo(vx + r1, vy)
  corner.arc(vx, vy, r1, 0, Math.PI * 1.35)
  const midA = Math.PI * 1.35
  const cx2 = vx + Math.cos(midA) * r1 * 0.4
  const cy2 = vy + Math.sin(midA) * r1 * 0.4
  const r2 = r1 * 0.4
  corner.moveTo(cx2 + Math.cos(midA) * r2, cy2 + Math.sin(midA) * r2)
  corner.arc(cx2, cy2, r2, midA, midA + Math.PI * 1.6)

  const cornerDots = new Path2D()
  cornerDots.moveTo(vx + r1 * 0.85, vy)
  cornerDots.arc(vx, vy, s * 0.009, 0, Math.PI * 2)
  const tipA = midA + Math.PI * 1.6
  const tipX = cx2 + Math.cos(tipA) * r2
  const tipY = cy2 + Math.sin(tipA) * r2
  cornerDots.moveTo(tipX + s * 0.007, tipY)
  cornerDots.arc(tipX, tipY, s * 0.007, 0, Math.PI * 2)

  // Central cartouche: a flattened oval frame (filled band, evenodd) with
  // tip scrolls at each end and small diamond accents top and bottom.
  const cx = s * 0.5
  const cy = s * 0.5
  const rx = s * 0.275
  const ry = s * 0.098
  const bw2 = s * 0.014

  const cartoucheBand = new Path2D()
  cartoucheBand.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  cartoucheBand.ellipse(cx, cy, rx - bw2, ry - bw2, 0, 0, Math.PI * 2)

  const cartoucheInner = new Path2D()
  cartoucheInner.ellipse(cx, cy, rx - bw2, ry - bw2, 0, 0, Math.PI * 2)

  const cartoucheDiamonds = new Path2D()
  const dSize = s * 0.016
  for (const sgn of [-1, 1]) {
    const ax = cx
    const ay = cy + sgn * ry
    cartoucheDiamonds.moveTo(ax, ay - dSize)
    cartoucheDiamonds.lineTo(ax + dSize, ay)
    cartoucheDiamonds.lineTo(ax, ay + dSize)
    cartoucheDiamonds.lineTo(ax - dSize, ay)
    cartoucheDiamonds.closePath()
  }

  const cartoucheTips = new Path2D()
  const tipR = s * 0.034
  for (const { tx, a0, a1 } of [
    { tx: cx - rx, a0: Math.PI / 2, a1: Math.PI * 1.5 },
    { tx: cx + rx, a0: -Math.PI / 2, a1: Math.PI / 2 },
  ]) {
    cartoucheTips.moveTo(tx + Math.cos(a0) * tipR, cy + Math.sin(a0) * tipR)
    cartoucheTips.arc(tx, cy, tipR, a0, a1)
  }

  return { borderBand, borderHairline, corner, cornerDots, cartoucheBand, cartoucheInner, cartoucheDiamonds, cartoucheTips }
}

const CORNER_TRANSFORMS = [
  [0, 0, 1, 1],
  [1, 0, -1, 1],
  [0, 1, 1, -1],
  [1, 1, -1, -1],
]

// Gold-on-leather styling: every shape gets a dark bronze halo (a wider
// stroke painted first) before the bright gold on top, so the gilt work
// reads as a distinct inlaid color against the leather instead of just a
// same-toned bump. Filled shapes go through outlineThenFill (dark stroke
// around the fill's own edge), line shapes through outlineThenStroke (a
// thicker dark stroke peeking out from under a thinner gold one).
export function paintGiltColor(ctx, s, paths) {
  const { borderBand, borderHairline, corner, cornerDots, cartoucheBand, cartoucheInner, cartoucheDiamonds, cartoucheTips } = paths

  const gold = '#e7ab3c'
  const dark = '#1a0d05'

  const outlineThenFill = (path, rule, lw) => {
    ctx.strokeStyle = dark
    ctx.lineWidth = lw
    ctx.stroke(path)
    ctx.fillStyle = gold
    ctx.fill(path, rule)
  }
  const outlineThenStroke = (path, lw) => {
    ctx.strokeStyle = dark
    ctx.lineWidth = lw * 2.3
    ctx.stroke(path)
    ctx.strokeStyle = gold
    ctx.lineWidth = lw
    ctx.stroke(path)
  }
  const goldDot = (path) => {
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.6)'
    ctx.shadowBlur = s * 0.006
    ctx.fillStyle = gold
    ctx.fill(path)
    ctx.restore()
  }

  ctx.fillStyle = 'rgba(20,12,6,0.4)'
  ctx.fill(cartoucheInner)

  outlineThenFill(borderBand, 'evenodd', s * 0.004)
  outlineThenStroke(borderHairline, s * 0.0022)

  for (const [txf, tyf, sx, sy] of CORNER_TRANSFORMS) {
    ctx.save()
    ctx.translate(txf * s, tyf * s)
    ctx.scale(sx, sy)
    outlineThenStroke(corner, s * 0.0026)
    goldDot(cornerDots)
    ctx.restore()
  }

  outlineThenFill(cartoucheBand, 'evenodd', s * 0.0044)
  outlineThenFill(cartoucheDiamonds, 'nonzero', s * 0.003)
  outlineThenStroke(cartoucheTips, s * 0.003)
}

// Emboss styling for the bump map: raised gold linework painted bright
// against the mid-gray leather base, with the cartouche interior sunk
// slightly darker so it reads as a recessed plate.
export function paintGiltBump(ctx, s, paths) {
  const { borderBand, borderHairline, corner, cornerDots, cartoucheBand, cartoucheInner, cartoucheDiamonds, cartoucheTips } = paths

  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.fill(cartoucheInner)

  ctx.fillStyle = '#f0ead4'
  ctx.strokeStyle = '#f0ead4'
  ctx.fill(borderBand, 'evenodd')
  ctx.lineWidth = s * 0.0022
  ctx.stroke(borderHairline)

  for (const [txf, tyf, sx, sy] of CORNER_TRANSFORMS) {
    ctx.save()
    ctx.translate(txf * s, tyf * s)
    ctx.scale(sx, sy)
    ctx.lineWidth = s * 0.0034
    ctx.stroke(corner)
    ctx.fill(cornerDots)
    ctx.restore()
  }

  ctx.lineWidth = s * 0.0038
  ctx.fill(cartoucheBand, 'evenodd')
  ctx.fill(cartoucheDiamonds)
  ctx.stroke(cartoucheTips)
}
