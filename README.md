# Neha NK — personal site

A static personal website built with Vite, React and TypeScript. Requires Node.js 24 and npm.

## Preview locally

```sh
npm ci
npm run dev
```

`npm run build` checks TypeScript and builds the site into `dist/`. `npm run preview` serves that build.

## Where things live

- `src/App.tsx` — all the words: projects, smaller problems, how I work, Ultimate, making, contact.
- `src/index.css` — colours, type, layout and motion. Colour tokens are at the top.
- `src/Mocks.tsx` — the simplified mock screens on each project. Swap these for real screenshots when they're ready.
- `src/DiscScene.tsx` — the real-time 3D disc in the hero (three.js). Click it, or press 8, to throw it.
- `src/GrassShader.tsx` — the shader that moves the grass behind the Ultimate section.
- `src/FieldMap.tsx` — the to-scale Ultimate field diagram.
- `src/assets/` — generated images. Nothing here is a photo or from an AI image model.

## Regenerating the images

```sh
python3 scripts/make-textures.py          # grass, wood, focaccia and page textures (numpy + Pillow)
python3 -m http.server 8123 &             # serve the repo for the renderer
node scripts/render-objects.cjs           # renders the cot, focaccia and books with three.js (needs Playwright)
```

## Publishing

`.github/workflows/deploy.yml` builds and publishes to https://nehhaank.github.io every time `main` changes. Merging a pull request into `main` publishes it.
