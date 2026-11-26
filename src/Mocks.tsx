// Mock screens: simplified, readable interface fragments that sketch each project.
// They are illustrations built for this site, not product screenshots, and show no real data.
// Each one is cropped by its tile on purpose, like a detail shot.

function Interviewer() {
  return (
    <div className="mk-ui">
      <p className="mk-h">Choose an interview mode</p>
      <div className="mk-two">
        <div className="mk-opt">
          <b>Structured</b>
          <span>Every candidate gets the same questions, in the same order.</span>
          <ol className="mk-steps">
            <li>Intro</li><li>Q1</li><li>Q2</li><li>Q3</li><li>Wrap-up</li>
          </ol>
        </div>
        <div className="mk-opt is-on">
          <b>Adaptive</b>
          <span>Follow-up questions go deeper when an answer is thin.</span>
          <svg viewBox="0 0 220 70" className="mk-tree" aria-hidden="true">
            <path d="M12 35 C 44 35, 44 14, 76 14 M12 35 C 44 35, 44 56, 76 56 M76 14 C 108 14, 108 35, 140 35 M76 56 C 108 56, 108 35, 140 35 M140 35 L 208 35" />
            <circle cx="12" cy="35" r="7" /><circle cx="76" cy="14" r="7" /><circle cx="76" cy="56" r="7" className="y" /><circle cx="140" cy="35" r="7" /><circle cx="208" cy="35" r="7" />
            <text x="76" y="70" textAnchor="middle">follow-up</text>
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
        <span className="mk-sel">Español ▾</span>
      </div>
      <p className="mk-h">¿Qué enfoque mantiene el informe preciso?</p>
      <ul className="mk-answers">
        <li><i />Guardar solo las respuestas traducidas</li>
        <li className="is-on"><i />Mostrar la traducción y el original</li>
        <li><i />Volver a calcular la puntuación</li>
      </ul>
      <div className="mk-foot"><span className="mk-chip g">Translated from English</span><span className="mk-note">Code questions stay in English</span></div>
    </div>
  )
}

function Registration() {
  return (
    <div className="mk-ui">
      <p className="mk-h">Two quick details and you’re in.</p>
      <label className="mk-field"><span>Full name</span><i>Your name</i></label>
      <label className="mk-field"><span>Email</span><i>you@example.com</i></label>
      <label className="mk-check"><b>✓</b>I agree to be proctored during this test</label>
      <div className="mk-foot"><span className="mk-note">Takes about a minute</span><span className="mk-btn y">Start test →</span></div>
    </div>
  )
}

function Onboarding() {
  const steps = ['Explore', 'Apply', 'Verify', 'Assess', 'Ready']
  return (
    <div className="mk-ui">
      <ol className="mk-status">
        {steps.map((s, i) => (
          <li key={s} className={i < 3 ? 'done' : i === 3 ? 'now' : ''}><i />{s}</li>
        ))}
      </ol>
      <div className="mk-card">
        <b>Welcome back</b>
        <span>You stopped at the assessment. Your answers so far are saved.</span>
        <span className="mk-btn y">Resume</span>
      </div>
    </div>
  )
}

function Planner() {
  const on = new Set(['0-1', '0-2', '0-3', '1-4', '1-5', '2-0', '2-1', '3-5', '3-6', '3-7'])
  const rows = ['Design', 'Research', 'Ops', 'QA']
  return (
    <div className="mk-ui">
      <div className="mk-seg"><span className="is-on">Profile</span><span>Work type</span><span>Cohort</span></div>
      <div className="mk-grid">
        <span />
        {Array.from({ length: 8 }).map((_, c) => <span key={c} className="mk-col">W{c + 1}</span>)}
        {rows.map((r, ri) => (
          <div className="mk-grow" key={r}>
            <span className="mk-rowh">{r}</span>
            {Array.from({ length: 8 }).map((_, c) => (
              <i key={c} className={on.has(`${ri}-${c}`) ? 'on' : ri === 2 && c === 4 ? 'y' : ''} />
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
      <div className="mk-compare">
        <div><span>Without the tool</span><i style={{ width: '88%' }} /></div>
        <div><span>With the tool</span><i className="y" style={{ width: '52%' }} /></div>
      </div>
      <div className="mk-foot"><span className="mk-chip">Baseline assumptions</span><span className="mk-chip">How it’s calculated ↓</span></div>
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

export function Mock({ id }: { id: string }) {
  const M = MAP[id]
  return <M />
}
