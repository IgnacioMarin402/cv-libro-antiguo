import ClickBox from '@/shared/three/ClickBox'
import { HIT_BOX } from '../domain/bust'

// What a click on him lands on: a box round him, never drawn (see HIT_BOX),
// as the portrait's frame has its flat face. Once the visitor is looking at
// him, or at something else (no onFocus), it's not something to click.
//
// Nor where something stands between him and the lens: he's on the floor,
// mostly seen past the table and the thrones — of 1,728 rays to his head and
// shoulders from 288 places round the table, 390 went through the table, a
// throne or the tankard before reaching the box, and a click there flew the
// camera to him. The click checks for that (see shared/three/ClickBox).
export default function HitBox({ focused, onFocus }) {
  return <ClickBox center={HIT_BOX.center} size={HIT_BOX.size} live={!focused && !!onFocus} onClick={() => onFocus()} />
}
