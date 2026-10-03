import { Table } from '@/features/table'
import { Floor } from '@/features/floor'
import { Rug } from '@/features/rug'
import { Wall } from '@/features/wall'
import { Bookshelf } from '@/features/bookshelf'
import { Candle, FireAudio } from '@/features/candle'
import { Sconce } from '@/features/sconce'
import { Fireplace } from '@/features/fireplace'
import { Throne } from '@/features/throne'
import { Cauldron } from '@/features/cauldron'
import { Shelf } from '@/features/shelf'
import { Sofa } from '@/features/sofa'
import { Cabinet } from '@/features/cabinet'
import { Shield } from '@/features/shield'
import { Portrait } from '@/features/portrait'
import { Bust } from '@/features/bust'
import { AntiqueTable } from '@/features/antiqueTable'
import { Helmet } from '@/features/helmet'
import { Wizard } from '@/features/wizard'
import { DustParticles } from '@/features/dust'
import { Lighting } from '@/features/lighting'
import { CameraRig } from '@/features/camera'
import { PageCurlBook } from '@/features/pageCurlBook'
import { BOOK_PAGES } from '@/features/cv'
import { LoveHeart } from '@/features/love'
import {
  CANDLE_POSITION,
  FLOOR_POSITION,
  RUG_POSITION,
  WALL_POSITION,
  BOOKSHELF_POSITION,
  BOOKSHELF_ROTATION,
  CABINET_POSITION,
  CABINET_ROTATION,
  SHIELD_POSITION,
  PORTRAIT_POSITION,
  BUST_POSITION,
  ANTIQUE_TABLE_POSITION,
  ANTIQUE_TABLE_ROTATION,
  SCONCES,
  FIREPLACE_POSITION,
  FIREPLACE_ROTATION,
  CAULDRON_POSITION,
  CAULDRON_ROTATION,
  SHELF_POSITION,
  SHELF_ROTATION,
  SOFA_POSITION,
  SOFA_ROTATION,
  THRONES,
  FLAME_POSITION,
  HELMET_POSITION,
  HELMET_ROTATION,
  WIZARD_POSITION,
  WIZARD_ROTATION,
  BOOK_POSITION,
  LOVE_HEART_POSITION,
} from './scene/layout'

// The scene assembled from its features. The one piece of state that
// crosses a feature boundary — whether the book is open, which the book
// itself drives and the camera and the wizard react to — is handed down
// from App, because the hint line outside the canvas reads it too. So is
// whether the loading screen has lifted, which only the camera waits on.
// And so is what a click on the love heart does, since the count it adds
// to is drawn over the canvas.
//
// The book is features/pageCurlBook. features/book — the from-scratch
// vertex-displacement one this scene opened with — is no longer mounted;
// its cover leather is still what this one is bound in (see
// pageCurlBook/hooks/usePageMaterials).
export default function Scene({ open, onOpenChange, page, onPageChange, revealed, onLove }) {
  return (
    <>
      <Lighting />
      <Floor position={FLOOR_POSITION} />
      <Rug position={RUG_POSITION} />
      <Wall position={WALL_POSITION} />
      <Bookshelf position={BOOKSHELF_POSITION} rotation={BOOKSHELF_ROTATION} />
      <Cabinet position={CABINET_POSITION} rotation={CABINET_ROTATION} />
      <Shield position={SHIELD_POSITION} />
      <Portrait position={PORTRAIT_POSITION} />
      <Bust position={BUST_POSITION} />
      <Fireplace position={FIREPLACE_POSITION} rotation={FIREPLACE_ROTATION} />
      <Cauldron position={CAULDRON_POSITION} rotation={CAULDRON_ROTATION} />
      <Shelf position={SHELF_POSITION} rotation={SHELF_ROTATION} />
      <Sofa position={SOFA_POSITION} rotation={SOFA_ROTATION} />
      <AntiqueTable position={ANTIQUE_TABLE_POSITION} rotation={ANTIQUE_TABLE_ROTATION} />
      <Table />
      {THRONES.map((throne, i) => (
        <Throne key={i} {...throne} />
      ))}
      <Candle position={CANDLE_POSITION} />
      <FireAudio position={FLAME_POSITION} />
      {SCONCES.map((sconce, i) => (
        <Sconce key={i} {...sconce} />
      ))}
      <Helmet position={HELMET_POSITION} rotation={HELMET_ROTATION} />
      <Wizard position={WIZARD_POSITION} rotation={WIZARD_ROTATION} open={open} />
      <PageCurlBook
        position={BOOK_POSITION}
        pages={BOOK_PAGES}
        page={page}
        onPageChange={onPageChange}
        onOpenChange={onOpenChange}
      />
      <LoveHeart position={LOVE_HEART_POSITION} onLove={onLove} />
      <DustParticles />
      <CameraRig open={open} ready={revealed} />
    </>
  )
}
