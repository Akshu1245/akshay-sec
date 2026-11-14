# K S Akshay - cybersecurity portfolio (final design)

Single static page: `index.html` + `style.css` + `main.js` + the background layer.

## Design references (no assets copied)
- Background: original HUD-field animation matching a UXMEE "AI Website Design"
  concept pin (https://pin.it/4MVrrNHI2) - black, neon-green glowing HUD patches,
  depth of field, rise/rotate/pulse. Two original implementations live here:
  `bg-field.js` (real-time canvas, used as fallback) and `assets/bg-loop.mp4`
  (an original render of the same field at 1080p, used as the primary background
  video with a poster fallback). Neither contains any frames from the pin.
- Foreground language: robot + gold key + padlock hero, glass cards, navy/teal
  palette, in the spirit of Sheikh Shovon's "CyberSecurity Solution Landing Page"
  (https://pin.it/3iy7frADX). The robot/key/padlock illustration is original
  inline SVG drawn for this page; no artwork was taken from the pin.

## Notes
- prefers-reduced-motion: background video is hidden (poster/static), robot and
  scroll animations are disabled, all content stays visible.
- Honest content only: real projects, real numbers, forks labeled as forks.
- All project images in `assets/` are real captures: QRShield live app, rakshex.in,
  the GitHub repos, and the forked gophish dashboard. The cyber-lab card shows a transcribed terminal excerpt alongside the real screenshot from `akshay-cyber-lab/docs/auditor-output.png`.
- VendorGuard: the demo deployment from the hackathon is currently offline, so the
  card links the source only - no dead demo link on the page.

## Live

https://akshay-sec.vercel.app

![portfolio hero](docs/preview.png)

## Run locally

Static site, no build step:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Quality and accessibility

- Muted, looping HUD video is the preferred background. If the MP4 cannot play or autoplay fails, `bg-field.js` runs an original animated canvas instead; visitors requesting reduced motion get a still field.
- Project screenshots open at full resolution and the main project repositories include their own README screenshots. The cyber-lab image is loaded from its source repository, not recreated.
- The optional Google Web Risk lookup in QRShield can transmit a URL to a server-side endpoint. QR decoding and heuristic checks are client-side. It is not accurate to say *nothing* is ever sent off-device.
- RaksHex is a pre-incorporation private-beta project with no paying customers. WhisperCache is a hackathon prototype with simulated blockchain anchoring, not a production privacy guarantee.
- The original robot SVG, HUD field and favicon belong to this portfolio, and the two inspiration pins are credited above.

## Audit

No framework, dependency installation or build step is required.

```sh
node --check main.js
node --check bg-field.js
node scripts/check-site.mjs
node scripts/check-site.mjs --external
```

The static audit checks local links, images, metadata, internal anchors, email consistency and key content caveats. The external probe flags 404/410 links; temporary 403/429 responses and network restrictions are warnings that need browser inspection. A GitHub Actions workflow repeats the syntax and static checks for pull requests. This does **not** claim that production websites are currently online or that every browser interaction has been manually tested.
