# Neha NK — personal portfolio

A static portfolio built with Vite, React, TypeScript, and Tailwind CSS. Requires Node.js 24 and npm. No backend, accounts, or secret keys are needed.

## Preview locally

```sh
npm ci
npm run dev
```

Open the address printed by Vite in a local development environment. In a cloud environment, use the available browser/port preview tooling. Stop the server with Ctrl+C.

```sh
npm run build
npm run preview
```

These commands check TypeScript, build the site into `dist/`, and serve the production build. There is no automated test suite yet.

## Edit the site

- `src/App.tsx`: all the words and little objects. The content lists sit at the top of the file (`projects`, `smallThings`, `blobs`, `nowNotes`). To show an email, set `CONTACT_EMAIL` near the top; it stays hidden while empty.
- `src/index.css`: the materials (cardboard, tape, wood, clay), colours, type and every animation. Motion is switched off automatically for visitors who ask their device for reduced motion.
- `src/sound.ts`: the soft sounds, made in the browser with the Web Audio API. Sound is off until a visitor turns it on with the toggle in the bottom-left corner.
- `public/404.html`: the "lost & found" page shown for missing links.
- `index.html`: page title, description and fonts.

## Publishing

`.github/workflows/deploy.yml` builds and publishes the site to https://nehhaank.github.io every time `main` changes. Work on a branch and open a pull request; merging the pull request is what publishes it.
