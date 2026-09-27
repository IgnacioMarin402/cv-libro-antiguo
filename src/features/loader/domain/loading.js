// When the room counts as loaded, how far along the loading screen says it
// is, and how that screen gets out of the way. Times in ms.

// How long the loaders must stay quiet before the room counts as loaded.
// "Every item has ended" is true for an instant between two waves of
// loads, and a model that has finished isn't in the scene yet: React 19
// reveals resolved Suspense boundaries in batches up to 300 ms apart. 700
// is past two of those.
export const SETTLE_MS = 700

// The "unos segundos" between the room being ready and the visit starting:
// the finished screen holds this long before it lifts. By then everything
// is on the GPU, so this is a pause, not a wait.
export const READY_HOLD_MS = 1500

// How long the light takes to open out from the flame and uncover the
// room. The camera's dolly-in starts with it (see features/camera): the
// first stretch of its ease barely moves, so the room is uncovered before
// the lens is going anywhere.
export const REVEAL_MS = 1600

// How much of the ring each stage fills. Not how long each takes — the
// download is nearly all of it over a network and nothing on localhost —
// just a share of the ring that none of them can run past.
//  - fetch: bytes streamed.
//  - parse: files decoded into usable models (the loaders' items).
//  - warmup: shaders compiled and textures uploaded, so the first frames of
//    the visit don't stall on the GPU.
export const STAGE_WEIGHTS = { fetch: 0.6, parse: 0.25, warmup: 0.15 }

export const STAGE_LINES = {
  fetch: 'Desempolvando el manuscrito',
  parse: 'Ordenando la estancia',
  warmup: 'Encendiendo las velas',
  ready: 'El libro te espera',
}

const fraction = (done, total) => (total > 0 ? Math.min(1, done / total) : 0)

// `state` is the loaders' count (see shared/three/loadTracker); `warmup` is
// null until the warm-up starts, then its 0..1.
export function loadingProgress(state, warmup) {
  const items = fraction(state.itemsLoaded, state.itemsTotal)
  // No announced sizes (a server that doesn't send Content-Length): the
  // items are all there is to go on.
  const bytes = state.bytesTotal > 0 ? fraction(state.bytesLoaded, state.bytesTotal) : items
  const w = STAGE_WEIGHTS
  if (warmup !== null) return w.fetch + w.parse + w.warmup * warmup
  return w.fetch * bytes + w.parse * items
}

export function loadingStage(state, warmup, ready) {
  if (ready) return 'ready'
  if (warmup !== null) return 'warmup'
  const bytesDone = state.bytesTotal > 0 && state.bytesLoaded >= state.bytesTotal
  return bytesDone ? 'parse' : 'fetch'
}

export const isSettled = (state, now) => state.idleSince !== null && now - state.idleSince >= SETTLE_MS
