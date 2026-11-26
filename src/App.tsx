import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode, type PointerEvent as ReactPointerEvent } from 'react'
import { sound } from './sound'
import blockN from './assets/obj/blockN.webp'
import blockK from './assets/obj/blockK.webp'
import cotImg from './assets/obj/cot.webp'
import shelfImg from './assets/obj/shelf.webp'
import booksImg from './assets/obj/books.webp'
import lineImg from './assets/obj/line.webp'
import bake0 from './assets/obj/bake0.webp'
import bake1 from './assets/obj/bake1.webp'
import bake2 from './assets/obj/bake2.webp'
import bake3 from './assets/obj/bake3.webp'
import plateImg from './assets/obj/plate.webp'
import trayImg from './assets/obj/tray.webp'
import hiBoard from './assets/obj/hiboard.webp'
import pegA from './assets/obj/pegA.webp'
import pegB from './assets/obj/pegB.webp'
import token22 from './assets/obj/token22.webp'
import token30 from './assets/obj/token30.webp'
import token38 from './assets/obj/token38.webp'
import token30w from './assets/obj/token30w.webp'
import token38w from './assets/obj/token38w.webp'

/* ------------------------------------------------------------------ */
/*  Content. Kept short on purpose: the site should be fun to scroll.  */
/* ------------------------------------------------------------------ */

const CONTACT_EMAIL = 'nehhaank@gmail.com'
const GITHUB_URL = 'https://github.com/nehhaank'

type Art = 'chat' | 'tiles' | 'steps' | 'grid' | 'bars' | 'form'

const projects: { title: string; where: string; art: Art; note: string; featured?: boolean }[] = [
  { title: 'AI Interviewer', where: 'WeCP', art: 'chat', featured: true, note: 'Helped shape the first AI interviewer, then structured vs. adaptive modes and multiple interviewers. The puzzle: make an unfamiliar AI conversation easy to understand and set up.' },
  { title: 'Tests in any language', where: 'WeCP', art: 'tiles', featured: true, note: 'Language choice, fallbacks, switching mid-test and translated reports, so a candidate anywhere gets the same fair test.' },
  { title: 'Candidate onboarding', where: 'WeCP', art: 'steps', note: 'Reworked registration to take the friction out of the minutes before a test even begins.' },
  { title: 'Capacity planner', where: 'Invisible Technologies', art: 'grid', note: 'A dense internal planning tool, rebuilt around one clear grid with views by profile, work type and cohort.' },
  { title: 'Savings dashboard', where: 'Invisible Technologies', art: 'bars', note: 'Made modeled savings readable and traceable: one hero number, honest comparisons, and the math laid open.' },
  { title: 'Expert applications', where: 'Invisible Technologies', art: 'form', note: 'Mapped the whole path from browsing to applying, signing up, coming back later and taking an inline assessment.' },
]

const smallThings = ['Report integrity', 'Proctoring status language', 'Section timers', 'Answer explanations', 'Listening questions', 'Readable graphs', 'Retake wording']

const tokens: { label: string; img: string; w: number; dark?: boolean; r: number }[] = [
  { label: 'Complex workflows', img: token38, w: 974, r: -1 },
  { label: 'Edge cases', img: token30w, w: 861, dark: true, r: 1.5 },
  { label: 'Data viz', img: token22, w: 740, r: -0.5 },
  { label: 'Systems thinking', img: token38w, w: 974, dark: true, r: 0.8 },
  { label: 'UX writing', img: token30, w: 861, r: -1.2 },
  { label: 'Research', img: token22, w: 740, r: 1 },
  { label: 'AI interactions', img: token38, w: 974, r: 0.6 },
  { label: 'Prototyping', img: token30, w: 861, r: -0.8 },
]


/* ------------------------------------------------------------------ */
/*  Small hooks                                                        */
/* ------------------------------------------------------------------ */

function useReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)'
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

function useSoundOn() {
  const [on, setOn] = useState(sound.on)
  useEffect(() => sound.subscribe(setOn), [])
  return on
}

/** Pieces settle onto the desk as they scroll into view. */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]')
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        })
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.1 },
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0)
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
  return progress
}

/* ------------------------------------------------------------------ */
/*  Bits and bobs                                                      */
/* ------------------------------------------------------------------ */

function Tape({ className = '' }: { className?: string }) {
  return <span className={`tape ${className}`} aria-hidden="true" />
}

function Kicker({ n, children }: { n: number; children: string }) {
  return (
    <p className="kicker" data-reveal>
      <span>{String(n).padStart(2, '0')}</span>
      {children}
    </p>
  )
}

function SoundToggle() {
  const on = useSoundOn()
  return (
    <button
      type="button"
      className={`sound-toggle ${on ? 'is-on' : ''}`}
      aria-pressed={on}
      aria-label={on ? 'Turn sound off' : 'Turn sound on'}
      onClick={() => sound.set(!on)}
    >
      <span className="sound-toggle__track" aria-hidden="true">
        <span className="sound-toggle__knob" />
      </span>
      <span className="sound-toggle__text">sound {on ? 'on' : 'off'}</span>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Hello                                                              */
/* ------------------------------------------------------------------ */

const greetings = ['hello!', 'welcome in', 'mind the tape', 'press again?', 'ok, now scroll ↓']

function Hero({ reduced }: { reduced: boolean }) {
  const stage = useRef<HTMLDivElement>(null)
  const [g, setG] = useState(0)
  const [pressed, setPressed] = useState(false)

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== 'mouse' || !stage.current) return
    const r = stage.current.getBoundingClientRect()
    stage.current.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
    stage.current.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
  }
  const onLeave = () => {
    stage.current?.style.setProperty('--mx', '0')
    stage.current?.style.setProperty('--my', '0')
  }

  return (
    <section id="hello" className="hero" aria-labelledby="hero-title">
      <div className="hero__copy">
        <p className="eyebrow" data-reveal>
          Product designer, maker, frisbee captain
        </p>
        <h1 id="hero-title" data-reveal>
          Hi, I’m{' '}
          <span className="hl">
            Neha
            <svg className="hl__stroke" viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden="true">
              <filter id="hl-rough" x="-5%" y="-30%" width="110%" height="160%">
                <feTurbulence type="fractalNoise" baseFrequency="0.02 0.3" numOctaves="2" seed="4" />
                <feDisplacementMap in="SourceGraphic" scale="9" />
              </filter>
              <path filter="url(#hl-rough)" d="M8 22 C 70 16, 160 14, 292 18 L 290 50 C 200 47, 100 52, 10 54 Z" />
            </svg>
          </span>
          .
        </h1>
        <p className="lede" data-reveal>
          I untangle complicated software until it feels simple. Off-screen I’m on a frisbee field, at a workbench, or near an oven.
        </p>
        <div className="hero__actions" data-reveal>
          <a className="btn" href="#work" onClick={() => sound.tap()}>
            See the work <span aria-hidden="true">↓</span>
          </a>
          <a className="btn btn--ghost" href="#hi" onClick={() => sound.tap()}>
            Say hi
          </a>
        </div>
      </div>

      <div className="hero__stage" ref={stage} onPointerMove={onMove} onPointerLeave={onLeave}>
        <div className="phone cardboard" data-reveal>
          <Tape className="tape--phone" />
          <span className="phone__speaker" aria-hidden="true" />
          <div className="phone__screen paper">
            <div className="phone__status" aria-hidden="true">
              <span>9:41</span>
              <span className="phone__dots">
                <i />
                <i />
                <i />
              </span>
            </div>
            <p className="phone__greet marker" aria-live="polite">
              {greetings[g]}
            </p>
            <div className="phone__lines" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <button
              type="button"
              className={`phone__btn clay clay--terracotta ${pressed ? 'is-pressed' : ''}`}
              onPointerDown={() => setPressed(true)}
              onPointerUp={() => setPressed(false)}
              onPointerLeave={() => setPressed(false)}
              onClick={() => {
                sound.squish()
                setG(v => (v + 1) % greetings.length)
              }}
            >
              press
            </button>
          </div>
        </div>

        <img className="obj obj--n" src={blockN} alt="" width={595} height={471} />
        <img className="obj obj--k" src={blockK} alt="" width={591} height={458} />
        <div className="hero__cursor" aria-hidden="true">
          <svg viewBox="0 0 40 52">
            <path d="M4 3 L35 31 L21 32 L28 48 L21 50 L14 35 L4 44 Z" />
          </svg>
        </div>
        <p className="marker hero__note" aria-hidden="true">
          go on, press it
          <svg viewBox="0 0 80 40">
            <path d="M4 34 C 26 34, 50 26, 68 6 M68 6 L 56 10 M68 6 L 68 19" />
          </svg>
        </p>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Work                                                               */
/* ------------------------------------------------------------------ */

/** Small, believable UI sketches. Text is placeholder-level and never claims outcomes. */
function ProjectArt({ art }: { art: Art }) {
  switch (art) {
    case 'chat':
      return (
        <div className="ui ui--chat">
          <div className="ui__bar">
            <span className="ui__dot" />
            <b>AI interview</b>
            <span className="ui__seg">
              <i className="is-on">Structured</i>
              <i>Adaptive</i>
            </span>
          </div>
          <div className="ui__body">
            <div className="msg msg--ai">
              <span className="avatar">AI</span>
              <p>Walk me through a tricky bug you fixed recently.</p>
            </div>
            <div className="msg msg--me">
              <p>
                <i style={{ width: '92%' }} />
                <i style={{ width: '64%' }} />
              </p>
            </div>
            <div className="msg msg--ai">
              <span className="avatar">AI</span>
              <p>What would you check first next time?</p>
            </div>
            <div className="msg msg--me">
              <p>
                <i style={{ width: '80%' }} />
              </p>
            </div>
          </div>
          <div className="ui__foot">
            <span className="wave">
              {[6, 12, 18, 10, 15, 7, 13, 9, 16, 8, 11, 5].map((h, i) => (
                <i key={i} style={{ height: h }} />
              ))}
            </span>
            <span className="ui__rec">Listening</span>
          </div>
        </div>
      )
    case 'tiles':
      return (
        <div className="ui ui--lang">
          <div className="ui__bar">
            <span className="ui__dot" />
            <b>Choose your test language</b>
          </div>
          <div className="ui__body lang">
            {[
              ['English', 'Aa'],
              ['हिन्दी', 'अ'],
              ['ಕನ್ನಡ', 'ಕ'],
              ['中文', '文'],
              ['Español', 'Ñ'],
              ['العربية', 'ع'],
            ].map(([name, glyph], i) => (
              <span key={name} className={`lang__opt ${i === 2 ? 'is-on' : ''}`}>
                <span className="lang__g">{glyph}</span>
                {name}
              </span>
            ))}
          </div>
          <div className="ui__foot">
            <span className="ui__note">You can switch during the test</span>
            <span className="ui__btn">Continue</span>
          </div>
        </div>
      )
    case 'steps':
      return (
        <div className="ui ui--steps">
          <div className="stepper">
            {['Details', 'Check', 'Ready'].map((t, i) => (
              <span key={t} className={`stepper__s ${i < 2 ? 'is-done' : ''} ${i === 2 ? 'is-now' : ''}`}>
                <b>{i < 2 ? '✓' : 3}</b>
                {t}
              </span>
            ))}
          </div>
          <div className="ui__field">
            <i style={{ width: '38%' }} />
          </div>
          <div className="ui__field">
            <i style={{ width: '56%' }} />
          </div>
          <span className="ui__btn ui__btn--wide">Start test</span>
        </div>
      )
    case 'grid':
      return (
        <div className="ui ui--grid">
          <div className="ui__tabs">
            <i className="is-on">Profile</i>
            <i>Work type</i>
            <i>Cohort</i>
          </div>
          <div className="heat">
            {[1, 2, 3, 1, 0, 2, 3, 3, 2, 1, 0, 1, 2, 3, 2, 1, 1, 0, 1, 2].map((v, i) => (
              <span key={i} className={`heat__c v${v}`} />
            ))}
          </div>
        </div>
      )
    case 'bars':
      return (
        <div className="ui ui--bars">
          <div className="kpi">
            <span>Modeled savings</span>
            <b />
            <em>Show the math</em>
          </div>
          <div className="bars">
            {[38, 52, 46, 70, 62, 80].map((h, i) => (
              <i key={i} className={i === 5 ? 'is-on' : ''} style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="legend">
            <span>
              <i className="is-on" />
              Modeled
            </span>
            <span>
              <i />
              Baseline
            </span>
          </div>
        </div>
      )
    case 'form':
      return (
        <div className="ui ui--form">
          {['Browse roles', 'Apply', 'Sign up', 'Inline assessment'].map((t, i) => (
            <div key={t} className={`path ${i < 2 ? 'is-done' : ''} ${i === 2 ? 'is-now' : ''}`}>
              <span className="path__dot" />
              {t}
            </div>
          ))}
          <span className="ui__later">Save and finish later</span>
        </div>
      )
  }
}

function Feature({ p, i }: { p: (typeof projects)[number]; i: number }) {
  return (
    <li className={`feature ${i % 2 ? 'feature--flip' : ''}`} data-reveal>
      <div className="feature__sheet">
        <div className="project__screen feature__screen">
          <ProjectArt art={p.art} />
        </div>
      </div>
      <div className="feature__text">
        <p className="feature__where">
          <span>{String(i + 1).padStart(2, '0')}</span>
          {p.where}
        </p>
        <h3 className="feature__title">{p.title}</h3>
        <p className="feature__note">{p.note}</p>
        <p className="feature__soon">Case study in progress</p>
      </div>
    </li>
  )
}

function ProjectCard({ p, i }: { p: (typeof projects)[number]; i: number }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <li className={`project ${p.featured ? 'project--big' : ''}`} data-reveal style={{ '--d': `${(i % 4) * 70}ms` } as CSSProperties}>
      <button
        type="button"
        className={`project__flip ${flipped ? 'is-flipped' : ''}`}
        aria-pressed={flipped}
        aria-label={`${p.title}, ${p.where}. ${flipped ? 'Showing note. Press to flip back.' : 'Press to read a note.'}`}
        onClick={() => {
          setFlipped(f => !f)
          sound.tap()
        }}
      >
        <span className="project__face project__front">
          <span className="project__screen">
            <ProjectArt art={p.art} />
          </span>
          <span className="project__meta">
            <span className="project__title">{p.title}</span>
            <span className="project__where">{p.where}</span>
          </span>
          <span className="project__turn" aria-hidden="true">
            Flip ↻
          </span>
        </span>
        <span className="project__face project__back" aria-hidden={!flipped}>
          <span className="project__note">{p.note}</span>
          <span className="project__soon">Full story being written</span>
        </span>
      </button>
    </li>
  )
}

function Work() {
  return (
    <section id="work" className="mat-wrap" aria-labelledby="work-title">
      <div className="mat">
        <span className="mat__ruler" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (
            <b key={i} style={{ left: i * 160 }}>
              {i * 5}
            </b>
          ))}
        </span>
        <span className="mat__ruler mat__ruler--side" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <b key={i} style={{ top: i * 160 }}>
              {i * 5}
            </b>
          ))}
        </span>
        <span className="mat__print" aria-hidden="true">
          Self-healing · 5 mm grid
        </span>
        <div className="mat__inner">
          <Kicker n={1}>Work</Kicker>
          <div className="section__head">
            <h2 id="work-title" data-reveal>
              Prototypes from my desk
            </h2>
            <p className="section__aside" data-reveal>
              Selected work from WeCP and Invisible Technologies.
            </p>
          </div>
          <ul className="features">
            {projects
              .filter(p => p.featured)
              .map((p, i) => (
                <Feature key={p.title} p={p} i={i} />
              ))}
          </ul>
          <ul className="projects">
            {projects
              .filter(p => !p.featured)
              .map((p, i) => (
                <ProjectCard key={p.title} p={p} i={i} />
              ))}
          </ul>
          <div className="also" data-reveal>
            <p className="also__k">Also shipped</p>
            <ul className="also__list">
              {smallThings.map(s => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  How I work: wooden tokens you can push around                      */
/* ------------------------------------------------------------------ */

function Token({ t, i }: { t: (typeof tokens)[number]; i: number }) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const start = useRef({ px: 0, py: 0, x: 0, y: 0 })

  const down = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    start.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y }
    setDragging(true)
    sound.tok()
  }
  const move = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragging) return
    setPos({ x: start.current.x + e.clientX - start.current.px, y: start.current.y + e.clientY - start.current.py })
  }
  const up = () => {
    if (!dragging) return
    setDragging(false)
    sound.tok()
  }

  return (
    <li className="token-slot" data-reveal style={{ '--d': `${i * 50}ms`, '--w': t.w / 974 } as CSSProperties}>
      <button
        type="button"
        className={`token ${t.dark ? 'token--dark' : ''} ${dragging ? 'is-dragging' : ''}`}
        style={{ '--x': `${pos.x}px`, '--y': `${pos.y}px`, '--r': `${t.r}deg` } as CSSProperties}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            sound.tok()
          }
        }}
      >
        <img src={t.img} alt="" draggable={false} />
        <span>{t.label}</span>
      </button>
    </li>
  )
}

function How() {
  return (
    <section id="how" className="section section--how" aria-labelledby="how-title">
      <div className="how">
        <div className="how__copy">
          <h2 id="how-title" data-reveal>
            How I work
          </h2>
          <p data-reveal>
            I work closely with product, engineering and research, and I like owning the messy middle: the states, the edge cases and the words on the buttons.
          </p>
          <p className="how__hint" data-reveal>
            The pieces in the tray slide around. Try one.
          </p>
        </div>
        <div className="tray-wrap" data-reveal>
          <img className="tray-img" src={trayImg} alt="" width={1240} height={780} draggable={false} />
          <ul className="tokens">
            {tokens.map((t, i) => (
              <Token key={t.label} t={t} i={i} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  On the field: throw the disc                                       */
/* ------------------------------------------------------------------ */

function Field({ reduced }: { reduced: boolean }) {
  const field = useRef<HTMLDivElement>(null)
  const disc = useRef<HTMLButtonElement>(null)
  const state = useRef({ x: 0.14, y: 0.5, vx: 0, vy: 0, spin: 0, dragging: false, thrown: false, trail: [] as { x: number; y: number; t: number }[] })
  const raf = useRef(0)
  const [points, setPoints] = useState(0)
  const [cheer, setCheer] = useState(false)

  const paint = useCallback(() => {
    const s = state.current
    if (!disc.current) return
    disc.current.style.left = `${s.x * 100}%`
    disc.current.style.top = `${s.y * 100}%`
    disc.current.style.setProperty('--spin', `${s.spin}deg`)
  }, [])

  const score = useCallback(() => {
    setPoints(p => p + 1)
    setCheer(true)
    sound.chime(true)
    window.setTimeout(() => setCheer(false), 1600)
    window.setTimeout(() => {
      const s = state.current
      s.x = 0.14
      s.y = 0.5
      s.spin = 0
      paint()
    }, 1300)
  }, [paint])

  const step = useCallback(() => {
    const s = state.current
    const f = field.current
    if (!f) return
    s.x += s.vx / f.clientWidth
    s.y += s.vy / f.clientHeight
    s.vx *= 0.975
    s.vy *= 0.975
    s.spin += Math.hypot(s.vx, s.vy) * 2.2
    const pad = 0.04
    if (s.x < pad || s.x > 1 - pad) {
      s.vx *= -0.55
      s.x = Math.min(1 - pad, Math.max(pad, s.x))
      sound.tap()
    }
    if (s.y < pad * 2 || s.y > 1 - pad * 2) {
      s.vy *= -0.55
      s.y = Math.min(1 - pad * 2, Math.max(pad * 2, s.y))
      sound.tap()
    }
    paint()
    if (Math.hypot(s.vx, s.vy) > 0.25) raf.current = requestAnimationFrame(step)
    else if (s.thrown) {
      s.thrown = false
      if (s.x > 0.82) score()
    }
  }, [paint, score])

  useEffect(() => {
    paint()
    return () => cancelAnimationFrame(raf.current)
  }, [paint])

  const down = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (reduced) return
    cancelAnimationFrame(raf.current)
    e.currentTarget.setPointerCapture(e.pointerId)
    const s = state.current
    s.dragging = true
    s.vx = s.vy = 0
    s.trail = [{ x: e.clientX, y: e.clientY, t: performance.now() }]
  }
  const move = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const s = state.current
    if (!s.dragging || !field.current) return
    const r = field.current.getBoundingClientRect()
    s.x = Math.min(0.96, Math.max(0.04, (e.clientX - r.left) / r.width))
    s.y = Math.min(0.92, Math.max(0.08, (e.clientY - r.top) / r.height))
    s.trail.push({ x: e.clientX, y: e.clientY, t: performance.now() })
    if (s.trail.length > 6) s.trail.shift()
    paint()
  }
  const up = () => {
    const s = state.current
    if (!s.dragging) return
    s.dragging = false
    const a = s.trail[0]
    const b = s.trail[s.trail.length - 1]
    const dt = Math.max(16, b.t - a.t)
    s.vx = Math.max(-60, Math.min(60, ((b.x - a.x) / dt) * 16))
    s.vy = Math.max(-60, Math.min(60, ((b.y - a.y) / dt) * 16))
    const speed = Math.hypot(s.vx, s.vy)
    if (speed > 2) {
      s.thrown = true
      sound.whoosh(speed / 30)
    }
    raf.current = requestAnimationFrame(step)
  }
  const keyThrow = () => {
    const s = state.current
    if (reduced) {
      s.x = 0.9
      s.y = 0.5
      paint()
      score()
      return
    }
    s.x = 0.14
    s.y = 0.5
    s.vx = 34
    s.vy = (Math.random() - 0.5) * 6
    s.thrown = true
    sound.whoosh(1)
    raf.current = requestAnimationFrame(step)
  }

  return (
    <section id="field" className="section" aria-labelledby="field-title">
      <Kicker n={2}>On the field</Kicker>
      <div className="section__head section__head--split">
        <h2 id="field-title" data-reveal>
          Weekends are for Ultimate frisbee
        </h2>
        <p className="section__aside" data-reveal>
          Captain and Level 1 coach at Learning to Fly, Bengaluru.
        </p>
      </div>

      <div className="field-grid">
        <div className="pitch-wrap wood" data-reveal>
          <div className="pitch felt" ref={field}>
            <span className="pitch__line pitch__line--l" aria-hidden="true" />
            <span className="pitch__line pitch__line--r" aria-hidden="true" />
            <span className="pitch__zone" aria-hidden="true">
              end zone
            </span>
            {[
              [0.4, 0.26, pegA],
              [0.56, 0.68, pegA],
              [0.7, 0.36, pegB],
            ].map(([x, y, src], i) => (
              <img key={i} className="peg" src={src as string} alt="" style={{ left: `${(x as number) * 100}%`, top: `${(y as number) * 100}%` }} />
            ))}
            <button
              ref={disc}
              type="button"
              className="disc"
              aria-label={`Frisbee. Press Enter to throw it. Points scored: ${points}`}
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
              onClick={e => {
                if (e.detail === 0 || reduced) keyThrow()
              }}
            >
              <span />
            </button>
            <p className={`pitch__cheer marker ${cheer ? 'is-on' : ''}`} aria-live="polite">
              {cheer ? 'point!' : ''}
            </p>
            <p className="pitch__hint">{reduced ? 'Press the disc to score' : 'Drag the disc, then let go'}</p>
            <span className="brick brick--l" aria-hidden="true" />
            <span className="brick brick--r" aria-hidden="true" />
            <p className="pitch__score">
              Points <b>{points}</b>
            </p>
          </div>
        </div>

        <ul className="cards">
          <li className="card paper" data-reveal>
            <span className="card__k">Since Oct 2026</span>
            <p>
              <strong>Captain</strong> at Learning to Fly (L2F), Bengaluru
            </p>
          </li>
          <li className="card paper" data-reveal style={{ '--d': '70ms' } as CSSProperties}>
            <span className="card__k">Oct 2026</span>
            <p>
              Played the <strong>Pan-Asia</strong> tournament in Hong Kong
            </p>
          </li>
          <li className="card paper" data-reveal style={{ '--d': '140ms' } as CSSProperties}>
            <span className="card__k">Coaching</span>
            <p>
              <strong>Level 1 coaching.</strong> I plan drills for short throws, break-marks and resets
            </p>
          </li>
          <li className="card paper" data-reveal style={{ '--d': '210ms' } as CSSProperties}>
            <span className="card__k">Training</span>
            <p>
              Track <strong>sprints</strong> three times a week, plus the gym
            </p>
          </li>
          <li className="card paper card--kit" data-reveal style={{ '--d': '280ms' } as CSSProperties}>
            <span className="swatch" aria-hidden="true">
              <svg viewBox="0 0 80 80">
                <g className="swatch__map">
                  <path d="M-4 22 L40 46 L84 30 M10 84 L34 40 L28 -4 M58 84 L50 50 L84 58 M-4 60 L44 56 L70 -4" />
                </g>
                <g className="swatch__flower" transform="translate(54 58)">
                  {[0, 72, 144, 216, 288].map(a => (
                    <ellipse key={a} rx="5" ry="9" transform={`rotate(${a}) translate(0 -7)`} />
                  ))}
                  <circle r="3.2" />
                </g>
              </svg>
            </span>
            <span className="card__k">Side project</span>
            <p>
              <strong>Kit concepts</strong> for the Hong Kong trip: ivory, gold street-map lines, a red flower
            </p>
          </li>
        </ul>
      </div>

    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Made by hand                                                       */
/* ------------------------------------------------------------------ */

const bakes = [bake0, bake1, bake2, bake3]

function BakeBoard() {
  const [bites, setBites] = useState(0)
  useEffect(() => {
    bakes.forEach(src => {
      const im = new Image()
      im.src = src
    })
  }, [])
  return (
    <button
      type="button"
      className="bakeboard"
      aria-label={bites === 3 ? 'A board of cookie, brownie and focaccia, all bitten. Press to bake a fresh batch.' : 'A board with a cookie, a brownie and focaccia. Press to take a bite.'}
      onClick={() => {
        sound.squish()
        setBites(b => (b + 1) % 4)
      }}
    >
      <img src={bakes[bites]} alt="" width={860} height={239} draggable={false} />
    </button>
  )
}

function Shelf({ items, labels }: { items: ReactNode; labels: [string, string][] }) {
  return (
    <div className="shelf" data-reveal>
      <div className="shelf__items">{items}</div>
      <img className="shelf__plank" src={shelfImg} alt="" width={2300} height={289} draggable={false} />
      <div className="shelf__labels">
        {labels.map(([name, meta]) => (
          <p key={name}>
            <span className="item__name">{name}</span>
            <span className="item__meta">{meta}</span>
          </p>
        ))}
      </div>
    </div>
  )
}

function Making() {
  const [wobble, setWobble] = useState(0)
  return (
    <section id="making" className="section" aria-labelledby="making-title">
      <Kicker n={3}>Made by hand</Kicker>
      <div className="section__head section__head--big">
        <h2 id="making-title" data-reveal>
          I like making real things too
        </h2>
      </div>

      <div className="shelves">
        <Shelf
          items={
            <>
              <figure className="item item--cot">
                <button
                  type="button"
                  key={wobble}
                  className={`cot ${wobble ? 'is-wobbling' : ''}`}
                  aria-label="A small wooden four-poster cot. Press to give it a nudge."
                  onClick={() => {
                    sound.tok()
                    setWobble(w => w + 1)
                  }}
                >
                  <img src={cotImg} alt="" width={909} height={691} draggable={false} />
                </button>
              </figure>
              <figure className="item item--bake">
                <BakeBoard />
              </figure>
            </>
          }
          labels={[
            ['Four-poster cot', 'In progress, with a mentor. Tap to nudge'],
            ['Cookies, brownies, focaccia, apple pie', 'Still testing substitutions. Tap for a bite'],
          ]}
        />
        <Shelf
          items={
            <>
              <figure className="item item--line">
                <img src={lineImg} alt="" width={620} height={288} draggable={false} />
              </figure>
              <figure className="item item--books">
                <img src={booksImg} alt="" width={600} height={407} draggable={false} />
              </figure>
            </>
          }
          labels={[
            ['Pocket travel clothesline', 'An experiment'],
            ['Fantasy books, Eragon first', 'On the reading shelf'],
          ]}
        />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Right now                                                          */
/* ------------------------------------------------------------------ */

const nowNotes = [
  { k: 'Leading', t: 'captaining L2F' },
  { k: 'Training', t: 'sprints, three times a week' },
  { k: 'Building', t: 'a four-poster cot' },
  { k: 'Writing', t: 'case studies for this site' },
]

function Now() {
  return (
    <section id="now" className="section section--now" aria-labelledby="now-title">
      <div className="now">
        <h2 id="now-title" className="now__title" data-reveal>
          Right now
          <span>Updated Nov 2026</span>
        </h2>
        <ul className="now__list">
          {nowNotes.map((n, i) => (
            <li key={n.k} className="now__item" data-reveal style={{ '--d': `${i * 70}ms` } as CSSProperties}>
              <span className="now__k">{n.k}</span>
              <span className="now__t">{n.t}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Say hi                                                             */
/* ------------------------------------------------------------------ */

function SayHi() {
  return (
    <section id="hi" className="closing" aria-labelledby="hi-title">
      <div className="closing__inner">
        <img className="closing__board" src={hiBoard} alt="" width={900} height={380} aria-hidden="true" />
        <Kicker n={4}>Say hi</Kicker>
        <h2 id="hi-title" data-reveal>
          Let’s make something.
        </h2>
        <p className="closing__sub" data-reveal>
          On a screen, or on a workbench.
        </p>
        <a className="closing__mail" href={`mailto:${CONTACT_EMAIL}`} onClick={() => sound.tap()} data-reveal>
          {CONTACT_EMAIL}
          <span aria-hidden="true">↗</span>
        </a>
        <div className="closing__links" data-reveal>
          <a className="btn btn--light" href={`mailto:${CONTACT_EMAIL}`} onClick={() => sound.tap()}>
            Write to me
          </a>
          <a className="btn btn--line" href={GITHUB_URL} target="_blank" rel="noreferrer" onClick={() => sound.tap()}>
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>
        <footer className="footer">
          <p>Neha NK, 2026. Cardboard, wood, clay and code.</p>
          <a href="#hello" onClick={() => sound.tap()}>
            Back to top ↑
          </a>
        </footer>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

export default function App() {
  const reduced = useReducedMotion()
  const progress = useScrollProgress()
  useReveal()

  return (
    <div className={`site ${reduced ? 'is-reduced' : ''}`}>
      <a className="skip-link" href="#work">
        Skip to work
      </a>
      <div className="progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>
      <header className="topbar">
        <a href="#hello" className="plate" onClick={() => sound.tok()} aria-label="Neha NK, back to top">
          <img src={plateImg} alt="" width={300} height={103} />
        </a>
        <nav aria-label="Main" className="tabs">
          {[
            ['work', 'Work'],
            ['field', 'Frisbee'],
            ['making', 'Making'],
            ['hi', 'Say hi'],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} className="tab" onClick={() => sound.tap()}>
              {label}
            </a>
          ))}
        </nav>
      </header>
      <SoundToggle />

      <main>
        <Hero reduced={reduced} />
        <Work />
        <How />
        <Field reduced={reduced} />
        <Making />
        <Now />
        <SayHi />
      </main>

    </div>
  )
}

