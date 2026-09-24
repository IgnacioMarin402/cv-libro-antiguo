import { canvasTexture } from '@/shared/three/canvasTexture'
import { gemWeight, glowColor, GEM_COLOR } from '../domain/gem'

// Half the atlas's 4096: the gem covers a few hundred texels of it at this
// size, and reading the whole atlas back at full size is 64 MB for one pass.
const MASK_SIZE = 2048

// The gem's glow, painted from the figure's own colour texture: every texel
// that is gem keeps its hue, saturated and at full brightness, and the rest
// goes black. As the emissive map, only the gem lights up. Returns the
// texture and how much gem there is at a uv, which places the halo.
export function createGemMask(map) {
  let weights
  const texture = canvasTexture((ctx, s) => {
    ctx.drawImage(map.image, 0, 0, s, s)
    const img = ctx.getImageData(0, 0, s, s)
    const px = img.data
    weights = new Float32Array(s * s)
    for (let i = 0; i < weights.length; i++) {
      const o = i * 4
      const w = gemWeight(px[o], px[o + 1], px[o + 2])
      weights[i] = w
      const [r, g, b] = w ? glowColor(px[o], px[o + 1], px[o + 2]) : [0, 0, 0]
      px[o] = r * w
      px[o + 1] = g * w
      px[o + 2] = b * w
      px[o + 3] = 255
    }
    ctx.putImageData(img, 0, 0)
  }, MASK_SIZE)
  // Laid over the same uvs as the colour, so it must be read the same way up
  // (glTF textures aren't flipped).
  texture.flipY = map.flipY

  const weightAt = (u, v) => {
    const x = Math.min(MASK_SIZE - 1, Math.floor(u * MASK_SIZE))
    const y = Math.min(MASK_SIZE - 1, Math.floor((map.flipY ? 1 - v : v) * MASK_SIZE))
    return weights[y * MASK_SIZE + x]
  }
  return { texture, weightAt }
}

// The halo around the lit gem, in its glow colour. Like the candle's, it
// falls off steeply and trails away so it has no visible rim. Its stops
// were 0.8 / 0.45 / 0.15 / 0.04 first, and asked to show more; the body of
// it now carries about twice that.
export function createHaloTexture() {
  const [r, g, b] = glowColor(...GEM_COLOR)
  const rgba = (a) => `rgba(${r},${g},${b},${a})`
  return canvasTexture((ctx, s) => {
    const grad = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    grad.addColorStop(0, rgba(1))
    grad.addColorStop(0.12, rgba(0.75))
    grad.addColorStop(0.3, rgba(0.32))
    grad.addColorStop(0.55, rgba(0.09))
    grad.addColorStop(1, rgba(0))
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, s, s)
  }, 128)
}
