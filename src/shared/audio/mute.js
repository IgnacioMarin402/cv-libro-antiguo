import { useSyncExternalStore } from 'react'

// Silence for everything the page plays — the fires as much as the radio —
// set from the corner over the canvas, and still set on the visitor's next
// visit: who muted the page once doesn't want it talking at them again.
// Whatever makes sound subscribes and turns itself down; nothing in here
// knows what plays.
const KEY = 'audio-muted'
const listeners = new Set()
let muted = read()

function read() {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    // Storage blocked (a private window, site data off): unmuted, unsaved.
    return false
  }
}

export const isMuted = () => muted

export function setMuted(value) {
  if (value === muted) return
  muted = value
  try {
    localStorage.setItem(KEY, value ? '1' : '0')
  } catch {
    // Blocked: it holds for this visit only.
  }
  listeners.forEach((listener) => listener(muted))
}

export function subscribeMuted(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const useMuted = () => useSyncExternalStore(subscribeMuted, isMuted)
