# AKSHAY.SEC — The Security Workbench

The personal cybersecurity portfolio of **K S Akshay**, a final-year BCA student based in Bengaluru.

**Portfolio:** https://akshay-sec.vercel.app  
**Contact:** [akshaykammar31@gmail.com](mailto:akshaykammar31@gmail.com)

A small, original, static website. No frameworks, no analytics and no server side data collection. The site uses HTML, CSS and browser JavaScript, with optional developer-only Playwright tests.

## What is here

| Page | URL | Purpose |
| --- | --- | --- |
| Portfolio | `index.html` | About, Zephyr Technologies internship, RaksHex, project links, four Python CLIs, open-source forks and contact |
| Workbench | `workbench.html` | Four **browser-only educational demos** for URL heuristics, header review, password patterns and SSH auth-log review |
| Case files | `cases/qrshield.html` (plus four others) | Crawlable, no-JavaScript case studies with real screenshots, evidence, implementation and limitations |

**Case slugs:** `qrshield`, `cyberlab`, `whispercache`, `vendorguard`, `rakshex`. These are powered by the audited text and URL references in `project-data.mjs`.

The workbench demos are **not executions of the four linked Python tools** and do not send user input to a scanner or service. They deliberately use fictional examples and simplified scoring, with non-safety-verdict disclaimers. Do not paste real passwords or private incident logs into demonstration websites. Their engines in `engines.mjs` are testable without a browser.

## Source and screenshot provenance

- QRShield: [Akshu1245/Qrtest-](https://github.com/Akshu1245/Qrtest-) · `assets/qrshield-desktop.png` · matching `docs/screenshot-desktop.png` in the project README.
- Akshay Cyber Lab: [Akshu1245/akshay-cyber-lab](https://github.com/Akshu1245/akshay-cyber-lab) · `assets/shot-cyberlab.png`, a locally bundled capture matching the source repository.
- WhisperCache: [Akshu1245/WhisperCache](https://github.com/Akshu1245/WhisperCache) · `assets/shot-whispercache.png` is a **repository overview**, not a deployed-app screenshot.
- VendorGuard AI: [Akshu1245/vendorgaurd](https://github.com/Akshu1245/vendorgaurd) · `assets/shot-vendorguard.png` shows the hackathon executive dashboard.
- RaksHex: [Akshu1245/Rakshex-complete-codebase](https://github.com/Akshu1245/Rakshex-complete-codebase) · `assets/shot-rakshex.png` shows the public project landing page.

**Four original CLI repositories:** [phishcheck](https://github.com/Akshu1245/phishcheck), [headercheck](https://github.com/Akshu1245/headercheck), [passaudit](https://github.com/Akshu1245/passaudit), [logwatch](https://github.com/Akshu1245/logwatch). Each README contains an actual sample-output screenshot.

**Clearly labeled forks:** [gophish](https://github.com/Akshu1245/gophish), [zxcvbn](https://github.com/Akshu1245/zxcvbn), [phishing-detector](https://github.com/Akshu1245/phishing-detector). Upstream authors, licensing and engine provenance remain the responsibility of the corresponding fork repositories. A UI redesign must never be presented as authorship of the upstream engine.

## Claim boundaries

- **QRShield:** local QR decoding and heuristic scoring; an **optional** remote Web Risk URL check exists. It does not guarantee URL or UPI recipient safety.
- **Akshay Cyber Lab:** educational, authorized-use tooling; static patterns and auto-fixes need human review.
- **WhisperCache:** team hackathon prototype with proof-generation components and **simulated blockchain anchoring**. No independent security audit.
- **VendorGuard AI:** team hackathon build, not a DPDP legal certification or guaranteed production service.
- **RaksHex:** founder-led **pre-incorporation private beta**. No paying customers. Production-grade authorization or enforcement claims have not been independently validated.

Avoid changing this language unless new evidence exists.

## Visual direction and credits

Two Pinterest concept references inspired the original **look**, not source code or copied media:

1. [UXMEE-style glowing HUD field](https://pin.it/4MVrrNHI2) — drifting, rising and rotating neon HUD clusters.
2. [CyberSecurity Solution Landing Page](https://pin.it/3iy7frADX) — dark navy/teal glass panels and a friendly robot with a key and padlock.

The robot/padlock artwork is a custom inline SVG; `bg-field.js` is an original canvas animation and `assets/bg-loop.mp4` is an original animated render of the same field. If video cannot play, the canvas field takes over. Reduced-motion users see a still background. The favicon in `assets/mark.svg` is original.

## Run and verify locally

```sh
python3 scripts/devserver.py 4173
# Open http://127.0.0.1:4173 (includes production-style security headers)
```

Vercel runs `node scripts/build-site.mjs`, generates five static case pages, validates internal links and copies only deployable files to `dist/`. No production npm dependencies are required. To run automated quality tests:

```sh
node --check main.js
node --check site-shell.js
node --check bg-field.js
node --check workbench.mjs
node --check case-study.mjs
node scripts/build-site.mjs
node scripts/check-site.mjs
node --test tests/engines.test.mjs

# Optional browser QA, for developers only:
npm install
npx playwright install chromium
npx playwright test
```

The GitHub Actions workflow executes syntax checks, cross-page link/asset checks, engine tests, and Chromium desktop/mobile interaction tests. It uploads desktop/mobile snapshots for visual inspection. An optional `node scripts/check-site.mjs --external` probes public destinations; temporary blocks are warnings, not proof that a link is broken.

No automated test is a substitute for inspecting a live production deployment and the browser appearance on actual devices.

## Maintenance checklist

Keep the case text consistent with the source repository, test changes before merging, do not invent metrics or projects, label team work and forks accurately, verify any newly added live-demo URLs, and keep the public contact email consistent across pages.

## Visual QA and production release (14 November 2026)

The page designs were benchmarked against the information architecture of PortSwigger Web Security Academy, PentesterLab and TryHackMe, and against the evidence/claim transparency patterns used in Tailscale's security pages. These sites are references, **not** visual or source assets. See `docs/visual-benchmark.md`.

The current CSS/JS includes a user-controlled pause for the ambient motion, with the animation still **on by default**. Fonts are consistently loaded on home, case files and the workbench. The mobile hero begins with the name and role instead of burying them under the illustration. The cyber-lab output image is now bundled locally and its SHA matches the source repository.

On Vercel, `vercel.json` supplies relevant security response headers. Deploy `main` with project root `./` and the committed `vercel.json`. It runs the Node static build, serves the isolated `dist/` output and sets CSP/security headers. Do not override the repository build/output settings in the Vercel dashboard. Run the website and browser checks first. Publishing this GitHub code does not automatically update any disconnected Vercel project.

The static release also includes a matching `404.html` for unknown paths and a smaller motion-pause control on phones. The complete build is browser-tested at eight viewport widths, with visual captures in GitHub Actions artifacts.

## Static case pages and security QA (14 November 2026)

`scripts/build-cases.mjs` generates five non-JavaScript case files from `project-data.mjs`. Each gets unique title/description, Open Graph image, canonical URL, original evidence, and clear limitations. The former `case-study.html?project=...` router remains for older links but is marked noindex to avoid duplicate search pages.

`scripts/build-site.mjs` publishes only the website files and screenshots, not tests, hidden files or development scripts. `vercel.json` enforces CSP without `unsafe-inline` or `unsafe-eval`, plus no-sniff, anti-framing, referrer and permissions headers. The preview server `scripts/devserver.py` applies the same headers to browser tests.

CI exercises 320, 360, 390, 768, 1024, 1440 and 1920 CSS-pixel widths on the homepage, workbench and a case page, with screenshots attached to GitHub Actions. Static case pages are tested with JavaScript disabled. Axe accessibility checks target WCAG 2.2 A/AA serious and critical violations. Passing tests is not a measured Lighthouse/Core Web Vitals score or certification.

Keep the live deployment status separate from the repository status. The production Vercel domain must be checked for fresh content and HTTP headers after a real deployment.
