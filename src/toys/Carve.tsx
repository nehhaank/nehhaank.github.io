import { useEffect, useRef, useState } from 'react'
import spoonSrc from '../assets/craft/spoon.png'
import { sfx } from './sound'

// A billet of wood with a spoon hiding inside it. Drag the knife over the block: wood outside the spoon
// comes away in shavings, and wood over the spoon is smoothed down to the real carved surface from the photo.
const CW = 560
const CH = 200
const R = 15

type Shaving = { x: number; y: number; vx: number; vy: number; a: number; va: number; r: number; life: number; c: string }

function woodTexture(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  const base = g.createLinearGradient(0, 0, 0, h)
  base.addColorStop(0, '#f0cf8e')
  base.addColorStop(0.5, '#e6bd73')
  base.addColorStop(1, '#d4a55a')
  g.fillStyle = base
  g.fillRect(0, 0, w, h)
  // long grain lines
  for (let i = 0; i < 70; i++) {
    const y0 = Math.random() * h
    g.strokeStyle = `rgba(${150 + Math.random() * 40},${95 + Math.random() * 30},${40 + Math.random() * 20},${0.12 + Math.random() * 0.22})`
    g.lineWidth = 0.6 + Math.random() * 1.8
    g.beginPath()
    let y = y0
    g.moveTo(0, y)
    for (let x = 0; x <= w; x += 20) {
      y += (Math.random() - 0.5) * 2.4 + Math.sin((x + y0 * 3) / 90) * 0.6
      g.lineTo(x, y)
    }
    g.stroke()
  }
  // a knot
  const kx = w * 0.72
  const ky = h * 0.32
  for (let r = 3; r < 26; r += 3) {
    g.strokeStyle = `rgba(140,85,35,${0.3 - r / 120})`
    g.lineWidth = 1.2
    g.beginPath()
    g.ellipse(kx, ky, r * 2.2, r * 0.7, 0, 0, Math.PI * 2)
    g.stroke()
  }
  return c
}

export function Carve() {
  const cv = useRef<HTMLCanvasElement>(null)
  const knife = useRef<HTMLDivElement>(null)
  const [pct, setPct] = useState(0)
  const [done, setDone] = useState(false)
  const [round, setRound] = useState(0)
  const api = useRef<{ carve: (x: number, y: number, px: number, py: number) => void } | null>(null)

  useEffect(() => {
    const canvas = cv.current
    if (!canvas) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = CW * dpr
    canvas.height = CH * dpr
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    let raf = 0
    let alive = true
    const img = new Image()
    img.src = spoonSrc
    const cut = document.createElement('canvas')
    cut.width = CW
    cut.height = CH
    const cg = cut.getContext('2d')!
    const outside = document.createElement('canvas')
    outside.width = CW
    outside.height = CH
    const og = outside.getContext('2d')!
    const inside = document.createElement('canvas')
    inside.width = CW
    inside.height = CH
    const ig = inside.getContext('2d')!
    const block = document.createElement('canvas')
    block.width = CW
    block.height = CH
    const bg = block.getContext('2d')!
    const wood = woodTexture(CW, CH)
    const shavings: Shaving[] = []
    let sw = 0
    let sh = 0
    let sx = 0
    let sy = 0
    let finishing = -1
    let lastShave = 0
    let mask: Uint8ClampedArray | null = null
    const box = { x: 0, y: 0, w: 0, h: 0 }

    img.onload = () => {
      sw = 500
      sh = (img.height / img.width) * sw
      sx = (CW - sw) / 2
      sy = (CH - sh) / 2
      box.x = sx - 16
      box.y = CH / 2 - 58
      box.w = sw + 32
      box.h = 116
      const m = document.createElement('canvas')
      m.width = CW
      m.height = CH
      const mg = m.getContext('2d')!
      mg.drawImage(img, sx, sy, sw, sh)
      mask = mg.getImageData(0, 0, CW, CH).data
    }

    const measure = () => {
      if (!mask) return 0
      const d = cg.getImageData(box.x, box.y, box.w, box.h).data
      let tot = 0
      let hit = 0
      for (let y = 0; y < box.h; y += 4)
        for (let x = 0; x < box.w; x += 4) {
          const i = (y * box.w + x) * 4
          tot++
          if (d[i + 3] > 128) hit++
        }
      return hit / tot
    }

    api.current = {
      carve(x, y, px, py) {
        if (finishing >= 0 || !mask) return
        if (x < box.x - 6 || x > box.x + box.w + 6 || y < box.y - 6 || y > box.y + box.h + 6) return
        cg.fillStyle = '#000'
        cg.strokeStyle = '#000'
        cg.lineCap = 'round'
        cg.lineWidth = R * 2
        cg.beginPath()
        cg.moveTo(px, py)
        cg.lineTo(x, y)
        cg.stroke()
        const mi = (Math.round(y) * CW + Math.round(x)) * 4 + 3
        const onSpoon = mask[mi] > 100
        const n = 1 + Math.floor(Math.random() * 2)
        for (let k = 0; k < n; k++)
          shavings.push({
            x, y,
            vx: (x - px) * 0.25 + (Math.random() - 0.5) * 3,
            vy: -2 - Math.random() * 2.5,
            a: Math.random() * 6, va: (Math.random() - 0.5) * 0.4,
            r: onSpoon ? 3 + Math.random() * 3 : 5 + Math.random() * 6,
            life: 1, c: onSpoon ? '#f4d79c' : '#e8c27c',
          })
        const now = performance.now()
        if (now - lastShave > 70) {
          sfx.shave()
          lastShave = now
        }
        const p = measure()
        setPct(p)
        if (p > 0.86) finishing = 0
      },
    }

    const draw = () => {
      raf = requestAnimationFrame(draw)
      ctx.clearRect(0, 0, CW, CH)
      if (!mask) return
      if (finishing >= 0 && finishing < 1) {
        finishing = Math.min(1, finishing + 0.02)
        if (finishing >= 1 && alive) {
          setDone(true)
          setPct(1)
        }
      }
      // wood left outside the spoon
      og.globalCompositeOperation = 'source-over'
      og.clearRect(0, 0, CW, CH)
      og.drawImage(cut, 0, 0)
      og.globalCompositeOperation = 'destination-out'
      og.drawImage(img, sx, sy, sw, sh)
      bg.globalCompositeOperation = 'source-over'
      bg.clearRect(0, 0, CW, CH)
      bg.save()
      bg.beginPath()
      bg.rect(box.x, box.y, box.w, box.h)
      bg.clip()
      bg.drawImage(wood, 0, 0)
      // bevel on the billet
      bg.fillStyle = 'rgba(255,240,200,0.35)'
      bg.fillRect(box.x, box.y, box.w, 3)
      bg.fillStyle = 'rgba(90,50,10,0.25)'
      bg.fillRect(box.x, box.y + box.h - 4, box.w, 4)
      bg.restore()
      bg.globalCompositeOperation = 'destination-out'
      bg.drawImage(outside, 0, 0)
      // the real spoon surface where the knife has passed over it
      ig.globalCompositeOperation = 'source-over'
      ig.clearRect(0, 0, CW, CH)
      ig.drawImage(img, sx, sy, sw, sh)
      ig.globalCompositeOperation = 'destination-in'
      ig.drawImage(cut, 0, 0)

      ctx.save()
      ctx.shadowColor = 'rgba(60,30,5,0.35)'
      ctx.shadowBlur = 14
      ctx.shadowOffsetY = 8
      ctx.globalAlpha = 1 - (finishing > 0 ? finishing : 0)
      ctx.drawImage(block, 0, 0)
      ctx.globalAlpha = 1
      if (finishing > 0) {
        ctx.globalAlpha = finishing
        ctx.drawImage(img, sx, sy, sw, sh)
        ctx.globalAlpha = 1 - finishing
      }
      ctx.drawImage(inside, 0, 0)
      ctx.restore()

      for (let i = shavings.length - 1; i >= 0; i--) {
        const s = shavings[i]
        s.vy += 0.22
        s.x += s.vx
        s.y += s.vy
        s.a += s.va
        s.life -= 0.012
        if (s.life <= 0 || s.y > CH + 20) {
          shavings.splice(i, 1)
          continue
        }
        ctx.save()
        ctx.globalAlpha = Math.min(1, s.life * 2)
        ctx.translate(s.x, s.y)
        ctx.rotate(s.a)
        ctx.strokeStyle = s.c
        ctx.lineWidth = 2.2
        ctx.beginPath()
        ctx.arc(0, 0, s.r, 0.2, Math.PI * 1.5)
        ctx.stroke()
        ctx.strokeStyle = 'rgba(150,95,40,0.5)'
        ctx.lineWidth = 0.7
        ctx.beginPath()
        ctx.arc(0, 0, s.r - 1, 0.3, Math.PI * 1.4)
        ctx.stroke()
        ctx.restore()
      }
    }
    draw()
    return () => {
      alive = false
      cancelAnimationFrame(raf)
    }
  }, [round])

  const last = useRef<{ x: number; y: number } | null>(null)
  const pt = (e: React.PointerEvent) => {
    const r = cv.current!.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * CW, y: ((e.clientY - r.top) / r.height) * CH }
  }
  const moveKnife = (e: React.PointerEvent) => {
    const k = knife.current
    if (!k) return
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    k.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px)`
  }

  return (
    <figure className="carve">
      <div
        className={`carve-stage${done ? ' is-done' : ''}`}
        onPointerDown={(e) => {
          ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
          const p = pt(e)
          last.current = p
          api.current?.carve(p.x, p.y, p.x - 1, p.y)
          e.currentTarget.classList.add('is-cutting')
        }}
        onPointerMove={(e) => {
          moveKnife(e)
          if (!last.current) return
          const p = pt(e)
          api.current?.carve(p.x, p.y, last.current.x, last.current.y)
          last.current = p
        }}
        onPointerUp={(e) => {
          last.current = null
          e.currentTarget.classList.remove('is-cutting')
        }}
        onPointerLeave={() => (last.current = null)}
      >
        <canvas ref={cv} className="carve-canvas" aria-label="A block of wood with a spoon inside it. Drag across it to carve." role="img" />
        <div className="carve-knife" ref={knife} aria-hidden="true">
          <svg viewBox="0 0 80 24">
            <path d="M2 12 L34 6 L36 18 Z" fill="#d9dde2" />
            <path d="M2 12 L34 6 L35 10 Z" fill="#fff" opacity="0.7" />
            <rect x="34" y="6" width="44" height="12" rx="5" fill="#8a5a33" />
            <rect x="34" y="7" width="44" height="3" rx="1.5" fill="rgba(255,220,170,0.35)" />
          </svg>
        </div>
      </div>
      <figcaption>
        <span className="carve-meter" aria-hidden="true"><i style={{ width: `${Math.round(Math.min(1, pct / 0.86) * 100)}%` }} /></span>
        <span aria-live="polite">{done ? 'A spoon. Sand it, oil it, eat soup with it.' : pct > 0 ? `Keep carving: ${Math.round(Math.min(1, pct / 0.86) * 100)}%` : 'Drag the knife across the block.'}</span>
        {done && <button type="button" className="chip-btn" onClick={() => { setDone(false); setPct(0); setRound((r) => r + 1) }}>New block</button>}
      </figcaption>
    </figure>
  )
}
