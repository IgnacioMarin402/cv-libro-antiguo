// Which graphics card the browser is drawing the room with, and whether to
// tell the visitor it could be a faster one.
//
// The page asks for the high-performance card (R3F's default,
// powerPreference: 'high-performance'), but that's a wish, not an order: on
// Windows the browser draws with whichever card Windows gave it, and on a
// laptop with two that's usually the integrated one — an Intel UHD drew this
// scene where the same laptop's RTX 4070 sat idle. Only the visitor can
// change it, in Windows' graphics settings; the page can only say so.

// The card's name, as the browser gives it through WEBGL_debug_renderer_info:
// in Chrome and Edge wrapped by ANGLE —
// "ANGLE (Intel, Intel(R) UHD Graphics (0x00009A60) Direct3D11 vs_5_0 ps_5_0, D3D11)" —
// and bare elsewhere. Out of ANGLE's wrapping it's the second field, without
// the device id and the driver.
export function cardName(renderer) {
  if (!renderer) return null
  const angle = /^ANGLE \(([^,]*),\s*(.*)\)$/.exec(renderer)
  if (!angle) return renderer.trim()
  return angle[2]
    .replace(/\s*\(0x[0-9a-f]+\).*$/i, '')
    .replace(/\s+(Direct3D|OpenGL|Vulkan|Metal).*$/i, '')
    .trim()
}

// Integrated cards: Intel's (HD, UHD, Iris), and AMD's that come inside the
// processor, which carry no model number — "AMD Radeon(TM) Graphics",
// "Radeon Vega 8 Graphics" — where a dedicated one is "Radeon RX 6600".
// Apple's are integrated too, but a Mac has no other card to switch to.
const INTEGRATED = [/\bIntel\b/i, /\bRadeon\s*(\(TM\)\s*)?(Vega\s*\d+\s*)?Graphics\b/i]

// Whether to suggest switching: on Windows only (the steps are Windows'),
// and only on an integrated card. A desktop with only one card gets the
// suggestion too; it says "if your computer has a dedicated card".
export function shouldSuggestSwitch(renderer, platform) {
  if (!renderer || !/win/i.test(platform ?? '')) return false
  return INTEGRATED.some((pattern) => pattern.test(renderer))
}
