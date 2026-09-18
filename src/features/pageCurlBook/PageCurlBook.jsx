import { useState } from 'react'
import Page from './components/Page'
import { usePageMaterials } from './hooks/usePageMaterials'
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
export default function PageCurlBook(props) {
  const [page, setPage] = useState(0)
  const materials = usePageMaterials()

  const handlePointerOver = (e) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
  }
  const handlePointerOut = () => {
    document.body.style.cursor = 'auto'
  }

  return (
    <group {...props}>
      <group rotation-y={Math.PI / 2} rotation-z={Math.PI / 2}>
        {Array.from({ length: PAGE_COUNT }, (_, number) => {
          const opened = page > number
          return (
            <Page
              key={number}
              number={number}
              page={page}
              opened={opened}
              closedBook={page === 0 || page === PAGE_COUNT}
              materials={materials}
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
  )
}
