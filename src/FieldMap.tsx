// A top-down Ultimate field: 100 × 37 m with 18 m end zones, drawn to scale (10 px = 1 m).
const THROW = 'M300 250 C 420 360, 640 330, 760 140'

export function FieldMap() {
  const ticks = Array.from({ length: 7 }, (_, i) => 200 + i * 100).filter((x) => x < 820)
  return (
    <figure className="fieldmap" data-reveal>
      <svg viewBox="-10 -44 1020 456" role="img" aria-label="Diagram of an Ultimate field, drawn to scale, with a curved break throw around the mark">
        <rect x="0" y="0" width="1000" height="370" className="fm-line" />
        <line x1="180" y1="0" x2="180" y2="370" className="fm-line" />
        <line x1="820" y1="0" x2="820" y2="370" className="fm-line" />
        {ticks.map((x) => <path key={x} d={`M${x} 0 v10 M${x} 360 v10`} className="fm-tick" />)}
        <path d="M360 179l12 12M372 179l-12 12M628 179l12 12M640 179l-12 12" className="fm-brick" />
        <text x="90" y="190" className="fm-text" transform="rotate(-90 90 190)">END ZONE</text>
        <text x="910" y="190" className="fm-text" transform="rotate(-90 910 190)">END ZONE</text>

        <path d={THROW} className="fm-throw" />
        <text x="640" y="354" className="fm-dist" textAnchor="middle">≈ 47 m</text>
        <circle cx="300" cy="250" r="11" className="fm-thrower" />
        <circle cx="330" cy="222" r="10" className="fm-mark" />
        <path d="M312 196 A 40 40 0 0 1 356 236" className="fm-arc" />
        <circle cx="760" cy="140" r="11" className="fm-catch" />
        <circle r="7" className="fm-disc"><animateMotion dur="2.4s" begin="indefinite" fill="freeze" path={THROW} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.3 0 0.2 1" /></circle>

        <path d="M300 262 V336 H292" className="fm-lead" />
        <text x="286" y="342" className="fm-lab" textAnchor="end">Thrower</text>
        <path d="M322 212 L296 150 H258" className="fm-lead" />
        <text x="250" y="156" className="fm-lab" textAnchor="end">Mark</text>
        <path d="M760 128 V60 H700" className="fm-lead" />
        <text x="692" y="66" className="fm-lab" textAnchor="end">Receiver</text>
        <text x="500" y="-16" className="fm-dim" textAnchor="middle">100 m</text>
        <path d="M0 -26 V-6 M1000 -26 V-6 M0 -16 H440 M560 -16 H1000" className="fm-tick" />
      </svg>
      <figcaption>An around break: thrown past the mark, into space. Drawn to scale.</figcaption>
    </figure>
  )
}
