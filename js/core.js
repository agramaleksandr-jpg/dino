'use strict';
/* ==================================================================== core: layout, loop, scenes, helpers */
const G = window.G = {
  W: 1280, H: 720, k: 1, rot: false, sbg: 1, bgx: 0, bgy: 0, vw: 0, vh: 0,
  img: {}, state: null, token: 0, time: 0, paused: false,
  tickers: new Set(), sceneTickers: new Set(), cleanups: [],
};
const Scenes = window.Scenes = {};

/* ---------------- math */
G.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
G.lerp = (a, b, t) => a + (b - a) * t;
G.smooth = (a, b, x) => { const t = G.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
G.rand = (a, b) => a + Math.random() * (b - a);
G.pick = (a) => a[Math.floor(Math.random() * a.length)];
G.shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
G.bump = (s) => { s = G.clamp(s, 0, 1); const v = Math.sin(Math.PI * s); return v * v; };
G.ease = {
  lin: (t) => t,
  out: (t) => 1 - Math.pow(1 - t, 3),
  in: (t) => t * t * t,
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  back: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  sine: (t) => 0.5 - 0.5 * Math.cos(Math.PI * t),
};

/* ---------------- DOM */
G.h = (tag, cls, parent, style, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (style) for (const k in style) e.style[k] = typeof style[k] === 'number' && !/^(opacity|zIndex|flex|fontWeight)$/.test(k) ? style[k] + 'px' : style[k];
  if (html !== undefined) e.innerHTML = html;
  if (parent) parent.appendChild(e);
  return e;
};
G.on = (el, type, fn, opts) => { el.addEventListener(type, fn, opts); G.cleanups.push(() => el.removeEventListener(type, fn, opts)); };
G.onExit = (fn) => G.cleanups.push(fn);
G.place = (e, x, y, w, h) => { e.style.left = x + 'px'; e.style.top = y + 'px'; if (w !== undefined) e.style.width = w + 'px'; if (h !== undefined) e.style.height = h + 'px'; return e; };
/** image URL: the loaded copy if any, otherwise straight from the folder (species art loads lazily) */
G.src = (key) => (G.img[key] ? G.img[key].src : 'img/' + key + '.webp');
/** regional backgrounds: the same kind of place painted for the part of Pangaea where the current animal lived */
G.RBG = {
  nam: { bg_run: 'bg_nam_run', bg_forest: 'bg_nam_forest', bg_valley: 'bg_nam_valley', bg_mud: 'bg_nam_mud', bg_hide: 'bg_nam_forest' },
  eur: { bg_run: 'bg_eur_run', bg_forest: 'bg_eur_forest', bg_valley: 'bg_eur_valley', bg_mud: 'bg_eur_mud', bg_hide: 'bg_eur_forest', bg_sea: 'bg_tethys' },
  afr: { bg_run: 'bg_afr_run', bg_forest: 'bg_afr_forest', bg_valley: 'bg_afr_valley', bg_mud: 'bg_afr_mud', bg_hide: 'bg_afr_forest' },
  asia: { bg_run: 'bg_asia_run', bg_forest: 'bg_asia_forest', bg_valley: 'bg_asia_valley', bg_mud: 'bg_asia_mud', bg_hide: 'bg_asia_forest', bg_sea: 'bg_tethys' },
};
G.regionOf = (sp) => { const q = sp || (G.state && G.SP()); const s = q && DATA.sites[q.site]; return s ? s.region : null; };
G.rbg = (key, sp) => { const m = G.RBG[G.regionOf(sp)]; return (m && m[key]) || key; };
G.bgImg = (key, parent, style) => { const im = G.h('img', 'bgimg', parent || G.scene$, style); im.src = G.src(G.rbg(key)); im.draggable = false; return im; };
/** skeleton pieces sit in one picture per animal (js/atlas.js: key -> [atlas, x, y, w, h, W, H]) */
G.ATLAS = window.ATLAS || {};
G.imgKey = (key) => (G.ATLAS[key] ? G.ATLAS[key][0] : key);
/** the kind of ground at a dig site (js/digs.js): the picture of the ground and its rocks */
/** a ground line that stays on screen: wide phones show the picture only down to G.vis.y1 */
G.floor = (y, margin) => Math.min(y, G.vis.y1 - (margin === undefined ? 30 : margin));
/** a landscape lowered a little (scaled from its top): its horizon comes down to the height of the animals' backs */
G.lowerBg = (img, k) => { img.style.transformOrigin = '50% 0'; img.style.transform = `scale(${k || 1.1})`; return img; };
G.digGround = (siteId) => (window.DIGS && DIGS.site[siteId]) || 'red';
G.have = (key) => !!G.img[G.imgKey(key)];
/** the picture of a key ready to draw (an atlas piece is cut out into a canvas once) */
G.picCache = new Map();
G.pic = (key) => {
  const a = G.ATLAS[key];
  if (!a) return G.img[key];
  let c = G.picCache.get(key);
  if (c) return c;
  const im = G.img[a[0]]; if (!im) return null;
  c = document.createElement('canvas'); c.width = a[3]; c.height = a[4];
  c.getContext('2d').drawImage(im, a[1], a[2], a[3], a[4], 0, 0, a[3], a[4]);
  G.picCache.set(key, c);
  return c;
};
G.spr = (key, parent, x, y, w, h, cls) => {
  const a = G.ATLAS[key];
  if (a) {
    // a piece of an atlas: the box shows just its part of the picture, at any size
    const [ak, ax, ay, aw, ah, AW, AH] = a;
    return G.h('div', 'abs ' + (cls || ''), parent, { left: x, top: y, width: w, height: h, backgroundImage: `url(${G.src(ak)})`, backgroundRepeat: 'no-repeat',
      backgroundSize: `${(AW / aw) * 100}% ${(AH / ah) * 100}%`,
      backgroundPosition: `${AW > aw ? (ax / (AW - aw)) * 100 : 0}% ${AH > ah ? (ay / (AH - ah)) * 100 : 0}%` });
  }
  const im = G.h('img', 'abs ' + (cls || ''), parent, { left: x, top: y, width: w, height: h });
  im.src = G.src(key); im.draggable = false; return im;
};

/* ---------------- input mapping (handles the rotated portrait mode) */
G.pt = (e) => (G.rot ? { x: e.clientY / G.k, y: (G.vw - e.clientX) / G.k } : { x: e.clientX / G.k, y: e.clientY / G.k });
G.toBg = (p) => ({ x: (p.x - G.bgx) / G.sbg, y: (p.y - G.bgy) / G.sbg });
G.bgPt = (e) => G.toBg(G.pt(e));
G.bgToWorld = (x, y) => ({ x: G.bgx + x * G.sbg, y: G.bgy + y * G.sbg });
/** world-space centre of an element inside #ui */
G.uiCenter = (el) => {
  let x = el.offsetWidth / 2, y = el.offsetHeight / 2, n = el;
  while (n && n !== G.ui) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
  return { x, y };
};

/* ---------------- layout */
G.layout = () => {
  const vw = window.innerWidth, vh = window.innerHeight;
  G.vw = vw; G.vh = vh;
  const rot = vh > vw * 1.02;
  const LW = rot ? vh : vw, LH = rot ? vw : vh;
  let H = G.clamp(LH / 0.68, 560, 720), W = (H * LW) / LH;
  if (W < 960) { W = 960; H = (W * LH) / LW; }
  W = Math.round(W); H = Math.round(H);
  const k = LW / W;
  Object.assign(G, { W, H, k, rot });
  const w = G.world;
  w.style.width = W + 'px'; w.style.height = H + 'px';
  w.style.transform = rot ? `translate(${vw}px,0) rotate(90deg) scale(${k})` : `scale(${k})`;
  G.sbg = Math.max(W / 1280, H / 720);
  G.bgx = (W - 1280 * G.sbg) / 2; G.bgy = (H - 720 * G.sbg) / 2;
  G.bg.style.transform = `translate(${G.bgx}px,${G.bgy}px) scale(${G.sbg})`;
  G.vis = { x0: -G.bgx / G.sbg, y0: -G.bgy / G.sbg, x1: (W - G.bgx) / G.sbg, y1: (H - G.bgy) / G.sbg };
  if (window.GL) GL.resize();
  G.fx.resize();
  if (G.scene && G.scene.layout) G.scene.layout();
};

/* ---------------- loop */
let _last = performance.now();
function _frame(now) {
  const dt = Math.min(0.05, (now - _last) / 1000);
  _last = now; G.time = now / 1000;
  for (const f of G.tickers) { try { f(dt, G.time); } catch (e) { console.error(e); G.tickers.delete(f); } }
  if (!G.paused) for (const f of G.sceneTickers) { try { f(dt, G.time); } catch (e) { console.error(e); G.sceneTickers.delete(f); } }
  G.fx.update(G.paused ? 0 : dt);
  if (window.GL) GL.render();
  requestAnimationFrame(_frame);
}
G.tick = (fn) => { G.sceneTickers.add(fn); return () => G.sceneTickers.delete(fn); };
G.tween = (dur, fn, ease) => new Promise((res) => {
  ease = ease || G.ease.out; let t = 0;
  const f = (dt) => { t += dt; const e = Math.min(1, t / dur); fn(ease(e), e); if (e >= 1) { G.sceneTickers.delete(f); res(); } };
  fn(0, 0); G.sceneTickers.add(f);
});
G.wait = (s) => new Promise((res) => { let t = 0; const f = (dt) => { t += dt; if (t >= s) { G.sceneTickers.delete(f); res(); } }; G.sceneTickers.add(f); });
/* global tween (keeps running across scenes, used for fades) */
G.gtween = (dur, fn, ease) => new Promise((res) => {
  ease = ease || G.ease.lin; let t = 0;
  const f = (dt) => { t += dt; const e = Math.min(1, t / dur); fn(ease(e)); if (e >= 1) { G.tickers.delete(f); res(); } };
  G.tickers.add(f);
});

/* ---------------- scenes */
G.fadeTo = (v, d) => { const from = +G.fade.style.opacity || 0; return G.gtween(d, (e) => { G.fade.style.opacity = from + (v - from) * e; }); };
G.clearScene = () => {
  for (const f of G.cleanups.splice(0)) { try { f(); } catch (e) { console.error(e); } }
  if (G.scene && G.scene.exit) { try { G.scene.exit(); } catch (e) { console.error(e); } }
  G.sceneTickers.clear(); G.paused = false;
  G.scene$.innerHTML = ''; G.ui.innerHTML = '';
  G.scene$.style.transform = ''; G.scene$.style.transformOrigin = '';
  if (window.GL) GL.clear();
  G.fx.clear();
  if (window.AU) AU.stopLoops();
  UI.narrEl = null; UI.narrArea = null; UI.narrBottom = 0;
  G.saidOnce = new Set();
};
G.go = async (name, params) => {
  if (G.switching) return;
  G.switching = true;
  try {
    if (G.started) await G.fadeTo(1, 0.22);
    G.clearScene();
    G.token++;
    G.sceneName = name; G.scene = Scenes[name]; G.params = params || {};
    if (window.AU) { AU.hush(); AU.music(AU.trackOf(name)); }
    // lazy assets: species parts are loaded only when a scene needs them
    const need = G.needKeys ? G.needKeys(name, params || {}).filter((k) => !G.have(k)) : [];
    if (need.length) await G.load(need);
    await G.scene.enter(params || {});
    if (G.scene.layout) G.scene.layout();
  } catch (e) {
    console.error(e); UI.toast('Ошибка сцены: ' + e.message, 4);
  }
  G.started = true;
  G.switching = false;
  await G.fadeTo(0, 0.3);
};
G.alive = (tok) => tok === G.token;
/** start chapter n of the current species (its scene + params) */
G.goCh = (n) => {
  const c = G.SP().chapters[n - 1];
  if (!c) return G.go('path');
  return G.go(c.scene || c.id, Object.assign({ n }, c.p || {}));
};

/** the chapter being played is a baby's one (the animal is drawn with baby proportions) */
G.young = () => { const c = G.params && G.params.n && G.SP().chapters[G.params.n - 1]; return !!c && c.age === 1 && (c.scene || c.id) === G.sceneName; };

/* ---------------- state */
const STORE = 'dino-trias-test-v1';
G.defState = () => ({
  v: 1, cur: 'herrera', sp: {}, bones: [], others: [], assembled: false, ch: {}, hunt: { easy: 0, medium: 0, hard: 0 }, record: 0,
  facts: { mouth: false, arms: false, legs: false, tail: false },
  settings: { sfx: true, voice: true, music: true }, seen: {},
});
G.loadState = () => {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (e) { s = null; }
  const d = G.defState();
  G.state = Object.assign(d, s || {});
  for (const k of ['ch', 'hunt', 'facts', 'settings', 'seen']) G.state[k] = Object.assign(d[k], (s && s[k]) || {});
  if (!Array.isArray(G.state.others)) G.state.others = [];
};
/** bones of the neighbours still in the ground */
G.othersLeft = () => DATA.others.map((o) => o.id).filter((id) => !G.state.others.includes(id));
G.save = () => { try { localStorage.setItem(STORE, JSON.stringify(G.state)); } catch (e) { /* storage may be unavailable */ } };
G.chDone = (n) => !!(G.state.ch[n] && G.state.ch[n].done);
G.chStars = (n) => (G.state.ch[n] && G.state.ch[n].stars) || 0;
G.chOpen = (n) => {
  if (!G.state.assembled) return false;
  if (n <= 1) return true;
  return G.chDone(n - 1);
};
G.setCh = (n, stars) => {
  const c = G.state.ch[n] || { done: false, stars: 0 };
  c.done = true; c.stars = Math.max(c.stars || 0, stars);
  G.state.ch[n] = c; G.save();
};
G.totalSteps = () => { let s = 0; for (let n = 1; n <= 5; n++) s += G.chStars(n); return s; };
G.firstTime = (key) => { if (G.state.seen[key]) return false; G.state.seen[key] = 1; G.save(); return true; };

/* ---------------- images */
G.load = (list0, onProgress) => {
  let done = 0;
  const list = [...new Set(list0.map(G.imgKey))].filter((k) => !G.img[k]);
  if (onProgress && !list.length) onProgress(1);
  return Promise.all(list.map((key) => new Promise((res) => {
    const im = new Image();
    im.onload = () => { G.img[key] = im; done++; if (onProgress) onProgress(done / list.length); res(); };
    im.onerror = () => { console.warn('image failed', key); done++; if (onProgress) onProgress(done / list.length); res(); };
    im.src = 'img/' + key + '.webp';
  })));
};

/* ---------------- particles (2D canvas over the scene) */
G.fx = {
  parts: [], cv: null, ctx: null, scale: 1,
  init() {
    this.cv = document.createElement('canvas'); this.cv.className = 'fxc';
    this.ctx = this.cv.getContext('2d');
  },
  resize() {
    const s = Math.min(2, G.sbg * G.k * Math.min(window.devicePixelRatio || 1, 2));
    this.scale = s; this.cv.width = Math.round(1280 * s); this.cv.height = Math.round(720 * s);
  },
  clear() { this.parts.length = 0; if (this.ctx) this.ctx.clearRect(0, 0, this.cv.width, this.cv.height); },
  emit(o) { this.parts.push(Object.assign({ x: 0, y: 0, vx: 0, vy: 0, g: 0, life: 1, t: 0, size: 6, color: '#fff', type: 'dot', rot: 0, vr: 0, drag: 0, fade: 1 }, o)); },
  burst(x, y, n, o) {
    for (let i = 0; i < n; i++) {
      const a = G.rand(o.a0 !== undefined ? o.a0 : 0, o.a1 !== undefined ? o.a1 : Math.PI * 2), sp = G.rand(o.s0 || 60, o.s1 || 220);
      this.emit(Object.assign({}, o, { x: x + G.rand(-(o.jx || 0), o.jx || 0), y: y + G.rand(-(o.jy || 0), o.jy || 0), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: G.rand(o.l0 || 0.5, o.l1 || 1.0), size: G.rand(o.z0 || 4, o.z1 || 10), rot: G.rand(0, 6.28), vr: G.rand(-6, 6),
        color: Array.isArray(o.color) ? G.pick(o.color) : o.color }));
    }
  },
  dust(x, y, n, col) { this.burst(x, y, n || 10, { type: 'puff', color: col || 'rgba(214,180,130,', s0: 30, s1: 140, a0: Math.PI, a1: Math.PI * 2, g: 60, z0: 10, z1: 26, l0: 0.5, l1: 1.0, drag: 2.5, jx: 10 }); },
  sparkle(x, y, n) { this.burst(x, y, n || 14, { type: 'spark', color: ['#FFE6A8', '#F2B640', '#ffffff'], s0: 60, s1: 260, z0: 5, z1: 11, l0: 0.5, l1: 1.1, drag: 1.8, g: 40 }); },
  update(dt) {
    const c = this.ctx; if (!c) return;
    if (!this.parts.length) { if (this._dirty) { c.clearRect(0, 0, this.cv.width, this.cv.height); this._dirty = false; } return; }
    this._dirty = true;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, this.cv.width, this.cv.height);
    c.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    const keep = [];
    for (const p of this.parts) {
      p.t += dt; if (p.t >= p.life) continue; keep.push(p);
      const dr = Math.exp(-(p.drag || 0) * dt);
      p.vx *= dr; p.vy *= dr; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      const e = p.t / p.life, a = p.fade ? (1 - e) : 1;
      if (p.type === 'puff') {
        const r = p.size * (1 + e * 1.6);
        const gr = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        gr.addColorStop(0, p.color + (0.42 * a).toFixed(3) + ')'); gr.addColorStop(1, p.color + '0)');
        c.fillStyle = gr; c.beginPath(); c.arc(p.x, p.y, r, 0, 6.283); c.fill();
      } else if (p.type === 'spark') {
        c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.globalAlpha = a; c.fillStyle = p.color;
        const s = p.size * (1 - e * 0.5);
        c.beginPath(); c.moveTo(0, -s); c.lineTo(s * 0.28, -s * 0.28); c.lineTo(s, 0); c.lineTo(s * 0.28, s * 0.28);
        c.lineTo(0, s); c.lineTo(-s * 0.28, s * 0.28); c.lineTo(-s, 0); c.lineTo(-s * 0.28, -s * 0.28); c.closePath(); c.fill(); c.restore();
      } else if (p.type === 'chip') {
        c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.globalAlpha = Math.min(1, a * 1.5); c.fillStyle = p.color;
        const s = p.size; c.beginPath(); c.moveTo(-s, -s * 0.6); c.lineTo(s * 0.8, -s * 0.8); c.lineTo(s, s * 0.5); c.lineTo(-s * 0.4, s * 0.9); c.closePath(); c.fill(); c.restore();
      } else if (p.type === 'line') {
        c.globalAlpha = a; c.strokeStyle = p.color; c.lineWidth = p.size; c.lineCap = 'round';
        c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.vx * 0.06, p.y - p.vy * 0.06); c.stroke(); c.globalAlpha = 1;
      } else {
        c.globalAlpha = a; c.fillStyle = p.color; c.beginPath(); c.arc(p.x, p.y, p.size * (1 - e * 0.4), 0, 6.283); c.fill(); c.globalAlpha = 1;
      }
    }
    this.parts = keep;
  },
};

/* ---------------- boot */
G.boot = async () => {
  G.world = document.getElementById('world');
  G.bg = document.getElementById('bg');
  G.ui = document.getElementById('ui');
  G.fade = document.getElementById('fade');
  G.scene$ = G.h('div', 'full', G.bg);
  G.fx.init(); G.bg.appendChild(G.fx.cv);
  if (window.GL) GL.init();
  G.loadState();
  G.layout();
  window.addEventListener('resize', () => setTimeout(G.layout, 60));
  window.addEventListener('orientationchange', () => setTimeout(G.layout, 250));
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  requestAnimationFrame(_frame);
  Scenes.loading.enter();
  G.fadeTo(0, 0.3);
};
window.addEventListener('DOMContentLoaded', G.boot);
