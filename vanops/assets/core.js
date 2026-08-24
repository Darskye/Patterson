/* ============================================================
   VAN OPS — core runtime
   • Cross-monitor cue bus (BroadcastChannel + storage + postMessage)
   • Global director keymap (works on every screen)
   • Deterministic RNG so takes match frame-for-frame
   ============================================================ */
(function (global) {
  'use strict';

  const VAN = {};
  const BUS_NAME = 'vanops';
  const STATE_KEY = 'vanops:state';
  const MSG_KEY = 'vanops:msg';

  /* ---------------- deterministic RNG (mulberry32) ---------------- */
  VAN.rng = function (seed) {
    let a = typeof seed === 'string' ? hashStr(seed) : (seed >>> 0);
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  function hashStr(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  VAN.hashStr = hashStr;

  /* ---------------- small helpers ---------------- */
  const HEX = '0123456789ABCDEF';
  VAN.hex = (n, r) => { let s = ''; const R = r || Math.random; for (let i = 0; i < n; i++) s += HEX[(R() * 16) | 0]; return s; };
  VAN.pad = (v, n, c) => String(v).padStart(n, c || '0');
  VAN.pick = (arr, R) => arr[(((R || Math.random)()) * arr.length) | 0];
  VAN.clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  VAN.lerp = (a, b, t) => a + (b - a) * t;
  VAN.easeInOut = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  VAN.easeOut = t => 1 - Math.pow(1 - t, 3);
  VAN.rand = (a, b, R) => VAN.lerp(a, b, (R || Math.random)());
  VAN.$ = (s, r) => (r || document).querySelector(s);
  VAN.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  VAN.el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

  VAN.clock = function (d) {
    d = d || new Date();
    return VAN.pad(d.getHours(), 2) + ':' + VAN.pad(d.getMinutes(), 2) + ':' + VAN.pad(d.getSeconds(), 2);
  };
  VAN.stamp = function (d) {
    d = d || new Date();
    return d.getFullYear() + '-' + VAN.pad(d.getMonth() + 1, 2) + '-' + VAN.pad(d.getDate(), 2) + ' ' + VAN.clock(d);
  };
  VAN.countdown = function (secs) {
    secs = Math.max(0, secs | 0);
    return VAN.pad((secs / 60) | 0, 2) + ':' + VAN.pad(secs % 60, 2);
  };

  /* ---------------- canvas fitting ---------------- */
  VAN.fit = function (canvas, onResize) {
    const ctx = canvas.getContext('2d');
    function resize() {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(global.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(r.width * dpr));
      const h = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (onResize) onResize(r.width, r.height, ctx);
      }
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return { ctx, resize, get w() { return canvas.getBoundingClientRect().width; }, get h() { return canvas.getBoundingClientRect().height; } };
  };

  /* Single shared rAF loop — cheaper than N loops on a 9-panel wall */
  const tickers = [];
  VAN.loop = function (fn) { tickers.push(fn); return () => { const i = tickers.indexOf(fn); if (i >= 0) tickers.splice(i, 1); }; };
  let last = performance.now();
  (function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    for (let i = 0; i < tickers.length; i++) { try { tickers[i](dt, now / 1000); } catch (e) { /* keep the wall alive */ } }
    requestAnimationFrame(frame);
  })(last);

  /* ---------------- state ---------------- */
  const PHASES = ['RECON', 'BREACH', 'INSIDE', 'VAULT', 'EXFIL'];
  VAN.PHASES = PHASES;

  const defaults = {
    phase: 0,
    alarm: false,
    theme: 'phosphor',
    grain: 'on',
    doors: {},       // doorId -> 'LOCKED' | 'OPEN'
    cams: {},        // camId  -> 'LIVE' | 'LOOP'
    manifest: false  // manifest pulled?
  };
  let state = Object.assign({}, defaults);
  try {
    const saved = JSON.parse(localStorage.getItem(STATE_KEY) || 'null');
    if (saved) state = Object.assign(state, saved);
  } catch (e) { }
  VAN.state = state;

  function persist() { try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (e) { } }

  /* ---------------- event emitter ---------------- */
  const handlers = {};
  VAN.on = function (evt, fn) {
    (handlers[evt] || (handlers[evt] = [])).push(fn);
    return () => { const a = handlers[evt]; const i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); };
  };
  function fire(evt, data) {
    (handlers[evt] || []).forEach(f => { try { f(data); } catch (e) { console.warn(e); } });
    (handlers['*'] || []).forEach(f => { try { f(evt, data); } catch (e) { } });
  }

  /* ---------------- cue bus (3 transports, deduped) ---------------- */
  const seen = new Set();
  let bc = null;
  try { bc = new BroadcastChannel(BUS_NAME); } catch (e) { }
  VAN._children = [];

  function transmit(msg) {
    const raw = JSON.stringify(msg);
    if (bc) { try { bc.postMessage(msg); } catch (e) { } }
    try { localStorage.setItem(MSG_KEY, raw); } catch (e) { }
    // popup / opener chain — the only transport that survives file:// origins
    try { if (global.opener && !global.opener.closed) global.opener.postMessage({ __vanops: msg }, '*'); } catch (e) { }
    VAN._children = VAN._children.filter(w => { try { return w && !w.closed; } catch (e) { return false; } });
    VAN._children.forEach(w => { try { w.postMessage({ __vanops: msg }, '*'); } catch (e) { } });
  }

  function receive(msg) {
    if (!msg || !msg.id || seen.has(msg.id)) return;
    seen.add(msg.id);
    if (seen.size > 500) seen.clear();
    apply(msg.evt, msg.data, false);
    // relay so a hub->child->grandchild chain still works on file://
    transmit(msg);
  }

  if (bc) bc.onmessage = e => receive(e.data);
  global.addEventListener('storage', e => {
    if (e.key !== MSG_KEY || !e.newValue) return;
    try { receive(JSON.parse(e.newValue)); } catch (err) { }
  });
  global.addEventListener('message', e => {
    const d = e.data;
    if (d && d.__vanops) receive(d.__vanops);
  });

  /* Apply a cue locally; broadcast when it originated here */
  function apply(evt, data, originate) {
    switch (evt) {
      case 'phase':
        state.phase = VAN.clamp(data | 0, 0, PHASES.length - 1);
        document.documentElement.dataset.phase = state.phase;
        break;
      case 'alarm':
        state.alarm = !!data;
        document.documentElement.classList.toggle('alarm', state.alarm);
        break;
      case 'theme':
        state.theme = data;
        document.documentElement.dataset.theme = data;
        break;
      case 'grain':
        state.grain = data;
        document.documentElement.dataset.grain = data;
        break;
      case 'door':
        state.doors[data.id] = data.status;
        break;
      case 'cam':
        state.cams[data.id] = data.status;
        break;
      case 'manifest':
        state.manifest = !!data;
        break;
      case 'glitch':
        document.documentElement.classList.add('glitching');
        setTimeout(() => document.documentElement.classList.remove('glitching'), 360);
        break;
      case 'blackout':
        document.documentElement.classList.add('blackout');
        setTimeout(() => document.documentElement.classList.remove('blackout'), (data && data.ms) || 700);
        break;
    }
    persist();
    fire(evt, data);
    if (originate) transmit({ id: VAN.hex(10), evt, data, t: Date.now() });
  }

  /** Fire a cue on THIS screen and every other monitor on the wall. */
  VAN.cue = function (evt, data) { apply(evt, data, true); };
  /** Fire a cue on this screen only. */
  VAN.local = function (evt, data) { apply(evt, data, false); };

  VAN.phaseName = () => PHASES[state.phase];
  VAN.stepPhase = d => VAN.cue('phase', VAN.clamp(state.phase + d, 0, PHASES.length - 1));

  /* Open a screen as a child window and keep it on the bus */
  VAN.openScreen = function (href, name) {
    const w = global.open(href, name || '_blank');
    if (w) {
      VAN._children.push(w);
      // seed the new window with current state once it is listening
      setTimeout(() => {
        ['theme', 'grain', 'phase', 'alarm'].forEach(k =>
          { try { w.postMessage({ __vanops: { id: VAN.hex(10), evt: k, data: state[k], t: Date.now() } }, '*'); } catch (e) { } });
      }, 900);
    }
    return w;
  };

  /* ---------------- global director keymap ---------------- */
  const THEMES = ['phosphor', 'amber', 'ice'];
  const localKeys = {};
  /** Register screen-specific keys: VAN.keys({ '1': fn, 'r': fn }) */
  VAN.keys = function (map) { Object.assign(localKeys, map); };

  const GLOBAL_HELP = [
    ['1 – 5', 'Jump to phase (Recon / Breach / Inside / Vault / Exfil)'],
    ['← / →', 'Step phase back / forward — works with a presenter clicker'],
    ['A', 'ALARM — flips the whole wall red'],
    ['X', 'Glitch burst on every monitor'],
    ['B', 'Blackout flash (power cut)'],
    ['T', 'Cycle theme: phosphor / amber / ice'],
    ['G', 'Toggle CRT scanlines + vignette'],
    ['F', 'Fullscreen this monitor'],
    ['?', 'Show / hide this card'],
    ['Alt + key', 'Same cues while typing in the terminal']
  ];
  VAN.helpExtra = [];

  function isEditable(t) {
    return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
  }

  global.addEventListener('keydown', e => {
    const typing = isEditable(e.target);
    // Bare keys are ignored while typing; Alt+key always works (director override).
    if (typing && !e.altKey) {
      if (e.key === 'Escape') document.documentElement.classList.remove('keymap-open');
      return;
    }
    if (e.ctrlKey || e.metaKey) return;
    const k = e.key;

    if (localKeys[k]) { e.preventDefault(); localKeys[k](e); return; }
    const lower = k.length === 1 ? k.toLowerCase() : k;
    if (localKeys[lower]) { e.preventDefault(); localKeys[lower](e); return; }

    switch (lower) {
      case '1': case '2': case '3': case '4': case '5':
        e.preventDefault(); VAN.cue('phase', parseInt(lower, 10) - 1); break;
      case 'arrowright': case 'pagedown': case ' ':
        e.preventDefault(); VAN.stepPhase(1); break;
      case 'arrowleft': case 'pageup':
        e.preventDefault(); VAN.stepPhase(-1); break;
      case 'a': e.preventDefault(); VAN.cue('alarm', !state.alarm); break;
      case 'x': e.preventDefault(); VAN.cue('glitch', 1); break;
      case 'b': e.preventDefault(); VAN.cue('blackout', { ms: 700 }); break;
      case 't': e.preventDefault(); VAN.cue('theme', THEMES[(THEMES.indexOf(state.theme) + 1) % THEMES.length]); break;
      case 'g': e.preventDefault(); VAN.cue('grain', state.grain === 'on' ? 'off' : 'on'); break;
      case 'f': e.preventDefault();
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
        break;
      case '?': case '/':
        e.preventDefault(); document.documentElement.classList.toggle('keymap-open'); break;
      case 'escape':
        document.documentElement.classList.remove('keymap-open'); break;
    }
  });

  function buildKeymapCard() {
    if (VAN.$('.keymap')) return;
    const wrap = VAN.el('div', 'keymap');
    const card = VAN.el('div', 'keymap-card');
    card.setAttribute('data-augmented-ui', 'tl-clip br-clip tr-clip-x bl-clip-x border');
    const rows = GLOBAL_HELP.concat(VAN.helpExtra)
      .map(([k, d]) => '<div><kbd>' + k + '</kbd><span class="dim">' + d + '</span></div>').join('');
    card.innerHTML =
      '<h3>Director Keymap</h3>' +
      '<p class="sub">Any keyboard on the wall drives every monitor · press ? to dismiss</p>' +
      '<div class="keymap-grid">' + rows + '</div>';
    wrap.appendChild(card);
    wrap.addEventListener('click', () => document.documentElement.classList.remove('keymap-open'));
    document.body.appendChild(wrap);
  }

  /* ---------------- boot sequence ---------------- */
  VAN.boot = function (lines, done) {
    const host = VAN.el('div', 'boot');
    document.body.appendChild(host);
    let i = 0;
    (function next() {
      if (i >= lines.length) {
        setTimeout(() => { host.classList.add('done'); host.remove(); done && done(); }, 260);
        return;
      }
      const l = lines[i++];
      host.textContent += l + '\n';
      host.scrollTop = host.scrollHeight;
      setTimeout(next, 26 + Math.random() * 70);
    })();
  };

  /* ---------------- typewriter ---------------- */
  VAN.type = function (node, text, opts) {
    opts = opts || {};
    const speed = opts.speed || 18, jitter = opts.jitter == null ? 26 : opts.jitter;
    let i = 0;
    return new Promise(res => {
      (function step() {
        if (i >= text.length) { res(node); return; }
        // burst a few chars at a time — reads faster on camera than 1/frame
        const burst = opts.burst || 1;
        node.textContent += text.slice(i, i + burst);
        i += burst;
        setTimeout(step, speed + Math.random() * jitter);
      })();
    });
  };

  /* ---------------- chrome wiring ---------------- */
  /**
   * VAN.init({ name:'SCHEMATIC', code:'S-02' })
   * Applies persisted state, builds the keymap card, starts the clocks,
   * and keeps every [data-van] element live.
   */
  VAN.init = function (opts) {
    opts = opts || {};
    const root = document.documentElement;
    root.dataset.theme = state.theme;
    root.dataset.grain = state.grain;
    root.dataset.phase = state.phase;
    root.classList.toggle('alarm', state.alarm);

    if (!VAN.$('.crt')) document.body.appendChild(VAN.el('div', 'crt'));
    buildKeymapCard();

    // live-updating bound elements
    function refresh() {
      VAN.$$('[data-van]').forEach(n => {
        switch (n.dataset.van) {
          case 'clock': n.textContent = VAN.clock(); break;
          case 'date': n.textContent = VAN.stamp().slice(0, 10); break;
          case 'phase': n.textContent = VAN.phaseName(); break;
          case 'screen': n.textContent = opts.name || ''; break;
          case 'code': n.textContent = opts.code || ''; break;
          case 'uptime': n.textContent = VAN.countdown((Date.now() - t0) / 1000); break;
        }
      });
      VAN.$$('.phasestrip .ph').forEach((n, i) => {
        n.classList.toggle('cur', i === state.phase);
        n.classList.toggle('done', i < state.phase);
      });
    }
    const t0 = Date.now();
    refresh();
    setInterval(refresh, 1000);
    VAN.on('phase', refresh);
    VAN.refreshChrome = refresh;

    // Build the phase strip if the screen asked for one
    VAN.$$('.phasestrip[data-auto]').forEach(strip => {
      strip.innerHTML = PHASES.map(p => '<span class="ph">' + p + '</span>').join('');
      refresh();
    });
    return VAN;
  };

  global.VAN = VAN;
})(window);
