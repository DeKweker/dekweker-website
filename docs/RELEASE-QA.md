# Release QA

`npm run verify` is the release gate. The Vercel `build` script runs the same QA, typecheck, lint and tests before `next build`, so a production deployment cannot silently skip those checks.

The repository-level QA rejects generated folders, local environment files, dormant service references, missing or unreferenced production assets, debug markers, localhost references, oversized files and regressions in booking navigation, motion lifecycle, reduced motion, safe-area support and image-crop safeguards.

## Responsive review matrix

The layout is designed around behavior classes rather than named phone brands. Review covers narrow phones (280–360 px), standard phones (375–430 px), large/foldable phone widths (480–600 px), tablets (768–1024 px), small laptops (1280–1440 px including low-height 768/800 px), desktop (1600–1920 px), ultrawide/high-DPI desktop and browser zoom/reflow conditions.

Notches and standalone/mobile browser chrome are handled with safe-area insets and an `svh`/`vh` viewport fallback. Documentary portrait photography in the wide Live/Media lead panels uses `object-fit: contain` so faces or bodies are not arbitrarily cut to fill a landscape slot. Booking imagery has an explicit focal point chosen to keep the face inside very wide crops.

## Before a production push

From a clean checkout with Node 22 and registry access:

```bash
npm install
npm run verify
```

Commit the generated `package-lock.json` together with any dependency change. Never use `npm audit fix --force` as a release shortcut; review dependency advisories and upgrades deliberately.
