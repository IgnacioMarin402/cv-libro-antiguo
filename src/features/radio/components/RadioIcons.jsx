// The radio's two glyphs, drawn in the corner's hairline: a lyre for the
// music (a radio set would be the one anachronism in the room) and a
// speaker for the page's sound.

export function LyreIcon() {
  return (
    <svg className="radio__icon" viewBox="0 0 24 24" aria-hidden="true">
      {/* The two arms, curling out at the top like horns. */}
      <path d="M8.2 19.5C5 16.5 4.6 11 6.4 7.4 7.2 5.8 6.6 4.4 5.2 3.8" />
      <path d="M15.8 19.5c3.2-3 3.6-8.5 1.8-12.1-.8-1.6-.2-3 1.2-3.6" />
      {/* The yoke, and the soundbox at the foot. */}
      <path d="M6.6 7h10.8" />
      <path d="M8.2 19.5h7.6" />
      {/* The strings. */}
      <path d="M10 7v12.5M12 7v12.5M14 7v12.5" strokeWidth="1" />
    </svg>
  )
}

export function SpeakerIcon({ muted }) {
  return (
    <svg className="radio__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" />
      {muted ? (
        <path d="M15.5 9.5l5 5M20.5 9.5l-5 5" />
      ) : (
        <>
          <path d="M15.4 9.2a4 4 0 0 1 0 5.6" />
          <path d="M17.8 6.8a7.4 7.4 0 0 1 0 10.4" />
        </>
      )}
    </svg>
  )
}
