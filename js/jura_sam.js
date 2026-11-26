'use strict';
/* ==================================================================== the Jurassic of South America (the twelfth wave)
   Two new dig sites: Laguna Colorada in Santa Cruz (Patagonia), where a whole herd of mussaurus was found with its nesting
   ground, and La Grita in the Venezuelan Andes (the La Quinta Formation, the first dinosaurs of Venezuela). Three animals of the
   old Cerro Cóndor site (the Cañadón Asfalto lake) and an ichthyosaur of the Vaca Muerta sea, painted before as neighbours, are
   now animals of their own. Sprites, rigs, skeletons: js/gen_cre.js, like the Triassic waves; neighbours: img/nbatl_jur.webp.
   species2.js calls JURA_SAM.install() after the other installs, so the animals go through the same steps (each mini-game once,
   facts spread over the chapters, lock texts). The chapter builders are the Jurassic and the Cretaceous ones (JURA.kit, CRETA.kit).
   Two new games:
   - «Ровесники» (Scenes.seek, p.find): find the animals of your own age among babies and grown-ups. The mussaurus of Laguna
     Colorada died in groups of the same age — the earliest evidence of herds and of age segregation (Pol et al. 2021);
     given to an older animal, the young pinacosaurus of the Gobi (found in groups of juveniles, the adults alone).
   - «В глубину» (Scenes.swim, p.deep): the prey lives deep down where it is dark; the big eye of an ophthalmosaurid sees it.
     Given to an older animal: the temnodontosaurus with the biggest eyes. */
const JURA_SAM = (window.JURA_SAM = {
  install(h) {
    const { D, S, add, CH, FIN, EGG } = h;
    const { HERD, BIRTH, SEA_CALF, ICHTHYO_NOTE, J } = JURA.kit;
    const { SEEK, NEST, DEF, CHASE, FEED, STALK, RUN, MOW, TRACKS, SANDNEST, HIDE } = CRETA.kit;

    /* ---------------- dig sites: the far south of Patagonia and the northern tip of the continent */
    const site = (id, o) => S(id, Object.assign({ period: 'jura', region: 'jsam' }, o));
    site('lagunacolorada', { name: 'Лагуна-Колорада', where: 'Санта-Крус, Аргентина', age: '≈193 млн лет назад', bg: 'bg_jsc_valley', pt: [492, 600],
      fact: 'Лагуна-Колорада значит «красное озеро». Здесь нашли больше сотни яиц и восемьдесят муссавров — от малышей до взрослых.' });
    site('laquinta', { name: 'Ла-Грита', where: 'Тачира, Венесуэла', age: '≈201 млн лет назад', bg: 'bg_jven_valley', pt: [385, 356],
      fact: 'Здесь, в горах Венесуэлы, у дороги рядом с городком Ла-Грита, нашли первые в Венесуэле кости динозавров.' });
    const R = D.regions.jsam;
    R.sites.push('lagunacolorada', 'laquinta');
    R.view = { c: [445, 488], z: 1.6 };
    // pictures of their own: the dusty floodplain and the shore of a shallow lake (Santa Cruz), the red rift valley with its
    // volcanoes, the riverside forest and the seasonal river (Venezuela); the forest of Santa Cruz is the araucaria forest of Patagonia
    Object.assign(G.RBGS, {
      lagunacolorada: { bg_run: 'bg_jsc_run', bg_valley: 'bg_jsc_valley', bg_forest: 'bg_jsam_forest', bg_mud: 'bg_jsc_valley', bg_hide: 'bg_jsam_forest' },
      laquinta: { bg_run: 'bg_jven_run', bg_forest: 'bg_jven_forest', bg_valley: 'bg_jven_valley', bg_mud: 'bg_jven_valley', bg_hide: 'bg_jven_forest' },
    });

    /* ---------------- the local fauna: the painted neighbours of the "Соседи" scenes and the hunters */
    D.jnb = (D.jnb || []).concat([
      { key: 'tachiraptor', name: 'Тачираптор', text: 'Это тачираптор — небольшой хищный динозавр длиной около полутора метров. Его назвали в честь венесуэльского штата Тачира.' },
      { key: 'allkaruen', name: 'Аллькаруэн', place: 'air',
        text: 'Это аллькаруэн — летающий ящер размером с чайку. Его имя значит «древний мозг»: учёные изучили его мозг по черепу.' },
      { key: 'condorchelys', name: 'Кондорхелис', text: 'Это кондорхелис — древняя черепаха. Её назвали в честь Серро-Кондора, где нашли её панцирь.' },
      { key: 'sphenocondor', name: 'Сфенокондор', text: 'Это сфенокондор — маленький ящер-клювоголов, родственник туатары. Его тоже назвали в честь Серро-Кондора.' },
      { key: 'seaturtle', name: 'Морская черепаха', place: 'sea',
        text: 'Это морская черепаха. Черепахи плавали в этом море вместе с ихтиозаврами — их кости находят в одних и тех же камнях.' },
    ]);
    // the old neighbours of the Cañadón Asfalto scenes are now the player's own kind
    Object.assign(D.nbSp || (D.nbSp = {}), { nb_patagosaurus: 'patago', nb_manidens: 'manidens' });
    D.itemInfo = Object.assign(D.itemInfo || {}, {
      it_belemnite: { name: 'Белемниты', text: 'Это белемниты — родственники кальмаров. Внутри у них была твёрдая косточка, похожая на пулю, — её часто находят в камнях.' } });
    // the same animal painted twice or more in a scene says something new each time (Scenes.seek, a zone id with '#')
    D.zoneInfo = Object.assign(D.zoneInfo || {}, {
      'nb_patagosaurus#young': { name: 'Молодой патагозавр',
        text: 'Это молодой патагозавр. Учёные нашли в одном месте патагозавров разного возраста — от малыша до взрослого.' },
      'nb_allkaruen#2': { text: 'Ещё один аллькаруэн! Его кости нашли в слоях древнего озера — поэтому его второе имя значит «озеро».' },
      'dako#vm': { name: 'Дакозавр', text: 'Это дакозавр — морской крокодил с короткой мордой и огромными зубами. Он был одним из главных хищников этого моря.' },
      // the age-mates of the mussaurus: the babies at the nests and the grown-ups do not count
      'mussa#baby1': { name: 'Малыш муссавра', text: 'Это малыш — он только что вылупился. Малыши были размером с цыплёнка и ходили на четырёх лапах.' },
      'mussa#baby2': { name: 'Малыш муссавра', text: 'И это малыш. Он гораздо меньше тебя — его можно взять в ладони.' },
      'mussa#baby3': { name: 'Малыш муссавра', text: 'Это тоже малыш, а не твой ровесник. Ищи муссавров твоего роста!' },
      'mussa#eggs': { name: 'Гнёзда', text: 'Это гнёзда. Муссавры откладывали яйца в канавки, в два-три слоя, — от восьми до тридцати яиц.' },
      'mussa#adult1': { name: 'Взрослый муссавр',
        text: 'Это взрослый муссавр — длиной до восьми метров. Взрослые ходили на двух ногах и держались поодиночке или парами.' },
      'mussa#adult2': { name: 'Взрослый муссавр', text: 'И это взрослый. Он достаёт до высоких веток, а тебе пока не дотянуться. Ищи своих ровесников!' },
      'pinaco#adult1': { name: 'Взрослый пинакозавр',
        text: 'Это взрослый пинакозавр — длиной около пяти метров. Взрослых пинакозавров вместе не находили: наверное, они жили поодиночке.' },
      'pinaco#adult2': { name: 'Взрослый пинакозавр', text: 'И это взрослый — он бродит один, далеко от молодых. Ищи своих ровесников!' },
    });
    Object.assign(AU.VOICES, {
      mussa: ['grunt_herb', 1.05], laquinta: ['grunt_herb', 1.65], patago: ['boom_giant', 1.0], eoabeli: ['roar_big', 1.05],
      manidens: ['grunt_herb', 1.45], caypulli: ['call_sea', 0.9],
      nb_tachiraptor: ['roar_small', 1.3], nb_allkaruen: ['screech_ptero', 1.25], nb_condorchelys: ['hiss_croc', 1.5],
      nb_sphenocondor: ['hiss_croc', 1.75], nb_seaturtle: ['hiss_croc', 1.35],
    });

    /* ---------------- the games */
    // a predator drawn to scale in Scenes.escape: its length over the hero's
    const HR = (c, hr) => { c.p = Object.assign({}, c.p, { hr }); return c; };
    // find your age-mates in a painted scene (zones '<id>#j…'); texts: the lines of the age-mates in the order they are found
    const AGEMATES = (n, o) => CH(n, 'seek', 'Ровесники', 2, { scene: 'seek', bg: o.bg || 'bg_valley', pos: '50% 70%', size: '240%',
      say: `Глава ${n}: найди своих ровесников!`,
      p: { find: '#j', intro: o.intro, done: o.done, bg: o.bg || 'bg_valley', who: o.texts.map((text) => ({ id: o.id, text })) } });
    // hunt deep down in the dark with big eyes, breathe at the surface
    const DEEP = (n, o) => CH(n, 'swim', 'В глубину', 2, { scene: 'swim', p: Object.assign({ deep: true, food: ['it_belemnite'], need: 8 }, o),
      bg: 'bg_sea', pos: '50% 60%', size: '240%', say: `Глава ${n}: ныряй в глубину за добычей!` });

    /* ---------------- the animals */
    const jur = (id, o) => add(id, Object.assign({ period: 'jura', pathBg: 'bg_valley' }, o));
    jur('mussa', {
      name: 'Муссавр', gen: 'муссавра', site: 'lagunacolorada', kind: 'Травоядный', pathBg: 'bg_run',
      hero: { name: 'Муссавр', latin: 'Mussaurus patagonicus', period: J('≈193 млн лет назад'),
        rows: [['Длина', '6–8 м'], ['Вес', 'до 1,5 т'], ['Малыш', 'С цыплёнка'], ['Нашли', 'Аргентина']],
        size: 'Длиной до 8 метров — как два легковых автомобиля',
        desc: 'Муссавр — ранний родственник длинношеих великанов. Жил около 193 миллионов лет назад в Патагонии.',
        say: 'Муссавр — длинношеий травоядный динозавр из Патагонии. Взрослый — длиной до восьми метров, а малыш — с цыплёнка.' },
      facts: {
        head: { part: 'Имя', text: '«Муссавр» значит «мышиный ящер». Сначала учёные нашли только крошечных малышей, которые помещались на ладони.' },
        legs: { part: 'Ноги', text: 'Малыши ходили на четырёх лапах, а взрослые — на двух задних ногах. Так и люди: сначала ползают, а потом ходят.' },
        body: { part: 'Стадо', text: 'Учёные нашли больше сотни яиц и восемьдесят муссавров разного возраста. Наверное, они жили стадом и вместе откладывали яйца.' },
        tail: { part: 'Рост', text: 'Малыш весил меньше ста граммов, а взрослый — больше тонны. Муссавры росли очень быстро.' },
      },
      chapters: [EGG(['head']),
        // (a grown youngster, not a baby: the babies walked on four legs)
        Object.assign(MOW(2), { age: 2, name: 'Обед', say: 'Глава 2: щипли низкие растения!', facts: ['legs'],
          p: { need: 14, bg: 'bg_run', plantK: 1.15, dip: 8,
            intro: ['Подросший муссавр щиплет низкие растения. Держи палец на экране — он пойдёт вперёд и будет щипать листья.',
              'Держи палец на экране — и щипли растения!'],
            first: 'Хрум! Вкусный листик.', win: 'Наелся! Муссавры росли быстро: за один год малыш из крошки размером с цыплёнка становился большим, как индюк.' } }),
        Object.assign(AGEMATES(3, { id: 'mussa', bg: 'bg_valley',
          intro: ['Ты подрос — тебе уже год! Найди своих ровесников: муссавров такого же роста, как ты.', 'Найди своих ровесников — муссавров твоего роста!'],
          done: 'Все ровесники нашлись! Учёные думают, что молодые муссавры держались вместе — с ровесниками.',
          texts: ['Это твой ровесник! Ему тоже около года.', 'Ещё один ровесник! Молодые муссавры держались вместе.',
            'И ещё один! Учёные нашли вместе одиннадцать молодых муссавров одного возраста.', 'Вот и последний! Вместе с ровесниками не страшно.'] }),
          { facts: ['body'] }),
        Object.assign(FEED(4, 'Высокие ветки', 'it_araucaria', 'встань на задние ноги и дотянись до веток!'), { age: 3, facts: ['tail'] }),
        Object.assign(SANDNEST(5, { climb: 'Мама-муссавр идёт на общее гнездовье, где откладывают яйца и другие мамы. Нажимай — она идёт туда.',
          dig: 'Здесь сухо и тепло. Нажимай — мама роет канавку для яиц.',
          win: 'Готово! Муссавры откладывали яйца в канавки, в два-три слоя. А рядом — гнёзда других мам.',
          colony: [[190, 0.85, 592], [1085, 0.75, 574], [420, 0.6, 556], [880, 0.5, 548]] }),
          { name: 'Общее гнездовье', note: 'В одном гнезде муссавров находили от восьми до тридцати яиц.' }),
        FIN('bg_valley', '50% 50%')],
      final: { len: '6–8 м', wt: 'до 1,5 т', say: 'Ура! Твой муссавр вырос и ходит на двух ногах! Загляни в музей.' },
    });
    jur('laquinta', {
      name: 'Лаквинтазавра', gen: 'лаквинтазавры', acc: 'лаквинтазавру', fem: true, site: 'laquinta', kind: 'Травоядная', pathBg: 'bg_run',
      hero: { name: 'Лаквинтазавра', latin: 'Laquintasaura venezuelae', period: J('≈201 млн лет назад'),
        rows: [['Длина', '≈ 1 м'], ['Рост', '25 см в бёдрах'], ['Ела', 'Папоротники'], ['Нашли', 'Венесуэла']],
        size: 'Длиной около метра — с небольшую собаку',
        desc: 'Лаквинтазавра — маленький травоядный динозавр. Жила около 201 миллиона лет назад там, где теперь Венесуэла.',
        say: 'Лаквинтазавра — первый динозавр, найденный в Венесуэле. Длиной около метра.' },
      facts: {
        head: { part: 'Зубы', text: 'Зубы у неё как листочки с зазубринками — для растений. Но кончики загнуты, как у хищников: может быть, она ловила и крупных насекомых.' },
        body: { part: 'Первая', text: 'Это первый динозавр, найденный в Венесуэле. Её кости нашли у дороги рядом с городком Ла-Грита.' },
        legs: { part: 'Ноги', text: 'Она бегала на двух длинных ногах, а ростом в бёдрах была всего двадцать пять сантиметров.' },
        tail: { part: 'Стая', text: 'Учёные нашли вместе четырёх лаквинтазавр — от трёх до двенадцати лет. Наверное, они жили небольшими стаями.' },
      },
      chapters: [EGG(['legs']),
        Object.assign(MOW(2), { name: 'Папоротники', say: 'Глава 2: щипли молодые папоротники!', facts: ['head'],
          p: { need: 14, bg: 'bg_run', plantK: 1.0, dip: 6,
            intro: ['Лаквинтазавра щиплет молодые папоротники. Держи палец на экране — малышка пойдёт вперёд и будет есть.',
              'Держи палец на экране — и щипли папоротники!'],
            first: 'Хрум! Зубки с зазубринками срезали листик.', win: 'Наелась! Зубами-листочками лаквинтазавра срезала папоротники.' } }),
        Object.assign(CHASE(3, 'it_beetle', 'жуков'), { name: 'Жуки', facts: ['body'] }),
        Object.assign(HR(RUN(4, 'nb_tachiraptor', 'тачираптор', 'тачираптора'), 1.5), { facts: ['legs'] }),
        Object.assign(HERD(5, 'laquinta', 'Лаквинтазавра', ['Это лаквинтазавра из твоей стаи!', 'Ещё одна! Лаквинтазавры жили небольшими стаями.',
          'И ещё одна! Учёные нашли вместе лаквинтазавр от трёх до двенадцати лет.', 'Ещё одна! Каждая — размером с небольшую собаку.',
          'Вот и последняя! Вся стая в сборе.'], 'bg_valley', 'найди всю свою стаю!', 'Лаквинтазавры'),
          { name: 'Стая', facts: ['tail'] }),
        FIN('bg_valley', '50% 50%')],
      final: { len: '≈ 1 м', wt: 'с небольшую собаку', wtIcon: 'star', say: 'Ура! Твоя лаквинтазавра выросла — быстрая и ловкая! Загляни в музей.' },
    });
    jur('patago', {
      name: 'Патагозавр', gen: 'патагозавра', site: 'cerrocondor', kind: 'Травоядный', pathBg: 'bg_valley',
      hero: { name: 'Патагозавр', latin: 'Patagosaurus fariasi', period: J('≈178 млн лет назад'),
        rows: [['Длина', '14–16 м'], ['Вес', '≈ 8 т'], ['Ел', 'Хвою и листья'], ['Нашли', 'Аргентина']],
        size: 'Длиной около 15 метров — как полтора автобуса',
        desc: 'Патагозавр — длинношеий великан Патагонии. Жил около 178 миллионов лет назад.',
        say: 'Патагозавр — длинношеий травоядный динозавр из Патагонии. Длиной около пятнадцати метров.' },
      facts: {
        head: { part: 'Зубы', text: 'Новый зуб у патагозавра вырастал примерно каждые два месяца — старые стирались о жёсткие растения.' },
        body: { part: 'Имя', text: '«Патагозавр» значит «ящер из Патагонии». Второе имя — в честь Рикардо Фариаса: на его земле нашли первые кости.' },
        legs: { part: 'Семья', text: 'В одном месте учёные нашли патагозавров разного возраста — от малыша до взрослого.' },
        tail: { part: 'Следы', text: 'В Патагонии есть каньон, стена которого покрыта следами длинношеих динозавров. Его так и назвали — Каньон следов.' },
      },
      chapters: [EGG(['body']),
        Object.assign(FEED(2, 'Верхушки', 'it_araucaria', 'дотянись до верхушек деревьев!'), { age: 2, facts: ['head'] }),
        Object.assign(TRACKS(3, { hunter: 'sp_eoabeli', herd: 'patago',
          rounds: [['round', 'thero'], ['thero', 'round'], ['round', 'thero'], ['thero', 'round', 'thero'], ['thero', 'thero', 'round']],
          intro: ['Малыш отстал от стада! Взрослые патагозавры оставили большие круглые следы. Нажимай на круглые следы — они приведут к стаду.',
            'Ищи большие круглые следы — они ведут к стаду!'],
          ok: 'Правильно! Это следы патагозавров. Идём дальше.',
          thero: 'Три пальца с когтями — это следы хищника эоабелизавра! Ищи большие круглые следы.',
          win: 'Ура! Следы привели к стаду. По таким следам учёные узнают, как ходили динозавры.' }), { facts: ['tail'] }),
        Object.assign(DEF(4, 'sp_eoabeli', 'эоабелизавр', 'эоабелизавра', { tip: 'Сильным хвостом длинношеие ящеры, наверное, отгоняли хищников.' }),
          { facts: ['legs'] }),
        SEEK(5, [], 'bg_valley'),
        FIN('bg_valley', '50% 50%')],
      final: { len: '14–16 м', wt: '≈ 8 т', say: 'Ура! Твой патагозавр вырос — длинношеий великан Патагонии! Загляни в музей.' },
    });
    jur('eoabeli', {
      name: 'Эоабелизавр', gen: 'эоабелизавра', site: 'cerrocondor', kind: 'Хищник', predator: true, pathBg: 'bg_valley',
      hero: { name: 'Эоабелизавр', latin: 'Eoabelisaurus mefi', period: J('≈179 млн лет назад'),
        rows: [['Длина', '6–6,5 м'], ['Руки', 'Крошечные'], ['Ел', 'Мясо'], ['Нашли', 'Аргентина']],
        size: 'Длиной около 6 метров — длиннее легковой машины',
        desc: 'Эоабелизавр — хищный динозавр с крошечными руками. Жил около 179 миллионов лет назад в Патагонии.',
        say: 'Эоабелизавр — хищник с короткой высокой головой и крошечными руками. Длиной около шести метров.' },
      facts: {
        head: { part: 'Голова', text: 'Голова у него была короткая и высокая, а зубы — острые, как ножи.' },
        legs: { part: 'Руки', text: 'Руки у него были совсем крошечные, с короткими пальцами. Наверное, охотился он зубами, а не руками.' },
        body: { part: 'Имя', text: '«Эоабелизавр» значит «ранний абелизавр». Это самый древний из абелизавров: он жил на сорок миллионов лет раньше остальных.' },
        tail: { part: 'Находка', text: 'Его почти целый скелет нашли в слоях древнего озера. Второе имя — в честь музея, где хранится его скелет.' },
      },
      chapters: [EGG(['head']),
        Object.assign(CHASE(2, 'it_mammal', 'зверьков'), { facts: ['legs'] }),
        Object.assign(STALK(3, 'nb_patagosaurus', 'молодому патагозавру', 230, 'bg_valley'), { facts: ['body'] }),
        Object.assign(SEEK(4, [], 'bg_valley'), { facts: ['tail'] }),
        NEST(5, 'bg_run', ['it_mammal', 'it_lizard']),
        FIN('bg_valley', '50% 50%')],
      final: { len: '6–6,5 м', wt: '≈ 600 кг', say: 'Ура! Твой эоабелизавр вырос — самый древний абелизавр! Загляни в музей.' },
    });
    jur('manidens', {
      name: 'Маниденс', gen: 'маниденса', site: 'cerrocondor', kind: 'Травоядный', pathBg: 'bg_forest',
      hero: { name: 'Маниденс', latin: 'Manidens condorensis', period: J('≈179 млн лет назад'),
        rows: [['Длина', '60–75 см'], ['Зубы', 'Клюв и клыки'], ['Ел', 'Растения'], ['Нашли', 'Аргентина']],
        size: 'Длиной около 70 сантиметров — с кошку',
        desc: 'Маниденс — крошечный травоядный динозавр с клювом и клыками. Жил около 179 миллионов лет назад в Патагонии.',
        say: 'Маниденс — крошечный динозавр с клювом и клыками. Длиной меньше метра.' },
      facts: {
        head: { part: 'Имя', text: '«Маниденс» значит «зуб-ладошка»: его задние зубы с зубчиками похожи на ладошку с пальцами.' },
        body: { part: 'Клыки', text: 'Спереди у него был клюв, а за ним — клыки. Зачем травоядному клыки, учёные пока спорят: может быть, для защиты.' },
        legs: { part: 'Лапы', text: 'Пальцы на задних лапах у него длинные и цепкие, как у птиц, которые сидят на ветках. Может быть, он умел забираться на поваленные деревья.' },
        tail: { part: 'Зубы', text: 'Его зубы менялись всю жизнь: на место стёршегося вырастал новый.' },
      },
      chapters: [EGG(['head']),
        Object.assign(MOW(2), { name: 'Обед', say: 'Глава 2: щипли растения клювом!', facts: ['tail'],
          p: { need: 14, bg: 'bg_run', plantK: 0.95, dip: 6,
            intro: ['Маниденс срезает листья клювом, а жуёт задними зубами-ладошками. Держи палец на экране — малыш пойдёт вперёд и будет есть.',
              'Держи палец на экране — и щипли растения!'],
            first: 'Хрум! Клювик срезал листик.', win: 'Наелся! Клювом маниденс срезал листья, а зубами-ладошками их жевал.' } }),
        Object.assign(HIDE(3, 'nb_condorraptor', 'кондорраптор', 'кондорраптора'), { facts: ['legs'] }),
        Object.assign(SEEK(4, [], 'bg_valley'), { facts: ['body'] }),
        NEST(5, 'bg_forest', ['it_lizard', 'it_mammal']),
        FIN('bg_forest', '50% 50%')],
      final: { len: '60–75 см', wt: 'с кошку', wtIcon: 'star', say: 'Ура! Твой маниденс вырос — маленький, но с клыками! Загляни в музей.' },
    });
    jur('caypulli', {
      name: 'Кайпуллизавр', gen: 'кайпуллизавра', site: 'vacamuerta', kind: 'Морской ящер', predator: true, pathBg: 'bg_sea',
      hero: { name: 'Кайпуллизавр', latin: 'Caypullisaurus bonapartei', period: J('≈150 млн лет назад'),
        rows: [['Длина', '≈ 7 м'], ['Глаза', 'Огромные'], ['Ел', 'Белемнитов и рыбу'], ['Нашли', 'Аргентина']],
        size: 'Длиной около 7 метров — как небольшой автобус',
        desc: 'Кайпуллизавр — большой ихтиозавр, похожий на дельфина. Жил около 150 миллионов лет назад в тёплом море над Патагонией.',
        say: 'Кайпуллизавр — большой ихтиозавр, похожий на дельфина. Длиной около семи метров.' },
      facts: {
        head: { part: 'Глаза', text: 'Глаза у него были огромные. Такие глаза помогали ихтиозаврам видеть в тёмной глубине.' },
        body: { part: 'Находка', text: 'Это самый целый скелет взрослого ихтиозавра юрского периода в Южной Америке. Второе имя — в честь учёного Хосе Бонапарте.' },
        fins: { part: 'Ласты', text: 'Передние ласты у него длинные. Внутри — много мелких косточек, уложенных рядами, как мозаика.' },
        tail: { part: 'Соседи', text: 'В этом море ихтиозавров находят чаще всех других морских ящеров. А рядом плавали морские крокодилы — дакозавры.' },
      },
      chapters: [BIRTH(1, ['fins']),
        Object.assign(DEEP(2, {
          intro: ['Кайпуллизавр ныряет за белемнитами. В глубине темно, но огромные глаза видят далеко. Веди пальцем вниз, а за воздухом всплывай наверх!',
            'Ныряй за белемнитами, а за воздухом всплывай наверх!'],
          down: 'Белемниты прячутся в глубине — ныряй вниз!',
          tip: 'Белемниты — родственники кальмаров. Крючочки с их щупалец находят в желудках ихтиозавров.',
          win: 'Отличная охота! Огромные глаза помогали ихтиозаврам охотиться в тёмной глубине.' }), { facts: ['head'] }),
        Object.assign(SEEK(3, [], 'bg_sea'), { facts: ['tail'] }),
        Object.assign(SEA_CALF(4, ICHTHYO_NOTE), { facts: ['body'] }),
        FIN('bg_sea', '50% 50%')],
      final: { len: '≈ 7 м', wt: 'огромные глаза', wtIcon: 'star', say: 'Ура! Твой кайпуллизавр вырос — длиной с маленький автобус! Загляни в музей.' },
    });

    /* ---------------- older animals get the new games */
    // the temnodontosaurus had the biggest eyes of any animal we know: its big hunt goes deep down
    const te = D.species.temno, ti = te ? te.chapters.findIndex((c) => (c.scene || c.id) === 'swim') : -1;
    if (ti >= 0) te.chapters[ti] = Object.assign(DEEP(ti + 1, { food: ['it_belemnite', 'it_fish'], need: 10,
      intro: ['Темнодонтозавр ныряет в глубину. Там темно, но его глаза — с футбольный мяч! Веди пальцем вниз, а за воздухом всплывай наверх!',
        'Ныряй в глубину за добычей, а за воздухом всплывай наверх!'],
      down: 'Добыча прячется в глубине — ныряй вниз!',
      win: 'Отличная охота! С такими глазами темнодонтозавр видел даже в тёмной глубине.' }), { facts: te.chapters[ti].facts });
    // the young pinacosaurus of the Gobi were found in groups of their own age, the grown-ups alone
    const pi = D.species.pinaco, pj = pi ? pi.chapters.findIndex((c) => (c.scene || c.id) === 'seek') : -1;
    if (pj >= 0) pi.chapters[pj] = Object.assign(AGEMATES(pj + 1, { id: 'pinaco', bg: 'bg_run',
      intro: ['Ты подрос! Найди своих ровесников — молодых пинакозавров твоего роста.', 'Найди своих ровесников — молодых пинакозавров!'],
      done: 'Все ровесники нашлись! Молодые пинакозавры держались группами, а взрослые жили поодиночке.',
      texts: ['Это твой ровесник! Молодые пинакозавры держались вместе.', 'Ещё один ровесник! Вместе безопаснее.',
        'И ещё один! Учёные не раз находили вместе скелеты нескольких молодых пинакозавров.', 'Ещё один! Смотри, какие шипы на спине.',
        'Ещё один ровесник! Ты почти нашёл всех.', 'Вот и последний! Вся компания в сборе.'] }), { facts: pi.chapters[pj].facts });
  },
});
