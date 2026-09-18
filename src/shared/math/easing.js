// Easing curves, shared by everything that animates on a timeline: the
// book's hinges, a page's flip, the camera's dolly. Plain (t: 0..1) => 0..1
// functions with no knowledge of what they're driving.

export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5)

// Overshoots past 1 before settling back — a snap with a bit of recoil.
export const easeOutBack = (t) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

// Progress (0..1) of an animation `duration` ms after `start`, eased.
export const easedProgress = (start, duration, ease) => ease(Math.min(1, (performance.now() - start) / duration))
