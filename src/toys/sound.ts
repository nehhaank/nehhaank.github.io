// Small synthesized sounds for the toys. Nothing is loaded: every sound is built from noise and
// oscillators on demand, and only after the visitor has interacted with something.
let ctx: AudioContext | null = null

function ac() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!C) return null
    ctx = new C()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function noiseBuffer(a: AudioContext, seconds: number) {
  const len = Math.max(1, Math.floor(a.sampleRate * seconds))
  const buf = a.createBuffer(1, len, a.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  return buf
}

function burst(opts: { dur: number; freq: number; q?: number; type?: BiquadFilterType; gain?: number; attack?: number; when?: number }) {
  const a = ac()
  if (!a) return
  const t = a.currentTime + (opts.when ?? 0)
  const src = a.createBufferSource()
  src.buffer = noiseBuffer(a, opts.dur)
  const f = a.createBiquadFilter()
  f.type = opts.type ?? 'bandpass'
  f.frequency.value = opts.freq
  f.Q.value = opts.q ?? 1
  const g = a.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(opts.gain ?? 0.3, t + (opts.attack ?? 0.004))
  g.gain.exponentialRampToValueAtTime(0.0001, t + opts.dur)
  src.connect(f).connect(g).connect(a.destination)
  src.start(t)
  src.stop(t + opts.dur + 0.02)
}

function tone(freq: number, dur: number, gain = 0.12, type: OscillatorType = 'sine', when = 0, slide = 1) {
  const a = ac()
  if (!a) return
  const t = a.currentTime + when
  const o = a.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur)
  const g = a.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.006)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(a.destination)
  o.start(t)
  o.stop(t + dur + 0.02)
}

export const sfx = {
  // a rubber stamp meeting paper
  stamp() {
    tone(90, 0.12, 0.22, 'sine', 0, 0.6)
    burst({ dur: 0.07, freq: 900, q: 0.7, gain: 0.25 })
  },
  // clay on clay
  clack() {
    tone(520, 0.07, 0.08, 'triangle', 0, 0.7)
    burst({ dur: 0.05, freq: 2400, q: 2, gain: 0.18 })
  },
  // one stroke of an eraser
  rub(when = 0) {
    burst({ dur: 0.16, freq: 1700, q: 0.6, gain: 0.07, attack: 0.05, when })
    burst({ dur: 0.16, freq: 4200, q: 1.2, gain: 0.03, attack: 0.06, when })
  },
  // a knife taking a shaving off
  shave() {
    burst({ dur: 0.09 + Math.random() * 0.05, freq: 2600 + Math.random() * 1500, q: 3, gain: 0.05, attack: 0.01 })
  },
  // a paper page turning
  page() {
    burst({ dur: 0.28, freq: 3000, q: 0.5, gain: 0.06, attack: 0.08 })
    burst({ dur: 0.12, freq: 900, q: 0.8, gain: 0.04, attack: 0.02, when: 0.18 })
  },
  // a sticky note letting go
  peel() {
    burst({ dur: 0.22, freq: 5200, q: 0.9, gain: 0.05, attack: 0.03 })
  },
  // a disc landing on grass or floor
  land() {
    tone(140, 0.16, 0.12, 'sine', 0, 0.5)
    burst({ dur: 0.12, freq: 600, q: 0.6, gain: 0.08 })
  },
  whoosh() {
    burst({ dur: 0.5, freq: 700, q: 0.4, gain: 0.05, attack: 0.15 })
  },
  // a soft glass chime for the bloom
  chime() {
    tone(1318, 0.9, 0.05, 'sine')
    tone(1976, 0.7, 0.03, 'sine', 0.06)
  },
  glass() {
    tone(2200 + Math.random() * 600, 0.25, 0.015, 'sine')
  },
}
