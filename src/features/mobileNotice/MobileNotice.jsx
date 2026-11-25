import './mobileNotice.css'

// The site's address as the visitor would type it on the computer.
const site = () => location.hostname.replace(/^www\./, '')

// What a phone or a tablet gets instead of the room (see domain/device):
// where to open it, and the CV meanwhile, on its own page with nothing 3D.
export default function MobileNotice() {
  return (
    <main className="mobile-notice">
      <div className="mobile-notice__card">
        <div className="mobile-notice__flame" aria-hidden="true" />
        <h1 className="mobile-notice__title">La sala se abre en un computador</h1>
        <p>
          Es una escena 3D demasiado pesada para un celular o una tablet: el navegador la cierra antes de que termine de
          cargar.
        </p>
        <p>
          Ábrela en un computador, en <span className="mobile-notice__site">{site()}</span>.
        </p>
        <p className="mobile-notice__meanwhile">Mientras tanto, el CV en una página sencilla:</p>
        <a className="mobile-notice__cv" href="/cv/">
          Leer el CV
        </a>
      </div>
    </main>
  )
}
