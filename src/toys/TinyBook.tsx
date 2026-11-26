import { useState } from 'react'
import cover from '../assets/craft/cover.jpg'
import { sfx } from './sound'

// The teeny tiny suede book, with mushrooms drawn inside. Tap the right page to turn forward, the left to go back.
type Shroom = { name: string; note: string; draw: React.ReactNode }

const wob = 'url(#tb-wobble)'
const SHROOMS: Shroom[] = [
  {
    name: 'Fly agaric',
    note: 'Pretty. Do not eat.',
    draw: (
      <g filter={wob}>
        <path d="M40 92 C 44 70, 56 70, 60 92 Z" fill="#f6efe2" stroke="#2a211a" strokeWidth="1.4" />
        <path d="M44 74 C 50 78, 54 78, 58 74" fill="none" stroke="#2a211a" strokeWidth="1" />
        <path d="M18 66 C 20 36, 80 36, 82 66 C 66 72, 34 72, 18 66 Z" fill="#d9472f" fillOpacity="0.85" stroke="#2a211a" strokeWidth="1.5" />
        {[[34, 52], [50, 46], [64, 54], [44, 60], [58, 62], [27, 60], [73, 61]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="3.2" ry="2.4" fill="#fbf6ea" stroke="#2a211a" strokeWidth="0.6" />)}
      </g>
    ),
  },
  {
    name: 'Chanterelle',
    note: 'Smells faintly of apricots.',
    draw: (
      <g filter={wob}>
        <path d="M24 48 C 34 40, 66 40, 78 48 C 70 54, 58 58, 54 70 L 52 92 L 46 92 L 46 72 C 42 58, 30 54, 24 48 Z" fill="#f0b02c" fillOpacity="0.8" stroke="#2a211a" strokeWidth="1.4" />
        <path d="M34 52 C 40 58, 44 64, 47 72 M44 50 C 47 58, 48 64, 49 72 M58 50 C 55 58, 53 64, 51 72 M68 52 C 62 58, 56 64, 52 72" fill="none" stroke="#9a6410" strokeWidth="0.8" />
      </g>
    ),
  },
  {
    name: 'Morel',
    note: 'A honeycomb on a stalk.',
    draw: (
      <g filter={wob}>
        <path d="M42 92 L 42 70 L 58 70 L 58 92 Z" fill="#efe4cc" stroke="#2a211a" strokeWidth="1.3" />
        <path d="M36 72 C 30 50, 40 22, 50 18 C 60 22, 70 50, 64 72 Z" fill="#b08a5a" fillOpacity="0.75" stroke="#2a211a" strokeWidth="1.4" />
        <path d="M40 30 L 60 30 M37 40 L 63 40 M35 50 L 65 50 M35 60 L 65 60 M45 22 L 42 70 M50 18 L 50 72 M55 22 L 58 70 M40 34 L 38 66 M60 34 L 62 66" stroke="#5a3f22" strokeWidth="0.9" fill="none" />
      </g>
    ),
  },
  {
    name: 'Oyster',
    note: 'Grows in shelves on old wood.',
    draw: (
      <g filter={wob}>
        <rect x="68" y="20" width="16" height="74" fill="#8a6a46" fillOpacity="0.6" stroke="#2a211a" strokeWidth="1.2" />
        <path d="M68 34 C 46 26, 22 34, 22 44 C 32 50, 54 48, 68 42 Z" fill="#d8d2c6" stroke="#2a211a" strokeWidth="1.3" />
        <path d="M68 56 C 42 48, 16 58, 18 68 C 30 74, 54 70, 68 64 Z" fill="#cfc7b8" stroke="#2a211a" strokeWidth="1.3" />
        <path d="M68 78 C 50 72, 32 78, 32 86 C 42 90, 58 88, 68 84 Z" fill="#d8d2c6" stroke="#2a211a" strokeWidth="1.3" />
      </g>
    ),
  },
  {
    name: 'Porcini',
    note: 'Fat stem, buttery cap.',
    draw: (
      <g filter={wob}>
        <path d="M36 92 C 30 76, 34 62, 40 58 L 60 58 C 66 62, 70 76, 64 92 Z" fill="#efe2c4" stroke="#2a211a" strokeWidth="1.4" />
        <path d="M42 70 l 3 2 M52 76 l 3 2 M46 84 l 3 2 M56 66 l 2 2" stroke="#9c8a62" strokeWidth="0.8" />
        <path d="M20 58 C 22 30, 78 30, 80 58 C 64 62, 36 62, 20 58 Z" fill="#8d4f22" fillOpacity="0.85" stroke="#2a211a" strokeWidth="1.5" />
        <path d="M30 42 C 40 36, 50 35, 58 37" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
      </g>
    ),
  },
  {
    name: 'Shaggy inkcap',
    note: 'Turns to ink as it ages.',
    draw: (
      <g filter={wob}>
        <path d="M47 92 L 47 60 L 53 60 L 53 92 Z" fill="#f4efe4" stroke="#2a211a" strokeWidth="1.2" />
        <path d="M36 64 C 34 40, 40 18, 50 14 C 60 18, 66 40, 64 64 Z" fill="#f2ede2" stroke="#2a211a" strokeWidth="1.4" />
        <path d="M36 64 C 40 70, 44 62, 48 70 C 52 62, 56 70, 60 62 L 64 64" fill="#2a211a" fillOpacity="0.85" stroke="#2a211a" strokeWidth="1" />
        <path d="M42 28 l 4 3 M54 24 l -3 4 M40 42 l 5 2 M58 40 l -4 3 M46 52 l 4 2 M56 54 l -4 2" stroke="#7a6a58" strokeWidth="0.9" />
      </g>
    ),
  },
  {
    name: 'Puffball',
    note: 'Step on it; it smokes.',
    draw: (
      <g filter={wob}>
        <path d="M22 90 C 18 62, 34 44, 50 44 C 66 44, 82 62, 78 90 Z" fill="#ece5d3" stroke="#2a211a" strokeWidth="1.5" />
        {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={30 + (i % 6) * 8 + (i > 5 ? 4 : 0)} cy={56 + Math.floor(i / 6) * 10} r="1.1" fill="#8a7a62" />)}
        <path d="M44 40 C 46 34, 42 30, 46 26 M54 38 C 58 32, 54 28, 58 22" fill="none" stroke="#9a8a72" strokeWidth="0.9" strokeDasharray="1.5 2" />
      </g>
    ),
  },
  {
    name: 'Enoki',
    note: 'A bouquet of tiny umbrellas.',
    draw: (
      <g filter={wob}>
        {[-14, -8, -2, 4, 10, 16].map((dx, i) => (
          <g key={i}>
            <path d={`M50 92 C ${50 + dx * 0.4} 70, ${50 + dx * 0.8} 50, ${50 + dx} ${30 + Math.abs(dx) * 0.6}`} fill="none" stroke="#2a211a" strokeWidth="1.2" />
            <ellipse cx={50 + dx} cy={28 + Math.abs(dx) * 0.6} rx="4" ry="3" fill="#f5efdc" stroke="#2a211a" strokeWidth="1" />
          </g>
        ))}
        <path d="M40 92 C 44 86, 56 86, 60 92 Z" fill="#cbbf9c" stroke="#2a211a" strokeWidth="1.1" />
      </g>
    ),
  },
]

function Page({ s, n }: { s: Shroom; n: number }) {
  return (
    <div className="tb-page">
      <svg viewBox="0 0 100 100" aria-hidden="true">{s.draw}</svg>
      <p className="tb-name">{s.name}</p>
      <p className="tb-note">{s.note}</p>
      <span className="tb-folio">{n}</span>
    </div>
  )
}

// leaves: [front, back]
const LEAVES: [React.ReactNode, React.ReactNode][] = [
  [
    <div className="tb-cover" style={{ backgroundImage: `url(${cover})` }}>
      <span className="tb-title">Mushrooms</span>
    </div>,
    <div className="tb-end"><span>drawn by hand</span></div>,
  ],
  [<Page s={SHROOMS[0]} n={1} />, <Page s={SHROOMS[1]} n={2} />],
  [<Page s={SHROOMS[2]} n={3} />, <Page s={SHROOMS[3]} n={4} />],
  [<Page s={SHROOMS[4]} n={5} />, <Page s={SHROOMS[5]} n={6} />],
  [<Page s={SHROOMS[6]} n={7} />, <Page s={SHROOMS[7]} n={8} />],
  [<div className="tb-end"><span>the end</span></div>, <div className="tb-cover is-back" style={{ backgroundImage: `url(${cover})` }} />],
]

export function TinyBook() {
  const [turned, setTurned] = useState(0)
  const go = (d: 1 | -1) => {
    const n = Math.max(0, Math.min(LEAVES.length, turned + d))
    if (n !== turned) {
      sfx.page()
      setTurned(n)
    }
  }
  const state = turned === 0 ? 'is-closed' : turned === LEAVES.length ? 'is-back' : 'is-open'
  return (
    <figure className="tb">
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id="tb-wobble">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="1.6" />
        </filter>
      </svg>
      <div className={`tb-book ${state}`}>
        {LEAVES.map(([front, back], i) => {
          const isTurned = i < turned
          const z = isTurned ? i : LEAVES.length - i
          return (
            <div key={i} className={`tb-leaf${isTurned ? ' is-turned' : ''}`} style={{ zIndex: z }}>
              <div className="tb-face is-front">{front}</div>
              <div className="tb-face is-back">{back}</div>
            </div>
          )
        })}
        <button type="button" className="tb-hit is-prev" onClick={() => go(-1)} aria-label="Previous page" disabled={turned === 0} />
        <button type="button" className="tb-hit is-next" onClick={() => go(1)} aria-label={turned === 0 ? 'Open the book' : 'Next page'} disabled={turned === LEAVES.length} />
      </div>
      <figcaption>{turned === 0 ? 'Tap the cover to open.' : turned === LEAVES.length ? 'Tap the left side to read it again.' : 'Tap the right page to turn, the left to go back.'}</figcaption>
    </figure>
  )
}
