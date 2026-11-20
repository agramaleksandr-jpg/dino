'use strict';
/* ==================================================================== the Cretaceous games:
   smell (a young tyrannosaur finds hidden prey by its smell) · duel (two triceratopses push with their horns) ·
   calls (a young parasaurolophus repeats the call of its herd) · thermal (a pteranodon soars on warm air under the clouds) */

/** words for the Cretaceous finds and foods */
Object.assign(ITEM, {
  it_mammal: { many: 'зверьков', one: 'зверёк', cnt: 'зверьков' }, it_palm: { many: 'сочные листья', cnt: 'листьев' },
  it_magnolia: { many: 'цветы магнолии', cnt: 'цветов' }, it_araucaria: { many: 'ветки араукарии', cnt: 'веток' },
  it_turtle: { many: 'черепах', cnt: 'черепах' },
});

/* ------------------------------------------------------------------ smell · tap a thicket: the young hunter goes there and sniffs.
   The smell is stronger the closer the prey: thin wisps rise from its thicket, the nose meter fills, «тепло — холодно». */
Scenes.smell = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 3), NEED = p.need || 3, prey = p.prey || 'it_mammal';
    const GY = G.floor(640, 40), N = 5, XS = [250, 455, 660, 865, 1070];
    G.lowerBg(G.bgImg(p.bg || 'bg_forest'));
    shades(sc, 0.5, 0);
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: ['paw', `0 / ${NEED}`] });
    const meter = uiMeter('wind', 'Запах');
    // the thickets stand behind the hunter: two fern fronds each, one mirrored
    const bushes = XS.map((x, i) => {
      const el = G.h('div', 'abs', sc, { left: x - 95, top: GY - 205, width: 190, height: 190, transformOrigin: '50% 100%', pointerEvents: 'none' });
      const a = G.spr('it_fern', el, 8, 6, 110, 200); a.style.transform = 'rotate(-14deg)';
      const b = G.spr('it_fern', el, 70, 0, 112, 204); b.style.transform = 'scaleX(-1) rotate(-10deg)';
      for (const f of [a, b]) f.style.filter = 'brightness(.82) saturate(.9) drop-shadow(0 4px 4px rgba(0,0,0,.35))';
      return { x, el, i };
    });
    // the smell: wisps rising from the hidden prey, faint far away and strong close by
    const wisps = G.h('div', 'abs', sc, { left: 0, top: GY - 330, width: 220, height: 260, marginLeft: '-110px', pointerEvents: 'none', opacity: 0.5, transition: 'opacity .4s',
      filter: 'drop-shadow(0 0 2px rgba(30,50,0,.9)) drop-shadow(0 0 8px rgba(230,255,140,.9))' },
      `<svg width="220" height="260" viewBox="0 0 220 260" fill="none" stroke-linecap="round">${[0, 1, 2, 3].map((i) => `<path style="animation:smellrise 2.4s ${i * 0.6}s linear infinite"
        d="M${70 + i * 26} 250 c -24 -30 24 -50 0 -80 s 24 -50 0 -80" stroke="rgba(255,255,236,.97)" stroke-width="9"/>`).join('')}</svg>`);
    GL.attach(sc);
    const W = walker({ x: 170, y: GY, z: 3 }, [300, 170]), dino = W.it, HX = Math.abs(W.HEAD[0]);
    const S = { t: 0, x: 170, face: 1, goal: null, walkPh: 0, got: 0, miss: 0, target: -1, busy: false, done: false, acts: [], sniffT: 0, tried: new Set() };
    const blink = blinker();
    G.dbg = { S, dino, XS };
    const hand = UI.hand(G.ui, XS[2], GY - 120, 'tap');
    const pick = () => {
      let i;
      do { i = Math.floor(G.rand(0, N)); } while (i === S.target || Math.abs(XS[i] - S.x) < 150);
      S.target = i; S.tried = new Set();
      wisps.style.left = XS[i] + 'px';
    };
    pick();
    G.say(AU.alt('Малыш тираннозавра чует добычу! Нажимай на кусты — он подойдёт и понюхает. Чем ближе зверёк, тем сильнее запах.',
      'Нажимай на кусты — тираннозавр понюхает. Чем ближе добыча, тем сильнее запах.'));
    // where the hunter stops to sniff a thicket: its mouth just before the leaves, from the side it comes from, or from the
    // other side when there it would stand off the screen
    const HALF = W.stride ? Math.max(HX, 0.5 * (MAN.auto[sp.id].box[1] - MAN.auto[sp.id].box[0]) * W.K) : HX;
    const fits = (x) => x - HALF >= 10 && x + HALF <= 1270;
    const stopAt = (i) => {
      const side = XS[i] >= S.x ? 1 : -1, a = { x: XS[i] - side * (HX + 70), face: side }, b = { x: XS[i] + side * (HX + 70), face: -side };
      return fits(a.x) || !fits(b.x) ? a : b;
    };
    const tapBush = (i) => {
      if (S.busy || S.done) return;
      hand.style.display = 'none';
      const st = stopAt(i);
      S.goal = { i, x: st.x, face: st.face };
      S.face = Math.abs(st.x - S.x) > 6 ? Math.sign(st.x - S.x) : st.face;
      S.busy = true;
    };
    for (const b of bushes) {
      const hb = G.h('div', 'abs', sc, { left: b.x - 105, top: GY - 230, width: 210, height: 250, cursor: 'pointer' });
      G.on(hb, 'pointerdown', (e) => { e.stopPropagation(); AU.unlock(); tapBush(b.i); });
    }
    const shake = (b) => G.tween(0.5, (e) => { b.el.style.transform = `rotate(${6 * Math.sin(e * Math.PI * 4) * (1 - e)}deg)`; });
    const sniff = async (i) => {
      S.acts.push({ type: 'eat', t0: S.t, dur: 0.9 }); AU.play('whoosh');
      await G.wait(0.9); if (!G.alive(tok)) return;
      const d = Math.abs(i - S.target);
      if (d === 0) return found(i);
      S.miss++;
      if (!S.tried.has(i)) S.tried.add(i);
      shake(bushes[i]);
      const warm = d === 1;
      UI.popText(sc, warm ? 'Тепло!' : d === 2 ? 'Прохладно' : 'Холодно', XS[i], GY - 250, warm ? '#F2B640' : '#9fd3ff', 30);
      AU.play(warm ? 'ok' : 'miss');
      if (warm) G.once('warm', 'Тепло! Зверёк где-то рядом.'); else G.once('cold', 'Холодно! Здесь зверьком не пахнет.');
      S.busy = false;
    };
    const found = async (i) => {
      const b = bushes[i];
      shake(b); AU.play('found');
      // the prey jumps out of the thicket and runs; the hunter snaps it up
      const c = critter(prey, sc, 120), dir = S.face;
      let x = b.x, y = GY - 20;
      c.place(x, y, dir);
      await G.tween(0.35, (e) => { c.place(x + dir * 40 * e, y - 50 * Math.sin(Math.PI * e), dir); });
      if (!G.alive(tok)) return;
      S.acts.push({ type: 'snap', t0: S.t, dur: 0.4 }); AU.play('catch');
      G.fx.sparkle(x + dir * 40, y - 30, 14);
      UI.popText(sc, 'Нашёл!', x, GY - 250, '#F2B640', 32);
      await G.tween(0.25, (e) => { c.el.style.opacity = 1 - e; });
      c.el.remove();
      S.got++; top.counter.set(`${S.got} / ${NEED}`);
      if (S.got === 1) G.say('Нашёл по запаху! Тираннозавр чуял добычу издалека.');
      if (S.got >= NEED) return finish();
      pick(); S.busy = false;
    };
    const finish = async () => {
      S.done = true; wisps.style.opacity = 0;
      AU.voiceOf(sp.id, { vol: 0.6 });
      G.say('Отличный нюх! Так тираннозавр находил добычу.');
      await G.wait(2.0); if (!G.alive(tok)) return;
      const stars = S.miss <= 2 ? 3 : S.miss <= 5 ? 2 : 1;
      chFinish(C.n, stars, { stat: `Найдено: ${S.got} · лишних поисков: ${S.miss}` });
    };
    G.tick((dt) => {
      S.t += dt;
      let moving = false;
      if (S.goal) {
        const dx = S.goal.x - S.x, v = 230;
        if (Math.abs(dx) > 3) { const st = Math.sign(dx) * Math.min(Math.abs(dx), v * dt); S.x += st; S.walkPh += (2 * Math.PI * Math.abs(st)) / W.stride; moving = true; S.face = Math.sign(dx); }
        else { const g = S.goal; S.goal = null; S.face = g.face; sniff(g.i); }
      }
      S.x = G.clamp(S.x, 60, 1220);
      dino.x = S.x; dino.flip = S.face < 0;
      const [body, feet] = moving ? W.walk(S.walkPh) : W.stand(S.t);
      const pa = Pose.auto(sp.id)(S.t, S.acts, []);
      body.head = (body.head || 0) + (pa.head || 0); body.neck = (body.neck || 0) + (pa.neck || 0);
      dino.blink = blink(S.t, dt);
      dino.pose(body, feet);
      // how strong the smell is where the hunter's nose is
      const nose = S.x + S.face * HX, dist = Math.abs(nose - XS[S.target]);
      const k = S.done ? 0 : G.clamp(1 - dist / 820, 0, 1);
      meter(k, false);
      // faint far away, plain to see close by: the hunter follows its nose
      wisps.style.opacity = S.done ? 0 : (0.12 + 0.88 * k * k).toFixed(2);
    });
  },
};

/* ------------------------------------------------------------------ duel · two triceratopses lock horns and push; tap fast to push harder */
Scenes.duel = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 3), NEED = p.need || 3, GY = G.floor(612, 44);
    G.lowerBg(G.bgImg(p.bg || 'bg_valley'));
    shades(sc, 0.45, 0);
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: ['award', `0 / ${NEED}`] });
    const track = uiTrack(sp.sil, 'award');
    GL.attach(sc);
    const d = MAN.auto[sp.id], K = fitK(sp.id, 470, 220);
    // the beak sits this far in front of the animal's anchor; the horns reach past it, so with the beaks a little apart the horns cross
    const make = (flip) => GL.makeAuto(sp.id, { x: 0, y: GY, s: K, z: flip ? 2 : 3, flip, young: false });
    const me = make(false), foe = make(true);
    const MX = (GL.restPt(me, d.mouth)[0] - me.ax) * K, GAP = 34;
    const CX0 = 640, GOAL = 190, LOSE = -170;
    const S = { t: 0, push: 0, v: 0, round: 0, won: 0, slips: 0, taps: 0, state: 'lock', st: 0, phM: 0, phF: 0, done: false, acts: [], facts: [], lunge: 0, first: true };
    const blink = blinker(), blinkF = blinker();
    G.dbg = { S, me, foe };
    const hit = G.h('div', 'hit', sc);
    const hand = UI.hand(G.ui, G.W / 2, G.H / 2, 'tap');
    G.say(AU.alt('Два молодых трицератопса сцепились рогами! Нажимай быстро-быстро — и толкай соперника назад!', 'Нажимай быстро-быстро — толкай соперника!'));
    const strength = () => [30, 38, 46][Math.min(2, S.round)];
    G.on(hit, 'pointerdown', () => {
      AU.unlock();
      if (S.done || S.state !== 'lock') return;
      hand.style.display = 'none';
      S.v += 120; S.taps++; S.lunge = 0.18;
      if (S.taps % 3 === 0) { AU.play('thud'); G.fx.dust(CX0 + S.push - MX - 160, GY + 6, 4); }
    });
    const winRound = async () => {
      S.state = 'apart'; S.st = 0; S.won++; top.counter.set(`${S.won} / ${NEED}`);
      AU.play('hit'); AU.play('ok'); G.fx.sparkle(CX0 + S.push, GY - 150, 16); G.fx.dust(CX0 + S.push + 80, GY + 6, 14);
      UI.popText(sc, 'Сильнее!', CX0 + S.push, GY - 280, '#F2B640', 34);
      if (S.won === 1) G.say('Ты сильнее! Соперник отступил. Но он не сдаётся!');
      if (S.won >= NEED) { finish(); return; }
      await G.wait(2.4); if (!G.alive(tok) || S.done) return;
      S.round++; S.push = 0; S.v = 0; S.state = 'lock';
    };
    const slip = () => {
      S.slips++; AU.play('alert');
      G.once('slip', 'Соперник давит! Нажимай быстрее!');
      S.push = 0; S.v = 0;
    };
    const finish = async () => {
      S.done = true; S.state = 'leave'; S.st = 0;
      AU.voiceOf(sp.id, { at: 0.3, vol: 0.7 });
      G.say('Победа! Трицератопсы мерились силой рогами — как сейчас олени.');
      await G.wait(2.6); if (!G.alive(tok)) return;
      const stars = S.slips === 0 ? 3 : S.slips <= 2 ? 2 : 1;
      chFinish(C.n, stars, { stat: `Побед: ${S.won} · соперник теснил: ${S.slips}` });
    };
    G.tick((dt) => {
      S.t += dt; S.st += dt;
      if (S.lunge > 0) S.lunge -= dt;
      // the push: taps add speed, the rival pushes back all the time
      let gapNow = GAP, foeOff = 0;
      if (S.state === 'lock') {
        S.v -= strength() * 3.2 * dt;               // the rival's push
        S.v *= Math.exp(-3.2 * dt);                 // friction of the feet on the ground
        const old = S.push;
        S.push = G.clamp(S.push + S.v * dt, LOSE - 10, GOAL + 10);
        const mv = S.push - old;
        S.phM += (2 * Math.PI * Math.abs(mv)) / Math.max(40, GL.autoStride(me, 'walk') * K) * 1.6;
        S.phF = S.phM + Math.PI;
        if (S.first && S.push > 20) S.first = false;
        if (S.push >= GOAL) winRound();
        else if (S.push <= LOSE) slip();
      } else if (S.state === 'apart') {
        // both step back, shake their heads, and come together again
        const u = Math.min(1, S.st / 0.8), back = 70 * G.smooth(0, 1, u) * (S.st < 1.6 ? 1 : 1 - G.smooth(1.6, 2.4, S.st));
        gapNow = GAP + back; foeOff = 60 * G.smooth(0, 1, u) * (S.st < 1.6 ? 1 : 1 - G.smooth(1.6, 2.4, S.st));
        S.push = G.lerp(S.push, 0, Math.min(1, dt * 1.5));
      } else if (S.state === 'leave') {
        foeOff = 900 * G.smooth(0, 2.2, S.st); gapNow = GAP + 40 * G.smooth(0, 0.6, S.st);
      }
      track(G.clamp(S.push / GOAL, 0, 1));
      const cx = CX0 + S.push, lx = S.lunge > 0 ? Math.sin(Math.PI * (1 - S.lunge / 0.18)) * 10 : 0;
      me.x = cx - gapNow / 2 - MX + lx; foe.x = cx + gapNow / 2 + MX + foeOff;
      // the animals: heads down, legs pressing into the ground
      const pressing = S.state === 'lock';
      const [b1, f1] = pressing ? GL.autoGait(me, 'walk', S.phM, S.t) : GL.autoGait(me, 'stand', 0, S.t);
      const leaving = S.state === 'leave';
      const [b2, f2] = leaving ? GL.autoGait(foe, 'walk', S.t * 6, S.t) : pressing ? GL.autoGait(foe, 'walk', S.phF, S.t) : GL.autoGait(foe, 'stand', 0, S.t);
      const strain = pressing ? 1 : 0.2;
      b1.head = (b1.head || 0) + 5 * strain + 1.2 * Math.sin(S.t * 9) * strain; b1.neck = (b1.neck || 0) + 3 * strain;
      b2.head = (b2.head || 0) + 5 * strain + 1.2 * Math.sin(S.t * 9 + 1) * strain; b2.neck = (b2.neck || 0) + 3 * strain;
      if (S.state === 'apart' && S.st < 1.2) { b1.head -= 8 * Math.sin(S.st * 9) * (1 - S.st / 1.2); b2.head += 6 * Math.sin(S.st * 8) * (1 - S.st / 1.2); }
      if (leaving) foe.flip = false;
      me.blink = blink(S.t, dt); foe.blink = blinkF(S.t, dt);
      me.pose(b1, f1); foe.pose(b2, f2);
    });
  },
};

/* ------------------------------------------------------------------ calls · the herd trumpets a little song; the young one repeats it.
   Each grown-up of the herd has its own note: tap them in the same order. */
Scenes.calls = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 2), ROUNDS = p.rounds || 4, LEN = [2, 3, 3, 4, 4, 5];
    const GY = G.floor(628, 40);
    G.lowerBg(G.bgImg(p.bg || 'bg_valley'));
    shades(sc, 0.5, 0);
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: ['music', `0 / ${ROUNDS}`] });
    GL.attach(sc);
    const d = MAN.auto[sp.id];
    // the herd: three grown-ups facing the young one, the farthest a little smaller and higher up
    const NOTES = [196, 262, 330], COL = ['#F2B640', '#7FD38A', '#7FC4FF'];
    const HERD = [{ x: 560, y: GY - 30, w: 380 }, { x: 850, y: GY - 4, w: 420 }, { x: 1135, y: GY - 36, w: 370 }];
    const herd = HERD.map((h, i) => {
      const k = fitK(sp.id, h.w, 240);
      const it = GL.makeAuto(sp.id, { x: h.x, y: h.y, s: k, z: i === 1 ? 3 : 2, flip: true, young: false });
      // the glow over the crest when it calls
      const glow = G.h('div', 'abs', sc, { width: 120, height: 120, marginLeft: '-60px', marginTop: '-60px', borderRadius: '50%', pointerEvents: 'none', opacity: 0,
        background: `radial-gradient(circle, ${COL[i]}cc 0%, ${COL[i]}55 35%, rgba(0,0,0,0) 70%)`, transition: 'opacity .15s' });
      const hb = G.h('div', 'abs', sc, { left: h.x - h.w * 0.45, top: h.y - 250, width: h.w * 0.9, height: 260, cursor: 'pointer' });
      return { i, it, glow, hb, k, x: h.x, y: h.y, acts: [], call: 0, blink: blinker() };
    });
    const W = walker({ x: 180, y: GY + 12, z: 4 }, [190, 110]), kid = W.it;
    const S = { t: 0, round: 0, seq: [], pos: 0, mode: 'wait', miss: 0, done: false, acts: [], kidCall: 0 };
    const blink = blinker();
    G.dbg = { S, herd, kid };
    // the call through the crest: a low brassy note, a little glide up, a slow vibrato
    const honk = (f, dur, vol) => {
      if (!AU.ctx || !G.state.settings.sfx) return;
      try {
        const c = AU.ctx, t = c.currentTime, out = c.createGain();
        out.gain.setValueAtTime(0.0001, t); out.gain.exponentialRampToValueAtTime(vol || 0.22, t + 0.06);
        out.gain.setValueAtTime(vol || 0.22, t + dur - 0.15); out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        const flt = c.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.setValueAtTime(f * 3.2, t); flt.Q.value = 2.2;
        flt.connect(out); out.connect(AU.out);
        const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 5.2; lg.gain.value = f * 0.012; lfo.connect(lg);
        for (const [m, v, ty] of [[1, 0.6, 'sawtooth'], [2, 0.18, 'square'], [0.5, 0.3, 'triangle']]) {
          const o = c.createOscillator(), g = c.createGain(); o.type = ty;
          o.frequency.setValueAtTime(f * m * 0.94, t); o.frequency.exponentialRampToValueAtTime(f * m, t + 0.12);
          lg.connect(o.frequency); g.gain.value = v; o.connect(g); g.connect(flt); o.start(t); o.stop(t + dur + 0.05);
        }
        lfo.start(t); lfo.stop(t + dur + 0.05);
      } catch (e) { /* audio glitch */ }
    };
    const callOf = (m, dur) => { m.call = dur; m.acts.push({ type: 'look', t0: S.t, dur }); honk(NOTES[m.i], dur); };
    const play = async () => {
      S.mode = 'listen'; S.pos = 0;
      await G.wait(0.7);
      for (const i of S.seq) {
        if (!G.alive(tok)) return;
        callOf(herd[i], 0.62);
        await G.wait(0.95);
      }
      if (!G.alive(tok)) return;
      S.mode = 'answer';
      if (S.round === 0 && !S.handShown) { S.handShown = true; S.hand = UI.hand(G.ui, herd[S.seq[0]].x, herd[S.seq[0]].y - 140, 'tap'); }
    };
    const newRound = () => {
      const n = LEN[Math.min(LEN.length - 1, S.round)], seq = [];
      while (seq.length < n) { const k = Math.floor(G.rand(0, 3)); if (seq.length && seq[seq.length - 1] === k && G.rand(0, 1) < 0.7) continue; seq.push(k); }
      S.seq = seq;
      play();
    };
    const tap = async (m) => {
      if (S.done || S.mode !== 'answer') return;
      if (S.hand) { S.hand.remove(); S.hand = null; }
      // the young one answers with the same note, the grown-up nods
      S.kidCall = 0.5; S.acts.push({ type: 'look', t0: S.t, dur: 0.5 }); honk(NOTES[m.i] * 1.5, 0.45, 0.18);
      m.glow.style.opacity = 0.9; setTimeout(() => { m.glow.style.opacity = 0; }, 260);
      m.acts.push({ type: 'eat', t0: S.t, dur: 0.4 });
      if (m.i !== S.seq[S.pos]) {
        S.miss++; S.mode = 'wait'; AU.play('miss');
        G.say(AU.alt('Ой, не так! Послушай песню ещё раз.', 'Послушай ещё раз.'));
        await G.wait(1.4); if (!G.alive(tok) || S.done) return;
        play(); return;
      }
      S.pos++;
      if (S.pos >= S.seq.length) {
        S.mode = 'wait'; S.round++; top.counter.set(`${S.round} / ${ROUNDS}`);
        AU.play('found'); G.fx.sparkle(W.it.x + 60, GY - 160, 14);
        if (S.round === 1) G.say('Правильно! Стадо слышит тебя.');
        if (S.round >= ROUNDS) return finish();
        await G.wait(1.3); if (!G.alive(tok) || S.done) return;
        newRound();
      }
    };
    for (const m of herd) G.on(m.hb, 'pointerdown', (e) => { e.stopPropagation(); AU.unlock(); tap(m); });
    const finish = async () => {
      S.done = true;
      // the whole herd answers together
      for (const m of herd) { m.acts.push({ type: 'look', t0: S.t + 0.3, dur: 1.2 }); m.call = 1.2; }
      S.acts.push({ type: 'look', t0: S.t + 0.3, dur: 1.2 });
      setTimeout(() => NOTES.forEach((f) => honk(f, 1.1, 0.12)), 300);
      G.say('Молодец! Ты повторил песню стада. Паразауролофы перекликались трубными голосами.');
      await G.wait(2.6); if (!G.alive(tok)) return;
      const stars = S.miss === 0 ? 3 : S.miss <= 2 ? 2 : 1;
      chFinish(C.n, stars, { stat: `Песен: ${S.round} · ошибок: ${S.miss}` });
    };
    G.say(AU.alt('Стадо паразауролофов поёт песню! Послушай, кто трубит, и нажми на них в том же порядке.', 'Послушай песню стада и повтори её.'));
    G.wait(3.2).then(() => { if (G.alive(tok)) newRound(); });
    const CREST = [1150, 22];
    G.tick((dt) => {
      S.t += dt;
      for (const m of herd) {
        if (m.call > 0) m.call -= dt;
        const [b, f] = GL.autoGait(m.it, 'stand', 0, S.t + m.i * 1.7);
        const pa = Pose.auto(sp.id)(S.t, m.acts, []);
        b.head = (b.head || 0) + (pa.head || 0) * 1.4; b.neck = (b.neck || 0) + (pa.neck || 0) * 1.4;
        m.it.blink = m.blink(S.t, dt);
        m.it.pose(b, f);
        const q = m.it.track(CREST[0], CREST[1], b);
        m.glow.style.left = q[0] + 'px'; m.glow.style.top = q[1] + 'px';
        if (m.call > 0) m.glow.style.opacity = (0.6 + 0.4 * Math.sin(S.t * 18)).toFixed(2);
        else if (S.mode !== 'answer') m.glow.style.opacity = 0;
      }
      if (S.kidCall > 0) S.kidCall -= dt;
      const [kb, kf] = W.stand(S.t);
      const pk = Pose.auto(sp.id)(S.t, S.acts, []);
      kb.head = (kb.head || 0) + (pk.head || 0) * 1.4; kb.neck = (kb.neck || 0) + (pk.neck || 0) * 1.4;
      kid.blink = blink(S.t, dt);
      kid.pose(kb, kf);
    });
  },
};

/* ------------------------------------------------------------------ thermal · glide over the sea; under a cloud warm air rises:
   hold the finger there and the pteranodon climbs in circles, let go and it glides on to the next cloud */
Scenes.thermal = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 3), NT = p.thermals || 5, GAP = 640, V = 125, TOP = 120, LOW = 520;
    G.h('div', 'full', sc, { background: '#7fb8e6' });
    GL.attach(sc);
    const bg = scrollTiles(p.bg || 'bg_lagoon');
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: ['cloud', `0 / ${NT}`] });
    const track = uiTrack(sp.sil, 'home');
    const sky = G.h('div', 'abs', sc, { left: 0, top: 0, width: 1280, height: 720, pointerEvents: 'none' });
    const bird = flyer({ x: 330, y: 300, s: 0.24 });
    const DIST = GAP * (NT + 0.6);
    // the clouds and the warm air rising under them (world x)
    const therms = [];
    for (let i = 0; i < NT; i++) {
      const wx = 900 + i * GAP, w = 230;
      const col = G.h('div', 'abs', sky, { top: 150, width: w, height: 560, marginLeft: -w / 2 + 'px',
        background: 'linear-gradient(rgba(255,244,214,.26), rgba(255,244,214,.12) 55%, rgba(255,244,214,0))', borderRadius: '50% 50% 30% 30% / 8% 8% 4% 4%' });
      col.innerHTML = [0, 1, 2, 3, 4, 5].map((k) => `<svg class="abs" style="left:${40 + (k % 3) * 60}px;top:0;animation:thermrise 2.6s ${k * 0.43}s linear infinite" width="30" height="20" viewBox="0 0 30 20" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="3" stroke-linecap="round"><path d="M3 17 L15 5 L27 17"/></svg>`).join('');
      // a soft cumulus: blurred white puffs with a grey base, so it sits in the painted sky
      const puff = (l, t, w, h, c) => `<div class="abs" style="left:${l}px;top:${t}px;width:${w}px;height:${h}px;border-radius:50%;background:radial-gradient(ellipse at 50% 38%, ${c} 0%, ${c} 38%, rgba(255,255,255,0) 70%)"></div>`;
      const cl = G.h('div', 'abs', sky, { top: 46, width: 340, height: 150, marginLeft: '-170px', filter: 'blur(4px)', opacity: 0.95 },
        puff(10, 62, 320, 80, 'rgba(214,222,232,.95)') + puff(40, 30, 150, 110, '#fff') + puff(130, 6, 150, 130, '#fff') + puff(210, 40, 120, 95, 'rgba(250,252,255,.97)'));
      therms.push({ wx, w, col, cl, used: false });
    }
    const S = { t: 0, y: 300, vy: 0, scroll: 0, hold: false, circ: false, th: 0, cx: 330, used: 0, low: 0, done: false, flapT: 0, ph: 0, A: 0, acts: [], blinks: [], inT: -1, hinted: false };
    G.dbg = { S, bird, therms };
    const hit = G.h('div', 'hit', sc);
    G.on(hit, 'pointerdown', (e) => { AU.unlock(); S.hold = true; S.pid = e.pointerId; if (S.hand) { S.hand.remove(); S.hand = null; } });
    const up = (e) => { if (e.pointerId === S.pid) S.hold = false; };
    G.on(window, 'pointerup', up); G.on(window, 'pointercancel', up);
    G.say(AU.alt('Птеранодон парит над морем. Под облаком поднимается тёплый воздух. Долетишь до него — держи палец, и птеранодон поднимется кругами!',
      'Под облаком держи палец — птеранодон поднимется кругами.'));
    const win = async () => {
      S.done = true;
      G.say('Отлично! Птеранодон пролетел далеко-далеко, почти не махая крыльями.');
      await G.wait(2.2); if (!G.alive(tok)) return;
      const stars = S.low === 0 ? 3 : S.low <= 2 ? 2 : 1;
      chFinish(C.n, stars, { stat: `Тёплых потоков: ${S.used} · слишком низко: ${S.low}` });
    };
    G.tick((dt) => {
      S.t += dt;
      // which warm column the bird is in (the middle of its circles when it circles)
      const wxBird = S.scroll + 330;
      let inT = -1;
      therms.forEach((q, i) => { if (Math.abs(wxBird - q.wx) < q.w / 2) inT = i; });
      if (inT >= 0 && S.inT !== inT && !S.hinted && !S.done) { S.hinted = true; S.hand = UI.hand(G.ui, G.W / 2, G.H / 2 + 60, 'hold'); }
      S.inT = inT;
      const climb = !S.done && S.hold && inT >= 0 && S.y > TOP;
      if (climb) {
        if (!S.circ) { S.circ = true; S.th = 0; S.c0 = therms[inT].wx; }
        if (!therms[inT].used) { therms[inT].used = true; S.used++; top.counter.set(`${S.used} / ${NT}`); AU.play('ok'); }
        S.th += dt * 1.7;
        S.vy = G.lerp(S.vy, -85, Math.min(1, dt * 3));
      } else {
        if (S.circ) { S.circ = false; }
        const lift = inT >= 0 ? -24 : 0;
        S.vy = G.lerp(S.vy, (S.done ? 0 : 30) + lift, Math.min(1, dt * 2));
      }
      if (!S.done && S.hold && inT >= 0 && S.y <= TOP + 2) G.once('high', 'Высоко! Отпусти палец — и лети к следующему облаку.');
      if (!S.done && S.hold && inT < 0 && S.y > 200) G.once('nocloud', 'Тёплый воздух поднимается только под облаком. Лети к облаку!');
      S.y = G.clamp(S.y + S.vy * dt, TOP, 640);
      // too low over the water: a few strong flaps, and the next time hold the finger in the warm air
      if (!S.done && S.y > LOW && S.flapT <= 0) {
        S.low++; S.flapT = 0.9; S.vy = -260; AU.play('whoosh');
        G.once('low', 'Низко! Птеранодону пришлось махать крыльями. В тёплом воздухе держи палец — он поднимется кругами.');
      }
      if (S.flapT > 0) S.flapT -= dt;
      // forward over the sea, or circling in place in the warm air
      if (S.circ) {
        // the circles are centred on the warm column
        S.scroll = G.lerp(S.scroll, S.c0 - 330, Math.min(1, dt * 1.5));
        S.cx = 330 + 70 * Math.sin(S.th);
      } else {
        S.cx = G.lerp(S.cx, 330, Math.min(1, dt * 2));
        if (!S.done) S.scroll += V * dt;
      }
      bg(S.scroll * 0.5);
      // the clouds and the columns move with the world
      for (const q of therms) {
        const x = q.wx - S.scroll; q.col.style.left = x + 'px'; q.cl.style.left = x + 'px';
        q.col.style.opacity = q.used ? 0.55 : 1;
      }
      track(G.clamp(S.scroll / DIST, 0, 1));
      if (!S.done && S.scroll >= DIST) win();
      // the bird: wings spread in the glide, a few beats when it is too low, banking as it circles
      const flapping = S.flapT > 0;
      S.A = G.lerp(S.A, flapping ? 1 : 0, Math.min(1, dt * 8));
      S.ph += dt * 2 * Math.PI * (flapping ? 2.4 : 0.3);
      const ps = bird.flapPose(S.t, S.acts, S.blinks, S.A, S.ph);
      bird.mesh.deform(ps); bird.blink = ps.blink || 0;
      const dir = S.circ ? (Math.cos(S.th) >= 0 ? 1 : -1) : 1;
      bird.flip = dir < 0;
      bird.x = S.cx; bird.y = S.y + 6 * Math.sin(S.t * 1.3);
      bird.rot = S.circ ? 0.16 * Math.sin(S.th) * dir : G.clamp(S.vy * 0.0008, -0.18, 0.22);
    });
  },
};
