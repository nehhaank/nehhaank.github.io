import { useRef, useState } from 'react'
import table from '../assets/stamps/table.webp'
import { STAMP_DEFS, TABLE_ASPECT, type StampDef } from './stampsData'
import { sfx } from './sound'

// Neha's hand-carved eraser stamps, photographed on her table. Each one is cut out of the photo
// so it can be picked up on its own; pressing it on the paper leaves its real print, cut from a
// sheet of test prints she made with the same stamps. The eraser rubs them all out again.
const STAMP_IMG = import.meta.glob('../assets/stamps/stamp-*.webp', { eager: true, import: 'default' }) as Record<string, string>
const INK_IMG = import.meta.glob('../assets/stamps/ink-*.webp', { eager: true, import: 'default' }) as Record<string, string>
const stampSrc = (s: StampDef) => STAMP_IMG[`../assets/stamps/stamp-${String(s.id).padStart(2, '0')}.webp`]
const inkSrc = (s: StampDef) => INK_IMG[`../assets/stamps/ink-${s.ink}.webp`]

const INKS = ['#8b1e2d', '#232a63', '#1f4d34']
// a print's width on the paper, as % of the paper's width, per pixel on the test sheet
const PER_PX = 0.13
const MAX_PX = 210

type Print = { k: number; src: string; x: number; y: number; r: number; w: number; ar: number; o: number; c: string }
type Press = { k: number; x: number; y: number; w: number; ar: number; r: number }

export function Stamps() {
  const [prints, setPrints] = useState<Print[]>([])
  const [press, setPress] = useState<Press[]>([])
  const [erasing, setErasing] = useState(false)
  const [ink, setInk] = useState(0)
  const [held, setHeld] = useState<number | null>(null)
  const n = useRef(0)

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
    const k = n.current++
    const r = (Math.random() - 0.5) * 10
    const scale = Math.min(1, MAX_PX / Math.max(s.iw, s.ih))
    const w = s.iw * scale * PER_PX * (0.97 + Math.random() * 0.06)
    const ar = s.iw / s.ih
    setPress((p) => [...p, { k, x, y, w, ar, r }])
    window.setTimeout(() => {
      sfx.stamp()
      setPrints((p) => [...p.slice(-60), { k, src: inkSrc(s), x, y, r, w, ar, o: 0.78 + Math.random() * 0.2, c: INKS[ink] }])
    }, 330)
    window.setTimeout(() => setPress((p) => p.filter((q) => q.k !== k)), 760)
  }

  const erase = () => {
    if (erasing || prints.length === 0) return
    setErasing(true)
    for (let i = 0; i < 7; i++) sfx.rub(i * 0.19)
    window.setTimeout(() => {
      setPrints([])
      setErasing(false)
    }, 1450)
  }

  const heldDef = held === null ? null : STAMP_DEFS[held]

  return (
    <figure className="stamps">
      <div className="stamps-tray" style={{ aspectRatio: TABLE_ASPECT }}>
        <img className="stamps-table" src={table} alt="" draggable={false} />
        {STAMP_DEFS.map((s) => (
          <span
            key={s.id}
            className={`stamps-piece${held === s.id ? ' is-held' : ''}`}
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.w}%`, height: `${s.h}%` }}
          >
            <button
              type="button"
              className="stamps-hit"
              style={{ clipPath: `polygon(${s.poly.map(([x, y]) => `${x}% ${y}%`).join(', ')})` }}
              onClick={() => pick(s)}
              aria-pressed={held === s.id}
              aria-label={`Pick up the ${s.name} stamp`}
            />
            <img src={stampSrc(s)} alt="" draggable={false} />
          </span>
        ))}
      </div>
      <div className={`stamps-paper${erasing ? ' is-erasing' : ''}${heldDef ? ' is-ready' : ''}`} onClick={stampAt}>
        {prints.map((p) => (
          <span
            key={p.k}
            className="stamps-print"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, aspectRatio: p.ar, transform: `translate(-50%, -50%) rotate(${p.r}deg)`, opacity: p.o, background: p.c, WebkitMaskImage: `url(${p.src})`, maskImage: `url(${p.src})` }}
            aria-hidden="true"
          />
        ))}
        {press.map((p) => (
          <span key={p.k} className="stamps-block" style={{ left: `${p.x}%`, top: `${p.y}%`, width: `calc(${p.w}% + 14px)`, aspectRatio: p.ar, ['--r' as string]: `${p.r}deg` }} aria-hidden="true" />
        ))}
        {erasing && (
          <>
            <span className="stamps-eraser" aria-hidden="true" />
            {Array.from({ length: 14 }, (_, i) => (
              <i key={i} className="stamps-crumb" style={{ left: `${10 + Math.random() * 80}%`, top: `${30 + Math.random() * 50}%`, animationDelay: `${0.2 + Math.random() * 1}s` }} aria-hidden="true" />
            ))}
          </>
        )}
        {prints.length === 0 && !erasing && (
          <p className="stamps-empty">{heldDef ? `Now press the ${heldDef.name.toLowerCase()} on the paper.` : 'Pick up a stamp from the table.'}</p>
        )}
      </div>
      <figcaption className="stamps-bar">
        <span className="stamps-inks" role="radiogroup" aria-label="Ink colour">
          {INKS.map((c, i) => (
            <button type="button" key={c} role="radio" aria-checked={ink === i} aria-label={['Red', 'Indigo', 'Green'][i] + ' ink'} className={`stamps-pad${ink === i ? ' is-on' : ''}`} style={{ background: c }} onClick={() => setInk(i)} />
          ))}
        </span>
        <button type="button" className="stamps-erase" onClick={erase} disabled={erasing || prints.length === 0} aria-label="Erase the stamps">
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
