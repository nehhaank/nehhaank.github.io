import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// The field band's ground: mown turf drawn by a shader.
// Stripes from the mower, a slow cloud shadow, and the pointer lights the grass.
const frag = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }

  void main() {
    vec2 px = vUv * uRes;
    // mowing stripes: fixed 160px bands, crisp but not hard
    float band = mod(floor(px.x / 160.0), 2.0);
    float edge = smoothstep(0.0, 2.0, abs(mod(px.x, 160.0) - 0.0));
    vec3 a = vec3(0.114, 0.275, 0.188);
    vec3 b = vec3(0.124, 0.292, 0.200);
    vec3 col = mix(a, b, band);
    // blade texture: fine streaks running with the mow direction
    float blades = noise(vec2(px.x * 0.9, px.y * 0.035 + band * 40.0));
    col *= 0.985 + 0.02 * blades;
    // slow cloud shadow
    float cloud = noise(vUv * vec2(1.6, 1.0) * 1.2 + vec2(uTime * 0.025, uTime * 0.008));
    col *= 0.96 + 0.05 * smoothstep(0.3, 0.8, cloud);
    // pointer light
    float aspect = uRes.x / uRes.y;
    vec2 d = (vUv - uMouse) * vec2(aspect, 1.0);
    col += vec3(0.95, 0.82, 0.3) * 0.07 * exp(-dot(d, d) * 6.0);
    col += (hash(px + uTime) - 0.5) * 0.008;
    col *= edge * 0.04 + 0.96;
    gl_FragColor = vec4(col, 1.0);
  }
`

export default function GrassShader() {
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
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const uniforms = {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.7, 0.6) },
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
      uniforms.uRes.value.set(w, h)
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

  return <div ref={mount} className="grass" aria-hidden="true" />
}
