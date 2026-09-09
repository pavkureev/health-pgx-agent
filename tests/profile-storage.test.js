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

el("#patientData").value = "CYP2C19 *2/*2";
el("#patientData").oninput();
const firstProfileId = el("#profileSelect").value;

el("#profileName").value = "Пациент 2";
el("#createProfile").onclick();
const secondProfileId = el("#profileSelect").value;

assert.notStrictEqual(firstProfileId, secondProfileId, "new profile should become active");
assert.strictEqual(el("#patientData").value, "", "new profile should start empty");

el("#patientData").value = "CYP2D6 poor metabolizer";
el("#patientData").oninput();
el("#profileSelect").value = firstProfileId;
el("#profileSelect").onchange();
assert.match(el("#patientData").value, /CYP2C19/, "first profile should keep its DNA data");
el("#patientData").value = "";
context.saveCurrentProfileData();
assert.match(
  context.getActiveProfile().patientData,
  /CYP2C19/,
  "non-genetic saves should not overwrite existing genetic data with an empty editor"
);
context.applyActiveProfile();

el("#profileSelect").value = secondProfileId;
el("#profileSelect").onchange();
assert.match(el("#patientData").value, /CYP2D6/, "second profile should keep its DNA data");

const restoredGenetics = context.geneticFindingsToPatientData([
  { gene: "CYP2C19", diplotype: "*2/*2" },
  { gene: "SLCO1B1", rsid: "rs4149056", genotype: "TC" },
  { gene: "HLA-B*58:01", phenotype: "positive" },
  { gene: "CYP2C19", diplotype: "*2/*2" }
]);
assert.match(restoredGenetics, /CYP2C19 \*2\/\*2/, "diplotype findings should restore genetic input");
assert.match(restoredGenetics, /SLCO1B1 rs4149056 TC/, "rsid genotype findings should restore genetic input");
assert.match(restoredGenetics, /HLA-B\*58:01 positive/, "phenotype findings should restore genetic input");
assert.strictEqual(
  restoredGenetics.match(/CYP2C19/g).length,
  1,
  "duplicate genetic findings should be collapsed"
);

const restoredFromDocuments = context.geneticDocumentsToPatientData([
  { kind: "genetic_report", file_name: "report.txt", extracted_text: "CYP2D6 poor metabolizer" }
]);
assert.match(restoredFromDocuments, /report\.txt/, "genetic document name should be kept as context");
assert.match(restoredFromDocuments, /CYP2D6 poor metabolizer/, "genetic source document text should restore genetic input");

const restoredFromMisclassifiedDocuments = context.geneticDocumentsToPatientData([
  { kind: "lab_text", file_name: "genetics-as-text.txt", extracted_text: "SLCO1B1 rs4149056 TC" },
  { kind: "lab_text", file_name: "lab.txt", extracted_text: "ЛПНП 2.6 ммоль/л" }
]);
assert.match(restoredFromMisclassifiedDocuments, /genetics-as-text\.txt/, "genetic-looking text should restore even if document kind is wrong");
assert.doesNotMatch(restoredFromMisclassifiedDocuments, /ЛПНП/, "non-genetic lab text should not be copied into genetic input");

context.logActivity({
  type: "doctor",
  title: "Загружено заключение врача",
  body: "2 диагноза, 4 назначения.",
  target: "doctor"
});
context.logActivity({
  type: "labs",
  title: "Загружены анализы",
  body: "3 показателя.",
  target: "labs"
});
context.logActivity({
  type: "genetics",
  title: "Загружен генетический профиль",
  body: "2 маркера.",
  target: "genetics"
});
assert.strictEqual(
  context.currentActivityLog()[2].title,
  "Загружено заключение врача",
  "activity log should keep recent profile events"
);
context.renderNowActions();
assert.match(
  el("#nowActions").innerHTML,
  /Добавить протокол посещения врача/,
  "now tab should always expose doctor protocol upload"
);
assert.match(
  el("#nowActions").innerHTML,
  /<details class="now-history-card"/,
  "activity history should be collapsed by default"
);
assert.doesNotMatch(
  el("#nowActions").innerHTML,
  /<details class="now-history-card"[^>]*open/,
  "activity history should not render open by default"
);
assert.match(
  el("#nowActions").innerHTML,
  /Протоколы посещений/,
  "activity history should group doctor protocols"
);
assert.match(
  el("#nowActions").innerHTML,
  /Результаты анализов/,
  "activity history should group lab uploads"
);
assert.match(
  el("#nowActions").innerHTML,
  /Генетический профиль/,
  "activity history should group genetic uploads"
);

console.log("profile storage tests passed");
