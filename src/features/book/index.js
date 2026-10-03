// The book feature's public surface: the component itself, the one
// measurement other features legitimately need (the camera frames against
// the closed book's top face), and its cover leather — the gilt-tooled
// face and its bump — which the second book once bound itself with (see
// features/pageCurlBook, which still takes the bump for its spine; its
// doublure is its own now, red to match its cover). Everything else — its
// binding rules, its geometry, its hinges — stays inside.
export { default as Book } from './Book'
export { topSurfaceY, BOOK } from './domain/binding'
export { createCoverTexture, createCoverBumpTexture } from './textures/coverTextures'
