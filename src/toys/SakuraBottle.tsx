import { useEffect, useRef, useState } from 'react'
import { sfx } from './sound'

// A little glass bottle with a sakura tree inside, and petals and snow suspended in water.
// Drag it to turn it. The tree turns with the glass; the petals and snow keep falling the real way down.
const CW = 300
const CH = 380
const BX = 76 // interior half width
const BTOP = -72
const BBOT = 132
const RC = 40 // interior corner radius

type P = { x: number; y: number; vx: number; vy: number; a: number; va: number; s: number; kind: 0 | 1; tint: number }

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

function drawTree(g: CanvasRenderingContext2D) {
  // snow mound
  const mound = g.createLinearGradient(0, 100, 0, BBOT)
  mound.addColorStop(0, '#ffffff')
  mound.addColorStop(1, '#dfe6ee')
  g.fillStyle = mound
  g.beginPath()
  g.moveTo(-BX, BBOT)
  g.bezierCurveTo(-60, 96, 50, 92, BX, 112)
  g.lineTo(BX, BBOT)
  g.closePath()
  g.fill()
  // trunk and branches
  const rnd = (() => {
    let s = 11
    return () => ((s = (s * 16807) % 2147483647) / 2147483647)
  })()
  const blossoms: [number, number, number][] = []
  const branch = (x: number, y: number, a: number, len: number, w: number, depth: number) => {
    const x2 = x + Math.cos(a) * len
    const y2 = y + Math.sin(a) * len
    g.strokeStyle = depth > 3 ? '#4a2f22' : '#5b3a2a'
    g.lineWidth = w
    g.lineCap = 'round'
    g.beginPath()
    g.moveTo(x, y)
    g.quadraticCurveTo(x + Math.cos(a + 0.3) * len * 0.5, y + Math.sin(a + 0.3) * len * 0.5, x2, y2)
    g.stroke()
    if (depth <= 0 || len < 8) {
      blossoms.push([x2, y2, 7 + rnd() * 7])
      return
    }
    const n = 2 + (rnd() > 0.6 ? 1 : 0)
    for (let i = 0; i < n; i++) branch(x2, y2, a + (rnd() - 0.5) * 1.3, len * (0.62 + rnd() * 0.18), w * 0.66, depth - 1)
    if (depth < 3) blossoms.push([x2, y2, 6 + rnd() * 6])
  }
  branch(4, 104, -Math.PI / 2 - 0.08, 46, 8, 5)
  // round the crown out into an even dome so it doesn't lean to one side
  let minY = Infinity
  let maxY = -Infinity
  let maxDx = 0
  for (const [x, y] of blossoms) {
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
    maxDx = Math.max(maxDx, Math.abs(x - 4))
  }
  const cyC = (minY + maxY) / 2 - 2
  const rx = Math.min(BX - 18, maxDx + 10)
  const ry = (maxY - minY) / 2 + 8
  for (let i = 0; i < 34; i++) {
    const t = rnd() * Math.PI * 2
    const rr = Math.sqrt(rnd()) * 0.92
    blossoms.push([4 + Math.cos(t) * rx * rr, cyC + Math.sin(t) * ry * rr * (Math.sin(t) > 0 ? 0.7 : 1), 6 + rnd() * 6])
  }
  for (const [x, y, r] of blossoms) {
    for (let k = 0; k < 5; k++) {
      const bx = x + (rnd() - 0.5) * r * 1.6
      const by = y + (rnd() - 0.5) * r * 1.4
      const gr = g.createRadialGradient(bx - 1, by - 1, 0, bx, by, r * 0.7)
      gr.addColorStop(0, 'rgba(255,236,242,0.95)')
      gr.addColorStop(0.6, 'rgba(250,176,200,0.9)')
      gr.addColorStop(1, 'rgba(228,120,160,0.0)')
      g.fillStyle = gr
      g.beginPath()
      g.arc(bx, by, r * 0.7, 0, Math.PI * 2)
      g.fill()
    }
  }
}

export function SakuraBottle() {
  const cv = useRef<HTMLCanvasElement>(null)
  const st = useRef({ th: 0, w: 0, target: 0, drag: false, lastX: 0, lastT: 0, idle: 0 })
  const [hint, setHint] = useState(true)

  useEffect(() => {
    const canvas = cv.current
    if (!canvas) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = CW * dpr
    canvas.height = CH * dpr
    const ctx = canvas.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // pre-render the tree in bottle space
    const tree = document.createElement('canvas')
    tree.width = 2 * BX * dpr
    tree.height = (BBOT - BTOP) * dpr
    const tg = tree.getContext('2d')!
    tg.scale(dpr, dpr)
    tg.translate(BX, -BTOP)
    drawTree(tg)

    const parts: P[] = []
    for (let i = 0; i < 150; i++) {
      const petal = i < 46
      parts.push({
        x: (Math.random() - 0.5) * BX * 1.8,
        y: BTOP + Math.random() * (BBOT - BTOP),
        vx: 0, vy: 0,
        a: Math.random() * 6, va: (Math.random() - 0.5) * 0.1,
        s: petal ? 3 + Math.random() * 2.5 : 0.8 + Math.random() * 1.6,
        kind: petal ? 1 : 0, tint: Math.random(),
      })
    }

    let raf = 0
    let last = performance.now()
    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(canvas)
    const s = st.current

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
      const c = Math.cos(-s.th)
      const sn = Math.sin(-s.th)
      // world gravity seen from inside the bottle
      const gx = -sn * 60
      const gy = c * 60
      for (const p of parts) {
        const heavy = p.kind === 1 ? 0.55 : 0.32
        // gravity, plus the water being dragged round when the glass spins
        p.vx += (gx * heavy + -s.w * p.y * 0.9 + s.w * s.w * p.x * 0.05) * dt
        p.vy += (gy * heavy + s.w * p.x * 0.9 + s.w * s.w * p.y * 0.05) * dt
        if (!reduce) {
          p.vx += (Math.random() - 0.5) * (p.kind ? 6 : 10) * dt
          p.vy += (Math.random() - 0.5) * (p.kind ? 6 : 10) * dt
        }
        const drag = p.kind ? 0.955 : 0.965
        p.vx *= drag
        p.vy *= drag
        p.x += p.vx * dt * 6
        p.y += p.vy * dt * 6
        const hit = inside(p.x, p.y)
        const floorY = p.x > -BX && p.x < BX ? (p.x < 0 ? 104 + (p.x / -BX) * 22 : 100 + (p.x / BX) * 12) : BBOT
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
        }
        // settle on the snow mound when the bottle is upright-ish
        if (Math.abs(s.th) < 0.6 && p.y > floorY) {
          p.y = floorY
          p.vy = Math.min(p.vy, 0)
          p.vx *= 0.9
        }
        p.a += p.va + p.vx * 0.01
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, CW, CH)
      const ox = CW / 2
      const oy = CH / 2 - 6
      // shadow on the table
      ctx.save()
      ctx.translate(ox + Math.sin(s.th) * 30, CH - 22)
      const sh = ctx.createRadialGradient(0, 0, 4, 0, 0, 110)
      sh.addColorStop(0, 'rgba(70,40,10,0.32)')
      sh.addColorStop(1, 'rgba(70,40,10,0)')
      ctx.fillStyle = sh
      ctx.scale(1 + Math.abs(Math.sin(s.th)) * 0.4, 0.16)
      ctx.beginPath()
      ctx.arc(0, 0, 110, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      ctx.save()
      ctx.translate(ox, oy)
      ctx.rotate(s.th)
      // glass silhouette
      const glass = new Path2D()
      glass.moveTo(-28, -128)
      glass.lineTo(28, -128)
      glass.lineTo(28, -104)
      glass.bezierCurveTo(28, -88, 86, -92, 86, -50)
      glass.lineTo(86, 118)
      glass.quadraticCurveTo(86, 142, 62, 142)
      glass.lineTo(-62, 142)
      glass.quadraticCurveTo(-86, 142, -86, 118)
      glass.lineTo(-86, -50)
      glass.bezierCurveTo(-86, -92, -28, -88, -28, -104)
      glass.closePath()
      // water and back of the glass
      const water = ctx.createLinearGradient(-86, 0, 86, 0)
      water.addColorStop(0, 'rgba(205,225,230,0.55)')
      water.addColorStop(0.5, 'rgba(240,248,250,0.25)')
      water.addColorStop(1, 'rgba(190,212,220,0.55)')
      ctx.fillStyle = water
      ctx.fill(glass)
      ctx.save()
      ctx.clip(glass)
      ctx.drawImage(tree, -BX, BTOP, 2 * BX, BBOT - BTOP)
      for (const p of parts) {
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.a)
        if (p.kind) {
          ctx.fillStyle = p.tint > 0.5 ? 'rgba(248,170,195,0.95)' : 'rgba(255,205,220,0.95)'
          ctx.beginPath()
          ctx.ellipse(0, 0, p.s, p.s * 0.55 * (0.6 + Math.abs(Math.sin(p.a * 2)) * 0.4), 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = 'rgba(210,90,130,0.35)'
          ctx.beginPath()
          ctx.ellipse(p.s * 0.4, 0, p.s * 0.35, p.s * 0.2, 0, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.95)'
          ctx.beginPath()
          ctx.arc(0, 0, p.s, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }
      ctx.restore()
      // glass: rim light, highlights, thickness
      ctx.lineWidth = 3
      ctx.strokeStyle = 'rgba(255,255,255,0.75)'
      ctx.stroke(glass)
      ctx.lineWidth = 1
      ctx.strokeStyle = 'rgba(80,110,120,0.45)'
      ctx.stroke(glass)
      const hl = ctx.createLinearGradient(-86, 0, -40, 0)
      hl.addColorStop(0, 'rgba(255,255,255,0)')
      hl.addColorStop(0.35, 'rgba(255,255,255,0.65)')
      hl.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = hl
      ctx.beginPath()
      ctx.roundRect(-74, -40, 16, 160, 8)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.beginPath()
      ctx.roundRect(56, -30, 7, 120, 4)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.beginPath()
      ctx.ellipse(-46, -74, 16, 5, -0.5, 0, Math.PI * 2)
      ctx.fill()
      // cork
      const cork = ctx.createLinearGradient(-30, 0, 30, 0)
      cork.addColorStop(0, '#9c6b3f')
      cork.addColorStop(0.45, '#d0a272')
      cork.addColorStop(1, '#8a5a32')
      ctx.fillStyle = cork
      ctx.beginPath()
      ctx.roundRect(-24, -156, 48, 34, 5)
      ctx.fill()
      ctx.fillStyle = 'rgba(70,40,20,0.35)'
      for (let i = 0; i < 14; i++) {
        ctx.beginPath()
        ctx.arc(-18 + ((i * 37) % 36), -150 + ((i * 53) % 26), 1.2, 0, Math.PI * 2)
        ctx.fill()
      }
      // twine
      ctx.strokeStyle = '#c9a26b'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(-29, -110)
      ctx.lineTo(29, -112)
      ctx.moveTo(-29, -106)
      ctx.lineTo(29, -108)
      ctx.stroke()
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
