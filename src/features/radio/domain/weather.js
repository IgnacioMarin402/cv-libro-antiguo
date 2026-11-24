// The weather outside the window, as rules: when things happen and how
// strong, never how they're synthesised (that's audio/). Times in seconds,
// levels as linear gains before the station's own level (mix.js).

const between = (rng, [a, b]) => a + rng() * (b - a)

// The gap until the next of a run of events that happen at random but at a
// steady rate — raindrops, chirps: exponential, so they bunch and thin out
// the way real ones do instead of ticking like a clock.
export const poissonGap = (rng, perSecond) => -Math.log(1 - rng()) / perSecond

// --- Rain on the window ---------------------------------------------------

export const RAIN = {
  // The hiss of it everywhere, and the roar of it on the roof further off.
  hiss: 0.42,
  roar: 0.5,
  // Gusts push it harder and let it off, every few seconds.
  gustEvery: [3, 8],
  gustLevel: [0.7, 1],
  // Single drops striking the glass near the listener: a rate, the band
  // of the tick they make, and how loud — skewed to the quiet end (nextDrop):
  // most drops are a patter, a few land hard.
  dropsPerSecond: 16,
  dropBand: [1600, 5200],
  dropLevel: [0.04, 0.2],
}

export function nextDrop(rng) {
  return {
    gap: poissonGap(rng, RAIN.dropsPerSecond),
    freq: between(rng, RAIN.dropBand),
    level: between(rng, RAIN.dropLevel) ** 1.5,
    pan: between(rng, [-0.8, 0.8]),
  }
}

export const nextGust = (rng) => ({
  gap: between(rng, RAIN.gustEvery),
  level: between(rng, RAIN.gustLevel),
})

// --- Thunder --------------------------------------------------------------

// The first one soon, so whoever tunes in hears what the station is; then
// at the pace of a storm passing — sometimes overhead, mostly not.
export const THUNDER = {
  first: [4, 8],
  every: [16, 40],
  nearChance: 0.3,
}

// One strike: a near one cracks before it rolls, and its rumble is
// brighter (the high frequencies haven't been soaked up by the distance);
// a far one only rolls, low, swelling in from nothing. A rumble is the
// sound of a kilometres-long channel arriving bit by bit, so it comes as a
// run of swells, each weaker than the last.
export function thunderStrike(rng) {
  const near = rng() < THUNDER.nearChance
  const level = near ? 0.95 : between(rng, [0.4, 0.65])
  const duration = near ? between(rng, [5, 8]) : between(rng, [6, 10])
  const swells = []
  let at = near ? 0.04 : between(rng, [0.3, 0.8])
  let peak = level
  while (at < duration - 1.5) {
    swells.push({
      at,
      level: peak,
      attack: near && swells.length === 0 ? 0.03 : between(rng, [0.15, 0.5]),
      decay: between(rng, [0.6, 1.6]),
    })
    at += between(rng, [0.5, 1.8])
    peak *= between(rng, [0.55, 0.85])
  }
  return {
    near,
    duration,
    swells,
    crack: near ? level * 0.5 : 0,
    cutoff: near ? [1400, 140] : [480, 110],
    pan: between(rng, [-0.6, 0.6]),
  }
}

export const nextThunder = (rng, first = false) => between(rng, first ? THUNDER.first : THUNDER.every)

// --- Wind -----------------------------------------------------------------

// Air through the window's leading and round the stone: a band of noise
// whose pitch and strength wander. `level` is the storm's; the night's is
// a breath of it.
export const WIND = {
  storm: { level: 0.32, centre: [280, 800], q: [0.9, 2.4], every: [3, 7] },
  night: { level: 0.12, centre: [200, 520], q: [1.2, 3], every: [5, 10] },
}

export function nextWind(rng, wind) {
  return {
    gap: between(rng, wind.every),
    centre: between(rng, wind.centre),
    q: between(rng, wind.q),
    level: wind.level * between(rng, [0.45, 1]),
  }
}

// --- Crickets -------------------------------------------------------------

// A field cricket chirps three or four pulses of a pure tone near 4.5 kHz,
// each about 15 ms with 25 ms between them, a chirp every two thirds of a
// second — and stops now and then, as if it heard something.
export const CRICKETS = {
  count: 3,
  carrier: [4200, 5100],
  pulses: [3, 4],
  pulseLength: 0.015,
  pulseGap: 0.025,
  chirpEvery: [0.55, 0.9],
  pauseChance: 0.06,
  pause: [2, 6],
  level: [0.015, 0.04],
}

export function createCricket(rng) {
  return {
    carrier: between(rng, CRICKETS.carrier),
    level: between(rng, CRICKETS.level),
    pan: between(rng, [-0.9, 0.9]),
    every: between(rng, CRICKETS.chirpEvery),
  }
}

// The next chirp of a cricket: how many pulses, and how long until the one
// after (a pause, sometimes).
export function nextChirp(rng, cricket) {
  const pulses = Math.round(between(rng, CRICKETS.pulses))
  const pause = rng() < CRICKETS.pauseChance ? between(rng, CRICKETS.pause) : 0
  return { pulses, gap: cricket.every * between(rng, [0.92, 1.08]) + pause }
}

// --- The owl --------------------------------------------------------------

// A great horned owl's call: hoo, h'hoo, a breath, hoo, hoo — low (300 Hz
// and under), soft-edged, each note sliding up a little and falling away.
// Distant: it reaches the room mostly as reverb.
export const OWL = {
  first: [6, 12],
  every: [22, 50],
  pitch: [270, 330],
  level: [0.1, 0.2],
}

const OWL_RHYTHM = [
  { at: 0, duration: 0.42 },
  { at: 0.62, duration: 0.16 },
  { at: 0.82, duration: 0.38 },
  { at: 1.8, duration: 0.45 },
  { at: 2.6, duration: 0.45 },
]

export function owlCall(rng) {
  const pitch = between(rng, OWL.pitch)
  const level = between(rng, OWL.level)
  return {
    pan: between(rng, [-0.7, 0.7]),
    hoots: OWL_RHYTHM.map(({ at, duration }) => ({
      at,
      duration,
      from: pitch * 0.92,
      peak: pitch,
      to: pitch * 0.86,
      level,
    })),
  }
}

export const nextOwl = (rng, first = false) => between(rng, first ? OWL.first : OWL.every)
