// How loud, and how one station gives way to the next.

// Where the volume slider starts on a first visit. The slider is heard
// squared (volumeGain), the way loudness is heard: half-way is a quarter of
// the gain, about 12 dB down, under the candle's crackle up close.
export const DEFAULT_VOLUME = 0.5
export const volumeGain = (volume) => volume * volume

// Each station's level, so turning the dial doesn't jump in loudness.
// Measured as integrated loudness (ffmpeg's ebur128) on 2026-11-24: 25 s
// of each stream gave −11.6 (Explorers), −13.1 (Early Music), −16.6
// (Rivendell) and −18.3 LUFS (CeltCast) — a median near −15, and a spread
// that's as much the song as the station, so they share one level. Taken
// down 3 dB, to about −18.
export const STREAM_LEVEL = 0.7

// The stations made here, rendered offline for 45 s through their real
// modules, came out at −23.3 (harp), −17.1 (storm) and −35.0 LUFS (night).
// These bring the harp to about the streams' −18 — it's music too — and
// the other two under it: an ambience is a backdrop, the storm at about
// −21 and the night, which is quiet by nature, at about −26. Their peaks
// stayed under −2 dBFS. Re-measure if a recipe changes (audio/).
export const AMBIENCE_LEVEL = {
  harp: 1.7,
  storm: 0.62,
  night: 2.8,
}

// Seconds. The old station drops away quickly, so two never talk over
// each other for long; the new one rises slower, the way a tuning needle
// settles. A stream only starts rising once it's actually playing.
export const FADE_OUT = 0.6
export const FADE_IN = 1.4

// A stream that hasn't started after this long is off the air, or as good
// as: the dial says so instead of tuning forever.
export const TUNING_TIMEOUT = 12

// A stream that drops once it was playing (servers recycle their
// connections) is asked again this many times, this many seconds apart,
// before the dial says it's gone.
export const RECONNECT_TRIES = 3
export const RECONNECT_AFTER = 3
