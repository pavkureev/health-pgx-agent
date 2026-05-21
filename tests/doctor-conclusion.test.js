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
const syncedMedications = context.currentMedications();
assert.ok(syncedMedications.some((item) => item.name === "Розувастатин"), "doctor medications should sync to medication profile");
assert.ok(syncedMedications.every((item) => item.needsConfirmation), "synced doctor medications should require confirmation");

context.document.querySelector("#parseDoctorText").onclick();
const dedupedMedications = context.currentMedications();
assert.strictEqual(dedupedMedications.length, syncedMedications.length, "re-parsing should not duplicate synced medications");

console.log("doctor conclusion tests passed");
