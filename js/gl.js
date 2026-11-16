'use strict';
/* ==================================================================== WebGL: skinned grid meshes for living creatures */
const DEG = Math.PI / 180;
const GL = window.GL = { ready: false, items: [], texCache: new Map(), dataCache: new Map() };

const VS = `
attribute vec2 aPos; attribute vec2 aUV;
uniform mat3 uM; uniform vec2 uTS;
varying vec2 vUV; varying vec2 vL;
void main(){
  vec3 p = uM * vec3(aPos, 1.0);
  gl_Position = vec4(p.x / 640.0 - 1.0, 1.0 - p.y / 360.0, 0.0, 1.0);
  vUV = aUV / uTS; vL = aUV;
}`;
const FS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uTex; uniform float uA; uniform vec4 uTint; uniform float uBright;
uniform vec4 uEye; uniform float uBlink; uniform vec3 uLid;
varying vec2 vUV; varying vec2 vL;
void main(){
  vec4 c = texture2D(uTex, vUV);
  if (uBlink > 0.0) {
    vec2 d = (vL - uEye.xy) / uEye.zw;
    float lid = 1.0 - smoothstep(0.7, 1.15, length(d));
    c.rgb = mix(c.rgb, uLid * c.a, lid * uBlink);
  }
  c.rgb = mix(c.rgb, uTint.rgb * c.a, uTint.a);
  c.rgb += uBright * c.a;
  gl_FragColor = c * uA;
}`;

GL.init = () => {
  const cv = GL.canvas = document.createElement('canvas');
  cv.className = 'glc';
  const opt = { alpha: true, premultipliedAlpha: true, antialias: true };
  let gl = null;
  try { gl = cv.getContext('webgl2', opt); } catch (e) { gl = null; }
  GL.v2 = !!gl;
  if (!gl) { try { gl = cv.getContext('webgl', opt) || cv.getContext('experimental-webgl', opt); } catch (e) { gl = null; } }
  if (!gl) { console.warn('WebGL unavailable'); return; }
  GL.gl = gl;
  const sh = (type, src) => {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const p = gl.createProgram();
  gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  GL.prog = p;
  const L = GL.loc = {};
  for (const a of ['aPos', 'aUV']) L[a] = gl.getAttribLocation(p, a);
  for (const u of ['uM', 'uTS', 'uTex', 'uA', 'uTint', 'uBright', 'uEye', 'uBlink', 'uLid']) L[u] = gl.getUniformLocation(p, u);
  if (!GL.v2) gl.getExtension('OES_element_index_uint');
  cv.addEventListener('webglcontextlost', (e) => { e.preventDefault(); GL.ready = false; });
  GL.ready = true;
};

GL.resize = () => {
  if (!GL.gl) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  let bw = Math.round(1280 * G.sbg * G.k * dpr), bh = Math.round(720 * G.sbg * G.k * dpr);
  if (bw > 2560) { bh = Math.round((bh * 2560) / bw); bw = 2560; }
  GL.canvas.width = Math.max(2, bw); GL.canvas.height = Math.max(2, bh);
  GL.bw = GL.canvas.width; GL.bh = GL.canvas.height;
};

GL.tex = (key) => {
  let t = GL.texCache.get(key);
  if (t) return t;
  const gl = GL.gl, img = G.pic(key);
  t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  if (GL.v2) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); }
  else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  t.w = img.naturalWidth || img.width; t.h = img.naturalHeight || img.height;
  GL.texCache.set(key, t);
  G.picCache.delete(key);   // the cut-out copy of an atlas piece is on the GPU now
  return t;
};

/** RGBA pixels of an image (cached) */
GL.pixels = (key) => {
  let d = GL.dataCache.get(key);
  if (d) return d;
  const img = G.pic(key), c = document.createElement('canvas');
  c.width = img.naturalWidth || img.width; c.height = img.naturalHeight || img.height;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0);
  d = { w: c.width, h: c.height, data: x.getImageData(0, 0, c.width, c.height).data };
  GL.dataCache.set(key, d);
  return d;
};

/* ---------------- geometry helpers */
function inPoly(pts, x, y) {
  let ins = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ins = !ins;
  }
  return ins;
}
function polyDist(pts, x, y) {
  let d = 1e9;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0], yi = pts[i][1], dx = pts[j][0] - xi, dy = pts[j][1] - yi;
    const t = G.clamp(((x - xi) * dx + (y - yi) * dy) / (dx * dx + dy * dy || 1), 0, 1);
    d = Math.min(d, Math.hypot(xi + t * dx - x, yi + t * dy - y));
  }
  return d;
}
/** soft polygon weight: 0.5 on the border, feathered by f px */
function polyW(pts, f) {
  return (x, y) => { const d = polyDist(pts, x, y); return G.smooth(-f, f, inPoly(pts, x, y) ? d : -d); };
}

const _M = new Float32Array(9);
function placeMat(o) {
  const s = o.s || 1, r = o.rot || 0, c = Math.cos(r), sn = Math.sin(r);
  const sx = s * (o.flip ? -1 : 1) * (o.sxk === undefined ? 1 : o.sxk), sy = s * (o.sy || 1);
  const a11 = c * sx, a12 = -sn * sy, a21 = sn * sx, a22 = c * sy, ax = o.ax || 0, ay = o.ay || 0;
  _M[0] = a11; _M[1] = a21; _M[2] = 0; _M[3] = a12; _M[4] = a22; _M[5] = 0;
  _M[6] = o.x - (a11 * ax + a12 * ay); _M[7] = o.y - (a21 * ax + a22 * ay); _M[8] = 1;
  return _M;
}

/* ---------------- skinned mesh */
class Mesh {
  constructor(key, rig) {
    rig = rig || {};
    this.key = key; this.rig = rig;
    const tex = (this.tex = GL.tex(key)), w = (this.w = tex.w), h = (this.h = tex.h);
    const step = rig.step || Math.max(w, h);
    const lines = (len, ax) => {
      const s = new Set([0, len]);
      for (let v = step; v < len; v += step) s.add(Math.round(v));
      for (const r of rig.refine || []) {
        const a = ax ? r[2] : r[0], b = ax ? r[3] : r[1];
        for (let v = a; v <= b; v += r[4]) if (v > 0 && v < len) s.add(Math.round(v));
      }
      return [...s].sort((p, q) => p - q);
    };
    const xs = lines(w, 0), ys = lines(h, 1), nx = xs.length, ny = ys.length, n = nx * ny;
    this.n = n;
    this.rest = new Float32Array(n * 2);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const v = (j * nx + i) * 2; this.rest[v] = xs[i]; this.rest[v + 1] = ys[j]; }
    // a reshaping of the rest picture (baby proportions): bones then move the reshaped points
    this.base = this.rest;
    if (rig.pre) {
      this.base = new Float32Array(n * 2);
      for (let v = 0; v < n; v++) { const q = rig.pre(this.rest[v * 2], this.rest[v * 2 + 1]); this.base[v * 2] = q[0]; this.base[v * 2 + 1] = q[1]; }
    }
    this.pos = new Float32Array(this.base);
    // skip fully transparent cells
    let occ = null;
    if (step < Math.max(w, h)) {
      const px = GL.pixels(key);
      occ = new Uint8Array((nx - 1) * (ny - 1));
      for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
        const x0 = Math.max(0, xs[i] - 2), x1 = Math.min(px.w - 1, xs[i + 1] + 2), y0 = Math.max(0, ys[j] - 2), y1 = Math.min(px.h - 1, ys[j + 1] + 2);
        let any = 0;
        for (let y = y0; y <= y1 && !any; y += 2) for (let x = x0; x <= x1; x += 2) if (px.data[(y * px.w + x) * 4 + 3] > 3) { any = 1; break; }
        occ[j * (nx - 1) + i] = any;
      }
    }
    const layerOf = rig.layer || (() => 1);
    const cells = [];
    for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
      if (occ && !occ[j * (nx - 1) + i]) continue;
      const a = j * nx + i;
      cells.push([layerOf((xs[i] + xs[i + 1]) / 2, (ys[j] + ys[j + 1]) / 2), a, a + 1, a + nx, a + nx + 1]);
    }
    cells.sort((p, q) => p[0] - q[0]);
    const big = n > 65535, idx = big ? new Uint32Array(cells.length * 6) : new Uint16Array(cells.length * 6);
    let k = 0;
    for (const c of cells) { idx[k++] = c[1]; idx[k++] = c[2]; idx[k++] = c[3]; idx[k++] = c[2]; idx[k++] = c[4]; idx[k++] = c[3]; }
    this.count = idx.length;
    this.bones = (rig.bones || []).map((b) => {
      const W = new Float32Array(n), U = b.u ? new Float32Array(n) : null;
      for (let v = 0; v < n; v++) { const x = this.rest[v * 2], y = this.rest[v * 2 + 1]; W[v] = b.w(x, y); if (U) U[v] = b.u(x, y); }
      return Object.assign({}, b, { W, U }, rig.pre ? { c: rig.pre(b.c[0], b.c[1]) } : null);
    });
    if (rig.eye) this.lid = this.lidColor(rig.eye);
    const gl = GL.gl;
    this.pb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.pb); gl.bufferData(gl.ARRAY_BUFFER, this.pos, gl.DYNAMIC_DRAW);
    this.ub = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.ub); gl.bufferData(gl.ARRAY_BUFFER, this.rest, gl.STATIC_DRAW);
    this.ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    this.itype = big ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
    this.dirty = false;
  }
  lidColor(eye) {
    const px = GL.pixels(this.key); let r = 0, g = 0, b = 0, c = 0;
    for (let a = 0; a < 6.28; a += 0.2) for (const rr of [1.5, 1.9]) {
      const x = Math.round(eye[0] + Math.cos(a) * eye[2] * rr), y = Math.round(eye[1] + Math.sin(a) * eye[3] * rr);
      if (x < 0 || y < 0 || x >= px.w || y >= px.h) continue;
      const i = (y * px.w + x) * 4; if (px.data[i + 3] < 200) continue;
      r += px.data[i]; g += px.data[i + 1]; b += px.data[i + 2]; c++;
    }
    return c ? [(r / c / 255) * 0.9, (g / c / 255) * 0.9, (b / c / 255) * 0.9] : [0.4, 0.33, 0.25];
  }
  _apply(x, y, pose, wOf) {
    for (let bi = 0; bi < this.bones.length; bi++) {
      const b = this.bones[bi], w = wOf(b, bi);
      if (!w) continue;
      if (b.type === 'breath') {
        const a = pose[b.name] || 0; if (!a) continue;
        const q = a * w; y = b.c[1] + (y - b.c[1]) * (1 + q); x = b.c[0] + (x - b.c[0]) * (1 + 0.25 * q);
      } else {
        let th;
        if (b.type === 'wave') { const amp = pose[b.name] || 0; if (!amp) continue; th = amp * DEG * w * Math.sin((pose[b.name + 'Ph'] || 0) - (b.k || 2) * wOf(b, bi, true)); }
        else { const a = pose[b.name] || 0; if (!a) continue; th = a * DEG * w; }
        const c = Math.cos(th), s = Math.sin(th), dx = x - b.c[0], dy = y - b.c[1];
        x = b.c[0] + c * dx - s * dy; y = b.c[1] + s * dx + c * dy;
      }
    }
    return [x, y];
  }
  deform(pose) {
    const R = this.base, P = this.pos, B = this.bones, nb = B.length;
    const amt = new Float32Array(nb), phs = new Float32Array(nb), typ = new Uint8Array(nb);
    for (let i = 0; i < nb; i++) {
      const b = B[i], a = pose[b.name] || 0;
      typ[i] = b.type === 'breath' ? 0 : b.type === 'wave' ? 1 : 2;
      amt[i] = typ[i] === 0 ? a : a * DEG; phs[i] = pose[b.name + 'Ph'] || 0;
    }
    // optional whole-body motion: pitch about pose.pivot, then vertical bob
    const post = !!pose.pivot && (pose.bob || pose.pitch);
    const pc = Math.cos((pose.pitch || 0) * DEG), ps = Math.sin((pose.pitch || 0) * DEG), bob = pose.bob || 0;
    const pvx = pose.pivot ? pose.pivot[0] : 0, pvy = pose.pivot ? pose.pivot[1] : 0;
    for (let v = 0; v < this.n; v++) {
      let x = R[v * 2], y = R[v * 2 + 1];
      for (let i = 0; i < nb; i++) {
        const a = amt[i]; if (!a) continue;
        const b = B[i], w = b.W[v]; if (!w) continue;
        if (typ[i] === 0) { const q = a * w; y = b.c[1] + (y - b.c[1]) * (1 + q); x = b.c[0] + (x - b.c[0]) * (1 + 0.25 * q); continue; }
        const th = typ[i] === 1 ? a * w * Math.sin(phs[i] - (b.k || 2) * b.U[v]) : a * w;
        const c = Math.cos(th), s = Math.sin(th), dx = x - b.c[0], dy = y - b.c[1];
        x = b.c[0] + c * dx - s * dy; y = b.c[1] + s * dx + c * dy;
      }
      if (post) { const dx = x - pvx, dy = y - pvy; x = pvx + pc * dx - ps * dy; y = pvy + ps * dx + pc * dy + bob; }
      P[v * 2] = x; P[v * 2 + 1] = y;
    }
    this.dirty = true;
  }
  point(x, y, pose) {
    const wOf = (b, bi, u) => (u ? b.u(x, y) : b.w(x, y));
    const q = this.rig.pre ? this.rig.pre(x, y) : [x, y];
    return this._apply(q[0], q[1], pose, wOf);
  }
  draw(o) {
    const gl = GL.gl, L = GL.loc;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.pb);
    if (this.dirty) { gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.pos); this.dirty = false; }
    gl.enableVertexAttribArray(L.aPos); gl.vertexAttribPointer(L.aPos, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.ub);
    gl.enableVertexAttribArray(L.aUV); gl.vertexAttribPointer(L.aUV, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ib);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.tex); gl.uniform1i(L.uTex, 0);
    gl.uniformMatrix3fv(L.uM, false, placeMat(o));
    gl.uniform2f(L.uTS, this.w, this.h);
    gl.uniform1f(L.uA, o.alpha === undefined ? 1 : o.alpha);
    const t = o.tint || [0, 0, 0, 0];
    gl.uniform4f(L.uTint, t[0], t[1], t[2], t[3]);
    gl.uniform1f(L.uBright, o.bright || 0);
    const eye = this.rig.eye;
    if (eye && o.blink > 0) {
      gl.uniform1f(L.uBlink, o.blink); gl.uniform4f(L.uEye, eye[0], eye[1], eye[2], eye[3]);
      gl.uniform3f(L.uLid, this.lid[0], this.lid[1], this.lid[2]);
    } else gl.uniform1f(L.uBlink, 0);
    gl.drawElements(gl.TRIANGLES, this.count, this.itype, 0);
  }
  dispose() {
    const gl = GL.gl; if (!gl) return;
    gl.deleteBuffer(this.pb); gl.deleteBuffer(this.ub); gl.deleteBuffer(this.ib);
  }
}
GL.Mesh = Mesh;
GL._place = placeMat;

/** a placed sprite: mesh + transform + look */
GL.sprite = (key, rig, o) => {
  const it = Object.assign({ x: 0, y: 0, s: 1, rot: 0, ax: 0, ay: 0, flip: false, alpha: 1, z: 0, visible: true, blink: 0, bright: 0, tint: null }, o || {});
  it.mesh = new Mesh(key, rig);
  it.draw = () => it.mesh.draw(it);
  it.toDesign = (lx, ly) => {
    const m = placeMat(it); return [m[0] * lx + m[3] * ly + m[6], m[1] * lx + m[4] * ly + m[7]];
  };
  /** design position of a rest point after deformation */
  it.track = (lx, ly, pose) => { const p = pose ? it.mesh.point(lx, ly, pose) : [lx, ly]; return it.toDesign(p[0], p[1]); };
  GL.items.push(it);
  return it;
};
GL.remove = (it) => { const i = GL.items.indexOf(it); if (i >= 0) GL.items.splice(i, 1); if (it.mesh) it.mesh.dispose(); };
GL.clear = () => { for (const it of GL.items) if (it.mesh) it.mesh.dispose(); GL.items.length = 0; };
/** attach the shared GL canvas into the current scene */
GL.attach = (parent) => { (parent || G.scene$).appendChild(GL.canvas); };

GL.render = () => {
  if (!GL.ready) return;
  const gl = GL.gl;
  if (!GL.items.length) { if (GL._dirty) { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); GL._dirty = false; } return; }
  GL._dirty = true;
  gl.viewport(0, 0, GL.bw, GL.bh);
  gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.useProgram(GL.prog);
  const list = GL.items.slice().sort((a, b) => a.z - b.z);
  for (const it of list) if (it.visible && it.alpha > 0.001) it.draw();
};

/* ==================================================================== rigs (sprite-local coordinates) */
function _conv(key) {
  const o = MAN[key];
  const P = (x, y) => [x - o.ox, y - o.oy];
  const L = (pts) => pts.map((p) => P(p[0], p[1]));
  return { P, L, o };
}
const RIGS = {
  hero() {
    const JAW = [[1278, 70], [1340, 82], [1400, 94], [1499, 100], [1499, 150], [1300, 150], [1238, 112]];
    return {
      step: 14, refine: [[1228, 1499, 40, 165, 5]], eye: [1346.7, 33.3, 7.5, 6.9],
      bones: [
        { name: 'breath', type: 'breath', c: [990, 95], w: (x, y) => Math.exp(-(((x - 990) / 190) ** 2) - (((y - 195) / 95) ** 2)) * G.clamp((300 - y) / 60, 0, 1) },
        { name: 'tail', type: 'wave', c: [720, 182], k: 2,
          w: (x, y) => Math.pow(G.clamp((720 - x) / 710, 0, 1), 1.3) * G.clamp((300 - y) / 70, 0, 1), u: (x) => G.clamp((720 - x) / 710, 0, 1) },
        { name: 'jaw', type: 'rot', c: [1290, 68], w: polyW(JAW, 4) },
        { name: 'head', type: 'rot', c: [1110, 190], w: (x, y) => G.smooth(1090, 1235, x) * G.clamp((255 - y) / 45, 0, 1) },
      ],
    };
  },
  runner() {
    const { P, L } = _conv('runner');
    const front = L([[470, 430], [530, 418], [560, 470], [575, 520], [680, 535], [688, 595], [540, 595], [515, 540], [490, 480], [462, 450]]);
    const back = L([[448, 418], [442, 447], [380, 457], [300, 472], [252, 522], [238, 592], [160, 592], [172, 500], [238, 455], [330, 425], [400, 407]]);
    const arms = L([[588, 368], [642, 362], [702, 420], [708, 474], [640, 476], [600, 422]]);
    const jaw = L([[718, 300], [760, 306], [814, 322], [824, 348], [792, 354], [740, 334], [712, 312]]);
    const tx = P(440, 0)[0], ty = P(0, 410)[1], hx0 = P(660, 0)[0], hx1 = P(735, 0)[0], hy = P(0, 380)[1];
    return {
      step: 12, refine: [[P(700, 0)[0], P(830, 0)[0], P(0, 280)[1], P(0, 360)[1], 5]], eye: [...P(753, 253), 7, 6.5],
      layer: (x, y) => (inPoly(back, x, y) ? 0 : inPoly(front, x, y) ? 2 : 1),
      bones: [
        { name: 'tail', type: 'wave', c: P(440, 330), k: 2.2, w: (x, y) => Math.pow(G.clamp((tx - x) / 425, 0, 1), 1.2) * G.clamp((ty - y) / 30, 0, 1), u: (x) => G.clamp((tx - x) / 425, 0, 1) },
        { name: 'legB', type: 'rot', c: P(432, 414), w: polyW(back, 10) },
        { name: 'legF', type: 'rot', c: P(496, 420), w: polyW(front, 10) },
        { name: 'arms', type: 'rot', c: P(600, 372), w: polyW(arms, 8) },
        { name: 'jaw', type: 'rot', c: P(722, 296), w: polyW(jaw, 4) },
        { name: 'head', type: 'rot', c: P(650, 310), w: (x, y) => G.smooth(hx0, hx1, x) * G.clamp((hy - y) / 40, 0, 1) },
      ],
    };
  },
  babyBody() {
    const { P } = _conv('baby');
    const tx = P(185, 0)[0], ty = P(0, 402)[1], h0 = P(262, 0)[0], h1 = P(292, 0)[0], hy = P(0, 392)[1], bx = P(225, 0)[0], by = P(0, 380)[1];
    return {
      step: 6, eye: [...P(318, 331), 7.5, 7],
      bones: [
        { name: 'breath', type: 'breath', c: P(225, 360), w: (x, y) => Math.exp(-(((x - bx) / 45) ** 2) - (((y - by) / 22) ** 2)) },
        { name: 'tail', type: 'wave', c: P(185, 380), k: 2, w: (x, y) => Math.pow(G.clamp((tx - x) / 170, 0, 1), 1.2) * G.clamp((ty - y) / 14 + 0.6, 0, 1), u: (x) => G.clamp((tx - x) / 170, 0, 1) },
        { name: 'head', type: 'rot', c: P(268, 372), w: (x, y) => G.smooth(h0, h1, x) * G.clamp((hy - y) / 22, 0, 1) },
      ],
    };
  },
  runnerBody() {
    const { P, L } = _conv('runner');
    const arms = L([[588, 368], [642, 362], [702, 420], [708, 474], [640, 476], [600, 422]]);
    const jaw = L([[718, 300], [760, 306], [814, 322], [824, 348], [792, 354], [740, 334], [712, 312]]);
    const tx = P(440, 0)[0], ty = P(0, 410)[1], hx0 = P(660, 0)[0], hx1 = P(735, 0)[0], hy = P(0, 380)[1];
    return {
      step: 12, refine: [[P(700, 0)[0], P(830, 0)[0], P(0, 280)[1], P(0, 360)[1], 5]], eye: [...P(753, 253), 7, 6.5],
      bones: [
        { name: 'tail', type: 'wave', c: P(440, 330), k: 2.2, w: (x, y) => Math.pow(G.clamp((tx - x) / 425, 0, 1), 1.2) * G.clamp((ty - y) / 30 + 0.5, 0, 1), u: (x) => G.clamp((tx - x) / 425, 0, 1) },
        { name: 'arms', type: 'rot', c: P(600, 372), w: polyW(arms, 8) },
        { name: 'jaw', type: 'rot', c: P(722, 296), w: polyW(jaw, 4) },
        { name: 'head', type: 'rot', c: P(650, 310), w: (x, y) => G.smooth(hx0, hx1, x) * G.clamp((hy - y) / 40, 0, 1) },
      ],
    };
  },
  baby() {
    const { P, L } = _conv('baby');
    const back = L([[205, 415], [198, 440], [185, 460], [172, 490], [174, 522], [116, 522], [126, 490], [150, 455], [170, 425], [186, 410]]);
    const front = L([[206, 412], [224, 418], [224, 450], [234, 480], [282, 498], [282, 524], [212, 524], [203, 470], [199, 440]]);
    const tx = P(185, 0)[0], ty = P(0, 402)[1], h0 = P(262, 0)[0], h1 = P(292, 0)[0], hy = P(0, 392)[1];
    return {
      step: 7, eye: [...P(318, 331), 7.5, 7],
      layer: (x, y) => (inPoly(back, x, y) ? 0 : inPoly(front, x, y) ? 2 : 1),
      bones: [
        { name: 'tail', type: 'wave', c: P(185, 380), k: 2, w: (x, y) => Math.pow(G.clamp((tx - x) / 170, 0, 1), 1.2) * G.clamp((ty - y) / 14, 0, 1), u: (x) => G.clamp((tx - x) / 170, 0, 1) },
        { name: 'legB', type: 'rot', c: P(198, 414), w: polyW(back, 6) },
        { name: 'legF', type: 'rot', c: P(210, 414), w: polyW(front, 6) },
        { name: 'head', type: 'rot', c: P(268, 372), w: (x, y) => G.smooth(h0, h1, x) * G.clamp((hy - y) / 22, 0, 1) },
      ],
    };
  },
  babyCrouch() {
    const { P } = _conv('babyCrouch');
    const bx = P(520, 0)[0], by = P(0, 445)[1], tx = P(450, 0)[0], h0 = P(595, 0)[0], h1 = P(625, 0)[0];
    return {
      step: 8, eye: [...P(655, 400), 7, 6.5],
      bones: [
        { name: 'breath', type: 'breath', c: P(520, 425), w: (x, y) => Math.exp(-(((x - bx) / 95) ** 2) - (((y - by) / 32) ** 2)) },
        { name: 'tail', type: 'wave', c: P(450, 455), k: 2, w: (x) => Math.pow(G.clamp((tx - x) / 136, 0, 1), 1.2), u: (x) => G.clamp((tx - x) / 136, 0, 1) },
        { name: 'head', type: 'rot', c: P(600, 440), w: (x) => G.smooth(h0, h1, x) },
      ],
    };
  },
  prey() {
    const { P, L } = _conv('prey');
    const A = L([[905, 480], [940, 492], [920, 515], [880, 535], [862, 560], [864, 590], [822, 590], [832, 550], [850, 525], [880, 495]]);
    const B = L([[945, 488], [985, 492], [986, 530], [991, 555], [1010, 570], [1010, 590], [948, 590], [954, 550], [947, 520]]);
    const C = L([[1050, 468], [1086, 470], [1081, 500], [1061, 530], [1059, 560], [1064, 590], [1020, 590], [1029, 550], [1039, 520], [1045, 495]]);
    const D = L([[1090, 480], [1121, 478], [1126, 500], [1141, 520], [1151, 535], [1186, 545], [1188, 582], [1138, 582], [1131, 550], [1111, 530], [1094, 505]]);
    const tx = P(860, 0)[0], ty = P(0, 520)[1], h0 = P(1120, 0)[0], h1 = P(1150, 0)[0], hy = P(0, 470)[1];
    return {
      step: 9, eye: [...P(1178, 406), 6.5, 6],
      layer: (x, y) => (inPoly(A, x, y) || inPoly(C, x, y) ? 0 : inPoly(B, x, y) || inPoly(D, x, y) ? 2 : 1),
      bones: [
        { name: 'tail', type: 'wave', c: P(860, 470), k: 2, w: (x, y) => Math.pow(G.clamp((tx - x) / 135, 0, 1), 1.1) * G.clamp((ty - y) / 25, 0, 1), u: (x) => G.clamp((tx - x) / 135, 0, 1) },
        { name: 'legA', type: 'rot', c: P(915, 488), w: polyW(A, 6) },
        { name: 'legB', type: 'rot', c: P(965, 490), w: polyW(B, 6) },
        { name: 'legC', type: 'rot', c: P(1065, 475), w: polyW(C, 6) },
        { name: 'legD', type: 'rot', c: P(1105, 485), w: polyW(D, 6) },
        { name: 'head', type: 'rot', c: P(1120, 450), w: (x, y) => G.smooth(h0, h1, x) * G.clamp((hy - y) / 20, 0, 1) },
      ],
    };
  },
};
GL.RIGS = RIGS;

/* ==================================================================== poses */
const Pose = (window.Pose = {
  /** museum idle with scheduled actions [{type,t0,dur,k}] */
  hero(t, acts, blinks) {
    const p = { head: 0, jaw: 0, tail: 0, tailPh: 0, breath: 0, blink: 0 };
    p.breath = 0.022 * (0.5 - 0.5 * Math.cos((2 * Math.PI * t) / 3.2));
    const idle = 1.4 * Math.sin((2 * Math.PI * t) / 4.2);
    let amp = idle, ph = (2 * Math.PI * t) / 4.2;
    for (const a of acts || []) {
      const s = (t - a.t0) / a.dur;
      if (s < 0 || s > 1) continue;
      const k = a.k || 1;
      if (a.type === 'roar') {
        p.head += -8.5 * k * G.bump(s) + 2.2 * k * Math.sin(2 * Math.PI * 2 * s) * Math.sin(Math.PI * s);
        p.jaw += 7.0 * k * G.bump((s - 0.22) / 0.5);
        amp = idle * (1 - Math.sin(Math.PI * s)) + 7.0 * k * Math.sin(Math.PI * s); ph = 2 * Math.PI * 1.6 * s;
      } else if (a.type === 'flick') {
        amp = idle * (1 - Math.sin(Math.PI * s)) + 8.0 * Math.sin(Math.PI * s); ph = 2 * Math.PI * 1.4 * s;
      } else if (a.type === 'look') {
        p.head += 5.5 * G.bump(s) * (a.dir || 1);
        p.jaw += 2 * G.bump((s - 0.3) / 0.4);
      } else if (a.type === 'step') {
        p.breath += 0.03 * G.bump(s);
        amp = idle * (1 - Math.sin(Math.PI * s)) + 4 * Math.sin(Math.PI * s); ph = 2 * Math.PI * 2 * s;
      }
    }
    p.tail = amp; p.tailPh = ph;
    for (const b of blinks || []) { const d = t - b; if (d >= 0 && d <= 0.22) p.blink = Math.max(p.blink, Math.sin((Math.PI * d) / 0.22)); }
    return p;
  },
  run(ph, air) {
    const s = Math.sin(ph);
    if (air) return { legF: -26, legB: 22, arms: -10, tail: 5, tailPh: ph * 0.6, jaw: 2, head: -3 };
    return { legF: 28 * s - 6, legB: -28 * s + 8, arms: 9 * Math.sin(ph + 1.3), tail: 3.5, tailPh: ph, jaw: 3 + 3 * Math.sin(ph * 2), head: 2.2 * Math.sin(ph * 2 + 0.6) };
  },
  walk(ph) {
    const s = Math.sin(ph);
    return { legF: 20 * s - 3, legB: -20 * s + 3, tail: 5, tailPh: ph, head: 3 * Math.sin(ph * 2 + 0.5) };
  },
  trot(ph, air) {
    const s = Math.sin(ph);
    if (air) return { legA: 14, legB: -10, legC: 12, legD: -16, tail: 6, tailPh: ph, head: -3 };
    return { legA: -16 * s, legD: 14 * s, legB: 14 * s, legC: -14 * s, tail: 5, tailPh: ph * 0.5, head: 2.5 * Math.sin(ph * 2) };
  },
});
