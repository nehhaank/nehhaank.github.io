import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { sound } from './sound'
import blockN from './assets/obj/blockN.webp'
import blockK from './assets/obj/blockK.webp'
import cotImg from './assets/obj/cot.webp'
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
  { label: 'Complex workflows', img: token38, w: 974, r: -3 },
  { label: 'Systems thinking', img: token38w, w: 974, dark: true, r: 2 },
  { label: 'AI interactions', img: token38, w: 974, r: 4 },
  { label: 'Edge cases', img: token30w, w: 861, dark: true, r: -2 },
  { label: 'UX writing', img: token30, w: 861, r: 3 },
  { label: 'Data viz', img: token22, w: 740, r: -4 },
  { label: 'Research', img: token22, w: 740, r: 1 },
  { label: 'Prototyping', img: token30, w: 861, r: -1 },
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

function ShippingLabel({ n, children }: { n: number; children: string }) {
  return (
    <p className="ship" data-reveal>
      <span className="ship__no">box {String(n).padStart(2, '0')}</span>
      <span className="ship__name">{children}</span>
      <span className="ship__arrow" aria-hidden="true">
        ↑↑ this side up
      </span>
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
          <span className="tape-word">
            Neha
            <Tape className="tape--word" />
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

function ProjectArt({ art }: { art: Art }) {
  switch (art) {
    case 'chat':
      return (
        <div className="art art--chat">
          <span className="sk sk--bubble" />
          <span className="sk sk--bubble sk--me" />
          <span className="sk sk--bubble sk--short" />
          <span className="wave">
            {[6, 14, 22, 12, 18, 8, 16, 10, 20, 9].map((h, i) => (
              <i key={i} style={{ height: h }} />
            ))}
          </span>
          <span className="sk sk--input">
            <i />
          </span>
        </div>
      )
    case 'tiles':
      return (
        <div className="art art--tiles">
          {['Aa', 'अ', 'ಕ', '文', 'Ñ', 'ع'].map((t, i) => (
            <span key={t} className={`letter-tile wood ${i % 2 ? 'wood--walnut' : ''}`} style={{ '--r': `${(i % 3) * 3 - 3}deg` } as CSSProperties}>
              {t}
            </span>
          ))}
        </div>
      )
    case 'steps':
      return (
        <div className="art art--steps">
          {[1, 2, 3].map(n => (
            <span key={n} className={`step ${n === 3 ? 'is-now' : ''}`}>
              <b>{n}</b>
              <i />
            </span>
          ))}
        </div>
      )
    case 'grid':
      return (
        <div className="art art--grid">
          {Array.from({ length: 15 }, (_, i) => (
            <span key={i} className={`cell ${[2, 6, 7, 11].includes(i) ? 'is-on' : ''}`} />
          ))}
        </div>
      )
    case 'bars':
      return (
        <div className="art art--bars">
          <span className="sk sk--big" />
          <div className="bars">
            {[38, 56, 44, 72, 64].map((h, i) => (
              <i key={i} className={i === 3 ? 'is-on' : ''} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      )
    case 'form':
      return (
        <div className="art art--form">
          {[true, true, false].map((done, i) => (
            <div key={i} className="form-row">
              <span className={`check ${done ? 'is-done' : ''}`} />
              <span className="field-line" />
            </div>
          ))}
          <span className="sk sk--btn" />
        </div>
      )
  }
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
        <span className="project__face project__front cardboard">
          <span className="project__screen paper">
            <ProjectArt art={p.art} />
          </span>
          <span className="project__meta">
            <span className="project__title">{p.title}</span>
            <span className="project__where">{p.where}</span>
          </span>
          <span className="project__turn" aria-hidden="true">
            ↻
          </span>
        </span>
        <span className="project__face project__back cardboard cardboard--inside" aria-hidden={!flipped}>
          <span className="project__note">{p.note}</span>
          <span className="project__soon">Full story being written</span>
        </span>
      </button>
    </li>
  )
}

function Work() {
  return (
    <section id="work" className="section" aria-labelledby="work-title">
      <ShippingLabel n={1}>work</ShippingLabel>
      <div className="section__head">
        <h2 id="work-title" data-reveal>
          Prototypes from my desk
        </h2>
        <p className="section__aside" data-reveal>
          Six projects from WeCP and Invisible Technologies. Tap a card to turn it over.
        </p>
      </div>
      <ul className="projects">
        {projects.map((p, i) => (
          <ProjectCard key={p.title} p={p} i={i} />
        ))}
      </ul>
      <div className="drawer" data-reveal>
        <div className="drawer__front wood wood--walnut">
          <span className="drawer__pull" aria-hidden="true" />
          <p className="drawer__label">and a drawer of smaller fixes</p>
        </div>
        <ul className="drawer__tags">
          {smallThings.map((s, i) => (
            <li key={s} className="label-tape" style={{ '--r': `${((i * 7) % 5) - 2}deg` } as CSSProperties}>
              {s}
            </li>
          ))}
        </ul>
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
    <li className="token-slot" data-reveal style={{ '--d': `${i * 50}ms` } as CSSProperties}>
      <button
        type="button"
        className={`token ${t.dark ? 'token--dark' : ''} ${dragging ? 'is-dragging' : ''}`}
        style={{ '--x': `${pos.x}px`, '--y': `${pos.y}px`, '--r': `${t.r}deg`, width: Math.round(t.w * 0.25) } as CSSProperties}
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
          <p className="marker how__hint" data-reveal>
            the tokens slide, try one
          </p>
        </div>
        <ul className="tokens">
          {tokens.map((t, i) => (
            <Token key={t.label} t={t} i={i} />
          ))}
        </ul>
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
      <ShippingLabel n={2}>on the field</ShippingLabel>
      <div className="section__head">
        <h2 id="field-title" data-reveal>
          Weekends are for Ultimate frisbee
        </h2>
        <p className="section__aside" data-reveal>
          {reduced ? 'Press the disc to score a point.' : 'Grab the disc and fling it into the end zone.'}
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
        </ul>
      </div>

      <div className="kit" data-reveal>
        <div className="kit__jersey">
          <svg viewBox="0 0 220 220" role="img" aria-label="A cut-out of an ivory jersey with gold street-map lines and a red flower">
            <defs>
              <clipPath id="jersey-shape">
                <path d="M70 18 Q110 40 150 18 L198 44 L182 92 L160 84 L162 204 L58 204 L60 84 L38 92 L22 44 Z" />
              </clipPath>
              <filter id="paperish">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n" />
                <feColorMatrix in="n" values="0 0 0 0 0.4  0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0.12 0" result="g" />
                <feComposite in="g" in2="SourceGraphic" operator="in" result="gi" />
                <feMerge>
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode in="gi" />
                </feMerge>
              </filter>
            </defs>
            <path className="kit__board" d="M74 23 Q114 45 154 23 L203 49 L187 97 L165 89 L167 209 L63 209 L65 89 L43 97 L27 49 Z" />
            <g filter="url(#paperish)">
              <path className="kit__base" d="M70 18 Q110 40 150 18 L198 44 L182 92 L160 84 L162 204 L58 204 L60 84 L38 92 L22 44 Z" />
            </g>
            <g clipPath="url(#jersey-shape)" className="kit__map">
              <path d="M40 60 L120 120 L200 90 M60 200 L100 110 L90 40 M150 210 L130 130 L190 150 M20 140 L110 150 L170 60" />
              <path d="M70 170 Q 100 160 140 180 M80 70 Q 120 90 160 70" />
            </g>
            <g className="kit__flower" transform="translate(132 150)">
              {[0, 72, 144, 216, 288].map(a => (
                <ellipse key={a} rx="9" ry="17" transform={`rotate(${a}) translate(0 -13)`} />
              ))}
              <circle r="6" className="kit__flower-c" />
            </g>
            <path className="kit__collar" d="M70 18 Q110 40 150 18" />
          </svg>
        </div>
        <div className="kit__text">
          <span className="card__k">Side project</span>
          <p>Kit concepts for L2F’s Hong Kong trip: an ivory base, fine gold street-map lines and a red flower.</p>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Made by hand                                                       */
/* ------------------------------------------------------------------ */

function Bakeable({ kind, label }: { kind: 'cookie' | 'brownie' | 'focaccia'; label: string }) {
  const [bites, setBites] = useState(0)
  return (
    <button
      type="button"
      className={`bake bake--${kind} bites-${bites}`}
      aria-label={`${label}. ${bites === 3 ? 'All gone. Press to bake another.' : 'Press to take a bite.'}`}
      onClick={() => {
        sound.squish()
        setBites(b => (b + 1) % 4)
      }}
    >
      <span className={`bake__body clay clay--${kind}`}>
        {kind === 'cookie' && [0, 1, 2, 3, 4].map(i => <i key={i} />)}
        {kind === 'focaccia' && [0, 1, 2, 3, 4, 5].map(i => <i key={i} />)}
      </span>
    </button>
  )
}

function Making() {
  const [wobble, setWobble] = useState(0)
  return (
    <section id="making" className="section" aria-labelledby="making-title">
      <ShippingLabel n={3}>made by hand</ShippingLabel>
      <div className="section__head">
        <h2 id="making-title" data-reveal>
          I like making real things too
        </h2>
        <p className="section__aside" data-reveal>
          Woodwork, baking and small experiments. The cookie is edible, sort of.
        </p>
      </div>

      <div className="shelf-unit">
        <div className="shelf" data-reveal>
          <div className="shelf__items">
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
              <figcaption>
                <span className="item__name">Four-poster cot</span>
                <span className="item__meta">in progress, with a mentor</span>
              </figcaption>
            </figure>

            <figure className="item item--tray">
              <div className="tray wood wood--walnut">
                <Bakeable kind="cookie" label="Chocolate-chip cookie" />
                <Bakeable kind="brownie" label="Brownie" />
                <Bakeable kind="focaccia" label="Focaccia" />
              </div>
              <figcaption>
                <span className="item__name">Cookies, brownies, focaccia, apple pie</span>
                <span className="item__meta">still testing substitutions</span>
              </figcaption>
            </figure>
          </div>
          <div className="shelf__plank wood" aria-hidden="true" />
        </div>

        <div className="shelf" data-reveal>
          <div className="shelf__items">
            <figure className="item">
              <div className="line" aria-hidden="true">
                <svg viewBox="0 0 200 50" preserveAspectRatio="none">
                  <path d="M4 10 Q 100 40 196 10" />
                </svg>
                {['sky', 'mango', 'sage'].map((c, i) => (
                  <span key={c} className={`line__tag clay clay--${c}`} style={{ '--i': i } as CSSProperties} />
                ))}
              </div>
              <figcaption>
                <span className="item__name">Pocket travel clothesline</span>
                <span className="item__meta">an experiment</span>
              </figcaption>
            </figure>
            <figure className="item">
              <div className="books" aria-hidden="true">
                <span className="book book--a" />
                <span className="book book--b" />
                <span className="book book--c" />
                <span className="book book--d" />
              </div>
              <figcaption>
                <span className="item__name">Fantasy books, Eragon first</span>
                <span className="item__meta">on the reading shelf</span>
              </figcaption>
            </figure>
            <figure className="item">
              <div className="mini-phone cardboard" aria-hidden="true">
                <span className="paper" />
              </div>
              <figcaption>
                <span className="item__name">This website</span>
                <span className="item__meta">built by hand, in code</span>
              </figcaption>
            </figure>
          </div>
          <div className="shelf__plank wood" aria-hidden="true" />
        </div>
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
          <span>Nov 2026</span>
        </h2>
        <ul className="now__list">
          {nowNotes.map((n, i) => (
            <li key={n.k} className="now__item" data-reveal style={{ '--d': `${i * 70}ms` } as CSSProperties}>
              <span className="card__k">{n.k}</span>
              <span className="marker">{n.t}</span>
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

function LostAndFound() {
  const [open, setOpen] = useState(false)
  return (
    <button
      type="button"
      className={`lost ${open ? 'is-open' : ''}`}
      aria-expanded={open}
      aria-label={open ? 'Lost and found box, open. Press to close.' : 'A small box labelled lost and found. Press to open.'}
      onClick={() => {
        setOpen(o => !o)
        sound.tap()
        if (!open) window.setTimeout(() => sound.chime(true), 260)
      }}
    >
      <span className="lost__inside" aria-hidden="true">
        <span className="lost__cookie clay clay--cookie">
          <i />
          <i />
          <i />
        </span>
      </span>
      <span className="lost__flap lost__flap--l cardboard" aria-hidden="true" />
      <span className="lost__flap lost__flap--r cardboard" aria-hidden="true" />
      <span className="lost__box cardboard" aria-hidden="true">
        <span className="lost__label">
          lost &amp; found
          <br />
          no. 404
        </span>
      </span>
      <span className="lost__msg marker" aria-live="polite">
        {open ? 'nothing lost here. have a cookie.' : ''}
      </span>
    </button>
  )
}

function SayHi() {
  return (
    <section id="hi" className="section section--hi" aria-labelledby="hi-title">
      <div className="hi cardboard" data-reveal>
        <Tape className="tape--hi" />
        <h2 id="hi-title">Let’s make something.</h2>
        <p className="hi__sub">On a screen, or on a workbench.</p>
        <div className="hi__links">
          <a className="btn" href={`mailto:${CONTACT_EMAIL}`} onClick={() => sound.tap()}>
            Email me
          </a>
          <a className="btn btn--ghost" href={GITHUB_URL} target="_blank" rel="noreferrer" onClick={() => sound.tap()}>
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>
        <p className="hi__email">{CONTACT_EMAIL}</p>
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
        <a href="#hello" className="stamp wood" onClick={() => sound.tok()}>
          neha nk
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

      <footer className="footer">
        <p className="footer__bye">
          Thanks for scrolling. <span className="marker">bye-bye</span>
        </p>
        <LostAndFound />
        <p className="footer__small">Cardboard, tape, wood, clay and code. Neha NK, 2026.</p>
      </footer>
    </div>
  )
}

