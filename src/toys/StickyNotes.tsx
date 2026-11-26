import { useRef, useState } from 'react'
import { sfx } from './sound'

// A pad of sticky notes. Grab the bottom-right corner and peel the top sheet off; there is always
// another fact underneath. The fold is real geometry: the corner is reflected across the crease line.
const FACTS = [
  'Ultimate Frisbee has no referees. Players call their own fouls.',
  'Honey found in ancient Egyptian tombs was still edible.',
  'Octopuses have three hearts.',
  'A group of flamingos is called a flamboyance.',
  'Bananas are berries. Strawberries are not.',
  'Wombats produce cube-shaped poo.',
  'Sea otters hold hands while they sleep so they don’t drift apart.',
  'A day on Venus is longer than a year on Venus.',
  'The first frisbees were pie tins from the Frisbie Pie Company.',
  'Cows have best friends, and get stressed when they are apart.',
  'There are more possible games of chess than atoms in the observable universe.',
  'Sloths can hold their breath longer than dolphins.',
]
const COLORS = ['#ffe36e', '#ffd0a8', '#c9ef9b', '#ffc4d6', '#bfe6ff']
const W = 220
const H = 220

type V = { x: number; y: number }

function fold(p: V) {
  // Corner C is (W,H); the drag point p is where the corner has moved to.
  const c = { x: W, y: H }
  const m = { x: (c.x + p.x) / 2, y: (c.y + p.y) / 2 }
  const d = { x: c.x - p.x, y: c.y - p.y }
  const len = Math.hypot(d.x, d.y) || 1
  const n = { x: d.x / len, y: d.y / len } // normal of the crease, pointing at the corner
  // points of the sheet on the corner side of the crease are folded over
  const side = (q: V) => (q.x - m.x) * n.x + (q.y - m.y) * n.y
  const poly: V[] = [
    { x: 0, y: 0 },
    { x: W, y: 0 },
    { x: W, y: H },
    { x: 0, y: H },
  ]
  const keep: V[] = []
  const flap: V[] = []
  for (let i = 0; i < 4; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % 4]
    const sa = side(a)
    const sb = side(b)
    if (sa <= 0) keep.push(a)
    else flap.push(a)
    if ((sa <= 0) !== (sb <= 0)) {
      const t = sa / (sa - sb)
      const q = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
      keep.push(q)
      flap.push(q)
    }
  }
  // reflect the flap across the crease
  const refl = (q: V) => {
    const s = side(q)
    return { x: q.x - 2 * s * n.x, y: q.y - 2 * s * n.y }
  }
  return { keep, flap: flap.map(refl), flapSrc: flap, m, n, len }
}

const pts = (ps: V[]) => ps.map((q) => `${q.x.toFixed(1)}px ${q.y.toFixed(1)}px`).join(', ')

export function StickyNotes() {
  const [i, setI] = useState(0)
  const [drag, setDrag] = useState<V | null>(null)
  const [gone, setGone] = useState<null | { v: V; k: number }>(null)
  const box = useRef<HTMLDivElement>(null)

  const local = (e: React.PointerEvent) => {
    const r = box.current!.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H }
  }
  const down = (e: React.PointerEvent) => {
    if (gone) return
    e.preventDefault()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    const q = local(e)
    setDrag({ x: Math.min(W - 2, q.x), y: Math.min(H - 2, q.y) })
  }
  const move = (e: React.PointerEvent) => {
    if (!drag) return
    const q = local(e)
    setDrag({ x: Math.min(W - 1, q.x), y: Math.min(H - 1, q.y) })
  }
  const up = () => {
    if (!drag) return
    const pulled = Math.hypot(W - drag.x, H - drag.y)
    if (pulled > 150) {
      sfx.peel()
      setGone({ v: drag, k: i })
      setDrag(null)
      window.setTimeout(() => {
        setI((n) => n + 1)
        setGone(null)
      }, 650)
    } else setDrag(null)
  }
  const tap = () => {
    // keyboard and click fallback: peel it for them
    if (gone) return
    sfx.peel()
    setGone({ v: { x: W * 0.2, y: H * 0.15 }, k: i })
    window.setTimeout(() => {
      setI((n) => n + 1)
      setGone(null)
    }, 650)
  }

  const fact = (k: number) => FACTS[k % FACTS.length]
  const color = (k: number) => COLORS[k % COLORS.length]
  const f = drag ? fold(drag) : null

  return (
    <figure className="notes">
      <div className="notes-pad" ref={box} style={{ aspectRatio: `${W} / ${H}` }}>
        {/* the stack edge */}
        <div className="notes-stack" style={{ background: color(i + 1) }} />
        {/* the next sheet, already showing */}
        <div className="note is-under" style={{ background: color(i + 1) }}>
          <p>{fact(i + 1)}</p>
        </div>
        {/* the top sheet */}
        {!gone && (
          <div className="note is-top" style={{ background: color(i), clipPath: f ? `polygon(${pts(f.keep)})` : undefined }}>
            <p>{fact(i)}</p>
          </div>
        )}
        {f && f.flap.length > 2 && (
          <>
            <div className="note-shade" style={{ clipPath: `polygon(${pts(f.flapSrc)})` }} />
            <div className="note-flap" style={{ clipPath: `polygon(${pts(f.flap)})`, background: `linear-gradient(${Math.atan2(f.n.y, f.n.x) * (180 / Math.PI) + 90}deg, rgba(0,0,0,0.12), rgba(255,255,255,0.35) 40%, rgba(0,0,0,0.05)), ${color(i)}` }} />
          </>
        )}
        {gone && (
          <div className="note is-flying" style={{ background: color(gone.k) }}>
            <p>{fact(gone.k)}</p>
          </div>
        )}
        <div className="notes-corner" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-hidden="true" />
        <button type="button" className="notes-btn" onClick={tap}>Peel the next fact</button>
      </div>
      <figcaption>Peel from the corner for another fact.</figcaption>
    </figure>
  )
}
