import { useEffect, useRef, useState } from 'react'
import table from '../assets/stamps/table.webp'
import notebook from '../assets/stamps/notebook.webp'
import tin from '../assets/stamps/tin.webp'
import { STAMP_DEFS, TABLE_ASPECT, type StampDef } from './stampsData'
import { sfx } from './sound'

// Neha's hand-carved eraser stamps, photographed on her table. Each one is cut out of the photo
// so it can be picked up on its own; pressing it on the notebook leaves its real print, cut from a
// sheet of test prints she made with the same stamps. Her real ink pads sit beside the notebook:
// tap one to change the ink. The eraser rubs the page clean from top to bottom.
// The stamps start packed away in their tin, which sits on the table beside the notebook: tip it
// and they pour out onto the table; tap it again and they all fly back in.
const STAMP_IMG = import.meta.glob('../assets/stamps/stamp-*.webp', { eager: true, import: 'default' }) as Record<string, string>
const INK_IMG = import.meta.glob('../assets/stamps/ink-*.webp', { eager: true, import: 'default' }) as Record<string, string>
const stampSrc = (s: StampDef) => STAMP_IMG[`../assets/stamps/stamp-${String(s.id).padStart(2, '0')}.webp`]
const inkSrc = (s: StampDef) => INK_IMG[`../assets/stamps/ink-${s.ink}.webp`]

// the ink pads in the notebook photo (centre and size in % of the photo)
const PADS = [
  { name: 'Chocolate brown', color: '#5b3322', x: 27.8, y: 29.5, w: 17, h: 34, r: -28 },
  { name: 'Teal green', color: '#1f5f55', x: 49.4, y: 23, w: 15, h: 18.5, r: 18 },
  { name: 'Wine red', color: '#6d1f2c', x: 18.3, y: 61.5, w: 16, h: 18.5, r: 16 },
]
// the open notebook's pages, where ink can land (% of the photo)
const PAGES = [[37, 15.7], [98.4, 17.7], [99.4, 91.7], [15.3, 92.5], [16.1, 49]]
const inPages = (x: number, y: number) => {
  let inside = false
  for (let i = 0, j = PAGES.length - 1; i < PAGES.length; j = i++) {
    const [xi, yi] = PAGES[i]
    const [xj, yj] = PAGES[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
// a print's width, as % of the photo's width, per pixel on the test sheet
const PER_PX = 0.105
const MAX_PX = 210
const ERASE_MS = 1900

type Print = { k: number; src: string; x: number; y: number; r: number; w: number; ar: number; o: number; c: string }
type Press = { k: number; x: number; y: number; w: number; ar: number; r: number }

export function Stamps() {
  const [prints, setPrints] = useState<Print[]>([])
  const [press, setPress] = useState<Press[]>([])
  const [wipe, setWipe] = useState<number | null>(null)
  const [ink, setInk] = useState(2)
  const [held, setHeld] = useState<number | null>(null)
  const n = useRef(0)
  const erasing = wipe !== null
  // in: packed in the tin; pouring: flying out; out: on the table; packing: flying back in
  const [phase, setPhase] = useState<'in' | 'pouring' | 'out' | 'packing'>('in')
  const [fly, setFly] = useState<[number, number, number][]>([])
  const trayRef = useRef<HTMLDivElement>(null)
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const poured = phase !== 'in'

  // every stamp travels between its spot and the mouth of the tin, in the middle of the table
  const aim = () => {
    const r = trayRef.current!.getBoundingClientRect()
    setFly(STAMP_DEFS.map((d) => [r.width * (0.5 - (d.x + d.w / 2) / 100), r.height * (0.42 - (d.y + d.h / 2) / 100), (Math.random() - 0.5) * 540]))
  }
  const toggleTin = () => {
    if (phase === 'in') {
      aim()
      setPhase('pouring')
      sfx.glass()
      for (let i = 0; i < 6; i++) window.setTimeout(() => sfx.clack(), 380 + i * 140 + Math.random() * 60)
      timer.current = window.setTimeout(() => setPhase('out'), 300 + STAMP_DEFS.length * 38 + 800)
    } else if (phase === 'out') {
      aim()
      setHeld(null)
      setPhase('packing')
      for (let i = 0; i < 6; i++) window.setTimeout(() => sfx.clack(), 650 + i * 130 + Math.random() * 60)
      timer.current = window.setTimeout(() => {
        setPhase('in')
        sfx.glass()
      }, 600 + STAMP_DEFS.length * 25 + 650)
    }
  }

  const pick = (s: StampDef) => {
    setHeld((h) => (h === s.id ? null : s.id))
    sfx.clack()
  }

  const stampAt = (e: React.MouseEvent<HTMLDivElement>) => {
    if (erasing || held === null) return
    const s = STAMP_DEFS[held]
    const box = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - box.left) / box.width) * 100
    const y = ((e.clientY - box.top) / box.height) * 100
    if (!inPages(x, y)) return
    const k = n.current++
    const r = (Math.random() - 0.5) * 10
    const scale = Math.min(1, MAX_PX / Math.max(s.iw, s.ih))
    const w = s.iw * scale * PER_PX * (0.97 + Math.random() * 0.06)
    const ar = s.iw / s.ih
    setPress((p) => [...p, { k, x, y, w, ar, r }])
    window.setTimeout(() => {
      sfx.stamp()
      setPrints((p) => [...p.slice(-80), { k, src: inkSrc(s), x, y, r, w, ar, o: 0.8 + Math.random() * 0.18, c: PADS[ink].color }])
    }, 330)
    window.setTimeout(() => setPress((p) => p.filter((q) => q.k !== k)), 760)
  }

  const erase = () => {
    if (erasing || prints.length === 0) return
    for (let i = 0; i < 9; i++) sfx.rub(i * 0.2)
    const t0 = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / ERASE_MS)
      setWipe(t)
      if (t < 1) requestAnimationFrame(step)
      else {
        setPrints([])
        setWipe(null)
      }
    }
    requestAnimationFrame(step)
  }

  const heldDef = held === null ? null : STAMP_DEFS[held]
  // the eraser sweeps down the pages; everything above its edge is already rubbed out
  const edge = wipe === null ? 0 : 12 + wipe * 86

  return (
    <figure className="stamps">
      <div className="stamps-desk">
        <div className={`stamps-book${heldDef ? ' is-ready' : ''}`} onClick={stampAt}>
          <img className="stamps-book-photo" src={notebook} alt="An open notebook with three ink pads beside it" draggable={false} />
          <div
            className="stamps-ink"
            style={erasing ? { WebkitMaskImage: `linear-gradient(to bottom, transparent ${edge - 3}%, #000 ${edge + 3}%)`, maskImage: `linear-gradient(to bottom, transparent ${edge - 3}%, #000 ${edge + 3}%)` } : undefined}
          >
            {prints.map((p) => (
              <span
                key={p.k}
                className="stamps-print"
                style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, aspectRatio: p.ar, transform: `translate(-50%, -50%) rotate(${p.r}deg)`, opacity: p.o, background: p.c, WebkitMaskImage: `url(${p.src})`, maskImage: `url(${p.src})` }}
                aria-hidden="true"
              />
            ))}
          </div>
          {press.map((p) => (
            <span key={p.k} className="stamps-block" style={{ left: `${p.x}%`, top: `${p.y}%`, width: `calc(${p.w}% + 12px)`, aspectRatio: p.ar, ['--r' as string]: `${p.r}deg` }} aria-hidden="true" />
          ))}
          {PADS.map((pad, i) => (
            <button
              type="button"
              key={pad.name}
              className={`stamps-padhit${ink === i ? ' is-on' : ''}`}
              style={{ left: `${pad.x}%`, top: `${pad.y}%`, width: `${pad.w}%`, height: `${pad.h}%`, transform: `translate(-50%, -50%) rotate(${pad.r}deg)` }}
              onClick={(e) => {
                e.stopPropagation()
                setInk(i)
                sfx.clack()
              }}
              aria-pressed={ink === i}
              aria-label={`${pad.name} ink`}
            />
          ))}
          {erasing && <span className="stamps-eraser is-wiping" style={{ top: `${edge}%`, left: `${56 + Math.sin(wipe! * 40) * 22}%` }} aria-hidden="true" />}
          {prints.length === 0 && !erasing && (
            <p className="stamps-empty">{heldDef ? `Now press the ${heldDef.name.toLowerCase()} on the page.` : poured ? 'Pick up a stamp from the table.' : 'Open the tin of stamps.'}</p>
          )}
        </div>
        <div className="stamps-tray" ref={trayRef} style={{ aspectRatio: TABLE_ASPECT }}>
          <img className="stamps-table" src={table} alt="" draggable={false} />
          {phase !== 'in' &&
            STAMP_DEFS.map((s) => (
              <span
                key={s.id}
                className={`stamps-piece${held === s.id ? ' is-held' : ''}${phase === 'pouring' ? ' is-pouring' : phase === 'packing' ? ' is-packing' : ''}`}
                style={{
                  left: `${s.x}%`, top: `${s.y}%`, width: `${s.w}%`, height: `${s.h}%`,
                  ['--fx' as string]: `${fly[s.id]?.[0] ?? 0}px`, ['--fy' as string]: `${fly[s.id]?.[1] ?? 0}px`, ['--fr' as string]: `${fly[s.id]?.[2] ?? 0}deg`,
                  ['--d' as string]: `${phase === 'packing' ? 600 + (STAMP_DEFS.length - 1 - s.id) * 25 : 300 + s.id * 38}ms`,
                }}
              >
                <button
                  type="button"
                  className="stamps-hit"
                  style={{ clipPath: `polygon(${s.poly.map(([x, y]) => `${x}% ${y}%`).join(', ')})` }}
                  onClick={() => pick(s)}
                  disabled={phase !== 'out'}
                  aria-pressed={held === s.id}
                  aria-label={`Pick up the ${s.name} stamp`}
                />
                <img src={stampSrc(s)} alt="" draggable={false} />
              </span>
            ))}
          <button
            type="button"
            className={`stamps-tin${phase === 'out' ? ' is-corner' : ''}${phase === 'pouring' || phase === 'packing' ? ' is-tipped' : ''}`}
            onClick={toggleTin}
            aria-label={phase === 'in' ? 'Open the tin and pour out the stamps' : 'Put the stamps back in the tin'}
          >
            <img src={tin} alt="" draggable={false} />
          </button>
        </div>
      </div>
      <figcaption className="stamps-bar">
        <span className="stamps-now">
          <i style={{ background: PADS[ink].color }} aria-hidden="true" /> {PADS[ink].name} ink
        </span>
        <button type="button" className="stamps-erase" onClick={erase} disabled={erasing || prints.length === 0} aria-label="Erase the page">
          <svg viewBox="0 0 40 24" aria-hidden="true">
            <path d="M6 4 h22 l8 8 l-8 8 h-22 a3 3 0 0 1 -3 -3 v-10 a3 3 0 0 1 3 -3z" fill="#f2a2ae" />
            <path d="M18 4 h10 l8 8 l-8 8 h-10z" fill="#3c6fb5" />
            <path d="M6 4 h22" stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" />
          </svg>
          Erase
        </button>
      </figcaption>
    </figure>
  )
}
