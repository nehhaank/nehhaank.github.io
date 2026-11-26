import { useEffect, useRef, useState } from 'react'

const PATH = 'M20 4 C 36 60, 4 110, 20 160 S 36 260, 20 310 S 4 400, 20 476'
// Four stops along the line, placed where they felt right rather than evenly.
const STOPS = [
  { id: 'work', label: 'Work', at: 0.1 },
  { id: 'field', label: 'Field', at: 0.38 },
  { id: 'making', label: 'Making', at: 0.6 },
  { id: 'hello', label: 'Hello', at: 0.96 },
]

export function FlightNav() {
  const pathRef = useRef<SVGPathElement>(null)
  const [pts, setPts] = useState<{ x: number; y: number }[]>([])
  const [pos, setPos] = useState({ x: 20, y: 4 })
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    const p = pathRef.current
    if (!p) return
    const len = p.getTotalLength()
    setPts(STOPS.map((s) => p.getPointAtLength(len * s.at)))

    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const f = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      const pt = p.getPointAtLength(len * f)
      setPos({ x: pt.x, y: pt.y })
      let cur = ''
      for (const s of STOPS) {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.45) cur = s.id
      }
      setActive(cur)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <nav className="flightnav" aria-label="Page progress">
      <svg viewBox="0 0 40 480" aria-hidden="true">
        <path ref={pathRef} d={PATH} className="fn-path" />
        {pts.map((pt, i) => (
          <circle key={STOPS[i].id} cx={pt.x} cy={pt.y} r="3" className={`fn-stop ${active === STOPS[i].id ? 'on' : ''}`} />
        ))}
        <ellipse cx={pos.x} cy={pos.y} rx="7" ry="4.5" className="fn-disc" />
      </svg>
      {pts.map((pt, i) => (
        <a
          key={STOPS[i].id}
          href={`#${STOPS[i].id}`}
          className={`fn-label mono ${active === STOPS[i].id ? 'on' : ''}`}
          style={{ top: `${(pt.y / 480) * 100}%` }}
        >
          {STOPS[i].label}
        </a>
      ))}
    </nav>
  )
}
