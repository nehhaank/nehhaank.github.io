import { useCallback, useEffect, useState } from 'react'

// The flight: out wide, a hang at the top, and a curl back home.
const FLIGHT =
  'M70 250 C 150 250, 210 120, 300 90 S 420 60, 410 150 S 300 260, 230 200 S 120 110, 70 250'

export function Disc() {
  const [flying, setFlying] = useState(false)
  const [throws, setThrows] = useState(0)

  const thrown = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setThrows((t) => t + 1)
      return
    }
    setFlying(false)
    requestAnimationFrame(() => requestAnimationFrame(() => setFlying(true)))
    setThrows((t) => t + 1)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
      if (e.key === '8') thrown()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [thrown])

  const label = throws === 0 ? 'Throw the disc' : throws === 1 ? 'Nice huck. Again?' : `${throws} throws, nobody dropped it`

  return (
    <div className="disc-stage" aria-hidden="false">
      <svg className="flight" viewBox="0 0 480 320" aria-hidden="true">
        <path d={FLIGHT} className="flight-path" />
        <circle cx="70" cy="250" r="3.5" className="flight-dot" />
        <circle cx="410" cy="150" r="3.5" className="flight-dot" />
      </svg>
      <button
        type="button"
        className={`disc ${flying ? 'is-flying' : ''}`}
        style={{ offsetPath: `path('${FLIGHT}')` }}
        onClick={thrown}
        onAnimationEnd={() => setFlying(false)}
        aria-label={label}
        title={label}
      >
        <span className="disc-body" />
      </button>
      <span className="mono disc-caption" aria-live="polite">
        {throws > 0 ? label : ''}
      </span>
    </div>
  )
}
