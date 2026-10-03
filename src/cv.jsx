import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CvPage } from '@/features/cv'

// The CV's own page (cv/index.html, served at /cv/): the same CV the book
// prints, as plain HTML — quick to open, readable, searchable, and printed
// to PDF from the browser. None of the scene loads here.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CvPage />
  </StrictMode>
)
