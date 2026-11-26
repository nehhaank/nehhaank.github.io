// Offline renderer for the "Things I make" images. See scripts/render-objects.cjs.
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

const obj = new URLSearchParams(location.search).get('obj') || 'cot'
const S = 900
const W = S
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
renderer.setPixelRatio(1)
renderer.setSize(W, S)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.NeutralToneMapping
renderer.toneMappingExposure = 0.95
renderer.outputColorSpace = THREE.SRGBColorSpace
document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()
const BG = '#f1ebd4'
scene.background = new THREE.Color(BG)
const pmrem = new THREE.PMREMGenerator(renderer)
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
scene.environmentIntensity = 0.45

const sun = new THREE.DirectionalLight(0xfff1d6, 2.6)
sun.position.set(-5, 9, 6)
sun.castShadow = true
sun.shadow.mapSize.set(2048, 2048)
Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 })
sun.shadow.radius = 10
sun.shadow.blurSamples = 20
scene.add(sun)
scene.add(new THREE.HemisphereLight(0xfffbea, 0x8a7a50, 0.5))

const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.18, color: 0x3a2e14 }))
floor.rotation.x = -Math.PI / 2
floor.receiveShadow = true
scene.add(floor)

const loader = new THREE.TextureLoader()
const tex = (name, rx = 1, ry = 1) => {
  const t = loader.load('/src/assets/' + name)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(rx, ry)
  t.anisotropy = 8
  return t
}
const add = (m) => { m.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true } }); scene.add(m); return m }

const camera = new THREE.PerspectiveCamera(26, W / S, 0.1, 100)

if (obj === 'cot') {
  const wood = new THREE.MeshPhysicalMaterial({ map: tex('wood.jpg', 0.5, 2), roughness: 0.55, clearcoat: 0.35, clearcoatRoughness: 0.4 })
  const woodH = new THREE.MeshPhysicalMaterial({ map: tex('wood.jpg', 3, 0.4), roughness: 0.55, clearcoat: 0.35, clearcoatRoughness: 0.4 })
  const prof = [[0,0],[0.17,0],[0.17,0.12],[0.12,0.18],[0.11,0.9],[0.15,1.0],[0.1,1.08],[0.1,2.2],[0.14,2.3],[0.09,2.4],[0.09,2.95],[0.13,3.05],[0.07,3.2],[0,3.26]]
    .map(([x, y]) => new THREE.Vector2(x, y))
  const postGeo = new THREE.LatheGeometry(prof, 40)
  const L = 3.2, D = 1.9
  for (const [x, z] of [[-L/2,-D/2],[L/2,-D/2],[-L/2,D/2],[L/2,D/2]]) {
    const p = add(new THREE.Mesh(postGeo, wood)); p.position.set(x, 0, z)
  }
  const rail = (len, x, y, z, rotY) => { const m = add(new THREE.Mesh(new RoundedBoxGeometry(len, 0.12, 0.12, 2, 0.03), woodH)); m.position.set(x, y, z); m.rotation.y = rotY }
  for (const y of [0.95, 2.25]) { rail(L, 0, y, -D/2, 0); rail(L, 0, y, D/2, 0); rail(D, -L/2, y, 0, Math.PI/2); rail(D, L/2, y, 0, Math.PI/2) }
  rail(L, 0, 3.0, -D/2, 0); rail(L, 0, 3.0, D/2, 0); rail(D, -L/2, 3.0, 0, Math.PI/2); rail(D, L/2, 3.0, 0, Math.PI/2)
  const bar = new THREE.CylinderGeometry(0.035, 0.035, 1.3, 12)
  for (let i = 1; i < 12; i++) {
    const x = -L/2 + (L * i) / 12
    for (const z of [-D/2, D/2]) { const b = add(new THREE.Mesh(bar, wood)); b.position.set(x, 1.6, z) }
  }
  for (let i = 1; i < 7; i++) {
    const z = -D/2 + (D * i) / 7
    for (const x of [-L/2, L/2]) { const b = add(new THREE.Mesh(bar, wood)); b.position.set(x, 1.6, z) }
  }
  const mattress = add(new THREE.Mesh(new RoundedBoxGeometry(L - 0.1, 0.22, D - 0.1, 3, 0.08), new THREE.MeshStandardMaterial({ color: '#faf6e9', roughness: 0.9 })))
  mattress.position.y = 1.08
  camera.position.set(7.6, 6.8, 10.3); camera.lookAt(0, 1.35, 0)
}

if (obj === 'focaccia') {
  const top = new THREE.MeshPhysicalMaterial({ color: '#e9b450', map: tex('focaccia.jpg', 1, 1), bumpMap: tex('focaccia.jpg', 1, 1), bumpScale: 3.5, roughness: 0.48, clearcoat: 0.45, clearcoatRoughness: 0.35, sheen: 0.4, sheenColor: new THREE.Color('#fff2b0') })
  const side = new THREE.MeshStandardMaterial({ color: '#d9a245', roughness: 0.8, bumpMap: tex('focaccia.jpg', 2, 0.3), bumpScale: 2 })
  const crumb = new THREE.MeshStandardMaterial({ color: '#f4dc9c', roughness: 0.95, bumpMap: tex('focaccia.jpg', 1.6, 1.6), bumpScale: 9 })
  const slab = (w, h, d, mats) => add(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, 0.12), mats))
  // materials order: +x -x +y -y +z -z
  const big = slab(3.4, 0.55, 2.4, [side, side, top, side, side, side]); big.position.set(-0.5, 0.275, -0.2)
  const cut = slab(1.15, 0.55, 1.15, [crumb, side, top, side, crumb, side]); cut.position.set(1.85, 0.36, 1.15); cut.rotation.set(0, -0.5, 0.16)
  camera.position.set(5.6, 7.9, 9.3); camera.lookAt(0.3, 0.2, 0.1)
}

if (obj === 'books') {
  const pages = new THREE.MeshStandardMaterial({ map: tex('pages.jpg', 1, 1), roughness: 0.9 })
  const book = (w, h, d, color, y, rot, x = 0, z = 0) => {
    const g = new THREE.Group()
    const cover = new THREE.MeshPhysicalMaterial({ color, roughness: 0.55, clearcoat: 0.2 })
    const c1 = new THREE.Mesh(new RoundedBoxGeometry(w, 0.06, d, 2, 0.02), cover); c1.position.y = h / 2 - 0.03
    const c2 = c1.clone(); c2.position.y = -h / 2 + 0.03
    const spine = new THREE.Mesh(new RoundedBoxGeometry(0.08, h, d, 2, 0.03), cover); spine.position.x = -w / 2 + 0.02
    const block = new THREE.Mesh(new THREE.BoxGeometry(w - 0.12, h - 0.1, d - 0.1), pages); block.position.x = 0.02
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.1, h + 0.005, d * 0.22), new THREE.MeshStandardMaterial({ color: '#f2c230', roughness: 0.5 }))
    band.position.set(-w / 2 + 0.01, 0, 0)
    g.add(c1, c2, spine, block)
    if (color !== '#f2c230') g.add(band)
    g.position.set(x, y, z); g.rotation.y = rot
    return add(g)
  }
  book(2.6, 0.5, 1.8, '#163a26', 0.25, 0.08)
  book(2.4, 0.42, 1.65, '#f2c230', 0.71, -0.14, 0.1, 0.05)
  book(2.2, 0.36, 1.55, '#245f3b', 1.1, 0.22, -0.05, 0)
  const leaning = book(2.0, 0.3, 1.45, '#f2c230', 0, 0, 2.2, 0.9)
  leaning.rotation.set(0, -0.9, Math.PI / 2 - 0.25); leaning.position.set(2.15, 0.95, 0.4)
  camera.position.set(7.0, 6.4, 10.8); camera.lookAt(1.0, 0.6, 0.1)
}

THREE.DefaultLoadingManager.onLoad = () => { renderer.render(scene, camera); window.__done = true }
setTimeout(() => { renderer.render(scene, camera); window.__done = true }, 3000)
