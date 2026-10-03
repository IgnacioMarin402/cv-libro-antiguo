import { DefaultLoadingManager } from 'three'

// The dogs' names are lettered in Cinzel Decorative, Bold — a file, asked
// for, from Google Fonts (SIL Open Font License, public/fonts/OFL.txt). Only
// its Latin set, 15 KB.
const FONT_URL = '/fonts/cinzel-decorative-700.woff2'
export const nameFont = (px) => `700 ${px}px 'Cinzel Decorative', 'Palatino Linotype', Palatino, Georgia, serif`

let loading = null

// Loads it once, for every caller, and resolves when canvas text can use it.
// It goes through three's loading manager like the models do, so the
// loading screen waits for it, and the warm-up that compiles every material
// finds the names already built (see features/loader). If it fails the
// names still come, in the serif after it in nameFont.
export function loadNameFont() {
  if (!loading) {
    DefaultLoadingManager.itemStart(FONT_URL)
    const face = new FontFace('Cinzel Decorative', `url(${FONT_URL})`, { weight: '700' })
    loading = face
      .load()
      .then(
        (loaded) => {
          document.fonts.add(loaded)
          return true
        },
        () => false
      )
      .finally(() => DefaultLoadingManager.itemEnd(FONT_URL))
  }
  return loading
}
