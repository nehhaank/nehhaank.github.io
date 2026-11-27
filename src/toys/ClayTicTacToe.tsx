import { useEffect, useState } from 'react'
import bowl from '../assets/craft/bowl.png'
import idli from '../assets/craft/idli.png'
import { sfx } from './sound'

// Clay tic-tac-toe on a banana leaf. You play the bowls of Kaal soup; the board answers with Thatte idlis.
// The pieces are cut straight out of the photo of the real clay set.
type Cell = 0 | 1 | 2 // empty, soup (you), idli
// The leaf's outline: straight cut top, a pointed tip on the right, and the bottom and right edges split
// into tabs where the grooves run out, like the clay one.
const LEAF =
  'M22 58 Q 26 26 62 22 L 128 18 L 136 30 L 146 17 L 256 14 L 264 26 L 274 14 L 318 16 Q 352 20 366 52 L 394 118 L 382 128 L 392 140 L 388 252 L 374 262 L 386 276 L 380 346 Q 376 382 340 386 L 278 390 L 264 370 L 252 392 L 152 394 L 136 372 L 124 392 L 66 388 Q 24 384 18 348 L 14 272 L 26 264 L 12 254 L 10 144 L 22 134 L 10 124 Z'
const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]

function winner(b: Cell[]) {
  for (const l of LINES) if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[0]] === b[l[2]]) return { who: b[l[0]], line: l }
  return null
}

function bestMove(b: Cell[]): number {
  // win, block, centre, corner, side; with a little forgiveness so it can be beaten
  const empty = b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0)
  const tryFor = (who: Cell) => {
    for (const i of empty) {
      const c = b.slice() as Cell[]
      c[i] = who
      if (winner(c)?.who === who) return i
    }
    return -1
  }
  const w = tryFor(2)
  if (w >= 0) return w
  const block = tryFor(1)
  if (block >= 0 && Math.random() > 0.18) return block
  if (!b[4]) return 4
  const corners = [0, 2, 6, 8].filter((i) => !b[i])
  if (corners.length && Math.random() > 0.3) return corners[Math.floor(Math.random() * corners.length)]
  return empty[Math.floor(Math.random() * empty.length)]
}

export function ClayTicTacToe() {
  const [b, setB] = useState<Cell[]>(Array(9).fill(0))
  const [turn, setTurn] = useState<1 | 2>(1)
  const [score, setScore] = useState({ soup: 0, idli: 0 })
  const win = winner(b)
  const full = b.every(Boolean)

  useEffect(() => {
    if (turn !== 2 || win || full) return
    const t = window.setTimeout(() => {
      const i = bestMove(b)
      const n = b.slice() as Cell[]
      n[i] = 2
      setB(n)
      sfx.clack()
      setTurn(1)
    }, 620)
    return () => window.clearTimeout(t)
  }, [turn, b, win, full])

  const wkey = win ? `${win.who}` : ''
  useEffect(() => {
    if (!wkey) return
    setScore((s) => (wkey === '1' ? { ...s, soup: s.soup + 1 } : { ...s, idli: s.idli + 1 }))
  }, [wkey])

  const play = (i: number) => {
    if (b[i] || turn !== 1 || win) return
    const n = b.slice() as Cell[]
    n[i] = 1
    setB(n)
    sfx.clack()
    setTurn(2)
  }
  const reset = () => {
    setB(Array(9).fill(0))
    setTurn(1)
  }

  const status = win ? (win.who === 1 ? 'Kaal soup wins. Well played.' : 'The idlis win this round.') : full ? 'A draw. Everyone eats.' : turn === 1 ? 'Your move: place a bowl of Kaal soup.' : 'Idli is thinking…'

  return (
    <figure className="ttt">
      <div className="ttt-leaf" role="grid" aria-label="Tic-tac-toe board">
        <svg className="ttt-leaf-art" viewBox="0 0 400 400" aria-hidden="true">
          <defs>
            {/* a slab of glossy green clay, cut into a banana leaf, its edges split where the grooves run out */}
            <linearGradient id="lf-base" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#3f9226" />
              <stop offset="0.45" stopColor="#2a7a1c" />
              <stop offset="1" stopColor="#1e6316" />
            </linearGradient>
            <filter id="lf-streak" x="0" y="0" width="1" height="1">
              <feTurbulence type="fractalNoise" baseFrequency="0.09 0.006" numOctaves="3" seed="7" />
              <feColorMatrix values="0 0 0 0 0.78  0 0 0 0 0.86  0 0 0 0 0.25  0 0 0 2.4 -1.25" />
              <feComposite in2="SourceGraphic" operator="in" />
            </filter>
            <filter id="lf-brush" x="0" y="0" width="1" height="1">
              <feTurbulence type="fractalNoise" baseFrequency="0.22 0.012" numOctaves="2" seed="3" />
              <feColorMatrix values="0 0 0 0 0.62  0 0 0 0 0.8  0 0 0 0 0.2  0 0 0 3 -1.9" />
              <feComposite in2="SourceGraphic" operator="in" />
            </filter>
            <radialGradient id="lf-gloss" cx="22%" cy="30%" r="70%">
              <stop offset="0" stopColor="rgba(255,255,235,0.42)" />
              <stop offset="0.35" stopColor="rgba(255,255,235,0.08)" />
              <stop offset="1" stopColor="rgba(0,20,0,0.14)" />
            </radialGradient>
            <clipPath id="lf-shape">
              <path id="lf-path" d={LEAF} />
            </clipPath>
          </defs>
          {/* the slab's thickness, seen just below the top face */}
          <path d={LEAF} fill="#164d10" transform="translate(0 9)" />
          <path d={LEAF} fill="#1b5913" transform="translate(0 5)" />
          <g clipPath="url(#lf-shape)">
            <rect width="400" height="400" fill="url(#lf-base)" />
            {/* veins and brushed glaze running across the leaf, at an angle to the grid */}
            <g transform="rotate(32 200 200)">
              <rect x="-100" y="-100" width="600" height="600" fill="#000" filter="url(#lf-streak)" opacity="0.8" />
              <rect x="-100" y="-100" width="600" height="600" fill="#000" filter="url(#lf-brush)" opacity="0.55" />
            </g>
            <rect width="400" height="400" fill="url(#lf-gloss)" />
            {/* pressed grooves: a dark channel with a lit lip on the far side */}
            {[136, 264].map((v, i) => (
              <g key={v}>
                <path d={`M${v - 2 + i * 3} -10 C ${v + 3} 120, ${v - 3} 280, ${v + 2 - i * 2} 410`} stroke="#123f0c" strokeWidth="11" fill="none" strokeLinecap="round" />
                <path d={`M${v + 4 + i * 3} -10 C ${v + 9} 120, ${v + 3} 280, ${v + 8 - i * 2} 410`} stroke="rgba(190,230,110,0.45)" strokeWidth="2.2" fill="none" />
                <path d={`M-10 ${v + 2 - i * 3} C 120 ${v - 3}, 280 ${v + 4}, 410 ${v - 1 + i * 2}`} stroke="#123f0c" strokeWidth="11" fill="none" strokeLinecap="round" />
                <path d={`M-10 ${v + 8 - i * 3} C 120 ${v + 3}, 280 ${v + 10}, 410 ${v + 5 + i * 2}`} stroke="rgba(190,230,110,0.45)" strokeWidth="2.2" fill="none" />
              </g>
            ))}
          </g>
          {/* a wet highlight along the top edge, and a darker rolled edge */}
          <path d={LEAF} fill="none" stroke="rgba(10,40,6,0.55)" strokeWidth="2" />
          <path d="M40 30 Q 140 20 300 22" stroke="rgba(255,255,230,0.5)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
        <div className="ttt-grid">
          {b.map((v, i) => (
            <button
              type="button"
              key={i}
              role="gridcell"
              className={`ttt-cell${win?.line.includes(i) ? ' is-win' : ''}`}
              onClick={() => play(i)}
              aria-label={v === 1 ? 'Kaal soup' : v === 2 ? 'Thatte idli' : `Empty square ${i + 1}`}
              disabled={!!v || !!win || turn !== 1}
            >
              {v === 1 && <img src={bowl} alt="" className="ttt-piece is-soup" draggable={false} />}
              {v === 2 && <img src={idli} alt="" className="ttt-piece is-idli" draggable={false} />}
            </button>
          ))}
        </div>
      </div>
      <figcaption>
        <span className="ttt-status" aria-live="polite">{status}</span>
        <span className="ttt-score">Soup {score.soup} · Idli {score.idli}</span>
        {(win || full) && <button type="button" className="chip-btn" onClick={reset}>Play again</button>}
      </figcaption>
    </figure>
  )
}
