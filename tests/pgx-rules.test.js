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

const { rules, phenotypeMaps, snpHints } = context.window.PGX_DATA;
const ruleIds = new Set(rules.map((rule) => rule.id));
const clopidogrelRule = rules.find((rule) => rule.id === "clopidogrel-cyp2c19");
const fluoropyrimidineRule = rules.find((rule) => rule.id === "fluoropyrimidines-dpyd");

assert.strictEqual(clopidogrelRule.evidenceLevel, "CPIC A");
assert.strictEqual(clopidogrelRule.guidelineSource, "CPIC");
assert.strictEqual(clopidogrelRule.regulatorySource, "FDA");
assert.strictEqual(clopidogrelRule.actionability, "actionable");
assert.strictEqual(fluoropyrimidineRule.guidelineSource, "CPIC + DPWG");

[
  "fluoropyrimidines-dpyd",
  "warfarin-vkorc1",
  "warfarin-cyp4f2",
  "tacrolimus-cyp3a5",
  "irinotecan-ugt1a1",
  "carbamazepine-hla-a3101",
  "carbamazepine-hlab1502",
  "antidepressants-cyp2c19",
  "beta-blockers-cyp2d6",
  "aminoglycosides-mtrnr1",
  "voriconazole-cyp2c19",
  "phenytoin-cyp2c9",
  "phenytoin-hlab1502",
  "ondansetron-cyp2d6",
  "tamoxifen-cyp2d6",
  "tricyclics-cyp2d6",
  "tricyclics-cyp2c19"
].forEach((id) => assert.ok(ruleIds.has(id), `${id} should exist`));

assert.ok(phenotypeMaps.DPYD, "DPYD phenotype map should exist");
assert.ok(phenotypeMaps.CYP3A5, "CYP3A5 phenotype map should exist");
assert.ok(phenotypeMaps.UGT1A1, "UGT1A1 phenotype map should exist");
assert.ok(snpHints.some((hint) => hint.gene === "VKORC1"), "VKORC1 SNP hint should exist");
assert.ok(snpHints.some((hint) => hint.gene === "MT-RNR1"), "MT-RNR1 SNP hint should exist");

const parsed = context.parseProfile(`
DPYD *1/*2A
CYP2C19 *2/*2
CYP2C9 *1/*3
CYP2D6 *1xN/*1
CYP3A5 *1/*3
UGT1A1 *28/*28
HLA-A*31:01 positive
HLA-B*15:02 positive
rs9923231 AA
rs2108622 CT
rs2231142 TT
rs1557749205 AG
`);

assert.strictEqual(parsed.profile.DPYD, "intermediate metabolizer");
assert.strictEqual(parsed.profile.CYP3A5, "intermediate expresser");
assert.strictEqual(parsed.profile.UGT1A1, "poor metabolizer");
assert.strictEqual(parsed.profile["HLA-A*31:01"], "positive");
assert.strictEqual(parsed.profile["HLA-B*15:02"], "positive");
assert.strictEqual(parsed.profile.VKORC1, "increased sensitivity");
assert.strictEqual(parsed.profile.CYP4F2, "decreased function");
assert.strictEqual(parsed.profile.ABCG2, "poor function");
assert.strictEqual(parsed.profile["MT-RNR1"], "increased_risk");

context.document.querySelector("#patientData").value = `
DPYD *1/*2A
CYP2C19 *2/*2
CYP2C9 *1/*3
CYP2D6 *1xN/*1
CYP3A5 *1/*3
UGT1A1 *28/*28
HLA-A*31:01 positive
HLA-B*15:02 positive
rs9923231 AA
rs2108622 CT
rs2231142 TT
`;
context.saveCurrentMedications([
  { id: "med-warfarin", name: "варфарин" },
  { id: "med-tacrolimus", name: "такролимус" },
  { id: "med-irinotecan", name: "иринотекан" },
  { id: "med-carbamazepine", name: "карбамазепин" },
  { id: "med-rosuvastatin", name: "розувастатин" },
  { id: "med-voriconazole", name: "вориконазол" },
  { id: "med-phenytoin", name: "фенитоин" },
  { id: "med-ondansetron", name: "ондансетрон" },
  { id: "med-tamoxifen", name: "тамоксифен" },
  { id: "med-amitriptyline", name: "амитриптилин" }
]);

const medicationTitles = context.medicationRiskSignals().map((signal) => signal.title);
[
  "Варфарин + VKORC1",
  "Варфарин + CYP4F2",
  "Такролимус + CYP3A5",
  "Иринотекан + UGT1A1",
  "Карбамазепин / окскарбазепин + HLA-A*31:01",
  "Карбамазепин / окскарбазепин + HLA-B*15:02",
  "Розувастатин + ABCG2",
  "Вориконазол + CYP2C19",
  "Фенитоин / фосфенитоин + CYP2C9",
  "Фенитоин / фосфенитоин + HLA-B*15:02",
  "Ондансетрон / трописетрон + CYP2D6",
  "Трициклические антидепрессанты + CYP2D6",
  "Трициклические антидепрессанты + CYP2C19"
].forEach((title) => assert.ok(medicationTitles.includes(title), `${title} medication signal should exist`));

context.document.querySelector("#patientData").value = "CYP2D6 *4/*4";
context.saveCurrentMedications([{ id: "med-tamoxifen-only", name: "тамоксифен" }]);
assert.ok(
  context.medicationRiskSignals().some((signal) => signal.title === "Тамоксифен + CYP2D6"),
  "Тамоксифен + CYP2D6 medication signal should exist"
);
context.archiveMedication("med-tamoxifen-only");
assert.strictEqual(context.activeMedications().length, 0, "archived medication should leave active list");
assert.strictEqual(context.archivedMedications().length, 1, "archived medication should stay in medication history");
assert.ok(
  !context.medicationRiskSignals().some((signal) => signal.title === "Тамоксифен + CYP2D6"),
  "archived medication should not drive current PGx signal"
);
context.restoreMedication("med-tamoxifen-only");
assert.strictEqual(context.activeMedications().length, 1, "restored medication should return to active list");

context.document.querySelector("#patientData").value = "";
context.saveCurrentMedications([
  { id: "med-warfarin-card", name: "Варфарин", dose: "5 мг вечером" },
  { id: "med-ibuprofen-card", name: "Ибупрофен", dose: "400 мг после еды" }
]);
const warfarinCardFlags = context.medicationCardFlags(context.currentMedications()[0]);
assert.deepStrictEqual(
  Array.from(warfarinCardFlags, (flag) => flag.code),
  ["А", "Б", "В", "!", "Р"],
  "warfarin evening regimen with ibuprofen should produce five card flags"
);
assert.ok(
  context.renderMedicationRow(context.currentMedications()[0]).includes(">В</span>"),
  "warfarin card cover should render the timing flag"
);
context.window.confirm = () => false;
context.requestRemoveMedication("med-warfarin-card");
assert.ok(
  context.currentMedications().some((item) => item.id === "med-warfarin-card"),
  "cancelled medication deletion should preserve the record"
);
context.window.confirm = () => true;
context.requestRemoveMedication("med-warfarin-card");
assert.ok(
  !context.currentMedications().some((item) => item.id === "med-warfarin-card"),
  "confirmed medication deletion should remove the record"
);

context.document.querySelector("#patientData").value = "CYP3A5 *1/*3";
context.saveCurrentMedications([{ id: "manual-substance", name: "неизвестный бренд", manualSubstanceLabel: "такролимус" }]);
const manualMedication = context.currentMedications()[0];
assert.strictEqual(manualMedication.substanceLabel, "такролимус");
assert.strictEqual(manualMedication.sourceName, "manual");
assert.ok(
  context.medicationRiskSignals().some((signal) => signal.title === "Такролимус + CYP3A5"),
  "manual substance should drive medication PGx signal"
);

console.log("pgx rules tests passed");
