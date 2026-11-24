import { STATIONS } from './domain/stations'
import { useRadio } from './hooks/useRadio'
import { useNowPlaying } from './hooks/useNowPlaying'
import { LyreIcon, SpeakerIcon } from './components/RadioIcons'
import Tip from './components/Tip'
import './radio.css'

const STATUS_LINE = {
  tuning: 'Sintonizando…',
  nosignal: 'Sin señal',
  blocked: 'Haz clic para escuchar',
}

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
// else on it — the magnifier included — so it's always at hand. It comes
// on with the room, playing at zero (domain/mix): the dial says what each
// station is playing, and the speaker or the slider (or the wheel over it)
// lets it be heard, at once. The lyre folds it away.
//
// What each control is for, it says under the pointer the way the heart
// counter does (Tip), not with the browser's own tooltip.
//
// Hidden until the loading screen has lifted (`shown`).
export default function RadioControl({ shown }) {
  const radio = useRadio(shown)
  // Asked while it's on, heard or not: at zero it still plays (hooks/useRadio).
  const song = useNowPlaying(radio.station, shown && radio.on)

  if (!shown) return null

  const { station, volume } = radio
  const line = STATUS_LINE[radio.status] ?? song ?? station.genre
  const percent = Math.round(volume * 100)
  const silent = volume === 0
  const playing = radio.on && !silent && radio.status === 'live'

  return (
    <div
      className={['radio', radio.on && 'radio--on', playing && 'radio--playing'].filter(Boolean).join(' ')}
      role="group"
      aria-label="Radio"
    >
      <button
        type="button"
        className="radio__button radio__power radio__tipped"
        aria-pressed={radio.on}
        aria-label={radio.on ? 'Apagar la radio' : 'Encender la radio'}
        onClick={radio.power}
      >
        <LyreIcon />
        <Tip align="start">{radio.on ? 'Apagar la radio' : 'Encender la radio'}</Tip>
      </button>

      {radio.on && (
        <div className="radio__dial">
          <button
            type="button"
            className="radio__step radio__tipped"
            aria-label="Estación anterior"
            onClick={() => radio.tune(-1)}
          >
            ‹<Tip>Estación anterior</Tip>
          </button>
          <div className="radio__tuner radio__tipped">
            <span className="radio__station">{station.name}</span>
            <span className={`radio__line radio__line--${radio.status}`} aria-live="polite">
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
            <Tip align="wide">{`${station.name} · ${line}`}</Tip>
          </div>
          <button
            type="button"
            className="radio__step radio__tipped"
            aria-label="Estación siguiente"
            onClick={() => radio.tune(1)}
          >
            ›<Tip>Estación siguiente</Tip>
          </button>

          <div
            className="radio__volume"
            onWheel={(e) => radio.setVolume(wheelVolume(volume, e.deltaY))}
          >
            <button
              type="button"
              className={silent ? 'radio__mute radio__mute--on radio__tipped' : 'radio__mute radio__tipped'}
              aria-pressed={silent}
              aria-label={silent ? 'Escuchar la radio' : 'Silenciar la radio'}
              onClick={radio.toggleSound}
            >
              <SpeakerIcon muted={silent} />
              <Tip>{silent ? 'Escuchar la radio' : 'Silenciar la radio'}</Tip>
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
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
          </div>
        </div>
      )}
    </div>
  )
}
