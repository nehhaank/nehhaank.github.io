import { useEffect, useRef, useState } from 'react'
import sprite from '../assets/craft/sakura-bottle.webp'
import { sfx } from './sound'

// The real glass bottle with a sakura tree inside, photographed six times as it was turned over.
// Each photo is straightened and stacked in a sprite (cork up), so the canvas can rotate whichever
// photo fits the bottle's angle and how stirred-up the snow is, and crossfade between them.
// Live snow and petals fall inside the glass on top, always the real way down.
const CW = 380
const CH = 380
const FW = 252 // one photo in the sprite
const FH = 512
const K = 330 / FH // drawn scale
// glass interior in drawn bottle space (origin at the bottle's centre)
const BX = 64
const BTOP = -61
const BBOT = 146
const RC = 20
const FLOOR = 118

// frames: 0 upright, 1 tilted 16°, 2 tilted 35°, 3 upside down, 4 tilted 22° full of snow, 5 upright full of snow
const CALM: [number, number][] = [[0, 0], [16, 1], [35, 2], [180, 3]]
const STIRRED: [number, number][] = [[0, 5], [22, 4], [180, 3]]

function weights(keys: [number, number][], deg: number, w: number[], scale: number) {
  for (let i = 0; i < keys.length - 1; i++) {
    const [a, fa] = keys[i]
    const [b, fb] = keys[i + 1]
    if (deg <= b) {
      const t = Math.max(0, (deg - a) / (b - a))
      w[fa] += (1 - t) * scale
      w[fb] += t * scale
      return
    }
  }
  w[keys[keys.length - 1][1]] += scale
}

type P = { x: number; y: number; vx: number; vy: number; a: number; va: number; s: number; kind: 0 | 1; tint: number; rest: number; wait: number }

function inside(x: number, y: number) {
  // rounded-rect interior: returns the closest point inside and the wall normal if outside
  const cx = Math.max(-BX + RC, Math.min(BX - RC, x))
  const cy = Math.max(BTOP + RC, Math.min(BBOT - RC, y))
  const dx = x - cx
  const dy = y - cy
  const d = Math.hypot(dx, dy)
  if (d <= RC) return null
  const nx = dx / d
  const ny = dy / d
  return { x: cx + nx * RC, y: cy + ny * RC, nx, ny }
}

export function SakuraBottle() {
  const cv = useRef<HTMLCanvasElement>(null)
  const st = useRef({ th: 0, w: 0, target: 0, drag: false, lastX: 0, lastT: 0, idle: 0, stir: 0 })
  const [hint, setHint] = useState(true)

  useEffect(() => {
    const canvas = cv.current
    if (!canvas) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = CW * dpr
    canvas.height = CH * dpr
    const ctx = canvas.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const img = new Image()
    img.src = sprite

    const parts: P[] = []
    for (let i = 0; i < 190; i++) {
      const petal = i < 36
      parts.push({
        x: (Math.random() - 0.5) * BX * 1.8,
        y: BTOP + Math.random() * (FLOOR - BTOP),
        rest: 0, wait: Math.random() * 6,
        vx: 0, vy: 0,
        a: Math.random() * 6, va: (Math.random() - 0.5) * 0.1,
        s: petal ? 1.8 + Math.random() * 1.4 : 0.8 + Math.random() * 1.1,
        kind: petal ? 1 : 0, tint: Math.random(),
      })
    }
    const interior = new Path2D()
    interior.roundRect(-BX, BTOP, 2 * BX, BBOT - BTOP, RC)

    let raf = 0
    let last = performance.now()
    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(canvas)
    const s = st.current
    const w = [0, 0, 0, 0, 0, 0]

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (!visible) return
      const dt = Math.min(0.033, (now - last) / 1000)
      last = now
      // bottle angle: follow the drag, then settle back upright like it was put down
      const prev = s.th
      if (!s.drag) {
        s.idle += dt
        if (s.idle > 1.2) s.target *= 0.97
        s.th += (s.target - s.th) * 0.12
      } else s.th += (s.target - s.th) * 0.35
      s.w = (s.th - prev) / Math.max(dt, 0.001)
      // how stirred the snow is: turning it over fills the water, then it slowly settles
      const tilt = Math.abs(Math.atan2(Math.sin(s.th), Math.cos(s.th)))
      if (tilt > 1.6) s.stir = Math.min(1, s.stir + dt * 1.2)
      else s.stir = Math.max(0, s.stir - dt / 9)
      const c = Math.cos(-s.th)
      const sn = Math.sin(-s.th)
      // world gravity seen from inside the bottle
      const gx = -sn * 60
      const gy = c * 60
      for (const p of parts) {
        const heavy = p.kind === 1 ? 0.2 : 0.12
        // gravity, plus the water being dragged round when the glass spins
        p.vx += (gx * heavy + -s.w * p.y * 0.25) * dt
        p.vy += (gy * heavy + s.w * p.x * 0.25) * dt
        if (!reduce) {
          p.vx += (Math.random() - 0.5) * (p.kind ? 6 : 10) * dt
          p.vy += (Math.random() - 0.5) * (p.kind ? 6 : 10) * dt
        }
        const drag = p.kind ? 0.95 : 0.962
        p.vx *= drag
        p.vy *= drag
        p.x += p.vx * dt * 6
        p.y += p.vy * dt * 6
        const hit = inside(p.x, p.y)
        if (hit) {
          p.x = hit.x - hit.nx * 0.5
          p.y = hit.y - hit.ny * 0.5
          const vn = p.vx * hit.nx + p.vy * hit.ny
          if (vn > 0) {
            p.vx -= vn * hit.nx * 1.3
            p.vy -= vn * hit.ny * 1.3
          }
          p.vx *= 0.8
          p.vy *= 0.8
          // ease off the glass so flakes don't line the walls
          p.x -= hit.nx * Math.random() * 2
          p.y -= hit.ny * Math.random() * 2
        }
        // settle on the snow bed when the bottle is upright-ish
        if (tilt < 0.6 && p.y > FLOOR) {
          p.y = FLOOR
          p.vy = Math.min(p.vy, 0)
          p.vx *= 0.9
          // after a rest on the snow bed, a flake drifts down from the top again: a slow, endless snowfall
          p.rest += dt
          if (p.rest > p.wait) {
            p.rest = 0
            p.wait = 2 + Math.random() * 10
            p.x = (Math.random() - 0.5) * BX * 1.7
            p.y = BTOP + 4 + Math.random() * 16
            p.vx = (Math.random() - 0.5) * 2
            p.vy = 0
          }
        } else p.rest = 0
        p.a += p.va + p.vx * 0.01
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, CW, CH)
      const ox = CW / 2
      const oy = CH / 2
      // shadow on the table
      ctx.save()
      ctx.translate(ox + Math.sin(s.th) * 24, CH - 16)
      const sh = ctx.createRadialGradient(0, 0, 4, 0, 0, 90)
      sh.addColorStop(0, 'rgba(0,0,0,0.38)')
      sh.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = sh
      ctx.scale(1 + Math.abs(Math.sin(s.th)) * 0.5, 0.14)
      ctx.beginPath()
      ctx.arc(0, 0, 90, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      ctx.save()
      ctx.translate(ox, oy)
      ctx.rotate(s.th)
      if (img.complete && img.naturalWidth) {
        w.fill(0)
        const deg = (tilt * 180) / Math.PI
        weights(CALM, deg, w, 1 - s.stir)
        weights(STIRRED, deg, w, s.stir)
        // crossfade: each layer's alpha is its share of everything drawn so far
        let acc = 0
        for (let i = 0; i < 6; i++) {
          if (w[i] < 0.004) continue
          acc += w[i]
          ctx.globalAlpha = w[i] / acc
          ctx.drawImage(img, i * FW, 0, FW, FH, (-FW / 2) * K, (-FH / 2) * K, FW * K, FH * K)
        }
        ctx.globalAlpha = 1
      }
      // live snow and petals inside the glass
      ctx.save()
      ctx.clip(interior)
      for (const p of parts) {
        const moving = Math.min(1, Math.hypot(p.vx, p.vy) / 4 + (FLOOR - p.y) / 40)
        if (moving < 0.05) continue
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.a)
        ctx.globalAlpha = Math.min(1, moving)
        if (p.kind) {
          ctx.fillStyle = p.tint > 0.5 ? 'rgba(236,140,168,0.95)' : 'rgba(250,190,205,0.95)'
          ctx.beginPath()
          ctx.ellipse(0, 0, p.s, p.s * 0.6 * (0.6 + Math.abs(Math.sin(p.a * 2)) * 0.4), 0, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.92)'
          ctx.beginPath()
          ctx.arc(0, 0, p.s, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }
      ctx.restore()
      ctx.restore()
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [])

  const s = st.current
  return (
    <figure className="bottle">
      <canvas
        ref={cv}
        className="bottle-canvas"
        role="img"
        aria-label="A glass bottle with a cherry blossom tree, petals and snow inside. Drag to turn it."
        onPointerDown={(e) => {
          ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
          s.drag = true
          s.lastX = e.clientX
          s.idle = 0
          setHint(false)
          sfx.glass()
        }}
        onPointerMove={(e) => {
          if (!s.drag) return
          s.target += (e.clientX - s.lastX) * 0.012
          s.lastX = e.clientX
        }}
        onPointerUp={() => {
          s.drag = false
          s.idle = 0
        }}
        onPointerCancel={() => (s.drag = false)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') s.target -= 0.5
          if (e.key === 'ArrowRight') s.target += 0.5
          s.idle = 0
        }}
        tabIndex={0}
      />
      <figcaption>{hint ? 'Drag the bottle to turn it.' : 'Turn it upside down. Wait for the snow.'}</figcaption>
    </figure>
  )
}
