import TreatIcon from './components/TreatIcon'
import './treat.css'

// Many visitors, three a day each: it can grow long, so it's grouped by
// thousands, as Chile writes them (1.234.567).
const format = new Intl.NumberFormat('es-CL')

// How many treats Shourdo has been given, by everyone: in the corner over
// the canvas, where the heart counter is, while he's being looked at — it
// takes the heart counter's place, and gives it back on the way out. Drawn
// like it. Hidden until the server has answered, and for good if there's
// none (see useTreats).
export default function TreatCounter({ count }) {
  if (count === null) return null
  return (
    <div className="treat-counter" role="status" aria-label={count === 1 ? '1 galleta' : `${format.format(count)} galletas`}>
      <TreatIcon className="treat-counter__icon" />
      {/* Keyed on the count so each new treat replays the flare. */}
      <span key={count} className="treat-counter__count">
        {format.format(count)}
      </span>
      <span className="treat-tip" aria-hidden="true">
        Galletas totales
      </span>
    </div>
  )
}
