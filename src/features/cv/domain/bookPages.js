import {
  PERSON,
  INTRO,
  PROFILE,
  STACK,
  EXPERIENCE,
  PROJECTS,
  MENTORING,
  EDUCATION,
  LANGUAGES,
  CERTIFICATIONS,
} from './cv'

// The CV laid out as the book's pages, in reading order: sixteen paper
// faces, the first one opposite the front board's leather and the last
// one opposite the back board's. Each page is a list of blocks the book
// knows how to set (see pageCurlBook/textures/pageTexture): which section
// goes on which page is decided here, how a heading looks is decided
// there.
//
// Consultora Cima takes a whole spread: eight long bullets don't fit one
// face at a size anyone can read.

const entry = (job, bullets = job.bullets) => [
  { kind: 'entry', title: job.role, org: job.place ? `${job.org} · ${job.place}` : job.org, dates: job.dates },
  ...(job.note ? [{ kind: 'note', text: job.note }] : []),
  ...(bullets ? [{ kind: 'bullets', items: bullets }] : []),
  ...(job.stack && bullets === job.bullets ? [{ kind: 'meta', label: 'Stack', text: job.stack }] : []),
]

const find = (org) => EXPERIENCE.find((job) => job.org === org)
const [current] = EXPERIENCE
const cima = find('Consultora Cima')
const EXP = 'Experiencia'

export const BOOK_PAGES = [
  // The title page: his, not his employer's — no company on it.
  {
    valign: 'center',
    blocks: [
      { kind: 'ornament' },
      { kind: 'title', text: PERSON.name },
      { kind: 'subtitle', text: PERSON.role },
      { kind: 'ornament' },
      { kind: 'space', mm: 10 },
      { kind: 'pairs', items: PERSON.links, align: 'center', large: true },
    ],
  },
  {
    valign: 'center',
    blocks: [
      { kind: 'heading', text: 'Al lector' },
      { kind: 'para', text: INTRO[0], dropCap: true },
      ...INTRO.slice(1, -1).map((text) => ({ kind: 'para', text })),
      { kind: 'para', text: INTRO[INTRO.length - 1], italic: true },
      { kind: 'signature', text: 'Ignacio' },
    ],
  },
  { blocks: [{ kind: 'heading', text: 'Perfil' }, { kind: 'para', text: PROFILE, dropCap: true }] },
  { blocks: [{ kind: 'heading', text: 'Stack técnico' }, { kind: 'pairs', items: STACK }] },
  { blocks: [{ kind: 'heading', text: EXP }, ...entry(current)] },
  { head: EXP, blocks: entry(cima, cima.bullets.slice(0, 4)) },
  {
    head: EXP,
    blocks: [
      { kind: 'note', text: `${cima.org}, continuación.` },
      { kind: 'bullets', items: cima.bullets.slice(4) },
      { kind: 'meta', label: 'Stack', text: cima.stack },
    ],
  },
  { head: EXP, blocks: entry(find('CorreosChile')) },
  { head: EXP, blocks: entry(find('Anticipa S.A.')) },
  { head: EXP, blocks: entry(find('Holdco Networks')) },
  { head: EXP, blocks: entry(find('Mundo Pacífico')) },
  {
    head: EXP,
    blocks: ['Muss SPA', 'Betech LTDA', 'ARAUCO', 'Duoc UC'].flatMap((org, i) => [
      ...(i ? [{ kind: 'rule' }] : []),
      ...entry(find(org)),
    ]),
  },
  {
    blocks: [
      { kind: 'heading', text: 'Proyectos' },
      ...PROJECTS.flatMap((p, i) => [
        ...(i ? [{ kind: 'rule' }] : []),
        { kind: 'entry', title: p.name, org: p.link },
        { kind: 'bullets', items: p.bullets },
      ]),
    ],
  },
  {
    blocks: [
      { kind: 'heading', text: 'Mentoría' },
      { kind: 'entry', title: MENTORING.title, org: MENTORING.note },
      { kind: 'para', text: MENTORING.text },
      { kind: 'space', mm: 8 },
      { kind: 'heading', text: 'Idiomas' },
      { kind: 'pairs', items: LANGUAGES },
    ],
  },
  {
    blocks: [
      { kind: 'heading', text: 'Educación' },
      ...EDUCATION.map((e) => ({ kind: 'entry', title: e.title, org: e.place, dates: e.dates })),
      { kind: 'space', mm: 8 },
      { kind: 'heading', text: 'Certificaciones' },
      { kind: 'bullets', items: CERTIFICATIONS },
    ],
  },
  {
    valign: 'center',
    blocks: [
      { kind: 'ornament' },
      { kind: 'subtitle', text: 'Gracias por leer hasta acá.' },
      { kind: 'space', mm: 8 },
      { kind: 'pairs', items: PERSON.links, align: 'center', large: true },
      { kind: 'ornament' },
    ],
  },
]
