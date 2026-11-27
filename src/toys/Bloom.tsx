import { useEffect, useRef, useState } from 'react'
import sprite from '../assets/craft/jasmine-bloom.webp'
import { sfx } from './sound'

// A real jasmine opening, frame by frame. Press and hold, and it opens;
// let go too early and it closes again. Once it has fully opened it stays open.
// The frames come from a video of a blooming jasmine, steadied on one flower and laid out
// as a sprite sheet: COLS × ROWS tiles, FRAMES of them used, bud first.
const COLS = 8
const ROWS = 6
const FRAMES = 46

export function Bloom() {
  const [p, setP] = useState(0)
  const [held, setHeld] = useState(false)
  const [done, setDone] = useState(false)
  const prog = useRef(0)
  const holding = useRef(false)
  const raf = useRef(0)

  useEffect(() => {
    let last = performance.now()
    const tick = (now: number) => {
      raf.current = requestAnimationFrame(tick)
      const dt = Math.min(0.25, (now - last) / 1000)
      last = now
      let v = prog.current
      if (holding.current && v < 1) v = Math.min(1, v + dt / 2.8)
      else if (!holding.current && v < 1 && v > 0) v = Math.max(0, v - dt / 3.2)
      if (v !== prog.current) {
        prog.current = v
        setP(v)
        if (v >= 1 && !done) {
          setDone(true)
          sfx.chime()
        }
      }
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

  const f = Math.round(p * (FRAMES - 1))
  const col = f % COLS
  const row = Math.floor(f / COLS)

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
        aria-label={p >= 1 ? 'The jasmine is in bloom' : 'Press and hold to make the jasmine bloom'}
      >
        <span
          className="bloom-photo"
          aria-hidden="true"
          style={{
            backgroundImage: `url(${sprite})`,
            backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
            backgroundPosition: `${(col / (COLS - 1)) * 100}% ${(row / (ROWS - 1)) * 100}%`,
          }}
        />
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
