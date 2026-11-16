'use strict';
/* ==================================================================== loading · title · map · site · dig · assemble */
const IMG_LIST = ['bg_map_hd', 'bg_hall', 'hall_strip', 'bg_close2', 'ped_close', 'bg_egg', 'bg_nest', 'bg_hide', 'bg_burrows', 'bg_valley', 'bg_run', 'bg_grip', 'bg_final',
  'btn_bag', 'btn_museum', 'hero', 'runner', 'runner_body', 'runner_leg', 'runner_leg2', 'prey', 'log', 'baby', 'baby_body', 'baby_leg', 'baby_leg2', 'babyCrouch', 'cynoPeek', 'beetle', 'egg', 'skel_ghost',
  'bone_skull', 'bone_neck', 'bone_torso', 'bone_pelvis', 'bone_legs', 'bone_tail',
  'nb_hyperodapedon', 'nb_ischigualastia', 'nb_eoraptor', 'nb_exaeretodon', 'nb_saurosuchus',
  'obone_tooth', 'obone_claw', 'obone_femur', 'obone_vert', 'obone_rib', 'obone_shell', 'obone_fishf', 'obone_ammo',
  'sp_plateo', 'sp_plateo_body', 'sp_plateo_leg', 'sp_plateo_leg2', 'sp_eudimo', 'sp_shoni', 'baby_plateo', 'baby_eudimo',
  'bg_forest', 'bg_mud', 'bg_lagoon', 'bg_sea',
  'it_fish', 'it_ammonite', 'it_dragonfly', 'it_belemnite', 'it_branch', 'it_cycad', 'it_horsetail', 'it_puddle',
  'it_lizard', 'it_cyno', 'it_roach', 'it_clam', 'it_shrimp', 'it_fern', 'it_algae', 'it_ginkgo', 'it_shoots',
  'sk_plateo_ghost', 'sk_eudimo_ghost', 'sk_shoni_ghost',
  ...['skull', 'neck', 'pelvis', 'legs', 'torso', 'tail'].map((k) => 'sk_plateo_' + k),
  ...['skull', 'wingR', 'wingL', 'legs', 'torso', 'tail'].map((k) => 'sk_eudimo_' + k),
  ...['skull', 'finB', 'finA', 'rear', 'torso', 'tail'].map((k) => 'sk_shoni_' + k)];

Scenes.loading = {
  enter() {
    const box = G.h('div', 'load', G.ui);
    box.innerHTML = `<div class="t-title" style="font-size:46px;color:#F2B640">Динозавры</div>
      <div class="t-sub" style="margin-top:4px">Загружаем…</div><div class="bar"><i style="width:0%"></i></div>`;
    const bar = box.querySelector('.bar i');
    G.load(IMG_LIST, (p) => { bar.style.width = Math.round(p * 100) + '%'; }).then(async () => {
      try { await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]); } catch (e) { /* fonts */ }
      const start = (location.hash || '').replace('#', '');
      if (start && Scenes[start] && start !== 'loading') G.go(start); else G.go('title');
    });
  },
};

Scenes.title = {
  enter() {
    G.bgImg('bg_final');
    G.h('div', 'full', G.scene$, { background: 'linear-gradient(90deg,rgba(7,9,11,0) 38%,rgba(7,9,11,.7) 78%)' });
    const box = G.h('div', 'abs', G.ui, { right: 64, top: Math.round(G.H / 2 - 200), width: 470, height: 420 });
    box.innerHTML = `<div class="t-label">Тестовая версия</div>
      <div class="t-title" style="font-size:76px;line-height:1;color:#F2B640;margin-top:8px">Динозавры</div>
      <div class="t-h" style="margin-top:8px">Триас и юра</div>
      <div class="t-body" style="margin-top:14px;opacity:.88;max-width:440px">${Object.keys(DATA.species).length} животных триаса и юры: динозавры, летающие и морские ящеры. Раскопки, сборка скелетов, музей и главы их жизни.</div>`;
    UI.mainBtn(box, 'Играть', 'play', { l: 0, t: 262 }, 320, () => G.go('map'));
    UI.secBtn(box, 'Викторина', 'star', { l: 0, t: 342 }, 320, () => G.go('quiz', { from: 'title' }));
    UI.secBtn(box, 'Тест-меню', 'flask', { l: 0, t: 418 }, 320, () => Test.open());
  },
};

/* ------------------------------------------------------------------ map: Pangaea. A continent zooms in and shows its dig sites;
   a dig site opens its card with the button to start digging. The map can be dragged a little. */
/** period plate with arrows (map, museum hall): the arrows go to the period before / after, the dots show where we are */
function periodSwitch(parent, w, h, fs, onSwitch) {
  const P = DATA.periodOrder, i = P.indexOf(G.period()), per = G.per();
  const go = (j) => {
    if (j < 0) { UI.toast('Раньше триаса динозавров ещё не было'); return; }
    if (j >= P.length) { UI.toast('Меловой период откроется позже'); return; }
    AU.play('whoosh'); G.switchPeriod(P[j]); G.state.region = null; G.save(); onSwitch();
  };
  const lb = UI.iconBtn(parent, 'left', null, () => go(i - 1));
  lb.style.position = 'relative'; if (i <= 0) lb.style.opacity = '.45';
  const dots = [0, 1, 2].map((k) => `<i style="width:7px;height:7px;border-radius:50%;background:${k === i ? '#F2B640' : 'rgba(255,255,255,.3)'}"></i>`).join('');
  G.h('div', 'plate', parent, { position: 'relative', width: w, height: h, textAlign: 'center', paddingTop: Math.round(h / 8) + 'px' },
    `<div class="t-title" style="font-size:${fs}px">${per.name}</div><div class="t-sub" style="font-size:${Math.round(fs / 2)}px">${per.years}</div>
     <div style="display:flex;gap:6px;justify-content:center;margin-top:${Math.round(h / 13)}px">${dots}</div>`);
  const rb = UI.iconBtn(parent, 'right', null, () => go(i + 1));
  rb.style.position = 'relative';
}
const MAPM = 120;   // ocean margin of bg_map_hd on the left and right (map px)
const MAP_PW = 392; // width of the dig-site card
const spAt = (siteId) => Object.values(DATA.species).filter((q) => q.site === siteId);
Scenes.map = {
  enter(p) {
    const sc = G.scene$, tok = G.token;
    const S = (this.S = { cx: 640, cy: 360, z: 1, mode: 'world', reg: null, site: null, drag: null, dragged: false, busy: false, regEls: [], siteEls: {} });
    const cam = (S.cam = G.h('div', 'abs', sc, { left: 0, top: 0, width: 1280, height: 720, transformOrigin: '0 0', willChange: 'transform' }));
    const img = G.h('img', 'abs', cam, { left: -MAPM, top: 0, width: 1280 + 2 * MAPM, height: 720 });
    img.src = G.src(G.per().map); img.draggable = false;
    G.h('div', 'abs', sc, { left: -200, top: 0, width: 1680, height: 190, background: 'linear-gradient(rgba(7,9,11,.6),rgba(7,9,11,0))', pointerEvents: 'none' });
    G.h('div', 'abs', sc, { left: -200, top: 480, width: 1680, height: 240, background: 'linear-gradient(rgba(7,9,11,0),rgba(7,9,11,.65))', pointerEvents: 'none' });
    S.layer = G.h('div', 'full', sc);
    // continents
    for (const r of Object.values(DATA.regions)) {
      if (r.period !== G.period()) continue;
      const list = Object.values(DATA.species).filter((q) => r.sites.includes(q.site));
      const nIn = list.filter((q) => G.spState(q.id).assembled).length, done = nIn === list.length;
      const el = G.h('div', 'mk act', S.layer);
      el.innerHTML = `<div style="position:relative"><div class="ring">${silSvg(r.sil, '#15110b')}</div>
        <div class="bdg">${done ? icon('check', ' style="color:#0f2a16"') : `<b style="font:600 13px Oswald,sans-serif;color:#2A1E05">${list.length}</b>`}</div></div>
        <div class="plate lab"><b>${r.name}</b><small>В музее ${nIn} из ${list.length}</small></div>`;
      if (done) el.querySelector('.bdg').style.background = '#4CD26B';
      UI.tap(el, () => { if (!S.dragged && !S.busy && S.mode === 'world') this.openRegion(r.id); });
      S.regEls.push({ r, el });
    }
    // drag the map
    G.on(sc, 'pointerdown', (e) => {
      if (S.busy) return;
      AU.unlock();
      const q = G.bgPt(e);
      S.drag = { id: e.pointerId, x0: q.x, y0: q.y, cx: S.cx, cy: S.cy, on: false, t: e.target };
      S.dragged = false;
    });
    G.on(window, 'pointermove', (e) => {
      const d = S.drag; if (!d || e.pointerId !== d.id) return;
      const q = G.bgPt(e), dx = q.x - d.x0, dy = q.y - d.y0;
      if (!d.on) { if (Math.hypot(dx, dy) < 10) return; d.on = true; S.dragged = true; d.x0 = q.x; d.y0 = q.y; this.dropHint(); S.anim = null; return; }
      const L = this.limits(), rub = (v, a, b) => (v < a ? a - (a - v) * 0.35 : v > b ? b + (v - b) * 0.35 : v);
      S.cx = rub(d.cx - dx / S.z, L.x0, L.x1); S.cy = rub(d.cy - dy / S.z, L.y0, L.y1);
    });
    const up = (e) => {
      const d = S.drag; if (!d || e.pointerId !== d.id) return;
      S.drag = null;
      if (d.on) { this.settle(); return; }
      // a tap on the empty map closes the dig-site card
      if (e.type === 'pointerup' && S.mode === 'region' && S.site && !(d.t.closest && d.t.closest('.dg'))) this.closeSite();
    };
    G.on(window, 'pointerup', up); G.on(window, 'pointercancel', up);
    G.tick(() => this.place());
    // where to start: back from the dig (its region, its site open) or the whole map
    const sp = G.SP(), site = DATA.sites[sp.site];
    if (p.open && site && site.pt) {
      const rid = site.region, V = DATA.regions[rid].view;
      Object.assign(S, { mode: 'region', reg: rid, z: V.z, cx: V.c[0], cy: V.c[1] });
      for (const q of S.regEls) { q.el.style.display = 'none'; q.el.style.pointerEvents = 'none'; }
      this.buildSites(rid);
      this.regionUI(true);
      this.openSite(site.id, true);
    } else this.worldUI();
    this.place();
    void tok;
  },
  /** where the camera may go: the map always covers the screen, and it only moves "a little" around what it shows */
  limits(free) {
    const S = this.S, V = G.vis, z = S.z;
    let x0 = -MAPM + (640 - V.x0) / z, x1 = 1280 + MAPM - (V.x1 - 640) / z, y0 = (360 - V.y0) / z, y1 = 720 - (V.y1 - 360) / z;
    if (!free) {
      const c = S.mode === 'region' ? DATA.regions[S.reg].view.c : [640, 360], r = S.mode === 'region' ? 240 : MAPM;
      x0 = Math.max(x0, c[0] - r); x1 = Math.min(x1, c[0] + r); y0 = Math.max(y0, c[1] - r); y1 = Math.min(y1, c[1] + r);
    }
    if (x0 > x1) x0 = x1 = (x0 + x1) / 2;
    if (y0 > y1) y0 = y1 = (y0 + y1) / 2;
    return { x0, x1, y0, y1 };
  },
  /** after a drag: back inside the limits if it was pulled too far */
  settle() {
    const S = this.S, L = this.limits(), tx = G.clamp(S.cx, L.x0, L.x1), ty = G.clamp(S.cy, L.y0, L.y1);
    if (Math.abs(tx - S.cx) < 0.5 && Math.abs(ty - S.cy) < 0.5) return;
    const x0 = S.cx, y0 = S.cy;
    G.tween(0.3, (e) => { if (S.drag) return; S.cx = G.lerp(x0, tx, e); S.cy = G.lerp(y0, ty, e); });
  },
  /** screen (scene) position of a map point */
  toScreen(x, y) { const S = this.S; return [640 + (x - S.cx) * S.z, 360 + (y - S.cy) * S.z]; },
  place() {
    const S = this.S;
    S.cam.style.transform = `translate(${(640 - S.cx * S.z).toFixed(2)}px,${(360 - S.cy * S.z).toFixed(2)}px) scale(${S.z.toFixed(4)})`;
    for (const { r, el } of S.regEls) {
      const [x, y] = this.toScreen(r.map[0], r.map[1]);
      el.style.left = x.toFixed(1) + 'px'; el.style.top = (y - 42).toFixed(1) + 'px';
    }
    for (const id in S.siteEls) {
      const pt = DATA.sites[id].pt, el = S.siteEls[id], [x, y] = this.toScreen(pt[0], pt[1]);
      el.style.left = x.toFixed(1) + 'px'; el.style.top = y.toFixed(1) + 'px';
    }
  },
  /** camera flight: zoom and move so that the map point F glides smoothly to its new place on screen */
  fly(cx, cy, z, F, dur, onStep) {
    const S = this.S, c0 = [S.cx, S.cy], z0 = S.z;
    const s0 = [640 + (F[0] - c0[0]) * z0, 360 + (F[1] - c0[1]) * z0], s1 = [640 + (F[0] - cx) * z, 360 + (F[1] - cy) * z];
    const l0 = Math.log(z0), l1 = Math.log(z);
    return G.tween(dur, (e) => {
      const zz = Math.exp(G.lerp(l0, l1, e)), sx = G.lerp(s0[0], s1[0], e), sy = G.lerp(s0[1], s1[1], e);
      S.z = zz; S.cx = F[0] - (sx - 640) / zz; S.cy = F[1] - (sy - 360) / zz;
      if (onStep) onStep(e);
    }, G.ease.inOut);
  },
  dropHint() { const S = this.S; if (S.hint) { S.hint.remove(); S.hint = null; } },

  /* ---------------- the whole map */
  worldUI() {
    const S = this.S;
    G.ui.innerHTML = ''; UI.narrArea = null;
    // period switcher
    const ps = G.h('div', 'abs row', G.ui, { left: Math.round(G.W / 2), top: 24, gap: '8px', transform: 'translateX(-50%)' });
    periodSwitch(ps, 290, 80, 28, () => G.go('map'));
    UI.topRight();
    S.corners = UI.corners();
    const per = G.period(), nAsm = G.assembledCount(), nAll = G.inPeriod().length;
    this.dropHint();
    if (!nAsm) {
      const first = S.regEls.find((q) => q.r.id === (per === 'trias' ? 'sam' : 'jnam'));
      if (first) S.hint = UI.hand(first.el, 75, 57);
      if (per === 'trias') {
        if (G.firstApp('map-0')) G.say(G.firstTime('map') ? 'Это Пангея — вся суша тогда была одним материком. Нажми на материк — посмотрим, где копать!' : 'Нажми на материк, чтобы найти места раскопок.');
      } else if (G.firstApp('map-' + per + '-0')) G.say(G.firstTime('map-' + per) ? G.per().intro : 'Нажми на материк, чтобы найти места раскопок.');
    } else G.onceApp(`map-${per}-${nAsm}`, nAsm < nAll ? AU.alt(`В музее уже ${nAsm} из ${nAll}. Выбери материк, где копать дальше!`, 'Выбери материк, где копать дальше!')
      : per === 'trias' ? 'Все животные триаса в музее! Нажми на стрелку — там юрский период.' : 'Все животные юры в музее! Меловой период откроется позже.');
  },
  async openRegion(rid, siteId) {
    const S = this.S, tok = G.token, R = DATA.regions[rid], V = R.view;
    if (S.busy) return;
    S.busy = true; S.mode = 'trans'; S.reg = rid;
    G.state.region = rid; G.save();
    this.dropHint(); G.ui.innerHTML = ''; UI.narrArea = null; AU.hush(); AU.play('whoosh');
    this.buildSites(rid);
    const regs = S.regEls, sites = Object.values(S.siteEls);
    for (const s of sites) s.style.opacity = 0;
    await this.fly(V.c[0], V.c[1], V.z, V.c, 0.9, (e) => {
      for (const q of regs) { q.el.style.opacity = Math.max(0, 1 - e * 2.2); q.el.style.pointerEvents = 'none'; }
      for (const s of sites) s.style.opacity = G.clamp((e - 0.6) / 0.4, 0, 1);
    });
    if (!G.alive(tok)) return;
    for (const q of regs) q.el.style.display = 'none';
    S.mode = 'region'; S.busy = false;
    this.regionUI();
    if (siteId) this.openSite(siteId);
  },
  async closeRegion() {
    const S = this.S, tok = G.token, R = DATA.regions[S.reg];
    if (S.busy || S.mode !== 'region') return;
    S.busy = true; S.mode = 'trans';
    this.closeSite(true);
    this.dropHint(); G.ui.innerHTML = ''; UI.narrArea = null; AU.hush(); AU.play('whoosh');
    const regs = S.regEls, sites = Object.values(S.siteEls);
    for (const q of regs) { q.el.style.display = ''; q.el.style.opacity = 0; }
    await this.fly(640, 360, 1, R.view.c, 0.75, (e) => {
      for (const s of sites) s.style.opacity = Math.max(0, 1 - e * 2.5);
      for (const q of regs) q.el.style.opacity = G.clamp((e - 0.55) / 0.45, 0, 1);
    });
    if (!G.alive(tok)) return;
    for (const s of sites) s.remove();
    S.siteEls = {};
    for (const q of regs) q.el.style.pointerEvents = '';
    S.mode = 'world'; S.reg = null; S.busy = false;
    this.worldUI();
  },

  /* ---------------- a continent: its dig sites */
  buildSites(rid) {
    const S = this.S, R = DATA.regions[rid];
    for (const id in S.siteEls) S.siteEls[id].remove();
    S.siteEls = {};
    for (const sid of R.sites) {
      const site = DATA.sites[sid]; if (!site.pt) continue;
      const el = (S.siteEls[sid] = G.h('div', 'dg', S.layer));
      this.paintSite(sid);
      UI.tap(el, () => { if (!S.dragged && !S.busy && S.mode === 'region') this.openSite(sid); });
      void site;
    }
  },
  /** the look of a dig-site point: the animal found there, how many animals, done or not */
  paintSite(sid) {
    const S = this.S, el = S.siteEls[sid]; if (!el) return;
    const list = spAt(sid), st = list.map((q) => G.spState(q.id)), nIn = st.filter((s) => s.assembled).length, all = nIn === list.length;
    const lead = list.find((q, i) => !st[i].assembled) || list[0], dug = st.some((s) => s.assembled || s.bones.length);
    el.className = 'dg' + (all ? ' done' : ' todo') + (S.site === sid ? ' sel' : '');
    el.innerHTML = `<div class="pin">${silSvg(lead.sil, all ? '#2a1e05' : '#15110b')}</div>
      ${all ? `<div class="bdg ok">${icon('check')}</div>` : list.length > 1 ? `<div class="bdg">${list.length}</div>` : dug ? '' : `<div class="bdg">${icon('pick')}</div>`}
      <div class="plate nm">${DATA.sites[sid].name}</div>`;
  },
  regionUI(quiet) {
    const S = this.S, R = DATA.regions[S.reg], n = R.sites.length;
    G.ui.innerHTML = ''; UI.narrArea = null;
    UI.header(R.name, `${G.per().name} · ${n} ${n === 1 ? 'место' : n < 5 ? 'места' : 'мест'} раскопок`, () => this.closeRegion());
    UI.topRight();
    S.corners = UI.corners();
    if (quiet) return;
    const first = G.firstTime('region-' + R.id);
    if (first) {
      const sid = R.sites.find((id) => { const el = S.siteEls[id]; return el && el.classList.contains('todo'); }) || R.sites[0];
      if (S.siteEls[sid]) S.hint = UI.hand(S.siteEls[sid], 0, 14);
    }
    G.onceApp('region', first ? AU.alt(`${R.name}. Точки на карте — места, где учёные нашли кости. Нажми на точку!`, 'Точки на карте — места, где учёные нашли кости. Нажми на точку!') : `${R.name}. Выбери место раскопок.`);
  },
  /** the card of a dig site: where and when, a fact, who was found there, and the button to dig */
  openSite(sid, still) {
    const S = this.S, site = DATA.sites[sid], list = spAt(sid);
    if (S.mode !== 'region') return;
    this.dropHint();
    S.site = sid;
    if (!list.some((q) => q.id === G.cur())) G.setCur((list.find((q) => !G.spState(q.id).assembled) || list[0]).id);
    for (const id in S.siteEls) S.siteEls[id].classList.toggle('sel', id === sid);
    this.card();
    // the camera brings the point to the free part of the screen, left of the card
    const L = G.toBg({ x: (G.W - MAP_PW - 40) / 2, y: G.H / 2 + 24 });
    const lim = this.limits(true), z = S.z;
    const tx = G.clamp(site.pt[0] - (L.x - 640) / z, lim.x0, lim.x1), ty = G.clamp(site.pt[1] - (L.y - 360) / z, lim.y0, lim.y1);
    if (still) { S.cx = tx; S.cy = ty; } else {
      const x0 = S.cx, y0 = S.cy;
      G.tween(0.45, (e) => { if (S.drag && S.drag.on) return; S.cx = G.lerp(x0, tx, e); S.cy = G.lerp(y0, ty, e); }, G.ease.inOut);
      AU.play('pop');
    }
    // the card shows the fact: the subtitle line steps aside, the voice reads it
    UI.narr('', { silent: true });
    const ask = G.S().assembled ? 'Выбери, что делать дальше!' : 'Продолжим раскопки?';
    AU.say(still ? AU.alt(`${site.name}. ${ask}`, ask) : `${site.name}, ${site.where}. ${site.fact}`);
  },
  closeSite(quiet) {
    const S = this.S;
    if (S.pp) { S.pp.remove(); S.pp = null; }
    if (!S.site) return;
    const was = S.site; S.site = null;
    if (S.siteEls[was]) S.siteEls[was].classList.remove('sel');
    if (S.corners && S.corners.museum) S.corners.museum.style.display = '';
    UI.narrArea = null;
    if (!quiet) G.say('Выбери место раскопок.', { silent: true });
  },
  card() {
    const S = this.S, site = DATA.sites[S.site], list = spAt(S.site), sp = G.SP(), ss = G.S(), nb = ss.bones.length, asm = ss.assembled;
    if (S.pp) S.pp.remove();
    const PW = MAP_PW, short = G.H < 660;
    const pp = (S.pp = G.h('div', 'plate abs pe sitecard', G.ui, { right: 28, top: 96, width: PW, padding: short ? '14px 22px 18px' : '18px 22px 20px' }));
    const status = (q) => {
      const s = G.spState(q.id), k = s.bones.length;
      if (s.assembled) return ['В музее', 'check', 'green'];
      if (k >= 6) return ['Собери скелет', 'puzzle', 'gold'];
      return [k ? `${k} из 6 костей` : G.fm('Не найден', 'Не найдена', q), 'bone', k ? 'green' : ''];
    };
    const left = G.othersLeft(site.id).length + G.coBones(sp.id).length;
    const action = !asm && nb < 6 ? ['Начать раскопки', 'pick', () => G.go('dig')] : !asm ? ['Собрать скелет', 'puzzle', () => G.go('assemble')]
      : left ? ['Копать ещё', 'pick', () => G.go('dig')] : ['В музей', 'museum', () => G.go('museum')];
    const st = status(sp), ch = short ? 92 : 108;
    pp.innerHTML = `<div class="row" style="justify-content:space-between;align-items:center"><div class="t-label">Место раскопок</div>
        <button class="x pe" data-back style="width:34px;height:34px;margin:-6px -8px -6px 0;border-radius:50%;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center">${icon('close', ' style="width:17px;height:17px"')}</button></div>
      <div style="font:600 ${site.name.length > 14 ? 24 : short ? 27 : 30}px/1.12 Oswald,sans-serif;margin-top:2px;white-space:nowrap">${site.name}</div>
      <div class="t-sub" style="opacity:.72">${site.where} · ${site.age}</div>
      <div class="row" style="gap:12px;margin-top:${short ? 9 : 12}px;align-items:flex-start"><button class="say pe" style="width:32px;height:32px;border-radius:50%;background:#F2B640;display:flex;align-items:center;justify-content:center;flex:none">${icon('sound', ' style="width:17px;height:17px;color:#2A1E05"')}</button>
        <div class="t-body fact${short ? ' clamp3' : ''}" style="font-size:${short ? 14 : 15}px;line-height:1.35">${site.fact}</div></div>
      <div class="t-label" style="margin-top:${short ? 10 : 14}px;opacity:.8">Кого здесь нашли</div>
      <div class="row cards" style="gap:8px;margin-top:8px;justify-content:center"></div>
      <div class="row" style="justify-content:space-between;margin-top:${short ? 9 : 12}px;font:500 13px Rubik,sans-serif"><span style="opacity:.75">${asm || nb ? sp.name : 'Неизвестное животное'}</span><b class="${st[2]}" style="font:600 15px Oswald,sans-serif">${asm ? 'В музее' : nb >= 6 ? 'Собери скелет' : `${nb} из 6 костей`}</b></div>
      <div class="seg" style="margin-top:7px">${Array.from({ length: 6 }, (_, i) => `<i class="${asm || i < nb ? 'on' : ''}"></i>`).join('')}</div>
      <div class="bw" style="position:relative;height:64px;margin-top:${short ? 12 : 16}px"></div>`;
    const cards = pp.querySelector('.cards'), cw = list.length === 1 ? 150 : Math.floor((PW - 44 - 8 * (list.length - 1)) / list.length);
    for (const q of list) {
      const qs = G.spState(q.id), s2 = status(q), nq = qs.bones.length, on = q.id === sp.id;
      const el = G.h('div', 'plate spc' + (on ? ' cur' : ''), cards, { position: 'relative', width: cw, height: ch, flex: 'none' });
      const pic = qs.assembled ? `<img src="${G.src(q.img)}">` : silSvg(q.sil, on ? '#0b0c0e' : '#08090a');
      el.innerHTML = `<div class="sc">${pic}${!qs.assembled && nq ? `<div class="pb"><i style="width:${(nq / 6) * 100}%"></i></div>` : ''}</div>
        <b style="font-size:${q.name.length > 11 ? 12 : 13}px">${qs.assembled || nq ? q.name : '???'}</b><small class="${s2[2]}">${icon(s2[1], ' style="width:12px;height:12px"')}${s2[0]}</small>`;
      UI.tap(el, () => { if (G.cur() === q.id) return; G.setCur(q.id); AU.play('pop'); this.card(); this.paintSite(S.site); S.siteEls[S.site].classList.add('sel'); });
    }
    UI.tap(pp.querySelector('.say'), () => AU.say(site.fact), false);
    UI.tap(pp.querySelector('.x'), () => this.closeSite());
    const bb = UI.mainBtn(pp.querySelector('.bw'), action[0], action[1], { l: 0, t: 0 }, PW - 44, action[2]);
    bb.classList.add('pulse');
    if (S.corners && S.corners.museum) S.corners.museum.style.display = 'none';
  },
};
/** the old region screen is now the zoomed map with the current dig site open */
Scenes.site = { enter(p) { G.scene = Scenes.map; return Scenes.map.enter(Object.assign({ open: true }, p)); } };

/* ------------------------------------------------------------------ dig */
Scenes.dig = {
  enter() {
    const st = G.state, sc = G.scene$, tok = G.token, sp = G.SP(), ss = G.S(), site = G.site(), spId = sp.id;
    const left = ss.assembled ? [] : sp.bones.map((b) => b.id).filter((id) => !ss.bones.includes(id));
    const oLeft = G.shuffle(G.othersLeft()).map((id) => ({ id, kind: 'o' }));
    const cLeft = G.shuffle(G.coBones(spId)).map((c) => ({ id: c.id, sp: c.sp, kind: 'c' }));
    const heroRound = left.length > 0;
    // the ground and the rocks of this very place: red desert sandstone, grey sea shale, cream limestone slabs,
    // volcanic ash, rusty ironstone... (js/digs.js)
    const DG = G.digGround(site.id), DGA = G.ATLAS['digbg_' + DG], CHIPS = DIGS.chips[DG], DUST = DIGS.dust[DG].join(',');
    G.spr('digbg_' + DG, sc, 0, 0, 1280, 720);
    G.h('div', 'full', sc, { background: 'radial-gradient(ellipse at 50% 50%,rgba(0,0,0,0) 50%,rgba(0,0,0,.42) 100%)' });
    UI.header('Раскопки · ' + site.name, heroRound ? 'Найди кости ' + sp.gen : 'Найди находки соседей', () => G.go('map', { open: true }));
    let nDone = 0, nRound = 0;
    const cnt = () => (heroRound ? `${ss.bones.length} / 6` : `${nDone} / ${nRound}`);
    const top = UI.topRight({ counter: ['bone', cnt()] });
    const corners = UI.corners({ museum: false });
    // a round: up to 3 herrerasaurus bones + 1 bone of a neighbour (they lived in the same valley);
    // once the herrerasaurus is complete — only the neighbours
    // a round: up to 3 bones of the animal + 1 find of a neighbour that lived at the same place
    const extra = cLeft.length && (!oLeft.length || Math.random() < 0.65) ? cLeft[0] : oLeft[0];
    const round = heroRound
      ? left.slice(0, 3).map((id) => ({ id, kind: 'h' })).concat(extra ? [extra] : [])
      : G.shuffle(cLeft.slice(0, 2).concat(oLeft.slice(0, 2))).slice(0, 3);
    nRound = round.length; top.counter.set(cnt());
    if (!round.length) {
      G.say(ss.assembled ? AU.alt(`Здесь всё найдено! Скелет ${sp.gen} стоит в музее.`, 'Здесь всё найдено! Скелет уже стоит в музее.') : 'Все кости найдены! Пора собирать скелет.');
      UI.mainBtn(G.ui, ss.assembled ? 'В музей' : 'Собрать скелет', ss.assembled ? 'museum' : 'puzzle', { cx: G.W / 2, t: G.H / 2 - 32 }, 340, () => G.go(ss.assembled ? 'museum' : 'assemble'));
      return;
    }
    const four = round.length > 3;
    const SLOTS = G.shuffle(four ? [[232, 338], [515, 452], [795, 318], [1062, 446]] : [[300, 330], [650, 432], [985, 316]]);
    // pieces under the dirt
    const pieces = round.map(({ id, kind, sp: sp2 }, i) => {
      const meta = kind === 'h' ? G.boneMeta(spId, id) : kind === 'c' ? G.boneMeta(sp2, id) : MAN.obones[id];
      const img = kind === 'h' ? G.boneImg(spId, id) : kind === 'c' ? G.boneImg(sp2, id) : 'obone_' + id;
      const s = Math.min((four ? 205 : 250) / Math.max(meta.w, meta.h), 1.35);
      const [cx, cy] = SLOTS[i], rot = G.rand(-22, 22) * DEG;
      const w = meta.w * s, h = meta.h * s;
      const wrap = G.h('div', 'abs', sc, { left: cx - w / 2, top: cy - h / 2, width: w, height: h, transform: `rotate(${rot}rad)` });
      const im = G.spr(img, wrap, 0, 0, w, h);
      im.style.filter = 'drop-shadow(0 3px 4px rgba(60,30,10,.55)) sepia(.25)';
      const c = Math.cos(rot), sn = Math.sin(rot);
      const pts = meta.pts.map(([px, py]) => {
        const lx = (px - meta.w / 2) * s, ly = (py - meta.h / 2) * s;
        return { x: cx + c * lx - sn * ly, y: cy + sn * lx + c * ly, v: 0 };
      });
      const tip = pts.reduce((a, b) => (Math.hypot(b.x - cx, b.y - cy) > Math.hypot(a.x - cx, a.y - cy) ? b : a), pts[0]);
      return { id, kind, sp: sp2, img, cx, cy, w, h, rot, wrap, im, pts, tip, found: false, rock: null, r: Math.max(w, h) / 2 };
    });
    // dirt canvas
    const dc = G.h('canvas', 'abs', sc, { left: 0, top: 0, width: 1280, height: 720 });
    dc.width = 640; dc.height = 360;
    const dx = dc.getContext('2d');
    const tex = document.createElement('canvas'); tex.width = 640; tex.height = 360;
    const tx = tex.getContext('2d');
    // loose soil over the bones: the same ground, a little darker, with crumbs of its own colours
    tx.drawImage(G.img[DGA[0]], DGA[1], DGA[2], DGA[3], DGA[4], 0, 0, 640, 360);
    tx.globalCompositeOperation = 'multiply'; tx.fillStyle = 'rgb(206,198,190)'; tx.fillRect(0, 0, 640, 360);
    tx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 1600; i++) { tx.globalAlpha = Math.random() < 0.5 ? 0.35 : 0.3; tx.fillStyle = Math.random() < 0.5 ? CHIPS[0] : `rgb(${DUST})`; const r = G.rand(0.5, 2.2); tx.fillRect(G.rand(0, 640), G.rand(0, 360), r, r); }
    tx.globalAlpha = 1;
    for (const p of pieces) {
      const rx = (Math.max(p.w, p.h) / 2 + 46) / 2, ry = (Math.min(p.w, p.h) / 2 + 58) / 2;
      const a1 = G.rand(0, 6), a2 = G.rand(0, 6);
      dx.save(); dx.translate(p.cx / 2, p.cy / 2); dx.rotate(p.w >= p.h ? p.rot : p.rot + Math.PI / 2);
      dx.beginPath();
      for (let k = 0; k <= 48; k++) {
        const t = (k / 48) * Math.PI * 2, rr = 1 + 0.1 * Math.sin(3 * t + a1) + 0.07 * Math.sin(5 * t + a2) + G.rand(-0.03, 0.03);
        const X = Math.cos(t) * rx * rr, Y = Math.sin(t) * ry * rr;
        k ? dx.lineTo(X, Y) : dx.moveTo(X, Y);
      }
      dx.closePath(); dx.fillStyle = '#000'; dx.fill(); dx.restore();
    }
    dx.globalCompositeOperation = 'source-in'; dx.drawImage(tex, 0, 0);
    dx.globalCompositeOperation = 'source-atop';
    // each pile: lit from the top left, its edge darker in the ground's own dark tone (only inside the pile's circle:
    // a gradient keeps its last colour outside, and four of them painted over the whole canvas turned every pile brown)
    const RIM = CHIPS[0].match(/\w\w/g).map((h) => parseInt(h, 16)).join(',');
    for (const p of pieces) {
      const R = p.r / 2 + 40, g = dx.createRadialGradient(p.cx / 2 - 20, p.cy / 2 - 24, 4, p.cx / 2, p.cy / 2, R);
      g.addColorStop(0, 'rgba(255,248,235,.17)'); g.addColorStop(0.6, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(${RIM},.45)`);
      dx.fillStyle = g; dx.beginPath(); dx.arc(p.cx / 2, p.cy / 2, R, 0, Math.PI * 2); dx.fill();
    }
    dx.globalCompositeOperation = 'destination-out';
    const erase = (x0, y0, x1, y1, r, a) => {
      dx.strokeStyle = `rgba(0,0,0,${a})`; dx.lineWidth = r; dx.lineCap = 'round';
      dx.beginPath(); dx.moveTo(x0 / 2, y0 / 2); dx.lineTo(x1 / 2 + 0.01, y1 / 2); dx.stroke();
    };
    // hit layer for brushing
    const hit = G.h('div', 'hit pe', sc);
    // rocks
    const rockKeys = G.shuffle([0, 1, 2, 3, 4, 5].map((k) => `rock_${DG}_${k}`));
    pieces.forEach((p, i) => {
      const key = rockKeys[i], ra = G.ATLAS[key], m = { w: ra[3], h: ra[4] }, s = (four ? 205 : 225) / Math.max(m.w, m.h), w = m.w * s, h = m.h * s;
      const el = G.h('div', 'abs pe', sc, { left: p.cx - w / 2, top: p.cy - h / 2 - 6, width: w, height: h, cursor: 'pointer' });
      G.spr(key, el, 0, 0, w, h).style.filter = 'drop-shadow(0 10px 10px rgba(0,0,0,.45))';
      const cr = G.h('div', 'abs', el, { left: 0, top: 0, width: w, height: h }, `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="position:absolute;left:0;top:0"></svg>`);
      p.rock = { el, key, w, h, hp: 3, svg: cr.firstChild };
      el.addEventListener('pointerdown', (e) => { e.stopPropagation(); AU.unlock(); hitRock(p); });
    });
    const S = { brushing: false, last: null, firstBrush: true, hints: [], done: 0 };
    G.dbg = { S, pieces };
    const hint = (x, y, kind) => { for (const hh of S.hints) hh.remove(); S.hints = [UI.hand(sc, x, y, kind)]; };
    const clearHints = () => { for (const hh of S.hints) hh.remove(); S.hints = []; };
    hint(pieces[0].cx, pieces[0].cy);
    G.say(!heroRound ? 'Здесь жили и другие животные. Найди их следы!' : ss.bones.length ? 'Разбей камни и очисть новые кости!' : 'Под камнями спрятаны кости. Стучи по камню, чтобы его разбить!');

    function crackLine(r, p) {
      const { w, h } = r; let x = w / 2 + G.rand(-w * 0.15, w * 0.15), y = h / 2 + G.rand(-h * 0.15, h * 0.15);
      const a = G.rand(0, Math.PI * 2); let d = '';
      for (const dir of [1, -1]) {
        let X = x, Y = y; d += `M${X.toFixed(1)} ${Y.toFixed(1)}`;
        for (let k = 0; k < 5; k++) { const aa = a + (dir < 0 ? Math.PI : 0) + G.rand(-0.6, 0.6); X += Math.cos(aa) * w * 0.09; Y += Math.sin(aa) * h * 0.09; d += ` L${X.toFixed(1)} ${Y.toFixed(1)}`; }
      }
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d); path.setAttribute('fill', 'none'); path.setAttribute('stroke', 'rgba(30,18,8,.85)'); path.setAttribute('stroke-width', '3'); path.setAttribute('stroke-linejoin', 'round');
      r.svg.appendChild(path);
      const p2 = path.cloneNode(); p2.setAttribute('stroke', 'rgba(255,240,215,.35)'); p2.setAttribute('stroke-width', '1.2'); p2.setAttribute('transform', 'translate(1.2,1.2)'); r.svg.appendChild(p2);
    }
    function hitRock(p) {
      const r = p.rock; if (!r || r.hp <= 0) return;
      r.hp--; AU.play('hit');
      r.el.classList.remove('shake'); void r.el.offsetWidth; r.el.classList.add('shake');
      G.fx.burst(p.cx, p.cy - 10, 8, { type: 'chip', color: CHIPS, s0: 120, s1: 320, a0: Math.PI * 1.05, a1: Math.PI * 1.95, g: 900, z0: 4, z1: 9, l0: 0.5, l1: 0.9 });
      if (r.hp > 0) { crackLine(r, p); crackLine(r, p); return; }
      breakRock(p);
    }
    function breakRock(p) {
      const r = p.rock; AU.play('break'); clearHints();
      const N = 7, cx = r.w / 2, cy = r.h / 2, base = G.rand(0, 6);
      const L = parseFloat(r.el.style.left), T = parseFloat(r.el.style.top);
      for (let k = 0; k < N; k++) {
        const a0 = base + (k / N) * Math.PI * 2, a1 = base + ((k + 1) / N) * Math.PI * 2;
        const poly = [[cx, cy]];
        for (let q = 0; q <= 3; q++) { const a = a0 + ((a1 - a0) * q) / 3; poly.push([cx + Math.cos(a) * r.w, cy + Math.sin(a) * r.h]); }
        const sh = G.h('div', 'abs', sc, { left: L, top: T, width: r.w, height: r.h, pointerEvents: 'none', clipPath: `polygon(${poly.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',')})` });
        G.spr(r.key, sh, 0, 0, r.w, r.h);
        const am = (a0 + a1) / 2, sp = G.rand(140, 260), vx = Math.cos(am) * sp, vy0 = Math.sin(am) * sp - 220, spin = G.rand(-260, 260);
        G.tween(0.9, (e, raw) => {
          const t = raw * 0.9;
          sh.style.transform = `translate(${vx * t}px,${vy0 * t + 700 * t * t}px) rotate(${spin * t}deg)`;
          sh.style.opacity = 1 - Math.max(0, (raw - 0.55) / 0.45);
        }, G.ease.lin).then(() => sh.remove());
      }
      G.fx.dust(p.cx, p.cy + 10, 16, `rgba(${DUST},`);
      r.el.remove(); p.rock = null;
      // expose the tip of the bone a little
      erase(p.tip.x, p.tip.y, p.tip.x + 1, p.tip.y, 26, 1);
      if (S.firstBrush) {
        hint(p.cx, p.cy, 'swipe');
        G.say('Теперь води пальцем по земле — кисточкой очистим кость!');
      }
    }
    const brushEl = G.h('div', 'abs', sc, { width: 64, height: 64, marginLeft: '-12px', marginTop: '-52px', display: 'none', color: '#fff', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.6))', pointerEvents: 'none' }, icon('brush', ' style="width:64px;height:64px"'));
    const BR = 44;
    const insideRock = (x, y) => pieces.some((p) => p.rock && Math.hypot(x - p.cx, y - p.cy) < p.rock.w * 0.42);
    function brushTo(pt) {
      if (S.last && !insideRock(pt.x, pt.y)) {
        const d = Math.hypot(pt.x - S.last.x, pt.y - S.last.y);
        if (d > 0.5) {
          erase(S.last.x, S.last.y, pt.x, pt.y, BR, 0.32);
          AU.brush(Math.min(1, d / 18));
          if (Math.random() < 0.45) G.fx.emit({ type: 'puff', x: pt.x + G.rand(-14, 14), y: pt.y + G.rand(-8, 8), vx: G.rand(-40, 40), vy: G.rand(-70, -20), g: 40, life: 0.6, size: G.rand(8, 14), color: `rgba(${DUST},`, drag: 2 });
          for (const p of pieces) {
            if (p.found) continue;
            let changed = false;
            for (const q of p.pts) {
              if (q.v >= 1) continue;
              const ex = pt.x - S.last.x, ey = pt.y - S.last.y, L2 = ex * ex + ey * ey;
              const t = L2 ? G.clamp(((q.x - S.last.x) * ex + (q.y - S.last.y) * ey) / L2, 0, 1) : 0;
              if (Math.hypot(S.last.x + t * ex - q.x, S.last.y + t * ey - q.y) < BR * 0.85) { q.v += 0.34; changed = true; }
            }
            if (changed && !p.rock && p.pts.filter((q) => q.v >= 1).length / p.pts.length > 0.55) reveal(p);
          }
          if (S.firstBrush) { S.firstBrush = false; clearHints(); }
        }
      }
      S.last = pt;
      brushEl.style.left = pt.x + 'px'; brushEl.style.top = pt.y + 'px';
    }
    G.on(sc, 'pointerdown', (e) => { AU.unlock(); S.brushing = true; S.pid = e.pointerId; S.last = null; brushEl.style.display = ''; brushTo(G.bgPt(e)); });
    G.on(window, 'pointermove', (e) => { if (S.brushing && e.pointerId === S.pid) brushTo(G.bgPt(e)); });
    const up = (e) => { if (e.pointerId !== S.pid) return; S.brushing = false; S.last = null; brushEl.style.display = 'none'; AU.brush(0); };
    G.on(window, 'pointerup', up); G.on(window, 'pointercancel', up);

    async function reveal(p) {
      p.found = true; AU.play('found');
      // wipe the rest of the dirt over this bone
      G.tween(0.6, (e) => {
        const g = dx.createRadialGradient(p.cx / 2, p.cy / 2, 0, p.cx / 2, p.cy / 2, (p.r + 70) / 2);
        g.addColorStop(0, `rgba(0,0,0,${0.35 * e + 0.1})`); g.addColorStop(0.85, `rgba(0,0,0,${0.3 * e + 0.08})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        dx.fillStyle = g; dx.fillRect(0, 0, 640, 360);
      }, G.ease.lin).then(() => { dx.beginPath(); dx.arc(p.cx / 2, p.cy / 2, (p.r + 64) / 2, 0, 6.283); dx.fillStyle = '#000'; dx.fill(); });
      G.fx.sparkle(p.cx, p.cy, 22);
      p.im.style.transition = 'filter .4s';
      let od = p.kind === 'o' ? DATA.others.find((o) => o.id === p.id) : null;
      if (p.kind === 'c') {
        const q = DATA.species[p.sp], bn = q.bones.find((b) => b.id === p.id).name;
        od = { sp: q.sil, name: bn[0].toUpperCase() + bn.slice(1) + ' ' + q.gen,
          say: AU.alt(`Это не ${sp.name.toLowerCase()}! Это ${bn} ${q.gen}. ${q.name} ${G.fm('тоже жил', 'тоже жила', q)} здесь — кость отправится в мешочек.`,
            `Это кость ${q.gen}! ${q.name} ${G.fm('тоже жил', 'тоже жила', q)} здесь — кость отправится в мешочек.`) };
      }
      if (od) {
        p.im.style.filter = 'drop-shadow(0 0 12px rgba(150,214,255,.95)) drop-shadow(0 0 3px #fff)';
        const tag = G.h('div', 'plate abs', sc, { left: p.cx - 110, top: p.cy - p.h / 2 - 64, width: 220, padding: '8px 12px', textAlign: 'center', font: '600 17px/1.2 Oswald,sans-serif', opacity: 0, transition: 'opacity .3s', pointerEvents: 'none' },
          `${od.sp ? silSvg(od.sp, '#BFE3FF', ' style="width:72px;height:30px;display:block;margin:0 auto 2px"') : ''}${od.name}`);
        requestAnimationFrame(() => { tag.style.opacity = 1; });
        G.say(od.say);
        await G.wait(2.6);
        tag.style.opacity = 0; setTimeout(() => tag.remove(), 400);
      } else {
        p.im.style.filter = 'drop-shadow(0 0 12px rgba(255,214,120,.95)) drop-shadow(0 0 3px #fff)';
        const name = sp.bones.find((b) => b.id === p.id).name;
        G.say(AU.alt(`Ура! Ты нашёл ${name} ${sp.gen}!`, `Ура! Ты нашёл ${name}!`));
        await G.wait(1.0);
      }
      if (!G.alive(tok)) return;
      // fly into the bag
      const fl = G.spr(p.img, null, 0, 0, p.w, p.h);
      p.wrap.style.visibility = 'hidden';
      AU.play('whoosh');
      await UI.flyTo(fl, { x: p.cx, y: p.cy }, G.uiCenter(corners.bag), 0.75);
      if (!G.alive(tok)) return;
      const list = p.kind === 'h' ? ss.bones : p.kind === 'c' ? G.spState(p.sp).bones : st.others;
      if (!list.includes(p.id)) list.push(p.id);
      G.save();
      corners.bag.setCount(UI.bagCount());
      corners.bag.classList.remove('shake'); void corners.bag.offsetWidth; corners.bag.classList.add('shake');
      nDone++; top.counter.set(cnt());
      AU.play('pop');
      S.done++;
      if (S.done >= pieces.length) roundDone();
    }
    function roundDone() {
      const rest = ss.assembled ? 0 : 6 - ss.bones.length, oRest = G.othersLeft().length + G.coBones(spId).length;
      const kost = (n) => (n === 1 ? 'одну кость' : n + (n < 5 ? ' кости' : ' костей'));
      AU.play('win');
      if (heroRound && rest > 0) {
        G.say(AU.alt(`Отлично! Осталось найти ещё ${kost(rest)} ${sp.gen}.`, `Отлично! Осталось найти ещё ${kost(rest)}.`));
        UI.mainBtn(G.ui, 'Копать дальше', 'pick', { cx: G.W / 2, t: G.H / 2 - 32 }, 360, () => G.go('dig')).classList.add('pulse');
      } else if (!ss.assembled) {
        G.say(AU.alt(`Все кости ${sp.gen} найдены! Пора собирать скелет.`, 'Все кости найдены! Пора собирать скелет.'));
        UI.mainBtn(G.ui, 'Собрать скелет', 'puzzle', { cx: G.W / 2, t: G.H / 2 - 32 }, 380, () => G.go('assemble')).classList.add('pulse');
      } else if (oRest > 0) {
        G.say(`Отлично! В земле ждут ещё находки соседей: ${oRest}.`);
        UI.mainBtn(G.ui, 'Копать дальше', 'pick', { cx: G.W / 2, t: G.H / 2 - 32 }, 360, () => G.go('dig')).classList.add('pulse');
      } else {
        G.say('Все находки соседей в мешочке!');
        UI.mainBtn(G.ui, 'В музей', 'museum', { cx: G.W / 2, t: G.H / 2 - 32 }, 320, () => G.go('museum')).classList.add('pulse');
      }
    }
  },
};

/* ------------------------------------------------------------------ assemble the skeleton */
Scenes.assemble = {
  enter() {
    const st = G.state, sc = G.scene$, tok = G.token, sp = G.SP(), ss = G.S(), spId = sp.id;
    if (ss.bones.length < 6 && !ss.assembled) { ss.bones = sp.bones.map((b) => b.id); G.save(); }
    const bgi = G.bgImg('bg_hall');
    bgi.style.filter = 'blur(7px) brightness(.42)'; bgi.style.transform = 'scale(1.06)';
    UI.header('Собери скелет', sp.name + ' · 0 из 6', () => G.go('map', { open: true }));
    UI.topRight();
    const hdr = G.ui.querySelector('.t-sub');
    // the screen edges in scene units: the tray sits just above the hint line, the skeleton stands right on the tray, clear of the header
    const toScene = (wy) => (wy - G.bgy) / G.sbg;
    UI.narrBottom = 8;
    const TB = Math.min(668, toScene(G.H - 56)), TT = TB - 74, HB = toScene(112);
    const SK = G.skel(spId), s = Math.min(Math.min(1000, G.vis.x1 - G.vis.x0 - 90) / SK.w, Math.min(400, TT - 10 - HB) / SK.h), sOld = Math.min(900 / SK.w, 368 / SK.h);
    const X0 = Math.round(640 - (SK.w * s) / 2), Y0 = Math.round(TT - 10 - SK.h * s);
    const ghost = G.spr(G.ghostImg(spId), sc, X0, Y0, SK.w * s, SK.h * s);
    ghost.style.opacity = '.16';
    const tray = G.h('div', 'abs', sc, { left: 190, top: TT, width: 900, height: TB - TT, borderRadius: '10px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)' });
    const order = G.shuffle(sp.bones.map((b) => b.id));
    const pieces = order.map((id, i) => {
      const m = G.boneMeta(spId, id), w = m.w * s, h = m.h * s;
      const tx = X0 + (m.x - SK.x) * s + w / 2, ty = Y0 + (m.y - SK.y) * s + h / 2;
      const hx = 190 + 75 + i * 150, hy = (TT + TB) / 2, ks = Math.min(1, 124 / w, 58 / h);
      const el = G.spr(G.boneImg(spId, id), sc, 0, 0, w, h, 'pe');
      el.style.cursor = 'grab'; el.style.filter = 'drop-shadow(0 4px 6px rgba(0,0,0,.6))';
      const p = { id, el, w, h, tx, ty, hx, hy, ks, x: hx, y: hy, k: ks, placed: false };
      setPos(p);
      el.addEventListener('pointerdown', (e) => grab(p, e));
      return p;
    });
    function setPos(p) { p.el.style.left = p.x - p.w / 2 + 'px'; p.el.style.top = p.y - p.h / 2 + 'px'; p.el.style.transform = `scale(${p.k})`; }
    let drag = null, placed = 0;
    G.dbg = { pieces };
    const handEl = UI.hand(sc, pieces[0].hx, pieces[0].hy, 'swipe');
    G.say('Перетащи кости на тень скелета. Начни с любой!');
    function grab(p, e) {
      if (p.placed || drag) return;
      e.stopPropagation(); AU.unlock(); AU.play('pop');
      handEl.style.display = 'none';
      drag = { p, pid: e.pointerId };
      p.el.style.zIndex = 5; p.el.style.cursor = 'grabbing';
      const k0 = p.k, pt = G.bgPt(e), x0 = p.x, y0 = p.y;
      p.x = pt.x; p.y = pt.y - 26;
      G.tween(0.18, (q) => { p.k = G.lerp(k0, 1, q); setPos(p); });
      void x0; void y0;
    }
    G.on(window, 'pointermove', (e) => {
      if (!drag || e.pointerId !== drag.pid) return;
      const pt = G.bgPt(e), p = drag.p;
      p.x = pt.x; p.y = pt.y - 26; setPos(p);
    });
    const drop = async (e) => {
      if (!drag || e.pointerId !== drag.pid) return;
      const p = drag.p; drag = null;
      p.el.style.zIndex = ''; p.el.style.cursor = 'grab';
      const d = Math.hypot(p.x - p.tx, p.y - p.ty);
      if (d < 85) {
        p.placed = true; p.el.style.pointerEvents = 'none';
        const x0 = p.x, y0 = p.y;
        await G.tween(0.18, (q) => { p.x = G.lerp(x0, p.tx, q); p.y = G.lerp(y0, p.ty, q); p.k = 1; setPos(p); });
        AU.play('snap'); G.fx.sparkle(p.tx, p.ty, 10);
        p.el.style.filter = 'drop-shadow(0 0 6px rgba(255,214,120,.8))';
        placed++; hdr.textContent = `${sp.name} · ${placed} из 6`;
        if (placed === 6) done();
        else if (placed === 1) G.say('Верно! Продолжай.');
      } else {
        AU.play('miss');
        const x0 = p.x, y0 = p.y, k0 = p.k;
        G.tween(0.3, (q) => { p.x = G.lerp(x0, p.hx, q); p.y = G.lerp(y0, p.hy, q); p.k = G.lerp(k0, p.ks, q); setPos(p); });
        if (d < 250) G.once('near', 'Почти! Найди, где эта кость на тени.');
      }
    };
    G.on(window, 'pointerup', drop); G.on(window, 'pointercancel', drop);
    async function done() {
      AU.play('win'); G.fx.sparkle(640, 300, 40);
      G.say('Скелет собран! Смотри, что сейчас будет…');
      await G.wait(1.3); if (!G.alive(tok)) return;
      tray.style.transition = 'opacity .5s'; tray.style.opacity = 0;
      GL.attach();
      let hero, acts, poseFn;
      if (spId === 'herrera') {
        hero = GL.sprite('hero', GL.RIGS.hero(), { x: 640, y: Y0 + 196 * (s / sOld), s: 0.62 * (s / sOld), ax: 749.5, ay: 293, alpha: 0, z: 1 });
        acts = [{ type: 'roar', t0: 0.5, dur: 2.6, k: 1 }]; poseFn = Pose.hero; AU.voiceOf(spId);
      } else {
        const M = sp.model(), im = MAN[M.key], k = (SK.w * s * 0.98) / im.w;
        hero = GL.sprite(M.key, M.rig(), { x: X0 + (SK.w * s) / 2, y: Y0 + (SK.h * s) / 2, s: k, ax: im.w / 2, ay: im.h / 2, alpha: 0, z: 1 });
        acts = [{ type: M.tap, t0: 0.5, dur: 1.8, k: 1 }]; poseFn = M.pose; AU.voiceOf(spId);
      }
      UI.flash(G.ui, 0.9, 0.9);
      let t = 0; const y0 = hero.y;
      G.tick((dt) => { t += dt; const ps = poseFn(t, acts, [2.2, 5.0]); hero.mesh.deform(ps); hero.blink = ps.blink || 0; hero.y = y0 + (ps.yOff || 0) * hero.s; });
      await G.tween(0.9, (e) => {
        hero.alpha = e; ghost.style.opacity = 0.16 * (1 - e);
        for (const p of pieces) p.el.style.opacity = 1 - e;
      });
      ss.assembled = true; ss.facts[sp.firstFact] = true; G.save();
      G.say(sp.revealSay);
      await G.wait(1.6); if (!G.alive(tok)) return;
      UI.mainBtn(G.ui, 'В музей', 'museum', { cx: G.W / 2, b: 100 }, 320, () => G.go('museum', { zoom: true })).classList.add('pulse');
    }
  },
};
