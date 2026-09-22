import { Table } from '@/features/table'
import { Candle, CandleHolder, FireAudio } from '@/features/candle'
import { Helmet } from '@/features/helmet'
import { Wizard } from '@/features/wizard'
import { DustParticles } from '@/features/dust'
import { Lighting } from '@/features/lighting'
import { CameraRig } from '@/features/camera'
import { PageCurlBook } from '@/features/pageCurlBook'
import {
  CANDLE_HOLDER_POSITION,
  CANDLE_POSITION,
  FLAME_POSITION,
  HELMET_POSITION,
  HELMET_ROTATION,
  WIZARD_POSITION,
  WIZARD_ROTATION,
  BOOK_POSITION,
} from './scene/layout'

// The scene assembled from its features. The one piece of state that
// crosses a feature boundary — whether the book is open, which the book
// itself drives and the camera and the wizard react to — is handed down
// from App, because the hint line outside the canvas reads it too.
//
// The book is features/pageCurlBook. features/book — the from-scratch
// vertex-displacement one this scene opened with — is no longer mounted;
// its cover leather is still what this one is bound in (see
// pageCurlBook/hooks/usePageMaterials).
export default function Scene({ open, onOpenChange }) {
  return (
    <>
      <Lighting />
      <Table />
      <CandleHolder position={CANDLE_HOLDER_POSITION} />
      <Candle position={CANDLE_POSITION} />
      <FireAudio position={FLAME_POSITION} />
      <Helmet position={HELMET_POSITION} rotation={HELMET_ROTATION} />
      <Wizard position={WIZARD_POSITION} rotation={WIZARD_ROTATION} open={open} />
      <PageCurlBook position={BOOK_POSITION} onOpenChange={onOpenChange} />
      <DustParticles />
      <CameraRig open={open} />
    </>
  )
}
