import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const PROD_URL = process.env.SMOKE_PROD_URL || "https://health.yelchervya.com/pgx/";
const TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS || 15000);
const dataScripts = [
  "data/pgx-rules.js",
  "data/lab-analytes.js",
  "data/medication-knowledge.js",
  "data/evidence-flags.js",
  "data.js"
];

const checks = [];

async function check(name, run) {
  const startedAt = Date.now();
  try {
    const detail = await run();
    checks.push({ name, ok: true, detail: detail || "", ms: Date.now() - startedAt });
  } catch (error) {
    checks.push({ name, ok: false, detail: error?.message || String(error), ms: Date.now() - startedAt });
  }
}

async function fetchText(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const text = await response.text();
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 180)}`);
    return { response, text };
  } finally {
    clearTimeout(timeout);
  }
}

function absoluteUrl(path) {
  return new URL(path.replace(/^\.\//, ""), PROD_URL).toString();
}

function extractLocalAssets(html) {
  const assets = new Set();
  const pattern = /(?:src|href)="(\.\/[^"]+)"/g;
  for (const match of html.matchAll(pattern)) {
    const path = match[1];
    if (path.includes("#")) continue;
    assets.add(path);
  }
  return [...assets];
}

function parseSupabaseConfig(source) {
  const url = source.match(/url:\s*"([^"]+)"/)?.[1];
  const anonKey = source.match(/anonKey:\s*"([^"]+)"/)?.[1];
  const redirectUrl = source.match(/redirectUrl:\s*"([^"]+)"/)?.[1];
  if (!url || !anonKey) throw new Error("supabase-config.js does not contain url and anonKey");
  return { url, anonKey, redirectUrl };
}

function makeElementFactory() {
  const elements = new Map();
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
      const element = {
        value: "",
        textContent: "",
        innerHTML: "",
        className: "",
        files: [],
        hidden: false,
        open: false,
        disabled: false,
        checked: false,
        dataset: {},
        style: {},
        width: 680,
        height: 260,
        addEventListener(event, handler) {
          this[`on${event}`] = handler;
        },
        querySelector(selector) {
          return el(`${id} ${selector}`);
        },
        querySelectorAll() {
          return [];
        },
        matches() {
          return false;
        },
        scrollIntoView() {},
        getContext() {
          return context2d;
        },
        classList: {
          toggle(name, enabled) {
            const classes = new Set(String(element.className || "").split(/\s+/).filter(Boolean));
            if (enabled) classes.add(name);
            else classes.delete(name);
            element.className = [...classes].join(" ");
          }
        }
      };
      elements.set(id, element);
    }
    return elements.get(id);
  }

  return { el, elements };
}

function textFile(name, text) {
  return {
    name,
    type: "text/plain",
    lastModified: Date.now(),
    text: async () => text
  };
}

function createAppContext() {
  const { el } = makeElementFactory();
  const store = new Map();
  const context = {
    window: {
      location: { href: PROD_URL },
      confirm: () => true
    },
    document: {
      querySelector: el,
      querySelectorAll: () => []
    },
    localStorage: {
      getItem(key) {
        return store.get(key) || null;
      },
      setItem(key, value) {
        store.set(key, value);
      },
      removeItem(key) {
        store.delete(key);
      }
    },
    console,
    fetch: async () => ({ ok: false, json: async () => ({}) }),
    setTimeout,
    clearTimeout
  };

  vm.createContext(context);
  for (const script of dataScripts) {
    vm.runInContext(fs.readFileSync(script, "utf8"), context, { filename: script });
  }
  vm.runInContext(fs.readFileSync("app.js", "utf8"), context, { filename: "app.js" });
  return { context, el };
}

async function runAppScenarios() {
  const { context, el } = createAppContext();

  const doctorText = `
Диагноз: Гастроэзофагеальный рефлюкс с эзофагитом. Helicobacter pylori положительный.
Рекомендовано:
Рабепразол 20мг - по 1 таб 2 раза в день за 30 мин до еды 30 дней
Амоксиклав 1000мг - 2 раза в день
Кларитромицин 500 мг - 2 раза в день
Де-нол 120 мг - по 2 кап 2 раза в день во время еды 14 дней
`;
  el("#doctorFile").files = [textFile("doctor-smoke.txt", doctorText)];
  await el("#loadDoctorConclusion").onclick();
  const conclusion = context.currentDoctorConclusion();
  assert.ok(conclusion.text.includes("Рабепразол"), "doctor protocol text should be loaded");
  assert.ok(conclusion.parsed.diagnoses.length >= 1, "doctor diagnoses should be recognized");
  assert.ok(conclusion.parsed.medications.length >= 3, "doctor medications should be recognized");
  el("#addDoctorMedications").onclick();
  assert.ok(context.currentMedications().some((item) => item.name === "Рабепразол"), "confirmed doctor medications should sync to medication profile");

  el("#labFiles").files = [textFile("labs-smoke.txt", "Дата анализа: 04.06.2026\nТТГ 0,617 мМЕ/л\nЛПНП 2.6 ммоль/л\nКреатинин 82 мкмоль/л")];
  await el("#loadLabs").onclick();
  const labRecords = context.getActiveProfile().labRecords || [];
  assert.ok(labRecords.length >= 1, "lab file should create a lab record");
  assert.ok(labRecords.some((record) => record.values.some((value) => value.key === "tsh" && Math.abs(value.value - 0.617) < 0.0001)), "TSH should be parsed from lab fixture");

  el("#medicationName").value = "розувастатин";
  el("#medicationDose").value = "10 мг вечером";
  await el("#addMedication").onclick();
  assert.ok(context.currentMedications().some((item) => item.name === "розувастатин"), "manual medication should be added");

  const vcf = [
    "##fileformat=VCFv4.2",
    "#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\tSAMPLE",
    "12\t21178615\trs4149056\tT\tC\t.\tPASS\t.\tGT\t0/1"
  ].join("\n");
  el("#vcfFile").files = [textFile("genotek-smoke.vcf", vcf)];
  await el("#loadVcf").onclick();
  assert.match(el("#patientData").value, /SLCO1B1 rs4149056 TC/, "Genotek VCF marker should be loaded");

  context.renderNowActions();
  assert.match(el("#nowActions").innerHTML, /Добавить протокол посещения врача/, "now tab should expose doctor protocol upload");

  return "doctor protocol, labs, medication, Genotek VCF scenarios passed";
}

await check("project availability", async () => {
  const { text } = await fetchText(PROD_URL);
  assert.match(text, /Разборчиво|Health PGx|PGx Agent/i, "landing page title should be present");
  return `${PROD_URL} returned HTML (${text.length} bytes)`;
});

let html = "";
await check("static assets", async () => {
  const result = await fetchText(PROD_URL);
  html = result.text;
  const assets = extractLocalAssets(html);
  const required = assets.filter((asset) => /\.(js|css|svg)(?:\?|$)/.test(asset));
  assert.ok(required.length >= 6, "expected JS/CSS/SVG assets in index.html");
  await Promise.all(required.map((asset) => fetchText(absoluteUrl(asset))));
  return `${required.length} local assets loaded`;
});

await check("registration/login auth config", async () => {
  if (!html) html = (await fetchText(PROD_URL)).text;
  const configAsset = extractLocalAssets(html).find((asset) => asset.includes("supabase-config.js")) || "./supabase-config.js";
  const { text } = await fetchText(absoluteUrl(configAsset));
  const config = parseSupabaseConfig(text);
  const settings = await fetchText(`${config.url}/auth/v1/settings`, {
    headers: { apikey: config.anonKey }
  });
  const payload = JSON.parse(settings.text);
  assert.equal(payload.external?.email, true, "email auth should be enabled");
  assert.equal(payload.disable_signup, false, "signup should be enabled");
  assert.ok(config.redirectUrl?.startsWith("https://health.yelchervya.com/pgx/"), "redirect URL should point to production");
  return "email auth enabled, signup enabled, redirect URL configured";
});

await check("core user scenarios", runAppScenarios);

const failed = checks.filter((item) => !item.ok);
const status = failed.length ? "FAILED" : "OK";
const lines = [
  `Разборчиво smoke report: ${status}`,
  `Target: ${PROD_URL}`,
  `Time: ${new Date().toISOString()}`,
  "",
  ...checks.map((item) => `${item.ok ? "OK" : "FAIL"} ${item.name} (${item.ms} ms)${item.detail ? ` - ${item.detail}` : ""}`)
];

console.log(lines.join("\n"));
if (failed.length) process.exit(1);
