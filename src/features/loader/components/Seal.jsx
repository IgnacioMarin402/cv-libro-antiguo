import { useMemo } from 'react'
import { RING_RADIUS, DIAL, DOTS, ringPoint, tickPath } from '../geometry/seal'

// The loading screen's centrepiece: an astrolabe-like dial round a candle
// flame, with the progress drawn as the ring between them.

function Dial() {
  const ticks = useMemo(tickPath, [])
  const jewels = [0, 0.25, 0.5, 0.75].map((p) => ringPoint(p, DIAL.jewel))
  return (
    <svg className="loader__dial" viewBox="-100 -100 200 200" aria-hidden="true">
      <circle r={DIAL.rim} className="loader__rim" />
      <path d={ticks} className="loader__ticks" />
      {jewels.map(([x, y], i) => (
        <rect key={i} x={x - 2} y={y - 2} width="4" height="4" transform={`rotate(45 ${x} ${y})`} className="loader__jewel" />
      ))}
    </svg>
  )
}

function DotRing() {
  const dots = useMemo(() => Array.from({ length: DOTS.count }, (_, i) => ringPoint(i / DOTS.count, DOTS.radius)), [])
  return (
    <svg className="loader__dots-ring" viewBox="-100 -100 200 200" aria-hidden="true">
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 0.9 : 0.5} />
      ))}
    </svg>
  )
}

function Flame() {
  return (
    <div className="loader__flame" aria-hidden="true">
      <div className="loader__flame-glow" />
      <svg className="loader__flame-body" viewBox="0 0 40 64">
        <defs>
          <radialGradient id="loader-flame-outer" cx="20" cy="46" r="34" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fff3cf" />
            <stop offset="0.35" stopColor="#ffc868" />
            <stop offset="0.7" stopColor="#ff8a2a" stopOpacity="0.85" />
            <stop offset="1" stopColor="#ff6410" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="loader-flame-core" cx="20" cy="47" r="14" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#ffe3a0" stopOpacity="0.9" />
          </radialGradient>
        </defs>
        <ellipse cx="20" cy="55" rx="5" ry="3" className="loader__flame-base" />
        <path d="M20 2C26 16 36 30 36 42A16 16 0 0 1 4 42C4 30 14 16 20 2Z" fill="url(#loader-flame-outer)" />
        <path d="M20 20C24 29 29 37 29 45A9 9 0 0 1 11 45C11 37 16 29 20 20Z" fill="url(#loader-flame-core)" />
        <line x1="20" y1="55" x2="20" y2="63" className="loader__wick" />
      </svg>
    </div>
  )
}

export default function Seal({ meterRef, arcRef, beadRef }) {
  return (
    <div
      className="loader__seal"
      ref={meterRef}
      role="progressbar"
      aria-label="Cargando la escena"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
    >
      <Dial />
      <DotRing />
      <svg className="loader__ring" viewBox="-100 -100 200 200" aria-hidden="true">
        <defs>
          <linearGradient id="loader-arc" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0" stopColor="#f6dca4" />
            <stop offset="1" stopColor="#c8903e" />
          </linearGradient>
        </defs>
        <circle r={RING_RADIUS} className="loader__track" />
        {/* pathLength 1: the dash offset is simply what's left to load.
            Turned back a quarter so it starts from the top. */}
        <circle
          ref={arcRef}
          r={RING_RADIUS}
          pathLength="1"
          strokeDasharray="1 1"
          strokeDashoffset="1"
          transform="rotate(-90)"
          stroke="url(#loader-arc)"
          className="loader__arc"
        />
        <circle ref={beadRef} cx="0" cy={-RING_RADIUS} r="2.4" className="loader__bead" />
      </svg>
      <Flame />
    </div>
  )
}
