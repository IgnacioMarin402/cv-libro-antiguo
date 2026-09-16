import * as THREE from 'three'
import { rand } from './random'

function canvasTexture(draw, size) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  draw(ctx, size)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// Leather cover: mottled worn brown with rubbed corners and fine scratches.
export function createCoverTexture() {
  const tex = canvasTexture((ctx, s) => {
    ctx.fillStyle = '#b08e60'
    ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 900; i++) {
      const x = Math.random() * s
      const y = Math.random() * s
      const r = rand(2, 22)
      const shade = Math.random() > 0.5 ? 'rgba(30,18,10,' : 'rgba(150,110,70,'
      ctx.fillStyle = shade + rand(0.03, 0.12) + ')'
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
    const g = ctx.createRadialGradient(s * 0.02, s * 0.02, 2, s * 0.02, s * 0.02, s * 0.4)
    g.addColorStop(0, 'rgba(190,150,100,0.35)')
    g.addColorStop(1, 'rgba(190,150,100,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
    ctx.save()
    ctx.translate(s, s)
    ctx.scale(-1, -1)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
    ctx.restore()
    ctx.strokeStyle = 'rgba(20,12,6,0.15)'
    for (let i = 0; i < 60; i++) {
      ctx.beginPath()
      const x = Math.random() * s
      const y = Math.random() * s
      const a = Math.random() * Math.PI * 2
      const len = rand(10, 60)
      ctx.moveTo(x, y)
      ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len)
      ctx.lineWidth = rand(0.5, 1.5)
      ctx.stroke()
    }
  }, 512)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

// Grayscale bump map matching the cover's leather grain.
export function createCoverBumpTexture() {
  return canvasTexture((ctx, s) => {
    ctx.fillStyle = '#808080'
    ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 4000; i++) {
      const v = rand(-30, 30)
      ctx.fillStyle = `rgba(${128 + v},${128 + v},${128 + v},0.5)`
      ctx.fillRect(Math.random() * s, Math.random() * s, 1.2, 1.2)
    }
  }, 512)
}

// Page-block edge: fine horizontal strata with foxed/aged tone spots.
export function createPagesTexture() {
  const tex = canvasTexture((ctx, s) => {
    ctx.fillStyle = '#e2cd9c'
    ctx.fillRect(0, 0, s, s)
    for (let y = 0; y < s; y += rand(2, 4)) {
      ctx.strokeStyle = `rgba(90,65,35,${rand(0.06, 0.22)})`
      ctx.lineWidth = rand(0.5, 1.4)
      ctx.beginPath()
      ctx.moveTo(0, y + rand(-1, 1))
      ctx.lineTo(s, y + rand(-1, 1))
      ctx.stroke()
    }
    for (let i = 0; i < 260; i++) {
      const x = Math.random() * s
      const y = Math.random() * s
      const r = rand(3, 16)
      ctx.fillStyle = `rgba(120,80,30,${rand(0.05, 0.18)})`
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }, 512)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 3)
  return tex
}

// Wood table top: dark stained planks with wavy grain lines.
export function createWoodTexture() {
  const tex = canvasTexture((ctx, s) => {
    ctx.fillStyle = '#241408'
    ctx.fillRect(0, 0, s, s)
    for (let y = 0; y < s; y += rand(4, 10)) {
      ctx.strokeStyle = `rgba(60,32,14,${rand(0.2, 0.5)})`
      ctx.lineWidth = rand(1, 3)
      ctx.beginPath()
      ctx.moveTo(0, y)
      for (let x = 0; x <= s; x += 40) ctx.lineTo(x, y + Math.sin(x * 0.02 + y) * 6)
      ctx.stroke()
    }
  }, 512)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(6, 6)
  return tex
}

// Soft warm radial glow used for the candle flame's light bloom sprite.
export function createGlowTexture() {
  return canvasTexture((ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    g.addColorStop(0, 'rgba(255,180,90,0.9)')
    g.addColorStop(1, 'rgba(255,140,60,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
  }, 64)
}

// Soft warm radial dot used as the sprite for each dust particle.
export function createDustTexture() {
  return canvasTexture((ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    g.addColorStop(0, 'rgba(255,220,160,0.9)')
    g.addColorStop(1, 'rgba(255,220,160,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
  }, 64)
}
