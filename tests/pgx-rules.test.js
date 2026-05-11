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
  "aminoglycosides-mtrnr1"
].forEach((id) => assert.ok(ruleIds.has(id), `${id} should exist`));

assert.ok(phenotypeMaps.DPYD, "DPYD phenotype map should exist");
assert.ok(phenotypeMaps.CYP3A5, "CYP3A5 phenotype map should exist");
assert.ok(phenotypeMaps.UGT1A1, "UGT1A1 phenotype map should exist");
assert.ok(snpHints.some((hint) => hint.gene === "VKORC1"), "VKORC1 SNP hint should exist");
assert.ok(snpHints.some((hint) => hint.gene === "MT-RNR1"), "MT-RNR1 SNP hint should exist");

const parsed = context.parseProfile(`
DPYD *1/*2A
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
  { id: "med-rosuvastatin", name: "розувастатин" }
]);

const medicationTitles = context.medicationRiskSignals().map((signal) => signal.title);
[
  "Варфарин + VKORC1",
  "Варфарин + CYP4F2",
  "Такролимус + CYP3A5",
  "Иринотекан + UGT1A1",
  "Карбамазепин / окскарбазепин + HLA-A*31:01",
  "Карбамазепин / окскарбазепин + HLA-B*15:02",
  "Розувастатин + ABCG2"
].forEach((title) => assert.ok(medicationTitles.includes(title), `${title} medication signal should exist`));

console.log("pgx rules tests passed");
