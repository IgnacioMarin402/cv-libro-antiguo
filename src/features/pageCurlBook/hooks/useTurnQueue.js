import { useEffect, useRef, useState } from 'react'
import { turnStepDelay } from '../domain/pageCurl'

// The sheet the book is actually showing, trailing the one the reader asked
// for. Clicking deep into the stack asks for a jump of several sheets; this
// hands them to the book one at a time so they turn as a cascade instead of
// as a single slab. The tutorial's `delayedPage`.
export function useTurnQueue(page) {
  const [shownPage, setShownPage] = useState(page)
  const lastAsked = useRef(page)

  useEffect(() => {
    if (page === shownPage) return
    const next = shownPage + Math.sign(page - shownPage)
    // The sheet under the reader's finger leaves at once; the ones behind
    // it queue up.
    if (lastAsked.current !== page) {
      lastAsked.current = page
      setShownPage(next)
      return
    }
    const timeout = setTimeout(() => setShownPage(next), turnStepDelay(page - shownPage))
    return () => clearTimeout(timeout)
  }, [page, shownPage])

  return shownPage
}
