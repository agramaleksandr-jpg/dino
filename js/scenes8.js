'use strict';
/* The games of the eighth wave (the Cretaceous of North America, the second package).
   care  · a hadrosaur mother brings food to her babies in the nest (Maiasaura, «the good mother lizard»)
   drink · a giant crocodile waits in the river for animals that come to drink (Deinosuchus)
   tosea · a sea-turtle hatchling crawls from its nest to the sea past the crabs of the beach (Archelon)
   lay   · a grown sea turtle comes ashore at night, digs a pit, lays her eggs, covers them and goes back to the sea (Archelon) */

/* ------------------------------------------------------------------ care · feed the babies in the nest.
   Babies of Maiasaura were found in their nests already grown and with worn teeth: scientists think they stayed in the nest and
   their parents brought them food. Tap a plant — the mother walks there and picks a mouthful. Tap a baby that asks for food (a leaf
   over its head) — she feeds it. A baby that has just eaten turns away. */
const CARE = { V: 150, BEND: 34, FX: 330, RIM: 0.34, FLOOR: 0.4, NW: 500, KID: 0.82 };
Scenes.care = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 5), NEED = p.need || 6, GY = G.floor(620, 40), NX = p.nx || 330;
    G.lowerBg(G.bgImg(p.bg || 'bg_cnam_colony'));
    shades(sc, 0.45, 0);
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: ['leaf', `0 / ${NEED}`] });
    // the nest of the animal's kind (js/hatch.js) lies under the GPU layer, so the babies stand in it
    // (p.nest: another kind of nest — the maiasaura's is a mound of earth and plants, like the mounds of the colony)
    const HT = window.HATCH, EK = p.nest || (HT && HT.grp[sp.id]) || 'round', na = G.ATLAS['nest_' + EK];
    const NW = CARE.NW, NH = na ? (NW * na[4]) / na[3] : 230, NTOP = GY + 40 - NH;
    if (na) { const n = G.spr('nest_' + EK, sc, NX - NW / 2, NTOP, NW, NH); n.style.filter = 'drop-shadow(0 6px 6px rgba(0,0,0,.4))'; }
    GL.attach(sc);
    // the front rim of the nest over the GPU layer: the babies stand in the nest, their feet hidden by its edge
    if (na) {
      const r = G.spr('nest_' + EK, sc, NX - NW / 2, NTOP, NW, NH), m = `linear-gradient(rgba(0,0,0,0) ${Math.round(CARE.RIM * 100 - 4)}%, #000 ${Math.round(CARE.RIM * 100 + 4)}%)`;
      r.style.webkitMaskImage = m; r.style.maskImage = m; r.style.pointerEvents = 'none';
    }
    const W = walker({ x: NX + CARE.FX + 200, y: GY, z: 4, flip: true }, [600, 370]);
    const mom = W.it, HEAD = W.HEAD, NECK = W.NECK, blink = blinker();
    const rot = (v, c, a) => { const s = Math.sin(a), co = Math.cos(a), dx = v[0] - c[0], dy = v[1] - c[1]; return [c[0] + co * dx - s * dy, c[1] + s * dx + co * dy]; };
    // the mouth in the world for a neck bend th (degrees, + down) and a facing
    const mouthAt = (x, face, th) => { const h = rot(HEAD, NECK, th * DEG); return [x + face * h[0], GY + h[1]]; };
    // the babies: young of the same animal in the nest, looking about; a hungry one stretches up and calls
    // two babies at the back of the nest, one in front (big enough for a child to see which one asks for food)
    const FLOOR = NTOP + NH * CARE.FLOOR;
    const kids = [[-150, -14, -1, 0.9], [150, -12, 1, 0.9], [20, 10, -1, 1]].map(([dx, dy, f, k], i) => {
      const b = GL.autoBaby(sp.id, { x: NX + dx, y: FLOOR + dy, z: 3 + i * 0.1, flip: f < 0 });
      b.it.s = b.s * CARE.KID * k;
      const len = b.it.s * (MAN.auto[sp.id].box[1] - MAN.auto[sp.id].box[0]);
      // a hungry baby asks for food: a light bubble with a leaf over its head
      const bub = G.h('div', 'abs', sc, { width: 60, height: 60, borderRadius: '50%', display: 'none', alignItems: 'center', justifyContent: 'center',
        background: '#fffaf0', border: '3px solid #bfe3a8', boxShadow: '0 4px 10px rgba(0,0,0,.3)', pointerEvents: 'none', color: '#3c8a3a',
        animation: 'pulse 0.9s ease-in-out infinite' }, icon('leaf', ' style="width:34px;height:34px"'));
      return { i, b, x: NX + dx, y: FLOOR + dy, face: f, len, hungry: false, full: 0, eat: 0, turn: 0, bub, ph: G.rand(0, 6) };
    });
    // where a baby's head is (a tap in the nest goes to the nearest head)
    const headOf = (k) => [k.x + (k.turn > 0.5 ? -k.face : k.face) * k.len * 0.3, k.y - k.len * 0.28];
    // the plants about the colony: three at a time, a picked one grows again elsewhere
    const FOOD = p.food || ['it_berries', 'it_fern'], SPOTS = [720, 840, 960, 1080, 1190];
    const plants = [];
    const S = { t: 0, x: NX + CARE.FX + 200, tx: null, face: -1, walkPh: 0, th: 0, mode: 'idle', mt: 0, carry: null, carryEl: null, target: null,
      fed: 0, oops: 0, next: 0, nextT: 0, done: false, last: -1 };
    G.dbg = { S, kids, plants, mom };
    const hand = UI.hand(G.ui, 700, GY - 30, 'tap'); hand.style.display = 'none';
    const grow = (x) => {
      const key = FOOD[Math.floor(G.rand(0, FOOD.length))], y = GY + G.rand(-6, 22);
      const el = G.h('div', 'abs pe', sc, { left: x - 52, top: y - 92, width: 104, height: 104, cursor: 'pointer', opacity: 0, transition: 'opacity .4s' });
      glowImg(key, el, 52, 60, 84, 'drop-shadow(0 0 6px rgba(160,255,140,.8))');
      const q = { x, y, key, el };
      G.on(el, 'pointerdown', (e) => { e.stopPropagation(); AU.unlock(); pick(q); });
      requestAnimationFrame(() => { el.style.opacity = 1; });
      plants.push(q);
      return q;
    };
    const freeSpot = () => {
      const ok = SPOTS.filter((x) => plants.every((q) => Math.abs(q.x - x) > 90) && Math.abs(x - S.x) > 60);
      return ok.length ? ok[Math.floor(G.rand(0, ok.length))] : null;
    };
    for (let k = 0; k < 3; k++) { const x = freeSpot(); if (x !== null) grow(x); }
    // walk so that the mouth, bent down, comes over x
    // (she walks head first and turns to the plant or the nest when she is there)
    const goTo = (x, cb) => {
      const off = mouthAt(0, 1, CARE.BEND)[0];
      let face = x < S.x - off * 0.5 ? -1 : 1;
      let tx = G.clamp(x - face * off, NX + NW / 2 + 150, 1240);
      if (face > 0 && x - tx < off * 0.5) { face = -1; tx = G.clamp(x + off, NX + NW / 2 + 150, 1240); }
      S.endFace = face; S.after = cb;
      if (Math.abs(tx - S.x) < 4) { S.face = face; S.mode = 'idle'; cb(); return; }
      S.tx = tx; S.face = tx < S.x ? -1 : 1; S.mode = 'walk';
    };
    const pick = (q) => {
      if (S.done || S.mode !== 'idle') return;
      if (S.carry) { G.once('carrying', 'У мамы уже есть еда. Отнеси её малышу!'); return; }
      hand.style.display = 'none';
      goTo(q.x, () => {
        S.mode = 'bend'; S.mt = 0; S.target = q;
        AU.play('pop');
      });
    };
    const takeFood = (q) => {
      const i = plants.indexOf(q); if (i >= 0) plants.splice(i, 1);
      q.el.remove();
      S.carry = q.key;
      const m = MAN[q.key], w = 70, h = (w * m.h) / m.w;
      S.carryEl = G.spr(q.key, sc, 0, 0, w, h); S.carryEl.style.pointerEvents = 'none'; S.carryEl.style.filter = 'drop-shadow(0 2px 3px rgba(0,0,0,.4))';
      S.carryW = w; S.carryH = h;
      G.wait(2.4).then(() => { if (G.alive(tok) && !S.done) { const x = freeSpot(); if (x !== null) grow(x); } });
      const hk = kids.find((k) => k.hungry);
      if (hk && S.fed === 0) { const [hx, hy] = headOf(hk); hand.style.left = hx + 'px'; hand.style.top = hy + 'px'; hand.style.display = ''; }
    };
    const feed = (k) => {
      if (S.done || S.mode !== 'idle') return;
      if (!S.carry) { G.once('carefood', 'Сначала найди еду — нажми на растение!'); return; }
      if (!k.hungry) {
        S.oops++; AU.play('miss'); k.turn = 1;
        G.once('carefull', 'Этот малыш уже сыт. Покорми того, у кого над головой листик!');
        return;
      }
      hand.style.display = 'none';
      goTo(NX + NW / 2 + 10, () => {
        S.mode = 'give'; S.mt = 0; S.target = k; AU.play('pop');
      });
    };
    const nestHit = G.h('div', 'abs pe', sc, { left: NX - NW / 2, top: NTOP - 170, width: NW, height: NH + 150, cursor: 'pointer' });
    G.on(nestHit, 'pointerdown', (e) => {
      e.stopPropagation(); AU.unlock();
      const q = G.bgPt(e);
      let best = null, bd = 1e9;
      for (const k of kids) { const [hx, hy] = headOf(k), dd = Math.hypot(hx - q.x, (hy - q.y) * 0.7) - (k.hungry ? 40 : 0); if (dd < bd) { bd = dd; best = k; } }
      if (best) feed(best);
    });
    const hungry = () => {
      const free = kids.filter((k) => !k.hungry && k.i !== S.last);
      const k = free.length ? free[Math.floor(G.rand(0, free.length))] : kids.find((q) => !q.hungry);
      if (!k) return;
      k.hungry = true; k.bub.style.display = 'flex'; AU.baby(G.cur());
    };
    const finish = async () => {
      S.done = true; AU.play('ok'); AU.voiceOf(sp.id, { at: 0.3, vol: 0.5 });
      G.say(p.win || 'Все малыши сыты и довольны!');
      await G.wait(2.8); if (!G.alive(tok)) return;
      const stars = S.oops === 0 ? 3 : S.oops <= 2 ? 2 : 1;
      chFinish(C.n, stars, { stat: `Покормлено малышей: ${S.fed} · ошибок: ${S.oops}` });
    };
    const hit = G.h('div', 'hit', sc);
    sc.insertBefore(hit, sc.firstChild.nextSibling);
    G.on(hit, 'pointerdown', () => { AU.unlock(); if (!S.done && !S.carry && S.mode === 'idle') G.once('carefood', 'Сначала найди еду — нажми на растение!'); });
    G.say(p.intro ? AU.alt(p.intro[0], p.intro[1]) : AU.alt('Малыши в гнезде проголодались! Нажми на растение — мама сорвёт листья. Потом нажми на малыша, который просит есть.',
      'Нажми на растение, а потом — на голодного малыша!'));
    G.wait(0.8).then(() => { if (!G.alive(tok)) return; hungry(); const q = plants[0]; if (q) { hand.style.left = q.x + 'px'; hand.style.top = q.y - 40 + 'px'; hand.style.display = ''; } });
    G.tick((dt) => {
      S.t += dt;
      // the mother
      let body, feet;
      if (S.mode === 'walk') {
        const dx = S.tx - S.x, st = CARE.V * dt;
        if (Math.abs(dx) <= st) { S.x = S.tx; S.tx = null; S.mode = 'idle'; S.face = S.endFace || S.face; const cb = S.after; S.after = null; if (cb) cb(); }
        else { S.x += Math.sign(dx) * st; S.walkPh += (2 * Math.PI * st) / W.stride; }
        S.th += (0 - S.th) * Math.min(1, dt * 6);
      } else if (S.mode === 'bend') {
        S.mt += dt;
        const e = S.mt < 0.45 ? G.ease.inOut(S.mt / 0.45) : S.mt < 0.75 ? 1 : 1 - G.ease.inOut(Math.min(1, (S.mt - 0.75) / 0.4));
        S.th = CARE.BEND * e;
        if (S.mt >= 0.6 && S.target) { takeFood(S.target); S.target = null; }
        if (S.mt >= 1.15) { S.mode = 'idle'; S.th = 0; }
      } else if (S.mode === 'give') {
        S.mt += dt;
        const e = S.mt < 0.45 ? G.ease.inOut(S.mt / 0.45) : S.mt < 0.9 ? 1 : 1 - G.ease.inOut(Math.min(1, (S.mt - 0.9) / 0.4));
        S.th = (CARE.BEND - 6) * e;
        const k = S.target;
        if (S.mt >= 0.55 && k && S.carry) {
          // the food goes from the mother's mouth to the baby
          const [hx, hy] = headOf(k), el = S.carryEl, x0 = parseFloat(el.style.left), y0 = parseFloat(el.style.top), x1 = hx - S.carryW / 2, y1 = hy - S.carryH / 2;
          S.carry = null; S.carryEl = null;
          G.tween(0.35, (u) => { el.style.left = G.lerp(x0, x1, u) + 'px'; el.style.top = G.lerp(y0, y1, u) - 30 * Math.sin(Math.PI * u) + 'px'; el.style.transform = `scale(${1 - 0.5 * u})`; })
            .then(() => {
              el.remove(); if (!G.alive(tok)) return;
              k.hungry = false; k.bub.style.display = 'none'; k.eat = 1; S.fed++; S.last = k.i;
              top.counter.set(`${Math.min(S.fed, NEED)} / ${NEED}`); AU.play('gulp'); G.fx.sparkle(k.x, k.y - 60, 10);
              if (S.fed === 1) G.say(p.first || 'Ам! Малыш наелся. Смотри — проголодался другой!');
              if (S.fed >= NEED) finish(); else S.nextT = 1.1;
            });
        }
        if (S.mt >= 1.35) { S.mode = 'idle'; S.th = 0; S.target = null; }
      }
      if (S.nextT > 0) { S.nextT -= dt; if (S.nextT <= 0 && !S.done && !kids.some((k) => k.hungry)) hungry(); }
      if (S.mode === 'walk') [body, feet] = W.walk(S.walkPh); else [body, feet] = W.stand(S.t);
      body.neck = (body.neck || 0) + S.th + 1.5 * Math.sin(S.t * 1.1); body.head = (body.head || 0) + S.th * 0.3;
      mom.x = S.x; mom.flip = S.face < 0; mom.blink = blink(S.t, dt); mom.pose(body, feet);
      if (S.carryEl) {
        const [mx, my] = mouthAt(S.x, S.face, S.th);
        S.carryEl.style.left = mx - S.carryW / 2 + 'px'; S.carryEl.style.top = my - S.carryH * 0.55 + 'px';
      }
      // the babies
      for (const k of kids) {
        k.ph += dt;
        if (k.eat > 0) k.eat = Math.max(0, k.eat - dt * 0.9);
        if (k.turn > 0) k.turn = Math.max(0, k.turn - dt * 0.8);
        const it = k.b.it, [bp, bf] = GL.autoGait(it, 'stand', 0, S.t + k.i);
        if (k.hungry) { bp.neck = (bp.neck || 0) - 16 - 4 * Math.sin(k.ph * 9); bp.head = (bp.head || 0) - 10 - 6 * Math.sin(k.ph * 9 + 0.6); }
        else if (k.eat > 0) { const s = Math.sin(k.ph * 14) * k.eat; bp.neck = (bp.neck || 0) + 10 * k.eat + 4 * s; bp.head = (bp.head || 0) + 6 * s; }
        else { bp.neck = (bp.neck || 0) + 3 * Math.sin(k.ph * 0.9); bp.head = (bp.head || 0) + 4 * Math.sin(k.ph * 1.3); }
        it.flip = (k.turn > 0.5 ? -k.face : k.face) < 0;
        it.pose(bp, bf);
        if (k.hungry) { const [hx, hy] = headOf(k); k.bub.style.left = hx - 30 + 'px'; k.bub.style.top = hy - 120 + Math.sin(k.ph * 3) * 4 + 'px'; }
      }
    });
  },
};

/* ------------------------------------------------------------------ drink · a giant crocodile ambushes animals that come to drink.
   Deinosuchus lay in the water with only its eyes and nostrils above it. Hold the finger — it glides closer; when the animal on the
   bank lifts its head and looks about, let go and keep still. When it is close and the animal drinks — tap: a lunge from the water.
   Bite marks of Deinosuchus are known on bones of dinosaurs and on shells of turtles. */
const DRINK = { WY: 418, V: 95, REACH: 70, LOOK: [1.1, 1.7], SIP: [2.0, 3.2] };
Scenes.drink = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 3), NEED = p.need || 3, WY = p.wy || DRINK.WY, BANK = WY - 12;
    G.h('div', 'full', sc, { background: '#2c3a2c' });
    G.bgImg(p.bg || 'bg_cnam_estuary');
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: ['paw', `0 / ${NEED}`] });
    GL.attach(sc);
    // the crocodile lies with its back just under the surface: only the eyes and the nostrils show
    const box = p.box || [520, 150], K = fitK(sp.id, box[0], box[1]), d = MAN.auto[sp.id];
    const EYE = (window.YOUNG && YOUNG[sp.id] && YOUNG[sp.id].e[1]) || d.box[2] + 0.25 * (d.box[3] - d.box[2]);
    const FLOAT = WY - 5 + (d.box[3] - EYE) * K;          // the feet line when the eyes are just above the water
    const croc = GL.makeAuto(sp.id, { x: 260, y: FLOAT, s: K, z: 3 });
    const mth = GL.restPt(croc, d.mouth), MO = (mth[0] - croc.ax) * K;
    // the water over the crocodile: everything below the surface is seen through greenish water
    const veil = G.h('div', 'abs', sc, { left: 0, top: WY + 'px', width: '100%', height: 800 - WY + 'px', pointerEvents: 'none',
      background: 'linear-gradient(rgba(70,90,50,.55), rgba(40,60,35,.82) 30%, rgba(30,45,28,.9))' });
    const ripple = G.h('div', 'abs', sc, { width: 220, height: 26, borderRadius: '50%', border: '3px solid rgba(255,255,255,.35)', opacity: 0, pointerEvents: 'none', transition: 'opacity .3s' });
    // the animals that come down to drink (painted neighbours of the place)
    const PREY = p.prey || ['nb_aquilarhinus', 'nb_agujaceratops'];
    const S = { t: 0, x: 260, face: 1, hold: false, pid: null, got: 0, oops: 0, cur: null, nextT: 0.8, n: 0, lunge: 0, done: false, ph: 0, blink: blinker(), first: true };
    const ring = G.h('div', 'abs', sc, { width: 150, height: 150, marginLeft: '-75px', marginTop: '-75px', borderRadius: '50%', display: 'none', pointerEvents: 'none',
      border: '5px solid rgba(255,226,140,.95)', boxShadow: '0 0 18px rgba(255,214,120,.7)', animation: 'pulse 0.7s ease-in-out infinite' });
    G.dbg = { S, croc, ring };
    const hit = G.h('div', 'hit', sc);
    const hand = UI.hand(G.ui, 640, 560, 'hold'); hand.style.display = 'none';
    const red = () => { const r = G.h('div', 'full', G.ui, { background: 'radial-gradient(ellipse at 50% 50%,rgba(241,107,74,0) 40%,rgba(241,107,74,.45) 100%)', pointerEvents: 'none' }); G.tween(0.9, (e) => { r.style.opacity = 1 - e; }).then(() => r.remove()); };
    const come = () => {
      const key = PREY[S.n % PREY.length]; S.n++;
      const w = (p.pw && p.pw[key]) || { nb_aquilarhinus: 330, nb_agujaceratops: 290 }[key] || 300, c = critter(key, sc, w);
      sc.insertBefore(c.el, veil);
      c.im.style.transformOrigin = '22% 96%';            // it bends down to the water about its hind feet
      const side = S.n % 2 ? 1 : -1;                    // from the right, then from the left
      const f = { key, c, side, w, x: side > 0 ? 1280 + w : -w, tx: side > 0 ? G.rand(700, 980) : G.rand(330, 600), st: 'come', t: 0, dur: 0, bob: 0, tilt: 0 };
      c.place(f.x, BANK, -side);
      S.cur = f;
    };
    const look = (f) => { f.st = 'look'; f.t = 0; f.dur = G.rand(DRINK.LOOK[0], DRINK.LOOK[1]); };
    const sip = (f) => { f.st = 'drink'; f.t = 0; f.dur = G.rand(DRINK.SIP[0], DRINK.SIP[1]); };
    // the muzzle of the animal on the bank: at the front of its picture, down at the water while it drinks
    const head = (f) => [f.x - f.side * f.w * 0.42, f.st === 'drink' ? BANK - 8 : BANK - f.c.h * 0.7];
    const mouthX = () => S.x + S.face * MO;
    const flee = (f) => { f.st = 'flee'; f.t = 0; ring.style.display = 'none'; AU.play('whoosh'); };
    const lunge = () => {
      const f = S.cur; if (!f || S.lunge > 0) return;
      S.lunge = 1e-3; ring.style.display = 'none'; hand.style.display = 'none';
      AU.play('splash'); G.fx.burst(mouthX(), WY, 18, { type: 'dot', color: ['rgba(235,250,255,.9)', 'rgba(200,230,240,.8)'], s0: 120, s1: 380, a0: -2.8, a1: -0.3, g: 600, z0: 4, z1: 10, l0: 0.5, l1: 1.0, drag: 1.2 });
      G.wait(0.28).then(() => {
        if (!G.alive(tok)) return;
        f.st = 'gone'; AU.play('snap'); AU.voiceOf(sp.id, { at: 0, vol: 0.6 });
        G.tween(0.35, (u) => { f.c.el.style.opacity = 1 - u; f.c.el.style.marginTop = 40 * u + 'px'; }).then(() => f.c.el.remove());
        S.got++; top.counter.set(`${Math.min(S.got, NEED)} / ${NEED}`);
        if (S.got === 1) G.say(p.first || 'Есть! Учёные нашли кости динозавров со следами зубов этого огромного крокодила.');
        if (S.got >= NEED) finish(); else S.nextT = 2.2;
        S.cur = null;
      });
    };
    const finish = async () => {
      S.done = true; AU.play('ok');
      G.say(p.win || 'Отличная охота! Этот крокодил был таким большим, что охотился даже на динозавров.');
      await G.wait(2.8); if (!G.alive(tok)) return;
      const stars = S.oops === 0 ? 3 : S.oops === 1 ? 2 : 1;
      chFinish(C.n, stars, { stat: `Добыча: ${S.got} · заметили тебя: ${S.oops}` });
    };
    const near = (f) => f && f.st === 'drink' && Math.abs(mouthX() - head(f)[0]) < DRINK.REACH;
    G.on(hit, 'pointerdown', (e) => {
      AU.unlock(); if (S.done || S.lunge > 0) return;
      if (near(S.cur)) { lunge(); return; }
      S.hold = true; S.pid = e.pointerId; hand.style.display = 'none';
    });
    const up = (e) => { if (e.pointerId === S.pid) { S.hold = false; S.pid = null; } };
    G.on(window, 'pointerup', up); G.on(window, 'pointercancel', up);
    G.say(p.intro ? AU.alt(p.intro[0], p.intro[1]) : AU.alt('Крокодил прячется в воде — видны только глаза и ноздри. Держи палец — он тихо подплывает. Когда зверь на берегу поднимает голову, отпусти и замри!',
      'Держи палец — подплывай. Поднял голову — замри!'));
    G.tick((dt) => {
      S.t += dt;
      if (S.nextT > 0 && !S.done) { S.nextT -= dt; if (S.nextT <= 0) come(); }
      const f = S.cur;
      // the animal on the bank
      if (f) {
        f.t += dt;
        if (f.st === 'come') {
          const st = 120 * dt, dx = f.tx - f.x;
          if (Math.abs(dx) <= st) { f.x = f.tx; look(f); } else f.x += Math.sign(dx) * st;
          f.bob = -Math.abs(Math.sin(f.t * 7)) * 4;
        } else if (f.st === 'look') {
          f.tilt += (0 - f.tilt) * Math.min(1, dt * 8); f.bob = 0;
          if (f.t >= f.dur) sip(f);
          // a moving crocodile is seen while the animal looks about
          if (S.hold && S.lunge <= 0 && f.t > 0.25) {
            S.oops++; S.hold = false; AU.play('alert'); red(); flee(f);
            G.say('Ой! Зверь заметил крокодила и убежал. Когда он поднимает голову — замри!');
            S.nextT = 2.4;
          }
        } else if (f.st === 'drink') {
          f.tilt += (16 - f.tilt) * Math.min(1, dt * 5);
          if (S.first && f.t > 0.3) { S.first = false; hand.style.display = ''; }
          if (f.t >= f.dur) look(f);
        } else if (f.st === 'flee') {
          f.tilt += (0 - f.tilt) * Math.min(1, dt * 8);
          f.x += f.side * 320 * dt; f.bob = -Math.abs(Math.sin(f.t * 10)) * 6;
          if (f.x < -f.w * 1.2 || f.x > 1280 + f.w * 1.2) { f.c.el.remove(); S.cur = null; S.nextT = Math.max(S.nextT, 0.6); }
        }
        if (f.st === 'flee' && f.t < 0.05) f.c.place(f.x, BANK, f.side, f.bob);        // it turns and runs back the way it came
        if (S.cur && f.st !== 'gone') {
          f.c.place(f.x, BANK, f.st === 'flee' ? f.side : -f.side, f.bob);
          f.c.im.style.transform = `rotate(${f.tilt}deg)`;
        }
      }
      // the crocodile glides on while the finger is down; it stops when its jaws are under the drinker
      const tgt = f && (f.st === 'look' || f.st === 'drink' || f.st === 'come') ? head(f)[0] : null;
      let moving = false;
      if (S.hold && tgt !== null && S.lunge <= 0) {
        const want = tgt > S.x ? 1 : -1;
        if (Math.abs(tgt - S.x) > MO * 0.6 && want !== S.face) S.face = want;
        const dx = tgt - S.face * MO - S.x;
        if (Math.abs(dx) > 6) { S.x += Math.sign(dx) * Math.min(Math.abs(dx), DRINK.V * dt); moving = true; }
      }
      S.x = G.clamp(S.x, 120, 1160);
      if (near(f) && S.lunge <= 0) {
        const [hx, hy] = head(f); ring.style.display = ''; ring.style.left = hx + 'px'; ring.style.top = hy + 'px';
        if (S.hold) S.hold = false;
        hand.style.display = 'none';
        G.once('drinkgo', 'Зверь пьёт и не смотрит! Нажми — бросок из воды!');
      } else if (S.lunge <= 0) ring.style.display = 'none';
      S.ph += moving ? dt * 3 : dt * 0.6;
      // the lunge: up out of the water and back
      let lift = 0, tilt = 0;
      if (S.lunge > 0) {
        S.lunge += dt; const u = Math.min(1, S.lunge / 0.9), b = Math.sin(Math.PI * u);
        lift = -38 * b; tilt = -0.36 * b * S.face;
        if (S.lunge >= 0.9) S.lunge = 0;
      }
      croc.x = S.x; croc.y = FLOAT + lift + Math.sin(S.t * 1.3) * 2; croc.rot = tilt; croc.flip = S.face < 0;
      const [b, ft] = GL.autoGait(croc, moving ? 'walk' : 'stand', S.ph * 2, S.t);
      b.tail = 6 + (moving ? 4 : 0); b.tailPh = S.t * (moving ? 5 : 1.5);
      croc.blink = S.blink(S.t, dt); croc.pose(b, ft);
      ripple.style.opacity = moving ? 1 : 0; ripple.style.left = S.x + S.face * MO * 0.55 - 110 + 'px'; ripple.style.top = WY - 13 + 'px';
    });
  },
};

/* ------------------------------------------------------------------ tosea · a hatchling crawls to the sea.
   Sea-turtle babies hatch in the sand and at once crawl to the water, towards the brighter sky over the sea. On the way crabs
   and birds hunt them. Tap the sand — the little turtle crawls there; keep away from the crabs. */
const TOSEA = { V: 84, HIT: 70, START: [330, 588], KID: 0.62 };
Scenes.tosea = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 2);
    G.h('div', 'full', sc, { background: '#d7b48a' });
    G.bgImg(p.bg || 'bg_cnam_beach');
    chHeader(C.n, C.name);
    UI.topRight();
    GL.attach(sc);
    // where the sea begins: above the line of the surf (design px, from the picture)
    const SEA = p.sea || [[575, 256], [1280, 667]];
    const seaY = (x) => SEA[0][1] + ((x - SEA[0][0]) * (SEA[1][1] - SEA[0][1])) / (SEA[1][0] - SEA[0][0]);
    const inSea = (x, y) => x > SEA[0][0] && y < seaY(x) - 6;
    // the nest: a pit of broken shells (the eggs of its kind)
    const HT = window.HATCH, EK = (HT && HT.grp[sp.id]) || 'turtle', n2 = G.ATLAS['nestegg_' + EK];
    const [X0, Y0] = TOSEA.START;
    if (n2) { const w = 270, h = (w * n2[4]) / n2[3]; const n = G.spr('nestegg_' + EK, sc, X0 - 175 - w / 2, Y0 + 20 - h, w, h); n.style.filter = 'drop-shadow(0 4px 5px rgba(0,0,0,.35))'; }
    const baby = GL.autoBaby(sp.id, { x: X0, y: Y0, z: 5 });
    const BS = baby.s * TOSEA.KID; baby.it.s = BS;
    // brothers and sisters crawl to the sea too, on their own
    const sibs = [[X0 - 150, Y0 - 60, 0.85], [X0 - 40, Y0 - 120, 0.9]].map(([x, y, k], i) => {
      const b = GL.autoBaby(sp.id, { x, y, z: 4 + i * 0.1 }); b.it.s = BS * k; return { b, x, y, v: G.rand(48, 62), done: false, ph: G.rand(0, 6) };
    });
    // the crabs: they scuttle sideways to and fro
    const crabs = (p.crabs || [[600, 560, 120], [820, 610, 130], [990, 545, 90]]).map(([x, y, r], i) => {
      const w = 116, c = critter('it_crab', sc, w);
      return { c, x0: x, x, y, r, v: G.rand(70, 105) * (i % 2 ? -1 : 1), wait: 0, snap: 0 };
    });
    const S = { t: 0, x: X0, y: Y0, tx: null, ty: null, face: 1, ph: 0, oops: 0, knock: 0, kx: 0, ky: 0, done: false, ended: false, taps: 0 };
    G.dbg = { S, crabs, baby };
    const hit = G.h('div', 'hit', sc);
    const hand = UI.hand(G.ui, X0 + 230, Y0 - 20, 'tap');
    const ring = G.h('div', 'abs', sc, { width: 46, height: 46, marginLeft: '-23px', marginTop: '-23px', borderRadius: '50%', border: '4px solid rgba(255,255,255,.75)', opacity: 0,
      pointerEvents: 'none', transition: 'opacity .4s' });
    const finish = async () => {
      S.ended = true; AU.play('splash'); AU.play('ok');
      G.say(p.win || 'Ура! Черепашка добралась до моря и поплыла!');
      G.tween(1.2, (u) => { baby.it.alpha = 1 - u; });
      await G.wait(2.6); if (!G.alive(tok)) return;
      const stars = S.oops === 0 ? 3 : S.oops === 1 ? 2 : 1;
      chFinish(C.n, stars, { stat: `Встреч с крабами: ${S.oops}` });
    };
    G.on(hit, 'pointerdown', (e) => {
      AU.unlock(); if (S.done) return;
      const q = G.bgPt(e);
      hand.style.display = 'none';
      S.tx = G.clamp(q.x, 40, 1240); S.ty = G.clamp(q.y, inSea(q.x, q.y) ? 200 : 380, 640); S.taps++;
      ring.style.left = S.tx + 'px'; ring.style.top = S.ty + 'px'; ring.style.opacity = 1; setTimeout(() => { ring.style.opacity = 0; }, 400);
    });
    G.say(p.intro ? AU.alt(p.intro[0], p.intro[1]) : AU.alt('Черепашки вылупились и спешат к морю! Нажимай на песок — черепашка поползёт туда. Обходи крабов стороной!',
      'Нажимай на песок — ползи к морю. Обходи крабов!'));
    G.tick((dt) => {
      S.t += dt;
      // the crabs walk sideways about their places and stop now and then
      for (const k of crabs) {
        if (k.wait > 0) k.wait -= dt;
        else { k.x += k.v * dt; if (Math.abs(k.x - k.x0) > k.r) { k.x = k.x0 + Math.sign(k.x - k.x0) * k.r; k.v = -k.v; k.wait = G.rand(0.3, 1.1); } }
        if (k.snap > 0) k.snap = Math.max(0, k.snap - dt * 2);
        k.c.place(k.x, k.y + 10, k.v > 0 ? 1 : -1, -Math.abs(Math.sin(S.t * 18)) * (k.wait > 0 ? 0 : 3));
        k.c.el.style.transform = `${k.v < 0 ? 'scaleX(-1) ' : ''}scale(${1 + 0.18 * k.snap})`;
      }
      // the little turtle
      let moving = false;
      if (S.knock > 0) {
        S.knock = Math.max(0, S.knock - dt * 2.2); S.x += S.kx * dt * S.knock; S.y += S.ky * dt * S.knock;
      } else if (!S.done && S.tx !== null) {
        const dx = S.tx - S.x, dy = S.ty - S.y, dist = Math.hypot(dx, dy), st = TOSEA.V * dt;
        if (dist <= st) { S.x = S.tx; S.y = S.ty; S.tx = null; }
        else { S.x += (dx / dist) * st; S.y += (dy / dist) * st; moving = true; if (Math.abs(dx) > 3) S.face = dx > 0 ? 1 : -1; }
      }
      S.y = G.clamp(S.y, 200, 640);
      if (!S.done) {
        for (const k of crabs) {
          if (Math.hypot(k.x - S.x, k.y - S.y) < TOSEA.HIT) {
            S.oops++; k.snap = 1; AU.play('snap'); AU.play('miss');
            const a = Math.atan2(S.y - k.y, S.x - k.x); S.kx = Math.cos(a) * 260; S.ky = Math.sin(a) * 260; S.knock = 1; S.tx = null;
            G.once('crab', 'Ой! Краб! Обходи крабов стороной.');
            break;
          }
        }
        if (inSea(S.x, S.y)) { S.done = true; finish(); }
      } else if (!S.ended) { /* waiting for the finish */ }
      if (S.done) { S.x += 60 * dt; S.y -= 30 * dt; moving = true; }
      S.ph += dt * (moving ? 7 : 1.2);
      baby.it.x = S.x; baby.it.y = S.y; baby.it.flip = S.face < 0;
      baby.pose(S.t * (moving ? 3 : 1), 0);
      // the brothers and sisters
      for (const q of sibs) {
        if (q.done) continue;
        q.ph += dt; q.x += q.v * dt * 0.9; q.y -= q.v * dt * 0.42;
        if (inSea(q.x, q.y)) { q.done = true; G.tween(0.8, (u) => { q.b.it.alpha = 1 - u; }); }
        q.b.it.x = q.x; q.b.it.y = q.y; q.b.pose(q.ph * 3, 0);
      }
    });
  },
};

/* ------------------------------------------------------------------ lay · a grown sea turtle lays her eggs on the beach.
   Sea turtles come ashore at night, dig a pit with their hind flippers, lay many eggs in it, cover it with sand and go back to the
   sea; they never come back to the nest — the warm sand keeps the eggs, and the babies find the sea by themselves.
   Every step is a tap: crawl up the beach · dig · lay the eggs · cover them · back to the sea. */
const LAY = { CLIMB: 7, DIG: 8, EGGS: 6, COVER: 6, BACK: 6 };
// the long-necked mother: steps to the warm sand, scratches of the hind feet, eggs (px wide), sand; the pit behind the hind feet
const LAYW = { CLIMB: 5, DIG: 6, EGGS: 8, COVER: 5, BACK: 4, EGG: 18, BEHIND: 70 };
Scenes.lay = {
  enter(p) {
    if (p && p.walker) return this.walker(p);
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 5), GY = 612;
    G.h('div', 'full', sc, { background: '#141c2c' });
    G.bgImg(p.bg || 'bg_cnam_beach');
    // night: a dark blue veil and the moon over the sea
    G.h('div', 'full', sc, { background: 'linear-gradient(rgba(8,14,40,.72), rgba(10,18,44,.55) 55%, rgba(14,20,40,.6))', pointerEvents: 'none' });
    G.h('div', 'abs', sc, { left: 800, top: 150, width: 64, height: 64, borderRadius: '50%', pointerEvents: 'none',
      background: 'radial-gradient(circle at 40% 40%, #fffbe8, #f1e7c2 60%, rgba(241,231,194,0) 72%)', boxShadow: '0 0 60px 20px rgba(240,230,190,.25)' });
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: ['egg', `0 / ${LAY.EGGS}`] });
    // the pit in the sand under the turtle's hind flippers (drawn under the turtle)
    const STOP = 640, PX = STOP + 165;
    const pit = G.h('div', 'abs', sc, { left: PX - 150, top: GY - 30, width: 300, height: 74, borderRadius: '50%', opacity: 0, pointerEvents: 'none',
      background: 'radial-gradient(ellipse at 50% 45%, rgba(40,30,20,.85), rgba(70,55,35,.55) 55%, rgba(120,100,70,0) 72%)' });
    const eggs = [];
    GL.attach(sc);
    const t0 = swimmer({ x: 1180, y: GY - 40, z: 4 }, 430);
    const turtle = t0;
    const S = { t: 0, x: 1180, ph: 'climb', n: 0, moveT: 0, from: 1180, to: 1180, dig: 0, done: false, face: -1, flip: 0, sand: 0 };
    G.dbg = { S, turtle };
    const hit = G.h('div', 'hit', sc);
    const hand = UI.hand(G.ui, 900, GY - 140, 'tap');
    const STEP = (1180 - STOP) / LAY.CLIMB;
    // (each step says its line once; the texts are literal so that tools/voice/collect.py finds them)
    const next = (ph) => {
      S.ph = ph; S.n = 0; S.lock = false;
      if (ph === 'dig') G.say(p.dig || 'Здесь сухо и тепло. Нажимай — задними ластами черепаха роет ямку.');
      else if (ph === 'eggs') G.say(p.eggs || 'Ямка готова. Нажимай — черепаха откладывает яйца.');
      else if (ph === 'cover') G.say(p.cover || 'Теперь засыпь ямку песком — нажимай!');
      else if (ph === 'back') G.say(p.back || 'Гнездо спрятано. Пора домой, в море — нажимай!');
    };
    const sandFly = () => G.fx.dust(PX + 30, GY + 2, 9, 'rgba(226,200,160,');
    const finish = async () => {
      S.done = true; AU.play('splash'); AU.play('ok');
      G.say(p.win || 'Готово! Черепахи не сидят на яйцах: тёплый песок сам согревает кладку, а малыши потом сами ползут к морю.');
      G.tween(1.4, (u) => { turtle.alpha = 1 - u; });
      await G.wait(3.2); if (!G.alive(tok)) return;
      chFinish(C.n, 3, { stat: `Яиц в гнезде: ${LAY.EGGS}` });
    };
    G.on(hit, 'pointerdown', () => {
      AU.unlock(); if (S.done || S.moveT > 0 || S.lock) return;
      hand.style.display = 'none';
      if (S.ph === 'climb') {
        S.from = S.x; S.to = S.x - STEP; S.moveT = 0.45; S.n++; AU.play('step');
        if (S.n >= LAY.CLIMB) (S.lock = true), G.wait(0.5).then(() => { if (G.alive(tok)) { next('dig'); pit.style.opacity = 0.15; } });
      } else if (S.ph === 'dig') {
        S.n++; S.dig = 1; sandFly(); AU.play('whoosh');
        pit.style.opacity = Math.min(1, 0.15 + 0.85 * (S.n / LAY.DIG));
        if (S.n >= LAY.DIG) (S.lock = true), G.wait(0.4).then(() => { if (G.alive(tok)) next('eggs'); });
      } else if (S.ph === 'eggs') {
        S.n++; AU.play('pop');
        const m = MAN.it_tegg, w = 34, h = (w * m.h) / m.w, k = S.n - 1;
        const el = G.spr('it_tegg', sc, PX - 70 + (k % 3) * 46 + G.rand(-6, 6) - w / 2, GY - 6 + Math.floor(k / 3) * 14 - h, w, h);
        el.style.filter = 'drop-shadow(0 2px 2px rgba(0,0,0,.5))'; el.style.pointerEvents = 'none';
        sc.insertBefore(el, pit.nextSibling);
        eggs.push(el); top.counter.set(`${S.n} / ${LAY.EGGS}`);
        if (S.n >= LAY.EGGS) (S.lock = true), G.wait(0.6).then(() => { if (G.alive(tok)) next('cover'); });
      } else if (S.ph === 'cover') {
        S.n++; S.dig = 1; sandFly(); AU.play('whoosh');
        const u = S.n / LAY.COVER;
        for (const el of eggs) el.style.opacity = String(1 - u);
        pit.style.opacity = String(1 - 0.8 * u);
        if (S.n >= LAY.COVER) (S.lock = true), G.wait(0.5).then(() => { if (G.alive(tok)) { next('back'); S.face = 1; } });
      } else if (S.ph === 'back') {
        S.from = S.x; S.to = S.x + STEP * 1.2; S.moveT = 0.45; S.n++; AU.play('step');
        if (S.n >= LAY.BACK) (S.lock = true), G.wait(0.45).then(() => { if (G.alive(tok)) finish(); });
      }
    });
    G.say(p.climb || 'Ночь. Черепаха выходит из моря на берег. Нажимай — она ползёт вверх по песку.');
    G.tick((dt) => {
      S.t += dt;
      let speed = 0.25;
      if (S.moveT > 0) {
        S.moveT = Math.max(0, S.moveT - dt); const u = 1 - S.moveT / 0.45;
        S.x = G.lerp(S.from, S.to, G.ease.inOut(u)); speed = 1.1;
      }
      if (S.dig > 0) { S.dig = Math.max(0, S.dig - dt * 2.5); speed = 1.4; }
      S.flip += ((S.face < 0 ? 1 : 0) - S.flip) * Math.min(1, dt * 6);
      turtle.x = S.x; turtle.y = GY - 40 + Math.sin(S.t * 2) * 1.5; turtle.flip = S.face < 0;
      const ps = turtle.swimPose(S.t, [], [], speed);
      turtle.mesh.deform(ps);
    });
  },
  /* the walker variant («Гнездо в песке»): a titanosaur mother by day. Sauropods dug pits for their eggs with the claws of their
     hind feet (the nesting grounds of Auca Mahuevo in Argentina, of the Lameta in India), laid round eggs the size of a melon — tiny
     beside the mother — covered them with sand and earth and went on: the warm ground kept the eggs, as the sand of the turtles.
     Every step is a tap: walk to the warm sand · dig · lay · cover · go back to the herd. */
  walker(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 5), GY = 612, L = LAYW;
    G.h('div', 'full', sc, { background: '#c9a06a' });
    G.bgImg(p.bg || 'bg_run');
    shades(sc, 0.4, 0);
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: ['egg', `0 / ${L.EGGS}`] });
    const HT = window.HATCH, eg = (HT && HT.grp[sp.id]) || 'round', EK = 'egg_' + eg, em = MAN[EK] || { w: 1, h: 1 };
    // the pit and the eggs lie under the animal (DOM before the GL canvas)
    const pitBox = G.h('div', 'abs', sc, { left: 0, top: 0, width: 0, height: 0, pointerEvents: 'none' });
    GL.attach(sc);
    const W = walker({ x: 1500, y: GY, z: 4, flip: true, young: false }, p.box || [620, 300]);
    const dino = W.it;
    // facing left the picture is mirrored: the hips are at x − HIP[0] (in front of the anchor for a long-tailed titanosaur,
    // behind it for another); the pit lies just behind the hind feet, towards the tail
    const HOFF = -W.HIP[0], PX = p.px || 720, STOP = PX - HOFF - L.BEHIND, X0 = 1280 + 260;
    const pit = G.h('div', 'abs', pitBox, { left: PX - 95, top: GY - 18, width: 190, height: 44, borderRadius: '50%', opacity: 0, pointerEvents: 'none',
      background: 'radial-gradient(ellipse at 50% 45%, rgba(48,34,20,.85), rgba(82,62,38,.55) 55%, rgba(120,100,70,0) 72%)' });
    const mound = G.h('div', 'abs', pitBox, { left: PX - 105, top: GY - 26, width: 210, height: 40, borderRadius: '50% 50% 40% 40%', opacity: 0, pointerEvents: 'none',
      background: 'radial-gradient(ellipse at 50% 60%, rgba(214,180,128,.95), rgba(190,156,108,.7) 55%, rgba(170,140,100,0) 75%)' });
    // a nesting colony: covered nests of other mothers nearby ([x, scale, y] — farther ones higher and smaller)
    (p.colony || []).forEach(([x, k, y]) => G.h('div', 'abs', pitBox, { left: x - 105 * k, top: y - 26 * k, width: 210 * k, height: 40 * k,
      borderRadius: '50% 50% 40% 40%', pointerEvents: 'none', opacity: 0.85,
      background: 'radial-gradient(ellipse at 50% 60%, rgba(214,180,128,.95), rgba(190,156,108,.7) 55%, rgba(170,140,100,0) 75%)' }));
    const eggs = [];
    const S = { t: 0, x: X0, ph: 'climb', n: 0, moveT: 0, mdur: 0.7, from: X0, to: X0, wph: 0, dig: 0, digPh: 0, lay: 0, done: false };
    const STEP = (X0 - STOP) / L.CLIMB;
    G.dbg = { S, W, PX, STOP };
    const hit = G.h('div', 'hit', sc);
    const hand = UI.hand(G.ui, 900, GY - 160, 'tap');
    const blink = blinker();
    // (each step says its line once; the texts are literal so that tools/voice/collect.py finds them)
    const next = (ph) => {
      S.ph = ph; S.n = 0; S.lock = false;
      if (ph === 'dig') G.say(p.dig || 'Здесь сухо и тепло. Нажимай — мама роет ямку когтями задних ног.');
      else if (ph === 'eggs') G.say(p.eggs || 'Ямка готова. Нажимай — мама откладывает яйца.');
      else if (ph === 'cover') G.say(p.cover || 'Теперь засыпь яйца песком и землёй — нажимай!');
      else if (ph === 'back') G.say(p.back || 'Гнездо спрятано. Пора к стаду — нажимай!');
    };
    const sandFly = () => G.fx.dust(S.x + HOFF + 30, GY + 2, 10, 'rgba(226,200,160,');
    const finish = async () => {
      S.done = true; AU.play('ok');
      G.say(p.win || 'Готово! Длинношеие динозавры не сидели на яйцах: тёплая земля сама согревала кладку. А яйца у великанов были всего с дыню!');
      await G.wait(3.4); if (!G.alive(tok)) return;
      chFinish(C.n, 3, { stat: `Яиц в гнезде: ${L.EGGS}` });
    };
    const walkTo = (x) => { S.from = S.x; S.to = x; S.moveT = S.mdur; AU.play('step'); };
    G.on(hit, 'pointerdown', () => {
      AU.unlock(); if (S.done || S.moveT > 0 || S.lock) return;
      hand.style.display = 'none';
      if (S.ph === 'climb') {
        S.n++; walkTo(S.n >= L.CLIMB ? STOP : S.x - STEP);
        if (S.n >= L.CLIMB) (S.lock = true), G.wait(S.mdur + 0.2).then(() => { if (G.alive(tok)) { next('dig'); pit.style.opacity = 0.15; } });
      } else if (S.ph === 'dig') {
        S.n++; S.dig = 1; sandFly(); AU.play('whoosh');
        pit.style.opacity = Math.min(1, 0.15 + 0.85 * (S.n / L.DIG));
        if (S.n >= L.DIG) (S.lock = true), G.wait(0.5).then(() => { if (G.alive(tok)) next('eggs'); });
      } else if (S.ph === 'eggs') {
        S.n++; S.lay = 1; AU.play('pop');
        // the eggs are as big as melons: small beside the mother (a little bigger than true, to be seen)
        const k = S.n - 1, w = L.EGG, h = (w * em.h) / em.w;
        const el = G.spr(EK, pitBox, PX - 52 + (k % 4) * 26 + G.rand(-4, 4) - w / 2, GY - 2 + Math.floor(k / 4) * 9 - h, w, h);
        el.style.filter = 'drop-shadow(0 2px 2px rgba(0,0,0,.5))'; el.style.pointerEvents = 'none';
        eggs.push(el); top.counter.set(`${S.n} / ${L.EGGS}`);
        if (S.n >= L.EGGS) (S.lock = true), G.wait(0.6).then(() => { if (G.alive(tok)) next('cover'); });
      } else if (S.ph === 'cover') {
        S.n++; S.dig = 1; sandFly(); AU.play('whoosh');
        const u = S.n / L.COVER;
        for (const el of eggs) el.style.opacity = String(1 - u);
        pit.style.opacity = String(1 - u); mound.style.opacity = String(u);
        if (S.n >= L.COVER) (S.lock = true), G.wait(0.5).then(() => { if (G.alive(tok)) next('back'); });
      } else if (S.ph === 'back') {
        S.n++; walkTo(S.x - STEP * 1.3);
        if (S.n >= L.BACK) (S.lock = true), G.wait(S.mdur + 0.1).then(() => { if (G.alive(tok)) finish(); });
      }
    });
    G.say(p.climb || 'Мама ищет место для гнезда — тёплый сухой песок. Нажимай — она идёт туда.');
    G.tick((dt) => {
      S.t += dt;
      let moving = false;
      if (S.moveT > 0) {
        S.moveT = Math.max(0, S.moveT - dt); const u = 1 - S.moveT / S.mdur, x0 = S.x;
        S.x = G.lerp(S.from, S.to, G.ease.inOut(u)); moving = true;
        S.wph += (2 * Math.PI * Math.abs(S.x - x0)) / Math.max(1, W.stride);
      }
      if (S.dig > 0) { S.dig = Math.max(0, S.dig - dt * 2); S.digPh += dt * 9; }
      if (S.lay > 0) S.lay = Math.max(0, S.lay - dt * 2.2);
      dino.x = S.x; dino.flip = true;
      let body, feet;
      if (moving) [body, feet] = W.walk(S.wph);
      else if (S.dig > 0) {
        // the hind feet scratch the sand, the front ones stand
        const [bs, fs] = W.stand(S.t), [, fw] = W.walk(S.digPh);
        body = bs; feet = fs && fw ? (leg, H, g, side, q) => (q && q.front ? fs : fw)(leg, H, g, side, q) : fs;
      } else [body, feet] = W.stand(S.t);
      // laying: the hips go down a little
      if (S.lay > 0) body.bob = (body.bob || 0) + 7 * Math.sin(Math.PI * S.lay);
      dino.blink = blink(S.t, dt); dino.pose(body, feet);
    });
  },
};

/* ------------------------------------------------------------------ burrow · a little animal feeds near its burrow.
   Tap the food on the ground: the little animal runs out and eats it. Now and then a hunter comes — first the bushes at the edge
   rustle: tap the burrow, the little one dives in and peeps out until the hunter is gone. Caught out in the open, it still slips
   away, but that costs a star. Many small animals of the time of the dinosaurs lived in burrows (Fruitafossor dug, the
   gondwanatheres of India and Madagascar probably too). */
const BUR = { HX: 205, V: 290, RUN: 380, EAT: 1.2, WARN: 2.1, HV: 245, OUT: [4.0, 6.5], MAXH: 3, FX: [440, 570, 700, 830, 950] };
Scenes.burrow = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 2), NEED = p.need || 6, GY = 612, HX = BUR.HX, item = p.item || 'it_grass';
    G.h('div', 'full', sc, { background: '#c9a06a' });
    G.bgImg(p.bg || 'bg_run');
    shades(sc, 0.4, 0);
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: [p.icon || 'leaf', `0 / ${NEED}`] });
    // the narrator's bubble stays above the ground, where the food and the burrow are
    // under the animals: the back of the mound with its dark hole, the food on the ground
    const under = G.h('div', 'abs', sc, { left: 0, top: 0, width: 0, height: 0, pointerEvents: 'none' });
    G.h('div', 'abs', under, { left: HX - 120, top: GY - 58, width: 240, height: 84, borderRadius: '50% 50% 18% 18%',
      background: 'radial-gradient(ellipse at 50% 45%, #94714a, #77583a 58%, rgba(110,82,52,0) 74%)' });
    G.h('div', 'abs', under, { left: HX - 50, top: GY - 40, width: 100, height: 48, borderRadius: '50% 50% 40% 40%',
      background: 'radial-gradient(ellipse at 50% 60%, #0c0805 38%, #26190f 68%, rgba(38,25,15,0) 76%)' });
    GL.attach(sc);
    // over the animals: the front lip of the mound (the little one goes in behind it) and its eyes peeping out of the dark
    G.h('div', 'abs', sc, { left: HX - 92, top: GY - 8, width: 184, height: 34, borderRadius: '50%', pointerEvents: 'none',
      background: 'radial-gradient(ellipse at 50% 40%, #8d6b46, #765838 60%, rgba(118,88,56,0) 76%)' });
    const eyes = G.h('div', 'abs', sc, { left: HX - 20, top: GY - 30, width: 40, height: 10, pointerEvents: 'none', opacity: 0, transition: 'opacity .25s' },
      '<i style="position:absolute;left:4px;top:2px;width:7px;height:6px;border-radius:50%;background:#f3e2a6;box-shadow:0 0 6px #f3e2a6"></i>' +
      '<i style="position:absolute;right:4px;top:2px;width:7px;height:6px;border-radius:50%;background:#f3e2a6;box-shadow:0 0 6px #f3e2a6"></i>');
    const W = walker({ x: HX, y: GY, z: 4, young: false }, p.box || [200, 100]);
    const dino = W.it, HM = W.HEAD[0];
    dino.alpha = 0;
    // the bush at the right edge where the hunter comes from
    const bm = MAN.it_fern, bw = 200, bh = (bw * bm.h) / bm.w;
    const bush = G.spr('it_fern', sc, 1145, GY - bh + 14, bw, bh);
    bush.style.filter = 'brightness(.8) drop-shadow(0 6px 6px rgba(0,0,0,.35))'; bush.style.transformOrigin = '50% 100%'; bush.style.pointerEvents = 'none';
    const alert = G.h('div', 'abs', sc, { left: 1205, top: GY - 250, width: 64, height: 64, borderRadius: '50%', background: '#F16B4A', color: '#fff',
      font: '700 44px Oswald,sans-serif', textAlign: 'center', lineHeight: '62px', transform: 'scale(0)', transition: 'transform .2s', pointerEvents: 'none',
      boxShadow: '0 4px 12px rgba(0,0,0,.4)' }, '!');
    // the hunter: a jointed animal when its parts are loaded, else its picture
    const hk = p.hunter || 'sp_laevi', hid = hk.replace(/^sp_/, ''), ha = MAN.auto && MAN.auto[hid];
    const live = !!(ha && ha.pairs && G.have('sp_' + hid + '_body') && ha.pairs.every((q) => G.have(q.key)));
    const hb = p.hbox || [520, 250];
    let HG = null, HC = null, HMO = 0;
    if (live) {
      const KH = fitK(hid, hb[0], hb[1]);
      HG = GL.makeAuto(hid, { x: 1600, y: GY, s: KH, z: 3, flip: true, young: false });
      HMO = (GL.restPt(HG, ha.mouth)[0] - HG.ax) * KH;
    } else {
      HC = critter(hk, sc, hb[0]); HMO = hb[0] * 0.45;
    }
    const H = { st: 'off', x: 1600, t: 0, ph: 0, face: -1, tx: 0 };
    const S = { t: 0, x: HX, face: 1, st: 'in', tx: HX, target: null, eatT: 0, got: 0, oops: 0, hunts: 0, outT: 0, nextH: 3.2, ph: 0, sink: 1, done: false };
    G.dbg = { S, H, W };
    const blink = blinker();
    const red = () => { const r = G.h('div', 'full', G.ui, { background: 'radial-gradient(ellipse at 50% 50%,rgba(241,107,74,0) 40%,rgba(241,107,74,.45) 100%)', pointerEvents: 'none' }); G.tween(0.9, (e) => { r.style.opacity = 1 - e; }).then(() => r.remove()); };
    // the food: three bits at a time on the ground
    const food = [], free = G.shuffle(BUR.FX.slice());
    const m = MAN[item], fw = p.fw || 74, fh = (fw * m.h) / m.w;
    const addFood = () => {
      if (!free.length) return;
      const bx = free.shift(), x = bx + G.rand(-20, 20);
      const el = glowImg(item, under, x, GY - fh / 2 + 6, fw, 'drop-shadow(0 0 6px rgba(255,236,170,.85)) drop-shadow(0 3px 3px rgba(0,0,0,.35))');
      food.push({ x, bx, el });
    };
    for (let i = 0; i < 3; i++) addFood();
    const hand = UI.hand(G.ui, G.W / 2, G.H / 2, 'tap');
    const pointAt = (x, y) => { const w = G.bgToWorld(x, y); hand.style.left = w.x + 'px'; hand.style.top = w.y + 'px'; hand.style.display = ''; };
    pointAt(food[0].x, GY - 40);
    const outside = () => S.st === 'go' || S.st === 'eat' || S.st === 'idle' || S.st === 'emerge';
    const danger = () => H.st === 'warn' || H.st === 'come' || H.st === 'sniff' || H.st === 'snap';
    const goHome = (fast) => {
      if (!outside() && S.st !== 'flee') return;
      if (S.target && S.target.el) S.target.el.style.transform = '';
      S.st = fast ? 'flee' : 'home'; S.target = null; S.tx = HX; AU.play('whoosh');
    };
    const goEat = (f) => {
      S.target = f; S.face = f.x >= S.x ? 1 : -1; S.tx = f.x - S.face * HM * 0.92;
      if (S.st === 'in') { S.st = 'emerge'; S.sink = 1; } else S.st = 'go';
    };
    const finish = async () => {
      S.done = true; AU.play('ok');
      if (outside()) goHome(false);
      G.say(p.win || 'Наелся! Маленьких зверьков от хищников спасали норки.');
      await G.wait(3.2); if (!G.alive(tok)) return;
      const stars = S.oops === 0 ? 3 : S.oops === 1 ? 2 : 1;
      chFinish(C.n, stars, { stat: `Съедено: ${S.got} · чуть не поймали: ${S.oops}` });
    };
    const hit = G.h('div', 'hit', sc);
    G.on(hit, 'pointerdown', (e) => {
      AU.unlock(); if (S.done) return;
      const q = G.bgPt(e);
      hand.style.display = 'none';
      if (Math.abs(q.x - HX) < 130 && q.y > GY - 170) { goHome(false); return; }
      let best = null;
      for (const f of food) { const d = Math.hypot(q.x - f.x, q.y - (GY - fh / 2)); if (d < 95 && (!best || d < best.d)) best = { f, d }; }
      if (!best) return;
      if (danger() && S.st === 'in') { G.once('bwait', 'Подожди, пока хищник уйдёт.'); return; }
      if (S.st === 'home' || S.st === 'flee' || S.st === 'enter') return;
      goEat(best.f);
    });
    G.say(p.intro ? AU.alt(p.intro[0], p.intro[1]) : AU.alt('Это норка зверька. Нажимай на еду — он выбежит и поест. Зашуршали кусты — скорее нажми на норку!',
      'Нажимай на еду, а если идёт хищник — на норку!'));
    // the hunter's visit
    const warn = () => { H.st = 'warn'; H.t = 0; S.hunts++; AU.play('alert'); alert.style.transform = 'scale(1)'; G.once('bwarn', p.warn || 'Шорох в кустах! Это хищник — скорее в норку! Нажми на неё.'); };
    G.tick((dt) => {
      S.t += dt;
      // ---- the hunter
      H.t += dt;
      if (H.st === 'off' && !S.done && outside()) {
        S.outT += dt;
        if (S.outT >= S.nextH && S.hunts < BUR.MAXH) warn();
      }
      if (H.st === 'warn') {
        bush.style.transform = `rotate(${4 * Math.sin(H.t * 22)}deg)`;
        if (H.t >= BUR.WARN) { H.st = 'come'; H.t = 0; H.x = 1420 + HMO; H.face = -1; alert.style.transform = 'scale(0)'; bush.style.transform = ''; AU.voiceOf(HG ? hid : hk, { at: 0.1, vol: 0.6 }); }
      } else if (H.st === 'come') {
        const out = outside() || S.st === 'home';
        H.tx = out ? S.x + 40 : HX + 70;
        const mx = H.x - HMO;                                // its jaws
        if (mx > H.tx) { H.x -= BUR.HV * dt; H.ph += dt * 7; }
        if (out && mx <= S.x + 50) {
          // caught out in the open: the little one slips away to the burrow, but that was close
          S.oops++; red(); AU.play('snap'); G.once('bcaught', p.caught || 'Ой! Хищник чуть не схватил! Как только зашуршат кусты — сразу в норку.');
          goHome(true); H.st = 'snap'; H.t = 0;
        } else if (!out && mx <= HX + 75) {
          if (S.st === 'in') G.once('bsafe', p.safe || 'Спрятался! В норку хищник не пролезет. Подожди, пока он уйдёт.');
          H.st = 'sniff'; H.t = 0;
        }
      } else if (H.st === 'snap') {
        if (H.t > 0.6) { H.st = 'come'; H.t = 0; }
      } else if (H.st === 'sniff') {
        if (H.t > 1.8) { H.st = 'leave'; H.t = 0; H.face = 1; }
      } else if (H.st === 'leave') {
        H.x += BUR.HV * 1.2 * dt; H.ph += dt * 8;
        if (H.x - HMO > 1450) { H.st = 'off'; S.outT = 0; S.nextH = G.rand(BUR.OUT[0], BUR.OUT[1]); if (!S.done) G.once('bgone', 'Хищник ушёл. Можно снова выходить!'); }
      }
      if (HG) {
        HG.visible = H.st !== 'off' && H.st !== 'warn'; HG.x = H.x; HG.flip = H.face < 0;
        if (HG.visible) {
          const walking = H.st === 'come' || H.st === 'leave';
          const [b, f] = GL.autoGait(HG, walking ? 'walk' : 'stand', H.ph, S.t);
          if (H.st === 'sniff') b.head = (b.head || 0) + 14 * Math.min(1, H.t * 3);
          if (H.st === 'snap') b.head = (b.head || 0) - 10 * Math.sin(Math.min(1, H.t / 0.4) * Math.PI);
          HG.pose(b, f);
        }
      } else {
        HC.el.style.display = H.st === 'off' || H.st === 'warn' ? 'none' : '';
        HC.place(H.x, GY + 4, H.face, H.st === 'come' || H.st === 'leave' ? -Math.abs(Math.sin(H.ph)) * 5 : 0);
      }
      // ---- the little animal
      let moving = false, eating = false;
      if (S.st === 'emerge') {
        S.sink = Math.max(0, S.sink - dt * 3.2);
        if (S.sink <= 0) S.st = 'go';
      } else if (S.st === 'go' || S.st === 'home' || S.st === 'flee') {
        const v = S.st === 'go' ? BUR.V : S.st === 'home' ? BUR.RUN : BUR.RUN * 1.35, dx = S.tx - S.x;
        S.face = dx >= 0 ? 1 : -1;
        if (Math.abs(dx) <= v * dt) {
          S.x = S.tx;
          if (S.st === 'go') { S.st = 'eat'; S.eatT = 0; AU.play('gulp'); }
          else { S.st = 'enter'; S.sink = 0; }
        } else { S.x += Math.sign(dx) * v * dt; moving = true; }
        S.ph += ((2 * Math.PI * v) / Math.max(1, W.stride)) * dt * (moving ? 1 : 0);
      } else if (S.st === 'eat') {
        eating = true; S.eatT += dt;
        const f = S.target;
        if (f && f.el) { const u = Math.min(1, S.eatT / BUR.EAT); f.el.style.transform = `scale(${1 - 0.6 * u})`; f.el.style.opacity = String(1 - u); }
        if (S.eatT >= BUR.EAT) {
          if (f) { f.el.remove(); food.splice(food.indexOf(f), 1); G.fx.sparkle(f.x, GY - 20, 8); free.push(f.bx); }
          S.got++; top.counter.set(`${Math.min(S.got, NEED)} / ${NEED}`); AU.play('pop');
          if (S.got === 1 && p.first) G.say(p.first);
          S.target = null; S.st = 'idle';
          if (S.got >= NEED) finish(); else addFood();
        }
      } else if (S.st === 'enter') {
        S.sink = Math.min(1, S.sink + dt * 3.4);
        if (S.sink >= 1) S.st = 'in';
      }
      eyes.style.opacity = S.st === 'in' ? 1 : 0;
      // inside the burrow the little one is not drawn; going in and out it sinks behind the lip of the mound
      dino.alpha = S.st === 'in' ? 0 : 1 - S.sink;
      dino.x = S.x; dino.y = GY + 34 * S.sink; dino.flip = S.face < 0;
      let body, feet;
      if (moving) [body, feet] = W.walk(S.ph);
      else [body, feet] = W.stand(S.t);
      if (eating) { body.head = (body.head || 0) + 16 + 4 * Math.sin(S.eatT * 14); body.neck = (body.neck || 0) + 8; }
      dino.blink = blink(S.t, dt); dino.pose(body, feet);
    });
  },
};

/* ------------------------------------------------------------------ den · dig a burrow and sleep out the dry season
   Thrinaxodon dug burrows: casts of them with its skeleton inside were found in the earliest Triassic of the Karoo, and many
   thrinaxodons lay curled up in them — the little cynodont slept out the hot, dry season (aestivation; Damiani et al. 2003,
   Fernandez et al. 2013). The ground is cut open: every tap digs the tunnel a little further down; at its end the animal curls up
   in the chamber and sleeps while the surface above is hot and dry. */
const DEN = { SURF: 198, W: 60, TAPS: 12, MOVE: 0.42 };
// the burrow winds down in turns (a cross-section, design px)
const DEN_PATH = [[430, 202], [560, 252], [700, 300], [820, 350], [700, 402], [560, 447], [440, 492], [560, 537], [700, 575], [830, 598]];
Scenes.den = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 3), SURF = p.surf || DEN.SURF, TW = p.tw || DEN.W, TAPS = p.taps || DEN.TAPS;
    G.h('div', 'full', sc, { background: '#7a4a2c' });
    G.bgImg(p.bg || 'bg_tafr_burrow');
    chHeader(C.n, C.name);
    UI.topRight({});
    // the path of the tunnel and points along it
    const P = p.path || DEN_PATH, segs = [];
    let LT = 0;
    for (let i = 1; i < P.length; i++) {
      const dx = P[i][0] - P[i - 1][0], dy = P[i][1] - P[i - 1][1], l = Math.hypot(dx, dy);
      segs.push({ a: P[i - 1], dx, dy, l, s0: LT }); LT += l;
    }
    const at = (s) => {
      if (s <= 0) return { x: P[0][0] + s, y: SURF, dx: 1, dy: 0, surf: true };
      const q = segs.find((g) => s <= g.s0 + g.l) || segs[segs.length - 1], u = Math.min(1, (s - q.s0) / q.l);
      return { x: q.a[0] + q.dx * u, y: q.a[1] + q.dy * u, dx: q.dx, dy: q.dy, surf: false };
    };
    // the tunnel (an svg under the animal): a light rim and the dark hole, drawn as far as it is dug
    const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '1280'); svg.setAttribute('height', '720'); svg.setAttribute('viewBox', '0 0 1280 720');
    Object.assign(svg.style, { position: 'absolute', left: '0', top: '0', pointerEvents: 'none', overflow: 'visible' });
    sc.appendChild(svg);
    const dPath = 'M' + P.map((q) => q.join(' ')).join(' L');
    const mk = (w, col) => {
      const e = document.createElementNS(NS, 'path');
      for (const [k, v] of [['d', dPath], ['fill', 'none'], ['stroke', col], ['stroke-width', String(w)], ['stroke-linecap', 'round'], ['stroke-linejoin', 'round'],
        ['stroke-dasharray', `0 ${LT + 400}`]]) e.setAttribute(k, v);
      svg.appendChild(e); return e;
    };
    const rim = mk(TW + 16, 'rgba(168,112,70,.55)'), hole = mk(TW, 'rgba(32,19,11,.92)');
    const E = P[P.length - 1], room = document.createElementNS(NS, 'ellipse');
    for (const [k, v] of [['cx', E[0] + 40], ['cy', E[1] + 4], ['rx', '118'], ['ry', '50'], ['fill', 'rgba(32,19,11,.92)'], ['stroke', 'rgba(168,112,70,.55)'], ['stroke-width', '9'], ['opacity', '0']]) room.setAttribute(k, v);
    svg.appendChild(room);
    // the earth thrown out of the burrow piles up beside its mouth
    const mound = G.h('div', 'abs', sc, { left: P[0][0] - 150, top: SURF - 30, width: 150, height: 44, borderRadius: '50% 50% 30% 30%', opacity: 0, pointerEvents: 'none',
      background: 'radial-gradient(ellipse at 50% 70%, rgba(150,92,56,.95), rgba(128,80,48,.8) 55%, rgba(110,70,40,0) 74%)' });
    GL.attach(sc);
    const W = walker({ x: 300, y: SURF, z: 4 }, p.box || [210, 84]), dino = W.it, HX = Math.max(40, W.HEAD[0] * 0.92);
    // the hot dry surface while the animal sleeps (a warm veil over the part above the ground)
    const heat = G.h('div', 'abs', sc, { left: 0, top: 0, width: 1280, height: SURF + 6, opacity: 0, pointerEvents: 'none',
      background: 'linear-gradient(rgba(255,150,60,.42), rgba(255,120,40,.22))' });
    const S = { t: 0, D: 0, DT: 0, n: 0, ph: 'dig', dig: 0, digPh: 0, wph: 0, sleep: 0, zT: 0, done: false, half: false };
    G.dbg = { S, W, LT };
    const hit = G.h('div', 'hit', sc);
    const hand = UI.hand(G.ui, P[0][0] + 40, SURF + 40, 'tap');
    const blink = blinker();
    const finish = async () => {
      S.done = true; AU.play('ok');
      G.say(p.win || 'Готово! Звероящеры рыли норы и пережидали в них жару и засуху.');
      await G.wait(4.2); if (!G.alive(tok)) return;
      chFinish(C.n, 3, { stat: 'Нора готова' });
    };
    const toRoom = async () => {
      S.ph = 'room'; G.say(p.room || 'Вот и спальня в конце норы!');
      G.tween(0.6, (e) => room.setAttribute('opacity', String(e)));
      S.DT = LT + 70;
      await G.wait(1.4); if (!G.alive(tok)) return;
      S.ph = 'sleep'; G.say(p.sleep || 'Наверху жара и засуха, а в норе прохладно. Можно спать, пока не придут дожди.');
      G.tween(1.2, (e) => { heat.style.opacity = String(e); });
      await G.wait(5.2); if (!G.alive(tok)) return;
      finish();
    };
    G.on(hit, 'pointerdown', () => {
      AU.unlock(); if (S.ph !== 'dig' || S.done) return;
      hand.style.display = 'none';
      S.n++; S.dig = 1; AU.play('whoosh');
      S.DT = Math.min(LT, (LT * S.n) / TAPS);
      const f = at(Math.min(LT, S.D + 30));
      G.fx.dust(f.x, f.y + 10, 8, 'rgba(150,96,60,');
      mound.style.opacity = String(Math.min(1, S.n / (TAPS * 0.6)));
      if (!S.half && S.n >= TAPS / 2) { S.half = true; G.say(p.deeper || 'Глубже! Внизу земля прохладнее.'); }
      if (S.n >= TAPS) G.wait(DEN.MOVE + 0.5).then(() => { if (G.alive(tok)) toRoom(); });
    });
    G.say(p.intro ? AU.alt(p.intro[0], p.intro[1])
      : AU.alt('Наступает жаркое сухое время. Пора рыть нору — в ней прохладно и безопасно. Нажимай — и рой землю лапами!', 'Нажимай — и рой нору!'));
    G.tick((dt) => {
      S.t += dt;
      // the tunnel grows towards its target; the animal follows the digging front
      let moving = false;
      if (S.D < S.DT) {
        const v = (S.ph === 'dig' ? LT / TAPS / DEN.MOVE : 150), d0 = S.D;
        S.D = Math.min(S.DT, S.D + v * dt); moving = true; S.wph += (2 * Math.PI * (S.D - d0)) / Math.max(1, W.stride);
      }
      const dug = Math.min(S.D, LT);
      for (const e of [rim, hole]) e.setAttribute('stroke-dasharray', `${dug} ${LT + 400}`);
      if (S.dig > 0) { S.dig = Math.max(0, S.dig - dt * 2.6); S.digPh += dt * 10; }
      const q = at(S.D - HX), face = q.dx >= 0 ? 1 : -1;
      // on the floor of the tunnel (or on the ground before it), leaning along the slope
      dino.x = q.x; dino.y = q.y + (q.surf ? 0 : TW / 2 - 7);
      dino.flip = face < 0; dino.rot = q.surf ? 0 : Math.atan2(q.dy, Math.abs(q.dx)) * face * 0.8;
      let body, feet;
      if (moving && S.dig <= 0) [body, feet] = W.walk(S.wph);
      else if (S.dig > 0) {
        // the front paws scratch, the hind ones stand
        const [bs, fs] = W.stand(S.t), [, fw] = W.walk(S.digPh);
        body = bs; feet = fs && fw ? (leg, H, g, side, qq) => (qq && qq.front ? fw : fs)(leg, H, g, side, qq) : fs;
      } else [body, feet] = W.stand(S.t);
      // asleep: curled up low, the head down to the tail, the eyes shut, slow breathing
      if (S.ph === 'sleep') S.sleep = Math.min(1, S.sleep + dt / 1.2);
      if (S.sleep > 0) {
        const k = S.sleep;
        body.bob = (body.bob || 0) + 7 * k; body.head = (body.head || 0) + 20 * k; body.neck = (body.neck || 0) + 12 * k;
        body.tail = (body.tail || 0) + 14 * k; body.tailPh = 1.2;
        S.zT -= dt;
        if (k > 0.6 && S.zT <= 0) { S.zT = 1.1; UI.popText(sc, 'z', dino.x + (dino.flip ? -1 : 1) * HX * 0.6, dino.y - 70, '#F4F1EA', 26); }
      }
      dino.blink = S.sleep > 0.55 ? 1 : blink(S.t, dt);
      dino.pose(body, feet);
    });
  },
};

/* ------------------------------------------------------------------ roots · dig up roots and tubers
   Rhynchosaurs like Hyperodapedon had large claws on their hind feet, like those of digging animals, and the hind legs had room for
   strong muscles: they probably scratch-dug backwards for roots and tubers and picked them up with the hooked beak (Benton 1983).
   Aetosaurs such as Desmatosuchus had an upturned, shovel-like snout tip, perhaps for rooting up soft plants (p.dig 'snout').
   A withered plant shows where a root is: tap it — the animal walks there and digs (every tap is a stroke), the root comes up, it eats. */
const RTS = { GY: 612, TAPS: 3, V: 150, EAT: 1.1, XS: [470, 640, 810, 980, 1150] };
Scenes.roots = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 2), NEED = p.need || 5, GY = RTS.GY, TAPS = p.taps || RTS.TAPS, SNOUT = !!p.snout;
    G.h('div', 'full', sc, { background: '#c9a06a' });
    G.bgImg(p.bg || 'bg_run');
    shades(sc, 0.4, 0);
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: [p.icon || 'leaf', `0 / ${NEED}`] });
    // under the animal: the withered plants, the earth thrown up, the roots coming out of the ground
    const under = G.h('div', 'abs', sc, { left: 0, top: 0, width: 0, height: 0, pointerEvents: 'none' });
    GL.attach(sc);
    const W = walker({ x: 230, y: GY, z: 4 }, p.box || [300, 130]), dino = W.it, HM = W.HEAD[0], HIPX = W.HIP[0];
    const pm = MAN.it_dryplant, PWD = p.pw || 92, PH = (PWD * pm.h) / pm.w, rm = MAN.it_root, RW = p.rw || 96, RH = (RW * rm.h) / rm.w;
    const spots = G.shuffle(RTS.XS.slice()).slice(0, NEED).sort((a, b) => a - b).map((bx) => {
      const x = bx + G.rand(-25, 25);
      const el = G.spr('it_dryplant', under, x - PWD / 2, GY - PH + 10, PWD, PH);
      Object.assign(el.style, { transformOrigin: '50% 100%', filter: 'drop-shadow(0 0 6px rgba(255,236,170,.75)) drop-shadow(0 3px 3px rgba(0,0,0,.35))' });
      const mound = G.h('div', 'abs', under, { left: x - 58, top: GY - 16, width: 116, height: 30, borderRadius: '50% 50% 30% 30%', opacity: 0,
        background: 'radial-gradient(ellipse at 50% 70%, rgba(150,104,64,.95), rgba(128,88,52,.75) 55%, rgba(110,74,44,0) 74%)' });
      return { x, el, mound, n: 0, st: 'wait', root: null };
    });
    const S = { t: 0, x: 230, face: 1, st: 'idle', tx: 230, target: null, dig: 0, digPh: 0, eatT: 0, got: 0, miss: 0, ph: 0, done: false };
    G.dbg = { S, W, spots };
    const blink = blinker();
    const hit = G.h('div', 'hit', sc);
    const hand = UI.hand(G.ui, G.W / 2, G.H / 2, 'tap');
    const pointAt = (x, y) => { const w = G.bgToWorld(x, y); hand.style.left = w.x + 'px'; hand.style.top = w.y + 'px'; hand.style.display = ''; };
    pointAt(spots[0].x, GY - PH / 2);
    // where the animal stands to dig: its mouth (snout rooting) or its hind feet (scratch-digging) over the plant
    const digAt = (sp0) => { S.face = sp0.x >= S.x ? 1 : -1; return sp0.x - S.face * (SNOUT ? HM * 0.92 : HIPX); };
    const finish = async () => {
      S.done = true; AU.play('ok');
      G.say(p.win || 'Наелся! Сильными задними лапами с большими когтями гиперодапедон выкапывал корни и клубни.');
      await G.wait(3.6); if (!G.alive(tok)) return;
      chFinish(C.n, S.miss <= 2 ? 3 : S.miss <= 5 ? 2 : 1, { stat: `Корешков: ${S.got}` });
    };
    G.on(hit, 'pointerdown', (e) => {
      AU.unlock(); if (S.done) return;
      const q = G.bgPt(e);
      hand.style.display = 'none';
      // digging: every tap is a stroke of the claws (or of the snout)
      if (S.st === 'dig') {
        const t = S.target;
        t.n++; S.dig = 1; AU.play('whoosh');
        const back = SNOUT ? t.x : t.x - S.face * 26;
        G.fx.dust(back, GY - 6, 9, 'rgba(150,110,70,');
        t.el.style.transform = `rotate(${(t.n % 2 ? 7 : -7)}deg) scale(${1 - 0.18 * (t.n / TAPS)})`;
        t.mound.style.left = (SNOUT ? t.x - 58 : t.x - S.face * 46 - 58) + 'px';
        t.mound.style.opacity = String(Math.min(1, t.n / TAPS));
        if (t.n >= TAPS) {
          t.st = 'up'; t.el.style.transition = 'opacity .4s'; t.el.style.opacity = '0';
          // the hind feet throw the earth (and the root) out behind the animal: it turns round on the spot and picks the root up
          // with its beak; the snout brings it up right under the mouth
          const rx = SNOUT ? t.x : S.x - S.face * HM * 0.92;
          const r = (t.root = G.spr('it_root', under, rx - RW / 2, GY - 4, RW, RH));
          r.style.filter = 'drop-shadow(0 0 6px rgba(255,236,170,.8)) drop-shadow(0 3px 3px rgba(0,0,0,.35))';
          G.tween(0.45, (u) => { r.style.top = (GY - 4 - (RH + 6) * Math.sin(u * Math.PI / 2)) + 'px'; });
          AU.play('pop');
          t.rx = rx; S.st = 'turn'; S.eatT = 0;
          G.wait(0.5).then(() => { if (!G.alive(tok) || S.st !== 'turn') return; if (!SNOUT) S.face = -S.face; S.st = 'eat'; S.eatT = 0; AU.play('gulp'); });
        }
        return;
      }
      if (S.st !== 'idle') return;
      let best = null;
      for (const s of spots) { if (s.st !== 'wait') continue; const d = Math.hypot(q.x - s.x, q.y - (GY - PH / 2)); if (d < 100 && (!best || d < best.d)) best = { s, d }; }
      if (!best) { S.miss++; G.once('rmiss', p.missTip || 'Корешки прячутся под сухими растениями. Нажми на растение!'); return; }
      S.target = best.s; best.s.st = 'go'; S.tx = digAt(best.s); S.st = 'go';
    });
    G.say(p.intro ? AU.alt(p.intro[0], p.intro[1])
      : AU.alt('Гиперодапедон ищет сочные корешки. Нажми на сухое растение — он подойдёт и разроет землю задними лапами с большими когтями!', 'Нажми на растение — и рой землю лапами!'));
    G.tick((dt) => {
      S.t += dt;
      let moving = false, eating = false;
      if (S.st === 'go') {
        const dx = S.tx - S.x;
        S.face = dx >= 0 ? 1 : -1;
        if (Math.abs(dx) <= RTS.V * dt) {
          S.x = S.tx; S.st = 'dig'; S.target.st = 'dig'; S.target.n = 0; G.once('rtap', p.tapTip || 'Нажимай — и рой землю!');
        } else { S.x += Math.sign(dx) * RTS.V * dt; moving = true; S.ph += ((2 * Math.PI * RTS.V) / Math.max(1, W.stride)) * dt; }
      } else if (S.st === 'eat') {
        eating = true; S.eatT += dt;
        const t = S.target, u = Math.min(1, S.eatT / RTS.EAT);
        if (t && t.root) { t.root.style.transform = `scale(${1 - 0.7 * u})`; t.root.style.opacity = String(1 - u); }
        if (S.eatT >= RTS.EAT) {
          if (t) { if (t.root) t.root.remove(); t.st = 'done'; G.fx.sparkle(t.x, GY - 20, 8); }
          S.got++; top.counter.set(`${Math.min(S.got, NEED)} / ${NEED}`); AU.play('pop');
          if (S.got === 1) G.say(p.first || 'Хрум! Клюв-крючок перекусил сочный корешок.');
          S.target = null; S.st = 'idle';
          if (S.got >= NEED) finish();
          else { const nx = spots.find((s) => s.st === 'wait'); if (nx && S.got === 1) G.wait(1.2).then(() => { if (G.alive(tok) && S.st === 'idle') pointAt(nx.x, GY - PH / 2); }); }
        }
      }
      if (S.dig > 0) { S.dig = Math.max(0, S.dig - dt * 2.4); S.digPh += dt * 11; }
      dino.x = S.x; dino.y = GY; dino.flip = S.face < 0;
      let body, feet;
      if (moving) [body, feet] = W.walk(S.ph);
      else if (S.st === 'dig' && S.dig > 0 && !SNOUT) {
        // the hind feet scratch backwards, the front ones stand; the body leans forward a little
        const [bs, fs] = W.stand(S.t), [, fw] = W.walk(S.digPh);
        body = bs; feet = fs && fw ? (leg, H, g, side, qq) => (qq && !qq.front ? fw : fs)(leg, H, g, side, qq) : fs;
        body.head = (body.head || 0) + 8; body.bob = (body.bob || 0) + 2;
      } else [body, feet] = W.stand(S.t);
      if (S.st === 'dig' && SNOUT) { body.head = (body.head || 0) + 18 + 10 * S.dig * Math.sin(S.digPh); body.neck = (body.neck || 0) + 10; }
      if (eating) { body.head = (body.head || 0) + 16 + 4 * Math.sin(S.eatT * 14); body.neck = (body.neck || 0) + 8; }
      dino.blink = blink(S.t, dt); dino.pose(body, feet);
    });
  },
};
