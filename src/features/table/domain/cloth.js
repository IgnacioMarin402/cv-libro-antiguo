import { TABLE_SURFACE_Y } from './table'

// The tablecloth comes painted blood red — hue 358°, fully saturated, value
// 0.6 (#99020f) — over near-black quarters, and under the candle it read as
// an altar. It's recoloured to the wizard cat's own palette instead, read
// off its texture: the cross takes its robe, the quarters its fur. The gold
// braid stays gold; it already rhymes with the cat's eyes and the book's
// tooling, and it's what keeps the cloth looking ornate rather than plain.

// Taken from the cat's own texture, but from its shadows rather than its
// bulk. The robe's most common texel (#573c6a) laid over the whole cross
// came out a pale mauve under the candle, whose orange light pushes violet
// toward pink — it does the same to the cat's hat — and a field that large
// wants to sit darker than the accents on it. So the cross takes the robe's
// deepest fold (#2e1d3f). The quarters are the fur's charcoal (#3b3944) in
// intent, but a near-neutral dark can't survive that light: the flame's
// blue is 13% of its red in linear terms, so the fur itself, and a cooled
// #1c1826, both still rendered brown. They're pushed to indigo instead,
// which the flame warms back to a dark violet-grey — the fur as it reads on
// screen — so they recede and frame the cross.
//
// Those were #2e1d3f and #15163a, under the candle's old 0xffb066. When its
// light was made whiter (see features/candle/domain/flame) the cross
// went a true violet and the quarters plain blue, and they were asked to
// look as they did. The recolour scales these in linear light, so each
// channel is multiplied by what the old light gave that channel over what
// the new one does — ×1.11 red, ×0.96 green, ×0.63 blue, from the candle,
// the table's glow and the ambient together on the cross's near arm. On
// screen they match the old ones within 1% there, 3% at the rim and 4%
// beside the candle, measured.
export const ROBE = '#311c31'
export const FUR = '#17152d'

// Which texels are the red. Everything else on the model is wood and brass
// between hue 15° and 30°, so the red is picked out by hue alone: whole
// within 8° of 358°, fading out by 14°, which stops short of the wood. Only
// the saturated part: dark wood at the same hue sits under 0.6.
export const RED_HUE = 358
export const RED_HUE_FULL = 8
export const RED_HUE_FADE = 14
export const RED_SAT_FROM = 0.45
export const RED_SAT_FULL = 0.7

// The red where the cloth is lit flat (#99020f) and the quarters (#341408),
// the most common texel of each. The recolour matches luminance, not HSV
// value: pure red is so dark for its value that a violet at the same value
// came out a pale mauve. So the flat red lands exactly on the robe, and the
// weave's shading and damask scale around it.
export const RED = '#99020f'
export const QUARTER = '#341408'

// The GLB tints its whole texture by this, and the shader sees the colour
// after it, so the references are dimmed the same.
export const BASE_COLOR_FACTOR = 0.8

// The quarters are dark brown, the same hue as the wood under them, so they
// can't be told apart by colour: only by height. The cloth's top lies flat
// at the surface, its folds between 7 mm under it and 9 mm proud; the wood
// starts a good 20 cm down, below the drape. Taken whole from 12 mm under
// the surface, and only the dark texels in it, so the gold braid (value
// 0.57) stays out.
export const TOP_FROM_Y = TABLE_SURFACE_Y - 0.03
export const TOP_FULL_Y = TABLE_SURFACE_Y - 0.012
export const DARK_VALUE_FULL = 0.28
export const DARK_VALUE_FADE = 0.42

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)

// An sRGB hex colour as linear rgb, the space the shader lights in.
export function hexToLinear(hex) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => toLinear(c / 255))
}

// Relative luminance of a linear rgb colour.
export const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b
