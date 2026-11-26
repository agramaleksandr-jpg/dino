'use strict';
/* ==================================================================== museum · chapters path · finale (all species) */
const CAM_C = [862.6, 429.8];
/** placement, rig and poses of a species exhibit */
function museumModel(id) {
  let M;
  if (id !== 'herrera') M = DATA.species[id].model();
  else {
    const O = [POS.close.f[0] - POS.close.k * POS.feet[0], POS.close.f[1] - POS.close.k * POS.feet[1]];
    const dots = {};
    for (const k in POS.dots) dots[k] = [(POS.dots[k][0] - O[0]) / POS.close.k, (POS.dots[k][1] - O[1]) / POS.close.k];
    M = { key: 'hero', rig: () => GL.RIGS.hero(), pose: Pose.hero, ax: POS.feet[0], ay: POS.feet[1], hall: POS.hall, close: POS.close, dots,
      tap: 'roar', sound: 'roar', factAct: { mouth: 'roar', tail: 'flick', legs: 'step', arms: 'look' } };
  }
  fitPedestal(M, id);
  return M;
}
/** how the exhibit stands: on its feet, or floating over the pedestal (flyers, swimmers) */
const exhibitKind = (id) => {
  const t = (MAN.auto && MAN.auto[id] && MAN.auto[id].type) || { herrera: 'biped', plateo: 'biped', eudimo: 'flyer', shoni: 'swim' }[id];
  return t === 'flyer' || t === 'glider' ? 'fly' : t === 'swim' ? 'swim' : 'walk';
};
/** the space an exhibit may take on the pedestal (design px): hall = the middle pedestal, close = the close-up */
const PED = {
  hall: { x: 638, feet: 418, top: 398, walk: [240, 150], fly: [235, 170], swim: [255, 100], c: { fly: 340, swim: 372 } },
  close: { x: 390, feet: 405, top: 376, walk: [460, 250], fly: [420, 290], swim: [470, 195], c: { fly: 262, swim: 300 } },
};
/** content box of a sprite (pixels with paint) */
const SPRITE_BOX = { hero: [7, 1491, 7, 579], sp_plateo: [7, 1500, 7, 707], sp_eudimo: [7, 1487, 7, 749], sp_shoni: [7, 1490, 7, 564] };
/** place an exhibit so that the whole animal stays over the pedestal */
function fitPedestal(M, id) {
  const d = MAN.auto && MAN.auto[id], box = d ? d.box : SPRITE_BOX[M.key];
  if (!box) return;
  const [X0, X1, Y0, Y1] = box, bw = X1 - X0, bh = Y1 - Y0, cx = (X0 + X1) / 2, cy = (Y0 + Y1) / 2, kind = exhibitKind(id);
  for (const v of ['hall', 'close']) {
    const P = PED[v], lim = P[kind], k = Math.min(lim[0] / bw, lim[1] / bh), x = P.x + (M.ax - cx) * k;
    const y = kind === 'walk' ? P.feet + (M.ay - Y1) * k : Math.min(P.c[kind], P.top - (bh * k) / 2) + (M.ay - cy) * k;
    M[v] = { f: [x, y], k };
  }
  M.box = box; M.kind = kind;
  closeLayout(M, id);
}

/** close-up "camera". The pedestal (ped_close) is a picture of its own over the empty hall (bg_close2):
 *  a giant stands big on a small pedestal and the hall looks far away; a small animal gets a big pedestal
 *  and the camera comes close (the hall is zoomed in). The pedestal always holds the animal's feet. */
const PEDI = { w: 1124, cx: 561.5, top: 82, bot: 486 };   // ped_close.webp: the centre of the top and the bottom of the front
const HORIZON = 358;                                        // where the floor meets the hall in bg_close2 (design px)
/** feet span of the walkers in sprite px (the lowest band of the picture): the pedestal must hold them */
const FEET = {"glacia":[636,908],"sidero":[261,903],"coelo":[655,982],"eorap":[446,704],"posto":[617,1193],"sauro":[611,1204],"cyno":[16,732],"lystro":[39,683],"placer":[74,796],"desma":[580,1206],"liso":[37,724],"rioja":[561,1113],"masto":[504,1091],"isano":[581,1175],"loto":[514,1103],"shringa":[546,1196],"shansi":[555,1270],"stego":[312,723],"mamen":[558,975],"dilo":[565,897],"cryolo":[615,1014],"megalo":[606,1024],"lourin":[610,995],"giraffa":[75,648],"herrera":[680,1019],"plateo":[500,1055],"allo":[624,1024],"cerato":[514,903],"diplo":[619,1119],"ornitho":[580,897],"scutel":[582,821],"sarah":[626,1011],"fruita":[165,683],"kther":[242,1116],"kchel":[83,1226],"piat":[663,1046],"brachy":[663,1262],"chile":[612,1016],"compso":[346,580],"cetio":[526,1071],"europa":[293,625],"scelido":[552,1159],"miragaia":[547,1133],"torvo":[518,1067],"shuno":[362,781],"barapa":[578,1097],"guan":[669,1074],"limu":[572,938],"yin":[550,925],"kulinda":[587,1023],"gigant":[550,1279],"anchi":[316,740],"epidex":[438,666],"castoro":[431,1280],"kara":[583,1150],"kentro":[585,1083],"dysalo":[474,835],"masso":[640,956],"hetero":[372,615],"spico":[521,1256]};
/** passports without a length in metres (erythrosuchids like the shansisuchus were 2–5 m long) */
const SIZE_FIX = { shansi: 3.5, fruita: 0.15, kther: 0.9, yiqi: 0.6 };
/** the animal's real size in metres, from its passport ("До 10 м", "≈ 50 см", "4–6 м") */
function sizeM(sp) {
  if (SIZE_FIX[sp.id]) return SIZE_FIX[sp.id];
  const rows = (sp.hero && sp.hero.rows) || [];
  for (const [, v] of rows.concat([['', (sp.final && sp.final.len) || '']])) {
    const m = String(v).replace(/,/g, '.').match(/([\d.]+)(?:\s*[–-]\s*([\d.]+))?\s*(см|м)(?![а-яё])/i);
    if (m) return parseFloat(m[2] || m[1]) * (m[3] === 'см' ? 0.01 : 1);
  }
  return 5;
}
/** real height in metres when the passport gives it ("Высота ≈ 12 м") */
function heightM(sp) {
  for (const [k, v] of (sp.hero && sp.hero.rows) || []) {
    if (!/^(Высота|Рост)/i.test(k)) continue;
    const m = String(v).replace(/,/g, '.').match(/([\d.]+)\s*(см|м)(?![а-яё])/i);
    if (m) return parseFloat(m[1]) * (m[2].toLowerCase() === 'см' ? 0.01 : 1);
  }
  return null;
}
/** the player in the size comparison: a child about 1.2 m tall */
const KID_H = 1.2;
function kidSvg(fill, extra) {
  return `<svg viewBox="0 0 44 110" preserveAspectRatio="xMidYMax meet"${extra || ''}><g fill="${fill}">
    <circle cx="22" cy="11.5" r="10.5"/><rect x="11" y="24" width="22" height="36" rx="7"/>
    <rect x="4" y="26" width="7" height="31" rx="3.5" transform="rotate(10 7.5 27)"/><rect x="33" y="26" width="7" height="31" rx="3.5" transform="rotate(-10 36.5 27)"/>
    <rect x="12" y="55" width="9" height="55" rx="4"/><rect x="23" y="55" width="9" height="55" rx="4"/></g></svg>`;
}
/** "compare the size": the animal and the child drawn to one scale on one ground line.
 *  The scale comes from the real height (when the passport gives it) or the real length = the width of the silhouette. */
function sizeCompare(sp, box) {
  const sl = SIL[sp.sil], ar = sl.w / sl.h, H = heightM(sp);
  const Hd = H || sizeM(sp) / ar, Wd = Hd * ar;
  const x0 = 22, availW = box.w - 44, availH = box.ground - box.top, gap = 28;
  const s = Math.min(availH / Math.max(Hd, KID_H), (availW - gap) / (Wd + KID_H * 0.4));
  let dh = Hd * s, dw = Wd * s, kh = KID_H * s;
  if (dw < 26) { dw = 26; dh = dw / ar; }     // a tiny animal stays visible next to the child
  if (kh < 13) kh = 13;                       // and the child next to a giant
  const kw = kh * 0.4, left = x0 + Math.max(0, (availW - (dw + gap + kw)) / 2), kx = left + dw + gap, g = box.ground;
  const lab = `font:500 ${box.fs}px Oswald,sans-serif;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;text-align:center`;
  return `<div class="abs" style="left:${left.toFixed(1)}px;top:${(g - dh).toFixed(1)}px;width:${dw.toFixed(1)}px;height:${dh.toFixed(1)}px">${silSvg(sp.sil, '#F2B640', ` style="width:${dw.toFixed(1)}px;height:${dh.toFixed(1)}px;display:block"`)}</div>
    <div class="abs" style="left:${kx.toFixed(1)}px;top:${(g - kh).toFixed(1)}px;width:${kw.toFixed(1)}px;height:${kh.toFixed(1)}px">${kidSvg('#F4F1EA', ` style="width:${kw.toFixed(1)}px;height:${kh.toFixed(1)}px;display:block"`)}</div>
    <div class="abs" style="left:16px;right:16px;top:${g}px;height:2px;background:rgba(255,255,255,.35)"></div>
    <div class="abs gold" style="left:${(left + dw / 2 - 90).toFixed(1)}px;width:180px;top:${g + 5}px;${lab}">${sp.final.len}</div>
    <div class="abs" style="left:${(kx + kw / 2 - 30).toFixed(1)}px;width:60px;top:${g + 5}px;${lab}">Ты</div>`;
}
function closeLayout(M, id) {
  const sp = DATA.species[id] || {}, L = sizeM(sp), kind = M.kind;
  const s = G.clamp((Math.log10(L) - Math.log10(0.4)) / (Math.log10(25) - Math.log10(0.4)), 0, 1);   // 0 tiny … 1 giant
  const [X0, X1, Y0, Y1] = M.box, bw = X1 - X0, bh = Y1 - Y0, f = FEET[id];
  const AX0 = 34, AX1 = 826, TOP = 86, TW = 360 + 420 * s, front = (PEDI.bot - PEDI.top) / PEDI.w;
  let k = TW / bw, Dw = 420, ty = 0, gap = 0;
  for (let it = 0; it < 5; it++) {
    const yb = 704 - 0.26 * (660 - Dw);                         // a smaller pedestal stands a little farther
    ty = yb - front * Dw;
    gap = kind === 'walk' ? 0 : 22 + 0.05 * Dw;
    const room = (kind === 'walk' ? ty + 0.012 * Dw : ty - gap) - TOP;
    k = Math.min(TW / bw, (AX1 - AX0) / bw, room / bh);
    let need = bw * k * (1.5 - 1.05 * s);
    if (kind === 'walk' && f) need = Math.max(need, 1.15 * (f[1] - f[0]) * k + 36);
    Dw = G.clamp(need, 230, 660);
  }
  // across: the pedestal under the feet (walkers) or under the middle of the body; all of it inside the free area
  const fc = kind === 'walk' && f ? (f[0] + f[1]) / 2 : (X0 + X1) / 2;
  let xp = 420;
  const left = xp - (fc - X0) * k, right = xp + (X1 - fc) * k;
  if (left < AX0) xp += AX0 - left; else if (right > AX1) xp -= right - AX1;
  xp = G.clamp(xp, 40 + Dw / 2 * 0.6, 820 - Dw / 2 * 0.6);
  const sx0 = xp - (fc - X0) * k, sx1 = xp + (X1 - fc) * k;
  const sy1 = kind === 'walk' ? ty + 0.012 * Dw : ty - gap, sy0 = sy1 - bh * k;
  M.close = { f: [sx0 + (M.ax - X0) * k, sy0 + (M.ay - Y0) * k], k };
  M.ped = { x: xp, ty, w: Dw, bot: ty + front * Dw };
  M.scr = { x0: sx0, y0: sy0, x1: sx1, y1: sy1 };
  M.bgz = 1 + 0.32 * (1 - s);
}

/** museum hall: a row of pedestals the child drags left and right to see the whole collection.
 *  The floor with the pedestals is one picture strip that repeats every pedestal (hall_strip);
 *  the room above it (bg_hall) stays where it is. */
const HALL = { x: 638, P: 420, sx: 766 / 1.2 - 210, sy: 466 / 1.2, sh: (864 - 466) / 1.2 };
const imod = (i, n) => ((i % n) + n) % n;
const _exh = {};
/** the still picture of a species on the middle pedestal: the same place the live exhibit takes at rest */
function exhibitBox(sid) {
  if (!_exh[sid]) {
    const M = museumModel(sid), m = MAN[M.key], k = M.hall.k;
    _exh[sid] = { key: M.key, x: M.hall.f[0] - M.ax * k, y: M.hall.f[1] - M.ay * k, w: m.w * k, h: m.h * k };
  }
  return _exh[sid];
}

/** museum → back to the dig sites: the button under the header (gone once every animal is in the museum) */
function digBtn() {
  if (!G.nextDig()) return null;
  const b = UI.secBtn(G.ui, 'Продолжить раскопки', 'pick', { l: 32, t: 100 }, 292, () => G.goDig());
  b.style.height = '52px'; b.style.fontSize = '19px'; b.style.gap = '10px';
  return b;
}
Scenes.museum = {
  enter(p) {
    const id = G.cur(), sp = G.SP(), sc = G.scene$, tok = G.token;
    const ids = (this.ids = G.inPeriod());
    const S = (this.S = { mode: 'hall', zoom: 0, cross: 0, t: 0, acts: [], blinks: [], nextAct: 2.5, nextBlink: 1.2, sel: null, pose: null,
      pos: ids.indexOf(id), slots: new Map(), drag: null, anim: null, heroFade: 1, swapVer: 0, rowAt: null });
    const cam = (S.cam = G.h('div', 'full', sc));
    G.bgImg('bg_hall', cam);
    cam.style.transformOrigin = `${CAM_C[0]}px ${CAM_C[1]}px`;
    // the floor with the pedestals (repeats every HALL.P) and the exhibits standing on them
    S.strip = G.h('div', 'abs', cam, { left: 0, top: HALL.sy, width: 1280, height: HALL.sh,
      backgroundImage: `url(${G.src('hall_strip')})`, backgroundSize: `${HALL.P}px ${HALL.sh}px`, backgroundRepeat: 'repeat-x' });
    S.row = G.h('div', 'full', cam);
    // close-up layer
    const close = (S.close = G.h('div', 'full', sc, { opacity: 0, display: 'none', overflow: 'hidden' }));
    S.closeBg = G.bgImg('bg_close2', close);
    S.closeBg.style.transformOrigin = `640px ${HORIZON}px`;
    S.closeBg.style.filter = 'brightness(.8) saturate(.92)';
    S.pedShadow = G.h('div', 'abs', close, { pointerEvents: 'none', borderRadius: '50%',
      background: 'radial-gradient(ellipse at center, rgba(0,0,0,.7) 0%, rgba(0,0,0,.38) 45%, rgba(0,0,0,0) 72%)' });
    S.pedEl = G.spr('ped_close', close, 0, 0, 10, 10);
    S.pedEl.style.filter = 'brightness(.93)';
    S.slide = 0;
    GL.attach(sc);
    this.makeHero(S.pos);
    const dots = (S.dots = G.h('div', 'full', sc, { pointerEvents: 'none' }));
    S.dotEls = {};
    const place = () => {
      const Z = 1 + 1.1 * S.zoom, M = this.M, hero = S.hero;
      if (S.mode !== 'close' && S.rowAt !== S.pos) this.layoutRow();
      cam.style.transform = S.zoom ? `scale(${Z})` : '';
      if (!hero) return;
      const dx = (S.heroSlot - S.pos) * HALL.P;
      const hx = CAM_C[0] + Z * (M.hall.f[0] + dx - CAM_C[0]), hy = CAM_C[1] + Z * (M.hall.f[1] - CAM_C[1]);
      hero.x = G.lerp(hx, M.close.f[0] + S.slide, S.cross); hero.y = G.lerp(hy, M.close.f[1], S.cross);
      if (S.cross > 0) this.applyClose();
      hero.s = G.lerp(M.hall.k * Z, M.close.k, S.cross);
      hero.y += ((S.pose && S.pose.yOff) || 0) * hero.s;
      // like its neighbours, the exhibit dims a little away from the middle
      if (S.asm) { const d = Math.min(1, Math.abs(dx) / HALL.P); hero.tint = d > 0.002 ? [0, 0, 0, 0.2 * d] : null; }
    };
    S.place = place;
    G.tick((dt) => {
      S.t += dt;
      if (S.anim) {
        const A = S.anim; A.t += dt;
        const e = Math.min(1, A.t / A.dur);
        S.pos = G.lerp(A.from, A.to, G.ease.out(e));
        if (e >= 1) { S.anim = null; this.settle(A.to); }
      }
      if (S.asm && S.hero) {
        if (S.t > S.nextAct) {
          const main = Math.random() < 0.55, M = this.M;
          S.acts.push({ type: main ? M.tap : 'flick', t0: S.t, dur: main ? (M.tap === 'roar' ? 2.6 : 1.8) : 1.3, k: G.rand(0.6, 0.9) });
          S.nextAct = S.t + G.rand(5.5, 9.5);
        }
        if (S.t > S.nextBlink) { S.blinks.push(S.t); S.nextBlink = S.t + G.rand(2.4, 5.2); }
        if (S.acts.length > 6) S.acts.shift();
        if (S.blinks.length > 6) S.blinks.shift();
        const pose = (S.pose = this.M.pose(S.t, S.acts, S.blinks));
        S.hero.mesh.deform(pose); S.hero.blink = pose.blink || 0;
      }
      place();
      if (S.mode === 'close') {
        const sp = G.SP(), hero = S.hero;
        for (const k of sp.factOrder) {
          const el = S.dotEls[k]; if (!el) continue;
          const d = hero.track(this.M.dots[k][0], this.M.dots[k][1], S.pose);
          el.style.left = d[0] + 'px'; el.style.top = d[1] + 'px';
          if (k === S.sel && S.line) {
            const w = G.bgToWorld(d[0], d[1]);
            S.line.setAttribute('x2', w.x); S.line.setAttribute('y2', w.y);
          }
        }
      }
    });
    place();
    // drag the pedestals; a tap picks a pedestal or opens the exhibit in the middle
    G.on(sc, 'pointerdown', (e) => {
      if (S.mode !== 'hall' || S.busy || S.drag) return;
      AU.unlock();
      const q = G.bgPt(e);
      S.drag = { id: e.pointerId, x0: q.x, pos0: S.pos, moved: false, hist: [[performance.now(), q.x]] };
    });
    G.on(window, 'pointermove', (e) => {
      const d = S.drag; if (!d || e.pointerId !== d.id) return;
      const q = G.bgPt(e);
      if (!d.moved) {
        if (Math.abs(q.x - d.x0) < 12) return;
        d.moved = true; d.x0 = q.x; S.anim = null; d.pos0 = S.pos;
        this.dropHint();
      }
      S.pos = d.pos0 - (q.x - d.x0) / HALL.P;
      const now = performance.now(); d.hist.push([now, q.x]);
      while (d.hist.length > 2 && now - d.hist[0][0] > 110) d.hist.shift();
    });
    const up = (e) => {
      const d = S.drag; if (!d || e.pointerId !== d.id) return;
      S.drag = null;
      if (!d.moved) { if (e.type === 'pointerup') this.tapHall(G.bgPt(e)); return; }
      const h = d.hist, a = h[0], b = h[h.length - 1], dt = (b[0] - a[0]) / 1000;
      const v = dt > 0.012 && performance.now() - b[0] < 90 ? (b[1] - a[1]) / dt : 0;
      const r = Math.round(d.pos0);
      this.slideTo(G.clamp(Math.round(S.pos - (v / HALL.P) * 0.2), r - 4, r + 4));
    };
    G.on(window, 'pointerup', up); G.on(window, 'pointercancel', up);
    // close-up: swipe left / right to the next animal of the museum
    G.on(sc, 'pointerdown', (e) => {
      if (S.mode !== 'close' || S.busy) return;
      const q = G.bgPt(e); S.sw = { id: e.pointerId, x: q.x, y: q.y, t: performance.now() };
    });
    G.on(window, 'pointerup', (e) => {
      const w = S.sw; if (!w || e.pointerId !== w.id) return;
      S.sw = null;
      if (S.mode !== 'close' || S.busy) return;
      const q = G.bgPt(e), dx = q.x - w.x, dy = q.y - w.y;
      if (Math.abs(dx) > 70 && Math.abs(dx) > 1.4 * Math.abs(dy) && performance.now() - w.t < 1000) this.swipe(dx < 0 ? 1 : -1);
    });
    // keyboard and mouse wheel / touchpad
    G.on(window, 'keydown', (e) => {
      const k = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
      if (k && S.mode === 'close' && !S.busy) { this.swipe(k); return; }
      if (S.mode !== 'hall' || S.busy || S.drag) return;
      if (k) this.slideTo(Math.round(S.anim ? S.anim.to : S.pos) + k);
    });
    G.on(sc, 'wheel', (e) => {
      if (S.mode !== 'hall' || S.busy || S.drag) return;
      S.wheel = (S.wheel || 0) + (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY);
      if (Math.abs(S.wheel) < 70 || (S.anim && S.anim.t < 0.18)) return;
      const k = Math.sign(S.wheel); S.wheel = 0;
      this.slideTo(Math.round(S.anim ? S.anim.to : S.pos) + k);
    }, { passive: true });
    const asm = S.asm;
    // straight into the close-up: the narrator tells about the animal there, not how to use the hall
    this.hallUI(p.close && asm);
    if (p.close && asm) { S.zoom = 1; S.cross = 1; cam.style.opacity = 0; close.style.display = ''; close.style.opacity = 1; place(); this.closeUI(); }
    else if (p.zoom && asm) {
      G.say(`${sp.name} теперь в музее! Рассмотрим ${G.fm('его', 'её')} поближе.`);
      G.wait(1.6).then(() => { if (G.alive(tok) && S.mode === 'hall') this.toClose(); });
    }
  },
  /** the live (animated) exhibit goes on pedestal i; the other pedestals show still pictures */
  makeHero(i) {
    const S = this.S, sid = this.ids[imod(i, this.ids.length)];
    if (S.hero) { GL.remove(S.hero); S.hero = null; }
    const M = (this.M = museumModel(sid));
    S.asm = G.spState(sid).assembled;
    S.hero = GL.sprite(M.key, M.rig(), { ax: M.ax, ay: M.ay, z: 1 });
    if (!S.asm) S.hero.tint = [0.02, 0.02, 0.024, 1];
    S.heroSlot = i; S.rowAt = null;
    Object.assign(S, { t: 0, acts: [], blinks: [], nextAct: 2.5, nextBlink: 1.2, pose: null });
    this.applyClose();
  },
  /** the pedestal under the close-up animal, its shadow on the floor and the hall behind (zoomed in for small animals) */
  applyClose() {
    const S = this.S, M = this.M, P = M && M.ped;
    if (!P || !S.pedEl) return;
    const k = P.w / PEDI.w, sl = S.slide || 0;
    G.place(S.pedEl, P.x - PEDI.cx * k + sl, P.ty - PEDI.top * k, P.w, 491 * k);
    G.place(S.pedShadow, P.x - P.w * 0.64 + sl, P.bot - P.w * 0.075, P.w * 1.28, P.w * 0.17);
    const z = M.bgz.toFixed(3);
    if (S.bgzNow !== z) { S.bgzNow = z; S.closeBg.style.transform = `scale(${z})`; }
  },
  /** close-up: on to the next (dir 1) or previous (dir -1) animal that already stands in the museum */
  async swipe(dir) {
    const S = this.S, ids = this.ids, n = ids.length, tok = G.token;
    S.swipedAt = performance.now();
    let step = 0;
    for (let d = 1; d < n; d++) if (G.spState(ids[imod(S.pos + dir * d, n)]).assembled) { step = d; break; }
    if (!step) {
      AU.play('miss');
      UI.toast(n > 1 ? 'Других животных этого периода пока нет в музее' : 'Это единственное животное зала');
      await G.tween(0.36, (e) => { S.slide = -dir * 40 * Math.sin(Math.PI * e); });
      S.slide = 0;
      return;
    }
    S.busy = true; AU.play('whoosh');
    this.closeFact();
    if (S.skel || S.skLayer) { S.skel = false; if (S.skLayer) { S.skLayer.remove(); S.skLayer = null; } S.hero.alpha = 1; S.dots.style.visibility = ''; }
    S.dots.style.opacity = 0;
    const pp = S.pp, sw = S.sw2;
    await G.tween(0.24, (e) => { S.slide = -dir * 820 * e * e; if (pp) pp.style.opacity = 1 - e; if (sw) sw.style.opacity = 1 - e; });
    if (!G.alive(tok)) return;
    const j = S.pos + dir * step;
    S.pos = j;
    G.setCur(ids[imod(j, n)]);
    const need = G.needKeys('museum').filter((k) => !G.have(k));
    if (need.length) await G.load(need);
    if (!G.alive(tok)) return;
    S.slide = dir * 820;
    this.makeHero(j);
    S.rowAt = null; S.heroFade = 1;
    S.dots.innerHTML = ''; S.dotEls = {};
    this.closeUI();
    const pp2 = S.pp, sw2 = S.sw2;
    for (const el of [pp2, sw2, S.dots]) if (el) el.style.opacity = 0;
    await G.tween(0.32, (e) => {
      S.slide = dir * 820 * (1 - e) * (1 - e);
      if (pp2) pp2.style.opacity = e; if (sw2) sw2.style.opacity = e * e; S.dots.style.opacity = e * e;
    });
    S.slide = 0; S.busy = false;
  },
  /** one pedestal of the row: the still picture and the name plate (built for the middle place, then moved) */
  makeSlot(i) {
    const S = this.S, sid = this.ids[imod(i, this.ids.length)], sd = DATA.species[sid], st = G.spState(sid);
    const ok = st.assembled, nb = st.bones.length, all = sd.bones.length, g = G.h('div', 'full', S.row), b = exhibitBox(sid);
    const im = G.spr(b.key, g, b.x, b.y, b.w, b.h);
    if (!ok) im.style.filter = 'brightness(0)';
    const [nm, sub, col] = ok ? [sd.name, 'В музее', '#4CD26B']
      : nb >= all ? [sd.name, 'Собери скелет', '#F2B640']
      : nb ? [sd.name, `Кости: ${nb} из ${all}`, 'rgba(244,241,234,.6)'] : ['???', 'Не найден', 'rgba(244,241,234,.6)'];
    // the name plate hangs on the front of the pedestal, clear of the subtitles at the bottom
    G.h('div', 'plate abs', g, { left: HALL.x - 88, top: 461, width: 176, height: 56, textAlign: 'center', paddingTop: '8px', '--c': '6px' },
      `<div style="font:600 ${nm.length > 12 ? 15 : 17}px/1.1 Oswald,sans-serif;letter-spacing:.05em;text-transform:uppercase;white-space:nowrap;${ok ? '' : 'opacity:.65'}">${nm}</div>
       <div style="font:500 12px/1.4 Rubik,sans-serif;color:${col}">${sub}</div>`);
    return { g, im, ok };
  },
  /** move the strip and the pedestals to the current position; build the ones coming into view */
  layoutRow() {
    const S = this.S, P = HALL.P, i0 = Math.floor(S.pos) - 2, i1 = Math.ceil(S.pos) + 2;
    for (const [i, sl] of S.slots) if (i < i0 || i > i1) { sl.g.remove(); S.slots.delete(i); }
    for (let i = i0; i <= i1; i++) {
      let sl = S.slots.get(i);
      if (!sl) S.slots.set(i, (sl = this.makeSlot(i)));
      const dx = (i - S.pos) * P;
      sl.g.style.transform = `translateX(${dx.toFixed(2)}px)`;
      const live = S.hero && S.heroSlot === i ? S.heroFade : 0;
      sl.im.style.opacity = (1 - live).toFixed(3);
      if (sl.ok) sl.im.style.filter = `brightness(${(1 - 0.2 * Math.min(1, Math.abs(dx) / P)).toFixed(3)})`;
    }
    const off = HALL.sx - S.pos * P;
    S.strip.style.backgroundPosition = `${(((off % P) + P) % P).toFixed(2)}px 0px`;
    S.rowAt = S.pos;
  },
  dropHint() { const S = this.S; if (S.hint) { S.hint.remove(); S.hint = null; } },
  /** a tap in the hall: the middle exhibit opens, a side pedestal slides to the middle */
  tapHall(q) {
    const S = this.S;
    if (q.y < 230 || q.y > 640 || S.anim) return;
    const c = Math.round(S.pos), i = Math.round(S.pos + (q.x - HALL.x) / HALL.P);
    AU.play('click');
    if (i !== c) { this.slideTo(i); return; }
    if (!S.hero || S.heroSlot !== c) return;
    if (!S.asm) {
      UI.toast('Сначала найди все кости и собери скелет');
      this.hallSay(true);
      return;
    }
    this.toClose();
  },
  slideTo(i) {
    const S = this.S, d = Math.abs(i - S.pos);
    this.dropHint();
    if (d < 0.001) { S.anim = null; this.settle(i); return; }
    S.anim = { from: S.pos, to: i, t: 0, dur: G.clamp(0.26 + 0.12 * d, 0.26, 0.7) };
  },
  /** the row stopped at pedestal i: that animal becomes the current one and comes alive */
  async settle(i) {
    const S = this.S, ids = this.ids, sid = ids[imod(i, ids.length)], tok = G.token, ver = ++S.swapVer;
    S.pos = i;
    G.setCur(sid);
    if (S.heroSlot === i) return;
    const need = G.needKeys('museum').filter((k) => !G.have(k));
    if (need.length) await G.load(need);
    if (!G.alive(tok) || ver !== S.swapVer || S.mode !== 'hall') return;
    this.makeHero(i);
    S.heroFade = 0; S.hero.alpha = 0;
    G.wait(0.4).then(() => { if (G.alive(tok) && ver === S.swapVer && !S.drag && !S.anim && S.mode === 'hall') this.hallSay(true); });
    await G.tween(0.3, (e) => { if (ver !== S.swapVer || !S.hero) return; S.heroFade = e; S.hero.alpha = e; S.rowAt = null; });
  },
  hallSay(short) {
    const S = this.S, sp = G.SP(), him = G.fm('его', 'её'), nb = G.S().bones.length;
    const more = short ? '' : ' Листай пьедесталы влево и вправо — там вся коллекция.';
    // one hint for each kind of pedestal since the app was opened
    const say = (kind, t) => G.onceApp('hall-' + kind, t);
    if (S.asm) say('asm', short ? AU.alt(`${sp.name}. Нажми, чтобы рассмотреть ${him} поближе.`, 'Нажми, чтобы рассмотреть поближе.')
      : AU.alt(`Нажми на ${sp.acc} — рассмотришь ${him} поближе.${more}`, `Нажми на скелет — рассмотришь его поближе.${more}`));
    else if (!nb) say('empty', `Кто же здесь будет? Найди кости — и узнаешь!${more}`);
    else if (nb < sp.bones.length) say('part', AU.alt(`Здесь будет ${sp.name.toLowerCase()}. Найди остальные кости и собери скелет!${more}`, `Найди остальные кости и собери скелет!${more}`));
    else say('full', AU.alt(`Здесь будет ${sp.name.toLowerCase()}. Собери ${him} скелет!${more}`, `Все кости найдены. Собери скелет!${more}`));
  },
  hallUI(quiet) {
    const S = this.S;
    G.ui.innerHTML = ''; UI.narrArea = null;
    UI.header('Музей', `В музее ${G.assembledCount()} из ${this.ids.length} животных ${G.per().gen}`, () => G.go('map'));
    const dg = digBtn();
    const qb = UI.secBtn(G.ui, 'Викторина', 'star', { l: 32, t: dg ? 164 : 100 }, 292, () => G.go('quiz', { from: 'museum' }));
    qb.style.height = '52px'; qb.style.fontSize = '19px'; qb.style.gap = '10px';
    // the hall of another period: the arrows next to the period plate
    const ps = G.h('div', 'abs row', G.ui, { left: Math.round(G.W / 2), top: 22, gap: '8px', transform: 'translateX(-50%)' });
    periodSwitch(ps, 250, 64, 22, () => G.go('museum'));
    UI.topRight();
    this.dropHint();
    if (G.firstTime('museum-swipe')) S.hint = UI.hand(G.scene$, HALL.x, 566, 'swipe');
    else if (S.asm) S.hint = UI.hand(G.scene$, 662, 335);
    if (!quiet) this.hallSay(false);
  },
  async toClose() {
    const S = this.S, tok = G.token;
    if (S.mode !== 'hall' || S.busy || S.drag || S.anim || !S.hero || S.heroSlot !== S.pos) return;
    S.busy = true; AU.play('whoosh');
    this.dropHint();
    G.ui.innerHTML = '';
    await G.tween(0.75, (e) => { S.zoom = e; }, G.ease.inOut);
    if (!G.alive(tok)) return;
    S.close.style.display = '';
    await G.tween(0.45, (e) => { S.cross = e; S.close.style.opacity = e; S.cam.style.opacity = 1 - e; }, G.ease.inOut);
    S.busy = false;
    this.closeUI();
  },
  async toHall() {
    const S = this.S, tok = G.token;
    if (S.mode !== 'close' || S.busy) return;
    S.busy = true; S.mode = 'trans';
    if (S.skel || S.skLayer) { S.skel = false; if (S.skLayer) { S.skLayer.remove(); S.skLayer = null; } S.hero.alpha = 1; S.dots.style.opacity = 1; S.dots.style.visibility = ''; }
    S.dots.innerHTML = ''; S.dotEls = {}; S.sel = null; S.line = null;
    G.ui.innerHTML = '';
    await G.tween(0.4, (e) => { S.cross = 1 - e; S.close.style.opacity = 1 - e; S.cam.style.opacity = e; }, G.ease.inOut);
    S.close.style.display = 'none';
    await G.tween(0.6, (e) => { S.zoom = 1 - e; }, G.ease.inOut);
    if (!G.alive(tok)) return;
    S.mode = 'hall'; S.busy = false;
    this.hallUI();
  },
  closeUI() {
    const S = this.S, M = this.M, sp = G.SP(), ss = G.S(), H = G.H, W = G.W;
    S.mode = 'close';
    if (S.hint) { S.hint.remove(); S.hint = null; }
    G.ui.innerHTML = '';
    const ids = this.ids;
    UI.header('Музей', `Зал ${G.per().gen} · витрина ${ids.indexOf(sp.id) + 1} из ${ids.length}`, () => this.toHall());
    digBtn();
    UI.topRight();
    // passport
    const pw = 400, room = H - 96 - 16;
    const pp = (S.pp = G.h('div', 'plate abs', G.ui, { right: 28, top: 96, width: pw, padding: '18px 24px 16px' }));
    const hd = sp.hero, desc = hd.desc || hd.say, roomy = room >= 500;
    const chip = ([a, b]) => `<div style="background:rgba(255,255,255,.06);border-radius:4px;padding:${roomy ? '7px 12px' : '5px 10px'}"><div style="font:400 12px Rubik,sans-serif;opacity:.6">${a}</div><div style="font:500 ${roomy ? 19 : 17}px/1.2 Oswald,sans-serif;letter-spacing:.02em;white-space:nowrap">${b}</div></div>`;
    pp.innerHTML = `<div class="t-label" style="font-size:12px">${sp.kind} · ${G.per().name}</div>
      <div class="row" style="justify-content:space-between;margin-top:6px"><div style="font:600 ${hd.name.length > 11 ? 29 : 34}px/1.1 Oswald,sans-serif;letter-spacing:.03em;text-transform:uppercase">${hd.name}</div>
      <button class="say pe" style="width:36px;height:36px;border-radius:50%;background:#F2B640;display:flex;align-items:center;justify-content:center;flex:none">${icon('sound', ' style="width:19px;height:19px;color:#2A1E05"')}</button></div>
      <div class="t-sub" style="opacity:.6;font-style:italic">${hd.latin}</div>
      <div class="t-body" style="font-size:15px;line-height:1.38;margin-top:10px">${desc}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:${roomy ? 8 : 6}px;margin-top:12px">${hd.rows.map(chip).join('')}</div>`;
    UI.tap(pp.querySelector('.say'), () => AU.say(desc), false);
    const bw = G.h('div', '', pp, { position: 'relative', height: 64, marginTop: '14px' });
    const bb = UI.mainBtn(bw, `Играть за ${sp.acc}`, 'foot', { l: 0, t: 0 }, pw - 48, () => G.go('path'));
    bb.style.fontSize = sp.acc.length > 13 ? '16px' : sp.acc.length > 11 ? '18px' : '21px';
    const nC = G.nCh();
    G.h('div', 't-sub', pp, { textAlign: 'center', fontSize: '13px', opacity: 0.7, marginTop: '10px' },
      sp.id === 'herrera' ? 'Пять глав: от яйца до охоты' : `${['', 'Одна глава', 'Две главы', 'Три главы', 'Четыре главы', 'Пять глав', 'Шесть глав'][nC] || nC + ' глав'}: от ${sp.egg ? 'яйца' : sp.chapters[0].age === 0 ? 'рождения' : 'малыша'} до взрослого`);
    UI.narrArea = { x0: 0, x1: W - pw - 40 };
    // animal / skeleton switch on the front of the pedestal
    const sw = (S.sw2 = G.h('div', 'plate abs pe', G.ui, { width: 292, height: 52, padding: '5px', display: 'flex', gap: '4px', '--c': '8px' }));
    const swAt = G.bgToWorld(M.ped.x, M.ped.ty + 0.21 * M.ped.w);
    sw.style.left = Math.round(swAt.x - 146) + 'px'; sw.style.top = Math.round(Math.min(swAt.y - 26, H - 150)) + 'px';
    sw.innerHTML = [['animal', 'paw', 'Животное'], ['skel', 'bone', 'Скелет']].map(([m, ic, t]) =>
      `<button class="pe" data-m="${m}" style="flex:1;display:flex;align-items:center;justify-content:center;gap:8px;border-radius:4px;font:600 15px Oswald,sans-serif;letter-spacing:.06em;text-transform:uppercase">${icon(ic, ' style="width:18px;height:18px"')}${t}</button>`).join('');
    const paintSw = () => sw.querySelectorAll('button').forEach((b) => {
      const on = (b.dataset.m === 'skel') === !!S.skel;
      b.style.background = on ? '#F2B640' : 'transparent'; b.style.color = on ? '#2A1E05' : '#F4F1EA';
    });
    sw.querySelectorAll('button').forEach((b) => UI.tap(b, () => this.setView(b.dataset.m === 'skel').then(paintSw)));
    paintSw();
    // hotspots
    for (const k of sp.factOrder) {
      const open = !!ss.facts[k];
      const d = UI.dot(S.dots, -100, -100, open ? '' : 'lock');
      d.style.pointerEvents = 'auto';
      UI.tap(d, () => { if (performance.now() - (S.swipedAt || 0) > 450) this.showFact(k); });
      S.dotEls[k] = d;
    }
    // tap the animal itself
    const B = M.scr;
    const hit = G.h('div', 'abs', S.dots, { left: B.x0, top: B.y0, width: B.x1 - B.x0, height: B.y1 - B.y0, pointerEvents: 'auto' });
    S.dots.prepend(hit);   // under the fact dots (a negative z-index would put it under the whole hall)
    UI.tap(hit, () => {
      if (S.skel || performance.now() - (S.swipedAt || 0) < 450) return;
      S.acts.push({ type: M.tap, t0: S.t, dur: M.tap === 'roar' ? 2.6 : 1.8, k: 1 }); S.nextAct = S.t + 7; AU.voiceOf(sp.id);
    }, false);
    // a tap anywhere outside the fact card (and not on another dot) closes it
    G.on(window, 'pointerdown', (e) => {
      if (!S.card || S.mode !== 'close') return;
      const t = e.target;
      if (S.card.contains(t) || (t.closest && t.closest('.dot'))) return;
      this.closeFact();
    }, true);
    if (this.ids.filter((q) => G.spState(q).assembled).length > 1 && G.firstTime('close-swipe')) {
      const sh = UI.hand(G.ui, Math.round(G.bgToWorld(M.ped.x, 0).x), Math.round(G.H * 0.55), 'swipe');
      G.wait(3.2).then(() => sh.remove());
    }
    // the narrator tells about the animal on show (the dots glow by themselves)
    G.say(desc);
  },
  /** show the assembled skeleton (a still picture, as in a real museum) or the living animal */
  async setView(skel) {
    const S = this.S, M = this.M, sp = G.SP(), id = sp.id, tok = G.token;
    if (!!S.skel === skel || S.swBusy) return;
    S.swBusy = true;
    this.closeFact();
    if (skel) {
      AU.play('pop');
      if (!S.skLayer) {
        const SK = G.skel(id), ids = sp.bones.map((b) => b.id), keys = ids.map((b) => G.boneImg(id, b));
        await G.load(keys.filter((k) => !G.have(k)));
        if (!G.alive(tok)) return;
        const B = M.scr, k = Math.min((B.x1 - B.x0) / SK.w, (B.y1 - B.y0) / SK.h), w = SK.w * k, h = SK.h * k;
        const top = M.kind === 'walk' ? B.y1 - h : (B.y0 + B.y1) / 2 - h / 2;
        const L = (S.skLayer = G.h('div', 'abs', S.close, { left: (B.x0 + B.x1) / 2 - w / 2, top, width: w, height: h, opacity: 0, pointerEvents: 'none', filter: 'drop-shadow(0 10px 12px rgba(0,0,0,.55))' }));
        for (const b of ids) { const m = G.boneMeta(id, b); G.spr(G.boneImg(id, b), L, (m.x - SK.x) * k, (m.y - SK.y) * k, m.w * k, m.h * k); }
      }
      S.skel = true;
      const L = S.skLayer;
      await G.tween(0.35, (e) => { L.style.opacity = e; S.hero.alpha = 1 - e; S.dots.style.opacity = 1 - e; });
      S.dots.style.visibility = 'hidden';
      // an animal known from a few bones says so (sp.skelSay): its skeleton is the scientists' guess
      G.onceApp('skel-' + sp.id, sp.skelSay || AU.alt(`Это скелет ${sp.gen}. Такие скелеты собирают учёные и ставят в музеях.`, 'Это скелет. Такие скелеты собирают учёные и ставят в музеях.'));
    } else {
      AU.play('pop');
      S.skel = false;
      const L = S.skLayer;
      S.dots.style.visibility = '';
      await G.tween(0.35, (e) => { if (L) L.style.opacity = 1 - e; S.hero.alpha = e; S.dots.style.opacity = e; });
      G.onceApp('alive-' + sp.id, AU.alt(G.fm(`А таким ${sp.name.toLowerCase()} был при жизни.`, `А такой ${sp.name.toLowerCase()} была при жизни.`), 'А так это животное выглядело при жизни.'));
    }
    S.swBusy = false;
  },
  closeFact() {
    const S = this.S, sp = G.SP();
    if (S.card) { S.card.remove(); S.card = null; }
    if (S.svg) { S.svg.remove(); S.svg = null; }
    S.sel = null; S.line = null;
    for (const kk of sp.factOrder) if (S.dotEls[kk]) S.dotEls[kk].classList.remove('sel');
    if (S.pp) S.pp.style.visibility = '';
  },
  showFact(k) {
    const S = this.S, M = this.M, sp = G.SP(), ss = G.S(), f = sp.facts[k], open = !!ss.facts[k];
    if (S.sel === k && S.card) { this.closeFact(); return; }
    this.closeFact();
    S.sel = k;
    for (const kk of sp.factOrder) S.dotEls[kk].classList.toggle('sel', kk === k);
    // the card takes the passport's place, so the animal and all its dots stay free
    const cw = 400, cx = G.W - 28 - cw, cy = 96;
    S.card = UI.card(G.ui, f.part, open ? f.text : f.lock, cx, cy, cw);
    S.card.style.cursor = 'pointer';
    if (!open) S.card.querySelector('.hd b').insertAdjacentHTML('afterbegin', icon('lock', ' style="width:15px;height:15px;margin-right:6px;vertical-align:-2px"'));
    const hd = S.card.querySelector('.hd'); hd.style.justifyContent = 'flex-start'; hd.querySelector('b').style.marginRight = 'auto';
    const x = G.h('button', 'pe', hd, { width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '8px', flex: 'none' },
      icon('close', ' style="width:18px;height:18px;color:#F4F1EA"'));
    x.addEventListener('click', (e) => { e.stopPropagation(); this.closeFact(); });
    G.h('div', 't-sub', S.card, { marginTop: '10px', fontSize: '12px', opacity: 0.6 }, 'Нажми на карточку, чтобы закрыть');
    S.card.addEventListener('click', () => this.closeFact());
    if (S.pp) S.pp.style.visibility = 'hidden';
    const ly = cy + Math.min(60, S.card.offsetHeight / 2);
    S.svg = G.h('div', 'abs', G.ui, { left: 0, top: 0, width: G.W, height: G.H, pointerEvents: 'none' },
      `<svg width="${G.W}" height="${G.H}" style="position:absolute;left:0;top:0"><line x1="${cx}" y1="${ly}" x2="${cx}" y2="${ly}" stroke="#F2B640" stroke-width="2" stroke-opacity=".9"/></svg>`);
    S.line = S.svg.querySelector('line');
    G.ui.insertBefore(S.svg, S.card);
    if (open) {
      G.say(f.part + '. ' + f.text, { silent: false });
      const type = M.factAct[k] || M.tap;
      S.acts.push({ type, t0: S.t, dur: type === 'roar' ? 2.6 : 1.5, k: 1, dir: -1 });
      S.nextAct = S.t + 7;
      if (type === M.tap) AU.voiceOf(G.cur(), { vol: 0.7 });
    } else G.say(f.lock);
  },
};

/* ------------------------------------------------------------------ chapters path (the grown-up moment is a notice, not a chapter) */
Scenes.path = {
  enter(p) {
    const sc = G.scene$, sp = G.SP(), ss = G.S();
    if (!ss.assembled) { G.go('museum'); return; }
    G.bgImg(sp.pathBg || 'bg_valley');
    G.h('div', 'full', sc, { background: 'rgba(7,9,11,.45)' });
    G.h('div', 'abs', sc, { left: 0, top: 0, width: 1280, height: 200, background: 'linear-gradient(rgba(7,9,11,.6),rgba(7,9,11,0))' });
    G.h('div', 'abs', sc, { left: 0, top: 500, width: 1280, height: 220, background: 'linear-gradient(rgba(7,9,11,0),rgba(7,9,11,.65))' });
    UI.header('Жизнь ' + sp.gen, 'Пройди главы по порядку', () => G.go('museum', { close: true }));
    const nC = G.nCh();
    UI.topRight({ counter: ['foot', `${G.totalSteps()} / ${nC * 3}`] });
    const k = Math.min(1, (G.W - 40) / 1280, (G.H - 200) / 400);
    const box = G.h('div', 'abs', G.ui, { left: Math.round((G.W - 1280 * k) / 2), top: Math.round(96 + (G.H - 196 - 400 * k) / 2), width: 1280, height: 400, transform: `scale(${k})`, transformOrigin: '0 0' });
    const CH = sp.chapters.filter((c) => c.id !== 'final'), N = CH.length;
    const x0 = 150, x1 = N >= 5 ? 1010 : 980, TX = 1150, TY = 200;
    const NX = CH.map((c, i) => (N === 1 ? 640 : x0 + ((x1 - x0) * i) / (N - 1))), NY = CH.map((c, i) => (i % 2 ? 150 : 250));
    const state = CH.map((c) => (G.chDone(c.n) ? 'done' : G.chOpen(c.n) ? 'cur' : 'lock'));
    const all = state.every((q) => q === 'done');
    let cur = state.indexOf('cur'); const curI = cur < 0 ? N - 1 : cur;
    const PX = NX.concat([TX]), PY = NY.concat([TY]);
    const seg = (i) => { const dx = (PX[i + 1] - PX[i]) / 2; return `C ${PX[i] + dx} ${PY[i]} ${PX[i + 1] - dx} ${PY[i + 1]} ${PX[i + 1]} ${PY[i + 1]}`; };
    const reach = all ? N : curI;
    let dDone = `M ${PX[0]} ${PY[0]}`, dRest = `M ${PX[reach]} ${PY[reach]}`;
    for (let i = 0; i < N; i++) { if (i < reach) dDone += ' ' + seg(i); else dRest += ' ' + seg(i); }
    G.h('div', 'abs', box, { left: 0, top: 0 }, `<svg width="1280" height="400" style="position:absolute;left:0;top:0;overflow:visible">
      ${reach < N ? `<path d="${dRest}" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="5" stroke-linecap="round" stroke-dasharray="0.1 16"/>` : ''}
      ${reach > 0 ? `<path d="${dDone}" fill="none" stroke="#F2B640" stroke-width="5" stroke-linecap="round" style="filter:drop-shadow(0 1px 3px rgba(0,0,0,.6))"/>` : ''}</svg>`);
    // ages above the nodes
    const AGE = ['Рождение', 'Малыш', 'Подросток', 'Взрослый'], SZ = [0.14, 0.17, 0.23, 0.3];
    const ages = [...new Set(CH.map((c) => c.age))];
    for (const a of ages) {
      const xs = CH.map((c, i) => (c.age === a ? NX[i] : null)).filter((v) => v !== null);
      const xa = Math.max(40, Math.min(...xs) - 60), xb = Math.min(1240, Math.max(...xs) + 60);
      const g = G.h('div', 'abs row', box, { left: (xa + xb) / 2, top: 22, gap: '8px', transform: 'translateX(-50%)', whiteSpace: 'nowrap' });
      const sl = SIL[sp.sil], w = Math.round(220 * SZ[a]), h = Math.round((w * sl.h) / sl.w);
      g.innerHTML = (a === 0 && sp.egg ? icon('egg', ' style="width:18px;height:18px;opacity:.85"') : silSvg(sp.sil, '#F4F1EA', ` style="width:${w}px;height:${h}px;opacity:.85"`)) +
        `<span style="font:500 15px Oswald,sans-serif;letter-spacing:.12em;text-transform:uppercase;opacity:.88;text-shadow:0 1px 4px #000">${AGE[a]}</span>`;
      G.h('div', 'abs', box, { left: xa, top: 50, width: xb - xa, height: 2, background: 'rgba(255,255,255,.35)', borderRadius: '1px' });
    }
    // the "neighbours" chapter shows its painted scene
    const scImg = window.SEEKZ && SEEKZ.of[sp.id] ? (SEEKZ.img[SEEKZ.of[sp.id]] || SEEKZ.of[sp.id]) : null;
    CH.forEach((c, i) => {
      const s = state[i], el = G.h('div', 'node ' + s, box, { left: NX[i], top: NY[i] });
      // the egg chapter shows this animal's own hatchling in its nest, the nest chapter its kind of nest (js/hatch.js)
      const HT = window.HATCH, E1 = HT && HT.eye[sp.id], EK = HT && HT.grp[sp.id], NK = (HT && HT.nestOf && HT.nestOf[sp.id]) || EK,
        PL = NK && HT.place[NK];
      const pct = (x, y) => `${((x / 1536) * 100).toFixed(1)}% ${((y / 864) * 100).toFixed(1)}%`;
      const pic = (c.scene || c.id) === 'seek' && scImg ? [scImg, '190%', '45% 50%']
        : c.id === 'ch1' && E1 ? ['hatch_' + sp.id, '200%', pct(E1[0] - 60, Math.min(700, E1[1] + 150))]
        : (c.scene || c.id) === 'guard' && PL ? ['bgnest_' + NK, '170%', pct(PL[0], PL[1] - 60)]
        : [G.rbg(c.bg), c.size, c.pos];
      el.innerHTML = `<div class="rg"></div><div class="pic" style="${G.picCss(pic[0], pic[1], pic[2], 104, 104)}"></div>
        <div class="num">${s === 'done' ? icon('check', ' style="width:20px;height:20px;color:#2A1E05"') : c.n}</div>
        ${s === 'lock' ? `<div class="lk">${icon('lock', ' style="width:34px;height:34px;color:#fff"')}</div>` : ''}
        <div class="nm">${c.name}</div>`;
      if (s === 'done') G.h('div', 'st', el, {}, UI.steps(G.chStars(c.n), 21, 3));
      const go = () => G.goCh(c.n);
      if (s === 'cur') {
        const pb = G.h('button', 'mbtn pe play', el); pb.innerHTML = `<i></i>${icon('play')}<span>Играть</span>`;
        UI.tap(pb, go);
        UI.hand(el, 92, 196);
      }
      UI.tap(el, () => { if (s === 'lock') { UI.toast(`Сначала пройди главу ${c.n - 1}`); return; } go(); }, s !== 'lock');
    });
    // the end of the road: a badge that lights up when the animal has grown up
    const tr = G.h('div', 'abs pe', box, { left: TX - 52, top: TY - 52, width: 104, height: 104, borderRadius: '50%', cursor: 'pointer',
      background: all ? 'radial-gradient(circle at 50% 40%,#ffd977,#d99a1c)' : 'rgba(18,22,27,.75)', border: all ? '4px solid #fff3c4' : '2px solid rgba(255,255,255,.35)',
      boxShadow: all ? '0 0 30px rgba(242,182,64,.75)' : '0 4px 12px rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
      icon('award', ` style="width:52px;height:52px;color:${all ? '#2A1E05' : 'rgba(255,255,255,.55)'}"`));
    G.h('div', 'abs', box, { left: TX - 80, top: TY + 62, width: 160, textAlign: 'center', font: '500 17px/1.1 Oswald,sans-serif', letterSpacing: '.06em', textTransform: 'uppercase', textShadow: '0 1px 4px rgba(0,0,0,.8)', opacity: all ? 1 : 0.62 },
      all ? G.fm('Вырос!', 'Выросла!') : G.fm('Вырастет', 'Вырастет'));
    UI.tap(tr, () => { if (all) UI.grown(); else UI.toast('Пройди все главы — и малыш вырастет!'); });
    const phr = sp.id === 'herrera' ? [
      'Глава 1: помоги малышу вылупиться из яйца!', 'Глава 2: проберись тихо мимо заврозуха.', 'Глава 3: научись ловко хватать добычу.',
      'Глава 4: найди соседей в Долине Луны.', 'Глава 5: настоящая охота!',
    ] : CH.map((c) => c.say);
    if (p && p.grown && all) { UI.grown(); return; }
    G.onceApp(`path-${sp.id}-${cur}`, cur >= 0 ? phr[cur] : AU.alt(`Все главы пройдены! ${G.fm('Твой', 'Твоя')} ${sp.name.toLowerCase()} ${G.fm('вырос', 'выросла')}. Можно переиграть любую главу.`, 'Все главы пройдены! Малыш вырос. Можно переиграть любую главу.'));
  },
};

/** "you raised it!" — a notice over the path after the last chapter (or from the badge at the end of the road) */
UI.grown = () => {
  const st = G.state, sp = G.SP(), F = sp.final, m = UI.modal(900, 520), b = m.box;
  AU.play('win'); AU.voiceOf(sp.id, { at: 1.1, vol: 0.65 });
  st.seen['grown-' + sp.id] = 1; G.save();
  const pic = G.h('div', 'abs', b, { left: 24, top: 40, width: 400, height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' });
  pic.innerHTML = `<img src="${G.src(sp.img)}" style="max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 10px 14px rgba(0,0,0,.55))">`;
  const col = G.h('div', 'abs', b, { left: 440, top: 30, width: 430 });
  col.innerHTML = `<div class="row" style="gap:14px"><div style="width:56px;height:56px;border-radius:50%;background:#F2B640;display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px rgba(242,182,64,.6)">${icon('award', ' style="width:32px;height:32px;color:#2A1E05"')}</div>
      <div><div class="t-label">Новый значок</div><div style="font:500 20px Oswald,sans-serif;letter-spacing:.03em">«${G.fm('Вырастил', 'Вырастил')}»</div></div></div>
    <div class="t-title" style="font-size:${F.title.length > 26 ? 32 : 36}px;line-height:1.08;margin-top:14px">${F.title}</div>`;
  const cmp = G.h('div', 'plate', col, { position: 'relative', marginTop: '14px', height: 170, padding: '12px 18px' });
  cmp.innerHTML = `<div class="t-label" style="color:#F4F1EA;opacity:.7">Сравни размер</div>` + sizeCompare(sp, { w: 430, top: 36, ground: 138, fs: 13 });
  const chips = G.h('div', 'row', col, { gap: '8px', marginTop: '12px', flexWrap: 'wrap' });
  for (const [ic, t] of [['ruler', F.len], [F.wtIcon || 'weight', F.wt], ['foot', `${G.totalSteps()} / ${G.nCh() * 3}`]]) {
    G.h('div', 'plate row', chips, { position: 'relative', gap: '8px', padding: '10px 14px 10px 12px', '--c': '8px' }, `${icon(ic, ' style="width:22px;height:22px;color:#F2B640"')}<span style="font:500 19px Oswald,sans-serif;letter-spacing:.03em;white-space:nowrap">${t}</span>`);
  }
  const by = 432;
  if (sp.id === 'herrera') {
    UI.secBtn(b, 'Закрыть', 'close', { l: 40, t: by }, 250, () => m.close());
    UI.secBtn(b, 'Охотиться', 'zap', { l: 310, t: by }, 260, () => { m.close(); G.go('hunt'); });
    UI.mainBtn(b, 'В музей', 'museum', { l: 590, t: by }, 270, () => { m.close(); G.go('museum', { close: true }); });
  } else {
    UI.secBtn(b, 'Закрыть', 'close', { l: 120, t: by }, 300, () => m.close());
    UI.mainBtn(b, 'В музей', 'museum', { l: 440, t: by }, 340, () => { m.close(); G.go('museum', { close: true }); });
  }
  m.back.addEventListener('click', () => m.close());
  G.fx.sparkle(640, 260, 30);
  G.say(F.say);
  return m;
};

/* ------------------------------------------------------------------ finale */
Scenes.final = {
  enter() {
    const sc = G.scene$, st = G.state, sp = G.SP(), F = sp.final;
    if (sp.id === 'herrera') G.bgImg('bg_final');
    else {
      G.bgImg(F.bg);
      GL.attach(sc);
      const M = sp.model();
      const it = GL.sprite(M.key, M.rig(), { x: F.f[0], y: F.f[1], s: F.k, ax: M.ax, ay: M.ay, z: 1 });
      let t = 0; const acts = [{ type: M.tap, t0: 1.2, dur: 1.8 }];
      G.tick((dt) => { t += dt; const ps = M.pose(t, acts, [2.5, 6]); it.mesh.deform(ps); it.blink = ps.blink || 0; it.y = F.f[1] + (ps.yOff || 0) * F.k; });
    }
    G.h('div', 'abs', sc, { left: 0, top: 0, width: 1280, height: 720, background: 'linear-gradient(90deg,rgba(7,9,11,0) 40%,rgba(7,9,11,.55) 62%,rgba(7,9,11,.82) 100%)' });
    UI.iconBtn(G.ui, 'left', { l: 32, t: 28 }, () => G.go('path'));
    UI.topRight();
    st.seen.final = 1; G.save();
    const pw = Math.min(520, G.W * 0.44), x = G.W - pw - 44, k = Math.min(1, (G.H - 110) / 580);
    const col = G.h('div', 'abs', G.ui, { left: x, top: 84, width: pw, height: 580, transform: `scale(${k})`, transformOrigin: '100% 0' });
    col.innerHTML = `
      <div class="row" style="gap:16px"><div style="width:64px;height:64px;border-radius:50%;background:#F2B640;display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px rgba(242,182,64,.6)">${icon('award', ' style="width:36px;height:36px;color:#2A1E05"')}</div>
      <div><div class="t-label">Новый значок</div><div style="font:500 22px Oswald,sans-serif;letter-spacing:.03em">«Вырастил»</div></div></div>
      <div class="t-title" style="font-size:${F.title.length > 26 ? 40 : 46}px;line-height:1.08;margin-top:18px">${F.title}</div>`;
    const cmp = G.h('div', 'plate', col, { position: 'relative', marginTop: '18px', height: 196, padding: '14px 20px' });
    cmp.innerHTML = `<div class="t-label" style="color:#F4F1EA;opacity:.7">Сравни размер</div>` + sizeCompare(sp, { w: pw, top: 40, ground: 163, fs: 14 });
    const chips = G.h('div', 'row', col, { gap: '10px', marginTop: '16px' });
    for (const [ic, t] of [['ruler', F.len], [F.wtIcon || 'weight', F.wt], ['foot', `${G.totalSteps()} / ${G.nCh() * 3}`]]) {
      G.h('div', 'plate row', chips, { position: 'relative', gap: '10px', padding: '12px 18px 12px 14px', '--c': '8px' }, `${icon(ic, ' style="width:24px;height:24px;color:#F2B640"')}<span style="font:500 21px Oswald,sans-serif;letter-spacing:.03em;white-space:nowrap">${t}</span>`);
    }
    const btns = G.h('div', 'abs', col, { left: 0, top: 512, width: pw, height: 64 });
    if (sp.id === 'herrera') UI.secBtn(btns, 'Охотиться ещё', 'zap', { l: 0, t: 0 }, Math.round(pw * 0.5) - 6, () => G.go('hunt'));
    else UI.secBtn(btns, 'Играть ещё', 'retry', { l: 0, t: 0 }, Math.round(pw * 0.5) - 6, () => G.go('path'));
    UI.mainBtn(btns, 'В музей', 'museum', { l: Math.round(pw * 0.5) + 6, t: 0 }, Math.round(pw * 0.5) - 6, () => G.go('museum', { close: true }));
    UI.narrArea = { x0: 0, x1: x - 10 };
    AU.play('win'); AU.voiceOf(sp.id, { at: 1.1, vol: 0.65 });
    G.say(F.say);
  },
};
