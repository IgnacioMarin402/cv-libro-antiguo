// A cookie, drawn as the corner's heart is: a gold hairline round it, and
// its chips.
const CHIPS = [
  [-3.5, -3, 1.3],
  [3, -4, 1.1],
  [4.2, 2.2, 1.3],
  [-1, 4, 1.2],
  [-5, 2, 1],
  [0.6, -0.4, 1.1],
]

export default function CookieIcon({ className }) {
  return (
    <svg className={className} viewBox="-11 -11 22 22" aria-hidden="true">
      <circle className="cookie-icon__dough" r="9" />
      {CHIPS.map(([x, y, r]) => (
        <circle key={`${x},${y}`} className="cookie-icon__chip" cx={x} cy={y} r={r} />
      ))}
    </svg>
  )
}
