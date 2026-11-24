// What a control is for, said under the pointer in a small pill — the heart
// counter's "Likes totales" (features/love/love.css), not the browser's
// own tooltip, which on Windows comes up as a grey system box. The radio
// sits at the bottom of the screen, so the pill hangs above its control.
// It shows while its control (a `.radio__tipped`) is hovered or focused
// from the keyboard; screen readers have the control's own label. `align`
// is 'center', 'start' (from the control's left edge) or 'wide' (from it,
// and free to wrap).
export default function Tip({ children, align = 'center' }) {
  return (
    <span className={`radio-tip radio-tip--${align}`} aria-hidden="true">
      {children}
    </span>
  )
}
