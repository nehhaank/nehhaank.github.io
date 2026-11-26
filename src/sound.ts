// Tiny, quiet sound kit. Every sound is synthesised with the Web Audio API,
// so there are no audio files to download. Sound stays off until the visitor
// switches it on, and every effect is kept deliberately soft.

type Listener = (on: boolean) => void

let ctx: AudioContext | null = null
let master: GainNode | null = null
let enabled = false
const listeners = new Set<Listener>()
let noiseBuffer: AudioBuffer | null = null

function ensureContext() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.55
    const soften = ctx.createBiquadFilter()
    soften.type = 'lowpass'
    soften.frequency.value = 4200
    master.connect(soften).connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function noise(c: AudioContext) {
  if (!noiseBuffer) {
    noiseBuffer = c.createBuffer(1, c.sampleRate * 0.6, c.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  const src = c.createBufferSource()
  src.buffer = noiseBuffer
  return src
}

function envelope(c: AudioContext, peak: number, attack: number, release: number) {
  const g = c.createGain()
  const t = c.currentTime
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(peak, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + release)
  g.connect(master!)
  return g
}

function tone(freq: number, peak: number, release: number, type: OscillatorType = 'sine', bendTo?: number, delay = 0) {
  const c = ensureContext()
  if (!c) return
  const run = () => {
    const o = c.createOscillator()
    o.type = type
    o.frequency.setValueAtTime(freq, c.currentTime)
    if (bendTo) o.frequency.exponentialRampToValueAtTime(bendTo, c.currentTime + release)
    const g = envelope(c, peak, 0.012, release)
    o.connect(g)
    o.start()
    o.stop(c.currentTime + release + 0.05)
  }
  if (delay) window.setTimeout(run, delay * 1000)
  else run()
}

function hush(type: BiquadFilterType, freq: number, peak: number, release: number, sweepTo?: number, q = 1) {
  const c = ensureContext()
  if (!c) return
  const n = noise(c)
  const f = c.createBiquadFilter()
  f.type = type
  f.Q.value = q
  f.frequency.setValueAtTime(freq, c.currentTime)
  if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, c.currentTime + release)
  const g = envelope(c, peak, 0.01, release)
  n.connect(f).connect(g)
  n.start()
  n.stop(c.currentTime + release + 0.05)
}

export const sound = {
  get on() {
    return enabled
  },
  set(on: boolean) {
    enabled = on
    if (on) {
      ensureContext()
      sound.chime(true)
    }
    listeners.forEach(l => l(on))
  },
  subscribe(l: Listener) {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  },
  /** Soft cardboard thump. */
  tap() {
    if (!enabled) return
    hush('bandpass', 700, 0.09, 0.07, 380, 1.4)
    tone(150, 0.035, 0.08)
  },
  /** Little wooden knock. */
  tok() {
    if (!enabled) return
    tone(620 + Math.random() * 60, 0.05, 0.09, 'triangle')
    tone(1240, 0.012, 0.05)
  },
  /** Squishy clay press. */
  squish() {
    if (!enabled) return
    tone(260 + Math.random() * 40, 0.05, 0.18, 'sine', 130)
    hush('lowpass', 500, 0.025, 0.12)
  },
  /** Tape being smoothed down. */
  peel() {
    if (!enabled) return
    hush('highpass', 2600, 0.02, 0.22, 900, 0.7)
  },
  /** A disc gliding through the air. */
  whoosh(strength = 1) {
    if (!enabled) return
    hush('bandpass', 380, 0.03 * Math.min(1, strength), 0.45, 1100, 0.9)
  },
  /** Two gentle notes. */
  chime(up = true) {
    if (!enabled) return
    const a = up ? 523.25 : 659.25
    const b = up ? 783.99 : 523.25
    tone(a, 0.035, 0.5)
    tone(b, 0.03, 0.7, 'sine', undefined, 0.11)
  },
}
