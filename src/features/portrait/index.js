// The dogs' portrait on a wall, in its frame. Which wall and where along it
// is the layout's call; the offsets say where its origin stands from the
// wall and over the floor, the width and height how much of the wall it
// takes, and the front offset where the face of its frame is — what the
// camera frames when a click on it asks to look up close. PortraitBack is
// the way back, over the canvas; the portrait places it beside its frame.
export { default as Portrait } from './Portrait'
export { default as PortraitBack } from './PortraitBack'
export {
  PORTRAIT_WIDTH,
  PORTRAIT_HEIGHT,
  PORTRAIT_BACK_OFFSET,
  PORTRAIT_FLOOR_OFFSET,
  PORTRAIT_FRONT_OFFSET,
} from './domain/portrait'
