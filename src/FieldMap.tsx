// A top-down Ultimate field: 100 × 37 m with 18 m end zones, drawn to scale (10 px = 1 m).
export function FieldMap() {
  return (
    <figure className="fieldmap" data-reveal>
      <svg viewBox="-10 -10 1020 390" role="img" aria-label="Diagram of an Ultimate field, drawn to scale, with a curved break throw">
        <rect x="0" y="0" width="1000" height="370" className="fm-line" />
        <line x1="180" y1="0" x2="180" y2="370" className="fm-line" />
        <line x1="820" y1="0" x2="820" y2="370" className="fm-line" />
        <path d="M360 179l12 12M372 179l-12 12M628 179l12 12M640 179l-12 12" className="fm-line" />
        <text x="90" y="190" className="fm-text" transform="rotate(-90 90 190)">END ZONE</text>
        <text x="910" y="190" className="fm-text" transform="rotate(-90 910 190)">END ZONE</text>
                <circle cx="300" cy="250" r="10" className="fm-thrower" />
        <path d="M318 230 l22 -22" className="fm-mark" />
        <path d="M300 250 C 420 360, 640 330, 760 140" className="fm-throw" />
        <circle cx="760" cy="140" r="10" className="fm-catch" />
        <text x="282" y="257" className="fm-lab" textAnchor="end">Thrower</text>
        <text x="300" y="205" className="fm-lab">Mark</text>
        <text x="742" y="112" className="fm-lab" textAnchor="end">Receiver</text>
      </svg>
      <figcaption><span>An around break, thrown past the mark into space.</span><span className="mono">100 × 37 m, to scale</span></figcaption>
    </figure>
  )
}
