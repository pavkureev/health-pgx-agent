const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const parserSource = fs
  .readFileSync("supabase/functions/sync-shot-list/parser.ts", "utf8")
  .replace(/\bexport\s+/g, "");

const context = { console };
vm.createContext(context);
vm.runInContext(parserSource, context, { filename: "parser.ts" });

const raw = fs.readFileSync("tests/fixtures/shot-list.raw.wiki", "utf8");
const parsed = context.parseShotList(raw, {
  sourceUrl: "https://encyclopatia.ru/wiki/Расстрельный_список_препаратов",
  sourceName: "Encyclopedia Pathologica, Расстрельный список препаратов"
});

function find(label) {
  return parsed.find((item) => item.label === label);
}

assert.ok(parsed.length >= 250, `expected at least 250 parsed items, got ${parsed.length}`);
assert.ok(find("Арбидол"), "Арбидол should be parsed");
assert.ok(find("Кагоцел"), "Кагоцел should be parsed");
assert.ok(find("Церебролизин"), "Церебролизин should be parsed");
assert.ok(find("Циклоферон"), "Циклоферон should be parsed");
assert.ok(find("Хондроитин и глюкозамины"), "Хондроитин и глюкозамины should be parsed");
assert.ok(find("Афлубин"), "Афлубин should be parsed");

const arbidol = find("Арбидол");
assert.ok(arbidol.aliases.includes("умифеновир"), "Арбидол aliases should include umifenovir");
assert.ok(arbidol.aliases.includes("arbidol"), "Арбидол aliases should include arbidol");
assert.match(arbidol.note, /Критический справочный источник/, "note should use neutral source wording");
assert.doesNotMatch(arbidol.note, /олимпиард|бриллиант/, "note should not copy long source prose");

const aflubin = find("Афлубин");
assert.strictEqual(aflubin.category, "гомеопатия", "Афлубин should be categorized as homeopathy");
assert.ok(aflubin.groups.includes("homeopathy"), "Афлубин should get homeopathy group");

const chondro = find("Хондроитин и глюкозамины");
assert.ok(chondro.groups.includes("chondroprotective"), "chondroprotectors should get a group");

const staticContext = { window: {} };
vm.createContext(staticContext);
vm.runInContext(fs.readFileSync("data/evidence-flags.js", "utf8"), staticContext);
assert.ok(
  staticContext.window.PGX_SHOT_LIST_MEDICATIONS.length >= 250,
  "static evidence flags should include the parser v2 database"
);

const merged = context.mergeFlags([
  {
    label: "Арбидол",
    aliases: ["арбидол", "умифеновир"],
    category: "не доказана эффективность",
    note: "seed",
    sourceUrl: "",
    sourceName: "",
    sourceKind: "seed"
  },
  arbidol
]);
assert.strictEqual(merged.length, 1, "merge should deduplicate seed and parsed rows");
assert.strictEqual(merged[0].sourceKind, "parsed", "parsed source should win over seed");
assert.ok(merged[0].aliases.includes("умифеновир"), "merge should keep aliases");

console.log("shot-list parser tests passed");
