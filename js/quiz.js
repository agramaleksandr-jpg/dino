'use strict';
/* ==================================================================== quiz: a question about the animals, four pictures to choose from.
   The narrator reads the question and repeats it every 15 seconds until it is answered. Questions come only from what
   the game tells about the animals (js/quizdata.js) and only about the animals already standing in the museum. */
const Quiz = {
  N: 10,          // questions in a round
  REPEAT: 15,     // seconds before the question is read again
  PERS: ['trias', 'jura'],
  /** test menu «Викторина: все»: every animal takes part, opened or not */
  all: () => !!(G.state.settings && G.state.settings.quizAll),
  /** the animals that can be asked about: the ones standing in the museum */
  pool: () => Quiz.PERS.filter((per) => window.QUIZ && QUIZ[per]).flatMap((per) => G.inPeriod(per)).filter((id) => Quiz.all() || G.spState(id).assembled),
  /** the questions of all periods together */
  bank() {
    const B = { q: [], fly: [], glide: [], air: [], sea: [], water: [], plants: [], meat: [], where: {}, len: {} };
    for (const per of Quiz.PERS) {
      const b = window.QUIZ && QUIZ[per];
      if (!b) continue;
      for (const k of ['q', 'fly', 'glide', 'air', 'sea', 'water', 'plants', 'meat']) B[k] = B[k].concat(b[k] || []);
      Object.assign(B.where, b.where); Object.assign(B.len, b.len);
    }
    return B;
  },
  /** every question these animals allow: {kind, q, a, wrong[], f?, pic?} */
  items() {
    const B = Quiz.bank(), pool = Quiz.pool(), P = new Set(pool), out = [];
    const add = (o) => { o.wrong = o.wrong.filter((id) => P.has(id) && id !== o.a); if (P.has(o.a) && o.wrong.length >= 3) out.push(o); };
    const not = (...sets) => pool.filter((id) => !sets.some((s) => s.includes(id)));
    for (const q of B.q) add({ kind: 'fact', q: q.q, a: q.a, f: q.f, wrong: pool.filter((id) => !(q.also || []).includes(id)) });
    for (const a of B.fly) add({ kind: 'fly', q: 'Кто из них умел летать?', a, wrong: not(B.fly, B.glide, B.air) });
    for (const a of B.glide) add({ kind: 'glide', q: 'Кто из них не махал крыльями, а планировал с дерева на дерево?', a, wrong: not(B.fly, B.glide, B.air) });
    for (const a of B.sea) add({ kind: 'sea', q: 'Кто из них жил в море?', a, wrong: not(B.sea, B.water) });
    for (const a of B.plants) add({ kind: 'plants', q: 'Кто из них ел растения?', a, wrong: B.meat.slice() });
    for (const a of B.meat) add({ kind: 'meat', q: 'Кто из них был хищником?', a, wrong: B.plants.slice() });
    for (const [a, c] of Object.entries(B.where)) add({ kind: 'where', q: `Кого из них нашли в ${c}?`, a, wrong: Object.keys(B.where).filter((id) => B.where[id] !== c) });
    // pictures instead of words: a shadow, a skeleton
    for (const a of pool) add({ kind: 'shadow', pic: 'shadow', q: 'Чья это тень?', a, wrong: pool.slice() });
    for (const a of pool) if (MAN.sk && MAN.sk[a]) add({ kind: 'skel', pic: 'skel', q: 'Чей это скелет?', a, wrong: pool.slice() });
    return out;
  },
  /** «who was the longest / the smallest»: four animals whose lengths differ clearly */
  sizeItem(small) {
    const L = Quiz.bank().len, P = new Set(Quiz.pool());
    const ids = Object.keys(L).filter((id) => P.has(id));
    for (let k = 0; k < 40; k++) {
      const four = G.shuffle(ids.slice()).slice(0, 4);
      if (four.length < 4) return null;
      four.sort((x, y) => L[x] - L[y]);
      if (small ? L[four[0]] * 1.4 <= L[four[1]] : L[four[3]] >= L[four[2]] * 1.4) {
        const a = small ? four[0] : four[3];
        return { kind: small ? 'small' : 'long', q: small ? 'Кто из них самый маленький?' : 'Кто из них самый длинный?', a, opts: G.shuffle(four.slice()) };
      }
    }
    return null;
  },
  /** a round: facts about single animals, a couple of general questions, a size, a shadow and a skeleton.
      With many animals no animal is the answer twice; with a few opened ones it may come back in another kind of question. */
  round() {
    const pool = Quiz.pool(), items = G.shuffle(Quiz.items()), out = [], used = {}, kinds = {}, seen = new Set();
    const cap = pool.length >= 10 ? 1 : pool.length >= 5 ? 2 : 3;
    const take = (it, kindMax) => {
      if (!it || out.length >= Quiz.N || (used[it.a] || 0) >= cap || seen.has(it.kind + ':' + it.a) || (kinds[it.kind] || 0) >= kindMax) return;
      out.push(it); used[it.a] = (used[it.a] || 0) + 1; kinds[it.kind] = (kinds[it.kind] || 0) + 1; seen.add(it.kind + ':' + it.a);
    };
    const of = (...k) => items.filter((i) => k.includes(i.kind));
    for (const it of of('fact')) { if (out.length >= 5) break; take(it, 5); }
    for (const it of of('fly', 'glide', 'sea', 'plants', 'meat', 'where')) { if (out.length >= 7) break; take(it, 1); }
    take(Quiz.sizeItem(Math.random() < 0.5), 1);
    for (const it of of('shadow')) { if ((kinds.shadow || 0) >= 1) break; take(it, 1); }
    for (const it of of('skel')) { if ((kinds.skel || 0) >= 1) break; take(it, 1); }
    for (const it of of('fact')) take(it, 9);
    for (const it of of('shadow', 'skel')) take(it, 3);
    for (const it of of('fly', 'glide', 'sea', 'plants', 'meat', 'where')) take(it, 2);
    const r = G.shuffle(out);
    for (const it of r) if (!it.opts) it.opts = G.shuffle([it.a].concat(G.shuffle(it.wrong.slice()).slice(0, 3)));
    return r;
  },
};

Scenes.quiz = {
  enter(p) {
    p = p || {};
    const tok = G.token, from = p.from || 'title';
    const back = () => G.go(from === 'museum' ? 'museum' : 'title');
    const bgi = G.bgImg('bg_hall');
    bgi.style.filter = 'blur(6px) brightness(.38)'; bgi.style.transform = 'scale(1.06)';
    const hdr = UI.header('Викторина', 'Животные из твоего музея', back);
    const top = UI.topRight({ counter: ['star', '0'] });
    const R = Quiz.round();
    if (R.length < 4) {
      const need = 'Чтобы играть в викторину, собери в музее хотя бы четырёх животных.';
      G.h('div', 'plate abs', G.ui, { left: G.W / 2 - 360, top: G.H / 2 - 70, width: 720, height: 140, '--c': '12px' },
        `<div class="t-body" style="font-size:22px;text-align:center;padding:36px 30px">${need}</div>`);
      G.wait(0.5).then(() => { if (G.alive(tok)) AU.say(need); });
      return;
    }
    const S = (this.S = { i: -1, score: 0, tries: 0, answered: false, nextSay: 0, q: null, t: 0 });
    G.dbg = { S, R };
    // the question plate with the button that reads it again; a shadow or a skeleton is shown in it on the right
    const QW = Math.min(980, G.W - 80), PW = 340;
    const qp = G.h('div', 'plate abs', G.ui, { left: G.W / 2 - QW / 2, top: 104, width: QW, height: 104, '--c': '12px' });
    const sayB = G.h('button', 'pe', qp, { position: 'absolute', left: '18px', top: '26px', width: '52px', height: '52px', borderRadius: '50%', border: '0',
      background: 'linear-gradient(#FFD272,#E39A22)', color: '#2A1E05', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' });
    sayB.innerHTML = icon('sound', ' style="width:28px;height:28px"');
    const qText = G.h('div', 'abs', qp, { left: 88, right: 24, top: 0, height: 104, display: 'flex', alignItems: 'center', font: '500 27px/1.25 Rubik,sans-serif' });
    const pic = G.h('div', 'abs', qp, { right: 14, top: 12, width: PW, height: 148, borderRadius: '10px', overflow: 'hidden', display: 'none' });
    UI.tap(sayB, () => { if (S.q) { AU.say(S.q.q); S.nextSay = Quiz.REPEAT; } }, false);
    // four picture cards
    const gap = 22, cw = Math.min(330, (G.W - 64 - 3 * gap) / 4), ph0 = Math.round(cw * 0.66);
    const cx0 = G.W / 2 - (4 * cw + 3 * gap) / 2;
    let cy0 = 236, ph = ph0, ch = ph0 + 64;
    const cards = [0, 1, 2, 3].map((k) => {
      const el = G.h('div', 'plate abs pe', G.ui, { left: cx0 + k * (cw + gap), top: cy0, width: cw, height: ch, '--c': '12px', cursor: 'pointer', transition: 'opacity .3s, transform .2s' });
      const area = G.h('div', 'abs', el, { left: 10, top: 10, width: cw - 20, height: ph, borderRadius: '8px', overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 62%, rgba(255,238,205,.30), rgba(255,238,205,.06) 72%)' });
      const name = G.h('div', 'abs', el, { left: 6, right: 6, top: ph + 18, textAlign: 'center', font: '600 22px/1.1 Oswald,sans-serif', letterSpacing: '.02em' });
      const c = { el, area, name, id: null, off: false };
      UI.tap(el, () => answer(c), false);
      return c;
    });
    // what the narrator says after an answer, and the button to the next question
    // the words are on the left and the button on the right, so that one never covers the other
    const BW = 236, FH = 78;
    const fb = G.h('div', 'plate abs', G.ui, { left: G.W / 2 - QW / 2, top: cy0 + ch + 18, width: QW - BW - 16, height: FH, '--c': '10px', opacity: 0, transition: 'opacity .3s' });
    const fbText = G.h('div', 'abs', fb, { left: 22, right: 22, top: 0, height: FH, display: 'flex', alignItems: 'center', font: '400 21px/1.3 Rubik,sans-serif' });
    const tell = (t) => { fbText.textContent = t; fbText.style.fontSize = t.length > 150 ? '16px' : t.length > 105 ? '18px' : '21px'; fb.style.opacity = 1; };
    let next = null;
    const dims = (key) => { const a = G.ATLAS[key]; return a ? [a[3], a[4]] : MAN[key] ? [MAN[key].w, MAN[key].h] : [300, 150]; };
    const imgOf = (id) => DATA.species[id].img;
    const skKeys = (id) => Object.keys(MAN.sk[id].bones).map((b) => 'sk_' + id + '_' + b);
    /** a question with a picture takes a taller plate; the cards under it get lower */
    const place = (big) => {
      const QH = big ? 172 : 104;
      qp.style.height = QH + 'px'; qText.style.height = QH + 'px'; qText.style.right = (big ? PW + 34 : 24) + 'px'; sayB.style.top = QH / 2 - 26 + 'px';
      pic.style.display = big ? '' : 'none';
      // on a low screen the cards get lower, so that the words under them stay on the screen
      cy0 = 132 + QH; ph = Math.max(90, Math.min(big ? ph0 - 68 : ph0, G.H - cy0 - 64 - 18 - FH - 12)); ch = ph + 64;
      for (const c of cards) { c.el.style.top = cy0 + 'px'; c.el.style.height = ch + 'px'; c.area.style.height = ph + 'px'; c.name.style.top = ph + 18 + 'px'; }
      fb.style.top = cy0 + ch + 18 + 'px';
    };
    const drawPic = (q) => {
      pic.innerHTML = '';
      const W = PW - 24, H = 148 - 20;
      if (q.pic === 'shadow') {
        pic.style.background = 'radial-gradient(ellipse at 50% 60%, #F3E7CB, #D9C59B)';
        const key = imgOf(q.a), [w, h] = dims(key), k = Math.min(W / w, H / h);
        G.spr(key, pic, PW / 2 - (w * k) / 2, 74 - (h * k) / 2, w * k, h * k).style.filter = 'brightness(0) opacity(.82)';
      } else {
        pic.style.background = 'radial-gradient(ellipse at 50% 60%, rgba(20,16,12,.55), rgba(20,16,12,.85))';
        const sk = MAN.sk[q.a], k = Math.min(W / sk.w, H / sk.h), ox = PW / 2 - (sk.w * k) / 2, oy = 74 - (sk.h * k) / 2;
        for (const b of sk.order || Object.keys(sk.bones)) { const m = sk.bones[b]; if (m) G.spr('sk_' + q.a + '_' + b, pic, ox + m.x * k, oy + m.y * k, m.w * k, m.h * k); }
      }
    };
    const keysOf = (q) => q.opts.map(imgOf).concat(q.pic === 'skel' ? skKeys(q.a) : []);
    const show = async () => {
      S.i++;
      if (next) { next.remove(); next = null; }
      if (S.i >= R.length) { finish(); return; }
      const q = (S.q = R[S.i]);
      await G.load(keysOf(q)); if (!G.alive(tok)) return;
      hdr.setSub(`Вопрос ${S.i + 1} из ${R.length}`);
      qText.textContent = q.q;
      fb.style.opacity = 0;
      place(!!q.pic);
      if (q.pic) drawPic(q);
      q.opts.forEach((id, k) => {
        const c = cards[k], key = imgOf(id), [w, h] = dims(key), A = cw - 36, k2 = Math.min(A / w, (ph - 20) / h);
        c.id = id; c.off = false; c.area.innerHTML = '';
        G.spr(key, c.area, (cw - 20) / 2 - (w * k2) / 2, ph / 2 - (h * k2) / 2 + 6, w * k2, h * k2).style.filter = 'drop-shadow(0 6px 8px rgba(0,0,0,.45))';
        c.name.textContent = DATA.species[id].name;
        c.el.style.opacity = 1; c.el.style.transform = ''; c.el.style.removeProperty('--pst'); c.el.style.removeProperty('--bw'); c.el.classList.remove('shake');
      });
      S.answered = false; S.tries = 0;
      AU.say(q.q); S.nextSay = Quiz.REPEAT;
      // the pictures of the next question load while this one is played
      if (R[S.i + 1]) G.load(keysOf(R[S.i + 1]));
    };
    const answer = (c) => {
      if (S.answered || c.off || !S.q) return;
      AU.unlock();
      const sp = DATA.species[c.id], q = S.q;
      if (c.id === q.a) {
        S.answered = true;
        if (S.tries === 0) { S.score++; top.counter.set(String(S.score)); }
        c.el.style.setProperty('--pst', '#F2B640'); c.el.style.setProperty('--bw', '4px'); c.el.style.transform = 'scale(1.04)';
        for (const o of cards) if (o !== c) o.el.style.opacity = 0.45;
        AU.play('found');
        const f = q.f || `${sp.hero.size}.`;
        tell(`Правильно! Это ${sp.name.toLowerCase()}. ${f}`);
        AU.say(`Правильно! Это ${sp.name.toLowerCase()}. ${f}`);
        const last = S.i >= R.length - 1;
        next = UI.mainBtn(G.ui, last ? 'Итоги' : 'Дальше', last ? 'award' : 'right', { l: G.W / 2 + QW / 2 - BW, t: cy0 + ch + 18 + (FH - 64) / 2 }, BW, () => show());
        next.classList.add('pulse');
      } else {
        S.tries++; c.off = true;
        c.el.style.setProperty('--pst', '#E5654B'); c.el.style.setProperty('--bw', '3px'); c.el.style.opacity = 0.45;
        c.el.classList.remove('shake'); void c.el.offsetWidth; c.el.classList.add('shake');
        AU.play('miss');
        tell(`Это ${sp.name.toLowerCase()}. Попробуй ещё раз!`);
        AU.say('Нет, это другое животное. Попробуй ещё раз!');
        S.nextSay = Quiz.REPEAT;
      }
    };
    const finish = () => {
      AU.hush(); AU.play('win');
      for (const c of cards) c.el.remove();
      qp.remove(); fb.remove();
      hdr.setSub('Итоги');
      const n = R.length, stars = S.score >= n - 1 ? 3 : S.score >= Math.ceil(n * 0.6) ? 2 : 1;
      G.state.quiz = G.state.quiz || {};
      G.state.quiz.best = Math.max(G.state.quiz.best || 0, S.score); G.save();
      const box = G.h('div', 'plate abs modal', G.ui, { left: G.W / 2 - 300, top: G.H / 2 - 190, width: 600, height: 300, '--c': '14px' });
      box.innerHTML = `<div class="t-label" style="text-align:center;margin-top:34px">Викторина</div>
        <div class="t-title" style="text-align:center;font-size:40px;color:#F2B640;margin-top:6px">${stars === 3 ? 'Знаток динозавров!' : stars === 2 ? 'Отлично!' : 'Хорошее начало!'}</div>
        <div style="display:flex;justify-content:center;margin-top:14px">${UI.steps(stars, 46, 10)}</div>
        <div class="t-body" style="text-align:center;font-size:20px;margin-top:14px">С первого раза: ${S.score} из ${n}</div>`;
      AU.say(S.score >= n ? 'Викторина пройдена! Все ответы верные с первого раза — ты настоящий знаток!' : stars >= 2 ? 'Викторина пройдена! Почти все ответы верные с первого раза.' : 'Викторина пройдена! Сыграй ещё раз — и правильных ответов будет больше.');
      UI.mainBtn(G.ui, 'Ещё раз', 'retry', { cx: G.W / 2 - 160, t: G.H / 2 + 130 }, 290, () => G.go('quiz', p));
      UI.secBtn(G.ui, from === 'museum' ? 'В музей' : 'На главный', from === 'museum' ? 'museum' : 'home', { cx: G.W / 2 + 160, t: G.H / 2 + 130 }, 290, back);
    };
    G.tick((dt) => {
      S.t += dt;
      if (S.q && !S.answered) { S.nextSay -= dt; if (S.nextSay <= 0) { AU.say(S.q.q); S.nextSay = Quiz.REPEAT; } }
    });
    G.wait(0.5).then(() => { if (G.alive(tok)) show(); });
  },
};
