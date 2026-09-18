import { useMemo } from 'react'
import { createCoverGeometry } from '../geometry/coverGeometry'
import { createSpineGeometry } from '../geometry/spineGeometry'
import { createPageGrid, createPageRestBend, createPageGeometry } from '../geometry/pageGeometry'

// Builds the book's meshes once and holds onto them. Each board gets its
// own cover geometry (its own hand-cut jitter — see createCoverGeometry),
// while every leaf shares one page geometry, cloning it only for the
// duration of a flip (see usePageFlip).
export function useBookGeometry() {
  const frontCoverGeo = useMemo(() => createCoverGeometry(), [])
  const backCoverGeo = useMemo(() => createCoverGeometry(), [])
  const spineGeo = useMemo(() => createSpineGeometry(), [])
  const pageGrid = useMemo(() => createPageGrid(), [])
  const pageRestBend = useMemo(() => createPageRestBend(), [])
  const pageGeo = useMemo(() => createPageGeometry(pageGrid, pageRestBend), [pageGrid, pageRestBend])

  return { frontCoverGeo, backCoverGeo, spineGeo, pageGrid, pageRestBend, pageGeo }
}
