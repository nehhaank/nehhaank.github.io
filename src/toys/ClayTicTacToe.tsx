import { useEffect, useState } from 'react'
import bowl from '../assets/craft/bowl.png'
import idli from '../assets/craft/idli.png'
import { sfx } from './sound'

// Clay tic-tac-toe on a banana leaf. You play the bowls of Kaal soup; the board answers with Thatte idlis.
// The pieces are cut straight out of the photo of the real clay set.
type Cell = 0 | 1 | 2 // empty, soup (you), idli
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
        <svg className="ttt-leaf-art" viewBox="0 0 400 400" aria-hidden="true" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lf-base" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#5f9e2c" />
              <stop offset="0.5" stopColor="#3f7f24" />
              <stop offset="1" stopColor="#2c641c" />
            </linearGradient>
            <filter id="lf-streak" x="0" y="0" width="1" height="1">
              <feTurbulence type="fractalNoise" baseFrequency="0.004 0.09" numOctaves="3" seed="4" />
              <feColorMatrix values="0 0 0 0 0.86  0 0 0 0 0.9  0 0 0 0 0.25  0 0 0 1.6 -0.75" />
              <feComposite in2="SourceGraphic" operator="in" />
            </filter>
            <radialGradient id="lf-gloss" cx="30%" cy="20%" r="80%">
              <stop offset="0" stopColor="rgba(255,255,230,0.45)" />
              <stop offset="0.4" stopColor="rgba(255,255,230,0.06)" />
              <stop offset="1" stopColor="rgba(0,0,0,0.12)" />
            </radialGradient>
            <clipPath id="lf-shape">
              <path d="M12 26 Q 8 10 30 8 L 372 14 Q 394 16 392 40 L 386 370 Q 384 394 362 392 L 40 388 Q 14 386 14 362 Z" />
            </clipPath>
          </defs>
          <g clipPath="url(#lf-shape)">
            <rect width="400" height="400" fill="url(#lf-base)" />
            <rect width="400" height="400" fill="#000" filter="url(#lf-streak)" opacity="0.55" />
            <rect width="400" height="400" fill="url(#lf-gloss)" />
            {/* clay grooves */}
            {[136, 264].map((v) => (
              <g key={v}>
                <path d={`M${v} 18 L${v + 3} 382`} stroke="rgba(10,40,8,0.55)" strokeWidth="9" strokeLinecap="round" />
                <path d={`M${v + 3} 18 L${v + 6} 382`} stroke="rgba(190,230,120,0.35)" strokeWidth="2" />
                <path d={`M18 ${v} L382 ${v + 3}`} stroke="rgba(10,40,8,0.55)" strokeWidth="9" strokeLinecap="round" />
                <path d={`M18 ${v + 3} L382 ${v + 6}`} stroke="rgba(190,230,120,0.35)" strokeWidth="2" />
              </g>
            ))}
            {/* midrib */}
            <path d="M-10 200 L410 206" stroke="rgba(210,235,150,0.18)" strokeWidth="5" />
          </g>
          <path d="M12 26 Q 8 10 30 8 L 372 14 Q 394 16 392 40 L 386 370 Q 384 394 362 392 L 40 388 Q 14 386 14 362 Z" fill="none" stroke="rgba(20,50,10,0.6)" strokeWidth="2" />
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
