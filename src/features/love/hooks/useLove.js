import { useCallback, useEffect, useRef, useState } from 'react'

// The count, as the server keeps it (see server/love.js): how many hearts
// the project has, and whether this visitor already gave theirs.
//
// count stays null until the server answers — and for good if there's no
// server behind the page (a static host, `vite build` opened as files):
// the counter then doesn't show, and the heart still plays its animation.
const LOVE_URL = '/api/love'

const isAnswer = (body) => typeof body?.count === 'number' && typeof body?.loved === 'boolean'

async function request(method) {
  const response = await fetch(LOVE_URL, { method })
  const body = response.ok ? await response.json() : null
  if (!isAnswer(body)) throw new Error(`/api/love: ${response.status}`)
  return body
}

export function useLove() {
  const [state, setState] = useState({ count: null, loved: false })
  // Read by give() without waiting on a render, so a double click sends one
  // heart, not two requests.
  const given = useRef(false)

  useEffect(() => {
    let cancelled = false
    request('GET')
      .then((answer) => {
        // A click that landed before this answer has already said more.
        if (cancelled || given.current) return
        given.current = answer.loved
        setState(answer)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  // Counted on screen at once, and then as the server says. If the server
  // doesn't take it, the heart is given back.
  const give = useCallback(() => {
    if (given.current) return
    given.current = true
    setState((s) => ({ count: s.count === null ? null : s.count + 1, loved: true }))
    request('POST')
      .then(setState)
      .catch(() => {
        given.current = false
        setState((s) => ({ count: s.count === null ? null : s.count - 1, loved: false }))
      })
  }, [])

  return { ...state, give }
}
