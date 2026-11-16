'use strict';
/* ==================================================================== game templates for other animals:
   feed (herbivore) · mud (heavy walker) · flap + fishing (flyer) · birth + swim (swimmer)
   every template works with the first species (plateo, eudimo, shoni) and with any "auto" species */

/** horizontally scrolling background from two mirrored GL tiles */
function scrollTiles(key) {
  const rk = G.rbg(key); if (G.img[rk]) key = rk; // the picture of the animal's region when it is loaded, the base one otherwise
  const tiles = [0, 1, 2].map((i) => GL.sprite(key, null, { s: 1280 / 1536, ax: 768, ay: 432, y: 360, flip: i === 1, z: 0 }));
  return (scroll) => { const x0 = -(scroll % 2560); tiles[0].x = x0 + 640; tiles[1].x = x0 + 1920; tiles[2].x = x0 + 3200; };
}
/** labelled meter in the UI layer: returns set(v 0..1, warn) */
function uiMeter(ic, label) {
  const el = G.h('div', 'plate abs', G.ui, { left: 104, top: 94, width: 300, height: 56 });
  el.innerHTML = `<div class="abs" style="left:14px;top:15px;color:#BFE3FF">${icon(ic, ' style="width:24px;height:24px"')}</div>
    <div class="abs" style="left:48px;top:9px;font:500 12px Rubik,sans-serif;opacity:.75">${label}</div>
    <div class="abs" style="left:48px;top:30px;width:232px;height:10px;border-radius:5px;background:rgba(255,255,255,.18)"></div>
    <div class="abs fill" style="left:48px;top:30px;width:232px;height:10px;border-radius:5px;background:#5FC8FF"></div>`;
  const f = el.querySelector('.fill');
  return (v, warn) => { f.style.width = Math.round(232 * G.clamp(v, 0, 1)) + 'px'; f.style.background = warn ? '#F16B4A' : '#5FC8FF'; };
}
/** progress strip with the species silhouette walking to a goal */
function uiTrack(sil, goal) {
  const pr = G.h('div', 'plate abs', G.ui, { left: 104, top: 94, width: 360, height: 56 });
  pr.innerHTML = `<div class="abs" style="left:50px;top:24px;width:250px;height:8px;border-radius:4px;background:rgba(255,255,255,.18)"></div>
    <div class="abs prog" style="left:50px;top:24px;width:0;height:8px;border-radius:4px;background:#F2B640"></div>
    <div class="abs mk" style="left:50px;top:6px;width:60px;height:24px;margin-left:-30px">${silSvg(sil, '#F2B640', ' style="width:60px;height:24px"')}</div>
    <div class="abs" style="right:16px;top:15px;color:#F4F1EA">${icon(goal || 'home', ' style="width:24px;height:24px"')}</div>`;
  const prog = pr.querySelector('.prog'), mk = pr.querySelector('.mk');
  return (p) => { prog.style.width = 250 * p + 'px'; mk.style.left = 50 + 250 * p + 'px'; };
}
const loc = (key, x, y) => { const o = MAN[key]; return [x - o.ox, y - o.oy]; };
const glowImg = (key, parent, cx, cy, w, extra) => {
  const m = MAN[key], h = (w * m.h) / m.w;
  const el = G.spr(key, parent, cx - w / 2, cy - h / 2, w, h);
  el.style.filter = extra || 'drop-shadow(0 0 7px rgba(255,226,140,.9))';
  el.style.pointerEvents = 'none';
  return el;
};
/** chapter number and title from the scene params (falls back to the old fixed numbers) */
const chOf = (p, n0) => { const n = (p && p.n) || n0, c = G.SP().chapters[n - 1]; return { n, name: c ? c.name : '' }; };
/** words for the little things animals catch and eat */
const ITEM = {
  it_fish: { many: 'рыбу', one: 'рыбка', ins: 'ней', cnt: 'рыб' }, it_shrimp: { many: 'рачков', one: 'рачок', ins: 'ним', cnt: 'рачков' },
  it_dragonfly: { many: 'стрекоз', cnt: 'стрекоз' }, it_ammonite: { many: 'аммонитов', cnt: 'аммонитов' }, it_clam: { many: 'ракушки', cnt: 'ракушек' },
  it_fern: { many: 'папоротники', cnt: 'папоротников' }, it_cycad: { many: 'сочные листья', cnt: 'листьев' }, it_horsetail: { many: 'хвощи', cnt: 'хвощей' }, it_branch: { many: 'свежие ветки', cnt: 'веток' },
  it_lizard: { many: 'ящериц', cnt: 'ящериц' }, it_roach: { many: 'тараканов', cnt: 'тараканов' }, it_cyno: { many: 'зверьков', cnt: 'зверьков' },
  it_algae: { many: 'водоросли', cnt: 'водорослей', win: 'Наелся! Водоросли со дна — любимая еда.' }, it_ginkgo: { many: 'листья гинкго', cnt: 'веток' },
  it_shoots: { many: 'сочные побеги', cnt: 'побегов' },
};
/** on-screen scale so the animal's body is about w × h design px */
const fitK = (id, w, h) => { const b = MAN.auto[id].box; return Math.min(w / (b[1] - b[0]), h / (b[3] - b[2])); };
/** a walking animal: {it, K, walk(ph, mod), stand(t), stride, HEAD, NECK, HIP (design px from the anchor at scale K)} */
function walker(o, size) {
  const sp = G.SP(), A = {};
  if (!sp.auto) {
    A.K = o.s || 0.45;
    A.it = GL.makeCreature('plateo', Object.assign({}, o, { s: A.K }));
    const A0 = [A.it.ax, A.it.ay], rel = (q) => [(q[0] - A0[0]) * A.K, (q[1] - A0[1]) * A.K];
    A.HEAD = rel(GL.restPt(A.it, loc('sp_plateo', 1478, 104))); A.NECK = rel(GL.restPt(A.it, loc('sp_plateo', 1160, 300))); A.HIP = rel(A.it.H0);
    // a baby's legs are shorter: so are its steps
    const kb = A.it.mesh.rig.pre ? 1 - GL.BABY_LEG.drop : 1, PW = Object.assign({}, GL.Gaits.PWALK, { reach: GL.Gaits.PWALK.reach * kb, sweep: GL.Gaits.PWALK.sweep * kb, lift: GL.Gaits.PWALK.lift * kb });
    A.walk = (ph, mod) => { const P = mod ? Object.assign({}, PW, { lift: PW.lift + 120 * (mod.lift || 0), psiS: PW.psiS + (mod.psiS || 0), aS: PW.aS + (mod.aS || 0) }) : PW; return GL.Gaits.walk(ph, P); };
    A.stand = (t) => GL.Gaits.stand(t, PW);
    A.stride = (PW.sweep / PW.duty) * A.K;
    return A;
  }
  const d = MAN.auto[sp.id];
  A.K = fitK(sp.id, (size && size[0]) || 380, (size && size[1]) || 230);
  A.it = GL.makeAuto(sp.id, Object.assign({}, o, { s: A.K }));
  const A0 = [A.it.ax, A.it.ay], rel = (q) => [(q[0] - A0[0]) * A.K, (q[1] - A0[1]) * A.K];
  A.HEAD = rel(GL.restPt(A.it, d.mouth)); A.NECK = rel(GL.restPt(A.it, d.neck)); A.HIP = rel(A.it.pivot);
  A.walk = (ph, mod) => GL.autoGait(A.it, 'walk', ph, 0, mod);
  A.stand = (t) => GL.autoGait(A.it, 'stand', 0, t);
  A.stride = GL.autoStride(A.it, 'walk') * A.K;
  return A;
}

/* ------------------------------------------------------------------ herbivore · reach plants with the neck */
Scenes.feed = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 2), NEED = p.need || 8, GROUND = G.floor(652, 30), item = p.item || 'it_branch', low = !!p.low;
    G.lowerBg(G.bgImg(p.bg || 'bg_forest'));
    shades(sc, 0.5, 0);
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: ['leaf', `0 / ${NEED}`] });
    GL.attach(sc);
    const W = walker({ x: 250, y: GROUND, z: 3 }, low ? [340, 210] : [400, 260]);
    const dino = W.it, HEAD = W.HEAD, NECK = W.NECK, HIP = W.HIP;
    const rot = (v, c, a) => { const s = Math.sin(a), co = Math.cos(a), dx = v[0] - c[0], dy = v[1] - c[1]; return [c[0] + co * dx - s * dy, c[1] + s * dx + co * dy]; };
    // a baby on all fours leans forward onto its hands (Massospondylus)
    const FOUR = dino.mesh.rig.four || 0;
    const headAt = (th, ph) => rot(rot(HEAD, NECK, (th - 0.7 * FOUR) * DEG), HIP, (ph + FOUR) * DEG);
    // reachable neck / body angles: high branches for long necks, plants on the ground for the others
    const R = FOUR ? { th0: -30, th1: 34, ph0: -2, ph1: 3 } : low ? { th0: -6, th1: 40, ph0: -2, ph1: 5 } : { th0: -36, th1: 20, ph0: -14, ph1: 0 };
    const S = { got: 0, miss: 0, mode: 'idle', x: 250, dir: 1, tx: 250, th: 0, ph: 0, walkPh: 0, t: 0, spawnT: 0.6, target: null, shoots: [], done: false, blinks: [] };
    G.dbg = { S, dino };
    const CAD = (2 * Math.PI * 190) / W.stride;
    const plan = (T) => {
      let best = null;
      for (const dir of [1, -1]) for (let ph = R.ph1; ph >= R.ph0; ph -= 2) for (let th = R.th1; th >= R.th0; th -= 2) {
        const h = headAt(th, ph), dy = Math.abs(GROUND + h[1] - T.y);
        const x = T.x - dir * h[0], xOk = x > 120 && x < 1100;
        // the animal walks head first: a plan that would make it back up to the plant costs a lot
        const back = Math.abs(x - S.x) > 40 && Math.sign(x - S.x) !== dir;
        const cost = dy * 3 + Math.abs(th) * 0.6 + Math.abs(ph) * 1.2 + Math.abs(x - S.x) * 0.05 + (xOk ? 0 : 1e4) + (back ? 400 : 0);
        if (!best || cost < best.cost) best = { cost, x, th, ph, dir };
      }
      return best;
    };
    const where = () => {
      if (!sp.auto) return [G.rand(380, 1080), G.rand(275, 405)];
      const h = headAt(G.rand(R.th0 + 4, R.th1 - 2), G.rand(R.ph0, R.ph1));
      return [G.rand(200, 980) + h[0], Math.min(GROUND - 30, GROUND + h[1])];
    };
    const spawn = () => {
      let x, y, ok = false;
      for (let k = 0; k < 20 && !ok; k++) { [x, y] = where(); ok = x > 140 && x < 1160 && y > 150 && S.shoots.every((q) => Math.hypot(q.x - x, q.y - y) > 140); }
      if (!ok) return;
      const el = G.h('div', 'abs pe', sc, { left: x - 48, top: y - 48, width: 96, height: 96, cursor: 'pointer' });
      el.innerHTML = `<svg width="96" height="96" style="position:absolute;left:0;top:0"><circle cx="48" cy="48" r="42" fill="rgba(76,210,107,.12)" stroke="#4CD26B" stroke-width="4" stroke-dasharray="264" stroke-dashoffset="0" transform="rotate(-90 48 48)"/></svg>`;
      const im = glowImg(item, el, 48, 48, low ? 78 : 74, 'drop-shadow(0 0 6px rgba(160,255,140,.8))');
      if (!low) im.style.transform = `rotate(${G.rand(-30, 30)}deg)`;
      const q = { x, y, el, life: p.life || 9, t: 0, ring: el.querySelector('circle') };
      el.addEventListener('pointerdown', (e) => { e.stopPropagation(); AU.unlock(); choose(q); });
      el.style.opacity = 0; el.style.transition = 'opacity .3s'; requestAnimationFrame(() => { el.style.opacity = 1; });
      S.shoots.push(q);
    };
    const choose = (q) => {
      if (S.done || q.taken) return;
      if (S.mode !== 'idle') { S.queued = q; return; }
      hand.style.display = 'none';
      q.taken = true; S.target = q; q.el.querySelector('circle').setAttribute('stroke', '#F2B640');
      const pl = plan(q); S.plan = pl; S.dir = pl.dir; S.tx = pl.x; S.mode = 'walk';
    };
    const drop = (q) => { const i = S.shoots.indexOf(q); if (i >= 0) S.shoots.splice(i, 1); q.el.remove(); };
    const hand = UI.hand(sc, 640, 320); hand.style.display = 'none';
    const IT = ITEM[item] || { many: 'растения' };
    G.say(sp.id === 'plateo' ? 'Платеозавр ест листья. Нажимай на свежие побеги — он дотянется длинной шеей!'
      : AU.alt(`${sp.name} ест растения. Нажимай на ${IT.many} — ${sp.name.toLowerCase()} подойдёт и съест!`, `Пора обедать! Нажимай на ${IT.many}.`));
    const finish = async () => {
      S.done = true;
      await G.wait(1.0); if (!G.alive(tok)) return;
      const stars = S.miss <= 1 ? 3 : S.miss <= 3 ? 2 : 1;
      chFinish(C.n, stars, { stat: `Съедено: ${S.got} · завяли: ${S.miss}` });
    };
    G.tick((dt) => {
      S.t += dt;
      if (!S.done) { S.spawnT -= dt; if (S.spawnT <= 0 && S.shoots.filter((q) => !q.taken).length < 2) { spawn(); S.spawnT = G.rand(2.2, 3.0); if (S.t > 1 && S.t < 4 && S.mode === 'idle') { const q0 = S.shoots[0]; if (q0) { hand.style.display = ''; hand.style.left = q0.x + 'px'; hand.style.top = q0.y + 'px'; } } } }
      for (const q of S.shoots.slice()) {
        if (q.taken) continue;
        q.t += dt; q.ring.setAttribute('stroke-dashoffset', String(264 * Math.min(1, q.t / q.life)));
        if (q.t > q.life) { S.miss++; q.el.style.transition = 'opacity .4s, transform .4s'; q.el.style.opacity = 0; q.el.style.transform = 'translateY(30px)'; const qq = q; S.shoots.splice(S.shoots.indexOf(q), 1); setTimeout(() => qq.el.remove(), 450); }
      }
      let body, feet;
      if (S.mode === 'walk') {
        const d = S.tx - S.x, step = 190 * dt;
        // turn round first, then walk forwards; at the plant face the way the plan needs
        const faced = GL.face(dino, Math.abs(d) > 2 ? Math.sign(d) : S.dir, dt);
        if (!faced) { [body, feet] = W.stand(S.t); }
        else if (Math.abs(d) <= step) { S.x = S.tx; S.mode = 'turn'; [body, feet] = W.stand(S.t); }
        else { S.x += Math.sign(d) * step; S.walkPh += dt * CAD; [body, feet] = W.walk(S.walkPh); }
      } else if (S.mode === 'turn') {
        if (GL.face(dino, S.dir, dt)) { S.mode = 'reach'; S.mt = 0; }
        [body, feet] = W.stand(S.t);
      } else [body, feet] = W.stand(S.t);
      if (S.mode === 'reach' || S.mode === 'eat' || S.mode === 'back') {
        S.mt += dt;
        const pl = S.plan;
        if (S.mode === 'reach') {
          const e = G.ease.inOut(Math.min(1, S.mt / 0.45)); S.th = pl.th * e; S.ph = pl.ph * e;
          if (S.mt >= 0.45) { S.mode = 'eat'; S.mt = 0; AU.play('pop'); }
        } else if (S.mode === 'eat') {
          const q = S.target, e = Math.min(1, S.mt / 0.5);
          q.el.style.transform = `scale(${1 - 0.8 * e})`; q.el.style.opacity = 1 - e;
          S.th = pl.th + 5 * Math.sin(Math.PI * e * 2);
          if (S.mt >= 0.5) {
            drop(q); S.got++; top.counter.set(`${S.got} / ${NEED}`); G.fx.sparkle(q.x, q.y, 10); AU.play('ok');
            if (S.got === 3 && sp.id === 'plateo') G.say('Длинная шея — как подъёмный кран: достаёт листья высоко на деревьях!');
            else if (S.got === 3 && p.tip) G.say(p.tip);
            S.mode = 'back'; S.mt = 0;
            if (S.got >= NEED) finish();
          }
        } else {
          const e = G.ease.inOut(Math.min(1, S.mt / 0.4)); S.th = pl.th * (1 - e); S.ph = pl.ph * (1 - e);
          if (S.mt >= 0.4) { S.mode = 'idle'; S.target = null; if (S.queued && !S.done) { const q = S.queued; S.queued = null; if (S.shoots.includes(q)) choose(q); } }
        }
      }
      body.neck = (body.neck || 0) + S.th + 2 * Math.sin(S.t * 1.2); body.pitch = (body.pitch || 0) + S.ph + FOUR;
      if (FOUR) { body.neck -= 0.7 * FOUR; body.arm = S.mode === 'walk' ? 13 * Math.sin(S.walkPh) : 0; }
      body.head = (body.head || 0) + (S.mode === 'eat' ? 6 : 0);
      if (Math.random() < dt / 3) S.blinks.push(S.t);
      let bl = 0; for (const b of S.blinks) { const d = S.t - b; if (d > 0 && d < 0.2) bl = Math.sin((Math.PI * d) / 0.2); }
      dino.blink = bl;
      dino.x = S.x; dino.pose(body, feet);
    });
  },
};

/* ------------------------------------------------------------------ heavy walker · step over mud */
Scenes.mud = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 3), GROUND = G.floor(640), X = 330, DIST = p.dist || 5200;
    G.h('div', 'full', sc, { background: '#2a2a26' });
    GL.attach(sc);
    const bg = scrollTiles('bg_mud');
    chHeader(C.n, C.name);
    UI.topRight();
    const track = uiTrack(sp.sil);
    const W = walker({ x: X, y: GROUND, z: 4, s: 0.36 }, [330, 200]), dino = W.it;
    const S = { scroll: 0, walkPh: 0, d: 0, big: 0, env: 0, stuck: 0, pulls: 0, mist: 0, puddles: [], nextP: 520, t: 0, done: false, sink: 0, first: true };
    G.dbg = { S, dino };
    const hit = G.h('div', 'hit', sc);
    const hand = UI.hand(G.ui, G.W / 2, G.H - 170); hand.style.display = 'none';
    const banner = G.h('div', 'plate banner abs', G.ui, { left: Math.round(G.W / 2), top: 100, transform: 'translateX(-50%) scale(0)', transition: 'transform .25s cubic-bezier(.2,1.5,.4,1)' }, `${icon('hand')}<b>Тяни! Тяни!</b>`);
    G.say(AU.alt(`Земля после дождя топкая. Когда впереди грязь — нажми, и ${sp.name.toLowerCase()} высоко перешагнёт её!`, 'Земля после дождя топкая. Когда впереди грязь — нажми и перешагни её!'));
    G.on(hit, 'pointerdown', () => {
      AU.unlock(); if (S.done) return;
      if (S.stuck > 0) {
        S.pulls++; AU.play('thud'); G.fx.dust(X + 40, GROUND, 4, 'rgba(90,70,45,');
        if (S.pulls >= 6) { S.stuck = 0; banner.style.transform = 'translateX(-50%) scale(0)'; AU.play('ok'); G.say('Выбрался! Смотри под ноги.'); }
        return;
      }
      if (S.big <= 0) { S.big = 1.0; hand.style.display = 'none'; AU.play('step'); }
    });
    const win = async () => {
      S.done = true;
      G.say(sp.id === 'plateo' ? 'Ты перешёл топь! Платеозавры, наверное, часто вязли в грязи — поэтому в Германии нашли так много их костей.' : 'Ура! Топь позади!');
      AU.play('ok');
      await G.wait(2.4); if (!G.alive(tok)) return;
      const stars = S.mist === 0 ? 3 : S.mist <= 2 ? 2 : 1;
      chFinish(C.n, stars, { stat: `Увяз: ${S.mist} раз` });
    };
    G.tick((dt) => {
      S.t += dt;
      const moving = !S.done && S.stuck <= 0;
      const pace = moving ? (S.big > 0 ? 165 : 120) : 0;
      if (S.big > 0) S.big -= dt;
      S.scroll += pace * dt * 0.35; bg(S.scroll);
      S.d += pace * dt;
      S.walkPh += dt * (2 * Math.PI * pace) / W.stride;
      track(G.clamp(S.d / DIST, 0, 1));
      if (!S.done && S.d > S.nextP && S.d < DIST - 500) {
        const w = G.rand(170, 230), h = (w * MAN.it_puddle.h) / MAN.it_puddle.w;
        const el = G.spr('it_puddle', sc, 0, 0, w, h); el.style.zIndex = 1;
        S.puddles.push({ x: 1360 + w / 2, w, h, el, done: false });
        S.nextP = S.d + G.rand(520, 760);
      }
      for (const q of S.puddles.slice()) {
        q.x -= pace * dt;
        q.el.style.left = q.x - q.w / 2 + 'px'; q.el.style.top = GROUND - q.h * 0.55 + 'px';
        if (S.first && !q.done && q.x < X + 420 && q.x > X + 200) { hand.style.display = ''; S.first = false; }
        if (!q.done && Math.abs(q.x - (X + 30)) < q.w * 0.3) {
          if (S.big > 0) { q.done = true; }
          else { q.done = true; S.stuck = 1; S.pulls = 0; S.mist++; AU.play('thud'); banner.style.transform = 'translateX(-50%) scale(1)'; G.say('Ой, увяз! Нажимай быстро — тяни ноги из грязи!'); G.fx.dust(X + 30, GROUND, 10, 'rgba(90,70,45,'); }
        }
        if (q.x < -200) { q.el.remove(); S.puddles.splice(S.puddles.indexOf(q), 1); }
      }
      S.sink = G.lerp(S.sink, S.stuck > 0 ? 22 : 0, Math.min(1, dt * 5));
      S.env = G.lerp(S.env, S.big > 0 ? 1 : 0, Math.min(1, dt * 8));
      const [body, feet] = W.walk(S.walkPh, { lift: 0.42 * S.env, psiS: 14 * S.env, aS: 8 * S.env });
      if (S.stuck > 0) { body.pitch = (body.pitch || 0) + 3 * Math.sin(S.t * 9); body.neck = -6; }
      body.neck = (body.neck || 0) + 2 * Math.sin(S.t * 1.7);
      dino.y = GROUND + S.sink; dino.pose(body, feet);
      if (!S.done && S.d >= DIST) win();
    });
  },
};

/* ------------------------------------------------------------------ flyer · first flight (tap = flap) */
/** the flying species: it.flapPose(t, acts, blinks, amp 0..1, phase), it.headPt() */
function flyer(o) {
  const sp = G.SP();
  if (!sp.auto) {
    const it = GL.sprite('sp_eudimo', GL.youngRig(GL.RIGS.eudimo(), 'eudimo', o.young), Object.assign({ ax: loc('sp_eudimo', 760, 420)[0], ay: loc('sp_eudimo', 760, 420)[1], z: 4 }, o));
    const head = GL.restPt(it, loc('sp_eudimo', 1290, 300));
    it.headPt = () => it.toDesign(head[0], head[1]);
    it.flapPose = (t, acts, blinks, a, ph) => Pose.eudimo(t, acts, blinks, { A: 5 + 21 * a, ph });
    return it;
  }
  const M = GL.autoModel(sp.id), d = MAN.auto[sp.id], pf = Pose.auto(sp.id);
  const k = (o.s || 0.2) / 0.2 * fitK(sp.id, 300, 230);
  const it = GL.sprite('sp_' + sp.id, GL.RIGS.auto(sp.id), Object.assign({ ax: M.ax, ay: M.ay, z: 4 }, o, { s: k }));
  const mth = GL.restPt(it, d.mouth);
  it.headPt = () => it.toDesign(mth[0], mth[1]);
  it.flapPose = (t, acts, blinks, a, ph) => pf(t, acts, blinks, { A: (d.type === 'glider' ? 0.05 : 0.1) + 0.65 * a, ph });
  return it;
}
Scenes.flap = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 2), NEED = p.need || 8, prey = p.prey || 'it_dragonfly', land = (p.bg || 'bg_lagoon') !== 'bg_lagoon';
    const WATER = land ? 520 : 500;
    G.h('div', 'full', sc, { background: '#7fb8e6' });
    GL.attach(sc);
    const bg = scrollTiles(p.bg || 'bg_lagoon');
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: ['bug', `0 / ${NEED}`] });
    const bird = flyer({ x: 330, y: 280, s: 0.2 });
    const S = { y: 280, vy: 0, t: 0, flapT: 0, ph: 0, A: 0, got: 0, splash: 0, scroll: 0, flies: [], nextF: 1.2, done: false, acts: [], blinks: [] };
    G.dbg = { S, bird };
    const hit = G.h('div', 'hit', sc);
    const hand = UI.hand(G.ui, G.W / 2, G.H / 2, 'tap');
    G.say(`Малыш учится летать! Нажимай — он взмахнёт крыльями. Лови ${(ITEM[prey] || ITEM.it_dragonfly).many} и не падай в воду.`);
    G.on(hit, 'pointerdown', () => { AU.unlock(); if (S.done) return; hand.style.display = 'none'; S.vy = Math.min(S.vy, 0) - 330; S.vy = Math.max(S.vy, -420); S.flapT = 0.38; AU.play('whoosh'); });
    const win = async () => {
      S.done = true; G.say(sp.id === 'eudimo' ? 'Ура, настоящий лётчик! Эудиморфодон рулил хвостом с ромбиком на конце.' : 'Ура, настоящий лётчик!');
      await G.wait(1.8); if (!G.alive(tok)) return;
      const stars = S.splash === 0 ? 3 : S.splash <= 2 ? 2 : 1;
      chFinish(C.n, stars, { stat: `Поймано: ${S.got} · ${land ? 'слишком низко' : 'плюх в воду'}: ${S.splash}` });
    };
    G.tick((dt) => {
      S.t += dt; S.scroll += 70 * dt; bg(S.scroll);
      if (!S.done) {
        S.vy += 650 * dt; S.y += S.vy * dt;
        if (S.y < 90) { S.y = 90; S.vy = Math.max(S.vy, 40); }
        if (S.y > WATER) { S.y = WATER; S.vy = -430; S.splash++; S.flapT = 0.4; AU.play('thud'); G.fx.dust(330, WATER + 30, 12, land ? 'rgba(200,170,120,' : 'rgba(220,240,255,'); G.once('low', land ? 'Ой, низко! Взмахивай чаще, чтобы не задеть кусты.' : 'Плюх! Взмахивай чаще, чтобы не падать в воду.'); }
      } else { S.y = G.lerp(S.y, 260, Math.min(1, dt * 2)); S.vy = 0; }
      S.flapT -= dt;
      const flapping = S.flapT > 0 || S.done;
      S.A = G.lerp(S.A, flapping ? 1 : 0, Math.min(1, dt * 10));
      S.ph += dt * 2 * Math.PI * (flapping ? 2.6 : 0.5);
      const ps = bird.flapPose(S.t, S.acts, S.blinks, S.A, S.ph);
      bird.mesh.deform(ps); bird.blink = ps.blink || 0;
      bird.y = S.y; bird.rot = G.clamp(S.vy * 0.0006, -0.25, 0.3);
      S.nextF -= dt;
      if (!S.done && S.nextF <= 0) {
        const el = glowImg(prey, sc, 0, 0, prey === 'beetle' ? 46 : 66);
        S.flies.push({ x: 1340, y0: G.rand(140, 440), ph: G.rand(0, 6), el });
        S.nextF = G.rand(1.1, 1.9);
      }
      const hp = bird.headPt();
      for (const f of S.flies.slice()) {
        f.x -= 190 * dt; f.ph += dt * 3;
        const fy = f.y0 + Math.sin(f.ph) * 26;
        f.el.style.left = f.x - (prey === 'beetle' ? 23 : 33) + 'px'; f.el.style.top = fy - 25 + 'px'; f.el.style.transform = `rotate(${(prey === 'beetle' ? -60 : -90) + Math.sin(f.ph * 2) * 8}deg)`;
        if (!S.done && Math.hypot(f.x - hp[0], fy - hp[1]) < 56) {
          S.got++; top.counter.set(`${S.got} / ${NEED}`); AU.play('pop'); G.fx.sparkle(f.x, fy, 8);
          S.acts.push({ type: 'jaw', t0: S.t, dur: 0.5 });
          f.el.remove(); S.flies.splice(S.flies.indexOf(f), 1);
          if (S.got >= NEED) win();
          continue;
        }
        if (f.x < -80) { f.el.remove(); S.flies.splice(S.flies.indexOf(f), 1); }
      }
    });
  },
};

/* ------------------------------------------------------------------ flyer · fishing (tap the water to dive) */
Scenes.fishing = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 3), NEED = p.need || 6, SURF = 485, prey = p.prey || 'it_fish', IT = ITEM[prey] || ITEM.it_fish;
    G.bgImg('bg_lagoon');
    shades(sc, 0.45, 0);
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: ['fish', `0 / ${NEED}`] });
    GL.attach(sc);
    const bird = flyer({ x: 300, y: 210, s: 0.26 });
    const S = { x: 300, y: 210, dir: 1, t: 0, ph: 0, A: 0.2, got: 0, miss: 0, fish: [], mode: 'glide', done: false, acts: [], blinks: [] };
    G.dbg = { S, bird };
    const water = G.h('div', 'abs pe', sc, { left: 0, top: SURF, width: 1280, height: 720 - SURF, cursor: 'pointer' });
    const fw = prey === 'it_fish' ? 92 : 78;
    for (let i = 0; i < 4; i++) {
      const el = glowImg(prey, sc, 0, 0, fw, 'brightness(.85) saturate(.8) drop-shadow(0 0 6px rgba(180,230,255,.7))');
      el.style.opacity = 0.85;
      const f = { el, x: G.rand(200, 1100), y: G.rand(SURF + 25, SURF + 75), v: G.rand(50, 100) * (Math.random() < 0.5 ? -1 : 1), ph: G.rand(0, 6) };
      f.ring = G.h('div', 'abs', sc, { width: 70, height: 16, marginLeft: '-35px', marginTop: '-8px', borderRadius: '50%', border: '2px solid rgba(255,255,255,.7)', pointerEvents: 'none' });
      S.fish.push(f);
    }
    G.say(AU.alt(`${sp.name} ловит ${IT.many}! Нажми на воду там, где плавает ${IT.one}, — он нырнёт за ${IT.ins}.`, `Пора ловить ${IT.many}! Нажми на воду там, где плавает ${IT.one}.`));
    const hand = UI.hand(sc, S.fish[0].x, SURF + 30);
    const dive = async (tx) => {
      if (S.mode !== 'glide' || S.done) return;
      S.mode = 'dive'; hand.style.display = 'none';
      const x0 = S.x, y0 = S.y, dir = tx >= x0 ? 1 : -1; S.dir = dir; bird.flip = dir < 0;
      AU.play('whoosh');
      await G.tween(0.5, (e) => { S.x = G.lerp(x0, tx, e); S.y = G.lerp(y0, SURF - 30, e * e); }, G.ease.lin);
      if (!G.alive(tok)) return;
      const f = S.fish.find((q) => Math.abs(q.x - tx) < 95);
      G.fx.dust(tx, SURF + 6, 10, 'rgba(225,245,255,');
      if (f) {
        S.got++; top.counter.set(`${S.got} / ${NEED}`); AU.play('ok'); G.fx.sparkle(tx, SURF - 20, 12);
        S.acts.push({ type: 'jaw', t0: S.t, dur: 0.6 });
        f.x = Math.random() < 0.5 ? -120 : 1400; f.y = G.rand(SURF + 25, SURF + 75);
        if (S.got === 2 && sp.id === 'eudimo') G.say('В животе у эудиморфодона учёные нашли рыбу — значит, он и правда был рыбаком!');
        else if (S.got === 2 && p.tip) G.say(p.tip);
      } else { S.miss++; AU.play('miss'); }
      const x1 = S.x;
      await G.tween(0.55, (e) => { S.x = x1 + dir * 140 * e; S.y = G.lerp(SURF - 30, 210, G.ease.out(e)); }, G.ease.lin);
      if (!G.alive(tok)) return;
      S.mode = 'glide';
      if (S.got >= NEED && !S.done) {
        S.done = true;
        await G.wait(1.0); if (!G.alive(tok)) return;
        const stars = S.miss <= 1 ? 3 : S.miss <= 4 ? 2 : 1;
        chFinish(C.n, stars, { stat: `Поймано: ${S.got} · промахов: ${S.miss}` });
      }
    };
    water.addEventListener('pointerdown', (e) => { AU.unlock(); dive(G.clamp(G.bgPt(e).x, 120, 1160)); });
    G.tick((dt) => {
      S.t += dt;
      if (S.mode === 'glide') {
        S.x += S.dir * 110 * dt; S.y = 210 + Math.sin(S.t * 1.3) * 14;
        if (S.x > 1100) { S.dir = -1; } if (S.x < 180) { S.dir = 1; }
        bird.flip = S.dir < 0;
      }
      const diving = S.mode === 'dive';
      S.A = G.lerp(S.A, diving ? 0 : 0.25 + 0.35 * Math.max(0, Math.sin(S.t * 0.9)), Math.min(1, dt * 6));
      S.ph += dt * 2 * Math.PI * (diving ? 0.3 : 1.1);
      const ps = bird.flapPose(S.t, S.acts, S.blinks, S.A, S.ph);
      bird.mesh.deform(ps); bird.blink = ps.blink || 0;
      bird.x = S.x; bird.y = S.y + (diving ? 0 : (ps.yOff || 0) * bird.s); bird.rot = diving ? 0.35 * S.dir : 0;
      for (const f of S.fish) {
        f.ph += dt * 2; f.x += f.v * dt;
        if (f.x > 1360) f.v = -Math.abs(f.v); if (f.x < -80) f.v = Math.abs(f.v);
        const fy = f.y + Math.sin(f.ph) * 8;
        f.el.style.left = f.x - fw / 2 + 'px'; f.el.style.top = fy - 18 + 'px'; f.el.style.transform = f.v < 0 ? 'scaleX(-1)' : '';
        f.ring.style.left = f.x + 'px'; f.ring.style.top = SURF + 4 + 'px'; f.ring.style.opacity = 0.4 + 0.4 * Math.sin(S.t * 4 + f.ph);
      }
    });
  },
};

/* ------------------------------------------------------------------ swimmer · birth and the first breath */
/** a swimming species: it.swimPose(t, acts, blinks, speed), it.mouthPt(); size = body length in design px */
function swimmer(o, size) {
  const sp = G.SP();
  if (!sp.auto) {
    const a = loc('sp_shoni', 800, 400);
    const it = GL.sprite('sp_shoni', GL.youngRig(GL.RIGS.shoni(), 'shoni', o.young), Object.assign({ ax: a[0], ay: a[1], z: 4 }, o));
    const m = GL.restPt(it, loc('sp_shoni', 1495, 340));
    it.mouthPt = () => it.toDesign(m[0], m[1]);
    it.swimPose = (t, acts, blinks, speed) => Pose.shoni(t, acts, blinks, speed);
    return it;
  }
  const id = sp.id, d = MAN.auto[id], b = d.box, pf = Pose.auto(id);
  const ax = (b[0] + b[1]) / 2, ay = (b[2] + b[3]) / 2;
  const k = size ? Math.min(size / (b[1] - b[0]), (size * 0.42) / (b[3] - b[2])) : o.s;
  // four-legged swimmers (castorocauda, karaurus, mastodonsaurus, siderops) paddle with jointed legs instead of floating in a walking pose
  const it = GL.isWalker(id) ? GL.waterWalker(id, Object.assign({ ax, ay, z: 4 }, o, { s: k }))
    : GL.sprite('sp_' + id, GL.RIGS.auto(id, o.young), Object.assign({ ax, ay, z: 4 }, o, { s: k }));
  const mth = GL.restPt(it, d.mouth);
  it.mouthPt = () => it.toDesign(mth[0], mth[1]);
  it.swimPose = (t, acts, blinks, speed) => Object.assign(pf(t, acts, blinks, { speed, swim: true }), { _speed: speed });
  return it;
}
Scenes.birth = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 1), SURF = 70;
    G.bgImg('bg_sea');
    chHeader(C.n, C.name);
    UI.topRight();
    GL.attach(sc);
    const mom = swimmer({ x: 560, y: 470, s: 0.42, z: 3, young: false }, sp.auto ? 640 : 0);
    const kB = sp.auto ? mom.s * 0.24 : 0.1;
    const baby = swimmer({ x: 520, y: 520, s: 0.02, z: 5, alpha: 0, young: true });
    baby.s = kB * 0.2;
    const meter = uiMeter('droplet', 'Воздух');
    const S = { t: 0, y: 520, vy: 0, air: 1, born: false, done: false, taps: 0, help: 0, helpT: 0, acts: [], macts: [], blinks: [] };
    G.dbg = { S, baby, mom };
    const hit = G.h('div', 'hit', sc);
    G.wait(0.6).then(async () => {
      if (!G.alive(tok)) return;
      await G.tween(1.2, (e) => { baby.alpha = e; baby.s = kB * (0.2 + 0.8 * e); baby.x = 520 - 70 * e; }, G.ease.out);
      if (!G.alive(tok)) return;
      S.born = true; AU.baby(G.cur());
      G.say('Малыш родился! Он рептилия и дышит воздухом. Нажимай — помоги ему всплыть и вдохнуть!');
      hand.style.display = '';
    });
    const hand = UI.hand(G.ui, G.W / 2, G.H / 2, 'tap'); hand.style.display = 'none';
    G.on(hit, 'pointerdown', () => {
      AU.unlock(); if (!S.born || S.done) return;
      hand.style.display = 'none'; S.taps++;
      S.vy = Math.max(-260, S.vy - 95); S.acts.push({ type: 'swish', t0: S.t, dur: 0.45 }); AU.play('whoosh');
    });
    const win = async () => {
      S.done = true; AU.play('ok');
      for (let i = 0; i < 14; i++) G.fx.emit({ type: 'puff', x: baby.x + G.rand(-20, 20), y: SURF + G.rand(-6, 6), vx: G.rand(-60, 60), vy: G.rand(-120, -40), g: 120, life: 0.8, size: G.rand(6, 12), color: 'rgba(235,248,255,', drag: 2 });
      G.say('Первый вдох! Теперь малыш будет всплывать за воздухом всю жизнь.');
      await G.wait(2.2); if (!G.alive(tok)) return;
      const stars = S.help === 0 ? (S.t < 14 ? 3 : 2) : 1;
      chFinish(C.n, stars, { stat: S.help ? 'Мама помогла малышу всплыть' : 'Малыш сам всплыл и вдохнул!',
        note: sp.id === 'shoni' ? 'Ихтиозавры рожали детёнышей прямо в море. В Неваде, где нашли шонизавров, может быть, было место, куда они приплывали рожать.' : undefined });
    };
    G.tick((dt) => {
      S.t += dt;
      const mp = mom.swimPose(S.t, S.macts, [], 0.35);
      mom.mesh.deform(mp); mom.y = 470 + Math.sin(S.t * 0.8) * 8; mom.x = 560 + Math.sin(S.t * 0.3) * 20;
      if (S.born && !S.done) {
        S.air -= dt * 0.075;
        if (S.air <= 0 && S.helpT <= 0) { S.help++; S.helpT = 1.6; S.air = 0.35; S.macts.push({ type: 'look', t0: S.t, dur: 1.2 }); G.once('help', 'Мама подтолкнула малыша наверх!'); }
        if (S.helpT > 0) { S.helpT -= dt; S.vy = Math.min(S.vy, -170); }
        S.vy += (S.vy < 0 ? 140 : 60) * dt; S.vy = Math.min(S.vy, 40);
        S.y += S.vy * dt;
        if (S.y > 560) { S.y = 560; S.vy = 0; }
        if (S.y <= SURF + 10) { S.y = SURF + 10; win(); }
      }
      if (S.done) S.y = G.lerp(S.y, SURF + 18, Math.min(1, dt * 3));
      meter(S.air, S.air < 0.3);
      if (S.born) {
        const bp = baby.swimPose(S.t, S.acts, S.blinks, 0.9);
        baby.mesh.deform(bp); baby.blink = bp.blink || 0;
        baby.y = S.y; baby.x = G.lerp(baby.x, 450 + Math.sin(S.t * 0.7) * 20, Math.min(1, dt * 2));
        baby.rot = G.clamp(S.vy * 0.004, -0.9, 0.25);
      }
    });
  },
};

/* ------------------------------------------------------------------ swimmer · hunt, breathe at the surface (reef: pick clams off the seabed) */
Scenes.swim = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 2), NEED = p.need || 10, SURF = 105, X = 330, reef = !!p.reef, BED = 640;
    const food = p.food || ['it_ammonite', 'it_belemnite'], IT = ITEM[food[0]] || ITEM.it_ammonite;
    G.h('div', 'full', sc, { background: '#0b3f78' });
    GL.attach(sc);
    const bg = scrollTiles('bg_sea');
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: [reef ? 'zap' : 'fish', `0 / ${NEED}`] });
    const meter = uiMeter('droplet', 'Воздух');
    const fish = swimmer({ x: X, y: 360, s: 0.17, z: 4 }, sp.auto ? 300 : 0);
    const drain = p.level === 1 ? 0.035 : p.level === 3 ? 0.065 : 0.05, speed = reef ? 110 : p.level === 3 ? 175 : 150;
    const S = { t: 0, y: 360, ty: 360, vy: 0, air: 1, got: 0, outs: 0, forced: 0, food: [], nextF: 0.8, scroll: 0, done: false, hold: false, acts: [], blinks: [], warned: false };
    G.dbg = { S, fish };
    const hit = G.h('div', 'hit', sc);
    const hand = UI.hand(G.ui, G.W / 2, G.H / 2 + 60, 'hold');
    G.say(sp.id === 'shoni' ? 'Веди пальцем вверх и вниз — шонизавр поплывёт за ним. Лови аммонитов, а за воздухом всплывай наверх!'
      : reef ? AU.alt(`Веди пальцем вверх и вниз — ${sp.name.toLowerCase()} поплывёт за ним. Собирай ${IT.many} на дне, а за воздухом всплывай наверх!`, `Веди пальцем вверх и вниз — и плыви за ним. Собирай ${IT.many} на дне, а за воздухом всплывай наверх!`)
        : AU.alt(`Веди пальцем вверх и вниз — ${sp.name.toLowerCase()} поплывёт за ним. Лови ${IT.many}, а за воздухом всплывай наверх!`, `Веди пальцем вверх и вниз — и плыви за ним. Лови ${IT.many}, а за воздухом всплывай наверх!`));
    const setT = (e) => { S.ty = G.clamp(G.bgPt(e).y, SURF - 20, reef ? BED - 30 : 640); };
    G.on(hit, 'pointerdown', (e) => { AU.unlock(); S.hold = true; S.pid = e.pointerId; hand.style.display = 'none'; setT(e); });
    G.on(window, 'pointermove', (e) => { if (S.hold && e.pointerId === S.pid) setT(e); });
    const up = (e) => { if (e.pointerId === S.pid) S.hold = false; };
    G.on(window, 'pointerup', up); G.on(window, 'pointercancel', up);
    if (reef) { // sand and rocks of the seabed
      G.h('div', 'abs', sc, { left: 0, top: BED - 6, width: 1280, height: 720 - BED + 6, background: 'linear-gradient(rgba(194,170,120,.0),rgba(170,145,100,.75) 30%,rgba(120,100,70,.9))', pointerEvents: 'none' });
    }
    const win = async () => {
      S.done = true; AU.play('ok');
      G.say(sp.id === 'shoni' ? 'Отличная охота! Длинные ласты помогали шонизавру рулить, а хвост с плавником — быстро плыть.' : IT.win ? IT.win : reef ? 'Отличный улов! Ракушки — любимая еда.' : 'Отличная охота!');
      await G.wait(2.0); if (!G.alive(tok)) return;
      const stars = S.outs === 0 ? 3 : S.outs === 1 ? 2 : 1;
      chFinish(C.n, stars, { stat: `Поймано: ${S.got} · воздух кончался: ${S.outs}` });
    };
    G.tick((dt) => {
      S.t += dt; S.scroll += (reef ? 90 : 120) * dt; bg(S.scroll);
      const atSurf = S.y < SURF + 12;
      if (atSurf) { S.air = Math.min(1, S.air + dt * 0.7); if (Math.random() < dt * 10) G.fx.emit({ type: 'puff', x: X + 90 + G.rand(-10, 10), y: SURF - 30 + G.rand(-4, 4), vx: G.rand(-30, 30), vy: G.rand(-90, -40), g: 100, life: 0.6, size: G.rand(5, 9), color: 'rgba(235,248,255,', drag: 2 }); }
      else if (!S.done) S.air -= dt * drain;
      if (S.air < 0.25 && !S.warned && !atSurf) { S.warned = true; G.once('air', 'Воздух кончается — плыви наверх!'); }
      if (S.air > 0.6) S.warned = false;
      if (S.air <= 0 && S.forced <= 0) { S.outs++; S.forced = 1; AU.play('miss'); }
      if (S.forced > 0) { S.ty = SURF - 20; if (S.air >= 0.6) S.forced = 0; }
      meter(S.air, S.air < 0.25);
      const prevY = S.y;
      S.y = G.lerp(S.y, S.ty, Math.min(1, dt * 2.6)); S.y = G.clamp(S.y, SURF - 15, reef ? BED - 30 : 640);
      S.vy = (S.y - prevY) / Math.max(dt, 1e-3);
      const ps = fish.swimPose(S.t, S.acts, S.blinks, 0.9);
      fish.mesh.deform(ps); fish.blink = ps.blink || 0;
      fish.y = S.y + (ps.yOff || 0) * fish.s; fish.rot = G.clamp(S.vy * 0.0016, -0.4, 0.4);
      S.nextF -= dt;
      if (!S.done && S.nextF <= 0) {
        const key = G.pick(food), w = key === 'it_clam' ? 62 : key === 'it_algae' ? 64 : key === 'it_ammonite' ? 70 : key === 'it_fish' ? 84 : key === 'it_shrimp' ? 74 : 92;
        const el = glowImg(key, sc, 0, 0, w, 'drop-shadow(0 0 6px rgba(255,236,170,.85))');
        const still = key === 'it_clam' || key === 'it_algae', tall = key === 'it_algae' ? (w * MAN[key].h) / MAN[key].w : 50;
        S.food.push({ x: 1340, y0: reef ? G.rand(BED - 40, BED - 14) : G.rand(SURF + 70, 620), ph: G.rand(0, 6), el, w, still, tall });
        S.nextF = reef ? G.rand(1.2, 1.9) : G.rand(0.9, 1.5);
      }
      const mp = fish.mouthPt();
      for (const f of S.food.slice()) {
        f.x -= (f.still ? (reef ? 90 : 120) : speed) * dt; f.ph += dt * 2;
        const fy = f.y0 + (f.still ? 0 : Math.sin(f.ph) * 14);
        f.el.style.left = f.x - f.w / 2 + 'px'; f.el.style.top = fy - f.tall / 2 + 'px';
        if (!S.done && Math.hypot(f.x - mp[0], fy - mp[1]) < (reef ? 64 : 56)) {
          S.got++; top.counter.set(`${S.got} / ${NEED}`); AU.play(reef ? 'crack' : 'pop'); G.fx.sparkle(f.x, fy, 8);
          S.acts.push({ type: 'snap', t0: S.t, dur: 0.45 });
          f.el.remove(); S.food.splice(S.food.indexOf(f), 1);
          if (S.got === 4) {
            if (sp.id === 'shoni') G.say('Шонизавры охотились на аммонитов — родственников кальмаров в красивых раковинах.');
            else if (p.tip) G.say(p.tip);
          }
          if (S.got >= NEED) win();
          continue;
        }
        if (f.x < -100) { f.el.remove(); S.food.splice(S.food.indexOf(f), 1); }
      }
    });
  },
};
