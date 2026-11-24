// Noise, the raw material of rain, wind and thunder, rendered once into
// buffers that loop. What these know is sound; what they become is the
// stations' business.

// Colour sets where the energy sits: white is flat (hiss), pink falls 3 dB
// an octave (rain, as the ear hears it), brown 6 dB (rumble).
function fill(data, colour) {
  if (colour === 'white') {
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    return
  }
  if (colour === 'pink') {
    // Paul Kellet's economy filter: three poles spread over the band.
    let b0 = 0
    let b1 = 0
    let b2 = 0
    for (let i = 0; i < data.length; i++) {
      const w = Math.random() * 2 - 1
      b0 = 0.99765 * b0 + w * 0.099046
      b1 = 0.963 * b1 + w * 0.2965164
      b2 = 0.57 * b2 + w * 1.0526913
      data[i] = b0 + b1 + b2 + w * 0.1848
    }
    return
  }
  // Brown: integrated white, leaking so it doesn't wander off.
  let last = 0
  for (let i = 0; i < data.length; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02
    data[i] = last
  }
}

function normalise(data, peak = 0.9) {
  let max = 0
  for (let i = 0; i < data.length; i++) max = Math.max(max, Math.abs(data[i]))
  if (max > 0) for (let i = 0; i < data.length; i++) data[i] *= peak / max
}

// A buffer of noise that loops without a seam: rendered a little long, its
// tail is cross-faded into its head. White doesn't need it (every sample
// is a jump already), but brown's slow swings would thump at the join.
// Cached by sample rate: an AudioBuffer plays in any context at its rate.
const cache = new Map()
export function noiseBuffer(ctx, colour = 'white', seconds = 6) {
  const key = `${ctx.sampleRate}:${colour}:${seconds}`
  if (cache.has(key)) return cache.get(key)
  const length = Math.floor(seconds * ctx.sampleRate)
  const fade = Math.floor(0.25 * ctx.sampleRate)
  const raw = new Float32Array(length + fade)
  fill(raw, colour)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  data.set(raw.subarray(0, length))
  for (let i = 0; i < fade; i++) {
    const t = i / fade
    data[i] = raw[i] * t + raw[length + i] * (1 - t)
  }
  normalise(data)
  cache.set(key, buffer)
  return buffer
}

// A short tick of noise, falling away in a few milliseconds: a raindrop on
// glass once a band-pass gives it a pitch.
export function tickBuffer(ctx, seconds = 0.04, decay = 0.005) {
  const length = Math.floor(seconds * ctx.sampleRate)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / ctx.sampleRate / decay)
  }
  return buffer
}
