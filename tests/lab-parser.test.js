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

function createHarness() {
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
        width: 680,
        height: 260,
        addEventListener(event, handler) {
          this[`on${event}`] = handler;
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
  return { el };
}

function parseManualLab(text) {
  const { el } = createHarness();
  el("#labText").value = text;
  el("#parseLabText").onclick();
  return {
    html: el("#labResults").innerHTML,
    options: el("#labMetric").innerHTML
  };
}

const medsiBiochemistry = `
Биохимический анализ крови
Дата: 27.07.2023
Фамилия: КУРЕЕВ
Имя: Павел
Дата рождения: 06.06.1981
Врач: Лычева Наталья Юрьевна
Номер заказа: 1003713967
Наименование исследования
Флаг
Результат
Ед. изм.
Нормальные значения
Исследование - (L18.41.02.0.003) C-реактивный белок (СРБ, CRP), биоматериал - Сыворотка крови
C-реактивный белок
1.5
мг/л
0.00-5.00
Исследование - (L18.34.03.0.002) Глюкоза (венозной крови), биоматериал - Сыворотка крови
Глюкоза (венозной крови) (натощак)
4.7
ммоль/л
4.10-5.90
Исследование - (L18.34.01.0.001) Общий белок, биоматериал - Сыворотка крови
Общий белок
72.2
г/л
64.0-83.0
Исследование - (L18.34.06.0.001) Холестерин общий, биоматериал - Сыворотка крови
Холестерин
общий
↑
8.2
ммоль/л
см. комментарий
`;

const result = parseManualLab(medsiBiochemistry);

assert.match(result.html, /27\.07\.2023/, "analysis date should be used");
assert.doesNotMatch(result.html, /06\.06\.1981/, "birth date must not be used");
assert.match(result.html, /C-реактивный белок/, "CRP should be rendered");
assert.match(result.html, /1,5/, "CRP value should be 1.5");
assert.match(result.html, /Холестерин общий/, "total cholesterol should be rendered");
assert.match(result.html, /8,2/, "total cholesterol value should be 8.2");
assert.match(result.options, /value="crp"/, "CRP should be available in metric dropdown");
assert.match(result.options, /value="total_cholesterol"/, "total cholesterol should be available in metric dropdown");

const medsiRowLikePdfText = `
Биохимический анализ крови
Дата: 27.07.2023
Наименование исследования          Флаг          Результат          Ед. изм.          Нормальные значения
Исследование - (L18.41.02.0.003) C-реактивный белок (СРБ, CRP), биоматериал - Сыворотка крови
C-реактивный белок                              1.5          мг/л          0.00-5.00
Исследование - (L18.34.06.0.001) Холестерин общий, биоматериал - Сыворотка крови
Холестерин общий          ↑                    8.2          ммоль/л       см. комментарий
`;

const rowLikeResult = parseManualLab(medsiRowLikePdfText);
assert.match(rowLikeResult.html, /C-реактивный белок/, "row-like CRP should be rendered");
assert.match(rowLikeResult.html, /1,5/, "row-like CRP value should be 1.5");
assert.match(rowLikeResult.html, /Холестерин общий/, "row-like total cholesterol should be rendered");
assert.match(rowLikeResult.html, /8,2/, "row-like total cholesterol value should be 8.2");

const crpWithSampleButNoResult = `
Дата анализа: 03.04.2025
Исследование - C-реактивный белок (СРБ, CRP)
Образец: 987654321
Номер документа: 555123
Пациент: КУРЕЕВ ПАВЕЛ
`;

const falseCrpResult = parseManualLab(crpWithSampleButNoResult);
assert.doesNotMatch(falseCrpResult.html, /C-реактивный белок/, "sample/document numbers must not become CRP values");
assert.doesNotMatch(falseCrpResult.options, /value="crp"/, "CRP should not appear without a result value and unit");

const noReportDateButBirthDate = parseManualLab(`
Клинический анализ крови
Дата рождения: 06.06.1981
Пациент: КУРЕЕВ ПАВЕЛ
Лейкоциты 5.1 10^9/л
`);
assert.doesNotMatch(noReportDateButBirthDate.html, /06\.06\.1981/, "birth date must not be used when report date is absent");

const medsiLipidRows = parseManualLab(`
Дата анализа: 29.05.2024
Холестерин общий          ↑          7.3          ммоль/л          см. комментарий
Холестерин-ЛПНП (липопротеины
низкой плотности)          ↑          4.4          ммоль/л          см. комментарий
`);
assert.match(medsiLipidRows.html, /Холестерин общий[\s\S]*7,3/, "total cholesterol should be 7.3");
assert.match(medsiLipidRows.html, /ЛПНП[\s\S]*4,4/, "LDL should be 4.4");
assert.doesNotMatch(medsiLipidRows.html, /ЛПНП[\s\S]*7,3/, "LDL must not reuse total cholesterol value");

const helixRows = parseManualLab(`
Зарегистрирован: 25.03.2026 09:15:04
C-реактивный белок
0.34
мг/л
АЛТ
25.7
Ед/л
АСТ
21.9
Ед/л
Креатинкиназа
133
Ед/л
Ферритин
166.3
мкг/л
Холестерин ЛПВП
1.84
ммоль/л
Коэффициент атерогенности
2.1
`);
assert.match(helixRows.html, /C-реактивный белок[\s\S]*0,34/, "CRP should be 0.34");
assert.match(helixRows.html, /АЛТ[\s\S]*25,7/, "ALT should be 25.7");
assert.match(helixRows.html, /Ферритин[\s\S]*166,3/, "Ferritin should be 166.3");
assert.match(helixRows.html, /ЛПВП[\s\S]*1,84/, "HDL should be 1.84");
assert.doesNotMatch(helixRows.html, /Ферритин[\s\S]*133/, "Ferritin must not reuse CK value");
assert.doesNotMatch(helixRows.html, /ЛПВП[\s\S]*133/, "HDL must not reuse CK value");

console.log("lab parser tests passed");
