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
  ];

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
    }
  ];
