// The wizard cat standing at the book's side: a rigged figure generated in
// Tripo, and the scene's one prop that isn't built in code (see Wizard.jsx).

// How big it stands. The GLB comes 0.97 m tall — Tripo exports its figures
// at about a unit — which next to a 52.7 cm book is a person, not a figure,
// and the resting camera is only 62 cm off the table: at that size its
// frame cuts the figure at the waist (35 cm). At 0.3 it is 29 cm, just
// under the candle's flame (31.9 cm), and stands whole in both framings.
export const WIZARD_SCALE = 0.3

// Which of the GLB's three clips does what. Its rest pose is a T-pose, arms
// straight out (91 cm across at full size), so a clip always has to be
// posing it. It stands in the one made for standing — over its one-second
// loop the outline moves under 2 mm at full size. The book opening plays
// the staff one ("Con el cuerpo recto, tienes un báculo…"): over 3 s it
// thrusts the staff straight ahead, 58.6 cm at full size, and brings it
// back. A click plays the wave ("Necesito un saludo…"): over 5 s the right
// hand comes up to head height, waves, and comes down by 3.3 s. Neither
// one leaves its spot.
export const STANDING_CLIP = 'standing still'
export const STAFF_CLIP = 'Con el cuerpo recto'
export const WAVE_CLIP = 'Necesito un saludo'

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
