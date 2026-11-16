'use strict';
/* ==================================================================== more game templates for the new animals:
   chase (run and snap) · sneak (hunt: creep up on prey / hide: slip past a predator) · glide (tree to tree) · ambush (strike from hiding) */

/** blink schedule shared by the templates */
const blinker = () => { const B = []; return (t, dt) => { if (Math.random() < dt / 3) B.push(t); if (B.length > 4) B.shift(); let b = 0; for (const s of B) { const d = t - s; if (d > 0 && d < 0.2) b = Math.sin((Math.PI * d) / 0.2); } return b; }; };
/** a DOM picture of a small animal standing on the ground at (x, gy); faces right */
function critter(key, parent, w, o) {
  o = o || {};
  const m = MAN[key], vert = !!o.vert, h = vert ? (w * m.w) / m.h : (w * m.h) / m.w;
  const el = G.h('div', 'abs', parent, { width: w, height: h, pointerEvents: 'none' });
  const im = G.spr(key, el, vert ? (w - h) / 2 : 0, vert ? (h - w) / 2 : 0, vert ? h : w, vert ? w : h);
  if (vert) im.style.transform = 'rotate(90deg)';
  im.style.filter = o.filter || 'drop-shadow(0 4px 4px rgba(0,0,0,.45))';
  return { el, im, w, h, x: 0, y: 0, face: 1, place(x, y, face, bob) { this.x = x; this.y = y; this.face = face; el.style.left = x - w / 2 + 'px'; el.style.top = y - h + (bob || 0) + 'px'; el.style.transform = face < 0 ? 'scaleX(-1)' : ''; } };
}

/* ------------------------------------------------------------------ chase · run after small prey, tap to snap */
Scenes.chase = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 2), NEED = p.need || 6, GY = 612, X = 300, prey = p.prey || 'it_lizard', IT = ITEM[prey] || ITEM.it_lizard;
    G.h('div', 'full', sc, { background: '#c9a06a' });
    GL.attach(sc);
    const bg = scrollTiles(p.bg || 'bg_run');
    shades(sc, 0.45, 0);
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: ['paw', `0 / ${NEED}`] });
    const K = fitK(sp.id, sp.type === 'biped' ? 390 : 330, 200), dino = GL.makeAuto(sp.id, { x: X, y: GY, s: K, z: 3 });
    const d = MAN.auto[sp.id], mth = GL.restPt(dino, d.mouth), HEAD = [(mth[0] - dino.ax) * K, (mth[1] - dino.ay) * K];
    // fast prey: the hunter runs faster too, so the prey still comes into reach quickly (only the snap window is shorter)
    const STRIDE = GL.autoStride(dino, 'run') * K, V = p.fast ? 390 : 330;
    const S = { t: 0, ph: 0, scroll: 0, got: 0, miss: 0, cur: null, nextT: 1.0, lunge: 0, done: false, acts: [] };
    const blink = blinker();
    G.dbg = { S, dino };
    // snap ring in front of the mouth
    const ring = G.h('div', 'abs', sc, { width: 120, height: 120, marginLeft: '-60px', marginTop: '-60px', borderRadius: '50%', border: '5px solid rgba(255,255,255,.55)', pointerEvents: 'none', transition: 'border-color .15s, transform .15s' });
    const hit = G.h('div', 'hit', sc);
    const hand = UI.hand(G.ui, G.W / 2, G.H / 2, 'tap'); hand.style.display = 'none';
    G.say(AU.alt(`Догоняй ${IT.many}! Когда добыча в светящемся круге — нажимай, и ${sp.name.toLowerCase()} схватит её.`, `Догоняй ${IT.many}! Когда добыча в светящемся круге — нажимай и хватай её.`));
    const zone = () => { const mx = X + HEAD[0] + 46; return { x: mx, y: GY - 34 }; };
    G.dbg.zone = zone;
    const spawn = () => {
      const w = prey === 'it_lizard' ? 118 : prey === 'nb_exaeretodon' ? 170 : prey === 'it_roach' ? 70 : 130, c = critter(prey, sc, w, { vert: prey === 'it_roach' });
      S.cur = { c, x: 1360, v: G.rand(150, 185) + (p.fast ? 45 : 0), ph: G.rand(0, 6), state: 'run', inT: 0, op: 1 };
    };
    const snap = () => {
      if (S.done || S.lunge > 0) return;
      hand.style.display = 'none';
      S.lunge = 0.32; S.acts.push({ type: 'snap', t0: S.t, dur: 0.35 }); AU.play('whoosh');
      const q = S.cur, z = zone();
      if (q && q.state === 'run' && Math.abs(q.x - z.x) < 74) {
        q.state = 'caught'; S.got++; top.counter.set(`${S.got} / ${NEED}`);
        AU.play('catch'); G.fx.sparkle(q.x, GY - 30, 14); UI.popText(sc, 'Поймал!', q.x, GY - 120, '#F2B640', 30);
        G.tween(0.3, (e) => { q.c.el.style.opacity = 1 - e; }).then(() => q.c.el.remove());
        S.cur = null; S.nextT = G.rand(0.9, 1.6);
        if (S.got === 3) G.say('Ловко! Ещё!');
        if (S.got >= NEED) finish();
      } else {
        S.miss++; AU.play('miss');
        if (q && q.state === 'run' && q.x < z.x + 260) { q.state = 'flee'; G.once('early', 'Рано! Подожди, пока добыча будет в круге.'); }
      }
    };
    G.on(hit, 'pointerdown', () => { AU.unlock(); snap(); });
    const finish = async () => {
      S.done = true;
      G.say('Отличная охота! Быстрые ноги и острые зубы — вот что нужно хищнику.');
      await G.wait(1.8); if (!G.alive(tok)) return;
      const stars = S.miss <= 1 ? 3 : S.miss <= 4 ? 2 : 1;
      chFinish(C.n, stars, { stat: `Поймано: ${S.got} · промахов: ${S.miss}` });
    };
    G.tick((dt) => {
      S.t += dt;
      const v = S.done ? V * 0.55 : V;
      S.scroll += v * dt; bg(S.scroll);
      S.ph += dt * (2 * Math.PI * v) / STRIDE;
      if (S.lunge > 0) S.lunge -= dt;
      const lx = S.lunge > 0 ? Math.sin(Math.PI * (1 - S.lunge / 0.32)) * 46 : 0;
      dino.x = X + lx;
      const [body, feet] = GL.autoGait(dino, 'run', S.ph, S.t);
      const pa = Pose.auto(sp.id)(S.t, S.acts, []);
      body.head = (body.head || 0) + (pa.head || 0) * 0.8; body.neck = (body.neck || 0) + (pa.neck || 0);
      dino.blink = blink(S.t, dt);
      dino.pose(body, feet);
      // prey
      if (!S.done && !S.cur) { S.nextT -= dt; if (S.nextT <= 0) spawn(); }
      const q = S.cur, z = zone();
      ring.style.left = z.x + lx + 'px'; ring.style.top = z.y + 'px';
      let inZone = false;
      if (q) {
        q.ph += dt * 14;
        if (q.state === 'run') { q.x -= (v - q.v) * dt * (q.x > 900 ? 2.2 : 1); }
        else if (q.state === 'flee') { q.x += 260 * dt; q.op = Math.max(0, q.op - dt * 1.4); q.c.el.style.opacity = q.op; }
        const bob = Math.abs(Math.sin(q.ph)) * -4;
        q.c.place(q.x, GY + 4, 1, bob);
        inZone = q.state === 'run' && Math.abs(q.x - z.x) < 74;
        if (inZone) { q.inT += dt; if (S.got === 0 && S.miss === 0) { hand.style.display = ''; hand.style.left = G.W / 2 + 'px'; } }
        if (q.state === 'run' && q.inT > (p.fast ? 1.0 : 1.3)) { q.state = 'flee'; S.miss++; AU.play('miss'); G.once('late', 'Убежала! Нажимай, когда добыча в круге.'); }
        if (q.state === 'flee' && (q.x > 1400 || q.op <= 0.02)) { q.c.el.remove(); S.cur = null; S.nextT = G.rand(0.6, 1.2); }
      }
      ring.style.borderColor = inZone ? '#F2B640' : 'rgba(255,255,255,.45)';
      ring.style.transform = inZone ? 'scale(1.08)' : 'scale(1)';
      ring.style.boxShadow = inZone ? '0 0 18px rgba(242,182,64,.8)' : 'none';
    });
  },
};

/* ------------------------------------------------------------------ sneak · hold to creep, freeze when watched */
Scenes.sneak = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 2), hide = p.mode === 'hide';
    const bgKey = p.bg || 'bg_forest', GY = G.floor(bgKey === 'bg_run' ? 606 : 640);
    G.bgImg(bgKey);
    shades(sc, 0.55, 0);
    chHeader(C.n, C.name);
    GL.attach(sc);
    const W = walker({ x: 120, y: GY, z: 3 }, hide ? [250, 140] : [270, 150]), dino = W.it, CAD = (2 * Math.PI * 85) / W.stride;
    const S = { x: 120, hold: false, phase: 'calm', pt: 0, pdur: G.rand(3.0, 4.5), walkPh: 0, mist: 0, got: 0, freeze: 0, done: false, t: 0 };
    const blink = blinker();
    G.dbg = { S, dino };
    const hit = G.h('div', 'hit', sc);
    const hand = UI.hand(G.ui, G.W / 2, G.H - 170, 'hold');
    G.on(hit, 'pointerdown', (e) => { AU.unlock(); S.hold = true; S.pid = e.pointerId; hand.style.display = 'none'; });
    const up = (e) => { if (e.pointerId === S.pid) S.hold = false; };
    G.on(window, 'pointerup', up); G.on(window, 'pointercancel', up);
    const banner = G.h('div', 'plate banner abs', G.ui, { left: Math.round(G.W / 2), top: 100, transform: 'translateX(-50%) scale(0)', transition: 'transform .25s cubic-bezier(.2,1.5,.4,1)' }, `${icon('hand')}<b>Замри!</b>`);
    const alert = G.h('div', 'abs', sc, { width: 52, height: 52, borderRadius: '50%', background: '#F2B640', color: '#2A1E05', font: '600 38px/52px Oswald,sans-serif', textAlign: 'center', boxShadow: '0 0 18px rgba(242,182,64,.7)', transform: 'scale(0)', transition: 'transform .25s cubic-bezier(.2,1.6,.4,1)', pointerEvents: 'none', zIndex: 3 }, '!');
    const red = () => { const r = G.h('div', 'full', G.ui, { background: 'radial-gradient(ellipse at 50% 50%,rgba(241,107,74,0) 40%,rgba(241,107,74,.45) 100%)', pointerEvents: 'none' }); G.tween(0.9, (e) => { r.style.opacity = 1 - e; }).then(() => r.remove()); };
    let finish;
    if (hide) {
      // ---- slip past the predator painted in the forest, pick up food on the way, reach the log
      const GOAL = 1100, NI = 5, item = p.item || 'it_fern', hk = p.hunter || 'sp_posto', hm = MAN[hk], hw = 360, hh = (hw * hm.h) / hm.w, HX = 800, HY = 520, HN = p.hunterName || 'постозух';
      const hunter = G.spr(hk, sc, HX - hw / 2, HY - hh, hw, hh);
      hunter.style.transform = 'scaleX(-1)'; hunter.style.filter = 'brightness(.88) drop-shadow(0 6px 6px rgba(0,0,0,.4))';
      const hd = MAN.auto[hk.replace('sp_', '')], SN = hd ? [HX + hw / 2 - (hd.mouth[0] / hm.w) * hw, HY - hh + (hd.mouth[1] / hm.h) * hh] : [HX - hw / 2, HY - hh * 0.6];
      const top = UI.topRight({ counter: ['leaf', `0 / ${NI}`] });
      const track = uiTrack(sp.sil);
      const waves = G.h('div', 'abs', sc, { left: SN[0] - 150, top: SN[1] - 70, width: 160, height: 140, opacity: 0, transition: 'opacity .3s', pointerEvents: 'none', transform: 'scaleX(-1)' },
        `<svg width="160" height="140" viewBox="0 0 160 140" fill="none" stroke-linecap="round">${[0, 1, 2].map((i) => `<path class="wv" style="animation:wv 1.1s ${i * 0.25}s ease-out infinite" d="M${30 + i * 26} ${40 - i * 12} A ${40 + i * 22} ${40 + i * 22} 0 0 1 ${30 + i * 26} ${100 + i * 12}" stroke="#fff" stroke-width="5"/>`).join('')}</svg>`);
      alert.style.left = SN[0] + 10 + 'px'; alert.style.top = SN[1] - 110 + 'px';
      const items = [250, 420, 590, 770, 930].map((x) => ({ x, el: glowImg(item, sc, x, GY - 8, 64, 'drop-shadow(0 0 6px rgba(160,255,140,.85))'), got: false }));
      G.say(AU.alt(`Держи палец на экране — ${sp.name.toLowerCase()} идёт. Отпусти — и ${G.fm('он замрёт', 'она замрёт')}! Когда ${HN} нюхает, стой тихо.`, `Держи палец на экране — и иди. Отпусти — и замри! Когда ${HN} нюхает, стой тихо.`));
      const setPhase = (ph) => {
        S.phase = ph; S.pt = 0;
        if (ph === 'calm') { S.pdur = G.rand(3.0, 5.0); waves.style.opacity = 0; alert.style.transform = 'scale(0)'; banner.style.transform = 'translateX(-50%) scale(0)'; }
        if (ph === 'warn') { S.pdur = 1.25; alert.style.transform = 'scale(1)'; AU.play('alert'); }
        if (ph === 'look') { S.pdur = 2.6; waves.style.opacity = 1; banner.style.transform = 'translateX(-50%) scale(1)'; AU.play('sniff'); G.once('freeze', 'Замри!', { silent: !G.state.settings.voice }); }
      };
      const caught = () => {
        S.mist++; S.freeze = 1.2; AU.play('thud'); red();
        G.once('caught', `Ой! ${HN[0].toUpperCase() + HN.slice(1)} почуял тебя. Замри, когда он нюхает!`);
        const x0 = S.x, x1 = Math.max(120, S.x - 170);
        G.tween(0.6, (e) => { S.x = G.lerp(x0, x1, e); }, G.ease.out);
        setPhase('calm');
      };
      finish = async () => {
        S.done = true;
        G.say(`Ты ${G.fm('проскользнул', 'проскользнула')} мимо! ${HN[0].toUpperCase() + HN.slice(1)} тебя не заметил.`); AU.play('ok');
        await G.tween(1.2, (e) => { dino.x = G.lerp(S.x, 1420, e); });
        await G.wait(1.0); if (!G.alive(tok)) return;
        let stars = 3; if (S.mist >= 1) stars--; if (S.mist >= 3 || S.got < 3) stars--;
        chFinish(C.n, Math.max(1, stars), { stat: `Еда: ${S.got} из ${NI} · хищник заметил: ${S.mist}` });
      };
      G.tick((dt) => {
        S.t += dt; S.pt += dt;
          if (S.done) { S.walkPh += dt * CAD; const [b, f] = W.walk(S.walkPh); dino.pose(b, f); return; }
        if (S.phase === 'calm' && S.pt > S.pdur) setPhase('warn');
        else if (S.phase === 'warn' && S.pt > S.pdur) setPhase('look');
        else if (S.phase === 'look' && S.pt > S.pdur) setPhase('calm');
        if (S.freeze > 0) S.freeze -= dt;
        const moving = S.hold && S.freeze <= 0;
        if (moving) { S.x += 85 * dt; S.walkPh += dt * CAD; }
        if (S.phase === 'look' && moving && S.pt > 0.35) caught();
        dino.x = S.x;
        let body, feet;
        if (moving) [body, feet] = W.walk(S.walkPh); else { [body, feet] = W.stand(S.t); body.neck = (body.neck || 0) + (S.phase === 'look' ? 8 : 0); }
        dino.blink = blink(S.t, dt); dino.pose(body, feet);
        for (const it of items) {
          if (!it.got && S.x + W.HEAD[0] >= it.x) {
            it.got = true; S.got++; top.counter.set(`${S.got} / ${NI}`); AU.play('pop'); G.fx.sparkle(it.x, GY - 10, 8);
            const el = it.el; G.tween(0.4, (e) => { el.style.opacity = 1 - e; el.style.transform = `translateY(${-30 * e}px) scale(${1 - 0.5 * e})`; }).then(() => el.remove());
          }
        }
        track(G.clamp((S.x - 120) / (GOAL - 120), 0, 1));
        if (S.x >= GOAL) finish();
      });
      return;
    }
    // ---- creep up on prey that sometimes looks back
    const NEED = p.need || 3, prey = p.prey || 'it_lizard', big = !!p.big;
    const PW = p.pw || (prey === 'sp_desma' ? 340 : prey === 'nb_hyperodapedon' ? 250 : prey === 'it_roach' ? 84 : 160);
    const top = UI.topRight({ counter: ['paw', `0 / ${NEED}`] });
    const fade = G.h('div', 'full', sc, { background: '#07090b', opacity: 0, pointerEvents: 'none', zIndex: 5 });
    let q = null;
    const newPrey = () => {
      if (q) q.c.el.remove();
      q = { c: critter(prey, sc, PW, { vert: prey === 'it_roach', filter: 'drop-shadow(0 0 2px rgba(255,244,214,.95)) drop-shadow(0 0 8px rgba(255,226,140,.55)) drop-shadow(0 4px 4px rgba(0,0,0,.4))' }), x: G.rand(860, 1000), ph: G.rand(0, 6), face: 1, run: 0 };
      q.c.place(q.x, GY + 4, 1);
      S.phase = 'calm'; S.pt = 0; S.pdur = G.rand(2.6, 4.2);
    };
    newPrey();
    G.say(AU.alt(`Держи палец — ${sp.name.toLowerCase()} крадётся. Когда добыча оглядывается — отпусти и замри!`, 'Держи палец — и крадись. Когда добыча оглядывается — отпусти и замри!'));
    const spotted = () => {
      S.mist++; AU.play('thud'); red();
      G.once('seen', 'Заметили! Добыча отбежала. Замирай, когда она оглядывается!');
      q.run = 0.8; S.phase = 'calm'; S.pt = 0; S.pdur = G.rand(2.6, 4.0);
      alert.style.transform = 'scale(0)'; banner.style.transform = 'translateX(-50%) scale(0)';
    };
    const pounce = async () => {
      S.busy = true; S.acts = [{ type: 'snap', t0: S.t, dur: 0.4 }];
      AU.play('catch'); G.fx.sparkle(q.x, GY - q.c.h * 0.4, 16); UI.popText(sc, 'Поймал!', q.x, GY - q.c.h - 40, '#F2B640', 30);
      const x0 = S.x; await G.tween(0.25, (e) => { S.x = x0 + 40 * Math.sin(Math.PI * e); }, G.ease.lin);
      q.c.el.style.transition = 'opacity .3s'; q.c.el.style.opacity = 0;
      S.got++; top.counter.set(`${S.got} / ${NEED}`);
      if (S.got >= NEED) { finish(); return; }
      G.once('got', 'Есть! Теперь следующая добыча.');
      await G.wait(0.7); if (!G.alive(tok)) return;
      await G.tween(0.3, (e) => { fade.style.opacity = e; }, G.ease.lin);
      S.x = 120; newPrey();
      await G.tween(0.3, (e) => { fade.style.opacity = 1 - e; }, G.ease.lin);
      S.busy = false;
    };
    finish = async () => {
      S.done = true;
      G.say('Отличная охота! Хищник должен уметь ждать и подкрадываться.');
      await G.wait(1.6); if (!G.alive(tok)) return;
      const stars = S.mist === 0 ? 3 : S.mist <= 2 ? 2 : 1;
      chFinish(C.n, stars, { stat: `Поймано: ${S.got} · заметили: ${S.mist}` });
    };
    S.acts = [];
    G.tick((dt) => {
      S.t += dt; S.pt += dt;
      const moving = !S.done && !S.busy && S.hold;
      if (!S.done && !S.busy) {
        if (S.phase === 'calm' && S.pt > S.pdur) { S.phase = 'warn'; S.pt = 0; alert.style.transform = 'scale(1)'; AU.play('alert'); }
        else if (S.phase === 'warn' && S.pt > 0.9) { S.phase = 'look'; S.pt = 0; q.face = -1; banner.style.transform = 'translateX(-50%) scale(1)'; }
        else if (S.phase === 'look' && S.pt > 1.9) { S.phase = 'calm'; S.pt = 0; S.pdur = G.rand(2.4, 4.4); q.face = 1; alert.style.transform = 'scale(0)'; banner.style.transform = 'translateX(-50%) scale(0)'; }
        if (moving) { S.x += 75 * dt; S.walkPh += dt * CAD * (75 / 85); }
        if (S.phase === 'look' && moving && S.pt > 0.3) spotted();
      }
      // prey: grazing bob, running away when spotted
      q.ph += dt * (q.run > 0 ? 16 : 2.4);
      if (q.run > 0) { q.run -= dt; q.x = Math.min(1180, q.x + 330 * dt); q.face = 1; }
      const bob = q.run > 0 ? -Math.abs(Math.sin(q.ph)) * 6 : Math.sin(q.ph) * 2;
      q.c.place(q.x, GY + 4, q.face, bob);
      alert.style.left = q.x - 26 + 'px'; alert.style.top = GY - q.c.h - 64 + 'px';
      dino.x = S.x;
      let body, feet;
      if (moving) [body, feet] = W.walk(S.walkPh); else { [body, feet] = W.stand(S.t); body.neck = (body.neck || 0) - 3; }
      const pa = Pose.auto(sp.id)(S.t, S.acts, []);
      body.head = (body.head || 0) + (pa.head || 0) - (S.hold ? 0 : 2); body.neck = (body.neck || 0) + (pa.neck || 0);
      dino.blink = blink(S.t, dt); dino.pose(body, feet);
      // close enough: pounce
      const mouthX = S.x + W.HEAD[0], preyBack = q.x - q.c.w / 2;
      if (!S.done && !S.busy && q.run <= 0 && mouthX >= preyBack - (big ? 30 : 16)) pounce();
    });
    void hit;
  },
};

/* ------------------------------------------------------------------ glide · tree to tree */
Scenes.glide = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 1), L2 = p.level >= 2, L3 = p.level === 3, GROUND = G.floor(650), X = 300;
    const NT = L3 ? 8 : L2 ? 6 : 4, NEED = L3 ? 11 : L2 ? 8 : 5, VX = L3 ? 245 : 230;
    G.h('div', 'full', sc, { background: '#4f6a52' });
    GL.attach(sc);
    const bg = scrollTiles('bg_forest');
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: ['bug', `0 / ${NEED}`] });
    const track = uiTrack(sp.sil, 'award');
    // trees in world x; the glider stays near X, the world scrolls
    const trees = [];
    let wx = X - 24;
    for (let i = 0; i <= NT; i++) { trees.push({ x: wx, el: null }); wx += (L3 ? G.rand(640, 740) : L2 ? G.rand(600, 700) : G.rand(520, 600)); }
    const layer = G.h('div', 'abs', sc, { left: 0, top: 0, width: 1280, height: 720, pointerEvents: 'none' });
    // painted trunks (roots on the ground, the crown is above the screen); they are drawn under the glider, which clings to the bark
    const TI = window.HATCH && HATCH.nest2 && HATCH.nest2.tree, th = GROUND + 110;
    trees.forEach((t, i) => {
      if (TI && G.ATLAS.tree_glide) t.it = GL.sprite('tree_glide', null, { s: th / TI.h, ax: TI.cx * TI.w, ay: TI.h, x: t.x, y: GROUND + 64, z: 2, flip: i % 2 === 1 });
      else t.el = G.h('div', 'abs', layer, { top: -20, width: 54, height: 740, marginLeft: '-27px', borderRadius: '10px', background: 'linear-gradient(90deg,#2a1f15,#5a4430 38%,#3d2e1f 70%,#241a12)' });
    });
    // insects between the trees
    const bugs = [];
    for (let i = 0; i < NT; i++) {
      const n = L2 ? 2 : 1 + (i % 2);
      for (let k = 0; k < n; k++) {
        const x = trees[i].x + G.rand(170, (trees[i + 1].x - trees[i].x) - 120), y = G.rand(260, 470);
        bugs.push({ x, y, el: glowImg('beetle', layer, 0, 0, 42), got: false, ph: G.rand(0, 6) });
      }
    }
    const d = MAN.auto[sp.id], M = GL.autoModel(sp.id), pf = Pose.auto(sp.id);
    const K = fitK(sp.id, 210, 170), axis = Math.atan2(d.d[1], d.d[0]);
    const it = GL.sprite('sp_' + sp.id, GL.RIGS.auto(sp.id), { ax: M.ax, ay: M.ay, s: K, z: 4 });
    const head = GL.restPt(it, d.mouth);
    const S = { cam: 0, y: 250, vy: 0, mode: 'cling', tree: 0, hold: false, t: 0, got: 0, falls: 0, done: false, ph: 0, climb: 0, acts: [] };
    G.dbg = { S, trees, bugs };
    const hit = G.h('div', 'hit', sc);
    const hand = UI.hand(G.ui, G.W / 2, G.H / 2, 'tap');
    G.say('Нажми — и ящер прыгнет с дерева! Держи палец — крылья раскрыты, он планирует. Отпустишь — он сложит крылья и нырнёт вниз. Лови жуков!');
    G.on(hit, 'pointerdown', (e) => {
      AU.unlock(); S.hold = true; S.pid = e.pointerId;
      if (S.mode === 'cling' && !S.done && S.climb <= 0) { S.mode = 'glide'; S.vy = -120; AU.play('whoosh'); hand.style.display = 'none'; }
    });
    const up = (e) => { if (e.pointerId === S.pid) S.hold = false; };
    G.on(window, 'pointerup', up); G.on(window, 'pointercancel', up);
    const finish = async () => {
      S.done = true; AU.play('ok');
      G.say('Последнее дерево! Ты отлично планируешь.');
      await G.wait(1.6); if (!G.alive(tok)) return;
      const stars = S.falls === 0 && S.got >= NEED ? 3 : S.falls <= 1 && S.got >= NEED - 2 ? 2 : 1;
      chFinish(C.n, stars, { stat: `Жуки: ${S.got} из ${NEED} · падений: ${S.falls}` });
    };
    const land = (ti) => {
      S.mode = 'cling'; S.tree = ti; S.vy = 0; AU.play('pop');
      G.fx.burst(X, S.y, 6, { type: 'chip', color: ['#5a4430', '#7a6040'], s0: 40, s1: 120, g: 400, z0: 3, z1: 5, l0: 0.4, l1: 0.6 });
      if (S.y > 420) { S.climb = 0.9; S.climbFrom = S.y; }
      if (ti >= NT) finish();
      else if (ti === 1) G.say('Есть! Прыгай на следующее дерево.');
    };
    G.tick((dt) => {
      S.t += dt;
      const next = trees[S.tree + 1];
      if (S.mode === 'glide') {
        S.cam += VX * dt;
        const g = S.hold ? 210 : 620, vmax = S.hold ? 85 : 330;
        S.vy = Math.min(vmax, S.vy + g * dt); S.y += S.vy * dt;
        if (S.y < 120) { S.y = 120; S.vy = Math.max(0, S.vy); }
        if (next && S.cam + X >= next.x - 24) { S.cam = next.x - 24 - X; land(S.tree + 1); }
        else if (S.y >= GROUND - 30) {
          S.y = GROUND - 30; S.mode = 'ground'; S.falls++; AU.play('thud'); G.fx.dust(X, GROUND - 10, 8, 'rgba(120,100,70,');
          G.once('fall', 'Ой, на землю! Держи палец, чтобы планировать дольше.');
        }
      } else if (S.mode === 'ground') { // scurry to the next trunk
        S.cam += 260 * dt;
        if (next && S.cam + X >= next.x - 24) { S.cam = next.x - 24 - X; land(S.tree + 1); }
      } else if (S.climb > 0) {
        S.climb -= dt; S.y = G.lerp(S.climbFrom, 260, G.ease.inOut(1 - Math.max(0, S.climb) / 0.9));
      }
      bg(S.cam * 0.5);
      for (const t of trees) { if (t.it) t.it.x = t.x - S.cam; else t.el.style.left = t.x - S.cam + 'px'; }
      // pose: wings open while gliding and holding, folded when diving, resting on the trunk
      const gl = S.mode === 'glide';
      S.ph += dt * (gl ? 3 : 1.2);
      const ps = pf(S.t, S.acts, [], { A: gl ? 0.06 : 0.02, ph: S.ph });
      if (gl && !S.hold) { ps.wingU = -0.42; ps.wingD = -0.42; }
      if (!gl) { ps.wingU = -0.3; ps.wingD = -0.3; }
      it.mesh.deform(ps);
      it.x = X; it.y = S.y;
      it.rot = -axis + (S.mode === 'cling' ? -1.2 : S.mode === 'ground' ? 0 : G.clamp(S.vy * 0.0016, -0.3, 0.55));
      const hp = it.toDesign(head[0], head[1]);
      for (const b of bugs) {
        if (b.got) continue;
        b.ph += dt * 4;
        const bx = b.x - S.cam, by = b.y + Math.sin(b.ph) * 10;
        b.el.style.left = bx - 21 + 'px'; b.el.style.top = by - 27 + 'px';
        if (Math.hypot(bx - hp[0], by - hp[1]) < 54 || Math.hypot(bx - X, by - S.y) < 44) {
          b.got = true; S.got++; top.counter.set(`${S.got} / ${NEED}`); AU.play('beetle'); G.fx.sparkle(bx, by, 8); S.acts.push({ type: 'snap', t0: S.t, dur: 0.4 });
          const el = b.el; G.tween(0.3, (e) => { el.style.opacity = 1 - e; }).then(() => el.remove());
        }
      }
      track(G.clamp(S.cam / (trees[NT].x - X), 0, 1));
    });
  },
};

/* ------------------------------------------------------------------ ambush · wait in the water, strike when prey passes */
Scenes.ambush = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 2), NEED = p.need || 6, prey = p.prey || 'it_fish', bottom = !!p.bottom, BED = G.floor(655, 26);
    G.bgImg('bg_sea');
    shades(sc, 0.4, 0);
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: ['fish', `0 / ${NEED}`] });
    GL.attach(sc);
    let it, base, mouthPt, poseOf;
    if (sp.auto) {
      const d = MAN.auto[sp.id], b = d.box, pf = Pose.auto(sp.id);
      const K = fitK(sp.id, bottom ? 560 : 600, bottom ? 210 : 230), BW = (b[1] - b[0]) * K;
      const hx = Math.min(660, 60 + BW), mx0 = (d.mouth[0] - (b[0] + b[1]) / 2) * K;
      base = { x: hx - mx0, y: bottom ? BED - ((b[3] - b[2]) * K) / 2 + 10 : 400 };
      const o = { ax: (b[0] + b[1]) / 2, ay: (b[2] + b[3]) / 2, s: K, x: base.x, y: base.y, z: 3 };
      // a four-legged hunter lies on the bottom on its own feet, or hangs in the water with its legs folded back
      it = GL.isWalker(sp.id) ? GL.waterWalker(sp.id, o, bottom) : GL.sprite('sp_' + sp.id, GL.RIGS.auto(sp.id), o);
      const mth = GL.restPt(it, d.mouth);
      mouthPt = () => it.toDesign(mth[0], mth[1]);
      poseOf = (t, acts) => Object.assign(pf(t, acts, [], { speed: bottom ? 0.15 : 0.3, swim: true }), { _speed: 0.25 });
    } else { // the first sea reptile keeps its own rig
      it = swimmer({ x: 0, y: 400, s: 0.3, z: 3 });
      const m0 = it.mouthPt(); base = { x: 640 - m0[0], y: 400 };
      mouthPt = () => it.mouthPt();
      poseOf = (t, acts) => it.swimPose(t, acts, [], 0.3);
    }
    const fishLayer = G.h('div', 'abs', sc, { left: 0, top: 0, width: 1280, height: 720, pointerEvents: 'none' });
    const ring = G.h('div', 'abs', sc, { width: 130, height: 130, marginLeft: '-65px', marginTop: '-65px', borderRadius: '50%', border: '5px dashed rgba(255,255,255,.5)', pointerEvents: 'none' });
    const S = { t: 0, got: 0, miss: 0, fish: [], nextF: 0.6, lunge: 0, done: false, acts: [] };
    const blink = blinker();
    G.dbg = { S, it };
    const hit = G.h('div', 'hit', sc);
    const hand = UI.hand(G.ui, G.W / 2, G.H / 2, 'tap'); hand.style.display = 'none';
    G.say(AU.alt(`${sp.name} в засаде. Жди, пока ${prey === 'it_fish' ? 'рыба' : 'добыча'} заплывёт в круг, — и нажимай!`, `Засада! Жди, пока ${prey === 'it_fish' ? 'рыба' : 'добыча'} заплывёт в круг, — и нажимай!`));
    const zoneAt = () => { const m = mouthPt(); return { x: m[0] + 66, y: m[1] + (bottom ? -70 : 6) }; };
    G.dbg.zone = zoneAt;
    const z0 = zoneAt();
    const strike = () => {
      if (S.done || S.lunge > 0) return;
      hand.style.display = 'none';
      S.lunge = 0.45; S.acts.push({ type: 'snap', t0: S.t, dur: 0.4 }); AU.play('whoosh');
      const z = zoneAt(), f = S.fish.find((q) => !q.gone && Math.hypot(q.x - z.x, q.y - z.y) < 80);
      if (f) {
        f.gone = true; S.got++; top.counter.set(`${S.got} / ${NEED}`);
        AU.play('catch'); G.fx.sparkle(f.x, f.y, 14);
        UI.popText(sc, 'Поймал!', f.x, f.y - 70, '#F2B640', 30);
        G.tween(0.25, (e) => { f.el.style.opacity = 1 - e; }).then(() => f.el.remove());
        if (S.got === 2 && p.tip) G.say(p.tip);
        if (S.got >= NEED) finish();
      } else {
        S.miss++; AU.play('miss');
        for (const q of S.fish) q.scare = 1.0;
        if (S.miss === 1) G.say('Мимо! Жди, пока добыча будет в круге.');
      }
    };
    G.on(hit, 'pointerdown', () => { AU.unlock(); strike(); });
    const finish = async () => {
      S.done = true;
      G.say('Отличная засада! Терпение — главное оружие охотника.');
      await G.wait(1.8); if (!G.alive(tok)) return;
      const stars = S.miss <= 1 ? 3 : S.miss <= 3 ? 2 : 1;
      chFinish(C.n, stars, { stat: `Поймано: ${S.got} · промахов: ${S.miss}` });
    };
    G.tick((dt) => {
      S.t += dt;
      if (S.lunge > 0) S.lunge -= dt;
      const lg = S.lunge > 0 ? Math.sin(Math.PI * (1 - S.lunge / 0.45)) : 0;
      it.x = base.x + 60 * lg; it.y = base.y + Math.sin(S.t * 0.9) * (bottom ? 1.5 : 5) - (bottom ? 26 * lg : 0);
      it.rot = bottom ? -0.1 * lg : 0.02 * Math.sin(S.t * 0.7);
      const ps = poseOf(S.t, S.acts);
      ps.neck = (ps.neck || 0) - 6 * lg;
      it.mesh.deform(ps); it.blink = blink(S.t, dt);
      const z = zoneAt();
      ring.style.left = z.x + 'px'; ring.style.top = z.y + 'px';
      S.nextF -= dt;
      if (!S.done && S.nextF <= 0 && S.fish.filter((q) => !q.gone).length < 3) {
        const w = prey === 'it_fish' ? 90 : 76, el = glowImg(prey, fishLayer, 0, 0, w, 'drop-shadow(0 0 6px rgba(200,240,255,.7))');
        el.style.transform = 'scaleX(-1)';
        S.fish.push({ el, w, x: 1350, y0: z0.y + G.rand(-70, 70), y: 0, v: G.rand(95, 165), ph: G.rand(0, 6), scare: 0 });
        S.nextF = G.rand(1.1, 2.0);
      }
      let inZ = false;
      for (const q of S.fish.slice()) {
        if (q.gone) { if (!q.el.isConnected) S.fish.splice(S.fish.indexOf(q), 1); continue; }
        q.ph += dt * 3; if (q.scare > 0) q.scare -= dt;
        q.x -= (q.v + (q.scare > 0 ? 260 : 0)) * dt;
        q.y = Math.min(BED - 30, Math.max(140, q.y0 + Math.sin(q.ph) * 12 - (q.scare > 0 ? 60 * (1 - q.scare) : 0)));
        q.el.style.left = q.x - q.w / 2 + 'px'; q.el.style.top = q.y - 18 + 'px';
        if (Math.hypot(q.x - z.x, q.y - z.y) < 80) { inZ = true; if (S.got === 0 && S.miss === 0) hand.style.display = ''; }
        if (q.x < -120) { q.el.remove(); S.fish.splice(S.fish.indexOf(q), 1); }
      }
      ring.style.borderColor = inZ ? '#F2B640' : 'rgba(255,255,255,.5)';
      ring.style.borderStyle = inZ ? 'solid' : 'dashed';
      ring.style.boxShadow = inZ ? '0 0 18px rgba(242,182,64,.8)' : 'none';
    });
  },
};
