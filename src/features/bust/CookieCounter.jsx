import CookieIcon from './components/CookieIcon'
import './cookie.css'

// Many visitors, three a day each: it can grow long, so it's grouped by
// thousands, as Chile writes them (1.234.567).
const format = new Intl.NumberFormat('es-CL')

// How many cookies Shourdo has been given, by everyone: in the corner over
// the canvas, where the heart counter is, while he's being looked at — it
// takes the heart counter's place, and gives it back on the way out. Drawn
// like it. Hidden until the server has answered, and for good if there's
// none (see useCookies).
export default function CookieCounter({ count }) {
  if (count === null) return null
  return (
    <div className="cookie-counter" role="status" aria-label={count === 1 ? '1 galleta' : `${format.format(count)} galletas`}>
      <CookieIcon className="cookie-counter__icon" />
      {/* Keyed on the count so each new cookie replays the flare. */}
      <span key={count} className="cookie-counter__count">
        {format.format(count)}
      </span>
      <span className="cookie-tip" aria-hidden="true">
        Galletas totales
      </span>
    </div>
  )
}
