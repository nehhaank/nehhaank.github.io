import { useEffect, useRef, useState } from 'react'
import { sfx } from './sound'

// A champak bud in a terracotta pot, drawn from a photo of a real one. Press and hold, and it opens;
// let go too early and it closes again. Once it has fully opened it stays open and breathes.
type Petal = { ring: number; a: number; len: number; w: number; curl: number }

const PETALS: Petal[] = [
  // outer petals, drawn first: they open widest and their tips curl back
  ...[-104, -74, 74, 104].map((a, i) => ({ ring: 0, a, len: 84, w: 34, curl: i < 2 ? -1 : 1 })),
  // middle petals
  ...[-54, -28, 28, 54].map((a, i) => ({ ring: 1, a, len: 84, w: 36, curl: i < 2 ? -1 : 1 })),
  // inner, front
  ...[-16, 14].map((a, i) => ({ ring: 2, a, len: 76, w: 36, curl: i ? 1 : -1 })),
  { ring: 3, a: -2, len: 68, w: 38, curl: 1 },
]

function petalPath(len: number, w: number, c: number) {
  // a champak petal: narrow base, full shoulders, a pointed tip that leans to one side
  const tx = c * w * 0.28
  return `M0 0 C ${-w * 0.55} ${-len * 0.12}, ${-w * 0.95} ${-len * 0.55}, ${-w * 0.45 + tx * 0.4} ${-len * 0.82} C ${-w * 0.2 + tx * 0.6} ${-len * 0.93}, ${tx * 0.8} ${-len * 0.97}, ${tx} ${-len} C ${w * 0.25 + tx * 0.6} ${-len * 0.9}, ${w * 0.6 + tx * 0.3} ${-len * 0.8}, ${w * 0.7} ${-len * 0.6} C ${w * 0.95} ${-len * 0.4}, ${w * 0.5} ${-len * 0.1}, 0 0 Z`
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
      const dt = Math.min(0.25, (now - last) / 1000)
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
        aria-label={p >= 1 ? 'The champak is in bloom' : 'Press and hold to make the bud bloom'}
      >
        <svg viewBox="0 0 240 300" aria-hidden="true">
          <defs>
            <linearGradient id="bl-petal" x1="0" y1="1" x2="0.2" y2="0">
              <stop offset="0" stopColor="#d98a1f" />
              <stop offset="0.35" stopColor="#f6bf3c" />
              <stop offset="0.75" stopColor="#ffd865" />
              <stop offset="1" stopColor="#fbe58a" />
            </linearGradient>
            <linearGradient id="bl-petal-back" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#b85f0b" />
              <stop offset="0.5" stopColor="#e3962a" />
              <stop offset="1" stopColor="#f6c04a" />
            </linearGradient>
            <radialGradient id="bl-shine" cx="35%" cy="55%" r="55%">
              <stop offset="0" stopColor="rgba(255,250,215,0.55)" />
              <stop offset="1" stopColor="rgba(255,250,215,0)" />
            </radialGradient>
            <radialGradient id="bl-pot" cx="35%" cy="30%" r="80%">
              <stop offset="0" stopColor="#e08a5c" />
              <stop offset="0.6" stopColor="#b85c38" />
              <stop offset="1" stopColor="#7d3a20" />
            </radialGradient>
            <linearGradient id="bl-leaf" x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0" stopColor="#7fae35" />
              <stop offset="0.55" stopColor="#4f7a12" />
              <stop offset="1" stopColor="#354113" />
            </linearGradient>
            <radialGradient id="bl-pod" cx="50%" cy="40%" r="60%">
              <stop offset="0" stopColor="#e4e07a" />
              <stop offset="1" stopColor="#9aa33a" />
            </radialGradient>
          </defs>
          {/* stem and glossy champak leaves */}
          <path d="M120 236 C 118 204, 126 180, 122 150" stroke="#5b6d1c" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <g transform="translate(119 206) rotate(-14)">
            <path d="M0 0 C -14 -22, -58 -30, -84 -8 C -60 16, -16 14, 0 0 Z" fill="url(#bl-leaf)" />
            <path d="M0 0 C -26 -8, -54 -10, -82 -8" stroke="rgba(230,240,180,0.7)" strokeWidth="1.1" fill="none" />
            {[-16, -32, -48, -62].map((x) => <path key={x} d={`M${x} ${-4 - x * 0.04} q -8 -8 -14 -12 M${x} ${-4 - x * 0.04} q -8 6 -14 9`} stroke="rgba(220,235,170,0.35)" strokeWidth="0.7" fill="none" />)}
            <path d="M-12 -12 C -30 -22, -52 -22, -66 -14" stroke="rgba(255,255,230,0.35)" strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>
          <g transform="translate(122 220) rotate(196) scale(0.72)">
            <path d="M0 0 C -14 -22, -58 -30, -84 -8 C -60 16, -16 14, 0 0 Z" fill="url(#bl-leaf)" />
            <path d="M0 0 C -26 -8, -54 -10, -82 -8" stroke="rgba(230,240,180,0.6)" strokeWidth="1.2" fill="none" />
          </g>
          <ellipse cx="122" cy="150" rx="7" ry="5" fill="#6d7a22" />
          {/* the flower, rooted at (120,150) */}
          <g transform={`translate(120 152) rotate(${sway})`}>
            {p > 0.5 && (
              <g opacity={Math.min(1, (p - 0.5) * 3)}>
                {Array.from({ length: 18 }, (_, i) => {
                  const a = (i / 17) * Math.PI - Math.PI
                  return <line key={i} x1={Math.cos(a) * 6} y1={-12 + Math.sin(a) * 3} x2={Math.cos(a) * 15} y2={-14 + Math.sin(a) * 10} stroke="#c9741a" strokeWidth="1.8" strokeLinecap="round" />
                })}
                <path d="M-6 -12 C -7 -30, -2 -44, 0 -46 C 2 -44, 7 -30, 6 -12 Z" fill="url(#bl-pod)" />
                {[-38, -32, -26, -20].map((y) => <path key={y} d={`M-4 ${y} l 4 -3 l 4 3`} stroke="rgba(90,100,20,0.5)" strokeWidth="0.7" fill="none" />)}
              </g>
            )}
            {PETALS.map((pt, i) => {
              const rp = ringP(pt.ring)
              // closed: petals cup together into the bud from the photo; open: they splay out and the outer ones droop
              const closedA = pt.a * 0.1
              const a = closedA + (pt.a - closedA) * rp
              const breathe = p >= 1 ? Math.sin(t.current * 1.1 + i) * 1.2 : 0
              const sx = 0.82 - 0.34 * rp
              const sy = 1 - (pt.ring === 0 ? 0.14 : pt.ring === 3 ? 0.3 : 0.04) * rp
              return (
                <g key={i} transform={`rotate(${a + breathe}) scale(${sx} ${sy})`}>
                  <path d={petalPath(pt.len, pt.w, pt.curl * (0.3 + rp))} fill={pt.ring === 0 ? 'url(#bl-petal-back)' : 'url(#bl-petal)'} stroke="rgba(150,80,10,0.22)" strokeWidth="0.6" />
                  <path d={petalPath(pt.len * 0.8, pt.w * 0.55, pt.curl)} fill="url(#bl-shine)" transform={`translate(${-pt.curl * 3} -6)`} />
                  <path d={`M0 -6 C ${pt.curl * 2} ${-pt.len * 0.4}, ${pt.curl * 3} ${-pt.len * 0.7}, ${pt.curl * pt.w * 0.2} ${-pt.len + 10}`} stroke="rgba(190,110,20,0.16)" strokeWidth="0.8" fill="none" />
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
