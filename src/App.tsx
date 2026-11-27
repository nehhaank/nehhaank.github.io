import { useEffect, useRef, useState } from 'react'
import { FieldMap } from './FieldMap'
import { Artboard } from './Mocks'
import { Frisbee } from './toys/Frisbee'
import { Bloom } from './toys/Bloom'
import { StickyNotes } from './toys/StickyNotes'
import { ClayTicTacToe } from './toys/ClayTicTacToe'
import { Stamps } from './toys/Stamps'
import { Carve } from './toys/Carve'
import { TinyBook } from './toys/TinyBook'
import { SakuraBottle } from './toys/SakuraBottle'

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
    notes: ['One grid, three ways to slice it', 'The cell that needs attention is the only red one'],
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

const alsoMade = [
  ['A four-poster cot', 'woodworking with a mentor, still in progress'],
  ['Focaccia, and friends', 'cookies, brownies, apple pie, and what a substitution does to texture'],
  ['Fantasy, on the side', 'dragons and long series; Eragon got there first'],
]

function Head({ id, n, title, note, dark }: { id: string; n: string; title: React.ReactNode; note?: string; dark?: boolean }) {
  return (
    <header className={`sh${dark ? ' on-dark' : ''}`} data-reveal>
      <span className="sh-n" aria-hidden="true">{n}</span>
      <h2 className="sh-t" id={id}>{title}</h2>
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
        <nav aria-label="Sections" className="top-nav">
          <a href="#work">Work</a>
          <a href="#field">Field</a>
          <a href="#top" className="mark" aria-label="Neha NK, back to top">
            <span className="mark-disc" aria-hidden="true" />
            Neha NK
          </a>
          <a href="#making">By hand</a>
          <a href="#hello">Say hello</a>
        </nav>
      </header>

      <main id="main">
        <section className="hero" id="top" data-name="the hero">
          <div className="hero-inner">
            <p className="eyebrow">Neha NK, product designer</p>
            <h1 className="hero-title">
              I just love <em>making things</em>.
            </h1>
            <p className="lede">
              Software, mostly: configuration screens, edge cases and the small words that make them make sense, most
              recently at WeCP and Invisible Technologies. Also spoons, stamps, clay and tiny books.
            </p>
            <dl className="ledger">
              <div><dt>Now</dt><dd>Captain, Learning to Fly</dd></div>
              <div><dt>Also</dt><dd>Level 1 Ultimate coach</dd></div>
              <div><dt>Bench</dt><dd>A four-poster cot, in wood</dd></div>
            </dl>
          </div>
          <div className="ledge">
            <div className="ledge-items">
              <Bloom />
              <div className="fris-spot">
                <span className="fris-home" aria-hidden="true" />
                <p className="fris-hint">Flick the frisbee. Or tap it, and go find where it lands.</p>
              </div>
              <StickyNotes />
            </div>
          </div>
        </section>

        <section id="work" className="section" aria-labelledby="work-h" data-name="Selected work">
          <Head id="work-h" n="01" title={<>Selected <em>work</em></>} note="Six problems from two companies. Screens are simplified sketches; full case studies are on the way." />
          <ol className="projects">
            {projects.map((p, i) => (
              <li className={`pj pj-${i + 1}`} key={p.id} data-reveal>
                <Artboard id={p.id} notes={p.notes} fit />
                <div className="pj-body">
                  <p className="pj-meta"><span>{String(i + 1).padStart(2, '0')}</span>{p.company}</p>
                  <h3 className="pj-t">{p.title}</h3>
                  <p className="pj-k">{p.kicker}</p>
                  <p className="pj-p">{p.problem}</p>
                  <ol className="pj-notes">
                    {p.notes.map((n, k) => <li key={n}><span>{k + 1}</span>{n}</li>)}
                  </ol>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="section desk" aria-labelledby="desk-h" data-name="On my desk">
          <Head id="desk-h" n="02" title={<>On my <em>desk</em></>} note="Smaller problems, each with its own tricky edge case." />
          <ol className="desk-list">
            {smaller.map(([c, t, d], i) => (
              <li key={t} data-reveal>
                <span className="d-n">{String(i + 1).padStart(2, '0')}</span>
                <p className="d-t">{t}</p>
                <p className="d-d">{d}</p>
                <span className={`d-c${c === 'WeCP' ? '' : ' is-i'}`}>{c}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="ways" aria-labelledby="ways-h" data-name="How I work">
          <Head id="ways-h" n="03" title={<>How I <em>work</em></>} />
          <p className="ways-text" data-reveal>
            I like the parts of a product where configuration, journeys and states have to hold together. I think in
            systems: roles, history, localisation, edge cases. I care about <em>the words on the buttons</em>, and
            I work closely with research and engineering to get them right.
          </p>
        </section>

        <section id="field" className="field" aria-labelledby="field-h" data-name="On the field">
          <div className="field-inner">
            <Head
              id="field-h"
              dark
              n="04"
              title={<>On the <em>field</em></>}
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

        <section id="making" className="section making" aria-labelledby="making-h" data-name="Made by hand">
          <Head id="making-h" n="05" title={<>Made <em>by hand</em></>} note="Away from screens: clay, erasers, wood and paper. Everything here is real, and you can play with all of it." />
          <div className="table">
            <article className="craft craft-clay">
              <ClayTicTacToe />
              <h3>Clay tic-tac-toe</h3>
              <p>Some Thatte Idli and Kaal Soup for the Bangalorean soul. Unfortunately, I haven&rsquo;t figured out how to serve food through a website. Tic-tac-toe, instead?</p>
            </article>
            <article className="craft craft-stamps">
              <Stamps />
              <h3>Carved stamps</h3>
              <p>A little collection of my hand-carved stamps, brought to the digital world. Go ahead, leave your mark!</p>
            </article>
            <article className="craft craft-spoon">
              <Carve />
              <h3>A carved spoon</h3>
              <p>Whittled from a single piece of wood. Yours will take less time.</p>
            </article>
            <article className="craft craft-book">
              <TinyBook />
              <h3>A teeny tiny book</h3>
              <p>Bound in suede, with mushrooms inside.</p>
            </article>
          </div>
          <ul className="also-made">
            {alsoMade.map(([t, d]) => (
              <li key={t}><b>{t}</b>, {d}.</li>
            ))}
          </ul>
        </section>

        <section id="hello" className="hello" aria-labelledby="hello-h" data-name="Say hello">
          <div className="hello-inner">
            <SakuraBottle />
            <Head id="hello-h" n="06" dark title={<>Say <em>hello</em></>} />
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
      <Frisbee />
    </>
  )
}
