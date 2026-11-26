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
- `src/WorkArt.tsx` — the schematic illustrations on each project card (sketches, not product screenshots).
- `src/Disc.tsx` — the throwable disc in the hero (click it, or press 8).
- `src/FlightNav.tsx` — the dotted flight path on the right edge that tracks scroll on wide screens.
- `src/FieldMap.tsx` — the Ultimate field diagram.

## Publishing

`.github/workflows/deploy.yml` builds and publishes to https://nehhaank.github.io every time `main` changes. Merging a pull request into `main` publishes it.
