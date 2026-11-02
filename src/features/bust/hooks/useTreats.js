import { useCallback, useEffect, useRef, useState } from 'react'

// The treats, as the server keeps them (see worker/treats.js): how many
// Shourdo has been given by everyone, and how many this visitor can still
// give him today.
//
// Both stay null until the server answers — and for good with no server
// behind the page: the counter then doesn't show, there's no limit to keep,
// and the throw still plays.
const TREATS_URL = '/api/treats'

const isAnswer = (body) => typeof body?.count === 'number' && typeof body?.left === 'number'

async function request(method) {
  const response = await fetch(TREATS_URL, { method })
  const body = response.ok ? await response.json() : null
  if (!isAnswer(body)) throw new Error(`/api/treats: ${response.status}`)
  return body
}

export function useTreats() {
  const [state, setState] = useState({ count: null, left: null })
  // Read by give() without waiting on a render, so quick clicks can't give
  // past the day's limit before the first answer is in.
  const left = useRef(null)

  useEffect(() => {
    let cancelled = false
    request('GET')
      .then((answer) => {
        if (cancelled) return
        left.current = answer.left
        setState(answer)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  // Whether he's had all he gets today.
  const full = useCallback(() => left.current === 0, [])

  // Counted on screen at once, and then as the server says. If the server
  // doesn't take it, it's given back.
  const give = useCallback(() => {
    if (left.current === 0) return
    if (left.current !== null) left.current -= 1
    const step = (by) => (s) => ({
      count: s.count === null ? null : s.count + by,
      left: s.left === null ? null : s.left - by,
    })
    setState(step(1))
    request('POST')
      .then((answer) => {
        left.current = answer.left
        setState({ count: answer.count, left: answer.left })
      })
      .catch(() => {
        if (left.current !== null) left.current += 1
        setState(step(-1))
      })
  }, [])

  return { ...state, full, give }
}
