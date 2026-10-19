# EnergiX: Reaction Run

An interactive 3D chemistry game for exploring energy changes in reactions. Players collect energy, break and form bonds, compare activation pathways, and learn how respiration stores and releases energy across four playable chambers.

## Run locally

```bash
npm ci
npm run dev
```

Open the local URL printed by Next.js. Use **WASD** or the **arrow keys** to move, **Space** to jump, and **E** or **Shift** to interact. Touchscreen controls are included.

## Deployment

The project is configured to export a static site for GitHub Pages. The workflow deploys builds from `main`; in repository **Settings → Pages**, select **GitHub Actions** as the build and deployment source. The Pages URL is expected to be `https://hadiafatima-13.github.io/EnergiX-Reaction-Run/` after a successful deployment.

The game uses WebGL through Three.js and requires a compatible browser with graphics acceleration enabled.
