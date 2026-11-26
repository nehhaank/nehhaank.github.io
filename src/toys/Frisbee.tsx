import { useCallback, useEffect, useRef, useState } from 'react'
import { sfx } from './sound'

// A frisbee that lives on the page, not in the viewport. Drag and flick it, or tap it for a long throw,
// and it flies across the document and lands wherever it lands. A chip tells you where to go and find it.
type Pt = { x: number; y: number; t: number }

const SIZE = 84

function sectionAt(y: number) {
  const secs = Array.from(document.querySelectorAll<HTMLElement>('main > section'))
  let name = 'the top'
  for (const s of secs) {
    const r = s.getBoundingClientRect()
    const top = r.top + window.scrollY
    if (y >= top - 40) name = s.dataset.name || name
  }
  return name
}

export function Frisbee() {
  const el = useRef<HTMLDivElement>(null)
  const shadow = useRef<HTMLDivElement>(null)
  const art = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: -999, y: -999, z: 0, spin: 0, tilt: 58, wob: 0 })
  const mode = useRef<'home' | 'drag' | 'fly' | 'rest'>('home')
  const trail = useRef<Pt[]>([])
  const grab = useRef({ dx: 0, dy: 0, sx: 0, sy: 0 })
  const [away, setAway] = useState<null | { where: string; dir: 'up' | 'down' }>(null)
  const [thrown, setThrown] = useState(0)

  const paint = useCallback(() => {
    const p = pos.current
    const d = el.current
    const s = shadow.current
    const a = art.current
    if (!d || !s || !a) return
    const lift = 1 + p.z / 520
    d.style.transform = `translate3d(${p.x - SIZE / 2}px, ${p.y - SIZE / 2 - p.z}px, 0) scale(${lift})`
    a.style.transform = `rotateX(${p.tilt + Math.sin(p.wob) * p.wob * 0.06}deg) rotateZ(${p.spin}deg)`
    const blur = 4 + p.z / 10
    s.style.transform = `translate3d(${p.x - SIZE / 2 + p.z * 0.25}px, ${p.y - SIZE * 0.18 + 6}px, 0) scale(${1 - Math.min(p.z, 300) / 700}, ${0.42 - Math.min(p.z, 300) / 2000})`
    s.style.filter = `blur(${blur}px)`
    s.style.opacity = String(Math.max(0.16, 0.5 - p.z / 600))
  }, [])

  const goHome = useCallback(() => {
    const home = document.querySelector<HTMLElement>('.fris-home')
    if (!home) return
    const r = home.getBoundingClientRect()
    pos.current.x = r.left + r.width / 2 + window.scrollX
    pos.current.y = r.top + r.height / 2 + window.scrollY
    pos.current.z = 0
    paint()
  }, [paint])

  // keep the disc parked on its spot in the hero until it is first thrown
  useEffect(() => {
    goHome()
    const ro = new ResizeObserver(() => mode.current === 'home' && goHome())
    ro.observe(document.body)
    document.fonts?.ready.then(() => mode.current === 'home' && goHome())
    const t = window.setTimeout(() => mode.current === 'home' && goHome(), 600)
    return () => {
      ro.disconnect()
      window.clearTimeout(t)
    }
  }, [goHome])

  // an idle spin while it waits
  useEffect(() => {
    let raf = 0
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const p = pos.current
      if (mode.current === 'home' && !reduce) {
        p.spin += 0.25
        paint()
      }
      if (mode.current === 'rest' && p.wob > 0.05) {
        p.wob *= 0.94
        p.spin += p.wob * 0.4
        paint()
      }
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [paint])

  // where is it, relative to the viewport?
  const check = useCallback(() => {
    if (mode.current !== 'rest') return setAway(null)
    const y = pos.current.y - window.scrollY
    if (y < -SIZE) setAway({ where: sectionAt(pos.current.y), dir: 'up' })
    else if (y > window.innerHeight + SIZE * 0.2) setAway({ where: sectionAt(pos.current.y), dir: 'down' })
    else setAway(null)
  }, [])
  useEffect(() => {
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [check])

  const fly = useCallback(
    (vx: number, vy: number) => {
      const p = pos.current
      const docW = document.documentElement.scrollWidth
      const docH = document.documentElement.scrollHeight
      const speed = Math.hypot(vx, vy)
      const T = Math.min(3.4, Math.max(1.1, speed / 850))
      const sx = p.x
      const sy = p.y
      let tx = sx + vx * T * 0.55
      let ty = sy + vy * T * 0.55
      tx = Math.min(docW - SIZE, Math.max(SIZE, tx))
      ty = Math.min(docH - SIZE * 2, Math.max(SIZE + 60, ty))
      const dist = Math.hypot(tx - sx, ty - sy) || 1
      // a disc banks: bend the path sideways, like a hyzer
      const bend = (Math.random() < 0.5 ? -1 : 1) * Math.min(260, dist * 0.22)
      const nx = -(ty - sy) / dist
      const ny = (tx - sx) / dist
      const cx = (sx + tx) / 2 + nx * bend
      const cy = (sy + ty) / 2 + ny * bend
      const peak = Math.min(170, 40 + dist * 0.09)
      const t0 = performance.now()
      mode.current = 'fly'
      setAway(null)
      setThrown((n) => n + 1)
      sfx.whoosh()
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / (T * 1000))
        const u = 1 - Math.pow(1 - k, 2.2)
        const iu = 1 - u
        p.x = iu * iu * sx + 2 * iu * u * cx + u * u * tx
        p.y = iu * iu * sy + 2 * iu * u * cy + u * u * ty
        p.z = Math.sin(Math.PI * Math.min(1, u * 1.04)) * peak
        p.spin += 26 * (1 - k) + 2
        p.tilt = 58 - Math.sin(Math.PI * u) * 20
        paint()
        if (k < 1) requestAnimationFrame(step)
        else {
          p.z = 0
          p.tilt = 58
          p.wob = 9
          mode.current = 'rest'
          paint()
          sfx.land()
          check()
        }
      }
      requestAnimationFrame(step)
    },
    [paint, check],
  )

  const onDown = (e: React.PointerEvent) => {
    if (mode.current === 'fly') return
    e.preventDefault()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    const p = pos.current
    grab.current = { dx: e.pageX - p.x, dy: e.pageY - p.y, sx: e.pageX, sy: e.pageY }
    trail.current = [{ x: e.pageX, y: e.pageY, t: performance.now() }]
    mode.current = 'drag'
    p.z = 14
    paint()
  }
  const onMove = (e: React.PointerEvent) => {
    if (mode.current !== 'drag') return
    const p = pos.current
    p.x = e.pageX - grab.current.dx
    p.y = e.pageY - grab.current.dy
    p.spin += 2
    trail.current.push({ x: e.pageX, y: e.pageY, t: performance.now() })
    if (trail.current.length > 8) trail.current.shift()
    paint()
  }
  const onUp = (e: React.PointerEvent) => {
    if (mode.current !== 'drag') return
    const tr = trail.current
    const now = performance.now()
    const recent = tr.filter((q) => now - q.t < 110)
    const moved = Math.hypot(e.pageX - grab.current.sx, e.pageY - grab.current.sy)
    if (moved < 6) {
      // a tap: a long throw somewhere further down (or back up) the page
      const docH = document.documentElement.scrollHeight
      const down = pos.current.y < docH * 0.6
      const vy = (down ? 1 : -1) * (1500 + Math.random() * 1400)
      const vx = (Math.random() - 0.5) * 1400
      fly(vx, vy)
      return
    }
    if (recent.length >= 2) {
      const a = recent[0]
      const b = recent[recent.length - 1]
      const dt = Math.max(16, b.t - a.t) / 1000
      let vx = (b.x - a.x) / dt
      let vy = (b.y - a.y) / dt
      const sp = Math.hypot(vx, vy)
      if (sp > 4200) {
        vx *= 4200 / sp
        vy *= 4200 / sp
      }
      if (sp > 250) return fly(vx * 1.6, vy * 1.6)
    }
    pos.current.z = 0
    pos.current.wob = 4
    mode.current = 'rest'
    paint()
    check()
  }

  const find = () => {
    const y = pos.current.y - window.innerHeight / 2
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
    el.current?.classList.remove('is-found')
    window.setTimeout(() => el.current?.classList.add('is-found'), 500)
  }

  return (
    <>
      <div ref={shadow} className="fris-shadow" aria-hidden="true" />
      <div
        ref={el}
        className="fris"
        role="button"
        tabIndex={0}
        aria-label={thrown ? 'Frisbee. Drag and flick to throw it again, or tap for a long throw.' : 'Frisbee. Drag and flick it to throw, or tap for a long throw.'}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            fly((Math.random() - 0.5) * 1200, 2200)
          }
        }}
      >
        <div className="fris-art" ref={art}>
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              <radialGradient id="fr-top" cx="42%" cy="36%" r="70%">
                <stop offset="0" stopColor="#fff3c4" />
                <stop offset="0.35" stopColor="#f6c13a" />
                <stop offset="0.8" stopColor="#e39a14" />
                <stop offset="1" stopColor="#b8730c" />
              </radialGradient>
              <radialGradient id="fr-rim" cx="50%" cy="50%" r="50%">
                <stop offset="0.86" stopColor="rgba(0,0,0,0)" />
                <stop offset="0.93" stopColor="rgba(120,60,0,0.35)" />
                <stop offset="1" stopColor="rgba(255,240,200,0.6)" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="49" fill="url(#fr-top)" />
            <circle cx="50" cy="50" r="49" fill="url(#fr-rim)" />
            <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(110,55,5,0.32)" strokeWidth="1.2" />
            <circle cx="50" cy="50" r="29" fill="none" stroke="rgba(110,55,5,0.22)" strokeWidth="0.8" />
            <path d="M50 30 c4 6 4 10 0 14 c-4 -4 -4 -8 0 -14z M70 50 c-6 4 -10 4 -14 0 c4 -4 8 -4 14 0z M50 70 c-4 -6 -4 -10 0 -14 c4 4 4 8 0 14z M30 50 c6 -4 10 -4 14 0 c-4 4 -8 4 -14 0z" fill="#b8460f" opacity="0.85" />
            <circle cx="50" cy="50" r="3.2" fill="#7a2e08" />
            <ellipse cx="38" cy="28" rx="16" ry="7" fill="rgba(255,255,255,0.35)" transform="rotate(-24 38 28)" />
          </svg>
        </div>
      </div>
      {away && (
        <button type="button" className={`fris-chip is-${away.dir}`} onClick={find}>
          <span className="fris-chip-dot" aria-hidden="true" />
          Your frisbee landed in {away.where}. Go find it {away.dir === 'down' ? '↓' : '↑'}
        </button>
      )}
    </>
  )
}
