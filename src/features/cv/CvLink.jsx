import { useState } from 'react'
import './cvLink.css'

// The way from the room to the CV's page (/cv/): a pill in the top-right
// corner between the magnifier and the hearts, there once the book is open
// — asked to come with the magnifier, not before it. In a new tab, so the
// room stays as it was left.
//
// It wasn't there before the book opened, so like the magnifier it glows
// until the visitor has used it once (see pageCurlBook/BookReader).
export default function CvLink({ open }) {
  const [used, setUsed] = useState(false)
  if (!open) return null
  return (
    <a
      className={used ? 'cv-link' : 'cv-link cv-link--new'}
      href="/cv/"
      target="_blank"
      rel="noopener"
      title="Ver el CV en una página"
      onClick={() => setUsed(true)}
    >
      CV
    </a>
  )
}
