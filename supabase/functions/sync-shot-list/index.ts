import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";
import { mergeFlags, normalizeAliases, parseShotList } from "./parser.ts";

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
const sourceRawUrl = "https://encyclopatia.ru/w/index.php?title=%D0%A0%D0%B0%D1%81%D1%81%D1%82%D1%80%D0%B5%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9_%D1%81%D0%BF%D0%B8%D1%81%D0%BE%D0%BA_%D0%BF%D1%80%D0%B5%D0%BF%D0%B0%D1%80%D0%B0%D1%82%D0%BE%D0%B2&action=raw";
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
    const sourceText = await fetchText(sourceRawUrl);
    const parsed = sourceText ? parseShotList(sourceText, { sourceUrl, sourceName }) : [];
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
      sourceUrl,
      parserVersion: "v2"
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

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
  });
}
