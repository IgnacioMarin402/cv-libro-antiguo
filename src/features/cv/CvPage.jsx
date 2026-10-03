import { PERSON, PROFILE, STACK, EXPERIENCE, PROJECTS, MENTORING, EDUCATION, LANGUAGES, CERTIFICATIONS } from './domain/cv'
import './cv.css'

// The CV as a page: everything in domain/cv, set for reading on a screen
// and for printing — the PDF is the browser's own "Save as PDF" from the
// print dialog, so it never falls out of step with the data.
//
// The book's note to the reader isn't here: it speaks of the room around
// the book, and this page has no room. A link back to the book takes its
// place.

const href = (text) => `https://${encodeURI(text)}`

function Entry({ title, org, dates, note, bullets, stack, link }) {
  return (
    <article className="cv-entry">
      <div className="cv-entry__head">
        <h3>{title}</h3>
        {dates && <span className="cv-entry__dates">{dates}</span>}
      </div>
      {org && <p className="cv-entry__org">{org}</p>}
      {link && (
        <p className="cv-entry__org">
          <a href={href(link)}>{link}</a>
        </p>
      )}
      {note && <p className="cv-entry__note">{note}</p>}
      {bullets && (
        <ul className="cv-entry__bullets">
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
      {stack && (
        <p className="cv-entry__stack">
          <span className="cv-label">Stack</span> {stack}
        </p>
      )}
    </article>
  )
}

export default function CvPage() {
  return (
    <div className="cv">
      <nav className="cv-actions" aria-label="Acciones">
        <a className="cv-button" href="/">
          Ver el libro
        </a>
        <button type="button" className="cv-button" onClick={() => window.print()}>
          Descargar PDF
        </button>
      </nav>
      <p className="cv-hint">Se abre la impresión: elige «Guardar como PDF».</p>

      <main className="cv-sheet">
        <header className="cv-header">
          <h1>{PERSON.name}</h1>
          <p className="cv-header__role">{PERSON.role}</p>
          <ul className="cv-header__links">
            {PERSON.links.map((link) => (
              <li key={link.label}>
                <span className="cv-label">{link.label}</span> <a href={href(link.text)}>{link.text}</a>
              </li>
            ))}
          </ul>
        </header>

        <section>
          <h2>Perfil</h2>
          <p>{PROFILE}</p>
        </section>

        <section>
          <h2>Stack técnico</h2>
          <dl className="cv-stack">
            {STACK.map((s) => (
              <div key={s.label}>
                <dt className="cv-label">{s.label}</dt>
                <dd>{s.text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h2>Experiencia</h2>
          {EXPERIENCE.map((job) => (
            <Entry
              key={`${job.org}${job.dates}`}
              title={job.role}
              org={job.place ? `${job.org} · ${job.place}` : job.org}
              dates={job.dates}
              note={job.note}
              bullets={job.bullets}
              stack={job.stack}
            />
          ))}
        </section>

        <section>
          <h2>Proyectos</h2>
          {PROJECTS.map((p) => (
            <Entry key={p.name} title={p.name} link={p.link} bullets={p.bullets} />
          ))}
        </section>

        <section>
          <h2>Mentoría</h2>
          <Entry title={MENTORING.title} org={MENTORING.note} note={MENTORING.text} />
        </section>

        <div className="cv-columns">
          <section>
            <h2>Educación</h2>
            {EDUCATION.map((e) => (
              <Entry key={e.title} title={e.title} org={e.place} dates={e.dates} />
            ))}
          </section>
          <section>
            <h2>Idiomas</h2>
            <dl className="cv-stack">
              {LANGUAGES.map((l) => (
                <div key={l.label}>
                  <dt className="cv-label">{l.label}</dt>
                  <dd>{l.text}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <section>
          <h2>Certificaciones</h2>
          <ul className="cv-entry__bullets">
            {CERTIFICATIONS.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}
