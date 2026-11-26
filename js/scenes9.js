'use strict';
/* ==================================================================== the games of the Jurassic of Australia and Antarctica (wave 13)
   - Scenes.stride «Шаг в шаг»: a young long-neck walks with the grown-ups of its herd. A ring at its foot shrinks to the beat
     of their steps: a tap when it turns gold is a step in time; an early or late tap, or a beat let go, and the young one drops
     behind (when it is far behind, the grown-ups stop and wait). From its leg bones a rhoetosaurus could walk 20–30 km a day.
   - Scenes.tide «Отлив»: a small theropod walks the beach and picks up what the sea has thrown out; when a big wave comes it
     must run up to the dry sand in time.
   - Scenes.leap «Прыжок за мошкой»: a little lake fish leaps out of the water for the midges and mayflies over it; only one that
     has come down close to the water can be reached (a gold ring around it shows when).
   - Scenes.school «Стайка»: keep inside the school when a predator comes — it can hardly pick one fish out of many. */

// the words for the new little things caught and eaten
Object.assign(ITEM, { it_clamshrimp: { many: 'рачков', cnt: 'рачков' }, it_midge: { many: 'мошек', cnt: 'мошек' }, it_mayfly: { many: 'подёнок', cnt: 'подёнок' } });

/* ---------------------------------------------------------------- «Шаг в шаг» */
const STR = { WIN: 0.27, BACK: 42, FALL: 44, WAIT: 210, R0: 26, R1: 92 };
Scenes.stride = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 3), NEED = p.need || 16, GY = G.floor(600, 50), T = p.tempo || 1.05;
    G.h('div', 'full', sc, { background: '#55663c' });
    GL.attach(sc);
    const bg = scrollTiles(p.bg || 'bg_run');
    shades(sc, 0.4, 0);
    chHeader(C.n, C.name);
    UI.topRight();
    const track = uiTrack(sp.sil, 'leaf');
    // the grown-ups ahead and the young one behind them, drawn to scale
    const d = MAN.auto[sp.id], bw = d.box[1] - d.box[0];
    const KY = fitK(sp.id, p.youngW || 280, 140), KA = KY * (p.ratio || 2.1), HY = (bw / 2) * KY, HA = (bw / 2) * KA, X0 = 80 + HY;
    const near = GL.makeAuto(sp.id, { x: X0 + HY + 50 + HA, y: GY - 4, s: KA, z: 3, young: false });
    const far = GL.makeAuto(sp.id, { x: X0 + HY + 50 + HA * 2.3, y: GY - 36, s: KA * 0.86, z: 2, young: false });
    const hero = GL.makeAuto(sp.id, { x: X0, y: GY + 12, s: KY, z: 4 });
    const SY = GL.autoStride(hero, 'walk') * KY, SA = GL.autoStride(near, 'walk') * KA, V = SY / (2 * T);
    // the beat ring at the young one's front feet
    const ring = G.h('div', 'abs', sc, { left: 0, top: 0, width: 10, height: 10, borderRadius: '50%', pointerEvents: 'none',
      border: '6px solid rgba(255,255,255,.85)', boxShadow: '0 0 14px rgba(255,255,255,.5)' });
    const S = { t: -2.2, gap: 0, gx: 0, good: 0, bad: 0, ans: new Set(), lastK: 0, ph: 0, aph: 0, scroll: 0, wait: false, done: false, flash: 0, started: false };
    G.dbg = { S, hero, near, far, T };
    const hit = G.h('div', 'hit', sc);
    const hand = UI.hand(G.ui, G.W / 2, G.H / 2, 'tap');
    const blink = blinker(), blinkA = blinker(), blinkB = blinker();
    const finish = async () => {
      S.done = true; AU.play('ok');
      G.say(p.win || 'Дошли! Длинношеие великаны много ходили: за день стадо проходило большой путь.');
      await G.wait(3.6); if (!G.alive(tok)) return;
      chFinish(C.n, S.bad <= 3 ? 3 : S.bad <= 7 ? 2 : 1, { stat: `Шагов в такт: ${S.good}` });
    };
    G.on(hit, 'pointerdown', () => {
      AU.unlock(); if (S.done || S.t < 0) return;
      hand.style.display = 'none';
      // the nearest beat not answered yet: the one just gone or the coming one
      const kp = Math.floor(S.t / T), kn = kp + 1, dp = S.t - kp * T, dn = kn * T - S.t;
      let k = 0;
      if (kp >= 1 && !S.ans.has(kp) && dp <= STR.WIN) k = kp;
      else if (dn <= STR.WIN && !S.ans.has(kn)) k = kn;
      if (k) {
        S.ans.add(k); S.started = true; S.good++; S.flash = 1;
        S.gap = Math.max(0, S.gap - STR.BACK);
        AU.play('step');
        const fx = hero.x + HY * 0.45; G.fx.sparkle(fx, GY + 10, 6);
        track(Math.min(1, S.good / NEED));
        if (S.good === 1) G.say(p.first || 'Так! Шаг в шаг со взрослыми.');
        if (S.good >= NEED) finish();
      } else {
        S.bad++; S.gap += 26; AU.play('miss');
        G.once('strEarly', p.early || 'Жди, пока кружок станет золотым, — тогда и шагай!');
      }
    });
    G.say(p.intro ? AU.alt(p.intro[0], p.intro[1]) : 'Стадо идёт к новым пастбищам. Нажимай, когда кружок у ноги станет золотым, — и шагай в ногу со взрослыми!');
    G.tick((dt) => {
      S.t += dt;
      // a beat let go (once the child has started: the first beats are for listening)
      if (S.t > 0 && !S.done) {
        const k = Math.floor(S.t / T);
        if (k >= 1 && k > S.lastK) {
          S.lastK = k;
          if (!S.wait) AU.play('thud');
        }
        const kg = Math.floor((S.t - STR.WIN) / T);
        if (S.started && kg >= 1 && kg > (S.goneK || 0)) {
          S.goneK = kg;
          if (!S.ans.has(kg)) {
            S.bad++; S.gap += STR.FALL;
            if (S.gap > 90) G.once('strBehind', p.behind || 'Не отставай! Нажимай, когда кружок станет золотым.');
          }
        }
      }
      // far behind: the grown-ups stop and wait for the young one
      if (!S.wait && S.gap >= STR.WAIT) { S.wait = true; G.once('strWait', p.waitTip || 'Взрослые остановились и ждут тебя. Нажимай в такт!'); }
      if (S.wait && S.gap < STR.WAIT * 0.45) S.wait = false;
      if (!S.wait && !S.done) {
        S.scroll += V * dt; bg(S.scroll);
        S.aph += ((2 * Math.PI * V) / Math.max(1, SA)) * dt;
      }
      // the young one walks on and catches up after good steps; its steps are quicker than the grown-ups'
      S.gx = G.lerp(S.gx, S.gap, Math.min(1, dt * 3));
      const heroMoving = !S.done || S.gx > 1;
      if (heroMoving) S.ph += ((2 * Math.PI * V) / Math.max(1, SY)) * dt * (S.wait ? 1.15 : 1);
      hero.x = X0 - Math.min(S.gx, X0 - 60);
      let [hb, hf] = GL.autoGait(hero, 'walk', S.ph, S.t);
      hero.blink = blink(S.t, dt); hero.pose(hb, hf);
      for (const [a, bl, o] of [[near, blinkA, 0], [far, blinkB, 1.7]]) {
        let ab, af;
        if (S.wait || S.done) { [ab, af] = GL.autoGait(a, 'stand', 0, S.t + o); ab.neck = (ab.neck || 0) - 8; }
        else [ab, af] = GL.autoGait(a, 'walk', S.aph + o, S.t);
        a.blink = bl(S.t, dt); a.pose(ab, af);
      }
      // the ring: big at the last beat, small and gold at the next one
      const u = S.t > 0 ? (S.t % T) / T : 0, k = Math.floor(S.t / T), toNext = (k + 1) * T - S.t, fromLast = S.t - k * T;
      const gold = S.t > 0 && ((toNext <= STR.WIN && !S.ans.has(k + 1)) || (k >= 1 && fromLast <= STR.WIN && !S.ans.has(k)));
      const r = S.t > 0 ? STR.R0 + (STR.R1 - STR.R0) * (1 - u) : STR.R1;
      const cx = hero.x + HY * 0.45, cy = GY + 8;
      S.flash = Math.max(0, S.flash - dt * 3);
      Object.assign(ring.style, { left: cx - r + 'px', top: cy - r * 0.5 + 'px', width: 2 * r + 'px', height: r + 'px',
        borderColor: gold ? '#F2B640' : 'rgba(255,255,255,.85)', boxShadow: gold ? '0 0 20px rgba(242,182,64,.9)' : '0 0 10px rgba(255,255,255,.4)',
        opacity: S.done ? 0 : String(0.55 + 0.45 * Math.max(gold ? 1 : 0, S.flash)) });
    });
  },
};

/* ---------------------------------------------------------------- «Отлив» */
const TID = { DRY: 960, V: 340, EAT: 0.8 };
Scenes.tide = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 3), NEED = p.need || 8, GY = G.floor(612, 40), food = p.food || ['it_fish'];
    G.h('div', 'full', sc, { background: '#d8c490' });
    G.bgImg(p.bg || 'bg_jwa_beach');
    shades(sc, 0.3, 0);
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: [p.icon || 'fish', `0 / ${NEED}`] });
    // the finds lie on the sand under the sheet of water that comes and goes; its edge is foam
    const under = G.h('div', 'abs', sc, { left: 0, top: 0, width: 0, height: 0, pointerEvents: 'none' });
    // the sea washes up the beach of the picture: a sheet of water over the wet sand from the picture's surf line (from the
    // left edge at y 520 to x 750 at y 280) to the front of the wave; the front runs from the far end of the beach to the
    // foreground and moves right as the wave comes (a: 0 calm … 1 the highest wave). An SVG: a wavy, soft-edged front with foam.
    const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg'), uid = 'tide' + tok;
    svg.setAttribute('viewBox', '0 0 1280 720'); svg.setAttribute('width', '1280'); svg.setAttribute('height', '720');
    Object.assign(svg.style, { position: 'absolute', left: '0px', top: '0px', pointerEvents: 'none', overflow: 'visible' });
    svg.innerHTML = `<defs><filter id="${uid}s" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="5"/></filter>
      <filter id="${uid}f" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="2.2"/></filter>
      <linearGradient id="${uid}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="rgb(40,150,170)" stop-opacity=".58"/>
      <stop offset="1" stop-color="rgb(110,200,208)" stop-opacity=".34"/></linearGradient></defs>
      <path fill="url(#${uid}g)" filter="url(#${uid}s)"/><path fill="none" stroke="rgba(250,253,253,.92)" stroke-width="10" stroke-linejoin="round" filter="url(#${uid}f)"/>`;
    sc.appendChild(svg);
    const [seaP, foamP] = svg.querySelectorAll('path');
    const xF = (y, a) => { const xf = -100 + 900 * a, xr = 750 + 250 * a; return xr + ((xf - xr) * (y - 280)) / 320; };
    const setSea = (a, t, foamOnly) => {
      const pts = [];
      for (let y = 280; y <= 730; y += 30) pts.push([xF(y, a) + 9 * Math.sin(y * 0.045 + t * 2.6), y]);
      const line = pts.map(([x, y]) => `${x.toFixed(1)} ${y}`).join(' L ');
      seaP.setAttribute('d', foamOnly ? '' : `M -20 527 L 750 280 L ${line} L -20 730 Z`);
      foamP.setAttribute('d', `M ${line}`);
    };
    GL.attach(sc);
    const W = walker({ x: TID.DRY + 80, y: GY, z: 4 }, p.box || [300, 140]), dino = W.it, HM = W.HEAD[0];
    const S = { t: 0, x: TID.DRY + 80, tx: TID.DRY + 80, face: -1, st: 'idle', target: null, eatT: 0, ph: 0, got: 0, wet: 0,
      A: 0, phase: 'calm', pt: 0, pdur: 3.2, waveN: 0, hitWave: -1, items: [], done: false };
    G.dbg = { S, W, xF };
    const blink = blinker();
    const hit = G.h('div', 'hit', sc);
    const hand = UI.hand(G.ui, G.W / 2, G.H / 2, 'tap');
    const pointAt = (x, y) => { const w = G.bgToWorld(x, y); hand.style.left = w.x + 'px'; hand.style.top = w.y + 'px'; hand.style.display = ''; };
    const IW = p.iw || 84;
    const drop = (x) => {
      const key = G.pick(food), y = GY + G.rand(-26, 6);
      const el = glowImg(key, under, x, y, IW, 'drop-shadow(0 0 6px rgba(255,236,170,.85)) drop-shadow(0 2px 2px rgba(0,0,0,.3))');
      S.items.push({ x, y, el, key, st: 'lie' });
    };
    drop(420); drop(640);
    pointAt(420, GY - 10);
    const finish = async () => {
      S.done = true; AU.play('ok');
      G.say(p.win || 'Наелся! Может быть, такие хищники бродили по берегу и подбирали то, что выбросило море.');
      await G.wait(3.6); if (!G.alive(tok)) return;
      chFinish(C.n, S.wet === 0 ? 3 : S.wet === 1 ? 2 : 1, { stat: `Находок: ${S.got}` });
    };
    // to eat, the animal stands with its mouth over the find
    const standAt = (it) => { const f = it.x >= S.x ? 1 : -1; return it.x - f * HM * 0.92; };
    G.on(hit, 'pointerdown', (e) => {
      AU.unlock(); if (S.done || S.st === 'eat' || S.st === 'wet') return;
      const q = G.bgPt(e);
      hand.style.display = 'none';
      let best = null;
      for (const it of S.items) { if (it.st !== 'lie' || xF(it.y, S.A) > it.x - 10) continue; const d = Math.hypot(q.x - it.x, q.y - it.y); if (d < 95 && (!best || d < best.d)) best = { it, d }; }
      if (best) { S.target = best.it; S.tx = standAt(best.it); S.st = 'go'; return; }
      S.target = null; S.tx = G.clamp(q.x, 120, 1200); S.st = 'go';
    });
    G.say(p.intro ? AU.alt(p.intro[0], p.intro[1]) : 'Море выбросило на берег рыбу. Нажимай на находки — и собирай их! А когда идёт большая волна — беги на сухой песок.');
    G.tick((dt) => {
      S.t += dt; S.pt += dt;
      // the sea: calm lapping, a big wave announced, its surge up the sand and its going back
      if (S.pt >= S.pdur) {
        S.pt = 0;
        if (S.phase === 'calm') {
          S.phase = 'warn'; S.pdur = 1.1; AU.play('whoosh');
          if (S.waveN === 0 && !S.done) { G.say(p.wave || 'Идёт большая волна! Беги на сухой песок — нажми справа!'); pointAt(1120, GY - 40); }
        } else if (S.phase === 'warn') { S.phase = 'surge'; S.pdur = 1.15; S.waveN++; AU.play('splash'); }
        else if (S.phase === 'surge') {
          S.phase = 'back'; S.pdur = 1.7;
          // the wave goes back and leaves new finds on the wet sand
          const n = S.items.filter((it) => it.st === 'lie').length < 2 ? 2 : 1;
          for (let i = 0; i < n; i++) drop(G.rand(150, 700));
        } else { S.phase = 'calm'; S.pdur = G.rand(3.6, 5.0); }
      }
      const u = Math.min(1, S.pt / S.pdur);
      if (S.phase === 'calm') S.A = 0.05 + 0.05 * Math.sin(S.t * 1.4);
      else if (S.phase === 'warn') S.A = 0.05 * (1 - Math.sin(u * Math.PI));
      else if (S.phase === 'surge') S.A = 1 - (1 - u) * (1 - u);
      else S.A = 1 - u * u;
      // a big wave coming: a line of white breakers blinks at the surf; the calm lapping is the picture's own surf
      const showing = S.phase === 'warn' || S.A > 0.12;
      svg.style.display = showing ? '' : 'none';
      if (showing) setSea(S.phase === 'warn' ? 0.16 : S.A, S.t, S.phase === 'warn');
      foamP.style.opacity = S.phase === 'warn' ? String(0.55 + 0.45 * Math.sin(S.t * 16)) : '1';
      // caught by the wave: wet and back to the dry sand
      if (S.phase === 'surge' && S.hitWave !== S.waveN && xF(GY, S.A) > S.x - 20 && !S.done) {
        S.hitWave = S.waveN; S.wet++; AU.play('miss');
        G.fx.burst(S.x, GY - 40, 14, { type: 'dot', color: ['rgba(255,255,255,.9)', 'rgba(180,230,240,.9)'], s0: 120, s1: 300, a0: Math.PI * 1.1, a1: Math.PI * 1.9, g: 700, z0: 3, z1: 7, l0: 0.4, l1: 0.8 });
        G.say(S.wet === 1 ? p.wetTip || 'Ой, накрыло волной! Когда идёт большая волна — беги на сухой песок.' : 'Ой, волна!');
        S.target = null; S.tx = TID.DRY + 80; S.st = 'wet';
      }
      if (S.st === 'wet' && S.x >= TID.DRY) S.st = 'idle';
      let moving = false;
      if (S.st === 'go' || S.st === 'wet') {
        const dx = S.tx - S.x, v = TID.V * (S.st === 'wet' ? 1.3 : 1);
        S.face = dx >= 0 ? 1 : -1;
        if (Math.abs(dx) <= v * dt) {
          S.x = S.tx;
          if (S.st === 'go' && S.target && S.target.st === 'lie') { S.st = 'eat'; S.eatT = 0; S.face = S.target.x >= S.x ? 1 : -1; AU.play('gulp'); }
          else S.st = 'idle';
        } else { S.x += Math.sign(dx) * v * dt; moving = true; S.ph += ((2 * Math.PI * v) / Math.max(1, W.stride)) * dt; }
      } else if (S.st === 'eat') {
        S.eatT += dt;
        const it = S.target, k = Math.min(1, S.eatT / TID.EAT);
        if (it) { it.el.style.opacity = String(1 - k); it.el.style.transform = `scale(${1 - 0.6 * k})`; }
        if (S.eatT >= TID.EAT) {
          if (it) { it.st = 'gone'; it.el.remove(); S.items.splice(S.items.indexOf(it), 1); G.fx.sparkle(it.x, it.y - 10, 8); }
          S.got++; top.counter.set(`${Math.min(S.got, NEED)} / ${NEED}`); AU.play('pop');
          if (S.got === 1) G.say(p.first || 'Ам! Вкусная находка.');
          S.target = null; S.st = 'idle';
          if (S.got >= NEED) finish();
        }
      }
      dino.x = S.x; dino.y = GY; dino.flip = S.face < 0;
      let body, feet;
      if (moving) [body, feet] = W.walk(S.ph);
      else [body, feet] = W.stand(S.t);
      if (S.st === 'eat') { body.head = (body.head || 0) + 18 + 5 * Math.sin(S.eatT * 14); body.neck = (body.neck || 0) + 10; }
      dino.blink = blink(S.t, dt); dino.pose(body, feet);
    });
  },
};

/* ---------------------------------------------------------------- «Прыжок за мошкой» */
const LEP = { REACH: 128, DUR: 0.95, V: 520, LIFE: 6.5 };
Scenes.leap = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 2), NEED = p.need || 8, WL = p.wl || 352, BUG = p.bug || 'it_midge', BW = p.bw || 76;
    G.h('div', 'full', sc, { background: '#3d6a58' });
    G.bgImg(p.bg || 'bg_jtal_split');
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: ['bug', `0 / ${NEED}`] });
    GL.attach(sc);
    const FW = p.fw || 230, Y0 = WL + 105, fish = swimmer({ x: 640, y: Y0, z: 4 }, FW);
    const air = G.h('div', 'abs', sc, { left: 0, top: 0, width: 0, height: 0, pointerEvents: 'none' });
    const ring = G.h('div', 'abs', sc, { left: 0, top: 0, width: 0, height: 0, borderRadius: '50%', pointerEvents: 'none', display: 'none' });
    // where the mouth is, from the middle of the fish (facing right, not turned)
    const m0 = fish.mouthPt(), MX = m0[0] - fish.x, MY = m0[1] - fish.y;
    const S = { t: 0, x: 640, y: Y0, face: 1, st: 'swim', lt: 0, leap: null, bug: null, nextB: 1.2, got: 0, miss: 0, acts: [], blinks: [], done: false };
    G.dbg = { S, fish, WL };
    const hit = G.h('div', 'hit', sc);
    const hand = UI.hand(G.ui, G.W / 2, G.H / 2, 'tap'); hand.style.display = 'none';
    const splash = (x) => G.fx.burst(x, WL, 12, { type: 'dot', color: ['rgba(255,255,255,.9)', 'rgba(190,230,240,.85)'], s0: 110, s1: 300,
      a0: Math.PI * 1.12, a1: Math.PI * 1.88, g: 900, z0: 3, z1: 7, l0: 0.35, l1: 0.75 });
    const reach = (b) => b && b.y >= WL - LEP.REACH;
    const finish = async () => {
      S.done = true; AU.play('ok');
      G.say(p.win || 'Наелся! Маленькие рыбки выпрыгивали из воды за мошками — так делают и сегодняшние рыбы.');
      await G.wait(3.4); if (!G.alive(tok)) return;
      chFinish(C.n, S.miss <= 2 ? 3 : S.miss <= 5 ? 2 : 1, { stat: `Поймано: ${S.got}` });
    };
    const spawn = () => {
      const x = G.rand(230, 1050), el = glowImg(BUG, air, x, WL - 260, BW, 'drop-shadow(0 0 5px rgba(255,236,170,.7))');
      S.bug = { x, x0: x, y: WL - 260, base: WL - 260, el, t: 0, ph: G.rand(0, 6), w: G.rand(1.5, 2.1), st: 'come' };
    };
    G.on(hit, 'pointerdown', () => {
      AU.unlock(); if (S.done || S.st !== 'swim' || !S.bug || S.bug.st === 'go') return;
      hand.style.display = 'none';
      const b = S.bug, ok = reach(b), face = b.x >= S.x ? 1 : -1;
      // the mouth goes up to the insect (or as high as a leap goes) and the fish falls back further on
      const ax = b.x - face * MX * 0.8, ay = (ok ? b.y : WL - LEP.REACH * 0.85) - MY;
      S.face = face; S.st = 'leap'; S.lt = 0; S.leap = { x0: S.x, y0: S.y, ax, ay, x1: ax + (ax - S.x) * 0.9, ok };
      AU.play('jump');
      if (!ok) { S.miss++; G.once('lepHigh', p.high || 'Высоко! Жди, пока мошка спустится к самой воде, — вокруг неё загорится кружок.'); }
    });
    G.say(p.intro ? AU.alt(p.intro[0], p.intro[1]) : 'Над водой кружат мошки. Когда мошка спустится к воде и вокруг неё загорится кружок — нажимай: рыбка выпрыгнет и схватит её!');
    G.tick((dt) => {
      S.t += dt;
      // the insect: it flies down to the water and dances over it, up and down; at the end of its time it flies off
      if (!S.bug && !S.done) { S.nextB -= dt; if (S.nextB <= 0) spawn(); }
      const b = S.bug;
      if (b) {
        b.t += dt;
        if (b.st === 'come') { b.base = G.lerp(b.base, WL - 112, Math.min(1, dt * 1.6)); if (b.t > 2.2) b.st = 'dance'; }
        else if (b.st === 'dance' && b.t > LEP.LIFE && S.st === 'swim') { b.st = 'go'; }
        if (b.st === 'go') { b.base -= 260 * dt; if (b.base < -60) { b.el.remove(); S.bug = null; S.nextB = 0.6; } }
        if (S.bug) {
          b.y = b.base + 42 * Math.sin(b.ph + b.t * b.w); b.x = b.x0 + 26 * Math.sin(b.ph * 0.7 + b.t * 1.3);
          b.el.style.left = b.x - BW / 2 + 'px'; b.el.style.top = b.y - (BW * MAN[BUG].h) / MAN[BUG].w / 2 + 'px';
          const ok = reach(b) && b.st !== 'go', r = 52;
          Object.assign(ring.style, { display: b.st === 'go' ? 'none' : '', left: b.x - r + 'px', top: b.y - r + 'px', width: 2 * r + 'px', height: 2 * r + 'px',
            border: ok ? '5px solid #F2B640' : '3px dashed rgba(255,255,255,.55)', boxShadow: ok ? '0 0 18px rgba(242,182,64,.85)' : 'none' });
          if (ok && S.got === 0 && S.st === 'swim' && b.t > 2.4) { const w = G.bgToWorld(b.x, b.y); hand.style.left = w.x + 'px'; hand.style.top = w.y + 'px'; hand.style.display = ''; }
        }
      } else ring.style.display = 'none';
      // the fish: under the insect just below the surface, or in the air
      let rot = 0;
      if (S.st === 'swim') {
        const tx = S.bug ? S.bug.x - S.face * MX * 0.8 : 640;
        const dx = tx - S.x;
        if (Math.abs(dx) > 6) S.face = dx > 0 ? 1 : -1;
        S.x += G.clamp(dx, -LEP.V * dt, LEP.V * dt);
        S.y = Y0 + 7 * Math.sin(S.t * 2.2);
      } else {
        S.lt += dt;
        const L = S.leap, u = Math.min(1, S.lt / LEP.DUR), a = 1 - u;
        // a curve through the top point: up to it in the first half, down beyond it in the second
        const P0 = [L.x0, L.y0], P2 = [L.x1, Y0 + 20], P1 = [2 * L.ax - (P0[0] + P2[0]) / 2, 2 * L.ay - (P0[1] + P2[1]) / 2];
        const nx = a * a * P0[0] + 2 * a * u * P1[0] + u * u * P2[0], ny = a * a * P0[1] + 2 * a * u * P1[1] + u * u * P2[1];
        const vx = 2 * a * (P1[0] - P0[0]) + 2 * u * (P2[0] - P1[0]), vy = 2 * a * (P1[1] - P0[1]) + 2 * u * (P2[1] - P1[1]);
        rot = Math.atan2(vy, Math.abs(vx) + 1e-3) * 0.8;
        if ((S.y >= WL) !== (ny >= WL)) { splash(nx); AU.play('splash'); }
        S.x = nx; S.y = ny;
        if (!L.caught && L.ok && u >= 0.5 && S.bug) {
          L.caught = true; const bb = S.bug; G.fx.sparkle(bb.x, bb.y, 10); bb.el.remove(); S.bug = null; S.nextB = 0.9;
          S.got++; top.counter.set(`${Math.min(S.got, NEED)} / ${NEED}`); AU.play('gulp');
          S.acts.push({ type: 'snap', t0: S.t, dur: 0.4 });
          if (S.got === 1) G.say(p.first || 'Поймала! Ам!');
          if (S.got >= NEED) G.wait(0.6).then(() => { if (G.alive(tok) && !S.done) finish(); });
        }
        if (u >= 1) { S.st = 'swim'; S.y = Y0 + 20; }
      }
      const ps = fish.swimPose(S.t, S.acts, S.blinks, S.st === 'leap' ? 1.4 : 0.8);
      fish.mesh.deform(ps); fish.blink = ps.blink || 0;
      fish.x = S.x; fish.y = S.y + (ps.yOff || 0) * fish.s; fish.flip = S.face < 0; fish.rot = S.face < 0 ? -rot : rot;
    });
  },
};

/* ---------------------------------------------------------------- «Стайка» */
const SCH = { N: 15, RX: 150, RY: 96 };
Scenes.school = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 3), NEED = p.need || 5, PRED = p.pred || 'nb_hybodont', FROM = p.from || 'side';
    G.h('div', 'full', sc, { background: '#1d3f36' });
    G.bgImg(p.bg || 'bg_jtal_lake');
    shades(sc, 0.3, 0.15);
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: ['fish', `0 / ${NEED}`] });
    // the place of the school: a soft light where the fish are thickest
    const glow = G.h('div', 'abs', sc, { left: 0, top: 0, width: SCH.RX * 2.4, height: SCH.RY * 2.4, borderRadius: '50%', pointerEvents: 'none',
      background: 'radial-gradient(ellipse at 50% 50%, rgba(255,240,190,.22), rgba(255,240,190,.10) 55%, rgba(255,240,190,0) 72%)' });
    const halo = G.h('div', 'abs', sc, { left: 0, top: 0, width: 150, height: 90, borderRadius: '50%', pointerEvents: 'none',
      background: 'radial-gradient(ellipse at 50% 50%, rgba(242,182,64,.45), rgba(242,182,64,0) 70%)' });
    const layer = G.h('div', 'abs', sc, { left: 0, top: 0, width: 0, height: 0, pointerEvents: 'none' });
    const mk = MAN['sp_' + sp.id];
    const mates = [];
    for (let i = 0; i < SCH.N; i++) {
      const a = G.rand(0, Math.PI * 2), rr = Math.sqrt(G.rand(0.08, 1));
      const w = G.rand(78, 100), h = (w * mk.h) / mk.w, el = G.spr('sp_' + sp.id, layer, 0, 0, w, h);
      el.style.filter = 'brightness(.9) saturate(.9)';
      mates.push({ el, w, h, ox: Math.cos(a) * rr * SCH.RX * 0.95, oy: Math.sin(a) * rr * SCH.RY * 0.95, ph: G.rand(0, 6) });
    }
    const pm = MAN[PRED], PW = p.pw || 430, PH = (PW * pm.h) / pm.w;
    const pred = G.spr(PRED, sc, 0, 0, PW, PH); pred.style.display = 'none'; pred.style.transformOrigin = '50% 50%';
    const warn = G.h('div', 'abs', sc, { left: 0, top: 0, width: 160, height: 160, borderRadius: '50%', pointerEvents: 'none', display: 'none',
      background: 'radial-gradient(circle, rgba(10,20,20,.55), rgba(10,20,20,0) 70%)' });
    GL.attach(sc);
    const hero = swimmer({ x: 640, y: 400, z: 4 }, p.fw || 116);
    const S = { t: 0, cx: 640, cy: 400, vx: 0, x: 640, y: 420, tx: 640, ty: 420, face: 1, hold: false, safe: 0, hits: 0, att: null, next: 6.5, done: false, acts: [], blinks: [] };
    G.dbg = { S, hero, mates };
    const hit = G.h('div', 'hit', sc);
    const hand = UI.hand(G.ui, G.W / 2, G.H / 2 + 40, 'hold');
    const setT = (e) => { const q = G.bgPt(e); S.tx = G.clamp(q.x, 60, 1220); S.ty = G.clamp(q.y, 140, 650); };
    G.on(hit, 'pointerdown', (e) => { AU.unlock(); S.hold = true; S.pid = e.pointerId; hand.style.display = 'none'; setT(e); });
    G.on(window, 'pointermove', (e) => { if (S.hold && e.pointerId === S.pid) setT(e); });
    const up = (e) => { if (e.pointerId === S.pid) S.hold = false; };
    G.on(window, 'pointerup', up); G.on(window, 'pointercancel', up);
    const inside = () => ((S.x - S.cx) / SCH.RX) ** 2 + ((S.y - S.cy) / SCH.RY) ** 2 <= 1.15;
    const finish = async () => {
      S.done = true; AU.play('ok');
      G.say(p.win || 'Молодец! В стайке безопаснее: хищнику трудно выбрать одну рыбку из многих.');
      await G.wait(3.4); if (!G.alive(tok)) return;
      chFinish(C.n, S.hits === 0 ? 3 : S.hits === 1 ? 2 : 1, { stat: `Спаслись в стайке: ${S.safe}` });
    };
    G.say(p.intro ? AU.alt(p.intro[0], p.intro[1]) : 'Веди пальцем — и держись в стайке! Когда приплывёт хищник, спрячься в середине, среди других рыбок.');
    G.tick((dt) => {
      S.t += dt;
      // the school drifts slowly about the lake
      const ncx = 640 + 280 * Math.sin(S.t * 0.2), ncy = 395 + 105 * Math.sin(S.t * 0.33 + 0.8);
      S.vx = (ncx - S.cx) / Math.max(dt, 1e-3); S.cx = ncx; S.cy = ncy;
      const sf = S.vx >= 0 ? 1 : -1;
      glow.style.left = S.cx - SCH.RX * 1.2 + 'px'; glow.style.top = S.cy - SCH.RY * 1.2 + 'px';
      for (const m of mates) {
        const x = S.cx + m.ox + 10 * Math.sin(S.t * 1.7 + m.ph), y = S.cy + m.oy + 6 * Math.sin(S.t * 2.1 + m.ph);
        m.el.style.left = x - m.w / 2 + 'px'; m.el.style.top = y - m.h / 2 + 'px'; m.el.style.transform = sf < 0 ? 'scaleX(-1)' : '';
      }
      // the player's fish follows the finger
      const dx = S.tx - S.x, dy = S.ty - S.y, dd = Math.hypot(dx, dy), vmax = 430 * dt;
      if (dd > 1) { const k = Math.min(1, vmax / dd); S.x += dx * k; S.y += dy * k; if (Math.abs(dx) > 4) S.face = dx > 0 ? 1 : -1; }
      halo.style.left = S.x - 75 + 'px'; halo.style.top = S.y - 45 + 'px';
      // the predator: a shadow first, then it shoots through (from the side) or snaps up from the weeds (from below)
      if (!S.done && !S.att) { S.next -= dt; if (S.next <= 0) {
        const side = Math.random() < 0.5 ? -1 : 1;
        S.att = { st: 'warn', t: 0, side, y: S.cy + G.rand(-40, 40), x: S.cx + G.rand(-60, 60), judged: false };
        AU.play('alert');
        if (S.safe + S.hits === 0) G.say(p.alarm || 'Хищник! Скорее в стайку — в самую середину!');
      } }
      const A = S.att;
      if (A) {
        A.t += dt;
        if (A.st === 'warn') {
          const wx = FROM === 'side' ? (A.side < 0 ? 40 : 1240) : A.x, wy = FROM === 'side' ? A.y : 690;
          Object.assign(warn.style, { display: '', left: wx - 80 + 'px', top: wy - 80 + 'px', opacity: String(0.5 + 0.5 * Math.sin(A.t * 12)) });
          if (A.t >= 1.5) { A.st = 'go'; A.t = 0; warn.style.display = 'none'; pred.style.display = ''; AU.play('whoosh'); }
        } else {
          const D = FROM === 'side' ? 1.5 : 1.3, u = Math.min(1, A.t / D);
          let px, py, f;
          if (FROM === 'side') { px = A.side < 0 ? -PW + (1280 + 2 * PW) * u : 1280 + PW - (1280 + 2 * PW) * u; py = A.y; f = A.side < 0 ? 1 : -1; }
          else { const s = Math.sin(u * Math.PI); px = A.x; py = 760 - (760 - (S.cy + 40)) * s; f = 1; }
          pred.style.left = px - PW / 2 + 'px'; pred.style.top = py - PH / 2 + 'px';
          pred.style.transform = (f < 0 ? 'scaleX(-1) ' : '') + (FROM === 'side' ? '' : `rotate(${-70 * (u < 0.5 ? 1 : -1)}deg)`);
          // judged when it passes the player's fish (or at the top of its snap)
          const passing = FROM === 'side' ? Math.abs(px - S.x) < 60 : u >= 0.5;
          if (!A.judged && passing) {
            A.judged = true;
            if (inside()) {
              S.safe++; top.counter.set(`${Math.min(S.safe, NEED)} / ${NEED}`); AU.play('found');
              if (S.safe === 1) G.say(p.safeTip || 'Ты в стайке! Хищник не смог выбрать, за кем гнаться.');
            } else {
              S.hits++; AU.play('miss'); S.acts.push({ type: 'snap', t0: S.t, dur: 0.4 });
              G.fx.burst(S.x, S.y, 10, { type: 'dot', color: ['rgba(255,255,255,.85)'], s0: 80, s1: 220, g: 0, z0: 3, z1: 6, l0: 0.3, l1: 0.6 });
              G.say(S.hits === 1 ? p.hitTip || 'Ой! Хищник чуть не поймал тебя. Держись в середине стайки!' : 'Держись в стайке!');
            }
          }
          if (u >= 1) { pred.style.display = 'none'; S.att = null; S.next = G.rand(5.5, 7.5); if (S.safe >= NEED) finish(); }
        }
      }
      const ps = hero.swimPose(S.t, S.acts, S.blinks, 0.9);
      hero.mesh.deform(ps); hero.blink = ps.blink || 0;
      hero.x = S.x; hero.y = S.y + (ps.yOff || 0) * hero.s; hero.flip = S.face < 0; hero.rot = 0;
    });
  },
};
