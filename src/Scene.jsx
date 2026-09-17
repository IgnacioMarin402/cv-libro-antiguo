import { useState } from 'react'
import Book from './components/Book'
import Table from './components/Table'
import Candle from './components/Candle'
import CandleHolder, { HOLDER_CUP_Y } from './components/CandleHolder'
import Helmet from './components/Helmet'
import DustParticles from './components/DustParticles'
import Lighting from './components/Lighting'
import CameraRig from './components/CameraRig'
import FireAudio from './components/FireAudio'

const CANDLE_X = 0.34
const CANDLE_Z = 0.42
const FLAME_Y = HOLDER_CUP_Y + 0.35
// Northeast of the book, mirroring the candle's southeast offset — close
// enough to stay in frame at the default camera distance.
const HELMET_X = 0.5
const HELMET_Z = -0.18

export default function Scene() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Lighting />
      <Book open={isOpen} onOpenChange={setIsOpen} />
      <Table />
      <CandleHolder position={[CANDLE_X, 0, CANDLE_Z]} />
      <Candle position={[CANDLE_X, HOLDER_CUP_Y, CANDLE_Z]} />
      <FireAudio position={[CANDLE_X, FLAME_Y, CANDLE_Z]} />
      <Helmet position={[HELMET_X, 0, HELMET_Z]} />
      <DustParticles />
      <CameraRig open={isOpen} />
    </>
  )
}
