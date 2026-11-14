/* Ambient motion is enabled by default. Visitors can opt out without disabling content. */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || /[?&]bgstep=1/.test(location.search)) return;

  let paused = false;
  try { paused = sessionStorage.getItem('akshay-sec-motion') === 'paused'; } catch {}

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'motion-toggle';
  toggle.id = 'motionToggle';
  const mobile = window.matchMedia('(max-width: 600px)');
  const nav = document.querySelector('.nav');
  const menuButton = document.getElementById('navToggle');
  function positionToggle() {
    if (mobile.matches && nav && menuButton) {
      nav.insertBefore(toggle, menuButton);
    } else {
      document.body.append(toggle);
    }
  }
  positionToggle();
  mobile.addEventListener('change', positionToggle);

  function render() {
    document.documentElement.classList.toggle('motion-paused', paused);
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Resume motion' : 'Pause motion');
    toggle.replaceChildren();

    const symbol = document.createElement('span');
    symbol.className = 'motion-symbol';
    symbol.setAttribute('aria-hidden', 'true');
    symbol.textContent = paused ? '▶' : 'Ⅱ';
    const text = document.createElement('span');
    text.textContent = paused ? 'Resume motion' : 'Pause motion';
    toggle.append(symbol, text);

    document.dispatchEvent(new CustomEvent('portfolio:motionchange', { detail: { paused } }));
    try { sessionStorage.setItem('akshay-sec-motion', paused ? 'paused' : 'playing'); } catch {}
  }

  toggle.addEventListener('click', () => {
    paused = !paused;
    render();
  });
  render();
})();
