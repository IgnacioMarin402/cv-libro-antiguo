// Shourdo's bust, on the floor against a wall. Which wall and where along
// it is the layout's call; the offset says where its origin stands from the
// wall, the width how much of the wall it takes, and the framing what the
// camera frames when a click on him asks to look up close.
//
// Up close, he's given treats. Like the love counter, that straddles the
// canvas: Bust goes inside it, and throws them; TreatButton and
// TreatCounter go over it; the app holds useTreats, the count the server
// keeps (worker/treats.js), and hands each its part.
//
// "Treat", never "cookie", in anything the browser fetches or styles —
// file names, the API's path, CSS classes: ad and cookie-banner blockers
// block any URL with "cookie" in it, and hide elements by such classes.
// With hooks/useCookies.js blocked, one visitor's whole page came up blank.
// The visitor still reads "galleta".
export { default as Bust } from './Bust'
export { default as TreatButton } from './TreatButton'
export { default as TreatCounter } from './TreatCounter'
export { useTreats } from './hooks/useTreats'
export { BUST_WIDTH, BUST_BACK_OFFSET, BUST_FRAMING } from './domain/bust'
