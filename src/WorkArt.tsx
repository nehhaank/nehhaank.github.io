// Schematic illustrations, not product screenshots.
// Each one sketches the shape of the problem rather than the actual interface.

function Interviewer() {
  const straight = [60, 130, 200, 270, 340]
  return (
    <>
      <text x="40" y="58" className="w-label">STRUCTURED</text>
      <line x1="60" y1="90" x2="340" y2="90" className="w-line" />
      {straight.map((x) => (
        <rect key={x} x={x - 12} y="78" width="24" height="24" rx="5" className="w-node" />
      ))}
      <text x="40" y="168" className="w-label">ADAPTIVE</text>
      <path d="M60 220 C 100 220, 100 196, 130 196 M60 220 C 100 220, 100 244, 130 244 M130 196 C 170 196, 170 214, 200 214 M130 244 C 170 244, 170 214, 200 214 M200 214 C 240 214, 240 184, 270 184 M270 184 C 300 184, 310 220, 340 220 M200 214 C 240 214, 240 254, 270 254" className="w-line" />
      <rect x="48" y="208" width="24" height="24" rx="5" className="w-node" />
      <circle cx="130" cy="196" r="11" className="w-node" />
      <circle cx="130" cy="244" r="11" className="w-node w-mango" />
      <circle cx="200" cy="214" r="11" className="w-node" />
      <circle cx="270" cy="184" r="11" className="w-node w-mango" />
      <circle cx="270" cy="254" r="11" className="w-node w-ghost" />
      <rect x="328" y="208" width="24" height="24" rx="5" className="w-node" />
    </>
  )
}

function Multilingual() {
  const tabs = [
    ['Aa', 0],
    ['अ', 1],
    ['あ', 2],
    ['Ñ', 3],
  ] as const
  return (
    <>
      {tabs.map(([g, i]) => (
        <g key={g} transform={`translate(${58 + i * 40} ${48 + i * 34})`}>
          <rect width="210" height="140" rx="10" className={`w-card ${i === 3 ? 'w-front' : ''}`} />
          <text x="12" y="27" className="w-glyph">{g}</text>
        </g>
      ))}
      <g transform="translate(178 150)">
        <line x1="22" y1="68" x2="160" y2="68" className="w-line w-thin" />
        <line x1="22" y1="88" x2="130" y2="88" className="w-line w-thin" />
        <rect x="118" y="14" width="80" height="26" rx="13" className="w-pill" />
        <text x="158" y="32" className="w-pill-t">EN ⇄ ES</text>
      </g>
    </>
  )
}

function Registration() {
  return (
    <>
      <path d="M50 230 C 110 230, 110 150, 170 150 S 230 80, 300 80" className="w-line w-dash" />
      <path d="M50 230 L 300 80" className="w-line" />
      {[
        [50, 230],
        [133, 180],
        [216, 130],
      ].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="11" className="w-node" />
      ))}
      <rect x="262" y="56" width="96" height="48" rx="24" className="w-pill w-mango-fill" />
      <text x="310" y="86" className="w-pill-t w-big">Start</text>
      <text x="50" y="270" className="w-label">FEWER STOPS BEFORE THE FIRST QUESTION</text>
    </>
  )
}

function Onboarding() {
  const steps = ['Explore', 'Apply', 'Verify', 'Assess', 'Ready']
  return (
    <>
      {steps.map((s, i) => {
        const y = 50 + i * 46
        const x = 60 + i * 34
        const done = i < 3
        return (
          <g key={s}>
            <rect x={x} y={y} width="170" height="34" rx="17" className={`w-pill ${done ? 'w-done' : i === 3 ? 'w-mango-fill' : ''}`} />
            <text x={x + 20} y={y + 22} className="w-step">{`${i + 1}  ${s}`}</text>
          </g>
        )
      })}
      <path d="M300 96 C 340 110, 340 170, 306 200" className="w-line w-dash" />
      <text x="292" y="86" className="w-label">RESUME</text>
    </>
  )
}

function Planner() {
  const cols = 8
  const rows = 6
  const filled = new Set(['0-1', '0-2', '1-4', '1-5', '1-6', '2-0', '3-3', '3-4', '4-1', '4-2', '4-3', '5-6', '5-7'])
  return (
    <>
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((__, c) => {
          const y = 46 + r * 34 + (r > 2 ? 40 : 0)
          return (
            <rect
              key={`${r}-${c}`}
              x={52 + c * 38}
              y={y}
              width="32"
              height="26"
              rx="4"
              className={`w-cell ${filled.has(`${r}-${c}`) ? (r === 2 ? 'w-mango-fill' : 'w-done') : ''}`}
            />
          )
        }),
      )}
      <rect x="52" y="148" width="298" height="34" rx="4" className="w-expand" />
      <line x1="66" y1="165" x2="200" y2="165" className="w-line w-thin" />
      <line x1="220" y1="165" x2="330" y2="165" className="w-line w-thin w-dash" />
    </>
  )
}

function Savings() {
  const bars = [52, 78, 66, 98, 108, 124]
  return (
    <>
      <rect x="44" y="40" width="140" height="70" rx="10" className="w-card w-front" />
      <rect x="62" y="58" width="56" height="10" rx="5" className="w-bar-soft" />
      <rect x="62" y="78" width="96" height="16" rx="5" className="w-mango-fill" />
      <rect x="200" y="40" width="156" height="70" rx="10" className="w-card" />
      <line x1="218" y1="64" x2="338" y2="64" className="w-line w-thin" />
      <line x1="218" y1="86" x2="300" y2="86" className="w-line w-thin w-dash" />
      {bars.map((h, i) => (
        <rect key={i} x={60 + i * 50} y={262 - h} width="30" height={h} rx="4" className={i === 5 ? 'w-mango-fill' : 'w-done'} />
      ))}
      <line x1="44" y1="200" x2="356" y2="200" className="w-line w-dash" />
      <text x="44" y="290" className="w-label">EACH BAR AGAINST A STATED BASELINE</text>
    </>
  )
}

const MAP: Record<string, () => React.JSX.Element> = {
  interviewer: Interviewer,
  multilingual: Multilingual,
  registration: Registration,
  onboarding: Onboarding,
  planner: Planner,
  savings: Savings,
}

export function WorkArt({ id }: { id: string }) {
  const Art = MAP[id]
  return (
    <svg viewBox="0 0 400 300" className="workart" aria-hidden="true">
      <Art />
    </svg>
  )
}
