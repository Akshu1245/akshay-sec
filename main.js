// mobile menu
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
const closeMenu = () => {
  links.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open menu');
};
links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && links.classList.contains('open')) {
    closeMenu();
    toggle.focus();
  }
});
document.addEventListener('click', e => {
  if (!links.contains(e.target) && !toggle.contains(e.target)) closeMenu();
});

// Copy feedback reports failure rather than claiming success.
const copyBtn = document.getElementById('copyEmail');
const copyStatus = document.getElementById('copyStatus');
copyBtn.addEventListener('click', async () => {
  const email = copyBtn.dataset.email;
  let copied = false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(email);
      copied = true;
    } else {
      const ta = document.createElement('textarea');
      ta.value = email;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      copied = document.execCommand('copy');
      ta.remove();
    }
  } catch {
    copied = false;
  }
  copyBtn.textContent = copied ? 'copied' : 'copy unavailable';
  copyStatus.textContent = copied ? 'Email address copied to clipboard.' : 'Copy unavailable. Use the email link instead.';
  setTimeout(() => { copyBtn.textContent = 'copy'; }, 2200);
});

// scrollspy
const spy = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const secs = spy.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
addEventListener('scroll', () => {
  const y = scrollY + 140;
  let cur = null;
  for (const s of secs) if (s.offsetTop <= y) cur = s.id;
  spy.forEach(a => {
    const active = a.getAttribute('href') === '#' + cur;
    a.classList.toggle('active', active);
    if (active) a.setAttribute('aria-current', 'location');
    else a.removeAttribute('aria-current');
  });
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
  const lines = ['QR scanning · local-first', 'Python tools · public source', 'WhisperCache · hackathon prototype', 'RaksHex · private beta', 'Open to security internships'];
  let i = 0;
  setInterval(() => {
    if (document.documentElement.classList.contains('motion-paused') || document.hidden) return;
    i = (i + 1) % lines.length;
    el.textContent = lines[i];
  }, 2600);
})();
