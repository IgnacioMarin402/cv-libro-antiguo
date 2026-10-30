// Shourdo's bust, on the floor against a wall. Which wall and where along
// it is the layout's call; the offset says where its origin stands from the
// wall, the width how much of the wall it takes, and the framing what the
// camera frames when a click on him asks to look up close.
//
// Up close, he's given cookies. Like the love counter, that straddles the
// canvas: Bust goes inside it, and throws them; CookieButton and
// CookieCounter go over it; the app holds useCookies, the count the server
// keeps (server/cookies.js), and hands each its part.
export { default as Bust } from './Bust'
export { default as CookieButton } from './CookieButton'
export { default as CookieCounter } from './CookieCounter'
export { useCookies } from './hooks/useCookies'
export { BUST_WIDTH, BUST_BACK_OFFSET, BUST_FRAMING } from './domain/bust'
