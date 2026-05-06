const LETTER_SECTIONS = new Set("АБВГДИЙКЛМНОПРСТУФХЦЭ".split(""));
const SEE_ALSO_PATTERN = /\bсм\.\s+/i;

export function parseShotList(input, options = {}) {
  const sourceUrl = options.sourceUrl || "";
  const sourceName = options.sourceName || "";
  const raw = looksLikeHtml(input) ? htmlToWikiLines(input) : input;
  const items = collectDrugItems(raw);

  return items
    .map((item) => toEvidenceFlag(item, sourceUrl, sourceName))
    .filter(Boolean);
}

export function mergeFlags(flags) {
  const map = new Map();
  for (const flag of flags) {
    const key = normalizeText(flag.label);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        ...flag,
        aliases: normalizeAliases(flag.aliases && flag.aliases.length ? flag.aliases : [flag.label])
      });
      continue;
    }

    const incomingIsBetter = sourceRank(flag.sourceKind) > sourceRank(existing.sourceKind);
    map.set(key, {
      ...(incomingIsBetter ? flag : existing),
      aliases: normalizeAliases([...(existing.aliases || []), ...(flag.aliases || [])]),
      groups: [...new Set([...(existing.groups || []), ...(flag.groups || [])])],
      note: chooseNote(existing.note, flag.note)
    });
  }
  return [...map.values()];
}

export function normalizeAliases(values) {
  return [...new Set(values.map((value) => normalizeText(value)).filter(Boolean))];
}

export function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replaceAll("ё", "е")
    .replace(/[‐‑‒–—−]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function collectDrugItems(raw) {
  const items = [];
  let currentSection = "";
  let inDrugSection = false;

  for (const line of String(raw || "").split(/\r?\n/)) {
    const heading = line.match(/^==\s*([^=]+?)\s*==\s*$/);
    if (heading) {
      currentSection = cleanWikiText(heading[1]).trim();
      inDrugSection = LETTER_SECTIONS.has(currentSection);
      continue;
    }

    if (!inDrugSection) continue;
    const item = line.match(/^\*{1,2}(?!\*)\s*(.+)$/);
    if (!item) continue;

    const text = compactText(item[1]);
    if (!text || shouldSkipItem(text)) continue;
    items.push({ section: currentSection, text });
  }

  return items;
}

function toEvidenceFlag(item, sourceUrl, sourceName) {
  const parsed = parseTitleAndAliases(item.text);
  if (!parsed || !parsed.label) return null;

  const category = inferCategory(item.text);
  const aliases = normalizeAliases([parsed.label, ...parsed.aliases]);
  const groups = inferGroups(item.text, aliases);

  return {
    label: parsed.label,
    aliases,
    groups,
    category,
    note: buildNeutralNote(item.text, category, parsed.redirectTarget),
    sourceUrl,
    sourceName,
    sourceKind: "parsed"
  };
}

function parseTitleAndAliases(text) {
  const cleaned = cleanWikiText(text)
    .replace(/^[-•]\s*/, "")
    .trim();
  const titleEnd = findTitleEnd(cleaned);
  const titlePart = cleaned.slice(0, titleEnd).trim();
  const rest = cleaned.slice(titleEnd).trim();
  const redirectTarget = extractRedirectTarget(rest);
  const aliases = [];

  const paren = titlePart.match(/\(([^)]+)\)/);
  if (paren) aliases.push(...splitAliasList(paren[1]));

  const titleWithoutParen = titlePart.replace(/\([^)]*\)/g, "").trim();
  const slashParts = splitAliasList(titleWithoutParen);
  const label = normalizeLabel(slashParts[0] || titleWithoutParen);
  aliases.push(...slashParts.slice(1));
  if (redirectTarget) aliases.push(redirectTarget);

  if (!isLikelyDrugLabel(label)) return null;
  return { label, aliases: aliases.map(normalizeLabel).filter(Boolean), redirectTarget };
}

function findTitleEnd(text) {
  const candidates = [":", " — ", " - "]
    .map((marker) => text.indexOf(marker))
    .filter((index) => index > 0);
  if (!candidates.length) return text.length;
  return Math.min(...candidates);
}

function extractRedirectTarget(text) {
  const match = text.match(SEE_ALSO_PATTERN);
  if (!match) return "";
  return normalizeLabel(text.slice(match.index + match[0].length).split(/[.;,]/)[0]);
}

function splitAliasList(value) {
  return String(value || "")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizeLabel(value) {
  return cleanWikiText(value)
    .replace(/\s+/g, " ")
    .replace(/^[\s:;,.]+|[\s:;,.]+$/g, "")
    .trim();
}

function inferCategory(text) {
  const normalized = normalizeText(cleanWikiText(text));
  if (normalized.includes("гомеопат")) return "гомеопатия";
  if (normalized.includes("устаревш")) return "устаревший подход";
  if (normalized.includes("противоречив") || normalized.includes("потенциальн") || normalized.includes("сомнительн")) return "спорная доказательность";
  if (normalized.includes("нет исследований") || normalized.includes("исследований нет") || normalized.includes("pubmed 0")) return "нет исследований";
  if (normalized.includes("не имеет исследований достаточного качества") || normalized.includes("нет убедительных") || normalized.includes("cochrane reviews 0")) return "нет убедительных исследований";
  if (normalized.includes("не доказ") || normalized.includes("доказательств эффективности нет") || normalized.includes("эффективность не подтвержд")) return "не доказана эффективность";
  if (normalized.includes("см. ")) return "нет убедительных исследований";
  return "нет убедительных исследований";
}

function inferGroups(text, aliases) {
  const normalized = normalizeText(`${text} ${aliases.join(" ")}`);
  const groups = [];
  if (normalized.includes("гомеопат")) groups.push("homeopathy");
  if (normalized.includes("хондроитин") || normalized.includes("глюкозамин") || normalized.includes("хондропротектор")) groups.push("chondroprotective");
  if (normalized.includes("ноотроп")) groups.push("nootropic");
  if (normalized.includes("индуктор интерферон") || normalized.includes("интерферон")) groups.push("interferon_inducer");
  if (normalized.includes("бад")) groups.push("supplement");
  if (normalized.includes("фитотерап")) groups.push("phytotherapy");
  return [...new Set(groups)];
}

function buildNeutralNote(text, category, redirectTarget) {
  const evidence = extractEvidenceMarkers(text);
  const parts = [`Критический справочный источник относит пункт к категории: ${category}.`];
  if (redirectTarget) parts.push(`В источнике указана отсылка: см. ${redirectTarget}.`);
  if (evidence.length) parts.push(`Упомянутые маркеры доказательной базы: ${evidence.join("; ")}.`);
  parts.push("Это не регуляторная база; вывод стоит проверять по клиническим рекомендациям и первичным источникам.");
  return parts.join(" ");
}

function extractEvidenceMarkers(text) {
  const clean = cleanWikiText(text);
  const markers = [];
  const patterns = [
    /Cochrane(?: Reviews)?\s*\d+/gi,
    /Pubmed\s*\d+/gi,
    /FDA\s*\d+/gi,
    /RXlist\s*\d+/gi,
    /ВОЗ\s*\d+/gi,
    /ФК\s*\([^)]+\)/gi,
    /ЖНВЛП/gi
  ];

  for (const pattern of patterns) {
    for (const match of clean.matchAll(pattern)) markers.push(compactText(match[0]));
  }

  return [...new Set(markers)].slice(0, 8);
}

function cleanWikiText(value) {
  return decodeHtmlEntities(String(value || ""))
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<ref[\s\S]*?<\/ref>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\{\{[^{}]*\}\}/g, " ")
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\[(?:https?:\/\/|\/\/)[^\s\]]+\s+([^\]]+)\]/g, "$1")
    .replace(/\[(?:https?:\/\/|\/\/)[^\]]+\]/g, " ")
    .replace(/'{2,5}/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shouldSkipItem(text) {
  const cleaned = normalizeText(cleanWikiText(text));
  if (!cleaned) return true;
  return cleaned.startsWith("обзор критики") || cleaned.includes("список классных лекарств");
}

function isLikelyDrugLabel(label) {
  if (!label || label.length < 2 || label.length > 120) return false;
  if (/^https?:/i.test(label)) return false;
  if (/^\d/.test(label)) return false;
  return /[a-zа-яё]/i.test(label);
}

function looksLikeHtml(value) {
  return /<html[\s>]|<li[\s>]|mw-parser-output/i.test(String(value || ""));
}

function htmlToWikiLines(html) {
  const content = extractArticleHtml(html);
  const lines = [];
  let currentSection = "";
  const tokenPattern = /<h2[\s\S]*?<\/h2>|<li[\s\S]*?<\/li>/gi;

  for (const match of content.matchAll(tokenPattern)) {
    const token = match[0];
    if (/^<h2/i.test(token)) {
      currentSection = cleanWikiText(token);
      lines.push(`==${currentSection}==`);
      continue;
    }
    if (LETTER_SECTIONS.has(currentSection)) lines.push(`*${cleanWikiText(token)}`);
  }

  return lines.join("\n");
}

function extractArticleHtml(html) {
  const start = html.search(/<div[^>]+class="[^"]*mw-parser-output/i);
  if (start < 0) return html;
  const end = html.indexOf('<div class="printfooter', start);
  return end > start ? html.slice(start, end) : html.slice(start);
}

function decodeHtmlEntities(value) {
  const named = {
    nbsp: " ",
    amp: "&",
    quot: "\"",
    apos: "'",
    lt: "<",
    gt: ">"
  };
  return String(value || "")
    .replace(/&([a-z]+);/gi, (_, name) => named[name.toLowerCase()] || " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function compactText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function chooseNote(a, b) {
  if (!a) return b || "";
  if (!b) return a;
  return b.length > a.length ? b : a;
}

function sourceRank(kind) {
  if (kind === "parsed") return 3;
  if (kind === "seed") return 2;
  if (kind === "group-rule") return 1;
  return 0;
}
