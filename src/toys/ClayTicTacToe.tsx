import { useEffect, useState } from 'react'
import bowl from '../assets/craft/bowl.png'
import idli from '../assets/craft/idli.png'
import leafImg from '../assets/craft/leaf-board.webp'
import { sfx } from './sound'

// Clay tic-tac-toe on a banana leaf. You play the bowls of Kaal soup; the board answers with Thatte idlis.
// The leaf and the pieces are cut straight out of the photo of the real clay set.
type Cell = 0 | 1 | 2 // empty, soup (you), idli
// Where each square sits on the photo of the clay leaf (centre x, y and size, as % of the board).
const CELLS: [number, number, number][] = [
  [21.5, 29.3, 23], [49.1, 29.3, 23], [76.6, 29.3, 23],
  [21.5, 52.4, 23], [49.1, 52.4, 23], [76.6, 52.4, 23],
  [21.5, 75.1, 23], [49.1, 75.1, 23], [76.6, 75.1, 23],
]
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
        <img className="ttt-leaf-art" src={leafImg} alt="" draggable={false} />
        <div className="ttt-grid">
          {b.map((v, i) => (
            <button
              type="button"
              key={i}
              role="gridcell"
              className={`ttt-cell${win?.line.includes(i) ? ' is-win' : ''}`}
              style={{ left: `${CELLS[i][0]}%`, top: `${CELLS[i][1]}%`, width: `${CELLS[i][2]}%` }}
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
