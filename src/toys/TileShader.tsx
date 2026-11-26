import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// A wall of hand-glazed saffron tiles, drawn by a shader. Every tile is a little out of true and its glaze
// pools unevenly; a skylight catches the gloss, and a second light follows the pointer.
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
    // CSS-pixel coordinates, y down
    vec2 px = vec2(vUv.x, 1.0 - vUv.y) * uRes / uDpr;
    float T = 92.0;              // tile pitch
    float G = 3.0;               // grout
    vec2 id = floor(px / T);
    vec2 f = px - id * T;        // position inside the cell
    float h = hash(id);
    float h2 = hash(id + 7.3);
    // hand-made tiles: each is a touch out of square and out of place
    vec2 jit = (vec2(hash(id + 1.1), hash(id + 2.7)) - 0.5) * 2.2;
    vec2 q = f - G * 0.5 - jit;
    float S = T - G;
    vec2 e = min(q, S - q);      // distance to each edge
    float edge = min(e.x, e.y);
    float inTile = smoothstep(-0.6, 0.8, edge);

    // glaze colour: saffron to marigold to a deeper ochre, the way a real wall varies
    vec3 c1 = vec3(0.957, 0.690, 0.118);
    vec3 c2 = vec3(0.925, 0.580, 0.086);
    vec3 c3 = vec3(0.976, 0.765, 0.247);
    vec3 col = mix(c1, c2, smoothstep(0.2, 0.9, h));
    col = mix(col, c3, smoothstep(0.75, 1.0, h2) * 0.8);
    if (h2 < 0.08) col *= 0.88;
    // glaze pools thicker in the middle and runs thin at the edges
    vec2 uv = q / S;
    float pool = fbm(uv * 2.2 + h * 9.0);
    col *= 0.9 + 0.16 * pool;
    col = mix(col * 1.08 + 0.03, col, smoothstep(1.0, 9.0, edge));

    // surface normal: a pillowed tile with a wavy glaze
    float nh = fbm(uv * 3.0 + h * 17.0 + vec2(0.0, uTime * 0.0));
    vec2 grad = vec2(fbm(uv * 3.0 + h * 17.0 + vec2(0.01, 0.0)) - nh, fbm(uv * 3.0 + h * 17.0 + vec2(0.0, 0.01)) - nh) * 60.0;
    vec2 bevel = vec2(
      (smoothstep(10.0, 0.0, q.x) - smoothstep(10.0, 0.0, S - q.x)),
      (smoothstep(10.0, 0.0, q.y) - smoothstep(10.0, 0.0, S - q.y))
    ) * 0.55;
    vec3 n = normalize(vec3(-bevel * vec2(1.0, 1.0) + grad * 0.35, 1.0));

    // light: a skylight above and to the right, and a lamp that follows the pointer
    vec3 V = vec3(0.0, 0.0, 1.0);
    vec2 mp = vec2(uMouse.x, 1.0 - uMouse.y) * uRes / uDpr;
    vec3 L1 = normalize(vec3(0.35, -0.75, 0.7));
    vec3 L2 = normalize(vec3((mp - px) / 420.0, 0.6));
    float diff = 0.78 + 0.22 * max(dot(n, L1), 0.0);
    vec3 H1 = normalize(L1 + V);
    vec3 H2 = normalize(L2 + V);
    float spec = pow(max(dot(n, H1), 0.0), 90.0) * 0.32 + pow(max(dot(n, H2), 0.0), 160.0) * 0.5;
    float sheen = pow(max(dot(n, H2), 0.0), 12.0) * 0.12;
    // skylight falls off down the wall
    float sky = 1.06 - 0.16 * smoothstep(0.0, 1.0, vUv.y < 0.0 ? 0.0 : 1.0 - vUv.y);
    vec3 tile = col * diff * sky + vec3(1.0, 0.97, 0.88) * (spec + sheen);

    // grout: chalky off-white, shadowed where it meets the tile
    vec3 grout = vec3(0.93, 0.86, 0.74) * (0.9 + 0.1 * noise(px * 0.6));
    grout *= 0.82 + 0.18 * smoothstep(-2.5, 0.0, edge);
    vec3 outc = mix(grout, tile, inTile);
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
