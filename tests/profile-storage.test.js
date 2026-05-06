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

el("#profileSelect").value = secondProfileId;
el("#profileSelect").onchange();
assert.match(el("#patientData").value, /CYP2D6/, "second profile should keep its DNA data");

console.log("profile storage tests passed");
