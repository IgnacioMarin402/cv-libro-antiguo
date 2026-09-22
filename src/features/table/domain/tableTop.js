// The table everything else stands on: a thick, slightly tapered round top
// whose surface sits at y = 0, so every prop in the scene can be placed
// from the floor up rather than against an arbitrary offset.
//
// Sized against what it actually holds. The farthest props are the wizard
// and the helmet, both 0.76 m out, and the helmet's stand and spikes reach
// 0.88 m (the open book reaches 0.47, the candle 0.52). A 1 m top still
// holds them and, more to the point, brings the far edge back INTO the
// resting shot: from that camera (0.62 m up, 0.95 m back) the rear edge
// sits 17.6 deg below the horizon, well inside the 19 deg half-frame. It
// used to be 2.6 m, which put the edge at 9.9 deg — above the top of the
// frame, so the table read as an infinite floor instead of a table with
// black behind it. Both radii scale together to keep the tapered profile.
export const TABLE = {
  topRadius: 1.0,
  bottomRadius: 1.115,
  thickness: 0.12,
  segments: 48,
}

export const TABLE_SURFACE_Y = 0
