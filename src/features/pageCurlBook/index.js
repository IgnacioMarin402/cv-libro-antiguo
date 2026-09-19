// The book feature's public surface: the component, and the measurements
// the scene around it needs — where it stands on the table, and the height
// and footprint the camera frames against. Everything else — its curl, its
// stacking, its materials — stays inside.
export { default as PageCurlBook } from './PageCurlBook'
export { TABLE_CLEARANCE_Y, topSurfaceY, PAGE_WIDTH, PAGE_HEIGHT } from './domain/pageCurl'
