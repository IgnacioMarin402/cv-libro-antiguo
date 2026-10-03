import { heartCurve, EMBER_SCALE, EMBER_STOPS, EMBER_DROP, EMBER_RADIUS } from './domain/heart'
import './love.css'

// The heart drawn on screen is the one floating in the room: the same
// curve, 32 units across, flipped to SVG's downward y, and the same ember.
const UNITS = 32
const svgPoint = ([x, y]) => `${x.toFixed(2)} ${(-y).toFixed(2)}`
const { start, segments } = heartCurve(UNITS)
const HEART_PATH = `M${svgPoint(start)}` + segments.map((s) => `C${s.map(svgPoint).join(' ')}`).join('') + 'Z'

// How many hearts the project has, in the top right corner over the canvas.
// Drawn like the loading screen's seal: a gold hairline with an ember set
// inside it — the flame's gradient — that lies dark until this visitor has
// given their heart, and burns once they have. Hidden until the server has
// answered, and for good if there's none (see useLove). Under the pointer
// it grows a little and says what it counts.
export default function LoveCounter({ count, loved }) {
  if (count === null) return null
  return (
    <div
      className={loved ? 'love-counter love-counter--loved' : 'love-counter'}
      role="status"
      aria-label={count === 1 ? '1 corazón' : `${count} corazones`}
    >
      <svg className="love-counter__heart" viewBox="-19 -19 38 38" aria-hidden="true">
        <defs>
          <radialGradient
            id="love-counter-ember"
            cx="0"
            cy={EMBER_DROP * UNITS}
            r={EMBER_RADIUS * UNITS}
            gradientUnits="userSpaceOnUse"
          >
            {EMBER_STOPS.map(([at, color]) => (
              <stop key={at} offset={at} stopColor={color} />
            ))}
          </radialGradient>
        </defs>
        <g transform={`scale(${EMBER_SCALE})`}>
          <path d={HEART_PATH} className="love-counter__ember" />
        </g>
        <path d={HEART_PATH} className="love-counter__rim" />
      </svg>
      {/* Keyed on the count so each new heart replays the flare. */}
      <span key={count} className="love-counter__count">
        {count}
      </span>
      <span className="love-tip love-tip--counter" aria-hidden="true">
        Likes totales
      </span>
    </div>
  )
}
