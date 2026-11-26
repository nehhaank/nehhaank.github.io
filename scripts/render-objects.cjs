// Renders the "Things I make" images with three.js in headless Chromium.
// Run from the repo root: python3 -m http.server 8123 & node scripts/render-objects.cjs
const { chromium } = require('playwright')
;(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
  const objs = ['cot', 'focaccia', 'books']
  for (const o of process.argv[2] ? process.argv.slice(2) : objs) {
    const p = await b.newPage({ viewport: { width: 900, height: 900 } })
    p.on('console', (m) => m.type() === 'error' && console.log(o, m.text()))
    await p.goto(`http://localhost:8123/scripts/render/index.html?obj=${o}`)
    await p.waitForFunction(() => window.__done === true, null, { timeout: 60000 })
    await p.waitForTimeout(300)
    await p.locator('canvas').screenshot({ path: `src/assets/render-${o}.jpg`, type: "jpeg", quality: 84 })
    console.log('rendered', o)
  }
  await b.close()
})()
