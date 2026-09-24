import { CROP_WIDTH_PX, CROP_X_PX, SEAM_BLEND_PX, TEXTURE_HEIGHT_PX } from '../domain/wall'

// One tileable repeat cut out of the panelling image (see domain/wall): the
// three bays, with the last strip faded into the image's own pixels from
// just before the cut, so the right edge runs straight on into the left.
export function buildWallCanvas(image) {
  const canvas = document.createElement('canvas')
  canvas.width = CROP_WIDTH_PX
  canvas.height = TEXTURE_HEIGHT_PX
  const g = canvas.getContext('2d')
  g.drawImage(image, CROP_X_PX, 0, CROP_WIDTH_PX, TEXTURE_HEIGHT_PX, 0, 0, CROP_WIDTH_PX, TEXTURE_HEIGHT_PX)

  // The strip that comes before the cut, masked by a ramp from nothing at
  // its left to whole at its right, laid over the repeat's last columns.
  const strip = document.createElement('canvas')
  strip.width = SEAM_BLEND_PX
  strip.height = TEXTURE_HEIGHT_PX
  const s = strip.getContext('2d')
  s.drawImage(
    image,
    CROP_X_PX - SEAM_BLEND_PX, 0, SEAM_BLEND_PX, TEXTURE_HEIGHT_PX,
    0, 0, SEAM_BLEND_PX, TEXTURE_HEIGHT_PX,
  )
  const ramp = s.createLinearGradient(0, 0, SEAM_BLEND_PX, 0)
  ramp.addColorStop(0, 'rgba(0,0,0,0)')
  ramp.addColorStop(1, 'rgba(0,0,0,1)')
  s.globalCompositeOperation = 'destination-in'
  s.fillStyle = ramp
  s.fillRect(0, 0, SEAM_BLEND_PX, TEXTURE_HEIGHT_PX)

  g.drawImage(strip, CROP_WIDTH_PX - SEAM_BLEND_PX, 0)
  return canvas
}
