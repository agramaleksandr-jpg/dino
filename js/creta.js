'use strict';
/* ==================================================================== the Cretaceous period: its map, ten dig sites, ten animals and the local fauna
   (sprites, rigs, skeleton pieces, neighbours, silhouettes: js/gen_cre.js from tools/auto_species.py · neighbours.py · gen_cre.py).
   species2.js calls CRETA.install() right after JURA.install(), so the Cretaceous animals go through the same steps
   (each mini-game once, facts spread over the chapters, lock texts). Four games are new here (js/scenes7.js):
   smell (a young tyrannosaur finds its prey by smell), duel (two triceratopses push with their horns),
   calls (a parasaurolophus repeats the call of its herd), thermal (a pteranodon soars on warm air under the clouds). */
const CRETA = (window.CRETA = {
  install(h) {
    const { D, S, add, CH, FIN, EGG } = h;

    /* ---------------- the period */
    D.periods.creta = { id: 'creta', name: 'Меловой период', gen: 'мела', years: '145–66 млн лет назад', map: 'bg_map_cre_hd',
      intro: 'Меловой период — последнее время динозавров. Материки уже похожи на нынешние, а Северную Америку делит море. Нажми на материк — посмотрим, где копать!' };
    D.periodOrder = ['trias', 'jura', 'creta'];

    /* ---------------- dig sites (one animal each for a start) */
    const site = (id, o) => S(id, Object.assign({ period: 'creta' }, o));
    site('hellcreek', { name: 'Хелл-Крик', where: 'Монтана, США', region: 'cnam', age: '≈67 млн лет назад', bg: 'bg_cnam_valley', pt: [272, 128],
      fact: 'В 1902 году Барнум Браун нашёл здесь скелет, по которому учёные впервые описали тираннозавра.' });
    site('lancecreek', { name: 'Ланс-Крик', where: 'Вайоминг, США', region: 'cnam', age: '≈67 млн лет назад', bg: 'bg_cnam_run', pt: [262, 162],
      fact: 'Здесь, в Вайоминге, Джон Хэтчер за три года откопал больше тридцати черепов трицератопсов.' });
    site('dinopark', { name: 'Парк динозавров', where: 'Альберта, Канада', region: 'cnam', age: '≈76 млн лет назад', bg: 'bg_cnam_forest', pt: [250, 92],
      fact: 'В этих оврагах нашли кости десятков видов динозавров. Это место охраняет ЮНЕСКО.' });
    site('niobrara', { name: 'Ниобрара', where: 'Канзас, США', region: 'cnam', age: '≈85 млн лет назад', bg: 'bg_clagoon', pt: [318, 196],
      fact: 'Здесь было море, которое делило Северную Америку надвое. В его белом мелу находят кости птеранодонов и морских ящеров.' });
    site('flamingcliffs', { name: 'Огненные скалы', where: 'Гоби, Монголия', region: 'casia', age: '≈75 млн лет назад', bg: 'bg_casia_run', pt: [1006, 128],
      fact: 'В 1923 году экспедиция Роя Эндрюса нашла здесь первые гнёзда с яйцами динозавров и первый череп велоцираптора.' });
    site('liaoning', { name: 'Ляонин', where: 'Китай', region: 'casia', age: '≈125–120 млн лет назад', bg: 'bg_casia_forest', pt: [1092, 152],
      fact: 'Здесь были озёра у вулканов. Тонкий вулканический пепел сохранил даже перья динозавров.' });
    site('kemkem', { name: 'Кем-Кем', where: 'Марокко', region: 'cafr', age: '≈95 млн лет назад', bg: 'bg_cafr_valley', pt: [540, 232],
      fact: 'Здесь текли огромные реки. В них жили рыбы длиной с автомобиль, а на берегах охотились спинозавры.' });
    site('neuquen', { name: 'Неукен', where: 'Патагония, Аргентина', region: 'csam', age: '≈94 млн лет назад', bg: 'bg_csam_valley', pt: [408, 472],
      fact: 'В Патагонии нашли кости самых больших динозавров. А неподалёку — огромное гнездовье, где лежали тысячи яиц.' });
    site('bernissart', { name: 'Берниссар', where: 'Бельгия', region: 'ceur', age: '≈125 млн лет назад', bg: 'bg_ceur_forest', pt: [604, 136],
      fact: 'В 1878 году шахтёры нашли здесь, на глубине 322 метров, почти тридцать скелетов игуанодонов.' });
    site('maastricht', { name: 'Маастрихт', where: 'Нидерланды', region: 'ceur', age: '≈67 млн лет назад', bg: 'bg_csea', pt: [654, 106],
      fact: 'Здесь, в меловой горе у реки Маас, нашли первые черепа мозазавра. Его имя значит «ящер с реки Маас».' });

    /* ---------------- the Cretaceous map: the continents are almost where they are now, a sea splits North America */
    const R = (id, o) => { D.regions[id] = Object.assign({ id, period: 'creta' }, o); };
    R('cnam', { name: 'Северная Америка', map: [286, 150], sites: ['hellcreek', 'lancecreek', 'dinopark', 'niobrara'], sil: 'trex', view: { c: [286, 146], z: 2.6 } });
    R('ceur', { name: 'Европа', map: [660, 150], sites: ['bernissart', 'maastricht'], sil: 'iguano', view: { c: [636, 120], z: 2.8 } });
    R('casia', { name: 'Азия', map: [1040, 170], sites: ['flamingcliffs', 'liaoning'], sil: 'velo', view: { c: [1050, 140], z: 2.4 } });
    R('cafr', { name: 'Африка', map: [624, 330], sites: ['kemkem'], sil: 'spino', view: { c: [560, 250], z: 2.4 } });
    R('csam', { name: 'Южная Америка', map: [440, 380], sites: ['neuquen'], sil: 'argento', view: { c: [420, 450], z: 2.3 } });

    /* ---------------- regional pictures (G.rbg). Asia: dunes of the Gobi to run on, the forest and the lake of Liaoning;
       Africa: the sea of the river animals is the river itself */
    const RB = (k) => ({ bg_run: `bg_${k}_run`, bg_forest: `bg_${k}_forest`, bg_valley: `bg_${k}_valley`, bg_mud: `bg_${k}_run`, bg_hide: `bg_${k}_forest` });
    Object.assign(G.RBG, {
      cnam: Object.assign(RB('cnam'), { bg_lagoon: 'bg_clagoon', bg_sea: 'bg_csea' }),
      ceur: Object.assign(RB('ceur'), { bg_lagoon: 'bg_clagoon', bg_sea: 'bg_csea' }),
      casia: Object.assign(RB('casia'), { bg_lagoon: 'bg_casia_valley', bg_sea: 'bg_csea' }),
      cafr: Object.assign(RB('cafr'), { bg_lagoon: 'bg_cafr_valley', bg_sea: 'bg_criver' }),
      csam: RB('csam'),
    });

    /* ---------------- the local fauna: the painted neighbours of the "Соседи" scenes and the hunters */
    D.cnb = [
      { key: 'edmontosaurus', name: 'Эдмонтозавр', text: 'Это эдмонтозавр — большой утконосый динозавр. Во рту у него были сотни зубов для жёстких растений.' },
      { key: 'ankylosaurus', name: 'Анкилозавр', text: 'Это анкилозавр — динозавр в костяной броне с тяжёлой булавой на конце хвоста.' },
      { key: 'pachycephalosaurus', name: 'Пахицефалозавр', text: 'Это пахицефалозавр. Макушка у него — толстый костяной купол, как шлем.' },
      { key: 'thescelosaurus', name: 'Тесцелозавр', text: 'Это тесцелозавр — небольшой быстрый травоядный динозавр.' },
      { key: 'leptoceratops', name: 'Лептоцератопс', text: 'Это лептоцератопс — маленький родственник трицератопса, совсем без рогов.' },
      { key: 'ornithomimus', name: 'Орнитомим', text: 'Это орнитомим — динозавр, похожий на страуса. Он быстро бегал и был покрыт перьями.' },
      { key: 'corythosaurus', name: 'Коритозавр', text: 'Это коритозавр — утконосый динозавр с гребнем, похожим на шлем.' },
      { key: 'styracosaurus', name: 'Стиракозавр', text: 'Это стиракозавр — рогатый динозавр с длинными шипами на воротнике.' },
      { key: 'euoplocephalus', name: 'Эуоплоцефал', text: 'Это эуоплоцефал — динозавр в броне. Даже веки у него были костяные!' },
      { key: 'gorgosaurus', name: 'Горгозавр', text: 'Это горгозавр — хищник, родственник тираннозавра, только поменьше.' },
      { key: 'tylosaurus', name: 'Тилозавр', text: 'Это тилозавр — огромный морской ящер, родственник мозазавра.', place: 'sea' },
      { key: 'hesperornis', name: 'Гесперорнис', text: 'Это гесперорнис — древняя птица. Летать она не умела, зато отлично ныряла.', place: 'sea' },
      { key: 'xiphactinus', name: 'Ксифактинус', text: 'Это ксифактинус — огромная зубастая рыба длиной с лодку.', place: 'sea' },
      { key: 'protoceratops', name: 'Протоцератопс', text: 'Это протоцератопс — небольшой родственник трицератопса с клювом и воротником.' },
      { key: 'oviraptor', name: 'Овираптор', text: 'Это овираптор. Его считали похитителем яиц, а оказалось — он высиживал свои!' },
      { key: 'pinacosaurus', name: 'Пинакозавр', text: 'Это пинакозавр — динозавр в броне. Учёные нашли целую группу его малышей.' },
      { key: 'sinosauropteryx', name: 'Синозавроптерикс', text: 'Это синозавроптерикс — первый динозавр, у которого нашли перья. Хвост у него был полосатый!' },
      { key: 'confuciusornis', name: 'Конфуциусорнис', text: 'Это конфуциусорнис — одна из первых птиц с клювом без зубов.', place: 'air' },
      { key: 'psittacosaurus', name: 'Пситтакозавр', text: 'Это пситтакозавр — небольшой динозавр с клювом, как у попугая.' },
      { key: 'carcharodontosaurus', name: 'Кархародонтозавр', text: 'Это кархародонтозавр — огромный хищник. Его зубы похожи на зубы большой белой акулы.' },
      { key: 'onchopristis', name: 'Онхопристис', text: 'Это онхопристис — огромная рыба-пила. Нос у неё длинный и с зубцами, как пила.', place: 'sea' },
      { key: 'alanqa', name: 'Аланка', text: 'Это аланка — летающий ящер с длинным острым клювом.', place: 'air' },
      { key: 'mapusaurus', name: 'Мапузавр', text: 'Это мапузавр — огромный хищник. Его кости нашли целой группой — может быть, они охотились вместе.' },
      { key: 'skorpiovenator', name: 'Скорпиовенатор', text: 'Это скорпиовенатор — хищник с короткой мордой. Его назвали «охотник на скорпионов»: там, где его нашли, их было очень много.' },
      { key: 'cathartesaura', name: 'Катартезавра', text: 'Это катартезавра — длинношеий травоядный динозавр. Её нашли там, где гнездятся грифы, и назвали «ящерица-гриф».' },
      { key: 'mantellisaurus', name: 'Мантеллизавр', text: 'Это мантеллизавр — родственник игуанодона, только поменьше. Его назвали в честь учёного Гидеона Мантелла.' },
      { key: 'bernissartia', name: 'Бернисартия', text: 'Это бернисартия — маленький крокодильчик, меньше метра длиной.' },
      { key: 'baryonyx', name: 'Барионикс', text: 'Это барионикс — хищник с длинной мордой и огромным когтем. Он жил в то же время неподалёку, в Англии, и ловил рыбу.' },
      { key: 'prognathodon', name: 'Прогнатодон', text: 'Это прогнатодон — морской ящер с мощными челюстями. Он мог раскусить даже панцирь черепахи.', place: 'sea' },
      { key: 'allopleuron', name: 'Аллоплеврон', text: 'Это аллоплеврон — большая морская черепаха.', place: 'sea' },
      { key: 'squalicorax', name: 'Скваликоракс', text: 'Это скваликоракс — древняя акула. Её зубы в этих камнях находят очень часто.', place: 'sea' },
    ];
    const NB = (...keys) => keys.map((k) => 'nb_' + k);
    Object.assign(AU.VOICES, {
      trex: ['roar_big', 0.8], trike: ['grunt_herb', 0.85], parasaur: ['boom_giant', 1.2], iguano: ['grunt_herb', 1.0], spino: ['roar_big', 0.9],
      argento: ['boom_giant', 0.72], velo: ['roar_small', 1.1], mosa: ['call_sea', 0.7], micro: ['chirp_bird', 1.05], pteran: ['screech_ptero', 0.9],
      nb_edmontosaurus: ['grunt_herb', 0.95], nb_ankylosaurus: ['snort_beast', 0.85], nb_pachycephalosaurus: ['grunt_herb', 1.15], nb_thescelosaurus: ['grunt_herb', 1.3],
      nb_leptoceratops: ['grunt_herb', 1.35], nb_ornithomimus: ['chirp_bird', 0.9], nb_corythosaurus: ['boom_giant', 1.2], nb_styracosaurus: ['snort_beast', 0.9],
      nb_euoplocephalus: ['snort_beast', 0.85], nb_gorgosaurus: ['roar_big', 0.95], nb_tylosaurus: ['call_sea', 0.75], nb_hesperornis: ['chirp_bird', 0.85],
      nb_xiphactinus: ['call_sea', 1.1], nb_protoceratops: ['grunt_herb', 1.2], nb_oviraptor: ['chirp_bird', 0.85], nb_pinacosaurus: ['snort_beast', 1.0],
      nb_sinosauropteryx: ['roar_small', 1.4], nb_confuciusornis: ['chirp_bird', 1.2], nb_psittacosaurus: ['grunt_herb', 1.3], nb_carcharodontosaurus: ['roar_big', 0.85],
      nb_onchopristis: ['call_sea', 1.2], nb_alanqa: ['screech_ptero', 1.05], nb_mapusaurus: ['roar_big', 0.9], nb_skorpiovenator: ['roar_big', 1.1],
      nb_cathartesaura: ['boom_giant', 1.0], nb_mantellisaurus: ['grunt_herb', 1.05], nb_bernissartia: ['hiss_croc', 1.4], nb_baryonyx: ['roar_big', 1.0],
      nb_prognathodon: ['call_sea', 0.85], nb_allopleuron: ['hiss_croc', 1.1], nb_squalicorax: ['call_sea', 1.3],
    });

    /* ---------------- chapters */
    const K = (s) => `Меловой период · ${s}`;
    const SEEK = (n, who, bg) => CH(n, 'seek', 'Соседи', 2, { scene: 'seek', p: { who, bg }, bg, pos: '50% 70%', size: '240%', say: `Глава ${n}: найди, кто ещё жил рядом!` });
    const NEST = (n, bg, foes, note) => CH(n, 'guard', 'Своё гнездо', 3, { scene: 'guard', p: Object.assign({ bg }, foes ? { foes } : {}), bg: 'bg_nest', pos: '50% 55%', size: '200%',
      say: `Глава ${n}: теперь у тебя своё гнездо — прогони воришек!`,
      note: note || 'Крокодилы и птицы — родственники динозавров — охраняют свои гнёзда. Наверное, многие древние ящеры тоже так делали.' });
    const DEF = (n, hunter, name, gen, o) => CH(n, 'defend', 'Отпор', 2, { scene: 'defend', p: Object.assign({ hunter, hunterName: name, bg: 'bg_run' }, o), bg: 'bg_run', pos: '50% 70%', size: '240%',
      say: `Глава ${n}: отбейся хвостом от ${gen}!` });
    // heavy animals do not jump over logs: they break through the thickets (Scenes.escape, p.ram)
    const RAM = (n, hunter, name, gen, note) => CH(n, 'escape', 'Напролом', 2, { scene: 'escape', p: { hunter, hunterName: name, bg: 'bg_run', ram: true }, bg: 'bg_run', pos: '50% 70%', size: '240%',
      say: `Глава ${n}: убегай от ${gen} напролом через заросли!`, note });
    const CHASE = (n, prey, many, bg) => CH(n, 'chase', 'Погоня', 2, { scene: 'chase', p: { prey, need: 6, bg: bg || 'bg_run' }, bg: bg || 'bg_run', pos: '50% 60%', size: '240%',
      say: `Глава ${n}: догони и поймай ${many}!` });
    const SNEAK = (n, prey, bg) => CH(n, 'sneak', 'Тихая охота', 1, { scene: 'sneak', p: { mode: 'hunt', prey, bg }, bg, pos: '40% 80%', size: '260%',
      say: `Глава ${n}: подкрадись к зверьку, пока он не смотрит!` });
    const FEED = (n, name, item, say, o) => CH(n, 'feed', name, 1, Object.assign({ scene: 'feed', p: Object.assign({ item, need: 8, bg: 'bg_forest' }, o || {}), bg: 'bg_forest', pos: '50% 80%', size: '260%',
      say: `Глава ${n}: ${say}` }));
    const BIRTH = (n, facts) => CH(n, 'birth', 'Рождение', 0, { scene: 'birth', bg: 'bg_sea', pos: '50% 20%', size: '240%', say: `Глава ${n}: малыш родился в воде — помоги ему вдохнуть!`, facts });
    const SWIM = (n, name, food, need, say, o) => CH(n, 'swim', name, 1, Object.assign({ scene: 'swim', p: { food, need }, bg: 'bg_sea', pos: '50% 60%', size: '240%', say: `Глава ${n}: ${say}` }, o));
    const AMBUSH = (n, prey, say) => CH(n, 'ambush', 'Засада', 2, { scene: 'ambush', p: { prey, need: 6 }, bg: 'bg_sea', pos: '50% 50%', size: '240%', say: `Глава ${n}: ${say}` });
    const FLAP = (n) => CH(n, 'flap', 'Первый полёт', 1, { scene: 'flap', p: { prey: 'it_dragonfly', need: 8 }, bg: 'bg_lagoon', pos: '50% 30%', size: '240%',
      say: `Глава ${n}: научись летать и лови стрекоз!` });
    const FISHING = (n, say) => CH(n, 'fishing', 'Рыбалка', 2, { scene: 'fishing', p: { prey: 'it_fish', need: 6 }, bg: 'bg_lagoon', pos: '50% 85%', size: '260%',
      say: `Глава ${n}: ${say || 'ныряй к воде и лови рыбу!'}` });
    const GLIDE = (n) => CH(n, 'glide', 'С дерева на дерево', 1, { scene: 'glide', p: {}, bg: 'bg_forest', pos: '20% 40%', size: '240%',
      say: `Глава ${n}: прыгай с дерева и планируй на четырёх крыльях!` });
    const SEA_CALF = (n, note) => CH(n, 'guard', 'Береги малыша', 3, { scene: 'guard', p: { bg: 'bg_sea', mode: 'sea', foes: ['it_fish'] }, bg: 'bg_sea', pos: '50% 45%', size: '240%',
      say: `Глава ${n}: прогони хищников от своего малыша!`, note });
    // the four new games (js/scenes7.js)
    const SMELL = (n) => CH(n, 'smell', 'По запаху', 1, { scene: 'smell', p: { prey: 'it_mammal', need: 3, bg: 'bg_forest' }, bg: 'bg_forest', pos: '50% 75%', size: '240%',
      say: `Глава ${n}: найди добычу по запаху!` });
    const DUEL = (n) => CH(n, 'duel', 'Поединок рогами', 2, { scene: 'duel', p: { need: 3, bg: 'bg_valley' }, bg: 'bg_valley', pos: '50% 70%', size: '240%',
      say: `Глава ${n}: померься силой с другим трицератопсом!` });
    const CALLS = (n) => CH(n, 'calls', 'Перекличка', 1, { scene: 'calls', p: { rounds: 4, bg: 'bg_valley' }, bg: 'bg_valley', pos: '50% 60%', size: '240%',
      say: `Глава ${n}: повтори песню стада!` });
    const THERMAL = (n) => CH(n, 'thermal', 'Восходящий поток', 2, { scene: 'thermal', p: { bg: 'bg_lagoon' }, bg: 'bg_lagoon', pos: '50% 30%', size: '240%',
      say: `Глава ${n}: поднимайся в тёплых потоках под облаками!` });
    const cre = (id, o) => add(id, Object.assign({ period: 'creta', pathBg: 'bg_valley' }, o));

    /* ---------------- North America: the plains of Laramidia by the inland sea */
    cre('trex', {
      name: 'Тираннозавр', gen: 'тираннозавра', site: 'hellcreek', kind: 'Хищник', predator: true,
      hero: { name: 'Тираннозавр', latin: 'Tyrannosaurus rex', period: K('68–66 млн лет назад'),
        rows: [['Длина', 'До 12 м'], ['Вес', 'До 9 т'], ['Ел', 'Мясо'], ['Нашли', 'США']],
        size: 'Длиной с автобус, а весом как слон',
        desc: 'Тираннозавр — один из самых больших хищных динозавров. Жил 68–66 миллионов лет назад в Северной Америке и охотился на крупных травоядных.',
        say: 'Тираннозавр — король хищников. Длина до двенадцати метров, вес до девяти тонн.' },
      facts: {
        mouth: { part: 'Зубы', text: 'Самые большие зубы — длиной с банан. А укус — самый сильный среди всех наземных животных.' },
        head: { part: 'Нюх', text: 'Часть мозга, которая чует запахи, у тираннозавра была огромной. Он находил добычу издалека по запаху.' },
        legs: { part: 'Руки', text: 'Руки совсем короткие, всего с двумя пальцами. Зато ноги длинные и сильные.' },
        tail: { part: 'Хвост', text: 'Тяжёлый хвост уравновешивал огромную голову — как качели.' },
      },
      chapters: [EGG(['tail']),
        Object.assign(SMELL(2), { facts: ['head'] }),
        Object.assign(CHASE(3, 'it_mammal', 'зверьков'), { facts: ['legs'] }),
        SEEK(4, NB('edmontosaurus', 'ankylosaurus', 'pachycephalosaurus'), 'bg_valley'),
        NEST(5, 'bg_forest', ['it_mammal', 'it_lizard']),
        FIN('bg_valley', '40% 55%')],
      final: { len: 'до 12 м', wt: 'до 9 т', say: 'Ура! Твой тираннозавр вырос — настоящий король хищников! Загляни в музей.' },
    });
    cre('trike', {
      name: 'Трицератопс', gen: 'трицератопса', site: 'lancecreek', kind: 'Травоядный',
      hero: { name: 'Трицератопс', latin: 'Triceratops horridus', period: K('68–66 млн лет назад'),
        rows: [['Длина', 'До 9 м'], ['Вес', '6–12 т'], ['Ел', 'Растения'], ['Нашли', 'США']],
        size: 'Длиной почти с автобус',
        desc: 'Трицератопс — травоядный динозавр с тремя рогами и костяным воротником. Жил 68–66 миллионов лет назад в Северной Америке и ел растения.',
        say: 'Трицератопс — динозавр с тремя рогами и костяным воротником. Длина до девяти метров.' },
      facts: {
        head: { part: 'Рога', text: 'Над глазами — два рога длиной около метра, а на носу — третий, поменьше. Имя значит «трёхрогая морда».' },
        mouth: { part: 'Клюв', text: 'Спереди — клюв, как у попугая, а за ним сотни зубов. Ими трицератопс перетирал жёсткие растения.' },
        body: { part: 'Поединки', text: 'На черепах трицератопсов нашли зажившие следы чужих рогов. Значит, они мерились силой, сцепившись рогами.' },
        legs: { part: 'Ошибка', text: 'Первые рога нашли в 1887 году. Учёный решил, что это рога огромного древнего бизона!' },
      },
      chapters: [EGG(['legs']),
        Object.assign(FEED(2, 'Обед', 'it_palm', 'найди сочные листья внизу!', { low: true }), { facts: ['mouth'] }),
        Object.assign(DUEL(3), { facts: ['body'] }),
        RAM(4, 'sp_trex', 'тираннозавр', 'тираннозавра', 'На костях трицератопсов нашли следы зубов тираннозавра. Они жили в одно время и в одних местах.'),
        SEEK(5, NB('thescelosaurus', 'leptoceratops', 'ornithomimus'), 'bg_run'),
        FIN('bg_valley', '50% 55%')],
      final: { len: 'до 9 м', wt: '6–12 т', say: 'Ура! Твой трицератопс вырос — с тремя рогами и щитом! Загляни в музей.' },
    });
    cre('parasaur', {
      name: 'Паразауролоф', gen: 'паразауролофа', site: 'dinopark', kind: 'Травоядный',
      hero: { name: 'Паразауролоф', latin: 'Parasaurolophus walkeri', period: K('≈76–73 млн лет назад'),
        rows: [['Длина', '≈ 9,5 м'], ['Вес', '≈ 2,5 т'], ['Ел', 'Растения'], ['Нашли', 'Канада']],
        size: 'Длиной с большой грузовик',
        desc: 'Паразауролоф — утконосый травоядный динозавр с длинным гребнем-трубой на голове. Жил около 76–73 миллионов лет назад в Северной Америке и ел растения.',
        say: 'Паразауролоф — утконосый динозавр с гребнем-трубой. Длина около девяти с половиной метров.' },
      facts: {
        head: { part: 'Гребень', text: 'Гребень — длинная пустая трубка. Через неё паразауролоф трубил, как в трубу!' },
        tail: { part: 'Стадо', text: 'Паразауролофы, наверное, жили стадами и перекликались друг с другом трубными голосами.' },
        mouth: { part: 'Клюв', text: 'Спереди — клюв, как у утки, а за ним сотни зубов. Ими он перетирал листья и ветки.' },
        body: { part: 'Малыш', text: 'В 2009 году школьник нашёл скелет малыша паразауролофа. У малыша, которому не было и года, гребень уже начал расти!' },
      },
      chapters: [EGG(['body']),
        Object.assign(CALLS(2), { facts: ['tail'] }),
        Object.assign(FEED(3, 'Цветы магнолии', 'it_magnolia', 'найди цветущие магнолии!'), { facts: ['mouth'] }),
        RAM(4, 'nb_gorgosaurus', 'горгозавр', 'горгозавра'),
        SEEK(5, NB('corythosaurus', 'styracosaurus', 'euoplocephalus'), 'bg_forest'),
        FIN('bg_valley', '50% 55%')],
      final: { len: '≈ 9,5 м', wt: '≈ 2,5 т', say: 'Ура! Твой паразауролоф вырос — и трубит громче всех! Загляни в музей.' },
    });
    cre('pteran', {
      name: 'Птеранодон', gen: 'птеранодона', site: 'niobrara', kind: 'Летающий ящер', pathBg: 'bg_lagoon',
      hero: { name: 'Птеранодон', latin: 'Pteranodon longiceps', period: K('≈86–84 млн лет назад'),
        rows: [['Крылья', 'До 6 м'], ['Зубы', 'Нет'], ['Ел', 'Рыбу'], ['Нашли', 'США']],
        size: 'Крылья шире, чем у любой нынешней птицы',
        desc: 'Птеранодон — большой летающий ящер с гребнем на голове. Жил около 86–84 миллионов лет назад над морем в Северной Америке и ловил рыбу.',
        say: 'Птеранодон — летающий ящер с длинным гребнем. Размах крыльев до шести метров.' },
      facts: {
        wings: { part: 'Крылья', text: 'Крылья — из тонкой кожи, натянутой на один очень длинный палец.' },
        tail: { part: 'Гребень', text: 'Большой гребень был только у взрослых самцов. У самок гребешок маленький.' },
        body: { part: 'Парение', text: 'Над морем птеранодон, наверное, парил, как фрегат: поднимался в тёплом воздухе под облаками и почти не махал крыльями.' },
        mouth: { part: 'Без зубов', text: 'Имя значит «крылатый и беззубый». Рыбу он глотал целиком.' },
      },
      chapters: [EGG(['tail']),
        FLAP(2),
        Object.assign(THERMAL(3), { facts: ['body'] }),
        Object.assign(FISHING(4), { facts: ['mouth'] }),
        SEEK(5, NB('tylosaurus', 'hesperornis', 'xiphactinus'), 'bg_lagoon'),
        FIN('bg_lagoon', '50% 40%')],
      final: { len: 'крылья до 6 м', wt: 'без зубов', wtIcon: 'feather', say: 'Ура! Твой птеранодон вырос и парит над морем! Загляни в музей.' },
    });

    /* ---------------- Asia: the Gobi desert and the volcanic lakes of Liaoning */
    cre('velo', {
      name: 'Велоцираптор', gen: 'велоцираптора', site: 'flamingcliffs', kind: 'Хищник', predator: true, pathBg: 'bg_run',
      hero: { name: 'Велоцираптор', latin: 'Velociraptor mongoliensis', period: K('≈75–71 млн лет назад'),
        rows: [['Длина', '≈ 2 м'], ['Вес', '15–20 кг'], ['Ел', 'Мясо'], ['Нашли', 'Монголия']],
        size: 'Размером с индюка',
        desc: 'Велоцираптор — небольшой пернатый хищный динозавр. Жил около 75–71 миллиона лет назад в Азии и охотился на мелких животных.',
        say: 'Велоцираптор — пернатый хищник размером с индюка. Длина около двух метров.' },
      facts: {
        legs: { part: 'Коготь', text: 'На каждой ноге — большой серповидный коготь. При ходьбе велоцираптор поднимал его, чтобы не затупить.' },
        tail: { part: 'Имя', text: 'Первый череп велоцираптора нашли в 1923 году в пустыне Гоби. Имя значит «быстрый похититель».' },
        body: { part: 'Перья', text: 'На кости руки нашли бугорки, к которым крепились перья. Значит, велоцираптор был пернатым!' },
        head: { part: 'Схватка', text: 'Учёные нашли велоцираптора и протоцератопса, которые сцепились друг с другом. Их засыпало песком — так они и сохранились.' },
      },
      chapters: [EGG(['tail']),
        Object.assign(CHASE(2, 'it_lizard', 'ящериц'), { facts: ['body'] }),
        Object.assign(SNEAK(3, 'it_mammal', 'bg_run'), { facts: ['head'] }),
        SEEK(4, NB('protoceratops', 'oviraptor', 'pinacosaurus'), 'bg_run'),
        NEST(5, 'bg_run', ['it_lizard', 'it_mammal'], 'В пустыне Гоби нашли много гнёзд динозавров. Некоторые родители высиживали яйца, как птицы.'),
        FIN('bg_run', '40% 55%')],
      final: { len: '≈ 2 м', wt: '15–20 кг', say: 'Ура! Твой велоцираптор вырос — быстрый и ловкий! Загляни в музей.' },
    });
    cre('micro', {
      name: 'Микрораптор', gen: 'микрораптора', site: 'liaoning', kind: 'Пернатый динозавр', predator: true, pathBg: 'bg_forest',
      hero: { name: 'Микрораптор', latin: 'Microraptor', period: K('≈120 млн лет назад'),
        rows: [['Длина', '≈ 80 см'], ['Вес', '≈ 1 кг'], ['Крылья', 'Четыре'], ['Нашли', 'Китай']],
        size: 'Размером с ворону',
        desc: 'Микрораптор — крошечный пернатый динозавр с четырьмя крыльями. Жил около 120 миллионов лет назад в Китае и ловил мелких животных.',
        say: 'Микрораптор — маленький динозавр с четырьмя крыльями. Размером с ворону.' },
      facts: {
        wings: { part: 'Четыре крыла', text: 'Длинные перья росли и на руках, и на ногах — получалось четыре крыла. Микрораптор планировал с дерева на дерево.' },
        tail: { part: 'Хвост', text: 'На конце длинного хвоста — веер из перьев. Он помогал рулить в полёте.' },
        body: { part: 'Цвет', text: 'Учёные рассмотрели перья под микроскопом: они были чёрные и переливались синим, как у вороны.' },
        head: { part: 'Обед', text: 'В животе одного микрораптора нашли рыбку, у другого — птичку, а у третьего — ящерицу.' },
      },
      chapters: [EGG(['tail']),
        Object.assign(GLIDE(2), { facts: ['body'] }),
        Object.assign(FISHING(3, 'пикируй к озеру и лови рыбу!'), { facts: ['head'] }),
        SEEK(4, NB('sinosauropteryx', 'confuciusornis', 'psittacosaurus'), 'bg_forest'),
        NEST(5, 'bg_forest', ['it_lizard', 'it_mammal'], 'В Ляонине нашли зверька, у которого в животе были косточки малыша-динозавра. Яйца и малышей надо было беречь!'),
        FIN('bg_forest', '50% 40%')],
      final: { len: '≈ 80 см', wt: '≈ 1 кг', say: 'Ура! Твой микрораптор вырос и планирует на четырёх крыльях! Загляни в музей.' },
    });

    /* ---------------- Africa: the great rivers of the Sahara */
    cre('spino', {
      name: 'Спинозавр', gen: 'спинозавра', site: 'kemkem', kind: 'Хищник', predator: true,
      hero: { name: 'Спинозавр', latin: 'Spinosaurus aegyptiacus', period: K('≈100–95 млн лет назад'),
        rows: [['Длина', 'До 14 м'], ['Вес', '≈ 7 т'], ['Ел', 'Рыбу'], ['Нашли', 'Египет, Марокко']],
        size: 'Длиннее автобуса',
        desc: 'Спинозавр — огромный хищный динозавр с парусом на спине. Жил около 100–95 миллионов лет назад на севере Африки и ловил рыбу в реках.',
        say: 'Спинозавр — хищник с парусом на спине. Длина до четырнадцати метров — длиннее тираннозавра!' },
      facts: {
        body: { part: 'Парус', text: 'Парус на спине — из длинных костей-шипов. Самые высокие — больше полутора метров.' },
        legs: { part: 'Пропажа', text: 'Первые кости спинозавра погибли в 1944 году, когда в войну разбомбили музей. Учёным пришлось искать новые.' },
        tail: { part: 'Хвост-весло', text: 'В Марокко нашли его хвост — высокий и плоский, как весло. Им спинозавр грёб в воде.' },
        head: { part: 'Морда', text: 'Длинная узкая морда с коническими зубами — как у крокодила. Такими удобно хватать скользкую рыбу.' },
      },
      chapters: [EGG(['legs']),
        Object.assign(SWIM(2, 'В реке', ['it_fish'], 8, 'плыви по реке, лови рыбу и не забывай дышать!'), { facts: ['tail'] }),
        Object.assign(AMBUSH(3, 'it_fish', 'жди у берега и хватай рыбу!'), { facts: ['head'] }),
        SEEK(4, NB('carcharodontosaurus', 'onchopristis', 'alanqa'), 'bg_valley'),
        NEST(5, 'bg_forest', ['it_lizard', 'it_mammal']),
        FIN('bg_valley', '50% 55%')],
      final: { len: 'до 14 м', wt: '≈ 7 т', say: 'Ура! Твой спинозавр вырос — гроза больших рек! Загляни в музей.' },
    });

    /* ---------------- South America: Patagonia, the land of giants */
    cre('argento', {
      name: 'Аргентинозавр', gen: 'аргентинозавра', site: 'neuquen', kind: 'Травоядный',
      hero: { name: 'Аргентинозавр', latin: 'Argentinosaurus huinculensis', period: K('≈94 млн лет назад'),
        rows: [['Длина', '30–35 м'], ['Вес', '65–80 т'], ['Ел', 'Листья'], ['Нашли', 'Аргентина']],
        size: 'Длиной с три автобуса',
        desc: 'Аргентинозавр — один из самых больших динозавров на свете. Жил около 94 миллионов лет назад в Южной Америке и ел листья.',
        say: 'Аргентинозавр — великан среди великанов. Длина до тридцати пяти метров!' },
      facts: {
        legs: { part: 'Находка', text: 'В 1987 году фермер нашёл огромную кость и подумал, что это окаменевшее бревно!' },
        tail: { part: 'Вес', text: 'Весил он как десяток слонов. Земля, наверное, дрожала под его шагами!' },
        neck: { part: 'Шея', text: 'Длинной шеей он доставал до высоких веток деревьев — например, араукарий.' },
        body: { part: 'Позвонок', text: 'Один его позвонок высотой около полутора метров — почти со взрослого человека!' },
      },
      chapters: [EGG(['tail']),
        Object.assign(FEED(2, 'Араукарии', 'it_araucaria', 'дотянись длинной шеей до веток араукарии!'), { facts: ['neck'], pos: '78% 40%' }),
        Object.assign(DEF(3, 'nb_mapusaurus', 'мапузавр', 'мапузавра', { tip: 'Кости мапузавров нашли целой группой. Может быть, они охотились вместе.' }), { facts: ['body'] }),
        SEEK(4, NB('mapusaurus', 'skorpiovenator', 'cathartesaura'), 'bg_valley'),
        NEST(5, 'bg_valley', ['it_mammal', 'it_lizard'], 'Недалеко, в Аука-Мауэво, нашли огромное гнездовье титанозавров — тысячи яиц, а в некоторых даже кожу малышей!'),
        FIN('bg_valley', '60% 45%')],
      final: { len: '30–35 м', wt: '65–80 т', say: 'Ура! Твой аргентинозавр вырос — самый огромный из всех! Загляни в музей.' },
    });

    /* ---------------- Europe: islands in a warm chalk sea */
    cre('iguano', {
      name: 'Игуанодон', gen: 'игуанодона', site: 'bernissart', kind: 'Травоядный',
      hero: { name: 'Игуанодон', latin: 'Iguanodon bernissartensis', period: K('≈126–122 млн лет назад'),
        rows: [['Длина', 'До 10 м'], ['Вес', '≈ 4 т'], ['Ел', 'Растения'], ['Нашли', 'Бельгия']],
        size: 'Длиной почти с автобус',
        desc: 'Игуанодон — большой травоядный динозавр с шипами на больших пальцах рук. Жил около 125 миллионов лет назад в Европе и ел растения.',
        say: 'Игуанодон — травоядный динозавр с острыми шипами на пальцах. Длина до десяти метров.' },
      facts: {
        legs: { part: 'Шип', text: 'На большом пальце руки — острый шип. Сначала учёные думали, что это рог на носу!' },
        body: { part: 'Шахта', text: 'Шахтёры нашли кости глубоко под землёй и решили, что это стволы деревьев с золотом! Блестело не золото, а минерал пирит.' },
        head: { part: 'Зубы', text: 'Его назвали по зубам: они похожи на зубы игуаны, только гораздо больше. Имя значит «зуб игуаны».' },
        tail: { part: 'Один из первых', text: 'Игуанодон — один из первых динозавров, которым учёные дали имя. Это было в 1825 году.' },
      },
      chapters: [EGG(['body']),
        Object.assign(FEED(2, 'Хвощи', 'it_horsetail', 'найди сочные хвощи!', { low: true }), { facts: ['head'] }),
        Object.assign(RAM(3, 'nb_baryonyx', 'барионикс', 'барионикса', 'В животе барионикса нашли рыбью чешую и косточки молодого игуанодона.'), { facts: ['tail'] }),
        SEEK(4, NB('mantellisaurus', 'bernissartia', 'baryonyx'), 'bg_forest'),
        NEST(5, 'bg_forest', ['nb_bernissartia', 'it_lizard']),
        FIN('bg_valley', '50% 55%')],
      final: { len: 'до 10 м', wt: '≈ 4 т', say: 'Ура! Твой игуанодон вырос — с шипами на пальцах! Загляни в музей.' },
    });
    cre('mosa', {
      name: 'Мозазавр', gen: 'мозазавра', site: 'maastricht', kind: 'Морской ящер', predator: true, pathBg: 'bg_sea',
      hero: { name: 'Мозазавр', latin: 'Mosasaurus hoffmannii', period: K('≈70–66 млн лет назад'),
        rows: [['Длина', 'До 13 м'], ['Ел', 'Рыбу, черепах'], ['Дышал', 'Воздухом'], ['Нашли', 'Нидерланды']],
        size: 'Длиной с автобус',
        desc: 'Мозазавр — огромный морской ящер, родственник варанов и змей. Жил около 70–66 миллионов лет назад в море и охотился на рыбу и черепах.',
        say: 'Мозазавр — гроза меловых морей. Длина до тринадцати метров.' },
      facts: {
        head: { part: 'Первый череп', text: 'Первый череп нашли больше 250 лет назад в каменоломне у Маастрихта. Сначала решили, что это кит!' },
        fins: { part: 'Малыши', text: 'Мозазавры рожали малышей прямо в воде, как дельфины.' },
        tail: { part: 'Хвост', text: 'На конце хвоста был плавник, как у акулы. Им мозазавр грёб.' },
        body: { part: 'Родня', text: 'Мозазавр — не динозавр, а морской ящер. Его родственники — вараны и змеи.' },
      },
      chapters: [BIRTH(1, ['fins']),
        Object.assign(SWIM(2, 'Охота в море', ['it_fish', 'it_ammonite'], 10, 'лови рыбу и аммонитов и не забывай дышать!'), { facts: ['tail'] }),
        Object.assign(AMBUSH(3, 'it_turtle', 'жди в засаде и хватай морских черепах!'), { facts: ['body'] }),
        SEEK(4, NB('prognathodon', 'allopleuron', 'squalicorax'), 'bg_sea'),
        SEA_CALF(5, 'Учёные находили совсем маленьких мозазавров в открытом море. Значит, малыши рождались прямо в воде.'),
        FIN('bg_sea', '50% 50%')],
      final: { len: 'до 13 м', wt: 'дышал воздухом', wtIcon: 'droplet', say: 'Ура! Твой мозазавр вырос — гроза меловых морей! Загляни в музей.' },
    });
  },
});
