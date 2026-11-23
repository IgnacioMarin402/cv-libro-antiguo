// How the book sets type, in millimetres on the page.
//
// What decides the sizes is how big a millimetre of page is on screen at
// the open-book shot (features/camera), measured on the settled pose:
// 0.70 px per mm head to tail at 1920x1080 and 0.50 at 1366x768 — the
// page lies tilted away from the lens, so a letter's height is what shrinks
// — and about 1.2 px per mm across. The whole page is 378 px tall on a
// 1080p screen. So only display type reads from where the camera stands:
// the 30 mm name is 21 px there and a 17 mm heading 12. The body, 12 mm,
// is 8 px — it is read the way a book is, leaning in (the wheel brings the
// camera to half the distance, and the body to 16 px). The full text, at a
// size for reading, is the CV's own page (features/cv).
//
// The typeface is the one the rest of the site uses, a system serif: no
// font file to load, and Palatino where there is one.
//
// The title page is the one page always seen from where the camera stands,
// so everything on it has to read from there: its subtitle went from 15 mm
// to 18 (12.6 px) and its links from the 10.5 mm of small text to 14 (10 px)
// after they were reported hard and impossible to make out.
export const TYPE = {
  font: "'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, 'Times New Roman', serif",
  title: 30,
  subtitle: 18,
  link: 14,
  heading: 17,
  role: 13.5,
  body: 12,
  small: 10.5,
  head: 8.5,
  folio: 9,
  // Line height, as a multiple of the size.
  leading: 1.3,
}

// The text block. The inner margin (the spine's side) is the wider one: a
// leaf rises out of the binding and the first few centimetres of it stand
// almost on edge to the lens.
export const MARGIN = { top: 46, bottom: 50, inner: 42, outer: 30 }

// Iron-gall ink for the text, near black, and red for what a rubricator
// would have picked out: headings, initials, the marks before each item.
// The faded ink (dates, notes, the running head) is a lighter shade of it.
//
// The text was a brown, #2a190c, and the faded ink #4f3922 (and #6a4f33
// before that); the page was reported hard to read under the candle.
// Darker ink doesn't help where a letter is solid — lit, #2a190c already
// came out (62,15,2) — but at its edges: the canvas blends a glyph's edge
// into the paper in sRGB, and at the distance the book is read a stroke is
// mostly edge. On the open shot at 1080p, the darkest 1.5% of a body paragraph
// against its paper: 1.97:1 -> 2.16 from where the camera stands, 4.05 ->
// 4.80 leaning in to half the distance. The rest is INK_SPREAD, below, and
// how bright the paper is lit (PAPER_TONE, see hooks/usePageMaterials).
export const INK = { text: '#140b05', rubric: '#8c2312', faded: '#33251a' }

// How far the ink spreads past each glyph's outline, in millimetres across:
// the squeeze of a letterpress. Every stroke is that much thicker, which is
// what type 8 px tall on screen needs — its hairlines are thinner than a
// pixel there, and get averaged into the paper. Drawn as a stroke over the
// filled glyph, so the line breaks and the fit are the same with it. 0.3
// barely showed on the page; 0.6 began to read as bold.
export const INK_SPREAD = 0.5

// A page with more than its block holds is set smaller until it fits, but
// no smaller than this: past it the page needs splitting, not shrinking.
export const MIN_FIT = 0.7
