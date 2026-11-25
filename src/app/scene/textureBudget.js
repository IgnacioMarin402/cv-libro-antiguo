// How large the models' textures may be on this device.
//
// Every GLB in the room carries two or three 2048 px maps: 61 of them, 1.26
// GB on the GPU once mipmapped, and nearly as much again in the bitmaps they
// were decoded into. A computer holds that; a phone's browser kills the tab
// first, and the room never shows. Measured with Chromium emulating an
// iPhone 13, the page settled at 3.5 GB across its processes — 1.85 GB in
// the page's own and 1.3 GB in the GPU's. Safari on an iPhone lets a tab
// have well under that. With the cap, the same run settled at 1.8 GB: 0.93
// in the page's, 0.46 in the GPU's.
//
// At 1024 px each map is a quarter of the memory and still more texels
// than a phone's screen gives any of these objects, even up close. At 512,
// a sixteenth, for the phones that say they're short of memory
// (navigator.deviceMemory: Chrome on Android; Safari doesn't say).

export const MOBILE_TEXTURE_PX = 1024
export const LOW_MEMORY_TEXTURE_PX = 512

// null: the textures as they were made. deviceMemory is in GB, rounded and
// capped at 8 by the browser, and undefined where it isn't reported. A
// computer with 4 GB or less gets the phone's size too: it's in the same
// trouble.
export function textureBudget({ mobile, deviceMemory }) {
  if (deviceMemory !== undefined && deviceMemory <= 2) return LOW_MEMORY_TEXTURE_PX
  if (mobile || (deviceMemory !== undefined && deviceMemory <= 4)) return MOBILE_TEXTURE_PX
  return null
}

// The facts the budget is judged on. An iPad asks for the desktop site and
// says it's a Mac, but a Mac has no touch screen.
export function readDevice(nav) {
  const ua = nav.userAgent ?? ''
  const mobile = /Android|iPhone|iPad|iPod|Mobi/i.test(ua) || (/Macintosh/.test(ua) && nav.maxTouchPoints > 1)
  return { mobile, deviceMemory: nav.deviceMemory }
}
