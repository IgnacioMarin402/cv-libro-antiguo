import { useEffect, useState } from 'react'
import { NOW_PLAYING_EVERY, parseNowPlaying } from '../domain/nowPlaying'

// What the station on the dial says it's playing, asked while it plays and
// again every so often (domain/nowPlaying). Null for a station that
// doesn't say, until it has, and whenever asking fails — the dial then
// shows the station's genre instead.
export function useNowPlaying(station, active) {
  const [song, setSong] = useState(null)
  const source = active ? station.nowPlaying : null

  useEffect(() => {
    setSong(null)
    if (!source) return
    const abort = new AbortController()
    const ask = () =>
      fetch(source.url, { signal: abort.signal, cache: 'no-store' })
        .then((response) => (response.ok ? response.text() : null))
        .then((body) => setSong(body ? parseNowPlaying(source.format, body) : null))
        .catch(() => {
          // Aborted, offline, or the station changed its API: no title.
        })
    ask()
    const id = setInterval(ask, NOW_PLAYING_EVERY * 1000)
    return () => {
      clearInterval(id)
      abort.abort()
    }
  }, [source])

  return song
}
