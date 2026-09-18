import { useState } from 'react'
import Page from './components/Page'
import { usePageMaterials } from './hooks/usePageMaterials'
import { PAGE_COUNT } from './domain/pageCurl'

// A second book, built with the bone-chain "page-curl" technique from the
// wass08/r3f-animated-book-slider tutorial instead of our own book's
// vertex-displacement curl (see features/book) — placed alongside it so
// the two bending techniques can be compared directly. Blank pages, no
// photographs: the comparison is about the motion, not the finish.
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
  )
}
