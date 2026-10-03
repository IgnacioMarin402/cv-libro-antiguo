import './cvLink.css'

// The way from the room to the CV's page (/cv/): a pill in the top-right
// corner next to the magnifier and the hearts, there from the start, book
// open or not — it's the one thing a hurried reader needs. In a new tab,
// so the room stays as it was left.
export default function CvLink() {
  return (
    <a className="cv-link" href="/cv/" target="_blank" rel="noopener" title="Ver el CV en una página">
      CV
    </a>
  )
}
