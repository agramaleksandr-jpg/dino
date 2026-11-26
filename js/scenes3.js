'use strict';
/* ==================================================================== chapters 1–4 */
const F6 = 1280 / 1536; // 1536-px art -> design space

function chHeader(n, title) {
  UI.pauseBtn();
  const h = G.h('div', 'abs', G.ui, { left: 104, top: 30 });
  h.innerHTML = `<div class="t-title">Глава ${n} · ${title}</div><div class="t-sub">Жизнь ${G.SP().gen} · глава ${n} из ${G.nCh()}</div>`;
  return h;
}
function chFinish(n, stars, o) {
  o = o || {};
  const sp = G.SP(), ss = G.S(), CH = sp.chapters, firstTime = !G.chDone(n);
  G.setCh(n, stars);
  const grownNow = firstTime && n === G.nCh();
  const list = [].concat(o.fact || (CH[n - 1] && CH[n - 1].facts) || []);
  let fresh = null;
  for (const k of list) { if (!ss.facts[k] && !fresh) fresh = k; ss.facts[k] = true; }
  G.save();
  const show = fresh || list[0];
  const nextAge = CH[n] ? CH[n].age : 3;
  UI.result({
    title: `Глава ${n} пройдена!`, stars, chapter: n, age: nextAge, stat: o.stat,
    fact: show ? sp.facts[show] : null, note: o.note || (CH[n - 1] && CH[n - 1].note),
    onRetry: () => G.goCh(n), onNext: () => G.go('path', grownNow ? { grown: true } : {}),
  });
}
function shades(sc, top, bot) {
  if (top) G.h('div', 'abs', sc, { left: 0, top: 0, width: 1280, height: 200, background: `linear-gradient(rgba(7,9,11,${top}),rgba(7,9,11,0))` });
  if (bot) G.h('div', 'abs', sc, { left: 0, top: 500, width: 1280, height: 220, background: `linear-gradient(rgba(7,9,11,0),rgba(7,9,11,${bot}))` });
}

/* ------------------------------------------------------------------ 1 · hatching */
Scenes.ch1 = {
  enter() {
    const sc = G.scene$, tok = G.token;
    // each kind of animal has its own egg in its own nest: a round sauropod egg in a sandy pit, a ridged theropod egg on a
    // ring of earth and ferns, a speckled one in a twig cup, a soft leathery one under ferns... (js/hatch.js)
    const SPB = G.SP(), HT = window.HATCH, EK = HT && HT.grp[SPB.id], EG = EK && HT.egg[EK];
    // (an animal can have a nest of its own: the oviraptor's crater in the Gobi dunes, the quetzalcoatlus's pit far from the sea)
    const NK = (HT && HT.nestOf && HT.nestOf[SPB.id]) || EK;
    G.bgImg(EG ? 'bgnest_' + NK : 'bg_nest');
    shades(sc, 0.6, 0.5);
    chHeader(1, 'Яйцо');
    const top = UI.topRight({ counter: ['egg', '0 / 7'] });
    let ekey, ew, eh, ex, ey, ecx, ecy, erx, ery, BX, BY;
    if (EG) {
      const [px, py, ph] = HT.place[NK], k = (ph / (EG.bottom - (EG.cy - EG.ry))) * F6;
      ekey = 'egg_' + EK; ew = EG.w * k; eh = EG.h * k; BX = px * F6; BY = py * F6;
      ex = BX - EG.cx * k; ey = BY - EG.bottom * k; ecx = ex + EG.cx * k; ecy = ey + EG.cy * k; erx = EG.rx * k; ery = EG.ry * k;
    } else {
      const E = MAN.egg, KE = 0.8 * F6; ekey = 'egg'; BX = 790 * F6; BY = 592 * F6;
      ew = E.w * KE; eh = E.h * KE; ex = BX - (E.cx - E.x) * KE; ey = BY - (E.cy - E.y + E.ry) * KE;
      ecx = BX; ecy = BY - E.ry * KE; erx = E.rx * KE; ery = E.ry * KE;
    }
    const shadow = G.h('div', 'abs', sc, { left: BX - erx * 1.3, top: BY - ery * 0.22, width: erx * 2.6, height: ery * 0.46, borderRadius: '50%', pointerEvents: 'none',
      background: 'radial-gradient(ellipse at 50% 45%, rgba(30,20,10,.62), rgba(30,20,10,.3) 45%, rgba(30,20,10,0) 72%)' });
    const egg = G.h('div', 'abs', sc, { left: ex, top: ey, width: ew, height: eh, transformOrigin: `${BX - ex}px ${BY - ey}px`, cursor: 'pointer' });
    const eggPic = G.spr(ekey, egg, 0, 0, ew, eh);
    const lcx = ecx - ex, lcy = ecy - ey;
    egg.insertAdjacentHTML('beforeend', `<svg width="${ew}" height="${eh}" style="position:absolute;left:0;top:0;pointer-events:none">
      <defs><clipPath id="eggclip"><ellipse cx="${lcx}" cy="${lcy}" rx="${erx - 3}" ry="${ery - 3}"/></clipPath></defs><g clip-path="url(#eggclip)"></g></svg>`);
    const cg = egg.querySelector('g');
    if (EG) { // cracks stay on the shell whatever its shape: the egg picture masks them
      const sv = egg.querySelector('svg'), st = eggPic.style;
      for (const pre of ['', '-webkit-']) {
        sv.style.setProperty(pre + 'mask-image', st.backgroundImage); sv.style.setProperty(pre + 'mask-size', st.backgroundSize);
        sv.style.setProperty(pre + 'mask-position', st.backgroundPosition); sv.style.setProperty(pre + 'mask-repeat', 'no-repeat');
      }
    }
    const SPOTS = G.shuffle([[-0.38, -0.42], [0.32, -0.22], [-0.1, 0.12], [0.42, 0.3], [-0.45, 0.24], [0.06, -0.66], [0.16, 0.52]]);
    let n = 0, misses = 0, dot = null, wob = 0, wobV = 0, busy = false;
    G.dbg = { spots: SPOTS, E: { ecx, ecy, erx, ery }, n: () => n };
    G.tick((dt) => {
      wobV += (-wob * 160 - wobV * 9) * dt; wob += wobV * dt;
      egg.style.transform = `rotate(${wob}deg)`;
    });
    const crack = (sx, sy) => {
      let d = '';
      const a = G.rand(0, Math.PI * 2);
      for (const dir of [0, Math.PI]) {
        let x = sx, y = sy; d += `M${x.toFixed(1)} ${y.toFixed(1)}`;
        for (let k = 0; k < 5; k++) { const aa = a + dir + G.rand(-0.7, 0.7); x += Math.cos(aa) * erx * 0.09; y += Math.sin(aa) * ery * 0.09; d += ` L${x.toFixed(1)} ${y.toFixed(1)}`; }
      }
      cg.insertAdjacentHTML('beforeend', `<path d="${d}" fill="none" stroke="#3a2a18" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/>
        <path d="${d}" fill="none" stroke="rgba(255,250,235,.55)" stroke-width="1.2" transform="translate(1.4,1.2)"/>`);
    };
    const nextDot = () => {
      if (dot) dot.remove();
      const [u, v] = SPOTS[n];
      const x = ecx + u * erx, y = ecy + v * ery;
      dot = UI.dot(sc, x, y);
      dot.addEventListener('pointerdown', (e) => { e.stopPropagation(); AU.unlock(); hitDot(x, y); });
    };
    const hint = UI.hand(sc, ecx + SPOTS[0][0] * erx, ecy + SPOTS[0][1] * ery);
    egg.addEventListener('pointerdown', () => { AU.unlock(); if (busy) return; misses++; wobV += 60; AU.play('miss'); });
    const hitDot = async (x, y) => {
      if (busy) return;
      hint.style.display = 'none';
      AU.play('crack');
      crack(x - ex, y - ey);
      wobV += G.pick([-1, 1]) * 140;
      G.fx.burst(x, y, 7, { type: 'chip', color: ['#f3ecdf', '#e4d7c2', '#cdb998'], s0: 80, s1: 220, g: 700, z0: 3, z1: 7, l0: 0.5, l1: 0.8 });
      n++; top.counter.set(`${n} / 7`);
      if (n >= 7) { dot.remove(); dot = null; hatch(); return; }
      if (dot) { dot.remove(); dot = null; }
      busy = true; await G.wait(0.22); busy = false;
      if (G.alive(tok)) nextDot();
    };
    const hatch = async () => {
      busy = true;
      G.say('Кто-то вылупляется!');
      for (let k = 0; k < 6; k++) { wobV += (k % 2 ? -1 : 1) * 220; AU.play('crack'); await G.wait(0.16); if (!G.alive(tok)) return; }
      AU.play('hatch');
      UI.flash(G.ui, 0.8, 0.95);
      G.fx.burst(ecx, ecy, 26, { type: 'chip', color: ['#f3ecdf', '#e9dfcf', '#d6c4a6'], s0: 160, s1: 520, g: 900, z0: 8, z1: 20, l0: 0.7, l1: 1.3 });
      G.fx.dust(ecx, ecy + ery * 0.7, 14, 'rgba(225,205,170,');
      egg.remove(); shadow.remove();
      if (HT && HT.eye[SPB.id]) { await painted(); return; }
      GL.attach(sc);
      const BB = SPB.baby, AB = SPB.auto ? GL.autoBaby(SPB.id, { x: 682, y: 476, s: 0.2, z: 1 }) : null;
      const baby = AB ? AB.it : BB ? GL.sprite(BB.key, GL.RIGS[BB.rig](), { x: 682, y: 476, s: 0.2, ax: BB.ax, ay: BB.ay, z: 1 }) : GL.makeCreature('baby', { x: 682, y: 476, s: 0.2, z: 1 });
      const sEnd = AB ? AB.s : BB ? BB.s : 0.94, s0 = AB ? sEnd * 0.25 : 0.2;
      baby.s = s0;
      let t = 0; const blinks = [1.6, 3.8, 6.1];
      G.tick((dt) => {
        t += dt;
        const look = Math.sin(t * 1.3) * 7 * Math.min(1, t / 1.5);
        if (AB) AB.pose(t, look);
        else if (BB) baby.mesh.deform({ head: look - 2, tail: 5, tailPh: t * 3, breath: 0.03 * (0.5 - 0.5 * Math.cos(t * 3)) });
        else {
          const [bp, feet] = GL.Gaits.stand(t);
          bp.head = look - 2; bp.tail = 5; bp.tailPh = t * 3;
          baby.pose(bp, feet);
        }
        let bl = 0; for (const b of blinks) { const d = t - b; if (d > 0 && d < 0.2) bl = Math.sin((Math.PI * d) / 0.2); }
        baby.blink = bl;
      });
      const y0 = baby.y;
      await G.tween(0.7, (e) => { baby.s = s0 + (sEnd - s0) * e; baby.y = y0 - Math.sin(Math.PI * e) * 60; }, G.ease.back);
      AU.baby(G.cur());
      // the recorded voice has this line for the animals that always hatched here; the others get the short greeting
      const hi = `Привет, малыш! Это ты — ${SPB.babyName}.`;
      G.say(AU.clipFor(hi) || !AU.clipFor('Привет, малыш!') ? hi : 'Привет, малыш!');
      await G.wait(3.0); if (!G.alive(tok)) return;
      const stars = misses <= 3 ? 3 : misses <= 8 ? 2 : 1;
      chFinish(1, stars, { stat: 'Малыш вылупился!', note: SPB.id === 'herrera' ? 'Герреразавры вылуплялись из яиц, как и все динозавры. Малыш сразу умел бегать.' : undefined });
    };
    // the hatchling: a painting of this very animal in its nest; it looks around and blinks once or twice
    const painted = async () => {
      const id = SPB.id, E = HT.eye[id], L = HT.lid[id];
      // on wide screens the top of the picture is cut off: there the picture slides down (by no more than that cut)
      // so the head stays clear of the header
      const dy = Math.max(0, Math.min(G.vis.y0, G.vis.y0 + 125 - E[1] * F6));
      const box = G.h('div', 'abs', null, { left: 0, top: dy, width: 1280, height: 720, opacity: 0, transformOrigin: `${E[0] * F6}px ${E[1] * F6}px` });
      sc.insertBefore(box, sc.children[1]);
      G.bgImg('hatch_' + id, box);
      const lid = G.spr('lid_' + id, box, L[0] * F6, L[1] * F6, L[2] * F6, L[3] * F6);
      lid.style.transformOrigin = '50% 0'; lid.style.transform = 'scaleY(0)';
      let t = 0; const blinks = [1.1, 2.7, 5.2];
      G.tick((dt) => {
        t += dt;
        let c = 0; for (const b of blinks) { const d = t - b; if (d >= 0 && d < 0.26) c = d < 0.08 ? d / 0.08 : d < 0.13 ? 1 : 1 - (d - 0.13) / 0.13; }
        lid.style.transform = `scaleY(${c.toFixed(3)})`;
        box.style.transform = `scale(${(1 + 0.045 * G.ease.inOut(Math.min(1, t / 6))).toFixed(4)})`;
      });
      await G.tween(0.45, (e) => { box.style.opacity = e; });
      AU.baby(G.cur());
      const hi = `Привет, малыш! Это ты — ${SPB.babyName}.`;
      G.say(AU.clipFor(hi) || !AU.clipFor('Привет, малыш!') ? hi : 'Привет, малыш!');
      await G.wait(3.4); if (!G.alive(tok)) return;
      const stars = misses <= 3 ? 3 : misses <= 8 ? 2 : 1;
      chFinish(1, stars, { stat: 'Малыш вылупился!', note: SPB.id === 'herrera' ? 'Герреразавры вылуплялись из яиц, как и все динозавры. Малыш сразу умел бегать.' : undefined });
    };
    nextDot();
    G.say('Стучи по светящимся точкам — помоги малышу вылупиться!');
  },
};

/* ------------------------------------------------------------------ 2 · hide from Saurosuchus */
Scenes.ch2 = {
  enter() {
    const sc = G.scene$, tok = G.token, st = G.state;
    G.bgImg('bg_hide');
    shades(sc, 0.55, 0);
    chHeader(2, 'Тише!');
    const top = UI.topRight({ counter: ['bug', '0 / 5'] });
    // progress to the shelter
    const pr = G.h('div', 'plate abs', G.ui, { left: Math.round(G.W / 2 - 180), top: 28, width: 360, height: 56 });
    pr.innerHTML = `<div class="abs" style="left:16px;top:16px;color:#F4F1EA;opacity:.8">${icon('egg', ' style="width:22px;height:22px"')}</div>
      <div class="abs" style="left:50px;top:24px;width:250px;height:8px;border-radius:4px;background:rgba(255,255,255,.18)"></div>
      <div class="abs prog" style="left:50px;top:24px;width:0;height:8px;border-radius:4px;background:#F2B640"></div>
      <div class="abs mk" style="left:50px;top:6px;width:60px;height:24px;margin-left:-30px">${silSvg('herrera', '#F2B640', ' style="width:60px;height:24px"')}</div>
      <div class="abs" style="right:16px;top:15px;color:#F4F1EA">${icon('home', ' style="width:24px;height:24px"')}</div>`;
    const prog = pr.querySelector('.prog'), mk = pr.querySelector('.mk');
    // sniff waves + alert at the Saurosuchus snout
    const SN = [713, 386];
    const waves = G.h('div', 'abs', sc, { left: SN[0] - 10, top: SN[1] - 70, width: 160, height: 140, opacity: 0, transition: 'opacity .3s', pointerEvents: 'none' },
      `<svg width="160" height="140" viewBox="0 0 160 140" fill="none" stroke-linecap="round">${[0, 1, 2].map((i) => `<path class="wv" style="animation:wv 1.1s ${i * 0.25}s ease-out infinite" d="M${30 + i * 26} ${40 - i * 12} A ${40 + i * 22} ${40 + i * 22} 0 0 1 ${30 + i * 26} ${100 + i * 12}" stroke="#fff" stroke-width="5"/>`).join('')}</svg>`);
    const alert = G.h('div', 'abs', sc, { left: 655, top: 238, width: 56, height: 56, borderRadius: '50%', background: '#F2B640', color: '#2A1E05', font: '600 40px/56px Oswald,sans-serif', textAlign: 'center', boxShadow: '0 0 18px rgba(242,182,64,.7)', transform: 'scale(0)', transition: 'transform .25s cubic-bezier(.2,1.6,.4,1)', pointerEvents: 'none' }, '!');
    const banner = G.h('div', 'plate banner abs', G.ui, { left: Math.round(G.W / 2), top: 100, transform: 'translateX(-50%) scale(0)', transition: 'transform .25s cubic-bezier(.2,1.5,.4,1)' }, `${icon('hand')}<b>Замри!</b>`);
    // beetles on the path
    const BX = [250, 420, 590, 770, 930];
    const beetles = BX.map((x) => {
      const w = 38, h = (w * MAN.beetle.h) / MAN.beetle.w;
      const el = G.spr('beetle', sc, x - w / 2, 552 - h / 2, w, h);
      el.style.transform = `rotate(${G.rand(-60, 60)}deg)`; el.style.filter = 'drop-shadow(0 0 6px rgba(255,214,120,.9))';
      return { x, el, got: false };
    });
    GL.attach(sc);
    const S = { x: 110, hold: false, freezeT: 0, phase: 'calm', pt: 0, pdur: G.rand(3.2, 4.8), walkPh: 0, mist: 0, got: 0, done: false, t: 0, blinks: [] };
    const walk = GL.makeCreature('baby', { x: S.x, y: 548, s: 0.6, z: 2 });
    // cadence from the walking speed so planted feet never slide
    const STRIDE = (GL.Gaits.WALK.sweep / GL.Gaits.WALK.duty) * walk.s, CAD = (2 * Math.PI * 92) / STRIDE;
    G.dbg = { S };
    const crouch = GL.sprite('babyCrouch', GL.RIGS.babyCrouch(), { x: S.x, y: 548, s: 0.6, ax: 190, ay: 104, z: 2, visible: false });
    const hit = G.h('div', 'hit', sc);
    const hand = UI.hand(G.ui, G.W / 2, G.H - 170, 'hold');
    G.on(hit, 'pointerdown', (e) => { AU.unlock(); S.hold = true; S.pid = e.pointerId; hand.style.display = 'none'; });
    const up = (e) => { if (e.pointerId === S.pid) S.hold = false; };
    G.on(window, 'pointerup', up); G.on(window, 'pointercancel', up);
    G.say('Держи палец на экране — малыш идёт. Отпусти — и он замрёт!');
    const setPhase = (p) => {
      S.phase = p; S.pt = 0;
      if (p === 'calm') { S.pdur = G.rand(3.0, 5.0); waves.style.opacity = 0; alert.style.transform = 'scale(0)'; banner.style.transform = 'translateX(-50%) scale(0)'; }
      if (p === 'warn') { S.pdur = 1.25; alert.style.transform = 'scale(1)'; AU.play('alert'); }
      if (p === 'sniff') { S.pdur = 2.6; waves.style.opacity = 1; banner.style.transform = 'translateX(-50%) scale(1)'; AU.play('sniff'); G.once('freeze', 'Замри!', { silent: !st.settings.voice }); }
    };
    const caught = async () => {
      S.mist++; S.freezeT = 1.2; AU.play('thud');
      G.once('caught', 'Ой! Заврозух почуял малыша. Замри, когда он нюхает!');
      const red = G.h('div', 'full', G.ui, { background: 'radial-gradient(ellipse at 50% 50%,rgba(241,107,74,0) 40%,rgba(241,107,74,.45) 100%)', pointerEvents: 'none' });
      const x0 = S.x, x1 = Math.max(110, S.x - 170);
      G.tween(0.6, (e) => { S.x = G.lerp(x0, x1, e); walk.y = crouch.y = 548 - Math.sin(Math.PI * e) * 50; }, G.ease.out);
      G.tween(0.9, (e) => { red.style.opacity = 1 - e; }).then(() => red.remove());
      setPhase('calm');
    };
    const win = async () => {
      S.done = true; walk.visible = true; crouch.visible = false;
      G.say('Ты спрятался в бревне! Заврозух тебя не заметил.');
      AU.play('ok');
      await G.tween(0.8, (e) => { walk.x = G.lerp(S.x, 1110, e); walk.y = G.lerp(548, 470, e); walk.s = 0.6 * (1 - 0.5 * e); walk.alpha = 1 - e; });
      await G.wait(1.2); if (!G.alive(tok)) return;
      let stars = 3; if (S.mist >= 1) stars--; if (S.mist >= 3 || S.got < 3) stars--;
      chFinish(2, Math.max(1, stars), { stat: `Жуки: ${S.got} из 5 · заврозух заметил: ${S.mist}`, note: 'Детёныши прятались от больших хищников. Заврозух был длиной до семи метров!' });
    };
    G.tick((dt) => {
      if (S.done) { S.walkPh += dt * CAD; const [bp, feet] = GL.Gaits.walk(S.walkPh); walk.pose(bp, feet); return; }
      S.t += dt; S.pt += dt;
      if (S.phase === 'calm' && S.pt > S.pdur) setPhase('warn');
      else if (S.phase === 'warn' && S.pt > S.pdur) setPhase('sniff');
      else if (S.phase === 'sniff' && S.pt > S.pdur) setPhase('calm');
      if (S.freezeT > 0) S.freezeT -= dt;
      const moving = S.hold && S.freezeT <= 0;
      if (moving) { S.x += 92 * dt; S.walkPh += dt * CAD; if (Math.sin(S.walkPh) * Math.sin(S.walkPh - dt * CAD) < 0) AU.play('step'); }
      if (S.phase === 'sniff' && moving && S.pt > 0.35) caught();
      walk.visible = moving || S.freezeT > 0; crouch.visible = !walk.visible;
      walk.x = crouch.x = S.x;
      if (S.freezeT <= 0) walk.y = crouch.y = 548;
      if (walk.visible) { const [bp, feet] = GL.Gaits.walk(S.walkPh); walk.pose(bp, feet); }
      else { crouch.mesh.deform({ breath: 0.05 * (0.5 - 0.5 * Math.cos(S.t * 3)), tail: 3, tailPh: S.t * 2, head: S.phase === 'sniff' ? -4 : 2 * Math.sin(S.t) }); }
      if (Math.random() < dt / 3) S.blinks.push(S.t);
      let bl = 0; for (const b of S.blinks) { const d = S.t - b; if (d > 0 && d < 0.2) bl = Math.sin((Math.PI * d) / 0.2); }
      walk.blink = crouch.blink = bl;
      for (const b of beetles) {
        if (!b.got && S.x + 40 >= b.x) {
          b.got = true; S.got++; top.counter.set(`${S.got} / 5`); AU.play('beetle'); G.fx.sparkle(b.x, 552, 8);
          const el = b.el; G.tween(0.4, (e) => { el.style.opacity = 1 - e; el.style.transform = `translateY(${-30 * e}px) scale(${1 - 0.5 * e})`; }).then(() => el.remove());
        }
      }
      const p = G.clamp((S.x - 110) / (1040 - 110), 0, 1);
      prog.style.width = 250 * p + 'px'; mk.style.left = 50 + 250 * p + 'px';
      if (S.x >= 1040) win();
    });
  },
};

/* ------------------------------------------------------------------ 3 · catch cynodonts */
Scenes.ch3 = {
  enter() {
    const sc = G.scene$, tok = G.token;
    G.bgImg('bg_burrows');
    shades(sc, 0.5, 0);
    chHeader(3, 'Ловкие руки');
    const top = UI.topRight({ counter: ['paw', '0 / 8'] });
    const holes = POS.holes.map(([cx, cy, rx, ry], i) => {
      const cw = rx * 2.6, chh = ry * 4, lx = cw / 2, ly = ry * 3;
      const arc = []; for (let k = 0; k <= 16; k++) { const a = (k / 16) * Math.PI; arc.push(`${(lx + Math.cos(a) * rx * 0.97).toFixed(1)}px ${(ly + Math.sin(a) * ry * 0.92).toFixed(1)}px`); }
      const clip = `polygon(0px 0px,${cw}px 0px,${cw}px ${ly}px,${arc.join(',')},0px ${ly}px)`;
      const box = G.h('div', 'abs', sc, { left: cx - lx, top: cy - ly, width: cw, height: chh, clipPath: clip, pointerEvents: 'none' });
      const s = (rx * 2 * 0.98) / MAN.cynoPeek.w, w = MAN.cynoPeek.w * s, h = MAN.cynoPeek.h * s;
      const im = G.spr('cynoPeek', box, lx - w / 2, ly + ry, w, h);
      im.style.filter = 'brightness(.92)';
      return { cx, cy, rx, ry, box, im, w, h, ly, up: 0, state: 'in' };
    });
    // timing ring
    const ring = G.h('div', 'abs', sc, { left: 0, top: 0, width: 1280, height: 720, pointerEvents: 'none' }, '<svg width="1280" height="720"><circle cx="0" cy="0" r="10" fill="none" stroke="#F2B640" stroke-width="6" style="filter:drop-shadow(0 0 6px rgba(242,182,64,.9))"/></svg>');
    const rc = ring.querySelector('circle'); rc.style.opacity = 0;
    const S = { caught: 0, missed: 0, cur: null, gap: 1.1, win: 1.7, last: -1, done: false, t: 0 };
    G.dbg = { S, holes };
    const hand = UI.hand(sc, holes[1].cx, holes[1].cy - 40);
    hand.style.display = 'none';
    G.say('Хватай зверька, пока он выглядывает из норки!');
    const pop = (h) => {
      h.state = 'up'; h.t = 0; S.cur = h;
      AU.play('pop');
      if (S.caught === 0 && S.missed === 0) { hand.style.left = h.cx + 'px'; hand.style.top = h.cy - h.h * 0.35 + 'px'; hand.style.display = ''; }
    };
    const hide = (h, ok) => { h.state = ok ? 'caught' : 'down'; h.t = 0; if (S.cur === h) S.cur = null; rc.style.opacity = 0; };
    const claws = (x, y) => {
      const c = G.h('div', 'abs', sc, { left: x - 70, top: y - 70, width: 140, height: 140, pointerEvents: 'none' },
        `<svg width="140" height="140" viewBox="0 0 140 140" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" style="filter:drop-shadow(0 0 6px rgba(242,182,64,.9))">
         <path d="M30 28 L104 92"/><path d="M48 18 L122 80"/><path d="M14 46 L88 108"/></svg>`);
      G.tween(0.45, (e) => { c.style.opacity = 1 - e; c.style.transform = `scale(${0.7 + 0.5 * e})`; }).then(() => c.remove());
    };
    G.on(sc, 'pointerdown', (e) => {
      AU.unlock();
      const p = G.bgPt(e), h = S.cur;
      if (S.done || !h || h.state !== 'up') return;
      if (Math.abs(p.x - h.cx) < h.rx * 1.45 && p.y > h.cy - h.h * 1.0 && p.y < h.cy + h.ry * 1.2) {
        S.caught++; top.counter.set(`${S.caught} / 8`);
        hand.style.display = 'none';
        AU.play('catch'); claws(h.cx, h.cy - h.h * 0.35); G.fx.sparkle(h.cx, h.cy - h.h * 0.3, 14);
        UI.popText(sc, 'Поймал!', h.cx, h.cy - h.h * 0.8, '#F2B640', 30);
        hide(h, true);
        S.win = Math.max(1.15, S.win - 0.07);
        if (S.caught >= 8) finish();
        else if (S.caught === 3) G.say('Ловко! Ещё быстрее!');
      }
    });
    const finish = async () => {
      S.done = true;
      G.say('Отлично! Ловкие руки — настоящий охотник.');
      await G.wait(1.4); if (!G.alive(tok)) return;
      const stars = S.missed <= 2 ? 3 : S.missed <= 5 ? 2 : 1;
      chFinish(3, stars, { fact: 'arms', stat: `Поймано 8 · убежали: ${S.missed}` });
    };
    G.tick((dt) => {
      S.t += dt;
      for (const h of holes) {
        h.t = (h.t || 0) + dt;
        if (h.state === 'up') {
          h.up = Math.min(1, h.up + dt / 0.22);
          const left = 1 - h.t / S.win;
          if (S.cur === h) {
            const r = h.rx * (0.95 + 0.85 * Math.max(0, left));
            rc.setAttribute('cx', h.cx); rc.setAttribute('cy', h.cy - h.h * 0.33); rc.setAttribute('r', r);
            rc.style.opacity = 1; rc.setAttribute('stroke', left < 0.3 ? '#F16B4A' : '#F2B640');
          }
          if (h.t > S.win) { S.missed++; hide(h, false); AU.play('miss'); }
        } else if (h.state === 'down' || h.state === 'caught') {
          h.up = Math.max(0, h.up - dt / (h.state === 'caught' ? 0.12 : 0.25));
          if (h.up <= 0) h.state = 'in';
        }
        const y = h.ly + h.ry - G.ease.out(h.up) * (h.h * 0.78 + h.ry);
        h.im.style.top = y + 'px';
        h.im.style.transform = h.state === 'up' ? `rotate(${Math.sin(S.t * 9 + h.cx) * 3}deg)` : '';
      }
      if (!S.done && !S.cur && holes.every((h) => h.state === 'in')) {
        S.gap -= dt;
        if (S.gap <= 0) {
          let i; do { i = Math.floor(Math.random() * holes.length); } while (i === S.last);
          S.last = i; pop(holes[i]); S.gap = G.rand(0.45, 0.95);
        }
      }
    });
  },
};

/* ------------------------------------------------------------------ 4 · find the neighbours */
Scenes.ch4 = {
  enter() {
    const sc = G.scene$, tok = G.token;
    const Z = 1.6, PW = 1280 * Z, PH = 720 * Z;
    const pan = G.h('div', 'abs', sc, { left: 0, top: 0, width: PW, height: PH });
    G.spr('bg_valley', pan, 0, 0, PW, PH);
    const marks = G.h('div', 'full', pan, { width: PW, height: PH, pointerEvents: 'none' });
    shades(sc, 0.5, 0);
    chHeader(4, 'Долина Луны');
    const S = { px: 0, py: 0, vx: 0, vy: 0, drag: null, found: 0, hints: 0, done: false };
    const clamp = () => {
      S.px = G.clamp(S.px, G.vis.x1 - PW, G.vis.x0); S.py = G.clamp(S.py, G.vis.y1 - PH, G.vis.y0);
      pan.style.transform = `translate(${S.px}px,${S.py}px)`;
    };
    S.px = 640 - PW * 0.5; S.py = 360 - PH * 0.55; clamp();
    const hb = G.h('button', 'plate ibtn pe'); hb.innerHTML = icon('binoculars'); hb.style.position = 'relative';
    const top = UI.topRight({ counter: ['eye', '0 / 5'], extra: [hb] });
    // minimap
    const mm = G.h('div', 'plate abs', G.ui, { left: Math.round(G.W / 2 - 104), top: 28, width: 208, height: 124 });
    mm.innerHTML = `<div class="abs" style="left:8px;top:8px;width:192px;height:108px;border-radius:3px;background:url(${G.img.bg_valley.src}) center/cover"></div><div class="abs vp" style="border:2px solid #fff;border-radius:3px;box-shadow:0 0 0 999px rgba(0,0,0,.25) inset"></div>`;
    const vp = mm.querySelector('.vp');
    // tray
    const tray = G.h('div', 'plate abs', G.ui, { left: Math.round(G.W / 2 - 278), bottom: 20, width: 556, height: 104, '--c': '10px' });
    const slots = DATA.neighbours.map((n, i) => {
      const s = G.h('div', 'abs', tray, { left: 12 + i * 108, top: 12, width: 100, height: 80, borderRadius: '6px', background: 'rgba(255,255,255,.04)' });
      const m = MAN['nb_' + n.key], k = Math.min(86 / m.w, 50 / m.h);
      const im = G.spr('nb_' + n.key, s, 50 - (m.w * k) / 2, 42 - (m.h * k) / 2, m.w * k, m.h * k);
      im.style.filter = 'brightness(0) opacity(.5)';
      const q = G.h('div', 'abs', s, { right: 8, top: 2, font: '600 18px Oswald,sans-serif', opacity: 0.5 }, '?');
      return { s, im, q };
    });
    UI.narrBottom = 136;
    const hand = UI.hand(G.ui, G.W / 2, G.H / 2, 'swipe');
    G.say('Двигай долину пальцем и найди всех соседей герреразавра!');
    const items = DATA.neighbours.map((n, i) => ({ ...n, i, got: false }));
    G.dbg = { S, items };
    const showFound = (it) => {
      it.got = true; S.found++;
      top.counter.set(`${S.found} / 5`);
      AU.play('found'); G.fx.sparkle(S.px + it.x, S.py + it.y, 18);
      G.h('div', 'abs', marks, { left: it.x - it.r * 0.8, top: it.y - it.r * 0.8, width: it.r * 1.6, height: it.r * 1.6, borderRadius: '50%', border: '4px solid #F2B640', boxShadow: '0 0 16px rgba(242,182,64,.7)' });
      G.h('div', 'abs', marks, { left: it.x + it.r * 0.5, top: it.y - it.r * 0.8, width: 40, height: 40, borderRadius: '50%', background: '#4CD26B', border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }, icon('check', ' style="width:22px;height:22px;color:#2A1E05"'));
      const sl = slots[it.i]; sl.im.style.filter = 'drop-shadow(0 2px 3px rgba(0,0,0,.5))'; sl.q.remove(); sl.s.style.background = 'rgba(255,255,255,.1)';
      if (S.card) S.card.remove();
      S.card = UI.card(G.ui, it.name, it.text, 32, 168, 360);
      G.say(it.text);
      if (S.found >= 5) finish();
    };
    const finish = async () => {
      S.done = true;
      await G.wait(3.5); if (!G.alive(tok)) return;
      G.say('Все соседи найдены!');
      chFinish(4, Math.max(1, 3 - S.hints), { stat: `Найдено 5 из 5 · подсказок: ${S.hints}`, note: 'В Долине Луны жили не только динозавры: клювастые рептилии, зверозубые и огромные «крокодилы».' });
    };
    const tapAt = (bp) => {
      const x = bp.x - S.px, y = bp.y - S.py;
      for (const it of items) if (!it.got && Math.hypot(x - it.x, y - it.y) < it.r) { showFound(it); return; }
      AU.play('miss');
    };
    G.on(sc, 'pointerdown', (e) => { AU.unlock(); const p = G.bgPt(e); S.drag = { pid: e.pointerId, x: p.x, y: p.y, sx: p.x, sy: p.y, moved: 0, t: performance.now() }; S.vx = S.vy = 0; hand.style.display = 'none'; });
    G.on(window, 'pointermove', (e) => {
      const d = S.drag; if (!d || e.pointerId !== d.pid) return;
      const p = G.bgPt(e), dx = p.x - d.x, dy = p.y - d.y;
      d.moved += Math.abs(dx) + Math.abs(dy); d.x = p.x; d.y = p.y;
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
};
