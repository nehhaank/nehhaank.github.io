// A top-down Ultimate field (100 × 37 m, 18 m end zones) with one break throw curving around a mark.
export function FieldMap() {
  return (
    <figure className="fieldmap" data-reveal>
      <svg viewBox="0 0 370 1000" role="img" aria-label="Diagram of an Ultimate field with a curved break throw">
        <rect x="6" y="6" width="358" height="988" className="fm-line" />
        <line x1="6" y1="186" x2="364" y2="186" className="fm-line" />
        <line x1="6" y1="814" x2="364" y2="814" className="fm-line" />
        <text x="185" y="104" className="fm-text">END ZONE</text>
        <text x="185" y="910" className="fm-text">END ZONE</text>
        <g className="fm-brick">
          <path d="M179 344l12 12M191 344l-12 12" />
          <path d="M179 652l12 12M191 652l-12 12" />
        </g>
        <circle cx="140" cy="700" r="10" className="fm-thrower" />
        <circle cx="168" cy="676" r="10" className="fm-mark" />
        <path d="M140 690 C 300 600, 330 420, 236 236" className="fm-throw" />
        <circle cx="236" cy="236" r="10" className="fm-catch" />
        <path d="M290 330 C 260 300, 246 270, 238 250" className="fm-cut" />
      </svg>
      <figcaption className="mono">Fig. 1: an around break, thrown from the brick.</figcaption>
    </figure>
  )
}
