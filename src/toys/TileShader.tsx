import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// A wall of amber glass blocks with late sun coming through, drawn by a shader. Each block is pressed
// glass with a wavy face, so the light inside breaks into slow, rippling caustics; the mortar between
// them is warm plaster. The pointer nudges the refraction a little, as if you were walking past.
const frag = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform float uDpr;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * noise(p); p *= 2.03; a *= 0.5; } return s; }

  void main() {
    vec2 px = vec2(vUv.x, 1.0 - vUv.y) * uRes / uDpr;   // CSS pixels, y down
    vec2 view = uRes / uDpr;
    float T = 118.0;             // block pitch
    float G = 7.0;               // mortar
    vec2 id = floor(px / T);
    vec2 f = px - id * T;
    float h = hash(id);
    float h2 = hash(id + 7.3);
    vec2 q = f - G * 0.5;
    float S = T - G;
    vec2 e = min(q, S - q);
    float edge = min(e.x, e.y);
    float inBlock = smoothstep(-0.5, 0.8, edge);
    vec2 uv = q / S;

    // glass tint: honey, amber, a few marmalade and a rare deep orange, as in a real mixed wall
    vec3 honey = vec3(0.95, 0.62, 0.17);
    vec3 amber = vec3(0.92, 0.49, 0.11);
    vec3 marm  = vec3(0.80, 0.36, 0.10);
    vec3 deep  = vec3(0.66, 0.24, 0.08);
    vec3 tint = mix(honey, amber, smoothstep(0.25, 0.7, h));
    tint = mix(tint, marm, smoothstep(0.72, 0.9, h2));
    tint = mix(tint, deep, step(0.93, h2) * 0.85);

    // the sun: a warm wash from the upper right that fades across the wall
    vec2 sunP = vec2(view.x * 0.85, -view.y * 0.2);
    float sun = 1.0 - smoothstep(0.0, 1.25, length((px - sunP) / max(view.x, view.y)));
    sun = 0.5 + 0.5 * sun;

    // wavy pressed glass: domain-warped ripples, nudged by the pointer and drifting very slowly
    vec2 m = (uMouse - 0.5) * 0.35;
    vec2 w = uv * 2.4 + h * 11.0 + m;
    vec2 warp = vec2(fbm(w + uTime * 0.025), fbm(w + 5.2 - uTime * 0.02));
    float wave = fbm(w * 1.4 + warp * 2.2);
    // caustics: thin bright filaments where the waves focus the light
    float c = 1.0 - abs(sin(wave * 4.2 + h * 6.0));
    // calmer behind the words in the middle of the wall
    vec2 tz = (vUv - vec2(0.5, 0.68)) * vec2(1.6, 2.4);
    float calm = 1.0 - 0.6 * (1.0 - smoothstep(0.35, 0.9, length(tz)));
    float caustic = (smoothstep(0.72, 1.0, c) * 0.4 + pow(c, 2.0) * 0.1) * calm;
    // glass is thicker toward the rim, so the middle glows and the edges go dark and rich
    float depth = smoothstep(0.0, 0.32, min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y)));
    vec3 glass = tint * (0.5 + 0.32 * depth + 0.18 * wave);
    glass += tint * vec3(1.15, 1.0, 0.75) * caustic * sun * (0.6 + 0.4 * depth);
    glass *= 0.62 + 0.5 * sun;

    // the pressed frame of each block: a dark inner groove, then a bright lip catching the sun
    float groove = smoothstep(9.0, 4.0, edge) * smoothstep(1.0, 3.5, edge);
    float lip = smoothstep(3.5, 1.5, edge) * smoothstep(0.0, 1.2, edge);
    glass = mix(glass, glass * vec3(0.78, 0.5, 0.26), groove * 0.7);
    float lit = clamp(0.4 + 0.6 * (e.y == q.y ? 1.0 : 0.6) * (e.x == S - q.x ? 1.0 : 0.7), 0.0, 1.0);
    glass += vec3(1.0, 0.78, 0.42) * lip * lit * 0.32 * sun;

    // mortar: warm plaster, picking up an orange glow from the glass on either side
    vec3 mortar = vec3(0.72, 0.58, 0.44) * (0.92 + 0.08 * noise(px * 0.5));
    mortar *= 0.55 + 0.45 * sun;
    mortar += vec3(0.25, 0.11, 0.02) * sun * 0.35;
    mortar *= 0.8 + 0.2 * smoothstep(-3.0, 0.0, edge);

    vec3 outc = mix(mortar, glass, inBlock);
    // keep it low-key: a soft vignette and a lifted middle where the words sit
    vec2 cv = vUv - vec2(0.5, 0.55);
    outc *= 0.86 + 0.2 * (1.0 - smoothstep(0.2, 0.85, length(cv * vec2(1.0, 1.3))));
    outc += (hash(px + uTime) - 0.5) * 0.012;
    gl_FragColor = vec4(outc, 1.0);
  }
`

export default function TileShader() {
  const mount = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = mount.current
    if (!host) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'low-power' })
    } catch {
      return
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    const dprNow = Math.min(window.devicePixelRatio, 1.5)
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const uniforms = {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.7, 0.6) },
      uDpr: { value: 1 },
    }
    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }',
      fragmentShader: frag,
    })
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat))

    const ready = true
    host.classList.add('is-ready')

    const layout = () => {
      const w = host.clientWidth
      const h = host.clientHeight
      renderer.setSize(w, h, false)
      uniforms.uRes.value.set(w * dprNow, h * dprNow)
      uniforms.uDpr.value = dprNow
      if (ready) renderer.render(scene, camera)
    }
    layout()
    const ro = new ResizeObserver(layout)
    ro.observe(host)

    const target = uniforms.uMouse.value.clone()
    const section = host.parentElement
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      target.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height)
    }
    section?.addEventListener('pointermove', onMove)

    let visible = false
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(host)

    const clock = new THREE.Clock()
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!visible || !ready || reduce) return
      uniforms.uTime.value = clock.getElapsedTime()
      uniforms.uMouse.value.lerp(target, 0.06)
      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      section?.removeEventListener('pointermove', onMove)
      renderer.dispose()
      host.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mount} className="tiles" aria-hidden="true" />
}
