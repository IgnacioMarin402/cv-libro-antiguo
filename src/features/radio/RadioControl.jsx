import { setMuted, useMuted } from '@/shared/audio/mute'
import { STATIONS } from './domain/stations'
import { useRadio } from './hooks/useRadio'
import { useNowPlaying } from './hooks/useNowPlaying'
import { LyreIcon, SpeakerIcon } from './components/RadioIcons'
import './radio.css'

const STATUS_LINE = { tuning: 'Sintonizando…', nosignal: 'Sin señal' }

// The wheel over the volume: five points a notch, either way. Over the
// radio the wheel is the radio's — the canvas's zoom only hears it over
// the canvas.
const wheelVolume = (volume, deltaY) =>
  Math.round(Math.max(0, Math.min(1, volume - Math.sign(deltaY) * 0.05)) * 100) / 100

// Keys the volume slider uses for itself. Kept from the window, where the
// camera's WASD and arrows and the way back's Escape listen (see
// features/camera, shared/ui/BackButton): turning the music down shouldn't
// slide the view. Everything else — WASD with the slider focused — goes on.
const SLIDER_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'])

// The radio, in the bottom-left corner over the canvas and over everything
// else on it — the magnifier included — so it's always at hand. Off, it's
// a lyre; on, it opens into a dial: the station, what's playing or what's
// wrong, a tick for each station on the dial, and the volume, which the
// wheel turns too. Beside it, the speaker silences the whole page, fires
// and all (shared/audio/mute).
//
// Hidden until the loading screen has lifted (`shown`): nothing could play
// before then anyway.
export default function RadioControl({ shown }) {
  const radio = useRadio()
  const muted = useMuted()
  const song = useNowPlaying(radio.station, radio.on && radio.status === 'live')

  if (!shown) return null

  const { station } = radio
  const line = STATUS_LINE[radio.status] ?? song ?? station.genre
  const percent = Math.round(radio.volume * 100)

  return (
    <div className={radio.on ? 'radio radio--on' : 'radio'} role="group" aria-label="Radio">
      <button
        type="button"
        className="radio__button radio__power"
        aria-pressed={radio.on}
        aria-label={radio.on ? 'Apagar la radio' : 'Encender la radio'}
        title={radio.on ? 'Apagar la radio' : 'Encender la radio'}
        onClick={radio.power}
      >
        <LyreIcon />
      </button>

      {radio.on && (
        <div className="radio__dial">
          <button
            type="button"
            className="radio__step"
            aria-label="Estación anterior"
            onClick={() => radio.tune(-1)}
          >
            ‹
          </button>
          <div className="radio__tuner" title={`${station.name} · ${line}`}>
            <span className="radio__station">{station.name}</span>
            <span
              className={`radio__line radio__line--${radio.status}`}
              aria-live="polite"
            >
              {line}
            </span>
            <span className="radio__ticks" aria-hidden="true">
              {STATIONS.map((s, i) => (
                <span
                  key={s.id}
                  className={i === radio.index ? 'radio__tick radio__tick--on' : 'radio__tick'}
                />
              ))}
            </span>
          </div>
          <button
            type="button"
            className="radio__step"
            aria-label="Estación siguiente"
            onClick={() => radio.tune(1)}
          >
            ›
          </button>
          <label
            className="radio__volume"
            title={`Volumen ${percent} %`}
            onWheel={(e) => radio.setVolume(wheelVolume(radio.volume, e.deltaY))}
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={radio.volume}
              aria-label="Volumen de la radio"
              aria-valuetext={`${percent} %`}
              onChange={(e) => radio.setVolume(parseFloat(e.target.value))}
              onKeyDown={(e) => {
                if (SLIDER_KEYS.has(e.key)) e.stopPropagation()
              }}
              style={{ '--level': `${percent}%` }}
            />
            <span className="radio__percent" aria-hidden="true">
              {percent}
            </span>
          </label>
        </div>
      )}

      <button
        type="button"
        className={muted ? 'radio__button radio__mute radio__mute--on' : 'radio__button radio__mute'}
        aria-pressed={muted}
        aria-label={muted ? 'Activar el sonido' : 'Silenciar todo'}
        title={muted ? 'Activar el sonido' : 'Silenciar todo'}
        onClick={() => setMuted(!muted)}
      >
        <SpeakerIcon muted={muted} />
      </button>
    </div>
  )
}
