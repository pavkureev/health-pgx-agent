window.PGX_RULES = [
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
      id: "statins-abcg2",
      drug: "Розувастатин",
      aliases: ["rosuvastatin", "розувастатин", "крестор", "сувардио", "розукард", "statin", "статин"],
      gene: "ABCG2",
      source: "CPIC: SLCO1B1/ABCG2/CYP2C9-statins",
      evidence: "A",
      severity: "moderate",
      matches: {
        "decreased function": "ABCG2 decreased function может повышать экспозицию розувастатина. Обсудить дозу и мониторинг мышечных симптомов, особенно при высоких дозах.",
        "poor function": "ABCG2 poor function может существенно повышать экспозицию розувастатина. Нужна осторожность с дозой и оценка переносимости."
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
    },
    {
      id: "fluoropyrimidines-dpyd",
      drug: "Фторпиримидины",
      aliases: ["fluorouracil", "фторурацил", "5-fu", "5fu", "capecitabine", "капецитабин", "xeloda", "кселода", "tegafur", "тегафур", "фторпиримидин"],
      gene: "DPYD",
      source: "CPIC/DPWG/FDA: DPYD-fluoropyrimidines",
      evidence: "A",
      severity: "high",
      matches: {
        "intermediate metabolizer": "Сниженная активность DPD повышает риск тяжелой токсичности фторпиримидинов. Обсудить стартовое снижение дозы, альтернативу или терапевтический мониторинг по онкологическому протоколу.",
        "poor metabolizer": "Высокий риск жизнеугрожающей токсичности фторпиримидинов. Обычно требуется избегать стандартной терапии и срочно обсуждать альтернативу с онкологом.",
        "decreased function": "Найден вариант DPYD со сниженной функцией. До фторурацила/капецитабина стоит обсудить DPD-риск и стартовую дозу.",
        "no function": "Найден вариант DPYD с выраженным снижением функции. Стандартные фторпиримидины могут быть опасны; нужна очная онкологическая оценка."
      }
    },
    {
      id: "warfarin-cyp2c9",
      drug: "Варфарин",
      aliases: ["warfarin", "варфарин"],
      gene: "CYP2C9",
      source: "CPIC: CYP2C9/VKORC1/CYP4F2-warfarin",
      evidence: "A",
      severity: "high",
      matches: {
        "intermediate metabolizer": "Сниженный метаболизм S-варфарина может требовать более осторожного подбора дозы и частого контроля INR.",
        "poor metabolizer": "Существенно сниженный метаболизм S-варфарина повышает риск кровотечений при стандартных дозах. Дозу обычно подбирают по фармакогенетическому алгоритму и INR."
      }
    },
    {
      id: "warfarin-vkorc1",
      drug: "Варфарин",
      aliases: ["warfarin", "варфарин"],
      gene: "VKORC1",
      source: "CPIC: CYP2C9/VKORC1/CYP4F2-warfarin",
      evidence: "A",
      severity: "high",
      matches: {
        "increased sensitivity": "VKORC1-профиль связан с повышенной чувствительностью к варфарину. Обычно это означает более низкую ожидаемую поддерживающую дозу и необходимость аккуратного INR-контроля.",
        "intermediate sensitivity": "VKORC1-профиль может снижать ожидаемую дозу варфарина по сравнению с обычной. Полезно использовать PGx-алгоритм дозирования вместе с INR."
      }
    },
    {
      id: "warfarin-cyp4f2",
      drug: "Варфарин",
      aliases: ["warfarin", "варфарин"],
      gene: "CYP4F2",
      source: "CPIC: CYP2C9/VKORC1/CYP4F2-warfarin",
      evidence: "A",
      severity: "moderate",
      matches: {
        "decreased function": "CYP4F2 decreased function может повышать ожидаемую дозу варфарина. Это вспомогательный фактор для PGx-алгоритма и контроля INR."
      }
    },
    {
      id: "tacrolimus-cyp3a5",
      drug: "Такролимус",
      aliases: ["tacrolimus", "такролимус", "програф", "advagraf", "адваграф"],
      gene: "CYP3A5",
      source: "CPIC: CYP3A5-tacrolimus",
      evidence: "A",
      severity: "high",
      matches: {
        expresser: "CYP3A5 expresser обычно быстрее метаболизирует такролимус. При назначении часто требуется более высокая стартовая доза и обязательный терапевтический мониторинг концентраций.",
        "intermediate expresser": "CYP3A5 intermediate expresser может требовать коррекции стартовой дозы такролимуса и мониторинга trough-концентраций.",
        nonexpresser: "CYP3A5 nonexpresser обычно соответствует стандартному стартовому подходу, но концентрации такролимуса всё равно подбираются мониторингом."
      }
    },
    {
      id: "irinotecan-ugt1a1",
      drug: "Иринотекан",
      aliases: ["irinotecan", "иринотекан", "кампто", "campto"],
      gene: "UGT1A1",
      source: "CPIC/DPWG/FDA: UGT1A1-irinotecan",
      evidence: "A",
      severity: "high",
      matches: {
        "intermediate metabolizer": "Сниженная активность UGT1A1 может повышать риск нейтропении и диареи на иринотекане. Стоит обсудить стартовую дозу и мониторинг токсичности.",
        "poor metabolizer": "UGT1A1 poor metabolizer связан с высоким риском токсичности иринотекана, особенно при высоких дозах. Нужна онкологическая коррекция стратегии."
      }
    },
    {
      id: "atazanavir-ugt1a1",
      drug: "Атазанавир",
      aliases: ["atazanavir", "атазанавир", "реатаз", "reyataz"],
      gene: "UGT1A1",
      source: "CPIC: UGT1A1-atazanavir",
      evidence: "A",
      severity: "moderate",
      matches: {
        "poor metabolizer": "UGT1A1 poor metabolizer повышает вероятность выраженной непрямой гипербилирубинемии на атазанавире. Обсудить альтернативу или мониторинг билирубина.",
        "intermediate metabolizer": "Возможен повышенный риск гипербилирубинемии на атазанавире; полезен мониторинг билирубина и переносимости."
      }
    },
    {
      id: "carbamazepine-hla-a3101",
      drug: "Карбамазепин / окскарбазепин",
      aliases: ["carbamazepine", "карбамазепин", "финлепсин", "тегретол", "oxcarbazepine", "окскарбазепин", "трилептал"],
      gene: "HLA-A*31:01",
      source: "CPIC/FDA: HLA-A/HLA-B-carbamazepine",
      evidence: "A",
      severity: "high",
      matches: {
        positive: "Повышен риск реакций гиперчувствительности на карбамазепин, включая тяжелые кожные реакции. Обсудить альтернативный противоэпилептический препарат."
      }
    },
    {
      id: "carbamazepine-hlab1502",
      drug: "Карбамазепин / окскарбазепин",
      aliases: ["carbamazepine", "карбамазепин", "финлепсин", "тегретол", "oxcarbazepine", "окскарбазепин", "трилептал"],
      gene: "HLA-B*15:02",
      source: "CPIC/FDA: HLA-A/HLA-B-carbamazepine",
      evidence: "A",
      severity: "high",
      matches: {
        positive: "Повышен риск синдрома Стивенса-Джонсона / токсического эпидермального некролиза на карбамазепине и родственных препаратах. Обычно обсуждают альтернативу."
      }
    },
    {
      id: "antidepressants-cyp2c19",
      drug: "SSRI/SNRI антидепрессанты",
      aliases: ["citalopram", "циталопрам", "escitalopram", "эсциталопрам", "sertraline", "сертралин", "antidepressant", "антидепрессант", "ssri", "сиозс", "snri", "сиозсн"],
      gene: "CYP2C19",
      source: "CPIC: CYP2D6/CYP2C19/CYP2B6-antidepressants",
      evidence: "A",
      severity: "moderate",
      matches: {
        "poor metabolizer": "Для отдельных SSRI возможны повышенные концентрации и побочные эффекты. Обсудить меньшую стартовую дозу, альтернативу или мониторинг переносимости.",
        "rapid metabolizer": "Для отдельных SSRI возможны сниженные концентрации и недостаточный ответ. При неэффективности обсудить альтернативу или коррекцию стратегии.",
        "ultrarapid metabolizer": "Для отдельных SSRI вероятен риск недостаточного ответа из-за быстрого метаболизма. Обсудить препарат, менее зависящий от CYP2C19."
      }
    },
    {
      id: "antidepressants-cyp2d6",
      drug: "Антидепрессанты CYP2D6",
      aliases: ["paroxetine", "пароксетин", "fluvoxamine", "флувоксамин", "venlafaxine", "венлафаксин", "vortioxetine", "вортиоксетин", "antidepressant", "антидепрессант"],
      gene: "CYP2D6",
      source: "CPIC: CYP2D6/CYP2C19/CYP2B6-antidepressants",
      evidence: "A",
      severity: "moderate",
      matches: {
        "poor metabolizer": "Для ряда антидепрессантов, зависящих от CYP2D6, возможны повышенные концентрации и побочные эффекты. Обсудить дозу, альтернативу или мониторинг.",
        "ultrarapid metabolizer": "Возможен сниженный ответ на отдельные CYP2D6-зависимые антидепрессанты. Обсудить альтернативу или оценку эффективности."
      }
    },
    {
      id: "beta-blockers-cyp2d6",
      drug: "Бета-блокаторы",
      aliases: ["metoprolol", "метопролол", "betaloc", "беталок", "carvedilol", "карведилол", "propranolol", "пропранолол", "beta blocker", "бета-блокатор"],
      gene: "CYP2D6",
      source: "CPIC: CYP2D6-beta-blockers",
      evidence: "A",
      severity: "moderate",
      matches: {
        "poor metabolizer": "Для метопролола возможны более высокие концентрации и риск брадикардии/гипотонии. Обсудить стартовую дозу, ЧСС/АД и альтернативы.",
        "ultrarapid metabolizer": "Возможны более низкие концентрации отдельных CYP2D6-зависимых бета-блокаторов. Оценивать клинический ответ, ЧСС и АД."
      }
    },
    {
      id: "aminoglycosides-mtrnr1",
      drug: "Аминогликозиды",
      aliases: ["gentamicin", "гентамицин", "amikacin", "амикацин", "streptomycin", "стрептомицин", "tobramycin", "тобрамицин", "aminoglycoside", "аминогликозид"],
      gene: "MT-RNR1",
      source: "CPIC/FDA: MT-RNR1-aminoglycosides",
      evidence: "A",
      severity: "high",
      matches: {
        increased_risk: "Вариант MT-RNR1 может резко повышать риск необратимой ототоксичности аминогликозидов. Обсудить альтернативный антибиотик, если ситуация не жизненно неотложная."
      }
    },
    {
      id: "voriconazole-cyp2c19",
      drug: "Вориконазол",
      aliases: ["voriconazole", "вориконазол", "vfend", "вифенд"],
      gene: "CYP2C19",
      source: "CPIC/FDA: CYP2C19-voriconazole",
      evidence: "A",
      severity: "high",
      matches: {
        "poor metabolizer": "CYP2C19 poor metabolizer может повышать концентрации вориконазола и риск токсичности. Обсудить альтернативный противогрибковый препарат или терапевтический мониторинг концентраций.",
        "intermediate metabolizer": "CYP2C19 intermediate metabolizer может повышать экспозицию вориконазола. Полезны мониторинг концентраций и переносимости.",
        "rapid metabolizer": "CYP2C19 rapid metabolizer может снижать концентрации вориконазола и риск неэффективности. Обсудить альтернативу или терапевтический мониторинг.",
        "ultrarapid metabolizer": "CYP2C19 ultrarapid metabolizer связан с риском субтерапевтических концентраций вориконазола. Обычно обсуждают альтернативный препарат."
      }
    },
    {
      id: "phenytoin-cyp2c9",
      drug: "Фенитоин / фосфенитоин",
      aliases: ["phenytoin", "фенитоин", "дифенин", "fosphenytoin", "фосфенитоин"],
      gene: "CYP2C9",
      source: "CPIC/FDA: CYP2C9/HLA-B-phenytoin",
      evidence: "A",
      severity: "high",
      matches: {
        "intermediate metabolizer": "Сниженный метаболизм фенитоина может повышать концентрации и риск токсичности. Обсудить снижение стартовой дозы и терапевтический мониторинг.",
        "poor metabolizer": "CYP2C9 poor metabolizer связан с высоким риском токсичности фенитоина при стандартных дозах. Нужен осторожный подбор дозы или альтернатива."
      }
    },
    {
      id: "phenytoin-hlab1502",
      drug: "Фенитоин / фосфенитоин",
      aliases: ["phenytoin", "фенитоин", "дифенин", "fosphenytoin", "фосфенитоин"],
      gene: "HLA-B*15:02",
      source: "CPIC/FDA: CYP2C9/HLA-B-phenytoin",
      evidence: "A",
      severity: "high",
      matches: {
        positive: "HLA-B*15:02 positive связан с повышенным риском тяжелых кожных реакций на фенитоин/фосфенитоин. Обсудить альтернативу до назначения, если клиническая ситуация позволяет."
      }
    },
    {
      id: "ondansetron-cyp2d6",
      drug: "Ондансетрон / трописетрон",
      aliases: ["ondansetron", "ондансетрон", "zofran", "зофран", "tropisetron", "трописетрон", "navoban", "навобан", "5-ht3"],
      gene: "CYP2D6",
      source: "CPIC: CYP2D6-ondansetron/tropisetron; FDA PGx associations",
      evidence: "A",
      severity: "moderate",
      matches: {
        "ultrarapid metabolizer": "CYP2D6 ultrarapid metabolizer может снижать концентрации и противорвотный эффект ондансетрона/трописетрона. Обсудить альтернативный противорвотный препарат."
      }
    },
    {
      id: "tamoxifen-cyp2d6",
      drug: "Тамоксифен",
      aliases: ["tamoxifen", "тамоксифен"],
      gene: "CYP2D6",
      source: "CPIC/FDA: CYP2D6-tamoxifen",
      evidence: "A",
      severity: "high",
      matches: {
        "poor metabolizer": "CYP2D6 poor metabolizer может снижать образование эндоксифена, активного метаболита тамоксифена. Обсудить альтернативную эндокринную терапию или специализированный мониторинг.",
        "intermediate metabolizer": "CYP2D6 intermediate metabolizer может снижать экспозицию эндоксифена. Стоит обсудить риск недостаточного эффекта, сопутствующие ингибиторы CYP2D6 и варианты терапии."
      }
    },
    {
      id: "tricyclics-cyp2d6",
      drug: "Трициклические антидепрессанты",
      aliases: ["amitriptyline", "амитриптилин", "nortriptyline", "нортриптилин", "imipramine", "имипрамин", "clomipramine", "кломипрамин", "doxepin", "доксепин", "tca", "тца", "трицикличес"],
      gene: "CYP2D6",
      source: "CPIC/FDA: CYP2D6/CYP2C19-tricyclic antidepressants",
      evidence: "A",
      severity: "moderate",
      matches: {
        "poor metabolizer": "CYP2D6 poor metabolizer может повышать концентрации трициклических антидепрессантов и риск побочных эффектов. Обсудить меньшую стартовую дозу, альтернативу или мониторинг концентраций.",
        "ultrarapid metabolizer": "CYP2D6 ultrarapid metabolizer может снижать концентрации и эффективность ряда трициклических антидепрессантов. Обсудить альтернативу или мониторинг ответа."
      }
    },
    {
      id: "tricyclics-cyp2c19",
      drug: "Трициклические антидепрессанты",
      aliases: ["amitriptyline", "амитриптилин", "imipramine", "имипрамин", "clomipramine", "кломипрамин", "doxepin", "доксепин", "trimipramine", "тримипрамин", "tca", "тца", "трицикличес"],
      gene: "CYP2C19",
      source: "CPIC/FDA: CYP2D6/CYP2C19-tricyclic antidepressants",
      evidence: "A",
      severity: "moderate",
      matches: {
        "poor metabolizer": "CYP2C19 poor metabolizer может повышать экспозицию третичных аминов ТЦА и риск побочных эффектов. Обсудить дозу, альтернативу или мониторинг концентраций.",
        "rapid metabolizer": "CYP2C19 rapid metabolizer может снижать концентрации отдельных ТЦА. При недостаточном ответе обсудить коррекцию стратегии.",
        "ultrarapid metabolizer": "CYP2C19 ultrarapid metabolizer может повышать риск недостаточного ответа на отдельные ТЦА. Обсудить альтернативу или мониторинг ответа."
      }
    }
  ];

function enrichPgxRuleMetadata(rule) {
  return {
    evidenceLevel: rule.evidence ? `CPIC ${rule.evidence}` : "Не указано",
    guidelineSource: inferGuidelineSource(rule.source),
    regulatorySource: inferRegulatorySource(rule.source),
    actionability: inferActionability(rule),
    ...rule
  };
}

function inferGuidelineSource(source) {
  source = String(source || "");
  const sources = [];
  if (source.includes("CPIC")) sources.push("CPIC");
  if (source.includes("DPWG")) sources.push("DPWG");
  return sources.join(" + ") || "Справочная база";
}

function inferRegulatorySource(source) {
  source = String(source || "");
  const sources = [];
  if (source.includes("FDA")) sources.push("FDA");
  return sources.join(" + ");
}

function inferActionability(rule) {
  if (rule.evidence === "A" && rule.severity === "high") return "actionable";
  if (rule.evidence === "A") return "clinical_context";
  return "reference";
}

window.PGX_RULES = window.PGX_RULES.map(enrichPgxRuleMetadata);

window.PGX_PHENOTYPE_MAPS = {
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
    },
    DPYD: {
      "*1/*1": "normal metabolizer",
      "*1/*2A": "intermediate metabolizer",
      "*1/*13": "intermediate metabolizer",
      "*2A/*2A": "poor metabolizer",
      "*13/*13": "poor metabolizer"
    },
    CYP3A5: {
      "*1/*1": "expresser",
      "*1/*3": "intermediate expresser",
      "*3/*3": "nonexpresser"
    },
    UGT1A1: {
      "*1/*1": "normal metabolizer",
      "*1/*28": "intermediate metabolizer",
      "*28/*28": "poor metabolizer",
      "*1/*37": "intermediate metabolizer",
      "*37/*37": "poor metabolizer"
    }
  };

window.PGX_SNP_HINTS = [
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
    },
    {
      rsid: "rs3918290",
      gene: "DPYD",
      calls: { CC: "normal metabolizer", CT: "intermediate metabolizer", TC: "intermediate metabolizer", TT: "poor metabolizer" }
    },
    {
      rsid: "rs55886062",
      gene: "DPYD",
      calls: { TT: "normal metabolizer", TG: "intermediate metabolizer", GT: "intermediate metabolizer", GG: "poor metabolizer" }
    },
    {
      rsid: "rs67376798",
      gene: "DPYD",
      calls: { TT: "normal metabolizer", TA: "intermediate metabolizer", AT: "intermediate metabolizer", AA: "poor metabolizer" }
    },
    {
      rsid: "rs56038477",
      gene: "DPYD",
      calls: { GG: "normal metabolizer", GA: "intermediate metabolizer", AG: "intermediate metabolizer", AA: "poor metabolizer" }
    },
    {
      rsid: "rs9923231",
      gene: "VKORC1",
      calls: { GG: "normal sensitivity", GA: "intermediate sensitivity", AG: "intermediate sensitivity", AA: "increased sensitivity" }
    },
    {
      rsid: "rs2108622",
      gene: "CYP4F2",
      calls: { CC: "normal function", CT: "decreased function", TC: "decreased function", TT: "decreased function" }
    },
    {
      rsid: "rs776746",
      gene: "CYP3A5",
      calls: { AA: "expresser", AG: "intermediate expresser", GA: "intermediate expresser", GG: "nonexpresser" }
    },
    {
      rsid: "rs887829",
      gene: "UGT1A1",
      calls: { CC: "normal metabolizer", CT: "intermediate metabolizer", TC: "intermediate metabolizer", TT: "poor metabolizer" }
    },
    {
      rsid: "rs2231142",
      gene: "ABCG2",
      calls: { GG: "normal function", GT: "decreased function", TG: "decreased function", TT: "poor function" }
    },
    {
      rsid: "rs1557749205",
      gene: "MT-RNR1",
      calls: { AA: "normal risk", AG: "increased_risk", GA: "increased_risk", GG: "increased_risk" }
    }
  ];
