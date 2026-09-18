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

// Unity's SmoothDamp — the critically-damped spring behind `maath`'s easing
// helpers, which is what the page-curl book's turns run on. Unlike the
// curves above it has no timeline: it eases the current value toward a
// target (which may keep moving) in roughly `smoothTime` seconds, carrying
// velocity from one frame to the next so the motion starts and stops with
// weight instead of lurching then crawling the way a lerp does. The caller
// owns that velocity — one `{ value: 0 }` holder per animated number.
const dampDecay = (t) => 1 / (1 + t + 0.48 * t * t + 0.235 * t * t * t)

export function smoothDamp(current, target, velocity, smoothTime, delta, eps = 0.001) {
  if (Math.abs(current - target) <= eps) return target
  const omega = 2 / Math.max(0.0001, smoothTime)
  const decay = dampDecay(omega * delta)
  const change = current - target
  const temp = (velocity.value + omega * change) * delta
  velocity.value = (velocity.value - omega * temp) * decay
  const output = target + (change + temp) * decay
  // Never sail past the target: on a spring this soft an overshoot reads as
  // a wobble, not as momentum.
  if (target - current > 0 === output > target) {
    velocity.value = 0
    return target
  }
  return output
}

// The shortest way round to an angle, so nothing unwinds the long way.
const TWO_PI = Math.PI * 2
const shortestAngleTo = (current, target) => {
  const d = (((target - current) % TWO_PI) + TWO_PI) % TWO_PI
  return d > Math.PI ? d - TWO_PI : d
}

export const smoothDampAngle = (current, target, velocity, smoothTime, delta) =>
  smoothDamp(current, current + shortestAngleTo(current, target), velocity, smoothTime, delta)
