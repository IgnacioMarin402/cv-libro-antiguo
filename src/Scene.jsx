import Book from './components/Book'
import Table from './components/Table'
import Candle from './components/Candle'
import DustParticles from './components/DustParticles'
import Lighting from './components/Lighting'
import CameraRig from './components/CameraRig'

export default function Scene() {
  return (
    <>
      <Lighting />
      <Book />
      <Table />
      <Candle />
      <DustParticles />
      <CameraRig />
    </>
  )
}
