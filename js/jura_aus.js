'use strict';
/* ==================================================================== the Jurassic of Australia and Antarctica (the thirteenth wave)
   Four new dig sites: Durham Downs near Roma (Queensland), where stockmen found the rhoetosaurus in 1924 — the first dinosaur
   named in Australia; the Bringo railway cutting near Geraldton (Western Australia), where four schoolboys picked up the shin
   bone of the ozraptor in 1966; the Talbragar fish bed near Gulgong (New South Wales), a lake in a kauri-pine forest; and the
   Carapace lake beds between the lava flows of the Transantarctic Mountains. Sprites, rigs, skeletons: js/gen_cre.js;
   neighbours: img/nbatl_jur.webp. species2.js calls JURA_AUS.install() after JURA_SAM.
   New games (js/scenes9.js): «Шаг в шаг» (walk with the herd in time with the grown-ups; given to an older animal too: the
   barapasaurus of the Kota bonebed), «Отлив» (the beach between the waves), «Прыжок за мошкой» (a little lake fish leaps for
   the insects over the water), «Стайка» (keep inside the school when a predator comes). The swim game learns gills: a fish
   breathes in the water (the leedsichthys no longer goes up for air). */
const JURA_AUS = (window.JURA_AUS = {
  install(h) {
    const { D, S, add, CH, FIN, EGG } = h;
    const { SWIM, J } = JURA.kit;
    const { SEEK, NEST, DEF, CHASE, MOW } = CRETA.kit;

    /* ---------------- dig sites */
    const site = (id, o) => S(id, Object.assign({ period: 'jura' }, o));
    site('durham', { region: 'jaus', name: 'Дарем-Даунс', where: 'Квинсленд, Австралия', age: '≈160 млн лет назад', bg: 'bg_jqld_valley', pt: [1000, 545],
      fact: 'В 1924 году пастухи, собиравшие лошадей, нашли здесь огромные кости. Так нашли ретозавра — первого динозавра, получившего имя в Австралии.' });
    site('bringo', { region: 'jaus', name: 'Бринго', where: 'Западная Австралия', age: '≈170 млн лет назад', bg: 'bg_jwa_beach', pt: [918, 552],
      fact: 'Здесь, у железной дороги, четверо старшеклассников нашли кусочек кости. Через тридцать с лишним лет учёные поняли, что это кость ноги хищного динозавра.' });
    site('talbragar', { region: 'jaus', name: 'Талбрагар', where: 'Новый Южный Уэльс, Австралия', age: '≈151 млн лет назад', bg: 'bg_jtal_split', pt: [1012, 580],
      fact: 'Здесь было лесное озеро. В его камнях находят целых рыбок, насекомых, даже паука и листья хвойных деревьев.' });
    site('carapace', { region: 'jant', name: 'Озеро Карапас', where: 'Трансантарктические горы, Антарктида', age: '≈180 млн лет назад', bg: 'bg_jcar_split', pt: [836, 556],
      fact: 'Здесь, среди застывшей лавы, было озеро. Тогда в Антарктиде не было льда, а в озере жили рыбки, рачки и личинки насекомых.' });
    D.regions.jaus.sites.push('durham', 'bringo', 'talbragar');
    D.regions.jaus.view = { c: [966, 552], z: 2.6 };
    D.regions.jant.sites.push('carapace');
    // pictures of their own: the araucaria forests of Queensland (the siderops of Queensland gets them too), the sandy coast of
    // Western Australia, the Talbragar lake in its kauri forest, the lake among the lava of Antarctica (above and under the water)
    const QLD = { bg_run: 'bg_jqld_run', bg_forest: 'bg_jqld_forest', bg_valley: 'bg_jqld_valley', bg_mud: 'bg_jqld_valley', bg_hide: 'bg_jqld_forest' };
    Object.assign(G.RBGS, {
      durham: QLD, queensland: Object.assign({}, QLD, { bg_sea: 'bg_jtal_lake' }),
      bringo: { bg_run: 'bg_jwa_run', bg_forest: 'bg_jqld_forest', bg_valley: 'bg_jwa_run', bg_mud: 'bg_jwa_run', bg_hide: 'bg_jqld_forest' },
      talbragar: { bg_sea: 'bg_jtal_lake', bg_valley: 'bg_jtal_split', bg_run: 'bg_jtal_split', bg_forest: 'bg_jtal_split' },
      carapace: { bg_sea: 'bg_jcar_lake', bg_valley: 'bg_jcar_split', bg_run: 'bg_jcar_split', bg_forest: 'bg_jcar_split' },
    });
    if (D.sites.queensland) D.sites.queensland.bg = 'bg_jqld_valley';
    // the Siderops pin moves up a little: Durham Downs is just south of it and its label must stay readable
    if (D.sites.queensland) D.sites.queensland.pt = [1013, 506];

    /* ---------------- the local fauna */
    D.jnb = (D.jnb || []).concat([
      { key: 'jqtheropod', name: 'Хищник-великан',
        text: 'Это огромный хищный динозавр. Его костей пока не нашли — о нём рассказывают только огромные следы.' },
      { key: 'archaeomaene', name: 'Археомена', place: 'sea',
        text: 'Это археомена — рыба с круглой головой. Её родственников находят почти только в Австралии, а одного — в Антарктиде.' },
      { key: 'aetheolepis', name: 'Этеолепис', place: 'sea', text: 'Это этеолепис — высокая рыба в толстой блестящей чешуе.' },
      { key: 'cacatualepis', name: 'Кокколепис', place: 'sea', text: 'Это кокколепис — рыба в толстой чешуе, с хвостом, как у акулы.' },
      { key: 'hybodont', name: 'Пресноводная акула', place: 'sea',
        text: 'Это небольшая акула. В этом озере нашли и её остатки: акулы тогда жили не только в морях, но и в реках и озёрах.' },
      { key: 'dragonnymph', name: 'Личинка стрекозы', place: 'sea',
        text: 'Это личинка стрекозы. Она живёт в воде и подстерегает добычу среди водорослей. Вырастет — станет стрекозой.' },
    ]);
    D.itemInfo = Object.assign(D.itemInfo || {}, {
      it_midge: { name: 'Мошки', text: 'Это мошки-звонцы. Их личинки живут в воде, а взрослые вылетают из неё. Таких мошек нашли в камнях Талбрагара.' },
      it_mayfly: { name: 'Подёнки', text: 'Это подёнка. Её личинки живут в воде, а взрослая подёнка живёт совсем недолго.' },
      it_clamshrimp: { name: 'Раковинные рачки', text: 'Это крошечные рачки в раковинке из двух створок, как у ракушки. В камнях этого озера их очень много.' },
      it_triops: { name: 'Щитни', text: 'Это щитни — рачки с широким панцирем-щитом. Они живут и сегодня — почти такие же, как во времена динозавров.' },
      it_spider: { name: 'Паук', text: 'Это паук. Его родственника нашли в камнях Талбрагара — редкая удача: пауки сохраняются очень редко.' },
      it_bigtrack: { name: 'Следы великана', text: 'Это следы огромного хищника — длиной почти 80 сантиметров! Их нашли в потолках угольных шахт Квинсленда.' },
    });
    D.zoneInfo = Object.assign(D.zoneInfo || {}, {
      // the herd of the rhoetosaurus: three lines in the order they are found
      'rhoeto#1': { name: 'Ретозавр', text: 'Это ретозавр из твоего стада!' },
      'rhoeto#2': { name: 'Ретозавр', text: 'Ещё один! Наверное, длинношеие ходили стадами — так безопаснее.' },
      'rhoeto#3': { name: 'Ретозавр', text: 'И ещё один — совсем молодой, как ты. Всё стадо в сборе!' },
      'rhoeto#wa': { name: 'Длинношеий динозавр', text: 'Это длинношеий динозавр. Неподалёку нашли его позвонок — похожий на позвонок ретозавра.' },
      'plesio#wa': { name: 'Плезиозавр', text: 'Это плезиозавр — морской ящер с длинной шеей. Его позвонок нашли в тех же камнях, что и кость озраптора.' },
      'it_logsolid#drift': { name: 'Плавник', text: 'Это плавник — стволы деревьев, которые море выбросило на берег. В камнях Бринго очень много окаменевшего дерева.' },
      'it_dragonfly#car': { name: 'Стрекоза', text: 'Это стрекоза. Её родственницу нашли в камнях этого озера и назвали карафлебией.' },
      'it_mayfly#nymph': { name: 'Личинки подёнок', text: 'Это личинки подёнок. Они живут на камнях под водой — их тоже нашли в этом озере.' },
    });
    Object.assign(AU.VOICES, {
      rhoeto: ['boom_giant', 1.05], ozraptor: ['roar_small', 1.2], cavender: ['call_sea', 2.3], oreochima: ['call_sea', 2.5],
      nb_jqtheropod: ['roar_big', 0.9], nb_hybodont: ['hiss_croc', 0.7],
    });

    /* ---------------- the games */
    const STRIDE = (n, o) => CH(n, 'stride', 'Шаг в шаг', 2, { scene: 'stride', bg: 'bg_run', pos: '50% 70%', size: '240%',
      say: `Глава ${n}: шагай в ногу со стадом!`, p: Object.assign({ need: 16, bg: 'bg_run' }, o) });
    const LEAP = (n, o) => CH(n, 'leap', o.name || 'Прыжок за мошкой', 2, { scene: 'leap', bg: o.bg, pos: '50% 45%', size: '200%',
      say: `Глава ${n}: ${o.say}`, p: Object.assign({ need: 8, wl: 350 }, o) });
    const SCHOOL = (n, o) => CH(n, 'school', 'Стайка', 2, { scene: 'school', bg: o.bg, pos: '50% 55%', size: '200%',
      say: `Глава ${n}: ${o.say}`, p: Object.assign({ need: 5 }, o) });
    // a fish's swim: no air to fetch
    const FISHSWIM = (n, name, o) => Object.assign(SWIM(n, name, o.food, o.need, o.say), { p: Object.assign({ gills: true }, o) });

    /* ---------------- the animals */
    const jur = (id, o) => add(id, Object.assign({ period: 'jura', pathBg: 'bg_valley' }, o));
    jur('rhoeto', {
      name: 'Ретозавр', gen: 'ретозавра', site: 'durham', kind: 'Травоядный', pathBg: 'bg_run',
      hero: { name: 'Ретозавр', latin: 'Rhoetosaurus brownei', period: J('≈160 млн лет назад'),
        rows: [['Длина', '≈ 15 м'], ['Вес', '≈ 9 т'], ['Ел', 'Растения'], ['Нашли', 'Австралия']],
        size: 'Длиной около 15 метров — как полтора автобуса',
        desc: 'Ретозавр — длинношеий травоядный динозавр. Жил около 160 миллионов лет назад в Австралии.',
        say: 'Ретозавр — длинношеий великан из Австралии. Длина около пятнадцати метров.' },
      facts: {
        body: { part: 'Находка', text: 'В 1924 году его кости нашли пастухи, собиравшие лошадей. Это первый динозавр, получивший имя в Австралии.' },
        legs: { part: 'Ступня', text: 'На задней ступне у ретозавра было четыре пальца с когтями — больше, чем у его поздних родственников. Стоял он почти на цыпочках, а под пяткой была мягкая подушка — как у слона.' },
        head: { part: 'Имя', text: '«Ретозавр» значит «ящер Рета» — так звали великана из греческих мифов. Второе имя — в честь Артура Брауна: он управлял фермой, где нашли кости.' },
        tail: { part: 'Загадка', text: 'Черепа и передних ног ретозавра пока не нашли. А часть его костей до сих пор в камне — учёные их ещё освобождают.' },
      },
      chapters: [EGG(['body']),
        Object.assign(MOW(2), { age: 2, name: 'Папоротники', say: 'Глава 2: щипли папоротники!', facts: ['legs'],
          p: { need: 14, bg: 'bg_run', plantK: 1.05, dip: 8,
            intro: ['Молодой ретозавр щиплет низкие папоротники. Держи палец на экране — он пойдёт вперёд и будет есть.', 'Держи палец на экране — и щипли папоротники!'],
            first: 'Хрум! Мягкий папоротник.', win: 'Наелся! В лесах Квинсленда росли папоротники, саговники и высокие хвойные деревья.' } }),
        Object.assign(STRIDE(3, {
          intro: ['Стадо ретозавров идёт к новым пастбищам. Нажимай, когда кружок у ноги станет золотым, — и шагай в ногу со взрослыми!', 'Нажимай, когда кружок станет золотым!'],
          win: 'Дошли! Учёные посчитали по костям ног: за день ретозавр мог пройти двадцать или даже тридцать километров.' }), { facts: ['head'] }),
        Object.assign(SEEK(4, [], 'bg_valley'), { facts: ['tail'] }),
        DEF(5, 'nb_jqtheropod', 'хищник-великан', 'хищника-великана', { tip: 'Может быть, длинношеие отгоняли хищников ударом тяжёлого хвоста.' }),
        FIN('bg_valley', '50% 50%')],
      final: { len: '≈ 15 м', wt: '≈ 9 т', say: 'Ура! Твой ретозавр вырос — длинношеий великан Австралии! Загляни в музей.' },
    });
    jur('ozraptor', {
      name: 'Озраптор', gen: 'озраптора', site: 'bringo', kind: 'Хищник', predator: true, pathBg: 'bg_run',
      hero: { name: 'Озраптор', latin: 'Ozraptor subotaii', period: J('≈170 млн лет назад'),
        rows: [['Длина', '1,6–2 м'], ['Ел', 'Мясо'], ['Кость', 'Одна'], ['Нашли', 'Австралия']],
        size: 'Длиной около 2 метров — как взрослый человек',
        desc: 'Озраптор — небольшой хищный динозавр. Жил около 170 миллионов лет назад в Австралии.',
        say: 'Озраптор — небольшой хищник из Западной Австралии. Длина около двух метров.' },
      facts: {
        head: { part: 'Имя', text: '«Озраптор» значит «похититель из Оз» — так шутливо называют Австралию. А второе имя ему дали в честь Суботая — быстрого и ловкого лучника из одного фильма.' },
        legs: { part: 'Кость', text: 'От озраптора нашли только нижний конец голени. По этой кости учёные поняли, что это быстрый хищный динозавр.' },
        body: { part: 'Находка', text: 'Кость нашли в 1966 году четверо старшеклассников. Сначала её приняли за кость черепахи. Это первая кость хищного динозавра юрского периода из Австралии.' },
        tail: { part: 'Загадка', text: 'Как выглядел озраптор целиком, пока догадка: художники рисуют его по родственникам — хищникам той поры.' },
      },
      chapters: [EGG(['head']),
        Object.assign(CHASE(2, 'it_lizard', 'ящериц'), { facts: ['legs'] }),
        CH(3, 'tide', 'Отлив', 2, { scene: 'tide', bg: 'bg_jwa_beach', pos: '50% 70%', size: '240%', say: 'Глава 3: собирай на берегу, что выбросило море!', facts: ['body'],
          p: { need: 8, bg: 'bg_jwa_beach', food: ['it_fish', 'it_belemnite'],
            intro: ['Море выбросило на берег рыбу и белемнитов. Нажимай на находки — и собирай их! А когда идёт большая волна — беги на сухой песок.', 'Нажимай на находки на песке!'],
            win: 'Наелся! Может быть, такие хищники бродили по берегу и подбирали то, что выбросило море.' } }),
        Object.assign(SEEK(4, [], 'bg_valley'), { facts: ['tail'] }),
        NEST(5, 'bg_run', ['it_lizard', 'it_mammal']),
        FIN('bg_valley', '50% 50%')],
      skelSay: 'Это скелет озраптора — каким его представляют учёные. Нашли пока только одну его кость.',
      final: { len: '1,6–2 м', wt: 'одна кость', wtIcon: 'bone', say: 'Ура! Твой озраптор вырос — быстрый хищник из страны Оз! Загляни в музей.' },
    });
    jur('cavender', {
      name: 'Кавендерихтис', gen: 'кавендерихтиса', site: 'talbragar', kind: 'Рыба', pathBg: 'bg_sea',
      hero: { name: 'Кавендерихтис', latin: 'Cavenderichthys talbragarensis', period: J('≈151 млн лет назад'),
        rows: [['Длина', '4–8 см'], ['Кто', 'Рыба'], ['Жил', 'В озере'], ['Нашли', 'Австралия']],
        size: 'Длиной с палец',
        desc: 'Кавендерихтис — маленькая озёрная рыбка. Жил около 151 миллиона лет назад в Австралии.',
        say: 'Кавендерихтис — маленькая рыбка из древнего озера в Австралии. Длиной с палец.' },
      facts: {
        head: { part: 'Находка', text: 'Это самая частая рыба Талбрагара: в одном камне находят сразу много рыбок.' },
        body: { part: 'Родня', text: 'Кавендерихтис — древний родственник сегодняшних костистых рыб: селёдок, карпов и окуней.' },
        tail: { part: 'Озеро', text: 'Озеро окружал лес из хвойных деревьев, похожих на сегодняшнюю каури. Их листья тоже нашли в камнях.' },
        fins: { part: 'Имя', text: 'Второе имя — в честь места Талбрагар. Первые рыбки отсюда попали к учёным больше ста лет назад.' },
      },
      factOrder: ['head', 'body', 'tail', 'fins'],
      chapters: [
        FISHSWIM(1, 'Первая охота', { food: ['it_shrimp'], need: 10, bg: 'bg_jtal_lake', say: 'лови крошечных рачков!',
          intro: ['Малёк кавендерихтиса охотится на крошечных рачков. Веди пальцем вверх и вниз — рыбка поплывёт за ним.', 'Веди пальцем — и лови рачков!'],
          win: 'Наелся! Маленькие рыбки, наверное, ели крошечных рачков и личинок насекомых.' }),
        Object.assign(LEAP(2, { bg: 'bg_jtal_split', bug: 'it_midge', say: 'выпрыгивай из воды за мошками!',
          intro: ['Над озером кружат мошки. Когда мошка спустится к воде и вокруг неё загорится кружок — нажимай: рыбка выпрыгнет и схватит её!', 'Когда загорится кружок — нажимай!'],
          first: 'Поймал! Ам!', win: 'Наелся! Мошки-звонцы, наверное, вылетали из озера тучами — рыбкам было чем поживиться.' }), { facts: ['head'] }),
        Object.assign(SCHOOL(3, { bg: 'bg_jtal_lake', pred: 'nb_hybodont', from: 'side', pw: 440, say: 'держись в стайке, когда приплывёт акула!',
          intro: ['Веди пальцем — и держись в стайке! Когда приплывёт акула, спрячься в середине, среди других рыбок.', 'Веди пальцем — и держись в стайке!'],
          alarm: 'Акула! Скорее в стайку — в самую середину!', safeTip: 'Ты в стайке! Акула не смогла выбрать, за кем гнаться.',
          hitTip: 'Ой! Акула чуть не поймала тебя. Держись в середине стайки!' }), { facts: ['tail'] }),
        Object.assign(SEEK(4, [], 'bg_jtal_lake'), { facts: ['fins'] }),
        FIN('bg_jtal_lake', '50% 50%')],
      final: { len: '4–8 см', wt: 'с палец', wtIcon: 'fish', say: 'Ура! Твой кавендерихтис вырос — быстрая озёрная рыбка! Загляни в музей.' },
    });
    jur('oreochima', {
      name: 'Ореохима', gen: 'ореохимы', acc: 'ореохиму', fem: true, site: 'carapace', kind: 'Рыба', pathBg: 'bg_sea',
      hero: { name: 'Ореохима', latin: 'Oreochima ellioti', period: J('≈180 млн лет назад'),
        rows: [['Длина', '≈ 6 см'], ['Кто', 'Рыба'], ['Жила', 'В озере'], ['Нашли', 'Антарктида']],
        size: 'Длиной с мизинец',
        desc: 'Ореохима — маленькая рыбка из озера, которое было в Антарктиде. Жила около 180 миллионов лет назад.',
        say: 'Ореохима — маленькая рыбка из Антарктиды. Длиной с мизинец.' },
      facts: {
        head: { part: 'Антарктида', text: 'Тогда Антарктида не была покрыта льдом: там росли леса, а в озёрах плавали рыбы.' },
        body: { part: 'Озеро', text: 'Озеро было среди застывшей лавы, и в него, наверное, текли горячие источники. В его камнях нашли рачков, подёнок и стрекозу.' },
        tail: { part: 'Родня', text: 'Её родственников находят в Австралии: тогда Австралия и Антарктида были одним материком.' },
        fins: { part: 'Рост', text: 'Ореохима была длиной всего шесть сантиметров — с мизинец. Тело покрывала блестящая чешуя.' },
      },
      factOrder: ['head', 'body', 'tail', 'fins'],
      chapters: [
        FISHSWIM(1, 'Рачки', { food: ['it_clamshrimp'], need: 10, bg: 'bg_jcar_lake', say: 'лови раковинных рачков!',
          intro: ['Малёк ореохимы охотится на крошечных рачков. Веди пальцем вверх и вниз — рыбка поплывёт за ним.', 'Веди пальцем — и лови рачков!'],
          win: 'Наелась! Раковинных рачков в этом озере было очень много.' }),
        Object.assign(LEAP(2, { name: 'Прыжок за подёнкой', bg: 'bg_jcar_split', bug: 'it_mayfly', bw: 92, say: 'выпрыгивай из воды за подёнками!',
          intro: ['Над озером танцуют подёнки. Когда подёнка спустится к воде и вокруг неё загорится кружок — нажимай: рыбка выпрыгнет и схватит её!', 'Когда загорится кружок — нажимай!'],
          first: 'Поймала! Ам!', high: 'Высоко! Жди, пока подёнка спустится к самой воде, — вокруг неё загорится кружок.',
          win: 'Наелась! Подёнки вылетали из воды, и рыбки ловили их прямо в воздухе.' }), { facts: ['head'] }),
        Object.assign(SCHOOL(3, { bg: 'bg_jcar_lake', pred: 'nb_dragonnymph', from: 'bottom', pw: 300, say: 'держись в стайке!',
          intro: ['Веди пальцем — и держись в стайке! Среди водорослей прячется личинка стрекозы. Когда она бросится, будь в середине стайки.', 'Веди пальцем — и держись в стайке!'],
          alarm: 'Личинка стрекозы! Скорее в стайку — в самую середину!', safeTip: 'Ты в стайке! Личинка не смогла выбрать, кого схватить.',
          hitTip: 'Ой! Личинка чуть не схватила тебя. Держись в середине стайки!',
          win: 'Молодец! Личинки стрекоз охотятся на мальков, а в стайке малькам безопаснее.' }), { facts: ['tail'] }),
        Object.assign(SEEK(4, [], 'bg_jcar_lake'), { facts: ['fins'] }),
        FIN('bg_jcar_lake', '50% 50%')],
      final: { len: '≈ 6 см', wt: 'с мизинец', wtIcon: 'fish', say: 'Ура! Твоя ореохима выросла — маленькая рыбка из Антарктиды! Загляни в музей.' },
    });

    /* ---------------- older animals get the new games */
    // the barapasaurus of the Kota bonebed (six animals of different ages in one place) walks with its herd
    const ba = D.species.barapa;
    if (ba) {
      const fi = ba.chapters.findIndex((c) => c.id === 'final');
      ba.chapters.splice(Math.max(1, fi - 1), 0, Object.assign(STRIDE(4, {
        intro: ['Стадо барапазавров идёт к реке. Нажимай, когда кружок у ноги станет золотым, — и шагай в ногу со взрослыми!', 'Нажимай, когда кружок станет золотым!'],
        win: 'Дошли! Длинношеие великаны много ходили: за день стадо проходило большой путь.' }), {}));
    }
    // the leedsichthys is a fish: it breathes in the water
    const le = D.species.leeds;
    if (le) {
      const c = le.chapters.find((q) => q.scene === 'swim');
      if (c) {
        c.say = c.say.replace(' Не забывай всплывать.', '');
        c.p = Object.assign({}, c.p, { gills: true, intro: ['Лидсихтис плывёт с открытым ртом и цедит рачков, как кит. Веди пальцем вверх и вниз — и глотай рачков!', 'Веди пальцем — и глотай рачков!'] });
      }
    }
  },
});
