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
- `src/Mocks.tsx` — the simplified mock screens on each project, and the artboard that adds design notes to the first one. Swap these for real screenshots when they're ready.
- `src/Plates.tsx` — the line drawings in "Made by hand" (cot, focaccia, books), drawn in SVG.
- `src/DiscScene.tsx` — the real-time 3D disc in the hero (three.js). Click it, or press 8, to throw it.
- `src/GrassShader.tsx` — the shader that draws the mown turf behind the Ultimate section.
- `src/FieldMap.tsx` — the to-scale Ultimate field diagram.

Everything visual is drawn in code: there are no image files.

## Publishing

`.github/workflows/deploy.yml` builds and publishes to https://nehhaank.github.io every time `main` changes. Merging a pull request into `main` publishes it.
