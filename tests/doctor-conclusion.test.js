const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const dataScripts = [
  "data/pgx-rules.js",
  "data/lab-analytes.js",
  "data/medication-knowledge.js",
  "data/evidence-flags.js",
  "data.js"
];

const elements = new Map();
const store = new Map();
const context2d = new Proxy(
  {},
  {
    get(target, prop) {
      if (!(prop in target)) target[prop] = () => {};
      return target[prop];
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    }
  }
);

function el(id) {
  if (!elements.has(id)) {
    elements.set(id, {
      value: "",
      textContent: "",
      innerHTML: "",
      className: "",
      files: [],
      hidden: false,
      open: false,
      width: 680,
      height: 260,
      addEventListener(event, handler) {
        this[`on${event}`] = handler;
      },
      querySelector(selector) {
        return el(`${id} ${selector}`);
      },
      getContext() {
        return context2d;
      }
    });
  }
  return elements.get(id);
}

const context = {
  window: {},
  document: { querySelector: el },
  localStorage: {
    getItem(key) {
      return store.get(key) || null;
    },
    setItem(key, value) {
      store.set(key, value);
    }
  },
  console
};

vm.createContext(context);
for (const script of dataScripts) {
  vm.runInContext(fs.readFileSync(script, "utf8"), context);
}
vm.runInContext(fs.readFileSync("app.js", "utf8"), context);
vm.runInContext(fs.readFileSync("js/pgx-extensions.js", "utf8"), context);

const conclusion = `
Заключение
Диагноз: артериальная гипертензия, дислипидемия.
Назначено:
Розувастатин 10 мг вечером
Клопидогрел 75 мг утром
Омепразол 20 мг 1 раз в день
`;

const parsed = context.parseDoctorConclusion(conclusion);
assert.ok(parsed.diagnoses.some((item) => item.key === "hypertension"), "hypertension should be detected");
assert.ok(parsed.diagnoses.some((item) => item.key === "dyslipidemia"), "dyslipidemia should be detected");
assert.ok(parsed.medications.some((item) => item.name === "Розувастатин"), "rosuvastatin should be detected");
assert.ok(parsed.medications.some((item) => item.name === "Клопидогрел"), "clopidogrel should be detected");
assert.ok(parsed.medications.some((item) => item.name === "Омепразол"), "omeprazole should be detected");
assert.ok(parsed.medications.every((item) => item.sourceLine.length < 120), "medication source line should stay compact");

const noisyConclusion = `
Анамнез: ранее принимал омепразол и ибупрофен, сейчас отменены.
Диагноз: дислипидемия.
Рекомендовано:
1. Розувастатин 10 мг вечером после еды.
2. Клопидогрел 75 мг утром.
Контроль анализов через 8 недель.
`;
const noisyParsed = context.parseDoctorConclusion(noisyConclusion);
assert.strictEqual(
  noisyParsed.medications.map((item) => item.name).sort().join(","),
  ["Клопидогрел", "Розувастатин"].sort().join(","),
  "only active recommendation lines should become medications"
);

const therapistProtocol = `
Специализация: Врач-терапевт участковый
Диагноз:
Гастроэзофагеальный рефлекс с эзофагитом
Эрозивный рефлюкс-эзофагит ст А по LA классификации. Эндоскопические признаки
аксиальной хиатальной грыжи. Эндоскопические признаки поверхностного очагового гастрита.
Эндоскопические признаки бульбита. Экспресс-тест на HP Положительный (+).

Рекомендовано лечение:
Рабепразол 20мг - по 1 таб 2 раза в день за 30 мин до еды 30 дней
Амоксиклав 1000мг - 2 раза в день
Кларитромицин 500 мг - 2 раза в день
Де-нол 120 мг - по 2 кап 2 раза в день во время еды 14 дней
`;
const protocolParsed = context.parseDoctorConclusion(therapistProtocol);
const protocolDiagnosisKeys = protocolParsed.diagnoses.map((item) => item.key);
["gerd", "erosive_esophagitis", "hiatal_hernia", "gastritis_bulbitis", "hp_positive"].forEach((key) => {
  assert.ok(protocolDiagnosisKeys.includes(key), `${key} diagnosis should be detected`);
});
assert.strictEqual(protocolParsed.medications.length, 4, "therapist protocol should produce four active medications");
assert.strictEqual(
  protocolParsed.diagnoses.map((item) => `${item.key}:${item.attention.label}`).join("|"),
  [
    "hp_positive:Требует скорейшего лечения",
    "erosive_esophagitis:Требует лечения",
    "gerd:Требует наблюдения",
    "gastritis_bulbitis:Требует наблюдения",
    "hiatal_hernia:Физиологическая особенность"
  ].join("|"),
  "therapist protocol diagnoses should include attention labels"
);
assert.strictEqual(
  protocolParsed.medications.map((item) => item.name).join("|"),
  ["Рабепразол", "Амоксиклав", "Кларитромицин", "Де-нол"].join("|")
);
assert.strictEqual(
  protocolParsed.medications.map((item) => item.dose).join("|"),
  [
    "20мг - по 1 таб 2 раза в день за 30 мин до еды 30 дней",
    "1000мг - 2 раза в день",
    "500мг - 2 раза в день",
    "120мг - по 2 кап 2 раза в день во время еды 14 дней"
  ].join("|")
);
const protocolSignals = context.doctorConclusionSignals(protocolParsed);
assert.ok(protocolSignals.some((item) => item.title === "HP+ и схема эрадикации"), "HP eradication cross-check should exist");
assert.ok(protocolSignals.some((item) => item.title === "Рефлюкс-эзофагит и ИПП"), "GERD/PPI cross-check should exist");

const compactProtocol = `
Специализация: Врач-терапевт участковый
Диагноз: Гастроэзофагеальный рефлекс с эзофагитом. Эрозивный рефлюкс-эзофагит ст А по LA классификации. Эндоскопические признаки аксиальной хиатальной грыжи. Эндоскопические признаки поверхностного очагового гастрита. Эндоскопические признаки бульбита. Экспресс-тест на HP Положительный (+).
Рекомендации: Рабепразол 20мг - по 1 таб 2 раза в день за 30 мин до еды 30 дней Амоксиклав 1000мг - 2 раза в день Кларитромицин 500 мг - 2 раза в день Де-нол 120 мг - по 2 кап 2 раза в день во время еды 14 дней
`;
const compactParsed = context.parseDoctorConclusion(compactProtocol);
assert.strictEqual(
  compactParsed.diagnoses.map((item) => item.label).join("|"),
  [
    "Helicobacter pylori положительный",
    "Эрозивный рефлюкс-эзофагит",
    "Гастроэзофагеальный рефлюкс / ГЭРБ",
    "Поверхностный очаговый гастрит / бульбит",
    "Аксиальная хиатальная грыжа"
  ].join("|"),
  "compact therapist protocol should keep only real diagnoses"
);
assert.strictEqual(
  compactParsed.medications.map((item) => item.name).join("|"),
  ["Рабепразол", "Амоксиклав", "Кларитромицин", "Де-нол"].join("|"),
  "compact therapist protocol should detect all medications"
);

const gastroenterologistProtocol = `
Семейный анамнез: дед умер от рака желудка.
Анамнез: ранее принимал Омез, сейчас в рекомендациях не указан.
Жалобы: изжога, боли.
Заключение:
Гастродуоденит с наличием множественных эрозий и язвенного дефекта (23.12.23: 0.5х0.2 см) препилорического отдела желудка

Рекомендации:
Ганатон - 50 мг 1 таб х 3 р/д за 30 мин до завтрака, обеда. ужина 1 месяц
АЛЬФАЗОКС, Р-Р ДЛЯ ПРИЕМА ВНУТРЬ 10 МЛ - ПАКЕТИК-САШЕ N
20, по 1 пак. 3 раз/дн., длительность 30 дн., внутрь (per os), 1 пакетик х 3 р/д через 15-20 мин после
завтрака, обеда, ужина в течение 1 месяца.
Фамотидин 40 МГ - 1 таб. 1 раз/дн.,
длительность 30 дн., внутрь
Нексиум - ТАБ., ПОКР. ОБОЛОЧКОЙ, 40 МГ - по 1 таб. 2 раз/дн., длительность 14 дн.,
внутрь (per os), 40 мг 1 таб х 2 р/д за 30 мин до завтрака и ужина 14 дней, далее 40 мг 1 таб х 1 р/д за 30
мин до завтрака 14 дней, далее коррекция терапии у гастроэнтеролога по результатам ЭГДС.
`;
const gastroParsed = context.parseDoctorConclusion(gastroenterologistProtocol);
assert.strictEqual(
  gastroParsed.diagnoses.map((item) => item.label).join("|"),
  "Гастродуоденит с эрозиями и язвенным дефектом",
  "family oncology history should not become a diagnosis"
);
assert.strictEqual(
  gastroParsed.medications.map((item) => item.name).join("|"),
  ["Ганатон", "АЛЬФАЗОКС", "Фамотидин", "Нексиум"].join("|"),
  "gastroenterologist protocol should detect all prescribed medications"
);
assert.ok(
  !gastroParsed.medications.some((item) => item.name === "Омез"),
  "anamnesis medications should not become active prescriptions"
);
assert.ok(
  gastroParsed.medications.find((item) => item.name === "Ганатон").dose.includes("50мг 1 таб х 3 р/д"),
  "Ganaton regimen should be attached to Ganaton"
);
assert.ok(
  gastroParsed.medications.find((item) => item.name === "АЛЬФАЗОКС").dose.includes("1 пакетик х 3 р/д"),
  "multiline Alphazox regimen should stay attached to Alphazox"
);
assert.ok(
  gastroParsed.medications.find((item) => item.name === "Нексиум").dose.includes("40мг 1 таб х 2 р/д"),
  "multiline Nexium regimen should stay attached to Nexium"
);

context.saveCurrentMedications([
  {
    id: "old-doctor-omeprazole",
    name: "Омез",
    substance: "omeprazole",
    substanceLabel: "Омепразол",
    sourceName: "doctor conclusion",
    needsConfirmation: false
  },
  {
    id: "old-doctor-ganaton",
    name: "Ганатон",
    substance: "itopride",
    substanceLabel: "Итоприд",
    sourceName: "doctor conclusion",
    needsConfirmation: false
  }
]);
context.document.querySelector("#doctorText").value = gastroenterologistProtocol;
context.document.querySelector("#parseDoctorText").onclick();
const reconciledDoctorMedications = context.currentMedications();
assert.ok(
  !reconciledDoctorMedications.some((item) => item.name === "Омез"),
  "stale doctor medication from anamnesis should be removed after re-parsing"
);
assert.ok(
  reconciledDoctorMedications.find((item) => item.name === "Ганатон").dose.includes("50мг 1 таб х 3 р/д"),
  "stale doctor medication should be updated with the latest regimen"
);
context.saveCurrentMedications([]);

context.document.querySelector("#patientData").value = `
CYP2C19 *2/*2
SLCO1B1 rs4149056 TC
`;
context.document.querySelector("#labText").value = "Дата анализа: 25.03.2026\nЛПНП 2.6 ммоль/л";
context.document.querySelector("#parseLabText").onclick();

const signals = context.doctorConclusionSignals(parsed);
assert.ok(signals.some((item) => item.title === "Диагноз и ЛПНП"), "LDL diagnosis signal should exist");
assert.ok(signals.some((item) => item.title === "Клопидогрел + CYP2C19"), "doctor medication PGx signal should exist");
assert.ok(signals.some((item) => item.title === "Липидный диагноз и PGx статинов"), "diagnosis PGx context should exist");

context.document.querySelector("#doctorText").value = conclusion;
context.document.querySelector("#parseDoctorText").onclick();
assert.strictEqual(context.currentMedications().length, 0, "parsing should wait for user confirmation before syncing medications");
assert.match(context.document.querySelector("#doctorSummary").textContent, /Подтвердите распознавание/, "doctor summary should ask for confirmation");

context.document.querySelector("#addDoctorMedications").onclick();
const syncedMedications = context.currentMedications();
assert.ok(syncedMedications.some((item) => item.name === "Розувастатин"), "doctor medications should sync to medication profile");
assert.ok(syncedMedications.every((item) => item.needsConfirmation), "synced doctor medications should require confirmation");
assert.match(context.document.querySelector("#doctorSummary").textContent, /Распознавание подтверждено/, "doctor summary should reflect confirmation");

context.document.querySelector("#parseDoctorText").onclick();
const dedupedMedications = context.currentMedications();
assert.strictEqual(dedupedMedications.length, syncedMedications.length, "re-parsing should not duplicate synced medications");

context.document.querySelector("#editDoctorConclusion").onclick();
context.document.querySelector("#doctorDiagnosisEdit").value = "ГЭРБ\nHP положительный";
context.document.querySelector("#doctorMedicationEdit").value = "Рабепразол 20мг 2 раза в день\nДе-нол 120мг 2 раза в день";
context.document.querySelector("#applyDoctorCorrections").onclick();
const corrected = context.currentDoctorConclusion().parsed;
assert.ok(corrected.diagnoses.some((item) => item.key === "gerd"), "manual diagnosis corrections should be parsed");
assert.strictEqual(corrected.medications.map((item) => item.name).join("|"), "Рабепразол|Де-нол");

context.document.querySelector("#deleteDoctorConclusion").onclick();
assert.strictEqual(context.currentDoctorConclusion().text, "", "doctor conclusion should be deleted");
assert.strictEqual(context.currentDoctorConclusion().parsed.medications.length, 0, "deleted conclusion should have no draft medications");

console.log("doctor conclusion tests passed");
