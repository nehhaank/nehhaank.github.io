import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

// A real-time 3D flying disc for the hero. Click it (or press 8) to throw it.
export default function DiscScene() {
  const mount = useRef<HTMLDivElement>(null)
  const [hint, setHint] = useState<{ x: number; y: number } | null>(null)
  const [throws, setThrows] = useState(0)

  useEffect(() => {
    const host = mount.current
    if (!host) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    } catch {
      return
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.NeutralToneMapping
    renderer.toneMappingExposure = 0.95
    renderer.outputColorSpace = THREE.SRGBColorSpace
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environmentIntensity = 0.55

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100)
    camera.position.set(0, 5.5, 16)
    camera.lookAt(0, 0, 0)

    const sun = new THREE.DirectionalLight(0xfff4dc, 2.2)
    sun.position.set(-1.5, 12, 2.5)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    sun.shadow.camera.left = -14
    sun.shadow.camera.right = 14
    sun.shadow.camera.top = 10
    sun.shadow.camera.bottom = -10
    sun.shadow.radius = 14
    sun.shadow.blurSamples = 24
    scene.add(sun)
    scene.add(new THREE.HemisphereLight(0xfffbea, 0x5a7a52, 0.7))

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), new THREE.ShadowMaterial({ opacity: 0.32, color: 0x0c1a12 }))
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.9
    ground.receiveShadow = true
    scene.add(ground)

    // Disc: a lathe profile with a domed top and a rolled rim.
    const profile = [
      [0, 0.2], [0.5, 0.19], [0.9, 0.16], [1.15, 0.11], [1.28, 0.03], [1.31, -0.06],
      [1.28, -0.15], [1.22, -0.17], [1.19, -0.1], [1.2, 0.0], [1.12, 0.05], [0.6, 0.09], [0, 0.1],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    const discGeo = new THREE.LatheGeometry(profile, 96)
    const discMat = new THREE.MeshPhysicalMaterial({
      color: 0xf0b81c, roughness: 0.4, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.25, side: THREE.DoubleSide,
    })
    const disc = new THREE.Group()
    const body = new THREE.Mesh(discGeo, discMat)
    body.castShadow = true
    disc.add(body)
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x1d4630, roughness: 0.6 })
    for (const r of [0.62, 0.78]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.018, 8, 96), ringMat)
      ring.rotation.x = Math.PI / 2
      ring.position.y = 0.2 - r * r * 0.03
      disc.add(ring)
    }
    disc.scale.setScalar(1.15)
    scene.add(disc)

    const home = new THREE.Vector3()
    let curve = new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(1, 0, 0)])
    const trailGeo = new THREE.BufferGeometry()
    const trailMat = new THREE.LineDashedMaterial({ color: 0x2e7a4b, dashSize: 0.12, gapSize: 0.22, transparent: true, opacity: 0 })
    const trail = new THREE.Line(trailGeo, trailMat)
    scene.add(trail)

    const layout = () => {
      const w = host.clientWidth
      const h = host.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      const narrow = w < 700
      const dist = camera.position.length()
      const visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist
      const visW = visH * camera.aspect
      // Park the disc on the anchor the page lays out for it.
      const anchor = host.closest('.hero')?.querySelector('.disc-anchor')
      if (anchor) {
        const a = anchor.getBoundingClientRect()
        const hr = host.getBoundingClientRect()
        const nx = ((a.left + a.width / 2 - hr.left) / w) * 2 - 1
        const ny = -((a.top + a.height / 2 - hr.top) / h) * 2 + 1
        const dir = new THREE.Vector3(nx, ny, 0.5).unproject(camera).sub(camera.position).normalize()
        home.copy(camera.position).addScaledVector(dir, -camera.position.z / dir.z)
      } else {
        home.set(visW * 0.29, visH * 0.2, 0)
      }
      ground.position.y = home.y - (narrow ? 0.7 : 1.0)
      disc.scale.setScalar(narrow ? 0.62 : 0.92)
      const L = Math.min(visW * 0.42, 9)
      curve = new THREE.CatmullRomCurve3(
        [
          home.clone(),
          home.clone().add(new THREE.Vector3(-L * 0.35, 1.6, -3.5)),
          home.clone().add(new THREE.Vector3(-L * 0.95, 0.6, -2.0)),
          home.clone().add(new THREE.Vector3(-L * 0.7, -0.6, 2.2)),
          home.clone().add(new THREE.Vector3(-L * 0.15, -0.2, 1.4)),
          home.clone(),
        ],
        false,
        'centripetal',
      )
      trailGeo.setFromPoints(curve.getPoints(160))
      trail.computeLineDistances()
      const p = home.clone().project(camera)
      setHint({ x: ((p.x + 1) / 2) * w, y: ((1 - p.y) / 2) * h })
    }
    layout()
    const ro = new ResizeObserver(layout)
    ro.observe(host)
    document.fonts?.ready.then(layout)

    // pointer tilt and throw
    const pointer = new THREE.Vector2(0, 0)
    const raycaster = new THREE.Raycaster()
    let flightStart = -1
    const FLIGHT = 2.3
    const clock = new THREE.Clock()

    const throwIt = () => {
      if (flightStart >= 0) return
      setThrows((t) => t + 1)
      if (reduce) return
      flightStart = clock.getElapsedTime()
    }
    const hero = host.closest('.hero') as HTMLElement | null
    const toNdc = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    }
    const onMove = (e: PointerEvent) => {
      const n = toNdc(e)
      pointer.copy(n)
      raycaster.setFromCamera(n, camera)
      const hit = raycaster.intersectObject(body).length > 0
      if (hero) hero.style.cursor = hit ? 'grab' : ''
    }
    const onDown = (e: PointerEvent) => {
      raycaster.setFromCamera(toNdc(e), camera)
      if (raycaster.intersectObject(body).length > 0 && !(e.target as HTMLElement).closest('.disc-hit')) throwIt()
    }
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
      if (e.key === '8') throwIt()
    }
    hero?.addEventListener('pointermove', onMove)
    hero?.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    const onThrowEvt = () => throwIt()
    window.addEventListener('disc:throw', onThrowEvt)

    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(host)

    let raf = 0
    const tmp = new THREE.Vector3()
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!visible) return
      const t = clock.getElapsedTime()
      let spin = 0.6
      if (flightStart >= 0) {
        const k = Math.min(1, (t - flightStart) / FLIGHT)
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2
        curve.getPointAt(e, disc.position)
        curve.getTangentAt(Math.min(e, 0.999), tmp)
        disc.rotation.z = THREE.MathUtils.lerp(disc.rotation.z, -tmp.x * 0.35, 0.15)
        disc.rotation.x = THREE.MathUtils.lerp(disc.rotation.x, tmp.z * 0.3 + 0.15, 0.15)
        trailMat.opacity = Math.sin(k * Math.PI) * 0.55
        spin = 14 * (1 - k) + 0.6
        if (k >= 1) flightStart = -1
      } else {
        const bob = reduce ? 0 : Math.sin(t * 1.3) * 0.08
        disc.position.lerp(tmp.copy(home).setY(home.y + bob), 0.2)
        disc.rotation.x = THREE.MathUtils.lerp(disc.rotation.x, 0.22 - pointer.y * 0.25, 0.06)
        disc.rotation.z = THREE.MathUtils.lerp(disc.rotation.z, -0.12 - pointer.x * 0.25, 0.06)
        trailMat.opacity *= 0.92
      }
      if (!reduce) body.rotation.y += spin * 0.016
      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      hero?.removeEventListener('pointermove', onMove)
      hero?.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('disc:throw', onThrowEvt)
      renderer.dispose()
      pmrem.dispose()
      host.removeChild(renderer.domElement)
    }
  }, [])

  const label = throws === 0 ? 'Throw the disc' : throws === 1 ? 'Nice throw. Again?' : `${throws} throws, no drops`
  return (
    <div ref={mount} className="disc-scene">
      {hint && (
        <button
          type="button"
          className="disc-hit"
          style={{ left: hint.x, top: hint.y }}
          onClick={() => window.dispatchEvent(new Event('disc:throw'))}
          aria-label={label}
          title={label}
        />
      )}
    </div>
  )
}
