// The CV feature's public surface: the CV as data, that same CV laid out
// as the book's pages, the page that shows it as HTML (cv/index.html) and
// the link to that page from the room. The book doesn't import these — the
// scene hands it its pages (see app/Scene), so it stays a book that can
// print anything.
export { PERSON, INTRO, PROFILE, STACK, EXPERIENCE, PROJECTS, MENTORING, EDUCATION, LANGUAGES, CERTIFICATIONS } from './domain/cv'
export { BOOK_PAGES } from './domain/bookPages'
export { default as CvPage } from './CvPage'
export { default as CvLink } from './CvLink'
