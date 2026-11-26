import { useRef, useState } from 'react'
import tray from '../assets/craft/tray.jpg'
import leaf from '../assets/craft/ink-leaf.png'
import paw from '../assets/craft/ink-paw.png'
import rocket from '../assets/craft/ink-rocket.png'
import snow from '../assets/craft/ink-snow.png'
import eiffel from '../assets/craft/ink-eiffel.png'
import mountain from '../assets/craft/ink-mountain.png'
import { sfx } from './sound'

// Hand-carved eraser stamps, photographed on the cutting mat. Tap one and it stamps the paper;
// the prints are traced from the carved faces in that photo. The eraser rubs them all out again.
const STAMPS = [
  { id: 'eiffel', name: 'Eiffel Tower', x: 52.7, y: 14.9, ink: eiffel, w: 64 },
  { id: 'mountain', name: 'Mountain', x: 37.7, y: 32.8, ink: mountain, w: 86 },
  { id: 'leaf', name: 'Leaf', x: 18.1, y: 44.4, ink: leaf, w: 66 },
  { id: 'paw', name: 'Paw print', x: 66.7, y: 42.1, ink: paw, w: 76 },
  { id: 'rocket', name: 'Rocket', x: 81.5, y: 57, ink: rocket, w: 66 },
  { id: 'snow', name: 'Snowflake', x: 62.5, y: 84.4, ink: snow, w: 92 },
]
const INKS = ['#232a63', '#8b1e2d', '#1f4d34']

type Print = { k: number; src: string; x: number; y: number; r: number; w: number; o: number; c: string }
type Press = { k: number; x: number; y: number; w: number; r: number }

export function Stamps() {
  const [prints, setPrints] = useState<Print[]>([])
  const [press, setPress] = useState<Press[]>([])
  const [erasing, setErasing] = useState(false)
  const [ink, setInk] = useState(0)
  const n = useRef(0)

  const stamp = (s: (typeof STAMPS)[number]) => {
    if (erasing) return
    const k = n.current++
    const x = 12 + Math.random() * 76
    const y = 16 + Math.random() * 68
    const r = (Math.random() - 0.5) * 24
    const w = s.w * (0.92 + Math.random() * 0.16)
    setPress((p) => [...p, { k, x, y, w, r }])
    window.setTimeout(() => {
      sfx.stamp()
      setPrints((p) => [...p.slice(-40), { k, src: s.ink, x, y, r, w, o: 0.72 + Math.random() * 0.25, c: INKS[ink] }])
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

  return (
    <figure className="stamps">
      <div className="stamps-tray">
        <img src={tray} alt="Hand-carved eraser stamps on a cutting mat" draggable={false} />
        {STAMPS.map((s) => (
          <button type="button" key={s.id} className="stamps-hot" style={{ left: `${s.x}%`, top: `${s.y}%` }} onClick={() => stamp(s)} aria-label={`Stamp the ${s.name}`} />
        ))}
      </div>
      <div className={`stamps-paper${erasing ? ' is-erasing' : ''}`}>
        {prints.map((p) => (
          <span
            key={p.k}
            className="stamps-print"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.w, height: p.w, transform: `translate(-50%, -50%) rotate(${p.r}deg)`, opacity: p.o, background: p.c, WebkitMaskImage: `url(${p.src})`, maskImage: `url(${p.src})` }}
            aria-hidden="true"
          />
        ))}
        {press.map((p) => (
          <span key={p.k} className="stamps-block" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.w + 18, height: p.w + 10, ['--r' as string]: `${p.r}deg` }} aria-hidden="true" />
        ))}
        {erasing && (
          <>
            <span className="stamps-eraser" aria-hidden="true" />
            {Array.from({ length: 14 }, (_, i) => (
              <i key={i} className="stamps-crumb" style={{ left: `${10 + Math.random() * 80}%`, top: `${30 + Math.random() * 50}%`, animationDelay: `${0.2 + Math.random() * 1}s` }} aria-hidden="true" />
            ))}
          </>
        )}
        {prints.length === 0 && !erasing && <p className="stamps-empty">Tap a stamp in the tray.</p>}
      </div>
      <figcaption className="stamps-bar">
        <span className="stamps-inks" role="radiogroup" aria-label="Ink colour">
          {INKS.map((c, i) => (
            <button type="button" key={c} role="radio" aria-checked={ink === i} aria-label={['Indigo', 'Red', 'Green'][i] + ' ink'} className={`stamps-pad${ink === i ? ' is-on' : ''}`} style={{ background: c }} onClick={() => setInk(i)} />
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
