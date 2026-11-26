import { useEffect, useRef, useState } from 'react'
import { FlightNav } from './FlightNav'
import { Disc } from './Disc'
import { WorkArt } from './WorkArt'
import { FieldMap } from './FieldMap'

const EMAIL = 'nehhaank@gmail.com'

type Project = {
  id: string
  company: 'WeCP' | 'Invisible Technologies'
  title: string
  kicker: string
  problem: string
  parts: string[]
}

const projects: Project[] = [
  {
    id: 'interviewer',
    company: 'WeCP',
    title: 'AI Interviewer',
    kicker: 'Making an unfamiliar AI interaction understandable and configurable.',
    problem:
      'I worked on the initial AI interviewer experience, then its second version: a clear split between structured and adaptive interviews, an adaptive deep-dive flow, and support for more than one interviewer.',
    parts: ['User interviews and testing', 'Structured vs adaptive modes', 'Interview controls', 'Node-based configuration'],
  },
  {
    id: 'multilingual',
    company: 'WeCP',
    title: 'Multilingual assessments',
    kicker: 'One test, many languages, and every state in between.',
    problem:
      'Language choice for candidates before and during a test, admin auto-detect and restrictions, English-locked questions, fallbacks, translation labels, and reports that keep the original-language answers.',
    parts: ['Language selection and fallback', 'In-test switching', 'Translation indicators', 'Recruiter report views'],
  },
  {
    id: 'registration',
    company: 'WeCP',
    title: 'Candidate registration',
    kicker: 'Less friction before the test even begins.',
    problem:
      'A revamp of candidate onboarding and registration, including an AI-forward experience, aimed at making the first few minutes clearer for people about to be assessed.',
    parts: ['Onboarding flow', 'Registration redesign', 'AI-forward entry'],
  },
  {
    id: 'onboarding',
    company: 'Invisible Technologies',
    title: 'Expert onboarding',
    kicker: 'From browsing as a guest to ready-to-work, without losing your place.',
    problem:
      'Product and design work on an expert application journey: logged-out exploration, starting and resuming an application, an inline assessment, verification sequencing and status progression.',
    parts: ['Journey mapping', 'Resumable applications', 'Inline assessment', 'Implementation specs'],
  },
  {
    id: 'planner',
    company: 'Invisible Technologies',
    title: 'Capacity planner',
    kicker: 'Dense operational data, arranged so it reads at a glance.',
    problem:
      'A redesign of an internal planning tool around a single grid, with views by profile, work type and cohort, rows that expand in place, and outputs moved beneath the planning surface.',
    parts: ['Grid-first layout', 'View switching', 'Inline expansion', 'Simplified helper text'],
  },
  {
    id: 'savings',
    company: 'Invisible Technologies',
    title: 'Savings dashboard',
    kicker: 'Making modelled value traceable, not just big.',
    problem:
      'A KPI dashboard for estimated savings: a hero figure, with-and-without comparisons, a by-period chart, visible baseline assumptions and a step-by-step calculation breakdown.',
    parts: ['Comparative KPIs', 'Assumption cards', 'Calculation breakdown'],
  },
]

const smaller = [
  ['Report integrity', 'Keeping attempted questions, answers and scores intact when an assessment is edited later.', 'WeCP'],
  ['Proctoring status language', 'One consistent vocabulary for proctoring indicators, so evaluators read them the same way.', 'WeCP'],
  ['Sectional timers', 'Changing allocated time, reloads, transitions and notices that can’t be dismissed.', 'WeCP'],
  ['Section descriptions', 'Text-only on purpose: media would eat into a timer that is already running.', 'WeCP'],
  ['Answer explanations', 'Visible to admins, recruiters and evaluators. Hidden from candidates.', 'WeCP'],
  ['Listening questions', 'Uploaded audio and text-to-speech in one authoring experience.', 'WeCP'],
  ['Skill graphs', 'Untangling overlapping elements so the data reads cleanly.', 'WeCP'],
  ['Retake wording', 'Making it clear that extra retakes add to a candidate’s current attempts.', 'Invisible'],
]

const ways = [
  ['Complex workflows', 'Configuration, multi-step journeys, forms and the states between them.'],
  ['Systems thinking', 'Roles and permissions, historical integrity, localisation, edge cases.'],
  ['AI products', 'Adaptive interactions and explaining what the automation is doing.'],
  ['Data, legibly', 'Dashboards, comparisons, and showing how a number was made.'],
  ['Words', 'Status language, labels, tooltips, and saying the constraint out loud.'],
  ['Together', 'Research with researchers, specs with engineers, alignment with everyone.'],
]

const field = [
  ['Learning to Fly', 'Competitive Ultimate in Bengaluru: practice, conditioning, weekend games.'],
  ['Captain', 'One of the team captains since October 2026. Sessions, plans, and keeping everyone in the loop.'],
  ['Level 1 coach', 'Completed Level 1 coaching. I like turning an objective into a drill with a clock on it.'],
  ['Pan-Asia, Hong Kong', 'October 2026 at Tai Hang Tung. Campaign prep, logistics, and the reflection after.'],
  ['Kit concepts', 'Jersey ideas for the Hong Kong campaign: ivory, gold street-map linework, a red flower.'],
  ['Track', 'Coached sprint sessions, three a week, since September 2026.'],
]

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]')
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        }),
      { rootMargin: '0px 0px -8% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function Echo({ children, as: Tag = 'h2', className = '' }: { children: string; as?: 'h1' | 'h2'; className?: string }) {
  return (
    <Tag className={`echo ${className}`} data-echo={children}>
      {children}
    </Tag>
  )
}

export default function App() {
  useReveal()
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${EMAIL}`
    }
  }

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <FlightNav />

      <header className="top">
        <a href="#top" className="mark" aria-label="Neha NK, back to top">
          <span className="mark-disc" aria-hidden="true" />
          Neha NK
        </a>
        <nav aria-label="Sections" className="top-nav">
          <a href="#work">Work</a>
          <a href="#field">Field</a>
          <a href="#making">Making</a>
          <a href="#hello" className="top-cta">Say hello</a>
        </nav>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <p className="mono eyebrow hero-eyebrow">Product designer</p>
          <h1 className="hero-title">
            <span className="line">I design the</span>
            <span className="line">
              <em>complicated</em>
            </span>
            <span className="line">
              <em>middle</em> of software.
            </span>
          </h1>
          <div className="hero-foot">
            <p className="lede">
              Configuration screens, edge cases, multi-step journeys, and the small words that make them make sense.
              Most recently at <strong>WeCP</strong> and <strong>Invisible Technologies</strong>.
            </p>
            <ul className="now mono" aria-label="Right now">
              <li><span>Now</span> Captain, Learning to Fly</li>
              <li><span>Also</span> Level 1 Ultimate coach</li>
              <li><span>Bench</span> A four-poster cot, in wood</li>
            </ul>
          </div>
          <Disc />
        </section>

        <section id="work" className="section work" aria-labelledby="work-h">
          <div className="section-head" data-reveal>
            <span className="mono num">01</span>
            <Echo className="h2">Selected work</Echo>
            <p className="section-note">
              Six problems from two companies. Full case studies are on their way; these are the outlines.
            </p>
          </div>

          <ol className="projects">
            {projects.map((p, i) => (
              <li className={`project ${i % 2 ? 'is-twin' : ''}`} key={p.id} data-reveal>
                <div className="project-art">
                  <WorkArt id={p.id} />
                </div>
                <div className="project-body">
                  <p className="mono meta">
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    <span>{p.company}</span>
                  </p>
                  <h3>{p.title}</h3>
                  <p className="kicker">{p.kicker}</p>
                  <p className="problem">{p.problem}</p>
                  <ul className="parts">
                    {p.parts.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="section index" aria-labelledby="index-h">
          <div className="section-head" data-reveal>
            <span className="mono num">02</span>
            <h2 className="h2" id="index-h">Smaller problems, solved carefully</h2>
          </div>
          <ul className="index-list">
            {smaller.map(([t, d, c]) => (
              <li key={t} data-reveal>
                <span className="i-title">{t}</span>
                <span className="i-desc">{d}</span>
                <span className="mono i-co">{c}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="section ways" aria-labelledby="ways-h">
          <div className="section-head" data-reveal>
            <span className="mono num">03</span>
            <h2 className="h2" id="ways-h">How I work</h2>
          </div>
          <div className="ways-grid">
            {ways.map(([t, d], i) => (
              <div className="way" key={t} data-reveal style={{ transitionDelay: `${(i % 3) * 70}ms` }}>
                <span className="mono way-n">{String.fromCharCode(97 + i)}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="field" className="field" aria-labelledby="field-h">
          <div className="field-inner">
            <div className="section-head" data-reveal>
              <span className="mono num">04</span>
              <h2 className="h2" id="field-h">
                Off the screen, <em>on the field</em>
              </h2>
              <p className="section-note">
                Ultimate Frisbee is a big part of who I am: a self-refereed sport where reading space, timing and
                people matters as much as the throw. Most of my weeks are planned around it.
              </p>
            </div>
            <div className="field-grid">
              <FieldMap />
              <dl className="field-list">
                {field.map(([t, d]) => (
                  <div key={t} data-reveal>
                    <dt>{t}</dt>
                    <dd>{d}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section id="making" className="section making" aria-labelledby="making-h">
          <div className="section-head" data-reveal>
            <span className="mono num">05</span>
            <h2 className="h2" id="making-h">Things I make with my hands</h2>
          </div>
          <div className="make-grid">
            <article className="make make-wood" data-reveal>
              <svg viewBox="0 0 120 90" aria-hidden="true" className="make-ico">
                <path d="M20 84V14M100 84V14M20 52h80M20 64h80M14 14h12M94 14h12" />
                <path d="M20 30h80" className="dash" />
              </svg>
              <h3>A four-poster cot</h3>
              <p>A woodworking project with a mentor. Joinery, material choices, and a lot of patience.</p>
              <span className="mono tag">In progress</span>
            </article>
            <article className="make make-bake" data-reveal>
              <svg viewBox="0 0 120 90" aria-hidden="true" className="make-ico">
                <rect x="14" y="22" width="92" height="52" rx="6" />
                <circle cx="34" cy="40" r="3" />
                <circle cx="58" cy="56" r="3" />
                <circle cx="84" cy="38" r="3" />
                <circle cx="46" cy="62" r="2" />
                <circle cx="76" cy="60" r="2" />
              </svg>
              <h3>Baking, as experiments</h3>
              <p>Focaccia, chocolate-chip cookies, brownies, apple pie, and what a substitution does to texture.</p>
              <span className="mono tag">Ongoing</span>
            </article>
            <article className="make make-read" data-reveal>
              <svg viewBox="0 0 120 90" aria-hidden="true" className="make-ico">
                <path d="M60 22c-12-8-30-8-44-4v56c14-4 32-4 44 4 12-8 30-8 44-4V18c-14-4-32-4-44 4zM60 22v56" />
              </svg>
              <h3>Fantasy, on the side</h3>
              <p>Dragons and long series. Eragon got there first.</p>
              <span className="mono tag">Always</span>
            </article>
          </div>
        </section>

        <section id="hello" className="hello" aria-labelledby="hello-h">
          <p className="mono eyebrow" data-reveal>06 · Contact</p>
          <h2 id="hello-h" className="hello-title" data-reveal>
            Got a tangled workflow? <em>Let’s talk.</em>
          </h2>
          <div className="hello-row" data-reveal>
            <a className="hello-mail" href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>
            <button type="button" className="copy mono" onClick={copy} aria-live="polite">
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
          <p className="hello-note">Résumé on request.</p>
        </section>
      </main>

      <footer className="foot">
        <span>© 2026 Neha NK</span>
        <span className="mono foot-hint">Psst. The disc up top can be thrown.</span>
      </footer>
    </>
  )
}
