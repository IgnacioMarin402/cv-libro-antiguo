import * as THREE from 'three'
import { nameFont } from './nameFont'
import { LETTER_HEAD } from '../domain/names'

// A name lettered for the shader to light (see shaders/nameShader): not in
// its colours but in three greys, one to a channel — the letters themselves
// in red, a wide soft halo of them in green, a tight one in blue. The shader
// makes gilt, writing light and glow out of those. Data, not colour, so it
// is read as it was written (no sRGB decoding).
//
// Lettered at 128 px to the em, about twice what a name covers on a 1080p
// screen, so it stays sharp on a denser one. The halo is a blur of half an
// em, and the canvas leaves it room to fade out before the edge.
const FONT_PX = 128
const HALO_BLUR = 0.5 * FONT_PX
const BLOOM_BLUR = 0.1 * FONT_PX
const PAD = Math.ceil(HALO_BLUR * 1.5)

export function createNameTexture(text) {
  const font = nameFont(FONT_PX)
  const probe = document.createElement('canvas').getContext('2d')
  probe.font = font
  const metrics = probe.measureText(text)
  const width = Math.ceil(metrics.width) + 2 * PAD
  const height = Math.ceil(metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent) + 2 * PAD
  const baseline = PAD + metrics.fontBoundingBoxAscent

  // The name in white on black, blurred by `blur` px (a canvas shadow, which
  // every browser blurs; the letters stay on top of it).
  const layer = (blur) => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, width, height)
    ctx.font = font
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#fff'
    if (blur) {
      ctx.shadowColor = '#fff'
      ctx.shadowBlur = blur
    }
    ctx.fillText(text, width / 2, baseline)
    return ctx.getImageData(0, 0, width, height).data
  }
  const letters = layer(0)
  const halo = layer(HALO_BLUR)
  const bloom = layer(BLOOM_BLUR)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const image = ctx.createImageData(width, height)
  for (let i = 0; i < image.data.length; i += 4) {
    image.data[i] = letters[i]
    image.data[i + 1] = halo[i]
    image.data[i + 2] = bloom[i]
    image.data[i + 3] = 255
  }
  ctx.putImageData(image, 0, 0)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.NoColorSpace

  // Its measures, for laying it on the wall: the canvas in ems, where the
  // line runs (ems down from its top), and — as the shader reads them, in
  // uv — where the letters begin and end across it and stand up it.
  return {
    texture,
    width: width / FONT_PX,
    height: height / FONT_PX,
    baseline: baseline / FONT_PX,
    inset: PAD / width,
    letters: [1 - baseline / height, 1 - (baseline - LETTER_HEAD * FONT_PX) / height],
  }
}
