// What a station says it's playing, from each of the three ways the dial's
// stations say it. Pure, so it reads the same in Node as in the page; the
// shapes are the answers as they came on 2026-11-24.

// How often to ask. The answer changes once a song — three to seven minutes
// on these stations — so a title is at most this late, and asking more
// often only gets the same one back.
export const NOW_PLAYING_EVERY = 20

const join = (artist, title) => {
  const a = artist?.trim()
  const t = title?.trim()
  if (a && t) return `${a} — ${t}`
  return t || a || null
}

const PARSE = {
  // { now_playing: { song: { artist, title } } }
  azuracast: (body) => {
    const song = JSON.parse(body)?.now_playing?.song
    return join(song?.artist, song?.title)
  },
  // { artist, title }
  radioking: (body) => {
    const track = JSON.parse(body)
    return join(track?.artist, track?.title)
  },
  // { title, artist: { name } }
  lautfm: (body) => {
    const song = JSON.parse(body)
    return join(song?.artist?.name, song?.title)
  },
}

export function parseNowPlaying(format, body) {
  try {
    return PARSE[format]?.(body) ?? null
  } catch {
    return null
  }
}
