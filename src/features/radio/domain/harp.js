// The wizard's harp: music that never ends and never quite repeats, composed
// a bar at a time. Pure — the composer hands out notes in beats, and
// audio/harpStation plays them — so it can be run and checked in Node.
//
// D Dorian: the mode of old modal folk tunes. Minor, but its raised sixth
// (B, not B flat) keeps it from sounding like a lament, and every chord the
// progressions use sits over a D drone without a clash.
export const DORIAN = [0, 2, 3, 5, 7, 9, 10]
export const ROOT = 50 // D3, scale degree 0
export const BPM = 66
export const BEATS_PER_BAR = 4
export const BARS_PER_PHRASE = 4

// The drone under everything: D2 and A2, root and fifth, the bagpipe's and
// the hurdy-gurdy's. It doesn't follow the chords; the chords move over it.
export const DRONE = [38, 45]

export const midiToFreq = (midi) => 440 * 2 ** ((midi - 69) / 12)

// A scale degree (any integer: negative goes down, past 6 up an octave) to
// MIDI.
export function degreeToMidi(degree) {
  const octave = Math.floor(degree / 7)
  const step = degree - octave * 7
  return ROOT + octave * 12 + DORIAN[step]
}

// Chords as the degree of their root; a triad is root, third, fifth by
// steps of the scale. In D Dorian: 0 Dm, 2 F, 3 G, 4 Am, 6 C. (5 is B
// diminished: left out.) Each phrase is four bars, starting home on Dm.
const PROGRESSIONS = [
  [0, 6, 3, 0], // Dm  C   G   Dm
  [0, 2, 6, 3], // Dm  F   C   G
  [0, 4, 6, 0], // Dm  Am  C   Dm
  [0, 3, 0, 6], // Dm  G   Dm  C
  [0, 2, 3, 4], // Dm  F   G   Am
]

// Arpeggio shapes over eight eighth notes, as indexes into the chord's
// tones laid out over two octaves (root, third, fifth, root, third, fifth,
// root): up and back, up and broken, rolling.
const ARPEGGIOS = [
  [0, 1, 2, 3, 4, 5, 4, 3],
  [0, 2, 3, 4, 5, 4, 3, 2],
  [0, 1, 2, 3, 2, 4, 3, 5],
  [0, 2, 1, 3, 2, 4, 3, 6],
  [0, 2, 4, 3, 5, 4, 6, 4],
]

// Where in the bar the melody sings, in beats.
const RHYTHMS = [
  [0, 2],
  [0, 1, 2],
  [0, 1.5, 2, 3],
  [0, 3],
  [1, 2, 3],
  [0, 0.5, 1, 2],
]

// Ranges, in degrees from D3. The melody rides over the arpeggios — A4 to
// B5 — where it can't be lost among them; the bells ring above both.
const MELODY_LOW = 11
const MELODY_HIGH = 19
const BELL_LOW = 14
const BELL_HIGH = 20

// The harp's strings run low to high across the player, so its sound
// spreads across the stereo field the same way: the bass a little left,
// the top a little right.
export const harpPan = (midi) => Math.max(-0.6, Math.min(0.6, (midi - 62) / 40))

const pick = (rng, list) => list[Math.floor(rng() * list.length)]
const between = (rng, a, b) => a + rng() * (b - a)

const isChordTone = (degree, chord) => [0, 2, 4].includes((((degree - chord) % 7) + 7) % 7)

// The nearest degree to `degree` that belongs to the chord.
function nearestChordTone(degree, chord) {
  for (let d = 0; d < 4; d++) {
    if (isChordTone(degree - d, chord)) return degree - d
    if (isChordTone(degree + d, chord)) return degree + d
  }
  return degree
}

export function createHarpComposer(rng = Math.random) {
  let bar = 0
  let progression = PROGRESSIONS[0]
  let melodyDegree = 14 // D5
  let melodic = false
  // How busy this phrase is: a breath of it rests more. Wanders from
  // phrase to phrase so an hour of it isn't one texture.
  let density = 0.8

  function startPhrase() {
    progression = pick(rng, PROGRESSIONS)
    melodic = rng() < 0.6
    density = between(rng, 0.6, 1)
  }

  // The next bar: its chord, and its notes in beats from the bar's start.
  function nextBar() {
    const inPhrase = bar % BARS_PER_PHRASE
    if (inPhrase === 0) startPhrase()
    const chord = progression[inPhrase]
    const last = inPhrase === BARS_PER_PHRASE - 1
    const notes = []
    const note = (beat, degree, velocity, voice) => {
      const midi = degreeToMidi(degree)
      notes.push({ beat, midi, velocity, voice, pan: harpPan(midi) })
    }

    // The bass string on the downbeat, an octave under the chord.
    note(0, chord - 7, between(rng, 0.62, 0.72), 'harp')

    const tones = [0, 2, 4, 7, 9, 11, 14].map((step) => chord + step)
    if (last || rng() < 0.2) {
      // A rolled chord: the hand sweeps up the strings and lets them ring.
      // It closes every phrase.
      const roll = between(rng, 0.07, 0.11)
      tones.slice(0, 6).forEach((degree, i) => {
        note(i * roll, degree, between(rng, 0.38, 0.5), 'harp')
      })
    } else {
      const shape = pick(rng, ARPEGGIOS)
      const rest = 0.12 + (1 - density) * 0.4
      shape.forEach((index, slot) => {
        if (slot > 0 && rng() < rest) return
        // A hand, not a sequencer: a few hundredths of a beat either way.
        const beat = slot * 0.5 + (slot > 0 ? between(rng, -0.02, 0.02) : 0)
        note(beat, tones[index], between(rng, 0.3, 0.5), 'harp')
      })
    }

    if (melodic) {
      for (const beat of pick(rng, RHYTHMS)) {
        melodyDegree += pick(rng, [-2, -1, -1, 0, 1, 1, 2])
        melodyDegree = Math.max(MELODY_LOW, Math.min(MELODY_HIGH, melodyDegree))
        // On the strong beats the melody lands on the chord; between them
        // it may pass through the rest of the scale.
        if (beat % 2 === 0) melodyDegree = nearestChordTone(melodyDegree, chord)
        note(beat, melodyDegree, between(rng, 0.55, 0.7), 'harp')
      }
    }

    // Now and then, as a phrase opens, a bell above it all.
    if (inPhrase === 0 && rng() < 0.5) {
      const bell = nearestChordTone(Math.round(between(rng, BELL_LOW, BELL_HIGH)), chord)
      note(between(rng, 0, 1), Math.min(BELL_HIGH, bell), between(rng, 0.25, 0.4), 'bell')
    }

    bar++
    return { chord, beats: BEATS_PER_BAR, notes }
  }

  return { nextBar }
}

// How long each string rings, in seconds to fall 60 dB: a long bass
// string rings for six, the top of the harp for two — about the square
// root of the frequency, clamped to that range.
export const ringTime = (freq) => Math.max(2, Math.min(6, 7 * Math.sqrt(110 / freq)))

// The bell's partials, as ratios to the struck note, their levels and
// their ring times in seconds. The ratios are a bar bell's — inharmonic,
// which is what makes it a bell and not an organ.
export const BELL_PARTIALS = [
  { ratio: 1, level: 1, ring: 3.5 },
  { ratio: 2.76, level: 0.4, ring: 1.6 },
  { ratio: 5.4, level: 0.15, ring: 0.8 },
]
