import PageLeaf from './PageLeaf'
import { MAX_PAGES, PAGE_WIDTH, PAGE_THICKNESS, SPINE_RADIUS } from '../domain/binding'
import { unreadLeafY, readPileOffset, restTilt } from '../domain/pageStack'
import { PAGE_CURL_AMPLITUDE } from '../domain/flipMotion'

// The text block: every leaf in order, each either still on the unread
// stack or already turned onto the read pile. Which slot a leaf belongs in
// is domain/pageStack's call — this only hands each one the slot it was
// given and the live hinges it has to follow.
export default function PageBlock({
  geometry,
  material,
  pageGrid,
  restBend,
  pagesTurned,
  hinges,
  onTurn,
  onClose,
  onPointerOver,
  onPointerOut,
}) {
  const { frontAngleRef, backAngleRef, spineAngleRef, shelfYRef } = hinges

  return Array.from({ length: MAX_PAGES }, (_, i) => {
    const flipped = i < pagesTurned
    return (
      <PageLeaf
        key={i}
        geometry={geometry}
        material={material}
        flatFarY={unreadLeafY(i)}
        stackOffset={readPileOffset(i)}
        sweepRadius={PAGE_WIDTH}
        flipped={flipped}
        coverAngleRef={frontAngleRef}
        coverFarYRef={shelfYRef}
        backAngleRef={backAngleRef}
        restTilt={restTilt(i)}
        pageGrid={pageGrid}
        pageT={PAGE_THICKNESS}
        restBend={restBend}
        curlAmplitude={PAGE_CURL_AMPLITUDE}
        parentAngleRef={spineAngleRef}
        pivotYOffset={SPINE_RADIUS}
        onClick={flipped ? onClose : onTurn}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      />
    )
  })
}
