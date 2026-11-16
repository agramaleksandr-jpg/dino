'use strict';
/* ==================================================================== UI components (world coordinates, #ui layer) */
const UI = (window.UI = { narrEl: null, narrArea: null });

UI.anchor = (el, a) => {
  if (!a) return el;
  const s = el.style;
  if (a.l !== undefined) s.left = a.l + 'px';
  if (a.r !== undefined) s.right = a.r + 'px';
  if (a.t !== undefined) s.top = a.t + 'px';
  if (a.b !== undefined) s.bottom = a.b + 'px';
  if (a.cx !== undefined) {
    const w = parseFloat(s.width);
    if (w) s.left = a.cx - w / 2 + 'px';
    else { s.left = a.cx + 'px'; s.transform = 'translateX(-50%)'; }
  }
  return el;
};
UI.tap = (el, fn, snd) => {
  el.addEventListener('click', (e) => { e.stopPropagation(); AU.unlock(); if (snd !== false) AU.play('click'); fn(e); });
  return el;
};
UI.iconBtn = (parent, ic, a, fn, extraCls) => {
  const b = G.h('button', 'plate ibtn pe ' + (extraCls || ''), parent);
  b.innerHTML = icon(ic);
  UI.anchor(b, a);
  return UI.tap(b, fn);
};
UI.mainBtn = (parent, text, ic, a, w, fn) => {
  const b = G.h('button', 'mbtn pe', parent, { width: w });
  b.innerHTML = `<i></i>${ic ? icon(ic) : ''}<span>${text}</span>`;
  UI.anchor(b, a);
  return UI.tap(b, fn);
};
UI.secBtn = (parent, text, ic, a, w, fn) => {
  const b = G.h('button', 'plate sbtn pe', parent, { width: w });
  b.innerHTML = `${ic ? icon(ic) : ''}<span>${text}</span>`;
  UI.anchor(b, a);
  return UI.tap(b, fn);
};
UI.header = (title, sub, back, backIcon) => {
  if (back) UI.iconBtn(G.ui, backIcon || 'left', { l: 32, t: 28 }, back, 'hdr-back');
  const h = G.h('div', 'abs', G.ui, { left: back ? 104 : 32, top: 30 });
  h.innerHTML = `<div class="t-title">${title}</div><div class="t-sub">${sub || ''}</div>`;
  h.setSub = (t) => { h.querySelector('.t-sub').textContent = t; };
  return h;
};
/** the phone's Back button (Android app): close the open window, else press the screen's own back arrow */
G.androidBack = () => {
  const m = [...G.ui.querySelectorAll('.modal')].pop(), x = m && m.querySelector('.ibtn');
  if (x) { x.click(); return 1; }
  const f = G.ui.querySelector('[data-back]');   // a card that closes before the screen goes back
  if (f) { f.click(); return 1; }
  const b = G.ui.querySelector('.hdr-back');
  if (b && !G.switching) { b.click(); return 1; }
  return b ? 1 : 0;
};
UI.counter = (parent, ic, text) => {
  const c = G.h('div', 'plate chip', parent, { position: 'relative' });
  c.innerHTML = icon(ic) + `<span>${text}</span>`;
  c.set = (t) => { c.querySelector('span').textContent = t; };
  return c;
};
/** sound toggle + parent/test menu, optional counter chip and extra buttons on the left */
UI.topRight = (opts) => {
  opts = opts || {};
  const row = G.h('div', 'abs row', G.ui, { right: 32, top: 28, gap: '8px' });
  const out = { row };
  if (opts.counter) out.counter = UI.counter(row, opts.counter[0], opts.counter[1]);
  for (const e of opts.extra || []) row.appendChild(e);
  const snd = UI.iconBtn(row, G.state.settings.sfx ? 'sound' : 'soundOff', null, () => {
    const on = !G.state.settings.sfx;
    G.state.settings.sfx = on; G.state.settings.voice = on; G.state.settings.music = on; G.save();
    snd.innerHTML = icon(on ? 'sound' : 'soundOff');
    if (!on) AU.hush();
    AU.unlock(); AU.music(AU.musWant);
  });
  snd.style.position = 'relative';
  if (opts.settings !== false) { const st = UI.iconBtn(row, 'settings', null, () => Test.open()); st.style.position = 'relative'; }
  return out;
};

/* ---------------- narrator */
/** the chapters, where the child plays as the animal: the narrator only speaks, no subtitle plate over the game */
UI.QUIET = new Set(['ch1', 'ch2', 'ch3', 'ch4', 'hunt', 'feed', 'mud', 'flap', 'fishing', 'birth', 'swim', 'seek', 'escape', 'guard',
  'chase', 'sneak', 'glide', 'ambush', 'defend']);
UI.narr = (text, opts) => {
  if (UI.QUIET.has(G.sceneName)) {
    if (UI.narrEl) { UI.narrEl.remove(); UI.narrEl = null; }
    if (!(opts && opts.silent)) AU.say(text);
    return;
  }
  let n = UI.narrEl;
  if (!n || !n.isConnected) {
    n = UI.narrEl = G.h('div', 'plate narr pe', G.ui);
    n.innerHTML = `<button class="say">${icon('sound', ' style="color:#2A1E05"')}</button><span></span>`;
    n.querySelector('.say').addEventListener('click', (e) => { e.stopPropagation(); AU.unlock(); AU.say(n.dataset.t); });
  }
  n.dataset.t = text;
  n.querySelector('span').textContent = text;
  n.style.opacity = text ? 1 : 0;
  UI.narrPos();
  if (!(opts && opts.silent)) AU.say(text);
};
UI.narrPos = () => {
  const n = UI.narrEl; if (!n) return;
  const a = UI.narrArea || { x0: 0, x1: G.W };
  n.style.maxWidth = Math.min(780, a.x1 - a.x0 - (UI.narrArea ? 32 : 300)) + 'px';
  n.style.left = Math.round((a.x0 + a.x1) / 2 - n.offsetWidth / 2) + 'px';
  n.style.top = Math.round(G.H - (UI.narrBottom || 24) - n.offsetHeight) + 'px';
};
UI.narrSpeaking = (on) => { if (UI.narrEl) UI.narrEl.classList.toggle('speaking', !!on); if (window.AU && AU.duck) AU.duck(!!on); };
G.say = (t, o) => UI.narr(t, o);
/** a hint for a situation that comes again and again in a game (caught, too early, fell…): the narrator says it
    the first time only, until the child leaves this game — one hint per situation */
G.saidOnce = new Set();
G.once = (key, t, o) => { if (G.saidOnce.has(key)) return; G.saidOnce.add(key); G.say(t, o); };
/** map, museum, chapter path, hunt menu: a hint for a situation is said once since the app was opened */
G.saidApp = new Set();
G.firstApp = (key) => { if (G.saidApp.has(key)) return false; G.saidApp.add(key); return true; };
G.onceApp = (key, t, o) => { if (G.firstApp(key)) G.say(t, o); };

/* ---------------- misc */
UI.toast = (text, dur) => {
  const t = G.h('div', 'plate toast', G.ui);
  t.textContent = text;
  setTimeout(() => { t.style.opacity = 0; setTimeout(() => t.remove(), 400); }, (dur || 2.2) * 1000);
};
/* a new version of the game was downloaded by the app (MainActivity): it switches on at the next start */
G.updateReady = (v) => { G.updReady = v; UI.toast(`Скачано обновление ${v} — включится при следующем запуске`, 4.5); };
UI.steps = (n, size, gap) => `<div class="steps" style="gap:${gap === undefined ? 4 : gap}px">${[0, 1, 2]
  .map((i) => `<svg viewBox="0 0 24 24" style="width:${size || 28}px;height:${size || 28}px;color:${i < n ? '#F2B640' : 'rgba(255,255,255,.28)'}">${ICONS.foot}</svg>`).join('')}</div>`;
UI.modal = (w, h) => {
  const back = G.h('div', 'mback', G.ui);
  const box = G.h('div', 'plate modal pe', G.ui, { width: w, height: h });
  const s = Math.min(1, (G.H - 24) / h, (G.W - 24) / w);
  box.style.left = (G.W - w) / 2 + 'px';
  box.style.top = (G.H - h) / 2 + 'px';
  if (s < 1) box.style.transform = `scale(${s})`;
  box.addEventListener('click', (e) => e.stopPropagation());
  return { back, box, close: () => { back.remove(); box.remove(); } };
};
UI.card = (parent, part, text, x, y, w) => {
  const c = G.h('div', 'plate fcard pe', parent, { left: x, top: y, width: w || 360 });
  c.innerHTML = `<div class="hd"><b>${part}</b><button class="ls">${icon('sound', ' style="color:#2A1E05"')}</button></div><div class="t-body">${text}</div>`;
  c.querySelector('.ls').addEventListener('click', (e) => { e.stopPropagation(); AU.say(AU.alt(part + '. ' + text, text)); });
  return c;
};
UI.hand = (parent, x, y, kind) => {
  const h = G.h('div', 'hand ' + (kind || 'tap'), parent, { left: x, top: y });
  h.innerHTML = `<i></i>${icon('finger', ' class="f" style="color:#fff"')}`;
  return h;
};
UI.dot = (parent, x, y, cls) => {
  const d = G.h('div', 'dot ' + (cls || ''), parent, { left: x, top: y });
  d.innerHTML = '<i class="g"></i><i class="r"></i><i class="c"></i>';
  return d;
};
UI.flash = (parent, dur, peak) => {
  const f = G.h('div', 'flash', parent || G.ui);
  return G.tween(dur || 0.5, (e, r) => { f.style.opacity = (peak || 0.85) * (r < 0.2 ? r / 0.2 : 1 - (r - 0.2) / 0.8); }, G.ease.lin).then(() => f.remove());
};
UI.popText = (parent, text, x, y, color, size) => {
  const p = G.h('div', 'pop', parent, { left: x, top: y, color: color || '#fff' });
  if (size) p.style.fontSize = size + 'px';
  p.textContent = text;
  G.tween(1.0, (e) => {
    p.style.transform = `translate(-50%,${-50 - 60 * e}%) scale(${0.7 + 0.4 * Math.min(1, e * 4)})`;
    p.style.opacity = 1 - Math.max(0, (e - 0.6) / 0.4);
  }, G.ease.out).then(() => p.remove());
};
/** things in the bag: herrerasaurus bones until the skeleton is built + neighbours' bones */
UI.bagCount = () => {
  const site = G.SP().site;
  let n = DATA.others.filter((o) => o.site === site && G.state.others.includes(o.id)).length;
  for (const q of Object.values(DATA.species)) if (q.site === site) { const s = G.spState(q.id); if (!s.assembled) n += s.bones.length; }
  return n;
};
/** bag (bottom-left) and museum (bottom-right) card buttons */
UI.corners = (o) => {
  o = o || {};
  const out = {};
  if (o.bag !== false) {
    const b = (out.bag = G.h('button', 'plate cbtn pe', G.ui, { left: 32, bottom: 26 }));
    const n = UI.bagCount();
    b.innerHTML = `<img src="${G.img.btn_bag.src}"><b>Мешочек</b><span class="badge" style="right:-2px;top:6px;${n ? '' : 'display:none'}">${n}</span>`;
    b.setCount = (k) => { const s = b.querySelector('.badge'); s.textContent = k; s.style.display = k ? '' : 'none'; };
    UI.tap(b, () => Bag.open());
  }
  if (o.museum !== false) {
    const m = (out.museum = G.h('button', 'plate cbtn pe', G.ui, { right: 32, bottom: 26 }));
    const na = G.assembledCount();
    m.innerHTML = `<img src="${G.img.btn_museum.src}"><b>Музей</b><span class="badge" style="right:-2px;top:6px;${na ? '' : 'display:none'}">${na}</span>`;
    UI.tap(m, () => G.go('museum'));
  }
  return out;
};
/** fly a DOM element from bg-space point to a world-space target, scaled down */
UI.flyTo = async (el, fromBg, toWorld, dur) => {
  const p0 = G.bgToWorld(fromBg.x, fromBg.y);
  G.ui.appendChild(el);
  el.style.position = 'absolute'; el.style.zIndex = 35; el.style.pointerEvents = 'none';
  const w = parseFloat(el.style.width) * G.sbg, h = parseFloat(el.style.height) * G.sbg;
  el.style.width = w + 'px'; el.style.height = h + 'px';
  const mid = { x: (p0.x + toWorld.x) / 2, y: Math.min(p0.y, toWorld.y) - 160 };
  await G.tween(dur || 0.8, (e) => {
    const u = 1 - e, x = u * u * p0.x + 2 * u * e * mid.x + e * e * toWorld.x, y = u * u * p0.y + 2 * u * e * mid.y + e * e * toWorld.y;
    const s = 1 - 0.82 * e;
    el.style.left = x - w / 2 + 'px'; el.style.top = y - h / 2 + 'px';
    el.style.transform = `scale(${s}) rotate(${e * 200}deg)`;
  }, G.ease.inOut);
  el.remove();
};

/* ==================================================================== bag overlay */
const Bag = (window.Bag = {
  open() {
    const st = G.state, sp = G.SP(), ss = G.S(), m = UI.modal(760, 588);
    const have = new Set(ss.bones);
    m.box.innerHTML = `
      <div class="abs t-label" style="left:32px;top:28px">Мешочек</div>
      <div class="abs t-h" style="left:32px;top:50px;font-size:30px">Кости ${sp.gen}</div>
      <div class="abs t-sub" style="left:32px;top:92px">${ss.assembled ? 'Скелет уже собран и стоит в музее' : `Найдено ${ss.bones.length} из 6`}</div>`;
    UI.iconBtn(m.box, 'close', { r: 20, t: 20 }, () => m.close());
    sp.bones.forEach((b, i) => {
      const x = 32 + i * 118, y = 130, got = have.has(b.id) || ss.assembled;
      const cell = G.h('div', 'abs', m.box, { left: x, top: y, width: 106, height: 130, borderRadius: '8px', background: got ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.03)' });
      const meta = G.boneMeta(sp.id, b.id), k = Math.min(90 / meta.w, 80 / meta.h);
      const im = G.spr(G.boneImg(sp.id, b.id), cell, 53 - (meta.w * k) / 2, 48 - (meta.h * k) / 2, meta.w * k, meta.h * k);
      if (!got) im.style.filter = 'brightness(0) opacity(.45)';
      G.h('div', 'abs', cell, { left: 0, right: 0, bottom: 10, textAlign: 'center', font: '500 13px/1.2 Rubik,sans-serif', opacity: got ? 1 : 0.55 }, got ? b.name[0].toUpperCase() + b.name.slice(1) : '?');
    });
    // neighbours: animals of the same dig site + single bones of other animals of the place
    const oHave = new Set(st.others), oList = DATA.others.filter((o) => o.site === sp.site);
    const co = Object.values(DATA.species).filter((q) => q.site === sp.site && q.id !== sp.id);
    G.h('div', 'abs t-h', m.box, { left: 32, top: 282, fontSize: '22px' }, 'Находки соседей');
    G.h('div', 'abs t-sub', m.box, { left: 32, top: 314 }, co.length ? `Здесь жили и другие животные — их кости тоже попадаются` : `Здесь найдено ${oList.filter((o) => oHave.has(o.id)).length} из ${oList.length}`);
    co.forEach((q, i) => {
      const qs = G.spState(q.id), nq = qs.assembled ? 6 : qs.bones.length, x = 32 + i * 141, y = 346;
      const cell = G.h('div', 'abs pe', m.box, { left: x, top: y, width: 129, height: 124, borderRadius: '8px', background: nq ? 'rgba(242,182,64,.1)' : 'rgba(255,255,255,.03)', cursor: 'pointer' });
      G.h('div', 'abs', cell, { left: 12, top: 10, width: 105, height: 58 }, silSvg(q.sil, nq ? '#F2B640' : 'rgba(255,255,255,.3)', ' style="width:105px;height:58px"'));
      G.h('div', 'abs', cell, { left: 4, right: 4, bottom: 8, textAlign: 'center', font: '500 13px/1.2 Rubik,sans-serif', opacity: nq ? 1 : 0.6 },
        nq ? `${q.name}<br><span style="opacity:.75">${qs.assembled ? 'в музее' : nq + ' из 6 костей'}</span>` : `?<br><span style="opacity:.7">${G.fm('не найден', 'не найдена', q)}</span>`);
      UI.tap(cell, () => { if (!nq) return; m.close(); G.setCur(q.id); G.go('map', { open: true }); });
    });
    oList.forEach((o, j) => {
      const i = j + co.length, x = 32 + i * 141, y = 346, got = oHave.has(o.id);
      const cell = G.h('div', 'abs', m.box, { left: x, top: y, width: 129, height: 124, borderRadius: '8px', background: got ? 'rgba(150,214,255,.08)' : 'rgba(255,255,255,.03)' });
      const meta = MAN.obones[o.id], k = Math.min(104 / meta.w, 62 / meta.h);
      const im = G.spr('obone_' + o.id, cell, 64.5 - (meta.w * k) / 2, 40 - (meta.h * k) / 2, meta.w * k, meta.h * k);
      if (!got) im.style.filter = 'brightness(0) opacity(.45)';
      G.h('div', 'abs', cell, { left: 4, right: 4, bottom: 8, textAlign: 'center', font: '500 13px/1.2 Rubik,sans-serif', opacity: got ? 1 : 0.55 },
        got ? `${o.short}<br><span style="opacity:.7">${o.spName}</span>` : '?');
    });
    const all = ss.bones.length >= 6 && !ss.assembled, more = G.othersLeft().length + G.coBones(sp.id).length > 0;
    if (all) UI.mainBtn(m.box, 'Собрать скелет', 'puzzle', { l: 200, t: 496 }, 360, () => { m.close(); G.go('assemble'); });
    else if (ss.assembled && !more) UI.mainBtn(m.box, 'В музей', 'museum', { l: 230, t: 496 }, 300, () => { m.close(); G.go('museum'); });
    else UI.mainBtn(m.box, ss.assembled ? 'Копать ещё' : 'Копать', 'pick', { l: 230, t: 496 }, 300, () => { m.close(); G.go('dig'); });
    m.back.addEventListener('click', () => m.close());
  },
});

/* ==================================================================== chapter result */
UI.result = (o) => {
  // o: {title, stars, stat, fact:{part,text}|null, chapter, onRetry, onNext, nextText}
  AU.play('win');
  const m = UI.modal(820, 480), b = m.box;
  const glow = G.h('div', 'abs', b, { left: 290, top: -70, width: 240, height: 240, borderRadius: '50%', background: 'rgba(242,182,64,.22)', filter: 'blur(40px)' });
  glow.style.pointerEvents = 'none';
  G.h('div', 'abs t-title gold', b, { left: 0, right: 0, top: 26, textAlign: 'center', fontSize: '40px' }, o.title);
  const st = G.h('div', 'abs', b, { left: 0, right: 0, top: 88, display: 'flex', justifyContent: 'center' }, UI.steps(0, 48, 8));
  const svgs = st.querySelectorAll('svg');
  svgs.forEach((s, i) => { s.style.transform = 'scale(0)'; });
  svgs.forEach((s, i) => {
    setTimeout(() => {
      if (!s.isConnected) return;
      s.style.transition = 'transform .35s cubic-bezier(.2,1.6,.4,1)'; s.style.transform = 'scale(1)';
      if (i < o.stars) { s.style.color = '#F2B640'; AU.play('pop'); }
    }, 350 + i * 260);
  });
  G.h('div', 'abs t-sub', b, { left: 0, right: 0, top: 150, textAlign: 'center', fontSize: '16px' }, o.stat || '');
  // left: museum fact
  if (o.fact) {
    G.h('div', 'abs t-label row', b, { left: 40, top: 200, gap: '8px' }, icon('museum', ' style="width:20px;height:20px"') + '<span>Открыт факт в музее</span>');
    UI.card(b, o.fact.part, o.fact.text, 40, 230, 360);
  } else {
    G.h('div', 'abs t-label', b, { left: 40, top: 200 }, 'Глава ' + (o.chapter || ''));
    G.h('div', 'abs t-body', b, { left: 40, top: 230, width: 360, opacity: 0.85 }, o.note || 'Следы показывают, как хорошо ты справился. Можно переиграть и собрать все три!');
  }
  // right: growth
  const age = G.clamp(o.age === undefined ? 1 : o.age, 0, 3);
  const gr = G.h('div', 'abs', b, { left: 420, top: 200, width: 360, height: 150 });
  const SPN = G.SP();
  gr.innerHTML = `<div class="t-label">${SPN.name} растёт</div>
    <div class="abs" style="left:0;top:30px;width:360px;height:120px;border-radius:6px;background:rgba(255,255,255,.06)"></div>
    <div class="abs" style="left:14px;top:66px;width:70px;height:28px;opacity:.8">${silSvg(SPN.sil, '#F4F1EA', ' style="width:70px;height:28px"')}</div>
    <div class="abs" style="right:14px;top:48px;width:120px;height:48px">${silSvg(SPN.sil, '#F2B640', ' style="width:120px;height:48px"')}</div>
    <div class="abs bar" style="left:96px;top:80px;width:130px;height:8px"><i style="width:${Math.round((age / 3) * 100)}%"></i></div>
    <div class="abs t-sub" style="left:16px;top:118px;font-size:13px">Малыш</div>
    <div class="abs t-sub" style="right:16px;top:118px;font-size:13px">Взрослый</div>
    <div class="abs gold" style="left:96px;top:96px;width:130px;text-align:center;font:500 13px Rubik,sans-serif">Сейчас: ${['малыш', 'малыш', 'подросток', 'взрослый'][age]}</div>`;
  if (o.onRetry) UI.secBtn(b, 'Ещё раз', 'retry', { l: 190, t: 388 }, 210, () => { m.close(); o.onRetry(); });
  UI.mainBtn(b, o.nextText || 'Дальше', 'play', { l: o.onRetry ? 420 : 300, t: 388 }, o.onRetry ? 220 : 220, () => { m.close(); o.onNext(); });
  return m;
};

/* ==================================================================== pause */
UI.pauseBtn = (onExit) => UI.iconBtn(G.ui, 'pause', { l: 32, t: 28 }, () => {
  G.paused = true; AU.hush();
  const m = UI.modal(420, 300);
  G.h('div', 'abs t-title', m.box, { left: 0, right: 0, top: 28, textAlign: 'center' }, 'Пауза');
  UI.mainBtn(m.box, 'Продолжить', 'play', { l: 60, t: 96 }, 300, () => { m.close(); G.paused = false; });
  UI.secBtn(m.box, 'К главам', 'left', { l: 60, t: 180 }, 300, () => { m.close(); G.paused = false; (onExit || (() => G.go('path')))(); });
});

/* ==================================================================== parent / test menu */
const Test = (window.Test = {
  open() {
    G.paused = true;
    const m = UI.modal(860, 560), b = m.box;
    G.h('div', 'abs t-label', b, { left: 32, top: 26 }, 'Для родителей и теста');
    G.h('div', 'abs t-title', b, { left: 32, top: 46 }, 'Тест-меню');
    UI.iconBtn(b, 'close', { r: 20, t: 20 }, () => { m.close(); G.paused = false; });
    const S = G.state.settings;
    const tg = (label, key, x) => {
      const t = G.h('button', 'plate sbtn pe', b, { left: x, top: 104, width: 150, height: 48, fontSize: '17px' });
      const upd = () => { t.innerHTML = `${icon(S[key] !== false ? 'check' : 'close')}<span>${label}</span>`; t.style.setProperty('--pst', S[key] !== false ? 'rgba(76,210,107,.8)' : 'rgba(255,255,255,.35)'); };
      upd(); UI.tap(t, () => { S[key] = S[key] === false; G.save(); upd(); if (!S.voice) AU.hush(); AU.music(AU.musWant); });
    };
    tg('Звуки', 'sfx', 32); tg('Голос', 'voice', 190); tg('Музыка', 'music', 348);
    // the quiz asks only about the animals in the museum; for a test, about all of them
    { const t = G.h('button', 'plate sbtn pe', b, { left: 540, top: 36, width: 236, height: 44, fontSize: '15px' });
      const upd = () => { t.innerHTML = `${icon(S.quizAll ? 'check' : 'close')}<span>Викторина: все</span>`; t.style.setProperty('--pst', S.quizAll ? 'rgba(76,210,107,.8)' : 'rgba(255,255,255,.35)'); };
      upd(); UI.tap(t, () => { S.quizAll = !S.quizAll; G.save(); upd(); }); }
    const act = (label, x, w, fn) => { const t = G.h('button', 'plate sbtn pe', b, { left: x, top: 104, width: w, height: 48, fontSize: '17px' }, `<span>${label}</span>`); UI.tap(t, fn); };
    act('Открыть всё', 506, 164, () => { Test.unlockAll(); m.close(); G.paused = false; UI.toast('Всё открыто'); G.go('path'); });
    act('Сбросить', 678, 150, () => { G.state = G.defState(); G.save(); m.close(); G.paused = false; UI.toast('Прогресс сброшен'); G.go('title'); });
    // species switch (scrolls sideways)
    G.h('div', 'abs t-label', b, { left: 32, top: 168 }, 'Вид');
    const strip = G.h('div', 'abs pe', b, { left: 80, top: 156, width: 748, height: 52, overflowX: 'auto', overflowY: 'hidden', whiteSpace: 'nowrap', touchAction: 'pan-x' });
    Object.values(DATA.species).forEach((sd) => {
      const on = sd.id === G.cur();
      const t = G.h('button', 'plate sbtn pe', strip, { position: 'relative', display: 'inline-flex', width: 'auto', minWidth: '120px', padding: '0 14px', height: 42, marginRight: '8px', fontSize: '15px' }, `<span>${sd.name}</span>`);
      if (on) t.style.setProperty('--pst', 'rgba(242,182,64,.95)');
      t.addEventListener('click', () => { G.setCur(sd.id); G.state.region = DATA.regionOf(sd.site); G.save(); m.close(); Test.open(); });
      if (on) requestAnimationFrame(() => { strip.scrollLeft = Math.max(0, t.offsetLeft - 300); });
    });
    G.h('div', 'abs t-label', b, { left: 32, top: 222 }, 'Перейти к экрану · ' + G.SP().name);
    const sp = G.SP();
    const J = [['Карта', 'map'], ['Место раскопок', 'site'], ['Раскопки', 'dig'], ['Сборка скелета', 'assemble', 'bones'], ['Музей', 'museum', 'asm'], ['Путь глав', 'path', 'asm']];
    if (sp.id === 'herrera') J.push(['Гл. 1 · Яйцо', 'ch1', 'asm'], ['Гл. 2 · Тише!', 'ch2', 'asm'], ['Гл. 3 · Руки', 'ch3', 'asm'], ['Гл. 4 · Долина', 'ch4', 'asm'], ['Охота · уровни', 'hunt', 'asm'], ['Бег · Легко', 'run', 'asm'],
      ['Хватка', 'grip', 'asm'], ['Бесконечная', 'endless', 'asm'], ['Вырос!', 'grown', 'asm']);
    else {
      for (const c of sp.chapters) if (c.id !== 'final') J.push([`Гл. ${c.n} · ${c.name}`, 'ch:' + c.n, 'asm']);
      J.push(['Вырос!', 'grown', 'asm']);
    }
    J.forEach(([label, sc, need], i) => {
      const x = 32 + (i % 5) * 162, y = 252 + Math.floor(i / 5) * 60;
      const t = G.h('button', 'plate sbtn pe', b, { left: x, top: y, width: 152, height: 50, fontSize: '14px', letterSpacing: '.02em' }, `<span>${label}</span>`);
      UI.tap(t, () => {
        const ss = G.S();
        if (need === 'bones' && ss.bones.length < 6) ss.bones = sp.bones.map((q) => q.id);
        if (need === 'asm' && !ss.assembled) { ss.bones = sp.bones.map((q) => q.id); ss.assembled = true; ss.facts[sp.firstFact] = true; }
        G.save(); m.close(); G.paused = false;
        if (sc === 'run') G.go('hunt', { mode: 'run', level: 0 });
        else if (sc === 'grip') G.go('hunt', { mode: 'grip', level: 0 });
        else if (sc === 'endless') G.go('hunt', { mode: 'endless' });
        else if (sc.startsWith('ch:')) G.goCh(+sc.slice(3));
        else if (sc === 'grown') { const n = G.nCh(); for (let i = 1; i <= n; i++) if (!G.chDone(i)) G.setCh(i, 3); G.go('path', { grown: true }); }
        else G.go(sc);
      });
    });
    const about = G.h('div', 'abs t-sub', b, { left: 32, top: 444, width: 796, fontSize: '13px', lineHeight: '1.45' });
    const app = window.DinoApp || null;
    const say = (v) => { about.textContent = `${v ? 'Версия ' + v + '. ' : ''}Триасовый и юрский периоды, ${Object.keys(DATA.species).length} животных. ` +
      (app ? 'Новые версии приходят сами, когда есть интернет; прогресс сохраняется.' : 'Прогресс хранится только в этом браузере.'); };
    say(app && app.version ? app.version() : '');
    if (!app) fetch('update.json').then((r) => r.json()).then((u) => say(u.version)).catch(() => {});
    const fs = G.h('button', 'plate sbtn pe', b, { left: 32, top: 494, width: 250, height: 44, fontSize: '16px' }, `${icon('full')}<span>Во весь экран</span>`);
    UI.tap(fs, () => { const d = document.documentElement; try { (d.requestFullscreen || d.webkitRequestFullscreen).call(d); } catch (e) { UI.toast('Полный экран недоступен здесь'); } });
    // a downloaded version can be switched on right away
    const rv = (app && app.ready && app.ready()) || G.updReady;
    if (app && rv) {
      const up = G.h('button', 'plate sbtn pe', b, { left: 296, top: 494, width: 300, height: 44, fontSize: '16px' }, `${icon('retry')}<span>Обновить до ${rv}</span>`);
      up.style.setProperty('--pst', 'rgba(76,210,107,.8)');
      UI.tap(up, () => { m.close(); G.paused = false; app.restart(); });
    }
    m.back.addEventListener('click', () => { m.close(); G.paused = false; });
  },
  unlockAll() {
    const st = G.state;
    for (const id of Object.keys(DATA.species)) {
      const sd = DATA.species[id], s = G.spState(id);
      s.bones = sd.bones.map((q) => q.id); s.assembled = true;
      const n = sd.chapters.filter((c) => c.id !== 'final').length;
      for (let i = 1; i <= n; i++) s.ch[i] = { done: true, stars: 3 };
      for (const k of sd.factOrder) s.facts[k] = true;
    }
    st.hunt = { easy: 3, medium: 3, hard: 3 };
    st.others = DATA.others.map((o) => o.id);
    G.save();
  },
});

