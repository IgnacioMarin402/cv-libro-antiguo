import * as THREE from 'three'
import { rand } from './random'

function canvasTexture(draw, size) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  draw(ctx, size)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// Shared vector geometry for the cover's gilt tooling: a double border band,
// a quarter-fan-and-scroll flourish authored once for the top-left corner
// (then mirrored into the other three via translate+scale), and a central
// oval cartouche with tip scrolls. Built fresh for both the color and bump
// textures from `s` alone so the two passes land on the same pixels without
// sharing canvas state.
function buildCoverOrnamentPaths(s) {
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
function paintGiltColor(ctx, s, paths) {
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
function paintGiltBump(ctx, s, paths) {
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

// Leather cover: mottled worn brown with rubbed corners, fine scratches, and
// a tooled gold-leaf border/corner/cartouche design (see buildCoverOrnamentPaths).
export function createCoverTexture() {
  const tex = canvasTexture((ctx, s) => {
    ctx.fillStyle = '#6b4423'
    ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 3200; i++) {
      const x = Math.random() * s
      const y = Math.random() * s
      const r = rand(4, 40)
      const shade = Math.random() > 0.5 ? 'rgba(30,18,10,' : 'rgba(150,110,70,'
      ctx.fillStyle = shade + rand(0.03, 0.12) + ')'
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
    const g = ctx.createRadialGradient(s * 0.02, s * 0.02, 2, s * 0.02, s * 0.02, s * 0.4)
    g.addColorStop(0, 'rgba(190,150,100,0.35)')
    g.addColorStop(1, 'rgba(190,150,100,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
    ctx.save()
    ctx.translate(s, s)
    ctx.scale(-1, -1)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
    ctx.restore()
    ctx.strokeStyle = 'rgba(20,12,6,0.15)'
    for (let i = 0; i < 220; i++) {
      ctx.beginPath()
      const x = Math.random() * s
      const y = Math.random() * s
      const a = Math.random() * Math.PI * 2
      const len = rand(20, 120)
      ctx.moveTo(x, y)
      ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len)
      ctx.lineWidth = rand(1, 3)
      ctx.stroke()
    }
    paintGiltColor(ctx, s, buildCoverOrnamentPaths(s))
  }, 1024)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

// Grayscale bump map matching the cover's leather grain, with the gilt
// border/corners/cartouche embossed on top and the cartouche interior
// recessed like an inset nameplate. Tagged NoColorSpace (not sRGB) since
// this is height data, not color — canvasTexture() defaults to sRGB.
export function createCoverBumpTexture() {
  const tex = canvasTexture((ctx, s) => {
    ctx.fillStyle = '#808080'
    ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 9000; i++) {
      const v = rand(-30, 30)
      ctx.fillStyle = `rgba(${128 + v},${128 + v},${128 + v},0.5)`
      ctx.fillRect(Math.random() * s, Math.random() * s, 1.2, 1.2)
    }
    paintGiltBump(ctx, s, buildCoverOrnamentPaths(s))
  }, 1024)
  tex.colorSpace = THREE.NoColorSpace
  return tex
}

// Page-block edge: fine horizontal strata with foxed/aged tone spots.
export function createPagesTexture() {
  const tex = canvasTexture((ctx, s) => {
    ctx.fillStyle = '#e2cd9c'
    ctx.fillRect(0, 0, s, s)
    for (let y = 0; y < s; y += rand(2, 4)) {
      ctx.strokeStyle = `rgba(90,65,35,${rand(0.06, 0.22)})`
      ctx.lineWidth = rand(0.5, 1.4)
      ctx.beginPath()
      ctx.moveTo(0, y + rand(-1, 1))
      ctx.lineTo(s, y + rand(-1, 1))
      ctx.stroke()
    }
    for (let i = 0; i < 260; i++) {
      const x = Math.random() * s
      const y = Math.random() * s
      const r = rand(3, 16)
      ctx.fillStyle = `rgba(120,80,30,${rand(0.05, 0.18)})`
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }, 512)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 3)
  return tex
}

// Wood table top: dark stained planks with wavy grain lines.
export function createWoodTexture() {
  const tex = canvasTexture((ctx, s) => {
    ctx.fillStyle = '#241408'
    ctx.fillRect(0, 0, s, s)
    for (let y = 0; y < s; y += rand(4, 10)) {
      ctx.strokeStyle = `rgba(60,32,14,${rand(0.2, 0.5)})`
      ctx.lineWidth = rand(1, 3)
      ctx.beginPath()
      ctx.moveTo(0, y)
      for (let x = 0; x <= s; x += 40) ctx.lineTo(x, y + Math.sin(x * 0.02 + y) * 6)
      ctx.stroke()
    }
  }, 512)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(6, 6)
  return tex
}

// Warm, dim equirectangular gradient used as the scene's environment map so
// metal (the candlestick) has something moody to reflect instead of going
// flat black — a candlelit room stand-in, not a real HDRI.
export function createEnvironmentTexture() {
  const w = 256
  const h = 128
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')

  const sky = ctx.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, '#0d0906')
  sky.addColorStop(0.55, '#241b10')
  sky.addColorStop(1, '#3c2b17')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h)

  const glow = ctx.createRadialGradient(w * 0.32, h * 0.45, 0, w * 0.32, h * 0.45, w * 0.22)
  glow.addColorStop(0, 'rgba(255,190,110,0.9)')
  glow.addColorStop(1, 'rgba(255,190,110,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)

  const cool = ctx.createRadialGradient(w * 0.78, h * 0.3, 0, w * 0.78, h * 0.3, w * 0.18)
  cool.addColorStop(0, 'rgba(120,140,180,0.25)')
  cool.addColorStop(1, 'rgba(120,140,180,0)')
  ctx.fillStyle = cool
  ctx.fillRect(0, 0, w, h)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.mapping = THREE.EquirectangularReflectionMapping
  return tex
}

// Soft warm radial glow used for the candle flame's light bloom sprite.
export function createGlowTexture() {
  return canvasTexture((ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    g.addColorStop(0, 'rgba(255,180,90,0.9)')
    g.addColorStop(1, 'rgba(255,140,60,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
  }, 64)
}

// Soft warm radial dot used as the sprite for each dust particle.
export function createDustTexture() {
  return canvasTexture((ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    g.addColorStop(0, 'rgba(255,220,160,0.9)')
    g.addColorStop(1, 'rgba(255,220,160,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
  }, 64)
}
