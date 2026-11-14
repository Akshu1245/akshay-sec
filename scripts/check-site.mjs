// Offline checks for this dependency-free portfolio. Run: node scripts/check-site.mjs
// Add --external to probe destination URLs. 403/429s are warnings, not proof of broken links.
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const js = readFileSync(resolve(root, 'main.js'), 'utf8');
const bg = readFileSync(resolve(root, 'bg-field.js'), 'utf8');
const css = readFileSync(resolve(root, 'style.css'), 'utf8');
const errors = [];
const warnings = [];
const check = (yes, msg) => { if (!yes) errors.push(msg); };

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
const idSet = new Set(ids);
check(ids.length === idSet.size, 'Duplicate element IDs');
const anchors = [...html.matchAll(/<a\b[^>]*>/gi)].map(m => m[0]);
const attributes = [...html.matchAll(/\b(?:src|href|poster)="([^"]+)"/g)].map(m => m[1]);
const hrefs = [...html.matchAll(/\bhref="([^"]+)"/g)].map(m => m[1]);
const local = new Set();

for (const value of attributes) {
  if (value.startsWith('#')) {
    check(idSet.has(value.slice(1)), 'Missing hash target: ' + value);
  } else if (!/^(?:https?:|mailto:|data:|tel:)/i.test(value)) {
    const path = decodeURIComponent(value.split(/[?#]/)[0]).replace(/^\//, '');
    local.add(path);
    check(!path.includes('..'), 'Local path escapes site root: ' + value);
    check(existsSync(resolve(root, path)), 'Missing local file: ' + value);
  }
}

check(!hrefs.some(u => u === '#' || /^javascript:/i.test(u)), 'Empty or javascript: links');
for (const a of anchors) {
  if (/target="_blank"/.test(a)) {
    check(/rel="[^"]*noopener/.test(a), 'External target missing noopener: ' + a);
  }
  check(/href="[^"]+"/.test(a), 'Anchor missing href: ' + a);
}
for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
  check(/\balt="[^"]*"/.test(m[0]), 'Image missing meaningful alternative text: ' + m[0]);
  check(/\bloading="lazy"/.test(m[0]), 'Below-fold image missing lazy-loading: ' + m[0]);
}
check([...html.matchAll(/class="shot-link"/g)].length === 6, 'Expected six clickable project screenshots');
check(html.includes('docs/auditor-output.png'), 'Cyber-lab screenshot missing');
check(html.includes('pre-incorporation'), 'RaksHex legal status missing');
check(html.includes('no paying customers'), 'RaksHex customer status missing');
check(html.includes('simulated'), 'WhisperCache demo limitation missing');
check(!html.includes('impossible-travel'), 'logwatch feature claim does not match its README');
check(!html.includes('nothing is uploaded'), 'QRShield does support optional remote URL lookups');
check(html.includes('href="mailto:akshaykammar31@gmail.com"'), 'Public mail link missing');
check(html.includes('data-email="akshaykammar31@gmail.com"'), 'Copy email does not match link');
check(html.includes('class="skip-link"'), 'Missing skip-navigation control');
check(html.includes('id="copyStatus"'), 'Missing clipboard live feedback');
check(js.includes("e.key === 'Escape'"), 'Mobile menu should close on Escape');
check(bg.includes('startCanvas'), 'Background should fall back when video playback fails');
check(css.includes(':focus-visible'), 'Missing visible keyboard focus');
check(!/\bTODO\b|\bFIXME\b/.test(html), 'Unresolved public placeholders in the page');

const mainLinks = [...new Set(anchors.flatMap(a => {
  const m = a.match(/href="(https?:[^"]+)"/);
  return m ? [m[1]] : [];
}))];
const count = errors.length;
console.log('Portfolio audit: ' + anchors.length + ' anchors, ' + local.size + ' local assets, ' + idSet.size + ' element IDs.');
if (count) console.error(errors.map(x => 'FAIL ' + x).join('\n'));
else console.log('PASS: local assets, anchors, metadata, claims and accessibility invariants.');

if (process.argv.includes('--external')) {
  for (const url of mainLinks) {
    const label = url.length > 85 ? url.slice(0, 82) + '...' : url;
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: AbortSignal.timeout(12000),
        headers: { 'User-Agent': 'AkshayPortfolioLinkAudit/1.0' }
      });
      if (response.status === 404 || response.status === 410) errors.push('Broken external link (' + response.status + '): ' + url);
      else if (response.status >= 400) warnings.push('Unconfirmed external link (' + response.status + '): ' + label);
      else console.log('OK ' + response.status + ' ' + label);
    } catch (e) {
      warnings.push('Could not verify external link: ' + label + ' (' + e.message + ')');
    }
  }
  warnings.forEach(x => console.warn('WARN ' + x));
  console.log('External probes completed. Warnings require a manual browser check.');
}
if (errors.length) process.exitCode = 1;
