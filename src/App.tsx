// Replace these placeholders with your real projects when they are ready.
const projects = [
  { number: '01', title: 'Project one', style: 'path', note: 'A space for a future case study.' },
  { number: '02', title: 'Project two', style: 'stack', note: 'A space for a future case study.' },
  { number: '03', title: 'Project three', style: 'orbit', note: 'A space for a future case study.' },
]

function ProjectArtwork({ style }: { style: string }) {
  return (
    <div className={`artwork artwork-${style}`} aria-hidden="true">
      {style === 'path' && <><div className="path-line" /><span className="path-dot dot-start" /><span className="path-dot dot-end" /><span className="art-label">A → B</span></>}
      {style === 'stack' && <><span className="sheet sheet-back" /><span className="sheet sheet-middle" /><span className="sheet sheet-front"><i /><i /><i /></span></>}
      {style === 'orbit' && <><span className="orbit-ring ring-one" /><span className="orbit-ring ring-two" /><span className="orbit-center">✳</span></>}
    </div>
  )
}

export default function App() {
  return (
    <div className="page-shell mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-20">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="flex items-center justify-between border-b border-charcoal/20 py-7 sm:py-9">
        <a href="#" className="wordmark" aria-label="Neha NK home">Neha NK<span className="brand-dot" /></a>
        <nav aria-label="Main navigation" className="flex items-center gap-6 sm:gap-10 text-sm">
          <a className="nav-link" href="#work">Selected work <span aria-hidden="true">↘</span></a>
          <span className="hidden sm:block text-charcoal/60">Product Designer</span>
        </nav>
      </header>

      <main id="main">
        <section className="hero relative pt-20 pb-20 sm:pt-28 sm:pb-28 lg:pt-32 lg:pb-32" aria-labelledby="hero-title">
          <p className="eyebrow mb-9 flex items-center gap-3"><span className="small-star" aria-hidden="true">✳</span> A little clarity goes a long way</p>
          <h1 id="hero-title" className="max-w-[1050px]">I like making complicated things feel <span className="highlight">easier</span> to understand<span className="period">.</span></h1>
          <div className="mt-12 flex flex-col justify-between gap-8 sm:mt-14 md:flex-row md:items-end">
            <p className="max-w-[575px] text-lg leading-relaxed text-charcoal/75 sm:text-xl">I'm Neha NK, a product designer who enjoys understanding people, simplifying complex workflows, and making digital experiences more useful and thoughtful.</p>
            <a className="work-link shrink-0 self-start md:self-auto" href="#work"><span>Explore selected work</span><span className="round-arrow" aria-hidden="true">↓</span></a>
          </div>
        </section>

        <section id="work" className="scroll-mt-8 border-t border-charcoal/25 pt-7 pb-24 sm:pb-32" aria-labelledby="work-title">
          <div className="mb-10 flex items-baseline justify-between gap-4">
            <h2 id="work-title" className="section-heading">Selected Work<span className="ml-3 text-sm font-normal text-charcoal/50">(03)</span></h2>
            <span className="eyebrow text-charcoal/55">In the making</span>
          </div>
          <div className="grid gap-10 md:grid-cols-3 md:gap-6 lg:gap-8">
            {projects.map(project => (
              <article key={project.number} className="project-card">
                <div className="project-image relative overflow-hidden"><ProjectArtwork style={project.style} /><span className="coming-soon">Coming soon</span></div>
                <div className="mt-5 flex items-baseline gap-3"><span className="project-number">{project.number}</span><h3 className="text-xl font-medium tracking-tight">{project.title}</h3></div>
                <p className="mt-2 pl-7 text-sm leading-relaxed text-charcoal/60">{project.note}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="flex flex-col justify-between gap-8 border-t border-charcoal/25 py-9 sm:flex-row sm:items-center">
        <div><p className="font-semibold tracking-tight">Neha NK</p><p className="mt-1 text-sm text-charcoal/55">Product Designer</p></div>
        <a className="contact-placeholder text-sm" href="mailto:hello@example.com" aria-label="Contact placeholder: replace hello@example.com with your email">Contact <span aria-hidden="true">↗</span><span className="ml-2 text-xs text-charcoal/50">(placeholder)</span></a>
      </footer>
    </div>
  )
}
