import * as THREE from 'three'
import { canvasTexture } from '@/shared/three/canvasTexture'
import { rand } from '@/shared/math/random'
import { PAPER_WIDTH, PAPER_HEIGHT } from '../domain/pageCurl'

// The leaves' paper: an old book's, not a magazine's. Ivory rather than
// white, toned unevenly the way rag paper yellows, a little darker toward
// every edge where air and hands reach it, with fibres in it and a few
// foxing spots. Painted to be written on later (the CV's text goes on top,
// see paintPaper), so nothing on it is dark enough to fight a line of ink.
//
// The canvas is square and the leaf is not, so everything is drawn in the
// leaf's own proportions and squeezed to fit: spots stay round on the page.
const ASPECT = PAPER_HEIGHT / PAPER_WIDTH

// Paints the paper over a w x h area of `ctx`, in the leaf's proportions.
export function paintPaper(ctx, w, h) {
  ctx.save()
  ctx.scale(1, h / (w * ASPECT))
  const W = w
  const H = w * ASPECT

  // A shade under what it looks like: the page sits a hand from the candle
  // and the tone mapping lifts it, so a paler ground reads as plain white.
  ctx.fillStyle = '#e6d8b9'
  ctx.fillRect(0, 0, W, H)

  // Uneven toning: broad clouds, warmer than the ground, each fading out
  // from its middle — flat discs left their rims on the page like bokeh.
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * W
    const y = Math.random() * H
    const r = rand(W * 0.05, W * 0.2)
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(184,144,86,${rand(0.08, 0.18)})`)
    g.addColorStop(1, 'rgba(184,144,86,0)')
    ctx.fillStyle = g
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }

  // Fibres: short, thin, mostly with the grain of the sheet.
  for (let i = 0; i < 4200; i++) {
    const x = Math.random() * W
    const y = Math.random() * H
    const a = rand(-0.5, 0.5) + (Math.random() < 0.7 ? Math.PI / 2 : 0)
    const len = rand(W * 0.004, W * 0.02)
    ctx.strokeStyle = `rgba(130,100,62,${rand(0.08, 0.2)})`
    ctx.lineWidth = rand(0.4, 1)
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len)
    ctx.stroke()
  }

  // Foxing: small rust spots, a few of them in loose clusters.
  for (let c = 0; c < 22; c++) {
    const cx = Math.random() * W
    const cy = Math.random() * H
    for (let i = 0; i < rand(2, 8); i++) {
      ctx.fillStyle = `rgba(146,90,40,${rand(0.08, 0.26)})`
      ctx.beginPath()
      ctx.arc(cx + rand(-W, W) * 0.03, cy + rand(-W, W) * 0.03, rand(W * 0.0015, W * 0.006), 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Edge toning, the same on all four sides: the leaf's back face is drawn
  // mirrored, so the spine and fore-edge sides swap there.
  const band = W * 0.1
  const edge = (x0, y0, x1, y1) => {
    const g = ctx.createLinearGradient(x0, y0, x1, y1)
    g.addColorStop(0, 'rgba(166,120,60,0.42)')
    g.addColorStop(1, 'rgba(176,136,78,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
  }
  edge(0, 0, band, 0)
  edge(W, 0, W - band, 0)
  edge(0, 0, 0, band)
  edge(0, H, 0, H - band)

  ctx.restore()
}

export function createPaperTexture() {
  const tex = canvasTexture((ctx, s) => paintPaper(ctx, s, s), 1024)
  tex.anisotropy = 4
  return tex
}

// The paper's tooth, for the bump map: fine grain and the fibres raised a
// hair, so a leaf turning under the candle catches it as a surface instead
// of a sheen. Height data, so NoColorSpace.
export function createPaperBumpTexture() {
  const tex = canvasTexture((ctx, s) => {
    ctx.fillStyle = '#808080'
    ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 26000; i++) {
      const v = rand(-22, 22)
      ctx.fillStyle = `rgba(${128 + v},${128 + v},${128 + v},0.5)`
      ctx.fillRect(Math.random() * s, Math.random() * s, 1.2, 1.2)
    }
    for (let i = 0; i < 2400; i++) {
      const x = Math.random() * s
      const y = Math.random() * s
      const a = rand(-0.5, 0.5) + (Math.random() < 0.7 ? Math.PI / 2 : 0)
      const len = rand(4, 20)
      ctx.strokeStyle = `rgba(168,168,168,${rand(0.2, 0.45)})`
      ctx.lineWidth = rand(0.5, 1.1)
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len)
      ctx.stroke()
    }
  }, 1024)
  tex.colorSpace = THREE.NoColorSpace
  return tex
}
