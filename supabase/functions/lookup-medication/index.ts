import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

type LookupResult = {
  queryName: string;
  normalizedName: string;
  substance: string | null;
  substanceLabel: string | null;
  sourceUrl: string | null;
  sourceName: string | null;
  shotListMatch: string | null;
  shotListCategory: string | null;
  shotListNote: string | null;
  rawSummary: string | null;
  confidence: number;
  cached?: boolean;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const shotListSeeds = [
  {
    label: "Хондропротекторы",
    aliases: [
      "хондропротектор",
      "хондропротекторы",
      "глюкозамин",
      "хондроитин",
      "хондроитина сульфат",
      "glucosamine",
      "chondroitin"
    ],
    category: "не доказана эффективность",
    note: "Групповой флаг: хондропротекторы в источнике отнесены к препаратам с недоказанной эффективностью."
  },
  {
    label: "Агри",
    aliases: ["агри"],
    category: "гомеопатия",
    note: "В источнике указан как гомеопатический антигриппин."
  },
  {
    label: "Арбидол",
    aliases: ["арбидол", "умифеновир", "umifenovir"],
    category: "не доказана эффективность",
    note: "Упоминается в перечне устаревших препаратов с недоказанной эффективностью."
  },
  {
    label: "Актовегин",
    aliases: ["актовегин", "солкосерил", "actovegin", "solcoseryl"],
    category: "нет убедительных исследований",
    note: "В источнике указан как препарат без ясного механизма действия и доказательств эффективности."
  },
  {
    label: "Адаптол",
    aliases: ["адаптол", "мебикар", "мебикс", "adaptol"],
    category: "нет исследований",
    note: "В источнике отмечено отсутствие данных в Cochrane/PubMed/FDA/RXlist/ВОЗ для действующего вещества."
  },
  {
    label: "Валидол",
    aliases: ["валидол"],
    category: "не доказана эффективность",
    note: "Упоминается в перечне устаревших препаратов с недоказанной эффективностью."
  },
  {
    label: "Валокордин",
    aliases: ["валокордин", "корвалол"],
    category: "устаревший подход",
    note: "Упоминается в перечне устаревших препаратов с недоказанной эффективностью."
  },
  {
    label: "Винпоцетин",
    aliases: ["винпоцетин", "кавинтон"],
    category: "не доказана эффективность",
    note: "Упоминается в перечне устаревших препаратов с недоказанной эффективностью."
  },
  {
    label: "Пирацетам",
    aliases: ["пирацетам", "ноотропил"],
    category: "не доказана эффективность",
    note: "Упоминается в перечне устаревших препаратов с недоказанной эффективностью."
  },
  {
    label: "Триметазидин",
    aliases: ["триметазидин", "предуктал"],
    category: "не доказана эффективность",
    note: "Упоминается в перечне устаревших препаратов с недоказанной эффективностью."
  },
  {
    label: "Церебролизин",
    aliases: ["церебролизин", "cerebrolysin"],
    category: "нет убедительных исследований",
    note: "В источнике отмечены отсутствие спецификации состава, механизма действия и высококачественных исследований."
  },
  {
    label: "Циклоферон",
    aliases: ["циклоферон", "cycloferon"],
    category: "нет исследований достаточного качества",
    note: "В источнике описан как индуктор интерферона без доказанной клинической эффективности в крупных международных исследованиях."
  }
];

const knownMedicationSubstances = [
  { label: "Крестор", aliases: ["крестор", "crestor"], substance: "розувастатин" },
  { label: "Сувардио", aliases: ["сувардио"], substance: "розувастатин" },
  { label: "Розукард", aliases: ["розукард"], substance: "розувастатин" },
  { label: "Мертенил", aliases: ["мертенил"], substance: "розувастатин" },
  { label: "Роксера", aliases: ["роксера"], substance: "розувастатин" },
  { label: "Липримар", aliases: ["липримар"], substance: "аторвастатин" },
  { label: "Аторис", aliases: ["аторис"], substance: "аторвастатин" },
  { label: "Торвакард", aliases: ["торвакард"], substance: "аторвастатин" },
  { label: "Плавикс", aliases: ["плавикс"], substance: "клопидогрел" },
  { label: "Зилт", aliases: ["зилт"], substance: "клопидогрел" },
  { label: "Омез", aliases: ["омез"], substance: "омепразол" },
  { label: "Нольпаза", aliases: ["нольпаза"], substance: "пантопразол" },
  { label: "Париет", aliases: ["париет"], substance: "рабепразол" },
  { label: "Конкор", aliases: ["конкор", "конкор кор"], substance: "бисопролол" },
  { label: "Норваск", aliases: ["норваск"], substance: "амлодипин" },
  { label: "Престариум", aliases: ["престариум"], substance: "периндоприл" },
  { label: "Лориста", aliases: ["лориста"], substance: "лозартан" },
  { label: "Ксарелто", aliases: ["ксарелто", "xarelto"], substance: "ривароксабан" },
  { label: "Эликвис", aliases: ["эликвис", "eliquis"], substance: "апиксабан" },
  { label: "Глюкофаж", aliases: ["глюкофаж"], substance: "метформин" },
  { label: "Эутирокс", aliases: ["эутирокс"], substance: "левотироксин" },
  { label: "Креон", aliases: ["креон"], substance: "панкреатин" },
  { label: "Артра", aliases: ["артра", "artra"], substance: "глюкозамин + хондроитин сульфат натрия" }
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const body = await req.json().catch(() => ({}));
    const queryName = String(body.name || "").trim();

    if (!queryName) {
      return jsonResponse({ error: "Medication name is required" }, 400);
    }

    const normalizedName = normalizeName(queryName);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const cached = await readCache(supabase, normalizedName);
    if (cached && Date.now() - new Date(cached.checked_at).getTime() < 1000 * 60 * 60 * 24 * 30) {
      return jsonResponse(mapCacheRow(cached, true));
    }

    const localSubstance = findKnownSubstance(queryName);
    const source = localSubstance
      ? { substance: localSubstance.substance, url: null, summary: `Локальный справочник: ${localSubstance.label}` }
      : await lookupPoiskLekarstv(queryName);
    const shotList = findShotListMatch([queryName, source.substance || ""].join(" "));
    const result: LookupResult = {
      queryName,
      normalizedName,
      substance: source.substance ? normalizeName(source.substance) : null,
      substanceLabel: source.substance,
      sourceUrl: source.url,
      sourceName: source.substance ? (localSubstance ? "local medication dictionary" : "poisklekarstv.com") : null,
      shotListMatch: shotList?.label || null,
      shotListCategory: shotList?.category || null,
      shotListNote: shotList?.note || null,
      rawSummary: source.summary,
      confidence: localSubstance ? 0.95 : source.substance ? 0.78 : shotList ? 0.55 : 0.2
    };

    await writeCache(supabase, result);
    return jsonResponse(result);
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});

async function readCache(supabase: ReturnType<typeof createClient>, normalizedName: string) {
  const { data } = await supabase
    .from("medication_lookup_cache")
    .select("*")
    .eq("normalized_name", normalizedName)
    .maybeSingle();
  return data;
}

async function writeCache(supabase: ReturnType<typeof createClient>, result: LookupResult) {
  await supabase
    .from("medication_lookup_cache")
    .upsert({
      query_name: result.queryName,
      normalized_name: result.normalizedName,
      substance: result.substance,
      substance_label: result.substanceLabel,
      source_url: result.sourceUrl,
      source_name: result.sourceName,
      shot_list_match: result.shotListMatch,
      shot_list_category: result.shotListCategory,
      shot_list_note: result.shotListNote,
      raw_summary: result.rawSummary,
      confidence: result.confidence,
      checked_at: new Date().toISOString()
    }, { onConflict: "normalized_name" });
}

function mapCacheRow(row: Record<string, unknown>, cached: boolean): LookupResult {
  return {
    queryName: String(row.query_name || ""),
    normalizedName: String(row.normalized_name || ""),
    substance: row.substance ? String(row.substance) : null,
    substanceLabel: row.substance_label ? String(row.substance_label) : null,
    sourceUrl: row.source_url ? String(row.source_url) : null,
    sourceName: row.source_name ? String(row.source_name) : null,
    shotListMatch: row.shot_list_match ? String(row.shot_list_match) : null,
    shotListCategory: row.shot_list_category ? String(row.shot_list_category) : null,
    shotListNote: row.shot_list_note ? String(row.shot_list_note) : null,
    rawSummary: row.raw_summary ? String(row.raw_summary) : null,
    confidence: Number(row.confidence || 0),
    cached
  };
}

async function lookupPoiskLekarstv(name: string) {
  const slug = transliterateForSlug(name);
  const urls = [
    `https://www.poisklekarstv.com/catalog/${encodeURIComponent(slug)}.html`,
    `https://www.poisklekarstv.com/${encodeURIComponent(slug)}/instruction`
  ];

  for (const url of urls) {
    const html = await fetchText(url);
    if (!html) continue;
    const substance = extractSubstance(html);
    if (substance) {
      return {
        substance,
        url,
        summary: compactText(stripHtml(html)).slice(0, 900)
      };
    }
  }

  return { substance: null, url: urls[0], summary: null };
}

async function fetchText(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "health-pgx-agent/0.1 medication lookup",
        "Accept": "text/html,application/xhtml+xml"
      }
    });
    if (!response.ok) return "";
    return await response.text();
  } catch (_error) {
    return "";
  }
}

function extractSubstance(html: string) {
  const text = compactText(stripHtml(html));
  const patterns = [
    /действующие\s+вещества\s*[:\-]?\s*([^.;|]{2,160})/i,
    /действующее\s+вещество\s*[:\-]?\s*([^.;|]{2,120})/i,
    /активное\s+вещество\s*[:\-]?\s*([^.;|]{2,120})/i,
    /международное\s+непатентованное\s+наименование\s*[:\-]?\s*([^.;|]{2,120})/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return cleanSubstance(match[1]);
  }

  return null;
}

function cleanSubstance(value: string) {
  return value
    .replace(/\s+(категория|болезни|цена|цены|производитель|форма выпуска|фармакологическое действие|состав|аналоги|отзывы|инструкция)(\s|:|-|$).*$/i, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/[,:;|].*$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function findKnownSubstance(name: string) {
  const normalized = normalizeName(name);
  return knownMedicationSubstances.find((item) => item.aliases.some((alias) => normalized.includes(normalizeName(alias)))) || null;
}

function findShotListMatch(name: string) {
  const normalized = normalizeName(name);
  return shotListSeeds.find((item) => item.aliases.some((alias) => normalized.includes(normalizeName(alias)))) || null;
}

function normalizeName(value: string) {
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

function transliterateForSlug(value: string) {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y",
    к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
    х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya"
  };
  return normalizeName(value)
    .split("")
    .map((char) => map[char] ?? char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}
