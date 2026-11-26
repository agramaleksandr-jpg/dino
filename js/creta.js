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
    site('lancecreek', { name: 'Ланс-Крик', where: 'Вайоминг, США', region: 'cnam', age: '≈67 млн лет назад', bg: 'bg_cnam_run', pt: [258, 200],
      fact: 'Здесь, в Вайоминге, Джон Хэтчер за три года откопал больше тридцати черепов трицератопсов.' });
    site('dinopark', { name: 'Парк динозавров', where: 'Альберта, Канада', region: 'cnam', age: '≈76 млн лет назад', bg: 'bg_cnam_forest', pt: [246, 92],
      fact: 'В этих оврагах нашли кости десятков видов динозавров. Это место охраняет ЮНЕСКО.' });
    site('niobrara', { name: 'Ниобрара', where: 'Канзас, США', region: 'cnam', age: '≈86–80 млн лет назад', bg: 'bg_clagoon', pt: [326, 200],
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
    site('bigbend', { name: 'Биг-Бенд', where: 'Техас, США', region: 'cnam', age: '≈80–66 млн лет назад', bg: 'bg_cnam_run', pt: [286, 238],
      fact: 'В 1971 году студент Дуглас Лоусон нашёл здесь кости крыла огромного летающего ящера. Сейчас тут пустыня, а тогда текли реки и было тёплое море. В слоях постарше нашли гигантского крокодила дейнозуха.' });
    site('gadoufaoua', { name: 'Гадуфауа', where: 'Нигер', region: 'cafr', age: '≈112 млн лет назад', bg: 'bg_cafr_valley', pt: [597, 291],
      fact: 'Кочевники-туареги называют это место «где боятся верблюды». Сейчас здесь пустыня, а тогда текли широкие реки.' });
    site('hateg', { name: 'Хацег', where: 'Румыния', region: 'ceur', age: '≈70 млн лет назад', bg: 'bg_ceur_forest', pt: [726, 128],
      fact: 'Здесь был остров в тёплом море. В 1895 году сестра барона Нопчи нашла тут кости, а барон выяснил: динозавры острова были карликами!' });
    site('maastricht', { name: 'Маастрихт', where: 'Нидерланды', region: 'ceur', age: '≈67 млн лет назад', bg: 'bg_csea', pt: [654, 106],
      fact: 'Здесь, в меловой горе у реки Маас, нашли первые черепа мозазавра. Его имя значит «ящер с реки Маас».' });
    // the third wave: Asia — the river valleys of Nemegt and Altan Uul, the dunes of Ukhaa Tolgod, the lakes of Shandong
    site('nemegt', { name: 'Немегт', where: 'Гоби, Монголия', region: 'casia', age: '≈70 млн лет назад', bg: 'bg_cnemegt_valley', pt: [944, 150],
      fact: 'Сейчас здесь пустыня, а тогда текли широкие реки и росли леса. В 1946 году советско-монгольская экспедиция нашла здесь тарбозавра.' });
    site('altanuul', { name: 'Алтан-Ула', where: 'Гоби, Монголия', region: 'casia', age: '≈70 млн лет назад', bg: 'bg_cnemegt_run', pt: [938, 108],
      fact: 'В 1965 году польско-монгольская экспедиция нашла здесь огромные руки дейнохейруса. Каким был весь динозавр, оставалось загадкой почти пятьдесят лет.' });
    site('ukhaatolgod', { name: 'Ухаа-Толгод', where: 'Гоби, Монголия', region: 'casia', age: '≈75–71 млн лет назад', bg: 'bg_casia_run', pt: [982, 170],
      fact: 'Это место нашли в 1993 году. Здесь откопали множество скелетов динозавров, ящериц и древних зверьков — и даже цитипати, сидящего на гнезде.' });
    site('laiyang', { name: 'Лайян', where: 'Шаньдун, Китай', region: 'casia', age: '≈75 млн лет назад', bg: 'bg_cshandong_valley', pt: [1088, 198],
      fact: 'Здесь, в китайской провинции Шаньдун, в 1950 году нашли цинтаозавра. А неподалёку, у города Чжучэн, есть огромное кладбище утконосых динозавров.' });
    // the fourth wave: Africa and Madagascar — the dry river plain of Maevarano, the old rivers of Iguidi in the Sahara
    site('mahajanga', { name: 'Махадзанга', where: 'Мадагаскар', region: 'cafr', age: '≈70 млн лет назад', bg: 'bg_cmada_valley', pt: [741, 408],
      fact: 'Мадагаскар уже тогда был островом. Здесь была сухая равнина с реками, которые в засуху пересыхали. Первые кости динозавров тут нашли в 1895 году.' });
    site('iguidi', { name: 'Игиди', where: 'Нигер', region: 'cafr', age: '≈95 млн лет назад', bg: 'bg_cafr_valley', pt: [555, 282],
      fact: 'Сейчас здесь пустыня Сахара, а тогда текли реки. Экспедиция Пола Серено нашла тут черепа удивительных крокодилов: один — с клыками, как у кабана, другой — с плоской головой, как блин.' });
    // South America (the fifth wave): the Neuquén pins are spread a little, so that they do not lie on each other
    site('portezuelo', { name: 'Портесуэло', where: 'Неукен, Аргентина', region: 'csam', age: '≈90 млн лет назад', bg: 'bg_csam_forest', pt: [376, 455],
      fact: 'В горах Сьерра-дель-Портесуэло нашли хищников с огромными когтями. А у озера Лос-Барреалес — одного из самых больших динозавров, футалогнкозавра.' });
    site('laamarga', { name: 'Ла-Амарга', where: 'Неукен, Аргентина', region: 'csam', age: '≈129–122 млн лет назад', bg: 'bg_csam_valley', pt: [383, 486],
      fact: '«Ла-Амарга» по-испански значит «горькая» — так назван ручей. В 1984 году здесь нашли амаргазавра, а та же экспедиция нашла и карнотавра.' });
    site('rionegro', { name: 'Рио-Негро', where: 'Патагония, Аргентина', region: 'csam', age: '≈70 млн лет назад', bg: 'bg_csam_valley', pt: [440, 472],
      fact: 'Здесь был берег тёплого моря с лагунами и солёными озёрами. Длинношеие динозавры приходили сюда откладывать яйца — нашли целые гнездовья.' });
    site('lacolonia', { name: 'Ла-Колония', where: 'Чубут, Аргентина', region: 'csam', age: '≈72–69 млн лет назад', bg: 'bg_csam_valley', pt: [413, 503],
      fact: 'Здесь река впадала в море. Рядом с карнотавром нашли черепах, плезиозавров и больше трёхсот косточек древних зверьков.' });
    site('sanluis', { name: 'Сан-Луис', where: 'Аргентина', region: 'csam', age: '≈105 млн лет назад', bg: 'bg_csam_lakeshore', pt: [412, 441],
      fact: 'Здесь было мелкое озеро. На одном холме нашли кости больше семисот птеродаустро — его так и назвали: Холм птеродаустро.' });
    site('salta', { name: 'Сальта', where: 'Аргентина', region: 'csam', age: '≈70 млн лет назад', bg: 'bg_csam_valley', pt: [419, 404],
      fact: 'На ферме Эль-Брете нашли кости нескольких сальтазавров — взрослых и малышей — и много древних птиц.' });
    site('araripe', { name: 'Арарипе', where: 'Бразилия', region: 'csam', age: '≈112 млн лет назад', bg: 'bg_csam_shore', pt: [528, 344],
      fact: 'Плато Арарипе в Бразилии. В каменных «яйцах»-конкрециях рыбы и летающие ящеры сохранились объёмными, будто только что уснули.' });

    /* ---------------- the Cretaceous map: the continents are almost where they are now, a sea splits North America */
    const R = (id, o) => { D.regions[id] = Object.assign({ id, period: 'creta' }, o); };
    // the sixth wave (Europe): the Weald of southern England, the Isle of Wight, the lake of Las Hoyas in Spain, Sebeș on Hațeg Island
    site('smokejacks', { name: 'Смоукджекс', where: 'Суррей, Англия', region: 'ceur', age: '≈125 млн лет назад', bg: 'bg_ceur_valley', pt: [602, 103],
      fact: 'Это глиняный карьер, где делают кирпичи. В 1983 году любитель окаменелостей Уильям Уокер нашёл здесь огромный коготь — так учёные узнали о бариониксе.' });
    site('wight', { name: 'Остров Уайт', where: 'Англия', region: 'ceur', age: '≈125 млн лет назад', bg: 'bg_ceur_forest', pt: [567, 126],
      fact: 'Море размывает береговые скалы острова, и из них выпадают кости. Здесь жили больше двадцати видов динозавров!' });
    site('lashoyas', { name: 'Лас-Ойас', where: 'Куэнка, Испания', region: 'ceur', age: '≈127 млн лет назад', bg: 'bg_ceur_lakeshore', pt: [588, 172],
      fact: 'Здесь было тёплое озеро. В тонких слоях камня сохранились даже перья птиц, кожа динозавров и шерсть зверьков.' });
    site('sebes', { name: 'Себеш', where: 'Румыния', region: 'ceur', age: '≈70 млн лет назад', bg: 'bg_ceur_valley', pt: [751, 112],
      fact: 'Это тоже остров Хацег. В 2009 году на берегу реки Себеш нашли скелет балаура — хищника с двумя когтями-серпами на каждой ноге.' });
    // the seventh wave: Australia (Queensland, Victoria) and Antarctica (the James Ross Basin)
    site('muttaburra', { name: 'Муттабурра', where: 'Квинсленд, Австралия', region: 'caus', age: '≈100 млн лет назад', bg: 'bg_caus_valley', pt: [1158, 548],
      fact: 'В 1963 году фермер Даг Лэнгдон перегонял здесь скот у реки Томсон и заметил в земле огромные кости. Так нашли муттабуррозавра.' });
    site('winton', { name: 'Уинтон', where: 'Квинсленд, Австралия', region: 'caus', age: '≈95 млн лет назад', bg: 'bg_caus_valley', pt: [1115, 530],
      fact: 'На месте древнего озера здесь нашли хищника австраловенатора и великана диамантинозавра. А неподалёку в камне сохранились больше трёх тысяч следов маленьких динозавров.' });
    site('richmond', { name: 'Ричмонд', where: 'Квинсленд, Австралия', region: 'caus', age: '≈100 млн лет назад', bg: 'bg_caus_run', pt: [1128, 494],
      fact: '100 миллионов лет назад здесь было внутреннее море Эроманга. В камнях его дна находят морских ящеров — и динозавров, которых унесло в море.' });
    site('dinosaurcove', { name: 'Бухта Динозавров', where: 'Виктория, Австралия', region: 'caus', age: '≈110 млн лет назад', bg: 'bg_caus_forest', pt: [1185, 640],
      fact: 'Тогда здесь была долина у Южного полюса: зимой солнце не вставало неделями. Чтобы добраться до костей, учёные и добровольцы прокопали туннели прямо в прибрежной скале.' });
    site('jamesross', { name: 'Остров Джеймса Росса', where: 'Антарктида', region: 'cant', age: '≈74 млн лет назад', bg: 'bg_cant_coast', pt: [520, 600],
      fact: 'Сейчас здесь холодно и лежит снег, а тогда росли хвойные леса и папоротники. В 1986 году здесь нашли антарктопельту.' });
    site('vega', { name: 'Остров Вега', where: 'Антарктида', region: 'cant', age: '≈69 млн лет назад', bg: 'bg_cant_coast', pt: [532, 572],
      fact: 'Здесь нашли кости вегависа — одной из древнейших птиц, похожих на уток и гусей.' });
    // the eighth wave: North America again — Montana, Texas, Alberta and South Dakota
    site('eggmountain', { name: 'Яичная гора', where: 'Монтана, США', region: 'cnam', age: '≈77 млн лет назад', bg: 'bg_cnam_valley', pt: [206, 128],
      fact: 'Здесь, у подножия Скалистых гор, нашли много гнёзд майазавр с яйцами и малышами. Поэтому место и назвали Яичной горой.' });
    site('cloverly', { name: 'Кловерли', where: 'Монтана, США', region: 'cnam', age: '≈110 млн лет назад', bg: 'bg_cnam_forest', pt: [236, 164],
      fact: 'В этих пёстрых глинах в 1964 году нашли дейнониха. Здесь жили и тенонтозавры, на которых он охотился.' });
    site('glenrose', { name: 'Глен-Роуз', where: 'Техас, США', region: 'cnam', age: '≈113 млн лет назад', bg: 'bg_cnam_run', pt: [342, 236],
      fact: 'В русле реки Палакси сохранились следы огромных длинношеих динозавров и хищников. В засуху, когда река пересыхает, их видно лучше всего.' });
    site('suncor', { name: 'Форт-Мак-Мюррей', where: 'Альберта, Канада', region: 'cnam', age: '≈110 млн лет назад', bg: 'bg_cnam_forest', pt: [254, 56],
      fact: 'Здесь, в шахте нефтеносного песка, в 2011 году нашли бореалопельту. Её тело когда-то унесло в море, и оно опустилось на дно.' });
    site('pierre', { name: 'Река Шайенн', where: 'Южная Дакота, США', region: 'cnam', age: '≈75 млн лет назад', bg: 'bg_clagoon', pt: [306, 160],
      fact: '75 миллионов лет назад здесь было внутреннее море, которое делило Северную Америку на две части. В его глинах нашли гигантскую черепаху архелона.' });
    // the ninth wave: India, an island in the ocean on its way north — the Lameta beds of Gujarat, Madhya Pradesh and Maharashtra,
    // the lake between the lava flows of the Deccan at Naskal, the ponds of Kallamedu in the south
    site('rahioli', { name: 'Рахиоли', where: 'Гуджарат, Индия', region: 'cind', age: '≈67 млн лет назад', bg: 'bg_cind_run', pt: [857, 411],
      fact: 'В 1981 году рабочие цементного карьера у деревни Рахиоли отдали геологам странные каменные шары. Это были яйца динозавров! Потом здесь нашли и кости раджазавра.' });
    site('jabalpur', { name: 'Джабалпур', where: 'Мадхья-Прадеш, Индия', region: 'cind', age: '≈67 млн лет назад', bg: 'bg_cind_forest', pt: [882, 408],
      fact: 'В 1828 году офицер Уильям Слиман нашёл здесь, на холме Бара-Симла, позвонки огромного динозавра. Это были первые кости динозавров, найденные в Индии.' });
    site('pisdura', { name: 'Писдура', where: 'Махараштра, Индия', region: 'cind', age: '≈67 млн лет назад', bg: 'bg_cind_valley', pt: [872, 437],
      fact: 'Здесь нашли окаменевший помёт длинношеих динозавров. В нём учёные увидели крошечные частички травы — значит, трава росла уже при динозаврах!' });
    site('naskal', { name: 'Наскал', where: 'Телангана, Индия', region: 'cind', age: '≈66 млн лет назад', bg: 'bg_cind_valley', pt: [880, 462],
      fact: 'Тогда здесь извергались вулканы. Между потоками застывшей лавы было озеро, и в его глине нашли зубы первых меловых зверьков Индии.' });
    site('kallamedu', { name: 'Калламеду', where: 'Тамилнад, Индия', region: 'cind', age: '≈68 млн лет назад', bg: 'bg_cind_bank', pt: [871, 490],
      fact: 'Здесь был пресный пруд. В его песке и глине нашли черепа черепах, чешую рыб, раковины улиток и кости крокодилов.' });
    R('cnam', { name: 'Северная Америка', map: [286, 150], sites: ['hellcreek', 'lancecreek', 'dinopark', 'niobrara', 'bigbend', 'eggmountain', 'cloverly', 'glenrose', 'suncor', 'pierre'], sil: 'trex', view: { c: [280, 148], z: 2.4 } });
    R('ceur', { name: 'Европа', map: [660, 150], sites: ['bernissart', 'maastricht', 'hateg', 'wight', 'smokejacks', 'lashoyas', 'sebes'], sil: 'iguano', view: { c: [636, 126], z: 2.8 } });
    R('casia', { name: 'Азия', map: [1040, 170], sites: ['flamingcliffs', 'ukhaatolgod', 'nemegt', 'altanuul', 'liaoning', 'laiyang'], sil: 'velo', view: { c: [1016, 156], z: 2.4 } });
    R('cafr', { name: 'Африка', map: [624, 330], sites: ['kemkem', 'gadoufaoua', 'iguidi', 'mahajanga'], sil: 'spino', view: { c: [620, 315], z: 2.0 } });
    R('csam', { name: 'Южная Америка', map: [440, 380], sites: ['neuquen', 'portezuelo', 'laamarga', 'rionegro', 'lacolonia', 'sanluis', 'salta', 'araripe'],
      sil: 'argento', view: { c: [465, 440], z: 3.0 } });
    R('caus', { name: 'Австралия', map: [1062, 505], sites: ['muttaburra', 'winton', 'richmond', 'dinosaurcove'], sil: 'diamant', view: { c: [1140, 565], z: 2.6 } });
    R('cant', { name: 'Антарктида', map: [500, 516], sites: ['jamesross', 'vega'], sil: 'antarcto', view: { c: [535, 598], z: 3.0 } });
    R('cind', { name: 'Индия', map: [876, 448], sites: ['rahioli', 'jabalpur', 'pisdura', 'naskal', 'kallamedu'], sil: 'raja', view: { c: [872, 450], z: 3.2 } });

    /* ---------------- regional pictures (G.rbg). Asia: dunes of the Gobi to run on, the forest and the lake of Liaoning;
       Africa: the sea of the river animals is the river itself */
    const RB = (k) => ({ bg_run: `bg_${k}_run`, bg_forest: `bg_${k}_forest`, bg_valley: `bg_${k}_valley`, bg_mud: `bg_${k}_run`, bg_hide: `bg_${k}_forest` });
    Object.assign(G.RBG, {
      cnam: Object.assign(RB('cnam'), { bg_lagoon: 'bg_clagoon', bg_sea: 'bg_csea' }),
      ceur: Object.assign(RB('ceur'), { bg_lagoon: 'bg_clagoon', bg_sea: 'bg_csea' }),
      casia: Object.assign(RB('casia'), { bg_lagoon: 'bg_casia_valley', bg_sea: 'bg_csea' }),
      cafr: Object.assign(RB('cafr'), { bg_lagoon: 'bg_cafr_valley', bg_sea: 'bg_criver' }),
      csam: RB('csam'),
      // Australia: the floodplain and the river valley of Winton, a cool forest of the south; the sea chapters in the Eromanga Sea
      caus: Object.assign(RB('caus'), { bg_lagoon: 'bg_caus_valley', bg_sea: 'bg_csea' }),
      // Antarctica: the coast of James Ross Island and its forest (the forest of the south as in Victoria)
      cant: { bg_run: 'bg_cant_coast', bg_forest: 'bg_caus_forest', bg_valley: 'bg_cant_coast', bg_mud: 'bg_cant_coast', bg_hide: 'bg_caus_forest',
        bg_lagoon: 'bg_cant_coast', bg_sea: 'bg_csea' },
      // India: the Deccan plain with its flat-topped hills, the forest of the Lameta, the river valley; the sandy bank of a pond;
      // the water chapters under the water of a river (India was an island, but its animals lived in rivers and ponds)
      cind: Object.assign(RB('cind'), { bg_lagoon: 'bg_cind_bank', bg_sea: 'bg_criver' }),
    });
    // the Nemegt valley: rivers, a conifer forest and a dry plain; Shandong: a lake among conifers; the dunes of Ukhaa Tolgod with a stream
    const NEM = Object.assign(RB('cnemegt'), { bg_lagoon: 'bg_cnemegt_valley', bg_sea: 'bg_criver' });
    Object.assign(G.RBGS, {
      nemegt: NEM, altanuul: NEM,
      laiyang: { bg_run: 'bg_cshandong_valley', bg_valley: 'bg_cshandong_valley', bg_mud: 'bg_cshandong_valley', bg_lagoon: 'bg_cshandong_valley',
        bg_forest: 'bg_cnemegt_forest', bg_hide: 'bg_cnemegt_forest', bg_sea: 'bg_criver' },
      ukhaatolgod: { bg_forest: 'bg_casia_run', bg_hide: 'bg_casia_run', bg_valley: 'bg_casia_run', bg_lagoon: 'bg_casia_run', bg_sea: 'bg_criver' },
    });
    // Madagascar: the dry river plain of Maevarano, its woodland of conifers and cycads, the open plain
    Object.assign(G.RBGS, { mahajanga: Object.assign(RB('cmada'), { bg_lagoon: 'bg_cmada_valley', bg_sea: 'bg_criver' }) });
    // South America: the lagoon of the Araripe (Brazil), the lake of San Luis with its red hills (the pterosaur's home)
    Object.assign(G.RBGS, {
      // (on land there: the beach of the lagoon, the sandy shore of the lake)
      araripe: Object.assign(RB('csam'), { bg_lagoon: 'bg_csam_lagoon', bg_sea: 'bg_criver', bg_run: 'bg_csam_shore', bg_valley: 'bg_csam_shore' }),
      sanluis: Object.assign(RB('csam'), { bg_lagoon: 'bg_csam_lake', bg_valley: 'bg_csam_lakeshore', bg_run: 'bg_csam_lakeshore', bg_sea: 'bg_criver' }),
      // Europe: the river of the Weald (the baryonyx fishes there), the lake of Las Hoyas and its shore (on land the shore, not the water)
      smokejacks: Object.assign(RB('ceur'), { bg_lagoon: 'bg_ceur_river', bg_sea: 'bg_criver' }),
      lashoyas: Object.assign(RB('ceur'), { bg_lagoon: 'bg_ceur_lake', bg_run: 'bg_ceur_lakeshore', bg_valley: 'bg_ceur_lakeshore', bg_sea: 'bg_criver' }),
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
      // the second wave: Big Bend, Gadoufaoua, Hațeg island, El Chocón, Liaoning
      { key: 'alamosaurus', name: 'Аламозавр', text: 'Это аламозавр — огромный длинношеий динозавр. Таких великанов в Северной Америке тогда больше не было.' },
      { key: 'torosaurus', name: 'Торозавр', text: 'Это торозавр — рогатый динозавр. Его голова с воротником была длиннее, чем рост взрослого человека!' },
      { key: 'ouranosaurus', name: 'Уранозавр', text: 'Это уранозавр — травоядный динозавр с высоким гребнем на спине, похожим на парус.' },
      { key: 'suchomimus', name: 'Сухомим', text: 'Это сухомим — хищник с длинной мордой, как у крокодила. Он ловил рыбу в реках.' },
      { key: 'nigersaurus', name: 'Нигерзавр', text: 'Это нигерзавр. Во рту у него было больше пятисот зубов! Он щипал низкие растения, как корова.' },
      { key: 'hatzegopteryx', name: 'Хацегоптерикс', text: 'Это хацегоптерикс — огромный летающий ящер. На острове не было больших хищных динозавров, и главным хищником был он!' },
      { key: 'balaur', name: 'Балаур', text: 'Это балаур — небольшой пернатый хищник. На каждой ноге у него по два больших когтя. Балаур по-румынски — «дракон».' },
      { key: 'zalmoxes', name: 'Залмоксес', text: 'Это залмоксес — небольшой травоядный динозавр с клювом. На острове он тоже был карликом.' },
      { key: 'andesaurus', name: 'Андезавр', text: 'Это андезавр — большой длинношеий динозавр. Он жил здесь в одно время с гиганотозавром.' },
      { key: 'buitreraptor', name: 'Буитрераптор', text: 'Это буитрераптор — маленький пернатый хищник с длинной узкой мордой и множеством мелких зубов.' },
      { key: 'najash', name: 'Наджаш', text: 'Это наджаш — древняя змея с маленькими задними лапками!' },
      { key: 'repenomamus', name: 'Репеномам', text: 'Это репеномам — зверь размером с барсука. В животе одного репеномама нашли косточки детёныша динозавра!' },
      // the third wave: Nemegt, Altan Uul, Ukhaa Tolgod, Shandong
      { key: 'alioramus', name: 'Алиорамус', text: 'Это алиорамус — стройный родственник тарбозавра с длинной мордой. На морде у него был ряд костяных бугорков.' },
      { key: 'nemegtosaurus', name: 'Немегтозавр', text: 'Это немегтозавр — длинношеий динозавр. От него нашли только череп!' },
      { key: 'prenocephale', name: 'Преноцефале', text: 'Это преноцефале. На голове у него был круглый костяной купол, как шлем.' },
      { key: 'tarchia', name: 'Тархия', text: 'Это тархия — большой динозавр в броне с тяжёлой булавой на хвосте.' },
      { key: 'nemegtomaia', name: 'Немегтомайя', text: 'Это немегтомайя — пернатый динозавр с клювом. Одну немегтомайю нашли прямо на гнезде с яйцами.' },
      { key: 'avimimus', name: 'Авимим', text: 'Это авимим — маленький пернатый динозавр. Его имя значит «подражающий птице».' },
      { key: 'citipati', name: 'Цитипати', text: 'Это цитипати — родственник овираптора. Его нашли сидящим на гнезде: он укрывал яйца руками с перьями.' },
      { key: 'shuvuuia', name: 'Шувуйя', text: 'Это шувуйя — маленький пернатый динозавр. На каждой коротенькой руке у него был один большой коготь.' },
      { key: 'zalambdalestes', name: 'Заламбдалест', text: 'Это заламбдалест — маленький зверёк с длинной мордочкой. Он жил рядом с динозаврами.' },
      { key: 'zhuchengtyrannus', name: 'Чжучэнтираннус', text: 'Это чжучэнтираннус — огромный хищник, родственник тираннозавра. Его нашли у китайского города Чжучэн.' },
      { key: 'sinoceratops', name: 'Синоцератопс', text: 'Это синоцератопс — первый рогатый динозавр с большим воротником, которого нашли в Китае.' },
      { key: 'shantungosaurus', name: 'Шантунгозавр', text: 'Это шантунгозавр — один из самых больших утконосых динозавров. Длиной около пятнадцати метров — больше автобуса!' },
      // the fourth wave: Madagascar and Iguidi
      { key: 'beelzebufo', name: 'Бельзебуфо', text: 'Это бельзебуфо — огромная лягушка размером с мяч. Её прозвали «лягушка-дьявол»: может быть, она ела даже маленьких динозавров!' },
      { key: 'mahajangasuchus', name: 'Махаджангазух', text: 'Это махаджангазух — древний родственник крокодилов с широкой тупой мордой. Он жил у рек Мадагаскара.' },
      { key: 'vorona', name: 'Ворона', text: 'Это ворона — нет, не та, что каркает! Так зовут древнюю птицу с Мадагаскара: на местном языке «ворона» значит просто «птица».', place: 'air' },
      { key: 'adalatherium', name: 'Адалатерий', text: 'Это адалатерий — зверь размером с барсука. Его имя значит «сумасшедший зверь»: кости у него очень необычные.' },
      { key: 'rugops', name: 'Ругопс', text: 'Это ругопс — хищник с короткой мордой, вся она в бороздках и складках. Его имя значит «морщинистое лицо».' },
      { key: 'laganosuchus', name: 'Лаганозух', text: 'Это лаганозух — «крокодил-блин» с плоской-плоской головой. Наверное, он лежал в воде с открытой пастью и ждал, когда к нему заплывёт рыба.' },
      // the fifth wave: La Colonia, Río Negro, Portezuelo, the Araripe, La Amarga, Salta
      { key: 'yaminuechelys', name: 'Яминуэхелис', text: 'Это яминуэхелис — черепаха с длинной-длинной шеей. Голову она прятала не внутрь панциря, а складывала шею набок.' },
      { key: 'titanomachya', name: 'Титаномахия', text: 'Это титаномахия — один из самых маленьких титанозавров, длиной около шести метров. Её назвали в честь битвы титанов из греческих мифов.' },
      { key: 'kawanectes', name: 'Каванектес', text: 'Это каванектес — небольшой плезиозавр. Он заплывал из моря в устья рек и ловил рыбу.', place: 'sea' },
      { key: 'patagopelta', name: 'Патагопельта', text: 'Это патагопельта — маленький динозавр в броне. Её имя значит «патагонский щит».' },
      { key: 'aeolosaurus', name: 'Эолозавр', text: 'Это эолозавр — длинношеий титанозавр. Его назвали в честь Эола, бога ветров: в Патагонии всегда дуют сильные ветры.' },
      { key: 'unenlagia', name: 'Уненлагия', text: 'Это уненлагия — пернатый хищник, похожий на большую птицу. Её имя на языке мапуче значит «полуптица».' },
      { key: 'futalognkosaurus', name: 'Футалогнкозавр', text: 'Это футалогнкозавр — один из самых больших динозавров, длиной около двадцати пяти метров. Его имя на языке мапуче значит «вождь-великан».' },
      { key: 'tapejara', name: 'Тапеяра', text: 'Это тапеяра — летающий ящер с огромным гребнем на голове. Клюв у неё был короткий и без зубов.' },
      { key: 'anhanguera', name: 'Анхангуэра', text: 'Это анхангуэра — летающий ящер с длинными зубастыми челюстями. Он ловил рыбу у самой воды.' },
      { key: 'araripesuchus', name: 'Арарипезух', text: 'Это арарипезух — маленький родственник крокодилов на длинных ногах. Он бегал по суше, как собака.' },
      { key: 'ligabueino', name: 'Лигабуэйно', text: 'Это лигабуэйно — совсем маленький хищный динозавр. Его имя значит «малыш Лигабуэ» — в честь итальянского исследователя.' },
      { key: 'amargasuchus', name: 'Амаргазух', text: 'Это амаргазух — древний крокодил. Его кости нашли рядом со скелетом амаргазавра.' },
      { key: 'amargastegos', name: 'Амаргастегос', text: 'Это амаргастегос — стегозавр с костяными пластинами на спине. Стегозавров в Южной Америке находят очень редко.' },
      { key: 'noasaurus', name: 'Ноазавр', text: 'Это ноазавр — небольшой хищник. Его большой коготь сначала приняли за коготь на ноге, а потом поняли: он был на руке.' },
      { key: 'lectavis', name: 'Лектавис', text: 'Это лектавис — древняя птица на длинных тонких ногах. Она бродила по мелководью.' },
      { key: 'vincelestes', name: 'Винцелест', text: 'Это винцелест — небольшой зверёк с длинным хвостом. Он жил рядом с амаргазавром.' },
      { key: 'bonapartenykus', name: 'Бонапартеникус', text: 'Это бонапартеникус — родственник патагоникуса. Рядом с его скелетом нашли яйца!' },
      { key: 'quilmesaurus', name: 'Кильмезавр', text: 'Это кильмезавр — хищник, родственник карнотавра.' },
      { key: 'saltasaurus', name: 'Сальтазавр', text: 'Это сальтазавр — длинношеий динозавр в костяной броне.' },
      // the sixth wave (Europe)
      { key: 'eotyrannus', name: 'Эотираннус', text: 'Это эотираннус — ранний родственник тираннозавра. Он был намного меньше, а руки у него были длинные.' },
      { key: 'valdosaurus', name: 'Вальдозавр', text: 'Это вальдозавр — стройный травоядный динозавр. Он быстро бегал на двух ногах.' },
      { key: 'istiodactylus', name: 'Истиодактиль', text: 'Это истиодактиль — летающий ящер с короткой круглой мордой и мелкими острыми зубами.' },
      { key: 'goniopholis', name: 'Гониофолис', text: 'Это гониофолис — родственник крокодилов. Он подстерегал добычу у воды.' },
      { key: 'brighstoneus', name: 'Брайстоунеус', text: 'Это брайстоунеус — большой травоядный динозавр с раздутым носом. Его описали только в 2021 году.' },
      { key: 'riparovenator', name: 'Рипаровенатор', text: 'Это рипаровенатор — родственник барионикса. Его имя значит «охотник с речного берега».' },
      { key: 'iberomesornis', name: 'Иберомезорнис', text: 'Это иберомезорнис — древняя птица размером с воробья. На крыльях у неё были пальцы с коготками.' },
      { key: 'concornis', name: 'Конкорнис', text: 'Это конкорнис — древняя птица размером со скворца. Она жила у озера.' },
      { key: 'europejara', name: 'Европеяра', text: 'Это европеяра — беззубый летающий ящер с гребнем под клювом, родственница тапеяры.' },
      { key: 'spinolestes', name: 'Спинолестес', text: 'Это спинолестес — древний зверёк. У него сохранились шерсть, уши и даже маленькие иголки на спине!' },
      { key: 'meyasaurus', name: 'Мейязавр', text: 'Это мейязавр — небольшая ящерица. Она бегала по берегам озера.' },
      { key: 'valdotriton', name: 'Вальдотритон', text: 'Это вальдотритон — маленькая саламандра. Она жила в озере и на его берегах.' },
      { key: 'struthiosaurus', name: 'Струтиозавр', text: 'Это струтиозавр — один из самых маленьких динозавров в броне, длиной около двух с половиной метров.' },
      { key: 'kogaionon', name: 'Когайонон', text: 'Это когайонон — маленький зверёк, похожий на крысу. Он жил на острове Хацег.' },
      { key: 'allodaposuchus', name: 'Аллодапозух', text: 'Это аллодапозух — древний крокодил. Он охотился в реках острова.' },
      { key: 'kallokibotion', name: 'Каллокиботион', text: 'Это каллокиботион — черепаха. Её имя значит «красивая коробочка».' },
      { key: 'eurazhdarcho', name: 'Евраждарх', text: 'Это евраждарх — летающий ящер поменьше. Он ходил по земле на четырёх лапах и ловил мелких зверьков.' },
      { key: 'paralatonia', name: 'Паралатония', text: 'Это паралатония — древняя лягушка с острова Хацег.' },
      // the seventh wave (Australia and Antarctica)
      { key: 'australotitan', name: 'Австралотитан', text: 'Это австралотитан — самый большой динозавр Австралии. Учёные прозвали его «Купер».' },
      { key: 'savannasaurus', name: 'Саваннозавр', text: 'Это саваннозавр — длинношеий динозавр с очень широкими бёдрами.' },
      { key: 'isisfordia', name: 'Исисфордия', text: 'Это исисфордия — маленький древний крокодил, близкий родственник нынешних крокодилов.' },
      { key: 'confractosuchus', name: 'Конфрактозух', text: 'Это конфрактозух — древний крокодил. В его желудке нашли косточки малыша-динозавра!' },
      { key: 'platypterygius', name: 'Платиптеригий', text: 'Это платиптеригий — ихтиозавр, морской ящер, похожий на дельфина.', place: 'sea' },
      { key: 'eromangasaurus', name: 'Эромангазавр', text: 'Это эромангазавр — плезиозавр с длинной шеей из моря Эроманга.', place: 'sea' },
      { key: 'notochelone', name: 'Нотохелон', text: 'Это нотохелон — древняя морская черепаха.', place: 'sea' },
      { key: 'mythunga', name: 'Митунга', text: 'Это митунга — летающий ящер с длинными зубастыми челюстями. Он ловил рыбу в море.' },
      { key: 'koolasuchus', name: 'Кулазух', text: 'Это кулазух — огромное земноводное, похожее на саламандру. Он жил в холодных реках, когда его родственники давно вымерли.' },
      { key: 'qantassaurus', name: 'Квантазавр', text: 'Это квантазавр — маленький травоядный динозавр. Его назвали в честь авиакомпании «Квантас»!' },
      { key: 'atlascopcosaurus', name: 'Атласкопкозавр', text: 'Это атласкопкозавр — маленький травоядный динозавр. Его назвали в честь фирмы, которая дала учёным инструменты для раскопок.' },
      { key: 'timimus', name: 'Тимимус', text: 'Это тимимус — стройный быстрый динозавр. Его назвали в честь Тима, сына учёных, которые его нашли.' },
      { key: 'teinolophos', name: 'Тейнолоф', text: 'Это тейнолоф — крошечный древний зверёк, родственник утконоса.' },
      { key: 'morrosaurus', name: 'Моррозавр', text: 'Это моррозавр — небольшой травоядный динозавр из Антарктиды.' },
      { key: 'trinisaura', name: 'Тринизавра', text: 'Это тринизавра — маленький быстрый травоядный динозавр из Антарктиды.' },
      { key: 'imperobator', name: 'Имперобатор', text: 'Это имперобатор — большой хищник в перьях. Его имя значит «могучий воин».' },
      { key: 'kaikaifilu', name: 'Кайкайфилу', text: 'Это кайкайфилу — огромный мозазавр. Его назвали в честь морского змея из сказок народа мапуче.', place: 'sea' },
      { key: 'aristonectes', name: 'Аристонект', text: 'Это аристонект — плезиозавр. Тонкими зубами-иглами он цедил воду, как сито.', place: 'sea' },
      // the eighth wave (North America, the second package)
      { key: 'daspletosaurus', name: 'Дасплетозавр', text: 'Это дасплетозавр — «пугающий ящер», родственник тираннозавра. Морду у него покрывали крупные чешуи.' },
      { key: 'orodromeus', name: 'Ородромеус', text: 'Это ородромеус — маленький быстрый травоядный динозавр. Его имя значит «горный бегун».' },
      { key: 'hypacrosaurus', name: 'Гипакрозавр', text: 'Это гипакрозавр — утконосый динозавр с высоким гребнем на голове. Учёные нашли его гнёзда с яйцами.' },
      { key: 'bambiraptor', name: 'Бамбираптор', text: 'Это бамбираптор — маленький хищник в перьях. Его скелет нашёл четырнадцатилетний мальчик Уэс Линстер!' },
      { key: 'montanazhdarcho', name: 'Монтанаждархо', text: 'Это монтанаждархо — небольшой летающий ящер. Размах его крыльев — около двух с половиной метров.' },
      { key: 'tenontosaurus', name: 'Тенонтозавр', text: 'Это тенонтозавр — большой травоядный динозавр с очень длинным хвостом. На него охотились дейнонихи.' },
      { key: 'aquilops', name: 'Аквилопс', text: 'Это аквилопс — крошечный родственник трицератопса, размером с ворону.' },
      { key: 'microvenator', name: 'Микровенатор', text: 'Это микровенатор — маленький динозавр в перьях с беззубым клювом.' },
      { key: 'zephyrosaurus', name: 'Зефирозавр', text: 'Это зефирозавр — небольшой быстрый травоядный динозавр. Его имя значит «ящер западного ветра».' },
      { key: 'gobiconodon', name: 'Гобиконодон', text: 'Это гобиконодон — древний зверь размером с кошку. Он охотился на мелких животных.' },
      { key: 'paluxysuchus', name: 'Палаксизух', text: 'Это палаксизух — древний крокодил с широкой плоской мордой.' },
      { key: 'naomichelys', name: 'Наомихелис', text: 'Это наомихелис — древняя черепаха с панцирем, покрытым бугорками.' },
      { key: 'convolosaurus', name: 'Конволозавр', text: 'Это конволозавр — небольшой травоядный динозавр. Учёные нашли вместе много малышей: наверное, они держались стайкой.' },
      { key: 'aquilarhinus', name: 'Аквиларинус', text: 'Это аквиларинус — утконосый динозавр с горбатым носом и широким, как лопата, клювом.' },
      { key: 'agujaceratops', name: 'Агухацератопс', text: 'Это агухацератопс — рогатый динозавр с длинным костяным воротником.' },
      { key: 'baculites', name: 'Бакулит', text: 'Это бакулит — аммонит с прямой раковиной, похожей на палку.', place: 'sea' },
      { key: 'cretoxyrhina', name: 'Кретоксирина', text: 'Это кретоксирина — большая древняя акула, похожая на белую акулу.', place: 'sea' },
      { key: 'ichthyornis', name: 'Ихтиорнис', text: 'Это ихтиорнис — древняя морская птица. У неё был клюв и острые зубы!' },
      // the ninth wave (India)
      { key: 'indosuchus', name: 'Индозух', text: 'Это индозух — хищный динозавр, родственник раджазавра. Его имя значит «индийский крокодил», хотя это динозавр.' },
      { key: 'rahiolisaurus', name: 'Рахиолизавр', text: 'Это рахиолизавр — большой хищник. В одном месте нашли кости сразу семерых рахиолизавров, больших и маленьких.' },
      { key: 'titanosaurus', name: 'Титанозавр', text: 'Это титанозавр — «ящер-титан». В 1877 году его назвали первым из всех динозавров Индии.' },
      { key: 'sanajeh', name: 'Санадж', text: 'Это санадж — змея длиной три с половиной метра. Её нашли окаменевшей прямо в гнезде длинношеего динозавра: она охотилась на малышей!' },
      { key: 'deccanolestes', name: 'Декканолестес', text: 'Это декканолестес — крошечный зверёк. Наверное, он ловко лазал по деревьям.' },
      { key: 'igdabatis', name: 'Игдабатис', text: 'Это игдабатис — древний скат. Его зубы были похожи на плоские плитки — такими скаты давят раковины.', place: 'sea' },
    ];
    // painted neighbours that are the player's own kind in a scene ("такой же, как ты")
    Object.assign(D.nbSp || (D.nbSp = {}), { nb_ankylosaurus: 'ankylo', nb_pachycephalosaurus: 'pachy', nb_styracosaurus: 'styraco', nb_oviraptor: 'ovi',
      nb_protoceratops: 'proto', nb_pinacosaurus: 'pinaco', nb_carcharodontosaurus: 'carcharo', nb_ouranosaurus: 'ourano', nb_nigersaurus: 'nigero',
      nb_saltasaurus: 'salta', nb_baryonyx: 'baryo', nb_hatzegopteryx: 'hatzego', nb_balaur: 'balaur' });
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
      ankylo: ['snort_beast', 0.8], styraco: ['snort_beast', 0.92], pachy: ['grunt_herb', 1.12], ovi: ['chirp_bird', 0.8], yuty: ['roar_big', 0.95],
      giga: ['roar_big', 0.76], sarco: ['hiss_croc', 0.7], magya: ['boom_giant', 1.15], elasmo: ['call_sea', 0.92], quetzal: ['screech_ptero', 0.75],
      nb_alamosaurus: ['boom_giant', 0.7], nb_torosaurus: ['snort_beast', 0.85], nb_ouranosaurus: ['grunt_herb', 0.95], nb_suchomimus: ['roar_big', 1.0],
      nb_nigersaurus: ['boom_giant', 1.0], nb_hatzegopteryx: ['screech_ptero', 0.7], nb_balaur: ['roar_small', 1.15], nb_zalmoxes: ['grunt_herb', 1.25],
      nb_andesaurus: ['boom_giant', 0.85], nb_buitreraptor: ['roar_small', 1.3], nb_najash: ['hiss_croc', 1.5], nb_repenomamus: ['snort_beast', 1.4],
      tarbo: ['roar_big', 0.86], saurolo: ['boom_giant', 1.1], therizino: ['grunt_herb', 0.8], deino: ['boom_giant', 0.95], galli: ['chirp_bird', 0.75],
      proto: ['grunt_herb', 1.15], pinaco: ['snort_beast', 0.95], tsinta: ['boom_giant', 1.18], halszka: ['chirp_bird', 1.3],
      nb_alioramus: ['roar_big', 1.1], nb_nemegtosaurus: ['boom_giant', 0.8], nb_prenocephale: ['grunt_herb', 1.2], nb_tarchia: ['snort_beast', 0.85],
      nb_nemegtomaia: ['chirp_bird', 0.9], nb_avimimus: ['chirp_bird', 1.25], nb_citipati: ['chirp_bird', 0.85], nb_shuvuuia: ['chirp_bird', 1.4],
      nb_zalambdalestes: ['snort_beast', 1.6], nb_zhuchengtyrannus: ['roar_big', 0.8], nb_sinoceratops: ['snort_beast', 0.9], nb_shantungosaurus: ['boom_giant', 0.9],
      majunga: ['roar_big', 0.95], carcharo: ['roar_big', 0.78], masiaka: ['roar_small', 1.0], rahona: ['chirp_bird', 1.15], rapeto: ['boom_giant', 0.74],
      nigero: ['boom_giant', 1.05], simo: ['hiss_croc', 1.35], kapro: ['hiss_croc', 0.95], ourano: ['grunt_herb', 1.0],
      nb_beelzebufo: ['snort_beast', 1.55], nb_mahajangasuchus: ['hiss_croc', 0.9], nb_vorona: ['chirp_bird', 1.2], nb_adalatherium: ['snort_beast', 1.45],
      nb_rugops: ['roar_big', 1.05], nb_laganosuchus: ['hiss_croc', 0.85],
      carno: ['roar_big', 0.9], megara: ['roar_big', 0.85], austro: ['roar_small', 0.9], patagonykus: ['chirp_bird', 1.25], irritator: ['roar_big', 1.0],
      bonaparte: ['boom_giant', 1.05], amarga: ['boom_giant', 0.9], salta: ['boom_giant', 0.95], ptdaustro: ['screech_ptero', 1.1],
      nb_yaminuechelys: ['hiss_croc', 1.5], nb_titanomachya: ['boom_giant', 1.15], nb_kawanectes: ['call_sea', 1.1], nb_patagopelta: ['snort_beast', 1.2],
      nb_aeolosaurus: ['boom_giant', 0.85], nb_unenlagia: ['chirp_bird', 1.0], nb_futalognkosaurus: ['boom_giant', 0.7], nb_tapejara: ['screech_ptero', 1.1],
      nb_anhanguera: ['screech_ptero', 0.95], nb_araripesuchus: ['hiss_croc', 1.3], nb_ligabueino: ['roar_small', 1.4], nb_amargasuchus: ['hiss_croc', 1.0],
      nb_amargastegos: ['snort_beast', 0.9], nb_noasaurus: ['roar_small', 1.2], nb_lectavis: ['chirp_bird', 1.1], nb_vincelestes: ['snort_beast', 1.6],
      nb_bonapartenykus: ['chirp_bird', 1.3], nb_quilmesaurus: ['roar_big', 1.05], nb_saltasaurus: ['boom_giant', 0.95],
      baryo: ['roar_big', 0.95], neoven: ['roar_big', 0.9], polacan: ['snort_beast', 0.85], hypsilo: ['grunt_herb', 1.3], concav: ['roar_big', 0.92],
      pelecan: ['chirp_bird', 0.95], hatzego: ['screech_ptero', 0.65], balaur: ['roar_small', 1.1], telmato: ['boom_giant', 1.15],
      nb_eotyrannus: ['roar_big', 1.15], nb_valdosaurus: ['grunt_herb', 1.3], nb_istiodactylus: ['screech_ptero', 1.0], nb_goniopholis: ['hiss_croc', 1.1],
      nb_brighstoneus: ['grunt_herb', 0.95], nb_riparovenator: ['roar_big', 1.0], nb_iberomesornis: ['chirp_bird', 1.5], nb_concornis: ['chirp_bird', 1.35],
      nb_europejara: ['screech_ptero', 1.2], nb_spinolestes: ['snort_beast', 1.6], nb_meyasaurus: ['hiss_croc', 1.6], nb_valdotriton: ['hiss_croc', 1.7],
      nb_struthiosaurus: ['snort_beast', 1.1], nb_kogaionon: ['snort_beast', 1.6], nb_allodaposuchus: ['hiss_croc', 1.0], nb_kallokibotion: ['hiss_croc', 1.4],
      nb_eurazhdarcho: ['screech_ptero', 1.1], nb_paralatonia: ['snort_beast', 1.7],
      muttab: ['grunt_herb', 0.85], austrov: ['roar_big', 0.95], diamant: ['boom_giant', 0.8], ferrodr: ['screech_ptero', 1.0], kunbarra: ['snort_beast', 1.1],
      krono: ['call_sea', 0.65], leaelly: ['grunt_herb', 1.4], antarcto: ['snort_beast', 0.95], vegavis: ['chirp_bird', 0.9],
      nb_australotitan: ['boom_giant', 0.68], nb_savannasaurus: ['boom_giant', 0.85], nb_isisfordia: ['hiss_croc', 1.35], nb_confractosuchus: ['hiss_croc', 1.1],
      nb_platypterygius: ['call_sea', 1.2], nb_eromangasaurus: ['call_sea', 0.95], nb_notochelone: ['hiss_croc', 1.4], nb_mythunga: ['screech_ptero', 1.15],
      nb_koolasuchus: ['snort_beast', 0.8], nb_qantassaurus: ['grunt_herb', 1.35], nb_atlascopcosaurus: ['grunt_herb', 1.25], nb_timimus: ['chirp_bird', 1.0],
      nb_teinolophos: ['snort_beast', 1.7], nb_morrosaurus: ['grunt_herb', 1.3], nb_trinisaura: ['grunt_herb', 1.4], nb_imperobator: ['roar_small', 0.95],
      nb_kaikaifilu: ['call_sea', 0.75], nb_aristonectes: ['call_sea', 0.9],
      maia: ['grunt_herb', 0.9], troodon: ['roar_small', 1.25], deinony: ['roar_small', 1.05], acro: ['roar_big', 0.85], einio: ['snort_beast', 0.95],
      borealo: ['snort_beast', 0.9], deinosu: ['hiss_croc', 0.8], archelon: ['hiss_croc', 1.0], saurop: ['boom_giant', 0.72],
      nb_daspletosaurus: ['roar_big', 0.95], nb_orodromeus: ['grunt_herb', 1.4], nb_hypacrosaurus: ['grunt_herb', 0.95], nb_bambiraptor: ['roar_small', 1.35],
      nb_montanazhdarcho: ['screech_ptero', 1.15], nb_tenontosaurus: ['grunt_herb', 1.0], nb_aquilops: ['grunt_herb', 1.6], nb_microvenator: ['chirp_bird', 1.2],
      nb_zephyrosaurus: ['grunt_herb', 1.35], nb_gobiconodon: ['snort_beast', 1.5], nb_paluxysuchus: ['hiss_croc', 1.2], nb_naomichelys: ['hiss_croc', 1.5],
      nb_convolosaurus: ['grunt_herb', 1.4], nb_aquilarhinus: ['grunt_herb', 0.9], nb_agujaceratops: ['snort_beast', 0.95], nb_baculites: ['call_sea', 1.4],
      nb_cretoxyrhina: ['call_sea', 1.0], nb_ichthyornis: ['chirp_bird', 1.15],
      raja: ['roar_big', 0.95], laevi: ['roar_small', 1.2], isis: ['boom_giant', 0.8], jaino: ['boom_giant', 0.74], bharat: ['snort_beast', 1.55],
      kurma: ['hiss_croc', 1.55],
      nb_indosuchus: ['roar_big', 1.05], nb_rahiolisaurus: ['roar_big', 0.92], nb_titanosaurus: ['boom_giant', 0.76], nb_sanajeh: ['hiss_croc', 1.65],
      nb_deccanolestes: ['snort_beast', 1.7], nb_igdabatis: ['call_sea', 1.3],
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
    const SMELL = (n, p) => CH(n, 'smell', 'По запаху', 1, { scene: 'smell', p: Object.assign({ prey: 'it_mammal', need: 3, bg: 'bg_forest' }, p), bg: 'bg_forest', pos: '50% 75%', size: '240%',
      say: `Глава ${n}: найди добычу по запаху!` });
    const DUEL = (n) => CH(n, 'duel', 'Поединок рогами', 2, { scene: 'duel', p: { need: 3, bg: 'bg_valley' }, bg: 'bg_valley', pos: '50% 70%', size: '240%',
      say: `Глава ${n}: померься силой с другим трицератопсом!` });
    const CALLS = (n) => CH(n, 'calls', 'Перекличка', 1, { scene: 'calls', p: { rounds: 4, bg: 'bg_valley' }, bg: 'bg_valley', pos: '50% 60%', size: '240%',
      say: `Глава ${n}: повтори песню стада!` });
    const THERMAL = (n) => CH(n, 'thermal', 'Восходящий поток', 2, { scene: 'thermal', p: { bg: 'bg_lagoon' }, bg: 'bg_lagoon', pos: '50% 30%', size: '240%',
      say: `Глава ${n}: поднимайся в тёплых потоках под облаками!` });
    // the second wave: hide from a hunter among the ferns, a stalk of a bigger prey, a pachycephalosaur head-push,
    // and the two new games of js/scenes7.js — brooding the eggs in a cold wind and the long neck of the elasmosaurus
    const HIDE = (n, hunter, name, gen, o) => CH(n, 'sneak', 'Прячься!', 2, { scene: 'sneak', p: Object.assign({ mode: 'hide', hunter, hunterName: name, item: 'it_fern', bg: 'bg_forest' }, o),
      bg: (o && o.bg) || 'bg_forest', pos: '45% 75%', size: '260%', say: `Глава ${n}: прокрадись мимо ${gen}!` });
    const STALK = (n, prey, acc, pw, bg) => CH(n, 'sneak', 'Тихая охота', 2, { scene: 'sneak', p: { mode: 'hunt', prey, pw, bg }, bg, pos: '40% 80%', size: '260%',
      say: `Глава ${n}: подкрадись к ${acc}, пока он не смотрит!` });
    const BUTT = (n) => CH(n, 'duel', 'Поединок', 2, { scene: 'duel', bg: 'bg_valley', pos: '50% 70%', size: '240%',
      p: { need: 3, bg: 'bg_valley', contact: [1150, 45], gap: 6,
        intro: ['Два молодых пахицефалозавра упёрлись куполами! Нажимай быстро-быстро — и толкай соперника назад!', 'Нажимай быстро-быстро — толкай соперника назад!'],
        win: 'Победа! Пахицефалозавры мерились силой, упираясь костяными куполами.' },
      say: `Глава ${n}: померься силой с другим пахицефалозавром!` });
    const BROOD = (n) => CH(n, 'brood', 'Высиживание', 3, { scene: 'brood', p: { need: 6, bg: 'bg_run' }, bg: 'bg_run', pos: '50% 70%', size: '240%',
      say: `Глава ${n}: дует холодный ветер — укрой яйца крыльями!` });
    const NECK = (n) => CH(n, 'neck', 'Длинная шея', 1, { scene: 'neck', p: { need: 6, bg: 'bg_sea' }, bg: 'bg_sea', pos: '50% 45%', size: '240%',
      say: `Глава ${n}: подкрадись снизу и поймай рыбу длинной шеей!` });
    // the third wave: running away over logs, and the two new games of js/scenes7.js — the therizinosaur pulls high branches down
    // with its claws, the young armoured and frilled dinosaurs of the Gobi walk through a sandstorm to a shelter
    const RUN = (n, hunter, name, gen) => CH(n, 'escape', 'Убегай!', 2, { scene: 'escape', p: { hunter, hunterName: name, bg: 'bg_run' }, bg: 'bg_run', pos: '50% 70%', size: '240%',
      say: `Глава ${n}: убегай от ${gen} и перепрыгивай брёвна!` });
    const CLAWS = (n) => CH(n, 'claws', 'Когти-серпы', 2, { scene: 'claws', p: { need: 5, bg: 'bg_forest' }, bg: 'bg_forest', pos: '50% 40%', size: '240%',
      say: `Глава ${n}: зацепи высокую ветку когтями и потяни вниз!` });
    const STORM = (n) => CH(n, 'storm', 'Песчаная буря', 1, { scene: 'storm', p: { bg: 'bg_run' }, bg: 'bg_run', pos: '50% 65%', size: '240%',
      say: `Глава ${n}: доведи малышей до укрытия — надвигается песчаная буря!` });
    // the fourth wave, two new games of js/scenes7.js: the nigersaurus mows low plants with its wide muzzle; a young rapetosaurus
    // follows the round tracks of the grown-ups to the water and keeps off the tracks of others
    const MOW = (n) => CH(n, 'mow', 'Газонокосилка', 1, { scene: 'mow', p: { need: 16, bg: 'bg_valley' }, bg: 'bg_valley', pos: '50% 75%', size: '240%',
      say: `Глава ${n}: щипли низкие растения широкой мордой!` });
    // (o: another herd and hunter — the hunter may be a painted neighbour; the texts and the kinds of trails per fork)
    const TRACKS = (n, o) => CH(n, 'tracks', 'По следам', 1, { scene: 'tracks', p: Object.assign({ bg: 'bg_run', end: 'bg_valley', hunter: 'sp_majunga' }, o),
      bg: 'bg_run', pos: '50% 70%', size: '240%', say: `Глава ${n}: найди стадо по следам!` });
    // the fifth wave (South America), the new games of js/scenes7.js: the patagonykus breaks a rotten log with its thumb claw and eats
    // the termites; in the shallows (Scenes.wade) the pterodaustro sieves tiny crustaceans with its bristle jaws (mode 'sieve')
    // and the irritator stands like a heron and snaps the fish that come up under its snout (mode 'snap')
    const TERMITES = (n) => CH(n, 'termites', 'Термиты', 1, { scene: 'termites', p: { need: 3, bg: 'bg_forest' }, bg: 'bg_forest', pos: '50% 75%', size: '240%',
      say: `Глава ${n}: разбей гнилое бревно когтем и съешь термитов!` });
    const SIEVE = (n) => CH(n, 'wade', 'Сито', 1, { scene: 'wade', p: { mode: 'sieve', need: 6, bg: 'bg_lagoon' }, bg: 'bg_lagoon', pos: '50% 70%', size: '240%',
      say: `Глава ${n}: цеди воду клювом-ситом и лови рачков!` });
    const SNAP = (n) => CH(n, 'wade', 'На мелководье', 2, { scene: 'wade', p: { mode: 'snap', need: 6, bg: 'bg_lagoon' }, bg: 'bg_lagoon', pos: '50% 70%', size: '240%',
      say: `Глава ${n}: стой на мелководье, как цапля, и хватай рыбу!` });
    // two young carnotaurs push with their horns (Scenes.duel with its own texts; contact: the horns, sprite px)
    const HORNS = (n) => CH(n, 'duel', 'Поединок рогами', 2, { scene: 'duel', bg: 'bg_valley', pos: '50% 70%', size: '240%',
      p: { need: 3, bg: 'bg_valley', contact: [1340, 28], gap: 22,
        intro: ['Два молодых карнотавра упёрлись рогами! Нажимай быстро-быстро — и толкай соперника назад!', 'Нажимай быстро-быстро — толкай соперника назад!'],
        win: 'Победа! Учёные думают, что карнотавры мерились силой, упираясь рогами.' },
      say: `Глава ${n}: померься силой с другим карнотавром!` });
    // a baryonyx stands in a river with its arms in the water and hooks fish out with its big thumb claws, like a bear
    // (Scenes.wade, mode 'claw'; Charig & Milner: the claw may have gaffed fish); the fish is Lepidotes (Scheenstia), found in its stomach
    const CLAWFISH = (n) => CH(n, 'wade', 'Рыбалка когтем', 2, { scene: 'wade', bg: 'bg_lagoon', pos: '50% 70%', size: '240%',
      p: { mode: 'claw', need: 6, bg: 'bg_lagoon', prey: 'it_lepidotes',
        intro: ['Барионикс стоит в реке, опустив в воду лапы с огромными когтями. Когда рыба подплывёт к когтям, нажимай — коготь подцепит её и выбросит на берег!',
          'Рыба у когтей — жми!'],
        first: 'Есть! Огромный коготь, как крюк, подцепил рыбу.', deep: 'Эта рыба слишком глубоко. Жди, когда она поднимется к когтям.',
        miss: 'Мимо! Жди, когда рыба подплывёт к когтям.', win: 'Отличная рыбалка! Учёные думают, что барионикс мог ловить рыбу когтями, как медведь.' },
      say: `Глава ${n}: лови рыбу огромным когтем!` });
    // the seventh wave (Australia and Antarctica), two new games of js/scenes7.js: a young leaellynasaura finds fern shoots in the polar
    // night with its huge eyes (Scenes.night); a vegavis dives for fish with kicks of its feet and keeps away from a mosasaur (Scenes.dive)
    const POLAR = (n, p) => CH(n, 'night', 'Полярная ночь', 2, { scene: 'night', p: Object.assign({ need: 6, bg: 'bg_caus_night' }, p), bg: 'bg_caus_night',
      pos: '50% 55%', size: '240%', say: `Глава ${n}: найди еду в полярной ночи — огромные глаза видят в темноте!` });
    const DIVING = (n, p) => CH(n, 'dive', 'Ныряльщик', 2, { scene: 'dive', p: Object.assign({ need: 6, bg: 'bg_cant_dive' }, p), bg: 'bg_cant_dive',
      pos: '50% 45%', size: '240%', say: `Глава ${n}: ныряй за рыбой и греби лапами!` });
    // the eighth wave (North America, the second package), the games of js/scenes8.js: a maiasaura mother feeds her babies in the nest
    // (Scenes.care); a troodon hunts small animals at night with its huge eyes (Scenes.night with another item); a deinosuchus waits in
    // the river for animals that come to drink (Scenes.drink); an archelon hatchling crawls to the sea past the crabs (Scenes.tosea) and,
    // grown up, comes ashore at night to lay her eggs (Scenes.lay)
    const FEEDKIDS = (n, p) => CH(n, 'care', 'Заботливая мама', 3, { scene: 'care', p: Object.assign({ need: 6, bg: 'bg_cnam_colony', nest: 'armored' }, p), bg: 'bg_cnam_colony',
      pos: '50% 60%', size: '240%', say: `Глава ${n}: покорми малышей в гнезде!` });
    const NIGHTHUNT = (n, p) => CH(n, 'night', 'Ночная охота', 2, { scene: 'night', p: Object.assign({ need: 5, bg: 'bg_forest', item: 'it_mammal', ih: [40, 52], icon: 'paw', stat: 'Добыча', moon: true, alive: true, snd: 'snap', box: [520, 210],
        missTip: 'Там никого нет. Веди пальцем — так троодон смотрит вокруг — и ищи зверьков.' }, p),
      bg: 'bg_forest', pos: '50% 55%', size: '240%', say: `Глава ${n}: охоться ночью — огромные глаза видят в темноте!` });
    const WATERHOLE = (n, p) => CH(n, 'drink', 'У водопоя', 2, { scene: 'drink', p: Object.assign({ need: 3, bg: 'bg_cnam_estuary' }, p), bg: 'bg_cnam_estuary',
      pos: '50% 60%', size: '240%', say: `Глава ${n}: подкрадись в воде к зверю у водопоя!` });
    const SEARUN = (n, p) => CH(n, 'tosea', 'К морю!', 0, { scene: 'tosea', p: Object.assign({ bg: 'bg_cnam_beach' }, p), bg: 'bg_cnam_beach',
      pos: '30% 70%', size: '240%', say: `Глава ${n}: доберись от гнезда до моря!` });
    const LAYEGGS = (n, p) => CH(n, 'lay', 'Кладка', 3, { scene: 'lay', p: Object.assign({ bg: 'bg_cnam_beach' }, p), bg: 'bg_cnam_beach',
      pos: '50% 70%', size: '240%', say: `Глава ${n}: выйди ночью на берег и отложи яйца!` });
    // the ninth wave (India), the games of js/scenes8.js: a long-necked mother digs a pit in the warm sand with her hind feet, lays her
    // eggs and covers them (Scenes.lay, the walker); a little mammal feeds near its burrow and dives into it when a hunter comes
    // (Scenes.burrow); two young rajasaurs push with their foreheads (Scenes.duel with its own texts; contact: the horn, sprite px)
    const SANDNEST = (n, p) => CH(n, 'lay', 'Гнездо в песке', 3, { scene: 'lay', p: Object.assign({ walker: true, bg: 'bg_run' }, p), bg: 'bg_run',
      pos: '50% 70%', size: '240%', say: `Глава ${n}: вырой ямку в тёплом песке и отложи яйца!` });
    const BURROW = (n, p) => CH(n, 'burrow', 'Норка', 1, { scene: 'burrow', p: Object.assign({ need: 6, bg: 'bg_run', item: 'it_grass' }, p), bg: 'bg_run',
      pos: '50% 70%', size: '240%', say: `Глава ${n}: ешь у норки, а зашуршат кусты — прячься!` });
    const RAJADUEL = (n) => CH(n, 'duel', 'Поединок', 2, { scene: 'duel', bg: 'bg_valley', pos: '50% 70%', size: '240%',
      p: { need: 3, bg: 'bg_valley', contact: [1400, 30], gap: 12,
        intro: ['Два молодых раджазавра упёрлись лбами! Нажимай быстро-быстро — и толкай соперника назад!', 'Нажимай быстро-быстро — толкай соперника!'],
        win: 'Победа! Может быть, раджазавры и правда бодались рогами-шишками.' },
      say: `Глава ${n}: померься силой с другим раджазавром!` });
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
        Object.assign(SANDNEST(5, { climb: 'Мама-аргентинозавр ищет место для гнезда — тёплый сухой песок. Нажимай — она идёт туда.' }),
          { note: 'Недалеко, в Аука-Мауэво, нашли огромное гнездовье титанозавров — тысячи яиц, а в некоторых даже кожу малышей!' }),
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

    /* ================ the second wave: ten more animals */

    /* ---------------- North America */
    cre('ankylo', {
      name: 'Анкилозавр', gen: 'анкилозавра', site: 'hellcreek', kind: 'Травоядный',
      hero: { name: 'Анкилозавр', latin: 'Ankylosaurus magniventris', period: K('68–66 млн лет назад'),
        rows: [['Длина', 'До 8 м'], ['Вес', '4–8 т'], ['Ел', 'Растения'], ['Нашли', 'США']],
        size: 'Длиной с грузовик, а весом как слон',
        desc: 'Анкилозавр — травоядный динозавр в костяной броне с тяжёлой булавой на хвосте. Жил 68–66 миллионов лет назад в Северной Америке.',
        say: 'Анкилозавр — живой танк в костяной броне. Длина до восьми метров.' },
      facts: {
        tail: { part: 'Булава', text: 'На конце хвоста — тяжёлая костяная булава длиной больше полуметра. Взмах — и хищнику не поздоровится!' },
        mouth: { part: 'Клюв', text: 'Спереди — узкий клюв, а за ним маленькие зубы-листочки. Им удобно срывать низкие растения.' },
        body: { part: 'Броня', text: 'Спину покрывают костяные пластины и шипы, а шею — костяные полукольца.' },
        head: { part: 'Находка', text: 'Барнум Браун нашёл его броню рядом со скелетом тираннозавра — и сначала решил, что это броня тираннозавра!' },
        legs: { part: 'Редкость', text: 'Целого скелета анкилозавра так и не нашли. Учёные знают его по черепам, костям и броне.' },
      },
      chapters: [EGG(['legs']),
        Object.assign(FEED(2, 'Папоротники', 'it_fern', 'найди сочные папоротники внизу!', { low: true }), { facts: ['mouth'] }),
        Object.assign(DEF(3, 'sp_trex', 'тираннозавр', 'тираннозавра', { tip: 'Анкилозавр жил рядом с тираннозавром. Тяжёлая булава на хвосте помогала отбиться.' }), { facts: ['tail'] }),
        SEEK(4, NB('edmontosaurus', 'ankylosaurus', 'pachycephalosaurus'), 'bg_valley'),
        Object.assign(NEST(5, 'bg_forest', ['it_mammal', 'it_lizard']), { facts: ['body'] }),
        FIN('bg_valley', '45% 55%')],
      final: { len: 'до 8 м', wt: '4–8 т', say: 'Ура! Твой анкилозавр вырос — настоящий танк в броне! Загляни в музей.' },
    });
    cre('pachy', {
      name: 'Пахицефалозавр', gen: 'пахицефалозавра', site: 'lancecreek', kind: 'Травоядный',
      hero: { name: 'Пахицефалозавр', latin: 'Pachycephalosaurus wyomingensis', period: K('≈70–66 млн лет назад'),
        rows: [['Длина', '≈ 4,5 м'], ['Вес', '≈ 400 кг'], ['Ел', 'Растения'], ['Нашли', 'США']],
        size: 'Длиной с легковую машину',
        desc: 'Пахицефалозавр — двуногий травоядный динозавр с толстым костяным куполом на голове. Жил около 70–66 миллионов лет назад в Северной Америке.',
        say: 'Пахицефалозавр — динозавр с костяным шлемом на голове. Длина около четырёх с половиной метров.' },
      facts: {
        head: { part: 'Купол', text: 'Купол на голове толщиной больше двадцати сантиметров. Имя значит «толстоголовый ящер».' },
        body: { part: 'Вмятины', text: 'На куполах учёные нашли зажившие вмятины. Значит, пахицефалозавры правда бодались!' },
        mouth: { part: 'Еда', text: 'Мелкими зубами он ел низкие растения, семена и плоды.' },
        legs: { part: 'Малыши', text: 'Учёные думают, что у молодых пахицефалозавров купол был ещё плоским и рос вместе с ними.' },
        tail: { part: 'Череп', text: 'Пахицефалозавра знают в основном по черепам: толстый купол сохраняется лучше других костей.' },
      },
      chapters: [EGG(['legs']),
        Object.assign(FEED(2, 'Гинкго', 'it_ginkgo', 'найди листья гинкго!', { low: true }), { facts: ['mouth'] }),
        Object.assign(BUTT(3), { facts: ['body'] }),
        Object.assign(HIDE(4, 'sp_trex', 'тираннозавр', 'тираннозавра'), { facts: ['tail'] }),
        SEEK(5, NB('thescelosaurus', 'leptoceratops', 'ornithomimus'), 'bg_run'),
        FIN('bg_valley', '50% 55%')],
      final: { len: '≈ 4,5 м', wt: '≈ 400 кг', say: 'Ура! Твой пахицефалозавр вырос — с крепким костяным куполом! Загляни в музей.' },
    });
    cre('styraco', {
      name: 'Стиракозавр', gen: 'стиракозавра', site: 'dinopark', kind: 'Травоядный',
      hero: { name: 'Стиракозавр', latin: 'Styracosaurus albertensis', period: K('≈75 млн лет назад'),
        rows: [['Длина', '≈ 5,5 м'], ['Вес', '≈ 3 т'], ['Ел', 'Растения'], ['Нашли', 'Канада']],
        size: 'Размером с большого носорога',
        desc: 'Стиракозавр — рогатый динозавр с длинными шипами на воротнике. Жил около 75 миллионов лет назад в Северной Америке и ел растения.',
        say: 'Стиракозавр — рогатый динозавр с шипастым воротником. Длина около пяти с половиной метров.' },
      facts: {
        head: { part: 'Шипы', text: 'На воротнике — шесть длинных шипов, каждый длиной с руку взрослого человека. Имя значит «ящер с шипами».' },
        mouth: { part: 'Рог', text: 'Рог на носу длиной до шестидесяти сантиметров. А спереди — клюв, как у попугая.' },
        body: { part: 'Стадо', text: 'Кости многих стиракозавров находят вместе. Наверное, они жили стадами.' },
        legs: { part: 'Находка', text: 'Почти целый череп стиракозавра нашли в Канаде и описали в 1913 году.' },
      },
      chapters: [EGG(['legs']),
        Object.assign(FEED(2, 'Обед', 'it_palm', 'найди сочные листья внизу!', { low: true }), { facts: ['mouth'] }),
        Object.assign(RAM(3, 'nb_gorgosaurus', 'горгозавр', 'горгозавра', 'Длинные шипы на воротнике, наверное, помогали стиракозаврам узнавать своих и пугать врагов.'), { facts: ['head'] }),
        Object.assign(SEEK(4, NB('corythosaurus', 'styracosaurus', 'euoplocephalus'), 'bg_forest'), { facts: ['body'] }),
        NEST(5, 'bg_forest', ['it_mammal', 'it_lizard']),
        FIN('bg_valley', '50% 55%')],
      final: { len: '≈ 5,5 м', wt: '≈ 3 т', say: 'Ура! Твой стиракозавр вырос — с рогом и шипастым воротником! Загляни в музей.' },
    });
    cre('elasmo', {
      name: 'Эласмозавр', gen: 'эласмозавра', site: 'niobrara', kind: 'Морской ящер', predator: true, pathBg: 'bg_sea',
      hero: { name: 'Эласмозавр', latin: 'Elasmosaurus platyurus', period: K('≈80 млн лет назад'),
        rows: [['Длина', '≈ 10 м'], ['Шея', '≈ 7 м'], ['Ел', 'Рыбу'], ['Нашли', 'США']],
        size: 'Длиной почти с автобус, и больше половины — шея',
        desc: 'Эласмозавр — морской ящер с очень длинной шеей. Жил около 80 миллионов лет назад в море, которое делило Северную Америку надвое.',
        say: 'Эласмозавр — морской ящер с шеей длиной семь метров!' },
      facts: {
        neck: { part: 'Шея', text: 'В шее эласмозавра — 72 позвонка! А у жирафа всего семь.' },
        head: { part: 'Ошибка', text: 'Учёный Эдвард Коуп сначала приделал голову не к шее, а к хвосту! Другой учёный, Марш, над ним посмеялся.' },
        fins: { part: 'Малыш', text: 'В Канзасе нашли скелет плезиозавра — родственника эласмозавра — с малышом внутри. Значит, они рожали малышей прямо в воде.' },
        body: { part: 'Находка', text: 'Первые кости эласмозавра нашёл в Канзасе военный врач в 1867 году.' },
        tail: { part: 'Зубы', text: 'Длинными тонкими зубами он хватал рыбу и мелких морских животных.' },
      },
      chapters: [BIRTH(1, ['fins']),
        Object.assign(NECK(2), { facts: ['neck'] }),
        Object.assign(SEEK(3, NB('tylosaurus', 'hesperornis', 'xiphactinus'), 'bg_sea'), { facts: ['head'] }),
        Object.assign(CH(4, 'guard', 'Береги малыша', 3, { scene: 'guard', p: { bg: 'bg_sea', mode: 'sea', foes: ['nb_squalicorax'] }, bg: 'bg_sea', pos: '50% 45%', size: '240%',
          say: 'Глава 4: прогони акул от своего малыша!', note: 'Плезиозавры рожали одного большого малыша. Может быть, они заботились о нём, как сейчас киты.' }), { facts: ['body'] }),
        FIN('bg_sea', '50% 50%')],
      final: { len: '≈ 10 м', wt: 'дышал воздухом', wtIcon: 'droplet', say: 'Ура! Твой эласмозавр вырос — с длиннющей шеей! Загляни в музей.' },
    });
    cre('quetzal', {
      name: 'Кетцалькоатль', gen: 'кетцалькоатля', site: 'bigbend', kind: 'Летающий ящер', predator: true, pathBg: 'bg_valley',
      hero: { name: 'Кетцалькоатль', latin: 'Quetzalcoatlus northropi', period: K('≈68–66 млн лет назад'),
        rows: [['Крылья', '10–11 м'], ['Рост', 'С жирафа'], ['Ел', 'Мелких зверей'], ['Нашли', 'США']],
        size: 'Крылья шире, чем у маленького самолёта',
        desc: 'Кетцалькоатль — один из самых больших летающих животных за всю историю Земли. Жил около 68–66 миллионов лет назад в Северной Америке.',
        say: 'Кетцалькоатль — летающий великан. Размах крыльев — как у маленького самолёта!' },
      facts: {
        wings: { part: 'Крылья', text: 'Размах крыльев — десять-одиннадцать метров. Это одно из самых больших летающих животных на свете.' },
        head: { part: 'Клюв', text: 'Длинный клюв без зубов. По земле он ходил на четырёх лапах, как огромный аист, и хватал мелких зверьков.' },
        tail: { part: 'Шея', text: 'Шея длиной около трёх метров. Стоя на земле, кетцалькоатль был ростом с жирафа!' },
        body: { part: 'Имя', text: 'Его назвали в честь Кетцалькоатля — пернатого змея из легенд ацтеков.' },
      },
      chapters: [EGG(['body']),
        Object.assign(FLAP(2), { bg: 'bg_valley', p: { prey: 'it_dragonfly', need: 8, bg: 'bg_valley' } }),
        Object.assign(THERMAL(3), { bg: 'bg_valley', p: { bg: 'bg_valley', where: 'над равниной', dat: 'Кетцалькоатлю' }, facts: ['wings'] }),
        Object.assign(SEEK(4, ['nb_alamosaurus', 'nb_torosaurus', 'trex'], 'bg_valley'), { facts: ['head'] }),
        Object.assign(NEST(5, 'bg_run', ['it_mammal', 'it_lizard'], 'Летающие ящеры зарывали яйца в тёплый песок. В Китае нашли больше двухсот яиц в одном месте.'), { facts: ['tail'] }),
        FIN('bg_valley', '50% 40%')],
      final: { len: 'крылья 10–11 м', wt: 'ростом с жирафа', wtIcon: 'feather', say: 'Ура! Твой кетцалькоатль вырос — летающий великан! Загляни в музей.' },
    });

    /* ---------------- Asia */
    cre('ovi', {
      name: 'Овираптор', gen: 'овираптора', site: 'flamingcliffs', kind: 'Пернатый динозавр', predator: true, pathBg: 'bg_run',
      hero: { name: 'Овираптор', latin: 'Oviraptor philoceratops', period: K('≈75 млн лет назад'),
        rows: [['Длина', '≈ 1,8 м'], ['Вес', '≈ 35 кг'], ['Зубы', 'Нет'], ['Нашли', 'Монголия']],
        size: 'Размером с эму',
        desc: 'Овираптор — пернатый динозавр с крепким клювом без зубов. Жил около 75 миллионов лет назад в Азии и высиживал свои яйца, как птица.',
        say: 'Овираптор — пернатый динозавр с клювом, как у попугая. Длина около двух метров.' },
      facts: {
        tail: { part: 'Имя', text: 'В 1923 году его нашли прямо на гнезде и решили, что он воровал яйца. Имя «овираптор» значит «похититель яиц».' },
        body: { part: 'Заботливый', text: 'Потом в таком же яйце нашли малыша-овирапторида. Значит, яйца были свои — он их высиживал!' },
        head: { part: 'Клюв', text: 'Зубов нет — только крепкий клюв, как у попугая.' },
        legs: { part: 'Обед', text: 'Внутри скелета первого овираптора нашли косточки ящерицы — наверное, это был его обед.' },
      },
      chapters: [EGG(['head']),
        Object.assign(CHASE(2, 'it_lizard', 'ящериц'), { facts: ['legs'] }),
        Object.assign(SEEK(3, NB('protoceratops', 'oviraptor', 'pinacosaurus'), 'bg_run'), { facts: ['tail'] }),
        Object.assign(BROOD(4), { facts: ['body'] }),
        FIN('bg_run', '45% 55%')],
      final: { len: '≈ 1,8 м', wt: '≈ 35 кг', say: 'Ура! Твой овираптор вырос и бережёт свои яйца! Загляни в музей.' },
    });
    cre('yuty', {
      name: 'Ютираннус', gen: 'ютираннуса', site: 'liaoning', kind: 'Хищник', predator: true, pathBg: 'bg_forest',
      hero: { name: 'Ютираннус', latin: 'Yutyrannus huali', period: K('≈125 млн лет назад'),
        rows: [['Длина', '≈ 9 м'], ['Вес', '≈ 1,4 т'], ['Ел', 'Мясо'], ['Нашли', 'Китай']],
        size: 'Длиной почти с автобус',
        desc: 'Ютираннус — большой хищный динозавр, весь покрытый перьями. Родственник тираннозавра. Жил около 125 миллионов лет назад в Китае.',
        say: 'Ютираннус — пернатый тиран. Длина около девяти метров.' },
      facts: {
        body: { part: 'Перья', text: 'Тело покрывали длинные перья-пушинки до двадцати сантиметров. Это самый большой динозавр, у которого нашли перья.' },
        tail: { part: 'Имя', text: 'Имя значит «красивый пернатый тиран». «Ю» по-китайски — перо.' },
        legs: { part: 'Трое вместе', text: 'Учёные нашли сразу три скелета ютираннуса в одном месте. Может быть, они охотились вместе.' },
        head: { part: 'Шуба', text: 'В Ляонине тогда бывало прохладно. Перья, наверное, грели ютираннуса, как шуба.' },
      },
      chapters: [EGG(['tail']),
        Object.assign(CHASE(2, 'it_mammal', 'зверьков', 'bg_forest'), { facts: ['head'] }),
        Object.assign(STALK(3, 'nb_psittacosaurus', 'пситтакозавру', 220, 'bg_forest'), { facts: ['legs'] }),
        Object.assign(SEEK(4, NB('sinosauropteryx', 'confuciusornis', 'psittacosaurus'), 'bg_forest'), { facts: ['body'] }),
        NEST(5, 'bg_forest', ['nb_repenomamus', 'it_lizard'], 'Репеномам — зверь размером с барсука. В животе одного репеномама нашли косточки детёныша динозавра.'),
        FIN('bg_forest', '50% 45%')],
      final: { len: '≈ 9 м', wt: '≈ 1,4 т', say: 'Ура! Твой ютираннус вырос — большой и пушистый! Загляни в музей.' },
    });

    /* ---------------- Africa: the rivers of Gadoufaoua */
    cre('sarco', {
      name: 'Саркозух', gen: 'саркозуха', site: 'gadoufaoua', kind: 'Древний крокодил', predator: true,
      hero: { name: 'Саркозух', latin: 'Sarcosuchus imperator', period: K('≈112 млн лет назад'),
        rows: [['Длина', 'До 11 м'], ['Вес', 'До 8 т'], ['Ел', 'Рыбу и мясо'], ['Нашли', 'Нигер']],
        size: 'Длиной почти с автобус',
        desc: 'Саркозух — огромный древний крокодил, его называют «суперкрок». Жил около 112 миллионов лет назад в реках Африки.',
        say: 'Саркозух — суперкрокодил длиной до одиннадцати метров!' },
      facts: {
        head: { part: 'Шишка', text: 'На конце длинной морды — большая шишка. Зачем она была нужна, учёные пока не знают.' },
        tail: { part: 'Имя', text: '«Саркозух» значит «мясной крокодил», а второе имя — «император».' },
        body: { part: 'Долгая жизнь', text: 'Саркозух рос всю жизнь. Чтобы стать огромным, ему нужно было лет пятьдесят!' },
        legs: { part: 'Не динозавр', text: 'Саркозух — не динозавр, а родственник крокодилов. Он мог охотиться и на динозавров, которые приходили к реке.' },
      },
      chapters: [EGG(['tail']),
        Object.assign(SWIM(2, 'В реке', ['it_fish'], 8, 'плыви по реке, лови рыбу и не забывай дышать!'), { facts: ['head'] }),
        Object.assign(WATERHOLE(3, { bg: 'bg_cafr_drink', wy: 387, prey: ['nb_ouranosaurus', 'nb_nigersaurus'], pw: { nb_ouranosaurus: 330, nb_nigersaurus: 370 },
          intro: ['Саркозух прячется в реке — видны только глаза и ноздри. Держи палец — он тихо подплывает. Когда зверь на берегу поднимает голову, отпусти и замри!',
            'Держи палец — подплывай. Поднял голову — замри!'],
          first: 'Есть! Саркозух был таким огромным, что мог охотиться даже на динозавров.',
          win: 'Отличная охота! Наверное, саркозух подстерегал у воды и рыбу, и динозавров, как нынешние крокодилы.' }),
          { bg: 'bg_cafr_drink', facts: ['body'] }),
        Object.assign(SEEK(4, NB('ouranosaurus', 'nigersaurus', 'suchomimus'), 'bg_valley'), { facts: ['legs'] }),
        NEST(5, 'bg_valley', ['it_mammal', 'it_lizard'], 'Крокодилы и сейчас охраняют свои гнёзда, а потом помогают малышам добраться до воды.'),
        FIN('bg_valley', '50% 60%')],
      final: { len: 'до 11 м', wt: 'до 8 т', say: 'Ура! Твой саркозух вырос — настоящий суперкрок! Загляни в музей.' },
    });

    /* ---------------- South America: El Chocón, a little older than the giants of Plaza Huincul */
    cre('giga', {
      name: 'Гиганотозавр', gen: 'гиганотозавра', site: 'neuquen', kind: 'Хищник', predator: true,
      hero: { name: 'Гиганотозавр', latin: 'Giganotosaurus carolinii', period: K('≈98 млн лет назад'),
        rows: [['Длина', '12–13 м'], ['Вес', '6–8 т'], ['Ел', 'Мясо'], ['Нашли', 'Аргентина']],
        size: 'Длиной с автобус',
        desc: 'Гиганотозавр — один из самых больших хищных динозавров. Жил около 98 миллионов лет назад в Южной Америке.',
        say: 'Гиганотозавр — гигантский южный ящер. Длина двенадцать-тринадцать метров — как у тираннозавра!' },
      facts: {
        legs: { part: 'Находка', text: 'В 1993 году любитель окаменелостей Рубен Каролини ехал по пустыне на багги и заметил огромную кость ноги.' },
        tail: { part: 'Имя', text: 'Имя значит «гигантский южный ящер». А второе имя дали в честь Каролини, который его нашёл.' },
        head: { part: 'Зубы', text: 'Череп длиной почти со взрослого человека, а зубы плоские и острые, как ножи.' },
        body: { part: 'Соседи', text: 'Его часто рисуют рядом с аргентинозавром, но аргентинозавр жил на несколько миллионов лет позже.' },
      },
      chapters: [EGG(['legs']),
        Object.assign(CHASE(2, 'it_lizard', 'ящериц'), { facts: ['head'] }),
        Object.assign(STALK(3, 'nb_buitreraptor', 'буитрераптору', 210, 'bg_run'), { facts: ['tail'] }),
        Object.assign(SEEK(4, NB('andesaurus', 'buitreraptor', 'najash'), 'bg_valley'), { facts: ['body'] }),
        NEST(5, 'bg_valley', ['it_mammal', 'it_lizard']),
        FIN('bg_valley', '45% 55%')],
      final: { len: '12–13 м', wt: '6–8 т', say: 'Ура! Твой гиганотозавр вырос — гигантский южный ящер! Загляни в музей.' },
    });

    /* ---------------- Europe: Hațeg, the island of dwarfs */
    cre('magya', {
      name: 'Магиарозавр', gen: 'магиарозавра', site: 'hateg', kind: 'Травоядный', pathBg: 'bg_forest',
      hero: { name: 'Магиарозавр', latin: 'Magyarosaurus dacus', period: K('≈70 млн лет назад'),
        rows: [['Длина', '≈ 6 м'], ['Вес', '≈ 1 т'], ['Ел', 'Растения'], ['Нашли', 'Румыния']],
        size: 'Длиной как маршрутка, а весом с быка',
        desc: 'Магиарозавр — один из самых маленьких длинношеих динозавров. Жил около 70 миллионов лет назад на острове в тёплом море, там, где теперь Румыния.',
        say: 'Магиарозавр — карлик среди великанов. Длина около шести метров.' },
      facts: {
        body: { part: 'Карлик', text: 'Его родственники были длиной с несколько автобусов, а он — всего шесть метров. На маленьком острове еды было мало.' },
        tail: { part: 'Барон Нопча', text: 'Первым догадался, что динозавры острова — карлики, барон Франц Нопча больше ста лет назад.' },
        legs: { part: 'Взрослый', text: 'Учёные изучили его кости под микроскопом: это взрослые животные, а не малыши.' },
        neck: { part: 'Пластинки', text: 'На его коже были небольшие костяные пластинки.' },
      },
      chapters: [EGG(['legs']),
        Object.assign(FEED(2, 'Листья', 'it_palm', 'дотянись до сочных листьев!'), { facts: ['neck'] }),
        Object.assign(RAM(3, 'nb_hatzegopteryx', 'хацегоптерикс', 'хацегоптерикса', 'На острове не было больших хищных динозавров. Главным хищником был огромный летающий ящер хацегоптерикс.'), { facts: ['body'] }),
        Object.assign(SEEK(4, NB('hatzegopteryx', 'zalmoxes', 'balaur'), 'bg_forest'), { facts: ['tail'] }),
        NEST(5, 'bg_forest', ['it_lizard', 'it_mammal'], 'В Хацеге нашли кладки яиц длинношеих динозавров. Может быть, это яйца магиарозавра.'),
        FIN('bg_forest', '50% 50%')],
      final: { len: '≈ 6 м', wt: '≈ 1 т', say: 'Ура! Твой магиарозавр вырос — маленький великан с острова! Загляни в музей.' },
    });

    /* ---------------- Asia, the third wave: the rivers of Nemegt and Altan Uul */
    const GOBI_N = NB('nemegtosaurus', 'alioramus', 'tarchia'), GOBI_A = NB('prenocephale', 'nemegtomaia', 'avimimus');
    cre('tarbo', {
      name: 'Тарбозавр', gen: 'тарбозавра', site: 'nemegt', kind: 'Хищник', predator: true, pathBg: 'bg_valley',
      hero: { name: 'Тарбозавр', latin: 'Tarbosaurus bataar', period: K('≈70 млн лет назад'),
        rows: [['Длина', 'До 10 м'], ['Вес', '≈ 5 т'], ['Ел', 'Мясо'], ['Нашли', 'Монголия']],
        size: 'Длиной почти с автобус',
        desc: 'Тарбозавр — самый большой хищник Азии конца мелового периода и близкий родственник тираннозавра. Жил около 70 миллионов лет назад там, где теперь пустыня Гоби.',
        say: 'Тарбозавр — азиатский родственник тираннозавра. Длина до десяти метров.' },
      facts: {
        head: { part: 'Имя', text: 'Его нашла советско-монгольская экспедиция в 1946 году. Имя «тарбозавр» значит «устрашающий ящер».' },
        body: { part: 'Малыш', text: 'Нашли и скелет совсем юного тарбозавра. Малыш был стройным и лёгким — наверное, охотился на мелкую добычу.' },
        legs: { part: 'Руки', text: 'Руки у тарбозавра — самые маленькие среди всех больших тираннозавров, всего с двумя пальцами.' },
        mouth: { part: 'Следы зубов', text: 'На кости руки завролофа нашли следы зубов тарбозавра. Значит, он не только охотился, но и подъедал то, что находил.' },
      },
      chapters: [EGG(['head']),
        Object.assign(CHASE(2, 'it_mammal', 'зверьков'), { facts: ['body'] }),
        Object.assign(STALK(3, 'nb_prenocephale', 'преноцефале', 230, 'bg_forest'), { facts: ['legs'] }),
        Object.assign(SEEK(4, GOBI_N, 'bg_valley'), { facts: ['mouth'] }),
        NEST(5, 'bg_forest', ['it_mammal', 'it_lizard']),
        FIN('bg_valley', '50% 50%')],
      final: { len: 'До 10 м', wt: '≈ 5 т', say: 'Ура! Твой тарбозавр вырос — гроза долины Немегт! Загляни в музей.' },
    });
    cre('saurolo', {
      name: 'Завролоф', gen: 'завролофа', site: 'nemegt', kind: 'Травоядный', pathBg: 'bg_valley',
      hero: { name: 'Завролоф', latin: 'Saurolophus angustirostris', period: K('≈70 млн лет назад'),
        rows: [['Длина', '≈ 12 м'], ['Вес', 'До 11 т'], ['Ел', 'Растения'], ['Нашли', 'Монголия']],
        size: 'Длиной с автобус',
        desc: 'Завролоф — большой утконосый динозавр с острым гребнем-шипом на голове. Жил около 70 миллионов лет назад там, где теперь Монголия.',
        say: 'Завролоф — утконосый динозавр с гребнем-шипом. Длина около двенадцати метров.' },
      facts: {
        head: { part: 'Гребень', text: 'Гребень — это длинный костяной шип, который торчал с макушки назад. Имя «завролоф» значит «ящер с гребнем».' },
        body: { part: 'Самый частый', text: 'В Немегте завролофов находят чаще всех: почти каждая пятая находка — это он!' },
        legs: { part: 'Малыши', text: 'В месте под названием «Могила дракона» нашли малышей завролофа. Гребня у них ещё не было.' },
        tail: { part: 'Два материка', text: 'Завролофов нашли и в Монголии, и в Канаде. Он один из немногих динозавров, которые жили и в Азии, и в Америке.' },
      },
      chapters: [EGG(['head']),
        Object.assign(FEED(2, 'Ветки', 'it_twig2', 'дотянись до свежих веток!', { bg: 'bg_forest' }), { facts: ['tail'] }),
        Object.assign(RAM(3, 'sp_tarbo', 'тарбозавр', 'тарбозавра'), { facts: ['body'] }),
        Object.assign(SEEK(4, GOBI_N, 'bg_valley'), { facts: ['legs'] }),
        NEST(5, 'bg_valley', ['it_mammal', 'it_lizard'], 'Малышей завролофа нашли там, где была песчаная отмель у реки. Наверное, здесь было их гнездо.'),
        FIN('bg_valley', '50% 50%')],
      final: { len: '≈ 12 м', wt: 'До 11 т', say: 'Ура! Твой завролоф вырос — с настоящим гребнем-шипом! Загляни в музей.' },
    });
    cre('therizino', {
      name: 'Теризинозавр', gen: 'теризинозавра', site: 'nemegt', kind: 'Травоядный', pathBg: 'bg_forest',
      hero: { name: 'Теризинозавр', latin: 'Therizinosaurus cheloniformis', period: K('≈70 млн лет назад'),
        rows: [['Длина', '≈ 10 м'], ['Вес', '≈ 5 т'], ['Ел', 'Растения'], ['Нашли', 'Монголия']],
        size: 'Длиной как автобус, а весом как слон',
        desc: 'Теризинозавр — огромный травоядный динозавр с самыми длинными когтями на свете. Жил около 70 миллионов лет назад там, где теперь Монголия.',
        say: 'Теризинозавр — ящер-коса с огромными когтями. Длина около десяти метров.' },
      facts: {
        head: { part: 'Имя', text: 'Сначала нашли только огромные когти и решили, что это ящер, похожий на черепаху. Имя «теризинозавр» значит «ящер-коса».' },
        claws: { part: 'Когти', text: 'Когти на руках длиной около метра — самые длинные когти среди всех животных, какие известны!' },
        body: { part: 'Растения', text: 'С такими когтями он ел растения! Наверное, когтями он притягивал к себе высокие ветки.' },
        tail: { part: 'Загадка', text: 'От теризинозавра пока нашли только руки, ноги и несколько костей. Как он выглядел целиком, учёные узнали по его родственникам.' },
      },
      chapters: [EGG(['head']),
        Object.assign(CLAWS(2), { facts: ['claws'] }),
        Object.assign(HIDE(3, 'sp_tarbo', 'тарбозавр', 'тарбозавра'), { facts: ['body'] }),
        Object.assign(SEEK(4, GOBI_N, 'bg_valley'), { facts: ['tail'] }),
        NEST(5, 'bg_forest', ['it_mammal', 'it_lizard'], 'В Монголии нашли место, где родственники теризинозавра откладывали яйца все вместе — целых пятнадцать кладок рядом!'),
        FIN('bg_forest', '50% 50%')],
      final: { len: '≈ 10 м', wt: '≈ 5 т', say: 'Ура! Твой теризинозавр вырос — когти как серпы! Загляни в музей.' },
    });
    cre('deino', {
      name: 'Дейнохейрус', gen: 'дейнохейруса', site: 'altanuul', kind: 'Всеядный', pathBg: 'bg_valley',
      hero: { name: 'Дейнохейрус', latin: 'Deinocheirus mirificus', period: K('≈70 млн лет назад'),
        rows: [['Длина', '≈ 11 м'], ['Вес', '≈ 6,5 т'], ['Ел', 'Растения и рыбу'], ['Нашли', 'Монголия']],
        size: 'Длиной с автобус, а весом больше слона',
        desc: 'Дейнохейрус — огромный динозавр с длинными руками, горбом на спине и клювом, как у утки. Жил около 70 миллионов лет назад там, где теперь Монголия.',
        say: 'Дейнохейрус — великан с ужасными руками. Длина около одиннадцати метров.' },
      facts: {
        body: { part: 'Ужасная рука', text: 'В 1965 году нашли только огромные руки длиной два с половиной метра. Имя «дейнохейрус» значит «ужасная рука».' },
        head: { part: 'Загадка', text: 'Почти пятьдесят лет учёные гадали, как он выглядел. Только в 2014 году описали целые скелеты: у него был горб и клюв, как у утки!' },
        mouth: { part: 'Обед', text: 'В животе дейнохейруса нашли рыбью чешую и больше тысячи камешков, которые помогали перетирать еду. Он ел растения и рыбу.' },
        tail: { part: 'Вернули', text: 'Череп и ступни одного скелета выкопали тайно и увезли за границу. Их нашли в Европе и вернули в Монголию.' },
      },
      chapters: [EGG(['body']),
        Object.assign(FEED(2, 'Побеги', 'it_shoots', 'наешься сочных побегов у реки!', { low: true, bg: 'bg_lagoon' }), { facts: ['mouth'] }),
        Object.assign(RAM(3, 'sp_tarbo', 'тарбозавр', 'тарбозавра', 'На брюшных рёбрах одного дейнохейруса нашли следы зубов тарбозавра.'), { facts: ['head'] }),
        Object.assign(SEEK(4, GOBI_A, 'bg_valley'), { facts: ['tail'] }),
        FIN('bg_valley', '50% 50%')],
      final: { len: '≈ 11 м', wt: '≈ 6,5 т', say: 'Ура! Твой дейнохейрус вырос — с горбом и ужасными руками! Загляни в музей.' },
    });
    cre('galli', {
      name: 'Галлимим', gen: 'галлимима', site: 'altanuul', kind: 'Всеядный', pathBg: 'bg_run',
      hero: { name: 'Галлимим', latin: 'Gallimimus bullatus', period: K('≈70 млн лет назад'),
        rows: [['Длина', '≈ 6 м'], ['Вес', '≈ 450 кг'], ['Ел', 'Растения и мелких животных'], ['Нашли', 'Монголия']],
        size: 'Длиной больше легковой машины, а весом как корова',
        desc: 'Галлимим — самый большой из динозавров, похожих на страуса. У него был беззубый клюв, длинная шея и быстрые ноги. Жил около 70 миллионов лет назад там, где теперь Монголия.',
        say: 'Галлимим — быстроногий динозавр-страус. Длина около шести метров.' },
      facts: {
        head: { part: 'Имя', text: 'Имя «галлимим» значит «подражающий курице»: позвонки его шеи похожи на куриные.' },
        legs: { part: 'Бегун', text: 'Длинные стройные ноги помогали ему быстро бегать — как страусу.' },
        mouth: { part: 'Клюв', text: 'Зубов не было — только клюв. Учёные до сих пор спорят, что он ел: растения, мелких животных или всё подряд.' },
        tail: { part: 'Вместе', text: 'Учёные нашли вместе кости нескольких галлимимов. Может быть, они бегали стаями.' },
        body: { part: 'Находка', text: 'Первый большой скелет нашла польский палеонтолог Зофья Келан-Яворовская в 1964 году. Он лежал на спине, а череп — под тазом.' },
      },
      chapters: [EGG(['head']),
        Object.assign(CHASE(2, 'it_lizard', 'ящериц'), { facts: ['legs'] }),
        Object.assign(FEED(3, 'Ягоды', 'it_berries', 'дотянись до ягод!', { bg: 'bg_forest' }), { facts: ['mouth'] }),
        Object.assign(RUN(4, 'sp_tarbo', 'тарбозавр', 'тарбозавра'), { facts: ['tail'] }),
        Object.assign(SEEK(5, GOBI_A, 'bg_valley'), { facts: ['body'] }),
        FIN('bg_run', '50% 50%')],
      final: { len: '≈ 6 м', wt: '≈ 450 кг', say: 'Ура! Твой галлимим вырос — быстрый, как ветер! Загляни в музей.' },
    });

    /* ---------------- Asia: the dunes of the Gobi — the Flaming Cliffs and Ukhaa Tolgod */
    cre('proto', {
      name: 'Протоцератопс', gen: 'протоцератопса', site: 'flamingcliffs', kind: 'Травоядный', pathBg: 'bg_run',
      hero: { name: 'Протоцератопс', latin: 'Protoceratops andrewsi', period: K('≈75 млн лет назад'),
        rows: [['Длина', 'До 2,5 м'], ['Вес', '≈ 100 кг'], ['Ел', 'Растения'], ['Нашли', 'Монголия']],
        size: 'Размером с крупную свинью',
        desc: 'Протоцератопс — небольшой родственник трицератопса с клювом и костяным воротником. Жил около 75 миллионов лет назад в пустыне, там, где теперь Гоби.',
        say: 'Протоцератопс — динозавр с клювом и воротником. Длина до двух с половиной метров.' },
      facts: {
        tail: { part: 'Мягкие яйца', text: 'Яйца протоцератопса были мягкими, как у многих ящериц. Учёные узнали это в 2020 году.' },
        head: { part: 'Имя', text: 'Имя «протоцератопс» значит «первая рогатая морда». Настоящих рогов у него не было — только бугорок на носу и воротник.' },
        legs: { part: 'Малыши', text: 'Нашли гнездо, в котором было пятнадцать малышей протоцератопса. Значит, родители заботились о детях.' },
        body: { part: 'Дерущиеся динозавры', text: 'В 1971 году нашли протоцератопса и велоцираптора, которые сражались. Протоцератопс укусил хищника за руку, и обоих засыпало песком.' },
      },
      chapters: [EGG(['tail']),
        Object.assign(FEED(2, 'Кустики', 'it_shrub', 'пощипли низкие кустики!', { low: true, bg: 'bg_run' }), { facts: ['head'] }),
        Object.assign(STORM(3), { facts: ['legs'] }),
        Object.assign(HIDE(4, 'sp_velo', 'велоцираптор', 'велоцираптора', { item: 'it_shrub', bg: 'bg_run' }), { facts: ['body'] }),
        SEEK(5, NB('protoceratops', 'oviraptor', 'pinacosaurus'), 'bg_run'),
        FIN('bg_run', '50% 55%')],
      final: { len: 'До 2,5 м', wt: '≈ 100 кг', say: 'Ура! Твой протоцератопс вырос — с настоящим воротником! Загляни в музей.' },
    });
    cre('pinaco', {
      name: 'Пинакозавр', gen: 'пинакозавра', site: 'flamingcliffs', kind: 'Травоядный', pathBg: 'bg_run',
      hero: { name: 'Пинакозавр', latin: 'Pinacosaurus grangeri', period: K('≈75 млн лет назад'),
        rows: [['Длина', '≈ 5 м'], ['Вес', 'До 1,9 т'], ['Ел', 'Растения'], ['Нашли', 'Монголия и Китай']],
        size: 'Длиной как легковая машина',
        desc: 'Пинакозавр — динозавр в костяной броне с булавой на хвосте. Жил около 75 миллионов лет назад там, где теперь пустыня Гоби.',
        say: 'Пинакозавр — бронированный динозавр с хвостом-булавой. Длина около пяти метров.' },
      facts: {
        body: { part: 'Броня', text: 'Спину покрывали костяные пластинки и шипы. Первого пинакозавра нашли в 1923 году на Огненных скалах.' },
        legs: { part: 'Малыши', text: 'Учёные нашли вместе почти сотню скелетов молодых пинакозавров. А одну группу малышей засыпало песчаной бурей — они лежали, прижавшись друг к другу.' },
        head: { part: 'Взрослые', text: 'Малыши держались вместе, а взрослых пинакозавров вместе не находили. Наверное, взрослые жили поодиночке.' },
        tail: { part: 'Булава', text: 'На конце хвоста — костяная булава. Ею пинакозавр мог отбиваться от хищников.' },
      },
      chapters: [EGG(['body']),
        Object.assign(STORM(2), { facts: ['legs'] }),
        Object.assign(FEED(3, 'Кустики', 'it_shrub', 'пощипли низкие кустики!', { low: true, bg: 'bg_run' }), { facts: ['head'] }),
        Object.assign(DEF(4, 'sp_velo', 'велоцираптор', 'велоцираптора'), { facts: ['tail'] }),
        SEEK(5, NB('protoceratops', 'oviraptor', 'pinacosaurus'), 'bg_run'),
        FIN('bg_run', '50% 55%')],
      final: { len: '≈ 5 м', wt: 'До 1,9 т', say: 'Ура! Твой пинакозавр вырос — в броне и с булавой! Загляни в музей.' },
    });
    cre('halszka', {
      name: 'Халшкараптор', gen: 'халшкараптора', site: 'ukhaatolgod', kind: 'Хищник', predator: true, pathBg: 'bg_run',
      hero: { name: 'Халшкараптор', latin: 'Halszkaraptor escuilliei', period: K('≈75–71 млн лет назад'),
        rows: [['Длина', 'Меньше 1 м'], ['Размер', 'С утку'], ['Ел', 'Рыбу'], ['Нашли', 'Монголия']],
        size: 'Размером с утку',
        desc: 'Халшкараптор — маленький пернатый хищник, родственник велоцираптора. С длинной шеей он был похож на лебедя и, наверное, плавал и ловил рыбу.',
        say: 'Халшкараптор — динозавр-утка, родственник велоцираптора. Размером с утку.' },
      facts: {
        head: { part: 'Имя', text: 'Его назвали в честь польского палеонтолога Гальшки Осмульской.' },
        body: { part: 'Пловец', text: 'Руки у него были похожи на ласты. Наверное, он нырял и плавал, как пингвин или утка.' },
        mouth: { part: 'Зубки', text: 'Во рту много мелких острых зубов — удобно держать скользкую рыбу.' },
        tail: { part: 'Вернули', text: 'Его скелет тайно вывезли из Монголии. Учёные просветили его особыми лучами, убедились, что он настоящий, и вернули домой.' },
      },
      chapters: [EGG(['head']),
        Object.assign(SWIM(2, 'Рыбалка', ['it_fish', 'it_shrimp'], 8, 'ныряй и лови рыбок и рачков!'), { facts: ['body'] }),
        Object.assign(CHASE(3, 'it_lizard', 'ящериц'), { facts: ['mouth'] }),
        Object.assign(SEEK(4, NB('citipati', 'shuvuuia', 'zalambdalestes'), 'bg_run'), { facts: ['tail'] }),
        NEST(5, 'bg_run', ['it_lizard', 'it_mammal']),
        FIN('bg_run', '50% 55%')],
      final: { len: 'Меньше 1 м', wt: 'С утку', wtIcon: 'feather', say: 'Ура! Твой халшкараптор вырос — ловкий пловец! Загляни в музей.' },
    });

    /* ---------------- Asia: the lakes of Shandong */
    cre('tsinta', {
      name: 'Цинтаозавр', gen: 'цинтаозавра', site: 'laiyang', kind: 'Травоядный', pathBg: 'bg_valley',
      hero: { name: 'Цинтаозавр', latin: 'Tsintaosaurus spinorhinus', period: K('≈75 млн лет назад'),
        rows: [['Длина', '≈ 9 м'], ['Вес', '≈ 3 т'], ['Ел', 'Растения'], ['Нашли', 'Китай']],
        size: 'Длиной как два легковых автомобиля',
        desc: 'Цинтаозавр — утконосый динозавр с высоким гребнем на голове. Жил около 75 миллионов лет назад там, где теперь Китай.',
        say: 'Цинтаозавр — утконосый динозавр из Китая. Длина около девяти метров.' },
      facts: {
        tail: { part: 'Имя', text: 'Его назвали в честь китайского города Циндао.' },
        legs: { part: 'Находка', text: 'Цинтаозавра нашли в 1950 году в китайской провинции Шаньдун.' },
        head: { part: 'Единорог', text: 'Сначала от гребня нашли только длинную кость, торчащую вверх, и решили, что у цинтаозавра был рог, как у единорога.' },
        body: { part: 'Гребень', text: 'В 2013 году учёные выяснили: «рог» — это лишь задняя часть большого полого гребня.' },
      },
      chapters: [EGG(['tail']),
        Object.assign(FEED(2, 'Листья', 'it_twig3', 'дотянись до свежих листьев!', { bg: 'bg_forest' }), { facts: ['legs'] }),
        Object.assign(CH(3, 'calls', 'Перекличка', 1, { scene: 'calls', bg: 'bg_valley', pos: '50% 60%', size: '240%',
          p: { rounds: 4, bg: 'bg_valley', crest: [1205, 45],
            intro: 'Стадо цинтаозавров перекликается! Послушай, кто трубит, и нажми на них в том же порядке.',
            win: 'Молодец! Ты повторил песню стада. Может быть, полый гребень помогал цинтаозаврам громко трубить.' },
          say: 'Глава 3: повтори песню стада!' }), { facts: ['body'] }),
        Object.assign(RAM(4, 'nb_zhuchengtyrannus', 'чжучэнтираннус', 'чжучэнтираннуса', 'Чжучэнтираннус — огромный хищник, родственник тираннозавра. Он жил там же, в Шаньдуне.'), { facts: ['head'] }),
        SEEK(5, NB('shantungosaurus', 'sinoceratops', 'zhuchengtyrannus'), 'bg_valley'),
        FIN('bg_valley', '50% 50%')],
      final: { len: '≈ 9 м', wt: '≈ 3 т', say: 'Ура! Твой цинтаозавр вырос — с большим гребнем! Загляни в музей.' },
    });
    /* ---------------- the fourth wave: Madagascar — the dry river plain of Maevarano */
    const MADA_R = NB('beelzebufo', 'mahajangasuchus', 'vorona'), MADA_W = NB('adalatherium', 'vorona', 'beelzebufo');
    cre('majunga', {
      name: 'Маджунгазавр', gen: 'маджунгазавра', site: 'mahajanga', kind: 'Хищник', predator: true, pathBg: 'bg_valley',
      hero: { name: 'Маджунгазавр', latin: 'Majungasaurus crenatissimus', period: K('≈70 млн лет назад'),
        rows: [['Длина', '6–7 м'], ['Вес', '≈ 1 т'], ['Ел', 'Мясо'], ['Нашли', 'Мадагаскар']],
        size: 'Длиной как два легковых автомобиля',
        desc: 'Маджунгазавр — хищный динозавр с короткой широкой мордой и рожком на макушке. Жил около 70 миллионов лет назад на острове Мадагаскар и был там главным хищником.',
        say: 'Маджунгазавр — главный хищник Мадагаскара. Длина шесть-семь метров.' },
      facts: {
        tail: { part: 'Имя', text: 'Первые кости нашли французы в 1895–1896 годах. Имя значит «ящер из Маджунги» — так раньше называли город Махадзанга.' },
        legs: { part: 'Руки', text: 'Руки совсем коротенькие, а пальцы на них крошечные. Зато шея и ноги — крепкие и сильные.' },
        head: { part: 'Рожок', text: 'На макушке — один короткий круглый рожок. Сначала кусок его черепа приняли за костяной купол совсем другого динозавра.' },
        mouth: { part: 'Следы зубов', text: 'На костях рапетозавров нашли следы зубов маджунгазавра. Значит, он ел и длинношеих великанов.' },
        body: { part: 'Рос медленно', text: 'Маджунгазавр рос медленно: чтобы стать взрослым, ему нужно было больше двадцати лет.' },
      },
      chapters: [EGG(['tail']),
        Object.assign(CHASE(2, 'it_lizard', 'ящериц'), { facts: ['legs'] }),
        Object.assign(STALK(3, 'nb_adalatherium', 'адалатерию', 150, 'bg_forest'), { facts: ['head'] }),
        Object.assign(SEEK(4, MADA_R, 'bg_valley'), { facts: ['mouth'] }),
        NEST(5, 'bg_valley', ['nb_beelzebufo', 'it_lizard'], 'Бельзебуфо — лягушка размером с мяч. Учёные думают, что она могла есть даже малышей динозавров.'),
        FIN('bg_valley', '50% 50%')],
      final: { len: '6–7 м', wt: '≈ 1 т', say: 'Ура! Твой маджунгазавр вырос — главный хищник Мадагаскара! Загляни в музей.' },
    });
    cre('masiaka', {
      name: 'Масиакозавр', gen: 'масиакозавра', site: 'mahajanga', kind: 'Хищник', predator: true, pathBg: 'bg_forest',
      hero: { name: 'Масиакозавр', latin: 'Masiakasaurus knopfleri', period: K('≈70 млн лет назад'),
        rows: [['Длина', '≈ 2 м'], ['Вес', '≈ 20 кг'], ['Ел', 'Мелких животных'], ['Нашли', 'Мадагаскар']],
        size: 'Размером с большую собаку',
        desc: 'Масиакозавр — небольшой хищный динозавр, у которого передние зубы торчали вперёд. Жил около 70 миллионов лет назад на Мадагаскаре.',
        say: 'Масиакозавр — хищник с зубами-вилкой. Длина около двух метров.' },
      facts: {
        tail: { part: 'Музыка', text: 'Его назвали в честь музыканта Марка Нопфлера: когда учёные находили кости, у них играли песни его группы.' },
        mouth: { part: 'Зубы-вилка', text: 'Передние зубы торчат вперёд, как зубья вилки. Наверное, ими удобно хватать скользкую рыбу и мелких зверьков.' },
        head: { part: 'Злой ящер', text: '«Масиака» на языке Мадагаскара значит «злой». Имя «масиакозавр» — «злой ящер».' },
        legs: { part: 'Находка', text: 'Его кости нашли у деревни Беривотра на северо-западе Мадагаскара.' },
      },
      chapters: [EGG(['tail']),
        Object.assign(CHASE(2, 'it_lizard', 'ящериц'), { facts: ['mouth'] }),
        Object.assign(HIDE(3, 'sp_majunga', 'маджунгазавр', 'маджунгазавра', { item: 'it_lizard' }), { facts: ['head'] }),
        Object.assign(SEEK(4, MADA_W, 'bg_forest'), { facts: ['legs'] }),
        NEST(5, 'bg_forest', ['nb_beelzebufo', 'it_lizard']),
        FIN('bg_forest', '50% 55%')],
      final: { len: '≈ 2 м', wt: '≈ 20 кг', say: 'Ура! Твой масиакозавр вырос — быстрый хищник с зубами-вилкой! Загляни в музей.' },
    });
    cre('rahona', {
      name: 'Рахонавис', gen: 'рахонависа', site: 'mahajanga', kind: 'Пернатый динозавр', predator: true, pathBg: 'bg_forest',
      hero: { name: 'Рахонавис', latin: 'Rahonavis ostromi', period: K('≈70 млн лет назад'),
        rows: [['Длина', '≈ 70 см'], ['Размер', 'С ворона'], ['Ел', 'Мелких животных'], ['Нашли', 'Мадагаскар']],
        size: 'Размером с ворона',
        desc: 'Рахонавис — маленький пернатый динозавр с крыльями и серповидным когтем на ноге. Жил около 70 миллионов лет назад на Мадагаскаре.',
        say: 'Рахонавис — пернатый динозавр размером с ворона.' },
      facts: {
        tail: { part: 'Имя', text: 'Имя значит «угроза из облаков». А второе имя дали в честь учёного Джона Острома.' },
        legs: { part: 'Коготь', text: 'На втором пальце каждой ноги — большой коготь-серп, как у велоцираптора.' },
        body: { part: 'Перья', text: 'Рядом нашли кость руки с бугорками, к которым крепились большие перья.' },
        head: { part: 'Полёт', text: 'Учёные спорят: летал рахонавис или только бегал и прыгал. Может быть, он умел летать.' },
        neck: { part: 'Находка', text: 'Его кости нашли в 1995 году прямо среди костей огромного длинношеего динозавра.' },
      },
      chapters: [EGG(['tail']),
        Object.assign(CHASE(2, 'it_roach', 'тараканов'), { facts: ['legs'] }),
        Object.assign(HIDE(3, 'sp_masiaka', 'масиакозавр', 'масиакозавра', { item: 'it_roach' }), { facts: ['body'] }),
        Object.assign(SEEK(4, MADA_W, 'bg_forest'), { facts: ['head'] }),
        NEST(5, 'bg_forest', ['it_lizard', 'it_mammal']),
        FIN('bg_forest', '50% 55%')],
      final: { len: '≈ 70 см', wt: 'С ворона', wtIcon: 'feather', say: 'Ура! Твой рахонавис вырос — пернатый и ловкий! Загляни в музей.' },
    });
    cre('rapeto', {
      name: 'Рапетозавр', gen: 'рапетозавра', site: 'mahajanga', kind: 'Травоядный', pathBg: 'bg_valley',
      hero: { name: 'Рапетозавр', latin: 'Rapetosaurus krausei', period: K('≈70 млн лет назад'),
        rows: [['Длина', '≈ 15 м'], ['Вес', '≈ 10 т'], ['Ел', 'Растения'], ['Нашли', 'Мадагаскар']],
        size: 'Длиной больше автобуса',
        desc: 'Рапетозавр — длинношеий динозавр из семьи титанозавров. Жил около 70 миллионов лет назад на Мадагаскаре, где бывали долгие засухи.',
        say: 'Рапетозавр — длинношеий великан Мадагаскара. Длина около пятнадцати метров.' },
      facts: {
        tail: { part: 'Имя', text: 'Его назвали в честь Рапето — озорного великана из сказок Мадагаскара. А второе имя — в честь учёного Дэвида Краузе.' },
        legs: { part: 'Сам по себе', text: 'Малыши рапетозавров жили сами по себе: родители их не кормили. С первых дней малыш сам ходил и искал еду.' },
        neck: { part: 'Целый скелет', text: 'В 2001 году у рапетозавра впервые нашли почти целый скелет титанозавра вместе с черепом.' },
        body: { part: 'Малыш', text: 'Только что вылупившийся малыш весил около трёх с половиной килограммов, а через несколько недель — уже около сорока!' },
      },
      chapters: [EGG(['tail']),
        Object.assign(TRACKS(2), { facts: ['legs'] }),
        Object.assign(FEED(3, 'Ветки', 'it_twig1', 'дотянись до свежих веток!', { bg: 'bg_forest' }), { facts: ['neck'] }),
        Object.assign(RAM(4, 'sp_majunga', 'маджунгазавр', 'маджунгазавра', 'На костях рапетозавров нашли следы зубов маджунгазавра.'), { facts: ['body'] }),
        SEEK(5, MADA_R, 'bg_valley'),
        FIN('bg_valley', '50% 50%')],
      final: { len: '≈ 15 м', wt: '≈ 10 т', say: 'Ура! Твой рапетозавр вырос — длинношеий великан! Загляни в музей.' },
    });
    cre('simo', {
      name: 'Симозух', gen: 'симозуха', site: 'mahajanga', kind: 'Древний крокодил', pathBg: 'bg_forest',
      hero: { name: 'Симозух', latin: 'Simosuchus clarki', period: K('≈70 млн лет назад'),
        rows: [['Длина', '≈ 75 см'], ['Морда', 'Курносая'], ['Ел', 'Растения'], ['Нашли', 'Мадагаскар']],
        size: 'Длиной с большую кошку',
        desc: 'Симозух — маленький родственник крокодилов с короткой тупой мордой. Он ел растения. Жил около 70 миллионов лет назад на Мадагаскаре.',
        say: 'Симозух — курносый крокодил, который ел растения.' },
      facts: {
        head: { part: 'Курносый', text: 'Морда у него короткая и тупая, как у мопса. Имя «симозух» значит «курносый крокодил».' },
        mouth: { part: 'Зубы-листики', text: 'Зубы похожи на листики клёна. Такими зубами удобно жевать растения, а не мясо.' },
        body: { part: 'Броня', text: 'Спину и хвост покрывали ряды костяных пластинок — как броня.' },
        tail: { part: 'Не динозавр', text: 'Симозух — не динозавр, а дальний родственник крокодилов. Учёные описали его в 2000 году.' },
      },
      chapters: [EGG(['head']),
        Object.assign(FEED(2, 'Папоротники', 'it_fern', 'пощипли низкие папоротники!', { low: true, bg: 'bg_forest' }), { facts: ['mouth'] }),
        Object.assign(HIDE(3, 'sp_majunga', 'маджунгазавр', 'маджунгазавра', { item: 'it_shoots' }), { facts: ['body'] }),
        Object.assign(SEEK(4, MADA_W, 'bg_forest'), { facts: ['tail'] }),
        NEST(5, 'bg_valley', ['it_mammal', 'it_lizard'], 'Крокодилы и сейчас охраняют свои гнёзда, а потом помогают малышам добраться до воды.'),
        FIN('bg_forest', '50% 55%')],
      final: { len: '≈ 75 см', wt: 'ел растения', wtIcon: 'leaf', say: 'Ура! Твой симозух вырос — курносый и в броне! Загляни в музей.' },
    });

    /* ---------------- Africa, the fourth wave: the rivers of Kem Kem and Gadoufaoua, and Iguidi */
    cre('carcharo', {
      name: 'Кархародонтозавр', gen: 'кархародонтозавра', site: 'kemkem', kind: 'Хищник', predator: true, pathBg: 'bg_valley',
      hero: { name: 'Кархародонтозавр', latin: 'Carcharodontosaurus saharicus', period: K('≈95 млн лет назад'),
        rows: [['Длина', '12–13 м'], ['Вес', '6–7 т'], ['Ел', 'Мясо'], ['Нашли', 'Марокко и Алжир']],
        size: 'Длиной с автобус',
        desc: 'Кархародонтозавр — один из самых больших хищных динозавров. Жил около 95 миллионов лет назад в Северной Африке, у огромных рек.',
        say: 'Кархародонтозавр — ящер с зубами акулы. Длина двенадцать-тринадцать метров.' },
      facts: {
        mouth: { part: 'Зубы акулы', text: 'Имя значит «ящер с зубами акулы». Плоские зазубренные зубы длиной до пятнадцати сантиметров похожи на зубы большой белой акулы.' },
        head: { part: 'Череп', text: 'Череп длиной около полутора метров — почти с рост взрослого человека! А мозг внутри был вдвое меньше, чем у тираннозавра.' },
        tail: { part: 'Находка', text: 'Первые зубы нашли в Алжире в 1920-х годах. А в 1995 году Пол Серено нашёл в Марокко огромный череп.' },
        body: { part: 'Соседи', text: 'Он жил у огромных рек рядом со спинозавром. Спинозавр ловил рыбу, а кархародонтозавр, наверное, охотился на суше.' },
      },
      chapters: [EGG(['mouth']),
        Object.assign(CHASE(2, 'it_lizard', 'ящериц'), { facts: ['head'] }),
        Object.assign(HIDE(3, 'sp_spino', 'спинозавр', 'спинозавра', { item: 'it_lizard', bg: 'bg_valley' }), { facts: ['tail'] }),
        Object.assign(SEEK(4, NB('carcharodontosaurus', 'onchopristis', 'alanqa'), 'bg_valley'), { facts: ['body'] }),
        NEST(5, 'bg_forest', ['it_mammal', 'it_lizard']),
        FIN('bg_valley', '50% 50%')],
      final: { len: '12–13 м', wt: '6–7 т', say: 'Ура! Твой кархародонтозавр вырос — ящер с зубами акулы! Загляни в музей.' },
    });
    cre('ourano', {
      name: 'Уранозавр', gen: 'уранозавра', site: 'gadoufaoua', kind: 'Травоядный', pathBg: 'bg_valley',
      hero: { name: 'Уранозавр', latin: 'Ouranosaurus nigeriensis', period: K('≈112 млн лет назад'),
        rows: [['Длина', '7–8 м'], ['Вес', '2–4 т'], ['Ел', 'Растения'], ['Нашли', 'Нигер']],
        size: 'Длиной как два легковых автомобиля',
        desc: 'Уранозавр — травоядный динозавр с плоской мордой и высоким гребнем вдоль спины. Жил около 112 миллионов лет назад там, где теперь пустыня Сахара.',
        say: 'Уранозавр — травоядный динозавр с гребнем на спине. Длина семь-восемь метров.' },
      facts: {
        tail: { part: 'Имя', text: '«Уранозавр» значит «храбрый ящер». Слово «уран» по-арабски значит «смелость», а туареги так называют пустынного варана.' },
        sail: { part: 'Парус', text: 'Вдоль спины тянулись высокие костяные отростки. Учёные спорят: был у него парус из кожи или горб.' },
        legs: { part: 'Шип', text: 'На большом пальце руки — небольшой острый шип.' },
        head: { part: 'Находка', text: 'Два почти целых скелета нашли французские экспедиции Филиппа Таке в пустыне Нигера.' },
      },
      chapters: [EGG(['tail']),
        Object.assign(FEED(2, 'Листья', 'it_cycad', 'найди сочные листья!', { bg: 'bg_valley' }), { facts: ['sail'] }),
        Object.assign(HIDE(3, 'sp_sarco', 'саркозух', 'саркозуха', { bg: 'bg_valley' }), { facts: ['legs'] }),
        Object.assign(SEEK(4, NB('ouranosaurus', 'nigersaurus', 'suchomimus'), 'bg_valley'), { facts: ['head'] }),
        NEST(5, 'bg_valley', ['it_mammal', 'it_lizard']),
        FIN('bg_valley', '50% 50%')],
      final: { len: '7–8 м', wt: '2–4 т', say: 'Ура! Твой уранозавр вырос — с высоким гребнем на спине! Загляни в музей.' },
    });
    cre('nigero', {
      name: 'Нигерзавр', gen: 'нигерзавра', site: 'gadoufaoua', kind: 'Травоядный', pathBg: 'bg_valley',
      hero: { name: 'Нигерзавр', latin: 'Nigersaurus taqueti', period: K('≈112 млн лет назад'),
        rows: [['Длина', '≈ 9 м'], ['Вес', '≈ 4 т'], ['Ел', 'Низкие растения'], ['Нашли', 'Нигер']],
        size: 'Длиной как автобус, а весом как слон',
        desc: 'Нигерзавр — длинношеий динозавр с широкой прямой мордой и сотнями зубов. Жил около 112 миллионов лет назад там, где теперь пустыня Сахара.',
        say: 'Нигерзавр — динозавр-газонокосилка. Длина около девяти метров.' },
      facts: {
        tail: { part: 'Имя', text: 'Имя значит «ящер из Нигера». А второе имя дали в честь Филиппа Таке, который первым нашёл его кости.' },
        mouth: { part: '500 зубов', text: 'Во рту больше пятисот маленьких зубов. Стёртый зуб сменялся новым примерно каждые две недели!' },
        head: { part: 'Тонкий череп', text: 'Кости черепа такие тонкие, что сквозь некоторые просвечивает яркий свет.' },
        body: { part: 'Газонокосилка', text: 'Голову нигерзавр держал у самой земли и щипал папоротники и хвощи. Травы тогда ещё не было!' },
      },
      chapters: [EGG(['tail']),
        Object.assign(MOW(2), { facts: ['mouth'] }),
        Object.assign(RAM(3, 'nb_suchomimus', 'сухомим', 'сухомима', 'Сухомим — хищник с длинной мордой, как у крокодила. Он жил здесь же, в Гадуфауа.'), { facts: ['head'] }),
        Object.assign(SEEK(4, NB('ouranosaurus', 'suchomimus', 'nigersaurus'), 'bg_valley'), { facts: ['body'] }),
        NEST(5, 'bg_valley', ['it_mammal', 'it_lizard']),
        FIN('bg_valley', '50% 50%')],
      final: { len: '≈ 9 м', wt: '≈ 4 т', say: 'Ура! Твой нигерзавр вырос — настоящая газонокосилка! Загляни в музей.' },
    });
    cre('kapro', {
      name: 'Капрозух', gen: 'капрозуха', site: 'iguidi', kind: 'Древний крокодил', predator: true, pathBg: 'bg_valley',
      hero: { name: 'Капрозух', latin: 'Kaprosuchus saharicus', period: K('≈95 млн лет назад'),
        rows: [['Длина', '3–6 м'], ['Клыки', 'Три пары'], ['Ел', 'Мясо'], ['Нашли', 'Нигер']],
        size: 'Длиной с легковой автомобиль',
        desc: 'Капрозух — древний крокодил на длинных ногах, с клыками, как у кабана. Жил около 95 миллионов лет назад там, где теперь пустыня Сахара.',
        say: 'Капрозух — крокодил-кабан с тремя парами клыков.' },
      facts: {
        mouth: { part: 'Клыки', text: 'Из пасти торчат три пары больших клыков, как у кабана. Поэтому его прозвали «крокодил-кабан».' },
        legs: { part: 'Бегун', text: 'Ноги длинные и прямые. Наверное, капрозух охотился на суше и быстро бегал.' },
        head: { part: 'Таран', text: 'Нос покрыт толстой бугристой костью — может быть, он бодался ею, как тараном. А глаза смотрели вперёд.' },
        tail: { part: 'Один череп', text: 'От капрозуха нашли только один череп длиной около полуметра. По нему учёные и узнали, каким он был.' },
      },
      chapters: [EGG(['mouth']),
        Object.assign(CHASE(2, 'it_lizard', 'ящериц'), { facts: ['legs'] }),
        Object.assign(STALK(3, 'it_mammal', 'зверьку', 150, 'bg_valley'), { facts: ['head'] }),
        Object.assign(SEEK(4, NB('rugops', 'laganosuchus', 'carcharodontosaurus'), 'bg_valley'), { facts: ['tail'] }),
        NEST(5, 'bg_valley', ['it_mammal', 'it_lizard'], 'Крокодилы и сейчас охраняют свои гнёзда, а потом помогают малышам добраться до воды.'),
        FIN('bg_valley', '50% 50%')],
      final: { len: '3–6 м', wt: '3 пары клыков', wtIcon: 'paw', say: 'Ура! Твой капрозух вырос — настоящий крокодил-кабан! Загляни в музей.' },
    });
    /* ---------------- the fifth wave: South America — Patagonia (La Colonia, Río Negro, Portezuelo, La Amarga), Salta,
       the lake of San Luis and the lagoon of the Araripe in Brazil */
    const RIO = ['nb_patagopelta', 'nb_aeolosaurus'], PORT = ['nb_unenlagia', 'nb_futalognkosaurus'];
    cre('carno', {
      name: 'Карнотавр', gen: 'карнотавра', site: 'lacolonia', kind: 'Хищник', predator: true, pathBg: 'bg_valley',
      hero: { name: 'Карнотавр', latin: 'Carnotaurus sastrei', period: K('≈72–69 млн лет назад'),
        rows: [['Длина', '≈ 8 м'], ['Вес', '1,3–2 т'], ['Ел', 'Мясо'], ['Нашли', 'Аргентина']],
        size: 'Длиной почти с автобус',
        desc: 'Карнотавр — хищный динозавр с двумя толстыми рогами над глазами. Жил около 70 миллионов лет назад в Патагонии.',
        say: 'Карнотавр — рогатый хищник и быстрый бегун. Длина около восьми метров.' },
      facts: {
        legs: { part: 'Находка', text: 'Скелет нашли в 1984 году на ферме Анхеля Састре — в его честь назвали вид. Рядом лежали отпечатки кожи в мелких чешуйках и бугорках.' },
        tail: { part: 'Бегун', text: 'Мощные мышцы хвоста тянули ноги назад. Наверное, карнотавр был одним из самых быстрых больших хищников.' },
        head: { part: 'Рога', text: 'Над глазами у него торчали два толстых рога, как у быка. Поэтому его и назвали «плотоядный бык».' },
        mouth: { part: 'Морда', text: 'Морда у карнотавра короткая и высокая, а зубы — небольшие.' },
        body: { part: 'Руки', text: 'Руки у карнотавра совсем крошечные — ещё короче, чем у тираннозавра.' },
      },
      chapters: [EGG(['legs']),
        Object.assign(CHASE(2, 'it_mammal', 'зверьков'), { facts: ['tail'] }),
        Object.assign(HORNS(3), { facts: ['head'] }),
        Object.assign(SEEK(4, NB('yaminuechelys', 'titanomachya', 'kawanectes'), 'bg_valley'), { facts: ['mouth'] }),
        NEST(5, 'bg_valley', ['it_mammal', 'it_lizard']),
        FIN('bg_valley', '50% 50%')],
      final: { len: '≈ 8 м', wt: '1,3–2 т', say: 'Ура! Твой карнотавр вырос — рогатый и быстрый! Загляни в музей.' },
    });
    cre('austro', {
      name: 'Австрораптор', gen: 'австрораптора', site: 'rionegro', kind: 'Хищник', predator: true, pathBg: 'bg_valley',
      hero: { name: 'Австрораптор', latin: 'Austroraptor cabazai', period: K('≈70 млн лет назад'),
        rows: [['Длина', '5–6 м'], ['Вес', '≈ 300 кг'], ['Ел', 'Мелкую добычу'], ['Нашли', 'Аргентина']],
        size: 'Длиной как легковой автомобиль',
        desc: 'Австрораптор — большой пернатый родственник велоцираптора с длинной узкой мордой. Жил около 70 миллионов лет назад в Патагонии.',
        say: 'Австрораптор — «южный грабитель». Длина пять-шесть метров.' },
      facts: {
        tail: { part: 'Имя', text: 'Его нашли в 2002 году. Вид назван в честь Эктора Кабасы, который основал музей в городке Ламарке.' },
        legs: { part: 'Коготь', text: 'На каждой ноге — большой загнутый коготь, как у велоцираптора.' },
        head: { part: 'Морда', text: 'Череп длиной восемьдесят сантиметров — длинный и низкий, как у крокодила. А зубы маленькие, конусом.' },
        mouth: { part: 'Рыболов', text: 'Такими зубами удобно держать скользкую рыбу. Может быть, австрораптор её и ловил.' },
        body: { part: 'Руки', text: 'Руки у него были короткие — короче, чем у других родственников велоцираптора.' },
      },
      chapters: [EGG(['tail']),
        Object.assign(CHASE(2, 'it_lizard', 'ящериц'), { facts: ['legs'] }),
        Object.assign(STALK(3, 'sp_bonaparte', 'бонапартезавру', 300, 'bg_valley'), { facts: ['head'] }),
        Object.assign(SEEK(4, ['bonaparte'].concat(RIO), 'bg_valley'), { facts: ['mouth'] }),
        NEST(5, 'bg_valley', ['it_mammal', 'it_lizard']),
        FIN('bg_valley', '50% 50%')],
      final: { len: '5–6 м', wt: '≈ 300 кг', say: 'Ура! Твой австрораптор вырос — большой и пернатый! Загляни в музей.' },
    });
    cre('bonaparte', {
      name: 'Бонапартезавр', gen: 'бонапартезавра', site: 'rionegro', kind: 'Травоядный', pathBg: 'bg_valley',
      hero: { name: 'Бонапартезавр', latin: 'Bonapartesaurus rionegrensis', period: K('≈70 млн лет назад'),
        rows: [['Длина', '≈ 6 м'], ['Вес', '≈ 2 т'], ['Ел', 'Растения'], ['Нашли', 'Аргентина']],
        size: 'Длиной с микроавтобус',
        desc: 'Бонапартезавр — утконосый динозавр. Жил около 70 миллионов лет назад в Патагонии, у берега тёплого моря.',
        say: 'Бонапартезавр — утконосый динозавр из Патагонии. Длина около шести метров.' },
      facts: {
        body: { part: 'Имя', text: 'Его назвали в честь Хосе Бонапарте — аргентинского учёного, который нашёл очень много динозавров.' },
        head: { part: 'Клюв', text: 'Широким клювом, как у утки, он срывал растения, а сотнями плоских зубов перетирал их.' },
        legs: { part: 'Издалека', text: 'Его родня пришла из Северной Америки: тогда два материка на время соединились сушей.' },
        tail: { part: 'Сухожилия', text: 'Вместе с костями нашли окаменевшие сухожилия. Они делали спину и хвост крепкими.' },
        neck: { part: 'Находка', text: 'Кости нашли в 1984 году у солёного озера Салитраль-Морено, а описали только в 2017 году.' },
      },
      chapters: [EGG(['body']),
        Object.assign(FEED(2, 'Папоротники', 'it_fern', 'щипли сочные папоротники!', { low: true, bg: 'bg_valley' }), { facts: ['head'] }),
        Object.assign(RUN(3, 'sp_austro', 'австрораптор', 'австрораптора'), { facts: ['legs'] }),
        Object.assign(SEEK(4, ['austro', 'nb_patagopelta', 'nb_bonapartenykus'], 'bg_valley'), { facts: ['tail'] }),
        NEST(5, 'bg_valley', ['it_mammal', 'it_lizard'], 'Утконосые динозавры строили гнёзда из земли и растений и, наверное, заботились о малышах.'),
        FIN('bg_valley', '50% 50%')],
      final: { len: '≈ 6 м', wt: '≈ 2 т', say: 'Ура! Твой бонапартезавр вырос! Загляни в музей.' },
    });
    cre('megara', {
      name: 'Мегараптор', gen: 'мегараптора', site: 'portezuelo', kind: 'Хищник', predator: true, pathBg: 'bg_forest',
      hero: { name: 'Мегараптор', latin: 'Megaraptor namunhuaiquii', period: K('≈90 млн лет назад'),
        rows: [['Длина', '≈ 8 м'], ['Вес', '≈ 1 т'], ['Ел', 'Мясо'], ['Нашли', 'Аргентина']],
        size: 'Длиной почти с автобус',
        desc: 'Мегараптор — хищный динозавр с огромными когтями на руках. Жил около 90 миллионов лет назад в Патагонии.',
        say: 'Мегараптор — хищник с когтями длиннее линейки!' },
      facts: {
        tail: { part: 'Имя', text: 'Вторая часть его имени — на языке индейцев мапуче. Она значит «нога-копьё».' },
        body: { part: 'Коготь', text: 'Коготь на большом пальце руки — около тридцати пяти сантиметров, длиннее школьной линейки!' },
        legs: { part: 'Ошибка', text: 'Сначала нашли один коготь и решили, что он с ноги, — отсюда имя «огромный вор». А в 2004 году нашли целую руку: коготь был на ней!' },
        head: { part: 'Морда', text: 'В 2014 году нашли череп молодого мегараптора — с длинной узкой мордой.' },
        mouth: { part: 'Охота', text: 'Наверное, мегараптор хватал добычу длинными руками с когтями-крючьями.' },
      },
      chapters: [EGG(['tail']),
        Object.assign(STALK(2, 'sp_patagonykus', 'патагоникусу', 200, 'bg_forest'), { facts: ['body'] }),
        Object.assign(CHASE(3, 'it_lizard', 'ящериц'), { facts: ['legs'] }),
        Object.assign(SEEK(4, ['patagonykus'].concat(PORT), 'bg_valley'), { facts: ['head'] }),
        NEST(5, 'bg_valley', ['it_mammal', 'it_lizard']),
        FIN('bg_valley', '50% 50%')],
      final: { len: '≈ 8 м', wt: '≈ 1 т', say: 'Ура! Твой мегараптор вырос — с огромными когтями! Загляни в музей.' },
    });
    cre('patagonykus', {
      name: 'Патагоникус', gen: 'патагоникуса', site: 'portezuelo', kind: 'Пернатый динозавр', pathBg: 'bg_forest',
      hero: { name: 'Патагоникус', latin: 'Patagonykus puertai', period: K('≈90 млн лет назад'),
        rows: [['Длина', '1–2,5 м'], ['Вес', 'до 30 кг'], ['Ел', 'Насекомых'], ['Нашли', 'Аргентина']],
        size: 'Длиной с велосипед',
        desc: 'Патагоникус — небольшой динозавр с одним большим когтем на каждой короткой руке. Жил около 90 миллионов лет назад в Патагонии и, наверное, ел насекомых.',
        say: 'Патагоникус — «патагонский коготь». Длиной с велосипед.' },
      facts: {
        head: { part: 'Имя', text: 'Патагоникус значит «патагонский коготь». Его описал аргентинский учёный Фернандо Новас в 1996 году.' },
        body: { part: 'Коготь', text: 'Руки короткие и сильные, а на каждой — один большой коготь. Им, как киркой, можно было разбивать гнилые брёвна и термитники.' },
        legs: { part: 'Ноги', text: 'Ноги длинные и стройные — он быстро бегал.' },
        tail: { part: 'Родня', text: 'Его родственники жили даже в Азии — например, маленькая шувуйя из пустыни Гоби.' },
        mouth: { part: 'Еда', text: 'Наверное, патагоникус ел термитов и других насекомых, как муравьед.' },
      },
      chapters: [EGG(['head']),
        Object.assign(TERMITES(2), { facts: ['body'] }),
        Object.assign(HIDE(3, 'sp_megara', 'мегараптор', 'мегараптора'), { facts: ['legs'] }),
        Object.assign(SEEK(4, ['megara'].concat(PORT), 'bg_valley'), { facts: ['tail'] }),
        NEST(5, 'bg_forest', ['it_mammal', 'it_lizard'], 'Рядом со скелетом его родственника бонапартеникуса нашли яйца. Наверное, эти динозавры тоже охраняли свои гнёзда.'),
        FIN('bg_forest', '50% 50%')],
      final: { len: '1–2,5 м', wt: 'до 30 кг', say: 'Ура! Твой патагоникус вырос — с когтями-кирками! Загляни в музей.' },
    });
    cre('irritator', {
      name: 'Ирритатор', gen: 'ирритатора', site: 'araripe', kind: 'Хищник', predator: true, pathBg: 'bg_valley',
      hero: { name: 'Ирритатор', latin: 'Irritator challengeri', period: K('≈112 млн лет назад'),
        rows: [['Длина', '≈ 6,5 м'], ['Вес', '≈ 1 т'], ['Ел', 'Рыбу'], ['Нашли', 'Бразилия']],
        size: 'Длиной как полтора легковых автомобиля',
        desc: 'Ирритатор — родственник спинозавра с длинной мордой, как у крокодила. Жил около 112 миллионов лет назад на берегу лагуны в Бразилии.',
        say: 'Ирритатор — рыболов с мордой крокодила. Длина около шести с половиной метров.' },
      facts: {
        tail: { part: 'Профессор', text: 'Второе имя — в честь профессора Челленджера, героя книги «Затерянный мир».' },
        legs: { part: 'Как цапля', text: 'Он бродил по мелководью, как цапля, и хватал рыбу длинной мордой.' },
        body: { part: 'Охотник', text: 'В шейном позвонке летающего ящера нашли застрявший зуб родственника спинозавра. Наверное, такие хищники ловили и летающих ящеров!' },
        head: { part: 'Имя', text: 'Продавцы окаменелостей «доделали» его череп гипсом и автомобильной шпаклёвкой. Учёные долго счищали подделку и так рассердились, что назвали ящера «раздражающий».' },
        mouth: { part: 'Зубы', text: 'Зубы конусом, без зазубрин — такими удобно держать скользкую рыбу.' },
      },
      chapters: [EGG(['tail']),
        Object.assign(SNAP(2), { facts: ['legs'] }),
        Object.assign(STALK(3, 'nb_tapejara', 'тапеяре', 210, 'bg_run'), { facts: ['body'] }),
        Object.assign(SEEK(4, NB('tapejara', 'anhanguera', 'araripesuchus'), 'bg_valley'), { facts: ['head'] }),
        NEST(5, 'bg_valley', ['it_mammal', 'it_lizard']),
        FIN('bg_valley', '50% 50%')],
      final: { len: '≈ 6,5 м', wt: '≈ 1 т', say: 'Ура! Твой ирритатор вырос — настоящий рыболов! Загляни в музей.' },
    });
    cre('ptdaustro', {
      name: 'Птеродаустро', gen: 'птеродаустро', site: 'sanluis', kind: 'Летающий ящер', predator: true, pathBg: 'bg_lagoon',
      hero: { name: 'Птеродаустро', latin: 'Pterodaustro guinazui', period: K('≈105 млн лет назад'),
        rows: [['Крылья', 'до 2,5 м'], ['Зубов', '≈ 1000'], ['Ел', 'Рачков'], ['Нашли', 'Аргентина']],
        size: 'Крылья шире, чем рост взрослого',
        desc: 'Птеродаустро — летающий ящер с длинным клювом, загнутым вверх. Жил около 105 миллионов лет назад у озера в Аргентине и цедил из воды мелких рачков.',
        say: 'Птеродаустро — летающий ящер с клювом-ситом!' },
      facts: {
        tail: { part: 'Яйцо', text: 'Здесь нашли яйцо птеродаустро с малышом внутри. Скорлупа у него была тонкой и мягкой.' },
        head: { part: 'Сито', text: 'На нижней челюсти — около тысячи тонких щетинок вместо зубов. Он цедил воду, как фламинго, а рачки оставались во рту.' },
        wings: { part: 'Крылья', text: 'Размах крыльев — до двух с половиной метров. Это больше, чем рост взрослого человека.' },
        body: { part: 'Стая', text: 'На одном холме нашли кости больше семисот птеродаустро — и взрослых, и совсем маленьких. Они жили большими стаями у озера.' },
      },
      chapters: [EGG(['tail']),
        Object.assign(SIEVE(2), { facts: ['head'] }),
        Object.assign(THERMAL(3), { bg: 'bg_lagoon', p: { bg: 'bg_lagoon', where: 'над озером', dat: 'Птеродаустро' }, facts: ['wings'] }),
        NEST(4, 'bg_valley', ['it_mammal', 'it_lizard'], 'У птеродаустро были яйца с мягкой скорлупой. Наверное, их зарывали в тёплый песок у озера.'),
        FIN('bg_lagoon', '50% 40%')],
      final: { len: 'крылья до 2,5 м', wt: '≈ 1000 щетинок', wtIcon: 'feather', say: 'Ура! Твой птеродаустро вырос — с клювом-ситом! Загляни в музей.' },
    });
    cre('amarga', {
      name: 'Амаргазавр', gen: 'амаргазавра', site: 'laamarga', kind: 'Травоядный', pathBg: 'bg_valley',
      hero: { name: 'Амаргазавр', latin: 'Amargasaurus cazaui', period: K('≈129–122 млн лет назад'),
        rows: [['Длина', '9–13 м'], ['Вес', '≈ 2,6 т'], ['Ел', 'Низкие растения'], ['Нашли', 'Аргентина']],
        size: 'Длиной с автобус',
        desc: 'Амаргазавр — длинношеий динозавр с двумя рядами высоких шипов на шее. Жил около 125 миллионов лет назад в Патагонии.',
        say: 'Амаргазавр — длинношеий динозавр с шипами на шее!' },
      facts: {
        tail: { part: 'Имя', text: '«Амарга» по-испански значит «горькая» — так называется ручей, у которого его нашли. А второе имя — в честь геолога Луиса Касау.' },
        head: { part: 'Низко', text: 'Шея у него была короткой для длинношеего динозавра. Он щипал низкие растения.' },
        legs: { part: 'Размер', text: 'Длина — от девяти до тринадцати метров: небольшой для длинношеего динозавра.' },
        neck: { part: 'Шипы', text: 'На шее — два ряда высоких шипов, таких нет ни у кого из его родни. Учёные спорят: между ними был кожаный парус или шипы были покрыты рогом.' },
        body: { part: 'Находка', text: 'Скелет нашли в 1984 году. Та же экспедиция Хосе Бонапарте нашла и карнотавра.' },
      },
      chapters: [EGG(['tail']),
        Object.assign(FEED(2, 'Низкие растения', 'it_fern', 'щипли низкие папоротники!', { low: true, bg: 'bg_valley' }), { facts: ['head'] }),
        Object.assign(HIDE(3, 'nb_ligabueino', 'лигабуэйно', 'лигабуэйно'), { facts: ['legs'] }),
        Object.assign(SEEK(4, NB('ligabueino', 'amargasuchus', 'amargastegos'), 'bg_valley'), { facts: ['neck'] }),
        NEST(5, 'bg_valley', ['nb_vincelestes', 'it_lizard'], 'Длинношеие динозавры откладывали яйца в ямки в земле. Мелкие хищники и зверьки могли их разорять.'),
        FIN('bg_valley', '50% 50%')],
      final: { len: '9–13 м', wt: '≈ 2,6 т', say: 'Ура! Твой амаргазавр вырос — с шипами на шее! Загляни в музей.' },
    });
    cre('salta', {
      name: 'Сальтазавр', gen: 'сальтазавра', site: 'salta', kind: 'Травоядный', pathBg: 'bg_valley',
      hero: { name: 'Сальтазавр', latin: 'Saltasaurus loricatus', period: K('≈70 млн лет назад'),
        rows: [['Длина', '≈ 8,5 м'], ['Вес', '≈ 6–7 т'], ['Ел', 'Растения'], ['Нашли', 'Аргентина']],
        size: 'Длиной почти с автобус',
        desc: 'Сальтазавр — небольшой длинношеий динозавр в костяной броне. Жил около 70 миллионов лет назад на севере Аргентины.',
        say: 'Сальтазавр — длинношеий динозавр в броне!' },
      facts: {
        neck: { part: 'Имя', text: 'Сальтазавр значит «ящер из Сальты» — так называется провинция Аргентины. А второе имя значит «в панцире».' },
        legs: { part: 'Семья', text: 'На ферме Эль-Брете нашли кости пяти сальтазавров — двух взрослых и трёх малышей.' },
        head: { part: 'Раскопки', text: 'Его раскопали в 1975–1977 годах Хосе Бонапарте и его друзья, а описали в 1980 году.' },
        tail: { part: 'Путаница', text: 'Сначала такие костяные пластинки приняли за броню анкилозавра — совсем другого динозавра.' },
        body: { part: 'Броня', text: 'Спину покрывали костяные пластинки размером с ладонь и множество мелких косточек. Это первый длинношеий динозавр, у которого нашли броню.' },
      },
      chapters: [EGG(['neck']),
        Object.assign(TRACKS(2, { hunter: 'nb_noasaurus', herd: 'salta',
          rounds: [['round', 'thero'], ['bird', 'round'], ['thero', 'round'], ['round', 'bird', 'thero'], ['bird', 'thero', 'round']],
          intro: ['Малыш отстал от стада! Взрослые сальтазавры оставили большие круглые следы. Нажимай на круглые следы — они приведут к стаду.',
            'Ищи большие круглые следы — они ведут к стаду!'],
          ok: 'Правильно! Это следы сальтазавров. Идём дальше.',
          thero: 'Три пальца с когтями — это следы хищника ноазавра! Ищи большие круглые следы.',
          win: 'Ура! Следы привели к стаду. Взрослые сальтазавры в броне, а малыш теперь рядом с ними.' }), { facts: ['legs'] }),
        Object.assign(FEED(3, 'Листья', 'it_twig2', 'дотянись до свежих листьев!', { bg: 'bg_forest' }), { facts: ['head'] }),
        Object.assign(SEEK(4, NB('saltasaurus', 'noasaurus', 'lectavis'), 'bg_valley'), { facts: ['tail'] }),
        NEST(5, 'bg_valley', ['nb_noasaurus', 'it_lizard'], 'Сальтазавры откладывали круглые яйца в ямки. Взрослые были в броне, а малышей, наверное, защищало стадо.'),
        FIN('bg_valley', '50% 50%')],
      final: { len: '≈ 8,5 м', wt: '≈ 6–7 т', say: 'Ура! Твой сальтазавр вырос — в костяной броне! Загляни в музей.' },
    });
    /* ---------------- Europe: the Weald of England, the lake of Las Hoyas in Spain, Hațeg Island in Romania */
    cre('baryo', {
      name: 'Барионикс', gen: 'барионикса', site: 'smokejacks', kind: 'Хищник', predator: true, pathBg: 'bg_valley',
      hero: { name: 'Барионикс', latin: 'Baryonyx walkeri', period: K('≈125 млн лет назад'),
        rows: [['Длина', '7,5–10 м'], ['Коготь', '≈ 31 см'], ['Ел', 'Рыбу'], ['Нашли', 'Англия']],
        size: 'Длиной почти с автобус',
        desc: 'Барионикс — хищный динозавр с длинной узкой мордой, как у крокодила, и огромными когтями на руках. Жил около 125 миллионов лет назад в Англии.',
        say: 'Барионикс — «тяжёлый коготь». Длина до десяти метров.' },
      facts: {
        claws: { part: 'Коготь', text: 'Коготь на большом пальце руки — длиной около тридцати сантиметров. Отсюда и имя: «барионикс» значит «тяжёлый коготь».' },
        legs: { part: 'Находка', text: 'В 1983 году сантехник Уильям Уокер нашёл в глиняном карьере огромный коготь. Вид назвали в его честь.' },
        head: { part: 'Морда', text: 'Морда длинная и узкая, как у крокодила гавиала, а в ней — множество острых конических зубов.' },
        body: { part: 'Обед', text: 'В животе барионикса нашли рыбью чешую и косточки молодого игуанодона. Он ел и рыбу, и динозавров.' },
        tail: { part: 'Родня', text: 'Барионикс — родственник огромного спинозавра, только без высокого паруса на спине.' },
      },
      chapters: [EGG(['legs']),
        Object.assign(CLAWFISH(2), { facts: ['claws'] }),
        Object.assign(STALK(3, 'nb_mantellisaurus', 'молодому мантеллизавру', 260, 'bg_valley'), { facts: ['body'] }),
        Object.assign(SEEK(4, NB('mantellisaurus', 'goniopholis', 'valdosaurus', 'istiodactylus'), 'bg_valley'), { facts: ['head'] }),
        NEST(5, 'bg_valley', ['nb_goniopholis', 'it_lizard']),
        FIN('bg_valley', '50% 50%')],
      final: { len: '7,5–10 м', wt: 'коготь 31 см', wtIcon: 'ruler', say: 'Ура! Твой барионикс вырос — с огромными когтями! Загляни в музей.' },
    });
    cre('neoven', {
      name: 'Неовенатор', gen: 'неовенатора', site: 'wight', kind: 'Хищник', predator: true, pathBg: 'bg_valley',
      hero: { name: 'Неовенатор', latin: 'Neovenator salerii', period: K('≈125 млн лет назад'),
        rows: [['Длина', '≈ 7 м'], ['Вес', '≈ 1 т'], ['Ел', 'Мясо'], ['Нашли', 'Англия']],
        size: 'Длиной как два легковых автомобиля',
        desc: 'Неовенатор — большой хищный динозавр с острова Уайт. Жил около 125 миллионов лет назад.',
        say: 'Неовенатор — «новый охотник». Длина около семи метров.' },
      facts: {
        legs: { part: 'Находка', text: 'В 1978 году шторм обрушил часть берегового обрыва на острове Уайт — и из камней показались его кости.' },
        head: { part: 'Морда', text: 'Кожа на морде была бугристой, с множеством сосудов и нервов. Может быть, морда у него была очень чувствительной.' },
        body: { part: 'Родня', text: 'Неовенатор — дальний родственник гиганотозавра и кархародонтозавра, только гораздо меньше.' },
        tail: { part: 'Скелет', text: 'Учёные знают почти три четверти его скелета. Это самый полный большой хищник Европы.' },
      },
      chapters: [EGG(['legs']),
        Object.assign(CHASE(2, 'it_lizard', 'ящериц'), { facts: ['tail'] }),
        Object.assign(STALK(3, 'sp_hypsilo', 'гипсилофодону', 260, 'bg_forest'), { facts: ['head'] }),
        Object.assign(SEEK(4, ['polacan', 'hypsilo', 'nb_eotyrannus', 'nb_brighstoneus', 'nb_riparovenator'], 'bg_valley'), { facts: ['body'] }),
        NEST(5, 'bg_forest', ['it_mammal', 'it_lizard']),
        FIN('bg_valley', '50% 50%')],
      final: { len: '≈ 7 м', wt: '≈ 1 т', say: 'Ура! Твой неовенатор вырос — настоящий охотник! Загляни в музей.' },
    });
    cre('polacan', {
      name: 'Полакант', gen: 'полаканта', site: 'wight', kind: 'Травоядный', pathBg: 'bg_valley',
      hero: { name: 'Полакант', latin: 'Polacanthus foxii', period: K('≈125 млн лет назад'),
        rows: [['Длина', '4–5 м'], ['Броня', 'Шипы и щит'], ['Ел', 'Растения'], ['Нашли', 'Англия']],
        size: 'Длиной как легковой автомобиль',
        desc: 'Полакант — травоядный динозавр в броне с острыми шипами. Жил около 125 миллионов лет назад в Англии.',
        say: 'Полакант — «много шипов». Длина четыре-пять метров.' },
      facts: {
        head: { part: 'Имя', text: '«Полакант» значит «много шипов». Его нашёл на острове Уайт священник Уильям Фокс в 1865 году.' },
        body: { part: 'Щит', text: 'Бёдра закрывал широкий костяной щит — около метра в длину и в ширину.' },
        legs: { part: 'Шипы', text: 'Над плечами и по бокам торчали длинные острые шипы. Хищнику было трудно его схватить.' },
        tail: { part: 'Хвост', text: 'Булавы на хвосте у полаканта не было — только ряды острых пластин.' },
      },
      chapters: [EGG(['head']),
        Object.assign(FEED(2, 'Папоротники', 'it_weichselia', 'найди сочные папоротники!', { low: true }), { facts: ['body'] }),
        Object.assign(RAM(3, 'sp_neoven', 'неовенатор', 'неовенатора', 'Хищнику было трудно схватить полаканта: на плечах и боках шипы, а на бёдрах — костяной щит.'), { facts: ['legs'] }),
        Object.assign(SEEK(4, ['hypsilo', 'nb_eotyrannus', 'nb_brighstoneus', 'nb_riparovenator'], 'bg_valley'), { facts: ['tail'] }),
        NEST(5, 'bg_forest', ['it_mammal', 'it_lizard']),
        FIN('bg_valley', '50% 50%')],
      final: { len: '4–5 м', wt: 'шипы и щит', wtIcon: 'zap', say: 'Ура! Твой полакант вырос — весь в шипах! Загляни в музей.' },
    });
    cre('hypsilo', {
      name: 'Гипсилофодон', gen: 'гипсилофодона', site: 'wight', kind: 'Травоядный', pathBg: 'bg_valley',
      hero: { name: 'Гипсилофодон', latin: 'Hypsilophodon foxii', period: K('≈125 млн лет назад'),
        rows: [['Длина', '1,5–2 м'], ['Вес', '≈ 20 кг'], ['Ел', 'Растения'], ['Нашли', 'Англия']],
        size: 'Длиной меньше двух метров — как большая собака',
        desc: 'Гипсилофодон — маленький быстрый травоядный динозавр. Жил около 125 миллионов лет назад на острове Уайт.',
        say: 'Гипсилофодон — маленький быстрый бегун. Длина около двух метров.' },
      facts: {
        head: { part: 'Щёки', text: 'Спереди — клюв, а сзади — зубы. Наверное, у него были щёки, чтобы еда не выпадала изо рта.' },
        body: { part: 'Ошибка', text: 'Раньше учёные думали, что гипсилофодон лазил по деревьям. Но он жил на земле и хорошо бегал.' },
        legs: { part: 'Бегун', text: 'Длинные лёгкие ноги делали его быстрым бегуном. От хищников он спасался бегством.' },
        tail: { part: 'Группа', text: 'Несколько гипсилофодонов нашли вместе. Может быть, они жили группами, как олени.' },
      },
      chapters: [EGG(['head']),
        Object.assign(FEED(2, 'Молодые побеги', 'it_frenelopsis', 'найди сочные побеги!', { low: true }), { facts: ['body'] }),
        Object.assign(RUN(3, 'sp_neoven', 'неовенатор', 'неовенатора'), { facts: ['legs'] }),
        Object.assign(SEEK(4, ['polacan', 'nb_eotyrannus', 'nb_brighstoneus', 'nb_riparovenator'], 'bg_valley'), { facts: ['tail'] }),
        NEST(5, 'bg_forest', ['it_mammal', 'it_lizard']),
        FIN('bg_valley', '50% 50%')],
      final: { len: '1,5–2 м', wt: '≈ 20 кг', say: 'Ура! Твой гипсилофодон вырос — быстрый бегун! Загляни в музей.' },
    });
    cre('concav', {
      name: 'Конкавенатор', gen: 'конкавенатора', site: 'lashoyas', kind: 'Хищник', predator: true, pathBg: 'bg_valley',
      hero: { name: 'Конкавенатор', latin: 'Concavenator corcovatus', period: K('≈127 млн лет назад'),
        rows: [['Длина', '5–6 м'], ['Вес', '≈ 350 кг'], ['Ел', 'Мясо'], ['Нашли', 'Испания']],
        size: 'Длиной как легковой автомобиль',
        desc: 'Конкавенатор — хищный динозавр с острым горбом на спине. Жил около 127 миллионов лет назад в Испании.',
        say: 'Конкавенатор — «горбатый охотник из Куэнки». Длина пять-шесть метров.' },
      facts: {
        head: { part: 'Имя', text: '«Конкавенатор» значит «охотник из Куэнки», а второе имя — «горбатый».' },
        body: { part: 'Горб', text: 'Два позвонка перед бёдрами были очень высокими — получался острый горб. Зачем он был нужен, учёные пока не знают.' },
        legs: { part: 'Находка', text: 'Почти целый скелет нашли в 2003 году. На ногах сохранились даже отпечатки кожи с чешуйками.' },
        tail: { part: 'Хвост', text: 'Длинный хвост помогал держать равновесие. На нём тоже сохранились отпечатки чешуи.' },
      },
      chapters: [EGG(['legs']),
        Object.assign(CHASE(2, 'it_lizard', 'ящериц'), { facts: ['tail'] }),
        Object.assign(STALK(3, 'sp_pelecan', 'пеликанимиму', 260, 'bg_valley'), { facts: ['body'] }),
        Object.assign(SEEK(4, ['pelecan', 'nb_iberomesornis', 'nb_concornis', 'nb_europejara', 'nb_spinolestes'], 'bg_valley'), { facts: ['head'] }),
        NEST(5, 'bg_valley', ['nb_spinolestes', 'it_lizard']),
        FIN('bg_valley', '50% 50%')],
      final: { len: '5–6 м', wt: '≈ 350 кг', say: 'Ура! Твой конкавенатор вырос — с горбом на спине! Загляни в музей.' },
    });
    cre('pelecan', {
      name: 'Пеликанимим', gen: 'пеликанимима', site: 'lashoyas', kind: 'Всеядный', pathBg: 'bg_valley',
      hero: { name: 'Пеликанимим', latin: 'Pelecanimimus polyodon', period: K('≈127 млн лет назад'),
        rows: [['Длина', '2–2,5 м'], ['Зубы', '≈ 220'], ['Ел', 'Мелкую добычу'], ['Нашли', 'Испания']],
        size: 'Длиной около двух метров',
        desc: 'Пеликанимим — стройный быстрый динозавр, родственник «страусовых» динозавров, но с множеством мелких зубов. Жил около 127 миллионов лет назад в Испании.',
        say: 'Пеликанимим — «похожий на пеликана». Длина около двух метров.' },
      facts: {
        head: { part: 'Зубы', text: 'Во рту — около двухсот двадцати мелких зубов. Это больше, чем у любого другого хищного динозавра!' },
        body: { part: 'Мешок', text: 'Под клювом у него был кожистый мешок, как у пеликана. За это его так и назвали.' },
        legs: { part: 'Ноги', text: 'Длинные тонкие ноги, как у журавля. Может быть, он бродил по мелководью и ловил рыбу.' },
        tail: { part: 'Находка', text: 'Его нашли в 1993 году в Лас-Ойасе. Сохранились даже отпечатки кожи и маленький гребешок на затылке.' },
      },
      chapters: [EGG(['tail']),
        Object.assign(SNAP(2), { facts: ['head'], say: 'Глава 2: бреди по мелководью, как журавль, и лови рыбку!',
          p: { mode: 'snap', need: 6, bg: 'bg_lagoon',
            intro: ['Пеликанимим бродит по мелководью озера, как журавль. Жди, когда рыбка поднимется к поверхности под мордой, — и нажимай!',
              'Рыбка у поверхности под мордой — жми!'],
            first: 'Попалась! Двести двадцать мелких зубов крепко держат рыбку.',
            win: 'Отличная рыбалка! Может быть, пеликанимим так и ловил рыбу — бродил по мелководью, как журавль.' } }),
        Object.assign(RUN(3, 'sp_concav', 'конкавенатор', 'конкавенатора'), { facts: ['legs'] }),
        Object.assign(SEEK(4, ['concav', 'nb_iberomesornis', 'nb_concornis', 'nb_europejara', 'nb_spinolestes', 'nb_meyasaurus'], 'bg_valley'), { facts: ['body'] }),
        NEST(5, 'bg_valley', ['nb_meyasaurus', 'nb_spinolestes']),
        FIN('bg_valley', '50% 50%')],
      final: { len: '2–2,5 м', wt: '≈ 220 зубов', wtIcon: 'zap', say: 'Ура! Твой пеликанимим вырос — с двумястами двадцатью зубами! Загляни в музей.' },
    });
    cre('hatzego', {
      name: 'Хацегоптерикс', gen: 'хацегоптерикса', site: 'hateg', kind: 'Летающий ящер', predator: true, pathBg: 'bg_valley',
      hero: { name: 'Хацегоптерикс', latin: 'Hatzegopteryx thambema', period: K('≈70–66 млн лет назад'),
        rows: [['Крылья', '10–12 м'], ['Шея', '≈ 1,5 м'], ['Ел', 'Мелких животных'], ['Нашли', 'Румыния']],
        size: 'Размах крыльев — как у небольшого самолёта',
        desc: 'Хацегоптерикс — огромный летающий ящер с короткой толстой шеей. Жил около 70 миллионов лет назад на острове Хацег.',
        say: 'Хацегоптерикс — летающий великан. Размах крыльев десять-двенадцать метров.' },
      facts: {
        wings: { part: 'Крылья', text: 'Размах крыльев — десять-двенадцать метров. Это один из самых больших летающих ящеров.' },
        head: { part: 'Голова', text: 'Череп широкий и крепкий — около полуметра в ширину сзади. А клюв длинный и острый, без зубов.' },
        tail: { part: 'Шея', text: 'Шея короткая и толстая — вдвое короче, чем у его родственников. Зато очень сильная.' },
        body: { part: 'Хищник', text: 'Больших хищных динозавров на острове не было. Главным хищником, наверное, был хацегоптерикс — он охотился на маленьких динозавров.' },
      },
      chapters: [EGG(['body']),
        Object.assign(FLAP(2), { bg: 'bg_valley', p: { prey: 'it_dragonfly', need: 8, bg: 'bg_valley' } }),
        Object.assign(THERMAL(3), { bg: 'bg_valley', p: { bg: 'bg_valley', where: 'над островом', dat: 'Хацегоптериксу' }, facts: ['wings'] }),
        Object.assign(SEEK(4, ['balaur', 'nb_eurazhdarcho', 'nb_struthiosaurus', 'nb_allodaposuchus', 'nb_kogaionon'], 'bg_valley'), { facts: ['head'] }),
        Object.assign(NEST(5, 'bg_run', ['it_mammal', 'it_lizard'], 'Летающие ящеры зарывали яйца в тёплый песок. В Китае нашли больше двухсот яиц в одном месте.'), { facts: ['tail'] }),
        FIN('bg_valley', '50% 40%')],
      final: { len: 'крылья 10–12 м', wt: 'шея 1,5 м', wtIcon: 'ruler', say: 'Ура! Твой хацегоптерикс вырос — летающий великан острова! Загляни в музей.' },
    });
    cre('balaur', {
      name: 'Балаур', gen: 'балаура', site: 'sebes', kind: 'Хищник', predator: true, pathBg: 'bg_valley',
      hero: { name: 'Балаур', latin: 'Balaur bondoc', period: K('≈70 млн лет назад'),
        rows: [['Длина', '≈ 2 м'], ['Когти', 'По 2 на ноге'], ['Ел', 'Мясо'], ['Нашли', 'Румыния']],
        size: 'Размером с большую индейку',
        desc: 'Балаур — пернатый хищник, родственник велоцираптора, с двумя когтями-серпами на каждой ноге. Жил около 70 миллионов лет назад на острове Хацег.',
        say: 'Балаур — «коренастый дракон». Длина около двух метров.' },
      facts: {
        legs: { part: 'Когти', text: 'На каждой ноге — по два больших когтя-серпа. А у велоцираптора такой коготь был только один!' },
        head: { part: 'Имя', text: '«Балаур бондок» по-румынски значит «коренастый дракон». Балаур — дракон из румынских сказок.' },
        body: { part: 'Руки', text: 'На руках работали только два пальца, а третий был совсем крошечным.' },
        tail: { part: 'Находка', text: 'Скелет нашли в 2009 году на берегу реки Себеш. Сначала его приняли за кости совсем другого динозавра.' },
      },
      chapters: [EGG(['legs']),
        Object.assign(CHASE(2, 'it_mammal', 'зверьков'), { facts: ['body'] }),
        Object.assign(HIDE(3, 'nb_hatzegopteryx', 'хацегоптерикс', 'хацегоптерикса'), { facts: ['head'] }),
        Object.assign(SEEK(4, ['hatzego', 'nb_eurazhdarcho', 'nb_struthiosaurus', 'nb_allodaposuchus', 'nb_kallokibotion', 'nb_kogaionon'], 'bg_valley'), { facts: ['tail'] }),
        NEST(5, 'bg_valley', ['nb_kogaionon', 'it_lizard']),
        FIN('bg_valley', '50% 50%')],
      final: { len: '≈ 2 м', wt: 'по 2 когтя', wtIcon: 'zap', say: 'Ура! Твой балаур вырос — коренастый дракон острова! Загляни в музей.' },
    });
    cre('telmato', {
      name: 'Тельматозавр', gen: 'тельматозавра', site: 'hateg', kind: 'Травоядный', pathBg: 'bg_forest',
      hero: { name: 'Тельматозавр', latin: 'Telmatosaurus transsylvanicus', period: K('≈70 млн лет назад'),
        rows: [['Длина', '≈ 5 м'], ['Вес', '≈ 600 кг'], ['Ел', 'Растения'], ['Нашли', 'Румыния']],
        size: 'Длиной как легковой автомобиль',
        desc: 'Тельматозавр — небольшой утконосый динозавр с острова Хацег. Жил около 70 миллионов лет назад.',
        say: 'Тельматозавр — маленький утконосый динозавр. Длина около пяти метров.' },
      facts: {
        head: { part: 'Находка', text: 'Череп нашла Илона Нопча в имении своей семьи. Её брат Франц стал учёным и изучил этого динозавра.' },
        body: { part: 'Карлик', text: 'На острове было мало еды, и многие динозавры там были меньше своих родственников. Тельматозавр — тоже «карлик».' },
        legs: { part: 'Имя', text: '«Тельматозавр» значит «болотный ящер».' },
        tail: { part: 'Гнёзда', text: 'Возле деревни Тушта нашли кладки яиц и косточки малышей тельматозавра.' },
      },
      chapters: [EGG(['legs']),
        Object.assign(FEED(2, 'Папоротники', 'it_fern', 'найди сочные папоротники!', { low: true }), { facts: ['body'] }),
        Object.assign(RUN(3, 'sp_balaur', 'балаур', 'балаура'), { facts: ['head'] }),
        SEEK(4, ['nb_hatzegopteryx', 'nb_zalmoxes', 'nb_balaur'], 'bg_forest'),
        Object.assign(NEST(5, 'bg_forest', ['nb_kogaionon', 'it_lizard'], 'Возле деревни Тушта в Румынии нашли кладки яиц и косточки малышей тельматозавра.'), { facts: ['tail'] }),
        FIN('bg_forest', '50% 50%')],
      final: { len: '≈ 5 м', wt: '≈ 600 кг', say: 'Ура! Твой тельматозавр вырос! Загляни в музей.' },
    });

    /* ---------------- the seventh wave: Australia (Muttaburra, Winton, Richmond, Dinosaur Cove) and Antarctica (James Ross Island, Vega Island) */
    cre('muttab', {
      name: 'Муттабуррозавр', gen: 'муттабуррозавра', site: 'muttaburra', kind: 'Травоядный', pathBg: 'bg_valley',
      hero: { name: 'Муттабуррозавр', latin: 'Muttaburrasaurus langdoni', period: K('≈100 млн лет назад'),
        rows: [['Длина', '≈ 7 м'], ['Вес', '≈ 3 т'], ['Ел', 'Растения'], ['Нашли', 'Австралия']],
        size: 'Длиной как два легковых автомобиля',
        desc: 'Муттабуррозавр — большой травоядный динозавр с выпуклым носом. Жил около 100 миллионов лет назад в Австралии.',
        say: 'Муттабуррозавр — травоядный динозавр с большим выпуклым носом. Длина около семи метров.' },
      facts: {
        head: { part: 'Нос', text: 'На морде у него был большой выпуклый нарост. Может быть, он помогал громко звать сородичей.' },
        body: { part: 'Находка', text: 'В 1963 году фермер Даг Лэнгдон перегонял скот у реки Томсон и нашёл его кости.' },
        legs: { part: 'Зубы', text: 'Его зубы срезали жёсткие листья, как ножницы.' },
        tail: { part: 'Символ', text: 'Муттабуррозавр — официальный символ-окаменелость австралийского штата Квинсленд.' },
      },
      chapters: [EGG(['legs']),
        Object.assign(FEED(2, 'Саговники', 'it_cycad', 'найди сочные листья саговников!'), { facts: ['head'] }),
        Object.assign(RAM(3, 'sp_austrov', 'австраловенатор', 'австраловенатора', 'Большой и тяжёлый муттабуррозавр не прыгал через брёвна — он ломился напролом через заросли.'), { facts: ['tail'] }),
        Object.assign(SEEK(4, ['austrov', 'diamant', 'ferrodr', 'nb_isisfordia'], 'bg_valley'), { facts: ['body'] }),
        NEST(5, 'bg_valley', ['nb_isisfordia', 'it_lizard']),
        FIN('bg_valley', '50% 50%')],
      final: { len: '≈ 7 м', wt: '≈ 3 т', say: 'Ура! Твой муттабуррозавр вырос — большой и сильный! Загляни в музей.' },
    });
    cre('austrov', {
      name: 'Австраловенатор', gen: 'австраловенатора', site: 'winton', kind: 'Хищник', predator: true, pathBg: 'bg_valley',
      hero: { name: 'Австраловенатор', latin: 'Australovenator wintonensis', period: K('≈95 млн лет назад'),
        rows: [['Длина', '5–6 м'], ['Вес', '≈ 500 кг'], ['Ел', 'Мясо'], ['Нашли', 'Австралия']],
        size: 'Длиной с большой автомобиль',
        desc: 'Австраловенатор — ловкий хищник с огромными когтями на руках. Жил около 95 миллионов лет назад в Австралии.',
        say: 'Австраловенатор — «австралийский охотник». На каждой руке у него было по три огромных когтя.' },
      facts: {
        head: { part: 'Банджо', text: 'Учёные прозвали его «Банджо» — в честь австралийского поэта Банджо Патерсона.' },
        legs: { part: 'Когти', text: 'Главным оружием были руки: на каждой — три больших изогнутых когтя.' },
        body: { part: 'Находка', text: 'Его кости лежали вперемешку с костями великана диамантинозавра — на месте древнего озера.' },
        tail: { part: 'Рекорд', text: 'Это самый полный скелет хищного динозавра, найденный в Австралии.' },
      },
      chapters: [EGG(['head']),
        Object.assign(CHASE(2, 'it_lizard', 'ящериц'), { facts: ['legs'] }),
        Object.assign(STALK(3, 'sp_muttab', 'молодому муттабуррозавру', 300, 'bg_valley'), { facts: ['body'] }),
        Object.assign(SEEK(4, ['muttab', 'diamant', 'ferrodr', 'nb_confractosuchus', 'nb_isisfordia'], 'bg_valley'), { facts: ['tail'] }),
        NEST(5, 'bg_forest', ['nb_isisfordia', 'it_mammal']),
        FIN('bg_valley', '50% 50%')],
      final: { len: '5–6 м', wt: '≈ 500 кг', say: 'Ура! Твой австраловенатор вырос — ловкий охотник с огромными когтями! Загляни в музей.' },
    });
    cre('diamant', {
      name: 'Диамантинозавр', gen: 'диамантинозавра', site: 'winton', kind: 'Травоядный', pathBg: 'bg_valley',
      hero: { name: 'Диамантинозавр', latin: 'Diamantinasaurus matildae', period: K('≈95 млн лет назад'),
        rows: [['Длина', '15–16 м'], ['Вес', '15–20 т'], ['Ел', 'Растения'], ['Нашли', 'Австралия']],
        size: 'Длиной как полтора автобуса',
        desc: 'Диамантинозавр — большой длинношеий динозавр. Жил около 95 миллионов лет назад в Австралии.',
        say: 'Диамантинозавр — длинношеий великан. Длина около пятнадцати метров.' },
      facts: {
        head: { part: 'Матильда', text: 'Учёные прозвали его «Матильдой» — в честь знаменитой австралийской песни «Вальсирующая Матильда».' },
        legs: { part: 'Коготь', text: 'На передней лапе у него был коготь на большом пальце.' },
        body: { part: 'Броня', text: 'В коже были небольшие костяные бляшки — как у его родственника сальтазавра.' },
        tail: { part: 'Имя', text: 'Его назвали в честь реки Диамантина, что течёт неподалёку.' },
      },
      chapters: [EGG(['tail']),
        Object.assign(FEED(2, 'Листья', 'it_twig2', 'дотянись до свежих листьев!', { bg: 'bg_forest' }), { facts: ['head'] }),
        Object.assign(TRACKS(3, { hunter: 'sp_austrov', herd: 'diamant',
          rounds: [['round', 'thero'], ['bird', 'round'], ['thero', 'round'], ['round', 'bird', 'thero'], ['bird', 'thero', 'round']],
          intro: ['Малыш отстал от стада! Взрослые диамантинозавры оставили большие круглые следы. Нажимай на круглые следы — они приведут к стаду.',
            'Ищи большие круглые следы — они ведут к стаду!'],
          ok: 'Правильно! Это следы диамантинозавров. Идём дальше.',
          thero: 'Три пальца с когтями — это следы хищника австраловенатора! Ищи большие круглые следы.',
          win: 'Ура! Следы привели к стаду. Малыш снова рядом со взрослыми диамантинозаврами.' }), { facts: ['legs'] }),
        Object.assign(SEEK(4, ['austrov', 'muttab', 'nb_savannasaurus', 'nb_australotitan'], 'bg_valley'), { facts: ['body'] }),
        NEST(5, 'bg_valley', ['nb_confractosuchus', 'it_lizard'], 'Длинношеие динозавры откладывали круглые яйца в ямки. Малышей у воды подстерегали крокодилы.'),
        FIN('bg_valley', '50% 50%')],
      final: { len: '15–16 м', wt: '15–20 т', say: 'Ура! Твой диамантинозавр вырос — настоящий великан! Загляни в музей.' },
    });
    cre('ferrodr', {
      name: 'Ферродрако', gen: 'ферродрако', site: 'winton', kind: 'Летающий ящер', predator: true, pathBg: 'bg_valley',
      hero: { name: 'Ферродрако', latin: 'Ferrodraco lentoni', period: K('≈95 млн лет назад'),
        rows: [['Крылья', '≈ 4 м'], ['Череп', '≈ 60 см'], ['Ел', 'Рыбу'], ['Нашли', 'Австралия']],
        size: 'Размах крыльев шире легкового автомобиля',
        desc: 'Ферродрако — летающий ящер с гребнями на кончиках челюстей. Жил около 95 миллионов лет назад в Австралии.',
        say: 'Ферродрако — «железный дракон». Размах крыльев около четырёх метров.' },
      facts: {
        head: { part: 'Имя', text: '«Ферродрако» значит «железный дракон»: его кости сохранились в железистом камне.' },
        wings: { part: 'Находка', text: 'В 2017 году фермер Боб Эллиотт опрыскивал сорняки у ручья и нашёл его кости.' },
        body: { part: 'Рекорд', text: 'Это самый полный скелет летающего ящера, найденный в Австралии.' },
        tail: { part: 'Гребни', text: 'На кончиках обеих челюстей были круглые гребни, а во рту — острые зубы для рыбы.' },
      },
      chapters: [EGG(['body']),
        Object.assign(FLAP(2), { facts: ['wings'] }),
        Object.assign(FISHING(3, 'ныряй к реке и лови рыбу!'), { facts: ['tail'] }),
        Object.assign(SEEK(4, ['diamant', 'austrov', 'muttab', 'nb_confractosuchus', 'nb_isisfordia'], 'bg_valley'), { facts: ['head'] }),
        NEST(5, 'bg_run', ['nb_isisfordia', 'it_lizard'], 'Летающие ящеры зарывали яйца в тёплый песок у воды.'),
        FIN('bg_valley', '50% 40%')],
      final: { len: 'крылья ≈ 4 м', wt: 'череп 60 см', wtIcon: 'feather', say: 'Ура! Твой ферродрако вырос и летает над рекой! Загляни в музей.' },
    });
    cre('kunbarra', {
      name: 'Кунбарразавр', gen: 'кунбарразавра', site: 'richmond', kind: 'Травоядный', pathBg: 'bg_valley',
      hero: { name: 'Кунбарразавр', latin: 'Kunbarrasaurus ieversi', period: K('≈100 млн лет назад'),
        rows: [['Длина', '≈ 2,5 м'], ['Броня', 'Костяные бляшки'], ['Ел', 'Растения'], ['Нашли', 'Австралия']],
        size: 'Небольшой — длиной около двух с половиной метров',
        desc: 'Кунбарразавр — небольшой травоядный динозавр в броне. Жил около 100 миллионов лет назад в Австралии.',
        say: 'Кунбарразавр — «ящер-щит». Маленький динозавр в костяной броне.' },
      facts: {
        head: { part: 'Имя', text: '«Кунбарра» на языке местного народа значит «щит». Его нашёл фермер Иэн Иверс в 1989 году.' },
        body: { part: 'Рекорд', text: 'Это самый полный скелет динозавра, найденный в Австралии.' },
        legs: { part: 'Обед', text: 'В его желудке нашли последний обед: семена, плоды и кусочки растений.' },
        tail: { part: 'Море', text: 'Его кости нашли в камнях морского дна: тело унесло в море Эроманга.' },
      },
      chapters: [EGG(['head']),
        Object.assign(FEED(2, 'Семена и плоды', 'it_berries', 'найди семена и плоды!', { low: true }), { facts: ['legs'] }),
        Object.assign(RAM(3, 'sp_austrov', 'австраловенатор', 'австраловенатора', 'Хищнику было трудно схватить кунбарразавра: спину и бока закрывали костяные бляшки.'), { facts: ['body'] }),
        Object.assign(SEEK(4, ['krono', 'nb_mythunga', 'nb_notochelone', 'nb_platypterygius'], 'bg_valley'), { facts: ['tail'] }),
        NEST(5, 'bg_forest', ['it_mammal', 'it_lizard']),
        FIN('bg_valley', '50% 50%')],
      final: { len: '≈ 2,5 м', wt: 'в броне', wtIcon: 'zap', say: 'Ура! Твой кунбарразавр вырос — весь в костяной броне! Загляни в музей.' },
    });
    cre('krono', {
      name: 'Кронозавр', gen: 'кронозавра', site: 'richmond', kind: 'Морской ящер', predator: true, pathBg: 'bg_sea',
      hero: { name: 'Кронозавр', latin: 'Kronosaurus queenslandicus', period: K('≈100 млн лет назад'),
        rows: [['Длина', '9–10 м'], ['Череп', 'Больше 2 м'], ['Ел', 'Морских ящеров'], ['Нашли', 'Австралия']],
        size: 'Длиной почти с автобус',
        desc: 'Кронозавр — огромный морской ящер с гигантской головой. Жил около 100 миллионов лет назад во внутреннем море Австралии.',
        say: 'Кронозавр — один из самых больших морских ящеров. Его череп длиннее двух метров!' },
      facts: {
        head: { part: 'Череп', text: 'Череп длиннее двух метров — больше, чем у тираннозавра! Передние зубы были как клыки.' },
        body: { part: 'Обед', text: 'В его желудке находили кости плезиозавров и черепах.' },
        fins: { part: 'Засада', text: 'Может быть, он подстерегал добычу в глубине и нападал снизу.' },
        tail: { part: 'Находка', text: 'Первый кусочек его челюсти с зубами нашли в 1899 году у городка Хьюэнден.' },
      },
      chapters: [BIRTH(1, ['fins']),
        Object.assign(AMBUSH(2, 'it_turtle', 'жди в глубине и нападай снизу на морских черепах!'), { facts: ['body'] }),
        Object.assign(SWIM(3, 'Охота в море', ['it_fish', 'it_ammonite'], 10, 'лови рыбу и аммонитов и не забывай дышать!'), { facts: ['tail'] }),
        Object.assign(SEEK(4, ['kunbarra', 'nb_platypterygius', 'nb_eromangasaurus', 'nb_notochelone'], 'bg_sea'), { facts: ['head'] }),
        SEA_CALF(5, 'Плезиозавры — родственники кронозавра — рожали малышей прямо в воде. Наверное, так делали и кронозавры.'),
        FIN('bg_sea', '50% 50%')],
      final: { len: '9–10 м', wt: 'дышал воздухом', wtIcon: 'droplet', say: 'Ура! Твой кронозавр вырос — гроза моря Эроманга! Загляни в музей.' },
    });
    cre('leaelly', {
      name: 'Лиеллиназавра', gen: 'лиеллиназавры', acc: 'лиеллиназавру', fem: true, site: 'dinosaurcove', kind: 'Травоядная', pathBg: 'bg_forest',
      hero: { name: 'Лиеллиназавра', latin: 'Leaellynasaura amicagraphica', period: K('≈110 млн лет назад'),
        rows: [['Длина', '≈ 1,5 м'], ['Глаза', 'Огромные'], ['Ела', 'Растения'], ['Нашли', 'Австралия']],
        size: 'Маленькая — длиной полтора метра вместе с хвостом',
        desc: 'Лиеллиназавра — маленький травоядный динозавр с огромными глазами. Жила около 110 миллионов лет назад рядом с Южным полюсом.',
        say: 'Лиеллиназавра — маленький динозавр полярного леса. У неё были огромные глаза.' },
      facts: {
        head: { part: 'Глаза', text: 'Огромные глаза помогали видеть в долгую полярную ночь, когда солнце не вставало неделями.' },
        tail: { part: 'Хвост', text: 'Хвост был очень длинным. Может быть, малышка обвивала им тело, чтобы согреться.' },
        body: { part: 'Имя', text: 'Её назвали в честь девочки Лиеллин — дочки учёных, которые её нашли.' },
        legs: { part: 'Находка', text: 'Её нашли в 1987 году в туннеле, который выкопали прямо в скале у моря.' },
      },
      chapters: [EGG(['body']),
        Object.assign(POLAR(2, {
          intro: ['Полярная ночь: солнце не встаёт неделями. Но у лиеллиназавры огромные глаза — она видит в темноте! Веди пальцем — так она смотрит вокруг. Увидишь росток папоротника — нажми на него!',
            'Веди пальцем и ищи ростки папоротника!'],
          first: 'Хрум! Огромные глаза нашли росток даже в темноте.',
          win: 'Наелась! Учёные думают, что огромные глаза помогали лиеллиназавре видеть в долгую полярную ночь.' }), { facts: ['head'] }),
        Object.assign(RUN(3, 'sp_austrov', 'хищник-мегараптор', 'хищника-мегараптора'), { facts: ['tail'] }),
        Object.assign(SEEK(4, ['nb_qantassaurus', 'nb_atlascopcosaurus', 'nb_timimus', 'nb_koolasuchus', 'nb_teinolophos'], 'bg_forest'), { facts: ['legs'] }),
        NEST(5, 'bg_forest', ['it_mammal', 'it_lizard']),
        FIN('bg_forest', '50% 50%')],
      final: { len: '≈ 1,5 м', wt: 'огромные глаза', wtIcon: 'eye', say: 'Ура! Твоя лиеллиназавра выросла! Загляни в музей.' },
    });
    cre('antarcto', {
      name: 'Антарктопельта', gen: 'антарктопельты', acc: 'антарктопельту', fem: true, site: 'jamesross', kind: 'Травоядная', pathBg: 'bg_valley',
      hero: { name: 'Антарктопельта', latin: 'Antarctopelta oliveroi', period: K('≈74 млн лет назад'),
        rows: [['Длина', '≈ 4 м'], ['Броня', 'Костяные пластины'], ['Ела', 'Растения'], ['Нашли', 'Антарктида']],
        size: 'Длиной как легковой автомобиль',
        desc: 'Антарктопельта — динозавр в броне. Жила около 74 миллионов лет назад в Антарктиде.',
        say: 'Антарктопельта — «антарктический щит». Динозавр в броне из Антарктиды.' },
      facts: {
        head: { part: 'Имя', text: '«Антарктопельта» значит «антарктический щит».' },
        body: { part: 'Находка', text: 'Её нашли аргентинские геологи в 1986 году. Это одна из первых находок динозавров в Антарктиде.' },
        legs: { part: 'Лес', text: 'Тогда в Антарктиде не было льда: там росли хвойные леса и папоротники.' },
        tail: { part: 'Броня', text: 'Спину и бока закрывали костяные пластины и шипы.' },
      },
      chapters: [EGG(['head']),
        Object.assign(FEED(2, 'Папоротники', 'it_fern', 'найди сочные папоротники!', { low: true }), { facts: ['legs'] }),
        Object.assign(HIDE(3, 'nb_imperobator', 'имперобатор', 'имперобатора'), { facts: ['tail'] }),
        Object.assign(SEEK(4, ['vegavis', 'nb_morrosaurus', 'nb_trinisaura', 'nb_imperobator', 'nb_kaikaifilu'], 'bg_valley'), { facts: ['body'] }),
        NEST(5, 'bg_forest', ['it_mammal', 'it_lizard']),
        FIN('bg_valley', '50% 50%')],
      final: { len: '≈ 4 м', wt: 'в броне', wtIcon: 'zap', say: 'Ура! Твоя антарктопельта выросла — в крепкой броне! Загляни в музей.' },
    });
    cre('vegavis', {
      name: 'Вегавис', gen: 'вегависа', site: 'vega', kind: 'Птица', pathBg: 'bg_valley',
      hero: { name: 'Вегавис', latin: 'Vegavis iaai', period: K('≈69 млн лет назад'),
        rows: [['Размер', 'Как утка'], ['Родня', 'Утки и гуси'], ['Ел', 'Рыбу'], ['Нашли', 'Антарктида']],
        size: 'Размером с утку',
        desc: 'Вегавис — древняя птица, родственник уток и гусей. Жил около 69 миллионов лет назад в Антарктиде, ещё вместе с динозаврами.',
        say: 'Вегавис — одна из древнейших птиц, похожих на уток и гусей.' },
      facts: {
        head: { part: 'Голос', text: 'У вегависа нашли голосовой аппарат птиц. Учёные думают, что он мог гоготать, как гусь.' },
        body: { part: 'Родня', text: 'Вегавис — древний родственник уток и гусей. Он жил ещё вместе с динозаврами!' },
        legs: { part: 'Ныряльщик', text: 'Лапы сидели далеко сзади, как у гагары: под водой он грёб ими и ловил рыбу.' },
        tail: { part: 'Находка', text: 'Его кости нашли на острове Вега в Антарктиде. А в 2025 году учёные описали его почти целый череп.' },
      },
      chapters: [EGG(['body']),
        Object.assign(CH(2, 'calls', 'Перекличка', 1, { scene: 'calls', bg: 'bg_valley', pos: '50% 60%', size: '240%',
          p: { rounds: 4, bg: 'bg_valley', notes: [370, 440, 523], crest: [1062, 87],
            intro: 'Стая вегависов перекликается! Послушай, кто гогочет, и нажми на них в том же порядке.',
            win: 'Молодец! У вегависа нашли голосовой аппарат птиц. Наверное, вегависы перекликались, как гуси.' },
          say: 'Глава 2: повтори перекличку стаи!' }), { facts: ['head'] }),
        Object.assign(DIVING(3, {
          intro: ['Вегавис — древний родственник уток и гусей. Он нырял за рыбой и грёб под водой лапами, как гагара! Нажми под водой — и вегавис нырнёт туда.',
            'Нажми под водой — и ныряй за рыбой!'],
          first: 'Поймал! Под водой вегавис грёб лапами — быстро, как гагара.',
          win: 'Отличная рыбалка! Учёные думают, что вегавис нырял за рыбой и грёб под водой лапами.' }), { facts: ['legs'] }),
        Object.assign(SEEK(4, ['antarcto', 'nb_kaikaifilu', 'nb_aristonectes', 'nb_imperobator', 'nb_trinisaura'], 'bg_valley'), { facts: ['tail'] }),
        NEST(5, 'bg_run', ['it_mammal', 'it_lizard'], 'Птицы и сейчас берегут свои гнёзда. Наверное, вегависы тоже охраняли свои яйца.'),
        FIN('bg_valley', '50% 50%')],
      final: { len: 'как утка', wt: 'ныряльщик', wtIcon: 'droplet', say: 'Ура! Твой вегавис вырос и ныряет за рыбой! Загляни в музей.' },
    });

    /* ---------------- the eighth wave: North America, the second package — Egg Mountain and Cloverly (Montana), Glen Rose (Texas),
       the oil sands of Fort McMurray (Alberta), the Western Interior Seaway (South Dakota) and Big Bend (Texas) */
    cre('maia', {
      name: 'Майазавра', gen: 'майазавры', acc: 'майазавру', fem: true, site: 'eggmountain', kind: 'Травоядная', pathBg: 'bg_valley',
      hero: { name: 'Майазавра', latin: 'Maiasaura peeblesorum', period: K('≈77 млн лет назад'),
        rows: [['Длина', '≈ 9 м'], ['Вес', '≈ 3 т'], ['Ела', 'Растения'], ['Нашли', 'США']],
        size: 'Длиной как два легковых автомобиля',
        desc: 'Майазавра — утконосый динозавр, «заботливая мама». Жила около 77 миллионов лет назад в Северной Америке.',
        say: 'Майазавра — «ящер — хорошая мать». Учёные думают, что она заботилась о малышах в гнезде.' },
      facts: {
        head: { part: 'Имя', text: 'Её имя значит «ящер — хорошая мать»: в гнёздах нашли подросших малышей, о которых заботились взрослые.' },
        body: { part: 'Гнёзда', text: 'Майазавры устраивали гнёзда рядом друг с другом, целыми колониями, как птицы.' },
        legs: { part: 'Находка', text: 'В 1978 году Марион Брандволд, хозяйка магазина камней, нашла кости малышей и показала их учёному Джеку Хорнеру.' },
        tail: { part: 'Космос', text: 'В 1985 году кусочек кости майазавры побывал в космосе вместе с астронавтом.' },
      },
      chapters: [EGG(['legs']),
        Object.assign(FEED(2, 'Обед', 'it_magnolia', 'найди цветы магнолии!', { bg: 'bg_run' }), { facts: ['tail'] }),
        RAM(3, 'nb_daspletosaurus', 'дасплетозавр', 'дасплетозавра', 'Взрослая майазавра весила около трёх тонн. Через брёвна она не прыгала, а от хищника уходила напролом через заросли.'),
        Object.assign(SEEK(4, ['troodon', 'einio', 'nb_daspletosaurus', 'nb_orodromeus', 'nb_hypacrosaurus'], 'bg_valley'), { facts: ['body'] }),
        Object.assign(FEEDKIDS(5, {
          intro: ['Майазавра — «заботливая мама». Учёные думают, что она приносила еду малышам в гнездо. Нажми на растение — мама сорвёт листья. Потом нажми на малыша, который просит есть.',
            'Нажми на растение, а потом — на голодного малыша!'],
          win: 'Все малыши сыты! Детёныши майазавры росли очень быстро: за первый год они становились в несколько раз больше.' }), { facts: ['head'] }),
        FIN('bg_valley', '50% 50%')],
      final: { len: '≈ 9 м', wt: '≈ 3 т', say: 'Ура! Твоя майазавра выросла — заботливая мама! Загляни в музей.' },
    });
    cre('troodon', {
      name: 'Троодон', gen: 'троодона', site: 'eggmountain', kind: 'Хищник', predator: true, pathBg: 'bg_valley',
      hero: { name: 'Троодон', latin: 'Troodon formosus', period: K('≈77 млн лет назад'),
        rows: [['Длина', '≈ 2,4 м'], ['Вес', '≈ 50 кг'], ['Ел', 'Мясо'], ['Нашли', 'США']],
        size: 'Длиной чуть больше двух метров',
        desc: 'Троодон — небольшой хищник в перьях с огромными глазами. Жил около 77 миллионов лет назад в Северной Америке.',
        say: 'Троодон — небольшой хищник в перьях. Мозг у него был большим для его роста.' },
      facts: {
        head: { part: 'Глаза', text: 'Огромные глаза смотрели вперёд. Может быть, троодон охотился в сумерках.' },
        body: { part: 'Мозг', text: 'Для своего роста у троодона был очень большой мозг.' },
        legs: { part: 'Яйца', text: 'Троодоны ставили длинные яйца в гнезде стоймя и наполовину закапывали в землю.' },
        tail: { part: 'Папа', text: 'Учёные думают, что яйца высиживал папа — как у многих птиц сегодня.' },
      },
      chapters: [EGG(['legs']),
        Object.assign(CHASE(2, 'it_lizard', 'ящериц'), { facts: ['body'] }),
        Object.assign(NIGHTHUNT(3, {
          intro: ['Наступила ночь. У троодона огромные глаза — он видит в темноте! Веди пальцем — так он смотрит вокруг. Увидишь зверька — нажми на него!',
            'Веди пальцем и ищи зверьков в темноте!'],
          first: 'Попался! Огромные глаза заметили зверька даже в темноте.',
          win: 'Отличная охота! Может быть, огромные глаза помогали троодону охотиться в сумерках.' }), { facts: ['head'] }),
        SEEK(4, ['maia', 'einio', 'nb_bambiraptor', 'nb_orodromeus', 'nb_montanazhdarcho'], 'bg_valley'),
        NEST(5, 'bg_forest', ['nb_bambiraptor', 'it_mammal'], 'Троодоны ставили длинные яйца в гнезде стоймя. Учёные думают, что их высиживал и охранял папа — как у многих птиц сегодня.'),
        FIN('bg_valley', '50% 50%')],
      final: { len: '≈ 2,4 м', wt: '≈ 50 кг', say: 'Ура! Твой троодон вырос — зоркий охотник с огромными глазами! Загляни в музей.' },
    });
    cre('einio', {
      name: 'Эйниозавр', gen: 'эйниозавра', site: 'eggmountain', kind: 'Травоядный', pathBg: 'bg_valley',
      hero: { name: 'Эйниозавр', latin: 'Einiosaurus procurvicornis', period: K('≈75 млн лет назад'),
        rows: [['Длина', '≈ 4,5 м'], ['Рог', 'Загнут вниз'], ['Ел', 'Растения'], ['Нашли', 'США']],
        size: 'Длиной с легковой автомобиль',
        desc: 'Эйниозавр — рогатый динозавр с рогом, загнутым вперёд и вниз. Жил около 75 миллионов лет назад в Северной Америке.',
        say: 'Эйниозавр — «бизоний ящер». Рог на носу у него загибался вниз, как открывашка для бутылок.' },
      facts: {
        head: { part: 'Рог', text: 'Рог на носу загибался вперёд и вниз — как открывашка для бутылок.' },
        body: { part: 'Имя', text: 'Его имя значит «бизоний ящер»: «эйни» — это «бизон» на языке индейцев черноногих.' },
        legs: { part: 'Стадо', text: 'Учёные нашли вместе кости многих эйниозавров. Наверное, они жили стадами, как бизоны.' },
        tail: { part: 'Воротник', text: 'Из костяного воротника назад торчали два длинных шипа.' },
      },
      chapters: [EGG(['tail']),
        Object.assign(FEED(2, 'Папоротники', 'it_fern', 'найди папоротники!', { low: true }), { facts: ['head'] }),
        Object.assign(RAM(3, 'nb_daspletosaurus', 'дасплетозавр', 'дасплетозавра', 'Молодые эйниозавры держались вместе — так легче спастись от хищника.'), { facts: ['legs'] }),
        Object.assign(SEEK(4, ['maia', 'troodon', 'nb_daspletosaurus', 'nb_hypacrosaurus', 'nb_orodromeus'], 'bg_valley'), { facts: ['body'] }),
        NEST(5, 'bg_run', ['nb_bambiraptor', 'it_lizard']),
        FIN('bg_valley', '50% 50%')],
      final: { len: '≈ 4,5 м', wt: '≈ 1,3 т', say: 'Ура! Твой эйниозавр вырос — с рогом-открывашкой! Загляни в музей.' },
    });
    cre('deinony', {
      name: 'Дейноних', gen: 'дейнониха', site: 'cloverly', kind: 'Хищник', predator: true, pathBg: 'bg_forest',
      hero: { name: 'Дейноних', latin: 'Deinonychus antirrhopus', period: K('≈110 млн лет назад'),
        rows: [['Длина', '≈ 3,4 м'], ['Вес', '≈ 80 кг'], ['Ел', 'Мясо'], ['Нашли', 'США']],
        size: 'Длиной больше трёх метров',
        desc: 'Дейноних — ловкий хищник в перьях с большим когтем-серпом на ноге. Жил около 110 миллионов лет назад в Северной Америке.',
        say: 'Дейноних — «ужасный коготь». На каждой ноге у него был большой коготь-серп.' },
      facts: {
        head: { part: 'Учёный', text: 'В 1964 году его нашёл учёный Джон Остром. После этого учёные поняли, что динозавры были быстрыми и ловкими, как птицы.' },
        legs: { part: 'Коготь', text: 'Коготь-серп длиной больше десяти сантиметров он держал поднятым, чтобы не тупился о землю.' },
        body: { part: 'Перья', text: 'Дейноних был покрыт перьями — он близкий родственник птиц.' },
        tail: { part: 'Хвост', text: 'Длинный прямой хвост помогал держать равновесие на бегу.' },
      },
      chapters: [EGG(['body']),
        Object.assign(CHASE(2, 'it_mammal', 'зверьков', 'bg_forest'), { facts: ['tail'] }),
        Object.assign(STALK(3, 'nb_zephyrosaurus', 'зефирозавру', 220, 'bg_forest'), { facts: ['legs'] }),
        Object.assign(SEEK(4, ['borealo', 'nb_tenontosaurus', 'nb_aquilops', 'nb_microvenator', 'nb_gobiconodon'], 'bg_forest'), { facts: ['head'] }),
        NEST(5, 'bg_forest', ['nb_gobiconodon', 'it_lizard']),
        FIN('bg_forest', '50% 50%')],
      final: { len: '≈ 3,4 м', wt: '≈ 80 кг', say: 'Ура! Твой дейноних вырос — ловкий охотник с когтями-серпами! Загляни в музей.' },
    });
    cre('acro', {
      name: 'Акрокантозавр', gen: 'акрокантозавра', site: 'glenrose', kind: 'Хищник', predator: true, pathBg: 'bg_valley',
      hero: { name: 'Акрокантозавр', latin: 'Acrocanthosaurus atokensis', period: K('≈113 млн лет назад'),
        rows: [['Длина', '11–12 м'], ['Вес', '≈ 6 т'], ['Ел', 'Мясо'], ['Нашли', 'США']],
        size: 'Длиной как автобус',
        desc: 'Акрокантозавр — огромный хищник с высоким гребнем на спине. Жил около 113 миллионов лет назад в Северной Америке.',
        say: 'Акрокантозавр — «ящер с высокими шипами». Вдоль спины у него тянулся мощный гребень.' },
      facts: {
        head: { part: 'Нюх', text: 'У акрокантозавра был отличный нюх — это видно по слепку его мозга.' },
        body: { part: 'Гребень', text: 'Высокие отростки позвонков на шее, спине и хвосте образовывали мощный гребень.' },
        legs: { part: 'Следы', text: 'В Техасе, в русле реки Палакси, сохранились трёхпалые следы — учёные думают, что их оставили акрокантозавры.' },
        tail: { part: 'Имя', text: 'Его кости нашли в Оклахоме, в округе Атока, — отсюда и второе имя: атокензис.' },
      },
      chapters: [EGG(['tail']),
        Object.assign(SMELL(2, { box: [380, 210],
          intro: ['Малыш акрокантозавра чует добычу! Нажимай на кусты — он подойдёт и понюхает. Чем ближе зверёк, тем сильнее запах.',
            'Нажимай на кусты — акрокантозавр понюхает. Чем ближе добыча, тем сильнее запах.'],
          first: 'Нашёл по запаху! У акрокантозавра был отличный нюх.',
          win: 'Отличный нюх! Учёные узнали о нём по слепку мозга акрокантозавра.' }), { facts: ['head'] }),
        Object.assign(STALK(3, 'nb_tenontosaurus', 'молодому тенонтозавру', 280, 'bg_forest'), { facts: ['body'] }),
        Object.assign(SEEK(4, ['saurop', 'nb_convolosaurus', 'nb_paluxysuchus', 'nb_naomichelys'], 'bg_valley'), { facts: ['legs'] }),
        NEST(5, 'bg_run', ['nb_paluxysuchus', 'it_mammal']),
        FIN('bg_valley', '50% 50%')],
      final: { len: '11–12 м', wt: '≈ 6 т', say: 'Ура! Твой акрокантозавр вырос — огромный хищник с гребнем! Загляни в музей.' },
    });
    cre('saurop', {
      name: 'Завропосейдон', gen: 'завропосейдона', site: 'glenrose', kind: 'Травоядный', pathBg: 'bg_valley',
      hero: { name: 'Завропосейдон', latin: 'Sauroposeidon proteles', period: K('≈110 млн лет назад'),
        rows: [['Рост', 'до 17 м'], ['Шея', '≈ 12 м'], ['Ел', 'Растения'], ['Нашли', 'США']],
        size: 'Головой выше шестиэтажного дома',
        desc: 'Завропосейдон — один из самых высоких динозавров. Жил около 110 миллионов лет назад в Северной Америке.',
        say: 'Завропосейдон — «ящер-бог землетрясений». Поднятая голова была выше шестиэтажного дома!' },
      facts: {
        head: { part: 'Рост', text: 'Подняв шею, он мог дотянуться до высоты около семнадцати метров.' },
        body: { part: 'Находка', text: 'В 1994 году его шейные позвонки нашёл в Оклахоме дрессировщик собак Бобби Кросс. Сначала их приняли за окаменевшие стволы деревьев!' },
        legs: { part: 'Символ', text: 'Завропосейдон — официальный динозавр-символ штата Техас.' },
        tail: { part: 'Шея', text: 'Его шейные позвонки были длиной больше метра, но лёгкими: внутри было много воздушных ячеек, как у птиц.' },
      },
      chapters: [EGG(['legs']),
        Object.assign(FEED(2, 'Верхушки', 'it_araucaria', 'дотянись до верхушек деревьев!'), { facts: ['head'] }),
        Object.assign(TRACKS(3, { hunter: 'sp_acro', herd: 'saurop',
          rounds: [['round', 'thero'], ['bird', 'round'], ['thero', 'round'], ['round', 'bird', 'thero'], ['bird', 'thero', 'round']],
          intro: ['Малыш отстал от стада! Взрослые завропосейдоны оставили большие круглые следы. Нажимай на круглые следы — они приведут к стаду.',
            'Ищи большие круглые следы — они ведут к стаду!'],
          ok: 'Правильно! Это следы завропосейдонов. Идём дальше.',
          thero: 'Три пальца с когтями — это следы хищника акрокантозавра! Ищи большие круглые следы.',
          win: 'Ура! Следы привели к стаду. В Техасе сохранились такие следы: огромные круглые — длинношеих динозавров, трёхпалые — хищников.' }), { facts: ['tail'] }),
        Object.assign(SEEK(4, ['acro', 'nb_convolosaurus', 'nb_paluxysuchus', 'nb_naomichelys'], 'bg_valley'), { facts: ['body'] }),
        NEST(5, 'bg_run', ['nb_paluxysuchus', 'it_lizard'], 'Длинношеие динозавры откладывали круглые яйца в ямки. Малышей у воды подстерегали крокодилы.'),
        FIN('bg_valley', '50% 50%')],
      final: { len: '≈ 30 м', wt: 'рост до 17 м', wtIcon: 'ruler', say: 'Ура! Твой завропосейдон вырос — головой выше шестиэтажного дома! Загляни в музей.' },
    });
    cre('borealo', {
      name: 'Бореалопельта', gen: 'бореалопельты', acc: 'бореалопельту', fem: true, site: 'suncor', kind: 'Травоядная', pathBg: 'bg_forest',
      hero: { name: 'Бореалопельта', latin: 'Borealopelta markmitchelli', period: K('≈110 млн лет назад'),
        rows: [['Длина', '≈ 5,5 м'], ['Вес', '≈ 1,3 т'], ['Ела', 'Папоротники'], ['Нашли', 'Канада']],
        size: 'Длиной с легковой автомобиль',
        desc: 'Бореалопельта — динозавр в костяной броне, «северный щит». Жила около 110 миллионов лет назад в Северной Америке.',
        say: 'Бореалопельта — «северный щит». Её нашли так хорошо сохранившейся, что видна даже броня с кожей.' },
      facts: {
        head: { part: 'Обед', text: 'В её желудке сохранился последний обед — в основном листья папоротников.' },
        body: { part: 'Окраска', text: 'Учёные нашли следы рыжевато-коричневого цвета: спина была тёмной, а живот светлым. Такая окраска помогает прятаться от хищников.' },
        legs: { part: 'Находка', text: 'В 2011 году её случайно нашёл машинист экскаватора Шон Фанк в шахте, где добывают нефтеносный песок.' },
        tail: { part: 'Море', text: 'После смерти её тело унесло в море — поэтому она так хорошо сохранилась.' },
      },
      chapters: [EGG(['legs']),
        Object.assign(FEED(2, 'Папоротники', 'it_fern', 'найди листья папоротников!', { low: true }), { facts: ['head'] }),
        Object.assign(HIDE(3, 'sp_acro', 'акрокантозавр', 'акрокантозавра'), { facts: ['body'] }),
        Object.assign(SEEK(4, ['deinony', 'nb_tenontosaurus', 'nb_aquilops', 'nb_zephyrosaurus', 'nb_gobiconodon'], 'bg_forest'), { facts: ['tail'] }),
        NEST(5, 'bg_forest', ['it_mammal', 'it_lizard']),
        FIN('bg_forest', '50% 50%')],
      final: { len: '≈ 5,5 м', wt: '≈ 1,3 т', say: 'Ура! Твоя бореалопельта выросла — в крепкой броне! Загляни в музей.' },
    });
    cre('deinosu', {
      name: 'Дейнозух', gen: 'дейнозуха', site: 'bigbend', kind: 'Крокодил', predator: true, pathBg: 'bg_lagoon',
      hero: { name: 'Дейнозух', latin: 'Deinosuchus riograndensis', period: K('≈80–75 млн лет назад'),
        rows: [['Длина', 'до 10 м'], ['Зубы', 'С банан'], ['Ел', 'Черепах, динозавров'], ['Нашли', 'США']],
        size: 'Длиной со школьный автобус',
        desc: 'Дейнозух — гигантский родственник аллигаторов. Жил около 75 миллионов лет назад в Северной Америке.',
        say: 'Дейнозух — «ужасный крокодил». Он был длиной со школьный автобус!' },
      facts: {
        head: { part: 'Зубы', text: 'Его толстые зубы были размером с банан.' },
        body: { part: 'Родня', text: 'Дейнозух — родственник аллигаторов, а не настоящих крокодилов.' },
        legs: { part: 'Обед', text: 'Учёные нашли панцири черепах и кости динозавров со следами его зубов.' },
        tail: { part: 'Засада', text: 'Как нынешние крокодилы, он, наверное, подстерегал добычу, спрятавшись в реке.' },
      },
      chapters: [EGG(['body']),
        Object.assign(SWIM(2, 'У берега моря', ['it_fish', 'it_turtle'], 8, 'плыви у берега, лови рыбу и черепах и не забывай дышать!'), { facts: ['legs'] }),
        Object.assign(WATERHOLE(3, {
          intro: ['Дейнозух прячется в воде — видны только глаза и ноздри. Держи палец — он тихо подплывает. Когда зверь на берегу поднимает голову, отпусти и замри!',
            'Держи палец — подплывай. Поднял голову — замри!'],
          first: 'Есть! Учёные нашли кости динозавров со следами зубов дейнозуха.',
          win: 'Отличная охота! Дейнозух был таким большим, что охотился даже на динозавров.' }), { facts: ['tail'] }),
        Object.assign(SEEK(4, ['archelon', 'nb_aquilarhinus', 'nb_agujaceratops', 'nb_ichthyornis'], 'bg_lagoon'), { facts: ['head'] }),
        NEST(5, 'bg_run', ['it_mammal', 'it_lizard'], 'Самки нынешних аллигаторов строят гнездо из травы и листьев и охраняют его. Наверное, так делал и дейнозух.'),
        FIN('bg_valley', '50% 50%')],
      final: { len: 'до 10 м', wt: 'зубы с банан', wtIcon: 'bone', say: 'Ура! Твой дейнозух вырос — длиной со школьный автобус! Загляни в музей.' },
    });
    cre('archelon', {
      name: 'Архелон', gen: 'архелона', site: 'pierre', kind: 'Морская черепаха', pathBg: 'bg_sea',
      hero: { name: 'Архелон', latin: 'Archelon ischyros', period: K('≈75 млн лет назад'),
        rows: [['Длина', 'до 4,6 м'], ['Вес', '≈ 2 т'], ['Ел', 'Морских животных'], ['Нашли', 'США']],
        size: 'Длиной с легковой автомобиль',
        desc: 'Архелон — самая большая черепаха из всех известных. Жил около 75 миллионов лет назад в море, которое разделяло Северную Америку.',
        say: 'Архелон — самая большая черепаха на свете. Он был длиной с легковой автомобиль!' },
      facts: {
        head: { part: 'Клюв', text: 'У архелона был сильный крючковатый клюв. Учёные думают, что он ел медуз и моллюсков.' },
        body: { part: 'Панцирь', text: 'Его панцирь был не твёрдым, а кожистым — на лёгком костяном каркасе.' },
        fins: { part: 'Ласты', text: 'Передние ласты в размахе были около четырёх метров.' },
        tail: { part: 'Находка', text: 'Первый скелет нашёл в 1895 году учёный Джордж Виланд у реки Шайенн в Южной Дакоте.' },
      },
      chapters: [EGG(['fins']),
        Object.assign(SEARUN(2), { facts: ['body'] }),
        Object.assign(SWIM(3, 'Охота в море', ['it_jelly', 'it_ammonite'], 10, 'лови медуз и аммонитов и не забывай дышать!'), { facts: ['head'] }),
        Object.assign(SEEK(4, ['deinosu', 'nb_cretoxyrhina', 'nb_baculites', 'nb_ichthyornis'], 'bg_sea'), { facts: ['tail'] }),
        LAYEGGS(5),
        FIN('bg_sea', '50% 50%')],
      final: { len: 'до 4,6 м', wt: '≈ 2 т', say: 'Ура! Твой архелон вырос — самая большая черепаха на свете! Загляни в музей.' },
    });

    /* ---------------- the ninth wave: India, an island in the ocean on its way north — Rahioli (Gujarat), Jabalpur (Madhya Pradesh),
       Pisdura (Maharashtra), Naskal (Telangana, between the lava flows of the Deccan) and Kallamedu (Tamil Nadu) */
    cre('raja', {
      name: 'Раджазавр', gen: 'раджазавра', site: 'rahioli', kind: 'Хищник', predator: true, pathBg: 'bg_run',
      hero: { name: 'Раджазавр', latin: 'Rajasaurus narmadensis', period: K('≈67 млн лет назад'),
        rows: [['Длина', '≈ 6,6 м'], ['Рог', 'Один, на лбу'], ['Ел', 'Мясо'], ['Нашли', 'Индия']],
        size: 'Длиной как полтора легковых автомобиля',
        desc: 'Раджазавр — хищник с рогом на лбу. Жил около 67 миллионов лет назад в Индии.',
        say: 'Раджазавр — «царственный ящер». На лбу у него был рог.' },
      facts: {
        head: { part: 'Рог', text: 'На лбу у раджазавра был рог-шишка. Может быть, им красовались перед другими или бодались.' },
        body: { part: 'Имя', text: '«Раджа» на древнем индийском языке санскрите значит «царь». Второе имя — нармаденсис — ему дали в честь реки Нармады.' },
        legs: { part: 'Родня', text: 'Его близкий родственник — маджунгазавр с Мадагаскара. Когда-то Индия и Мадагаскар были соединены.' },
        tail: { part: 'Добыча', text: 'Раджазавр, наверное, охотился на огромных длинношеих титанозавров, которые жили рядом.' },
      },
      chapters: [EGG(['legs']),
        Object.assign(CHASE(2, 'it_lizard', 'ящериц'), { facts: ['tail'] }),
        Object.assign(RAJADUEL(3), { facts: ['head'] }),
        Object.assign(SEEK(4, ['nb_rahiolisaurus', 'nb_titanosaurus', 'nb_sanajeh'], 'bg_valley'), { facts: ['body'] }),
        NEST(5, 'bg_run', ['nb_sanajeh', 'it_lizard'], 'Змею санаджа нашли окаменевшей прямо в гнезде с яйцами. Такие змеи охотились на малышей динозавров.'),
        FIN('bg_valley', '50% 50%')],
      final: { len: '≈ 6,6 м', wt: 'рог на лбу', wtIcon: 'star', say: 'Ура! Твой раджазавр вырос — царственный ящер с рогом! Загляни в музей.' },
    });
    cre('isis', {
      name: 'Изизавр', gen: 'изизавра', site: 'pisdura', kind: 'Травоядный', pathBg: 'bg_valley',
      hero: { name: 'Изизавр', latin: 'Isisaurus colberti', period: K('≈67 млн лет назад'),
        rows: [['Длина', '≈ 18 м'], ['Вес', '≈ 15 т'], ['Ел', 'Растения'], ['Нашли', 'Индия']],
        size: 'Длиной как полтора автобуса',
        desc: 'Изизавр — титанозавр, родственник самых больших динозавров. Шея у него была короткой и поднятой вверх, а передние ноги — длинными. Жил около 67 миллионов лет назад в Индии.',
        say: 'Изизавр — титанозавр из Индии. Шею он держал высоко, а передние ноги у него были длинными.' },
      facts: {
        neck: { part: 'Шея', text: 'Шея у изизавра была короче, чем у других длинношеих динозавров, и смотрела вверх.' },
        legs: { part: 'Ноги', text: 'Его плечевая кость длиной почти полтора метра — выше первоклассника!' },
        body: { part: 'Имя', text: 'Его назвали в честь Индийского статистического института: учёные этого института нашли его скелет.' },
        tail: { part: 'Обед', text: 'В окаменевшем помёте титанозавров из Писдуры нашли крошечные частички травы, пальм и хвойных деревьев. Титанозавры ели самые разные растения.' },
      },
      chapters: [EGG(['legs']),
        Object.assign(FEED(2, 'Плоды пальм', 'it_palmfruit', 'дотянись до плодов пальм!'), { facts: ['neck'] }),
        Object.assign(RAM(3, 'sp_raja', 'раджазавр', 'раджазавра', 'Изизавр был таким тяжёлым, что не прыгал через брёвна, а уходил от хищника напролом через заросли.'),
          { facts: ['body'] }),
        Object.assign(SEEK(4, ['raja'], 'bg_valley'), { facts: ['tail'] }),
        Object.assign(SANDNEST(5, {
          climb: 'Мама-изизавр ищет место для гнезда — тёплый сухой песок. Нажимай — она идёт туда.',
          win: 'Готово! В Индии нашли сотни гнёзд титанозавров с яйцами. Яйца были всего с дыню — совсем маленькие рядом с мамой!' }),
          { note: 'Длинношеие динозавры, наверное, не сидели на яйцах и не охраняли гнёзда — как нынешние черепахи.' }),
        FIN('bg_valley', '50% 50%')],
      final: { len: '≈ 18 м', wt: '≈ 15 т', say: 'Ура! Твой изизавр вырос — великан с высоко поднятой шеей! Загляни в музей.' },
    });
    cre('jaino', {
      name: 'Джайнозавр', gen: 'джайнозавра', site: 'jabalpur', kind: 'Травоядный', pathBg: 'bg_valley',
      hero: { name: 'Джайнозавр', latin: 'Jainosaurus septentrionalis', period: K('≈67 млн лет назад'),
        rows: [['Длина', '≈ 18 м'], ['Вес', '≈ 15 т'], ['Ел', 'Растения'], ['Нашли', 'Индия']],
        size: 'Длиной как полтора автобуса',
        desc: 'Джайнозавр — огромный длинношеий динозавр-титанозавр. Жил около 67 миллионов лет назад в Индии.',
        say: 'Джайнозавр — длинношеий великан из Индии. Его назвали в честь индийского учёного Сохана Лала Джайна.' },
      facts: {
        head: { part: 'Череп', text: 'Учёные нашли часть его черепа — мозговую коробку. Черепа длинношеих динозавров находят очень редко.' },
        body: { part: 'Имя', text: 'Его назвали в честь индийского учёного Сохана Лала Джайна, который изучал динозавров Индии.' },
        legs: { part: 'Находка', text: 'Его кости геолог Чарльз Мэтли раскапывал у города Джабалпура с 1917 по 1920 год.' },
        tail: { part: 'Северный', text: 'Сначала его приняли за антарктозавра — «южного ящера» из Южной Америки. А раз нашли его на севере, второе имя ему дали «северный».' },
      },
      chapters: [EGG(['legs']),
        // just out of the egg: the snake Sanajeh hunted hatchlings at the nests of the long-necked dinosaurs
        Object.assign(HIDE(2, 'nb_sanajeh', 'санадж', 'змеи санаджа'), { age: 0, facts: ['tail'] }),
        Object.assign(TRACKS(3, { hunter: 'sp_raja', herd: 'jaino',
          intro: ['Малыш отстал от стада! Взрослые джайнозавры оставили большие круглые следы. Нажимай на круглые следы — они приведут к стаду.',
            'Ищи большие круглые следы — они ведут к стаду!'],
          ok: 'Правильно! Это следы джайнозавров. Идём дальше.',
          thero: 'Три пальца с когтями — это следы хищника раджазавра! Ищи большие круглые следы.',
          win: 'Ура! Следы привели к стаду. Рядом со взрослыми великанами малышу безопаснее.' }), { facts: ['head'] }),
        Object.assign(SEEK(4, ['laevi', 'nb_indosuchus', 'nb_deccanolestes'], 'bg_valley'), { facts: ['body'] }),
        Object.assign(FEED(5, 'Трава', 'it_grass', 'щипли траву и низкие растения!', { low: true, bg: 'bg_run' }),
          { note: 'Трава при динозаврах уже росла, но ещё не покрывала землю лугами, как сейчас.' }),
        FIN('bg_valley', '50% 50%')],
      final: { len: '≈ 18 м', wt: '≈ 15 т', say: 'Ура! Твой джайнозавр вырос — длинношеий великан из Индии! Загляни в музей.' },
    });
    cre('laevi', {
      name: 'Лаевизух', gen: 'лаевизуха', site: 'jabalpur', kind: 'Хищник', predator: true, pathBg: 'bg_forest',
      hero: { name: 'Лаевизух', latin: 'Laevisuchus indicus', period: K('≈67 млн лет назад'),
        rows: [['Длина', '≈ 2 м'], ['Ел', 'Мелкую добычу'], ['Знаем по', 'Позвонкам'], ['Нашли', 'Индия']],
        size: 'Длиной около двух метров',
        desc: 'Лаевизух — маленький быстрый хищник, родственник масиакозавра. Жил около 67 миллионов лет назад в Индии.',
        say: 'Лаевизух — «лёгкий крокодил». Но это не крокодил, а маленький быстрый динозавр-хищник!' },
      facts: {
        head: { part: 'Имя', text: 'Его имя значит «лёгкий крокодил». Так его назвали, хотя это динозавр, а не крокодил.' },
        body: { part: 'Позвонки', text: 'От лаевизуха нашли всего несколько позвонков — из шеи, спины и хвоста. По ним учёные и узнали о нём.' },
        legs: { part: 'Родня', text: 'Его родственник — масиакозавр с Мадагаскара. Он тоже был маленьким и быстрым.' },
        tail: { part: 'Находка', text: 'Его кости нашёл Чарльз Мэтли у Джабалпура, в слое, который назвали «слоем хищников».' },
      },
      chapters: [EGG(['body']),
        Object.assign(CHASE(2, 'it_mammal', 'зверьков', 'bg_forest'), { facts: ['legs'] }),
        Object.assign(RUN(3, 'nb_indosuchus', 'индозух', 'индозуха'), { facts: ['head'] }),
        Object.assign(SEEK(4, ['jaino', 'nb_indosuchus', 'nb_deccanolestes'], 'bg_valley'), { facts: ['tail'] }),
        NEST(5, 'bg_forest', ['nb_deccanolestes', 'it_lizard']),
        FIN('bg_forest', '50% 50%')],
      final: { len: '≈ 2 м', wt: 'лёгкий и быстрый', wtIcon: 'zap', say: 'Ура! Твой лаевизух вырос — маленький быстрый охотник! Загляни в музей.' },
    });
    cre('bharat', {
      name: 'Бхаратерий', gen: 'бхаратерия', site: 'naskal', kind: 'Зверёк', pathBg: 'bg_run',
      hero: { name: 'Бхаратерий', latin: 'Bharattherium bonapartei', period: K('≈66 млн лет назад'),
        rows: [['Знаем по', '8 зубам'], ['Зубы', 'Высокие'], ['Ел', 'Траву'], ['Нашли', 'Индия']],
        size: 'Учёные знают его только по зубам',
        desc: 'Бхаратерий — древний зверёк. Жил около 66 миллионов лет назад в Индии, рядом с динозаврами.',
        say: 'Бхаратерий — зверёк, который жил рядом с динозаврами. Учёные нашли только его зубы!' },
      facts: {
        head: { part: 'Зубы', text: 'Его зубы были высокими, как у нынешних зверей, которые едят жёсткую траву. Наверное, он тоже ел траву.' },
        body: { part: 'Имя', text: '«Бхарат» — так называют Индию на языке хинди, а «терий» значит «зверь».' },
        legs: { part: 'Находка', text: 'Первый его зуб нашли в 1989 году у деревни Наскал. Всего учёные знают восемь его зубов.' },
        tail: { part: 'Два имени', text: 'В 2007 году две группы учёных назвали его по-разному. Осталось имя, которое напечатали первым.' },
      },
      chapters: [
        Object.assign(FEED(1, 'Колоски', 'it_seeds', 'щипли колоски травы!', { low: true, bg: 'bg_run' }), { facts: ['head'] }),
        Object.assign(BURROW(2, { hunter: 'sp_laevi', hbox: [560, 250], box: [190, 95],
          intro: ['Это норка бхаратерия. Нажимай на траву — он выбежит и поест. Зашуршали кусты — скорее нажми на норку!',
            'Нажимай на траву, а если идёт хищник — на норку!'],
          win: 'Наелся! Маленьких зверьков от хищников спасали норки.' }), { facts: ['legs'] }),
        Object.assign(CH(3, 'night', 'Ночью', 2, { scene: 'night', bg: 'bg_run', pos: '50% 55%', size: '240%',
          p: { need: 5, bg: 'bg_run', item: 'it_palmfruit', ih: [46, 58], icon: 'leaf', stat: 'Плодов', moon: true, box: [250, 110],
            intro: ['Ночь. Бхаратерий выходит поесть. Веди пальцем — так он смотрит вокруг. Увидишь упавший плод пальмы — нажми на него!',
              'Веди пальцем и ищи в темноте плоды пальм!'],
            first: 'Хрум! Нашёл в темноте спелый плод.',
            missTip: 'Там ничего нет. Веди пальцем — так бхаратерий смотрит вокруг — и ищи плоды пальм.',
            win: 'Наелся! Многие древние зверьки, наверное, искали еду ночью — так было безопаснее.' },
          say: 'Глава 3: найди в темноте упавшие плоды пальм!' }), { facts: ['body'] }),
        Object.assign(SEEK(4, ['kurma', 'nb_deccanolestes', 'nb_igdabatis'], 'bg_valley'), { facts: ['tail'] }),
        FIN('bg_run', '50% 60%')],
      final: { len: 'знаем по 8 зубам', wt: 'ел траву', wtIcon: 'leaf', say: 'Ура! Твой бхаратерий вырос — зверёк, который жил рядом с динозаврами! Загляни в музей.' },
    });
    cre('kurma', {
      name: 'Курмадемис', gen: 'курмадемиса', site: 'kallamedu', kind: 'Черепаха', pathBg: 'bg_lagoon',
      hero: { name: 'Курмадемис', latin: 'Kurmademys kallamedensis', period: K('≈68 млн лет назад'),
        rows: [['Череп', '≈ 5 см'], ['Шея', 'Убиралась вбок'], ['Жил', 'В пруду'], ['Нашли', 'Индия']],
        size: 'Череп — размером со спичечный коробок',
        desc: 'Курмадемис — бокошейная черепаха: голову он прятал, загибая шею вбок. Жил около 68 миллионов лет назад в пресных прудах на юге Индии.',
        say: 'Курмадемис — бокошейная черепаха. Голову он прятал не внутрь панциря, а вбок, под его край.' },
      facts: {
        head: { part: 'Шея', text: 'Курмадемис не втягивал голову в панцирь, как наши черепахи, а прятал её под край панциря, загибая шею вбок.' },
        body: { part: 'Имя', text: '«Курма» на санскрите и «эмис» по-гречески значат одно и то же — «черепаха».' },
        fins: { part: 'Находка', text: 'У деревни Калламеду нашли шесть его черепов. Самый целый — длиной меньше пяти сантиметров.' },
        tail: { part: 'Родня', text: 'Бокошейные черепахи и сейчас живут в Африке, Южной Америке и Австралии. А в Индии их больше нет.' },
      },
      chapters: [EGG(['fins']),
        Object.assign(SWIM(2, 'В пруду', ['it_fish', 'it_snail'], 8, 'плавай в пруду, лови рыбок и улиток и не забывай дышать!'), { facts: ['head'] }),
        Object.assign(AMBUSH(3, 'it_fish', 'затаись на дне и хватай рыбок!'), { facts: ['body'] }),
        Object.assign(SEEK(4, ['bharat', 'nb_deccanolestes', 'nb_igdabatis'], 'bg_lagoon'), { facts: ['tail'] }),
        Object.assign(LAYEGGS(5, { bg: 'bg_cind_bank',
          climb: 'Ночь. Черепаха выходит из пруда на берег. Нажимай — она ползёт вверх по песку.',
          dig: 'Здесь сухо и тепло. Нажимай — задними лапами черепаха роет ямку.',
          back: 'Гнездо спрятано. Пора домой, в пруд — нажимай!',
          win: 'Готово! Черепахи не сидят на яйцах: тёплый песок сам согревает кладку, а малыши потом сами ползут к воде.' }),
          { bg: 'bg_cind_bank', note: 'Черепахи и сейчас откладывают яйца в тёплый песок на берегу и уходят. Малыши вылупляются сами.' }),
        FIN('bg_lagoon', '50% 50%')],
      final: { len: 'череп ≈ 5 см', wt: 'шея вбок', wtIcon: 'star', say: 'Ура! Твой курмадемис вырос — бокошейная черепаха из Индии! Загляни в музей.' },
    });
    // the chapter builders, for the Triassic waves of js/trias.js
    CRETA.kit = { SEEK, NEST, DEF, RAM, CHASE, SNEAK, FEED, SWIM, AMBUSH, HIDE, STALK, RUN, MOW, TRACKS, NIGHTHUNT, DIVING, SANDNEST, BURROW };
  },
});
