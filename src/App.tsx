import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { sound } from './sound'

/* ------------------------------------------------------------------ */
/*  Content. Kept short on purpose: the site should be fun to scroll.  */
/*  Add an email here when you are ready to show one publicly.         */
/* ------------------------------------------------------------------ */

const CONTACT_EMAIL = 'nehhaank@gmail.com'
const GITHUB_URL = 'https://github.com/nehhaank'

type Art = 'chat' | 'tiles' | 'steps' | 'grid' | 'bars' | 'form'

const projects: { title: string; where: string; art: Art; note: string; tilt: number }[] = [
  { title: 'AI Interviewer', where: 'WeCP', art: 'chat', tilt: -1.4, note: 'Helped shape the first AI interviewer, then structured vs. adaptive modes and multiple interviewers. The puzzle: make an unfamiliar AI conversation easy to understand and set up.' },
  { title: 'Tests in any language', where: 'WeCP', art: 'tiles', tilt: 0.7, note: 'Language choice, fallbacks, switching mid-test and translated reports, so a candidate anywhere gets the same fair test.' },
  { title: 'Candidate onboarding', where: 'WeCP', art: 'steps', tilt: -0.7, note: 'Reworked registration to take the friction out of the minutes before a test even begins.' },
  { title: 'Capacity planner', where: 'Invisible Technologies', art: 'grid', tilt: 1.4, note: 'A dense internal planning tool, rebuilt around one clear grid with views by profile, work type and cohort.' },
  { title: 'Savings dashboard', where: 'Invisible Technologies', art: 'bars', tilt: -2.1, note: 'Made modeled savings readable and traceable: one hero number, honest comparisons, and the math laid open.' },
  { title: 'Expert applications', where: 'Invisible Technologies', art: 'form', tilt: 0.7, note: 'Mapped the whole path from browsing to applying, signing up, coming back later and taking an inline assessment.' },
]

const smallThings = ['Report integrity', 'Proctoring status language', 'Section timers', 'Answer explanations', 'Listening questions', 'Readable graphs', 'Retake wording']

const blobs: { label: string; color: string }[] = [
  { label: 'Complex workflows', color: 'terracotta' },
  { label: 'Systems thinking', color: 'sage' },
  { label: 'AI interactions', color: 'sky' },
  { label: 'Edge cases', color: 'mango' },
  { label: 'UX writing', color: 'rose' },
  { label: 'Data viz', color: 'sky' },
  { label: 'Research', color: 'terracotta' },
  { label: 'Prototyping', color: 'sage' },
]

const SECTIONS = [
  { id: 'hello', label: 'hello' },
  { id: 'work', label: 'work' },
  { id: 'how', label: 'how' },
  { id: 'field', label: 'field' },
  { id: 'making', label: 'making' },
  { id: 'now', label: 'now' },
  { id: 'hi', label: 'say hi' },
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

/** Pieces "stick" onto the page as they scroll into view. */
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
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function useActiveSection() {
  const [active, setActive] = useState(0)
  useEffect(() => {
    const els = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive(SECTIONS.findIndex(s => s.id === e.target.id))
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
  return active
}

/* ------------------------------------------------------------------ */
/*  Bits and bobs                                                      */
/* ------------------------------------------------------------------ */

function Tape({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <span className={`tape ${className}`} style={style} aria-hidden="true" />
}

function BoxLabel({ n, children }: { n: number; children: string }) {
  return (
    <p className="box-label" data-reveal>
      <span className="box-label__no">box {String(n).padStart(2, '0')}</span>
      <span className="box-label__name">{children}</span>
      <span className="box-label__arrow" aria-hidden="true">this side up ↑</span>
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
      <span className="sound-toggle__led" aria-hidden="true" />
    </button>
  )
}

function Ruler({ active }: { active: number }) {
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
  return (
    <nav className="ruler" aria-label="Sections">
      <div className="ruler__wood wood">
        {Array.from({ length: 29 }, (_, i) => (
          <span key={i} className={`ruler__tick ${i % 4 === 0 ? 'is-long' : ''}`} style={{ top: `${(i / 28) * 100}%` }} aria-hidden="true" />
        ))}
        {SECTIONS.map((s, i) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`ruler__stop ${i === active ? 'is-active' : ''}`}
            style={{ top: `${(i / (SECTIONS.length - 1)) * 100}%` }}
            onClick={() => sound.tok()}
          >
            <span>{s.label}</span>
          </a>
        ))}
        <span className="ruler__bead clay clay--mango" style={{ top: `${progress * 100}%` }} aria-hidden="true" />
      </div>
      <div className="ruler__mobile" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/*  01  Hello                                                          */
/* ------------------------------------------------------------------ */

const greetings = ['hello!', 'welcome in', 'mind the tape', 'press again?', 'ok, now scroll ↓']

function Hero({ reduced }: { reduced: boolean }) {
  const stage = useRef<HTMLDivElement>(null)
  const [g, setG] = useState(0)
  const [pressed, setPressed] = useState(false)

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== 'mouse' || !stage.current) return
    const r = stage.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    stage.current.style.setProperty('--mx', x.toFixed(3))
    stage.current.style.setProperty('--my', y.toFixed(3))
  }
  const onLeave = () => {
    stage.current?.style.setProperty('--mx', '0')
    stage.current?.style.setProperty('--my', '0')
  }

  return (
    <section id="hello" className="hero" aria-labelledby="hero-title">
      <div className="hero__copy">
        <p className="stencil" data-reveal>product designer · maker · frisbee captain</p>
        <h1 id="hero-title" data-reveal>
          Hi, I’m{' '}
          <span className="tape-word">
            Neha
            <Tape className="tape--word" />
          </span>
          .
        </h1>
        <p className="lede" data-reveal>
          I untangle complicated software until it feels simple. Off-screen, I’m usually on a frisbee field, at a workbench, or hovering near an oven.
        </p>
        <div className="hero__actions" data-reveal>
          <a className="clay-btn clay clay--mango" href="#work" onClick={() => sound.squish()}>
            see the prototypes <span aria-hidden="true">↓</span>
          </a>
          <p className="marker hero__hint">psst, everything here is pokeable</p>
        </div>
      </div>

      <div className="hero__stage" ref={stage} onPointerMove={onMove} onPointerLeave={onLeave}>
        <div className="phone cardboard" data-reveal>
          <Tape className="tape--phone-a" />
          <Tape className="tape--phone-b" />
          <span className="phone__speaker" aria-hidden="true" />
          <div className="phone__screen paper">
            <div className="phone__status" aria-hidden="true">
              <span />
              <span />
              <span />
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
          <span className="phone__home clay clay--sage" aria-hidden="true" />
        </div>

        <div className="block block--n wood" aria-hidden="true">
          N
        </div>
        <div className="block block--k wood wood--walnut" aria-hidden="true">
          K
        </div>
        <div className="hero__disc clay clay--sky" aria-hidden="true">
          <span />
        </div>
        <div className="hero__cursor" aria-hidden="true">
          <svg viewBox="0 0 40 52">
            <path d="M4 3 L35 31 L21 32 L28 48 L21 50 L14 35 L4 44 Z" />
          </svg>
        </div>
        <p className="marker hero__arrow-note" aria-hidden="true">
          press the button
          <svg viewBox="0 0 80 40">
            <path d="M4 34 C 26 34, 50 26, 68 6 M68 6 L 56 10 M68 6 L 68 19" />
          </svg>
        </p>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  02  Work                                                           */
/* ------------------------------------------------------------------ */

function ProjectArt({ art }: { art: Art }) {
  switch (art) {
    case 'chat':
      return (
        <div className="art art--chat">
          <span className="bubble clay clay--sky" />
          <span className="bubble bubble--me clay clay--mango" />
          <span className="bubble clay clay--sky bubble--short" />
          <span className="wave">
            {[6, 14, 22, 12, 18, 8, 16, 10].map((h, i) => (
              <i key={i} style={{ height: h }} />
            ))}
          </span>
        </div>
      )
    case 'tiles':
      return (
        <div className="art art--tiles">
          {['Aa', 'अ', 'ಕ', '文', 'Ñ', 'ع'].map((t, i) => (
            <span key={t} className={`letter-tile wood ${i % 2 ? 'wood--walnut' : ''}`} style={{ '--r': `${(i % 3) * 4 - 4}deg` } as CSSProperties}>
              {t}
            </span>
          ))}
        </div>
      )
    case 'steps':
      return (
        <div className="art art--steps">
          <svg viewBox="0 0 200 60" className="string" preserveAspectRatio="none">
            <path d="M20 30 C 60 6, 80 54, 100 30 S 150 6, 180 30" />
          </svg>
          <span className="bead clay clay--sage">1</span>
          <span className="bead clay clay--sage">2</span>
          <span className="bead clay clay--mango">3</span>
        </div>
      )
    case 'grid':
      return (
        <div className="art art--grid">
          {Array.from({ length: 15 }, (_, i) => (
            <span key={i} className={`grid-block wood ${[2, 6, 7, 11].includes(i) ? 'clay clay--terracotta' : ''} ${[4, 9].includes(i) ? 'wood--walnut' : ''}`} />
          ))}
        </div>
      )
    case 'bars':
      return (
        <div className="art art--bars">
          <span className="hero-num clay clay--mango" />
          <div className="bars">
            {[38, 56, 44, 72, 64].map((h, i) => (
              <i key={i} className={`clay ${i === 3 ? 'clay--terracotta' : 'clay--sage'}`} style={{ height: `${h}%` }} />
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
          <span className="submit clay clay--sky" />
        </div>
      )
  }
}

function ProjectCard({ p, i }: { p: (typeof projects)[number]; i: number }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <li className="project" data-reveal style={{ '--r': `${p.tilt}deg`, '--d': `${(i % 3) * 90}ms` } as CSSProperties}>
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
          <Tape className="tape--corner" />
          <span className="project__screen paper">
            <ProjectArt art={p.art} />
          </span>
          <span className="project__meta">
            <span className="project__title">{p.title}</span>
            <span className="project__where stencil">{p.where}</span>
          </span>
          <span className="project__turn marker" aria-hidden="true">
            flip ↻
          </span>
        </span>
        <span className="project__face project__back cardboard cardboard--inside" aria-hidden={!flipped}>
          <Tape className="tape--top" />
          <span className="project__note marker">{p.note}</span>
          <span className="project__soon stencil">full story: being written</span>
        </span>
      </button>
    </li>
  )
}

function Work() {
  return (
    <section id="work" className="section" aria-labelledby="work-title">
      <BoxLabel n={2}>work</BoxLabel>
      <div className="section__head">
        <h2 id="work-title" data-reveal>
          Prototypes from <br className="hide-sm" />
          my desk
        </h2>
        <p className="section__aside marker" data-reveal>
          tap a card to flip it over
        </p>
      </div>
      <ul className="projects">
        {projects.map((p, i) => (
          <ProjectCard key={p.title} p={p} i={i} />
        ))}
      </ul>
      <div className="small-things" data-reveal>
        <p className="stencil">plus a drawer of smaller fixes</p>
        <ul>
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
/*  03  How I work: clay you can push around                           */
/* ------------------------------------------------------------------ */

function ClayBlob({ label, color, i }: { label: string; color: string; i: number }) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [squish, setSquish] = useState(0)
  const start = useRef({ px: 0, py: 0, x: 0, y: 0, moved: false })

  const down = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    start.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y, moved: false }
    setDragging(true)
  }
  const move = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragging) return
    const dx = e.clientX - start.current.px
    const dy = e.clientY - start.current.py
    if (Math.abs(dx) + Math.abs(dy) > 4) start.current.moved = true
    setPos({ x: start.current.x + dx, y: start.current.y + dy })
  }
  const up = () => {
    if (!dragging) return
    setDragging(false)
    setSquish(s => s + 1)
    sound.squish()
  }

  return (
    <li className="blob-slot" data-reveal style={{ '--d': `${i * 60}ms` } as CSSProperties}>
      <button
        type="button"
        className={`blob clay clay--${color} ${dragging ? 'is-dragging' : ''}`}
        style={{ '--x': `${pos.x}px`, '--y': `${pos.y}px`, '--shape': i % 4 } as CSSProperties}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setSquish(s => s + 1)
            sound.squish()
          }
        }}
      >
        <span key={squish} className={squish ? 'blob__inner is-squished' : 'blob__inner'}>
          {label}
        </span>
      </button>
    </li>
  )
}

function How() {
  return (
    <section id="how" className="section section--how" aria-labelledby="how-title">
      <BoxLabel n={3}>how I work</BoxLabel>
      <div className="section__head">
        <h2 id="how-title" data-reveal>
          Things I’m
          <br className="hide-sm" /> good at
        </h2>
        <p className="section__aside marker" data-reveal>
          the clay is still soft. drag it around
        </p>
      </div>
      <div className="clay-board plywood" data-reveal>
        <ul className="blobs">
          {blobs.map((b, i) => (
            <ClayBlob key={b.label} {...b} i={i} />
          ))}
        </ul>
        <p className="clay-board__note marker">
          I work closely with product, engineering and research, and I like owning the messy middle: the states, the edge cases and the words on the buttons.
        </p>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  04  On the field: throw the disc                                   */
/* ------------------------------------------------------------------ */

function Field({ reduced }: { reduced: boolean }) {
  const field = useRef<HTMLDivElement>(null)
  const disc = useRef<HTMLButtonElement>(null)
  const state = useRef({ x: 0.16, y: 0.5, vx: 0, vy: 0, spin: 0, dragging: false, thrown: false, trail: [] as { x: number; y: number; t: number }[] })
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
      s.x = 0.16
      s.y = 0.5
      s.spin = 0
      paint()
    }, 1300)
  }, [paint])

  const step = useCallback(() => {
    const s = state.current
    const f = field.current
    if (!f) return
    const w = f.clientWidth
    const h = f.clientHeight
    s.x += s.vx / w
    s.y += s.vy / h
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
    if (Math.hypot(s.vx, s.vy) > 0.25) {
      raf.current = requestAnimationFrame(step)
    } else if (s.thrown) {
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
    s.x = 0.16
    s.y = 0.5
    s.vx = 34
    s.vy = (Math.random() - 0.5) * 6
    s.thrown = true
    sound.whoosh(1)
    raf.current = requestAnimationFrame(step)
  }

  return (
    <section id="field" className="section" aria-labelledby="field-title">
      <BoxLabel n={4}>on the field</BoxLabel>
      <div className="section__head">
        <h2 id="field-title" data-reveal>
          Ultimate frisbee
          <br className="hide-sm" /> takes up my weekends
        </h2>
        <p className="section__aside marker" data-reveal>
          {reduced ? 'press the disc to score' : 'grab the disc and fling it into the end zone'}
        </p>
      </div>

      <div className="pitch-wrap" data-reveal>
        <div className="pitch felt" ref={field}>
          <span className="pitch__line pitch__line--l" aria-hidden="true" />
          <span className="pitch__line pitch__line--r" aria-hidden="true" />
          <span className="pitch__zone marker" aria-hidden="true">
            end zone
          </span>
          {[
            [0.38, 0.28, 'mango'],
            [0.55, 0.66, 'mango'],
            [0.68, 0.34, 'rose'],
          ].map(([x, y, c], i) => (
            <span key={i} className={`player clay clay--${c}`} style={{ left: `${(x as number) * 100}%`, top: `${(y as number) * 100}%` }} aria-hidden="true">
              <i className={`clay clay--${c}`} />
            </span>
          ))}
          <button
            ref={disc}
            type="button"
            className="disc clay clay--sky"
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
          <p className="pitch__score label-tape">points: {points}</p>
        </div>
        <Tape className="tape--pitch-a" />
        <Tape className="tape--pitch-b" />
      </div>

      <ul className="notes">
        <li className="note paper" data-reveal style={{ '--r': '-2.1deg' } as CSSProperties}>
          <Tape className="tape--top" />
          <span className="stencil">since Oct 2026</span>
          <p><strong>Captain</strong> at Learning to Fly (L2F), Bengaluru</p>
        </li>
        <li className="note paper" data-reveal style={{ '--r': '1.4deg', '--d': '80ms' } as CSSProperties}>
          <Tape className="tape--top" />
          <span className="stencil">Oct 2026</span>
          <p>Played the <strong>Pan-Asia</strong> tournament in Hong Kong</p>
        </li>
        <li className="note paper" data-reveal style={{ '--r': '-0.7deg', '--d': '160ms' } as CSSProperties}>
          <Tape className="tape--top" />
          <span className="stencil">coaching</span>
          <p>Level 1 coaching, and I plan practices: <strong>short throws, break-marks, resets</strong></p>
        </li>
        <li className="note paper" data-reveal style={{ '--r': '2.1deg', '--d': '240ms' } as CSSProperties}>
          <Tape className="tape--top" />
          <span className="stencil">training</span>
          <p>Track <strong>sprints</strong> three times a week, plus the gym</p>
        </li>
      </ul>

      <div className="kit" data-reveal>
        <div className="kit__jersey">
          <svg viewBox="0 0 220 220" role="img" aria-label="A cardboard cut-out of an ivory jersey with gold street-map lines and a red flower">
            <defs>
              <clipPath id="jersey-shape">
                <path d="M70 18 Q110 40 150 18 L198 44 L182 92 L160 84 L162 204 L58 204 L60 84 L38 92 L22 44 Z" />
              </clipPath>
            </defs>
            <path className="kit__shadow" d="M74 24 Q114 46 154 24 L202 50 L186 98 L164 90 L166 210 L62 210 L64 90 L42 98 L26 50 Z" />
            <path className="kit__base" d="M70 18 Q110 40 150 18 L198 44 L182 92 L160 84 L162 204 L58 204 L60 84 L38 92 L22 44 Z" />
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
        <p className="kit__text">
          <span className="stencil">side project</span>
          <span className="marker">
            Kit concepts for L2F’s Hong Kong trip: an ivory base, fine gold street-map lines and a red flower.
          </span>
        </p>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  05  Made by hand                                                   */
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
      <BoxLabel n={5}>made by hand</BoxLabel>
      <div className="section__head">
        <h2 id="making-title" data-reveal>
          I like making
          <br className="hide-sm" /> real things too
        </h2>
        <p className="section__aside marker" data-reveal>
          go on, take a bite
        </p>
      </div>

      <div className="shelf-unit">
        <div className="shelf" data-reveal>
          <div className="shelf__items">
            <figure className="item">
              <button
                type="button"
                key={wobble}
                className={`cot ${wobble ? 'is-wobbling' : ''}`}
                aria-label="A tiny wooden four-poster cot. Press to give it a nudge."
                onClick={() => {
                  sound.tok()
                  setWobble(w => w + 1)
                }}
              >
                <span className="cot__post wood wood--walnut" />
                <span className="cot__post wood wood--walnut" />
                <span className="cot__post wood wood--walnut cot__post--back" />
                <span className="cot__post wood wood--walnut cot__post--back" />
                <span className="cot__top wood" />
                <span className="cot__frame wood" />
                <span className="cot__mattress clay clay--rose" />
              </button>
              <figcaption>
                <span className="marker">a four-poster cot</span>
                <span className="stencil">in progress, with a mentor</span>
              </figcaption>
            </figure>

            <figure className="item item--tray">
              <div className="tray wood wood--walnut">
                <Bakeable kind="cookie" label="Chocolate-chip cookie" />
                <Bakeable kind="brownie" label="Brownie" />
                <Bakeable kind="focaccia" label="Focaccia" />
              </div>
              <figcaption>
                <span className="marker">cookies, brownies, focaccia, apple pie</span>
                <span className="stencil">still testing substitutions</span>
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
                {['sock', 'tee', 'cap'].map((t, i) => (
                  <span key={t} className={`line__tag clay clay--${['sky', 'mango', 'sage'][i]}`} style={{ '--i': i } as CSSProperties} />
                ))}
              </div>
              <figcaption>
                <span className="marker">a pocket travel clothesline</span>
                <span className="stencil">an experiment</span>
              </figcaption>
            </figure>
            <figure className="item">
              <div className="books" aria-hidden="true">
                <span className="book clay clay--terracotta" />
                <span className="book clay clay--sage book--tall" />
                <span className="book clay clay--sky" />
                <span className="book clay clay--mango book--lean" />
              </div>
              <figcaption>
                <span className="marker">fantasy books, Eragon first</span>
                <span className="stencil">on the reading shelf</span>
              </figcaption>
            </figure>
            <figure className="item">
              <div className="mini-phone cardboard" aria-hidden="true">
                <span className="paper" />
              </div>
              <figcaption>
                <span className="marker">this website</span>
                <span className="stencil">built by hand, in code</span>
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
/*  06  Right now                                                      */
/* ------------------------------------------------------------------ */

const nowNotes = [
  { k: 'leading', t: 'captaining L2F', r: -2.8, c: 'paper' },
  { k: 'training', t: 'sprints, three times a week', r: 1.4, c: 'paper paper--mango' },
  { k: 'building', t: 'a four-poster cot', r: -0.7, c: 'paper paper--sage' },
  { k: 'writing', t: 'case studies for this site', r: 2.1, c: 'paper' },
]

function Now() {
  return (
    <section id="now" className="section" aria-labelledby="now-title">
      <BoxLabel n={6}>right now</BoxLabel>
      <div className="section__head">
        <h2 id="now-title" data-reveal>
          Currently
          <br className="hide-sm" /> pinned up
        </h2>
        <p className="section__aside marker" data-reveal>
          updated Nov 2026
        </p>
      </div>
      <ul className="cork cardboard">
        {nowNotes.map((n, i) => (
          <li key={n.k} className={`sticky ${n.c}`} data-reveal style={{ '--r': `${n.r}deg`, '--d': `${i * 90}ms` } as CSSProperties} onPointerEnter={() => sound.peel()}>
            <span className="pin clay clay--terracotta" aria-hidden="true" />
            <span className="stencil">{n.k}</span>
            <span className="marker">{n.t}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  07  Say hi                                                         */
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
      <BoxLabel n={7}>say hi</BoxLabel>
      <div className="hi cardboard" data-reveal>
        <Tape className="tape--hi-a" />
        <Tape className="tape--hi-b" />
        <h2 id="hi-title">
          Let’s make
          <br /> something.
        </h2>
        <p className="marker hi__sub">on a screen, or on a workbench</p>
        <div className="hi__links">
          {CONTACT_EMAIL ? (
            <a className="clay-btn clay clay--mango" href={`mailto:${CONTACT_EMAIL}`} onClick={() => sound.squish()}>
              email me
            </a>
          ) : null}
          <a className="clay-btn clay clay--sky" href={GITHUB_URL} target="_blank" rel="noreferrer" onClick={() => sound.squish()}>
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>
        {CONTACT_EMAIL ? <p className="hi__email stencil">{CONTACT_EMAIL}</p> : null}
      </div>
      <LostAndFound />
    </section>
  )
}

/* ------------------------------------------------------------------ */

export default function App() {
  const reduced = useReducedMotion()
  const active = useActiveSection()
  useReveal()

  return (
    <div className={`site ${reduced ? 'is-reduced' : ''}`}>
      <a className="skip-link" href="#work">
        Skip to work
      </a>
      <header className="topbar">
        <a href="#hello" className="stamp wood" onClick={() => sound.tok()}>
          neha nk
        </a>
        <nav aria-label="Main" className="tabs">
          {[
            ['work', 'work'],
            ['field', 'frisbee'],
            ['making', 'making'],
            ['hi', 'say hi'],
          ].map(([id, label], i) => (
            <a key={id} href={`#${id}`} className="tab label-tape" style={{ '--r': `${[-2, 1, -1, 2][i]}deg` } as CSSProperties} onClick={() => sound.peel()}>
              {label}
            </a>
          ))}
        </nav>
        <SoundToggle />
      </header>

      <Ruler active={active} />

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
        <p className="marker">
          bye-bye <span className="wave-hand" aria-hidden="true">✋</span>
        </p>
        <p className="stencil">cardboard, tape, clay &amp; code · neha nk · 2026</p>
      </footer>
    </div>
  )
}
