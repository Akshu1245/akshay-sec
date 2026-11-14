# Visual benchmark and release audit — 14 November 2026

## Scope

This is a **representative design/interaction benchmark**, not a claim to have inspected literally every cybersecurity website or to have copied any website at the pixel level. The existing AKSHAY.SEC homepage, case files and workbench were compared against selected current cybersecurity product and education pages. External screenshots are references only.

| Reference | Observed strength | AKSHAY.SEC decision | What not to borrow |
| --- | --- | --- | --- |
| [Wiz](https://www.wiz.io/) | High-clarity opening statement and prominent call to action | Keep founder name/role above mobile fold; emphasize **Case files** and **Try workbench** | Enterprise customer logos or unsupported social proof |
| [PortSwigger Academy](https://portswigger.net/web-security) | Lab-first navigation, clear learning pathways and examples | Present tools as four selectable, explanatory browser demonstrations | Real vulnerability lab claims or copy/lesson text |
| [PentesterLab](https://pentesterlab.com/exercises) | Structured security task lists with technical context | Case study steps, limitations, code and screenshots together | Third-party lab content or certificates |
| [TryHackMe](https://tryhackme.com/) | Hands-on-first learning experience | Fictional examples and immediate, functional result feedback | Claim that exercises run live external targets |
| [Tailscale Security](https://tailscale.com/security) | Evidence, security policies, audit context and detailed disclosures | Explain project limitations and source provenance | Security certifications or guarantees |
| [Cloudflare](https://www.cloudflare.com/) | Layered information hierarchy, concise section introductions | Wider, more readable section hierarchy and restrained action labels | Vendor product language or artwork |

## Current code issues identified

1. **Page typography mismatch:** homepage loaded Space Grotesk, Inter and JetBrains Mono; workbench and case study did not. Fixed: shared font requests.
2. **Mobile-first identity:** old `.hero-art {order:-1}` put mascot above the candidate name below 900px. Fixed: name and immediate portfolio CTAs come first.
3. **Navbar at intermediate widths:** six links and a CTA became crowded between 900–1100px. Fixed: transition to keyboard-operable menu at 1100px.
4. **Screenshot dependency:** the cyber-lab image was fetched from another GitHub repo at runtime. Fixed: bundled locally, byte-for-byte with the original repository image (git blob SHA `399928db9decb530a16d45fa179ab6b1f1172cc3`).
5. **Continuous animation choice:** video/canvas movement is on by default, but a visitor can pause it. Reduced-motion preferences already show a static field. Added accessible opt-in pause/resume without removing the original animation.
6. **Release metadata:** home had social metadata but the other pages did not. Fixed: metadata, robots.txt and sitemap.
7. **Security delivery:** the static deployment lacked an explicit Vercel response-header policy. Added CSP, no-sniff, clickjacking and permissions controls.
8. **Visual regressions:** layout tests now cover 320, 375, 390, 768, 1024, 1280 and 1440 CSS-pixel widths; identity order, navigation and detail pages are checked.

## Visual rules retained

- Original animated neon HUD, original robot illustration, restrained dark navy/teal and a small warm-gold accent.
- Actual project screenshots, not generated replacement artwork.
- No fake certifications, traffic counters, customer logos, scanners, threat intel or production guarantees.
- No extra framework or networked backend.
- Clear, verified project-source links and explicit upstream fork credit.
- No animation below visitors' `prefers-reduced-motion` preference.

## Release checklist

- [ ] The latest PR GitHub Actions browser and unit-test jobs pass.
- [ ] Inspect visual artifacts for homepage, case study and workbench at both desktop and mobile widths.
- [ ] Check all images loaded from the local `assets` folder.
- [ ] Confirm the Vercel project is connected to `Akshu1245/akshay-sec` on `main`.
- [ ] Verify `vercel.json` security headers in a **real** deployed response.
- [ ] Verify the production `/workbench.html` and `/case-study.html?project=qrshield` URLs are not 404.
- [ ] Confirm browser output and live CTA links on a physical phone.
- [ ] Do not claim completion of production deployment before these checks pass.

## Metrics to watch

The Web Vitals field thresholds are LCP <= 2.5s, INP <= 200ms and CLS <= 0.1 at the 75th percentile (real users). CI screenshots or simulated laboratory timing alone do not demonstrate those field metrics. See [web.dev Web Vitals](https://web.dev/articles/vitals) and [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/).
