import { useEffect, useRef, useState } from 'react'
import Page from './components/Page'
import Spine from './components/Spine'
import MagicMotes from './components/MagicMotes'
import { usePageMaterials } from './hooks/usePageMaterials'
import { useTurnQueue } from './hooks/useTurnQueue'
import { useTableLift } from './hooks/useTableLift'
import { PAGE_COUNT, TILT_ROTATION } from './domain/pageCurl'

// The book of the scene: leaves skinned to a chain of bones, so each one
// curls as it turns instead of swinging as a rigid card. The technique is
// the wass08/r3f-animated-book-slider tutorial's; it arrived here as a
// second book to compare against the scene's original vertex-displacement
// one (features/book, no longer mounted) and stayed.
//
// How it lies on the table, and why its axes are the way they are, is
// TILT_ROTATION in domain/pageCurl — the frame every measurement in that
// file is written in, which is also why scripts/probe.mjs can rebuild this
// hierarchy and measure it without a browser.
export default function PageCurlBook({ onOpenChange, ...props }) {
  const [page, setPage] = useState(0)
  // What the book is showing trails what the reader asked for: a jump of
  // several sheets turns them one after another (see useTurnQueue).
  const shownPage = useTurnQueue(page)
  const { paper, frontCover, backCover, spine } = usePageMaterials()
  // The two boards' live poses, which the spine's leather is glued to.
  // A ref and not state: the spine re-lays itself every frame, and the
  // boards curl continuously (see components/Spine).
  const frontBoard = useRef()
  const backBoard = useRef()
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
        <group rotation={TILT_ROTATION}>
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
                board={!!boards}
                hingeRef={number === 0 ? frontBoard : number === PAGE_COUNT - 1 ? backBoard : undefined}
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
          {/* After the leaves, so its per-frame pass reads bones this frame
              has already posed rather than the previous one's. */}
          <Spine material={spine} frontRef={frontBoard} backRef={backBoard} />
        </group>
      </group>
    </group>
  )
}
