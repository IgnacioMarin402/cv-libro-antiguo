// The gem on the staff, which lights up while the staff is out toward the
// book. The GLB has one mesh and one material, so the gem isn't a part of its
// own: it is only a colour in the texture. That is enough — it is the one
// magenta on the figure.

// The bone the gem rides on: the left hand's middle fingertip, which holds
// the staff. Every one of the gem's vertices is skinned to it.
export const GEM_BONE = 'middle_03_l'

// How magenta a texel is: how far its red and blue both stand over its
// green. The gem averages rgb(173, 62, 205), 111 over. The one other colour
// that comes near is the hat's light purple band, rgb(147, 98, 165), which
// tops out at 49 — measured over every vertex. From 60 up, no texel of the
// atlas falls in a triangle that isn't the gem's (rasterized over the UVs at
// 2048); the ramp to 85 fades the gem's edges in instead of cutting them,
// since the atlas is a JPEG.
const MAGENTA_FROM = 60
const MAGENTA_FULL = 85

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

// How much of a texel is gem, from 0 to 1. Channels in 0–255.
export function gemWeight(r, g, b) {
  return smoothstep(MAGENTA_FROM, MAGENTA_FULL, Math.min(r, b) - g)
}

// The colour the gem glows with: its own hue, more saturated and at full
// brightness, so it reads as lit from inside rather than as a lighter gem.
// Channels in 0–255, in and out.
const GLOW_SATURATION = 1.25
export function glowColor(r, g, b) {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max === 0) return [0, 0, 0]
  const s = Math.min(1, ((max - min) / max) * GLOW_SATURATION)
  // Same hue: each channel keeps its place between min and max.
  return [r, g, b].map((c) => {
    const t = max === min ? 1 : (c - min) / (max - min)
    return Math.round(255 * (1 - s * (1 - t)))
  })
}

// The texel the glow's colour is taken from for the halo: the gem's average.
export const GEM_COLOR = [173, 62, 205]

// How bright the gem glows at the height of the spell, as the material's
// emissive intensity over the glow colour.
export const GLOW_PEAK = 2

// How big the halo is, as a width in the GLB's own units (the model is 0.97
// tall; the scene scales it by WIZARD_SCALE). The gem measures 7 × 11 × 10 cm
// at full size; the halo is about four gems across, 18 cm on the table. It
// was 12 cm first, and asked to show more.
export const HALO_SIZE = 0.45

// How lit the gem is through the staff clip, from 0 to 1, by the clip's
// time in seconds. Measured over the 3 s clip: the staff leaves at 0.4 s,
// is out ahead (0.45 m forward of the figure at full size) by 0.7 s, and
// holds there to 2.9 s. The glow comes up with the thrust and goes out over
// the last half second, before the arm blends back.
const GLOW_RISE = [0.4, 0.8]
const GLOW_FALL = [2.4, 3.0]
export function glowEnvelope(t) {
  return smoothstep(...GLOW_RISE, t) * (1 - smoothstep(...GLOW_FALL, t))
}
