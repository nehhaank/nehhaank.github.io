import { useEffect, useRef, useState } from 'react'
import sprite from '../assets/craft/jasmine-bloom.webp'
import { sfx } from './sound'

// A real jasmine opening, frame by frame. Press and hold, and it opens;
// let go too early and it closes again. Once it has fully opened it stays open.
// The frames come from a video of a blooming jasmine: one flower, steadied, cut out of the
// background and laid out as a sprite sheet of COLS × ROWS tiles, FRAMES of them used, bud first.
// Neighbouring frames are crossfaded so the opening stays fluid at any speed.
const COLS = 10
const ROWS = 7
const FRAMES = 69

function tile(f: number): React.CSSProperties {
  const col = f % COLS
  const row = Math.floor(f / COLS)
  return {
    backgroundImage: `url(${sprite})`,
    backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
    backgroundPosition: `${(col / (COLS - 1)) * 100}% ${(row / (ROWS - 1)) * 100}%`,
  }
}

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

  // With a mouse, the bud opens while the cursor rests on it. On touch screens there is no hover,
  // so it opens while a finger is held on it instead.
  const canHover = typeof window !== 'undefined' && window.matchMedia?.('(hover: hover)').matches
  const begin = () => {
    holding.current = true
    setHeld(true)
  }
  const stop = () => {
    holding.current = false
    setHeld(false)
  }
  const onEnter = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' || e.pointerType === 'pen') begin()
  }
  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return
    e.preventDefault()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    begin()
  }
  const onUp = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') stop()
  }

  const ease = (x: number) => x * x * (3 - 2 * x)
  const pos = ease(p) * (FRAMES - 1)
  const f0 = Math.floor(pos)
  const f1 = Math.min(FRAMES - 1, f0 + 1)
  const mix = pos - f0

  return (
    <figure className="bloom">
      <button
        type="button"
        className={`bloom-hit${held ? ' is-held' : ''}${p >= 1 ? ' is-open' : ''}`}
        onPointerEnter={onEnter}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={stop}
        onPointerLeave={stop}
        onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && ((holding.current = true), setHeld(true))}
        onKeyUp={stop}
        aria-label={p >= 1 ? 'The jasmine is in bloom' : canHover ? 'Hover over the bud to make the jasmine bloom' : 'Touch and hold to make the jasmine bloom'}
      >
        <span className="bloom-photo" aria-hidden="true">
          <span className="bloom-frame" style={tile(f0)} />
          <span className="bloom-frame" style={{ ...tile(f1), opacity: mix }} />
        </span>
        {p > 0 && p < 1 && (
          <svg className="bloom-ring" viewBox="0 0 40 40" aria-hidden="true">
            <circle cx="20" cy="20" r="16" />
            <circle cx="20" cy="20" r="16" className="on" style={{ strokeDashoffset: 100.5 * (1 - p) }} />
          </svg>
        )}
      </button>
      <figcaption>{p >= 1 ? 'In bloom.' : p > 0 ? (canHover ? 'Stay a while…' : 'Keep holding…') : canHover ? 'Rest your cursor on the bud.' : 'Touch and hold the bud.'}</figcaption>
    </figure>
  )
}
