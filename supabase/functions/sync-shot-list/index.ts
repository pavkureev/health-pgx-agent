import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

type EvidenceFlag = {
  label: string;
  aliases: string[];
  groups?: string[];
  category: string;
  note: string;
  sourceUrl: string;
  sourceName: string;
  sourceKind: "parsed" | "group-rule" | "seed";
};

const sourceUrl = "https://encyclopatia.ru/wiki/Расстрельный_список_препаратов";
const sourceName = "Encyclopedia Pathologica, Расстрельный список препаратов";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-sync-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const groupRules: EvidenceFlag[] = [
  {
    label: "Хондропротекторы",
    aliases: ["хондропротектор", "хондропротекторы", "глюкозамин", "хондроитин", "хондроитина сульфат", "glucosamine", "chondroitin"],
    groups: ["chondroprotective"],
    category: "не доказана эффективность",
    note: "Групповой флаг: хондропротекторы в источнике отнесены к препаратам с недоказанной эффективностью.",
    sourceUrl,
    sourceName,
    sourceKind: "group-rule"
  },
  {
    label: "Гомеопатия",
    aliases: ["гомеопатия", "гомеопатический", "homeopathy", "homeopathic", "афлубин", "aflubin"],
    groups: ["homeopathy"],
    category: "гомеопатия",
    note: "Групповой флаг: гомеопатические препараты не имеют доказанной клинической эффективности сверх плацебо.",
    sourceUrl,
    sourceName,
    sourceKind: "group-rule"
  },
  {
    label: "Ноотропы без убедительной доказательной базы",
    aliases: ["ноотроп", "ноотропы", "пирацетам", "piracetam"],
    groups: ["nootropic"],
    category: "нет убедительных исследований",
    note: "Групповой флаг для ноотропов, перечисленных источником как препараты с недостаточной доказательной базой.",
    sourceUrl,
    sourceName,
    sourceKind: "group-rule"
  },
  {
    label: "Индукторы интерферона",
    aliases: ["индуктор интерферона", "индукторы интерферона", "интерфероноген"],
    groups: ["interferon_inducer"],
    category: "нет исследований достаточного качества",
    note: "Групповой флаг для индукторов интерферона из источника.",
    sourceUrl,
    sourceName,
    sourceKind: "group-rule"
  }
];

const seedRules: EvidenceFlag[] = [
  seed("Агри", ["агри"], "гомеопатия", "В источнике указан как гомеопатический антигриппин."),
  seed("Афлубин", ["афлубин", "aflubin"], "гомеопатия", "Гомеопатический препарат; в источнике относится к препаратам без доказанной эффективности."),
  seed("Арбидол", ["арбидол", "умифеновир", "umifenovir"], "не доказана эффективность", "Упоминается в перечне устаревших препаратов с недоказанной эффективностью."),
  seed("Актовегин", ["актовегин", "солкосерил", "actovegin", "solcoseryl"], "нет убедительных исследований", "В источнике указан как препарат без ясного механизма действия и доказательств эффективности."),
  seed("Адаптол", ["адаптол", "мебикар", "мебикс", "adaptol"], "нет исследований", "В источнике отмечено отсутствие данных в Cochrane/PubMed/FDA/RXlist/ВОЗ для действующего вещества."),
  seed("Валидол", ["валидол"], "не доказана эффективность", "Упоминается в перечне устаревших препаратов с недоказанной эффективностью."),
  seed("Валокордин", ["валокордин", "корвалол"], "устаревший подход", "Упоминается в перечне устаревших препаратов с недоказанной эффективностью."),
  seed("Винпоцетин", ["винпоцетин", "кавинтон"], "не доказана эффективность", "Упоминается в перечне устаревших препаратов с недоказанной эффективностью."),
  seed("Пирацетам", ["пирацетам", "ноотропил"], "не доказана эффективность", "Упоминается в перечне устаревших препаратов с недоказанной эффективностью."),
  seed("Триметазидин", ["триметазидин", "предуктал"], "не доказана эффективность", "Упоминается в перечне устаревших препаратов с недоказанной эффективностью."),
  seed("Церебролизин", ["церебролизин", "cerebrolysin"], "нет убедительных исследований", "В источнике отмечены отсутствие спецификации состава, механизма действия и высококачественных исследований."),
  seed("Циклоферон", ["циклоферон", "cycloferon"], "нет исследований достаточного качества", "В источнике описан как индуктор интерферона без доказанной клинической эффективности в крупных международных исследованиях.")
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const configuredSecret = Deno.env.get("SHOT_LIST_SYNC_SECRET") || "";
  if (!configuredSecret) {
    return jsonResponse({ error: "SHOT_LIST_SYNC_SECRET is not configured" }, 500);
  }
  if (configuredSecret && req.headers.get("x-sync-secret") !== configuredSecret) {
    return jsonResponse({ error: "Forbidden" }, 403);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
  );

  try {
    const html = await fetchText(sourceUrl);
    const parsed = html ? parseShotList(html) : [];
    const merged = mergeFlags([...groupRules, ...seedRules, ...parsed]);
    const rows = merged.map((flag) => ({
      label: flag.label,
      aliases: normalizeAliases(flag.aliases.length ? flag.aliases : [flag.label]),
      groups: flag.groups || [],
      category: flag.category,
      note: flag.note,
      source_url: flag.sourceUrl,
      source_name: flag.sourceName,
      source_kind: flag.sourceKind,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from("medication_evidence_flags")
      .upsert(rows, { onConflict: "label" });

    if (error) return jsonResponse({ error: error.message }, 500);

    return jsonResponse({
      synced: rows.length,
      parsed: parsed.length,
      groupRules: groupRules.length,
      seedRules: seedRules.length,
      sourceUrl
    });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});

function seed(label: string, aliases: string[], category: string, note: string): EvidenceFlag {
  return { label, aliases, category, note, sourceUrl, sourceName, sourceKind: "seed" };
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "health-pgx-agent/0.1 shot-list sync",
      "Accept": "text/html,application/xhtml+xml"
    }
  });
  if (!response.ok) throw new Error(`Source returned ${response.status}`);
  return await response.text();
}

function parseShotList(html: string): EvidenceFlag[] {
  const text = compactText(stripHtml(html));
  const flags: EvidenceFlag[] = [];
  const knownNames = [
    "Актовегин", "Адаптол", "Агри", "Афлубин", "Арбидол", "Валидол", "Валокордин", "Винпоцетин",
    "Пирацетам", "Римантадин", "Триметазидин", "Фенотропил", "Хондроитинсульфат",
    "Церебролизин", "Циклоферон", "Адеметионин"
  ];

  for (const name of knownNames) {
    const index = text.toLowerCase().indexOf(name.toLowerCase());
    if (index < 0) continue;
    const context = text.slice(index, index + 520);
    flags.push({
      label: name,
      aliases: [name],
      category: inferCategory(context),
      note: compactText(context).slice(0, 300),
      sourceUrl,
      sourceName,
      sourceKind: "parsed"
    });
  }

  return flags;
}

function inferCategory(context: string) {
  const normalized = normalizeText(context);
  if (normalized.includes("гомеопат")) return "гомеопатия";
  if (normalized.includes("нет исследований") || normalized.includes("отсутств")) return "нет исследований";
  if (normalized.includes("не доказ")) return "не доказана эффективность";
  if (normalized.includes("устар")) return "устаревший подход";
  if (normalized.includes("cochrane") || normalized.includes("pubmed")) return "нет убедительных исследований";
  return "недостаточная доказательная база";
}

function mergeFlags(flags: EvidenceFlag[]) {
  const map = new Map<string, EvidenceFlag>();
  for (const flag of flags) {
    const key = normalizeText(flag.label);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, flag);
      continue;
    }

    map.set(key, {
      ...existing,
      aliases: normalizeAliases([...existing.aliases, ...flag.aliases]),
      groups: [...new Set([...(existing.groups || []), ...(flag.groups || [])])],
      note: existing.note.length >= flag.note.length ? existing.note : flag.note,
      sourceKind: existing.sourceKind === "parsed" ? existing.sourceKind : flag.sourceKind
    });
  }
  return [...map.values()];
}

function normalizeAliases(values: string[]) {
  return [...new Set(values.map((value) => normalizeText(value)).filter(Boolean))];
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replaceAll("ё", "е")
    .replace(/[‐‑‒–—−]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function compactText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
  });
}
