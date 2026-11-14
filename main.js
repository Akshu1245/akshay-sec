// mobile menu
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  links.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));

// copy email
const copyBtn = document.getElementById('copyEmail');
copyBtn.addEventListener('click', async () => {
  const email = copyBtn.dataset.email;
  try {
    await navigator.clipboard.writeText(email);
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = email; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); ta.remove();
  }
  copyBtn.textContent = 'copied';
  setTimeout(() => { copyBtn.textContent = 'copy'; }, 1600);
});

// scrollspy
const spy = [...document.querySelectorAll('.nav-links a')];
const secs = spy.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
addEventListener('scroll', () => {
  const y = scrollY + 140;
  let cur = null;
  for (const s of secs) if (s.offsetTop <= y) cur = s.id;
  spy.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
}, { passive: true });

// ===== motion layer =====
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const prog = document.createElement('div');
  prog.className = 'scroll-progress';
  prog.setAttribute('aria-hidden', 'true');
  document.body.appendChild(prog);

  const addReveal = (sel, step) => {
    document.querySelectorAll(sel).forEach(group => {
      [...group.children].forEach((el, i) => {
        el.classList.add('reveal');
        el.style.setProperty('--rd', Math.min(i * step, 560) + 'ms');
      });
    });
  };
  addReveal('.hero-text', 110);
  addReveal('.stats', 90);
  addReveal('.grid', 80);
  addReveal('.section', 60);
  document.querySelectorAll('.xp, .about, .contact').forEach(el => el.classList.add('reveal'));

  const counted = new WeakSet();
  const countUp = (el) => {
    if (counted.has(el)) return;
    counted.add(el);
    const node = [...el.childNodes].find(n => n.nodeType === 3 && /\d/.test(n.nodeValue));
    if (!node) return;
    const m = node.nodeValue.match(/\d+/);
    const target = +m[0];
    const pre = node.nodeValue.slice(0, m.index);
    const post = node.nodeValue.slice(m.index + m[0].length);
    const t0 = performance.now(), dur = 1200;
    const tick = t => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      node.nodeValue = pre + Math.round(target * eased) + post;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const check = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    prog.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    document.body.classList.toggle('scrolled', h.scrollTop > 24);
    const vh = h.clientHeight;
    const atBottom = h.scrollTop + vh >= h.scrollHeight - 8;
    document.querySelectorAll('.reveal:not(.in)').forEach(el => {
      const r = el.getBoundingClientRect();
      if (atBottom || (r.top < vh * 0.94 && r.bottom > 0)) {
        el.classList.add('in');
        if (el.matches('.stat-num')) countUp(el);
        el.querySelectorAll('.stat-num').forEach(countUp);
      }
    });
  };
  let ticking = false;
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; setTimeout(() => { check(); ticking = false; }, 60); }
  }, { passive: true });
  addEventListener('resize', check, { passive: true });
  check();
  setTimeout(check, 300);
})();

// hero panel: cycling "processing" status line
(() => {
  const el = document.getElementById('procText');
  if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const lines = ['scanning for anomalies', 'verifying signatures', 'checking policy lines', 'tracing request paths', 'watching the perimeter'];
  let i = 0;
  setInterval(() => { i = (i + 1) % lines.length; el.textContent = lines[i]; }, 2600);
})();
