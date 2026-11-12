# Release Blocker

Mihael Kegl's CV as a small 3D game. Eight bugs are loose on a desk; each one you catch files a ticket that reveals a part of the CV. Catch all eight to ship release v8.4.

Built with Vite, React and Three.js. No image, model or audio files: the desk, the bugs and the sounds are all generated in code.

## Run it

```bash
npm install
npm run share    # builds, then serves the production build on http://localhost:4173
```

`npm run dev` starts the hot-reloading dev server on port 5173 instead.

## Share it from VS Code

1. Run `npm run share`.
2. Open the **Ports** panel (View → Ports) and choose **Forward a Port**, then enter `4173`.
3. Right-click the forwarded port → **Port Visibility → Public**, and copy the forwarded address.

Share port 4173 (the built site), not the dev server.

## Deploy

Every push to `main` builds the site and publishes it to GitHub Pages (`.github/workflows/deploy.yml`).

## The bugs

| Bug | How it behaves | Reveals |
| --- | --- | --- |
| Typo | Slow and in plain sight | Profile |
| Flaky Test | Flickers; only catchable while lit | QA Engineer, 2018 – 2021 |
| Regression | Comes back once after you catch it | Senior QA Engineer, 2021 – 2026 |
| Race Condition | Two racers; catching one catches both | QA Team Lead and QA Squad |
| Edge Case | Walks the outer sides of the desk, so you may need to rotate | Skills |
| Memory Leak | Grows over time and leaves a trail | Education and languages |
| Low Contrast | Camouflaged until you switch on the contrast check | Speaking and writing |
| Heisenbug | Appears last, runs from the cursor, caught on the third try | Contact |

The game is keyboard playable: Tab to a ticket chip and press Enter to swat that bug. It respects `prefers-reduced-motion`, and the CV is always one click away for anyone who would rather not play.

## Updating the CV

All CV content lives in `src/data/cv.js`. The tickets, the CV page (`/#cv`) and the PDF read from it. Ticket copy and bug definitions are in `src/data/bugs.js`.

After changing the CV, regenerate the PDF while `npm run share` is running:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer \
  --virtual-time-budget=8000 --print-to-pdf=public/Mihael_Kegl_CV.pdf "http://localhost:4173/#cv"
npm run build
```

## Tests

```bash
npm test
```

A Playwright suite plays the game end to end in your installed Chrome: a full hunt with real mouse clicks that checks each bug's mechanic, a keyboard-only run, and the CV page and PDF.

## Layout

- `src/game/` – Three.js scene: `Game.js` (loop, camera, input), `desk.js` (props), `bugModel.js` (procedural bugs), `critters.js` (one behaviour per bug), `sound.js`
- `src/ui/` – React overlay: intro, HUD, ticket dialog, finale, CV page
- `src/data/` – CV content and bug definitions
- `tests/` – Playwright suite
