const baseParseProfile = parseProfile;

parseProfile = function parseProfileWithExtendedHla(text) {
  const result = baseParseProfile(text);

  for (const allele of ["HLA-A*31:01", "HLA-B*15:02"]) {
    const escaped = allele.replace("*", "\\*");
    const pattern = new RegExp(`${escaped}\\s*[:=,-]?\\s*(positive|negative|present|absent|detected|not\\s+detected)`, "i");
    const match = text.match(pattern);
    if (!match) continue;

    const raw = match[1].toLowerCase();
    result.profile[allele] = ["positive", "present", "detected"].includes(raw) ? "positive" : "negative";
    result.evidence[allele] = match[0].trim();
  }

  return result;
};

if (typeof analyze === "function") analyze();
