import { useLoadingDisplay } from './hooks/useLoadingDisplay'
import { useRevealTimeline } from './hooks/useRevealTimeline'
import { REVEAL_MS, STAGE_LINES } from './domain/loading'
import Seal from './components/Seal'
import Embers from './components/Embers'
import './loadingScreen.css'

function LoadingView({ phase, ready, warmupRef }) {
  const { stage, rootRef, meterRef, arcRef, beadRef, percentRef } = useLoadingDisplay(warmupRef, ready)
  return (
    <div
      ref={rootRef}
      className={`loader is-${phase}`}
      style={{ '--reveal': `${REVEAL_MS}ms` }}
      role="status"
      aria-live="polite"
    >
      <div className="loader__halo" aria-hidden="true" />
      <Embers />
      <Seal meterRef={meterRef} arcRef={arcRef} beadRef={beadRef} />
      <div className="loader__caption">
        <span className="loader__percent" ref={percentRef}>
          0
        </span>
        <span className="loader__rule" aria-hidden="true" />
        {/* Keyed by stage, so each new line fades in rather than swapping. */}
        <p className="loader__line" key={stage}>
          {STAGE_LINES[stage]}
          {stage !== 'ready' && (
            <span className="loader__ellipsis" aria-hidden="true">
              <i>.</i>
              <i>.</i>
              <i>.</i>
            </span>
          )}
        </p>
      </div>
      <div className="loader__grain" aria-hidden="true" />
    </div>
  )
}

// The screen over the canvas while the room loads. `ready` comes from
// SceneWarmup, inside the canvas, once everything is on the GPU; from
// there the screen holds, lifts, and calls onReveal as it starts to — the
// cue for the camera's dolly-in. Unmounted once it's gone, which also
// stops its frame loop.
export default function LoadingScreen({ ready, warmupRef, onReveal }) {
  const phase = useRevealTimeline(ready, onReveal)
  if (phase === 'gone') return null
  return <LoadingView phase={phase} ready={ready} warmupRef={warmupRef} />
}
