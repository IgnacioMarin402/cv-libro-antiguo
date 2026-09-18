import { useEffect, useState } from 'react'
import { MAX_PAGES } from '../domain/binding'

// How far into the book the visitor has read: the number of leaves moved
// from the unread stack onto the read pile. Turning only means anything
// while the book is open, and shutting it puts every leaf back.
export function useReadingProgress(open) {
  const [pagesTurned, setPagesTurned] = useState(0)

  useEffect(() => {
    if (!open) setPagesTurned(0)
  }, [open])

  const turnPage = () => setPagesTurned((n) => Math.min(MAX_PAGES, n + 1))

  return { pagesTurned, turnPage }
}
