import { useMemo } from 'react'
import * as THREE from 'three'

// Blank materials only — no canvas textures, no photographs. The point of
// this book is the bone-chain curl (see hooks/usePageCurl), not a finished
// surface. Every leaf shares the same six instances (BoxGeometry's default
// face-group order: +x, -x, +y, -y, +z, -z — the last two are the actual
// page faces), the same material-sharing convention the real book uses
// (see features/book/hooks/useBookMaterials).
const EDGE_COLOR = 0xf3ecd9
const FACE_COLOR = 0xfaf6ec

export function usePageMaterials() {
  return useMemo(() => {
    const edge = () => new THREE.MeshStandardMaterial({ color: EDGE_COLOR, roughness: 0.9 })
    const face = new THREE.MeshStandardMaterial({ color: FACE_COLOR, roughness: 0.85 })
    return [edge(), edge(), edge(), edge(), face, face]
  }, [])
}
