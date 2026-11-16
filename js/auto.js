'use strict';
/* ==================================================================== auto species: rigs, jointed multi-pair legs, gaits, poses, museum models
   (data in MAN.auto[id] is produced by tools/auto_species.py; coordinates are sprite-local) */
(() => {
  const cl = G.clamp, sm = G.smooth, D2R = Math.PI / 180;
  // the mouth is not always the foremost point of the picture (a horn tip, a hand of a glider)
  for (const [id, m] of Object.entries({ shringa: [1440, 148], volati: [614, 170] })) if (MAN.auto && MAN.auto[id]) MAN.auto[id].mouth = m;
  const A = (id) => MAN.auto[id];
  const isWalker = (id) => { const t = A(id).type; return t === 'biped' || t === 'quad'; };
  GL.isWalker = isWalker;

  /* ---------------- baby proportions: a big round head with a short snout and large eyes, a short tail.
     A reshaping of the adult picture (the mouth tip stays where it is, so the games' reach points still fit). */
  /* the four animals drawn and rigged by hand (js/species.js): the same baby reshaping, measured on their own pictures */
  const OWN = {
    plateo: { Y: { m: [1492, 34], a: [-0.993, -0.119], D: 62, T: 46, e: [1433, 16, 6.5] },
      d: { type: 'biped', tail: [690, 0], breath: [946, 284, 170, 80], neck: [1146, 234], headX0: 1390, bellyY: 330 } },
    eudimo: { Y: { m: [1300, 270], a: [-0.981, -0.193], D: 221, T: 70, e: [1084, 222, 8], hg: 0.85 },
      d: { type: 'flyer', c: [760, 360], d: [0.9993, -0.038], n: [0.038, 0.9993], sHip: -260, band: 32 } },
    shoni: { Y: { m: [1480, 176], a: [-0.999, -0.04], D: 238, T: 110, e: [1244, 154, 15], g: 1.15, hg: 0.8 },
      d: { type: 'swim', tail: [620, 0], breath: [778, 228, 300, 110] } },
  };
  GL.youngPre = (id) => {
    const own = OWN[id], Y = own ? own.Y : window.YOUNG && YOUNG[id], d = own ? own.d : A(id);
    if (!Y || !d) return null;
    const [mx, my] = Y.m, [ax, ay] = Y.a, De = Y.D, Th = Y.T, nx = -ay, ny = ax, [ex, ey, er] = Y.e;
    const fly = d.type === 'flyer' || d.type === 'glider', KT = d.type === 'swim' ? 0.82 : fly ? 0.72 : 0.62;
    // along the head (u = distance behind the mouth tip): a short snout, a big skull, and the neck takes up the rest
    const HG = Y.hg === undefined ? 1 : Y.hg, K1 = 1 - 0.26 * HG, K2 = 1 + 0.5 * HG, U1 = 0.6 * De, U2 = De + 0.8 * Th, G1 = U1 * K1, G2 = G1 + (U2 - U1) * K2, U3 = U2 + Math.max(1.6 * Th, 2 * (G2 - U2));
    const K3 = U3 > U2 ? (U3 - G2) / (U3 - U2) : 1;
    const g = (u) => (u < U1 ? u * K1 : u < U2 ? G1 + (u - U1) * K2 : u < U3 ? G2 + (u - U2) * K3 : u);
    const KH = 1 + 0.46 * HG, KS = 1 + 0.12 * HG, kt = (u) => (u < 0 ? KS : u < U1 ? KS + (KH - KS) * (u / U1) : u < U2 ? KH : u < U3 ? KH - (KH - 1) * sm(U2, U3, u) : 1);
    const head = (x, y) => {
      const dx = x - mx, dy = y - my, u = dx * ax + dy * ay, t = dx * nx + dy * ny;
      if (u >= U3 || u < -De) return [x, y];
      const w = (1 - sm(0.9 * Th, 1.6 * Th, Math.abs(t))) * (1 - sm(-0.5 * De, -De, u));
      if (!w) return [x, y];
      const u2 = u + (g(u) - u) * w, t2 = t * (1 + (kt(u) - 1) * w);
      return [mx + ax * u2 + nx * t2, my + ay * u2 + ny * t2];
    };
    const E = head(ex, ey), RL = Math.max(3 * er, 0.42 * Th), KE = Y.g || 1.5;
    let tail, neck = null, belly = null;
    if (fly) {
      const c = d.c, dv = d.d, nv = d.n, band = d.band;
      tail = (x, y, p) => {
        const s = (x - c[0]) * dv[0] + (y - c[1]) * dv[1], t = (x - c[0]) * nv[0] + (y - c[1]) * nv[1];
        if (s >= d.sHip) return;
        const sh = (d.sHip - s) * (1 - KT) * (1 - sm(band * 1.2, band * 2, Math.abs(t)));
        p[0] += dv[0] * sh; p[1] += dv[1] * sh;
      };
    } else {
      // the tail shortens from behind the hind hips: the thighs and the leg stumps of the body keep their shape
      const hip = d.pairs && (d.pairs.find((q) => !q.front) || d.pairs[0]);
      const tx = hip ? Math.min(d.tail[0], hip.joints[0][0] - 0.3 * hip.L) : d.tail[0];
      tail = (x, y, p) => { if (x < tx) p[0] += (tx - x) * (1 - KT); };
      // a rounder body
      const [bx, by, brx, bry] = d.breath;
      // (only where the body is one picture: a walker's body has cut leg stumps along the belly, and a bulge would show them)
      if (d.type === 'swim') belly = (x, y, p) => { const w = Math.exp(-(((x - bx) / (1.5 * brx)) ** 2) - (((y - by) / (2.2 * bry)) ** 2)); if (w > 0.01) p[1] += (y - by) * 0.14 * w; };
      if (d.type !== 'swim' && d.neck) {
        // a short neck: the head comes closer to the shoulders
        const N = d.neck, hbx = mx + ax * U2 - N[0], hby = my + ay * U2 - N[1], Ln = Math.hypot(hbx, hby);
        if (Ln > 0.8 * U2) {
          const ux = hbx / Ln, uy = hby / Ln, neckX = N[0], headX0 = d.headX0, bellyY = d.bellyY, KN = 0.3;
          neck = (x, y, p) => {
            // the whole head goes along, even when it hangs below the belly line
            const dx = x - mx, dy = y - my, u = dx * ax + dy * ay, hz = u > -De ? (1 - sm(U2 + 0.3 * Th, U2 + 1.2 * Th, u)) * (1 - sm(0.9 * Th, 1.5 * Th, Math.abs(dx * nx + dy * ny))) : 0;
            const w = sm(neckX, neckX + 0.45 * (headX0 - neckX), x) * (1 - sm(bellyY - 4, bellyY + 14, y) * (1 - hz));
            if (!w) return;
            const sh = cl((x - N[0]) * ux + (y - N[1]) * uy, 0, Ln) * KN * w;
            p[0] -= ux * sh; p[1] -= uy * sh;
          };
        }
      }
    }
    // plates, spikes, horns, tusks and crests are small on a baby
    const feats = (Y.f || []).map((F) => {
      const K = 1 - F.k;
      if (F.ridge) {
        const L = F.ridge, h = F.h, n = L.length - 1;
        return (x, y, p) => {
          let best = 1e9, bd = 0, bnx = 0, bny = 0, bw = 1;
          for (let i = 0; i < n; i++) {
            const ax0 = L[i][0], ay0 = L[i][1], dx = L[i + 1][0] - ax0, dy = L[i + 1][1] - ay0, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
            const tt = (x - ax0) * ux + (y - ay0) * uy, tc = cl(tt, 0, len), qx = ax0 + ux * tc, qy = ay0 + uy * tc, d2 = (x - qx) ** 2 + (y - qy) ** 2;
            if (d2 < best) { best = d2; bnx = uy; bny = -ux; bd = (x - qx) * bnx + (y - qy) * bny; bw = (i === 0 && tt < 0) ? 1 - sm(0, 30, -tt) : (i === n - 1 && tt > len) ? 1 - sm(0, 30, tt - len) : 1; }
          }
          if (bd <= 0 || !bw) return;
          const sh = bd * K * (1 - sm(h, 1.35 * h, bd)) * bw;
          p[0] -= bnx * sh; p[1] -= bny * sh;
        };
      }
      const P = F.poly, m = P.length, soft = F.s || 6, bx = F.b[0], by = F.b[1];
      return (x, y, p) => {
        let ins = false, dmin = 1e9;
        for (let i = 0, j = m - 1; i < m; j = i++) {
          const xi = P[i][0], yi = P[i][1], xj = P[j][0], yj = P[j][1];
          if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ins = !ins;
          const dx = xj - xi, dy = yj - yi, t = cl(((x - xi) * dx + (y - yi) * dy) / (dx * dx + dy * dy), 0, 1), d = Math.hypot(x - xi - t * dx, y - yi - t * dy);
          if (d < dmin) dmin = d;
        }
        // everything inside moves as one piece; the fade lies outside the outline (drawn with a margin around the horn),
        // so no edge of the horn is left behind
        if (!ins && dmin >= soft) return;
        const w = (ins ? 1 : 1 - sm(0, soft, dmin)) * K;
        p[0] += (bx - x) * w; p[1] += (by - y) * w;
      };
    });
    // long front limbs of a baby that walks on all fours
    const AR = Y.arm, armW = AR ? (x, y) => sm(AR.box[0] - 12, AR.box[0] + 12, x) * (1 - sm(AR.box[1] - 12, AR.box[1] + 12, x)) * sm(AR.box[2], AR.box[2] + 40, y) : null;
    const pre = (x, y) => {
      const r = Math.hypot(x - ex, y - ey), p = head(x, y);
      if (r < RL) { const k = 1 + (KE - 1) * (1 - sm(0.45 * RL, RL, r)); p[0] = E[0] + (p[0] - E[0]) * k; p[1] = E[1] + (p[1] - E[1]) * k; }
      if (neck) neck(x, y, p);
      if (belly) belly(x, y, p);
      tail(x, y, p);
      for (const f of feats) f(x, y, p);
      if (AR) { const w = armW(x, y); if (w) p[1] += (y - AR.c[1]) * (AR.k - 1) * w; }
      return p;
    };
    if (AR) { pre.arm = { c: AR.c, w: armW }; pre.pitch = AR.pitch; }
    // a finer mesh over the head, finest around the eye
    const hx = mx + ax * U2 * 0.55, hy = my + ay * U2 * 0.55, R = Math.max(U2 * 0.6, Th) + Th;
    const fref = (Y.f || []).map((F) => {
      const pts = F.ridge || F.poly, xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
      const x0 = Math.min(...xs) - 8, x1 = Math.max(...xs) + 8, y0 = Math.min(...ys) - (F.ridge ? F.h : 8), y1 = Math.max(...ys) + 8;
      return [x0, x1, y0, y1, F.ridge ? Math.max(6, Math.round(F.h / 9)) : cl(Math.round(Math.min(x1 - x0, y1 - y0) / 14), 3, 6)];
    });
    pre.refine = fref.concat([[hx - R, hx + R, hy - R, hy + R, Math.max(4, Math.round(Th / 12))], [ex - RL, ex + RL, ey - RL, ey + RL, Math.max(2, Math.round(RL / 7))]]);
    return pre;
  };
  /** a rest point of the animal's picture as it is drawn (the baby's reshaping moves the mouth) */
  GL.restPt = (it, pt) => (it.mesh.rig.pre ? it.mesh.rig.pre(pt[0], pt[1]) : pt);
  const isYoung = (id, young) => (young === undefined ? id === G.cur() && G.young() : !!young);
  /** the baby reshaping for an animal made right now (young: true/false, or by the chapter being played) */
  GL.youngOf = (id, young) => (isYoung(id, young) ? GL.youngPre(id) : null);
  /** a rig with the baby reshaping added */
  GL.youngRig = (rig, id, young) => { const pre = GL.youngOf(id, young); if (pre) { rig.pre = pre; rig.refine = (rig.refine || []).concat(pre.refine); } return rig; };
  /** a baby's legs: shorter by drop px and thicker. Returns the reshaped joints and the map for the leg picture. */
  GL.babyLeg = (J, drop, kx) => {
    // the top of the leg lies under the body and keeps its width (its cut edge must stay hidden); the leg thickens below the hip
    const H = J[0], hgt = J[4][1] - H[1], ky = 1 - drop / hgt;
    const f = (x, y) => [H[0] + (x - H[0]) * (1 + (kx - 1) * sm(H[1] + 0.05 * hgt, H[1] + 0.4 * hgt, y)), H[1] + (y - H[1]) * ky];
    return { J: J.map((q) => f(q[0], q[1])), f, ky };
  };
  GL.BABY_LEG = { drop: 0.17, kx: 1.22 };

  /* ---------------- single-mesh rig (full sprite or legless body) */
  GL.RIGS.auto = (id, young) => {
    const rig = autoRig(id), pre = isYoung(id, young) ? GL.youngPre(id) : null;
    if (pre) {
      rig.pre = pre; rig.refine = pre.refine;
      if (pre.arm) { rig.bones.push({ name: 'arm', type: 'rot', c: pre.arm.c, w: pre.arm.w }); rig.four = pre.pitch; }
    }
    return rig;
  };
  const autoRig = (id) => {
    const d = A(id), [X0, X1, Y0, Y1] = d.box, W = X1 - X0, H = Y1 - Y0;
    const bones = [];
    if (d.type === 'flyer' || d.type === 'glider') {
      const c = d.c, dv = d.d, nv = d.n, band = d.band;
      const S = (x, y) => (x - c[0]) * dv[0] + (y - c[1]) * dv[1], T = (x, y) => (x - c[0]) * nv[0] + (y - c[1]) * nv[1];
      const P = (s, t) => [c[0] + dv[0] * s + nv[0] * t, c[1] + dv[1] * s + nv[1] * t];
      // the hind legs sit near the body behind the hips: keep them out of the wing beat (otherwise they flap like a third wing)
      const span = d.sMax - d.sMin, hipM = 0.05 * span;
      const legZone = (x, y) => sm(d.sHip + hipM, d.sHip - hipM, S(x, y)) * (1 - sm(band * 2.0, band * 3.0, Math.abs(T(x, y))));
      const wing = (sign) => (x, y) => {
        const t = T(x, y) * sign, s = S(x, y);
        if (t < band * 0.4 || s > d.sHead) return 0;
        return sm(band * 0.5, band * 1.7, t) * (1 - legZone(x, y));
      };
      bones.push(
        { name: 'wingU', type: 'breath', c: P(d.sUp, 0), w: wing(-1) },
        { name: 'wingD', type: 'breath', c: P(d.sDn, 0), w: wing(1) },
        { name: 'wingUr', type: 'wave', c: P(d.sUp, 0), k: 1.2, w: wing(-1), u: (x, y) => cl(-T(x, y) / d.wingLen, 0, 1) },
        { name: 'wingDr', type: 'wave', c: P(d.sDn, 0), k: 1.2, w: wing(1), u: (x, y) => cl(T(x, y) / d.wingLen, 0, 1) },
        { name: 'tail', type: 'wave', c: P(d.sHip, 0), k: 2,
          w: (x, y) => { const s = S(x, y); if (s > d.sHip) return 0; return Math.pow(cl((d.sHip - s) / (d.sHip - d.sMin), 0, 1), 1.1) * (1 - sm(band * 1.2, band * 2, Math.abs(T(x, y)))); },
          u: (x, y) => cl((d.sHip - S(x, y)) / (d.sHip - d.sMin), 0, 1) },
        { name: 'head', type: 'rot', c: P(d.sHead, 0), w: (x, y) => sm(d.sHead - 6, d.sHead + 22, S(x, y)) * (1 - sm(band * 1.6, band * 2.4, Math.abs(T(x, y)))) },
      );
      return { step: 10, bones };
    }
    const tailX = d.tail[0], neckX = d.neck[0], headX0 = d.headX0, bellyY = d.bellyY;
    bones.push(
      { name: 'breath', type: 'breath', c: [d.breath[0], d.breath[1]], w: (x, y) => Math.exp(-(((x - d.breath[0]) / d.breath[2]) ** 2) - (((y - d.breath[1]) / d.breath[3]) ** 2)) },
      { name: 'tail', type: 'wave', c: d.tail, k: 2, w: (x) => Math.pow(cl((tailX - x) / d.tailLen, 0, 1), 1.2), u: (x) => cl((tailX - x) / d.tailLen, 0, 1) },
    );
    if (d.type === 'swim') {
      (d.fins || []).forEach((f, i) => {
        const [bx0, by0, bx1, by1] = f.box;
        bones.push({ name: 'fin' + i, type: 'rot', c: f.c, w: (x, y) => sm(bx0 - 6, bx0 + 8, x) * (1 - sm(bx1 - 8, bx1 + 6, x)) * sm(by0 - 4, by0 + 10, y) });
      });
    } else {
      bones.push({ name: 'neck', type: 'rot', c: d.neck,
        w: (x, y) => sm(neckX, neckX + 0.45 * (headX0 - neckX), x) * (1 - sm(bellyY - 4, bellyY + 14, y)) });
    }
    bones.push({ name: 'head', type: 'rot', c: d.head, w: (x, y) => sm(headX0 - 10, headX0 + 26, x) * (1 - sm(Y1 - 0.14 * H, Y1 - 0.04 * H, y)) });
    return { step: Math.max(8, Math.round(Math.max(W, H) / 120)), bones };
  };

  /* ---------------- poses */
  Pose.auto = (id) => {
    const d = A(id), fly = d.type === 'flyer' || d.type === 'glider';
    return (t, acts, blinks, ext) => {
      const swim = d.type === 'swim' || !!(ext && ext.swim);
      const p = { breath: 0.02 * (0.5 - 0.5 * Math.cos((2 * Math.PI * t) / 3.4)), tail: 4 + 1.5 * Math.sin((2 * Math.PI * t) / 5), tailPh: (2 * Math.PI * t) / 4.5,
        neck: 2 * Math.sin((2 * Math.PI * t) / 6.2), head: 1.5 * Math.sin((2 * Math.PI * t) / 4.1 + 1), yOff: 0 };
      if (swim) {
        const f = (ext && ext.speed) || 0.5, ph = 2 * Math.PI * f * t;
        p.tail = 7; p.tailPh = ph; p.yOff = 3 * Math.sin(ph + 1);
        (d.fins || []).forEach((q, i) => { p['fin' + i] = 9 * Math.sin(ph + 0.6 * i); });
      }
      let A_ = 0, ph = 0;
      if (fly) {
        A_ = ext && ext.A !== undefined ? ext.A : (d.type === 'glider' ? 0.12 : 0.35 + 0.15 * Math.sin(t * 0.7));
        ph = ext && ext.ph !== undefined ? ext.ph : 2 * Math.PI * (d.type === 'glider' ? 0.35 : 0.6) * t;
      }
      for (const a of acts || []) {
        const s = (t - a.t0) / a.dur; if (s < 0 || s > 1) continue;
        const b = G.bump(s);
        if (a.type === 'look') { p.neck += -9 * b; p.head += -6 * b; }
        else if (a.type === 'eat') { p.neck += 16 * b; p.head += 10 * b; }
        else if (a.type === 'snap' || a.type === 'roar' || a.type === 'jaw') { p.head += -7 * b; p.neck += -3 * b; }
        else if (a.type === 'flick' || a.type === 'swish') { p.tail += 8 * Math.sin(Math.PI * s); p.tailPh = 2 * Math.PI * 1.5 * s; }
        else if (a.type === 'flap' && fly) { A_ = A_ * (1 - Math.sin(Math.PI * s)) + 0.75 * Math.sin(Math.PI * s); ph = 2 * Math.PI * 2.4 * s; }
        else if (a.type === 'step') { p.breath += 0.03 * b; }
      }
      if (fly) {
        const sN = 0.5 + 0.5 * Math.sin(ph);
        p.wingU = -0.62 * A_ * sN; p.wingD = 0.1 * A_ - 0.4 * A_ * sN;
        p.wingUr = 5 * A_; p.wingDr = 5 * A_; p.wingUrPh = ph; p.wingDrPh = ph;
        p.yOff = -14 * A_ * Math.sin(ph - 0.6);
      }
      p.blink = 0;
      return p;
    };
  };

  /* ---------------- museum / reveal / finale model */
  GL.autoModel = (id) => {
    const d = A(id), W = d.w, H = d.h, [X0, X1, Y0, Y1] = d.box, ty = d.type;
    const walker = ty === 'biped' || ty === 'quad', fly = ty === 'flyer' || ty === 'glider';
    const ax = (X0 + X1) / 2, ay = walker ? Y1 : (Y0 + Y1) / 2;
    const kH = walker ? Math.min(360 / W, 150 / H) : fly ? Math.min(300 / W, 200 / H) : Math.min(380 / W, 120 / H);
    const kC = walker ? Math.min(560 / W, 270 / H) : fly ? Math.min(520 / W, 330 / H) : Math.min(600 / W, 230 / H);
    const hall = { f: walker ? [640, 418] : fly ? [640, 340] : [640, 372], k: kH };
    const close = { f: walker ? [392, 405] : fly ? [380, 262] : [390, 300], k: kC };
    const dots = Object.assign({}, d.dots);
    if (d.mouth) dots.mouth = [d.mouth[0] - 0.035 * W, d.mouth[1] + 0.01 * H];
    if (d.neck && d.head) dots.neck = [(d.neck[0] + d.head[0]) / 2, (d.neck[1] + d.head[1]) / 2];
    // keep the head and mouth dots apart on long, narrow snouts
    const minD = 0.07 * Math.max(W, H);
    if (dots.head && dots.mouth && Math.hypot(dots.head[0] - dots.mouth[0], dots.head[1] - dots.mouth[1]) < minD) {
      const base = d.head || dots.head;
      dots.head = [base[0] + 0.25 * (dots.mouth[0] - base[0]), base[1] - 0.03 * H];
      if (Math.hypot(dots.head[0] - dots.mouth[0], dots.head[1] - dots.mouth[1]) < minD) dots.head = [dots.mouth[0] - minD, dots.mouth[1] - 0.04 * H];
    }
    const pose = Pose.auto(id);
    const sp = DATA.species[id] || {};
    return { key: 'sp_' + id, rig: () => GL.RIGS.auto(id), pose, ax, ay, hall, close, dots,
      tap: fly ? 'flap' : sp.predator ? 'snap' : 'look', sound: sp.predator ? 'roar' : 'chirp',
      factAct: { head: 'snap', mouth: 'snap', neck: 'look', body: 'look', legs: 'step', tail: 'flick', wings: 'flap', fins: 'swish' } };
  };

  /* ---------------- a walking animal as its whole painting: nothing is cut, the painted legs swing a little about their hips.
     Standing, such an animal is exactly its painting. Used for the animals listed in WHOLE: those whose cut-out jointed
     legs came out wrong. The legs on the paintings are found by tools/leg_map.py -> js/legs.js */
  // castoro, kara, masto: low sprawling animals, the cutter could not tell their legs apart (a cut edge showed in the water,
  // a piece of another leg sat on the knee); sidero: the cutter found only one leg of each pair and the far one was its copy;
  // kchel, kther, fruita: short sprawling legs, a cut far leg could not fold under the body and its foot went into the ground
  // cyno, lystro, liso, placer: thick legs of beasts under a heavy body; cut out, a light gap and the far leg's top showed
  // when they stepped, and the hind leg folded the wrong way
  const WHOLE = new Set(['giraffa', 'anchi', 'castoro', 'kara', 'masto', 'sidero', 'kchel', 'kther', 'fruita', 'cyno', 'lystro', 'liso', 'placer']);
  const STEP = { anchi: 1.7 };      // a longer step than the default swing
  const legGrid = {};
  const legLab = (id) => {
    if (legGrid[id]) return legGrid[id];
    const g = window.LEGS[id].g, a = new Uint8Array(g.w * g.h);
    for (let i = 0, k = 0; i < g.r.length; i += 2) { a.fill(g.r[i], k, k + g.r[i + 1]); k += g.r[i + 1]; }
    return (legGrid[id] = (x, y) => { const gi = Math.floor((x - g.x0) / g.st), gj = Math.floor((y - g.y0) / g.st); return gi < 0 || gj < 0 || gi >= g.w || gj >= g.h ? 0 : a[gj * g.w + gi]; });
  };
  const legsOf = (id) => (window.LEGS && window.LEGS[id] ? window.LEGS[id].legs : []);
  const makeWhole = (id, o) => {
    const d = A(id);
    const [X0, X1, , Y1] = d.box, LG = legsOf(id), lab = LG.length ? legLab(id) : null;
    const rig = GL.RIGS.auto(id, o && o.young);
    const hgt = LG.map((q) => q.f[1] - q.c[1]), L = LG.length ? hgt.reduce((s0, v) => s0 + v, 0) / LG.length : 0.3 * (Y1 - d.box[2]);
    LG.forEach((q, k) => {
      const h = hgt[k];
      // the thigh: the whole leg turns about the hip, its top fading into the body; the shin: the lower half bends at the knee
      rig.bones.push({ name: 'leg' + k, type: 'rot', c: q.c, w: (x, y) => (lab(x, y) === k + 1 ? sm(q.c[1] - 0.04 * h, q.c[1] + 0.3 * h, y) : 0) });
      rig.bones.push({ name: 'shin' + k, type: 'rot', c: q.k, w: (x, y) => (lab(x, y) === k + 1 ? sm(q.k[1] - 0.1 * h, q.k[1] + 0.14 * h, y) : 0) });
    });
    // a baby stands on short thick legs: every leg is shortened by the same height, so all the feet stay on one ground line
    const pre0 = rig.pre, YB = pre0 && window.YOUNG && YOUNG[id];
    const drop = pre0 && LG.length && !(YB && YB.arm) ? GL.BABY_LEG.drop * Math.min(...hgt) : 0;
    if (drop) {
      const kx = GL.BABY_LEG.kx, hips = LG.map((q) => pre0(q.c[0], q.c[1]));
      const pre = (x, y) => {
        const p = pre0(x, y), k = lab(x, y);
        if (!k) return p;
        const q = LG[k - 1], h = hgt[k - 1], t = sm(q.c[1], q.c[1] + 0.3 * h, y);
        if (!t) return p;
        const rx = hips[k - 1][0] + (x - q.c[0]) * (1 + (kx - 1) * sm(q.c[1] + 0.05 * h, q.c[1] + 0.4 * h, y)), ry = hips[k - 1][1] + (y - q.c[1]) * (1 - drop / h);
        return [p[0] + (rx - p[0]) * t, p[1] + (ry - p[1]) * t];
      };
      for (const key of Object.keys(pre0)) pre[key] = pre0[key];
      rig.pre = pre;
    }
    const it = GL.sprite('sp_' + id, rig, Object.assign({ ax: (X0 + X1) / 2, ay: Y1 - drop }, o));
    const hind = LG[0] ? LG[0].c : [d.tail[0], d.bellyY];
    it.pivot = rig.pre ? rig.pre(hind[0], hind[1]) : hind;
    it.L = L * (drop ? 1 - drop / Math.max(1, Math.min(...hgt)) : 1);
    it.quad = d.type === 'quad'; it.whole = true;
    it.bodyW = X1 - X0;
    it.stepK = STEP[id] || 1;
    // how each leg is painted (deg, + = the foot behind the hip) and when it steps: legs from tail to head
    const n = LG.length, OFF = n >= 4 ? [0, Math.PI, 1.5 * Math.PI, 0.5 * Math.PI] : n === 3 ? [0, Math.PI, 0.5 * Math.PI] : [0, Math.PI];
    it.legs = LG.map((q, k) => ({ th0: Math.atan2(q.c[0] - q.f[0], q.f[1] - q.c[1]) / D2R, off: OFF[k] || 0 }));
    // the leg painted further back starts its swing forward first
    for (let k = 0; k + 1 < n; k += 2) if (it.legs[k].th0 < it.legs[k + 1].th0) { const t = it.legs[k].off; it.legs[k].off = it.legs[k + 1].off; it.legs[k + 1].off = t; }
    /** the second argument (feet of the old jointed legs) is not used */
    it.pose = (p) => { p.pivot = it.pivot; it.mesh.deform(p); };
    return it;
  };
  const swing = (it, p, ph, amp, lift) => {
    (it.legs || []).forEach((q, k) => {
      const a = ph + q.off, s = Math.sin(a), fwd = Math.max(0, Math.cos(a));     // cos > 0: the leg goes forward, off the ground
      const c = -G.clamp(0.5 * q.th0, -amp, amp);                              // the swing is centred between the painted pose and a plumb leg
      p['leg' + k] = c - amp * s - 0.35 * lift * fwd;
      p['shin' + k] = lift * fwd;
    });
    return p;
  };

  /* ---------------- jointed creature with one or two leg pairs */
  GL.makeAuto = (id, o) => {
    const d = A(id);
    if (!isWalker(id)) {
      const M = GL.autoModel(id);
      return GL.sprite('sp_' + id, GL.RIGS.auto(id, o && o.young), Object.assign({ ax: M.ax, ay: M.ay }, o));
    }
    if (WHOLE.has(id) && legsOf(id).length) return makeWhole(id, o);
    const [X0, X1, , Y1] = d.box;
    const it = Object.assign({ x: 0, y: 0, s: 1, rot: 0, ax: (X0 + X1) / 2, ay: Y1, flip: false, alpha: 1, z: 0, visible: true, blink: 0, bright: 0, tint: null }, o || {});
    it.mesh = new GL.Mesh('sp_' + id + '_body', GL.RIGS.auto(id, o && o.young));
    const hind = d.pairs.find((q) => !q.front) || d.pairs[0];
    it.pivot = hind.joints[0];
    it.bodyW = X1 - X0;
    // a baby stands on short thick legs (every leg is shortened by the same height, so all the feet stay on one ground line)
    const pre0 = it.mesh.rig.pre, YB = pre0 && window.YOUNG && YOUNG[id];
    const drop = pre0 && !(YB && YB.arm) ? GL.BABY_LEG.drop * Math.min(...d.pairs.map((pr) => pr.joints[4][1] - pr.joints[0][1])) : 0;
    if (drop) it.ay -= drop;
    it.pairs = d.pairs.map((pr) => {
      const bl = pre0 ? GL.babyLeg(pr.joints, drop, GL.BABY_LEG.kx) : null, ky = bl ? bl.ky : 1;
      const J = bl ? bl.J : pr.joints, H0 = J[0], L = pr.L * ky, up = 0.3 * L;
      const skin = [[H0[0], H0[1] - up]].concat(J);
      const mk = () => { const m = new GL.Mesh(pr.key, { step: 5 }); m.chainSkin(skin, [pr.lx, pr.ly], 5, null, bl && bl.f); return m; };
      // the far leg is its own picture, cut from the painted far leg (tools/far_piece.py); without one it is a copy of the near leg
      const own = !!(pr.fkey && MAN[pr.fkey] && G.have(pr.fkey));
      const blF = own && pre0 ? GL.babyLeg(pr.fjoints, drop, GL.BABY_LEG.kx) : null, JF = own ? (blF ? blF.J : pr.fjoints) : J;
      const mkF = () => { const m = new GL.Mesh(pr.fkey, { step: 5 }); m.chainSkin([[JF[0][0], JF[0][1] - up]].concat(JF), [pr.flx, pr.fly], 5, null, blF && blF.f); return m; };
      const q = { pr, J, H0, up, front: pr.front, near: mk(), far: own ? mkF() : mk(), legN: new GL.Leg(J), legF: new GL.Leg(JF), ground: J[4][1], L, own, HF0: own ? JF[0] : null,
        // the far leg's hip is shifted towards the middle of the body, where the body hides its top: a front leg shifted
        // forwards stuck out in front of the chest
        far0: { dx: (pr.front ? -0.12 : 0.16) * L, dy: -0.05 * L, dg: -0.035 * L } };
      // where the far leg is on the painting (tools/far_hip.py): the copy grows from there, so what the painting shows of the
      // far leg's top (the lump at the rump) has its leg under it and the pair strides as painted
      const FR = window.LEGS && LEGS[id] && LEGS[id].far && LEGS[id].far[pr.front ? 'F' : 'H'];
      if (own) q.far0 = { dx: 0, dy: 0, dg: JF[4][1] - J[4][1], lean: JF[4][0] - JF[0][0] };
      else if (FR) { q.far0.dx = G.clamp(FR[0] * ky, -0.7 * L, 0.7 * L); q.far0.lean = G.clamp(FR[1] * ky, -0.5 * L, 0.5 * L); }
      // a far leg with longer bones (its painted foot was out of the near bones' reach) may fold as deep as the near leg does
      q.legN.minExt = 0.45; q.legF.minExt = 0.45 * Math.min(1, (q.legN.L[0] + q.legN.L[1]) / Math.max(1, q.legF.L[0] + q.legF.L[1]));
      return q;
    });
    // a baby's reshaped body carries its hips along
    const pre = it.mesh.rig.pre;
    if (pre) { it.pivot = pre(it.pivot[0], it.pivot[1]); for (const q of it.pairs) { q.H0 = pre(q.H0[0], q.H0[1]); if (q.HF0) q.HF0 = pre(q.HF0[0], q.HF0[1]); } }
    const farTint = [0.12, 0.09, 0.06, 0.2];
    const fo = {};
    it.draw = () => {
      Object.assign(fo, it); fo.tint = farTint; fo.blink = 0;
      for (const q of it.pairs) q.far.draw(q.own ? it : fo);      // a far leg of its own is already painted in the shade
      it.mesh.draw(it);
      for (const q of it.pairs) q.near.draw(it);
    };
    it.toDesign = (lx, ly) => { const m = GL._place(it); return [m[0] * lx + m[3] * ly + m[6], m[1] * lx + m[4] * ly + m[7]]; };
    it.track = (lx, ly, pose) => { const p = pose ? it.mesh.point(lx, ly, pose) : [lx, ly]; return it.toDesign(p[0], p[1]); };
    const anchor = (J, up) => { const h = J[0]; return [[h[0], h[1] - up], h, J[1], J[2], J[3], J[4]]; };
    /** body pose + feet(leg, H, ground, side 0|1, pair) */
    it.pose = (p, feet) => {
      p.pivot = it.pivot;
      it.mesh.deform(p);
      const bob = p.bob || 0, pc = Math.cos((p.pitch || 0) * D2R), ps = Math.sin((p.pitch || 0) * D2R), pv = it.pivot;
      it.pairs.forEach((q, k) => {
        const dx = q.H0[0] - pv[0], dy = q.H0[1] - pv[1];
        const H = [pv[0] + pc * dx - ps * dy, pv[1] + ps * dx + pc * dy + bob];
        const fx = q.HF0 ? q.HF0[0] - pv[0] : 0, fy = q.HF0 ? q.HF0[1] - pv[1] : 0;
        const Hf = q.HF0 ? [pv[0] + pc * fx - ps * fy, pv[1] + ps * fx + pc * fy + bob] : [H[0] + q.far0.dx, H[1] + q.far0.dy];
        q.near.deformChain(anchor(feet(q.legN, H, q.ground, 0, q), q.up));
        q.far.deformChain(anchor(feet(q.legF, Hf, q.ground + q.far0.dg, 1, q), q.up));
      });
    };
    it.L = (it.pairs.find((q) => !q.front) || it.pairs[0]).L; it.id = id;
    GL.items.push(it);
    return it;
  };

  /* ---------------- gaits for jointed auto creatures */
  const walkP = (L) => ({ duty: 0.62, reach: 0.3 * L, sweep: 0.62 * L, lift: 0.1 * L, roll: 0.5, trail: 0.6, ret: 0.3, psiC: -12, psiL: 36, psiS: 58, aL: 46, aS: 56 });
  const runP = (L) => ({ duty: 0.4, reach: 0.42 * L, sweep: 0.84 * L, lift: 0.24 * L, roll: 0.45, trail: 0.45, ret: 0.35, psiC: -18, psiL: 42, psiS: 66, aL: 50, aS: 62, liftSkew: 0.8 });
  const trotP = (L) => ({ duty: 0.5, reach: 0.36 * L, sweep: 0.74 * L, lift: 0.16 * L, roll: 0.45, trail: 0.5, ret: 0.3, psiC: -14, psiL: 40, psiS: 60, aL: 48, aS: 58 });
  /** stride length (sprite px) of a gait for this creature */
  GL.autoStride = (it, mode) => {
    const least = (mode === 'run' ? 0.4 : 0.25) * (it.bodyW || 0);
    if (it.whole) return Math.max(least, (mode === 'run' ? (it.quad ? 1.5 : 2.1) : 1) * it.L * it.stepK);
    const P = (mode === 'run' ? (it.pairs.length > 1 ? trotP : runP) : walkP)(it.L); return Math.max(least, P.sweep / P.duty);
  };
  /** [bodyPose, feet] for a creature: mode walk | run | stand */
  GL.autoGait = (it, mode, ph, t, mod) => {
    if (it.whole) {
      const Ls = it.L / 120;
      if (mode === 'stand') return [{ bob: -0.6 * Ls * Math.sin((t || 0) * 2.1), pitch: 0 }, null];
      const run = mode === 'run', k = 2 * ph;
      const body = run ? { bob: (it.quad ? 2.5 : 4) * Ls * Math.cos(k) - 3 * Ls, pitch: 1 * Math.sin(k - 0.5), tail: 4, tailPh: ph + 0.8, head: -1.5 * Math.cos(k + 0.3) }
        : { bob: (-1.6 * Math.cos(k) - 1) * Ls, pitch: 0.7 * Math.sin(k + 0.6), tail: 4.5, tailPh: ph + 1.2, head: 1.4 * Math.cos(k + 0.4) };
      const lift = (mod && mod.lift ? 60 * mod.lift : 0);
      return [swing(it, body, ph, (run ? 15 : 11) * it.stepK, (run ? 24 : 16) + lift), null];
    }
    const u = ph / (2 * Math.PI), quad = it.pairs.length > 1, Ls = it.L / 120;
    if (mode === 'stand') {
      const body = { bob: -0.6 * Ls * Math.sin((t || 0) * 2.1), pitch: 0 };
      // the far leg of a pair stands apart from the near one, as in the painting: where the near leg leans back the far one
      // is set forward (and the other way round), never closer than a third of the leg's height — two legs side by side
      // looked like one, and the animal seemed to stand on two legs (or on three)
      const feet = (leg, H, g, side, q) => {
        if (!q) return leg.fromToe(H, [leg.J0[4][0] + (side ? 0.12 : -0.03) * it.L, g], leg.toe0, (side ? 2 : 10) * D2R);
        const d = leg.J0[4][0] - leg.J0[0][0];
        // standing, both legs are exactly as painted
        if (!side) return leg.fromToe(H, [H[0] + d, g], leg.toe0, leg.psi0);
        let m = q.far0.lean !== undefined ? q.far0.lean : (d <= 0.08 * q.L ? 1 : -1) * G.clamp(Math.abs(d), 0.34 * q.L, 0.5 * q.L);
        // a front leg set far back would show as a lone foot under the belly of a low animal
        if (q.front && m < 0 && q.far0.lean === undefined) m = Math.max(m, -0.15 * q.L);
        // never further than the leg can reach: its ankle stays within the length of thigh and shin from the hip
        const a = leg.toe0, psi = q.own ? leg.psi0 : 2 * D2R, Ls = leg.L, ax = -Ls[3] * Math.cos(a) + Ls[2] * Math.sin(psi), ay = g - Ls[3] * Math.sin(a) - Ls[2] * Math.cos(psi);
        const R = Math.sqrt(Math.max(0, ((Ls[0] + Ls[1]) * 0.94) ** 2 - (ay - H[1]) ** 2));
        if (!q.own) m = G.clamp(m, -R - ax, R - ax);
        return leg.fromToe(H, [H[0] + m, g], a, psi);
      };
      return [body, feet];
    }
    const run = mode === 'run';
    const k = 2 * Math.PI * 2 * u;
    const body = run ? { bob: (quad ? 2.5 : 4) * Ls * Math.cos(k) - 6 * Ls, pitch: 1 * Math.sin(k - 0.5), tail: 4, tailPh: ph + 0.8, head: -1.5 * Math.cos(k + 0.3) }
      : { bob: (-2.2 * Math.cos(k) - 3) * Ls, pitch: 0.7 * Math.sin(k + 0.6), tail: 4.5, tailPh: ph + 1.2, head: 1.4 * Math.cos(k + 0.4) };
    const feet = (leg, H, g, side, q) => {
      const P = (run ? (quad ? trotP : runP) : walkP)(q.L);
      if (mod) { P.lift += (mod.lift || 0) * q.L; P.psiS += mod.psiS || 0; P.aS += mod.aS || 0; }
      let off = side ? 0.5 : 0;
      if (q.front) off += run ? 0.5 : 0.25;
      const f = GL.footAt(leg, u + off, H, P, g);
      return leg.fromToe(H, f.T, f.a, f.psi);
    };
    return [body, feet];
  };

  /** turn to face dir (1 right, -1 left). The turn is instant: a picture squeezed through its flat side looked wrong. */
  GL.face = (it, dir) => { it.flip = dir < 0; it.sxk = 1; return true; };
  /** legs of a four-legged animal swimming: the hind feet push back in turns, the front feet lie folded under the chest */
  GL.paddleFeet = (it, t, speed) => {
    const w = 2 * Math.PI * (0.6 + 1.1 * (speed || 0.5)) * t;
    return (leg, H, g, side, q) => {
      const L = leg.L[0] + leg.L[1], ph = w + (side ? Math.PI : 0) + (q.front ? 0.9 : 0);
      const th = q.front ? 1.15 + 0.12 * Math.sin(ph) : 1.0 + 0.42 * Math.sin(ph), r = (q.front ? 0.62 : 0.8) * L;
      const A = [H[0] - r * Math.sin(th), H[1] + r * Math.cos(th)];
      return leg.fromAnkle(H, A, Math.PI - 0.18, th + 0.35);
    };
  };
  /** a walking animal made to swim: scenes keep calling it.mesh.deform(pose), the legs paddle (or stand on the bottom) */
  GL.waterWalker = (id, o, bottom) => {
    const it = GL.makeAuto(id, o), m = it.mesh, deform = m.deform.bind(m);
    let inPose = false, t = 0;
    m.deform = (ps) => {
      if (it.whole) { t += 1 / 60; if (!bottom) swing(it, ps, 2 * Math.PI * (0.5 + 0.9 * (ps._speed || 0.5)) * t, 13, 20); ps.pivot = it.pivot; return deform(ps); }
      if (inPose) return deform(ps);
      inPose = true;
      t += 1 / 60;
      const feet = bottom ? GL.autoGait(it, 'stand', 0, t)[1] : GL.paddleFeet(it, t, ps._speed);
      it.pose(ps, feet);
      inPose = false;
    };
    return it;
  };

  /** a freshly hatched animal (the adult art at a small size): {it, s (final scale), pose(t, look)} */
  GL.autoBaby = (id, o) => {
    const d = A(id), [X0, X1, Y0, Y1] = d.box, W = X1 - X0, H = Y1 - Y0;
    if (isWalker(id)) {
      const it = GL.makeAuto(id, Object.assign({ young: true }, o));
      return { it, s: Math.min(300 / W, 170 / H), pose: (t, look) => { const [bp, feet] = GL.autoGait(it, 'stand', 0, t); bp.head = (look || 0) - 2; bp.neck = (look || 0) * 0.5; bp.tail = 4; bp.tailPh = t * 3; it.pose(bp, feet); } };
    }
    const M = GL.autoModel(id), pf = Pose.auto(id);
    const it = GL.sprite('sp_' + id, GL.RIGS.auto(id, true), Object.assign({ ax: M.ax, ay: M.ay }, o, { y: (o.y || 0) - 40 }));
    return { it, s: Math.min(280 / W, 190 / H), pose: (t, look) => { const p = pf(t, [], [], { A: 0.12, ph: t * 2, speed: 0.6 }); p.head = (p.head || 0) + (look || 0); it.mesh.deform(p); } };
  };

  /* ---------------- assets a scene needs (lazy loading; DOM pictures load by URL on their own) */
  G.needKeys = (scene, p) => {
    const keys = [], id = G.cur();
    const addSp = (sid) => {
      const d = MAN.auto && MAN.auto[sid]; if (!d) return;
      keys.push('sp_' + sid);
      if (d.pairs) { keys.push('sp_' + sid + '_body'); for (const q of d.pairs) { keys.push(q.key); if (q.fkey) keys.push(q.fkey); } }
    };
    const addSk = (sid) => {
      if (!MAN.auto || !MAN.auto[sid] || !MAN.sk[sid]) return;
      keys.push('sk_' + sid + '_ghost');
      for (const k of Object.keys(MAN.sk[sid].bones)) keys.push('sk_' + sid + '_' + k);
    };
    if (scene === 'dig') { const site = DATA.species[id].site; for (const s of Object.values(DATA.species)) if (s.site === site) addSk(s.id); keys.push('digbg_' + G.digGround(site)); }
    else if (scene === 'assemble') { addSk(id); addSp(id); }
    else if (!['map', 'site', 'title', 'loading', 'path'].includes(scene)) addSp(id);
    // eggs and nests of the animal's kind, and its painted hatchling with the closed eye for blinking
    const HT = window.HATCH, eg = HT && HT.grp[id];
    if (scene === 'ch1' && eg) { keys.push('bgnest_' + eg, 'egg_' + eg); if (HT.eye[id]) keys.push('hatch_' + id, 'lid_' + id); }
    if (scene === 'guard' && eg) keys.push('nestegg_' + eg, 'tree_glide');
    if (scene === 'glide') keys.push('tree_glide');
    // scrolling backgrounds are GL textures: load the picture of the animal's region before the scene starts
    const SCROLL = { chase: p && p.bg || 'bg_run', escape: p && p.bg || 'bg_run', glide: 'bg_forest', mud: 'bg_mud', flap: p && p.bg || 'bg_lagoon', swim: 'bg_sea' }[scene];
    if (SCROLL) { const rk = G.rbg(SCROLL); if (rk !== SCROLL) keys.push(rk); }
    // a predator that runs after the player (escape) moves on its own jointed legs
    if ((scene === 'escape' || scene === 'defend') && p && p.hunter) { addSp(String(p.hunter).replace(/^sp_/, '')); if (/^nb_/.test(p.hunter)) keys.push(p.hunter); }
    return keys;
  };
})();
