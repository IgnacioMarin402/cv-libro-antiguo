import { useEffect, useState } from 'react'
import { cardName, shouldSuggestSwitch } from './domain/gpu'
import './gpuNotice.css'

// Remembered in this browser once the visitor has closed it: it's advice,
// and once is enough. Storage can be off (a private window); then it shows
// on every visit, which is no harm.
const DISMISSED_KEY = 'gpu-notice-dismissed'

const wasDismissed = () => {
  try {
    return localStorage.getItem(DISMISSED_KEY) === '1'
  } catch {
    return false
  }
}

const remember = () => {
  try {
    localStorage.setItem(DISMISSED_KEY, '1')
  } catch {
    // Nothing to keep it in; it'll ask again next time.
  }
}

// The card the canvas draws with, as the browser names it (see domain/gpu).
function readRenderer(gl) {
  const context = gl?.getContext()
  const info = context?.getExtension('WEBGL_debug_renderer_info')
  return info ? context.getParameter(info.UNMASKED_RENDERER_WEBGL) : null
}

const platform = () => navigator.userAgentData?.platform ?? navigator.platform ?? navigator.userAgent

// A note over the canvas, top left, once the room is up (`revealed`): the
// room is being drawn with the integrated graphics card, and how to give the
// browser the dedicated one, if there is one (see domain/gpu). Read then and
// not sooner: the renderer (`glRef`, the canvas's) is there by the time the
// loading screen lifts.
export default function GpuNotice({ glRef, revealed }) {
  const [card, setCard] = useState(null)

  useEffect(() => {
    if (!revealed || wasDismissed()) return
    const renderer = readRenderer(glRef.current)
    if (shouldSuggestSwitch(renderer, platform())) setCard(cardName(renderer))
  }, [revealed, glRef])

  if (!card) return null

  const close = () => {
    remember()
    setCard(null)
  }

  return (
    <aside className="gpu-notice" role="note" aria-label="Rendimiento">
      <p className="gpu-notice__title">¿Va lento?</p>
      <p className="gpu-notice__text">
        Tu navegador está dibujando la escena con la gráfica integrada (<strong>{card}</strong>). Si tu equipo tiene
        una tarjeta dedicada, puedes dársela al navegador:
      </p>
      <p className="gpu-notice__steps">
        Configuración de Windows → Sistema → Pantalla → Gráficos → tu navegador → Opciones → <em>Alto rendimiento</em>
        , y reinicia el navegador.
      </p>
      <button type="button" className="gpu-notice__close" onClick={close}>
        Entendido
      </button>
    </aside>
  )
}
