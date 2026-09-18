// How a flame behaves over time. Two fast sine terms beating against each
// other plus a little noise — what keeps it reading as fire rather than as
// a lamp on a timer. All plain functions of elapsed time, so the light, the
// flame's body and its shader can each take what they need from the same
// underlying flicker instead of drifting apart on separate wobbles.

const BASE_INTENSITY = 6.5
const MIN_INTENSITY = 4.5

export function flicker(t) {
  return BASE_INTENSITY + Math.sin(t * 9.3) * 0.5 + Math.sin(t * 23.1) * 0.3 + (Math.random() - 0.5) * 0.6
}

// The point light never drops all the way down with the flicker — a real
// flame's glow lags its own guttering.
export const lightIntensity = (f) => Math.max(MIN_INTENSITY, f)

// The flame body's own breathing: a slow swell with a faster shiver on top.
export const flameStretch = (t) => 1 + Math.sin(t * 5) * 0.025 + Math.sin(t * 11) * 0.012

// The same flicker normalized for the shader, clamped so the turbulence
// stays readable at both extremes instead of blowing out or going dark.
export const flameBrightness = (f) => Math.min(1.1, Math.max(0.85, f / 7.5))
