// The book feature's public surface: the component itself, the one
// measurement other features legitimately need (the camera frames against
// the closed book's top face), and its cover leather — the gilt-tooled
// face, its bump, and the plain doublure behind it — which the second book
// binds itself with so both are the same edition (see
// features/pageCurlBook). Everything else — its binding rules, its
// geometry, its hinges — stays inside.
export { default as Book } from './Book'
export { topSurfaceY, BOOK } from './domain/binding'
export { createCoverTexture, createCoverBumpTexture, createCoverInnerTexture } from './textures/coverTextures'
