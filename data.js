window.PGX_DATA = {
  rules: [
    {
      id: "clopidogrel-cyp2c19",
      drug: "Клопидогрел",
      aliases: ["clopidogrel", "плавикс", "plavix", "антиагрегант"],
      gene: "CYP2C19",
      source: "CPIC: CYP2C19-clopidogrel; FDA PGx associations",
      evidence: "A",
      severity: "high",
      matches: {
        "poor metabolizer": "Избегать стандартной стратегии с клопидогрелом, если возможно; обсудить альтернативный антиагрегант, не зависящий от CYP2C19.",
        "intermediate metabolizer": "Обсудить альтернативный антиагрегант при ACS/PCI или высоком тромботическом риске.",
        "rapid metabolizer": "Обычно стандартная дозировка допустима, если нет других противопоказаний.",
        "ultrarapid metabolizer": "Обычно стандартная дозировка допустима, если нет других противопоказаний."
      }
    },
    {
      id: "ppis-cyp2c19",
      drug: "Ингибиторы протонной помпы",
      aliases: ["omeprazole", "омепразол", "esomeprazole", "эзомепразол", "pantoprazole", "пантопразол", "ppi", "ипп"],
      gene: "CYP2C19",
      source: "CPIC: CYP2C19-proton pump inhibitors; FDA PGx associations",
      evidence: "A",
      severity: "moderate",
      matches: {
        "poor metabolizer": "Вероятно повышенная экспозиция. Для взрослых часто достаточно мониторинга; для длительной терапии обсудить минимальную эффективную дозу.",
        "rapid metabolizer": "Возможен сниженный эффект. При неэффективности обсудить повышение дозы или препарат, менее зависящий от CYP2C19.",
        "ultrarapid metabolizer": "Возможен сниженный эффект. Обсудить альтернативу или индивидуальную коррекцию терапии."
      }
    },
    {
      id: "opioids-cyp2d6",
      drug: "Кодеин и трамадол",
      aliases: ["codeine", "кодеин", "tramadol", "трамадол", "opioid", "опиоид"],
      gene: "CYP2D6",
      source: "CPIC: CYP2D6-opioids; FDA PGx associations",
      evidence: "A",
      severity: "high",
      matches: {
        "poor metabolizer": "Ожидается слабый обезболивающий эффект для кодеина/трамадола. Обсудить альтернативный анальгетик.",
        "ultrarapid metabolizer": "Повышен риск токсичности из-за быстрого образования активных метаболитов. Обычно рекомендуют избегать кодеина и трамадола."
      }
    },
    {
      id: "atomoxetine-cyp2d6",
      drug: "Атомоксетин",
      aliases: ["atomoxetine", "атомоксетин", "strattera", "страттера"],
      gene: "CYP2D6",
      source: "CPIC/FDA: CYP2D6-atomoxetine",
      evidence: "A",
      severity: "moderate",
      matches: {
        "poor metabolizer": "Вероятны более высокие концентрации и риск побочных эффектов. Нужны более осторожная титрация и мониторинг.",
        "ultrarapid metabolizer": "Возможен сниженный ответ. Обсудить оценку концентраций/эффекта и альтернативы при неэффективности."
      }
    },
    {
      id: "statins-slco1b1",
      drug: "Статины",
      aliases: ["simvastatin", "симвастатин", "atorvastatin", "аторвастатин", "rosuvastatin", "розувастатин", "statin", "статин"],
      gene: "SLCO1B1",
      source: "CPIC: SLCO1B1/ABCG2/CYP2C9-statins; FDA PGx associations",
      evidence: "A",
      severity: "moderate",
      matches: {
        "decreased function": "Повышен риск мышечных симптомов, особенно для симвастатина. Обсудить меньшую дозу, другой статин или мониторинг.",
        "poor function": "Существенно повышен риск мышечной токсичности для отдельных статинов. Обсудить альтернативу и осторожное дозирование."
      }
    },
    {
      id: "nsaids-cyp2c9",
      drug: "НПВС",
      aliases: ["ibuprofen", "ибупрофен", "celecoxib", "целекоксиб", "diclofenac", "диклофенак", "meloxicam", "мелоксикам", "nsaid", "нпвс"],
      gene: "CYP2C9",
      source: "CPIC: CYP2C9-NSAIDs; FDA PGx associations",
      evidence: "A",
      severity: "moderate",
      matches: {
        "poor metabolizer": "Вероятно повышенная экспозиция для ряда НПВС. Обсудить снижение стартовой дозы или альтернативный препарат.",
        "intermediate metabolizer": "Возможна повышенная экспозиция. Уместны осторожное дозирование и мониторинг побочных эффектов."
      }
    },
    {
      id: "thiopurines-tpmt",
      drug: "Тиопурины",
      aliases: ["azathioprine", "азатиоприн", "mercaptopurine", "меркаптопурин", "thioguanine", "тиогуанин", "тиопурин"],
      gene: "TPMT",
      source: "CPIC/FDA: TPMT/NUDT15-thiopurines",
      evidence: "A",
      severity: "high",
      matches: {
        "poor metabolizer": "Высокий риск миелосупрессии. Обычно требуется резкое снижение дозы или альтернативная терапия.",
        "intermediate metabolizer": "Повышен риск миелосупрессии. Обычно требуется снижение стартовой дозы и контроль крови."
      }
    },
    {
      id: "thiopurines-nudt15",
      drug: "Тиопурины",
      aliases: ["azathioprine", "азатиоприн", "mercaptopurine", "меркаптопурин", "thioguanine", "тиогуанин", "тиопурин"],
      gene: "NUDT15",
      source: "CPIC/FDA: TPMT/NUDT15-thiopurines",
      evidence: "A",
      severity: "high",
      matches: {
        "poor metabolizer": "Высокий риск миелосупрессии. Обычно требуется резкое снижение дозы или альтернативная терапия.",
        "intermediate metabolizer": "Повышен риск миелосупрессии. Обычно требуется снижение стартовой дозы и контроль крови."
      }
    },
    {
      id: "abacavir-hlab",
      drug: "Абакавир",
      aliases: ["abacavir", "абакавир"],
      gene: "HLA-B*57:01",
      source: "CPIC/FDA: HLA-B*57:01-abacavir",
      evidence: "A",
      severity: "high",
      matches: {
        positive: "Повышен риск тяжелой гиперчувствительности. Абакавир обычно противопоказан при HLA-B*57:01 positive."
      }
    },
    {
      id: "allopurinol-hlab",
      drug: "Аллопуринол",
      aliases: ["allopurinol", "аллопуринол"],
      gene: "HLA-B*58:01",
      source: "CPIC/FDA: HLA-B*58:01-allopurinol",
      evidence: "A",
      severity: "high",
      matches: {
        positive: "Повышен риск тяжелых кожных реакций. Обсудить альтернативу аллопуринолу."
      }
    }
  ],
  phenotypeMaps: {
    CYP2C19: {
      "*1/*1": "normal metabolizer",
      "*1/*2": "intermediate metabolizer",
      "*1/*3": "intermediate metabolizer",
      "*2/*17": "intermediate metabolizer",
      "*2/*2": "poor metabolizer",
      "*2/*3": "poor metabolizer",
      "*3/*3": "poor metabolizer",
      "*1/*17": "rapid metabolizer",
      "*17/*17": "ultrarapid metabolizer"
    },
    CYP2D6: {
      "*1/*1": "normal metabolizer",
      "*1/*4": "intermediate metabolizer",
      "*4/*4": "poor metabolizer",
      "*5/*5": "poor metabolizer",
      "*1xN/*1": "ultrarapid metabolizer"
    },
    CYP2C9: {
      "*1/*1": "normal metabolizer",
      "*1/*2": "intermediate metabolizer",
      "*1/*3": "intermediate metabolizer",
      "*2/*2": "poor metabolizer",
      "*2/*3": "poor metabolizer",
      "*3/*3": "poor metabolizer"
    },
    TPMT: {
      "*1/*1": "normal metabolizer",
      "*1/*2": "intermediate metabolizer",
      "*1/*3A": "intermediate metabolizer",
      "*1/*3C": "intermediate metabolizer",
      "*2/*3A": "poor metabolizer",
      "*3A/*3A": "poor metabolizer",
      "*3C/*3C": "poor metabolizer"
    },
    NUDT15: {
      "*1/*1": "normal metabolizer",
      "*1/*2": "intermediate metabolizer",
      "*1/*3": "intermediate metabolizer",
      "*2/*3": "poor metabolizer",
      "*3/*3": "poor metabolizer"
    }
  },
  snpHints: [
    {
      rsid: "rs4149056",
      gene: "SLCO1B1",
      calls: { TT: "normal function", CT: "decreased function", TC: "decreased function", CC: "poor function" }
    },
    {
      rsid: "rs4244285",
      gene: "CYP2C19",
      calls: { GG: "normal metabolizer", GA: "intermediate metabolizer", AG: "intermediate metabolizer", AA: "poor metabolizer" }
    },
    {
      rsid: "rs4986893",
      gene: "CYP2C19",
      calls: { GG: "normal metabolizer", GA: "intermediate metabolizer", AG: "intermediate metabolizer", AA: "poor metabolizer" }
    },
    {
      rsid: "rs1057910",
      gene: "CYP2C9",
      calls: { AA: "normal metabolizer", AC: "intermediate metabolizer", CA: "intermediate metabolizer", CC: "poor metabolizer" }
    }
  ],
  medicationKnowledge: [
    {
      substance: "rosuvastatin",
      label: "Розувастатин",
      aliases: [
        "розувастатин",
        "rosuvastatin",
        "крестор",
        "сувардио",
        "розукард",
        "розулип",
        "мертенил",
        "роксера",
        "розарт",
        "розистарк",
        "росукор",
        "реддистатин",
        "редистатин",
        "тевастор",
        "тевастор-тева",
        "фастронг",
        "правапрес"
      ],
      group: "statin"
    },
    {
      substance: "atorvastatin",
      label: "Аторвастатин",
      aliases: ["аторвастатин", "atorvastatin", "липримар", "аторис", "торвакард", "торвазин", "тulip", "тулип", "липонорм", "аторвастатин-тева"],
      group: "statin"
    },
    {
      substance: "atorvastatin-ezetimibe",
      label: "Аторвастатин + Эзетимиб",
      aliases: ["торвазин+", "торвазин плюс", "аторвастатин эзетимиб", "аторвастатин + эзетимиб"],
      group: "statin_combo"
    },
    {
      substance: "simvastatin",
      label: "Симвастатин",
      aliases: ["симвастатин", "simvastatin", "зокор", "вазилип"],
      group: "statin"
    },
    {
      substance: "clopidogrel",
      label: "Клопидогрел",
      aliases: ["клопидогрел", "clopidogrel", "плавикс", "зилт", "лопирел", "плагрил", "клопидекс", "эгитромб"],
      group: "antiplatelet"
    },
    {
      substance: "omeprazole",
      label: "Омепразол",
      aliases: ["омепразол", "omeprazole", "омез", "ультоп", "омелик", "лосек", "гастрозол", "оританол"],
      group: "ppi"
    },
    {
      substance: "esomeprazole",
      label: "Эзомепразол",
      aliases: ["эзомепразол", "esomeprazole", "нексиум"],
      group: "ppi"
    },
    {
      substance: "pantoprazole",
      label: "Пантопразол",
      aliases: ["пантопразол", "pantoprazole", "контролок", "нольпаза"],
      group: "ppi"
    },
    {
      substance: "rabeprazole",
      label: "Рабепразол",
      aliases: ["рабепразол", "rabeprazole", "разо", "париет", "хайрабезол", "зульбекс"],
      group: "ppi"
    },
    {
      substance: "rebamipide",
      label: "Ребамипид",
      aliases: ["ребамипид", "rebamipide", "ребагит"],
      group: "gastroprotective"
    },
    {
      substance: "ibuprofen",
      label: "Ибупрофен",
      aliases: ["ибупрофен", "ibuprofen", "нурофен", "эврофаст", "миг", "ибуклин"],
      group: "nsaid"
    },
    {
      substance: "diclofenac",
      label: "Диклофенак",
      aliases: ["диклофенак", "diclofenac", "вольтарен", "ортофен", "диклак", "наклофен"],
      group: "nsaid"
    },
    {
      substance: "celecoxib",
      label: "Целекоксиб",
      aliases: ["целекоксиб", "celecoxib", "целебрекс"],
      group: "nsaid"
    },
    {
      substance: "meloxicam",
      label: "Мелоксикам",
      aliases: ["мелоксикам", "meloxicam", "мовалис", "амелотекс", "мовасин"],
      group: "nsaid"
    },
    {
      substance: "codeine",
      label: "Кодеин",
      aliases: ["кодеин", "codeine"],
      group: "opioid_cyp2d6"
    },
    {
      substance: "tramadol",
      label: "Трамадол",
      aliases: ["трамадол", "tramadol", "трамал"],
      group: "opioid_cyp2d6"
    },
    {
      substance: "warfarin",
      label: "Варфарин",
      aliases: ["варфарин", "warfarin"],
      group: "anticoagulant"
    },
    {
      substance: "rivaroxaban",
      label: "Ривароксабан",
      aliases: ["ривароксабан", "rivaroxaban", "ксарелто", "xarelto"],
      group: "anticoagulant"
    },
    {
      substance: "apixaban",
      label: "Апиксабан",
      aliases: ["апиксабан", "apixaban", "эликвис", "eliquis"],
      group: "anticoagulant"
    },
    {
      substance: "dabigatran",
      label: "Дабигатран",
      aliases: ["дабигатран", "dabigatran", "прадакса", "pradaxa"],
      group: "anticoagulant"
    },
    {
      substance: "aspirin",
      label: "Ацетилсалициловая кислота",
      aliases: ["аспирин", "ацетилсалициловая кислота", "тромбо асс", "кардиомагнил", "aspirin"],
      group: "antiplatelet_asa"
    },
    {
      substance: "bisoprolol",
      label: "Бисопролол",
      aliases: ["бисопролол", "bisoprolol", "конкор", "конкор кор", "нипертен", "дорез", "бидоп", "коронал"],
      group: "beta_blocker"
    },
    {
      substance: "carvedilol",
      label: "Карведилол",
      aliases: ["карведилол", "carvedilol", "дилатор", "дилатренд", "кардил"],
      group: "beta_blocker"
    },
    {
      substance: "amlodipine",
      label: "Амлодипин",
      aliases: ["амлодипин", "amlodipine", "норваск", "нормодипин", "амлотоп", "калчек"],
      group: "calcium_channel_blocker"
    },
    {
      substance: "perindopril",
      label: "Периндоприл",
      aliases: ["периндоприл", "perindopril", "престариум", "перинева"],
      group: "ace_inhibitor"
    },
    {
      substance: "enalapril",
      label: "Эналаприл",
      aliases: ["эналаприл", "enalapril", "энап", "ренитек", "энам"],
      group: "ace_inhibitor"
    },
    {
      substance: "losartan",
      label: "Лозартан",
      aliases: ["лозартан", "losartan", "лориста", "лозап", "козаар"],
      group: "arb"
    },
    {
      substance: "valsartan",
      label: "Валсартан",
      aliases: ["валсартан", "valsartan", "диован", "валз", "нортриван"],
      group: "arb"
    },
    {
      substance: "candesartan",
      label: "Кандесартан",
      aliases: ["кандесартан", "candesartan", "атаканд", "гипосарт"],
      group: "arb"
    },
    {
      substance: "azilsartan medoxomil",
      label: "Азилсартан медоксомил",
      aliases: ["азилсартан", "azilsartan", "эдарби", "edarbi"],
      group: "arb"
    },
    {
      substance: "indapamide",
      label: "Индапамид",
      aliases: ["индапамид", "indapamide", "арифон", "равел"],
      group: "diuretic"
    },
    {
      substance: "spironolactone",
      label: "Спиронолактон",
      aliases: ["спиронолактон", "spironolactone", "верошпирон"],
      group: "potassium_sparing_diuretic"
    },
    {
      substance: "eplerenone",
      label: "Эплеренон",
      aliases: ["эплеренон", "eplerenone", "инспра", "эплепрес"],
      group: "potassium_sparing_diuretic"
    },
    {
      substance: "ezetimibe",
      label: "Эзетимиб",
      aliases: ["эзетимиб", "ezetimibe", "эзетрол", "отрио"],
      group: "lipid_lowering"
    },
    {
      substance: "fenofibrate",
      label: "Фенофибрат",
      aliases: ["фенофибрат", "fenofibrate", "трайкор", "липантил"],
      group: "fibrate"
    },
    {
      substance: "metformin",
      label: "Метформин",
      aliases: ["метформин", "metformin", "глюкофаж", "сиофор", "форметин"],
      group: "antidiabetic"
    },
    {
      substance: "levothyroxine",
      label: "Левотироксин",
      aliases: ["левотироксин", "levothyroxine", "эутирокс", "l-тироксин", "л-тироксин"],
      group: "thyroid_hormone"
    },
    {
      substance: "azithromycin",
      label: "Азитромицин",
      aliases: ["азитромицин", "azithromycin", "сумамед", "азитрокс", "затрин", "зитролид"],
      group: "macrolide"
    },
    {
      substance: "clarithromycin",
      label: "Кларитромицин",
      aliases: ["кларитромицин", "clarithromycin", "клацид", "клабакс", "фромилид"],
      group: "macrolide"
    },
    {
      substance: "levocetirizine",
      label: "Левоцетиризин",
      aliases: ["левоцетиризин", "levocetirizine", "супрастинекс", "ксизал", "зилола", "алерон"],
      group: "antihistamine"
    },
    {
      substance: "memantine",
      label: "Мемантин",
      aliases: ["мемантин", "memantine", "акатинол мемантин", "когномем", "меманталь", "меморель"],
      group: "nmda_antagonist"
    },
    {
      substance: "pancreatin",
      label: "Панкреатин",
      aliases: ["панкреатин", "pancreatin", "креон", "микразим", "креоста", "мезим", "панзинорм"],
      group: "enzyme"
    },
    {
      substance: "saccharomyces boulardii",
      label: "Saccharomyces boulardii",
      aliases: ["энтерол", "enterol", "saccharomyces boulardii", "сахаромицеты булардии"],
      group: "probiotic"
    },
    {
      substance: "bismuth tripotassium dicitrate",
      label: "Висмута трикалия дицитрат",
      aliases: ["де-нол", "денол", "de-nol", "висмута трикалия дицитрат", "висмута субцитрат", "bismuth"],
      group: "bismuth"
    },
    {
      substance: "glucosamine-chondroitin",
      label: "Глюкозамин + Хондроитин сульфат натрия",
      aliases: ["артра", "artra", "глюкозамин хондроитин", "глюкозамин + хондроитин"],
      group: "chondroprotective"
    },
    {
      substance: "amoxicillin-clavulanic acid",
      label: "Амоксициллин + Клавулановая кислота",
      aliases: ["амоксиклав", "amoxiclav", "аугментин", "augmentin", "амоксициллин клавулановая кислота"],
      group: "penicillin_combo"
    },
    {
      substance: "trimetazidine",
      label: "Триметазидин",
      aliases: ["триметазидин", "trimetazidine", "предуктал"],
      group: "metabolic"
    }
  ],
  shotListMedications: [
    {
      label: "Хондропротекторы",
      aliases: [
        "хондропротектор",
        "хондропротекторы",
        "глюкозамин",
        "хондроитин",
        "хондроитина сульфат",
        "glucosamine",
        "chondroitin"
      ],
      groups: ["chondroprotective"],
      category: "не доказана эффективность",
      note: "Групповой флаг: хондропротекторы в источнике отнесены к препаратам с недоказанной эффективностью."
    },
    {
      label: "Агри",
      aliases: ["агри"],
      category: "гомеопатия",
      note: "В источнике указан как гомеопатический антигриппин."
    },
    {
      label: "Арбидол",
      aliases: ["арбидол", "умифеновир", "umifenovir"],
      category: "не доказана эффективность",
      note: "Упоминается в перечне устаревших препаратов с недоказанной эффективностью."
    },
    {
      label: "Валидол",
      aliases: ["валидол"],
      category: "не доказана эффективность",
      note: "Упоминается в перечне устаревших препаратов с недоказанной эффективностью."
    },
    {
      label: "Валокордин",
      aliases: ["валокордин", "корвалол"],
      category: "устаревший подход",
      note: "Упоминается в перечне устаревших препаратов с недоказанной эффективностью."
    },
    {
      label: "Винпоцетин",
      aliases: ["винпоцетин", "кавинтон"],
      category: "не доказана эффективность",
      note: "Упоминается в перечне устаревших препаратов с недоказанной эффективностью."
    },
    {
      label: "Пирацетам",
      aliases: ["пирацетам", "ноотропил"],
      category: "не доказана эффективность",
      note: "Упоминается в перечне устаревших препаратов с недоказанной эффективностью."
    },
    {
      label: "Римантадин",
      aliases: ["римантадин", "ремантадин"],
      category: "устаревший противовирусный",
      note: "Упоминается в перечне устаревших препаратов с недоказанной эффективностью."
    },
    {
      label: "Триметазидин",
      aliases: ["триметазидин", "предуктал"],
      category: "не доказана эффективность",
      note: "Упоминается в перечне устаревших препаратов с недоказанной эффективностью."
    },
    {
      label: "Фенотропил",
      aliases: ["фенотропил", "фонтурацетам"],
      category: "не доказана эффективность",
      note: "Упоминается в перечне устаревших препаратов с недоказанной эффективностью."
    },
    {
      label: "Хондроитинсульфат",
      aliases: ["хондроитин", "хондроитинсульфат"],
      category: "не доказана эффективность",
      note: "Упоминается в перечне устаревших препаратов с недоказанной эффективностью."
    },
    {
      label: "Церебролизин",
      aliases: ["церебролизин", "cerebrolysin"],
      category: "нет убедительных исследований",
      note: "В источнике отмечены отсутствие спецификации состава, механизма действия и высококачественных исследований."
    },
    {
      label: "Циклоферон",
      aliases: ["циклоферон", "cycloferon"],
      category: "нет исследований достаточного качества",
      note: "В источнике описан как индуктор интерферона без доказанной клинической эффективности в крупных международных исследованиях."
    },
    {
      label: "Актовегин",
      aliases: ["актовегин", "солкосерил", "actovegin", "solcoseryl"],
      category: "нет убедительных исследований",
      note: "В источнике указан как препарат без ясного механизма действия и доказательств эффективности."
    },
    {
      label: "Адаптол",
      aliases: ["адаптол", "мебикар", "мебикс", "adaptol"],
      category: "нет исследований",
      note: "В источнике отмечено отсутствие данных в Cochrane/PubMed/FDA/RXlist/ВОЗ для действующего вещества."
    },
    {
      label: "Адеметионин",
      aliases: ["адеметионин", "гептрал", "гептор", "sam-e", "ademetionine"],
      category: "спорная доказательность",
      note: "В источнике описаны противоречивые данные и отсутствие точных подтверждений по заявленным показаниям."
    }
  ],
  labAnalytes: [
    {
      key: "egfr",
      label: "eGFR",
      aliases: ["egfr", "скф", "рскф", "скорость клубочковой фильтрации"],
      unit: "мл/мин/1.73м2",
      reference: { min: 60, max: null },
      description: "Оценка фильтрационной функции почек; помогает понять, нужна ли коррекция доз лекарств, выводимых почками."
    },
    {
      key: "creatinine",
      label: "Креатинин",
      aliases: ["креатинин", "creatinine"],
      unit: "мкмоль/л",
      reference: { min: 62, max: 106 },
      description: "Маркер функции почек и мышечного обмена; используется вместе с eGFR для оценки почечного клиренса."
    },
    {
      key: "alt",
      label: "АЛТ",
      aliases: ["алт", "аланинаминотрансфераза", "alt", "alat"],
      unit: "Ед/л",
      reference: { min: null, max: 41 },
      description: "Фермент печени; повышение может указывать на повреждение клеток печени и важно при оценке гепатотоксичных препаратов."
    },
    {
      key: "ast",
      label: "АСТ",
      aliases: ["аст", "аспартатаминотрансфераза", "ast", "asat"],
      unit: "Ед/л",
      reference: { min: null, max: 40 },
      description: "Фермент печени, мышц и сердца; интерпретируется вместе с АЛТ, КФК и клиническим контекстом."
    },
    {
      key: "bilirubin",
      label: "Билирубин общий",
      aliases: ["билирубин общий", "общий билирубин", "total bilirubin", "bilirubin"],
      unit: "мкмоль/л",
      reference: { min: 3.4, max: 20.5 },
      description: "Показатель обмена гемоглобина и желчевыведения; важен при оценке печени и желчных путей."
    },
    {
      key: "ck",
      label: "КФК",
      aliases: ["кфк", "креатинкиназа", "ck", "creatine kinase"],
      unit: "Ед/л",
      reference: { min: null, max: 190 },
      description: "Фермент мышц; важен при мышечных симптомах и оценке переносимости статинов."
    },
    {
      key: "potassium",
      label: "Калий",
      aliases: ["калий", "potassium", "k+"],
      unit: "ммоль/л",
      reference: { min: 3.5, max: 5.1 },
      description: "Ключевой электролит для работы сердца и мышц; важен при диуретиках, ИАПФ/БРА и риске аритмий."
    },
    {
      key: "sodium",
      label: "Натрий",
      aliases: ["натрий", "sodium", "na+"],
      unit: "ммоль/л",
      reference: { min: 136, max: 145 },
      description: "Основной электролит крови; отражает водно-солевой баланс и может меняться при диуретиках и эндокринных нарушениях."
    },
    {
      key: "glucose",
      label: "Глюкоза",
      aliases: ["глюкоза", "glucose"],
      unit: "ммоль/л",
      reference: { min: 3.9, max: 5.5 },
      description: "Текущий уровень сахара крови; зависит от приема пищи и используется для оценки углеводного обмена."
    },
    {
      key: "hba1c",
      label: "HbA1c",
      aliases: ["hba1c", "гликированный гемоглобин", "гликированный hb"],
      unit: "%",
      reference: { min: null, max: 5.7 },
      description: "Средний уровень глюкозы за последние 2-3 месяца; помогает оценивать риск и контроль диабета."
    },
    {
      key: "total_cholesterol",
      label: "Холестерин общий",
      aliases: [
        "холестерин общий",
        "общий холестерин",
        "холестерол общий",
        "общий холестерол",
        "холестирин общий",
        "общий холестирин",
        "хс общий",
        "охс",
        "total cholesterol",
        "cholesterol total"
      ],
      unit: "ммоль/л",
      reference: { min: null, max: 5.2 },
      description: "Суммарный холестерин крови; полезен как общий ориентир, но риск точнее оценивается по ЛПНП, ЛПВП и триглицеридам."
    },
    {
      key: "ldl",
      label: "ЛПНП",
      aliases: [
        "холестерин липопротеинов низкой плотности",
        "холестерол липопротеины низкой плотности",
        "холестерол - липопротеины низкой плотности",
        "холестерин - липопротеины низкой плотности",
        "липопротеины низкой плотности",
        "холестерин-лпнп",
        "холестерин лпнп",
        "хс-лпнп",
        "хс лпнп",
        "лпнп",
        "ldl-c",
        "ldl cholesterol",
        "low density lipoprotein"
      ],
      unit: "ммоль/л",
      reference: { min: null, max: 1.8 },
      description: "Атерогенная фракция холестерина; главный целевой показатель при снижении сердечно-сосудистого риска."
    },
    {
      key: "crp",
      label: "C-реактивный белок",
      aliases: [
        "c-реактивный белок",
        "с-реактивный белок",
        "с реактивный белок",
        "c реактивный белок",
        "срб",
        "crp",
        "c-reactive protein"
      ],
      unit: "мг/л",
      reference: { min: null, max: 5.0 },
      description: "Маркер воспаления; сам по себе не указывает причину, но помогает оценивать инфекционный/воспалительный контекст."
    },
    {
      key: "hdl",
      label: "ЛПВП",
      aliases: [
        "холестерин липопротеинов высокой плотности",
        "липопротеины высокой плотности",
        "холестерин-лпвп",
        "холестерин лпвп",
        "хс-лпвп",
        "хс лпвп",
        "лпвп",
        "hdl-c",
        "hdl cholesterol",
        "high density lipoprotein"
      ],
      unit: "ммоль/л",
      reference: { min: 1.0, max: null },
      description: "Антиатерогенная фракция холестерина; участвует в обратном транспорте холестерина."
    },
    {
      key: "triglycerides",
      label: "Триглицериды",
      aliases: ["триглицериды", "тг", "triglycerides", "tg"],
      unit: "ммоль/л",
      reference: { min: null, max: 1.7 },
      description: "Жиры крови, чувствительные к питанию, алкоголю, инсулинорезистентности и ряду лекарств."
    },
    {
      key: "non_hdl",
      label: "Не-ЛПВП",
      aliases: ["холестерин не-лпвп", "не-лпвп", "не лпвп", "non-hdl", "non hdl"],
      unit: "ммоль/л",
      reference: { min: null, max: 3.8 },
      description: "Все атерогенные фракции холестерина кроме ЛПВП; полезен при повышенных триглицеридах."
    },
    {
      key: "atherogenic_index",
      label: "Коэффициент атерогенности",
      aliases: ["коэффициент атерогенности", "индекс атерогенности", "ка", "atherogenic index"],
      unit: "",
      reference: { min: null, max: 3.0 },
      description: "Расчетный индекс соотношения атерогенных и защитных липидных фракций."
    },
    {
      key: "tsh",
      label: "ТТГ",
      aliases: ["ттг", "tsh", "thyroid stimulating hormone"],
      unit: "мЕд/л",
      reference: { min: 0.4, max: 4.0 },
      description: "Гормон регуляции щитовидной железы; важен для обмена веществ, липидов, пульса и самочувствия."
    },
    {
      key: "ferritin",
      label: "Ферритин",
      aliases: ["ферритин", "ferritin"],
      unit: "мкг/л",
      reference: { min: 30, max: 400 },
      description: "Запас железа в организме; может повышаться при воспалении, поэтому интерпретируется вместе с CRP и анализом крови."
    },
    {
      key: "b12",
      label: "B12",
      aliases: ["витамин b12", "b12", "цианокобаламин"],
      unit: "пг/мл",
      reference: { min: 200, max: 900 },
      description: "Витамин, важный для нервной системы и кроветворения; дефицит может влиять на усталость и анемию."
    },
    {
      key: "vitamin_d",
      label: "Витамин D",
      aliases: ["25-oh витамин d", "25(oh)d", "витамин d", "25-oh d"],
      unit: "нг/мл",
      reference: { min: 30, max: 100 },
      description: "Основной показатель обеспеченности витамином D; связан с костным обменом и рядом общих рисков."
    }
  ]
};
