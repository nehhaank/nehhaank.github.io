import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { FieldMap } from './FieldMap'
import { Artboard } from './Mocks'
import { Plate } from './Plates'

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
  notes: string[]
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
    notes: ['Pick the mode first; settings follow from it', 'Follow-ups drawn as a branch, so “adaptive” is visible'],
  },
  {
    id: 'multilingual',
    company: 'WeCP',
    title: 'Multilingual assessments',
    kicker: 'One test, many languages, and every state in between.',
    problem:
      'Language choice before and during a test, admin auto-detect and restrictions, English-locked questions, fallbacks, translation labels, and reports that keep the original-language answers.',
    parts: 'Language selection, in-test switching, translation labels, recruiter reports',
    notes: ['Switch language without leaving the question', 'Every translated question says so'],
  },
  {
    id: 'registration',
    company: 'WeCP',
    title: 'Candidate registration',
    kicker: 'Less friction before the test even begins.',
    problem:
      'A revamp of candidate onboarding and registration, including an AI-forward experience, so the first few minutes are clearer for people about to be assessed.',
    parts: 'Onboarding flow, registration, AI-forward entry',
    notes: ['Two fields. Nothing optional, nothing extra', 'Proctoring consent stated before the test, not during'],
  },
  {
    id: 'onboarding',
    company: 'Invisible Technologies',
    title: 'Expert onboarding',
    kicker: 'From browsing as a guest to ready to work, without losing your place.',
    problem:
      'Product and design work on an expert application journey: logged-out exploration, starting and resuming an application, an inline assessment, verification order and status progression.',
    parts: 'Journey mapping, resumable applications, inline assessment, specs',
    notes: ['Status steps in the order they actually happen', 'Leave any time; resume exactly where you stopped'],
  },
  {
    id: 'planner',
    company: 'Invisible Technologies',
    title: 'Capacity planner',
    kicker: 'Dense operational data, arranged so it reads at a glance.',
    problem:
      'A redesign of an internal planning tool around a single grid, with views by profile, work type and cohort, rows that expand in place, and outputs moved beneath the planning surface.',
    parts: 'Grid layout, view switching, inline expansion, helper text',
    notes: ['One grid, three ways to slice it', 'The cell that needs attention is the only yellow one'],
  },
  {
    id: 'savings',
    company: 'Invisible Technologies',
    title: 'Savings dashboard',
    kicker: 'Making modelled value traceable, not just big.',
    problem:
      'A KPI dashboard for estimated savings: a hero figure, with-and-without comparisons, a by-period chart, visible baseline assumptions and a step-by-step calculation breakdown.',
    parts: 'Comparative KPIs, assumption cards, calculation breakdown',
    notes: ['With and without, on the same scale', 'Every figure can show its working'],
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
  { id: 'cot', fig: 'Front elevation', title: 'A four-poster cot', text: 'A woodworking project with a mentor. Joinery, material choices, and a lot of patience.', tag: 'In progress' },
  { id: 'bread', fig: 'Plan view', title: 'Focaccia, and friends', text: 'Focaccia, chocolate-chip cookies, brownies, apple pie, and what a substitution does to texture.', tag: 'Ongoing' },
  { id: 'books', fig: 'Shelf elevation', title: 'Fantasy, on the side', text: 'Dragons and long series. Eragon got there first.', tag: 'Always' },
]

function Head({ id, title, note, dark, big, count, serif }: { id: string; title: string; note?: string; dark?: boolean; big?: boolean; count?: string; serif?: boolean }) {
  return (
    <header className={`sh${dark ? ' on-dark' : ''}${big ? ' is-big' : ''}${serif ? ' is-serif' : ''}`} data-reveal>
      <h2 className="sh-t" id={id}>{title}{count && <sup className="sh-count">{count}</sup>}</h2>
      {note && <p className="sh-note">{note}</p>}
    </header>
  )
}

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
            ;(e.target.querySelector('animateMotion') as SVGAnimationElement | null)?.beginElement()
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
          <a href="#making">By hand</a>
          <a href="#hello" className="top-cta">Say hello</a>
        </nav>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <svg className="hero-arc" viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true">
            <path d="M880 112 C 700 -14, 300 -10, -40 22" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="hero-scene">
            <Suspense fallback={null}>
              <DiscScene />
            </Suspense>
          </div>
          <h1 className="hero-title">
            <span className="hl hl-1">I design the</span>
            <span className="hl hl-band"><span>complicated middle</span><span className="disc-anchor" aria-hidden="true" /></span>
            <span className="hl hl-3">of software.</span>
          </h1>
          <div className="hero-foot">
            <p className="lede">
              Configuration screens, edge cases, multi-step journeys, and the small words that make them make sense.
              Most recently at WeCP and Invisible Technologies.
            </p>
            <dl className="ledger">
              <div><dt>Now</dt><dd>Captain, Learning to Fly</dd></div>
              <div><dt>Also</dt><dd>Level 1 Ultimate coach</dd></div>
              <div><dt>Bench</dt><dd>A four-poster cot, in wood</dd></div>
            </dl>
          </div>
        </section>

        <section id="work" className="section" aria-labelledby="work-h">
          <Head big id="work-h" title="Selected work" count="(06)" note="Six problems from two companies. Screens are simplified sketches; full case studies are on the way." />
          <ol className="projects">
            {projects.map((p, i) => (
              <li className={`pj ${['is-lead', 'is-wide', 'is-half', 'is-half', 'is-wide is-flip', 'is-half'][i]} tone-${i}`} key={p.id} data-reveal>
                <Artboard id={p.id} notes={i === 0 ? p.notes : undefined} />
                <div className="pj-body">
                  <p className="label"><span>{String(i + 1).padStart(2, '0')}</span><span>{p.company}</span></p>
                  <h3 className="pj-t">{p.title}</h3>
                  <p className="pj-k">{p.kicker}</p>
                  <p className="pj-p">{p.problem}</p>
                </div>
              </li>
            ))}
            <li className="pj is-half desk" data-reveal>
              <h3 className="desk-h">Also on my desk</h3>
              <p className="desk-sub">Smaller problems, each with its own tricky edge case.</p>
              <ol className="desk-list">
                {smaller.map(([c, t, d]) => (
                  <li key={t}>
                    <p className="d-t">{t}</p>
                    <span className="d-c">{c}</span>
                    <p className="d-d">{d}</p>
                  </li>
                ))}
              </ol>
            </li>
          </ol>
        </section>

        <section className="ways" aria-labelledby="ways-h">
          <h2 className="ways-h" id="ways-h" data-reveal>How I work</h2>
          <p className="ways-text" data-reveal>
            I like the parts of a product where configuration, journeys and states have to hold together. I think in
            systems: roles, history, localisation, edge cases. I care about <em>the words on the buttons</em>, and
            I work closely with research and engineering to get them right.
          </p>
        </section>

        <section id="field" className="field" aria-labelledby="field-h">
          <Suspense fallback={null}>
            <GrassShader />
          </Suspense>
          <div className="field-inner">
            <Head
              id="field-h"
              dark
              title="On the field"
              note="Ultimate Frisbee is a big part of my life: a self-refereed sport where reading space, timing and people matters as much as the throw."
            />
            <FieldMap />
            <dl className="field-list">
              {[...field, ['Also', 'Kit and sprints', 'Kit concepts for the Hong Kong campaign, and coached sprint sessions three times a week.']].map(([t, k, d]) => (
                <div key={t} data-reveal>
                  <dt>{t}</dt>
                  <span className="f-k">{k}</span>
                  <dd>{d}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="making" className="section making" aria-labelledby="making-h">
          <Head serif id="making-h" title="Made by hand" note="Away from screens: wood, dough, and the occasional dragon." />
          <div className="make-grid">
            {making.map((m, i) => (
              <article className={`make make-${m.id}`} key={m.title} data-reveal>
                <figure className="plate">
                  <Plate id={m.id} />
                  <figcaption><span>Fig. {i + 1}</span><span>{m.fig}</span></figcaption>
                </figure>
                <p className="label">{m.tag}</p>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="hello" className="hello" aria-labelledby="hello-h">
          <div className="hello-inner">
            <h2 className="hello-label" id="hello-h" data-reveal>Say hello</h2>
            <a className="hello-mail" href={`mailto:${EMAIL}`} data-reveal>
              <span>{EMAIL}</span>
            </a>
            <div className="hello-actions" data-reveal>
              <button type="button" className="copy" onClick={copy} aria-live="polite">
                {copied ? 'Copied ✓' : 'Copy email'}
              </button>
              <p className="hello-note">Hiring, collaborating, or stuck on a tricky flow? Email is best, and my résumé is available on request.</p>
            </div>
            <div className="foot">
              <span>© 2026 Neha NK, product designer</span>
              <a href="#top">Back to top ↑</a>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
