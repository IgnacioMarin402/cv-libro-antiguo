import { useEffect, useState } from 'react'
import Page from './components/Page'
import MagicMotes from './components/MagicMotes'
import { usePageMaterials } from './hooks/usePageMaterials'
import { useTurnQueue } from './hooks/useTurnQueue'
import { useTableLift } from './hooks/useTableLift'
import { PAGE_COUNT } from './domain/pageCurl'

// A second book, built with the bone-chain "page-curl" technique from the
// wass08/r3f-animated-book-slider tutorial instead of our own book's
// vertex-displacement curl (see features/book) — placed alongside it so
// the two bending techniques can be compared directly. Blank pages, no
// photographs: the comparison is about the motion, not the finish.
//
// The tutorial's own rig stands the book up (hinge = local Y, i.e. the
// page's own "up") and swings pages open in the local XZ plane. Ours lies
// flat on the table instead, hinge along a horizontal line, cover lifting
// up as it opens — so the whole rig is wrapped in a fixed 90°-Y-then-90°-Z
// tilt, which cycles thickness onto world-up and the width/height pair
// onto the horizontal plane, without touching any of the borrowed
// per-bone rotation math (the closed pose's own 90° hinge rotation is
// already baked into that mapping — verified live, not just derived).
export default function PageCurlBook({ onOpenChange, ...props }) {
  const [page, setPage] = useState(0)
  // What the book is showing trails what the reader asked for: a jump of
  // several sheets turns them one after another (see useTurnQueue).
  const shownPage = useTurnQueue(page)
  const { paper, frontCover, backCover } = usePageMaterials()
  const closedBook = shownPage === 0 || shownPage === PAGE_COUNT
  // Open leaves hang below the hinge, so the book rides up while it's open.
  const lift = useTableLift(closedBook)

  // The camera re-aims when the book opens (see features/camera), so the
  // book is what says so: open is anything between the two covers, which
  // includes neither the untouched block nor the fully turned one.
  useEffect(() => {
    onOpenChange?.(!closedBook)
  }, [closedBook, onOpenChange])

  const handlePointerOver = (e) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
  }
  const handlePointerOut = () => {
    document.body.style.cursor = 'auto'
  }

  return (
    <group {...props}>
      <MagicMotes active={!closedBook} />
      <group ref={lift}>
        <group rotation-y={Math.PI / 2} rotation-z={Math.PI / 2}>
          {Array.from({ length: PAGE_COUNT }, (_, number) => {
            const opened = shownPage > number
            // The outermost leaf on each side is a board: the tilt puts
            // leaf 0 on top of the closed stack and the last one under it,
            // so they are the front and back covers and their tooled face
            // looks the opposite way.
            const boards = number === 0 ? frontCover : number === PAGE_COUNT - 1 ? backCover : null
            return (
              <Page
                key={number}
                number={number}
                page={shownPage}
                opened={opened}
                closedBook={closedBook}
                materials={boards || paper}
                onClick={(e) => {
                  e.stopPropagation()
                  setPage(opened ? number : number + 1)
                }}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
              />
            )
          })}
        </group>
      </group>
    </group>
  )
}
