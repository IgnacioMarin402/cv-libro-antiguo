// The dial: internet radios, played as they come. Each was picked from
// Radio Browser (api.radio-browser.info, by tag: fantasy, medieval, celtic)
// and checked on 2026-11-24 to answer over HTTPS — a page served over HTTPS
// can't play plain HTTP — and with CORS. Without CORS the browser still
// plays a stream, but routed through Web Audio it comes out as silence, and
// Web Audio is what fades one station into the next, sets its volume and
// silences it with the fires. A station that loses either, or goes off the
// air, reads "Sin señal" and the visitor turns on.
//
// `nowPlaying` is where the station says what it's playing, and how its
// answer reads (see nowPlaying.js) — where it says it with CORS too.
// CeltCast's SHOUTcast server tells its song (7.html, currentsong, stats)
// without that header, so the browser won't let the page read it: the dial
// shows its genre.
//
// There were also three ambiences synthesised here (a harp, a storm, a
// night); tried, and left out: the radios alone.
export const STATIONS = [
  {
    id: 'rivendell',
    name: 'Radio Rivendell',
    genre: 'Fantasía',
    url: 'https://play.radiorivendell.com/radio/8000/radio.mp3',
    nowPlaying: { url: 'https://play.radiorivendell.com/api/nowplaying/1', format: 'azuracast' },
  },
  {
    id: 'explorers',
    name: 'Explorers Emporium',
    genre: 'Aventura',
    url: 'https://listen.radioking.com/radio/155740/stream/196375',
    nowPlaying: {
      url: 'https://api.radioking.io/widget/radio/explorers-emporium-radio/track/current',
      format: 'radioking',
    },
  },
  {
    id: 'celtcast',
    name: 'CeltCast',
    genre: 'Celta',
    url: 'https://caster04.streampakket.com/proxy/8982/CeltCast',
  },
  {
    id: 'earlymusic',
    name: 'Early Music',
    genre: 'Medieval',
    url: 'https://earlymusic.stream.laut.fm/early_music',
    nowPlaying: { url: 'https://api.laut.fm/station/early_music/current_song', format: 'lautfm' },
  },
]

export const DEFAULT_STATION = 0

export const stationIndex = (id) => {
  const i = STATIONS.findIndex((s) => s.id === id)
  return i < 0 ? DEFAULT_STATION : i
}

// Turning past either end of the dial comes round to the other.
export const stepStation = (index, step) => (index + step + STATIONS.length) % STATIONS.length
