// The book feature's public surface: the component itself, plus the one
// measurement other features legitimately need (the camera frames against
// the closed book's top face). Everything else — its binding rules, its
// geometry, its hinges — stays inside.
export { default as Book } from './Book'
export { topSurfaceY, BOOK } from './domain/binding'
