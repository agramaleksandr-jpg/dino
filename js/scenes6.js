'use strict';
/* ==================================================================== more chapters for every animal:
   seek (find who else lived around) · escape (run from a predator, jump over logs) */

/* ------------------------------------------------------------------ seek · pan a wide picture and find the neighbours */
Scenes.seek = {
  enter(p) {
    const SC = window.SEEKZ && (p.sc || SEEKZ.of[G.cur()]);
    if (SC) return this.painted(p, SC);
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 3);
    const Z = 1.6, PW = 1280 * Z, PH = 720 * Z, base = p.bg || 'bg_forest', bgKey = G.rbg(base), sea = base === 'bg_sea';
    const pan = G.h('div', 'abs', sc, { left: 0, top: 0, width: PW, height: PH });
    G.spr(bgKey, pan, 0, 0, PW, PH);
    const marks = G.h('div', 'full', pan, { width: PW, height: PH, pointerEvents: 'none' });
    shades(sc, 0.5, 0);
    chHeader(C.n, C.name);
    // who lives here: species of the game or the painted neighbours of Ischigualasto
    const kindOf = (q) => (q.type ? q.type : q.id === 'eudimo' ? 'flyer' : q.id === 'shoni' ? 'swim' : 'walker');
    const items = (p.who || []).map((w, i) => {
      const o = typeof w === 'string' ? { id: w } : w;
      if (o.id.startsWith('nb_')) {
        const nb = DATA.neighbours.concat(DATA.jnb || [], DATA.cnb || [], DATA.tnb || []).find((q) => 'nb_' + q.key === o.id), air = nb.place === 'air';
        return { i, key: o.id, name: nb.name, text: nb.text, place: sea ? 'water' : nb.place || 'ground', w: o.w || (air ? 190 : 230) };
      }
      const q = DATA.species[o.id], t = kindOf(q);
      const place = t === 'flyer' || t === 'glider' ? 'air' : t === 'swim' || sea ? 'water' : 'ground';
      const w0 = t === 'glider' ? 120 : t === 'flyer' ? 190 : t === 'swim' ? 260 : 250;
      return { i, key: q.img, name: o.name || q.name, text: o.text || `${q.name} — ${q.kind.toLowerCase()}. ${q.hero.size}.`, place, w: o.w || w0 };
    });
    // spread them over the picture: one per column, height by where the animal lives
    const N = items.length, cols = G.shuffle(items.map((q, i) => i));
    items.forEach((it, k) => {
      const m = MAN[it.key], h = (it.w * m.h) / m.w, col = cols[k];
      const x = 170 + ((PW - 340) * (col + 0.5)) / N + G.rand(-60, 60);
      const y = it.place === 'air' ? G.rand(0.16, 0.36) * PH : it.place === 'water' ? G.rand(sea ? 0.3 : 0.66, sea ? 0.78 : 0.8) * PH : G.rand(0.7, 0.86) * PH;
      const ground = it.place === 'ground';
      Object.assign(it, { x, y: ground ? y - h / 2 : y, h, r: Math.max(it.w, h) * 0.62 });
      const im = G.spr(it.key, pan, x - it.w / 2, it.y - h / 2, it.w, h);
      im.style.filter = 'saturate(.8) brightness(.9) drop-shadow(0 6px 6px rgba(0,0,0,.35))';
      if (G.rand(0, 1) < 0.5 && it.place !== 'water') im.style.transform = 'scaleX(-1)';
      it.im = im;
    });
    const S = { px: 0, py: 0, vx: 0, vy: 0, drag: null, found: 0, hints: 0, done: false };
    const clamp = () => {
      S.px = G.clamp(S.px, G.vis.x1 - PW, G.vis.x0); S.py = G.clamp(S.py, G.vis.y1 - PH, G.vis.y0);
      pan.style.transform = `translate(${S.px}px,${S.py}px)`;
    };
    S.px = 640 - PW * 0.5; S.py = 360 - PH * 0.55; clamp();
    G.dbg = { S, items, clamp };
    const hb = G.h('button', 'plate ibtn pe'); hb.innerHTML = icon('binoculars'); hb.style.position = 'relative';
    const top = UI.topRight({ counter: ['eye', `0 / ${N}`], extra: [hb] });
    const vp = document.createElement('div'); // no minimap: the picture is panned by hand
    // tray of shadows to fill
    const tw = 8 + N * 68;
    const tray = G.h('div', 'plate abs', G.ui, { left: Math.round(G.W / 2 - tw / 2), bottom: 12, width: tw, height: 60, '--c': '8px' });
    const slots = items.map((it, i) => {
      const s = G.h('div', 'abs', tray, { left: 8 + i * 68, top: 8, width: 62, height: 44, borderRadius: '5px', background: 'rgba(255,255,255,.04)' });
      const m = MAN[it.key], k = Math.min(54 / m.w, 34 / m.h);
      const im = G.spr(it.key, s, 31 - (m.w * k) / 2, 22 - (m.h * k) / 2, m.w * k, m.h * k);
      im.style.filter = 'brightness(0) opacity(.5)';
      const q = G.h('div', 'abs', s, { right: 4, top: 0, font: '600 13px Oswald,sans-serif', opacity: 0.5 }, '?');
      return { s, im, q };
    });
    UI.narrBottom = 84;
    const hand = UI.hand(G.ui, G.W / 2, G.H / 2, 'swipe');
    G.say(Array.isArray(p.intro) ? AU.alt(p.intro[0], p.intro[1]) : p.intro || 'Двигай картинку пальцем и найди всех соседей — кто ещё жил рядом!');
    const showFound = (it) => {
      it.got = true; S.found++;
      top.counter.set(`${S.found} / ${N}`);
      AU.play('found'); G.fx.sparkle(S.px + it.x, S.py + it.y, 18);
      it.im.style.filter = 'drop-shadow(0 0 10px rgba(255,214,120,.9))';
      G.h('div', 'abs', marks, { left: it.x - it.r * 0.8, top: it.y - it.r * 0.8, width: it.r * 1.6, height: it.r * 1.6, borderRadius: '50%', border: '4px solid #F2B640', boxShadow: '0 0 16px rgba(242,182,64,.7)' });
      G.h('div', 'abs', marks, { left: it.x + it.r * 0.5, top: it.y - it.r * 0.8, width: 40, height: 40, borderRadius: '50%', background: '#4CD26B', border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }, icon('check', ' style="width:22px;height:22px;color:#2A1E05"'));
      const sl = slots[it.i]; sl.im.style.filter = 'drop-shadow(0 2px 3px rgba(0,0,0,.5))'; sl.q.remove(); sl.s.style.background = 'rgba(255,255,255,.1)';
      if (S.card) S.card.remove();
      // the card about the find: closes on a tap and fades by itself, so it never hides another animal
      const card = (S.card = UI.card(G.ui, it.name, it.text, 32, 228, 360));
      const drop = () => { if (S.card !== card) return; S.card = null; card.style.transition = 'opacity .35s'; card.style.opacity = 0; setTimeout(() => card.remove(), 400); };
      card.addEventListener('pointerdown', (e) => { if (!e.target.closest('.ls')) drop(); });
      G.wait(5.5).then(drop);
      G.say(it.text);
      if (S.found >= N) finish();
    };
    const finish = async () => {
      S.done = true;
      await G.wait(3.2); if (!G.alive(tok)) return;
      G.say('Все соседи найдены!');
      chFinish(C.n, Math.max(1, 3 - S.hints), { stat: `Найдено ${N} из ${N} · подсказок: ${S.hints}` });
    };
    const tapAt = (bp) => {
      const x = bp.x - S.px, y = bp.y - S.py;
      for (const it of items) if (!it.got && Math.hypot(x - it.x, y - it.y) < it.r) { showFound(it); return; }
      AU.play('miss');
    };
    G.on(sc, 'pointerdown', (e) => { AU.unlock(); const q = G.bgPt(e); S.drag = { pid: e.pointerId, x: q.x, y: q.y, sx: q.x, sy: q.y, moved: 0 }; S.vx = S.vy = 0; hand.style.display = 'none'; });
    G.on(window, 'pointermove', (e) => {
      const d = S.drag; if (!d || e.pointerId !== d.pid) return;
      const q = G.bgPt(e), dx = q.x - d.x, dy = q.y - d.y;
      d.moved += Math.abs(dx) + Math.abs(dy); d.x = q.x; d.y = q.y;
      S.px += dx; S.py += dy; S.vx = dx * 60; S.vy = dy * 60; clamp();
    });
    const up = (e) => {
      const d = S.drag; if (!d || e.pointerId !== d.pid) return;
      S.drag = null;
      if (d.moved < 12 && !S.done) tapAt({ x: d.sx, y: d.sy });
    };
    G.on(window, 'pointerup', up); G.on(window, 'pointercancel', up);
    UI.tap(hb, () => {
      const it = items.find((q) => !q.got); if (!it) return;
      S.hints++;
      const x0 = S.px, y0 = S.py, x1 = 640 - it.x, y1 = 340 - it.y;
      G.tween(0.7, (e) => { S.px = G.lerp(x0, x1, e); S.py = G.lerp(y0, y1, e); clamp(); }, G.ease.inOut).then(() => {
        const ring = G.h('div', 'abs', marks, { left: it.x - it.r, top: it.y - it.r, width: it.r * 2, height: it.r * 2, borderRadius: '50%', border: '4px dashed #fff' });
        G.tween(1.6, (e) => { ring.style.opacity = 1 - e; ring.style.transform = `scale(${1 - 0.3 * e})`; }).then(() => ring.remove());
      });
      G.once('look', 'Посмотри туда — кто-то прячется!');
    });
    G.tick((dt) => {
      if (!S.drag && (Math.abs(S.vx) > 1 || Math.abs(S.vy) > 1)) {
        S.px += S.vx * dt; S.py += S.vy * dt; const k = Math.exp(-4 * dt); S.vx *= k; S.vy *= k; clamp();
      }
      const vx0 = (G.vis.x0 - S.px) / PW, vy0 = (G.vis.y0 - S.py) / PH, vw = (G.vis.x1 - G.vis.x0) / PW, vh = (G.vis.y1 - G.vis.y0) / PH;
      vp.style.left = 8 + vx0 * 192 + 'px'; vp.style.top = 8 + vy0 * 108 + 'px'; vp.style.width = vw * 192 + 'px'; vp.style.height = vh * 108 + 'px';
    });
    G.onExit(() => { UI.narrBottom = 0; });
  },
  /** a painted scene: the animals are part of the picture and each of them answers a tap (js/seekzones.js) */
  painted(p, scKey) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 3);
    const Z = 1.4, PW = 1280 * Z, PH = 720 * Z, img = (SEEKZ.img && SEEKZ.img[scKey]) || scKey, k = PW / SEEKZ.w;
    const pan = G.h('div', 'abs', sc, { left: 0, top: 0, width: PW, height: PH });
    G.spr(img, pan, 0, 0, PW, PH);
    const marks = G.h('div', 'full', pan, { width: PW, height: PH, pointerEvents: 'none' });
    shades(sc, 0.5, 0);
    chHeader(C.n, C.name);
    // a zone id may carry a variant ('nb_dinodontosaurus#young', 'macro#2'): the same animal with its own line (DATA.zoneInfo)
    const baseId = (id) => id.split('#')[0];
    // p.find: the age-mates game — only the animals whose zone id matches are to be found (the same kind at the hero's age);
    // the others (babies, grown-ups) tell who they are when tapped but do not count
    const AGE = p.find ? new RegExp(p.find) : null;
    const zones = SEEKZ.z[scKey], herd = !AGE && zones.every(([id]) => baseId(id) === sp.id);
    const herdTexts = herd || AGE ? (p.who || []).map((w) => (typeof w === 'string' ? '' : w.text || '')) : [];
    const NB = DATA.neighbours.concat(DATA.jnb || [], DATA.cnb || [], DATA.tnb || []);
    const items = zones.map(([zid, cs], i) => {
      const c = cs.map(([x, y, r]) => [x * k, y * k, r * k]), [x, y, r] = c[0], id = baseId(zid);
      let name, text, key;
      if (id.startsWith('it_')) {
        const q = (DATA.itemInfo || {})[id] || { name: '', text: '' };
        name = q.name; text = q.text; key = id;
      } else if (id.startsWith('nb_')) {
        const nb = NB.find((q) => 'nb_' + q.key === id), self = (DATA.nbSp || {})[id] === sp.id;
        name = nb.name; key = id;
        text = self ? nb.self || `${nb.name} — ${G.fm('такой же', 'такая же')}, как ты! ${sp.hero.size}.` : nb.text;
      } else {
        const q = DATA.species[id];
        name = q.name; key = q.img;
        text = id === sp.id ? `${q.name} — ${G.fm('такой же', 'такая же')}, как ты! ${q.hero.size}.` : `${q.name} — ${q.kind.toLowerCase()}. ${q.hero.size}.`;
      }
      const v = zid !== id && (DATA.zoneInfo || {})[zid];
      if (v) { if (v.name) name = v.name; if (v.text) text = v.text; }
      return { i, id, zid, key, name, text, c, x, y, r, got: false, num: zid === id ? 1 : +(zid.split('#')[1]) || 0 };
    });
    const goal = AGE ? items.filter((it) => AGE.test(it.zid)) : items;
    goal.forEach((it, j) => { it.slot = j; it.goal = true; });
    // numbered copies of one animal ('macro', 'macro#2', 'macro#3') speak in the order they are found,
    // so "one more!" never comes before the first one
    for (const it of items) {
      if (!it.num || it.grp) continue;
      const same = items.filter((q) => q.num && q.id === it.id).sort((a, b) => a.num - b.num);
      if (same.length < 2) continue;
      const grp = { texts: same.map((q) => q.text), got: 0 };
      for (const q of same) q.grp = grp;
    }
    const N = goal.length;
    const S = { px: 0, py: 0, vx: 0, vy: 0, drag: null, found: 0, hints: 0, done: false };
    const clamp = () => {
      S.px = G.clamp(S.px, G.vis.x1 - PW, G.vis.x0); S.py = G.clamp(S.py, G.vis.y1 - PH, G.vis.y0);
      pan.style.transform = `translate(${S.px}px,${S.py}px)`;
    };
    S.px = 640 - PW * 0.5; S.py = 360 - PH * 0.5; clamp();
    G.dbg = { S, items, clamp, painted: true };
    const hb = G.h('button', 'plate ibtn pe'); hb.innerHTML = icon('binoculars'); hb.style.position = 'relative';
    const top = UI.topRight({ counter: ['eye', `0 / ${N}`], extra: [hb] });
    const vp = document.createElement('div'); // no minimap: the picture is panned by hand
    // tray: the shadows of everyone to find
    const tw = 8 + N * 68;
    const tray = G.h('div', 'plate abs', G.ui, { left: Math.round(G.W / 2 - tw / 2), bottom: 12, width: tw, height: 60, '--c': '8px' });
    const slots = goal.map((it, i) => {
      const s = G.h('div', 'abs', tray, { left: 8 + i * 68, top: 8, width: 62, height: 44, borderRadius: '5px', background: 'rgba(255,255,255,.04)' });
      const m = MAN[it.key], kk = Math.min(54 / m.w, 34 / m.h);
      const im = G.spr(it.key, s, 31 - (m.w * kk) / 2, 22 - (m.h * kk) / 2, m.w * kk, m.h * kk);
      im.style.filter = 'brightness(0) opacity(.5)';
      const q = G.h('div', 'abs', s, { right: 4, top: 0, font: '600 13px Oswald,sans-serif', opacity: 0.5 }, '?');
      return { s, im, q };
    });
    UI.narrBottom = 84;
    const hand = UI.hand(G.ui, G.W / 2, G.H / 2, 'swipe');
    G.say(Array.isArray(p.intro) ? AU.alt(p.intro[0], p.intro[1]) : p.intro || 'Двигай картинку пальцем и найди всех соседей — кто ещё жил рядом!');
    const card = (it, text) => {
      if (S.card) S.card.remove();
      // the card goes to the side away from the animal, so it never hides it
      const at = G.bgToWorld(S.px + it.x, S.py + it.y), cx = at.x < G.W / 2 ? G.W - 32 - 360 : 32;
      const cd = (S.card = UI.card(G.ui, it.name, text, cx, 228, 360));
      const drop = () => { if (S.card !== cd) return; S.card = null; cd.style.transition = 'opacity .35s'; cd.style.opacity = 0; setTimeout(() => cd.remove(), 400); };
      cd.addEventListener('pointerdown', (e) => { if (!e.target.closest('.ls')) drop(); });
      G.wait(5.5).then(drop);
    };
    const showFound = (it) => {
      it.got = true; S.found++;
      top.counter.set(`${S.found} / ${N}`);
      AU.play('found'); if (!it.id.startsWith('it_')) AU.voiceOf(it.id, { at: 0.3, vol: 0.55 }); G.fx.sparkle(S.px + it.x, S.py + it.y, 18);
      G.h('div', 'abs', marks, { left: it.x - it.r * 1.05, top: it.y - it.r * 1.05, width: it.r * 2.1, height: it.r * 2.1, borderRadius: '50%', border: '4px solid #F2B640', boxShadow: '0 0 16px rgba(242,182,64,.7)' });
      G.h('div', 'abs', marks, { left: it.x + it.r * 0.62, top: it.y - it.r * 1.0, width: 40, height: 40, borderRadius: '50%', background: '#4CD26B', border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }, icon('check', ' style="width:22px;height:22px;color:#2A1E05"'));
      const sl = slots[it.slot]; sl.im.style.filter = 'drop-shadow(0 2px 3px rgba(0,0,0,.5))'; sl.q.remove(); sl.s.style.background = 'rgba(255,255,255,.1)';
      // a herd: the lines go in the order the animals are found ("…and the last one!")
      it.said = (herd || AGE) && herdTexts[S.found - 1] ? herdTexts[S.found - 1] : it.grp ? it.grp.texts[it.grp.got++] : it.text;
      card(it, it.said);
      G.say(it.said);
      if (S.found >= N) finish();
    };
    const finish = async () => {
      S.done = true;
      await G.wait(3.2); if (!G.alive(tok)) return;
      G.say(AGE && p.done ? p.done : herd ? 'Все нашлись!' : 'Все соседи найдены!');
      chFinish(C.n, Math.max(1, 3 - S.hints), { stat: `Найдено ${N} из ${N} · подсказок: ${S.hints}` });
    };
    // which painted animal is under the finger (a little room around it for small fingers)
    const hitAt = (x, y) => {
      let best = null, bd = 1e9;
      for (const it of items) for (const [cx, cy, r] of it.c) {
        const d = Math.hypot(x - cx, y - cy) / (r + 16);
        if (d < 1 && d < bd) { bd = d; best = it; }
      }
      return best;
    };
    const tapAt = (bp) => {
      const it = hitAt(bp.x - S.px, bp.y - S.py);
      if (!it) { AU.play('miss'); return; }
      if (!it.got && it.goal) { showFound(it); return; }
      // not one to find (another age): it says who it is; found before: it tells about itself again
      AU.play('pop'); card(it, it.said || it.text); G.say(it.said || it.text);
    };
    G.on(sc, 'pointerdown', (e) => { AU.unlock(); const q = G.bgPt(e); S.drag = { pid: e.pointerId, x: q.x, y: q.y, sx: q.x, sy: q.y, moved: 0 }; S.vx = S.vy = 0; hand.style.display = 'none'; });
    G.on(window, 'pointermove', (e) => {
      const d = S.drag; if (!d || e.pointerId !== d.pid) return;
      const q = G.bgPt(e), dx = q.x - d.x, dy = q.y - d.y;
      d.moved += Math.abs(dx) + Math.abs(dy); d.x = q.x; d.y = q.y;
      S.px += dx; S.py += dy; S.vx = dx * 60; S.vy = dy * 60; clamp();
    });
    const up = (e) => {
      const d = S.drag; if (!d || e.pointerId !== d.pid) return;
      S.drag = null;
      if (d.moved < 14 && !S.done) tapAt({ x: d.sx, y: d.sy });
    };
    G.on(window, 'pointerup', up); G.on(window, 'pointercancel', up);
    UI.tap(hb, () => {
      const it = goal.find((q) => !q.got); if (!it) return;
      S.hints++;
      const x0 = S.px, y0 = S.py, x1 = 640 - it.x, y1 = 330 - it.y;
      G.tween(0.7, (e) => { S.px = G.lerp(x0, x1, e); S.py = G.lerp(y0, y1, e); clamp(); }, G.ease.inOut).then(() => {
        const ring = G.h('div', 'abs', marks, { left: it.x - it.r * 1.2, top: it.y - it.r * 1.2, width: it.r * 2.4, height: it.r * 2.4, borderRadius: '50%', border: '4px dashed #fff' });
        G.tween(1.6, (e) => { ring.style.opacity = 1 - e; ring.style.transform = `scale(${1 - 0.3 * e})`; }).then(() => ring.remove());
      });
      G.once('look', 'Посмотри туда — кто-то прячется!');
    });
    G.tick((dt) => {
      if (!S.drag && (Math.abs(S.vx) > 1 || Math.abs(S.vy) > 1)) {
        S.px += S.vx * dt; S.py += S.vy * dt; const kd = Math.exp(-4 * dt); S.vx *= kd; S.vy *= kd; clamp();
      }
      const vx0 = (G.vis.x0 - S.px) / PW, vy0 = (G.vis.y0 - S.py) / PH, vw = (G.vis.x1 - G.vis.x0) / PW, vh = (G.vis.y1 - G.vis.y0) / PH;
      vp.style.left = 8 + vx0 * 192 + 'px'; vp.style.top = 8 + vy0 * 108 + 'px'; vp.style.width = vw * 192 + 'px'; vp.style.height = vh * 108 + 'px';
    });
    G.onExit(() => { UI.narrBottom = 0; });
  },
};

/* ------------------------------------------------------------------ escape · run from a predator, tap to jump over logs.
   Heavy animals do not jump (p.ram): thickets stand in the way, a tap lowers the head and the animal breaks through. */
Scenes.escape = {
  enter(p) {
    // p.hr: the predator's length over the hero's. A much bigger hunter is drawn to scale, the hero runs further right
    // so that the hunter's head and shoulders stay in view
    const HR = p.hr || 0;
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 3), GY = 612, X = HR > 2.5 ? 700 : 520, DIST = p.dist || 5600, hk = p.hunter || 'sp_posto';
    const who = p.hunterName || 'хищник', RAM = !!p.ram;
    G.h('div', 'full', sc, { background: '#c9a06a' });
    GL.attach(sc);
    const bg = scrollTiles(p.bg || 'bg_run');
    shades(sc, 0.45, 0);
    chHeader(C.n, C.name);
    UI.topRight();
    const track = uiTrack(sp.sil);
    const K = fitK(sp.id, sp.type === 'biped' ? 330 : 300, 170), dino = GL.makeAuto(sp.id, { x: X, y: GY, s: K, z: 3 });
    const d = MAN.auto[sp.id], half = ((d.box[1] - d.box[0]) / 2) * K, hwT = HR ? Math.min(1150, 2 * half * HR) : 0;
    const STRIDE = GL.autoStride(dino, 'run') * K, V = 330;
    // the predator behind: a jointed runner when its parts are loaded, otherwise a picture
    const hid = hk.replace(/^sp_/, ''), ha = MAN.auto && MAN.auto[hid];
    const live = !!(ha && ha.pairs && G.have('sp_' + hid + '_body') && ha.pairs.every((q) => G.have(q.key)));
    let hunter = null, HI = null, KH = 0, hwH = 400, HSTR = 1, hh = 0;
    if (live) {
      KH = HR ? hwT / (ha.box[1] - ha.box[0]) : fitK(hid, 470, 210); hwH = (ha.box[1] - ha.box[0]) * KH;
      HI = GL.makeAuto(hid, { x: -600, y: GY, s: KH, z: 2 });
      HSTR = GL.autoStride(HI, 'run') * KH;
    }
    // where the legs are, as a share of the body length counted from the snout
    const legAt = HI ? ha.pairs.map((q) => (ha.box[1] - q.joints[4][0]) / (ha.box[1] - ha.box[0])) : [];
    if (!HI) {
      const hm = MAN[hk];
      if (HR) hwH = hwT;
      else if (RAM) hwH = Math.min(hwH, (1.5 * (d.box[3] - d.box[2]) * K * hm.w) / hm.h);   // not a giant beside a small animal
      hh = (hwH * hm.h) / hm.w;
      hunter = G.spr(hk, sc, 0, 0, hwH, hh);
      hunter.style.filter = 'drop-shadow(0 6px 6px rgba(0,0,0,.4))';
    }
    const hit = G.h('div', 'hit', sc);
    const hand = UI.hand(G.ui, G.W / 2, G.H / 2, 'tap'); hand.style.display = 'none';
    const S = { t: 0, ph: 0, d: 0, gap: 210, jy: 0, vy: 0, logs: [], nextL: 2.2, stumbles: 0, caught: 0, slow: 0, done: false, first: true, ram: 0, ramCd: 0 };
    const blink = blinker();
    G.dbg = { S, dino, HI, X, reach: half * 0.8 };
    G.say(RAM ? `Бежим! ${who[0].toUpperCase() + who.slice(1)} догоняет. Нажимай перед зарослями — и ломись напролом!`
      : `Бежим! ${who[0].toUpperCase() + who.slice(1)} догоняет. Нажимай, чтобы перепрыгнуть бревно!`);
    const jump = () => {
      if (S.done) return;
      if (RAM) { if (S.ramCd > 0) return; S.ram = 0.75; S.ramCd = 0.9; AU.play('whoosh'); hand.style.display = 'none'; return; }
      if (S.jy < -2) return; S.vy = -650; AU.play('whoosh'); hand.style.display = 'none';
    };
    // a thicket of horsetails: its stems fly apart when the animal breaks through
    const thicket = () => {
      const m = MAN.it_horsetail, w = 150, h = 190, el = G.h('div', 'abs', sc, { width: w, height: h, pointerEvents: 'none' }), stems = [];
      for (let i = 0; i < 5; i++) {
        const sh = h * G.rand(0.72, 1), sw = (sh * m.w) / m.h, x = (w - sw) * (i / 4) + G.rand(-8, 8);
        const im = G.spr('it_horsetail', el, x, h - sh, sw, sh);
        im.style.transformOrigin = '50% 100%'; im.style.transform = `rotate(${G.rand(-9, 9)}deg)`; im.style.filter = 'drop-shadow(0 4px 4px rgba(0,0,0,.4))';
        stems.push({ im, x, y: h - sh, y0: h - sh, vx: 0, vy: 0, r: 0, vr: 0, g: 0 });
      }
      return { x: 1400, w, h, el, stems, hit: false, thicket: true, fly: 0 };
    };
    G.on(hit, 'pointerdown', () => { AU.unlock(); jump(); });
    const finish = async () => {
      S.done = true; AU.play('ok');
      G.say(`Ура, ${G.fm('оторвался', 'оторвалась')}! ${who[0].toUpperCase() + who.slice(1)} отстал.`);
      await G.wait(2.0); if (!G.alive(tok)) return;
      const bad = S.stumbles + 2 * S.caught, stars = bad === 0 ? 3 : bad <= 2 ? 2 : 1;
      chFinish(C.n, stars, { stat: `${RAM ? G.fm('Запутался', 'Запуталась') : G.fm('Споткнулся', 'Споткнулась')}: ${S.stumbles} · ${who} догонял: ${S.caught}` });
    };
    G.tick((dt) => {
      S.t += dt;
      if (S.slow > 0) S.slow -= dt;
      if (S.ram > 0) S.ram -= dt;
      if (S.ramCd > 0) S.ramCd -= dt;
      const v = S.done ? V * 1.2 : V * (S.slow > 0 ? 0.55 : 1);
      S.scroll = (S.scroll || 0) + v * dt; bg(S.scroll);
      S.d += v * dt; S.ph += dt * (2 * Math.PI * v) / STRIDE;
      track(G.clamp(S.d / DIST, 0, 1));
      // jump
      S.vy += 1800 * dt; S.jy = Math.min(0, S.jy + S.vy * dt); if (S.jy >= 0) S.vy = 0;
      // the predator keeps coming; stumbles let it close the gap
      if (!S.done) {
        S.gap = Math.min(230, S.gap + (S.slow > 0 ? -150 : 22) * dt);
        if (S.gap < 20) { S.caught++; S.gap = 160; AU.play('thud'); G.once('caught', RAM ? `Ой, ${who} почти догнал! Нажимай перед зарослями!` : `Ой, ${who} почти догнал! Прыгай через брёвна!`); }
      } else S.gap += 220 * dt;
      // on screen the gap is squeezed so the predator's head and front legs stay in view
      const vg0 = S.vg === undefined ? S.gap : S.vg;
      S.vg = vg0 + (S.gap - vg0) * Math.min(1, dt * 5); // eased, so a reset slides back instead of jumping
      const snout = X - half - 30 - S.vg * 0.6;
      if (HI) {
        // its feet keep pace with the ground: own speed = scroll speed - change of the gap
        const hv = G.clamp(v - (0.6 * (S.vg - vg0)) / Math.max(dt, 1e-3), 0.35 * V, 1.8 * V);
        S.hph = (S.hph || 0) + (dt * 2 * Math.PI * hv) / HSTR;
        // a little hop whenever a log passes under its front or hind legs
        let hop = 0;
        if (!RAM) for (const L of S.logs) for (const r of legAt) {
          const u = ((snout - L.x) / hwH - r) / 0.13;
          if (Math.abs(u) < 1) hop = Math.max(hop, 0.5 + 0.5 * Math.cos(Math.PI * u));
        }
        HI.x = snout - hwH / 2; HI.y = GY + 4 - 38 * hop;
        const [hb, hf] = GL.autoGait(HI, 'run', S.hph, S.t);
        HI.pose(hb, hf);
      } else {
        hunter.style.left = snout - hwH * 0.94 + 'px'; hunter.style.top = GY - hh + 8 + Math.abs(Math.sin(S.t * 7)) * -6 + 'px';
      }
      // logs
      S.nextL -= dt;
      if (!S.done && S.nextL <= 0 && S.d < DIST - 900) {
        if (RAM) S.logs.push(thicket());
        else {
          const w = 120, h = (w * MAN.log.h) / MAN.log.w, el = G.spr('log', sc, 0, 0, w, h);
          el.style.filter = 'drop-shadow(0 4px 4px rgba(0,0,0,.4))';
          S.logs.push({ x: 1400, w, h, el, hit: false });
        }
        S.nextL = G.rand(1.5, 2.5);
      }
      for (const L of S.logs.slice()) {
        L.x -= v * dt;
        L.el.style.left = L.x - L.w / 2 + 'px'; L.el.style.top = GY - L.h + 6 + 'px';
        if (S.first && (RAM ? L.x < X + half * 0.8 + 240 : L.x < X + 420 && L.x > X + 180)) { hand.style.display = ''; S.first = false; }
        if (L.thicket) {
          // the head reaches the thicket: with the head down it flies apart, otherwise the animal gets tangled in it
          if (!L.hit && L.x - L.w * 0.3 < X + half * 0.8) {
            L.hit = true; L.fly = 1e-3; AU.play('thud'); G.fx.dust(L.x, GY, 10); G.fx.dust(L.x, GY - 80, 8, 'rgba(120,170,90,');
            const clean = S.ram > 0;
            for (const st of L.stems) { st.vx = clean ? G.rand(120, 520) : G.rand(0, 90); st.vy = clean ? G.rand(-520, -180) : 0; st.g = clean ? 1500 : 0; st.vr = clean ? G.rand(-500, 500) : G.rand(90, 170); }
            if (clean) AU.play('crack');
            else { S.stumbles++; S.slow = 0.9; G.once('trip', `${G.fm('Запутался', 'Запуталась')}! Нажимай раньше, чтобы проломить заросли.`); }
          }
          if (L.fly) {
            L.fly += dt;
            for (const st of L.stems) {
              st.vy += st.g * dt; st.x += (st.vx + (st.g ? v : v * 0.5)) * dt; st.y = Math.min(st.y + st.vy * dt, st.y0 + 14);
              if (st.g ? st.y < st.y0 + 14 : st.r < 78) st.r += st.vr * dt;
              st.im.style.left = st.x + 'px'; st.im.style.top = st.y + 'px'; st.im.style.transform = `rotate(${st.r}deg)`; st.im.style.opacity = G.clamp(2 - L.fly, 0, 1);
            }
          }
        } else if (!L.hit && Math.abs(L.x - (X + half * 0.35)) < L.w * 0.42 && S.jy > -L.h * 0.6) {
          L.hit = true; S.stumbles++; S.slow = 0.8; AU.play('thud'); G.fx.dust(L.x, GY, 8);
          G.once('trip', 'Споткнулся! Нажимай раньше, чтобы прыгнуть.');
        }
        if (L.x < -160) { L.el.remove(); S.logs.splice(S.logs.indexOf(L), 1); }
      }
      const [body, feet] = GL.autoGait(dino, 'run', S.ph, S.t);
      if (S.slow > 0) body.pitch = (body.pitch || 0) + 4 * Math.sin(S.t * 18);
      if (S.ram > 0) { const k = Math.sin(Math.PI * G.clamp(S.ram / 0.75, 0, 1)) ** 0.5; body.pitch = (body.pitch || 0) + 5 * k; body.neck = (body.neck || 0) + 9 * k; body.head = (body.head || 0) + 8 * k; }
      dino.y = GY + S.jy; dino.blink = blink(S.t, dt);
      dino.pose(body, feet);
      if (!S.done && S.d >= DIST) finish();
    });
  },
};

/* ------------------------------------------------------------------ defend · a heavy animal does not run from a predator: it strikes with its tail.
   The predator steals up from behind; a tap when its head is in the circle at the tail's end lands the blow. */
Scenes.defend = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 4), NEED = p.need || 5, GY = G.floor(612, 44), hk = p.hunter || 'sp_allo';
    const who = p.hunterName || 'хищник', Who = who[0].toUpperCase() + who.slice(1), R = 78;
    G.lowerBg(G.bgImg(p.bg || 'bg_run'));
    shades(sc, 0.45, 0);
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: ['paw', `0 / ${NEED}`] });
    const ring = G.h('div', 'abs', sc, { width: 2 * R, height: 2 * R, marginLeft: -R + 'px', marginTop: -R + 'px', borderRadius: '50%', border: '5px dashed rgba(255,255,255,.55)', pointerEvents: 'none',
      transition: 'border-color .15s, transform .15s' });
    GL.attach(sc);
    // the animal stands with its tail to the left, where the predator comes from
    const d = MAN.auto[sp.id], K = fitK(sp.id, 680, 250), half = ((d.box[1] - d.box[0]) / 2) * K;
    const dino = GL.makeAuto(sp.id, { x: 480 + half, y: GY, s: K, z: 3 });
    // the end of the tail: the leftmost pixels of the body picture
    let tip = [d.box[0], d.tail[1]];
    try {
      const px = GL.pixels('sp_' + sp.id + '_body'), x0 = Math.max(0, Math.round(d.box[0]));
      for (let x = x0; x < x0 + 40 && x < px.w; x++) {
        let n = 0, sy = 0;
        for (let y = 0; y < px.h; y++) if (px.data[(y * px.w + x) * 4 + 3] > 128) { n++; sy += y; }
        if (n > 2) { tip = [x + 6, sy / n]; break; }
      }
    } catch (e) { /* the root height will do */ }
    const Z = (() => { const q = dino.toDesign(tip[0], tip[1]); return { x: q[0] - 14, y: G.clamp(q[1], GY - 260, GY - 70) }; })();
    ring.style.left = Z.x + 'px'; ring.style.top = Z.y + 'px';
    // the predator: a jointed runner when its parts are loaded, otherwise a picture
    const hid = hk.replace(/^sp_/, ''), ha = MAN.auto && MAN.auto[hid];
    const live = !!(ha && ha.pairs && G.have('sp_' + hid + '_body') && ha.pairs.every((q) => G.have(q.key)));
    // the predator is never taller than the animal it attacks: next to a long-necked giant it has to look small
    const maxH = 0.9 * (d.box[3] - d.box[2]) * K;
    let HI = null, hunter = null, hwH = 380, hh = 0, HSTR = 1;
    if (live) {
      const KH = Math.min(fitK(hid, 400, 210), maxH / (ha.box[3] - ha.box[2])); hwH = (ha.box[1] - ha.box[0]) * KH;
      HI = GL.makeAuto(hid, { x: -900, y: GY + 4, s: KH, z: 2 });
      HSTR = GL.autoStride(HI, 'run') * KH;
    } else {
      const hm = MAN[hk]; hwH = Math.min(hwH, (maxH * hm.w) / hm.h); hh = (hwH * hm.h) / hm.w;
      hunter = G.spr(hk, sc, -900, 0, hwH, hh);
      hunter.style.filter = 'drop-shadow(0 6px 6px rgba(0,0,0,.4))';
    }
    const hit = G.h('div', 'hit', sc);
    const hand = UI.hand(G.ui, G.W / 2, G.H / 2, 'tap'); hand.style.display = 'none';
    // P.x is where the predator's snout is
    const S = { t: 0, got: 0, bites: 0, sw: -1, cd: 0, flinch: 0, done: false, first: true, early: 0 };
    const P = { x: -160, st: 'wait', t: 0.9, v: 0, ph: 0, back: 0, face: 1 };
    const blink = blinker();
    G.dbg = { S, P, Z, dino, R };
    G.say(`${Who} подкрадывается сзади! Когда он войдёт в круг — нажимай и бей хвостом!`);
    const inZone = () => (P.st === 'lunge' || P.st === 'stalk') && Math.abs(P.x - Z.x) <= R;
    const strike = () => {
      if (S.done || S.cd > 0) return;
      S.sw = 0; S.cd = 0.85; S.hitNow = inZone(); S.landed = false;
      AU.play('whoosh'); hand.style.display = 'none';
    };
    G.on(hit, 'pointerdown', () => { AU.unlock(); strike(); });
    const finish = async () => {
      S.done = true; AU.play('ok'); ring.style.opacity = 0;
      G.say(`Вот это удар! ${Who} больше не подойдёт.`);
      await G.wait(2.2); if (!G.alive(tok)) return;
      const stars = S.bites === 0 ? 3 : S.bites <= 2 ? 2 : 1;
      chFinish(C.n, stars, { stat: `Ударов хвостом: ${S.got} · ${who} подобрался: ${S.bites}`, note: p.note });
    };
    G.tick((dt) => {
      S.t += dt;
      if (S.cd > 0) S.cd -= dt;
      if (S.flinch > 0) S.flinch -= dt;
      const prog = S.got / NEED;
      // ---- the predator
      P.t -= dt;
      let gait = 'stand', hv = 0;
      if (P.st === 'wait') { if (P.t <= 0 && !S.done) { P.st = 'come'; P.x = -140; P.face = 1; } }
      else if (P.st === 'come') {
        hv = 340; P.x += hv * dt; gait = 'run';
        if (P.x >= Z.x - R - 150) { P.st = 'stalk'; P.t = G.rand(0.4, 1.2); }
      } else if (P.st === 'stalk') {
        if (P.back > 0) { P.back -= dt; P.x -= 160 * dt; }
        if (P.t <= 0) P.st = 'lunge';
      } else if (P.st === 'lunge') {
        hv = G.lerp(150, 215, prog); P.x += hv * dt; gait = 'run';
        if (S.first && Math.abs(P.x - Z.x) < R * 0.8) { const c = G.bgToWorld(Z.x, Z.y); hand.style.display = ''; hand.style.left = c.x + 'px'; hand.style.top = c.y + 'px'; S.first = false; }
        if (P.x > Z.x + R * 0.85 && S.sw < 0) {
          // too late: it got to the tail
          S.bites++; S.flinch = 0.5; AU.play('thud'); AU.play('alert'); G.fx.dust(P.x, Z.y + 20, 8);
          G.once('bite', `Ой! ${Who} подобрался слишком близко. Бей хвостом раньше!`);
          P.st = 'flee'; P.face = -1; P.x -= hwH;
        }
      } else if (P.st === 'hit') {
        P.v *= Math.exp(-5 * dt); P.x += P.v * dt;
        if (P.t <= 0) { P.st = 'flee'; P.face = -1; P.x -= hwH; }
      } else if (P.st === 'flee') {
        hv = 420; P.x -= hv * dt; gait = 'run';
        if (P.x < -120 - hwH) { P.st = 'wait'; P.t = G.rand(0.7, 1.3); if (S.got >= NEED && !S.done) finish(); }
      }
      ring.style.borderColor = inZone() ? 'rgba(255,214,120,.95)' : 'rgba(255,255,255,.55)';
      ring.style.transform = inZone() ? 'scale(1.08)' : '';
      // ---- the tail's blow lands a moment after the tap
      if (S.sw >= 0) {
        S.sw += dt;
        if (!S.landed && S.sw >= 0.17) {
          S.landed = true;
          if (S.hitNow && (P.st === 'lunge' || P.st === 'stalk')) {
            S.got++; top.counter.set(`${S.got} / ${NEED}`);
            AU.play('hit'); AU.play('thud'); G.fx.dust(P.x, Z.y + 10, 12); G.fx.sparkle(P.x - 10, Z.y, 14);
            if (S.got === 1 || S.got === NEED) AU.voiceOf(sp.id, { at: 0.15, vol: 0.6 });
            P.st = 'hit'; P.v = -620; P.t = 0.45;
            if (S.got === 2 && p.tip) G.say(p.tip);
          } else {
            AU.play('miss');
            // a swing through the air makes the predator step back and try again
            if (P.st === 'stalk' || (P.st === 'come' && P.x > Z.x - R - 320) || P.st === 'lunge') { P.st = 'stalk'; P.back = 0.35; P.t = G.rand(0.6, 1.1); }
            if (!S.done) G.once('early', `Рано! Жди, пока ${who} войдёт в круг.`);
          }
        }
        if (S.sw > 0.62) S.sw = -1;
      }
      // ---- draw the predator
      if (HI) {
        P.ph += (dt * 2 * Math.PI * hv) / HSTR;
        HI.flip = P.face < 0; HI.x = P.x - P.face * (hwH / 2); HI.y = GY + 4;
        const [hb, hf] = GL.autoGait(HI, gait, P.ph, S.t);
        if (P.st === 'hit') hb.pitch = (hb.pitch || 0) - 9 * G.clamp(P.t / 0.45, 0, 1);
        if (P.st === 'stalk') hb.head = 3 * Math.sin(S.t * 5);
        HI.pose(hb, hf);
      } else {
        const bob = gait === 'run' ? Math.abs(Math.sin(S.t * 9)) * -7 : 0, tilt = P.st === 'hit' ? -10 * G.clamp(P.t / 0.45, 0, 1) : 0;
        hunter.style.left = (P.face > 0 ? P.x - hwH * 0.96 : P.x - hwH * 0.04) + 'px'; hunter.style.top = GY - hh + 8 + bob + 'px';
        hunter.style.transformOrigin = '50% 100%'; hunter.style.transform = `scaleX(${P.face}) rotate(${tilt}deg)`;
      }
      // ---- the animal: it stands, sways its tail and strikes
      const [body, feet] = GL.autoGait(dino, 'stand', 0, S.t);
      if (S.sw >= 0) {
        const u = S.sw, A = u < 0.12 ? 26 * (u / 0.12) : u < 0.22 ? 26 - 46 * ((u - 0.12) / 0.1) : -20 * (1 - G.smooth(0.22, 0.62, u));
        body.tail = A; body.tailPh = 2.57; body.pitch = (body.pitch || 0) - 2.2 * Math.sin(Math.PI * G.clamp(u / 0.5, 0, 1));
      } else { body.tail = 4; body.tailPh = S.t * 1.7; }
      if (S.flinch > 0) body.pitch = (body.pitch || 0) + 3 * Math.sin(S.t * 22);
      body.head = (body.head || 0) + 1.5 * Math.sin(S.t * 1.3);
      dino.blink = blink(S.t, dt);
      dino.pose(body, feet);
    });
  },
};

/* ------------------------------------------------------------------ guard · the grown-up animal keeps its own nest (or calf) safe: tap the thieves to chase them off */
Scenes.guard = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 5), NEED = p.need || 10;
    const T = sp.type || (sp.id === 'eudimo' ? 'flyer' : sp.id === 'shoni' ? 'swim' : 'walker');
    const mode = p.mode || (T === 'swim' ? 'sea' : T === 'flyer' ? 'air' : T === 'glider' ? 'tree' : 'land');
    const sea = mode === 'sea', NX = 640, GY = sea ? 600 : G.floor(600, 52);
    const bgi = G.bgImg(p.bg || (sea ? 'bg_sea' : 'bg_forest'));
    if (!sea) G.lowerBg(bgi);
    shades(sc, 0.45, 0);
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: ['paw', `0 / ${NEED}`] });
    let treeEl = null;
    if (mode === 'tree') { // the glider's tree (a painted trunk, under the GL layer, so the animal clings in front of it)
      const TI = window.HATCH && HATCH.nest2 && HATCH.nest2.tree, ta = G.ATLAS.tree_glide;
      if (TI && ta) {
        const th = GY + 70, tw = (th * ta[3]) / ta[4];
        treeEl = G.spr('tree_glide', sc, NX - TI.cx * tw, GY + 50 - th, tw, th); treeEl.style.filter = 'drop-shadow(0 0 14px rgba(0,0,0,.35))';
      } else {
        const tr = G.h('div', 'abs', sc, { left: NX - 27, top: -20, width: 54, height: GY + 50, borderRadius: '10px', background: 'linear-gradient(90deg,#2a1f15,#5a4430 38%,#3d2e1f 70%,#241a12)' });
      }
    }
    GL.attach(sc);
    const S = { t: 0, got: 0, lost: 0, foes: [], nextT: 1.4, done: false, acts: [], blinks: [], roarT: -9, first: true };
    const blink = blinker();
    // ---- sizes. The nest and the eggs are in proportion to the animal: a big animal is drawn bigger and its nest smaller.
    // An egg grows much slower than its parent (about 4 cm for a half-metre animal, 10 cm for a five-metre one, 20 cm for a
    // giant), a nest is about four eggs wide. Drawn to true scale the nest of a giant would be a dot, so it is 2.6 times
    // bigger than life and never smaller than 96 px.
    const LEN = { shansi: 3.5, kther: 0.5, fruita: 0.15 }[sp.id] || (() => {
      const t = String((sp.final && sp.final.len) || ''), m = t.replace(/,/g, '.').match(/\d+(\.\d+)?/g);
      return m ? parseFloat(m[m.length - 1]) * (/\d\s*см/.test(t) ? 0.01 : 1) * (/крыль/.test(t) ? 0.6 : 1) : 2;
    })();
    const BW = G.clamp(300 + 60 * Math.log2(Math.max(0.2, LEN)), 230, 540), BOX = [BW, Math.min(330, BW * 0.62)];
    const bodyPx = mode !== 'land' ? 0 : sp.auto ? (MAN.auto[sp.id].box[1] - MAN.auto[sp.id].box[0]) * fitK(sp.id, BOX[0], BOX[1]) : 480;
    const nestM = (0.05 * Math.pow(LEN, 0.45)) / 0.24;
    const NWL = bodyPx ? G.clamp((2.6 * nestM * bodyPx) / LEN, 96, 250) : mode === 'air' ? 140 : 250;   // a flyer is drawn about 280 px across its wings
    // ---- the family: eggs in a shallow nest, or a calf next to its mother
    let eggs = [], calf = null, CX = NX, CY = GY;
    if (sea) {
      CX = NX - 40; CY = 470;
    } else {
      // the animal's own kind of nest and eggs (js/hatch.js); the eggs stay small next to the grown-up animal
      const HT = window.HATCH, EK = HT && HT.grp[sp.id], EG = EK && HT.egg[EK], na = EK && G.ATLAS['nest_' + EK];
      const n2 = EK && G.ATLAS['nestegg_' + EK], N2 = EK && HT.nest2 && HT.nest2[EK];
      let eggKey = 'egg', eggAsp = MAN.egg.w / MAN.egg.h;
      if (n2 && N2) {
        // the whole nest with its eggs inside, seen from low down like the rest of the scene. A glider's nest lies in
        // the ground at the roots of its tree: today's flying lizards also climb down to bury their eggs there
        const NW = mode === 'tree' ? 120 : NWL, NH = (NW * n2[4]) / n2[3], nx = mode === 'tree' ? NX + 80 : NX, dy = 22 * (NW / 250);
        const nest = G.spr('nestegg_' + EK, sc, nx - NW / 2, GY + (treeEl ? 14 : dy) - N2.bottom * NH, NW, NH);
        if (treeEl) sc.insertBefore(nest, treeEl);      // the nest lies behind the roots of the tree
        nest.style.filter = 'drop-shadow(0 6px 6px rgba(0,0,0,.4))'; nest.style.transformOrigin = '50% 92%';
        eggs = [{ el: nest, r: 0, x: nx, y: GY + dy - NH * 0.6, amp: 0.3 }];
        CX = nx; CY = GY - 20;
      } else if (EG && na) {
        const FLOOR = { round: 0.5, theropod: 0.42, feathered: 0.4, armored: 0.36, soft: 0.46, ptero: 0.42, croc: 0.34, turtle: 0.44 }[EK] || 0.42;
        const NW = mode === 'tree' ? 100 : 210 * (NWL / 250), NH = (NW * na[4]) / na[3];
        const nest = G.spr('nest_' + EK, sc, NX - NW / 2, GY + 10 - FLOOR * NH, NW, NH);
        nest.style.filter = 'drop-shadow(0 5px 6px rgba(0,0,0,.4))';
        eggKey = 'egg_' + EK; eggAsp = EG.w / EG.h;
      } else {
        G.h('div', 'abs', sc, { left: NX - 90, top: GY - 14, width: 180, height: 40, borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 50%, rgba(48,32,16,.8), rgba(48,32,16,.4) 55%, rgba(48,32,16,0) 72%)' });
      }
      const eh0 = mode === 'tree' ? 20 : 41 * (NWL / 250);
      if (!eggs.length) eggs = [[-1, -12], [0, 4], [1, 14]].map(([k, r], i) => {
        const h = i === 1 ? eh0 * 1.08 : eh0, w = h * eggAsp, x = NX + k * Math.max(w, eh0 * 0.72) * 0.86, y = GY + 14 - (i === 1 ? 8 : 0);
        const el = G.spr(eggKey, sc, x - w / 2, y - h, w, h);
        el.style.filter = 'drop-shadow(0 4px 4px rgba(0,0,0,.45))'; el.style.transformOrigin = '50% 90%'; el.style.transform = `rotate(${r}deg)`;
        return { el, r, x, y: y - h / 2 };
      });
      if (!(n2 && N2)) { CX = NX; CY = GY - 20; }
    }
    // ---- the parent
    // a walking parent waits beside its nest, looking at it, not standing in it
    const HX = mode === 'land' ? NX + 175 : NX;
    const P = { x: HX, y: GY, face: mode === 'land' ? -1 : 1, sw: null, home: [HX, GY] };
    let W = null, it = null, pf = null, axis = 0;
    if (mode === 'land') {
      W = walker({ x: HX, y: GY, z: 3, flip: true }, BOX);
      it = W.it; P.walkPh = 0;
      // big animals wait further from the nest, so they never stand in it
      const bw = sp.auto ? (MAN.auto[sp.id].box[1] - MAN.auto[sp.id].box[0]) * W.K : 300;
      P.home[0] = P.x = P.tx = it.x = Math.min(1270 - bw * 0.5, NX + NWL / 2 + 26 + bw * 0.5);   // the whole animal stays on the screen
    } else if (mode === 'air') {
      it = flyer({ x: NX, y: 300, s: 0.2 }); P.home = [NX, 300]; P.x = NX; P.y = 300; P.A = 0.3; P.ph = 0;
    } else if (mode === 'tree') {
      const d = MAN.auto[sp.id], M = GL.autoModel(sp.id);
      pf = Pose.auto(sp.id); axis = Math.atan2(d.d[1], d.d[0]);
      it = GL.sprite('sp_' + sp.id, GL.RIGS.auto(sp.id), { ax: M.ax, ay: M.ay, s: fitK(sp.id, 200, 160), z: 4 });
      P.home = [NX - 24, 400]; P.x = P.home[0]; P.y = P.home[1]; P.ph = 0;
    } else {
      it = swimmer({ x: NX + 70, y: 360, s: 0.3, z: 3 }, sp.auto ? 470 : 0); P.home = [NX + 70, 360]; P.x = P.home[0]; P.y = P.home[1];
      calf = swimmer({ x: CX, y: CY, s: sp.auto ? it.s * 0.3 : 0.1, z: 5 });
    }
    G.dbg = { S, it, mode };
    // ---- the thieves
    const FOE = { it_cyno: ['зверёк', 140], it_lizard: ['ящерица', 150], it_fish: ['хищная рыба', 210], sp_coelo: ['целофизис', 220], sp_notho: ['нотозавр', 300], nb_eoraptor: ['эораптор', 200],
      nb_compsognathus: ['компсогнат', 190], nb_amphitherium: ['зверёк', 140], it_mammal: ['зверёк', 140], nb_bernissartia: ['крокодильчик', 210],
      nb_squalicorax: ['акула', 280], nb_repenomamus: ['зверь', 190], nb_beelzebufo: ['лягушка', 190],
      nb_vincelestes: ['зверёк', 160], nb_noasaurus: ['ноазавр', 220],
      nb_goniopholis: ['крокодил', 230], nb_spinolestes: ['зверёк', 150], nb_meyasaurus: ['ящерица', 150], nb_kogaionon: ['зверёк', 150],
      nb_isisfordia: ['крокодил', 200], nb_confractosuchus: ['крокодил', 240],
      nb_bambiraptor: ['бамбираптор', 200], nb_gobiconodon: ['зверь', 170], nb_paluxysuchus: ['крокодил', 230],
      nb_sanajeh: ['змея', 250], nb_deccanolestes: ['зверёк', 130], sp_eupark: ['эупаркерия', 230] };
    // a snake glides along the ground, it does not hop
    const SLIDE = new Set(['nb_sanajeh', 'nb_najash']);
    const kinds = p.foes || (sea ? ['it_fish'] : mode === 'tree' ? ['it_lizard'] : ['it_cyno', 'it_lizard']);
    const hand = UI.hand(G.ui, G.W / 2, G.H / 2, 'tap'); hand.style.display = 'none';
    const reachR = sea ? 95 : 70 + (mode === 'tree' ? 0 : 50);
    const spawn = () => {
      const key = kinds[Math.floor(G.rand(0, kinds.length))], info = FOE[key] || ['хищник', 160];
      const w = mode === 'tree' && !sea ? Math.round(info[1] * 0.8) : info[1], c = critter(key, sc, w), side = G.rand(0, 1) < 0.5 ? -1 : 1;
      const pr = S.got / NEED, v = G.lerp(sea ? 80 : 88, sea ? 120 : 135, pr) + G.rand(-8, 8);
      const y = sea ? G.rand(320, 540) : GY + 10;
      const f = { key, name: info[0], c, side, v, x: side < 0 ? -w * 0.6 : 1280 + w * 0.6, y, y0: y, ph: G.rand(0, 6), state: 'come', op: 1, t: 0 };
      f.hit = G.h('div', 'abs', sc, { width: w + 70, height: c.h + 90, cursor: 'pointer' });
      G.on(f.hit, 'pointerdown', (e) => { e.stopPropagation(); AU.unlock(); scare(f); });
      S.foes.push(f);
    };
    const drop = (f) => { f.c.el.remove(); f.hit.remove(); const i = S.foes.indexOf(f); if (i >= 0) S.foes.splice(i, 1); };
    // the parent rushes at a thief
    const rush = (f) => {
      const side = f.x < CX ? -1 : 1;
      if (mode === 'land') { P.tx = G.clamp(CX + side * 130, 200, 1080); P.target = f; }
      else {
        const tx = sea ? f.x - side * 90 : f.x - side * 40, ty = sea ? f.y : GY - (mode === 'tree' ? 30 : 70);
        P.sw = { t: 0, dur: mode === 'tree' ? 1.0 : 0.9, x0: P.x, y0: P.y, x1: tx, y1: ty };
        P.face = tx < P.x ? -1 : 1;
        AU.play('whoosh');
      }
      if (S.t - S.roarT > 1.6 && !sea && mode === 'land') { AU.voiceOf(sp.id); S.roarT = S.t; } else AU.play('snap');
      S.acts.push({ type: sea ? 'snap' : mode === 'land' ? 'roar' : 'jaw', t0: S.t + (mode === 'land' ? 0.15 : 0.35), dur: 0.5 });
    };
    const scare = (f) => {
      if (S.done || f.state !== 'come') return;
      hand.style.display = 'none';
      f.state = 'flee'; S.got++; top.counter.set(`${S.got} / ${NEED}`);
      UI.popText(sc, 'Кыш!', f.x, f.y - (sea ? 50 : f.c.h + 30), '#F2B640', 32);
      G.fx.dust(f.x, sea ? f.y : GY + 6, 8, sea ? 'rgba(220,240,255,' : 'rgba(170,140,100,');
      rush(f);
      if (S.got === 3) G.say(sea ? 'Молодец! Малыш держится рядом с мамой.' : 'Молодец! Гнездо под охраной.');
      if (S.got >= NEED) finish();
    };
    const steal = (f) => {
      f.state = 'sniff'; f.t = 0; S.lost++; AU.play('alert');
      G.once('nest', sea ? 'Ой! Хищник подплыл к малышу. Прогоняй их раньше!' : `Ой! ${f.name[0].toUpperCase() + f.name.slice(1)} у гнезда! Прогоняй воришек раньше.`);
      if (sea && calf) { const x0 = calf.x, y0 = calf.y; G.tween(0.5, (e) => { calf.x = G.lerp(x0, CX + 40, e); calf.y = G.lerp(y0, CY - 30, e); }); }
      for (const e of eggs) { const el = e.el; G.tween(0.5, (k) => { el.style.transform = `rotate(${e.r + 9 * (e.amp || 1) * Math.sin(k * Math.PI * 4) * (1 - k)}deg)`; }); }
      rush(f);
    };
    const finish = async () => {
      S.done = true; AU.play('ok');
      for (const f of S.foes) if (f.state === 'come') f.state = 'flee';
      if (sea) G.say(AU.alt(`Малыш в безопасности! ${G.fm('Твой', 'Твоя')} ${sp.name.toLowerCase()} — ${G.fm('заботливый родитель', 'заботливая мама')}.`, 'Малыш в безопасности! Ему повезло с родителями.'));
      else {
        G.say('Все воришки убежали! Скоро из яиц вылупятся малыши.');
        AU.play('hatch');
        eggs.forEach((e, i) => { G.fx.sparkle(e.x, e.y, e.amp ? 16 : 8); const el = e.el; G.tween(1.2, (k) => { el.style.transform = `rotate(${e.r + 10 * (e.amp || 1) * Math.sin(k * Math.PI * 6 + i) * (1 - k)}deg)`; }); });
      }
      await G.wait(2.4); if (!G.alive(tok)) return;
      const stars = S.lost === 0 ? 3 : S.lost <= 2 ? 2 : 1;
      chFinish(C.n, stars, { stat: `Прогнано: ${S.got} · ${sea ? 'подплыли к малышу' : 'добрались до гнезда'}: ${S.lost}`,
        note: mode === 'tree' ? 'Сегодняшние летучие ящерицы живут на деревьях, но яйца закапывают в землю у корней — и сторожат их целые сутки.' : undefined });
    };
    G.say(sea ? AU.alt(`Теперь у ${sp.gen} свой малыш! Хищники хотят его схватить — нажимай на них, чтобы прогнать.`, 'Теперь у тебя свой малыш! Хищники хотят его схватить — нажимай на них, чтобы прогнать.')
      : AU.alt(`Теперь у ${sp.gen} своё гнездо с яйцами! Воришки хотят их утащить — нажимай на них, чтобы прогнать.`, 'Теперь у тебя своё гнездо с яйцами! Воришки хотят их утащить — нажимай на них, чтобы прогнать.'));
    G.tick((dt) => {
      S.t += dt;
      // ---- thieves come, sniff, flee
      if (!S.done) {
        S.nextT -= dt;
        const live = S.foes.filter((f) => f.state === 'come').length, cap = S.got < NEED * 0.4 ? 2 : 3;
        if (S.nextT <= 0 && live < cap) { spawn(); S.nextT = G.lerp(2.4, 1.4, S.got / NEED) + G.rand(-0.3, 0.4); }
      }
      for (const f of S.foes.slice()) {
        f.ph += dt * (sea ? 5 : 13); f.t += dt;
        if (f.state === 'come') {
          const dx = CX - f.x, dy = sea ? CY - f.y : 0, dist = Math.hypot(dx, dy);
          if (dist < reachR) steal(f);
          else { f.x += (dx / dist) * f.v * dt; if (sea) f.y += (dy / dist) * f.v * dt; }
          if (S.first && Math.abs(f.x - CX) < 460) S.first = false;
        } else if (f.state === 'sniff') {
          if (f.t > 0.6) f.state = 'flee';
        } else {
          f.x += f.side * f.v * 2.6 * dt; f.op = Math.max(0, f.op - dt * 0.8); f.c.el.style.opacity = f.op;
          if (f.x < -260 || f.x > 1540 || f.op <= 0) { drop(f); continue; }
        }
        const face = f.state === 'flee' ? f.side : -f.side, bob = sea || SLIDE.has(f.key) ? 0 : -Math.abs(Math.sin(f.ph)) * 4;
        const yb = sea ? f.y + f.c.h / 2 + Math.sin(f.ph) * 4 : f.y;
        f.c.place(f.x, yb, face, bob);
        f.hit.style.display = f.state === 'come' ? '' : 'none';
        f.hit.style.left = f.x - (f.c.w + 70) / 2 + 'px'; f.hit.style.top = yb - f.c.h - 45 + 'px';
      }
      // until the first thief is chased off, a finger points at the nearest one
      if (!S.first && S.got === 0 && !S.done) {
        let hf = null; for (const f of S.foes) if (f.state === 'come' && (!hf || Math.hypot(f.x - CX, f.y - CY) < Math.hypot(hf.x - CX, hf.y - CY))) hf = f;
        hand.style.display = hf ? '' : 'none';
        if (hf) { const w = G.bgToWorld(hf.x, hf.y - (sea ? 0 : hf.c.h / 2)); hand.style.left = w.x + 'px'; hand.style.top = w.y + 'px'; }
      }
      // ---- the parent
      if (mode === 'land') {
        const d = P.tx - P.x, step = 330 * dt;
        let body, feet;
        if (Math.abs(d) > 2) {
          P.x += Math.sign(d) * Math.min(step, Math.abs(d)); P.face = Math.sign(d);
          P.walkPh += (dt * 2 * Math.PI * 330) / W.stride;
          [body, feet] = W.walk(P.walkPh);
        } else {
          [body, feet] = W.stand(S.t);
          if (P.target) { P.target = null; P.backT = 0.55; }
          else if (P.backT === undefined) { let nf = null; for (const f of S.foes) if (f.state === 'come' && (!nf || Math.abs(f.x - P.x) < Math.abs(nf.x - P.x))) nf = f; if (nf && Math.abs(nf.x - P.x) > 40) P.face = Math.sign(nf.x - P.x); }
          if (P.backT !== undefined) { P.backT -= dt; if (P.backT <= 0) { P.backT = undefined; P.tx = P.home[0]; } }
        }
        let hd = 0, nk = 0;
        for (const a of S.acts) { const s = (S.t - a.t0) / a.dur; if (s > 0 && s < 1) { const b = G.bump(s); hd += -8 * b; nk += -4 * b; } }
        body.head = (body.head || 0) + hd; body.neck = (body.neck || 0) + nk;
        GL.face(it, P.face, dt); it.x = P.x; it.blink = blink(S.t, dt);
        it.pose(body, feet);
      } else {
        let x = P.home[0], y = P.home[1], out = 0;
        if (P.sw) {
          const q = P.sw; q.t += dt;
          const e = Math.min(1, q.t / q.dur), go = e < 0.45 ? G.ease.inOut(e / 0.45) : e < 0.55 ? 1 : 1 - G.ease.inOut((e - 0.55) / 0.45);
          x = G.lerp(P.home[0], q.x1, go); y = G.lerp(P.home[1], q.y1, go) - (sea ? 0 : 40 * Math.sin(Math.PI * go));
          out = Math.sin(Math.PI * Math.min(1, e / 0.55));
          if (e >= 0.55) P.face = P.home[0] < q.x1 ? -1 : 1;
          if (e >= 1) { P.sw = null; P.face = 1; }
        }
        P.x = x; P.y = y;
        if (mode === 'air') {
          const flapping = !!P.sw;
          P.A = G.lerp(P.A, flapping ? 1 : 0.35, Math.min(1, dt * 6));
          P.ph += dt * 2 * Math.PI * (flapping ? 2.6 : 1.3);
          const ps = it.flapPose(S.t, S.acts, S.blinks, P.A, P.ph);
          it.mesh.deform(ps); it.blink = ps.blink || 0;
          it.x = x; it.y = y + (P.sw ? 0 : Math.sin(S.t * 1.6) * 10); it.flip = P.face < 0; it.rot = (P.face < 0 ? -1 : 1) * 0.12 * out;
        } else if (mode === 'tree') {
          const gl = !!P.sw;
          P.ph += dt * (gl ? 3 : 1.2);
          const ps = pf(S.t, S.acts, [], { A: gl ? 0.06 : 0.02, ph: P.ph });
          if (!gl || out < 0.15) { ps.wingU = -0.3; ps.wingD = -0.3; }
          it.mesh.deform(ps);
          const r = gl && out >= 0.15 ? -axis + 0.25 * out : -axis - 1.2;
          it.flip = gl && out >= 0.15 && P.face < 0; it.rot = it.flip ? -r : r;
          it.x = x; it.y = y;
        } else {
          const ps = it.swimPose(S.t, S.acts, S.blinks, P.sw ? 0.9 : 0.35);
          it.mesh.deform(ps); it.blink = ps.blink || 0;
          it.flip = P.face < 0; it.x = x + (P.sw ? 0 : Math.sin(S.t * 0.4) * 16); it.y = y + (P.sw ? 0 : Math.sin(S.t * 0.8) * 8); it.rot = 0;
          const cp = calf.swimPose(S.t * 1.3, [], S.blinks, 0.7);
          calf.mesh.deform(cp); calf.blink = cp.blink || 0;
          calf.x = G.lerp(calf.x, CX + Math.sin(S.t * 0.9) * 18, Math.min(1, dt * 0.8)); calf.y = G.lerp(calf.y, CY + Math.sin(S.t * 1.3) * 10, Math.min(1, dt * 0.8));
        }
      }
    });
  },
};
