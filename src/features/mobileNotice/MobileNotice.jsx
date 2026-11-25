import './mobileNotice.css'

// What a phone or a tablet gets instead of the room (see domain/device): an
// invitation to come back on a computer, telling what waits in the room
// rather than why it can't open here, and the CV meanwhile, on its own page
// with nothing 3D. Shourdo is "un ser", never "un busto": asked.
export default function MobileNotice() {
  return (
    <main className="mobile-notice">
      <div className="mobile-notice__card">
        <div className="mobile-notice__flame" aria-hidden="true" />
        <h1 className="mobile-notice__title">El manuscrito te espera</h1>
        <p>
          Una vela encendida, un libro que se hojea página a página, un gato mago que aparece sin avisar y un ser que
          acepta galletas. Todo eso vive en la versión de escritorio: ábrela en{' '}
          <span className="mobile-notice__site">imarin.dev</span>.
        </p>
        <p className="mobile-notice__meanwhile">¿Lo quieres ya? Aquí está el CV:</p>
        <a className="mobile-notice__cv" href="/cv/">
          Leer el CV ahora
        </a>
      </div>
    </main>
  )
}
