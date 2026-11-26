'use strict';
/* ==================================================================== the Cretaceous games:
   smell (a young tyrannosaur finds hidden prey by its smell) · duel (two triceratopses push with their horns) ·
   calls (a young parasaurolophus repeats the call of its herd) · thermal (a pteranodon soars on warm air under the clouds) ·
   brood · neck · claws · storm (the second and third waves) · mow (a nigersaurus crops low plants) · tracks (a young rapetosaurus
   follows the herd's tracks to the water) · termites (a patagonykus breaks rotten logs with its thumb claw) · wade (in the shallows:
   a pterodaustro sieves tiny crustaceans with its bristle jaws, an irritator snaps fish like a heron) */

/** words for the Cretaceous finds and foods */
Object.assign(ITEM, {
  it_mammal: { many: 'зверьков', one: 'зверёк', cnt: 'зверьков' }, it_palm: { many: 'сочные листья', cnt: 'листьев' },
  it_magnolia: { many: 'цветы магнолии', cnt: 'цветов' }, it_araucaria: { many: 'ветки араукарии', cnt: 'веток' },
  it_turtle: { many: 'черепах', cnt: 'черепах' }, it_belemnite: { many: 'белемнитов', cnt: 'белемнитов' },
  it_twig1: { many: 'свежие ветки', cnt: 'веток' }, it_twig2: { many: 'свежие ветки', cnt: 'веток' }, it_twig3: { many: 'свежие листья', cnt: 'веток' },
  it_shrub: { many: 'кустики', cnt: 'кустиков' }, it_berries: { many: 'ягоды', cnt: 'веточек с ягодами' }, it_rock: { many: 'камни', cnt: 'камней' },
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
    const W = walker({ x: 170, y: GY, z: 3 }, p.box || [300, 170]), dino = W.it, HX = Math.abs(W.HEAD[0]);
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
    G.say(p.intro ? AU.alt(p.intro[0], p.intro[1]) : AU.alt('Малыш тираннозавра чует добычу! Нажимай на кусты — он подойдёт и понюхает. Чем ближе зверёк, тем сильнее запах.',
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
      if (S.got === 1) G.say(p.first || 'Нашёл по запаху! Тираннозавр чуял добычу издалека.');
      if (S.got >= NEED) return finish();
      pick(); S.busy = false;
    };
    const finish = async () => {
      S.done = true; wisps.style.opacity = 0;
      AU.voiceOf(sp.id, { vol: 0.6 });
      G.say(p.win || 'Отличный нюх! Так тираннозавр находил добычу.');
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
    const MX = (GL.restPt(me, p.contact || d.mouth)[0] - me.ax) * K, GAP = p.gap === undefined ? 34 : p.gap;
    const CX0 = 640, GOAL = 190, LOSE = -170;
    const S = { t: 0, push: 0, v: 0, round: 0, won: 0, slips: 0, taps: 0, state: 'lock', st: 0, phM: 0, phF: 0, done: false, acts: [], facts: [], lunge: 0, first: true };
    const blink = blinker(), blinkF = blinker();
    G.dbg = { S, me, foe };
    const hit = G.h('div', 'hit', sc);
    const hand = UI.hand(G.ui, G.W / 2, G.H / 2, 'tap');
    G.say(p.intro ? AU.alt(p.intro[0], p.intro[1]) : AU.alt('Два молодых трицератопса сцепились рогами! Нажимай быстро-быстро — и толкай соперника назад!', 'Нажимай быстро-быстро — толкай соперника!'));
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
      G.say(p.win || 'Победа! Трицератопсы мерились силой рогами — как сейчас олени.');
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
    const NOTES = p.notes || [196, 262, 330], COL = ['#F2B640', '#7FD38A', '#7FC4FF'];
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
      G.say(p.win || 'Молодец! Ты повторил песню стада. Паразауролофы перекликались трубными голосами.');
      await G.wait(2.6); if (!G.alive(tok)) return;
      const stars = S.miss === 0 ? 3 : S.miss <= 2 ? 2 : 1;
      chFinish(C.n, stars, { stat: `Песен: ${S.round} · ошибок: ${S.miss}` });
    };
    G.say(AU.alt(p.intro || 'Стадо паразауролофов поёт песню! Послушай, кто трубит, и нажми на них в том же порядке.', 'Послушай песню стада и повтори её.'));
    G.wait(3.2).then(() => { if (G.alive(tok)) newRound(); });
    const CREST = p.crest || [1150, 22]; // the point of the sprite the call comes from (sp_parasaur: the end of the crest)
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
    // the words name the animal (the pteranodon over the sea, the quetzalcoatlus over the plain)
    const NM = sp.name, nm = NM.toLowerCase(), WH = p.where || 'над морем', DAT = p.dat || NM + 'у';
    G.say(AU.alt(`${NM} парит ${WH}. Под облаком поднимается тёплый воздух. Долетишь до него — держи палец, и ${nm} поднимется кругами!`,
      `Под облаком держи палец — ${nm} поднимется кругами.`));
    const win = async () => {
      S.done = true;
      G.say(`Отлично! ${NM} пролетел далеко-далеко, почти не махая крыльями.`);
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
        G.once('low', `Низко! ${DAT} пришлось махать крыльями. В тёплом воздухе держи палец — он поднимется кругами.`);
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

/* ------------------------------------------------------------------ brood · an oviraptor sits on its ring of eggs (seen from the front).
   A cold wind blows now from the left, now from the right: tap that side and the parent spreads its feathered arm over the eggs.
   Eggs left open get cold (frost); a wing held over them warms them again. The art: tools/brood_build.py -> img/atl_brood.webp */
const BROOD = {
  // sheet pixels of the pieces (art/cre/brood_ovi.png, 1536 x 864): [x, y, w, h]; the parent sits DY lower, in its nest
  P: { bd_nest: [302, 580, 933, 263], bd_body: [583, 8, 371, 508], bd_nestF: [471, 709, 595, 134], bd_armL: [127, 177, 579, 295], bd_armR: [831, 177, 579, 295] },
  DY: 195, SH: { L: [695, 270], R: [841, 270] }, EGGS: { L: [500, 712], R: [1036, 712] },
};
Scenes.brood = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 4), NEED = p.need || 6;
    const GY = G.floor(694, 26), K = 0.7, OX = 640 - 768 * K, OY = GY - 843 * K;
    G.lowerBg(G.bgImg(p.bg || 'bg_run'));
    shades(sc, 0.45, 0);
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: ['egg', `0 / ${NEED}`] });
    const meter = uiMeter('feather', 'Тепло');
    const box = G.h('div', 'abs', sc, { left: OX, top: OY, width: 1536 * K, height: 900 * K, pointerEvents: 'none' });
    const piece = (k, dy) => { const q = BROOD.P[k]; return G.spr(k, box, q[0] * K, (q[1] + (dy || 0)) * K, q[2] * K, q[3] * K); };
    const shadow = G.h('div', 'abs', box, { left: 330 * K, top: 640 * K, width: 880 * K, height: 230 * K, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(40,20,8,.45), rgba(40,20,8,0))' });
    shadow.style.filter = 'blur(6px)';
    piece('bd_nest');
    // frost on the eggs of each side: grows when the wind gets to them, melts under a wing
    const frost = {};
    for (const s of ['L', 'R']) {
      const [ex, ey] = BROOD.EGGS[s];
      frost[s] = G.h('div', 'abs', box, { left: (ex - 150) * K, top: (ey - 85) * K, width: 300 * K, height: 170 * K, borderRadius: '50%', opacity: 0,
        background: 'radial-gradient(closest-side, rgba(225,242,255,.95), rgba(190,225,255,.6) 55%, rgba(190,225,255,0))', mixBlendMode: 'screen' });
    }
    const body = piece('bd_body', BROOD.DY);
    piece('bd_nestF');
    const arm = {};
    for (const s of ['L', 'R']) {
      const k = 'bd_arm' + s, q = BROOD.P[k], [sx, sy] = BROOD.SH[s];
      const el = piece(k, BROOD.DY);
      el.style.transformOrigin = `${(sx - q[0]) * K}px ${(sy - q[1]) * K}px`;
      el.style.transition = 'transform .28s cubic-bezier(.3,.7,.3,1)';
      arm[s] = el;
    }
    const FOLD = { L: 'rotate(-12deg) scaleX(.3)', R: 'rotate(12deg) scaleX(.3)' };
    const setArm = (s, open) => { arm[s].style.transform = open ? 'none' : FOLD[s]; };
    setArm('L', false); setArm('R', false);
    // the wind: a sign at the edge it comes from, then streaks and grains of sand and snow flying in
    const sign = {};
    for (const s of ['L', 'R']) {
      sign[s] = G.h('div', 'abs plate', sc, { left: s === 'L' ? 18 : 1180, top: GY - 270, width: 82, height: 82, borderRadius: '50%', opacity: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', '--pbg': 'rgba(20,40,60,.72)', transition: 'opacity .25s', pointerEvents: 'none' }, icon('wind', ' style="width:46px;height:46px;color:#CFE9FF"'));
      if (s === 'R') sign[s].firstChild.style.transform = 'scaleX(-1)';
    }
    const S = { t: 0, open: { L: 0, R: 0 }, warm: { L: 1, R: 1 }, gusts: [], next: 2.2, made: 0, blocked: 0, miss: 0, last: '', same: 0, done: false, first: true };
    G.dbg = { S, arm };
    const hit = G.h('div', 'hit', sc);
    const hand = UI.hand(G.ui, 160, GY - 220, 'tap'); hand.style.display = 'none';
    G.say(AU.alt('Овираптор высиживает яйца, а по пустыне дует холодный ветер. Смотри, откуда он дует, и нажимай на эту сторону — овираптор укроет яйца крылом!',
      'Смотри, откуда дует ветер, и нажимай на эту сторону — укрой яйца крылом!'));
    G.on(hit, 'pointerdown', (e) => {
      AU.unlock();
      if (S.done) return;
      const s = G.bgPt(e).x < 640 ? 'L' : 'R';
      if (S.open[s] <= 0) AU.play('whoosh');
      S.open[s] = 2.6; setArm(s, true);
      hand.style.display = 'none';
    });
    // the edge x a gust starts from and the x where it meets the spread wing / the eggs
    const EDGE = { L: -60, R: 1340 }, WING = { L: OX + 150 * K, R: OX + 1390 * K }, EGG = { L: OX + BROOD.EGGS.L[0] * K, R: OX + BROOD.EGGS.R[0] * K };
    const EY = OY + BROOD.EGGS.L[1] * K;
    const gust = (s) => {
      const g = { s, t: 0, warn: 1.3, fly: 1.1, parts: [], done: false };
      sign[s].style.opacity = 1; sign[s].style.animation = 'pulse 0.6s ease-in-out infinite';
      if (S.first) { hand.style.left = (s === 'L' ? 300 : 980) + 'px'; hand.style.top = GY - 300 + 'px'; hand.style.display = ''; }
      for (let i = 0; i < 11; i++) {
        const w = G.rand(170, 260), el = G.h('div', 'abs', sc, { left: 0, top: 0, width: w, height: G.rand(5, 8), borderRadius: '4px', opacity: 0, pointerEvents: 'none',
          background: 'linear-gradient(90deg, rgba(235,245,255,0), rgba(240,248,255,.95) 60%, rgba(235,245,255,0))', boxShadow: '0 0 6px rgba(200,230,255,.6)' });
        g.parts.push({ el, w, y: EY - 230 + i * 26 + G.rand(-10, 10), d: G.rand(0, 0.35) });
      }
      S.gusts.push(g);
    };
    const arrive = (g) => {
      const s = g.s;
      if (S.open[s] > 0) {
        S.blocked++; top.counter.set(`${S.blocked} / ${NEED}`);
        AU.play('ok'); G.fx.sparkle(WING[s] + (s === 'L' ? 60 : -60), EY - 120, 12);
        UI.popText(sc, 'Укрыл!', s === 'L' ? 300 : 980, EY - 260, '#F2B640', 32);
        if (S.blocked === 1) G.say('Укрыл! Перья на руках не пускают холод к яйцам.');
        if (S.blocked >= NEED) finish();
      } else {
        S.miss++; S.warm[s] = Math.max(0, S.warm[s] - 0.45);
        AU.play('miss');
        for (let i = 0; i < 18; i++) G.fx.emit({ type: 'dot', x: EGG[s] + G.rand(-80, 80), y: EY + G.rand(-40, 30), vx: G.rand(-40, 40), vy: G.rand(-60, 10), g: 30, life: G.rand(0.6, 1.1), size: G.rand(3, 6), color: '#EAF6FF' });
        frost[s].animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 260, iterations: 2 });
        G.once('cold', 'Яйца замерзают! Нажимай на ту сторону, откуда дует ветер.');
      }
    };
    const finish = async () => {
      S.done = true;
      AU.voiceOf(sp.id, { vol: 0.5 });
      G.say('Яйца в тепле! Овирапторы высиживали свои яйца, как птицы.');
      for (const s of ['L', 'R']) { S.open[s] = 9; setArm(s, true); }
      await G.wait(2.6); if (!G.alive(tok)) return;
      const stars = S.miss <= 1 ? 3 : S.miss <= 3 ? 2 : 1;
      chFinish(C.n, stars, { stat: `Укрыто: ${S.blocked} · замёрзли: ${S.miss}` });
    };
    G.tick((dt) => {
      S.t += dt;
      // the arms: open for a little while after a tap, then folded again; under an open arm the eggs warm up
      for (const s of ['L', 'R']) {
        if (S.open[s] > 0) { S.open[s] -= dt; if (S.open[s] <= 0 && !S.done) setArm(s, false); S.warm[s] = Math.min(1, S.warm[s] + 0.22 * dt); }
        frost[s].style.opacity = (1 - S.warm[s]).toFixed(2);
      }
      meter(Math.min(S.warm.L, S.warm.R), Math.min(S.warm.L, S.warm.R) < 0.4);
      // the next gust: from a side, now and then from both (not the same side three times running)
      if (!S.done && S.made < NEED + 6) {
        S.next -= dt;
        if (S.next <= 0) {
          let s = G.rand(0, 1) < 0.5 ? 'L' : 'R';
          if (s === S.last && S.same >= 1) s = s === 'L' ? 'R' : 'L';
          S.same = s === S.last ? S.same + 1 : 0; S.last = s;
          gust(s); S.made++;
          if (S.blocked >= 3 && G.rand(0, 1) < 0.3) { gust(s === 'L' ? 'R' : 'L'); G.once('both', 'Ветер с двух сторон! Укрой обе стороны.'); }
          S.next = G.rand(2.6, 3.5) - Math.min(0.6, S.blocked * 0.08);
        }
      }
      for (const g of S.gusts) {
        if (g.done) continue;
        g.t += dt;
        const s = g.s, dir = s === 'L' ? 1 : -1;
        if (g.t > g.warn) {
          const u = (g.t - g.warn) / g.fly;
          for (const q of g.parts) {
            const v = G.clamp((u - q.d) / (1 - 0.35), 0, 1.2), x = EDGE[s] + (EGG[s] - EDGE[s]) * v;
            q.el.style.opacity = v <= 0 || v >= 1.15 ? 0 : (0.9 * Math.min(1, v * 4)).toFixed(2);
            q.el.style.transform = `translate(${x - q.w / 2}px, ${q.y + Math.sin(v * 7 + q.y) * 6}px)` + (dir < 0 ? ' scaleX(-1)' : '');
          }
          for (let n = 0; n < 2; n++) if (Math.random() < dt * 40) G.fx.emit({ type: 'dot', x: EDGE[s] + dir * G.rand(0, 160), y: EY - G.rand(-20, 230), vx: dir * G.rand(480, 700), vy: G.rand(-20, 30), life: 1.0, size: G.rand(3, 5), color: G.pick(['#F3E6CF', '#EAF6FF', '#FFFFFF']) });
          if (!g.hit && u >= 0.62) { g.hit = true; arrive(g); sign[s].style.opacity = 0; sign[s].style.animation = ''; if (S.first) { S.first = false; hand.style.display = 'none'; } }
          if (u >= 1.25) { g.done = true; for (const q of g.parts) q.el.remove(); }
        }
      }
      S.gusts = S.gusts.filter((g) => !g.done);
    });
  },
};

/* ------------------------------------------------------------------ neck · an elasmosaurus hunts a school of fish from below.
   The finger leads the head: the long neck bends towards it (a chain of joints along the painted neck, solved every frame).
   Fish take fright at the big body, not at the small head: keep the body back and reach out with the neck.
   Pulled further than the neck reaches, the body swims after the head. */
const NECK = {
  // the painted neck of each animal (sprite px): its base at the shoulders, the back of the head, the mouth; joints between
  elasmo: { base: [740, 221], head: [1372, 43], n: 8, lim: 13, limHead: 26, body: [420, 250] },
  // the plesiosaurus: a shorter neck, a little less bendy
  plesio: { base: [690, 112], head: [1305, 36], n: 8, lim: 9, limHead: 24, body: [420, 170] },
  // the tanystropheus: thirteen long stiff vertebrae — the neck hardly bends along its length, it swings at the shoulders
  tany: { base: [690, 88], head: [1390, 30], n: 8, lim: 1.6, limBase: 17, limHead: 20, body: [520, 95] },
};
Scenes.neck = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 2), NEED = p.need || 6, NK = NECK[sp.id] || NECK.elasmo;
    G.bgImg(p.bg || 'bg_sea');
    shades(sc, 0.4, 0.2);
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: ['fish', `0 / ${NEED}`] });
    GL.attach(sc);
    const id = sp.id, d = MAN.auto[id], b = d.box;
    // the joints along the neck and the head: rest positions, how far along the neck each one sits
    const B = NK.base, Hd = NK.head, L = Math.hypot(Hd[0] - B[0], Hd[1] - B[1]), ux = (Hd[0] - B[0]) / L, uy = (Hd[1] - B[1]) / L;
    const J = [];
    for (let j = 0; j <= NK.n; j++) J.push({ s: (L * j) / NK.n, c: [B[0] + ux * (L * j) / NK.n, B[1] + uy * (L * j) / NK.n], a: 0, goal: 0 });
    const U = (x, y) => (x - B[0]) * ux + (y - B[1]) * uy;
    const rig = GL.RIGS.auto(id);
    // distal joints first: each turns what lies beyond it about its own place, then the joints nearer the body turn that
    for (let j = NK.n; j >= 0; j--) {
      const q = J[j], ramp = j === 0 ? [-12, 46] : [-24, 24];
      rig.bones.push({ name: 'nk' + j, type: 'rot', c: q.c, w: (x, y) => G.smooth(q.s + ramp[0], q.s + ramp[1], U(x, y)) });
    }
    const K = Math.min(820 / (b[1] - b[0]), 300 / (b[3] - b[2]));
    const ax = (b[0] + b[1]) / 2, ay = (b[2] + b[3]) / 2;
    const it = GL.sprite('sp_' + id, rig, { ax, ay, s: K, x: 450, y: 500, z: 4 });
    const pf = Pose.auto(id), M = d.mouth;
    const toRest = (X, Y) => [(X - it.x) / it.s + ax, (Y - it.y) / it.s + ay];
    const rot = (p0, c, th) => { const cs = Math.cos(th), sn = Math.sin(th), dx = p0[0] - c[0], dy = p0[1] - c[1]; return [c[0] + cs * dx - sn * dy, c[1] + sn * dx + cs * dy]; };
    // forward kinematics in rest pixels: a point beyond joint k turns with every joint from k down to the base
    const fk = (pt, k) => { let q = pt; for (let j = k; j >= 0; j--) q = rot(q, J[j].c, J[j].a); return q; };
    const solve = (T) => {
      for (let it2 = 0; it2 < 3; it2++) for (let j = NK.n; j >= 0; j--) {
        const pj = fk(J[j].c, j - 1), e = fk(M, NK.n);
        let da = Math.atan2(T[1] - pj[1], T[0] - pj[0]) - Math.atan2(e[1] - pj[1], e[0] - pj[0]);
        while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
        const lim = ((j === NK.n ? NK.limHead : j === 0 && NK.limBase ? NK.limBase : NK.lim) * Math.PI) / 180;
        J[j].a = G.clamp(J[j].a + G.clamp(da, -0.2, 0.2), -lim, lim);
      }
    };
    // the school
    const fa = G.ATLAS.it_fish, FW = 66, FH = fa ? (FW * fa[4]) / fa[3] : 30;
    const S = { t: 0, got: 0, scares: 0, done: false, target: null, cx: 980, cy: 260, vx: -14, vy: 6, scared: 0, snap: 0, acts: [], blinks: [], wander: 0, near: false };
    const fish = [];
    const addFish = () => {
      const el = G.spr('it_fish', sc, 0, 0, FW, FH);
      el.style.transition = 'opacity .3s'; el.style.filter = 'drop-shadow(0 2px 3px rgba(0,20,40,.4))';
      const a = G.rand(0, 6.28), r = Math.sqrt(G.rand(0, 1));
      const f = { el, ox: Math.cos(a) * 150 * r, oy: Math.sin(a) * 80 * r, x: S.cx + G.rand(-60, 60), y: S.cy + G.rand(-40, 40), vx: 0, vy: 0, ph: G.rand(0, 6.28), face: -1, gone: false };
      fish.push(f);
    };
    for (let i = 0; i < 11; i++) addFish();
    G.dbg = { S, it, J, fish };
    const hit = G.h('div', 'hit', sc);
    const hand = UI.hand(G.ui, 900, 300, 'swipe');
    G.say(p.intro ? AU.alt(p.intro[0], p.intro[1]) : AU.alt('Эласмозавр подкрадывается к стае рыб. Веди пальцем — длинная шея потянется за ним. Не подплывай близко: большое тело пугает рыб!',
      'Веди пальцем — шея тянется к рыбе. Не подплывай близко!'));
    const setT = (e) => { const q = G.bgPt(e); S.target = [G.clamp(q.x, 40, 1240), G.clamp(q.y, 90, 670)]; };
    G.on(hit, 'pointerdown', (e) => { AU.unlock(); setT(e); hand.style.display = 'none'; S.drag = e.pointerId; });
    G.on(window, 'pointermove', (e) => { if (S.drag === e.pointerId) setT(e); });
    G.on(window, 'pointerup', (e) => { if (S.drag === e.pointerId) S.drag = null; });
    const scatter = (bx, by) => {
      S.scared = 1.4; S.scares++;
      AU.play('alert');
      for (const f of fish) { const dx = f.x - bx, dy = f.y - by, dl = Math.hypot(dx, dy) || 1; f.vx = (dx / dl) * 420; f.vy = (dy / dl) * 300; }
      // the school gathers again farther away from the big body
      S.cx = G.clamp(bx + (S.cx > bx ? 520 : -520), 560, 1150); S.cy = G.clamp(G.rand(160, 420), 150, 460);
      G.once('scared', 'Рыбы испугались большого тела! Держись подальше и тянись к ним шеей.');
    };
    const finish = async () => {
      S.done = true;
      AU.voiceOf(sp.id, { vol: 0.6 });
      G.say(p.win || 'Отличная охота! Длинная шея помогала ловить рыбу, пока большое тело оставалось в стороне.');
      await G.wait(2.8); if (!G.alive(tok)) return;
      const stars = S.scares <= 1 ? 3 : S.scares <= 3 ? 2 : 1;
      chFinish(C.n, stars, { stat: `Поймано: ${S.got} · рыбы пугались: ${S.scares}` });
    };
    G.tick((dt) => {
      S.t += dt;
      if (S.scared > 0) S.scared -= dt;
      // the head follows the finger; out of reach the body swims after it (slowly)
      const base = it.toDesign(B[0], B[1]), reach = (L + Math.hypot(M[0] - Hd[0], M[1] - Hd[1])) * it.s;
      let speed = 0;
      if (S.target && !S.done) {
        const dx = S.target[0] - base[0], dy = S.target[1] - base[1], dl = Math.hypot(dx, dy);
        if (dl > reach * 0.9) {
          const mv = Math.min(dl - reach * 0.9, 130 * dt);
          it.x = G.clamp(it.x + (dx / dl) * mv, G.vis.x0 + 400, 780); it.y = G.clamp(it.y + (dy / dl) * mv * 0.7, 380, 620); speed = mv / dt / 130;
        }
        solve(toRest(S.target[0], S.target[1]));
      } else {
        // at rest the neck sways a little
        for (let j = 0; j <= NK.n; j++) J[j].a = G.lerp(J[j].a, 0.03 * Math.sin(S.t * 0.9 + j * 0.5), Math.min(1, dt * 1.5));
      }
      // the bite: the head nods forward
      if (S.snap > 0) S.snap -= dt;
      const pose = pf(S.t, S.acts, S.blinks, { speed: 0.3 + speed, swim: true });
      pose.head = 0;
      for (let j = 0; j <= NK.n; j++) pose['nk' + j] = ((J[j].a + (j === NK.n && S.snap > 0 ? 0.35 * Math.sin((S.snap / 0.25) * Math.PI) : 0)) * 180) / Math.PI;
      it.mesh.deform(pose); it.blink = pose.blink || 0;
      const mouth = it.track(M[0], M[1], pose), bodyP = it.toDesign(NK.body[0], NK.body[1]);
      // the school drifts; the fish keep near their places in it
      S.wander += dt;
      if (S.wander > 3) { S.wander = 0; S.vx = G.rand(-30, 30); S.vy = G.rand(-16, 16); }
      S.cx = G.clamp(S.cx + S.vx * dt, 600, 1160); S.cy = G.clamp(S.cy + S.vy * dt, 140, 470);
      const dB = Math.hypot(S.cx - bodyP[0], S.cy - bodyP[1]);
      if (!S.done && S.scared <= 0 && dB < 360) scatter(bodyP[0], bodyP[1]);
      for (const f of fish) {
        if (f.gone) continue;
        f.ph += dt * 6;
        const tx = S.cx + f.ox + Math.sin(f.ph * 0.3) * 14, ty = S.cy + f.oy + Math.cos(f.ph * 0.23) * 10;
        if (S.scared > 0.5) { f.vx *= Math.exp(-1.2 * dt); f.vy *= Math.exp(-1.2 * dt); }
        else { f.vx += ((tx - f.x) * 2.2 - f.vx * 1.6) * dt; f.vy += ((ty - f.y) * 2.2 - f.vy * 1.6) * dt; }
        f.x += f.vx * dt; f.y += f.vy * dt;
        if (Math.abs(f.vx) > 12) f.face = f.vx > 0 ? 1 : -1;
        f.el.style.transform = `translate(${f.x - FW / 2}px, ${f.y - FH / 2 + Math.sin(f.ph) * 2}px)` + (f.face < 0 ? ' scaleX(-1)' : '');
        // caught
        if (!S.done && Math.hypot(f.x - mouth[0], f.y - mouth[1]) < 44) {
          f.gone = true; S.got++; S.snap = 0.25; top.counter.set(`${S.got} / ${NEED}`);
          AU.play('snap'); G.fx.sparkle(mouth[0], mouth[1], 10);
          f.el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: 'forwards' });
          setTimeout(() => f.el.remove(), 260);
          if (S.got === 1) G.say('Есть! Тело далеко, а голова уже у рыбы.');
          if (S.got >= NEED) finish();
          else if (fish.filter((q) => !q.gone).length < 7) addFish();
        }
      }
      // bubbles now and then from the mouth
      if (Math.random() < dt * 1.2) G.fx.emit({ type: 'dot', x: mouth[0], y: mouth[1] - 6, vx: G.rand(-8, 8), vy: -G.rand(40, 70), life: 1.6, size: G.rand(3, 6), color: 'rgba(225,245,255,.85)' });
    });
  },
};

/* ------------------------------------------------------------------ claws · a young therizinosaur pulls high branches down with its long claws.
   Tap a branch: the dinosaur walks under it, rears up and hooks the bough with its claws. Then pull down — slowly: a bough pulled
   too fast snaps. Pulled all the way, the leaves come to the mouth and are eaten. The arms turn about the shoulder (the claws bone of
   js/auto.js makeWhole); the twigs are the items it_twig1..3 hanging on boughs drawn as lines from the canopy. */
const CLAW = {
  TIP: [560, 330],                                                         // sprite px of the therizinosaur: the hook point between the claws
  STEM: { it_twig1: [4, 147], it_twig2: [4, 119], it_twig3: [4, 129] },     // where each twig was broken off (picture px)
  UP: { claws: -70, pitch: -14, leg0: 14, leg1: 14, neck: -12, head: -2 },  // reared up, the arms high (not over the head)
  DOWN: { claws: -16, pitch: 3, leg0: -3, leg1: -3, neck: 8, head: 16 },    // the bough pulled down to the mouth
};
Scenes.claws = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 2), NEED = p.need || 5;
    const GY = G.floor(676, 22), TW = 210, VMAX = 900;
    G.lowerBg(G.bgImg(p.bg || 'bg_forest'));
    shades(sc, 0.45, 0);
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: ['leaf', `0 / ${NEED}`] });
    const meter = uiMeter('zap', 'Ветка'); meter(0);
    // the twigs under the lines of their boughs, both under the animal (the GL canvas comes next)
    const layer = G.h('div', 'abs', sc, { left: 0, top: 0, width: 1280, height: 720, pointerEvents: 'none' });
    const twigL = G.h('div', 'abs', layer, { left: 0, top: 0, width: 0, height: 0 });
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '1280'); svg.setAttribute('height', '720');
    Object.assign(svg.style, { position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: 'drop-shadow(0 3px 3px rgba(0,0,0,.35))' });
    layer.appendChild(svg);
    GL.attach(sc);
    const W = walker({ x: 300, y: GY, z: 3 }, [440, 300]), dino = W.it, blink = blinker();
    const d = MAN.auto[sp.id], MOUTH = d.mouth;
    // design position of a sprite point under a pose: the bones, then the tilt of the whole body about the hips
    const at = (pt, pose) => {
      const q = Object.assign({}, pose, { pivot: dino.pivot });
      let [x, y] = dino.mesh.point(pt[0], pt[1], q);
      const a = (q.pitch || 0) * DEG, c = Math.cos(a), s = Math.sin(a), dx = x - q.pivot[0], dy = y - q.pivot[1];
      x = q.pivot[0] + c * dx - s * dy; y = q.pivot[1] + s * dx + c * dy;
      return dino.toDesign(x, y);
    };
    const off = (pt, pose) => { const q = at(pt, pose); return [q[0] - dino.x, q[1] - dino.y]; };
    const TIP0 = off(CLAW.TIP, CLAW.UP), TIP1 = off(CLAW.TIP, CLAW.DOWN), M1 = off(MOUTH, CLAW.DOWN);
    const YH = GY + TIP0[1], PULL = Math.max(150, TIP1[1] - TIP0[1]);
    // the twig points from the hook to the mouth when the bough is down
    const PHI1 = Math.atan2(M1[1] - TIP1[1], M1[0] - TIP1[0]);
    const mix = (u) => { const o = {}; for (const k of Object.keys(CLAW.UP)) o[k] = G.lerp(CLAW.UP[k], CLAW.DOWN[k], u); return o; };
    const scaleP = (P, e) => { const o = {}; for (const k of Object.keys(P)) o[k] = P[k] * e; return o; };
    // the boughs: one in each of three places, a new one grows where one was eaten or broke
    const XS = [640, 850, 1060].map((x) => G.clamp(x, 180 + TIP0[0], 1120 + TIP0[0]));
    const rings = G.h('div', 'abs', sc, { left: 0, top: 0, width: 0, height: 0 });
    const S = { t: 0, mode: 'free', x: 300, tx: 300, dir: 1, walkPh: 0, mt: 0, got: 0, snaps: 0, u: 0, ut: 0, v: 0, tension: 0, drag: null,
      br: [], target: null, P: null, from: null, done: false, first: true, pulled: false };
    const NS = 'http://www.w3.org/2000/svg';
    const grow = (slot) => {
      const key = ['it_twig1', 'it_twig2', 'it_twig3'][(slot + S.got + S.snaps) % 3], m = MAN[key], k = TW / m.w;
      const xs = XS[slot], el = G.spr(key, twigL, 0, 0, TW, m.h * k);
      el.style.transformOrigin = `${CLAW.STEM[key][0] * k}px ${CLAW.STEM[key][1] * k}px`;
      el.style.filter = 'drop-shadow(0 4px 4px rgba(0,0,0,.35))';
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('fill', 'none'); path.setAttribute('stroke', '#4a3420'); path.setAttribute('stroke-width', '10'); path.setAttribute('stroke-linecap', 'round');
      const lit = document.createElementNS(NS, 'path');
      lit.setAttribute('fill', 'none'); lit.setAttribute('stroke', '#8a6a46'); lit.setAttribute('stroke-width', '3.5'); lit.setAttribute('stroke-linecap', 'round');
      lit.style.transform = 'translate(-1.5px,-2px)';
      svg.appendChild(path); svg.appendChild(lit);
      const ring = G.h('div', 'abs pe', rings, { left: 0, top: 0, width: 120, height: 120, borderRadius: '50%', cursor: 'pointer',
        border: '4px dashed rgba(120,230,120,.95)', boxShadow: '0 0 14px rgba(140,255,140,.55)', opacity: 0, transition: 'opacity .3s' });
      const q = { slot, key, el, path, lit, ring, H: [xs, YH], B: [xs - 170 + G.rand(-20, 20), G.vis.y0 - 30], phi0: G.rand(-1.25, -0.95), phi: 0, sx: CLAW.STEM[key][0] * k,
        sy: CLAW.STEM[key][1] * k, lc: 0.54 * TW, state: 'idle', sw: G.rand(0, 6), a: 0, fade: 1 };
      q.phi = q.phi0;
      ring.addEventListener('pointerdown', (e) => { e.stopPropagation(); AU.unlock(); choose(q); });
      S.br[slot] = q;
      G.tween(0.6, (e) => { q.a = e; }, G.ease.out);
      return q;
    };
    const drop = (q) => { q.el.remove(); q.path.remove(); q.lit.remove(); q.ring.remove(); if (S.br[q.slot] === q) S.br[q.slot] = null; };
    const draw = (q) => {
      if (q.state === 'broken' || q.state === 'eaten') return;   // those animate on their own
      const [hx, hy] = q.H, ph = q.phi + (q.state === 'idle' ? 0.05 * Math.sin(S.t * 1.3 + q.sw) : 0), lift = (1 - q.a) * -260;
      q.el.style.transform = `translate(${hx - q.sx}px, ${hy - q.sy + lift}px) rotate(${ph}rad)`;
      q.el.style.opacity = q.a * q.fade;
      const [bx, by] = q.B, cx = bx + 0.3 * (hx - bx), cy = hy + 12 + lift;
      const dd = `M${bx.toFixed(1)} ${by.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${hx.toFixed(1)} ${(hy + lift).toFixed(1)}`;
      q.path.setAttribute('d', dd); q.lit.setAttribute('d', dd);
      q.path.style.opacity = q.a; q.lit.style.opacity = q.a;
      const lx = hx + Math.cos(ph) * q.lc, ly = hy + Math.sin(ph) * q.lc + lift;
      q.ring.style.left = lx - 60 + 'px'; q.ring.style.top = ly - 60 + 'px';
      const can = q.state === 'idle' && S.mode === 'free' && !S.done;
      q.ring.style.opacity = can ? q.a : 0; q.ring.style.pointerEvents = can ? 'auto' : 'none';
    };
    G.dbg = { S, dino, TIP0, TIP1, M1, YH, PULL, XS };
    const hand = UI.hand(G.ui, XS[0], YH - 140, 'tap');
    const hint = (kind, x, y) => { hand.className = 'hand ' + kind; hand.style.left = x + 'px'; hand.style.top = y + 'px'; hand.style.display = ''; };
    G.say(AU.alt('Вкусные листья растут высоко! Нажми на ветку — теризинозавр потянется вверх и зацепит её когтями.',
      'Нажми на ветку — теризинозавр зацепит её когтями.'));
    const choose = (q) => {
      if (S.done || S.mode !== 'free' || q.state !== 'idle') return;
      hand.style.display = 'none';
      q.state = 'chosen'; S.target = q;
      S.tx = q.H[0] - TIP0[0]; S.dir = Math.sign(S.tx - S.x) || 1; S.mode = Math.abs(S.tx - S.x) > 4 ? 'walk' : 'rear'; S.mt = 0;
    };
    const backToFree = (P) => {
      S.mode = 'back'; S.mt = 0; S.from = P;
      meter(0);
    };
    const snap = (q) => {
      q.state = 'broken'; S.snaps++; AU.play('crack'); meter(1, true);
      G.say(S.snaps === 1 ? 'Ой, ветка сломалась! Тяни медленнее — плавно-плавно.' : AU.alt('Сломалась! Медленнее.', 'Тяни медленнее.'));
      const [hx, hy] = q.H, B = q.B, ph0 = q.phi;
      let vy = -120, y = 0, r = 0;
      G.tween(1.2, (e, rr) => {
        vy += 1400 / 60; y += vy / 60; r += 0.04;
        q.el.style.transform = `translate(${hx - q.sx}px, ${hy - q.sy + y}px) rotate(${ph0 + r}rad)`;
        q.el.style.opacity = 1 - e;
        // the broken bough springs back up to the canopy
        const k = 1 - G.ease.out(Math.min(1, e * 2));
        q.path.setAttribute('d', `M${B[0]} ${B[1]} L${(B[0] + (hx - B[0]) * k).toFixed(1)} ${(B[1] + (hy - B[1]) * k).toFixed(1)}`); q.lit.setAttribute('d', q.path.getAttribute('d'));
      }, G.ease.lin).then(() => { drop(q); G.wait(1.0).then(() => { if (G.alive(tok) && !S.done && !S.br[q.slot]) grow(q.slot); }); });
      G.fx.dust(hx, hy, 8, 'rgba(120,170,90,');
      backToFree(mix(S.u));
    };
    const eat = async (q) => {
      S.mode = 'eat'; S.mt = 0; meter(0);
      for (let i = 0; i < 3; i++) {
        await G.wait(0.42); if (!G.alive(tok)) return;
        AU.play('pop'); q.fade = 1 - (i + 1) / 3.4;
        const m = at(MOUTH, mix(1)); G.fx.sparkle(m[0] + 20, m[1], 6);
      }
      q.state = 'eaten'; S.got++; top.counter.set(`${S.got} / ${NEED}`);
      if (S.got === 1) G.say('Ам! Длинные когти притянули ветку прямо ко рту.');
      const [hx, hy] = q.H, B = q.B;
      G.tween(0.6, (e) => {
        q.el.style.opacity = 0.12 * (1 - e);
        q.path.setAttribute('d', `M${B[0]} ${B[1]} L${(hx + (B[0] - hx) * e).toFixed(1)} ${(hy + (B[1] - hy) * e).toFixed(1)}`); q.lit.setAttribute('d', q.path.getAttribute('d'));
        q.path.style.opacity = 1 - e; q.lit.style.opacity = 1 - e;
      }).then(() => { drop(q); G.wait(1.2).then(() => { if (G.alive(tok) && !S.done && !S.br[q.slot]) grow(q.slot); }); });
      if (S.got >= NEED) { finish(); return; }
      backToFree(mix(1));
    };
    const finish = async () => {
      S.done = true; S.mode = 'back'; S.mt = 0; S.from = mix(1);
      AU.play('ok');
      G.say('Наелся! Наверное, так теризинозавр и доставал высокие ветки — длинными когтями.');
      await G.wait(2.6); if (!G.alive(tok)) return;
      const stars = S.snaps === 0 ? 3 : S.snaps <= 2 ? 2 : 1;
      chFinish(C.n, stars, { stat: `Веток: ${S.got} из ${NEED} · сломалось: ${S.snaps}` });
    };
    // pulling: anywhere on the screen, once a bough is hooked
    const hit = G.h('div', 'hit', sc);
    rings.parentNode.appendChild(rings);
    G.on(hit, 'pointerdown', (e) => {
      AU.unlock();
      if (S.mode !== 'hold') return;
      const q = G.bgPt(e); S.drag = { pid: e.pointerId, y0: q.y, u0: S.ut };
      hand.style.display = 'none';
    });
    G.on(window, 'pointermove', (e) => {
      const g = S.drag; if (!g || e.pointerId !== g.pid || S.mode !== 'hold') return;
      S.ut = G.clamp(g.u0 + (G.bgPt(e).y - g.y0) / PULL, S.ut - 0.02, 1);   // a bough pulled down stays down
    });
    const up = (e) => { if (S.drag && e.pointerId === S.drag.pid) S.drag = null; };
    G.on(window, 'pointerup', up); G.on(window, 'pointercancel', up);
    for (let i = 0; i < 3; i++) grow(i);
    G.tick((dt) => {
      S.t += dt; S.mt += dt;
      let body, feet;
      if (S.mode === 'walk') {
        const step = 175 * dt, left = S.tx - S.x;
        S.x += Math.sign(left) * Math.min(Math.abs(left), step); S.walkPh += (dt * 2 * Math.PI * 175) / W.stride;
        dino.flip = S.dir < 0;
        [body, feet] = W.walk(S.walkPh);
        if (Math.abs(S.tx - S.x) < 1) { S.x = S.tx; dino.flip = false; S.mode = 'rear'; S.mt = 0; }
      } else if (S.mode === 'rear') {
        const e = G.ease.inOut(G.clamp(S.mt / 0.8, 0, 1));
        [body, feet] = W.stand(S.t); Object.assign(body, scaleP(CLAW.UP, e));
        if (e >= 1) {
          const q = S.target; q.state = 'hooked'; S.u = 0; S.ut = 0; S.utPrev = 0; S.v = 0; S.tension = 0; S.mode = 'hold'; S.mt = 0;
          AU.play('click');
          if (S.first) {
            S.first = false;
            G.say('Зацепил! Теперь тяни вниз — медленно, чтобы ветка не сломалась.');
          }
          if (!S.pulled) hint('pull', q.H[0] + 40, q.H[1] + 30);
        }
      } else if (S.mode === 'hold' || S.mode === 'eat') {
        if (S.mode === 'hold') {
          S.u += (S.ut - S.u) * Math.min(1, dt * 9);
          // the strain grows with the speed of the finger and eases off when the pull stops
          const v = Math.abs(S.ut - (S.utPrev === undefined ? S.ut : S.utPrev)) * PULL / Math.max(dt, 1e-3);
          S.utPrev = S.ut;
          S.v += (v - S.v) * Math.min(1, dt * 10);
          S.tension = S.v / VMAX;
          meter(S.tension, S.tension > 0.6);
          if (S.u > 0.05) S.pulled = true;
          if (S.tension > 0.6) G.once('slow', 'Тише, тише — ветка трещит!');
          if (S.tension >= 1) { snap(S.target); }
          else if (S.u >= 0.97) { S.u = 1; eat(S.target); }
        }
        [body, feet] = W.stand(S.t); Object.assign(body, mix(S.u));
        if (S.mode === 'eat') body.head = (body.head || 0) + 5 * Math.max(0, Math.sin(S.mt * 15));
        const q = S.target;
        if (q && (q.state === 'hooked' || q.state === 'chosen')) {
          q.H = at(CLAW.TIP, body); q.phi = G.lerp(q.phi0, PHI1, S.u);
        }
      } else if (S.mode === 'back') {
        const e = G.ease.inOut(G.clamp(S.mt / 0.6, 0, 1));
        [body, feet] = W.stand(S.t); Object.assign(body, scaleP(S.from, 1 - e));
        if (e >= 1 && !S.done) S.mode = 'free';
      } else {
        [body, feet] = W.stand(S.t);
      }
      const eq = S.target;
      if (eq && eq.state === 'eaten') S.target = null;
      dino.x = S.x; dino.blink = blink(S.t, dt); dino.pose(body, feet);
      for (const q of S.br) if (q) draw(q);
    });
    G.onExit(() => { UI.narrBottom = 0; });
  },
};

/* ------------------------------------------------------------------ storm · young armoured and frilled dinosaurs walk through the Gobi to a rock.
   The group walks by itself. A sandstorm comes in gusts: a wall of dust shows at the right, then the wind blows. Hold the finger and the
   young huddle together, heads down, eyes shut; a young one left standing is blown back — tap it, and it runs back to the others.
   Young pinacosaurs were found together, buried by sand where they had huddled. The shelter is the rock it_rock. */
Scenes.storm = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 2), GY = 640, X = 830, DIST = p.dist || 2900, V = 95;
    const GUSTS = [520, 1180, 1840, 2440], WARN = 1.8, BLOW = 2.6;
    G.h('div', 'full', sc, { background: '#c9a06a' });
    GL.attach(sc);
    const bg = scrollTiles(p.bg || 'bg_run');
    // the rock comes in from the right near the end (on the GPU, between the dunes and the animals)
    const rm = MAN.it_rock, RW = 560, rock = GL.sprite('it_rock', null, { ax: rm.w / 2, ay: rm.h * 0.94, s: RW / rm.w, x: 2000, y: GY + 18, z: 1 });
    shades(sc, 0.4, 0);
    chHeader(C.n, C.name);
    UI.topRight();
    const track = uiTrack(sp.sil, 'home');
    const K = fitK(sp.id, 340, 190), d = MAN.auto[sp.id];
    const lead = GL.makeAuto(sp.id, { x: X, y: GY, s: K, z: 4 });
    // the others: two rows, the far one a little higher and smaller
    const SLOT = [[-245, -30, 0.8, 2], [-430, 8, 0.86, 3.5], [-625, -24, 0.78, 2]];
    const kids = SLOT.map(([dx, dy, k, z], i) => ({ i, dx, dy, it: GL.makeAuto(sp.id, { x: X + dx, y: GY + dy, s: K * k, z, young: true }),
      x: X + dx, ph: 1.3 + i * 1.7, lost: false, back: 0, blink: blinker() }));
    const blink = blinker();
    const STR = GL.autoStride(lead, 'walk') * K;
    // the storm: a dust wall at the right edge, a tint over everything, streaks of sand flying to the left
    const wall = G.h('div', 'abs', sc, { left: G.vis.x1 - 520, top: G.vis.y0, width: 1500, height: G.vis.y1 - G.vis.y0, opacity: 0, pointerEvents: 'none',
      background: 'linear-gradient(90deg, rgba(205,160,100,0), rgba(205,160,100,.8) 22%, rgba(190,140,85,.95) 50%, rgba(205,160,100,.8) 78%, rgba(205,160,100,0))' });
    const tint = G.h('div', 'full', sc, { background: 'rgba(196,146,88,.55)', opacity: 0, pointerEvents: 'none' });
    const streaks = [];
    for (let i = 0; i < 16; i++) {
      const w = G.rand(160, 300), el = G.h('div', 'abs', sc, { left: 0, top: 0, width: w, height: G.rand(3, 6), borderRadius: '3px', opacity: 0, pointerEvents: 'none',
        background: 'linear-gradient(90deg, rgba(255,235,200,0), rgba(255,236,205,.9) 50%, rgba(255,235,200,0))' });
      streaks.push({ el, w, y: G.rand(G.vis.y0 + 120, GY + 40), x: G.rand(0, 1400), v: G.rand(900, 1500) });
    }
    const sign = G.h('div', 'abs plate', sc, { left: G.vis.x1 - 120, top: 230, width: 82, height: 82, borderRadius: '50%', opacity: 0, pointerEvents: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center', '--pbg': 'rgba(60,35,10,.72)', transition: 'opacity .25s' },
      icon('wind', ' style="width:46px;height:46px;color:#FFE2B0;transform:scaleX(-1)"'));
    const hit = G.h('div', 'hit', sc);
    // a young one blown back answers a tap on it
    const call = G.h('div', 'abs pe', sc, { left: 0, top: 0, width: 190, height: 170, borderRadius: '50%', display: 'none', cursor: 'pointer',
      border: '4px dashed rgba(255,226,140,.95)', boxShadow: '0 0 16px rgba(255,214,120,.6)' });
    const hand = UI.hand(G.ui, G.W / 2, G.H - 170, 'hold'); hand.style.display = 'none';
    const S = { t: 0, d: 0, scroll: 0, ph: 'walk', pt: 0, g: 0, hold: false, huddle: 0, lost: null, lostN: 0, safe: 0, gustHit: false, done: false, first: true, walkPh: 0 };
    G.dbg = { S, kids, lead, rock, call };
    G.say(AU.alt('Надвигается песчаная буря! Малыши идут к скале. Когда подует ветер — держи палец на экране, и малыши прижмутся друг к другу.',
      'Когда подует ветер — держи палец на экране!'));
    G.on(hit, 'pointerdown', (e) => { AU.unlock(); S.hold = true; S.pid = e.pointerId; if (S.ph !== 'lost') hand.style.display = 'none'; });
    const up = (e) => { if (e.pointerId === S.pid) S.hold = false; };
    G.on(window, 'pointerup', up); G.on(window, 'pointercancel', up);
    G.on(call, 'pointerdown', (e) => {
      e.stopPropagation(); AU.unlock();
      const k = S.lost; if (!k || k.back) return;
      k.back = 1e-3; call.style.display = 'none'; hand.style.display = 'none';
      AU.baby(G.cur());
      G.say('Иди сюда, малыш! Теперь все вместе.');
    });
    const blowAway = () => {
      const k = kids.slice().reverse().find((q) => !q.lost); if (!k) return;
      k.lost = true; k.back = 0; k.from = k.x; k.to = Math.max(G.vis.x0 + 150, k.x - 280); k.t = 0;
      S.lost = k; S.lostN++;
      AU.play('whoosh'); AU.play('miss');
      G.say(AU.alt('Ой! Ветер унёс малыша. Нажми на него — позови обратно!', 'Нажми на малыша — позови его!'));
    };
    const finish = async () => {
      S.done = true; AU.play('ok');
      G.say('Ура! Все малыши в укрытии. Вместе переждать бурю легче.');
      await G.wait(2.8); if (!G.alive(tok)) return;
      const stars = S.lostN === 0 ? 3 : S.lostN === 1 ? 2 : 1;
      chFinish(C.n, stars, { stat: `Порывов ветра: ${GUSTS.length} · малыш потерялся: ${S.lostN}` });
    };
    const poseOf = (it, walking, ph, t, hud) => {
      let b, f;
      if (walking) [b, f] = GL.autoGait(it, 'walk', ph, 0);
      else [b, f] = GL.autoGait(it, 'stand', 0, t);
      if (hud > 0) { b.neck = (b.neck || 0) + 10 * hud; b.head = (b.head || 0) + 14 * hud; b.tail = (b.tail || 0) * (1 - hud); }
      it.pose(b, f);
    };
    G.tick((dt) => {
      S.t += dt; S.pt += dt;
      const blowing = S.ph === 'blow';
      // walking: only when nobody is lost, the wind is not blowing and the finger is up
      const walking = !S.done && !blowing && S.ph !== 'lost' && !S.hold && S.d < DIST;
      if (walking) { S.d += V * dt; S.scroll += V * dt; bg(S.scroll); S.walkPh += (dt * 2 * Math.PI * V) / STR; }
      track(G.clamp(S.d / DIST, 0, 1));
      S.huddle += ((S.hold || S.done ? 1 : 0) - S.huddle) * Math.min(1, dt * 7);
      // the gusts come at fixed points of the way
      if (S.ph === 'walk' && S.g < GUSTS.length && S.d >= GUSTS[S.g]) {
        S.ph = 'warn'; S.pt = 0; S.gustHit = false; AU.play('whoosh');
        sign.style.opacity = 1; sign.style.animation = 'pulse 0.6s ease-in-out infinite';
        if (S.first) { hand.className = 'hand hold'; hand.style.left = G.W / 2 + 'px'; hand.style.top = G.H - 190 + 'px'; hand.style.display = ''; }
        G.once('warn', 'Смотри: идёт стена песка! Держи палец на экране!');
      } else if (S.ph === 'warn' && S.pt >= WARN) {
        S.ph = 'blow'; S.pt = 0; AU.play('whoosh');
      } else if (S.ph === 'blow') {
        if (!S.gustHit && S.pt > 0.45) {
          S.gustHit = true;
          if (S.hold) { S.safe++; UI.popText(sc, 'Укрылись!', X - 160, GY - 230, '#F2B640', 34); AU.play('ok'); if (S.first) G.say('Молодцы! Прижались друг к другу — и ветер не страшен.'); }
          else blowAway();
          S.first = false;
        }
        if (S.pt >= BLOW) {
          S.g++; S.pt = 0; sign.style.opacity = 0; sign.style.animation = '';
          S.ph = S.lost ? 'lost' : 'walk';
          if (S.lost) { G.wait(1.4).then(() => { if (G.alive(tok) && S.lost && !S.lost.back) { hand.className = 'hand tap'; hand.style.display = ''; } }); }
        }
      }
      // the look of the storm
      const wallA = S.ph === 'warn' ? G.clamp(S.pt / WARN, 0, 1) * 0.85 : blowing ? 0.85 * (1 - G.clamp((S.pt - BLOW + 0.6) / 0.6, 0, 1)) : 0;
      wall.style.opacity = wallA.toFixed(2);
      wall.style.transform = `translateX(${blowing ? -Math.min(1, S.pt / 0.9) * 2600 : 0}px)`;
      const tintA = blowing ? Math.min(1, S.pt / 0.4) * (1 - G.clamp((S.pt - BLOW + 0.7) / 0.7, 0, 1)) : 0;
      tint.style.opacity = tintA.toFixed(2);
      for (const q of streaks) {
        q.x -= q.v * dt; if (q.x < G.vis.x0 - q.w) { q.x = G.vis.x1 + G.rand(0, 300); q.y = G.rand(G.vis.y0 + 120, GY + 40); }
        q.el.style.transform = `translate(${q.x.toFixed(0)}px, ${q.y.toFixed(0)}px)`; q.el.style.opacity = (tintA * 0.9).toFixed(2);
      }
      // the rock
      rock.x = X + 230 + (DIST - S.d);
      if (!S.done && S.d >= DIST && !S.lost) finish();
      // the leader and the young
      lead.blink = S.huddle > 0.5 && (blowing || S.done) ? 1 : blink(S.t, dt);
      poseOf(lead, walking, S.walkPh, S.t, S.huddle);
      for (const k of kids) {
        let w = walking, hud = S.huddle;
        if (k.lost) {
          hud = 0;
          if (!k.back) {
            // tumbling back with the wind, then standing alone, calling
            k.t += dt; const e = G.ease.out(G.clamp(k.t / 0.9, 0, 1));
            k.x = G.lerp(k.from, k.to, e); k.it.rot = Math.sin(e * Math.PI) * -0.25; w = false;
            if (k.t > 0.9 && S.ph === 'lost') { call.style.display = ''; call.style.left = k.x - 95 + 'px'; call.style.top = GY + k.dy - 140 + 'px'; hand.style.left = k.x + 'px'; hand.style.top = GY + k.dy - 100 + 'px'; }
          } else {
            // running back to its place
            k.back += dt; const goal = X + k.dx; w = true;
            k.x = Math.min(goal, k.x + 260 * dt); k.ph += (dt * 2 * Math.PI * 260) / STR; k.it.rot = 0;
            if (k.x >= goal) { k.lost = false; k.back = 0; S.lost = null; if (S.ph === 'lost') S.ph = 'walk'; }
          }
        } else if (w) k.ph += (dt * 2 * Math.PI * V) / STR;
        k.it.x = k.x; k.it.blink = hud > 0.5 && (blowing || S.done) ? 1 : k.blink(S.t, dt);
        poseOf(k.it, w, k.ph, S.t + k.i, hud);
      }
    });
  },
};

/* ------------------------------------------------------------------ mow · a young nigersaurus crops the low plants of the riverbank
   with its wide muzzle, the head down at the ground (Sereno: a «Mesozoic lawnmower»; there was no grass yet: ferns and horsetails).
   Hold the finger: it walks on and mows whatever comes under the muzzle. A lizard hides among the ferns now and then: let go,
   and it runs away; walking on over it only scares it off (a herbivore does not eat lizards) and costs a star. */
const MOWG = { V: 118, PL: ['it_fern', 'it_horsetail', 'it_shoots'], H: { it_fern: 82, it_horsetail: 104, it_shoots: 96 }, LIZ: [4, 10, 15] };
Scenes.mow = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 2), NEED = p.need || 16, GY = G.floor(640, 30), X = 470, PK = p.plantK || 1, DIP = p.dip || 0;
    G.h('div', 'full', sc, { background: '#b89a66' });
    GL.attach(sc);
    const bg = scrollTiles(p.bg || 'bg_valley'); bg(0);
    shades(sc, 0.4, 0);
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: ['leaf', `0 / ${NEED}`] });
    const K = fitK(sp.id, (p.box || [440, 210])[0], (p.box || [440, 210])[1]), d = MAN.auto[sp.id];
    const dino = GL.makeAuto(sp.id, { x: X, y: GY, s: K, z: 4 });
    const mth = GL.restPt(dino, d.mouth), MX = X + (mth[0] - dino.ax) * K;       // where the muzzle meets the ground
    const STR = GL.autoStride(dino, 'walk') * K, blink = blinker();
    // the strip of plants in front: world x (the screen x is wx − scroll); a lizard sits among them now and then
    const items = []; let wx = MX + 170;
    for (let i = 0, nP = 0; nP < NEED + 6; i++) {
      if (MOWG.LIZ.includes(i)) { items.push({ kind: 'liz', wx: wx + 30, st: 'sit', t: 0, still: 0 }); wx += 150; continue; }
      const key = MOWG.PL[Math.floor(G.rand(0, 3))], m = MAN[key], h = MOWG.H[key] * PK * G.rand(0.9, 1.1);
      const z = nP % 3 === 1 ? 3 : 5;      // most in front of the muzzle, some behind it
      items.push({ kind: 'plant', key, wx, h, it: GL.sprite(key, null, { ax: m.w / 2, ay: m.h * 0.96, s: h / m.h, x: -500, y: GY + 6 + (z === 3 ? -6 : 8), z, flip: Math.random() < 0.5 }), st: 'up', t: 0 });
      wx += G.rand(64, 118); nP++;
    }
    const S = { t: 0, scroll: 0, hold: false, walkPh: 0, got: 0, oops: 0, fled: 0, bite: 0, done: false, first: true };
    G.dbg = { S, dino, items, MX };
    const alert = G.h('div', 'abs', sc, { width: 52, height: 52, borderRadius: '50%', background: '#F2B640', color: '#2A1E05', font: '600 38px/52px Oswald,sans-serif',
      textAlign: 'center', boxShadow: '0 0 18px rgba(242,182,64,.7)', transform: 'scale(0)', transition: 'transform .25s cubic-bezier(.2,1.6,.4,1)', pointerEvents: 'none', zIndex: 3 }, '!');
    const red = () => { const r = G.h('div', 'full', G.ui, { background: 'radial-gradient(ellipse at 50% 50%,rgba(241,107,74,0) 40%,rgba(241,107,74,.45) 100%)', pointerEvents: 'none' }); G.tween(0.9, (e) => { r.style.opacity = 1 - e; }).then(() => r.remove()); };
    const hit = G.h('div', 'hit', sc);
    const hand = UI.hand(G.ui, G.W / 2, G.H - 170, 'hold');
    G.on(hit, 'pointerdown', (e) => { AU.unlock(); S.hold = true; S.pid = e.pointerId; hand.style.display = 'none'; });
    const up = (e) => { if (e.pointerId === S.pid) S.hold = false; };
    G.on(window, 'pointerup', up); G.on(window, 'pointercancel', up);
    G.say(p.intro ? AU.alt(p.intro[0], p.intro[1]) : AU.alt('Широкая морда — как газонокосилка: срезает низкие растения у самой земли! Держи палец на экране — малыш пойдёт вперёд и будет щипать папоротники и хвощи.',
      'Держи палец на экране — и щипли растения у самой земли!'));
    const lizards = items.filter((q) => q.kind === 'liz');
    for (const q of lizards) { q.c = critter('it_lizard', sc, 104); q.c.place(-400, GY + 6, -1); }
    const finish = async () => {
      S.done = true; S.hold = false; AU.play('ok'); AU.voiceOf(sp.id, { at: 0.2, vol: 0.55 });
      G.say(p.win || 'Наелся! Широкая морда срезала папоротники и хвощи у самой земли — как газонокосилка.');
      await G.wait(2.6); if (!G.alive(tok)) return;
      const stars = S.oops === 0 ? 3 : S.oops === 1 ? 2 : 1;
      chFinish(C.n, stars, { stat: `Съедено: ${S.got} · ящериц спугнул: ${S.oops}` });
    };
    G.tick((dt) => {
      S.t += dt;
      const walking = !S.done && S.hold;
      if (walking) { S.scroll += MOWG.V * dt; S.walkPh += (dt * 2 * Math.PI * MOWG.V) / STR; bg(S.scroll); }
      // the plants: mown when the muzzle passes over them
      for (const q of items) {
        if (q.kind !== 'plant') continue;
        const x = q.wx - S.scroll; q.it.x = x;
        if (q.st === 'up' && walking && x <= MX + 10 && x > MX - 160) {
          q.st = 'eat'; q.t = 0; S.bite = 1; S.got++; top.counter.set(`${Math.min(S.got, NEED)} / ${NEED}`);
          AU.play('pop'); G.fx.sparkle(MX + 6, GY - 20, 8);
          if (S.first) { S.first = false; G.say(p.first || 'Хрум! Широкая морда срезает растения у самой земли.'); }
          if (S.got >= NEED && !S.done) finish();
        }
        if (q.st === 'eat') { q.t += dt; q.it.sy = Math.max(0.02, 1 - q.t / 0.25); if (q.t > 0.3) { q.st = 'gone'; q.it.visible = false; } }
      }
      // the lizards
      let warn = null;
      for (const q of lizards) {
        if (q.st === 'gone') continue;
        const x = q.wx - S.scroll, gap = x - MX;
        if (q.st === 'sit') {
          q.c.place(x, GY + 6, -1, Math.sin(S.t * 2.2 + q.wx) * 1.2);
          if (gap < 430 && gap > -40) warn = q;
          if (gap < 430 && !walking) { q.still += dt; if (q.still > 0.5) { q.st = 'flee'; q.t = 0; S.fled++; AU.play('beetle'); G.once('fled', 'Молодец! Ящерица убежала. Можно щипать дальше.'); } }
          else if (walking) q.still = 0;
          if (walking && gap < 34) {
            q.st = 'flee'; q.t = 0; q.fast = true; S.oops++; AU.play('miss'); red();
            G.once('oops', 'Ой! Чуть не наступил на ящерицу. Малыш ест только растения — пусть ящерица убегает.');
          }
        } else if (q.st === 'flee') {
          q.t += dt; q.wx += (q.fast ? 620 : 380) * dt;
          q.c.place(q.wx - S.scroll, GY + 6, 1, -Math.abs(Math.sin(q.t * 18)) * 5);
          if (q.wx - S.scroll > 1450) { q.st = 'gone'; q.c.el.remove(); }
        }
      }
      if (warn) {
        alert.style.left = warn.wx - S.scroll - 26 + 'px'; alert.style.top = GY - 92 + 'px'; alert.style.transform = 'scale(1)';
        if (walking) G.once('liz', 'Стоп! В папоротниках прячется ящерица. Отпусти палец — пусть убежит!');
      } else alert.style.transform = 'scale(0)';
      if (!S.done && S.t > 6 && !S.hold && S.got === 0) hand.style.display = '';
      // the young nigersaurus: the head stays down while it mows, lifts a little when it stops; a nod at each bite
      S.bite = Math.max(0, S.bite - dt * 4);
      let b, f;
      if (walking) [b, f] = GL.autoGait(dino, 'walk', S.walkPh, 0); else [b, f] = GL.autoGait(dino, 'stand', 0, S.t);
      b.neck = (b.neck || 0) + (walking ? 1 + DIP : -5 + DIP * 0.4) + 3 * S.bite; b.head = (b.head || 0) + 5 * S.bite + (walking ? DIP * 0.5 : 0);
      dino.blink = blink(S.t, dt); dino.pose(b, f);
    });
  },
};

/* ------------------------------------------------------------------ tracks · a young rapetosaurus looks for water in the dry season.
   The grown-ups know the way: their big round tracks lead to the river. At each fork two or three trails lie on the ground; tap the
   round prints of the herd. Three toes with claws are a hunter's (a majungasaurus looks out of the bushes), a line between the prints
   is a crocodile's tail, small thin toes a bird's. At the end the herd drinks at the river.
   Another animal brings its own herd, hunter (a jointed animal sp_ or a painted neighbour nb_), texts (intro, ok, thero, win)
   and trail kinds per fork (rounds): a young saltasaurus follows the herd and keeps off a noasaurus's three-toed prints. */
const TRK = {
  ROUNDS: [['round', 'thero'], ['thero', 'round'], ['croc', 'round'], ['round', 'bird', 'thero'], ['thero', 'croc', 'round']],
  W: 170, H: 200,
  // the prints of one trail inside a card: a strip of ground seen from above, the trail going away from the viewer (bottom to top),
  // every print with its toes forward (up), the far ones a little smaller
  svg(kind) {
    const ink = 'rgba(64,40,18,.84)', rim = 'rgba(255,244,222,.6)', out = [];
    const at = (i, n, side) => { const t = i / (n - 1), k = 1 - 0.3 * t; return [85 + side * 22 * k, 178 - t * 150, k]; };
    if (kind === 'round') for (let i = 0; i < 4; i++) {
      const [x, y, k] = at(i, 4, i % 2 ? 1 : -1);
      out.push(`<g transform="translate(${x},${y}) scale(${k})" fill="${ink}" stroke="${rim}" stroke-width="2">
        <ellipse cx="0" cy="0" rx="15" ry="18"/><path d="M-13 -30 q 13 -12 26 0 q -6 -5 -13 -5 q -7 0 -13 5z" stroke-width="1.5"/>
        ${[-7, 0, 7].map((d) => `<circle cx="${d}" cy="-16" r="2.4" stroke="none" fill="rgba(40,24,10,.9)"/>`).join('')}</g>`);
    }
    if (kind === 'thero') for (let i = 0; i < 4; i++) {
      const [x, y, k] = at(i, 4, i % 2 ? 1 : -1);
      out.push(`<g transform="translate(${x},${y}) scale(${k})" fill="none" stroke="${ink}" stroke-width="5.5" stroke-linecap="round">
        <path d="M0 8 L 0 -20 l 0 -5"/><path d="M-2 6 L -14 -12 l -3 -4"/><path d="M2 6 L 14 -12 l 3 -4"/>
        <ellipse cx="0" cy="9" rx="6" ry="6" fill="${ink}" stroke="none"/></g>`);
    }
    if (kind === 'bird') for (let i = 0; i < 7; i++) {
      const [x, y, k] = at(i, 7, i % 2 ? 0.55 : -0.55);
      out.push(`<g transform="translate(${x},${y}) scale(${k})" fill="none" stroke="${ink}" stroke-width="2.6" stroke-linecap="round">
        <path d="M0 4 L 0 -10"/><path d="M0 3 L -7 -6"/><path d="M0 3 L 7 -6"/><path d="M0 4 L 0 10"/></g>`);
    }
    if (kind === 'croc') {
      out.push(`<path d="M85 196 C 70 160, 100 130, 85 100 S 98 50, 86 14" fill="none" stroke="${ink}" stroke-width="4.5" stroke-linecap="round" opacity=".8"/>`);
      for (let i = 0; i < 5; i++) {
        const [x, y, k] = at(i, 5, i % 2 ? 1.5 : -1.5);
        out.push(`<g transform="translate(${x},${y}) scale(${k})" fill="${ink}"><ellipse cx="0" cy="2" rx="7" ry="6"/>
          ${[-2, -1, 0, 1, 2].map((j) => `<circle cx="${j * 4.5}" cy="${-7 - (2 - Math.abs(j)) * 2}" r="2.3"/>`).join('')}</g>`);
      }
    }
    return `<svg width="170" height="200" viewBox="0 0 170 200" style="position:absolute;left:0;top:0">${out.join('')}</svg>`;
  },
};
Scenes.tracks = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 2), GY = G.floor(620, 30), X = 300, LEG = 560, V = 150, CY = GY - 225;
    G.h('div', 'full', sc, { background: '#c9a06a' });
    GL.attach(sc);
    // two strips of ground: the dry plain, and the river where the herd drinks (it fades in at the end)
    const strip = (key, a) => { const rk = G.rbg(key); if (G.img[rk]) key = rk; return [0, 1, 2].map((i) => GL.sprite(key, null, { s: 1280 / 1536, ax: 768, ay: 432, y: 360, flip: i === 1, z: 0, alpha: a })); };
    const plain = strip(p.bg || 'bg_run', 1), river = strip(p.end || 'bg_valley', 0);
    const scrollTo = (scroll) => { const x0 = -(scroll % 2560); for (const T of [plain, river]) { T[0].x = x0 + 640; T[1].x = x0 + 1920; T[2].x = x0 + 3200; } };
    scrollTo(0);
    shades(sc, 0.4, 0);
    chHeader(C.n, C.name);
    const track = uiTrack(sp.sil, 'droplet');
    const K = fitK(sp.id, 400, 210), dino = GL.makeAuto(sp.id, { x: X, y: GY, s: K, z: 4 }), STR = GL.autoStride(dino, 'walk') * K, blink = blinker();
    const ROUNDS = p.rounds || TRK.ROUNDS, HKEY = p.hunter || 'sp_majunga', NBH = /^nb_/.test(HKEY), HID = HKEY.replace(/^sp_/, '');
    // the hunter that looks out of the bushes: a jointed animal, or a painted neighbour (a DOM picture that slides in)
    let hunter, hEl = null, hW = 0, hH = 0;
    if (NBH) {
      const m = MAN[HKEY]; hW = 330; hH = (hW * m.h) / m.w;
      hEl = G.spr(HKEY, sc, 0, GY - hH + 6, hW, hH);
      Object.assign(hEl.style, { transform: 'scaleX(-1)', filter: 'brightness(.9) drop-shadow(0 6px 6px rgba(0,0,0,.4))', pointerEvents: 'none', display: 'none' });
      hunter = { x: 1700, visible: false };
    } else {
      const HK = fitK(HID, 560, 300);
      hunter = GL.makeAuto(HID, { x: 1700, y: GY - 34, s: HK, z: 2, young: false }); hunter.flip = true;
    }
    const S = { t: 0, scroll: 0, walkPh: 0, round: 0, phase: 'walk', goal: LEG, mist: 0, cards: [], pass: [], peek: 0, done: false, herd: null };
    G.dbg = { S, dino, hunter };
    const red = () => { const r = G.h('div', 'full', G.ui, { background: 'radial-gradient(ellipse at 50% 50%,rgba(241,107,74,0) 40%,rgba(241,107,74,.45) 100%)', pointerEvents: 'none' }); G.tween(0.9, (e) => { r.style.opacity = 1 - e; }).then(() => r.remove()); };
    const hand = UI.hand(G.ui, 0, 0, 'tap'); hand.style.display = 'none';
    G.say(p.intro ? AU.alt(p.intro[0], p.intro[1]) : AU.alt('Засуха! Малыш ищет воду. Взрослые знают дорогу: их большие круглые следы ведут к реке. Нажимай на круглые следы!',
      'Ищи большие круглые следы — они ведут к воде!'));
    const showCards = () => {
      const kinds = ROUNDS[S.round], n = kinds.length, xs = n === 2 ? [680, 920] : [600, 820, 1040];
      S.cards = kinds.map((kind, i) => {
        const el = G.h('div', 'abs pe', sc, { left: xs[i] - TRK.W / 2, top: CY, width: TRK.W, height: TRK.H, cursor: 'pointer', borderRadius: '40px',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(226,196,148,.92) 52%, rgba(226,196,148,.55) 70%, rgba(226,196,148,0) 76%)',
          border: '4px dashed rgba(255,248,226,.85)', boxShadow: '0 0 18px rgba(255,226,160,.35)', opacity: 0, transform: 'scale(.6)', transition: 'opacity .3s, transform .3s cubic-bezier(.2,1.4,.4,1)' },
          TRK.svg(kind));
        requestAnimationFrame(() => { el.style.opacity = 1; el.style.transform = 'scale(1)'; });
        const c = { kind, el, x: xs[i], wx: S.scroll + xs[i], tried: false };
        G.on(el, 'pointerdown', (e) => { e.stopPropagation(); AU.unlock(); pick(c); });
        return c;
      });
      S.phase = 'choose'; S.ct = 0;
    };
    const clearCards = (keep) => {
      for (const c of S.cards) if (c !== keep) { c.el.style.transition = 'opacity .3s'; c.el.style.opacity = 0; setTimeout(() => c.el.remove(), 350); }
    };
    const pick = (c) => {
      if (S.phase !== 'choose' || c.tried) return;
      hand.style.display = 'none';
      if (c.kind === 'round') {
        AU.play('ok'); G.fx.sparkle(c.x, GY - 10, 12);
        c.el.style.borderColor = '#4CD26B'; c.el.style.boxShadow = '0 0 22px rgba(76,210,107,.8)';
        if (S.round === 0) G.say(p.ok || 'Правильно! Это следы рапетозавров. Идём дальше.');
        clearCards(c); S.pass.push(c);
        // the chosen trail glows a moment, then sinks back into the ground (a card passing over the walking young one would cover it)
        setTimeout(() => { c.el.style.transition = 'opacity .5s'; c.el.style.opacity = 0; }, 650);
        S.round++; S.phase = 'walk'; S.goal = S.scroll + LEG;
        if (S.round >= ROUNDS.length) S.goal = S.scroll + LEG + 260;
        return;
      }
      c.tried = true; S.mist++; AU.play('miss'); red();
      c.el.style.borderColor = '#F16B4A'; c.el.style.opacity = 0.55;
      c.el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-12px)' }, { transform: 'translateX(12px)' }, { transform: 'translateX(0)' }], { duration: 300 });
      // the whole explanation once for each kind of tracks, then only a word
      const again = G.saidOnce.has('trk_' + c.kind);
      if (c.kind === 'thero') { if (again) G.say('Это следы хищника!'); else G.once('trk_thero', p.thero || 'Три пальца с когтями — это следы хищника маджунгазавра! Ищи большие круглые следы.'); }
      else if (c.kind === 'croc') { if (again) G.say('Это следы крокодила.'); else G.once('trk_croc', 'Это следы крокодила: видишь полоску от хвоста? Ищи большие круглые следы.'); }
      else if (again) G.say('Это следы птицы.'); else G.once('trk_bird', 'Это следы маленькой птицы. Ищи большие круглые следы стада.');
      if (c.kind === 'thero') { S.peek = 2.6; AU.voiceOf(NBH ? HKEY : HID, { at: 0.15, vol: 0.6 }); }
    };
    const finish = async () => {
      S.done = true; AU.play('win');
      G.say(p.win || 'Ура! Следы привели к реке. Здесь вода и сочные растения — и всё стадо рапетозавров.');
      await G.wait(3.2); if (!G.alive(tok)) return;
      const stars = S.mist === 0 ? 3 : S.mist <= 2 ? 2 : 1;
      chFinish(C.n, stars, { stat: `Развилок: ${ROUNDS.length} · ошибок: ${S.mist}` });
    };
    // the herd at the river: two grown-ups drinking, the young one walks up to them
    const herd = () => {
      const HKa = fitK(sp.id, 760, 330);
      S.herd = [GL.makeAuto(sp.id, { x: 1500, y: GY + 6, s: HKa, z: 3, young: false }), GL.makeAuto(sp.id, { x: 1900, y: GY - 26, s: HKa * 0.86, z: 2, young: false })];
      for (const h of S.herd) h.flip = true;      // turned towards the young one that comes
    };
    G.tick((dt) => {
      S.t += dt;
      let walking = false;
      if (S.phase === 'walk' && !S.done) {
        walking = true; S.scroll = Math.min(S.goal, S.scroll + V * dt); S.walkPh += (dt * 2 * Math.PI * V) / STR;
        if (S.scroll >= S.goal) {
          if (S.round >= ROUNDS.length) { S.phase = 'end'; finish(); }
          else showCards();
        }
      }
      if (S.phase === 'choose') { S.ct += dt; if (S.ct > 5 && S.round < 2 && S.cards.length) { const c = S.cards.find((q) => q.kind === 'round'); hand.style.left = c.x + 'px'; hand.style.top = CY + TRK.H / 2 + 'px'; hand.style.display = ''; } }
      scrollTo(S.scroll);
      // the chosen trails stay on the ground and pass by
      for (const c of S.pass.slice()) { const x = c.wx - S.scroll; c.el.style.left = x - TRK.W / 2 + 'px'; if (x < -TRK.W) { c.el.remove(); S.pass.splice(S.pass.indexOf(c), 1); } }
      const prog = (S.round + (S.phase === 'walk' ? 0.5 * (1 - (S.goal - S.scroll) / LEG) : 0)) / ROUNDS.length;
      track(G.clamp(prog, 0, 1));
      // the end: the river fades in and the herd comes into view
      if (S.round >= ROUNDS.length) {
        if (!S.herd) herd();
        const e = G.clamp(1 - (S.goal - S.scroll) / (LEG + 260), 0, 1);
        for (const T of river) T.alpha = e;
        S.herd[0].x = 1560 - 500 * e; S.herd[1].x = 1960 - 520 * e;
        S.herd.forEach((h, i) => { const [b, f] = GL.autoGait(h, 'stand', 0, S.t + i); b.neck = (b.neck || 0) + 16 * e; b.head = (b.head || 0) + 8 * e; h.pose(b, f); });
      }
      // a majungasaurus looks out of the bushes on the right, then goes back
      if (S.peek > 0) S.peek -= dt;
      const out = S.peek > 0 ? G.ease.out(G.clamp((2.6 - S.peek) / 0.5, 0, 1)) * G.clamp(S.peek / 0.6, 0, 1) : 0;
      hunter.x = 1560 - 430 * out; hunter.visible = out > 0.01;
      if (NBH) { hEl.style.display = hunter.visible ? '' : 'none'; hEl.style.left = hunter.x - hW / 2 + 'px'; }
      else if (hunter.visible) { const [b, f] = GL.autoGait(hunter, 'stand', 0, S.t); b.head = (b.head || 0) - 6 * out; hunter.pose(b, f); }
      let b, f;
      if (walking) [b, f] = GL.autoGait(dino, 'walk', S.walkPh, 0); else [b, f] = GL.autoGait(dino, 'stand', 0, S.t);
      if (S.phase === 'choose') b.neck = (b.neck || 0) + 9;      // looking down at the tracks
      if (out > 0) b.neck = (b.neck || 0) - 8 * out;
      dino.blink = blink(S.t, dt); dino.pose(b, f);
    });
  },
};

/* ------------------------------------------------------------------ termites · a young patagonykus looks for termites in the forest.
   Termites live in rotten logs, full of small holes; a solid log has none. Tap the rotten log: the patagonykus walks up to it and
   breaks it with the one big claw of its short arm (tap, tap, tap); the log splits open and the termites run out — tap them
   before they hide again. Three logs; tapping a solid log costs a star, and so do many termites that get away. */
const TRM = { LOGS: [['rot', 'solid'], ['solid', 'rot', 'solid'], ['solid', 'solid', 'rot']], HITS: 4, N: 8, LW: 220, V: 165 };
Scenes.termites = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 2), NEED = Math.min(p.need || 3, TRM.LOGS.length), GY = G.floor(626, 30), X = p.x || 250;
    const LW = p.lw || TRM.LW, BOX = p.box || [440, 250];
    G.h('div', 'full', sc, { background: '#55603a' });
    GL.attach(sc);
    const bg = scrollTiles(p.bg || 'bg_forest'); bg(0);
    shades(sc, 0.4, 0);
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: ['bug', '0'] });
    const track = uiTrack(sp.sil, 'bug');
    const K = fitK(sp.id, BOX[0], BOX[1]), d = MAN.auto[sp.id];
    const dino = GL.makeAuto(sp.id, { x: X, y: GY, s: K, z: 4 });
    const mth = GL.restPt(dino, d.mouth), MX = X + (mth[0] - dino.ax) * K, MY = GY + (mth[1] - dino.ay) * K;
    const STR = GL.autoStride(dino, 'walk') * K, blink = blinker();
    const S = { t: 0, scroll: 0, goal: 0, walkPh: 0, phase: 'choose', st: 0, station: 0, logs: [], cur: null, hits: 0, lunge: 0, peck: 0,
      termites: [], eaten: 0, lost: 0, mist: 0, done: false, tapT: 0 };
    G.dbg = { S, dino, MX };
    const KEY = { rot: 'it_logrot', solid: 'it_logsolid', crack: 'it_logcrack', open: 'it_logopen' };
    const logSpr = (key, x) => { const m = MAN[key]; return GL.sprite(key, null, { ax: m.w / 2, ay: m.h * 0.9, s: LW / m.w, x, y: GY + 12, z: 5 }); };
    const red = () => { const r = G.h('div', 'full', G.ui, { background: 'radial-gradient(ellipse at 50% 50%,rgba(241,107,74,0) 40%,rgba(241,107,74,.45) 100%)', pointerEvents: 'none' }); G.tween(0.9, (e) => { r.style.opacity = 1 - e; }).then(() => r.remove()); };
    const hit = G.h('div', 'hit', sc);
    const hand = UI.hand(G.ui, 0, 0, 'tap'); hand.style.display = 'none';
    // the logs of a station lie ahead on the forest floor (world x; on screen x − scroll)
    const station = () => {
      const kinds = TRM.LOGS[S.station], n = kinds.length, gap = Math.max(260, LW + 40), x3 = 1120 + Math.max(0, (LW - TRM.LW) * 0.75);
      const xs = n === 2 ? [700, 700 + gap] : [x3 - 2 * gap, x3 - gap, x3];
      S.logs = kinds.map((kind, i) => ({ kind, wx: S.scroll + xs[i], it: logSpr(KEY[kind], -999), shake: 0, fade: 1 }));
      S.phase = 'choose'; S.st = 0; S.hits = 0; S.cur = null;
    };
    station();
    G.say(p.intro ? AU.alt(p.intro[0], p.intro[1]) : AU.alt('Патагоникус ищет термитов. Термиты живут в гнилых брёвнах — в них много дырочек. Нажми на гнилое бревно!',
      'Найди гнилое бревно с дырочками и нажми на него!'));
    const swap = (log, key) => { const old = log.it; log.it = logSpr(key, old.x); GL.remove(old); };
    const spill = () => {
      const lx = S.cur.wx - S.scroll;
      for (let i = 0; i < TRM.N; i++) {
        const c = critter('it_termite', sc, p.tsize || 58), a = G.rand(-0.4, Math.PI + 0.4), sp0 = G.rand(55, 95);
        const q = { c, x: lx + G.rand(-40, 40), y: GY - 6 + G.rand(-6, 10), vx: Math.cos(a) * sp0, vy: Math.abs(Math.sin(a)) * 18 + 4, t: 0,
          life: G.rand(4.6, 6.4), st: 'run', ph: G.rand(0, 6) };
        if (q.x < MX - 30) q.vx = Math.abs(q.vx);      // they run out in front of the log, not under the animal
        q.c.place(q.x, q.y, q.vx < 0 ? -1 : 1);
        S.termites.push(q);
      }
    };
    const stationDone = async () => {
      S.phase = 'between'; S.station++;
      track(S.station / NEED);
      if (S.station >= NEED) { finish(); return; }
      if (S.station === 1) G.say('Вкусно! Ищем следующее гнилое бревно.');
      await G.wait(1.0); if (!G.alive(tok)) return;
      for (const l of S.logs) l.fade = -1;       // the old logs fade away
      S.goal = S.scroll + 380; S.phase = 'walk'; S.after = 'station';
    };
    const finish = async () => {
      S.done = true; AU.play('win'); AU.voiceOf(sp.id, { at: 0.2, vol: 0.55 });
      G.say(p.win || 'Наелся! Коготь, как кирка, разбил гнилые брёвна, а длинная морда собрала термитов.');
      await G.wait(2.8); if (!G.alive(tok)) return;
      const pen = S.mist + (S.lost >= 8 ? 2 : S.lost >= 4 ? 1 : 0), stars = pen === 0 ? 3 : pen <= 2 ? 2 : 1;
      chFinish(C.n, stars, { stat: `Термитов: ${S.eaten} · ошибок: ${S.mist}` });
    };
    G.on(hit, 'pointerdown', (e) => {
      AU.unlock(); if (S.done) return;
      const pt = G.bgPt(e), px = pt.x, py = pt.y; hand.style.display = 'none'; S.tapT = 0;
      if (S.phase === 'choose') {
        const log = S.logs.find((l) => Math.abs(l.wx - S.scroll - px) < LW / 2 + 10 && py > GY - 40 - LW * 0.4 && py < GY + 40);
        if (!log) return;
        if (log.kind === 'solid') {
          S.mist++; log.shake = 0.45; AU.play('miss'); red();
          if (G.saidOnce.has('trm_solid')) G.say('Это бревно крепкое.');
          else G.once('trm_solid', 'Это крепкое бревно — термитов в нём нет. Ищи гнилое, с дырочками.');
          return;
        }
        AU.play('ok'); S.cur = log;
        for (const l of S.logs) if (l !== log) l.fade = -1;
        S.goal = log.wx - (MX + LW * 0.3); S.phase = 'walk'; S.after = 'dig';
        return;
      }
      if (S.phase === 'dig') {
        S.lunge = 0.3; S.hits++; AU.play('crack');
        const cx = S.cur.wx - S.scroll - LW * 0.25;
        for (let i = 0; i < 7; i++) G.fx.emit({ type: 'chip', x: cx + G.rand(-20, 20), y: GY - 40, vx: G.rand(-170, 170), vy: G.rand(-280, -120), g: 900, life: 0.7, size: G.rand(4, 7), color: G.pick(['#7a5530', '#5e3f22', '#a07448']), vr: G.rand(-12, 12) });
        if (S.hits === 2) swap(S.cur, KEY.crack);
        if (S.hits >= TRM.HITS) {
          swap(S.cur, KEY.open); AU.play('break'); spill(); S.phase = 'eat'; S.st = 0;
          if (S.station === 0) G.say(p.open || 'Бревно раскололось! Термиты бегут — нажимай на них!');
        }
        return;
      }
      if (S.phase === 'eat') {
        let best = null, bd = 70;
        for (const q of S.termites) { if (q.st !== 'run' && q.st !== 'back') continue; const dd = Math.hypot(q.x - px, q.y - 14 - py); if (dd < bd) { bd = dd; best = q; } }
        if (!best) return;
        best.st = 'eaten'; best.t = 0; best.x0 = best.x; best.y0 = best.y; S.peck = 0.28; S.eaten++; top.counter.set(String(S.eaten));
        AU.play('pop'); G.fx.sparkle(best.x, best.y - 12, 6);
        if (S.eaten === 1) G.once('trm_first', p.first || 'Ам! Длинная узкая морда ловко собирает термитов.');
      }
    });
    G.tick((dt) => {
      S.t += dt; S.st += dt; S.tapT += dt;
      let walking = false;
      if (S.phase === 'walk') {
        walking = true; const dir = Math.sign(S.goal - S.scroll), stp = TRM.V * dt;
        S.scroll = Math.abs(S.goal - S.scroll) <= stp ? S.goal : S.scroll + dir * stp; S.walkPh += (dt * 2 * Math.PI * TRM.V) / STR;
        if (S.scroll === S.goal) {
          if (S.after === 'dig') { S.phase = 'dig'; S.st = 0; if (S.station === 0) G.say(p.hit || 'Бей когтем по бревну — нажимай быстро-быстро!'); }
          else { for (const l of S.logs) GL.remove(l.it); station(); }
        }
        bg(S.scroll);
      }
      // the logs: a solid one shakes when tapped; the ones not chosen fade away
      for (const l of S.logs) {
        if (l.fade < 0) { l.it.alpha = Math.max(0, l.it.alpha - dt * 2.5); }
        l.shake = Math.max(0, l.shake - dt);
        l.it.x = l.wx - S.scroll + Math.sin(S.t * 60) * 8 * l.shake;
      }
      // the termites run about, then hurry back into the log; the eaten ones fly into the mouth
      let left = 0;
      for (const q of S.termites) {
        if (q.st === 'gone') continue;
        q.t += dt;
        if (q.st === 'run') {
          q.x += q.vx * dt; q.y = G.clamp(q.y + q.vy * dt, GY - 20, GY + 26); q.vx += Math.sin(S.t * 3 + q.ph) * 30 * dt;
          if (q.x < MX - 20 || q.x > 1240) q.vx = -q.vx;
          if (q.t > q.life) { q.st = 'back'; G.once('trm_hide', 'Термиты убегают обратно в бревно — лови скорее!'); }
        } else if (q.st === 'back') {
          const lx = S.cur.wx - S.scroll, dx = lx - q.x, dy = GY - 6 - q.y, dd = Math.hypot(dx, dy);
          if (dd < 12) { q.st = 'gone'; q.c.el.remove(); S.lost++; continue; }
          q.vx = (dx / dd) * 110; q.x += q.vx * dt; q.y += (dy / dd) * 110 * dt;
        } else if (q.st === 'eaten') {
          const e = G.clamp(q.t / 0.22, 0, 1); q.x = G.lerp(q.x0, MX + 6, e); q.y = G.lerp(q.y0, MY + 10, e);
          q.c.el.style.opacity = 1 - e * 0.8;
          if (e >= 1) { q.st = 'gone'; q.c.el.remove(); continue; }
        }
        left++;
        q.c.place(q.x, q.y, q.vx < 0 ? -1 : 1, -Math.abs(Math.sin(q.t * 22 + q.ph)) * 2);
      }
      if (S.phase === 'eat' && left === 0) { S.termites = []; stationDone(); }
      // hints: the rotten log, then the claw
      if (!S.done && S.tapT > 5 && S.station < 2) {
        if (S.phase === 'choose') { const l = S.logs.find((q) => q.kind === 'rot'); hand.style.left = l.wx - S.scroll + 'px'; hand.style.top = GY - 50 + 'px'; hand.style.display = ''; }
        else if (S.phase === 'dig') { hand.style.left = MX + 60 + 'px'; hand.style.top = GY - 70 + 'px'; hand.style.display = ''; }
      }
      // the patagonykus: a strike of the claw leans the whole front down; a peck dips the head
      S.lunge = Math.max(0, S.lunge - dt); S.peck = Math.max(0, S.peck - dt);
      const lk = S.lunge > 0 ? Math.sin(Math.PI * (1 - S.lunge / 0.3)) : 0, pk = S.peck > 0 ? Math.sin(Math.PI * (1 - S.peck / 0.28)) : 0;
      let b, f;
      if (walking) [b, f] = GL.autoGait(dino, 'walk', S.walkPh, 0); else [b, f] = GL.autoGait(dino, 'stand', 0, S.t);
      b.neck = (b.neck || 0) + 22 * lk + 26 * pk + (S.phase === 'dig' || S.phase === 'eat' ? 6 : 0); b.head = (b.head || 0) + 10 * lk + 14 * pk;
      dino.blink = blink(S.t, dt); dino.pose(b, f);
    });
  },
};

/* ------------------------------------------------------------------ wade · in the shallows of a lake or a lagoon (two modes).
   sieve: a pterodaustro (two pictures: the body and the neck with the jaws, js/gen_cre.js ptd_*) holds the finger: the long
   bristle jaws go down into the water and the animal walks to the finger. Swarms of tiny crustaceans drift under the surface;
   the jaws sieve them when they pass slowly — too fast and the swarm scatters. A full beak is swallowed (six gulps).
   snap: an irritator stands still like a heron; fish swim by, now deep, now just under the surface. Tap when a fish is near the
   surface right under the snout: the head shoots down and catches it; a deep fish cannot be reached. */
const WADE = { SV: 110, FDRAG: 650, GULP: 20, SNAP: 0.42, CLAW: 0.62 };
const wadeWater = (sc, WY) => {
  // the water in front of the animal: it tints what is below the surface (legs, jaws, fish, swarms); ripples at the surface
  G.h('div', 'abs', sc, { left: 0, top: WY, width: 1280, height: 760 - WY, pointerEvents: 'none',
    background: 'linear-gradient(rgba(120,200,212,.36), rgba(70,150,172,.54) 45%, rgba(40,108,140,.66))' });
  const line = G.h('div', 'abs', sc, { left: -80, top: WY - 4, width: 1440, height: 8, pointerEvents: 'none', opacity: 0.45, filter: 'blur(1.5px)',
    background: 'repeating-linear-gradient(90deg, rgba(255,255,255,.55) 0 60px, rgba(255,255,255,.2) 90px, rgba(255,255,255,.55) 120px)' });
  return (t) => { line.style.transform = `translateX(${(t * 10) % 120}px)`; };
};
const wadeSieve = (p) => {
  const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 2), NEED = p.need || 6, GY = G.floor(668, 18), SK = 0.62;
  G.bgImg(p.bg || 'bg_lagoon');
  GL.attach(sc);
  shades(sc, 0.4, 0);
  chHeader(C.n, C.name);
  const top = UI.topRight({ counter: ['droplet', `0 / ${NEED}`] });
  const MB = MAN.ptd_body, MN = MAN.ptd_neck, PV = MN.pivot, TIP = MN.tip, COMB = MN.comb, FEET = MB.h - 10;
  const body = GL.sprite('ptd_body', null, { ax: MB.w / 2, ay: FEET, s: SK, x: 330, y: GY, z: 3 });
  const neck = GL.sprite('ptd_neck', null, { ax: PV[0], ay: PV[1], s: SK, x: 0, y: 0, z: 4 });
  const WY = GY - 104;
  // particles of the swarms: a 2-D canvas under the water's tint
  const cv = G.h('canvas', 'abs', sc, { left: 0, top: 0, width: 1280, height: 720, pointerEvents: 'none' }); cv.width = 1280; cv.height = 720;
  const cx = cv.getContext('2d');
  const water = wadeWater(sc, WY);
  const S = { t: 0, bx: 330, v: 0, th: -0.05, hold: false, fx: 330, fv: 0, ph: 0, swarms: [], next: 0.6, caught: 0, gulps: 0, gulp: 0, scat: 0, done: false, first: true, idle: 0 };
  G.dbg = { S, body, neck, WY };
  const hit = G.h('div', 'hit', sc);
  const hand = UI.hand(G.ui, 760, WY + 40, 'hold');
  G.on(hit, 'pointerdown', (e) => { AU.unlock(); S.hold = true; S.pid = e.pointerId; S.fx = G.bgPt(e).x; hand.style.display = 'none'; S.idle = 0; });
  G.on(window, 'pointermove', (e) => {
    if (!S.hold || e.pointerId !== S.pid) return;
    const x = G.bgPt(e).x, now = performance.now(), dtm = Math.max(8, now - (S.lastM || now - 16)) / 1000;
    S.fv = Math.max(S.fv, Math.abs(x - S.fx) / dtm); S.fx = x; S.lastM = now;
  });
  const up = (e) => { if (e.pointerId === S.pid) S.hold = false; };
  G.on(window, 'pointerup', up); G.on(window, 'pointercancel', up);
  G.say(AU.alt('Птеродаустро ловит рачков клювом-ситом. Держи палец на экране — он опустит клюв в воду. Веди его к облачку рачков, только медленно!',
    'Держи палец — клюв в воде. Веди медленно к рачкам!'));
  // where a point of the neck picture is on screen now
  const at = (q) => { const dx = (q[0] - PV[0]) * SK, dy = (q[1] - PV[1]) * SK, c = Math.cos(S.th), s = Math.sin(S.th); return [neck.x + dx * c - dy * s, neck.y + dx * s + dy * c]; };
  const spawn = () => {
    const comb = at(COMB);
    let x = 0; for (let k = 0; k < 20; k++) { x = G.rand(560, 1190); if (Math.abs(x - comb[0]) > 200 && S.swarms.every((w) => Math.abs(w.x - x) > 220)) break; }
    const y = WY + G.rand(16, 40), w = { x, y, vx: G.rand(-12, 12), parts: [], scared: false };
    for (let i = 0; i < 26; i++) w.parts.push({ dx: (G.rand(-1, 1) + G.rand(-1, 1)) * 22, dy: G.rand(-9, 9), st: 'free', a: 1, ph: G.rand(0, 6) });
    S.swarms.push(w);
  };
  const finish = async () => {
    S.done = true; S.hold = false; AU.play('win'); AU.voiceOf(sp.id, { at: 0.3, vol: 0.5 });
    G.say('Наелся! Тысяча тонких щетинок в клюве работали, как сито. Может быть, от рачков птеродаустро был розовым, как фламинго.');
    await G.wait(3.2); if (!G.alive(tok)) return;
    const stars = S.scat === 0 ? 3 : S.scat <= 2 ? 2 : 1;
    chFinish(C.n, stars, { stat: `Глотков: ${S.gulps} · рачки разбегались: ${S.scat}` });
  };
  G.tick((dt) => {
    S.t += dt; S.idle += dt; water(S.t);
    // the jaws go down while the finger is held (not while swallowing); the animal walks to bring the jaws under the finger
    if (S.gulp > 0) S.gulp -= dt;
    const want = S.hold && S.gulp <= 0 && !S.done ? 0.9 : S.gulp > 0 ? -0.12 : -0.05;
    S.th += G.clamp(want - S.th, -3.2 * dt, 3.2 * dt);
    let target = 0;
    if (S.hold && !S.done) { const comb = at(COMB); target = G.clamp((S.fx - comb[0]) * 2.0, -WADE.SV * 0.6, WADE.SV); }
    S.fv = Math.max(0, S.fv - 1500 * dt);
    S.v += G.clamp(target - S.v, -400 * dt, 400 * dt);
    S.bx = G.clamp(S.bx + S.v * dt, 230, 990); if (S.bx === 230 || S.bx === 990) S.v = 0;
    S.ph += dt * Math.abs(S.v) / 26;
    body.x = S.bx; body.y = GY - Math.abs(Math.sin(S.ph)) * (Math.abs(S.v) > 8 ? 4 : 0);
    neck.x = body.x + (PV[0] - MB.w / 2) * SK; neck.y = body.y + (PV[1] - FEET) * SK; neck.rot = S.th;
    // the swarms drift; the jaws in the water sieve the crustaceans near them, or scare them when they move too fast
    S.next -= dt; if (S.swarms.length < 2 && S.next <= 0) { spawn(); S.next = G.rand(0.8, 1.6); }
    const C0 = at(COMB), T0 = at(TIP), inWater = S.th > 0.55 && Math.max(C0[1], T0[1]) > WY + 4, fast = S.fv > WADE.FDRAG;
    const segD = (x, y) => { const ax = T0[0] - C0[0], ay = T0[1] - C0[1], L = ax * ax + ay * ay, u = G.clamp(((x - C0[0]) * ax + (y - C0[1]) * ay) / L, 0, 1); return [Math.hypot(x - C0[0] - u * ax, y - C0[1] - u * ay), C0[0] + u * ax, C0[1] + u * ay]; };
    cx.clearRect(0, 0, 1280, 720);
    for (const w of S.swarms) {
      const n = w.parts.filter((q) => q.st === 'free').length; if (!n) continue;
      const gr = cx.createRadialGradient(w.x, w.y, 4, w.x, w.y, 70);
      gr.addColorStop(0, `rgba(255,150,120,${(0.28 * n / 26).toFixed(3)})`); gr.addColorStop(1, 'rgba(255,150,120,0)');
      cx.fillStyle = gr; cx.beginPath(); cx.ellipse(w.x, w.y, 74, 30, 0, 0, Math.PI * 2); cx.fill();
    }
    for (const w of S.swarms.slice()) {
      w.x += w.vx * dt; if (w.x < 520 || w.x > 1220) w.vx = -w.vx;
      let free = 0;
      for (const q of w.parts) {
        const x = w.x + q.dx + Math.sin(S.t * 2.4 + q.ph) * 4, y = w.y + q.dy + Math.cos(S.t * 2 + q.ph) * 2;
        if (q.st === 'free') {
          free++;
          if (inWater && y > WY) {
            const [dd, sx, sy] = segD(x, y);
            if (dd < 34) {
              if (fast) {
                if (!w.scared) { w.scared = true; S.scat++; AU.play('splash'); G.once('sv_fast', 'Слишком быстро — рачки разбежались! Веди клюв медленнее.'); }
              } else {
                q.st = 'in'; q.sx = sx; q.sy = sy; q.t = 0; S.caught++;
                if (S.first) { S.first = false; AU.play('pop'); G.once('sv_first', 'Отлично! Щетинки держат рачков, а вода утекает сквозь них.'); }
              }
            }
          }
          if (w.scared && q.st === 'free') { q.st = 'run'; q.vx = (q.dx >= 0 ? 1 : -1) * G.rand(90, 170); q.vy = G.rand(-20, 30); q.t = 0; }
        }
        if (q.st === 'run') { q.t += dt; q.dx += q.vx * dt; q.dy += q.vy * dt; q.a = Math.max(0, 1 - q.t / 0.9); if (q.a <= 0) q.st = 'gone'; }
        if (q.st === 'in') { q.t += dt; q.a = Math.max(0, 1 - q.t / 0.25); if (q.a <= 0) q.st = 'gone'; }
        if (q.st === 'gone') continue;
        const px = q.st === 'in' ? G.lerp(x, q.sx, Math.min(1, q.t * 4)) : x, py = q.st === 'in' ? G.lerp(y, q.sy, Math.min(1, q.t * 4)) : y;
        cx.globalAlpha = 0.95 * q.a; cx.fillStyle = '#ff8a64';
        cx.beginPath(); cx.ellipse(px, py, 5, 3, Math.sin(S.t + q.ph) * 0.6, 0, Math.PI * 2); cx.fill();
        cx.fillStyle = '#ffd2bf'; cx.beginPath(); cx.arc(px + 2, py - 1, 1.2, 0, Math.PI * 2); cx.fill();
      }
      if (free < 4 && w.parts.every((q) => q.st !== 'in' && q.st !== 'run')) { S.swarms.splice(S.swarms.indexOf(w), 1); S.next = G.rand(0.6, 1.2); }
    }
    cx.globalAlpha = 1;
    // a full beak: the head comes up and swallows
    if (S.caught >= WADE.GULP && S.gulp <= 0 && !S.done) {
      S.caught -= WADE.GULP; S.gulp = 0.8; S.gulps++; top.counter.set(`${S.gulps} / ${NEED}`); AU.play('gulp');
      if (S.gulps === 1) G.say('Глоток! Набрал полный клюв рачков — и проглотил.');
      if (S.gulps >= NEED) finish();
    }
    if (!S.done && !S.hold && S.idle > 6 && S.swarms.length) { const w = S.swarms[0]; hand.style.left = w.x + 'px'; hand.style.top = w.y - 20 + 'px'; hand.style.display = ''; }
  });
};
/* claw (another mode of the same game): a baryonyx stands knee-deep with its arms in the water, like a bear at a river; a fish
   that swims up past the claws is hooked with a swing of the arm (the claws bone, gen_cre.js) and thrown out onto the bank. */
const wadeSnap = (p) => {
  const CLAWM = p.mode === 'claw', PREY = p.prey || (CLAWM ? 'it_lepidotes' : 'it_fish');
  const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 2), NEED = p.need || 6, GY = G.floor(664, 18), X = CLAWM ? 400 : 330;
  G.bgImg(p.bg || 'bg_lagoon');
  GL.attach(sc);
  shades(sc, 0.4, 0);
  chHeader(C.n, C.name);
  const top = UI.topRight({ counter: ['fish', `0 / ${NEED}`] });
  const K = CLAWM ? fitK(sp.id, 760, 330) : fitK(sp.id, 560, 250), d = MAN.auto[sp.id];
  const dino = GL.makeAuto(sp.id, { x: X, y: GY, s: K, z: 3 });
  const mth = GL.restPt(dino, d.mouth), MXs = X + (mth[0] - dino.ax) * K, MYs = GY + (mth[1] - dino.ay) * K;
  // the claws (claw mode): their hooks at rest, under the surface; the fish within reach of the swing are caught
  const tip = CLAWM ? GL.restPt(dino, d.clawTip || d.mouth) : null, TXs = CLAWM ? X + (tip[0] - dino.ax) * K : 0;
  const TYs = CLAWM ? GY + (tip[1] - dino.ay) * K : 0;
  const WY = CLAWM ? Math.round(Math.min(TYs - 14, GY - 46)) : Math.min(MYs + 74, GY - 46), ZONE = CLAWM ? [TXs - 75, TXs + 75] : [MXs - 40, MXs + 100], SHALLOW = WY + (CLAWM ? 62 : 36);
  const fishLayer = G.h('div', 'abs', sc, { left: 0, top: 0, width: 1280, height: 720, pointerEvents: 'none' });
  const water = wadeWater(sc, WY);
  const S = { t: 0, strike: 0, tested: false, got: 0, miss: 0, fish: [], held: null, hold: 0, done: false, idle: 0, firstDeep: true };
  G.dbg = { S, dino, WY, ZONE };
  const blink = blinker();
  const mkFish = (i) => {
    const w = 118, m = MAN[PREY] || MAN.it_fish, h = (w * m.h) / m.w, el = G.spr(PREY, fishLayer, 0, 0, w, h);
    el.style.transition = 'filter .4s'; el.style.transformOrigin = '50% 50%';
    const dir = G.rand(0, 1) < 0.5 ? -1 : 1;
    return { el, w, h, x: dir > 0 ? G.rand(-80, 200) : G.rand(900, 1340), y: WY + 90, ty: WY + 90, vx: dir * G.rand(60, 100), deep: true, t: G.rand(0, 3), nextRise: G.rand(1.0, 3.5) + i, st: 'swim' };
  };
  for (let i = 0; i < 3; i++) S.fish.push(mkFish(i));
  const hit = G.h('div', 'hit', sc);
  const hand = UI.hand(G.ui, (ZONE[0] + ZONE[1]) / 2, WY + 30, 'tap'); hand.style.display = 'none';
  G.say(p.intro ? AU.alt(p.intro[0], p.intro[1]) : AU.alt('Ирритатор стоит на мелководье, как цапля. Жди, когда рыба поднимется к самой поверхности под мордой, — и нажимай!',
    'Рыба у поверхности под мордой — жми!'));
  const finish = async () => {
    S.done = true; AU.play('win'); AU.voiceOf(sp.id, { at: 0.3, vol: 0.55 });
    G.say(p.win || 'Отличная рыбалка! Ирритатор, как цапля, ловил рыбу на мелководье.');
    await G.wait(2.8); if (!G.alive(tok)) return;
    const stars = S.miss <= 1 ? 3 : S.miss <= 3 ? 2 : 1;
    chFinish(C.n, stars, { stat: `Поймано: ${S.got} · промахов: ${S.miss}` });
  };
  G.on(hit, 'pointerdown', () => {
    AU.unlock(); if (S.done || S.strike > 0 || S.hold > 0) return;
    hand.style.display = 'none'; S.idle = 0; S.strike = CLAWM ? WADE.CLAW : WADE.SNAP; S.tested = false; AU.play('whoosh');
  });
  const test = () => {
    const inZone = S.fish.filter((f) => f.st === 'swim' && f.x > ZONE[0] && f.x < ZONE[1]);
    const near = inZone.filter((f) => f.y < SHALLOW);
    AU.play('splash'); for (let i = 0; i < 9; i++) G.fx.emit({ x: (ZONE[0] + ZONE[1]) / 2 + G.rand(-45, 45), y: WY, vx: G.rand(-130, 130), vy: G.rand(-260, -100), g: 700, life: 0.6, size: G.rand(3, 6), color: 'rgba(232,247,255,.95)' });
    if (near.length) {
      const f = near[0]; S.got++; top.counter.set(`${S.got} / ${NEED}`);
      AU.play('catch'); G.fx.sparkle(f.x, WY - 10, 10);
      if (CLAWM) { f.st = 'fly'; f.t = 0; f.x0 = f.x; f.y0 = WY - 10; }        // hooked out and thrown onto the bank behind
      else { f.st = 'caught'; S.held = f; S.hold = 0.75; }
      if (S.got === 1) G.once('sn_first', p.first || 'Попалась! Длинная морда и зубы-конусы крепко держат скользкую рыбу.');
      return;
    }
    S.miss++; AU.play('miss');
    if (inZone.length) { G.once('sn_deep', p.deep || 'Эта рыба слишком глубоко. Жди, когда она поднимется к поверхности.'); }
    else G.once('sn_miss', p.miss || 'Мимо! Жди, когда рыба будет прямо под мордой.');
    for (const f of S.fish) if (f.st === 'swim' && Math.abs(f.x - (ZONE[0] + ZONE[1]) / 2) < 260) { f.vx = Math.sign(f.x - (CLAWM ? TXs : MXs) || 1) * 260; f.ty = WY + 95; f.deep = true; f.nextRise = G.rand(1.6, 2.6); }
  };
  G.tick((dt) => {
    S.t += dt; S.idle += dt; water(S.t);
    // the fish: they swim across, now deep (small, dark), now up under the surface (big, bright) for a while
    for (const f of S.fish.slice()) {
      if (f.st === 'caught' || f.st === 'gone') continue;
      f.t += dt;
      if (f.st === 'fly') {
        // the hooked fish flies up and back over the animal onto the bank (off the left edge), spinning
        const u = Math.min(1, f.t / 0.95), x = G.lerp(f.x0, -90, u), y = f.y0 - 300 * Math.sin(Math.PI * u) + 60 * u;
        f.el.style.left = x - f.w / 2 + 'px'; f.el.style.top = y - f.h / 2 + 'px';
        f.el.style.transform = `rotate(${-540 * u}deg) scale(.9)`; f.el.style.filter = ''; f.el.style.opacity = 1;
        if (u >= 1) {
          AU.play('thud'); f.el.remove(); f.st = 'gone'; S.fish.splice(S.fish.indexOf(f), 1);
          if (S.got >= NEED) { if (!S.done) finish(); } else S.fish.push(mkFish(0));
        }
        continue;
      }
      if (f.deep && f.t > f.nextRise) { f.deep = false; f.t = 0; f.ty = WY + G.rand(12, 24); f.vx = Math.sign(f.vx) * G.rand(55, 80); }
      else if (!f.deep && f.t > G.rand(2.8, 3.6)) { f.deep = true; f.t = 0; f.ty = WY + G.rand(80, 110); f.nextRise = G.rand(1.5, 3.5); }
      f.y += G.clamp(f.ty - f.y, -60 * dt, 60 * dt);
      f.x += f.vx * dt; f.vx += (Math.sign(f.vx) * 75 - f.vx) * Math.min(1, dt * 0.8);
      if ((f.vx > 0 && f.x > 1360) || (f.vx < 0 && f.x < -80)) { Object.assign(f, { vx: -f.vx, deep: true, ty: WY + 95, t: 0, nextRise: G.rand(0.8, 2.5) }); }
      const k = G.clamp((f.y - WY) / 100, 0, 1), sc0 = 1 - 0.35 * k;
      f.el.style.left = f.x - f.w / 2 + 'px'; f.el.style.top = f.y - f.h / 2 + 'px';
      f.el.style.transform = `scale(${(f.vx < 0 ? -1 : 1) * sc0}, ${sc0})`;
      f.el.style.filter = `brightness(${(1 - 0.45 * k).toFixed(2)}) saturate(${(1 - 0.4 * k).toFixed(2)})`;
      f.el.style.opacity = (1 - 0.35 * k).toFixed(2);
    }
    // the strike: the head shoots down into the water; the catch is decided at the bottom of it
    const STK = CLAWM ? WADE.CLAW : WADE.SNAP;
    if (S.strike > 0) { S.strike -= dt; if (!S.tested && S.strike < STK - (CLAWM ? 0.24 : 0.14)) { S.tested = true; test(); } }
    // a caught fish is held in the jaws, then swallowed; a new fish comes later
    if (S.hold > 0) {
      S.hold -= dt; const f = S.held, mp = [MXs + 8, MYs + 8];
      f.el.style.left = mp[0] - f.w / 2 + 'px'; f.el.style.top = mp[1] - f.h / 2 + 'px'; f.el.style.transform = 'rotate(70deg) scale(.8)'; f.el.style.filter = ''; f.el.style.opacity = 1;
      if (S.hold <= 0) {
        AU.play('gulp'); f.el.remove(); f.st = 'gone'; S.fish.splice(S.fish.indexOf(f), 1);
        if (S.got >= NEED) finish(); else S.fish.push(mkFish(0));
      }
    }
    // a hint: a fish just under the surface right under the snout
    if (!S.done && S.got < 2 && S.idle > 4 && S.strike <= 0) {
      const ok = S.fish.some((f) => f.st === 'swim' && !f.deep && f.y < SHALLOW && f.x > ZONE[0] && f.x < ZONE[1]);
      hand.style.display = ok ? '' : 'none';
    }
    const sk = S.strike > 0 ? Math.sin(Math.PI * (1 - S.strike / STK)) : 0, hk = S.hold > 0 ? 0.15 : 0;
    const [b, f] = GL.autoGait(dino, 'stand', 0, S.t);
    if (CLAWM) {
      // the swing: the arms reach forward into the water, then sweep back and up; the body leans over the water a little
      const u = S.strike > 0 ? 1 - S.strike / STK : 0;
      b.claws = u < 0.35 ? -30 * G.smooth(0, 0.35, u) : -30 + 72 * G.smooth(0.35, 0.75, u) - 42 * G.smooth(0.75, 1, u);
      b.pitch = (b.pitch || 0) + 7 * sk; b.neck = (b.neck || 0) + 10 * sk + 5; b.head = (b.head || 0) + 5 * sk + 4;
    } else { b.neck = (b.neck || 0) + 34 * sk + 4 - 10 * hk; b.head = (b.head || 0) + 22 * sk + 3; }
    dino.blink = blink(S.t, dt); dino.pose(b, f);
  });
};
Scenes.wade = { enter(p) { (p && (p.mode === 'snap' || p.mode === 'claw') ? wadeSnap : wadeSieve)(p || {}); } };

/* ------------------------------------------------------------------ night · a young leaellynasaura in the long polar night.
   Dinosaur Cove (Victoria) lay inside the Antarctic circle then: in winter the sun did not rise for weeks. Its huge eyes saw in the
   dark: the finger moves its gaze (a circle of sight in the darkness), a tap on a fern shoot sends the little one there to eat it.
   Once two eyes shine in the dark: keep still until the hunter goes away — walking then costs a star. */
const NIGHT = { V: 180, N: 8 };
Scenes.night = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 2), NEED = p.need || 6, GY = G.floor(642, 30), ITK = p.item || 'it_shoots', IH = p.ih || [58, 74];
    G.h('div', 'full', sc, { background: '#04060d' });
    G.bgImg(p.bg || 'bg_caus_night');
    // a day picture made a moonlit night (a troodon hunts in a forest of North America)
    if (p.moon) G.h('div', 'full', sc, { background: 'rgba(14,26,70,.55)', mixBlendMode: 'multiply', pointerEvents: 'none' });
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: [p.icon || 'leaf', `0 / ${NEED}`] });
    GL.attach(sc);
    const box = p.box || [430, 170], K = fitK(sp.id, box[0], box[1]), d = MAN.auto[sp.id];
    const dino = GL.makeAuto(sp.id, { x: 330, y: GY, s: K, z: 4 });
    const STR = GL.autoStride(dino, 'walk') * K, blink = blinker();
    const mth = GL.restPt(dino, d.mouth), MO = (mth[0] - dino.ax) * K, MY = (mth[1] - dino.ay) * K;   // the muzzle from the feet
    // the fern shoots on the forest floor (none right at the start)
    const items = [], xs = [];
    for (let guard = 0; xs.length < NIGHT.N && guard < 500; guard++) {
      const x = G.rand(110, 1190);
      if (Math.abs(x - (330 + MO)) > 150 && xs.every((q) => Math.abs(q - x) > 105)) xs.push(x);
    }
    for (const x of xs) {
      const y = GY + G.rand(-34, 28), m = MAN[ITK], h = G.rand(IH[0], IH[1]);
      const it = GL.sprite(ITK, null, { ax: m.w / 2, ay: m.h * 0.95, s: h / m.h, x, y, z: y < GY ? 3 : 5, flip: Math.random() < 0.5 });
      items.push({ x, y, it, st: 'up', seen: false, s0: h / m.h, ph: G.rand(0, 6) });
    }
    // the darkness: a canvas over the picture with two holes — the gaze, and a faint glow about the little one
    const cv = G.h('canvas', 'full', sc, { pointerEvents: 'none' }); cv.width = 640; cv.height = 360;
    const cx = cv.getContext('2d');
    const dark = (holes) => {
      cx.globalCompositeOperation = 'source-over'; cx.clearRect(0, 0, 640, 360);
      cx.fillStyle = 'rgba(3,5,14,0.9)'; cx.fillRect(0, 0, 640, 360);
      cx.globalCompositeOperation = 'destination-out';
      for (const [x, y, r, a] of holes) {
        const g = cx.createRadialGradient(x / 2, y / 2, 0, x / 2, y / 2, r / 2);
        g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(0.5, `rgba(0,0,0,${a * 0.85})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        cx.fillStyle = g; cx.beginPath(); cx.arc(x / 2, y / 2, r / 2, 0, 7); cx.fill();
      }
    };
    // a hunter's eyes in the dark
    const eye = 'position:absolute;top:4px;width:15px;height:10px;border-radius:50%;background:#ffd23a;box-shadow:0 0 12px 4px rgba(255,190,40,.7)';
    const eyes = G.h('div', 'abs', sc, { width: 64, height: 18, opacity: 0, transition: 'opacity .5s', pointerEvents: 'none' },
      `<i style="${eye};left:0"></i><i style="${eye};right:0"></i>`);
    const red = () => { const r = G.h('div', 'full', G.ui, { background: 'radial-gradient(ellipse at 50% 50%,rgba(241,107,74,0) 40%,rgba(241,107,74,.45) 100%)', pointerEvents: 'none' }); G.tween(0.9, (e) => { r.style.opacity = 1 - e; }).then(() => r.remove()); };
    const S = { t: 0, gx: 640, gy: GY - 110, hold: false, x: 330, tx: null, item: null, face: 1, walkPh: 0, eat: 0, got: 0, miss: 0, oops: 0,
      pred: 0, predDone: false, oopsNow: false, done: false, down: null, idle: 0 };
    G.dbg = { S, dino, items };
    const hit = G.h('div', 'hit', sc);
    const hand = UI.hand(G.ui, 640, GY - 40, 'tap'); hand.style.display = 'none';
    const finish = async () => {
      S.done = true; S.tx = null; AU.play('ok'); AU.voiceOf(sp.id, { at: 0.2, vol: 0.55 });
      G.say(p.win || 'Наелся! Огромные глаза помогали малышу находить еду в долгую полярную ночь.');
      await G.wait(2.6); if (!G.alive(tok)) return;
      const stars = Math.max(1, 3 - (S.oops ? 1 : 0) - (S.miss >= 3 ? 1 : 0));
      chFinish(C.n, stars, { stat: `${p.stat || 'Ростков'}: ${S.got} · промахов: ${S.miss}` });
    };
    const startPred = () => {
      S.pred = 4.8; S.oopsNow = false; S.tx = null;
      const ex = S.x < 640 ? G.rand(990, 1130) : G.rand(150, 290), ey = GY - G.rand(150, 185);
      eyes.style.left = ex - 32 + 'px'; eyes.style.top = ey - 9 + 'px'; eyes.style.opacity = 1;
      AU.play('alert');
      G.say('Тсс! В темноте светятся чьи-то глаза. Замри и не двигайся, пока хищник не уйдёт!');
    };
    const eatIt = (it) => {
      it.st = 'gone'; it.it.visible = false; S.got++; top.counter.set(`${Math.min(S.got, NEED)} / ${NEED}`);
      AU.play(p.snd || 'pop'); G.fx.sparkle(it.x, it.y - 26, 8);
      if (S.got === 1) G.say(p.first || 'Хрум! Огромные глаза нашли росток даже в темноте.');
      if (S.got === 3 && !S.predDone) startPred();
      else if (S.got >= NEED) finish();
    };
    const go = (it) => {
      if (S.pred > 0) {    // the hunter looks this way: walking now would give the little one away
        if (!S.oopsNow) { S.oopsNow = true; S.oops++; AU.play('miss'); red(); G.say('Ой! Хищник заметил движение. Замри, пока он не уйдёт!'); }
        return;
      }
      S.item = it; S.face = it.x >= S.x + MO * S.face * 0.2 ? 1 : -1;
      S.tx = it.x - MO * S.face; S.eat = 0;
    };
    G.on(hit, 'pointerdown', (e) => {
      AU.unlock(); const q = G.bgPt(e);
      S.hold = true; S.pid = e.pointerId; S.gx = q.x; S.gy = q.y; S.down = { x: q.x, y: q.y, t: S.t, moved: 0 }; S.idle = 0;
      hand.style.display = 'none';
    });
    G.on(hit, 'pointermove', (e) => {
      if (!S.hold || e.pointerId !== S.pid) return;
      const q = G.bgPt(e); S.gx = q.x; S.gy = q.y;
      if (S.down) S.down.moved = Math.max(S.down.moved, Math.hypot(q.x - S.down.x, q.y - S.down.y));
    });
    const up = (e) => {
      if (!S.hold || e.pointerId !== S.pid) return;
      S.hold = false;
      if (S.done) return;
      const q = G.bgPt(e);
      let best = null, bd = 95;
      for (const it of items) { if (it.st !== 'up') continue; const dd = Math.hypot(it.x - q.x, it.y - 30 - q.y); if (dd < bd) { bd = dd; best = it; } }
      if (best) go(best);
      else if (S.down && S.t - S.down.t < 0.45 && S.down.moved < 24) {
        S.miss++; AU.play('miss');
        G.once('nmiss', p.missTip || 'Там ничего нет. Веди пальцем — так малыш смотрит вокруг — и ищи зелёные ростки.');
      }
      S.down = null;
    };
    G.on(window, 'pointerup', up); G.on(window, 'pointercancel', up);
    G.say(p.intro ? AU.alt(p.intro[0], p.intro[1]) : AU.alt('Полярная ночь: солнце не встаёт неделями. Но у малыша огромные глаза — он видит в темноте! Веди пальцем — так малыш смотрит вокруг. Увидел росток папоротника — нажми на него!',
      'Веди пальцем и ищи ростки папоротника!'));
    G.tick((dt) => {
      S.t += dt; S.idle += dt;
      // the gaze: under the finger; without it, a little ahead of the eyes
      if (!S.hold) {
        const hx = S.x + (MO + 170) * S.face, hy = GY + MY - 20, k = Math.min(1, dt * 2.2);
        S.gx += (hx - S.gx) * k; S.gy += (hy - S.gy) * k;
      }
      dark([[S.gx, S.gy, 250, 1], [S.x + MO * 0.45 * S.face, GY - 50, 190, 0.5]]);
      if (p.alive) for (const it of items) if (it.st === 'up') it.it.s = it.s0 * (1 + 0.035 * Math.sin(S.t * 3.1 + it.ph));   // small animals breathe
      for (const it of items) {
        if (it.st !== 'up' || it.seen) continue;
        if (Math.hypot(it.x - S.gx, it.y - 30 - S.gy) < 130) { it.seen = true; G.fx.sparkle(it.x, it.y - 34, 6); }
      }
      if (!S.done && S.idle > 9 && !S.hold && S.tx === null && S.pred <= 0) {
        const it = items.find((q) => q.st === 'up');
        if (it) { hand.style.left = it.x + 'px'; hand.style.top = it.y - 40 + 'px'; hand.style.display = ''; }
      }
      // the hunter
      if (S.pred > 0) {
        S.pred -= dt;
        eyes.style.opacity = (S.pred % 1.7) < 0.14 ? 0.15 : 1;    // a blink now and then
        if (S.pred <= 0) {
          eyes.style.opacity = 0; S.predDone = true;
          G.say('Хищник ушёл. Можно искать дальше.');
        }
      }
      // walking to a shoot, then a bite
      if (S.tx !== null && !S.done) {
        const dx = S.tx - S.x, step = NIGHT.V * dt;
        if (Math.abs(dx) <= step) { S.x = S.tx; S.tx = null; S.eat = 0.0001; }
        else { S.x += Math.sign(dx) * step; S.walkPh += (dt * 2 * Math.PI * NIGHT.V) / STR; }
      }
      if (S.eat > 0) {
        S.eat += dt;
        if (S.eat > 0.45 && S.item && S.item.st === 'up') eatIt(S.item);
        if (S.eat > 0.9) { S.eat = 0; S.item = null; }
      }
      dino.x = S.x; dino.flip = S.face < 0;
      let b, f;
      if (S.tx !== null) [b, f] = GL.autoGait(dino, 'walk', S.walkPh, 0); else [b, f] = GL.autoGait(dino, 'stand', 0, S.t);
      const bite = S.eat > 0 ? Math.sin(Math.min(1, S.eat / 0.9) * Math.PI) : 0;
      b.neck = (b.neck || 0) + 16 * bite; b.head = (b.head || 0) + 10 * bite;
      dino.blink = blink(S.t, dt); dino.pose(b, f);
    });
  },
};

/* ------------------------------------------------------------------ dive · a vegavis, an early relative of ducks and geese, dives for fish
   off the coast of Antarctica (Torres et al. 2025: a foot-propelled pursuit diver, like a loon or a grebe). It floats at the surface; a tap
   under the water sends it down there with kicks of its feet, then it comes back up for air. Fish dart away when it comes near: aim a little
   ahead of them. Once a mosasaur passes below: wait at the surface until it is gone (a dive then costs a star). */
const DIVE = { WY: 196, V: 520, UP: 330, CATCH: 80, N: 7, NEAR: 115, DART: 1.8 };
Scenes.dive = {
  enter(p) {
    const sc = G.scene$, tok = G.token, sp = G.SP(), C = chOf(p, 3), NEED = p.need || 6, WY = p.wy || DIVE.WY;
    G.h('div', 'full', sc, { background: '#0d3b4a' });
    G.bgImg(p.bg || 'bg_cant_dive');
    chHeader(C.n, C.name);
    const top = UI.topRight({ counter: [p.icon || 'fish', `0 / ${NEED}`] });
    GL.attach(sc);
    const box = p.box || [250, 120], K = fitK(sp.id, box[0], box[1]), d = MAN.auto[sp.id];
    // the bird turns about the middle of its body on the water line (sprite px: p.float, else the body dot at the belly line)
    const FP = p.float || [d.dots.body[0], d.bellyY ? d.bellyY - 30 : d.dots.body[1] + 60];
    const bird = GL.makeAuto(sp.id, { x: 640, y: WY, s: K, z: 5, ax: FP[0], ay: FP[1] });
    const mth = GL.restPt(bird, d.mouth), BX = (mth[0] - FP[0]) * K, BY = (mth[1] - FP[1]) * K;   // the beak from the turning point
    const beak = () => {
      const c = Math.cos(S.rot), s = Math.sin(S.rot), bx = BX * S.face;
      return [S.x + bx * c - BY * s, S.y + bx * s + BY * c];
    };
    // the water over the swimmers: a faint blue-green veil below the surface
    G.h('div', 'abs', sc, { left: 0, top: WY + 'px', width: '100%', height: 800 - WY + 'px', pointerEvents: 'none',
      background: 'linear-gradient(rgba(40,120,150,.14), rgba(10,60,90,.3))' });
    const fishes = [];
    // what it dives for (fish by default; the frog relative catches little crustaceans) and how big it is on the screen
    const PREY = p.prey || 'it_fish', PW = p.pw || [70, 92];
    for (let i = 0; i < DIVE.N; i++) {
      const m = MAN[PREY], w = G.rand(PW[0], PW[1]), dir = Math.random() < 0.5 ? -1 : 1, y = G.rand(WY + 120, 640), x = G.rand(80, 1200);
      const it = GL.sprite(PREY, null, { ax: m.w / 2, ay: m.h / 2, s: w / m.w, x, y, z: 4, flip: dir < 0 });
      fishes.push({ it, x, y0: y, y, dir, v: G.rand(50, 85), ph: G.rand(0, 6), st: 'swim', dart: 0 });
    }
    // the hunter that passes below once (a mosasaur at sea; in a pond a big hungry amphibian): its picture and size
    const FOE = p.foe || 'nb_kaikaifilu', fm = MAN[FOE];
    const foe = fm ? GL.sprite(FOE, null, { ax: fm.w / 2, ay: fm.h / 2, s: (p.foeW || 560) / fm.w, x: -900, y: p.foeY || 600, z: 3, flip: true }) : null;
    const red = () => { const r = G.h('div', 'full', G.ui, { background: 'radial-gradient(ellipse at 50% 50%,rgba(241,107,74,0) 40%,rgba(241,107,74,.45) 100%)', pointerEvents: 'none' }); G.tween(0.9, (e) => { r.style.opacity = 1 - e; }).then(() => r.remove()); };
    const S = { t: 0, x: 640, y: WY, mode: 'float', tx: 0, ty: 0, face: 1, rot: 0, ph: 0, got: 0, oops: 0, misses: 0, caught: false,
      foe: 0, fx: -900, foeDone: false, oopsNow: false, done: false, ended: false };
    G.dbg = { S, bird, fishes };
    const hit = G.h('div', 'hit', sc);
    const f0 = fishes[0];
    const hand = UI.hand(G.ui, f0.x, f0.y, 'tap');
    const bubbles = (x, y, n) => G.fx.burst(x, y, n, { type: 'dot', color: ['rgba(235,250,255,.85)', 'rgba(200,235,250,.7)'], s0: 20, s1: 70,
      a0: -2.6, a1: -0.5, g: -90, z0: 3, z1: 7, l0: 0.5, l1: 1.1, drag: 1.5 });
    const finish = async () => {
      S.ended = true; AU.play('ok'); AU.voiceOf(sp.id, { at: 0.2, vol: 0.55 });
      G.say(p.win || 'Отличная рыбалка! Учёные думают, что эта птица ныряла за рыбой и гребла под водой лапами.');
      await G.wait(2.6); if (!G.alive(tok)) return;
      const stars = S.oops === 0 ? 3 : S.oops === 1 ? 2 : 1;
      chFinish(C.n, stars, { stat: `${p.stat || 'Рыбок'}: ${S.got} · ошибок: ${S.oops}` });
    };
    G.on(hit, 'pointerdown', (e) => {
      AU.unlock(); if (S.done) return;
      const q = G.bgPt(e);
      if (q.y < WY + 40) { G.once('dhint', p.tip || 'Нажимай под водой — туда, где плавают рыбки.'); return; }
      if (S.mode !== 'float') return;
      hand.style.display = 'none';
      if (S.foe > 0) {
        if (!S.oopsNow) { S.oopsNow = true; S.oops++; AU.play('miss'); red(); G.say(p.foeOops || 'Ой! Внизу мозазавр — птица скорее вернулась наверх. Подожди, пока он уплывёт!'); }
        return;
      }
      S.mode = 'down'; S.tx = q.x; S.ty = Math.min(Math.max(q.y, WY + 70), 680); S.caught = false;
      if (Math.abs(S.tx - S.x) > 8) S.face = S.tx > S.x ? 1 : -1;
      AU.play('splash'); bubbles(S.x, WY + 10, 8);
    });
    G.say(p.intro ? AU.alt(p.intro[0], p.intro[1]) : AU.alt('Эта птица ныряла за рыбой и гребла под водой лапами! Нажми под водой — и она нырнёт туда.', 'Нажми под водой — и ныряй за рыбой!'));
    G.tick((dt) => {
      S.t += dt;
      // the fish swim to and fro; near the diving bird they dart away
      const [bx, by] = beak();
      for (const q of fishes) {
        if (q.st !== 'swim') continue;
        const near = S.mode === 'down' && Math.hypot(q.x - bx, q.y - by) < DIVE.NEAR;
        if (near && q.dart <= 0) { q.dart = 0.5; q.dir = q.x >= bx ? 1 : -1; q.it.flip = q.dir < 0; q.y0 += G.rand(-40, 40); }
        q.dart -= dt;
        q.x += q.dir * q.v * (q.dart > 0 ? DIVE.DART : 1) * dt;
        q.y = Math.min(670, Math.max(WY + 90, q.y0 + Math.sin(S.t * 1.3 + q.ph) * 12));
        if (q.x < -90) { q.x = 1370; } else if (q.x > 1370) { q.x = -90; }
        q.it.x = q.x; q.it.y = q.y;
        if (S.mode !== 'float' && Math.hypot(q.x - bx, q.y - by) < DIVE.CATCH) {
          q.st = 'gone'; q.it.visible = false; S.got++; S.caught = true; top.counter.set(`${Math.min(S.got, NEED)} / ${NEED}`);
          AU.play('gulp'); G.fx.sparkle(q.x, q.y, 8); bubbles(q.x, q.y, 6);
          if (S.got === 1) G.say(p.first || 'Поймала! Под водой птица гребла лапами — быстро, как гагара.');
          if (S.got >= NEED) S.done = true;
          if (S.mode === 'down') { S.mode = 'up'; }
          // a new fish comes from the side, so there are always some to catch
          if (!S.done) { const side = Math.random() < 0.5 ? -1 : 1; Object.assign(q, { st: 'swim', x: side < 0 ? -80 : 1360, dir: -side, y0: G.rand(WY + 120, 640), dart: 0 }); q.it.flip = q.dir < 0; q.it.visible = true; }
        }
      }
      // the mosasaur passes once below, after two fish
      if (!S.foeDone && S.foe <= 0 && S.got >= 2 && S.mode === 'float' && foe) {
        S.foe = 1; S.fx = 1560; S.oopsNow = false; AU.play('alert');
        G.say(p.foeAlert || 'Осторожно! Внизу проплывает мозазавр. Подожди наверху, пока он не уплывёт!');
      }
      if (S.foe > 0) {
        S.fx -= (p.foeV || 240) * dt; foe.x = S.fx; foe.y = (p.foeY || 600) + Math.sin(S.t * 0.9) * 10;
        if (S.mode === 'down') S.mode = 'up';
        if (S.fx < -520) { S.foe = 0; S.foeDone = true; G.say(p.foeGone || 'Мозазавр уплыл. Ныряй дальше!'); }
      }
      // the bird
      if (S.mode === 'float') {
        S.y = WY + Math.sin(S.t * 2.1) * 2.5; S.rot += (0 - S.rot) * Math.min(1, dt * 5); S.ph += dt * 2.5;
        if (S.done && !S.ended) finish();
      } else {
        const up = S.mode === 'up', tx = up ? S.tx : S.tx, ty = up ? WY : S.ty;
        const dx = tx - S.x, dy = ty - S.y, dist = Math.hypot(dx, dy), v = up ? DIVE.UP : DIVE.V;
        if (dist <= v * dt) {
          S.x = tx; S.y = ty;
          if (!up) { S.mode = 'up'; S.tx = Math.min(1180, Math.max(100, S.x + S.face * 140)); }
          else {
            S.mode = 'float'; bubbles(S.x, WY, 6);
            if (!S.caught && !S.done) { S.misses++; if (S.misses >= 2) G.once('dlead', p.lead || 'Рыбки уплывают! Нажимай чуть впереди рыбки.'); }
          }
        } else {
          S.x += (dx / dist) * v * dt; S.y += (dy / dist) * v * dt;
          if (Math.abs(dx) > 4) S.face = dx > 0 ? 1 : -1;
          const want = Math.max(-1.1, Math.min(1.1, Math.atan2(dy, Math.abs(dx) + 1))) * S.face;
          S.rot += (want - S.rot) * Math.min(1, dt * 8);
          if (Math.random() < dt * 6) bubbles(S.x - BX * 0.6 * S.face, S.y, 1);
        }
        S.ph += dt * 9;
      }
      bird.x = S.x; bird.y = S.y; bird.rot = S.rot; bird.flip = S.face < 0;
      const [b, f] = GL.autoGait(bird, 'walk', S.ph, 0);
      if (S.mode !== 'float') { b.neck = (b.neck || 0) - 6; }
      bird.pose(b, f);
    });
  },
};

