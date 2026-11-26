import { useLayoutEffect, useRef, useState } from 'react'

// Mock screens: simplified, readable interface fragments that sketch each project.
// They are illustrations built for this site, not product screenshots, and show no real data.
// Each sits on an "artboard" with redline notes that point at the decision it illustrates.

function Interviewer() {
  return (
    <div className="mk-ui">
      <p className="mk-h" data-n="1">Choose an interview mode</p>
      <div className="mk-two">
        <div className="mk-opt">
          <b>Structured</b>
          <span>Same questions, same order, for everyone.</span>
          <ol className="mk-steps">
            <li>Intro</li><li>Q1</li><li>Q2</li><li>Q3</li>
          </ol>
        </div>
        <div className="mk-opt is-on">
          <b>Adaptive</b>
          <span>Goes deeper when an answer is thin.</span>
          <svg viewBox="0 0 160 64" className="mk-tree" aria-hidden="true" data-n="2">
            <path d="M10 32 C 34 32, 34 12, 58 12 M10 32 C 34 32, 34 52, 58 52 M58 12 C 82 12, 82 32, 106 32 M58 52 C 82 52, 82 32, 106 32 M106 32 L 150 32" />
            <circle cx="10" cy="32" r="6" /><circle cx="58" cy="12" r="6" /><circle cx="58" cy="52" r="6" className="y" /><circle cx="106" cy="32" r="6" /><circle cx="150" cy="32" r="6" />
          </svg>
        </div>
      </div>
      <div className="mk-foot"><span className="mk-chip">Interviewers: 2</span><span className="mk-btn">Continue</span></div>
    </div>
  )
}

function Multilingual() {
  return (
    <div className="mk-ui">
      <div className="mk-row">
        <span className="mk-note">Question 3 of 12</span>
        <span className="mk-sel" data-n="1">Español ▾</span>
      </div>
      <p className="mk-h">¿Qué enfoque mantiene el informe preciso?</p>
      <ul className="mk-answers">
        <li><i />Guardar solo la traducción</li>
        <li className="is-on"><i />Mostrar traducción y original</li>
        <li><i />Recalcular la puntuación</li>
      </ul>
      <div className="mk-foot"><span className="mk-chip g" data-n="2">Translated from English</span></div>
    </div>
  )
}

function Registration() {
  return (
    <div className="mk-ui">
      <p className="mk-h">Two quick details and you’re in.</p>
      <label className="mk-field" data-n="1"><span>Full name</span><i>Your name</i></label>
      <label className="mk-field"><span>Email</span><i>you@example.com</i></label>
      <label className="mk-check" data-n="2"><b>✓</b>I agree to be proctored</label>
      <div className="mk-foot"><span className="mk-note">About a minute</span><span className="mk-btn y">Start test →</span></div>
    </div>
  )
}

function Onboarding() {
  const steps = ['Explore', 'Apply', 'Verify', 'Assess', 'Ready']
  return (
    <div className="mk-ui">
      <ol className="mk-status" data-n="1">
        {steps.map((s, i) => (
          <li key={s} className={i < 3 ? 'done' : i === 3 ? 'now' : ''}><i />{s}</li>
        ))}
      </ol>
      <div className="mk-card">
        <b>Welcome back</b>
        <span>You stopped at the assessment. Your answers so far are saved.</span>
        <span className="mk-btn y" data-n="2">Resume</span>
      </div>
    </div>
  )
}

function Planner() {
  const on = new Set(['0-1', '0-2', '0-3', '1-4', '1-5', '2-0', '2-1', '3-5'])
  const rows = ['Design', 'Research', 'Ops', 'QA']
  return (
    <div className="mk-ui">
      <div className="mk-seg" data-n="1"><span className="is-on">Profile</span><span>Work type</span><span>Cohort</span></div>
      <div className="mk-grid">
        <span />
        {Array.from({ length: 6 }).map((_, c) => <span key={c} className="mk-col">W{c + 1}</span>)}
        {rows.map((r, ri) => (
          <div className="mk-grow" key={r}>
            <span className="mk-rowh">{r}</span>
            {Array.from({ length: 6 }).map((_, c) => (
              <i key={c} className={on.has(`${ri}-${c}`) ? 'on' : ri === 2 && c === 4 ? 'y' : ''} data-n={ri === 2 && c === 4 ? '2' : undefined} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function Savings() {
  return (
    <div className="mk-ui">
      <div className="mk-row"><p className="mk-h">Estimated savings</p><span className="mk-seg small"><span className="is-on">Quarter</span><span>Year</span></span></div>
      <div className="mk-compare" data-n="1">
        <div><span>Without the tool</span><i style={{ width: '92%' }} /></div>
        <div><span>With the tool</span><i className="y" style={{ width: '54%' }} /></div>
      </div>
      <div className="mk-foot"><span className="mk-chip">Assumptions</span><span className="mk-chip" data-n="2">How it’s calculated ↓</span></div>
    </div>
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

// The artboard is drawn at a fixed 640 × 480 and scaled to fit its frame.
const W = 640
const H = 480
const NOTE_X = 470
const PIN_X = 432

type Pin = { tx: number; x: number; y: number; ny: number }

export function Artboard({ id, notes = [] }: { id: string; notes?: string[] }) {
  const frame = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [s, setS] = useState(1)
  const [pins, setPins] = useState<Pin[]>([])
  const M = MAP[id]

  const bleed = notes.length === 0
  useLayoutEffect(() => {
    const f = frame.current
    const st = stage.current
    if (!f || !st) return
    if (bleed) {
      const fit = () => {
        const cs = getComputedStyle(f)
        const inner = f.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
        const frac = parseFloat(cs.getPropertyValue('--fit')) || 1
        setS(Math.min(1.6, (inner * frac) / 404))
      }
      fit()
      const ro = new ResizeObserver(fit)
      ro.observe(f)
      return () => ro.disconnect()
    }
    const measure = () => {
      const scale = Math.min(f.clientWidth / W, f.clientHeight / H)
      setS(scale)
      const base = st.getBoundingClientRect()
      const k = base.width / W || 1
      const raw = notes.map((_, i) => {
        const el = st.querySelector<HTMLElement>(`[data-n="${i + 1}"]`)
        if (!el) return { tx: PIN_X, x: PIN_X, y: 0, ny: 0 }
        const r = el.getBoundingClientRect()
        return { tx: (r.right - base.left) / k, x: PIN_X, y: (r.top + r.height / 2 - base.top) / k, ny: 0 }
      })
      let last = -Infinity
      raw.forEach((p) => {
        p.ny = Math.max(p.y, last + 64)
        last = p.ny
      })
      setPins(raw)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(f)
    document.fonts?.ready.then(measure)
    return () => ro.disconnect()
  }, [notes, bleed])

  if (bleed) {
    return (
      <div className="ab is-fit" ref={frame}>
        <div className="ab-fit" ref={stage} style={{ zoom: s }}><M /></div>
      </div>
    )
  }
  const compact = s < 0.78
  return (
    <>
      <div className="ab" ref={frame}>
        <div className="ab-stage" ref={stage} style={{ transform: `translate(-50%, -50%) scale(${s})` }}>
          <div className="ab-mock"><M /></div>
          <svg className="ab-lines" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            {pins.map((p, i) => (
              <g key={i}>
                <path className="ab-tie" d={`M${p.tx + 4} ${p.y} H${p.x - 11}`} />
                <path d={`M${p.x + 11} ${p.y} H${NOTE_X - 18} V${p.ny} H${NOTE_X - 6}`} />
              </g>
            ))}
          </svg>
          {pins.map((p, i) => (
            <span key={i} className="ab-pin" style={{ left: p.x, top: p.y }}>{i + 1}</span>
          ))}
          {!compact &&
            pins.map((p, i) => (
              <span key={i} className="ab-note" style={{ left: NOTE_X, top: p.ny }}>{notes[i]}</span>
            ))}
        </div>
      </div>
      {compact && (
        <ol className="ab-list">
          {notes.map((n, i) => <li key={n}><span>{i + 1}</span>{n}</li>)}
        </ol>
      )}
    </>
  )
}
