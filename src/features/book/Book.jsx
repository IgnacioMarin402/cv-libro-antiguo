import Spine from './components/Spine'
import PageBlock from './components/PageBlock'
import Cover from './components/Cover'
import { useBookGeometry } from './hooks/useBookGeometry'
import { useBookMaterials } from './hooks/useBookMaterials'
import { useBookHinges } from './hooks/useBookHinges'
import { useReadingProgress } from './hooks/useReadingProgress'
import { MAX_PAGES, FRONT_COVER_HINGE_Y, BACK_COVER_HINGE_Y } from './domain/binding'
import { frontCoverAngle, backCoverAngle } from './domain/opening'

// The bound book: a spine, a text block and two boards, assembled. How it
// is built lives in geometry/, where its parts settle in domain/, and how
// they get there in hooks/ — what's left here is the assembly itself and
// the handful of gestures the visitor has with it: click a cover to open or
// shut the book, click an unread leaf to turn it, click a turned one to
// close the whole thing again.
export default function Book({ open = false, onOpenChange }) {
  const { frontCoverGeo, backCoverGeo, spineGeo, pageGrid, pageRestBend, pageGeo } = useBookGeometry()
  const { pagesMat, spineMat, frontCoverMaterials, backCoverMaterials } = useBookMaterials()
  const hinges = useBookHinges()
  const { pagesTurned, turnPage } = useReadingProgress(open)

  const handleCoverClick = (e) => {
    e.stopPropagation()
    onOpenChange?.(!open)
  }
  const handleCloseClick = (e) => {
    if (!open) return
    e.stopPropagation()
    onOpenChange?.(false)
  }
  const handleTurnClick = (e) => {
    if (!open) return
    e.stopPropagation()
    turnPage()
  }
  const handlePointerOver = (e) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
  }
  const handlePointerOut = () => {
    document.body.style.cursor = 'auto'
  }

  return (
    <group rotation-y={0.06}>
      <Spine geometry={spineGeo} material={spineMat} open={open} angleRef={hinges.spineAngleRef}>
        <PageBlock
          geometry={pageGeo}
          material={pagesMat}
          pageGrid={pageGrid}
          restBend={pageRestBend}
          pagesTurned={pagesTurned}
          hinges={hinges}
          onTurn={handleTurnClick}
          onClose={handleCloseClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        />
        <Cover
          geometry={frontCoverGeo}
          material={frontCoverMaterials}
          hingeY={FRONT_COVER_HINGE_Y}
          targetAngle={frontCoverAngle(open)}
          angleRef={hinges.frontAngleRef}
          parentAngleRef={hinges.spineAngleRef}
          onClick={handleCoverClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        />
        <Cover
          geometry={backCoverGeo}
          material={backCoverMaterials}
          hingeY={BACK_COVER_HINGE_Y}
          targetAngle={backCoverAngle(open, pagesTurned, MAX_PAGES)}
          angleRef={hinges.backAngleRef}
          parentAngleRef={hinges.spineAngleRef}
        />
      </Spine>
    </group>
  )
}
