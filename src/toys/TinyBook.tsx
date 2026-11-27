import { useEffect, useRef, useState } from 'react'
import gilt from '../assets/book/gilt-frame.webp'
import { sfx } from './sound'

// Neha's teeny tiny suede book of mushrooms, filmed in her fingers as she flipped through it.
// The video is cut into frames: each spread is one still frame, and turning a page plays the
// frames between two spreads. Tap the right page to turn forward, the left one to go back.
// It hangs in a mossy gilt frame, with the frame's little mushrooms sitting over the picture.
const FRAME_IMG = import.meta.glob('../assets/book/f*.webp', { eager: true, import: 'default' }) as Record<string, string>
const FRAMES = Object.keys(FRAME_IMG)
  .sort()
  .map((k) => ({ n: Number(k.match(/f(\d+)\.webp$/)![1]), src: FRAME_IMG[k] }))
// the still frame of each spread, from the closed cover to the closed back cover
const SPREADS = [1, 166, 234, 311, 386, 431, 479, 530, 552, 579, 627, 659, 756, 819, 863, 925, 958, 1052]
const LAST = SPREADS.length - 1
const FPS = 24

const indexOf = (n: number) => FRAMES.findIndex((f) => f.n === n)

export function TinyBook() {
  const [spread, setSpread] = useState(0)
  const [frame, setFrame] = useState(indexOf(SPREADS[0]))
  const [turning, setTurning] = useState(false)
  const stage = useRef<HTMLDivElement>(null)
  const raf = useRef(0)
  const kept = useRef<HTMLImageElement[]>([])

  // fetch every frame once the book scrolls near, so the page turns play smoothly
  useEffect(() => {
    const el = stage.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        kept.current = FRAMES.map((f) => {
          const im = new Image()
          im.decoding = 'async'
          im.src = f.src
          return im
        })
      },
      { rootMargin: '600px' },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf.current)
    }
  }, [])

  const turn = (dir: 1 | -1) => {
    if (turning) return
    if (dir === 1 && spread === LAST) {
      // closed at the back: start again from the front cover
      setSpread(0)
      setFrame(indexOf(SPREADS[0]))
      return
    }
    const to = spread + dir
    if (to < 0 || to > LAST) return
    const a = indexOf(SPREADS[spread])
    const b = indexOf(SPREADS[to])
    setTurning(true)
    sfx.page()
    const t0 = performance.now()
    const steps = Math.abs(b - a)
    const step = (now: number) => {
      const k = Math.min(steps, Math.floor(((now - t0) / 1000) * FPS))
      setFrame(a + k * dir)
      if (k < steps) raf.current = requestAnimationFrame(step)
      else {
        setSpread(to)
        setTurning(false)
      }
    }
    raf.current = requestAnimationFrame(step)
  }

  const caption = spread === 0 ? 'Tap the right side to open it.' : spread === LAST ? 'The end. Tap to read it again.' : 'Tap the right page to turn it, the left to go back.'

  return (
    <figure className="tb">
      <div className="tb-stage" ref={stage}>
        <div className="tb-window">
          <img src={FRAMES[frame].src} alt="Neha's tiny suede-bound book of hand-drawn mushrooms, held open between her fingers" draggable={false} />
        </div>
        <img className="tb-gilt" src={gilt} alt="" draggable={false} />
        <button type="button" className="tb-hit is-prev" onClick={() => turn(-1)} disabled={spread === 0 || turning} aria-label="Previous page" />
        <button type="button" className="tb-hit is-next" onClick={() => turn(1)} disabled={turning} aria-label={spread === 0 ? 'Open the book' : spread === LAST ? 'Read it again' : 'Next page'} />
      </div>
      <div className="tb-dots" aria-hidden="true">
        {SPREADS.map((_, i) => (
          <i key={i} className={i === spread ? 'is-on' : ''} />
        ))}
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  )
}
