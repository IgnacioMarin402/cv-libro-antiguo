import * as THREE from 'three'
import { paintPaper } from './paperTexture'
import { PAPER_WIDTH, PAPER_HEIGHT } from '../domain/pageCurl'
import { TYPE, MARGIN, INK, MIN_FIT } from '../domain/typography'

// A printed page: the paper (see paperTexture) with a page's blocks set on
// it. The book doesn't know what it prints; a page is a list of blocks —
//
//   title · subtitle · caption        centred display lines
//   heading                           a section's name, rubricated
//   entry { title, org, dates }       a role: title, then place and dates
//   note · para { dropCap, italic }   running text, para justified
//   bullets { items }                 a list, each item hung on a red mark
//   meta { label, text }              a labelled line ("Stack: …")
//   pairs { items, align, large }     label + text, one per line
//   signature · ornament · rule · space { mm }
//
// — plus `head` (the running head) and `valign: 'center'`.
//
// Which face of a leaf a page lands on decides which side its gutter is
// on: a right-hand page (a leaf's +z face) has the spine on its left, and a
// left-hand one (the -z face, which BoxGeometry maps with u running from
// the fore-edge back to the spine) has it on its right.

// 1024 px across the leaf: 2.65 px per mm, so the body is 32 px tall in the
// texture — sharp from as close as the camera is let come.
const WIDTH = 1024
const PX = WIDTH / (PAPER_WIDTH * 1000)
const HEIGHT = Math.round(PAPER_HEIGHT * 1000 * PX)

const STYLE = {
  title: { size: TYPE.title, color: INK.rubric, spacing: 0.02 },
  subtitle: { size: TYPE.subtitle, color: INK.text, italic: true },
  caption: { size: TYPE.small, color: INK.faded, caps: true, spacing: 0.06 },
  heading: { size: TYPE.heading, color: INK.rubric, caps: true, spacing: 0.1 },
  role: { size: TYPE.role, color: INK.text, bold: true },
  org: { size: TYPE.small, color: INK.text, italic: true },
  dates: { size: TYPE.small, color: INK.faded },
  body: { size: TYPE.body, color: INK.text },
  italic: { size: TYPE.body, color: INK.text, italic: true },
  note: { size: TYPE.small, color: INK.faded, italic: true },
  label: { size: TYPE.small, color: INK.rubric, caps: true, spacing: 0.05 },
  small: { size: TYPE.small, color: INK.text },
  linkLabel: { size: TYPE.link, color: INK.rubric, caps: true, spacing: 0.05 },
  link: { size: TYPE.link, color: INK.text },
  meta: { size: TYPE.small, color: INK.faded, italic: true },
  marker: { size: TYPE.body, color: INK.rubric },
  head: { size: TYPE.head, color: INK.faded, caps: true, spacing: 0.14 },
  folio: { size: TYPE.folio, color: INK.faded },
}

// Sets `ctx` up for a style at fit `s`; returns the size in px.
function useStyle(ctx, style, s) {
  const px = style.size * s * PX
  ctx.font = `${style.italic ? 'italic ' : ''}${style.caps ? 'small-caps ' : ''}${style.bold ? 600 : 400} ${px}px ${TYPE.font}`
  ctx.letterSpacing = `${(style.spacing || 0) * px}px`
  ctx.fillStyle = style.color
  return px
}

// Runs of styled text into measured words. A long run with slashes (a
// URL) breaks after each slash, with no space where it breaks.
function words(ctx, runs, s) {
  const out = []
  for (const { text, style } of runs) {
    useStyle(ctx, style, s)
    const space = ctx.measureText(' ').width
    for (const word of text.split(/\s+/).filter(Boolean)) {
      const parts = word.includes('/') ? word.split(/(?<=\/)/) : [word]
      parts.forEach((part, i) => {
        out.push({ text: part, style, w: ctx.measureText(part).width, space, glued: i < parts.length - 1 })
      })
    }
  }
  return out
}

function breakLines(list, widthAt) {
  const lines = []
  let line = []
  let w = 0
  for (const word of list) {
    const prev = line[line.length - 1]
    const add = prev ? (prev.glued ? 0 : prev.space) + word.w : word.w
    if (prev && w + add > widthAt(lines.length)) {
      lines.push({ words: line, w })
      line = [word]
      w = word.w
    } else {
      line.push(word)
      w += add
    }
  }
  if (line.length) lines.push({ words: line, w })
  return lines
}

// A paragraph of styled runs at the top of `y`, `x`..`x + width`. Returns
// the height it took. opts: align (left/center/right), justify, dropCap.
function paragraph(ctx, runs, s, x, y, width, opts, draw) {
  let drop = null
  if (opts.dropCap) {
    const [first, ...rest] = runs
    const letter = first.text[0]
    runs = [{ ...first, text: first.text.slice(1) }, ...rest]
    const style = { size: TYPE.body * TYPE.leading * 2.3, color: INK.rubric }
    useStyle(ctx, style, s)
    drop = { letter, style, w: ctx.measureText(letter).width + 2.5 * s * PX, lines: 2 }
  }
  const list = words(ctx, runs, s)
  const widthAt = (i) => (drop && i < drop.lines ? width - drop.w : width)
  const lines = breakLines(list, widthAt)
  const lineHeight = Math.max(...list.map((w) => w.style.size)) * TYPE.leading * s * PX
  if (draw) {
    if (drop) {
      useStyle(ctx, drop.style, s)
      ctx.fillText(drop.letter, x, y + lineHeight * (drop.lines - 1) + lineHeight * 0.78)
    }
    lines.forEach((line, i) => {
      const indent = drop && i < drop.lines ? drop.w : 0
      const avail = widthAt(i)
      const last = i === lines.length - 1
      const gaps = line.words.slice(0, -1).filter((w) => !w.glued).length
      const extra = opts.justify && !last && gaps ? (avail - line.w) / gaps : 0
      let cx = x + indent
      if (opts.align === 'center') cx += (avail - line.w) / 2
      if (opts.align === 'right') cx += avail - line.w
      const baseline = y + i * lineHeight + lineHeight * 0.78
      line.words.forEach((word, j) => {
        useStyle(ctx, word.style, s)
        ctx.fillText(word.text, cx, baseline)
        cx += word.w + (j < line.words.length - 1 && !word.glued ? word.space + extra : 0)
      })
    })
  }
  return Math.max(lines.length, drop ? drop.lines : 0) * lineHeight
}

function ornament(ctx, s, x, y, width, draw) {
  const h = 9 * s * PX
  if (draw) {
    const cx = x + width / 2
    const cy = y + h / 2
    const half = Math.min(width * 0.36, 60 * PX)
    const d = 2.2 * s * PX
    ctx.strokeStyle = INK.rubric
    ctx.fillStyle = INK.rubric
    ctx.lineWidth = 0.5 * PX
    ctx.beginPath()
    ctx.moveTo(cx - half, cy)
    ctx.lineTo(cx - d * 2.2, cy)
    ctx.moveTo(cx + d * 2.2, cy)
    ctx.lineTo(cx + half, cy)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx, cy - d)
    ctx.lineTo(cx + d, cy)
    ctx.lineTo(cx, cy + d)
    ctx.lineTo(cx - d, cy)
    ctx.closePath()
    ctx.fill()
  }
  return h
}

function rule(ctx, s, x, y, width, mmWide, color, draw) {
  const h = 7 * s * PX
  if (draw) {
    ctx.strokeStyle = color
    ctx.lineWidth = 0.4 * PX
    ctx.beginPath()
    ctx.moveTo(x + width / 2 - (mmWide / 2) * PX, y + h / 2)
    ctx.lineTo(x + width / 2 + (mmWide / 2) * PX, y + h / 2)
    ctx.stroke()
  }
  return h
}

// Sets every block from the top of the text block; returns the height used.
function setBlocks(ctx, blocks, s, x, top, width, draw) {
  const gap = (mm) => mm * s * PX
  let y = top
  blocks.forEach((b, index) => {
    const first = index === 0
    switch (b.kind) {
      case 'title':
        y += paragraph(ctx, [{ text: b.text, style: STYLE.title }], s, x, y, width, { align: 'center' }, draw) + gap(2)
        break
      case 'subtitle':
        y += paragraph(ctx, [{ text: b.text, style: STYLE.subtitle }], s, x, y, width, { align: 'center' }, draw) + gap(2)
        break
      case 'caption':
        y += paragraph(ctx, [{ text: b.text, style: STYLE.caption }], s, x, y, width, { align: 'center' }, draw) + gap(2)
        break
      case 'heading':
        if (!first) y += gap(4)
        y += paragraph(ctx, [{ text: b.text, style: STYLE.heading }], s, x, y, width, { align: 'center' }, draw)
        y += rule(ctx, s, x, y - gap(1.5), width, 22, INK.rubric, draw) + gap(1)
        break
      case 'entry': {
        if (!first) y += gap(2)
        y += paragraph(ctx, [{ text: b.title, style: STYLE.role }], s, x, y, width, { align: 'left' }, draw)
        const org = b.org ? words(ctx, [{ text: b.org, style: STYLE.org }], s) : []
        const dates = b.dates ? words(ctx, [{ text: b.dates, style: STYLE.dates }], s) : []
        const span = (list) => list.reduce((sum, w, i) => sum + w.w + (i < list.length - 1 && !w.glued ? w.space : 0), 0)
        if (org.length && dates.length && span(org) + span(dates) + gap(5) <= width) {
          // One line: the place on the left, its dates against the margin.
          const h = paragraph(ctx, [{ text: b.org, style: STYLE.org }], s, x, y, width, { align: 'left' }, draw)
          paragraph(ctx, [{ text: b.dates, style: STYLE.dates }], s, x, y, width, { align: 'right' }, draw)
          y += h
        } else {
          if (org.length) y += paragraph(ctx, [{ text: b.org, style: STYLE.org }], s, x, y, width, { align: 'left' }, draw)
          if (dates.length) y += paragraph(ctx, [{ text: b.dates, style: STYLE.dates }], s, x, y, width, { align: 'left' }, draw)
        }
        y += gap(1.5)
        break
      }
      case 'note':
        y += paragraph(ctx, [{ text: b.text, style: STYLE.note }], s, x, y, width, { align: 'left', justify: true }, draw) + gap(1.5)
        break
      case 'para': {
        const style = b.italic ? STYLE.italic : STYLE.body
        y += paragraph(ctx, [{ text: b.text, style }], s, x, y, width, { justify: true, dropCap: b.dropCap }, draw) + gap(3)
        break
      }
      case 'bullets': {
        // Each item hangs: the mark sits in the indent and ends a few
        // millimetres short of the text, so it doesn't read as a letter.
        useStyle(ctx, STYLE.marker, s)
        const hang = gap(7)
        const mark = hang - gap(2.5) - ctx.measureText('•').width
        b.items.forEach((item) => {
          const h = paragraph(ctx, [{ text: item, style: STYLE.body }], s, x + hang, y, width - hang, { justify: true }, draw)
          if (draw) {
            useStyle(ctx, STYLE.marker, s)
            ctx.fillText('•', x + mark, y + TYPE.body * TYPE.leading * s * PX * 0.78)
          }
          y += h + gap(1.5)
        })
        break
      }
      case 'meta':
        y += paragraph(ctx, [{ text: `${b.label}:`, style: STYLE.label }, { text: b.text, style: STYLE.meta }], s, x, y, width, { align: 'left' }, draw) + gap(1.5)
        break
      case 'pairs':
        b.items.forEach((item) => {
          const [label, text] = b.large ? [STYLE.linkLabel, STYLE.link] : [STYLE.label, STYLE.small]
          const runs = [{ text: item.label, style: label }, { text: item.text, style: text }]
          y += paragraph(ctx, runs, s, x, y, width, { align: b.align || 'left' }, draw) + gap(2)
        })
        break
      case 'signature':
        y += gap(1) + paragraph(ctx, [{ text: `— ${b.text}`, style: STYLE.italic }], s, x, y + gap(1), width, { align: 'right' }, draw)
        break
      case 'ornament':
        y += ornament(ctx, s, x, y, width, draw) + gap(2)
        break
      case 'rule':
        y += rule(ctx, s, x, y, width, 30, INK.faded, draw)
        break
      case 'space':
        y += gap(b.mm)
        break
    }
  })
  return y - top
}

// Sets a page on a canvas already painted with paper. `side` is 'recto'
// (a right-hand page) or 'verso'; `folio` its page number. Returns the fit
// the page was set at — 1 unless it had to shrink to fit its block.
export function setPage(ctx, page, side, folio) {
  const inner = (side === 'recto' ? MARGIN.inner : MARGIN.outer) * PX
  const width = (PAPER_WIDTH * 1000 - MARGIN.inner - MARGIN.outer) * PX
  const top = MARGIN.top * PX
  const room = HEIGHT - MARGIN.bottom * PX - top
  ctx.textBaseline = 'alphabetic'

  let s = 1
  let used = setBlocks(ctx, page.blocks, s, inner, top, width, false)
  while (used > room && s > MIN_FIT) {
    s *= 0.96
    used = setBlocks(ctx, page.blocks, s, inner, top, width, false)
  }
  const offset = page.valign === 'center' ? Math.max(0, (room - used) / 2) : 0
  setBlocks(ctx, page.blocks, s, inner, top + offset, width, true)

  if (page.head) paragraph(ctx, [{ text: page.head, style: STYLE.head }], 1, inner, MARGIN.top * 0.42 * PX, width, { align: 'center' }, true)
  if (folio) paragraph(ctx, [{ text: String(folio), style: STYLE.folio }], 1, inner, HEIGHT - MARGIN.bottom * 0.62 * PX, width, { align: 'center' }, true)
  if (used > room) console.warn(`pageCurlBook: page ${folio} still overflows at ${MIN_FIT} — split it`)
  return s
}

// A page printed on its own sheet of paper: the canvas, and the fit it was
// set at.
export function printPage(page, side, folio) {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  paintPaper(ctx, WIDTH, HEIGHT)
  const fit = setPage(ctx, page, side, folio)
  return { canvas, fit }
}

// Every page of a book, in reading order, printed once per list of pages:
// the book's textures and the reader that shows them flat (see BookReader)
// both ask for them, and both get the same sheets — same stains, same type.
// The first page is a right-hand one: it faces the front board.
const printed = new WeakMap()
export function printBook(pages) {
  if (!printed.has(pages)) {
    printed.set(pages, pages.map((page, i) => printPage(page, i % 2 ? 'verso' : 'recto', i + 1)))
  }
  return printed.get(pages)
}

export function createPageTexture({ canvas, fit }) {
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.userData.fit = fit
  return tex
}
