const { rules, phenotypeMaps, snpHints, labAnalytes } = window.PGX_DATA;
const LAB_STORAGE_KEY = "pgx-agent-lab-records";
const PROFILE_STORAGE_KEY = "pgx-agent-profiles";
const ACTIVE_PROFILE_KEY = "pgx-agent-active-profile";
const PARSER_VERSION = "2026-04-30.1";
const KNOWN_BIRTH_DATES = new Set(["1981-06-06"]);
const supabaseClient = window.supabase && window.PGX_SUPABASE
  ? window.supabase.createClient(window.PGX_SUPABASE.url, window.PGX_SUPABASE.anonKey)
  : null;

const sample = `# Пример профиля
CYP2C19 *2/*2
CYP2D6 ultrarapid metabolizer
SLCO1B1 rs4149056 TC
CYP2C9 *1/*3
TPMT *1/*1
NUDT15 *1/*3
HLA-B*57:01 negative
HLA-B*58:01 positive`;

const patientData = document.querySelector("#patientData");
const patientDataView = document.querySelector("#patientDataView");
const geneticInputForm = document.querySelector("#geneticInputForm");
const geneticTextInput = document.querySelector("#geneticTextInput");
const geneticDataView = document.querySelector("#geneticDataView");
const textModeToggle = document.querySelector("#textModeToggle");
const drugSearch = document.querySelector("#drugSearch");
const resultsEl = document.querySelector("#results");
const summaryEl = document.querySelector("#summary");
const matchCounter = document.querySelector("#matchCounter");
const geneCounter = document.querySelector("#geneCounter");
const vcfFile = document.querySelector("#vcfFile");
const fileStatus = document.querySelector("#fileStatus");
const labFiles = document.querySelector("#labFiles");
const labStatus = document.querySelector("#labStatus");
const labText = document.querySelector("#labText");
const labCounter = document.querySelector("#labCounter");
const labSummary = document.querySelector("#labSummary");
const labInsights = document.querySelector("#labInsights");
const labResults = document.querySelector("#labResults");
const labMetric = document.querySelector("#labMetric");
const labChart = document.querySelector("#labChart");
const metricDescription = document.querySelector("#metricDescription");
const labDiagnostics = document.querySelector("#labDiagnostics");
const labDiagnosticsBody = document.querySelector("#labDiagnosticsBody");
const profileSelect = document.querySelector("#profileSelect");
const profileName = document.querySelector("#profileName");
const profileCounter = document.querySelector("#profileCounter");
const profileStatus = document.querySelector("#profileStatus");
const authEmail = document.querySelector("#authEmail");
const authTitle = document.querySelector("#authTitle");
const authMode = document.querySelector("#authMode");
const authStatus = document.querySelector("#authStatus");
const signedInBox = document.querySelector("#signedInBox");
const magicLinkBox = document.querySelector("#magicLinkBox");
const loginBox = document.querySelector("#loginBox");
const signOutButton = document.querySelector("#signOut");
const anotherEmailButton = document.querySelector("#anotherEmail");
const welcomeBox = document.querySelector("#welcomeBox");
const onboardingBox = document.querySelector("#onboardingBox");
const displayName = document.querySelector("#displayName");
let currentUser = null;
let cloudReady = false;
let savingCloudProfile = false;
let magicLinkSentEmail = "";
let geneticInputOpen = true;
let profiles = loadProfiles();
let activeProfileId = loadActiveProfileId();
ensureActiveProfile();
let labRecords = getActiveProfile().labRecords || [];

if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

document.querySelector("#loadSample").addEventListener("click", () => {
  patientData.value = sample;
  patientDataView.value = sample;
  drugSearch.value = "";
  fileStatus.className = "file-status";
  fileStatus.textContent = "Загружен встроенный пример.";
  geneticInputOpen = false;
  saveCurrentProfileData();
  analyze();
  renderGeneticInputState();
});

document.querySelector("#createProfile").addEventListener("click", createProfile);
document.querySelector("#deleteProfile").addEventListener("click", deleteActiveProfile);
document.querySelector("#signIn").addEventListener("click", signIn);
document.querySelector("#signOut").addEventListener("click", signOut);
document.querySelector("#anotherEmail").addEventListener("click", resetMagicLinkForm);
document.querySelector("#saveDisplayName").addEventListener("click", saveDisplayName);
document.querySelector("#uploadOtherGenetics").addEventListener("click", showGeneticInputForm);
textModeToggle.addEventListener("change", renderGeneticInputState);
profileSelect.addEventListener("change", switchProfile);
patientData.addEventListener("input", () => {
  patientDataView.value = patientData.value;
  saveCurrentProfileData();
  analyze();
  renderGeneticInputState();
});
document.querySelector("#analyze").addEventListener("click", () => {
  if (patientData.value.trim()) {
    geneticInputOpen = false;
    renderGeneticInputState();
  }
  analyze();
});
document.querySelector("#loadVcf").addEventListener("click", loadVcfFile);
document.querySelector("#loadLabs").addEventListener("click", loadLabFiles);
document.querySelector("#parseLabText").addEventListener("click", addLabText);
document.querySelector("#clearLabs").addEventListener("click", clearLabHistory);
document.querySelector("#clear").addEventListener("click", () => {
  patientData.value = "";
  patientDataView.value = "";
  drugSearch.value = "";
  vcfFile.value = "";
  fileStatus.className = "file-status";
  fileStatus.textContent = "Файл читается локально в браузере и никуда не отправляется.";
  geneticInputOpen = true;
  saveCurrentProfileData();
  render([], {});
  renderGeneticInputState();
});
drugSearch.addEventListener("input", analyze);
labMetric.addEventListener("change", () => drawLabChart(labMetric.value));
initSupabaseAuth();

function normalizeText(value) {
  return value
    .toLowerCase()
    .replaceAll("ё", "е")
    .replace(/[‐‑‒–—−]/g, "-")
    .replace(/\s*-\s*/g, "-");
}

function normalizeDiplotype(value) {
  return value.replace(/\s+/g, "").toUpperCase().replaceAll("X", "x");
}

async function initSupabaseAuth() {
  if (!supabaseClient) {
    renderAuthState();
    return;
  }

  const { data } = await supabaseClient.auth.getSession();
  currentUser = data.session?.user || null;
  cloudReady = Boolean(currentUser);

  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    currentUser = session?.user || null;
    cloudReady = Boolean(currentUser);
    renderAuthState();
    if (cloudReady) await loadCloudProfiles();
    else applyActiveProfile();
  });

  renderAuthState();
  if (cloudReady) await loadCloudProfiles();
}

function renderAuthState() {
  if (!supabaseClient) {
    authTitle.textContent = "Залогиньтесь или зарегистрируйтесь, чтобы ваши данные сохранялись";
    authMode.textContent = "Локально";
    authStatus.textContent = "Supabase SDK не загружен. Данные хранятся только локально.";
    loginBox.hidden = true;
    magicLinkBox.hidden = true;
    anotherEmailButton.hidden = true;
    signOutButton.hidden = true;
    signedInBox.hidden = true;
    signedInBox.innerHTML = "";
    renderWelcome();
    return;
  }

  if (currentUser) {
    authTitle.textContent = "Аккаунт";
    authMode.textContent = "Supabase";
    loginBox.hidden = true;
    magicLinkBox.hidden = true;
    anotherEmailButton.hidden = true;
    signedInBox.hidden = false;
    signedInBox.innerHTML = `
      <div>
        <strong>Вы вошли в аккаунт с email ${escapeHtml(currentUser.email || "")}</strong>
        <p>Профили и распознанные данные сохраняются в Supabase.</p>
      </div>
      <button id="signOutInline" class="secondary-button" type="button">Выйти</button>
    `;
    signedInBox.querySelector("#signOutInline").addEventListener("click", signOut);
    signOutButton.hidden = true;
    authStatus.textContent = "Аккаунт подключен.";
    renderWelcome();
    return;
  }

  authEmail.disabled = false;
  authMode.textContent = "Локально";
  authTitle.textContent = "Залогиньтесь или зарегистрируйтесь, чтобы ваши данные сохранялись";
  loginBox.hidden = Boolean(magicLinkSentEmail);
  magicLinkBox.hidden = !magicLinkSentEmail;
  anotherEmailButton.hidden = !magicLinkSentEmail;
  signOutButton.hidden = true;
  signedInBox.hidden = true;
  signedInBox.innerHTML = "";
  if (magicLinkSentEmail) {
    magicLinkBox.innerHTML = `<strong>Мы отправили ссылку для входа на email ${escapeHtml(magicLinkSentEmail)}</strong>`;
    authStatus.textContent = "Откройте письмо и перейдите по ссылке для входа.";
  } else {
    authStatus.textContent = "Войдите по email, чтобы сохранять профили и анализы в Supabase. Без входа данные хранятся только в этом браузере.";
  }
  renderWelcome();
}

function renderWelcome() {
  if (!currentUser) {
    welcomeBox.hidden = true;
    onboardingBox.hidden = true;
    return;
  }

  const profile = getActiveProfile();
  const name = getDisplayName(profile);
  const needsName = !name;

  onboardingBox.hidden = !needsName;
  welcomeBox.hidden = needsName;

  if (needsName) {
    displayName.value = "";
    authStatus.textContent = "Представьтесь, чтобы мы могли подписывать ваш профиль и приветствовать вас при входе.";
    return;
  }

  welcomeBox.innerHTML = `
    <strong>Рады видеть вас снова, ${escapeHtml(name)}.</strong>
    <p>Ваши профили и распознанные данные сохраняются в Supabase.</p>
  `;
}

function getDisplayName(profile) {
  const name = profile?.metadata?.displayName || profile?.name || "";
  return /^профиль\s*\d+$/i.test(name.trim()) ? "" : name.trim();
}

async function saveDisplayName() {
  const name = displayName.value.trim();
  if (!name) {
    authStatus.textContent = "Введите имя.";
    return;
  }

  const profile = getActiveProfile();
  profile.name = name;
  profile.metadata = { ...(profile.metadata || {}), displayName: name };
  saveProfiles();

  if (cloudReady) {
    const { error } = await supabaseClient
      .from("patient_profiles")
      .update({
        display_name: name,
        metadata: { ...(profile.metadata || {}), displayName: name, patientData: profile.patientData || "" }
      })
      .eq("id", profile.id);

    if (error) {
      authStatus.textContent = `Не удалось сохранить имя: ${error.message}`;
      return;
    }
  }

  renderProfiles();
  renderWelcome();
}

async function signIn() {
  if (!supabaseClient) {
    authStatus.textContent = "Supabase SDK не загружен.";
    return;
  }

  const email = authEmail.value.trim();
  if (!email) {
    authStatus.textContent = "Введите email для входа.";
    return;
  }

  const { error } = await supabaseClient.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.PGX_SUPABASE.redirectUrl || window.location.href.split("#")[0] }
  });

  if (error) {
    authStatus.textContent = error.message?.includes("rate limit")
      ? "Слишком много попыток входа. Подождите примерно минуту и попробуйте снова."
      : `Не удалось отправить ссылку: ${error.message}`;
    return;
  }

  authEmail.disabled = true;
  magicLinkSentEmail = email;
  renderAuthState();
}

function resetMagicLinkForm() {
  magicLinkSentEmail = "";
  authEmail.value = "";
  loginBox.hidden = false;
  renderAuthState();
}

async function signOut() {
  if (!supabaseClient) return;
  currentUser = null;
  cloudReady = false;
  magicLinkSentEmail = "";
  signedInBox.hidden = true;
  signedInBox.innerHTML = "";
  loginBox.hidden = false;
  signOutButton.hidden = true;
  welcomeBox.hidden = true;
  onboardingBox.hidden = true;
  authEmail.disabled = false;
  renderAuthState();
  await supabaseClient.auth.signOut();
  renderAuthState();
  applyActiveProfile();
}

async function loadCloudProfiles() {
  const { data, error } = await supabaseClient
    .from("patient_profiles")
    .select("id, display_name, metadata, created_at, updated_at")
    .order("created_at", { ascending: true });

  if (error) {
    authStatus.textContent = `Supabase: не удалось загрузить профили (${error.message}). Использую локальные данные.`;
    cloudReady = false;
    applyActiveProfile();
    return;
  }

  if (!data.length) {
    await createCloudProfileFromLocal(getActiveProfile().name || "Профиль 1", getActiveProfile());
    return;
  }

  profiles = data.map(mapCloudProfile);
  if (!profiles.some((profile) => profile.id === activeProfileId)) {
    activeProfileId = profiles[0].id;
  }
  await loadCloudProfileDetails(activeProfileId);
  saveProfiles();
  applyActiveProfile();
}

async function loadCloudProfileDetails(profileId) {
  const profile = profiles.find((item) => item.id === profileId);
  if (!profile) return;

  const { data, error } = await supabaseClient
    .from("lab_observations")
    .select("id, document_id, analyte_key, analyte_label, observed_on, value, unit, reference_low, reference_high, source_line")
    .eq("profile_id", profileId)
    .order("observed_on", { ascending: true });

  if (error) {
    profileStatus.textContent = `Не удалось загрузить анализы из Supabase: ${error.message}`;
    return;
  }

  profile.labRecords = observationsToLabRecords(data || []);
}

function mapCloudProfile(row) {
  return {
    id: row.id,
    name: row.display_name,
    metadata: row.metadata || {},
    patientData: row.metadata?.patientData || "",
    labRecords: [],
    cloud: true
  };
}

async function createCloudProfileFromLocal(name, localProfile) {
  const { data: profile, error: profileError } = await supabaseClient
    .from("patient_profiles")
    .insert({
      owner_user_id: currentUser.id,
      display_name: name,
      metadata: {
        patientData: localProfile?.patientData || "",
        displayName: /^профиль\s*\d+$/i.test(name.trim()) ? "" : name
      }
    })
    .select("id, display_name, metadata, created_at, updated_at")
    .single();

  if (profileError) {
    profileStatus.textContent = `Не удалось создать профиль в Supabase: ${profileError.message}`;
    return;
  }

  const { error: memberError } = await supabaseClient
    .from("profile_members")
    .insert({ profile_id: profile.id, user_id: currentUser.id, role: "owner" });

  if (memberError) {
    profileStatus.textContent = `Профиль создан, но доступ не записался: ${memberError.message}`;
    return;
  }

  profiles = [mapCloudProfile(profile)];
  activeProfileId = profile.id;
  labRecords = [];
  if (localProfile?.labRecords?.length) {
    await saveCloudLabRecords(localProfile.labRecords);
  }
  await loadCloudProfileDetails(profile.id);
  saveProfiles();
  applyActiveProfile();
}

function loadProfiles() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed?.profiles?.length) return parsed.profiles;
  } catch (error) {
    // Fall through to migration/default profile.
  }

  return [
    {
      id: createId(),
      name: "Профиль 1",
      patientData: localStorage.getItem("pgx-agent-patient-data") || "",
      labRecords: loadLegacyLabRecords()
    }
  ];
}

function loadActiveProfileId() {
  return localStorage.getItem(ACTIVE_PROFILE_KEY);
}

function ensureActiveProfile() {
  if (!profiles.length) {
    profiles = [{ id: createId(), name: "Профиль 1", patientData: "", labRecords: [] }];
  }
  if (!profiles.some((profile) => profile.id === activeProfileId)) {
    activeProfileId = profiles[0].id;
  }
  saveProfiles();
}

function getActiveProfile() {
  return profiles.find((profile) => profile.id === activeProfileId) || profiles[0];
}

function saveProfiles() {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({ profiles }));
  localStorage.setItem(ACTIVE_PROFILE_KEY, activeProfileId);
}

function saveCurrentProfileData() {
  const profile = getActiveProfile();
  profile.patientData = patientData.value;
  profile.labRecords = labRecords;
  profile.updatedAt = new Date().toISOString();
  saveProfiles();
  saveCloudProfileMetadata();
}

async function saveCloudProfileMetadata() {
  if (!cloudReady || savingCloudProfile) return;
  const profile = getActiveProfile();
  if (!profile?.id) return;

  savingCloudProfile = true;
  const { error } = await supabaseClient
    .from("patient_profiles")
    .update({
      display_name: profile.name,
      metadata: { ...(profile.metadata || {}), patientData: profile.patientData || "" }
    })
    .eq("id", profile.id);
  savingCloudProfile = false;

  if (error) {
    profileStatus.textContent = `Supabase: не удалось сохранить профиль (${error.message}).`;
  }
}

function renderProfiles() {
  profileSelect.innerHTML = profiles
    .map((profile) => `<option value="${escapeHtml(profile.id)}">${escapeHtml(profile.name)}</option>`)
    .join("");
  profileSelect.value = activeProfileId;
  profileCounter.textContent = `${profiles.length} ${plural(profiles.length, "профиль", "профиля", "профилей")}`;
  profileStatus.textContent = cloudReady
    ? `Активен: ${getActiveProfile().name}. Данные сохраняются в Supabase.`
    : `Активен: ${getActiveProfile().name}. Данные сохраняются локально в этом профиле.`;
  renderWelcome();
}

function applyActiveProfile() {
  const profile = getActiveProfile();
  patientData.value = profile.patientData || "";
  patientDataView.value = profile.patientData || "";
  geneticInputOpen = !patientData.value.trim();
  labRecords = profile.labRecords || [];
  vcfFile.value = "";
  labFiles.value = "";
  labText.value = "";
  drugSearch.value = "";
  renderProfiles();
  analyze();
  renderLabHistory();
  renderLabDiagnostics([]);
  renderGeneticInputState();
}

function showGeneticInputForm() {
  geneticInputOpen = true;
  renderGeneticInputState();
}

function renderGeneticInputState() {
  const hasData = Boolean(patientData.value.trim());
  geneticInputForm.hidden = hasData && !geneticInputOpen;
  geneticDataView.hidden = !hasData || geneticInputOpen;
  geneticTextInput.hidden = !textModeToggle.checked;
  document.querySelector("#uploadOtherGenetics").hidden = !hasData || geneticInputOpen;
  patientDataView.value = patientData.value;
}

async function createProfile() {
  const name = profileName.value.trim();
  if (!name) {
    profileStatus.textContent = "Введите имя нового профиля.";
    return;
  }

  saveCurrentProfileData();
  if (cloudReady) {
    await createCloudProfileFromLocal(name, { patientData: "", labRecords: [] });
    profileName.value = "";
    return;
  }

  const profile = { id: createId(), name, patientData: "", labRecords: [], createdAt: new Date().toISOString() };
  profiles.push(profile);
  activeProfileId = profile.id;
  profileName.value = "";
  saveProfiles();
  applyActiveProfile();
}

async function deleteActiveProfile() {
  if (cloudReady && profiles.length > 1) {
    const deletedName = getActiveProfile().name;
    const { error } = await supabaseClient.from("patient_profiles").delete().eq("id", activeProfileId);
    if (error) {
      profileStatus.textContent = `Не удалось удалить профиль в Supabase: ${error.message}`;
      return;
    }
    profiles = profiles.filter((profile) => profile.id !== activeProfileId);
    activeProfileId = profiles[0].id;
    await loadCloudProfileDetails(activeProfileId);
    saveProfiles();
    applyActiveProfile();
    profileStatus.textContent = `Профиль ${deletedName} удален.`;
    return;
  }

  if (profiles.length === 1) {
    const profile = getActiveProfile();
    profile.patientData = "";
    profile.labRecords = [];
    labRecords = [];
    patientData.value = "";
    saveProfiles();
    applyActiveProfile();
    profileStatus.textContent = "Единственный профиль очищен.";
    return;
  }

  const deletedName = getActiveProfile().name;
  profiles = profiles.filter((profile) => profile.id !== activeProfileId);
  activeProfileId = profiles[0].id;
  saveProfiles();
  applyActiveProfile();
  profileStatus.textContent = `Профиль ${deletedName} удален.`;
}

async function switchProfile() {
  saveCurrentProfileData();
  activeProfileId = profileSelect.value;
  if (cloudReady) await loadCloudProfileDetails(activeProfileId);
  saveProfiles();
  applyActiveProfile();
}

function createId() {
  return `profile-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function parseProfile(text) {
  const profile = {};
  const evidence = {};
  const normalized = text
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((line) => !line.trim().startsWith("#"))
    .join("\n");

  for (const gene of Object.keys(phenotypeMaps)) {
    const phenotypePattern = new RegExp(`${gene}\\s*[:=,-]?\\s*(ultrarapid|rapid|normal|intermediate|poor)\\s+(metabolizer)`, "i");
    const phenotypeMatch = normalized.match(phenotypePattern);
    if (phenotypeMatch) {
      profile[gene] = `${phenotypeMatch[1].toLowerCase()} metabolizer`;
      evidence[gene] = phenotypeMatch[0].trim();
    }

    const diplotypePattern = new RegExp(`${gene}\\s*[:=,-]?\\s*(\\*[^\\s,;]+\\/\\*[^\\s,;]+)`, "i");
    const diplotypeMatch = normalized.match(diplotypePattern);
    if (diplotypeMatch) {
      const diplotype = normalizeDiplotype(diplotypeMatch[1]);
      const mapped = phenotypeMaps[gene][diplotype];
      if (mapped) {
        profile[gene] = mapped;
        evidence[gene] = `${gene} ${diplotype}`;
      }
    }
  }

  for (const hint of snpHints) {
    const pattern = new RegExp(`${hint.rsid}\\s+([ACGT]{2})`, "i");
    const match = normalized.match(pattern);
    if (match) {
      const genotype = match[1].toUpperCase();
      const mapped = hint.calls[genotype];
      if (mapped) {
        profile[hint.gene] = mapped;
        evidence[hint.gene] = `${hint.rsid} ${genotype}`;
      }
    }
  }

  for (const allele of ["HLA-B*57:01", "HLA-B*58:01"]) {
    const escaped = allele.replace("*", "\\*");
    const pattern = new RegExp(`${escaped}\\s*[:=,-]?\\s*(positive|negative|present|absent|detected|not\\s+detected)`, "i");
    const match = normalized.match(pattern);
    if (match) {
      const raw = match[1].toLowerCase();
      profile[allele] = ["positive", "present", "detected"].includes(raw) ? "positive" : "negative";
      evidence[allele] = match[0].trim();
    }
  }

  return { profile, evidence };
}

async function loadVcfFile() {
  const file = vcfFile.files[0];
  if (!file) {
    fileStatus.className = "file-status error";
    fileStatus.textContent = "Сначала выберите файл .vcf.";
    return;
  }

  try {
    const text = await file.text();
    const { lines, found, skipped } = parseVcf(text);
    if (!lines.length) {
      fileStatus.className = "file-status error";
      fileStatus.textContent = "В этом VCF не нашлось известных MVP-маркеров. Можно вставить фенотипы вручную ниже.";
      return;
    }

    patientData.value = [
      `# Из VCF: ${file.name}`,
      ...lines,
      "",
      "# При необходимости добавьте фенотипы вручную, например:",
      "# CYP2D6 poor metabolizer",
      "# HLA-B*58:01 positive"
    ].join("\n");
    patientDataView.value = patientData.value;
    geneticInputOpen = false;
    fileStatus.className = "file-status";
    fileStatus.textContent = `VCF загружен: найдено ${found} ${plural(found, "маркер", "маркера", "маркеров")}${skipped ? `, пропущено без genotype call: ${skipped}` : ""}.`;
    saveCurrentProfileData();
    analyze();
    renderGeneticInputState();
  } catch (error) {
    fileStatus.className = "file-status error";
    fileStatus.textContent = "Не удалось прочитать файл. Проверьте, что это обычный текстовый VCF.";
  }
}

function parseVcf(text) {
  const wanted = new Map(snpHints.map((hint) => [hint.rsid.toLowerCase(), hint]));
  const parsed = [];
  let skipped = 0;

  for (const rawLine of text.split(/\r?\n/)) {
    if (!rawLine || rawLine.startsWith("#")) continue;
    const columns = rawLine.split("\t");
    if (columns.length < 10) continue;

    const id = columns[2];
    const hint = wanted.get(id.toLowerCase());
    if (!hint) continue;

    const ref = columns[3].toUpperCase();
    const alts = columns[4].split(",").map((allele) => allele.toUpperCase());
    const format = columns[8].split(":");
    const sample = columns[9].split(":");
    const gtIndex = format.indexOf("GT");
    const gt = gtIndex >= 0 ? sample[gtIndex] : sample[0];
    const genotype = genotypeFromVcfGt(gt, ref, alts);

    if (!genotype) {
      skipped += 1;
      continue;
    }

    parsed.push(`${hint.gene} ${id} ${genotype}`);
  }

  return { lines: parsed, found: parsed.length, skipped };
}

async function loadLabFiles() {
  const files = Array.from(labFiles.files || []);
  if (!files.length) {
    labStatus.className = "file-status error";
    labStatus.textContent = "Сначала выберите один или несколько файлов.";
    return;
  }

  const added = [];
  const failed = [];
  const diagnostics = [];

  for (const file of files) {
    try {
      const text = await extractTextFromFile(file);
      const record = parseLabReport(text, file.name, file.lastModified);
      if (record.values.length) {
        added.push(record);
      } else {
        failed.push(file.name);
        diagnostics.push(buildLabDiagnostic(file.name, text));
      }
    } catch (error) {
      failed.push(file.name);
      diagnostics.push({
        fileName: file.name,
        status: "Не удалось прочитать PDF/текст",
        details: error.message || "unknown error",
        preview: ""
      });
    }
  }

  if (added.length) {
    labRecords = dedupeLabRecords([...labRecords, ...added]);
    if (cloudReady) await saveCloudLabRecords(added);
    saveCurrentProfileData();
    renderLabHistory();
  }

  labStatus.className = failed.length && !added.length ? "file-status error" : "file-status";
  labStatus.textContent = [
    added.length ? `Добавлено ${added.length} ${plural(added.length, "отчет", "отчета", "отчетов")}.` : "",
    failed.length ? `Не разобрано: ${failed.join(", ")}.` : ""
  ].filter(Boolean).join(" ");
  renderLabDiagnostics(diagnostics);
}

async function extractTextFromFile(file) {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return file.text();
  if (!window.pdfjsLib) {
    throw new Error("pdf.js unavailable");
  }

  const buffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(rebuildPdfLines(content.items));
  }

  return cleanupExtractedText(pages.join("\n"));
}

function cleanupExtractedText(text) {
  return text
    .normalize("NFC")
    .replace(/\u00a0/g, " ")
    .replace(/[‐‑‒–—−]/g, "-")
    .replace(/[ \t]{2,}/g, "          ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildLabDiagnostic(fileName, text) {
  const compactText = cleanupExtractedText(text || "");
  const preview = compactText.split("\n").slice(0, 28).join("\n");
  const hasCyrillic = /[а-яА-Я]/.test(compactText);
  const hasNumbers = /\d+(?:[.,]\d+)?/.test(compactText);
  const hasKnownLabels = /(глюкоза|креатинин|холестерин|холестерол|с-реактивный|c-реактивный|crp|алт|аст|лейкоциты|эритроциты|гемоглобин)/i.test(compactText);

  let status = "Текст извлечен, но поддерживаемые показатели не найдены";
  if (!compactText) status = "Текст из PDF не извлекся";
  else if (!hasCyrillic && hasNumbers) status = "Текст похож на числовые/служебные поля без русских названий";
  else if (!hasKnownLabels) status = "Текст извлекся, но названия показателей выглядят нестандартно";

  return {
    fileName,
    status,
    details: `${compactText.length} символов, кириллица: ${hasCyrillic ? "да" : "нет"}, числа: ${hasNumbers ? "да" : "нет"}`,
    preview
  };
}

function renderLabDiagnostics(diagnostics) {
  if (!diagnostics.length) {
    labDiagnostics.hidden = true;
    labDiagnosticsBody.innerHTML = "";
    return;
  }

  labDiagnostics.hidden = false;
  labDiagnostics.open = true;
  labDiagnosticsBody.innerHTML = diagnostics.map((item) => `
    <div class="diagnostic-item">
      <strong>${escapeHtml(item.fileName)}</strong>
      <p class="file-status">${escapeHtml(item.status)}. ${escapeHtml(item.details)}</p>
      <pre>${escapeHtml(item.preview || "Нет извлеченного текста для предпросмотра.")}</pre>
    </div>
  `).join("");
}

function rebuildPdfLines(items) {
  const rows = [];

  for (const item of items) {
    const text = String(item.str || "").trim();
    if (!text) continue;

    const x = item.transform?.[4] || 0;
    const y = item.transform?.[5] || 0;
    const row = rows.find((candidate) => Math.abs(candidate.y - y) < 8);
    if (row) {
      row.items.push({ x, text });
      row.y = (row.y + y) / 2;
    } else {
      rows.push({ y, items: [{ x, text }] });
    }
  }

  return rows
    .sort((a, b) => b.y - a.y)
    .map((row) => joinPdfRowItems(row.items.sort((a, b) => a.x - b.x)))
    .join("\n");
}

function joinPdfRowItems(items) {
  let previousX = null;
  return items
    .map((item) => {
      const gap = previousX === null ? 0 : item.x - previousX;
      previousX = item.x;
      const spaces = gap > 90 ? "          " : gap > 35 ? "   " : " ";
      return `${spaces}${item.text}`;
    })
    .join("")
    .trim();
}

async function addLabText() {
  if (!labText.value.trim()) {
    labStatus.className = "file-status error";
    labStatus.textContent = "Вставьте текст анализа.";
    return;
  }

  const record = parseLabReport(labText.value, "Ручная вставка", Date.now());
  if (!record.values.length) {
    labStatus.className = "file-status error";
    labStatus.textContent = "Не удалось найти поддерживаемые показатели в тексте.";
    return;
  }

  labRecords = dedupeLabRecords([...labRecords, record]);
  if (cloudReady) await saveCloudLabRecords([record]);
  saveCurrentProfileData();
  renderLabHistory();
  labStatus.className = "file-status";
  labStatus.textContent = `Добавлено ${record.values.length} ${plural(record.values.length, "показатель", "показателя", "показателей")}.`;
}

function parseLabReport(text, sourceName, fallbackTimestamp) {
  const normalized = text.replace(/\u00a0/g, " ");
  const reportDate = findReportDate(normalized, sourceName, fallbackTimestamp);
  const values = [];

  for (const analyte of labAnalytes) {
    const found = findAnalyteValue(normalized, analyte);
    if (found) {
      values.push({
        key: analyte.key,
        label: analyte.label,
        value: found.value,
        unit: found.unit || analyte.unit,
        raw: found.raw
      });
    }
  }

  return {
    id: `${reportDate}-${sourceName}-${values.map((item) => `${item.key}:${item.value}`).join("|")}`,
    sourceName,
    date: reportDate,
    values
  };
}

async function saveCloudLabRecords(records) {
  if (!cloudReady || !records.length) return;
  const profile = getActiveProfile();

  for (const record of records) {
    const { data: documentRow, error: documentError } = await supabaseClient
      .from("source_documents")
      .insert({
        profile_id: profile.id,
        uploaded_by: currentUser.id,
        kind: "lab_text",
        status: "parsed",
        file_name: record.sourceName,
        report_date: record.date,
        parser_version: PARSER_VERSION
      })
      .select("id")
      .single();

    if (documentError) {
      labStatus.textContent = `Supabase: документ не сохранен (${documentError.message}).`;
      continue;
    }

    const rows = record.values.map((value) => ({
      profile_id: profile.id,
      document_id: documentRow.id,
      analyte_key: value.key,
      analyte_label: value.label,
      observed_on: record.date,
      value: value.value,
      unit: value.unit,
      source_line: value.raw,
      parser_version: PARSER_VERSION
    }));

    const { error: observationError } = await supabaseClient.from("lab_observations").insert(rows);
    if (observationError) {
      labStatus.textContent = `Supabase: показатели не сохранены (${observationError.message}).`;
    }
  }
}

function observationsToLabRecords(observations) {
  const byDocument = new Map();

  for (const item of observations) {
    const key = item.document_id || `${item.observed_on}-${item.analyte_key}`;
    if (!byDocument.has(key)) {
      byDocument.set(key, {
        id: key,
        sourceName: "Supabase",
        date: item.observed_on,
        values: []
      });
    }
    byDocument.get(key).values.push({
      key: item.analyte_key,
      label: item.analyte_label,
      value: Number(item.value),
      unit: item.unit || "",
      raw: item.source_line || ""
    });
  }

  return [...byDocument.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function findReportDate(text, sourceName, fallbackTimestamp) {
  const filenameDate = sourceName.match(/\b(20\d{2})[_ .-](\d{1,2})[_ .-](\d{1,2})\b/);
  if (filenameDate) return `${filenameDate[1]}-${filenameDate[2].padStart(2, "0")}-${filenameDate[3].padStart(2, "0")}`;

  const lines = text.split(/\n/).map((line) => line.trim()).filter(Boolean);
  const labelledDate = findLabelledReportDate(lines);
  if (labelledDate) return labelledDate;

  const genericDate = lines
    .filter((line) => !isBirthDateLine(line))
    .map((line) => parseDateFromLine(line))
    .filter((date) => date && !isKnownBirthDate(date) && !isImplausibleReportDate(date))
    .find(Boolean);
  if (genericDate) return genericDate;

  return new Date(fallbackTimestamp || Date.now()).toISOString().slice(0, 10);
}

function findLabelledReportDate(lines) {
  const reportLabel = /(^|\s)(дата|зарегистрирован|зарегистрировано|регистрация|дата\s*(?:анализа|исследования|забора|взятия|биоматериала|регистрации|получения|поступления|результата|готовности)|дата\s+выдачи|date\s*(?:of)?\s*(?:collection|report|result|sampling|analysis|registration))/i;

  for (const line of lines) {
    if (isBirthDateLine(line) || isPersonOrAdminLine(line) || !reportLabel.test(line)) continue;
    const date = parseDateFromLine(line);
    if (date && !isKnownBirthDate(date) && !isImplausibleReportDate(date)) return date;
  }

  return null;
}

function parseDateFromLine(line) {
  const dmy = line.match(/\b(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})\b/);
  if (dmy) {
    const year = normalizeYear(dmy[3]);
    return `${year}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  }

  const ymd = line.match(/\b(20\d{2})[./-](\d{1,2})[./-](\d{1,2})\b/);
  if (ymd) return `${ymd[1]}-${ymd[2].padStart(2, "0")}-${ymd[3].padStart(2, "0")}`;

  return null;
}

function isBirthDateLine(line) {
  return /(дата\s*рождения|рожден|birth|dob)/i.test(line);
}

function isPersonOrAdminLine(line) {
  return /(фамилия|имя|отчество|пациент|врач|заказчик|пол:|возраст|карта|номер\s*заказа|заказ\s*№|образец|sample|номер\s*документа|document\s*no|штрихкод|barcode|order\s*no|patient|doctor)/i.test(line);
}

function isKnownBirthDate(date) {
  if (!date) return false;
  return KNOWN_BIRTH_DATES.has(date);
}

function isImplausibleReportDate(date) {
  if (!date) return true;
  const year = Number(date.slice(0, 4));
  return year < 2000;
}

function normalizeYear(value) {
  if (value.length === 4) return value;
  const numeric = Number(value);
  return String(numeric > 70 ? 1900 + numeric : 2000 + numeric);
}

function findAnalyteValue(text, analyte) {
  const lines = text.split(/\n|;/).map((line) => line.trim()).filter(Boolean);
  const aliases = [...analyte.aliases].sort((a, b) => b.length - a.length);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (isNonResultLine(line)) continue;

    const normalizedLine = normalizeText(line);
    const blockLines = collectAnalyteBlock(lines, index);
    const block = blockLines.join(" ");
    const normalizedBlock = normalizeText(block);
    const alias = aliases.find((item) => hasAlias(normalizedLine, normalizeText(item)) || hasAlias(normalizedBlock, normalizeText(item)));
    if (!alias) continue;

    const normalizedAlias = normalizeText(alias);
    const aliasIndex = normalizedBlock.indexOf(normalizedAlias);
    const afterAlias = normalizedBlock.slice(aliasIndex + normalizedAlias.length, aliasIndex + normalizedAlias.length + 180);
    if (looksLikeDateFragment(afterAlias)) continue;

    const foundValue = extractValueNearAlias(blockLines, alias, analyte);
    if (!foundValue) continue;

    return {
      value: foundValue.value,
      unit: foundValue.unit,
      raw: blockLines.join(" / ")
    };
  }

  return null;
}

function collectAnalyteBlock(lines, startIndex) {
  const collected = [];

  for (const line of lines.slice(startIndex, startIndex + 8)) {
    if (collected.length && /^исследование\s*-/i.test(line)) break;
    if (/(наименование исследования|нормальные значения|референсные значения|предыдущий результат|метод и оборудование)/i.test(line)) continue;
    if (isPersonOrAdminLine(line) || isBirthDateLine(line)) continue;
    if (collected.length && isLikelyAnalyteStart(line) && !isContinuationLine(line)) break;
    collected.push(line);
    if (/\d+(?:[.,]\d+)?\s*(ммоль\/л|mmol\/l|мг\/л|mg\/l|мг\/дл|mg\/dl|г\/л|g\/l)/i.test(collected.join(" "))) break;
  }

  return collected;
}

function extractValueNearAlias(blockLines, alias, analyte) {
  const normalizedAlias = normalizeText(alias);
  const sameLine = blockLines.find((line) => hasAlias(normalizeText(line), normalizedAlias));
  if (sameLine) {
    const value = extractResultValue(sameLine, normalizeText(sameLine), analyte);
    if (value) return value;
  }

  const combined = blockLines.join(" ");
  const normalizedCombined = normalizeText(combined);
  const aliasIndex = normalizedCombined.indexOf(normalizedAlias);
  const afterAlias = aliasIndex >= 0 ? normalizedCombined.slice(aliasIndex + normalizedAlias.length, aliasIndex + normalizedAlias.length + 220) : normalizedCombined;
  if (looksLikeDateFragment(afterAlias)) return null;
  return extractResultValue(combined, afterAlias, analyte);
}

function isLikelyAnalyteStart(line) {
  const normalized = normalizeText(line);
  return labAnalytes.some((analyte) => analyte.aliases.some((alias) => hasAlias(normalized, normalizeText(alias))));
}

function isContinuationLine(line) {
  return /^(общий|низкой плотности|высокой плотности|\(липопротеины|липопротеины|венозной крови|\(натощак\)|↑|↓|\d+(?:[.,]\d+)?|ммоль\/л|мг\/л|мкг\/л|нг\/мл|г\/л|см\.)/i.test(line.trim());
}

function extractValueFromFollowingLines(lines, currentLine, analyte) {
  const startIndex = lines.indexOf(currentLine);
  const searchLines = collectFollowingResultBlock(lines, startIndex);
  const joinedBlock = searchLines.join(" ");
  const blockValue = extractResultValue(joinedBlock, joinedBlock, analyte);
  if (blockValue) return blockValue;

  const resultLine = searchLines.find((line) => {
    if (isNonResultLine(line)) return false;
    if (/(название|показатель|референс|предыдущий|метод|оборудование)/i.test(line)) return false;
    return /(концентрация|результат|значение|result|value)/i.test(line) && /\d+(?:[.,]\d+)?/.test(line);
  });

  if (!resultLine) return null;
  return extractResultValue(resultLine, resultLine, analyte) || {
    value: parseNumber(resultLine.match(/([<>]?\s*\d+(?:[.,]\d+)?)/)?.[1] || ""),
    unit: analyte.unit
  };
}

function collectFollowingResultBlock(lines, startIndex) {
  const collected = [];

  for (const line of lines.slice(startIndex + 1, startIndex + 10)) {
    if (/^исследование\s*-/i.test(line) && collected.some((item) => /\d/.test(item))) break;
    if (/(название\/показатель|наименование исследования|нормальные значения|референсные значения|предыдущий результат|метод и оборудование|образец|sample|номер документа|document|штрихкод|barcode)/i.test(line)) continue;
    if (isPersonOrAdminLine(line) || isBirthDateLine(line)) continue;
    collected.push(line);
    if (/\d+(?:[.,]\d+)?\s*(ммоль\/л|mmol\/l|мг\/л|mg\/l|мг\/дл|mg\/dl|г\/л|g\/l)/i.test(collected.join(" "))) break;
  }

  return collected;
}

function extractResultValue(originalLine, afterAlias, analyte = {}) {
  const allowedUnit = unitPatternForAnalyte(analyte);
  const medsiFlagValue = originalLine.match(new RegExp(`[↑↓*]?\\s*([<>]?\\s*\\d+(?:[.,]\\d+)?)\\s*(${allowedUnit})`, "i"));
  if (medsiFlagValue) {
    return {
      value: parseNumber(medsiFlagValue[1]),
      unit: medsiFlagValue[2]
    };
  }

  const tableValue = originalLine.match(new RegExp(`\\s{2,}([<>]?\\s*\\d+(?:[.,]\\d+)?)\\s{2,}(${allowedUnit})`, "i"));
  if (tableValue) {
    return {
      value: parseNumber(tableValue[1]),
      unit: tableValue[2]
    };
  }

  const valueWithUnit = originalLine.match(new RegExp(`([<>]?\\s*\\d+(?:[.,]\\d+)?)\\s*(${allowedUnit})`, "i"));
  if (valueWithUnit) {
    return {
      value: parseNumber(valueWithUnit[1]),
      unit: valueWithUnit[2]
    };
  }

  const labelledValue = afterAlias.match(/(?:результат|значение|result)\D{0,20}([<>]?\s*\d+(?:[.,]\d+)?)/i);
  if (labelledValue) {
    return {
      value: parseNumber(labelledValue[1]),
      unit: extractUnitFromFragment(afterAlias)
    };
  }

  const firstValue = afterAlias.match(/^[^0-9<>]{0,80}([<>]?\s*\d+(?:[.,]\d+)?)/);
  if (!firstValue) return null;
  if (analyte.unit) return null;

  return {
    value: parseNumber(firstValue[1]),
    unit: extractUnitFromFragment(afterAlias)
  };
}

function unitPatternForAnalyte(analyte = {}) {
  const unit = normalizeUnit(analyte.unit || "");
  const patterns = {
    "ммоль/л": "ммоль\\/л|mmol\\/l",
    "мг/л": "мг\\/л|mg\\/l",
    "мкг/л": "мкг\\/л|µg\\/l|ug\\/l|mcg\\/l|нг\\/мл|ng\\/ml",
    "нг/мл": "нг\\/мл|ng\\/ml|мкг\\/л|µg\\/l|ug\\/l|mcg\\/l",
    "ед/л": "ед\\/л|u\\/l|ме\\/л|iu\\/l",
    "мкмоль/л": "мкмоль\\/л|umol\\/l|µmol\\/l",
    "г/л": "г\\/л|g\\/l",
    "%": "%"
  };
  return patterns[unit] || "ммоль\\/л|mmol\\/l|мг\\/л|mg\\/l|мг\\/дл|mg\\/dl|%|ед\\/л|u\\/l|мкмоль\\/л|umol\\/l|нг\\/мл|ng\\/ml|пг\\/мл|pg\\/ml|г\\/л|g\\/l|мкг\\/л|ug\\/l";
}

function normalizeUnit(unit) {
  return String(unit).toLowerCase().replaceAll(" ", "");
}

function extractUnitFromFragment(fragment) {
  const unit = fragment.match(/\d+(?:[.,]\d+)?\s*([a-zA-Zа-яА-Я/%^0-9.+-]+(?:\/[a-zA-Zа-яА-Я0-9.^+-]+)?)/);
  return unit ? unit[1] : "";
}

function hasAlias(line, alias) {
  const escaped = escapeRegExp(alias);
  const pattern = new RegExp(`(^|[^a-zа-я0-9+])${escaped}([^a-zа-я0-9+]|$)`, "i");
  return pattern.test(line);
}

function isNonResultLine(line) {
  return isBirthDateLine(line) || isPersonOrAdminLine(line) || /(дата\s*(?:анализа|исследования|забора|взятия|биоматериала|регистрации|получения|поступления|результата|готовности)|материал|лаборатория)/i.test(line);
}

function looksLikeDateFragment(value) {
  return /^\D{0,16}\d{1,2}[./-]\d{1,2}[./-]\d{2,4}/.test(value);
}

function extractUnit(line, offset) {
  const fragment = line.slice(offset).match(/\d+(?:[.,]\d+)?\s*([a-zA-Zа-яА-Я/%^0-9.+-]+(?:\/[a-zA-Zа-яА-Я0-9.^+-]+)?)/);
  return fragment ? fragment[1] : "";
}

function parseNumber(value) {
  return Number(String(value).replace(/[<>\s]/g, "").replace(",", "."));
}

function loadLegacyLabRecords() {
  try {
    const raw = localStorage.getItem(LAB_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function dedupeLabRecords(records) {
  const byId = new Map();
  for (const record of records) byId.set(record.id, record);
  return [...byId.values()].sort((a, b) => a.date.localeCompare(b.date));
}

async function clearLabHistory() {
  if (cloudReady) {
    const profile = getActiveProfile();
    const { error: observationsError } = await supabaseClient
      .from("lab_observations")
      .delete()
      .eq("profile_id", profile.id);
    const { error: documentsError } = await supabaseClient
      .from("source_documents")
      .delete()
      .eq("profile_id", profile.id)
      .in("kind", ["lab_pdf", "lab_text"]);

    if (observationsError || documentsError) {
      labStatus.className = "file-status error";
      labStatus.textContent = `Supabase: не удалось очистить историю (${observationsError?.message || documentsError?.message}).`;
      return;
    }
  }

  labRecords = [];
  labFiles.value = "";
  labText.value = "";
  saveCurrentProfileData();
  renderLabHistory();
  labStatus.className = "file-status";
  labStatus.textContent = "История анализов очищена.";
  renderLabDiagnostics([]);
}

function renderLabHistory() {
  const totalValues = labRecords.reduce((sum, record) => sum + record.values.length, 0);
  labCounter.textContent = `${labRecords.length} ${plural(labRecords.length, "запись", "записи", "записей")}`;

  if (!labRecords.length) {
    labSummary.className = "summary empty";
    labSummary.textContent = "Загрузите анализы, чтобы увидеть показатели и динамику.";
    labMetric.innerHTML = "";
    labInsights.innerHTML = "";
    labResults.innerHTML = "";
    drawLabChart("");
    return;
  }

  const metricOptions = availableLabMetrics();
  const previousMetric = labMetric.value;
  labMetric.innerHTML = metricOptions
    .map((metric) => `<option value="${escapeHtml(metric.key)}">${escapeHtml(metric.label)}</option>`)
    .join("");
  labMetric.value = metricOptions.some((metric) => metric.key === previousMetric) ? previousMetric : metricOptions[0].key;

  labSummary.className = "summary";
  labSummary.textContent = `В истории ${labRecords.length} ${plural(labRecords.length, "отчет", "отчета", "отчетов")} и ${totalValues} ${plural(totalValues, "показатель", "показателя", "показателей")}. Выберите показатель, чтобы увидеть динамику.`;
  labInsights.innerHTML = renderLabInsights();
  labResults.innerHTML = labRecords.map(renderLabRecord).join("");
  drawLabChart(labMetric.value);
}

function availableLabMetrics() {
  const keys = new Set(labRecords.flatMap((record) => record.values.map((value) => value.key)));
  return labAnalytes.filter((analyte) => keys.has(analyte.key));
}

function renderLabRecord(record) {
  return `
    <article class="lab-record">
      <div class="lab-record-title">
        <strong>${escapeHtml(formatDate(record.date))}</strong>
        <span class="badge">${escapeHtml(record.sourceName)}</span>
      </div>
      <div class="lab-values">
        ${record.values.map((value) => `
          <div class="lab-value">
            <span>${escapeHtml(value.label)}</span>
            <strong>${escapeHtml(formatNumber(value.value))} ${escapeHtml(value.unit)}</strong>
            <small>${escapeHtml(value.raw)}</small>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

function labDescription(key) {
  return labAnalytes.find((item) => item.key === key)?.description || "";
}

function renderLabInsights() {
  const signals = labClinicalSignals();
  if (!signals.length) return "";

  return signals.map((signal) => `
    <article class="result-card ${signal.severity}">
      <div class="result-title">
        <strong>${escapeHtml(signal.title)}</strong>
        <span class="badge">${escapeHtml(signal.metric)}</span>
      </div>
      <p class="recommendation">${escapeHtml(signal.body)}</p>
      <p class="source">Основано на последнем значении: ${escapeHtml(signal.value)} от ${escapeHtml(formatDate(signal.date))}</p>
    </article>
  `).join("");
}

function labClinicalSignals() {
  const latest = latestLabValues();
  const signals = [];

  addThresholdSignal(signals, latest.egfr, (item) => item.value < 60, {
    title: "Проверить почечную коррекцию доз",
    metric: "eGFR",
    severity: "high",
    body: "Сниженная расчетная СКФ может менять выбор и дозирование препаратов, особенно НПВС, антикоагулянтов, антибиотиков, метформина и ряда психотропных средств."
  });

  for (const key of ["alt", "ast"]) {
    addThresholdSignal(signals, latest[key], (item) => item.value >= 80, {
      title: "Учесть печеночный контекст",
      metric: key.toUpperCase(),
      severity: "moderate",
      body: "Повышенные трансаминазы стоит учитывать при препаратах с гепатотоксичностью или активным печеночным метаболизмом. Нужна клиническая интерпретация причины повышения."
    });
  }

  addThresholdSignal(signals, latest.ck, (item) => item.value >= 300, {
    title: "Оценить мышечный риск",
    metric: "КФК",
    severity: "moderate",
    body: "Повышенная КФК важна при обсуждении статинов и жалоб на мышечные симптомы, особенно вместе с фармакогенетическим сигналом SLCO1B1."
  });

  addThresholdSignal(signals, latest.potassium, (item) => item.value > 5.2 || item.value < 3.5, {
    title: "Проверить калий-зависимые риски",
    metric: "Калий",
    severity: "moderate",
    body: "Отклонение калия может влиять на безопасность диуретиков, ИАПФ/БРА, антагонистов минералокортикоидных рецепторов и препаратов с риском аритмий."
  });

  addThresholdSignal(signals, latest.hba1c, (item) => item.value >= 6.5, {
    title: "Учесть гликемический профиль",
    metric: "HbA1c",
    severity: "moderate",
    body: "Повышенный HbA1c полезно учитывать при выборе препаратов, влияющих на вес, аппетит, липиды и глюкозу."
  });

  addThresholdSignal(signals, latest.ldl, (item) => item.value > 1.8, {
    title: "Обсудить липидный риск",
    metric: "ЛПНП",
    severity: "moderate",
    body: "ЛПНП выше персональной цели 1.8 ммоль/л для группы риска. Полезно обсудить сердечно-сосудистый риск, переносимость терапии и целевой уровень."
  });

  addThresholdSignal(signals, latest.triglycerides, (item) => item.value >= 1.7, {
    title: "Проверить триглицериды",
    metric: "Триглицериды",
    severity: "moderate",
    body: "Повышенные триглицериды стоит интерпретировать с учетом питания перед анализом, глюкозы, HbA1c, ТТГ и текущих препаратов."
  });

  addThresholdSignal(signals, latest.crp, (item) => item.value > 5, {
    title: "Учесть воспалительный маркер",
    metric: "C-реактивный белок",
    severity: "moderate",
    body: "Повышенный C-реактивный белок не указывает причину сам по себе, но важен как контекст при симптомах, инфекциях, воспалении и оценке сердечно-сосудистого риска."
  });

  return signals;
}

function latestLabValues() {
  const latest = {};
  for (const record of [...labRecords].sort((a, b) => a.date.localeCompare(b.date))) {
    for (const value of record.values) {
      latest[value.key] = { ...value, date: record.date };
    }
  }
  return latest;
}

function addThresholdSignal(signals, item, predicate, template) {
  if (!item || !predicate(item)) return;
  signals.push({
    ...template,
    value: `${formatNumber(item.value)} ${item.unit}`,
    date: item.date
  });
}

function drawLabChart(metricKey) {
  renderMetricDescription(metricKey);
  const context = labChart.getContext("2d");
  const width = labChart.width;
  const height = labChart.height;
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#fbfcfc";
  context.fillRect(0, 0, width, height);

  if (!metricKey) {
    drawEmptyChart(context, width, height, "Нет данных для графика");
    return;
  }

  const points = labRecords
    .map((record) => {
      const value = record.values.find((item) => item.key === metricKey);
      return value ? { date: record.date, timestamp: new Date(`${record.date}T00:00:00`).getTime(), value: value.value } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.timestamp - b.timestamp);

  if (!points.length) {
    drawEmptyChart(context, width, height, "Нет данных для выбранного показателя");
    return;
  }

  const metric = labAnalytes.find((item) => item.key === metricKey);
  const padding = { top: 30, right: 28, bottom: 48, left: 58 };
  const values = points.map((point) => point.value);
  const referenceValues = referenceBounds(metric).filter((value) => value !== null);
  const scaleValues = [...values, ...referenceValues];
  const min = Math.min(...scaleValues);
  const max = Math.max(...scaleValues);
  const span = max === min ? Math.max(1, Math.abs(max) * 0.2) : max - min;
  const yMin = max === min ? min - span : min - span * 0.12;
  const yMax = max === min ? max + span : max + span * 0.12;
  const allRecordTimes = labRecords.map((record) => new Date(`${record.date}T00:00:00`).getTime());
  const minTime = Math.min(...allRecordTimes);
  const maxTime = Math.max(...allRecordTimes);
  const timeSpan = maxTime === minTime ? 1 : maxTime - minTime;
  const plotLeft = padding.left;
  const plotRight = width - padding.right;
  const plotTop = padding.top;
  const plotBottom = height - padding.bottom;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;

  context.strokeStyle = "#d9e0dd";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(plotLeft, plotTop);
  context.lineTo(plotLeft, plotBottom);
  context.lineTo(plotRight, plotBottom);
  context.stroke();

  context.fillStyle = "#63706b";
  context.font = "13px system-ui, sans-serif";
  context.fillText(`${metric.label}${metric.unit ? `, ${metric.unit}` : ""}`, plotLeft, 18);
  context.fillText(formatNumber(yMax), 10, plotTop + 4);
  context.fillText(formatNumber(yMin), 10, plotBottom + 4);

  const xFor = (timestamp) => {
    if (points.length === 1) return (plotLeft + plotRight) / 2;
    return plotLeft + ((timestamp - minTime) / timeSpan) * plotWidth;
  };
  const yFor = (value) => plotBottom - ((value - yMin) / (yMax - yMin)) * plotHeight;

  drawYearTicks(context, minTime, maxTime, xFor, plotTop, plotBottom);
  drawReferenceRange(context, metric, yFor, plotLeft, plotRight);

  context.strokeStyle = "#287a69";
  context.lineWidth = 3;
  context.setLineDash([]);
  context.beginPath();
  points.forEach((point, index) => {
    const x = xFor(point.timestamp);
    const y = yFor(point.value);
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.stroke();

  points.forEach((point, index) => {
    const x = xFor(point.timestamp);
    const y = yFor(point.value);
    context.fillStyle = "#ffffff";
    context.strokeStyle = "#155e54";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(x, y, 5, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.fillStyle = "#17211d";
    context.fillText(formatNumber(point.value), x - 12, y - 10);
    context.fillStyle = "#63706b";
    context.fillText(formatShortDate(point.date), x - 20, height - 18);
  });
}

function renderMetricDescription(metricKey) {
  const description = labDescription(metricKey);
  const metric = labAnalytes.find((item) => item.key === metricKey);
  if (!description || !metric) {
    metricDescription.hidden = true;
    metricDescription.textContent = "";
    return;
  }

  metricDescription.hidden = false;
  metricDescription.innerHTML = `<strong>${escapeHtml(metric.label)}:</strong> ${escapeHtml(description)}`;
}

function referenceBounds(metric) {
  const reference = metric?.reference || {};
  return [reference.min ?? null, reference.max ?? null];
}

function drawReferenceRange(context, metric, yFor, plotLeft, plotRight) {
  const [min, max] = referenceBounds(metric);
  if (min === null && max === null) return;

  context.save();
  context.setLineDash([7, 5]);
  context.font = "12px system-ui, sans-serif";

  if (min !== null && max !== null) {
    const yMinRef = yFor(min);
    const yMaxRef = yFor(max);
    context.fillStyle = "rgba(40, 122, 105, 0.08)";
    context.fillRect(plotLeft, Math.min(yMinRef, yMaxRef), plotRight - plotLeft, Math.abs(yMinRef - yMaxRef));
  }

  for (const item of [
    { value: min, label: "min" },
    { value: max, label: "max" }
  ]) {
    if (item.value === null) continue;
    const y = yFor(item.value);
    context.strokeStyle = item.label === "min" ? "#6f9d8f" : "#b4413c";
    context.lineWidth = 1.5;
    context.beginPath();
    context.moveTo(plotLeft, y);
    context.lineTo(plotRight, y);
    context.stroke();
    context.fillStyle = context.strokeStyle;
    context.fillText(`${item.label} ${formatNumber(item.value)}`, plotRight - 72, y - 5);
  }

  context.restore();
}

function drawYearTicks(context, minTime, maxTime, xFor, plotTop, plotBottom) {
  const firstYear = new Date(minTime).getFullYear();
  const lastYear = new Date(maxTime).getFullYear();

  context.save();
  context.setLineDash([3, 6]);
  context.strokeStyle = "#d9e0dd";
  context.fillStyle = "#63706b";
  context.lineWidth = 1;
  context.font = "12px system-ui, sans-serif";

  for (let year = firstYear; year <= lastYear; year += 1) {
    const timestamp = new Date(`${year}-01-01T00:00:00`).getTime();
    if (timestamp < minTime || timestamp > maxTime) continue;
    const x = xFor(timestamp);
    context.beginPath();
    context.moveTo(x, plotTop);
    context.lineTo(x, plotBottom);
    context.stroke();
    context.fillText(String(year), x + 4, plotTop + 14);
  }

  context.restore();
}

function drawEmptyChart(context, width, height, message) {
  context.fillStyle = "#63706b";
  context.font = "14px system-ui, sans-serif";
  context.textAlign = "center";
  context.fillText(message, width / 2, height / 2);
  context.textAlign = "start";
}

function formatDate(value) {
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
}

function formatShortDate(value) {
  const [, month, day] = value.split("-");
  return `${day}.${month}`;
}

function formatNumber(value) {
  return Number(value).toLocaleString("ru-RU", { maximumFractionDigits: 2 });
}

function genotypeFromVcfGt(gt, ref, alts) {
  if (!gt || gt.includes(".")) return null;
  const alleleIndexes = gt.split(/[\/|]/);
  if (alleleIndexes.length < 2) return null;

  const alleles = alleleIndexes.map((index) => {
    const numericIndex = Number(index);
    if (!Number.isInteger(numericIndex)) return null;
    return numericIndex === 0 ? ref : alts[numericIndex - 1];
  });

  if (alleles.some((allele) => !allele || allele.length !== 1)) return null;
  return alleles.join("").toUpperCase();
}

function analyze() {
  const { profile, evidence } = parseProfile(patientData.value);
  const query = normalizeText(drugSearch.value.trim());
  const matches = rules
    .filter((rule) => {
      if (!query) return true;
      const haystack = normalizeText([rule.drug, rule.gene, ...rule.aliases].join(" "));
      return haystack.includes(query);
    })
    .map((rule) => {
      const phenotype = profile[rule.gene];
      const recommendation = phenotype ? rule.matches[phenotype] : null;
      return recommendation
        ? {
            ...rule,
            phenotype,
            recommendation,
            foundBy: evidence[rule.gene] || rule.gene
          }
        : null;
    })
    .filter(Boolean)
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity));

  render(matches, profile);
}

function severityRank(value) {
  return { low: 1, moderate: 2, high: 3 }[value] || 0;
}

function render(matches, profile) {
  const genes = Object.keys(profile);
  geneCounter.textContent = `${genes.length} ${plural(genes.length, "ген", "гена", "генов")}`;
  matchCounter.textContent = `${matches.length} ${plural(matches.length, "совпадение", "совпадения", "совпадений")}`;

  if (!patientData.value.trim()) {
    summaryEl.className = "summary empty";
    summaryEl.textContent = "Загрузите пример или вставьте данные, чтобы увидеть найденные gene-drug сигналы.";
    resultsEl.innerHTML = "";
    return;
  }

  if (matches.length === 0) {
    summaryEl.className = "summary empty";
    summaryEl.textContent = genes.length
      ? `Распознано: ${genes.join(", ")}. Для выбранного фильтра активных рекомендаций не найдено.`
      : "Не удалось надежно распознать генетические маркеры. Попробуйте формат вроде CYP2C19 *2/*2 или rs4149056 TC.";
    resultsEl.innerHTML = "";
    return;
  }

  const highCount = matches.filter((match) => match.severity === "high").length;
  summaryEl.className = "summary";
  summaryEl.textContent = `Найдено ${matches.length} ${plural(matches.length, "сигнал", "сигнала", "сигналов")}. ${highCount ? `Высокий приоритет: ${highCount}. ` : ""}Проверьте это с врачом до любых изменений терапии.`;

  resultsEl.innerHTML = matches.map(renderCard).join("");
}

function renderCard(match) {
  return `
    <article class="result-card ${match.severity}">
      <div class="result-title">
        <strong>${escapeHtml(match.drug)}</strong>
        <span class="badge">CPIC ${escapeHtml(match.evidence)}</span>
      </div>
      <p class="recommendation">${escapeHtml(match.recommendation)}</p>
      <div class="fact-grid">
        <div class="fact">
          <span>Ген</span>
          <strong>${escapeHtml(match.gene)}</strong>
        </div>
        <div class="fact">
          <span>Найдено</span>
          <strong>${escapeHtml(match.foundBy)}</strong>
        </div>
        <div class="fact">
          <span>Фенотип</span>
          <strong>${escapeHtml(match.phenotype)}</strong>
        </div>
        <div class="fact">
          <span>Приоритет</span>
          <strong>${priorityLabel(match.severity)}</strong>
        </div>
      </div>
      <p class="source">Источник правила: ${escapeHtml(match.source)}</p>
    </article>
  `;
}

function priorityLabel(value) {
  return {
    high: "высокий",
    moderate: "средний",
    low: "низкий"
  }[value] || "не указан";
}

function plural(count, one, few, many) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

applyActiveProfile();
