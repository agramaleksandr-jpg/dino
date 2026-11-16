'use strict';
/* ==================================================================== chapter 5: hunt (level select · run · grip · endless) */
const GROUND = 566;
const RUN = { x: 330, s: 0.46, ax: 401, ay: 351 };
const PREY = { s: 0.44, ax: 251, ay: 207, near: 770, far: 1130 };

Scenes.hunt = {
  enter(p) {
    const mode = p.mode || 'select';
    if (mode === 'run') return this.run(p.level || 0, false);
    if (mode === 'endless') return this.run(2, true);
    if (mode === 'grip') return this.grip(p.level || 0, p.stumbles || 0);
    return this.select();
  },

  /* ---------------- level select */
  select() {
    const st = G.state;
    const bg = G.bgImg('bg_grip');
    bg.style.filter = 'blur(10px) brightness(.5)'; bg.style.transform = 'scale(1.06)';
    UI.header('Глава 5 · Охота', 'Жизнь герреразавра · глава 5 из 5', () => G.go('path'));
    UI.topRight();
    const m = G.h('div', 'plate abs', G.ui, { width: 800, height: 494, '--c': '12px', '--pbg': 'rgba(18,22,27,.86)' });
    const k = Math.min(1, (G.H - 120) / 494, (G.W - 40) / 800);
    m.style.left = Math.round((G.W - 800 * k) / 2) + 'px'; m.style.top = Math.round(96 + (G.H - 110 - 494 * k) / 2) + 'px';
    m.style.transform = `scale(${k})`; m.style.transformOrigin = '0 0';
    G.h('div', 'abs t-title', m, { left: 0, right: 0, top: 24, textAlign: 'center', fontSize: '34px' }, 'Выбери уровень');
    G.h('div', 'abs t-sub', m, { left: 0, right: 0, top: 74, textAlign: 'center', fontSize: '16px' }, 'Чем выше уровень, тем быстрее бегает добыча');
    const open = (i) => i === 0 || st.hunt[DATA.levels[i - 1].id] > 0;
    DATA.levels.forEach((L, i) => {
      const done = st.hunt[L.id] > 0, op = open(i);
      const c = G.h('button', 'plate abs pe', m, { left: 32 + i * 252, top: 116, width: 232, height: 232, '--pst': op ? L.color : 'rgba(255,255,255,.25)', '--bw': '2px', '--pbg': 'rgba(18,22,27,.55)', opacity: op ? 1 : 0.6 });
      const pm = MAN.prey, ps = 190 / pm.w;
      c.innerHTML = `<div class="abs" style="left:20px;top:14px;font:600 28px Oswald,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:${op ? L.color : '#aaa'}">${L.name}</div>
        <div class="abs row" style="right:18px;top:22px;gap:2px">${[0, 1, 2].map((z) => icon('zap', ` style="width:20px;height:20px;color:${z < L.speed ? L.color : 'rgba(255,255,255,.22)'}"`)).join('')}</div>
        <img src="${G.img.prey.src}" class="abs" style="left:${116 - (pm.w * ps) / 2}px;top:76px;width:${pm.w * ps}px;height:${pm.h * ps}px;${op ? '' : 'filter:brightness(0) opacity(.5)'}">
        <div class="abs" style="left:20px;bottom:16px">${done ? UI.steps(st.hunt[L.id], 26) : op ? '<span style="display:inline-block;padding:4px 12px;border-radius:14px;background:#F2B640;color:#2A1E05;font:600 16px Oswald,sans-serif;letter-spacing:.06em;text-transform:uppercase">Новое!</span>' : icon('lock', ' style="width:26px;height:26px;color:#ccc"')}</div>
        ${done ? `<div class="abs" style="right:16px;bottom:14px;width:34px;height:34px;border-radius:50%;background:#4CD26B;border:2.5px solid #fff;display:flex;align-items:center;justify-content:center">${icon('check', ' style="width:20px;height:20px;color:#2A1E05"')}</div>` : ''}`;
      UI.tap(c, () => {
        if (!op) { UI.toast(`Сначала пройди уровень «${DATA.levels[i - 1].name}»`); return; }
        G.go('hunt', { mode: 'run', level: i });
      });
    });
    const allDone = DATA.levels.every((L) => st.hunt[L.id] > 0);
    const en = G.h('button', 'plate abs pe', m, { left: 32, top: 372, width: 736, height: 92, '--pbg': 'rgba(18,22,27,.5)', '--pst': allDone ? '#F2B640' : 'rgba(255,255,255,.2)', '--bw': allDone ? '2px' : '1px' });
    en.innerHTML = `<div class="abs" style="left:24px;top:30px;color:#F4F1EA;opacity:${allDone ? 1 : 0.7}">${icon(allDone ? 'infinity' : 'lock', ' style="width:32px;height:32px"')}</div>
      <div class="abs" style="left:76px;top:14px;font:600 24px Oswald,sans-serif;letter-spacing:.04em;text-transform:uppercase;${allDone ? 'color:#F2B640' : 'opacity:.62'}">Бесконечная охота</div>
      <div class="abs t-sub" style="left:76px;top:52px;font-size:15px;opacity:.7">${allDone ? 'Сколько добычи поймаешь за минуту?' : 'Откроется, когда пройдёшь все три уровня'}</div>
      <div class="abs" style="right:24px;top:32px;font:500 17px Rubik,sans-serif;opacity:${allDone ? 1 : 0.5}">Рекорд: ${st.record || '—'}</div>`;
    UI.tap(en, () => { if (!allDone) { UI.toast('Пройди «Легко», «Средне» и «Трудно»'); return; } G.go('hunt', { mode: 'endless' }); });
    const nxt = DATA.levels.findIndex((L, i) => open(i) && !(st.hunt[L.id] > 0));
    G.onceApp('hunt-menu-' + nxt + (allDone ? '-all' : ''), nxt >= 0 ? `Охота начинается! Выбери уровень «${DATA.levels[nxt].name}».` : allDone ? 'Все уровни пройдены! Попробуй бесконечную охоту и поставь рекорд.' : 'Выбери уровень.');
  },

  /* ---------------- run */
  run(li, endless) {
    const L = DATA.levels[li], st = G.state, sc = G.scene$, tok = G.token;
    G.h('div', 'full', sc, { background: '#2a1f15' });
    GL.attach(sc);
    const tw = 1280, tiles = [0, 1, 2].map((i) => GL.sprite('bg_run', null, { s: 1280 / 1536, ax: 768, ay: 432, y: 360, flip: i === 1, z: 0 }));
    const prey = GL.sprite('prey', GL.RIGS.prey(), { s: PREY.s, ax: PREY.ax, ay: PREY.ay, y: GROUND, z: 3 });
    const runner = GL.makeCreature('runner', { s: RUN.s, ax: RUN.ax, ay: RUN.ay, x: RUN.x, y: GROUND, z: 5 });
    // one gait cycle covers this much ground (design px) — the planted foot never slides
    const CYCLE = GL.Gaits.RUN.cycle * RUN.s;
    const S = {
      scroll: 0, ph: 0, pph: 0, d: endless ? 0.75 : 1, stam: 1, tired: false, down: false, downT: 0, sprint: false,
      jy: 0, jv: 0, airW: 0, logs: [], nextLog: 2.6, stumbles: 0, slow: 0, t: 0, preyJ: 0, preyV: 0, stepAcc: 0,
      firstLog: true, done: false, caught: 0, time: 60, gripping: false, blinks: [],
    };
    G.dbg = { S, prey, runner };
    // UI
    UI.pauseBtn(() => G.go('hunt'));
    G.h('div', 'abs', G.ui, { left: 104, top: 30 }, `<div class="t-title">${endless ? 'Бесконечная охота' : 'Охота · ' + L.name}</div><div class="t-sub">${endless ? 'Лови добычу, пока идёт время' : 'Догони гиперодапедона'}</div>`);
    UI.topRight();
    const dist = G.h('div', 'plate abs', G.ui, { left: Math.round(G.W / 2 - 160), top: 28, width: 320, height: 56 });
    dist.innerHTML = `<div class="abs" style="left:12px;top:10px">${silSvg('herrera', '#F2B640', ' style="width:64px;height:25px"')}</div>
      <div class="abs dots" style="left:88px;top:24px;display:flex;gap:12px">${[0, 1, 2, 3, 4, 5].map(() => '<i style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.3)"></i>').join('')}</div>
      <img class="abs" src="${G.img.prey.src}" style="right:12px;top:12px;width:66px;height:28px;filter:brightness(0) invert(.95)">`;
    const dots = [...dist.querySelectorAll('.dots i')];
    const sta = G.h('div', 'plate abs', G.ui, { left: 32, bottom: 26, width: 252, height: 56 });
    sta.innerHTML = `<div class="abs" style="left:14px;top:15px;color:#F2B640">${icon('zap', ' style="width:26px;height:26px"')}</div>
      <div class="abs" style="left:56px;top:21px;width:172px;height:14px;border-radius:7px;background:rgba(255,255,255,.16)"></div>
      <div class="abs fill" style="left:56px;top:21px;width:172px;height:14px;border-radius:7px;background:linear-gradient(90deg,#4CD26B,#F2B640)"></div>`;
    const fill = sta.querySelector('.fill');
    let timer = null;
    if (endless) {
      timer = G.h('div', 'plate abs row', G.ui, { right: 32, bottom: 26, height: 56, gap: '10px', padding: '0 18px 0 14px' });
      timer.style.font = '600 22px Oswald,sans-serif';
    }
    const hint = UI.hand(G.ui, G.W / 2, G.H / 2, 'tap'); hint.style.display = 'none';
    UI.narrArea = { x0: 300, x1: G.W - (endless ? 360 : 20) };
    G.say(endless ? 'Бесконечная охота! Нажимай — прыжок, держи — ускорение.' : 'Беги за добычей! Нажми — прыжок через бревно. Держи палец — ускорение.');
    // input
    const hit = G.h('div', 'hit', sc);
    G.on(hit, 'pointerdown', (e) => {
      AU.unlock();
      if (S.gripping) { gripTap(); return; }
      S.down = true; S.downT = 0; S.pid = e.pointerId;
    });
    const up = (e) => {
      if (e.pointerId !== S.pid || !S.down) return;
      if (S.downT < 0.2) jump();
      S.down = false; S.sprint = false;
    };
    G.on(window, 'pointerup', up); G.on(window, 'pointercancel', up);
    const jump = () => {
      if (S.jy < -2 || S.done) return;
      S.jv = -950; AU.play('jump'); hint.style.display = 'none'; S.jumps = (S.jumps || 0) + 1;
      G.fx.dust(RUN.x, GROUND, 6);
    };
    const spawnLog = () => {
      const lg = GL.sprite('log', null, { s: 0.42, ax: 142, ay: 126, x: 1400, y: GROUND + 4, z: 4 });
      S.logs.push({ it: lg, x: 1400, hit: false, preyDone: false });
    };
    // endless: quick grip inline
    const ring = G.h('div', 'abs', sc, { left: 0, top: 0, width: 1280, height: 720, pointerEvents: 'none', display: 'none' },
      '<svg width="1280" height="720"><circle class="t" r="46" fill="rgba(76,210,107,.12)" stroke="#fff" stroke-width="3"/><circle class="r" r="120" fill="none" stroke="#F2B640" stroke-width="6"/></svg>');
    const rT = ring.querySelector('.t'), rR = ring.querySelector('.r');
    const gripTap = () => {
      if (!S.gripping) return;
      const r = S.gr;
      if (Math.abs(r - 46) <= 17) {
        S.gripping = false; ring.style.display = 'none';
        S.caught++; AU.play('catch'); G.fx.sparkle(prey.x, GROUND - 60, 18);
        UI.popText(sc, 'Поймал!', prey.x, GROUND - 130, '#F2B640', 34);
        S.d = 1; prey.alpha = 0; G.tween(0.6, (e) => { prey.alpha = e; });
      } else { AU.play('miss'); UI.popText(sc, r > 46 ? 'Рано!' : 'Поздно!', prey.x, GROUND - 130, '#fff', 28); S.gripping = false; ring.style.display = 'none'; S.d = 0.55; }
      S.slow = 0;
    };
    const finishEndless = () => {
      S.done = true;
      const rec = st.record || 0, best = S.caught > rec;
      if (best) { st.record = S.caught; G.save(); }
      AU.play('win');
      const m = UI.modal(560, 330);
      G.h('div', 'abs t-title gold', m.box, { left: 0, right: 0, top: 30, textAlign: 'center', fontSize: '38px' }, best ? 'Новый рекорд!' : 'Время вышло!');
      G.h('div', 'abs', m.box, { left: 0, right: 0, top: 96, textAlign: 'center', font: '600 64px Oswald,sans-serif' }, String(S.caught));
      G.h('div', 'abs t-sub', m.box, { left: 0, right: 0, top: 172, textAlign: 'center', fontSize: '16px' }, `Поймано за минуту · рекорд: ${st.record}`);
      UI.secBtn(m.box, 'К уровням', 'left', { l: 40, t: 236 }, 220, () => { m.close(); G.go('hunt'); });
      UI.mainBtn(m.box, 'Ещё раз', 'retry', { l: 290, t: 236 }, 230, () => { m.close(); G.go('hunt', { mode: 'endless' }); });
      G.say(best ? `Новый рекорд: ${S.caught}!` : `Поймано: ${S.caught}. Попробуй ещё раз!`);
    };
    const catchIt = async () => {
      S.done = true;
      G.say('Догнал! Теперь хватай!');
      AU.play('whoosh');
      await G.wait(0.5); if (!G.alive(tok)) return;
      G.go('hunt', { mode: 'grip', level: li, stumbles: S.stumbles });
    };
    G.tick((dt) => {
      if (S.done && !endless) { const [bp, feet] = GL.Gaits.run(S.ph, 0); runner.pose(bp, feet); return; }
      if (S.done) return;
      S.t += dt;
      const sdt = S.gripping ? dt * 0.12 : dt;
      if (S.down) { S.downT += dt; if (S.downT >= 0.2 && !S.tired && S.stam > 0.02) S.sprint = true; }
      if (S.sprint) { S.stam -= 0.42 * dt; if (S.stam <= 0) { S.stam = 0; S.tired = true; S.sprint = false; } }
      else { S.stam = Math.min(1, S.stam + 0.24 * dt); if (S.tired && S.stam > 0.3) S.tired = false; }
      fill.style.width = 172 * S.stam + 'px';
      fill.style.opacity = S.tired ? 0.45 : 1;
      if (S.slow > 0) S.slow -= dt;
      const pace = L.pace * (endless ? 1 + Math.min(0.5, S.t / 120) : 1) * (S.sprint ? 1.45 : 1) * (S.slow > 0 ? 0.55 : 1);
      S.scroll += pace * sdt;
      const x0 = -(S.scroll % (2 * tw));
      tiles[0].x = x0 + 640; tiles[1].x = x0 + 1920; tiles[2].x = x0 + 3200;
      // distance
      if (!S.gripping) {
        S.d -= (L.gain + (S.sprint ? L.sprint : 0)) * dt * (S.slow > 0 ? -0.6 : 1);
        S.d = G.clamp(S.d, 0, 1);
      }
      const on = Math.round((1 - S.d) * 6);
      dots.forEach((d, i) => { d.style.background = i < on ? '#F2B640' : 'rgba(255,255,255,.3)'; });
      // runner
      S.jv += 2300 * sdt; S.jy += S.jv * sdt;
      if (S.jy > 0) { if (S.jv > 300) G.fx.dust(RUN.x, GROUND, 5); S.jy = 0; S.jv = 0; }
      const air = S.jy < -4;
      S.airW = G.clamp(S.airW + (air ? 1 : -1) * dt * 9, 0, 1);
      S.ph += sdt * Math.PI * 2 * (pace / CYCLE);
      const [pose, feet] = GL.Gaits.run(S.ph, G.ease.inOut(S.airW));
      if (S.slow > 0) pose.head = (pose.head || 0) + 6;
      runner.pose(pose, feet);
      runner.y = GROUND + S.jy;
      runner.rot = air ? -0.05 + S.jv * 0.00005 : (S.slow > 0 ? 0.05 : 0);
      if (!air) {
        S.stepAcc += sdt * (pace / CYCLE) * 2;
        if (S.stepAcc > 1) { S.stepAcc = 0; AU.play('step'); if (Math.random() < 0.6) G.fx.dust(RUN.x + G.rand(-40, 60), GROUND, 3); }
      }
      if (Math.random() < dt / 3) S.blinks.push(S.t);
      let bl = 0; for (const b of S.blinks) { const d = S.t - b; if (d > 0 && d < 0.18) bl = Math.sin((Math.PI * d) / 0.18); }
      runner.blink = bl;
      // prey
      const px = G.lerp(PREY.near, PREY.far, S.d);
      prey.x = G.lerp(prey.x || px, px, Math.min(1, dt * 4));
      S.pph += sdt * Math.PI * 2 * 3.1;
      S.preyV += 2400 * sdt; S.preyJ += S.preyV * sdt; if (S.preyJ > 0) { S.preyJ = 0; S.preyV = 0; }
      prey.y = GROUND + S.preyJ - Math.abs(Math.sin(S.pph)) * 5;
      prey.mesh.deform(Pose.trot(S.pph, S.preyJ < -4));
      prey.rot = S.preyJ < -4 ? -0.08 : 0;
      // logs
      S.nextLog -= sdt;
      if (S.nextLog <= 0 && !S.gripping) { spawnLog(); S.nextLog = G.rand(L.logs[0], L.logs[1]) * (endless ? Math.max(0.65, 1 - S.t / 150) : 1); }
      for (const lg of S.logs) {
        lg.x -= pace * sdt; lg.it.x = lg.x;
        if (!lg.preyDone && lg.x < prey.x + 90 && lg.x > prey.x - 60 && lg.x < 1300) { lg.preyDone = true; S.preyV = -760; }
        if (!endless && (S.jumps || 0) < 2 && !lg.hinted && lg.x < 640 && lg.x > RUN.x + 60) { lg.hinted = true; hint.style.display = ''; hint.style.left = G.bgToWorld(lg.x, GROUND - 40).x + 'px'; hint.style.top = G.bgToWorld(lg.x, GROUND - 40).y + 'px'; if (S.firstLog) { S.firstLog = false; G.say('Бревно! Нажми — и прыгай!'); } }
        if (lg.hinted && lg.x < RUN.x) { hint.style.display = 'none'; }
        if (!lg.hit && lg.x < RUN.x + 60 && lg.x > RUN.x - 10 && S.jy > -25) {
          lg.hit = true; S.stumbles++; S.slow = 0.9; S.d = Math.min(1, S.d + 0.1);
          AU.play('thud'); G.fx.dust(lg.x, GROUND, 12); G.fx.burst(lg.x, GROUND - 20, 8, { type: 'chip', color: ['#6e5238', '#9b7a58'], s0: 100, s1: 260, a0: Math.PI * 1.1, a1: Math.PI * 1.9, g: 900, z0: 3, z1: 7 });
          if (S.stumbles === 1) G.say('Ой, споткнулся! Прыгай через брёвна.');
        }
      }
      for (const lg of S.logs.slice()) if (lg.x < -200) { GL.remove(lg.it); S.logs.splice(S.logs.indexOf(lg), 1); }
      // endless
      if (endless) {
        if (!S.gripping) S.time -= dt;
        timer.innerHTML = `${icon('timer', ' style="width:24px;height:24px;color:#F2B640"')}<span>${Math.max(0, Math.ceil(S.time))} с · поймано ${S.caught} · рекорд ${st.record || 0}</span>`;
        if (S.time <= 0) { finishEndless(); return; }
        if (S.d <= 0.02 && !S.gripping) { S.gripping = true; S.gt = 0; ring.style.display = ''; G.say('Хватай!', { silent: true }); }
        if (S.gripping) {
          S.gt += dt;
          const r = (S.gr = 130 - 100 * (S.gt / 1.3));
          const cx = prey.x, cy = GROUND - 70;
          rT.setAttribute('cx', cx); rT.setAttribute('cy', cy); rR.setAttribute('cx', cx); rR.setAttribute('cy', cy); rR.setAttribute('r', Math.max(4, r));
          rR.setAttribute('stroke', Math.abs(r - 46) <= 17 ? '#4CD26B' : '#F2B640');
          if (S.gt > 1.3) { AU.play('miss'); S.gripping = false; ring.style.display = 'none'; S.d = 0.55; }
        }
      } else if (S.d <= 0.02) catchIt();
    });
  },

  /* ---------------- grip */
  grip(li, stumbles) {
    const L = DATA.levels[li], st = G.state, sc = G.scene$, tok = G.token;
    G.bgImg('bg_grip');
    G.h('div', 'abs', sc, { left: 0, top: 0, width: 1280, height: 200, background: 'linear-gradient(rgba(7,9,11,.6),rgba(7,9,11,0))' });
    UI.pauseBtn(() => G.go('hunt'));
    G.h('div', 'abs', G.ui, { left: 104, top: 30 }, `<div class="t-title">Охота · ${L.name}</div><div class="t-sub">Хватай добычу!</div>`);
    UI.topRight();
    const pips = G.h('div', 'plate abs row', G.ui, { left: Math.round(G.W / 2 - 92), top: 28, width: 184, height: 56, gap: '16px', justifyContent: 'center' });
    pips.innerHTML = [0, 1, 2].map(() => '<i style="width:28px;height:28px;border-radius:50%;border:2px solid rgba(255,255,255,.55);background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center"></i>').join('');
    const P = [...pips.children];
    const T = [933, 433];
    const ring = G.h('div', 'abs', sc, { left: 0, top: 0, width: 1280, height: 720, pointerEvents: 'none' },
      `<svg width="1280" height="720"><circle cx="${T[0]}" cy="${T[1]}" r="46" fill="rgba(76,210,107,.12)" stroke="#fff" stroke-width="3" style="filter:drop-shadow(0 0 6px rgba(0,0,0,.5))"/>
       <circle cx="${T[0]}" cy="${T[1]}" r="7" fill="#F2B640" stroke="#fff" stroke-width="2"/>
       <circle class="r" cx="${T[0]}" cy="${T[1]}" r="140" fill="none" stroke="#F2B640" stroke-width="7" style="filter:drop-shadow(0 0 8px rgba(242,182,64,.85))"/></svg>`);
    const rr = ring.querySelector('.r'), tgt = ring.querySelector('circle');
    const S = { t: 0, ok: 0, miss: 0, done: false, lock: 0 };
    G.dbg = { S, L };
    const hand = UI.hand(sc, T[0] + 40, T[1] + 40);
    G.say('Жми, когда кольца совпадут!');
    G.on(sc, 'pointerdown', () => {
      AU.unlock();
      if (S.done || S.lock > 0) return;
      hand.style.display = 'none';
      const r = 140 - 120 * (S.t / L.ring);
      if (Math.abs(r - 46) <= 16) {
        P[S.ok].style.background = '#F2B640'; P[S.ok].style.borderColor = '#fff';
        P[S.ok].innerHTML = icon('check', ' style="width:18px;height:18px;color:#2A1E05"');
        S.ok++; AU.play('ok'); G.fx.sparkle(T[0], T[1], 16);
        tgt.setAttribute('fill', 'rgba(76,210,107,.55)'); setTimeout(() => tgt.setAttribute('fill', 'rgba(76,210,107,.12)'), 220);
        if (S.ok >= 3) return win();
      } else {
        S.miss++; AU.play('miss');
        UI.popText(sc, r > 46 ? 'Рано!' : 'Поздно!', T[0], T[1] - 110, '#fff', 30);
      }
      S.t = 0; S.lock = 0.25;
    });
    const win = async () => {
      S.done = true; ring.style.display = 'none';
      AU.play('catch'); UI.flash(G.ui, 0.5, 0.6);
      UI.popText(sc, 'Поймал!', T[0], T[1] - 60, '#F2B640', 64);
      G.say('Поймал! Вот это охотник!');
      await G.wait(1.6); if (!G.alive(tok)) return;
      const total = stumbles + S.miss, stars = total <= 1 ? 3 : total <= 3 ? 2 : 1;
      const firstHunt = !G.chDone(5);
      st.hunt[L.id] = Math.max(st.hunt[L.id] || 0, stars);
      const newFact = !st.facts.legs ? 'legs' : null;
      st.facts.legs = true; st.facts.tail = true;
      G.setCh(5, Math.max(G.chStars(5), stars));
      const allDone = DATA.levels.every((q) => st.hunt[q.id] > 0);
      UI.result({
        title: `Уровень «${L.name}» пройден!`, stars, chapter: 5, age: 3,
        stat: `Споткнулся: ${stumbles} · промахов: ${S.miss}`,
        fact: newFact ? DATA.facts.legs : null,
        note: allDone ? 'Все три уровня пройдены — открыта бесконечная охота с рекордом!' : 'Пройди все три уровня, и откроется бесконечная охота.',
        onRetry: () => G.go('hunt', { mode: 'run', level: li }),
        onNext: () => (firstHunt ? G.go('path', { grown: true }) : G.go('hunt')),
        nextText: 'Дальше',
      });
    };
    G.tick((dt) => {
      if (S.done) return;
      if (S.lock > 0) { S.lock -= dt; return; }
      S.t += dt; if (S.t > L.ring) { S.t = 0; }
      const r = 140 - 120 * (S.t / L.ring);
      rr.setAttribute('r', Math.max(4, r));
      rr.setAttribute('stroke', Math.abs(r - 46) <= 16 ? '#4CD26B' : '#F2B640');
    });
  },
};
