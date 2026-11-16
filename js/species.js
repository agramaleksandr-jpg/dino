'use strict';
/* ==================================================================== species registry: sites, species data, state helpers, rigs, poses */
(() => {
  const D = DATA;

  /* ---------------- dig sites (map) */
  D.sites = {
    ischi: { id: 'ischi', sp: 'herrera', name: 'Исчигуаласто', where: 'Аргентина', region: 'Южная Америка', age: '≈231 млн лет назад', bg: 'bg_valley',
      fact: D.site.fact, map: [420, 455], cards: D.hidden.map((h) => ({ key: h.key, name: h.name, sil: h.key })) },
    tross: { id: 'tross', sp: 'plateo', name: 'Троссинген', where: 'Германия', region: 'Европа', age: '≈210 млн лет назад', bg: 'bg_forest',
      fact: 'В Германии и Швейцарии нашли кости больше сотни платеозавров. Многие из них, наверное, увязли в грязи.', map: [585, 195],
      cards: [{ key: 'shell', name: 'Проганохелис', find: 'shell' }] },
    cene: { id: 'cene', sp: 'eudimo', name: 'Чене', where: 'Италия', region: 'Европа', age: '≈215 млн лет назад', bg: 'bg_lagoon',
      fact: 'Здесь была тёплая лагуна. В её спокойной воде кости сохранились почти целыми.', map: [705, 268],
      cards: [{ key: 'fishf', name: 'Рыба', find: 'fishf' }] },
    berlin: { id: 'berlin', sp: 'shoni', name: 'Берлин-Ихтиозавр', where: 'Невада, США', region: 'Северная Америка', age: '≈227 млн лет назад', bg: 'bg_sea',
      fact: 'Шонизавр — символ штата Невада. Здесь нашли кости многих огромных ихтиозавров.', map: [395, 235],
      cards: [{ key: 'ammo', name: 'Аммонит', find: 'ammo' }] },
  };
  for (const o of D.others) o.site = o.site || 'ischi';
  D.others.push(
    { id: 'shell', site: 'tross', sp: null, spName: 'Проганохелис', name: 'Панцирь проганохелиса', short: 'Панцирь',
      say: 'Это не платеозавр! Это панцирь проганохелиса — одной из самых древних черепах. Панцирь был длиной 60–70 сантиметров.' },
    { id: 'fishf', site: 'cene', sp: null, spName: 'Парафолидофорус', name: 'Рыба парафолидофорус', short: 'Рыба',
      say: 'Это не эудиморфодон! Это рыбка парафолидофорус. Такую рыбу нашли прямо в животе у эудиморфодона!' },
    { id: 'ammo', site: 'berlin', sp: null, spName: 'Аммонит', name: 'Раковина аммонита', short: 'Аммонит',
      say: 'Это не шонизавр! Это раковина аммонита — родственника кальмаров. Шонизавры на них охотились.' },
  );

  /* ---------------- species */
  const BONES6 = (a) => a.map(([id, name]) => ({ id, name }));
  D.species = {
    herrera: {
      id: 'herrera', name: 'Герреразавр', gen: 'герреразавра', site: 'ischi', sil: 'herrera', img: 'hero', kind: 'Хищник',
      hero: Object.assign({ say: 'Герреразавр. Длина до шести метров, вес около трёхсот пятидесяти килограммов. Ел мясо. ' + D.hero.size + '.' }, D.hero),
      facts: D.facts, factOrder: ['mouth', 'arms', 'legs', 'tail'], firstFact: 'mouth', bones: D.bones,
      chapters: D.chapters, babyName: 'маленький герреразавр', egg: true, pathBg: 'bg_valley',
      revealSay: 'Это герреразавр — один из первых динозавров на Земле! Он отправляется в музей.',
      final: { title: 'Ты вырастил герреразавра!', len: 'до 6 м', wt: '≈ 350 кг', say: 'Ура! Твой герреразавр вырос. Загляни в музей — там открылись новые факты!' },
    },
    plateo: {
      id: 'plateo', name: 'Платеозавр', gen: 'платеозавра', site: 'tross', sil: 'plateo', img: 'sp_plateo', kind: 'Травоядный',
      hero: { name: 'Платеозавр', latin: 'Plateosaurus trossingensis', period: 'Триасовый период · ≈214–204 млн лет назад',
        rows: [['Длина', 'До 10 м'], ['Вес', 'До 4 т'], ['Ел', 'Растения'], ['Нашли', 'Германия']],
        size: 'Длиной почти с автобус, весил до 4 тонн — как слон',
        say: 'Платеозавр. Длина до десяти метров, вес до четырёх тонн. Ел растения. Длиной почти с автобус.' },
      facts: {
        neck: { part: 'Шея', text: 'Маленькая голова на длинной гибкой шее из десяти позвонков — чтобы доставать листья высоко на деревьях.', lock: 'открыт сразу' },
        hands: { part: 'Руки', text: 'На руках пять пальцев, а на большом пальце — огромный коготь. Им можно было защищаться или подтягивать ветки.', lock: 'Пройди главу «Обед на дереве», и этот факт откроется.' },
        legs: { part: 'Ноги', text: 'Ходил на двух ногах, на пальцах. Длинные голени помогали ему быстро бегать.', lock: 'Пройди главу «Через топь», и этот факт откроется.' },
        tail: { part: 'Хвост', text: 'Мускулистый подвижный хвост — больше сорока позвонков! Он держал равновесие.', lock: 'Пройди главу «Через топь», и этот факт откроется.' },
      },
      factOrder: ['neck', 'hands', 'legs', 'tail'], firstFact: 'neck',
      bones: BONES6([['skull', 'череп'], ['neck', 'шею'], ['torso', 'рёбра и руки'], ['pelvis', 'таз'], ['legs', 'ноги'], ['tail', 'хвост']]),
      chapters: [
        { n: 1, id: 'ch1', name: 'Яйцо', age: 0, bg: 'bg_egg', pos: '50% 46%', size: '260%', say: 'Глава 1: помоги малышу вылупиться из яйца!',
          note: 'Платеозавры вылуплялись из яиц, как и все динозавры. А выросли — длиной почти с автобус!' },
        { n: 2, id: 'feed', name: 'Обед на дереве', age: 1, bg: 'bg_forest', pos: '78% 30%', size: '260%', say: 'Глава 2: дотянись длинной шеей до свежих побегов!', facts: ['hands'] },
        { n: 3, id: 'mud', name: 'Через топь', age: 2, bg: 'bg_mud', pos: '50% 82%', size: '280%', say: 'Глава 3: перейди топкую равнину и не увязни!', facts: ['legs', 'tail'] },
        { n: 4, id: 'final', name: 'Финал', age: 3, bg: 'bg_forest', pos: '35% 60%', size: '220%' },
      ],
      babyName: 'маленький платеозавр', egg: true, pathBg: 'bg_forest',
      baby: { key: 'baby_plateo', rig: 'babyPlateo', ax: 470, ay: 466, s: 0.44 },
      revealSay: 'Это платеозавр — один из первых больших травоядных динозавров! Он отправляется в музей.',
      final: { title: 'Ты вырастил платеозавра!', len: 'до 10 м', wt: 'до 4 т', bg: 'bg_forest', f: [360, 640], k: 0.4,
        say: 'Ура! Твой платеозавр вырос — длиной почти с автобус! Загляни в музей.' },
    },
    eudimo: {
      id: 'eudimo', name: 'Эудиморфодон', gen: 'эудиморфодона', site: 'cene', sil: 'eudimo', img: 'sp_eudimo', kind: 'Летающий ящер',
      hero: { name: 'Эудиморфодон', latin: 'Eudimorphodon ranzii', period: 'Триасовый период · ≈215 млн лет назад',
        rows: [['Размах крыльев', '≈ 1 м'], ['Зубов', '110'], ['Ел', 'Рыбу'], ['Нашли', 'Италия']],
        size: 'Размах крыльев около метра — как у чайки',
        say: 'Эудиморфодон — летающий ящер, птерозавр. Размах крыльев около метра. Ел рыбу.' },
      facts: {
        teeth: { part: 'Зубы', text: '110 зубов в челюсти длиной всего 6 сантиметров! Спереди — клыки, сзади — маленькие зубчики с несколькими остриями.', lock: 'открыт сразу' },
        wings: { part: 'Крылья', text: 'Крыло — тонкая кожа, натянутая на очень длинный четвёртый палец.', lock: 'Пройди главу «Первый полёт», и этот факт откроется.' },
        tail: { part: 'Хвост', text: 'Длинный хвост с ромбиком на конце, наверное, помогал поворачивать в воздухе — как руль.', lock: 'Пройди главу «Первый полёт», и этот факт откроется.' },
        food: { part: 'Еда', text: 'В животе одного эудиморфодона нашли остатки рыбы! А малыши, наверное, ловили насекомых.', lock: 'Пройди главу «Рыбалка», и этот факт откроется.' },
      },
      factOrder: ['teeth', 'wings', 'tail', 'food'], firstFact: 'teeth',
      bones: BONES6([['skull', 'череп'], ['torso', 'шею и рёбра'], ['wingL', 'левое крыло'], ['wingR', 'правое крыло'], ['legs', 'ноги'], ['tail', 'хвост']]),
      chapters: [
        { n: 1, id: 'ch1', name: 'Яйцо', age: 0, bg: 'bg_egg', pos: '50% 46%', size: '260%', say: 'Глава 1: помоги малышу вылупиться из яйца!',
          note: 'Птерозавры тоже вылуплялись из яиц. Малыши, наверное, сначала ловили насекомых.' },
        { n: 2, id: 'flap', name: 'Первый полёт', age: 1, bg: 'bg_lagoon', pos: '50% 30%', size: '240%', say: 'Глава 2: научись летать и лови стрекоз!', facts: ['wings', 'tail'] },
        { n: 3, id: 'fishing', name: 'Рыбалка', age: 2, bg: 'bg_lagoon', pos: '50% 85%', size: '260%', say: 'Глава 3: ныряй к воде и лови рыбу!', facts: ['food'] },
        { n: 4, id: 'final', name: 'Финал', age: 3, bg: 'bg_lagoon', pos: '70% 30%', size: '220%' },
      ],
      babyName: 'маленький эудиморфодон', egg: true, pathBg: 'bg_lagoon',
      baby: { key: 'baby_eudimo', rig: 'babyEudimo', ax: 470, ay: 462, s: 0.44 },
      revealSay: 'Это эудиморфодон — один из первых летающих ящеров! Он отправляется в музей.',
      final: { title: 'Ты вырастил эудиморфодона!', len: '≈ 1 м', wt: '110 зубов', wtIcon: 'zap', bg: 'bg_lagoon', f: [360, 330], k: 0.34,
        say: 'Ура! Твой эудиморфодон вырос и ловко ловит рыбу. Загляни в музей!' },
    },
    shoni: {
      id: 'shoni', name: 'Шонизавр', gen: 'шонизавра', site: 'berlin', sil: 'shoni', img: 'sp_shoni', kind: 'Морской ящер',
      hero: { name: 'Шонизавр', latin: 'Shonisaurus popularis', period: 'Триасовый период · ≈227 млн лет назад',
        rows: [['Длина', 'До 15 м'], ['Вес', '≈ 20–30 т'], ['Ел', 'Мясо'], ['Нашли', 'США']],
        size: 'Длиной с горбатого кита',
        say: 'Шонизавр — огромный ихтиозавр, морской ящер. Длина до пятнадцати метров — как горбатый кит.' },
      facts: {
        head: { part: 'Голова', text: 'Череп длиной почти 3 метра — больше, чем взрослый человек!', lock: 'открыт сразу' },
        breath: { part: 'Дыхание', text: 'Шонизавр — не рыба, а рептилия. Он дышал воздухом и всплывал, чтобы вдохнуть.', lock: 'Пройди главу «Рождение», и этот факт откроется.' },
        fins: { part: 'Ласты', text: 'Передние и задние ласты длинные и узкие — длиннее, чем у других ихтиозавров.', lock: 'Пройди главу «Охота в море», и этот факт откроется.' },
        tail: { part: 'Хвост', text: 'Хвост с плавником. Позвоночник загибался вниз, в нижнюю половину плавника.', lock: 'Пройди главу «Охота в море», и этот факт откроется.' },
      },
      factOrder: ['head', 'breath', 'fins', 'tail'], firstFact: 'head',
      bones: BONES6([['skull', 'череп'], ['torso', 'позвоночник и рёбра'], ['finA', 'переднюю ласту'], ['finB', 'вторую переднюю ласту'], ['rear', 'заднюю ласту'], ['tail', 'хвост']]),
      chapters: [
        { n: 1, id: 'birth', name: 'Рождение', age: 0, bg: 'bg_sea', pos: '50% 20%', size: '240%', say: 'Глава 1: малыш родился в воде — помоги ему вдохнуть!', facts: ['breath'] },
        { n: 2, id: 'swim', name: 'Охота в море', age: 1, bg: 'bg_sea', pos: '50% 60%', size: '240%', say: 'Глава 2: лови аммонитов и не забывай дышать!', facts: ['fins', 'tail'] },
        { n: 3, id: 'final', name: 'Финал', age: 3, bg: 'bg_sea', pos: '50% 40%', size: '200%' },
      ],
      babyName: 'маленький шонизавр', egg: false, pathBg: 'bg_sea',
      revealSay: 'Это шонизавр — огромный морской ящер, длиной с кита! Он отправляется в музей.',
      final: { title: 'Ты вырастил шонизавра!', len: 'до 15 м', wt: '≈ 20–30 т', bg: 'bg_sea', f: [360, 420], k: 0.34,
        say: 'Ура! Твой шонизавр вырос — длиной с кита! Загляни в музей.' },
    },
  };

  /* ---------------- state helpers (herrera keeps its old top-level fields) */
  G.cur = () => (G.state && G.state.cur && D.species[G.state.cur] ? G.state.cur : 'herrera');
  G.SP = (id) => D.species[id || G.cur()];
  G.spState = (id) => {
    id = id || G.cur();
    if (id === 'herrera') return G.state;
    const all = G.state.sp || (G.state.sp = {});
    const s = all[id] || (all[id] = { bones: [], assembled: false, ch: {}, facts: {} });
    s.ch = s.ch || {}; s.facts = s.facts || {}; s.bones = s.bones || [];
    return s;
  };
  G.S = () => G.spState();
  /** the period of an animal ('trias' | 'jura'), the period on screen (the current animal's), its animals */
  G.perOf = (id) => (D.species[id] && D.species[id].period) || 'trias';
  G.period = () => G.perOf(G.cur());
  G.per = () => D.periods[G.period()];
  G.inPeriod = (per) => Object.keys(D.species).filter((id) => G.perOf(id) === (per || G.period()));
  G.setCur = (id) => { G.state.cur = id; (G.state.curPer || (G.state.curPer = {}))[G.perOf(id)] = id; G.save(); };
  /** show another period (map, museum): its last animal, else the first one not found yet */
  G.switchPeriod = (per) => {
    const ids = G.inPeriod(per), last = G.state.curPer && G.state.curPer[per];
    G.setCur(ids.includes(last) ? last : ids.find((id) => !G.spState(id).assembled) || ids[0]);
  };
  G.site = (id) => D.sites[G.SP(id).site];
  G.boneImg = (sp, id) => (sp === 'herrera' ? 'bone_' + id : `sk_${sp}_${id}`);
  G.boneMeta = (sp, id) => (sp === 'herrera' ? MAN.bones[id] : MAN.sk[sp].bones[id]);
  G.skel = (sp) => (sp === 'herrera' ? MAN.skel : MAN.sk[sp]);
  G.ghostImg = (sp) => (sp === 'herrera' ? 'skel_ghost' : `sk_${sp}_ghost`);
  G.othersLeft = (siteId) => {
    const s = siteId || G.SP().site;
    return D.others.filter((o) => o.site === s && !G.state.others.includes(o.id)).map((o) => o.id);
  };
  G.assembledCount = (per) => G.inPeriod(per).filter((id) => G.spState(id).assembled).length;
  /** "continue digging" from the museum: the animal in view if it is not in the museum yet, else one already being dug,
      else the next one not found yet (neighbours of the same dig site first, then the same part of Pangaea); null when all are found */
  G.nextDig = () => {
    const cur = G.cur(), ids = G.inPeriod().concat(Object.keys(D.species).filter((id) => G.perOf(id) !== G.period())), open = (id) => !G.spState(id).assembled;
    if (open(cur)) return cur;
    const begun = ids.find((id) => open(id) && G.spState(id).bones.length);
    if (begun) return begun;
    const site = D.species[cur].site, reg = D.sites[site].region, i0 = ids.indexOf(cur);
    const order = ids.slice(i0 + 1).concat(ids.slice(0, i0));
    return order.find((id) => open(id) && D.species[id].site === site)
      || order.find((id) => open(id) && D.sites[D.species[id].site].region === reg) || order.find(open) || null;
  };
  /** go to the dig site of that animal on the map, its card open ("Продолжим раскопки?") */
  G.goDig = () => {
    const id = G.nextDig(); if (!id) return G.go('map');
    G.setCur(id); G.state.region = D.sites[D.species[id].site].region; G.save();
    return G.go('map', { open: true });
  };
  G.chDone = (n) => { const c = G.S().ch[n]; return !!(c && c.done); };
  G.chStars = (n) => (G.S().ch[n] && G.S().ch[n].stars) || 0;
  G.chOpen = (n) => { if (!G.S().assembled) return false; if (n <= 1) return true; return G.chDone(n - 1); };
  G.setCh = (n, stars) => {
    const ch = G.S().ch, c = ch[n] || { done: false, stars: 0 };
    c.done = true; c.stars = Math.max(c.stars || 0, stars); ch[n] = c; G.save();
  };
  G.nCh = () => G.SP().chapters.filter((c) => c.id !== 'final').length;
  G.totalSteps = () => { let s = 0; for (let n = 1; n <= G.nCh(); n++) s += G.chStars(n); return s; };

  /* ---------------- rigs (source-image coordinates via _conv) */
  const RG = GL.RIGS;
  const gauss = (cx, cy, rx, ry) => (x, y) => Math.exp(-(((x - cx) / rx) ** 2) - (((y - cy) / ry) ** 2));
  RG.plateo = () => {
    const { P, L, o } = _conv('sp_plateo');
    const X = (x) => x - o.ox, Y = (y) => y - o.oy;
    const arm = L([[1075, 392], [1125, 372], [1175, 385], [1222, 455], [1215, 570], [1105, 570], [1088, 470]]);
    return {
      step: 12, refine: [[X(1370), X(1520), Y(40), Y(140), 5]], eye: [...P(1447, 82), 6.5, 6],
      bones: [
        { name: 'breath', type: 'breath', c: P(960, 330), w: gauss(X(960), Y(350), 170, 80) },
        { name: 'tail', type: 'wave', c: P(700, 385), k: 2,
          w: (x, y) => Math.pow(G.clamp((X(700) - x) / 680, 0, 1), 1.2) * G.clamp((Y(470) - y) / 30, 0, 1), u: (x) => G.clamp((X(700) - x) / 680, 0, 1) },
        { name: 'arms', type: 'rot', c: P(1105, 405), w: polyW(arm, 8) },
        { name: 'neck', type: 'rot', c: P(1160, 300), w: (x, y) => G.smooth(X(1160), X(1330), x) * G.clamp((Y(395) - y) / 35, 0, 1) },
        { name: 'head', type: 'rot', c: P(1392, 98), w: (x) => G.smooth(X(1380), X(1422), x) },
      ],
    };
  };
  RG.eudimo = () => {
    const { P, L, o } = _conv('sp_eudimo');
    const X = (x) => x - o.ox, Y = (y) => y - o.oy;
    const wf = L([[150, 20], [400, 12], [662, 62], [705, 108], [872, 300], [885, 345], [760, 372], [650, 398], [560, 330], [400, 200], [250, 92]]);
    const wn = L([[885, 330], [965, 328], [1195, 398], [1255, 418], [1505, 760], [1470, 775], [1300, 692], [1100, 562], [950, 452], [878, 422]]);
    const cF = P(860, 330), cN = P(925, 375);
    const pf = polyW(wf, 14), pn = polyW(wn, 14);
    const jaw = L([[1068, 280], [1180, 293], [1305, 312], [1312, 326], [1250, 326], [1120, 318], [1062, 302]]);
    const legs = L([[555, 398], [765, 392], [775, 442], [660, 492], [555, 482]]);
    return {
      step: 12, eye: [...P(1100, 274), 8, 7.5],
      bones: [
        { name: 'wingF', type: 'wave', c: cF, k: 1.3, w: (x, y) => pf(x, y) * G.clamp(Math.hypot(x - cF[0], y - cF[1]) / 90, 0, 1), u: (x, y) => G.clamp(Math.hypot(x - cF[0], y - cF[1]) / 720, 0, 1) },
        { name: 'wingN', type: 'wave', c: cN, k: 1.3, w: (x, y) => pn(x, y) * G.clamp(Math.hypot(x - cN[0], y - cN[1]) / 90, 0, 1), u: (x, y) => G.clamp(Math.hypot(x - cN[0], y - cN[1]) / 720, 0, 1) },
        { name: 'tail', type: 'wave', c: P(640, 395), k: 2,
          w: (x, y) => Math.pow(G.clamp((X(640) - x) / 620, 0, 1), 1.1) * G.clamp(1 - Math.abs(y - Y(398)) / 70, 0, 1), u: (x) => G.clamp((X(640) - x) / 620, 0, 1) },
        { name: 'legs', type: 'rot', c: P(720, 410), w: polyW(legs, 6) },
        { name: 'jaw', type: 'rot', c: P(1068, 286), w: polyW(jaw, 4) },
        { name: 'head', type: 'rot', c: P(985, 300), w: (x, y) => G.smooth(X(975), X(1012), x) * G.clamp((Y(350) - y) / 25, 0, 1) },
      ],
    };
  };
  RG.shoni = () => {
    const { P, L, o } = _conv('sp_shoni');
    const X = (x) => x - o.ox, Y = (y) => y - o.oy;
    const fa = L([[1030, 418], [1112, 408], [1102, 470], [992, 622], [922, 718], [888, 706], [958, 560]]);
    const fb = L([[1078, 432], [1132, 432], [1122, 562], [1092, 652], [1058, 650], [1068, 520]]);
    const rear = L([[305, 522], [498, 418], [652, 438], [645, 485], [432, 612], [398, 600]]);
    const jaw = L([[1305, 336], [1500, 336], [1508, 346], [1305, 352]]);
    return {
      step: 12, eye: [...P(1266, 316), 15, 15],
      bones: [
        { name: 'breath', type: 'breath', c: P(800, 380), w: gauss(X(800), Y(390), 300, 110) },
        { name: 'tail', type: 'wave', c: P(640, 335), k: 2.2, w: (x) => Math.pow(G.clamp((X(640) - x) / 610, 0, 1), 1.1), u: (x) => G.clamp((X(640) - x) / 610, 0, 1) },
        { name: 'rear', type: 'rot', c: P(600, 440), w: polyW(rear, 8) },
        { name: 'finB', type: 'rot', c: P(1095, 440), w: polyW(fb, 6) },
        { name: 'finA', type: 'rot', c: P(1062, 418), w: polyW(fa, 8) },
        { name: 'jaw', type: 'rot', c: P(1305, 338), w: polyW(jaw, 3) },
        { name: 'head', type: 'rot', c: P(1180, 332), w: (x) => G.smooth(X(1170), X(1235), x) },
      ],
    };
  };
  RG.babyPlateo = () => {
    const { P, o } = _conv('baby_plateo');
    const X = (x) => x - o.ox, Y = (y) => y - o.oy;
    return {
      step: 8, eye: [...P(695, 245), 12, 12],
      bones: [
        { name: 'breath', type: 'breath', c: P(500, 470), w: gauss(X(500), Y(480), 120, 80) },
        { name: 'tail', type: 'wave', c: P(400, 600), k: 2, w: (x) => Math.pow(G.clamp((X(400) - x) / 375, 0, 1), 1.2), u: (x) => G.clamp((X(400) - x) / 375, 0, 1) },
        { name: 'head', type: 'rot', c: P(640, 340), w: (x, y) => G.smooth(X(600), X(660), x) * G.clamp((Y(430) - y) / 40, 0, 1) },
      ],
    };
  };
  RG.babyEudimo = () => {
    const { P, o } = _conv('baby_eudimo');
    const X = (x) => x - o.ox, Y = (y) => y - o.oy;
    return {
      step: 8, eye: [...P(1356, 290), 11, 11],
      bones: [
        { name: 'breath', type: 'breath', c: P(1150, 470), w: gauss(X(1150), Y(480), 110, 70) },
        { name: 'tail', type: 'wave', c: P(1040, 545), k: 2, w: (x, y) => Math.pow(G.clamp((X(1040) - x) / 275, 0, 1), 1.1) * G.clamp((Y(640) - y) / 40, 0, 1), u: (x) => G.clamp((X(1040) - x) / 275, 0, 1) },
        { name: 'head', type: 'rot', c: P(1265, 390), w: (x, y) => G.smooth(X(1240), X(1295), x) * G.clamp((Y(470) - y) / 50, 0, 1) },
      ],
    };
  };

  /* ---------------- poses */
  const blinkOf = (t, blinks) => { let b = 0; for (const s of blinks || []) { const d = t - s; if (d >= 0 && d <= 0.22) b = Math.max(b, Math.sin((Math.PI * d) / 0.22)); } return b; };
  Pose.plateo = (t, acts, blinks) => {
    const p = { breath: 0.02 * (0.5 - 0.5 * Math.cos((2 * Math.PI * t) / 3.4)), neck: 2.5 * Math.sin((2 * Math.PI * t) / 6.2), head: 2 * Math.sin((2 * Math.PI * t) / 4.1 + 1), arms: 0 };
    let amp = 3 + 1.5 * Math.sin((2 * Math.PI * t) / 5), ph = (2 * Math.PI * t) / 4.5;
    for (const a of acts || []) {
      const s = (t - a.t0) / a.dur; if (s < 0 || s > 1) continue;
      if (a.type === 'look') { p.neck += -11 * G.bump(s); p.head += 7 * G.bump(s); }
      else if (a.type === 'eat') { p.neck += 13 * G.bump(s); p.head += 9 * G.bump(s); }
      else if (a.type === 'flick') { amp = amp * (1 - Math.sin(Math.PI * s)) + 9 * Math.sin(Math.PI * s); ph = 2 * Math.PI * 1.4 * s; }
      else if (a.type === 'step') { p.arms += 14 * G.bump(s); p.breath += 0.03 * G.bump(s); }
    }
    p.tail = amp; p.tailPh = ph; p.blink = blinkOf(t, blinks);
    return p;
  };
  /** flap: amplitude (deg) and phase come from the game; museum uses a slow glide */
  Pose.eudimo = (t, acts, blinks, flap) => {
    let A = 9 + 3 * Math.sin(t * 0.7), ph = 2 * Math.PI * 0.55 * t;
    if (flap) { A = flap.A; ph = flap.ph; }
    const p = { tail: 5, tailPh: t * 2.4, head: 2 * Math.sin(t * 1.1), jaw: 0, legs: 3 * Math.sin(t * 0.9) };
    for (const a of acts || []) {
      const s = (t - a.t0) / a.dur; if (s < 0 || s > 1) continue;
      if (a.type === 'flap') { A = A * (1 - Math.sin(Math.PI * s)) + 24 * Math.sin(Math.PI * s); ph = 2 * Math.PI * 2.2 * s; }
      else if (a.type === 'jaw') { p.jaw += 9 * G.bump(s); p.head += -4 * G.bump(s); }
      else if (a.type === 'look') { p.head += 6 * G.bump(s); }
      else if (a.type === 'flick') { p.tail = 5 + 8 * Math.sin(Math.PI * s); }
    }
    p.wingF = -A; p.wingN = A; p.wingFPh = ph; p.wingNPh = ph;
    p.yOff = -A * 1.6 * Math.sin(ph - 0.6);
    p.blink = blinkOf(t, blinks);
    return p;
  };
  Pose.shoni = (t, acts, blinks, speed) => {
    const f = speed || 0.45, ph = 2 * Math.PI * f * t;
    const p = { tail: 6, tailPh: ph, finA: 9 * Math.sin(ph + 0.4), finB: 7 * Math.sin(ph + 0.9), rear: 7 * Math.sin(ph + 1.6),
      head: 1.2 * Math.sin(ph + 2), jaw: 0, breath: 0.015 * (0.5 - 0.5 * Math.cos(ph * 0.5)), yOff: 3 * Math.sin(ph + 1) };
    for (const a of acts || []) {
      const s = (t - a.t0) / a.dur; if (s < 0 || s > 1) continue;
      if (a.type === 'snap') { p.jaw += 9 * G.bump(s); p.head += -3 * G.bump(s); }
      else if (a.type === 'swish') { p.tail += 9 * Math.sin(Math.PI * s); }
      else if (a.type === 'look') { p.head += 4 * G.bump(s); p.finA += 12 * G.bump(s); }
    }
    p.blink = blinkOf(t, blinks);
    return p;
  };

  /* ---------------- museum / reveal / finale models */
  const conv = (key) => { const o = MAN[key]; return (x, y) => [x - o.ox, y - o.oy]; };
  D.species.plateo.model = () => {
    const P = conv('sp_plateo'), a = P(900, 768);
    return { key: 'sp_plateo', rig: () => GL.RIGS.plateo(), pose: Pose.plateo, ax: a[0], ay: a[1],
      hall: { f: [640, 418], k: 0.2 }, close: { f: [430, 405], k: 0.42 },
      dots: { neck: P(1300, 200), hands: P(1165, 520), legs: P(950, 610), tail: P(330, 345) },
      tap: 'look', sound: 'chirp', factAct: { neck: 'look', hands: 'step', legs: 'step', tail: 'flick' } };
  };
  D.species.eudimo.model = () => {
    const P = conv('sp_eudimo'), a = P(760, 480);
    return { key: 'sp_eudimo', rig: () => GL.RIGS.eudimo(), pose: Pose.eudimo, ax: a[0], ay: a[1],
      hall: { f: [640, 352], k: 0.2 }, close: { f: [372, 300], k: 0.4 },
      dots: { teeth: P(1200, 300), wings: P(420, 160), tail: P(110, 400), food: P(800, 400) },
      tap: 'jaw', sound: 'chirp', factAct: { teeth: 'jaw', wings: 'flap', tail: 'flick', food: 'jaw' } };
  };
  D.species.shoni.model = () => {
    const P = conv('sp_shoni'), a = P(800, 500);
    return { key: 'sp_shoni', rig: () => GL.RIGS.shoni(), pose: Pose.shoni, ax: a[0], ay: a[1],
      hall: { f: [640, 382], k: 0.2 }, close: { f: [376, 330], k: 0.4 },
      dots: { head: P(1330, 300), breath: P(820, 300), fins: P(1000, 600), tail: P(140, 330) },
      tap: 'snap', sound: 'whoosh', factAct: { head: 'snap', breath: 'look', fins: 'look', tail: 'swish' } };
  };

  /* ---------------- creatures with jointed legs */
  const mk0 = GL.makeCreature;
  GL.makeCreature = (name, o) => {
    if (name === 'plateo') {
      const P = conv('sp_plateo'), a = P(900, 768);
      return GL.creature({ body: 'sp_plateo_body', leg: 'sp_plateo_leg', rig: GL.youngRig(GL.RIGS.plateo(), 'plateo', o && o.young), legs: MAN.legs.sp_plateo, sharp: 5, anchor: 70, minExt: 0.5, step: 6,
        far: { dx: 16, dy: -8, dg: -6, tint: [0.12, 0.09, 0.06, 0.4] } }, Object.assign({ ax: a[0], ay: a[1] }, o));
    }
    return mk0(name, o);
  };
  GL.Gaits.PWALK = { duty: 0.62, reach: 120, sweep: 250, lift: 34, roll: 0.5, trail: 0.6, ret: 0.3, psiC: -30, psiL: 30, psiS: 56, aL: 46, aS: 56, bob: 3 };
})();
