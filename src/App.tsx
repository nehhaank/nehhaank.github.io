import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { FieldMap } from './FieldMap'
import cotImg from './assets/render-cot.jpg'
import breadImg from './assets/render-focaccia.jpg'
import booksImg from './assets/render-books.jpg'

import { Mock } from './Mocks'

const DiscScene = lazy(() => import('./DiscScene'))
const GrassShader = lazy(() => import('./GrassShader'))

const EMAIL = 'nehhaank@gmail.com'

type Project = {
  id: string
  company: 'WeCP' | 'Invisible Technologies'
  title: string
  kicker: string
  problem: string
  parts: string
}

const projects: Project[] = [
  {
    id: 'interviewer',
    company: 'WeCP',
    title: 'AI Interviewer',
    kicker: 'Making an unfamiliar AI interaction understandable and configurable.',
    problem:
      'The initial AI interviewer experience, then its second version: a clear split between structured and adaptive interviews, an adaptive deep-dive flow, and support for more than one interviewer.',
    parts: 'User testing, interview modes, controls, node-based configuration',
  },
  {
    id: 'multilingual',
    company: 'WeCP',
    title: 'Multilingual assessments',
    kicker: 'One test, many languages, and every state in between.',
    problem:
      'Language choice before and during a test, admin auto-detect and restrictions, English-locked questions, fallbacks, translation labels, and reports that keep the original-language answers.',
    parts: 'Language selection, in-test switching, translation labels, recruiter reports',
  },
  {
    id: 'registration',
    company: 'WeCP',
    title: 'Candidate registration',
    kicker: 'Less friction before the test even begins.',
    problem:
      'A revamp of candidate onboarding and registration, including an AI-forward experience, so the first few minutes are clearer for people about to be assessed.',
    parts: 'Onboarding flow, registration, AI-forward entry',
  },
  {
    id: 'onboarding',
    company: 'Invisible Technologies',
    title: 'Expert onboarding',
    kicker: 'From browsing as a guest to ready to work, without losing your place.',
    problem:
      'Product and design work on an expert application journey: logged-out exploration, starting and resuming an application, an inline assessment, verification order and status progression.',
    parts: 'Journey mapping, resumable applications, inline assessment, specs',
  },
  {
    id: 'planner',
    company: 'Invisible Technologies',
    title: 'Capacity planner',
    kicker: 'Dense operational data, arranged so it reads at a glance.',
    problem:
      'A redesign of an internal planning tool around a single grid, with views by profile, work type and cohort, rows that expand in place, and outputs moved beneath the planning surface.',
    parts: 'Grid layout, view switching, inline expansion, helper text',
  },
  {
    id: 'savings',
    company: 'Invisible Technologies',
    title: 'Savings dashboard',
    kicker: 'Making modelled value traceable, not just big.',
    problem:
      'A KPI dashboard for estimated savings: a hero figure, with-and-without comparisons, a by-period chart, visible baseline assumptions and a step-by-step calculation breakdown.',
    parts: 'Comparative KPIs, assumption cards, calculation breakdown',
  },
]

const smaller = [
  ['WeCP', 'Report integrity', 'Keeping attempted questions, answers and scores intact when an assessment is edited later.'],
  ['WeCP', 'Proctoring status language', 'One consistent vocabulary for proctoring indicators, so evaluators read them the same way.'],
  ['WeCP', 'Sectional timers', 'Changing allocated time, reloads, transitions, and notices that can’t be dismissed.'],
  ['WeCP', 'Section descriptions', 'Text only, on purpose. Media would eat into a timer that is already running.'],
  ['WeCP', 'Answer explanations', 'Visible to admins, recruiters and evaluators. Hidden from candidates.'],
  ['WeCP', 'Listening questions', 'Uploaded audio and text-to-speech in one authoring experience.'],
  ['WeCP', 'Skill graphs', 'Untangling overlapping elements so the data reads cleanly.'],
  ['Invisible', 'Retake wording', 'Making it clear that extra retakes add to a candidate’s current attempts.'],
]

const field = [
  ['Captain', 'Learning to Fly, Bengaluru', 'One of the team captains since October 2026: planning sessions, sharing the plan, and keeping the squad in the loop.'],
  ['Level 1 coach', 'Drills with a clock on them', 'Completed Level 1 coaching. I write practices around short throws, upline throws, resets and break-mark drills.'],
  ['Pan-Asia', 'Hong Kong, October 2026', 'Part of the campaign at Tai Hang Tung: preparation, logistics, and the team reflection afterwards.'],
]

const making = [
  { img: cotImg, title: 'A four-poster cot', text: 'A woodworking project with a mentor. Joinery, material choices, and a lot of patience.', tag: 'In progress' },
  { img: breadImg, title: 'Focaccia, and friends', text: 'Focaccia, chocolate-chip cookies, brownies, apple pie, and what a substitution does to texture.', tag: 'Ongoing' },
  { img: booksImg, title: 'Fantasy, on the side', text: 'Dragons and long series. Eragon got there first.', tag: 'Always' },
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
      { rootMargin: '0px 0px -6% 0px' },
    )
    document.documentElement.classList.add('js-reveal')
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
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
          <div className="hero-scene">
            <Suspense fallback={null}>
              <DiscScene />
            </Suspense>
          </div>
          <h1 className="hero-title">
            <span className="line">I design the</span>
            <span className="line">
              <em>
                <span className="swipe">complicated</span> middle
              </em>
            </span>
            <span className="line">of software.</span>
          </h1>
          <div className="hero-foot">
            <p className="lede">
              Configuration screens, edge cases, multi-step journeys, and the small words that make them make sense.
              Most recently at <strong>WeCP</strong> and <strong>Invisible Technologies</strong>.
            </p>
            <ul className="now" aria-label="Right now">
              <li><span className="mono">Now</span>Captain, Learning to Fly</li>
              <li><span className="mono">Also</span>Level 1 Ultimate coach</li>
              <li><span className="mono">Bench</span>A four-poster cot, in wood</li>
            </ul>
          </div>
        </section>

        <section id="work" className="section work" aria-labelledby="work-h">
          <div className="section-head rule" data-reveal>
            <h2 className="h2 h2-sm" id="work-h">Selected work</h2>
            <p className="section-note">
              Six problems from two companies. The screens are simplified mock-ups; full case studies are being written.
            </p>
          </div>

          <ol className="projects">
            {projects.map((p, i) => (
              <li className={`project ${i === 0 ? 'is-hero' : i > 2 ? 'is-small' : i % 2 ? 'is-flip' : ''}`} key={p.id} data-reveal>
                <div className={`project-art tone-${i % 3}`}>
                  <div className="mk-stage">
                    <Mock id={p.id} />
                  </div>
                </div>
                <div className="project-body">
                  <p className="meta">
                    <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                    <span>{p.company}</span>
                    <span className="role">{p.company === 'WeCP' ? 'Product designer, until 2026' : 'Product designer, contract, 2026'}</span>
                  </p>
                  <h3>{p.title}</h3>
                  <p className="kicker">{p.kicker}</p>
                  <p className="problem">{p.problem}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="section index" aria-labelledby="index-h">
          <div className="section-head" data-reveal>
            <h2 className="h2 h2-sm" id="index-h">Also on my desk</h2>
            <p className="section-note">Smaller problems, each with its own tricky edge case.</p>
          </div>
          <ul className="index-list">
            {smaller.map(([c, t, d]) => (
              <li key={t} data-reveal>
                <span className="mono i-co">{c}</span>
                <span className="i-title">{t}</span>
                <span className="i-desc">{d}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="section ways" aria-labelledby="ways-h">
          <div className="section-head" data-reveal>
            <h2 className="h2 h2-sm" id="ways-h">How I work</h2>
          </div>
          <p className="ways-text" data-reveal>
            I like the parts of a product where configuration, journeys and states have to hold together. I think in
            systems: roles, history, localisation, edge cases. I care about the words on the buttons, and I work
            closely with research and engineering to get them right.
          </p>
        </section>

        <section id="field" className="field" aria-labelledby="field-h">
          <Suspense fallback={null}>
            <GrassShader />
          </Suspense>
          <div className="field-inner">
            <div className="section-head" data-reveal>
              <h2 className="h2" id="field-h">On the field</h2>
              <p className="section-note">
                Ultimate Frisbee is a big part of my life: a self-refereed sport where reading space, timing and
                people matters as much as the throw.
              </p>
            </div>
            <FieldMap />
            <dl className="field-list">
              {field.map(([t, k, d]) => (
                <div key={t} data-reveal>
                  <dt>{t}</dt>
                  <span className="f-k">{k}</span>
                  <dd>{d}</dd>
                </div>
              ))}
            </dl>
            <p className="field-also" data-reveal>
              Also: kit concepts for the Hong Kong campaign, and coached sprint sessions three times a week.
            </p>
          </div>
        </section>

        <section id="making" className="section making" aria-labelledby="making-h">
          <div className="section-head" data-reveal>
            <h2 className="h2 h2-sm" id="making-h">Things I make by hand</h2>
            <p className="section-note">Away from screens: wood, dough, and the occasional dragon.</p>
          </div>
          <div className="make-grid">
            {making.map((m) => (
              <article className="make" key={m.title} data-reveal>
                <div className="make-img">
                  <img src={m.img} alt="" decoding="async" width="900" height="900" />
                  <span className="mono tag">{m.tag}</span>
                </div>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="hello" className="hello" aria-labelledby="hello-h">
          <h2 id="hello-h" className="h2 h2-sm" data-reveal>Say hello</h2>
          <a className="hello-mail" href={`mailto:${EMAIL}`} data-reveal>
            {EMAIL}
          </a>
          <div className="hello-actions" data-reveal>
            <button type="button" className="copy" onClick={copy} aria-live="polite">
              {copied ? 'Copied ✓' : 'Copy email'}
            </button>
            <span className="hello-note">Hiring, collaborating, or stuck on a tricky flow? Email is best, and my résumé is available on request.</span>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="foot-inner">
          <span className="foot-disc" aria-hidden="true" />
          <span>© 2026 Neha NK, product designer</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </>
  )
}
