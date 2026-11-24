import { RECONNECT_AFTER, RECONNECT_TRIES, TUNING_TIMEOUT } from '../domain/mix'

// An internet radio, through the page's audio graph: an <audio> element
// fetched with CORS (crossOrigin before src, or the browser fetches it
// without and the graph hears silence — see domain/stations) and handed
// to Web Audio, where the engine fades it in and out and sets its volume.
//
// `onStatus` hears 'tuning' while it connects or buffers, 'live' once it
// plays, 'nosignal' when it won't, 'blocked' when the browser won't let it
// without a gesture. A stream that drops after it played is
// asked again a few times first (domain/mix).
export function startStream(ctx, out, station, onStatus) {
  const element = new Audio()
  element.crossOrigin = 'anonymous'
  element.preload = 'auto'
  const source = ctx.createMediaElementSource(element)
  source.connect(out)

  let stopped = false
  // Whether it has played at all, and whether this connection has.
  let played = false
  let live = false
  let tries = 0
  let timeout = null
  let retry = null

  const status = (s) => {
    if (!stopped) onStatus(s)
  }
  const armTimeout = () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      if (!live) lost()
    }, TUNING_TIMEOUT * 1000)
  }
  const connect = () => {
    if (stopped) return
    live = false
    status('tuning')
    armTimeout()
    element.src = station.url
    element.play().catch((error) => {
      // NotAllowedError: no gesture behind this play (the wheel, before
      // any click). The radio waits for one (hooks/useRadio). Anything
      // else — AbortError when it's stopped first — 'error' or the timeout
      // will tell.
      if (error?.name !== 'NotAllowedError') return
      clearTimeout(timeout)
      status('blocked')
    })
  }
  function lost() {
    clearTimeout(timeout)
    if (stopped) return
    if (played && tries < RECONNECT_TRIES) {
      tries++
      status('tuning')
      retry = setTimeout(connect, RECONNECT_AFTER * 1000)
      return
    }
    status('nosignal')
  }

  const onPlaying = () => {
    clearTimeout(timeout)
    played = true
    live = true
    tries = 0
    status('live')
  }
  const onWaiting = () => status('tuning')
  element.addEventListener('playing', onPlaying)
  element.addEventListener('waiting', onWaiting)
  // A live stream that "ends" has lost its connection.
  element.addEventListener('ended', lost)
  element.addEventListener('error', lost)

  connect()

  return {
    stop() {
      stopped = true
      clearTimeout(timeout)
      clearTimeout(retry)
      element.removeEventListener('playing', onPlaying)
      element.removeEventListener('waiting', onWaiting)
      element.removeEventListener('ended', lost)
      element.removeEventListener('error', lost)
      element.pause()
      // Dropping the source is what closes the connection: a paused live
      // stream otherwise keeps downloading.
      element.removeAttribute('src')
      element.load()
      source.disconnect()
    },
  }
}
