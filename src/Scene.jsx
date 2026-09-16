import Book from './components/Book'
import Table from './components/Table'
import Candle from './components/Candle'
import CandleHolder, { HOLDER_CUP_Y } from './components/CandleHolder'
import DustParticles from './components/DustParticles'
import Lighting from './components/Lighting'
import CameraRig from './components/CameraRig'
import FireAudio from './components/FireAudio'

const CANDLE_X = 0.34
const CANDLE_Z = 0.42
const FLAME_Y = HOLDER_CUP_Y + 0.35

export default function Scene() {
  return (
    <>
      <Lighting />
      <Book />
      <Table />
      <CandleHolder position={[CANDLE_X, 0, CANDLE_Z]} />
      <Candle position={[CANDLE_X, HOLDER_CUP_Y, CANDLE_Z]} />
      <FireAudio position={[CANDLE_X, FLAME_Y, CANDLE_Z]} />
      <DustParticles />
      <CameraRig />
    </>
  )
}
