// Hand-made things, drawn as technical plates: one line weight, two fills, the same paper.

function Base({ x1, x2 }: { x1: number; x2: number }) {
  return (
    <g className="p-dim">
      <path d={`M40 312 H360`} className="p-ground" />
      <path d={`M${x1} 338 H${x2} M${x1} 330 V346 M${x2} 330 V346`} />
    </g>
  )
}

function Cot() {
  const spindles = Array.from({ length: 9 }, (_, i) => 108 + i * 23)
  return (
    <svg viewBox="0 0 400 400" className="plate-svg" aria-hidden="true">
      <Base x1={91} x2={309} />
      <g className="p-ink" transform="translate(44 47) scale(0.78)">
        <rect x="60" y="70" width="20" height="270" rx="3" className="p-fill" />
        <rect x="320" y="70" width="20" height="270" rx="3" className="p-fill" />
        <circle cx="70" cy="58" r="12" className="p-fill" />
        <circle cx="330" cy="58" r="12" className="p-fill" />
        <rect x="80" y="96" width="240" height="12" />
        <rect x="80" y="180" width="240" height="12" />
        <rect x="80" y="276" width="240" height="14" />
        {spindles.map((x) => <rect key={x} x={x - 3} y="192" width="6" height="84" />)}
        <rect x="84" y="258" width="232" height="18" rx="8" className="p-soft" />
      </g>
    </svg>
  )
}

function Focaccia() {
  const dimples: [number, number][] = []
  for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) {
    const j = ((r * 7 + c) * 37) % 11
    dimples.push([84 + c * 34 + (r % 2) * 14 + (j - 5), 104 + r * 34 + ((j * 3) % 7) - 3])
  }
  return (
    <svg viewBox="0 0 400 400" className="plate-svg" aria-hidden="true">
      <Base x1={60} x2={296} />
      <g className="p-ink" transform="translate(0 6)">
        <rect x="60" y="84" width="236" height="214" rx="22" className="p-fill" />
        {dimples.map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="5.5" ry="4.5" className="p-hole" />)}
        <path d="M120 130 l10 -6 M206 196 l9 6 M258 150 l-8 8 M150 240 l10 4 M262 270 l-10 -4" className="p-herb" />
        <rect x="310" y="234" width="54" height="64" rx="6" className="p-fill" />
        <path d="M318 298 l46 -46 M330 298 l34 -34 M342 298 l22 -22 M310 290 l44 -44 M310 274 l28 -28 M310 258 l12 -12" className="p-hatch" />
        <rect x="310" y="234" width="54" height="64" rx="6" />
      </g>
    </svg>
  )
}

function Books() {
  const books = [
    { x: 70, w: 34, h: 236, c: 'p-green' },
    { x: 104, w: 26, h: 214, c: 'p-paper' },
    { x: 130, w: 40, h: 252, c: 'p-fill' },
    { x: 170, w: 30, h: 226, c: 'p-green' },
    { x: 200, w: 22, h: 200, c: 'p-paper' },
  ]
  return (
    <svg viewBox="0 0 400 400" className="plate-svg" aria-hidden="true">
      <Base x1={70} x2={300} />
      <g className="p-ink" transform="translate(0 -18)">
        {books.map((b) => (
          <g key={b.x}>
            <rect x={b.x} y={330 - b.h} width={b.w} height={b.h} className={b.c} />
            <path d={`M${b.x} ${330 - b.h + 22} h${b.w} M${b.x} ${300} h${b.w}`} />
          </g>
        ))}
        <g transform="rotate(16 236 330)">
          <rect x="236" y="96" width="36" height="234" className="p-fill" />
          <path d="M236 118 h36 M236 300 h36" />
          <path d="M244 190 q10 -14 20 0 q-10 6 -20 0 z M254 184 l4 -10" className="p-dragon" />
        </g>
      </g>
    </svg>
  )
}

export function Plate({ id }: { id: string }) {
  return id === 'cot' ? <Cot /> : id === 'bread' ? <Focaccia /> : <Books />
}
