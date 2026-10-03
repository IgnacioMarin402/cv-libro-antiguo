import './love.css'

// What the heart in the room is for, said over the canvas while the pointer
// is on it: an ask for this visitor's like — or, once they've given it
// (a click still plays the heart, but counts once), thanks for it. The
// heart places it and shows it, through `ref` (see hooks/useHeartTip). With
// no counter — no server behind the page — there's nothing to count, and it
// isn't there.
export default function LoveHeartTip({ ref, count, loved }) {
  if (count === null) return null
  return (
    <div ref={ref} className="love-tip love-tip--heart" aria-hidden="true">
      {loved ? '¡Gracias por tu like!' : '¡Apóyame con un like!'}
    </div>
  )
}
