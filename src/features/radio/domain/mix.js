// How loud, and how one station gives way to the next.

// Every visit starts silent: the radio on, its dial up, the volume at
// zero, and no stream fetched until the visitor turns it up — this is a CV,
// and nobody gets music they didn't ask for. The speaker brings back the
// last volume they listened at, or, the first time, this one. The slider
// is heard squared (volumeGain), the way loudness is heard: half-way is a
// quarter of the gain, 12 dB down — music under the room, not over it.
export const UNMUTED_VOLUME = 0.5
export const volumeGain = (volume) => volume * volume

// Every station plays at the level it comes at. Measured as integrated
// loudness (ffmpeg's ebur128) on 2026-11-24, 25 s of each gave −11.6
// (Explorers), −13.1 (Early Music), −16.6 (Rivendell) and −18.3 LUFS
// (CeltCast): a spread that's as much the song playing as the station, so
// evening them out by station would only be right half the time.

// Seconds. The old station drops away quickly, so two never talk over
// each other for long; the new one rises slower, the way a tuning needle
// settles — and only once it's actually playing.
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
