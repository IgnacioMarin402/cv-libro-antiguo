// How sharp the canvas renders, following the frame rate in one direction
// only: down. App asks for up to 2 device pixels per CSS pixel, which on a
// laptop at 150% is 2.25 times the pixels of 1x, every one of them lit by
// eight lights. A GPU that keeps up keeps them all — on a fast machine this
// never does anything. One that doesn't gives up sharpness a step at a
// time until it does, and never below 1x: smaller than the page's own
// pixels the room would blur, and that is a trade for whoever owns the
// scene to make, not the scene.
//
// Not the usual "lower it while the camera moves": that blurs the room on
// every drag, on every machine, fast ones included.

export const MIN_DPR = 1
export const DPR_STEP = 0.25

// Judged on the median frame of a window, so one hitch — a texture
// upload, the resize a step itself causes, a tab coming back — doesn't
// count. 90 frames is a second and a half at 60 Hz.
export const WINDOW_FRAMES = 90

// A median frame slower than this (45 fps) takes a step down.
export const SLOW_FRAME_MS = 22

export function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

export function nextDpr(dpr, medianFrameMs) {
  if (medianFrameMs <= SLOW_FRAME_MS || dpr <= MIN_DPR) return dpr
  return Math.max(MIN_DPR, dpr - DPR_STEP)
}
