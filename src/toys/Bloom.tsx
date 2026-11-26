import { useEffect, useRef, useState } from 'react'
import { sfx } from './sound'

// A lotus bud in a terracotta pot. Press and hold, and it opens; let go too early and it closes again.
// Once it has fully opened it stays open and breathes.
type Petal = { ring: number; a: number; len: number; w: number; z: number }

const PETALS: Petal[] = [
  // back ring (drawn first)
  ...[-78, -52, -26, 26, 52, 78].map((a, i) => ({ ring: 0, a, len: 86, w: 34, z: i })),
  // middle ring
  ...[-58, -30, 30, 58].map((a, i) => ({ ring: 1, a, len: 80, w: 36, z: 10 + i })),
  // inner, front
  ...[-34, -12, 12, 34].map((a, i) => ({ ring: 2, a, len: 70, w: 32, z: 20 + i })),
  { ring: 3, a: 0, len: 66, w: 34, z: 30 },
]

function petalPath(len: number, w: number) {
  // a lotus petal: wide belly, pointed tip, drawn upward from (0,0)
  return `M0 0 C ${-w * 0.9} ${-len * 0.25}, ${-w * 0.75} ${-len * 0.78}, 0 ${-len} C ${w * 0.75} ${-len * 0.78}, ${w * 0.9} ${-len * 0.25}, 0 0 Z`
}

export function Bloom() {
  const [p, setP] = useState(0)
  const [held, setHeld] = useState(false)
  const [done, setDone] = useState(false)
  const prog = useRef(0)
  const holding = useRef(false)
  const raf = useRef(0)
  const t = useRef(0)
  const [, force] = useState(0)

  useEffect(() => {
    let last = performance.now()
    const tick = (now: number) => {
      raf.current = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      t.current += dt
      let v = prog.current
      if (holding.current && v < 1) v = Math.min(1, v + dt / 2.6)
      else if (!holding.current && v < 1 && v > 0) v = Math.max(0, v - dt / 3.2)
      if (v !== prog.current) {
        prog.current = v
        setP(v)
        if (v >= 1 && !done) {
          setDone(true)
          sfx.chime()
        }
      } else if (v >= 1) force((n) => (n + 1) % 1000)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [done])

  const start = (e: React.PointerEvent) => {
    e.preventDefault()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    holding.current = true
    setHeld(true)
  }
  const stop = () => {
    holding.current = false
    setHeld(false)
  }

  const ease = (x: number) => x * x * (3 - 2 * x)
  const ringP = (ring: number) => ease(Math.min(1, Math.max(0, (p - ring * 0.12) / (1 - ring * 0.12))))
  const sway = p >= 1 ? Math.sin(t.current * 1.3) * 2.2 : held ? Math.sin(t.current * 38) * 0.8 : 0

  return (
    <figure className="bloom">
      <button
        type="button"
        className={`bloom-hit${held ? ' is-held' : ''}${p >= 1 ? ' is-open' : ''}`}
        onPointerDown={start}
        onPointerUp={stop}
        onPointerCancel={stop}
        onPointerLeave={stop}
        onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && ((holding.current = true), setHeld(true))}
        onKeyUp={stop}
        aria-label={p >= 1 ? 'The lotus is in bloom' : 'Press and hold to make the bud bloom'}
      >
        <svg viewBox="0 0 240 300" aria-hidden="true">
          <defs>
            <linearGradient id="bl-petal" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#fff6ef" />
              <stop offset="0.45" stopColor="#ffd3dc" />
              <stop offset="0.85" stopColor="#f58aa6" />
              <stop offset="1" stopColor="#e2577e" />
            </linearGradient>
            <linearGradient id="bl-petal-back" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#f6dccf" />
              <stop offset="0.6" stopColor="#efa4b6" />
              <stop offset="1" stopColor="#cf4f73" />
            </linearGradient>
            <radialGradient id="bl-pot" cx="35%" cy="30%" r="80%">
              <stop offset="0" stopColor="#e08a5c" />
              <stop offset="0.6" stopColor="#b85c38" />
              <stop offset="1" stopColor="#7d3a20" />
            </radialGradient>
            <linearGradient id="bl-leaf" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#6c9a3c" />
              <stop offset="1" stopColor="#2f5a2a" />
            </linearGradient>
            <radialGradient id="bl-pod" cx="50%" cy="40%" r="60%">
              <stop offset="0" stopColor="#f8e27a" />
              <stop offset="1" stopColor="#c9a12a" />
            </radialGradient>
          </defs>
          {/* stem and leaves */}
          <path d="M120 236 C 118 200, 124 176, 120 150" stroke="#4f7a2f" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M120 214 C 96 206, 70 212, 54 228 C 78 236, 104 232, 120 214 Z" fill="url(#bl-leaf)" />
          <path d="M121 222 C 146 210, 174 214, 190 226 C 166 238, 138 236, 121 222 Z" fill="url(#bl-leaf)" />
          <path d="M120 214 C 98 214, 76 220, 60 228 M121 222 C 144 220, 166 222, 186 226" stroke="rgba(255,255,255,0.25)" strokeWidth="1" fill="none" />
          {/* the flower, rooted at (120,150) */}
          <g transform={`translate(120 152) rotate(${sway})`}>
            {p > 0.55 && (
              <g opacity={Math.min(1, (p - 0.55) * 3)}>
                <ellipse cx="0" cy="-22" rx="18" ry="9" fill="url(#bl-pod)" />
                {Array.from({ length: 22 }, (_, i) => {
                  const a = (i / 21) * Math.PI - Math.PI
                  return <line key={i} x1={Math.cos(a) * 12} y1={-22 + Math.sin(a) * 6} x2={Math.cos(a) * 21} y2={-26 + Math.sin(a) * 13} stroke="#e6b62d" strokeWidth="1.6" strokeLinecap="round" />
                })}
              </g>
            )}
            {PETALS.map((pt, i) => {
              const rp = ringP(pt.ring)
              // closed: petals hug the centre line; open: they fan out to their angle
              const closedA = pt.a * 0.08
              const a = closedA + (pt.a - closedA) * rp
              const breathe = p >= 1 ? Math.sin(t.current * 1.1 + i) * 1.2 : 0
              const sx = 0.62 + 0.38 * rp
              return (
                <g key={i} transform={`rotate(${a + breathe}) scale(${sx} 1)`}>
                  <path d={petalPath(pt.len, pt.w)} fill={pt.ring === 0 ? 'url(#bl-petal-back)' : 'url(#bl-petal)'} stroke="rgba(170,50,80,0.25)" strokeWidth="0.8" />
                  <path d={`M0 -4 L0 ${-pt.len + 8} M0 ${-pt.len * 0.3} C ${-pt.w * 0.3} ${-pt.len * 0.5}, ${-pt.w * 0.25} ${-pt.len * 0.7}, 0 ${-pt.len + 6} M0 ${-pt.len * 0.3} C ${pt.w * 0.3} ${-pt.len * 0.5}, ${pt.w * 0.25} ${-pt.len * 0.7}, 0 ${-pt.len + 6}`} stroke="rgba(200,70,100,0.22)" strokeWidth="0.7" fill="none" />
                </g>
              )
            })}
          </g>
          {/* pot */}
          <path d="M70 236 H170 L160 292 H80 Z" fill="url(#bl-pot)" />
          <rect x="64" y="228" width="112" height="16" rx="3" fill="#c46a43" />
          <rect x="64" y="228" width="112" height="5" rx="2" fill="rgba(255,220,190,0.35)" />
          <path d="M84 250 L90 286" stroke="rgba(255,255,255,0.12)" strokeWidth="5" strokeLinecap="round" />
        </svg>
        {p > 0 && p < 1 && (
          <svg className="bloom-ring" viewBox="0 0 40 40" aria-hidden="true">
            <circle cx="20" cy="20" r="16" />
            <circle cx="20" cy="20" r="16" className="on" style={{ strokeDashoffset: 100.5 * (1 - p) }} />
          </svg>
        )}
      </button>
      <figcaption>{p >= 1 ? 'In bloom.' : p > 0 ? 'Keep holding…' : 'Press and hold the bud.'}</figcaption>
    </figure>
  )
}
