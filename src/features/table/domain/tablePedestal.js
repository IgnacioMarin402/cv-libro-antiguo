import { TABLE, TABLE_SURFACE_Y } from './tableTop'

// The turned pedestal the top stands on, on the same digital lathe as the
// candlestick — the two are the only turned wood/pewter in the scene and
// they're meant to rhyme.
//
// Radius/height pairs read from the FOOT UP, in metres, like every other
// lathe profile here: a splayed foot, a shaft pinched by two rings where a
// turner's chisel would have rested, and a capital that flares back out to
// meet the underside of the top. The first and last points sit at radius 0
// so the revolution closes at both ends instead of leaving a hollow tube.
//
// The foot spreads to 0.32 m — under a third of the top's 1.0 m radius, so
// it stays well inside the top's silhouette and never pokes out past the
// edge.
export const PEDESTAL_PROFILE = [
  [0.0, 0.0],
  [0.32, 0.0],
  [0.32, 0.02],
  [0.3, 0.038],
  [0.225, 0.062],
  [0.15, 0.088],
  [0.105, 0.11],
  [0.088, 0.135],
  [0.098, 0.156],
  [0.082, 0.18],
  [0.072, 0.26],
  [0.066, 0.35],
  [0.076, 0.392],
  [0.062, 0.424],
  [0.06, 0.468],
  [0.09, 0.512],
  [0.13, 0.548],
  [0.19, 0.578],
  [0.23, 0.6],
  [0.0, 0.6],
]

// How tall the column is, taken from the profile rather than repeated next
// to it: the silhouette is the data, the height is what it measures.
export const PEDESTAL_HEIGHT = PEDESTAL_PROFILE[PEDESTAL_PROFILE.length - 1][1]

// Where the foot lands. The column has to bridge to the top's UNDERSIDE,
// not to its surface, so the top's own thickness comes out of the drop.
export const PEDESTAL_BASE_Y = TABLE_SURFACE_Y - TABLE.thickness - PEDESTAL_HEIGHT

// The floor is at PEDESTAL_BASE_Y, so the table stands 0.72 m tall — which
// is the point of the 0.6 m column: the scene has no floor to measure
// against (the table sits in black), so the only thing that can set the
// height is what a table you'd actually write at measures.
export const TABLE_HEIGHT = TABLE_SURFACE_Y - PEDESTAL_BASE_Y
