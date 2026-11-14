/* bg-field.js - ambient HUD-cluster background layer that visibly "processes":
   glowing clusters rise upward, slowly rotate around their anchors and pulse.
   Original code written for this portfolio. The visual idea (drifting neon HUD
   clusters at the edges of a black hero) references a UXMEE concept pin on
   Pinterest; no assets, text or layout were taken from it.
   Lightweight canvas 2D: no libs, capped DPR, pauses when hidden,
   static single frame under prefers-reduced-motion.
   ?bgstep=1 exposes window.__bgStep(t) for deterministic frame capture. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stepMode = /[?&]bgstep=1/.test(location.search);
  const hasVideoBg = !!document.querySelector('.bg-video');
  const canvas = document.createElement('canvas');
  canvas.className = 'bg-field';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const rand = (a, b) => a + Math.random() * (b - a);
  let W = 0, H = 0, clusters = [];

  function edgeAnchor() {
    const side = Math.floor(rand(0, 4)), m = 0.24;
    if (side === 0) return [rand(-40, W * m), rand(0, H)];
    if (side === 1) return [rand(W * (1 - m), W + 40), rand(0, H)];
    if (side === 2) return [rand(0, W), rand(-30, H * m)];
    return [rand(0, W), rand(H * (1 - m), H + 30)];
  }

  function makeCluster() {
    const [x, y] = edgeAnchor();
    const roll = Math.random();
    const layer = roll < 0.45 ? 0 : (roll < 0.75 ? 1 : 2); // 0 far, 1 mid, 2 near
    const spread = rand(46, 130) * [0.8, 1, 1.25][layer];
    const count = Math.floor(rand(6, 12));
    const members = [];
    for (let i = 0; i < count; i++) {
      const kinds = ['rect', 'plus', 'dot', 'trace', 'tick', 'bracket'];
      const m = {
        t: kinds[Math.floor(rand(0, kinds.length))],
        dx: rand(-spread, spread),
        dy: rand(-spread * 0.7, spread * 0.7),
        s: rand(2, layer === 2 ? 10 : 6),
        ph: rand(0, Math.PI * 2),
        sp: rand(0.5, 1.6),
        base: rand(0.4, 0.95),
        blink: Math.random() < 0.25,
        pts: null
      };
      if (m.t === 'trace') {
        const pts = [[0, 0]];
        let px = 0, py = 0;
        const segs = Math.floor(rand(2, 4));
        for (let sN = 0; sN < segs; sN++) {
          if (Math.random() < 0.5) px += rand(-18, 18); else py += rand(-18, 18);
          pts.push([px, py]);
        }
        m.pts = pts;
      }
      members.push(m);
    }
    if (layer > 0) {
      const nodes = Math.floor(rand(2, 4));
      const macros = ['ring', 'hex', 'box', 'reticle'];
      for (let q = 0; q < nodes; q++) {
        members.push({
          t: macros[Math.floor(rand(0, macros.length))],
          dx: rand(-spread, spread), dy: rand(-spread * 0.7, spread * 0.7),
          s: rand(16, layer === 2 ? 42 : 30), ph: rand(0, Math.PI * 2), sp: rand(0.3, 0.9),
          base: rand(0.45, 0.85), blink: false, pts: null
        });
      }
    }
    return {
      x, y, layer, members,
      vx: rand(-3, 3),
      vy: -(5 + rand(0, 11)) * [0.55, 1, 1.5][layer],   // always rising
      rot: rand(-0.16, 0.16) || 0.12,                    // slow orbit, rad/s
      psp: rand(0.5, 1.1),                               // cluster pulse speed
      pph: rand(0, Math.PI * 2),
      par: [0.03, 0.06, 0.11][layer],
      dim: [0.5, 0.78, 1][layer]
    };
  }

  function build() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    W = innerWidth; H = innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = W < 640 ? 9 : 16;
    clusters = [];
    for (let i = 0; i < n; i++) clusters.push(makeCluster());
  }

  function glyph(m, t, x, y, lw, mul) {
    const a = (m.blink
      ? (Math.sin(t * m.sp * 2.2 + m.ph) > 0.15 ? m.base : m.base * 0.12)
      : m.base * (0.55 + 0.45 * Math.sin(t * m.sp + m.ph))) * mul;
    ctx.globalAlpha = a;
    ctx.lineWidth = lw;
    const s = m.s;
    switch (m.t) {
      case 'rect':
        if (m.blink) { ctx.fillRect(x - s / 2, y - s / 2, s, s); }
        else { ctx.strokeRect(x - s / 2, y - s / 2, s, s); ctx.fillRect(x - 0.75, y - 0.75, 1.5, 1.5); }
        break;
      case 'plus':
        ctx.beginPath();
        ctx.moveTo(x - s, y); ctx.lineTo(x + s, y);
        ctx.moveTo(x, y - s); ctx.lineTo(x, y + s);
        ctx.stroke();
        break;
      case 'dot':
        ctx.beginPath(); ctx.arc(x, y, Math.max(0.8, s / 3), 0, 6.2832); ctx.fill();
        break;
      case 'trace':
        ctx.beginPath();
        ctx.moveTo(x + m.pts[0][0], y + m.pts[0][1]);
        for (let i = 1; i < m.pts.length; i++) ctx.lineTo(x + m.pts[i][0], y + m.pts[i][1]);
        ctx.stroke();
        const e = m.pts[m.pts.length - 1];
        ctx.fillRect(x + e[0] - 1.5, y + e[1] - 1.5, 3, 3);
        break;
      case 'tick':
        ctx.beginPath();
        ctx.moveTo(x - s * 1.6, y); ctx.lineTo(x + s * 1.6, y);
        ctx.moveTo(x + s * 1.6, y - 2.5); ctx.lineTo(x + s * 1.6, y + 2.5);
        ctx.stroke();
        break;
      case 'bracket':
        ctx.beginPath();
        ctx.moveTo(x + s, y - s * 0.4); ctx.lineTo(x + s, y - s);
        ctx.lineTo(x + s * 0.4, y - s);
        ctx.stroke();
        break;
      case 'ring':
        ctx.beginPath(); ctx.arc(x, y, s * 0.5, 0, 6.2832); ctx.stroke();
        for (let k = 0; k < 4; k++) {
          const an = k * 1.5708 + t * 0.35;
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(an) * s * 0.5, y + Math.sin(an) * s * 0.5);
          ctx.lineTo(x + Math.cos(an) * s * 0.78, y + Math.sin(an) * s * 0.78);
          ctx.stroke();
        }
        break;
      case 'hex':
        ctx.beginPath();
        for (let k = 0; k <= 6; k++) {
          const an = k * 1.0472 + t * 0.22;
          const px = x + Math.cos(an) * s * 0.55, py = y + Math.sin(an) * s * 0.55;
          k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
        break;
      case 'box':
        ctx.strokeRect(x - s / 2, y - s / 2, s, s);
        ctx.fillRect(x - s / 2 - 1.5, y - s / 2 - 1.5, 3, 3);
        ctx.fillRect(x + s / 2 - 1.5, y + s / 2 - 1.5, 3, 3);
        break;
      case 'reticle':
        ctx.beginPath(); ctx.arc(x, y, s * 0.4, 0, 6.2832); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - s * 0.7, y); ctx.lineTo(x - s * 0.35, y);
        ctx.moveTo(x + s * 0.35, y); ctx.lineTo(x + s * 0.7, y);
        ctx.moveTo(x, y - s * 0.7); ctx.lineTo(x, y - s * 0.35);
        ctx.moveTo(x, y + s * 0.35); ctx.lineTo(x, y + s * 0.7);
        ctx.stroke();
        ctx.fillRect(x - 1, y - 1, 2, 2);
        break;
    }
  }

  const LAYER_STYLE = [
    { blur: 0,  lw: 1,   scale: 0.8 },
    { blur: 9,  lw: 1,   scale: 1 },
    { blur: 20, lw: 1.2, scale: 1.25 }
  ];

  function frame(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = accent;
    ctx.fillStyle = accent;
    ctx.shadowColor = accent;
    const sy = scrollY;
    for (const c of clusters) {
      const st = LAYER_STYLE[c.layer];
      ctx.shadowBlur = st.blur;
      let cx = c.x + c.vx * t;
      let cy = c.y + c.vy * t - sy * c.par;
      cx = ((cx % (W + 320)) + (W + 320)) % (W + 320) - 160;
      cy = ((cy % (H + 320)) + (H + 320)) % (H + 320) - 160;
      const pulse = 0.72 + 0.28 * Math.sin(t * c.psp + c.pph);
      const rot = c.rot * t;
      const cr = Math.cos(rot), sr = Math.sin(rot);
      for (const m of c.members) {
        const rx = m.dx * cr - m.dy * sr;
        const ry = m.dx * sr + m.dy * cr;
        glyph(m, t, cx + rx * st.scale, cy + ry * st.scale, st.lw, c.dim * pulse);
      }
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  const accent = (document.currentScript && document.currentScript.dataset.accent) || '#41d9ff';
  build();
  if (stepMode) {
    window.__bgStep = (t) => frame(t);
    window.__bgStep(1.2);
  } else if (reduce) {
    frame(0.7); // static field (video hidden under reduced motion)
  } else if (hasVideoBg) {
    // video background is primary; canvas stays off
    canvas.remove();
  } else {
    let raf = null;
    const t0 = performance.now();
    const loop = (now) => {
      frame((now - t0) / 1000);
      raf = requestAnimationFrame(loop);
    };
    const start = () => { if (raf === null) raf = requestAnimationFrame(loop); };
    const stop = () => { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } };
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    start();
  }
  let rto = null;
  addEventListener('resize', () => {
    clearTimeout(rto);
    rto = setTimeout(() => { build(); if (reduce && !stepMode) frame(0.7); }, 180);
  }, { passive: true });
})();
