// The love counter: the heart floating in the room, the count over the
// canvas, and the hook that keeps the two in step with the server
// (server/love.js). Like the loading screen, it straddles the canvas —
// LoveHeart goes inside it, LoveCounter and LoveHeartTip (what the heart is
// for, which the heart places beside itself) over it — so the app holds
// useLove and hands each its half.
export { default as LoveHeart } from './LoveHeart'
export { default as LoveCounter } from './LoveCounter'
export { default as LoveHeartTip } from './LoveHeartTip'
export { useLove } from './hooks/useLove'
// The heart's shape and its light, for anything else in the room that gives
// hearts (Shourdo's bust, for a treat).
export { createEmberGeometry as createHeartGeometry } from './geometry/heartGeometry'
export { createHeartTexture } from './textures/glowTextures'
