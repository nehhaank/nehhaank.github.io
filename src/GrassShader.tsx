import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import grassUrl from './assets/grass.jpg'

// The field band's ground: a generated grass image, moved by a shader.
// Wind sways the blades, a slow cloud shadow drifts across, and the pointer lights the turf.
const frag = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform float uImgAspect;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }

  void main() {
    // cover-fit the image
    float screenAspect = uRes.x / uRes.y;
    vec2 uv = vUv;
    if (screenAspect > uImgAspect) { uv.y = (uv.y - 0.5) * uImgAspect / screenAspect + 0.5; }
    else { uv.x = (uv.x - 0.5) * screenAspect / uImgAspect + 0.5; }

    // wind: gusts travel diagonally and bend the blades sideways
    float gust = noise(vec2(uv.x * 3.0 - uTime * 0.35, uv.y * 2.0 + uTime * 0.1));
    uv.x += (gust - 0.5) * 0.006;

    vec3 col = texture2D(uTex, uv).rgb;

    // drifting cloud shadow
    float cloud = noise(vUv * vec2(1.4, 1.0) + vec2(uTime * 0.03, uTime * 0.01));
    col *= 0.9 + 0.2 * smoothstep(0.25, 0.8, cloud);

    // pointer light
    vec2 d = (vUv - uMouse) * vec2(screenAspect, 1.0);
    col += vec3(0.95, 0.85, 0.35) * 0.12 * exp(-dot(d, d) * 9.0);

    // keep text legible: pull toward deep green and vignette the edges
    col = mix(col, vec3(0.11, 0.27, 0.18), 0.15);
    float v = smoothstep(1.25, 0.35, length((vUv - 0.5) * vec2(1.2, 1.6)));
    col *= 0.9 + 0.1 * v;

    // film grain
    col += (hash(vUv * uRes + uTime) - 0.5) * 0.015;
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
      uTex: { value: null as THREE.Texture | null },
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.7, 0.6) },
      uImgAspect: { value: 16 / 9 },
    }
    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }',
      fragmentShader: frag,
    })
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat))

    let ready = false
    new THREE.TextureLoader().load(grassUrl, (tex) => {
      tex.wrapS = tex.wrapT = THREE.MirroredRepeatWrapping
      uniforms.uTex.value = tex
      const img = tex.image as HTMLImageElement
      uniforms.uImgAspect.value = img.width / img.height
      ready = true
      host.classList.add('is-ready')
      renderer.render(scene, camera)
    })

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
