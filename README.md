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

- `src/App.tsx`: name, introduction, project placeholders, and footer. Replace the clearly marked `hello@example.com` contact placeholder with your own email.
- `src/index.css`: colors, typography, layout details, and abstract project illustrations.
- `src/main.tsx`: React entry point.
- `index.html`: page title and description.
- `vite.config.ts`: Vite, React, and Tailwind setup. The root base path matches `nehhaank.github.io`.

The project cards are placeholders, with decorative artwork and no invented case studies or results. Replace the `projects` array and card contents when real work is ready.

## Deploy later — optional

Nothing has been published by setup. `.github/workflows/deploy.yml` runs **only when manually requested**; pushes do not trigger deployment.

When ready, commit and push your reviewed changes, select **GitHub Actions** under the repository's **Settings → Pages → Build and deployment**, and manually run **Deploy portfolio to GitHub Pages** from the Actions tab. This will publish the site. Do not run it until you want to publish.
