import { useState } from 'react'
import { Book } from '@/features/book'
import { Table } from '@/features/table'
import { Candle, CandleHolder, FireAudio } from '@/features/candle'
import { Helmet } from '@/features/helmet'
import { DustParticles } from '@/features/dust'
import { Lighting } from '@/features/lighting'
import { CameraRig } from '@/features/camera'
import { PageCurlBook } from '@/features/pageCurlBook'
import {
  CANDLE_HOLDER_POSITION,
  CANDLE_POSITION,
  FLAME_POSITION,
  HELMET_POSITION,
  PAGE_CURL_BOOK_POSITION,
} from './scene/layout'

// The scene assembled from its features. The one piece of state that
// crosses a feature boundary lives here: whether the book is open, which
// the book itself drives and the camera reacts to.
export default function Scene() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Lighting />
      <Book open={isOpen} onOpenChange={setIsOpen} />
      <Table />
      <CandleHolder position={CANDLE_HOLDER_POSITION} />
      <Candle position={CANDLE_POSITION} />
      <FireAudio position={FLAME_POSITION} />
      <Helmet position={HELMET_POSITION} />
      <PageCurlBook position={PAGE_CURL_BOOK_POSITION} />
      <DustParticles />
      <CameraRig open={isOpen} />
    </>
  )
}
