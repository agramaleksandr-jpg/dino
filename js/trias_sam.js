'use strict';
/* ==================================================================== the Triassic of South America (the eleventh wave)
   Four new dig sites: Los Chañares in the Talampaya valley of La Rioja (Argentina), Chiniquá, Agudo and Faxinal do Soturno in
   Rio Grande do Sul (Brazil); the rhynchosaur digs at the old site of the Ischigualasto valley. Six animals and their neighbours
   (sprites, rigs, skeletons: js/gen_cre.js, like the tenth wave; neighbours: img/nbatl_tri.webp).
   species2.js calls TRIAS_SAM.install() right after TRIAS.install(), so the animals go through the same steps (each mini-game
   once, facts spread over the chapters, lock texts). The chapter builders are the Cretaceous ones (CRETA.kit).
   A new game (js/scenes8.js, Scenes.roots «Корешки»): the rhynchosaur scratch-digs roots and tubers with the big claws of its hind
   feet (Benton 1983); given to an older animal, the desmatosuchus roots them up with its shovel-like snout. */
const TRIAS_SAM = (window.TRIAS_SAM = {
  install(h) {
    const { D, S, add, CH, FIN, EGG } = h;
    const { SEEK, NEST, RAM, CHASE, FEED, STALK, RUN, MOW, NIGHTHUNT, SANDNEST, HIDE } = CRETA.kit;
    const L = (s) => `Триасовый период · ${s}`;

    /* ---------------- dig sites (Pangaea: Argentina in the west, southern Brazil to the east of it) */
    const site = (id, o) => S(id, Object.assign({ region: 'sam' }, o));
    site('chanares', { name: 'Лос-Чаньярес', where: 'Ла-Риоха, Аргентина', age: '≈236 млн лет назад', bg: 'bg_valley', pt: [430, 442],
      fact: 'Здесь, в долине Талампая, экспедиция Альфреда Ромера нашла каменные шары, а в них — больше сотни скелетов. Наверное, эти животные погибли все вместе, когда рядом извергался вулкан.' });
    site('chiniqua', { name: 'Шиникуа', where: 'Риу-Гранди-ду-Сул, Бразилия', age: '≈237 млн лет назад', bg: 'bg_tbra_run', pt: [466, 474],
      fact: 'Здесь, у городка Сан-Педру-ду-Сул, почти сто лет назад нашли скелет престозуха. А рядом находят кости травоядных звероящеров — динодонтозавров.' });
    site('faxinal', { name: 'Фашинал-ду-Сотурну', where: 'Риу-Гранди-ду-Сул, Бразилия', age: '≈225 млн лет назад', bg: 'bg_tbra_valley', pt: [500, 449],
      fact: 'В старом карьере Линья-Сан-Луис нашли сотни крошечных косточек: бразилодонов, риограндий, клевозавров. А ещё — следы большого хищного динозавра.' });
    site('agudo', { name: 'Агуду', where: 'Риу-Гранди-ду-Сул, Бразилия', age: '≈225 млн лет назад', bg: 'bg_tbra_forest', pt: [514, 486],
      fact: 'На ферме у городка Агуду в одной каменной глыбе нашли сразу три скелета макроколлумов. А неподалёку — множество костей сацизавров.' });
    const R = D.regions.sam;
    R.sites.push('chanares', 'chiniqua', 'faxinal', 'agudo');
    R.view = { c: [466, 474], z: 3.0 };
    // the Brazilian sites have pictures of their own: the river plain, the forest of conifers and seed ferns, the river valley,
    // the earth under a river bank (the burrow); Argentina keeps the valley pictures of Ischigualasto
    const BRA = { bg_run: 'bg_tbra_run', bg_forest: 'bg_tbra_forest', bg_valley: 'bg_tbra_valley', bg_mud: 'bg_tbra_valley', bg_hide: 'bg_tbra_forest',
      bg_tafr_burrow: 'bg_tbra_burrow' };
    Object.assign(G.RBGS, { chiniqua: BRA, agudo: BRA, faxinal: BRA });

    /* ---------------- the local fauna: the painted neighbours of the "Соседи" scenes and the hunters */
    D.tnb = (D.tnb || []).concat([
      { key: 'dinodontosaurus', name: 'Динодонтозавр', text: 'Это динодонтозавр — большой травоядный звероящер с клювом и двумя бивнями. Динодонтозавры жили стадами.' },
      { key: 'chanaresuchus', name: 'Чанарезух', text: 'Это чанарезух — хищник с длинной узкой мордой, похожий на крокодила. В Чаньяресе его кости находят чаще, чем других хищников.' },
      { key: 'massetognathus', name: 'Массетогнат', text: 'Это массетогнат — травоядный звероящер, дальний родственник зверей. Он перетирал растения широкими зубами.' },
      { key: 'luperosuchus', name: 'Луперозух', text: 'Это луперозух — большой хищник, родственник крокодилов. Он был самым грозным охотником этих мест.' },
      { key: 'riograndia', name: 'Риограндия', text: 'Это риограндия — маленький звероящер, родственник зверей. В Бразилии её косточки находят чаще, чем кости других звероящеров.' },
      { key: 'clevosaurus', name: 'Клевозавр', text: 'Это клевозавр — ящер-клювоголов. Его родственница туатара и сейчас живёт в Новой Зеландии.' },
      { key: 'guaibasaurus', name: 'Гуайбазавр', text: 'Это гуайбазавр — небольшой ранний динозавр длиной около двух метров.' },
      { key: 'jachaleria', name: 'Хачалерия', text: 'Это хачалерия — большой звероящер с клювом. Бивней, как у её родственников, у неё не было.' },
      { key: 'erythrovenator', name: 'Эритровенатор', text: 'Это эритровенатор — «красный охотник», один из самых древних хищных динозавров. Длиной около двух метров.' },
    ]);
    // the old neighbours of the Ischigualasto valley: the rhynchosaurs painted there are now the player's own kind
    const hy = D.neighbours.find((q) => q.key === 'hyperodapedon');
    if (hy) hy.self = 'Это гиперодапедоны — такие же, как ты! В этой долине их было больше, чем всех других животных.';
    Object.assign(D.nbSp || (D.nbSp = {}), { nb_hyperodapedon: 'hyper' });
    // the same animal painted twice or more in a scene says something new each time (Scenes.seek, a zone id with '#')
    D.zoneInfo = Object.assign(D.zoneInfo || {}, {
      'nb_dinodontosaurus#2': { text: 'Ещё один динодонтозавр! Эти звероящеры паслись стадами.' },
      'nb_dinodontosaurus#3': { text: 'И ещё один! В стаде было безопаснее: рядом охотился престозух.' },
      'nb_dinodontosaurus#young': { name: 'Малыши динодонтозавров',
        text: 'Это малыши динодонтозавров. Учёные нашли вместе сразу шесть молодых динодонтозавров — наверное, малыши держались группой.' },
      'nb_massetognathus#2': { text: 'Ещё один массетогнат! В каменных шарах Чаньяреса их находят целыми группами.' },
      'macro#2': { text: 'Ещё один макроколлум! Длинной шеей он доставал листья высоко на деревьях.' },
      'macro#3': { text: 'И ещё один! Учёные нашли три скелета макроколлумов вместе — наверное, они жили стадом.' },
      'saci#2': { text: 'Ещё один сацизавр! Длинные ноги помогали ему быстро бегать.' },
      'brasil#2': { text: 'Ещё один бразилодон! Наверное, они жили в норках, как нынешние землеройки.' },
    });
    Object.assign(AU.VOICES, {
      presto: ['roar_big', 0.95], hyper: ['grunt_herb', 1.3], macro: ['grunt_herb', 1.0], saci: ['grunt_herb', 1.55], lago: ['roar_small', 1.7],
      brasil: ['snort_beast', 1.9],
      nb_dinodontosaurus: ['grunt_herb', 0.8], nb_chanaresuchus: ['hiss_croc', 1.2], nb_massetognathus: ['snort_beast', 1.3], nb_luperosuchus: ['roar_big', 1.0],
      nb_riograndia: ['snort_beast', 1.8], nb_clevosaurus: ['hiss_croc', 1.7], nb_guaibasaurus: ['roar_small', 1.2], nb_jachaleria: ['grunt_herb', 0.85],
      nb_erythrovenator: ['roar_small', 1.1],
    });

    /* ---------------- the games: the new one (dig up roots) and the burrow of the tenth wave */
    // a predator drawn to scale in Scenes.escape: its length over the hero's
    const HR = (c, hr) => { c.p = Object.assign({}, c.p, { hr }); return c; };
    const ROOTS = (n, p) => CH(n, 'roots', 'Корешки', 1, { scene: 'roots', p: Object.assign({ need: 5, bg: 'bg_run' }, p), bg: 'bg_run', pos: '50% 70%', size: '240%',
      say: `Глава ${n}: выкопай сочные корешки!` });
    const DEN = (n, p) => CH(n, 'den', 'Своя нора', 3, { scene: 'den', p: Object.assign({ bg: 'bg_tafr_burrow' }, p), bg: 'bg_tafr_burrow', pos: '50% 45%', size: '220%',
      say: `Глава ${n}: вырой норку и спрячься в ней!` });

    /* ---------------- the animals */
    const tri = (id, o) => add(id, Object.assign({ period: 'trias', pathBg: 'bg_valley' }, o));
    tri('presto', {
      name: 'Престозух', gen: 'престозуха', site: 'chiniqua', kind: 'Хищник', predator: true, pathBg: 'bg_run',
      hero: { name: 'Престозух', latin: 'Prestosuchus chiniquensis', period: L('≈237 млн лет назад'),
        rows: [['Длина', 'до 7 м'], ['Ноги', 'Прямо под телом'], ['Ел', 'Мясо'], ['Нашли', 'Бразилия']],
        size: 'Длиной около 7 метров — как небольшой автобус',
        desc: 'Престозух — огромный хищник, дальний родственник крокодилов. Жил около 237 миллионов лет назад в Бразилии.',
        say: 'Престозух — огромный хищник, дальний родственник крокодилов. Длиной около семи метров.' },
      facts: {
        head: { part: 'Зубы', text: 'Голова у престозуха была большой и высокой, а зубы — острые, загнутые назад, с зазубринками.' },
        body: { part: 'Имя', text: 'Его назвали в честь бразильского учёного Висентину Престеса ди Алмейды. «Престозух» значит «крокодил Престеса».' },
        legs: { part: 'Ноги', text: 'Ноги у него стояли прямо под телом, как колонны, — не вразвалку, как у ящериц.' },
        tail: { part: 'Находка', text: 'Его скелет нашли почти сто лет назад. Кости отправили на корабле в Германию — там учёный Фридрих фон Хюэне дал престозуху имя.' },
      },
      chapters: [EGG(['legs']),
        Object.assign(STALK(2, 'nb_dinodontosaurus', 'молодому динодонтозавру', 150, 'bg_run'), { facts: ['head'] }),
        Object.assign(CHASE(3, 'it_cyno', 'зверьков'), { facts: ['body'] }),
        Object.assign(SEEK(4, [], 'bg_run'), { facts: ['tail'] }),
        NEST(5, 'bg_run', ['it_cyno', 'it_lizard']),
        FIN('bg_run', '50% 50%')],
      final: { len: 'до 7 м', wt: 'как автобус', wtIcon: 'star', say: 'Ура! Твой престозух вырос — огромный хищник, родственник крокодилов! Загляни в музей.' },
    });
    tri('hyper', {
      name: 'Гиперодапедон', gen: 'гиперодапедона', site: 'ischi', kind: 'Травоядный', pathBg: 'bg_valley',
      hero: { name: 'Гиперодапедон', latin: 'Hyperodapedon sanjuanensis', period: L('≈230 млн лет назад'),
        rows: [['Длина', '≈ 1,3 м'], ['Клюв', 'Крючком'], ['Ел', 'Растения, корни'], ['Нашли', 'Аргентина, Бразилия']],
        size: 'Длиной около 1,3 метра — с большую собаку',
        desc: 'Гиперодапедон — травоядный ящер-ринхозавр с клювом. Жил около 230 миллионов лет назад в Аргентине и Бразилии.',
        say: 'Гиперодапедон — толстый травоядный ящер с клювом-крючком. Задними лапами он выкапывал корни.' },
      facts: {
        head: { part: 'Клюв', text: 'Клювом-крючком он соскребал растения, а сильные челюсти резали их, как ножницы.' },
        body: { part: 'Много', text: 'В долине Исчигуаласто гиперодапедонов находят чаще всех других животных — их там было очень много.' },
        legs: { part: 'Когти', text: 'На задних лапах у него были большие когти, как у животных, которые роют землю. Наверное, ими он выкапывал корни и клубни.' },
        tail: { part: 'Находка', text: 'Первого гиперодапедона нашли в Шотландии больше 160 лет назад. А потом — в Индии, Бразилии и Аргентине: тогда все эти земли были одним материком.' },
      },
      chapters: [EGG(['tail']),
        Object.assign(ROOTS(2, { box: [300, 130] }), { facts: ['legs'] }),   // the scene's own lines are the hyperodapedon's
        Object.assign(HR(RAM(3, 'sp_sauro', 'заврозух', 'заврозуха', 'В долине Исчигуаласто на гиперодапедонов, наверное, охотился заврозух — огромный хищник тех мест.'), 5.4),
          { facts: ['body'] }),
        Object.assign(SEEK(4, [], 'bg_valley'), { facts: ['head'] }),
        NEST(5, 'bg_run', ['it_cyno', 'it_lizard']),
        FIN('bg_valley', '50% 50%')],
      final: { len: '≈ 1,3 м', wt: 'клюв-крючок', wtIcon: 'star', say: 'Ура! Твой гиперодапедон вырос — толстый ящер с клювом-крючком! Загляни в музей.' },
    });
    const MAC = (text) => ({ id: 'macro', text });
    tri('macro', {
      name: 'Макроколлум', gen: 'макроколлума', site: 'agudo', kind: 'Травоядный', pathBg: 'bg_forest',
      hero: { name: 'Макроколлум', latin: 'Macrocollum itaquii', period: L('≈225 млн лет назад'),
        rows: [['Длина', '≈ 3,5 м'], ['Шея', '≈ 1 м'], ['Ел', 'Листья'], ['Нашли', 'Бразилия']],
        size: 'Длиной около 3,5 метра, а шея — целый метр',
        desc: 'Макроколлум — один из первых длинношеих динозавров. Жил около 225 миллионов лет назад в Бразилии и ел листья.',
        say: 'Макроколлум — самый древний из известных длинношеих динозавров. Он ходил на двух ногах.' },
      facts: {
        head: { part: 'Шея', text: 'Шея у макроколлума длиной около метра. Ею он доставал листья, до которых другие животные не дотягивались.' },
        body: { part: 'Втроём', text: 'Три скелета макроколлумов нашли вместе, в одной каменной глыбе. Наверное, они жили стадом.' },
        legs: { part: 'Ноги', text: 'Он ходил на двух задних ногах. А его далёкие родственники — огромные завроподы — потом ходили на четырёх.' },
        tail: { part: 'Имя', text: '«Макроколлум» значит «длинная шея». Это самый древний из известных длинношеих динозавров.' },
      },
      chapters: [EGG(['legs']),
        Object.assign(HIDE(2, 'nb_erythrovenator', 'эритровенатор', 'эритровенатора', { bg: 'bg_forest' })),
        Object.assign(FEED(3, 'Высокие ветки', 'it_dicroidium', 'дотянись длинной шеей до листьев!'), { facts: ['head'] }),
        Object.assign(SEEK(4, [], 'bg_forest'), { name: 'Своё стадо', say: 'Глава 4: найди всех макроколлумов!', facts: ['body'],
          p: { bg: 'bg_forest', intro: 'Двигай картинку и найди всё стадо макроколлумов!',
            who: [MAC('Это макроколлум — такой же, как ты!'), MAC('Ещё один! Макроколлумы держались вместе.'),
              MAC('И ещё один! Учёные нашли троих сразу — в одной каменной глыбе.'), MAC('Длинная шея помогала доставать листья высоко на деревьях.'),
              MAC('Вот и последний! Ты нашёл всё стадо.')] } }),
        Object.assign(SANDNEST(5, { climb: 'Мама-макроколлум ищет место для гнезда — тёплый сухой песок. Нажимай — она идёт туда.',
          win: 'Готово! Наверное, мама-макроколлум не сидела на яйцах: тёплая земля сама согревала кладку.' }),
          { note: 'Родственники макроколлума — массоспондилы — откладывали в гнездо больше тридцати яиц.', facts: ['tail'] }),
        FIN('bg_forest', '50% 50%')],
      final: { len: '≈ 3,5 м', wt: 'шея ≈ 1 м', wtIcon: 'star', say: 'Ура! Твой макроколлум вырос — один из первых длинношеих динозавров! Загляни в музей.' },
    });
    tri('saci', {
      name: 'Сацизавр', gen: 'сацизавра', site: 'agudo', kind: 'Травоядный', pathBg: 'bg_run',
      hero: { name: 'Сацизавр', latin: 'Sacisaurus agudoensis', period: L('≈225 млн лет назад'),
        rows: [['Длина', '≈ 1 м'], ['Клюв', 'На нижней челюсти'], ['Ел', 'Растения'], ['Нашли', 'Бразилия']],
        size: 'Длиной около метра — с небольшую собаку',
        desc: 'Сацизавр — маленький травоядный родственник динозавров с клювом на нижней челюсти. Жил около 225 миллионов лет назад в Бразилии.',
        say: 'Сацизавр — маленький быстрый родственник динозавров. Его назвали в честь Саси — одноногого героя бразильских сказок.' },
      facts: {
        head: { part: 'Клюв', text: 'Кончик нижней челюсти у сацизавра был без зубов, как клюв. Им он срезал растения.' },
        body: { part: 'Имя', text: 'Его назвали в честь Саси — одноногого героя бразильских сказок. Учёные нашли 35 правых бедренных костей сацизавров и только одну левую!' },
        legs: { part: 'Ноги', text: 'Ноги у него были длинными и сильными. Наверное, он быстро бегал.' },
        tail: { part: 'Зубки', text: 'Самые большие зубы сацизавра длиной всего 3 миллиметра — как маленькое зёрнышко.' },
      },
      chapters: [EGG(['tail']),
        Object.assign(MOW(2), { name: 'Обед', say: 'Глава 2: срезай растения клювом!', facts: ['head'],
          p: { need: 14, bg: 'bg_run', plantK: 1.1, dip: 6,
            intro: ['Сацизавр срезает низкие растения кончиком нижней челюсти — он у него как клюв. Держи палец на экране — малыш пойдёт вперёд и будет щипать папоротники.',
              'Держи палец на экране — и щипли растения!'],
            first: 'Хрум! Клюв на нижней челюсти срезал листик.', win: 'Наелся! Клювом на нижней челюсти сацизавр срезал растения у самой земли.' } }),
        Object.assign(HR(RUN(3, 'nb_erythrovenator', 'эритровенатор', 'эритровенатора'), 2), { facts: ['legs'] }),
        Object.assign(SEEK(4, [], 'bg_forest'), { facts: ['body'] }),
        NEST(5, 'bg_run', ['it_cyno', 'it_lizard']),
        FIN('bg_run', '50% 50%')],
      final: { len: '≈ 1 м', wt: 'быстрые ноги', wtIcon: 'star', say: 'Ура! Твой сацизавр вырос — быстрый родственник динозавров с клювом! Загляни в музей.' },
    });
    tri('lago', {
      name: 'Лагозух', gen: 'лагозуха', site: 'chanares', kind: 'Хищник', predator: true, pathBg: 'bg_valley',
      hero: { name: 'Лагозух', latin: 'Lagosuchus talampayensis', period: L('≈236 млн лет назад'),
        rows: [['Длина', '≈ 0,5 м'], ['Вес', 'Как голубь'], ['Ел', 'Мелкую добычу'], ['Нашли', 'Аргентина']],
        size: 'Длиной около полуметра, а весил как голубь',
        desc: 'Лагозух — крошечный быстрый родственник динозавров. Жил около 236 миллионов лет назад в Аргентине.',
        say: 'Лагозух — «кролик-крокодил». Он был маленьким, лёгким и очень быстрым.' },
      facts: {
        head: { part: 'Имя', text: 'Лагозух значит «кролик-крокодил». Но он не кролик и не крокодил, а близкий родственник динозавров.' },
        body: { part: 'Предок', text: 'По скелету лагозуха учёные представляют, какими были предки динозавров.' },
        legs: { part: 'Ноги', text: 'Задние ноги у него длинные и тонкие, а передние — короткие. Наверное, он бегал на двух ногах.' },
        tail: { part: 'Находка', text: 'Его описал американский учёный Альфред Ромер в 1971 году. Кости нашли в Аргентине, в долине Талампая.' },
      },
      chapters: [EGG(['legs']),
        Object.assign(CHASE(2, 'it_beetle', 'жуков'), { name: 'Охота', facts: ['head'] }),
        Object.assign(HR(RUN(3, 'nb_luperosuchus', 'луперозух', 'луперозуха'), 6), { facts: ['body'] }),
        Object.assign(SEEK(4, [], 'bg_valley'), { facts: ['tail'] }),
        NEST(5, 'bg_run', ['it_cyno', 'it_lizard']),
        FIN('bg_valley', '50% 50%')],
      final: { len: '≈ 0,5 м', wt: 'как голубь', wtIcon: 'star', say: 'Ура! Твой лагозух вырос — крошечный быстрый родственник динозавров! Загляни в музей.' },
    });
    tri('brasil', {
      name: 'Бразилодон', gen: 'бразилодона', site: 'faxinal', kind: 'Звероящер', predator: true, pathBg: 'bg_forest',
      hero: { name: 'Бразилодон', latin: 'Brasilodon quadrangularis', period: L('≈225 млн лет назад'),
        rows: [['Длина', '12–20 см'], ['Вес', '≈ 20 г'], ['Ел', 'Насекомых'], ['Нашли', 'Бразилия']],
        size: 'Длиной 12–20 сантиметров, а весил как мышка',
        desc: 'Бразилодон — крошечный звероящер, очень близкий родственник зверей. Жил около 225 миллионов лет назад в Бразилии.',
        say: 'Бразилодон — крошечный родственник зверей. Он был похож на землеройку.' },
      facts: {
        head: { part: 'Зубы', text: 'У бразилодона, как у тебя, сначала были молочные зубы, а потом их сменяли постоянные — всего один раз. Так бывает у зверей.' },
        body: { part: 'Нора', text: 'Наверное, он жил в норках, как нынешние землеройки.' },
        legs: { part: 'Находка', text: 'Его крошечные косточки нашли в старом карьере у городка Фашинал-ду-Сотурну.' },
        tail: { part: 'Имя', text: '«Бразилодон» значит «бразильский зуб». Учёные узнали его по маленьким зубам и челюстям.' },
      },
      chapters: [EGG(['legs']),
        Object.assign(NIGHTHUNT(2, { item: 'it_beetle', icon: 'bug', stat: 'Жуков', box: [260, 110],
          intro: ['Ночь. Бразилодон выходит на охоту за жуками. Веди пальцем — так он смотрит вокруг. Увидишь жука — нажми на него!',
            'Веди пальцем и ищи в темноте жуков!'],
          first: 'Хрум! Поймал жука.',
          missTip: 'Там никого нет. Веди пальцем — так бразилодон смотрит вокруг — и ищи жуков.',
          win: 'Наелся! Маленькие родственники зверей ловили насекомых — наверное, по ночам.' }), { facts: ['head'] }),
        Object.assign(DEN(3, { box: [190, 76], tw: 64,
          intro: ['Бразилодон роет норку — днём в ней можно спрятаться и поспать. Нажимай — и он роет землю лапами!', 'Нажимай — и рой норку!'],
          sleep: 'Наверху светит солнце, а в норке темно и спокойно. Бразилодон спит до вечера.',
          win: 'Готово! Учёные думают, что бразилодоны жили в норках, как нынешние землеройки.' }), { name: 'Своя норка', facts: ['body'] }),
        Object.assign(SEEK(4, [], 'bg_forest'), { facts: ['tail'] }),
        FIN('bg_forest', '50% 50%')],
      final: { len: '12–20 см', wt: 'как мышка', wtIcon: 'star', say: 'Ура! Твой бразилодон вырос — крошечный родственник зверей! Загляни в музей.' },
    });

    /* ---------------- an older animal gets the new game: the desmatosuchus had an upturned shovel-like snout tip, perhaps for
       rooting up roots and soft plants (aetosaurs; Parker 2008, Desojo et al. 2013) */
    const de = D.species.desma;
    if (de) {
      const fi = de.chapters.findIndex((c) => c.id === 'final');
      de.chapters.splice(fi < 0 ? de.chapters.length : fi, 0, Object.assign(ROOTS(9, { snout: true, box: [330, 120], bg: 'bg_run',
        intro: ['Десматозух ищет корешки. Нажми на сухое растение — он подойдёт и разроет землю мордой-лопаткой!', 'Нажми на растение — и рой землю мордой!'],
        tapTip: 'Нажимай — и рой землю мордой!',
        first: 'Хрум! Морда-лопатка достала корешок из-под земли.',
        win: 'Наелся! Учёные думают, что мордой-лопаткой десматозух мог рыть землю и доставать корни.' }),
      { age: 2, note: 'На конце морды у десматозуха была лопатка. Наверное, ею он рыл землю и доставал корни.' }));
    }
  },
});
