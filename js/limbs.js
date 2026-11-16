'use strict';
/* ==================================================================== jointed legs: 4 bones per leg (thigh · shin · metatarsus · toes) + IK */
(() => {
  const D2R = Math.PI / 180;
  const ang = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);
  const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  const segDist = (px, py, a, b) => {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(a[0] + t * dx - px, a[1] + t * dy - py);
  };
  /** cyclic Catmull-Rom over keys [[t, v], ...] with t in [0,1) */
  const cyc = (keys, t) => {
    t -= Math.floor(t);
    const n = keys.length;
    let i = n - 1;
    for (let k = 0; k < n; k++) if (keys[k][0] <= t) i = k;
    const k0 = keys[(i - 1 + n) % n], k1 = keys[i], k2 = keys[(i + 1) % n], k3 = keys[(i + 2) % n];
    const t1 = k1[0], t2 = k2[0] <= t1 ? k2[0] + 1 : k2[0];
    const tt = t < t1 ? t + 1 : t, s = (tt - t1) / (t2 - t1 || 1);
    const p0 = k0[1], p1 = k1[1], p2 = k2[1], p3 = k3[1];
    const s2 = s * s, s3 = s2 * s;
    return 0.5 * (2 * p1 + (-p0 + p2) * s + (2 * p0 - 5 * p1 + 4 * p2 - p3) * s2 + (-p0 + 3 * p1 - 3 * p2 + p3) * s3);
  };
  /** 1-D keyframes, clamped, Catmull-Rom */
  const kf = (keys, t) => {
    if (t <= keys[0][0]) return keys[0][1];
    const n = keys.length;
    if (t >= keys[n - 1][0]) return keys[n - 1][1];
    let i = 0; while (i < n - 2 && keys[i + 1][0] <= t) i++;
    const k0 = keys[Math.max(0, i - 1)], k1 = keys[i], k2 = keys[i + 1], k3 = keys[Math.min(n - 1, i + 2)];
    const s = (t - k1[0]) / (k2[0] - k1[0]), s2 = s * s, s3 = s2 * s;
    // tangents scaled for non-uniform spacing
    const m1 = ((k2[1] - k0[1]) / (k2[0] - k0[0] || 1)) * (k2[0] - k1[0]);
    const m2 = ((k3[1] - k1[1]) / (k3[0] - k1[0] || 1)) * (k2[0] - k1[0]);
    return (2 * s3 - 3 * s2 + 1) * k1[1] + (s3 - 2 * s2 + s) * m1 + (-2 * s3 + 3 * s2) * k2[1] + (s3 - s2) * m2;
  };
  GL.kf = kf; GL.cyc = cyc;

  /* ---------------- chain skinning on a grid mesh */
  const Mesh = GL.Mesh;
  /** weights from the distance to each rest bone; p = sharpness */
  Mesh.prototype.chainSkin = function (J, off, p, rad, map) {
    const n = this.n, nb = J.length - 1, R0 = this.rest;
    // map: a reshaping of the picture in the animal's frame (a baby's short thick leg); the joints J are given reshaped
    let R = R0;
    if (map) { R = new Float32Array(n * 2); for (let v = 0; v < n; v++) { const q = map(R0[v * 2] + off[0], R0[v * 2 + 1] + off[1]); R[v * 2] = q[0] - off[0]; R[v * 2 + 1] = q[1] - off[1]; } }
    this.cr = R;
    this.off = off; this.J0 = J; this.cw = [];
    for (let i = 0; i < nb; i++) this.cw.push(new Float32Array(n));
    const tmp = new Float64Array(nb);
    for (let v = 0; v < n; v++) {
      const x = R[v * 2] + off[0], y = R[v * 2 + 1] + off[1];
      let sum = 0;
      for (let i = 0; i < nb; i++) {
        const d = segDist(x, y, J[i], J[i + 1]) / ((rad && rad[i]) || 1);
        tmp[i] = Math.pow(1 / (d + 1.2), p); sum += tmp[i];
      }
      for (let i = 0; i < nb; i++) this.cw[i][v] = tmp[i] / sum;
    }
    this.T = new Float32Array(nb * 4);
    this.a0 = []; for (let i = 0; i < nb; i++) this.a0.push(ang(J[i], J[i + 1]));
  };
  /** Jp: posed joints (same count as rest joints) */
  Mesh.prototype.deformChain = function (Jp) {
    const nb = this.cw.length, T = this.T, J = this.J0;
    for (let i = 0; i < nb; i++) {
      const d = ang(Jp[i], Jp[i + 1]) - this.a0[i], c = Math.cos(d), s = Math.sin(d);
      T[i * 4] = c; T[i * 4 + 1] = s;
      T[i * 4 + 2] = Jp[i][0] - (c * J[i][0] - s * J[i][1]);
      T[i * 4 + 3] = Jp[i][1] - (s * J[i][0] + c * J[i][1]);
    }
    const R = this.cr, P = this.pos, ox = this.off[0], oy = this.off[1], W = this.cw;
    for (let v = 0; v < this.n; v++) {
      const x = R[v * 2] + ox, y = R[v * 2 + 1] + oy;
      let X = 0, Y = 0;
      for (let i = 0; i < nb; i++) {
        const w = W[i][v], k = i * 4;
        X += w * (T[k] * x - T[k + 1] * y + T[k + 2]);
        Y += w * (T[k + 1] * x + T[k] * y + T[k + 3]);
      }
      P[v * 2] = X; P[v * 2 + 1] = Y;
    }
    this.dirty = true;
  };

  /* ---------------- one leg: hip → knee → ankle → ball → toe tip */
  class Leg {
    constructor(J) {
      this.J0 = J;
      this.L = [0, 1, 2, 3].map((i) => dist(J[i], J[i + 1]));
      const H = J[0], K = J[1], A = J[2];
      this.side = Math.sign((A[0] - H[0]) * (K[1] - H[1]) - (A[1] - H[1]) * (K[0] - H[0])) || -1;
      this.J = J.map((p) => p.slice());
      this.toe0 = ang(J[3], J[4]);                                  // rest toe angle
      this.psi0 = Math.atan2(J[2][0] - J[3][0], J[3][1] - J[2][1]); // rest metatarsus lean (ankle ahead of ball > 0)
    }
    /** foot planted by its toe tip T; a = toe angle (rad, below horizontal), psi = metatarsus lean */
    fromToe(H, T, a, psi) {
      const L = this.L;
      const M = [T[0] - L[3] * Math.cos(a), T[1] - L[3] * Math.sin(a)];
      const A = [M[0] + L[2] * Math.sin(psi), M[1] - L[2] * Math.cos(psi)];
      return this.solve(H, A, M, T);
    }
    /** foot hanging from the ankle A */
    fromAnkle(H, A, a, psi, ground) {
      const L = this.L;
      let M = [A[0] - L[2] * Math.sin(psi), A[1] + L[2] * Math.cos(psi)];
      let T = [M[0] + L[3] * Math.cos(a), M[1] + L[3] * Math.sin(a)];
      if (ground !== undefined) { // never dig into the ground
        const pen = Math.max(T[1] - ground, M[1] - (ground - 6), 0);
        if (pen > 0) { A = [A[0], A[1] - pen]; M = [M[0], M[1] - pen]; T = [T[0], T[1] - pen]; }
      }
      return this.solve(H, A, M, T);
    }
    /** forward kinematics: thigh angle + relative knee, ankle, toe angles (rad) */
    fk(H, t1, kn, an, to) {
      const L = this.L, J = this.J;
      const a1 = t1, a2 = a1 + kn, a3 = a2 + an, a4 = a3 + to;
      J[0][0] = H[0]; J[0][1] = H[1];
      J[1][0] = H[0] + L[0] * Math.cos(a1); J[1][1] = H[1] + L[0] * Math.sin(a1);
      J[2][0] = J[1][0] + L[1] * Math.cos(a2); J[2][1] = J[1][1] + L[1] * Math.sin(a2);
      J[3][0] = J[2][0] + L[2] * Math.cos(a3); J[3][1] = J[2][1] + L[2] * Math.sin(a3);
      J[4][0] = J[3][0] + L[3] * Math.cos(a4); J[4][1] = J[3][1] + L[3] * Math.sin(a4);
      return J;
    }
    /** joint angles of the current pose: [thigh, knee, ankle, toes] (relative, rad) */
    angles() {
      const J = this.J, w = (x) => Math.atan2(Math.sin(x), Math.cos(x));
      const a = [0, 1, 2, 3].map((i) => ang(J[i], J[i + 1]));
      return [a[0], w(a[1] - a[0]), w(a[2] - a[1]), w(a[3] - a[2])];
    }
    solve(H, A, M, T) {
      const L1 = this.L[0], L2 = this.L[1];
      let dx = A[0] - H[0], dy = A[1] - H[1], d = Math.hypot(dx, dy);
      const dMax = (L1 + L2) * 0.995, dMin = Math.max(Math.abs(L1 - L2) + 2, (L1 + L2) * (this.minExt || 0));
      if (d > dMax || d < dMin) { // out of reach: move the whole foot along the hip→ankle line
        const nd = d > dMax ? dMax : dMin, k = nd / (d || 1), sx = H[0] + dx * k - A[0], sy = H[1] + dy * k - A[1];
        A = [A[0] + sx, A[1] + sy]; M = [M[0] + sx, M[1] + sy]; T = [T[0] + sx, T[1] + sy];
        dx = A[0] - H[0]; dy = A[1] - H[1]; d = nd;
      }
      const c = Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)));
      const th = Math.atan2(dy, dx) + this.side * Math.acos(c);
      const K = [H[0] + L1 * Math.cos(th), H[1] + L1 * Math.sin(th)];
      const J = this.J;
      J[0][0] = H[0]; J[0][1] = H[1]; J[1][0] = K[0]; J[1][1] = K[1]; J[2][0] = A[0]; J[2][1] = A[1];
      J[3][0] = M[0]; J[3][1] = M[1]; J[4][0] = T[0]; J[4][1] = T[1];
      return J;
    }
  }
  GL.Leg = Leg;

  /* ---------------- gait: one leg at phase u (0 = touch-down) -> foot spec {T, a, psi} */
  /** P: {duty, reach, sweep, lift, roll, trail, ret, psiC, psiL, psiS, aL, aS} (lengths in sprite px, angles in degrees) */
  function footAt(leg, u, H, P, ground) {
    u -= Math.floor(u);
    const D = P.duty, a0 = leg.toe0;
    const xC = H[0] + P.reach, xL = xC - P.sweep;
    if (u < D) {
      // stance: toe tip planted, the ball rolls up onto the toes at the end
      const s = u / D, r = Math.max(0, (s - P.roll) / (1 - P.roll));
      return { T: [lerp(xC, xL, s), ground], a: a0 + (P.aL * D2R - a0) * r * r, psi: (P.psiC + (P.psiL - P.psiC) * (0.62 * s + 0.38 * s * s * s)) * D2R };
    }
    // swing: the toe tip follows one smooth arc; the foot folds back, then reaches forward
    const v = (u - D) / (1 - D), v2 = v * v, v3 = v2 * v;
    const vs = -P.sweep * ((1 - D) / D); // stance toe speed in swing units
    const m0 = vs * P.trail, m1 = vs * P.ret;
    const x = (2 * v3 - 3 * v2 + 1) * xL + (v3 - 2 * v2 + v) * m0 + (-2 * v3 + 3 * v2) * xC + (v3 - v2) * m1;
    const y = ground - P.lift * Math.sin(Math.PI * Math.pow(v, P.liftSkew || 0.85));
    return {
      T: [x, Math.min(y, ground)],
      a: kf([[0, P.aL], [0.4, P.aS], [0.8, a0 / D2R + 8], [1, a0 / D2R]], v) * D2R,
      psi: kf([[0, P.psiL], [0.4, P.psiS], [0.82, P.psiC + 4], [1, P.psiC]], v) * D2R,
    };
  }
  /** running swing by bone angles: the thigh protracts smoothly, the foot folds back, then reaches forward */
  function swingFK(leg, u, H, P, ground) {
    u -= Math.floor(u);
    const D = P.duty, v = (u - D) / (1 - D), R = D2R, K = P.sw;
    const abs = () => [0, 1, 2, 3].map((i) => ang(leg.J[i], leg.J[i + 1]));
    const st = (s) => { const f = footAt(leg, s * D, H, P, ground); leg.fromToe(H, f.T, f.a, f.psi); return abs(); };
    const a0 = st(0.9999), a1 = st(0);
    // keys: {v, mix | off (thigh), abs: [shin, meta, toes] | rel: [shin, meta, toes] offsets from touch-down}
    const key = (i) => [[0, a0[i]]].concat(K.map((k) => [k.v,
      i === 0 ? (k.mix !== undefined ? lerp(a0[0], a1[0], k.mix) : a1[0] + (k.off || 0) * R)
        : k.abs ? k.abs[i - 1] * R : a1[i] + k.rel[i - 1] * R])).concat([[1, a1[i]]]);
    const A = [0, 1, 2, 3].map((i) => kf(key(i), v));
    const J = leg.J, L = leg.L;
    J[0][0] = H[0]; J[0][1] = H[1];
    for (let i = 0; i < 4; i++) { J[i + 1][0] = J[i][0] + L[i] * Math.cos(A[i]); J[i + 1][1] = J[i][1] + L[i] * Math.sin(A[i]); }
    const pen = Math.max(J[4][1] - ground, J[3][1] - (ground - 4), 0); // never through the ground
    if (pen > 0) for (let i = 1; i < 5; i++) J[i][1] -= pen;
    return J;
  }
  GL.swingFK = swingFK;
  const mixFoot = (f, g, w) => (w <= 0 ? f : w >= 1 ? g : { T: [lerp(f.T[0], g.T[0], w), lerp(f.T[1], g.T[1], w)], a: lerp(f.a, g.a, w), psi: lerp(f.psi, g.psi, w) });
  GL.footAt = footAt;

  /* ---------------- a creature drawn as: far leg · body · near leg */
  /** def: {body, leg (keys), rig (body rig), legs: MAN.legs[name], far: {dx, dy, dg, tint}} */
  GL.creature = (def, o) => {
    const it = Object.assign({ x: 0, y: 0, s: 1, rot: 0, ax: 0, ay: 0, flip: false, alpha: 1, z: 0, visible: true, blink: 0, bright: 0, tint: null }, o || {});
    const info = def.legs;
    it.mesh = new GL.Mesh(def.body, def.rig);
    // a baby (the body's rig carries the reshaping): short thick legs, hips where the reshaped body has them
    const pre = def.rig.pre, BL = pre && GL.BABY_LEG;
    const bl = BL ? GL.babyLeg(info.joints, BL.drop * (info.joints[4][1] - info.joints[0][1]), BL.kx) : null;
    const J = bl ? bl.J : info.joints;
    if (bl) it.ay -= info.joints[4][1] - J[4][1];
    // skin bones: [pelvis anchor (never rotates), thigh, shin, metatarsus, toes]
    const up = (def.anchor || 34) * (bl ? bl.ky : 1);
    const skinJ = [[J[0][0], J[0][1] - up]].concat(J);
    const mk = () => { const m = new GL.Mesh(def.leg, { step: def.step || 3 }); m.chainSkin(skinJ, [info.lx, info.ly], def.sharp || 5, def.rad, bl && bl.f); return m; };
    // the far leg is its own picture, cut from the painted far leg (tools/far_creature.py), with the near leg's bones laid on
    // it; without one it is a copy of the near leg
    const FI = info.far && G.have(info.far.key) ? info.far : null;
    const blF = FI && BL ? GL.babyLeg(FI.joints, BL.drop * (info.joints[4][1] - info.joints[0][1]), BL.kx) : null;
    const JF = FI ? (blF ? blF.J : FI.joints) : J;
    const mkF = () => { const m = new GL.Mesh(FI.key, { step: def.step || 3 }); m.chainSkin([[JF[0][0], JF[0][1] - up]].concat(JF), [FI.lx, FI.ly], def.sharp || 5, def.rad, blF && blF.f); return m; };
    it.near = mk(); it.far = FI ? mkF() : mk();
    it.legN = new Leg(J); it.legF = new Leg(JF);
    // it steps as the near leg does: the knee bends the same way, the toes meet the ground at the same angle
    if (FI) { it.legF.side = it.legN.side; it.legF.toe0 = it.legN.toe0; it.legF.psi0 = it.legN.psi0; }
    const H0 = pre ? pre(J[0][0], J[0][1]) : J[0];
    it.legN.minExt = it.legF.minExt = def.minExt || 0;
    const withAnchor = (J) => { const h = J[0]; return [[h[0], h[1] - up], h, J[1], J[2], J[3], J[4]]; };
    const far = def.far || { dx: 6, dy: -3, dg: -3, tint: [0.16, 0.11, 0.07, 0.34] };
    // a far leg of its own is painted in the shade already: only a little darker
    const farTint = FI ? [far.tint[0], far.tint[1], far.tint[2], far.tint[3] * 0.45] : far.tint;
    const fo = {};
    it.draw = () => {
      Object.assign(fo, it); fo.tint = farTint; fo.blink = 0;
      it.far.draw(fo); it.mesh.draw(it); it.near.draw(it);
    };
    it.toDesign = (lx, ly) => { const m = GL._place(it); return [m[0] * lx + m[3] * ly + m[6], m[1] * lx + m[4] * ly + m[7]]; };
    it.track = (lx, ly, pose) => { const p = pose ? it.mesh.point(lx, ly, pose) : [lx, ly]; return it.toDesign(p[0], p[1]); };
    it.H0 = H0; it.ground = J[4][1];
    /** pose: body pose (tail, head, breath, bob, pitch) + feet {near:[...], far:[...]} via fn(leg, H, ground) */
    it.pose = (p, feet) => {
      p.pivot = H0;
      it.mesh.deform(p);
      const bob = p.bob || 0;
      const H = [H0[0], H0[1] + bob];
      const Hf = [H0[0] + far.dx, H0[1] + far.dy + bob];
      it.near.deformChain(withAnchor(feet(it.legN, H, it.ground, 0)));
      it.far.deformChain(withAnchor(feet(it.legF, Hf, it.ground + far.dg, 1)));
    };
    GL.items.push(it);
    return it;
  };

  /* ---------------- ready-made motions */
  const WALK = { duty: 0.62, reach: 40, sweep: 80, lift: 11, roll: 0.5, trail: 0.6, ret: 0.3, psiC: -12, psiL: 36, psiS: 58, aL: 46, aS: 56 };
  // runner sprite: 478 px of ground per cycle (hunt: 220 design px at scale 0.46)
  const RUN = { cycle: 478, duty: 0.38, reach: 95, sweep: 182, lift: 52, roll: 0.45, trail: 0.45, ret: 0.35, psiC: -20, psiL: 45, psiS: 66, aL: 52, aS: 62, liftSkew: 0.8,
    fk: true, sw: [{ v: 0.3, mix: 0.45, abs: [152, 150, 115] }, { v: 0.62, off: -6, abs: [148, 128, 70] }, { v: 0.75, off: -6, abs: [128, 76, 22] }, { v: 0.88, off: -4, rel: [4, -12, -14] }] };
  GL.Gaits = {
    WALK, RUN,
    /** walking: ph = cycle phase (rad); returns [bodyPose, feetFn] */
    walk(ph, P) {
      P = P || WALK;
      const u = ph / (2 * Math.PI);
      const k = 2 * Math.PI * 2 * (u - P.duty / 2);
      const bs = P.bob || 1;
      const body = { bob: (-2.2 * Math.cos(k) - 3) * bs, pitch: 0.8 * Math.sin(k + 0.6), tail: 4.5, tailPh: ph + 1.2, head: 1.6 * Math.cos(k + 0.4), breath: 0 };
      const feet = (leg, H, g, i) => { const f = footAt(leg, u + (i ? 0.5 : 0), H, P, g); return leg.fromToe(H, f.T, f.a, f.psi); };
      return [body, feet];
    },
    /** running with flight phases; air = 0..1 tucks the legs for a jump */
    run(ph, air, P) {
      P = P || RUN; air = air || 0;
      const u = ph / (2 * Math.PI);
      const k = 2 * Math.PI * 2 * (u - P.duty / 2);
      // spring-mass: lowest at mid-stance, highest in flight
      const body = {
        bob: lerp(4 * Math.cos(k) - 8, -12, air), pitch: lerp(1.2 * Math.sin(k - 0.5), -1.5, air),
        tail: 3.5, tailPh: ph + 0.8, arms: lerp(7 * Math.sin(ph + 1.3), -10, air), jaw: 3 + 3 * Math.sin(ph * 2), head: lerp(-1.8 * Math.cos(k + 0.3), -3, air),
      };
      const feet = (leg, H, g, i) => {
        const uu = u + (i ? 0.5 : 0), ul = uu - Math.floor(uu);
        let J;
        if (ul >= P.duty && P.fk) J = swingFK(leg, uu, H, P, g);
        else { const f = footAt(leg, uu, H, P, g); J = leg.fromToe(H, f.T, f.a, f.psi); }
        if (air <= 0) return J;
        // tucked jump pose: near foot forward and high, far foot trailing (blend in joint space)
        const a = leg.angles();
        const tk = i ? [100 * D2R, 95 * D2R, 20 * D2R, -30 * D2R] : [40 * D2R, 100 * D2R, -10 * D2R, -25 * D2R];
        return leg.fk(H, lerp(a[0], tk[0], air), lerp(a[1], tk[1], air), lerp(a[2], tk[2], air), lerp(a[3], tk[3], air));
      };
      return [body, feet];
    },
    /** standing still, weight on both feet */
    stand(t, P) {
      P = P || WALK;
      const bs = P.bob || 1;
      const body = { bob: -0.6 * bs * Math.sin(t * 2.1), pitch: 0, tail: 4, tailPh: t * 2.4, head: 0, breath: 0.018 * (0.5 - 0.5 * Math.cos(t * 2.6)) };
      const feet = (leg, H, g, i) => leg.fromToe(H, [H[0] + (i ? 30 : -6) * bs, g], leg.toe0, (i ? 2 : 10) * D2R);
      return [body, feet];
    },
  };
})();

/** creature presets with jointed legs */
GL.makeCreature = (name, o) => {
  if (name === 'baby') {
    return GL.creature({ body: 'baby_body', leg: 'baby_leg', rig: GL.RIGS.babyBody(), legs: MAN.legs.baby, sharp: 5, anchor: 22, minExt: 0.5,
      far: { dx: 7, dy: -3, dg: -3, tint: [0.14, 0.1, 0.06, 0.38] } }, Object.assign({ ax: 192, ay: 201 }, o));
  }
  if (name === 'runner') {
    return GL.creature({ body: 'runner_body', leg: 'runner_leg', rig: GL.RIGS.runnerBody(), legs: MAN.legs.runner, sharp: 5, anchor: 52, minExt: 0.64, step: 4,
      far: { dx: 14, dy: -6, dg: -5, tint: [0.12, 0.09, 0.06, 0.42] } }, Object.assign({ ax: 401, ay: 351 }, o));
  }
  throw new Error('no creature ' + name);
};
