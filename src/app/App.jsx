import { useCallback, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './Scene'
import { configureScene } from './scene/renderer'
import AdaptiveResolution from './scene/AdaptiveResolution'
import { CAMERA, SHOTS } from '@/features/camera'
import { LoadingScreen, SceneWarmup } from '@/features/loader'
import { LoveCounter, LoveHeartTip, useLove } from '@/features/love'
import { BookReader } from '@/features/pageCurlBook'
import { BOOK_PAGES, CvLink } from '@/features/cv'
import { PortraitBack } from '@/features/portrait'

// What the visitor can do right now, which is not the same before and after
// the book opens: an open book takes the keyboard and lets the lens much
// closer in (see features/camera). In front of the portrait none of that
// works — the camera is held there — and the only thing left is to go back.
const HINTS = {
  closed: 'Arrastra para observar · Haz clic en la tapa para abrir el manuscrito',
  open: 'WASD para desplazarte · Arrastra para girar · Rueda para acercarte · Clic para pasar página',
  portrait: 'Flecha o Esc para volver al libro',
}

export default function App() {
  // Whether the book is open is the scene's one piece of shared state: the
  // book drives it, the camera reacts to it — and so does the line under
  // the canvas, which is outside the canvas, so it lives out here above both.
  const [isOpen, setIsOpen] = useState(false)
  // And the page it is open at, for the same reason: the book turns it, and
  // so does the magnifier over the canvas (see BookReader).
  const [page, setPage] = useState(0)
  // The loading screen's two halves, one on each side of the canvas: the
  // warm-up inside it says when the room is on the GPU, the screen over it
  // says when it has lifted — and only then does the camera start its
  // dolly-in.
  const [ready, setReady] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const warmup = useRef(null)
  // The project's hearts: given by the heart in the room, counted in the
  // corner over it. Under the pointer the heart shows what it's for, a tip
  // over the canvas that the heart places beside itself — the ref joins them.
  const love = useLove()
  const heartTip = useRef(null)
  // Whether the visitor is looking at the dogs' portrait: a click on it in
  // the room says so, the way back over the canvas says they're done. That
  // button is placed beside the frame by the portrait, inside the canvas;
  // the ref joins the two, like the warm-up's.
  const [viewingPortrait, setViewingPortrait] = useState(false)
  const viewPortrait = useCallback(() => setViewingPortrait(true), [])
  const leavePortrait = useCallback(() => setViewingPortrait(false), [])
  const portraitBack = useRef(null)

  return (
    <div className="scene-wrap">
      {/* 'percentage' is PCFShadowMap. It used to be 'soft', but three has
          dropped PCFSoftShadowMap: 0.186 warns and falls back to
          PCFShadowMap anyway, so this is the same filter, minus the warning. */}
      <Canvas
        style={{ animation: 'fadeIn 1.2s ease' }}
        shadows="percentage"
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        camera={{ ...CAMERA, position: SHOTS.intro.position.toArray() }}
        onCreated={configureScene}
      >
        <Scene
          open={isOpen}
          onOpenChange={setIsOpen}
          page={page}
          onPageChange={setPage}
          revealed={revealed}
          onLove={love.give}
          heartTipRef={heartTip}
          viewingPortrait={viewingPortrait}
          onViewPortrait={viewPortrait}
          portraitBackRef={portraitBack}
        />
        <SceneWarmup progressRef={warmup} onReady={() => setReady(true)} />
        <AdaptiveResolution active={revealed} />
      </Canvas>
      <div className="vignette" />
      <div className="hint">{viewingPortrait ? HINTS.portrait : isOpen ? HINTS.open : HINTS.closed}</div>
      <div className="corner">
        <BookReader pages={BOOK_PAGES} page={page} onPageChange={setPage} open={isOpen} />
        <CvLink />
        <LoveCounter count={love.count} loved={love.loved} />
      </div>
      <LoveHeartTip ref={heartTip} count={love.count} loved={love.loved} />
      <PortraitBack ref={portraitBack} open={viewingPortrait} onBack={leavePortrait} />
      <LoadingScreen ready={ready} warmupRef={warmup} onReveal={() => setRevealed(true)} />
    </div>
  )
}
