// The wizard cat standing at the book's side: a rigged figure generated in
// Tripo, and the scene's one prop that isn't built in code (see Wizard.jsx).

// How big it stands. The GLB comes 0.97 m tall — Tripo exports its figures
// at about a unit — which next to a 52.7 cm book is a person, not a figure,
// and the resting camera is only 62 cm off the table: at that size its
// frame cuts the figure at the waist (35 cm). At 0.4 it is 39 cm, 7 cm
// over the candle's flame. That is more than the resting shot has room for
// — measured over every spot at the book's side, nothing over 29 cm fits
// whole, and at 39 cm its top edge takes about two thirds of the hat — but
// the open shot takes it whole bar the hat's tip. It first stood at 29 cm;
// asked for bigger, 39 was chosen over 32 and 35, which cut less of the hat.
// Then asked for half as big again: 0.6, 58.1 cm. At that size its staff
// clip reaches 35 cm, which from where it stood went into the leaves, so
// it moved (see WIZARD_POSITION in the layout).
export const WIZARD_SCALE = 0.6

// Which of the GLB's three clips does what. Its rest pose is a T-pose, arms
// straight out (91 cm across at full size), so a clip always has to be
// posing it. It stands in the one made for standing, held on one frame (see
// STANDING_POSE). The book opening plays the staff one ("Con el cuerpo
// recto, tienes un báculo…"): over 3 s it thrusts the staff straight
// ahead, 58.6 cm at full size, and brings it back. A click plays the wave ("Necesito un saludo…"): over 5 s the right
// hand comes up to head height, waves, and comes down by 3.3 s. Neither
// one leaves its spot.
export const STANDING_CLIP = 'standing still'
export const STAFF_CLIP = 'Con el cuerpo recto'
export const WAVE_CLIP = 'Necesito un saludo'

// The frame the figure stands still on. Played, the standing clip sways the
// whole figure — up to 1.6 mm a frame at full size, and its loop doesn't
// close (16 mm off at the seam) — which read as fidgeting, not standing.
// This is the frame nearest its average pose: no bone more than 1.1° off
// it. The breathing (domain/breathing.js) goes over it.
export const STANDING_POSE = 2 / 24

// Where the wave starts playing from. The clip holds still for its first
// second — the hand doesn't move until 1.0 s — so from zero a click would
// get a second of nothing before the hand comes up.
export const WAVE_START = 1.0

// How long it takes to blend into a gesture and back out of it. The
// gestures don't start from the standing pose — the staff clip has the
// right hand 28 cm away at full size — so without a blend the figure jumps.
// 0.3 s hides the jump and is over before the thrust starts, 0.4 s into
// the staff clip.
export const CLIP_BLEND = 0.3
