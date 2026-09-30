// The love counter: the heart floating in the room, the count over the
// canvas, and the hook that keeps the two in step with the server
// (server/love.js). Like the loading screen, it straddles the canvas —
// LoveHeart goes inside it, LoveCounter over it — so the app holds useLove
// and hands each its half.
export { default as LoveHeart } from './LoveHeart'
export { default as LoveCounter } from './LoveCounter'
export { useLove } from './hooks/useLove'
