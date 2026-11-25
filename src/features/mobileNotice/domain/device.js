// Whether this is a phone or a tablet, where the room doesn't fit.
//
// Every GLB in the room carries two or three 2048 px maps: 61 in all, 1.26
// GB on the GPU once mipmapped and nearly as much again in decoded bitmaps.
// Emulating an iPhone 13 in Chromium the page reached 3.5 GB, and a real
// iPhone's Safari closed the tab before the room showed ("Ocurrió un
// problema varias veces"). Decoding the maps at 1024 px on phones brought
// the emulation down to 1.8 GB, and the iPhone still closed it — that fix
// went live and was reverted (see git history). So on these the room isn't
// loaded at all.
//
// An iPad asks for the desktop site and says it's a Mac, but a Mac has no
// touch screen. A Windows laptop with one is a computer, and stays one.
export function isMobileDevice({ userAgent = '', maxTouchPoints = 0 }) {
  return /Android|iPhone|iPad|iPod|Mobi/i.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1)
}
