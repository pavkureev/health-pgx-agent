const { rules, phenotypeMaps, snpHints, labAnalytes, medicationKnowledge, shotListMedications } = window.PGX_DATA;
const LAB_STORAGE_KEY = "pgx-agent-lab-records";
const PROFILE_STORAGE_KEY = "pgx-agent-profiles";
const ACTIVE_PROFILE_KEY = "pgx-agent-active-profile";
const PARSER_VERSION = "2026-07-20.1";
const DOCTOR_CONCLUSION_PARSER_VERSION = "2026-05-21.14";
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
const labMetricList = document.querySelector("#labMetricList");
const labMetricCounter = document.querySelector("#labMetricCounter");
const toggleLabMetrics = document.querySelector("#toggleLabMetrics");
const labChart = document.querySelector("#labChart");
const metricDescription = document.querySelector("#metricDescription");
const labDiagnostics = document.querySelector("#labDiagnostics");
const labDiagnosticsBody = document.querySelector("#labDiagnosticsBody");
const labDeleteDialog = document.querySelector("#labDeleteDialog");
const labDeleteTitle = document.querySelector("#labDeleteTitle");
const labDeleteText = document.querySelector("#labDeleteText");
const cancelLabDelete = document.querySelector("#cancelLabDelete");
const confirmLabDelete = document.querySelector("#confirmLabDelete");
const profileSelect = document.querySelector("#profileSelect");
const profileName = document.querySelector("#profileName");
const profileCounter = document.querySelector("#profileCounter");
const profileStatus = document.querySelector("#profileStatus");
const profileJump = document.querySelector(".profile-jump");
const profileJumpLabel = document.querySelector("#profileJumpLabel");
const loadSampleButton = document.querySelector("#loadSample");
const profilePanel = document.querySelector(".profile-panel");
const authPanel = document.querySelector(".auth-panel");
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
const geneticsSection = document.querySelector(".genetics-section");
const labsSection = document.querySelector(".labs-section");
const doctorSection = document.querySelector(".doctor-section");
const medicationsSection = document.querySelector(".medications-section");
const guestLanding = document.querySelector("#guestLanding");
const nowSection = document.querySelector("#nowSection");
const nowActions = document.querySelector("#nowActions");
const appSectionSummaries = typeof document.querySelectorAll === "function" ? [...document.querySelectorAll(".app-section > .app-section-summary")] : [];
const tabButtons = typeof document.querySelectorAll === "function" ? [...document.querySelectorAll(".tab-button")] : [];
const tabTargetButtons = typeof document.querySelectorAll === "function" ? [...document.querySelectorAll("[data-tab-target]")] : [];
const geneticsSectionMeta = document.querySelector("#geneticsSectionMeta");
const labsSectionMeta = document.querySelector("#labsSectionMeta");
const doctorSectionMeta = document.querySelector("#doctorSectionMeta");
const medicationsSectionMeta = document.querySelector("#medicationsSectionMeta");
const geneticFilterPanel = document.querySelector("#geneticFilterPanel");
const geneticInputDrawer = document.querySelector("#geneticInputDrawer");
const labInputDrawer = document.querySelector("#labInputDrawer");
const doctorInputDrawer = document.querySelector("#doctorInputDrawer");
const medicationInputDrawer = document.querySelector("#medicationInputDrawer");
const decisionPanel = document.querySelector(".decision-panel");
const decisionCounter = document.querySelector("#decisionCounter");
const qualityCounter = document.querySelector("#qualityCounter");
const clinicalCounter = document.querySelector("#clinicalCounter");
const pgxCounter = document.querySelector("#pgxCounter");
const integrationCounter = document.querySelector("#integrationCounter");
const qualityChecks = document.querySelector("#qualityChecks");
const clinicalChecks = document.querySelector("#clinicalChecks");
const pgxCoverage = document.querySelector("#pgxCoverage");
const integrationChecks = document.querySelector("#integrationChecks");
const medicationName = document.querySelector("#medicationName");
const medicationDose = document.querySelector("#medicationDose");
const medicationStart = document.querySelector("#medicationStart");
const medicationEnd = document.querySelector("#medicationEnd");
const medicationNote = document.querySelector("#medicationNote");
const medicationCounter = document.querySelector("#medicationCounter");
const medicationList = document.querySelector("#medicationList");
const medicationSummary = document.querySelector("#medicationSummary");
const medicationLookupStatus = document.querySelector("#medicationLookupStatus");
const medicationChecks = document.querySelector("#medicationChecks");
const doctorFile = document.querySelector("#doctorFile");
const doctorText = document.querySelector("#doctorText");
const doctorStatus = document.querySelector("#doctorStatus");
const doctorCounter = document.querySelector("#doctorCounter");
const doctorPanelTitle = document.querySelector("#doctorPanelTitle");
const doctorSummary = document.querySelector("#doctorSummary");
const doctorParsed = document.querySelector("#doctorParsed");
const doctorSignals = document.querySelector("#doctorSignals");
const doctorReviewActions = document.querySelector("#doctorReviewActions");
const doctorCorrectionPanel = document.querySelector("#doctorCorrectionPanel");
const doctorDiagnosisEdit = document.querySelector("#doctorDiagnosisEdit");
const doctorMedicationEdit = document.querySelector("#doctorMedicationEdit");
const addDoctorMedicationsButton = document.querySelector("#addDoctorMedications");
let currentUser = null;
let cloudReady = false;
let savingCloudProfile = false;
const pendingCloudProfileSaves = new Map();
let magicLinkSentEmail = "";
let geneticInputOpen = true;
let profiles = loadProfiles();
let activeProfileId = loadActiveProfileId();
ensureActiveProfile();
let labRecords = getActiveProfile().labRecords || [];
let pendingLabDelete = null;
let archivedMedicationVisibleCount = 10;
let medicationArchiveOpen = false;
let activeAppView = "now";
let activeInlineSection = "";

if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

loadSampleButton?.addEventListener("click", () => {
  patientData.value = sample;
  patientDataView.value = sample;
  drugSearch.value = "";
  fileStatus.className = "file-status";
  fileStatus.textContent = "Загружен встроенный пример.";
  geneticInputOpen = false;
  saveCurrentProfileData({ allowEmptyPatientData: true });
  analyze();
  renderGeneticInputState();
  navigateToTab("genetics");
});

document.querySelector("#createProfile").addEventListener("click", createProfile);
document.querySelector("#deleteProfile").addEventListener("click", deleteActiveProfile);
document.querySelector("#signIn").addEventListener("click", signIn);
document.querySelector("#signOut").addEventListener("click", signOut);
document.querySelector("#anotherEmail").addEventListener("click", resetMagicLinkForm);
document.querySelector("#saveDisplayName").addEventListener("click", saveDisplayName);
document.querySelector("#uploadOtherGenetics").addEventListener("click", showGeneticInputForm);
document.querySelector("#addMedication").addEventListener("click", addMedication);
document.querySelector("#lookupMedications").addEventListener("click", lookupMissingMedicationSubstances);
textModeToggle.addEventListener("change", renderGeneticInputState);
profileSelect.addEventListener("change", switchProfile);
patientData.addEventListener("input", () => {
  patientDataView.value = patientData.value;
  saveCurrentProfileData({ allowEmptyPatientData: true });
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
document.querySelector("#clearLabs").addEventListener("click", requestClearLabHistory);
cancelLabDelete?.addEventListener("click", closeLabDeleteDialog);
confirmLabDelete?.addEventListener("click", confirmPendingLabDelete);
document.querySelector("#loadDoctorConclusion").addEventListener("click", loadDoctorConclusionFile);
document.querySelector("#parseDoctorText").addEventListener("click", parseDoctorTextInput);
document.querySelector("#addDoctorMedications").addEventListener("click", addDoctorMedicationsToProfile);
document.querySelector("#editDoctorConclusion").addEventListener("click", showDoctorCorrectionForm);
document.querySelector("#applyDoctorCorrections").addEventListener("click", applyDoctorCorrections);
document.querySelector("#deleteDoctorConclusion").addEventListener("click", deleteDoctorConclusion);
document.querySelector("#clearDoctorConclusion").addEventListener("click", clearDoctorConclusion);
document.querySelector("#clear").addEventListener("click", () => {
  patientData.value = "";
  patientDataView.value = "";
  drugSearch.value = "";
  vcfFile.value = "";
  fileStatus.className = "file-status";
  fileStatus.textContent = "Файл читается локально в браузере и никуда не отправляется.";
  geneticInputOpen = true;
  saveCurrentProfileData({ allowEmptyPatientData: true });
  render([], {});
  renderGeneticInputState();
});
drugSearch.addEventListener("input", analyze);
labMetric.addEventListener("change", () => drawLabChart(labMetric.value));
labMetricList.addEventListener("change", (event) => {
  if (!event.target.matches("[data-lab-metric]")) return;
  labMetric.value = event.target.value;
  drawLabChart(event.target.value);
});
[medicationStart, medicationEnd].forEach((input) => {
  input?.addEventListener("input", () => updateDateInputTone(input));
  updateDateInputTone(input);
});
toggleLabMetrics.addEventListener("click", toggleLabMetricList);
bindFixedAppSections();
bindAppNavigation();
applyAppView(activeAppView);
initSupabaseAuth();

function bindFixedAppSections() {
  appSectionSummaries.forEach((summary) => {
    summary.addEventListener("click", (event) => event.preventDefault());
    summary.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") event.preventDefault();
    });
  });
}

function bindAppNavigation() {
  tabTargetButtons.forEach((button) => {
    button.addEventListener("click", () => navigateToTab(button.dataset.tabTarget));
  });
}

function navigateToTab(target) {
  const targetNode = tabTargetNode(target);
  if (!targetNode) return;

  activeInlineSection = target === "doctor" ? "doctor" : "";
  applyAppView(normalizeAppViewTarget(target));
  if (targetNode.matches?.("details")) targetNode.open = true;
  targetNode.scrollIntoView?.({ behavior: "smooth", block: "start" });
}

function tabTargetNode(target) {
  return {
    now: currentUser ? nowSection : guestLanding,
    labs: labsSection,
    genetics: geneticsSection,
    medications: medicationsSection,
    profile: authPanel || profilePanel,
    doctor: doctorSection
  }[target] || null;
}

function normalizeAppViewTarget(target) {
  if (target === "doctor") return "now";
  return ["now", "labs", "genetics", "medications", "profile"].includes(target) ? target : "now";
}

function applyAppView(target = "now") {
  activeAppView = normalizeAppViewTarget(target);
  const signedInNowView = activeInlineSection === "doctor" ? [nowSection, doctorSection] : [nowSection];
  const guestNowView = activeInlineSection === "doctor" ? [guestLanding, doctorSection] : [guestLanding, authPanel];
  const nowView = currentUser ? signedInNowView : guestNowView.filter(Boolean);
  const viewGroups = {
    now: nowView,
    labs: [labsSection],
    genetics: [geneticsSection],
    medications: [medicationsSection],
    profile: [authPanel, profilePanel, doctorSection]
  };
  const viewNodes = [
    guestLanding,
    nowSection,
    authPanel,
    profilePanel,
    doctorSection,
    labsSection,
    geneticsSection,
    medicationsSection
  ].filter(Boolean);

  viewNodes.forEach((node) => {
    const isVisible = viewGroups[activeAppView].includes(node);
    if (node.classList?.toggle) {
      node.classList.toggle("view-hidden", !isVisible);
    } else {
      node.hidden = !isVisible;
    }
  });

  tabButtons.forEach((button) => {
    button.classList?.toggle("is-active", button.dataset.tabTarget === activeAppView);
  });
  profileJump?.classList?.toggle("is-active", activeAppView === "profile");
}

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
    updateSampleButtonVisibility();
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
    applyAppView(activeAppView);
    return;
  }

  if (currentUser) {
    updateSampleButtonVisibility();
    authTitle.textContent = "Аккаунт";
    authMode.textContent = "Supabase";
    loginBox.hidden = true;
    magicLinkBox.hidden = true;
    anotherEmailButton.hidden = true;
    signedInBox.hidden = false;
    signOutButton.hidden = true;
    authStatus.textContent = "Аккаунт подключен. Профили и распознанные данные сохраняются в Supabase.";
    renderWelcome();
    applyAppView(activeAppView);
    return;
  }

  updateSampleButtonVisibility();
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
  applyAppView(activeAppView);
}

function updateSampleButtonVisibility() {
  if (loadSampleButton) loadSampleButton.hidden = Boolean(currentUser);
}

function updateDateInputTone(input) {
  input?.classList?.toggle("has-value", Boolean(input.value));
}

function renderWelcome() {
  welcomeBox.hidden = true;
  welcomeBox.innerHTML = "";

  if (!currentUser) {
    onboardingBox.hidden = true;
    updateProfileJumpLabel("");
    return;
  }

  const profile = getActiveProfile();
  const name = getDisplayName(profile);
  const needsName = !name;

  onboardingBox.hidden = !needsName;
  updateProfileJumpLabel(name);

  if (needsName) {
    displayName.value = "";
    signedInBox.innerHTML = `
      <div>
        <strong>Вы вошли в аккаунт с email ${escapeHtml(currentUser.email || "")}</strong>
        <p>Укажите имя, чтобы видеть персональное приветствие.</p>
      </div>
      <button id="signOutInline" class="secondary-button" type="button">Выйти</button>
    `;
    signedInBox.querySelector("#signOutInline").addEventListener("click", signOut);
    authStatus.textContent = "Представьтесь, чтобы мы могли подписывать ваш профиль и приветствовать вас при входе.";
    return;
  }

  signedInBox.innerHTML = `
    <div>
      <strong>Рады видеть вас снова, ${escapeHtml(name)}</strong>
      <p>Вы вошли как ${escapeHtml(currentUser.email || "")}.</p>
    </div>
    <button id="signOutInline" class="secondary-button" type="button">Выйти</button>
  `;
  signedInBox.querySelector("#signOutInline").addEventListener("click", signOut);
}

function updateProfileJumpLabel(name) {
  const label = name || "Login";
  if (profileJumpLabel) profileJumpLabel.textContent = label;
  if (profileJump) {
    profileJump.title = name ? `Профиль: ${label}` : "Login";
    if (typeof profileJump.setAttribute === "function") {
      profileJump.setAttribute("aria-label", profileJump.title);
    }
  }
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
      ? "Лимит отправки писем Supabase исчерпан. Для стабильного входа нужно подключить Custom SMTP в Supabase Auth."
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
    .select("id, document_id, analyte_key, analyte_label, observed_on, value, unit, reference_low, reference_high, source_line, source_documents(file_name, status, created_at, updated_at)")
    .eq("profile_id", profileId)
    .order("observed_on", { ascending: true });

  if (error) {
    profileStatus.textContent = `Не удалось загрузить анализы из Supabase: ${error.message}`;
    return;
  }

  profile.labRecords = observationsToLabRecords(data || []);

  const { data: geneticFindings, error: geneticError } = await supabaseClient
    .from("genetic_findings")
    .select("gene, rsid, genotype, diplotype, phenotype, evidence_source, raw_line, created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: true });

  if (geneticError) {
    profileStatus.textContent = `Не удалось загрузить генетику из Supabase: ${geneticError.message}`;
    return;
  }

  if (!profile.patientData?.trim()) {
    if (geneticFindings?.length) {
      profile.patientData = geneticFindingsToPatientData(geneticFindings);
    } else {
      const { data: geneticDocuments, error: documentError } = await supabaseClient
        .from("source_documents")
        .select("kind, file_name, extracted_text, created_at")
        .eq("profile_id", profileId)
        .not("extracted_text", "is", null)
        .order("created_at", { ascending: true });

      if (documentError) {
        profileStatus.textContent = `Не удалось загрузить генетические отчеты из Supabase: ${documentError.message}`;
        return;
      }

      profile.patientData = geneticDocumentsToPatientData(geneticDocuments || []);
    }
  }
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
        medications: localProfile?.metadata?.medications || [],
        doctorConclusion: localProfile?.metadata?.doctorConclusion || null,
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
      metadata: {},
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
    profiles = [{ id: createId(), name: "Профиль 1", metadata: {}, patientData: "", labRecords: [] }];
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

function saveCurrentProfileData(options = {}) {
  const profile = getActiveProfile();
  const nextPatientData = patientData.value || "";
  if (nextPatientData.trim() || options.allowEmptyPatientData || !profile.patientData?.trim()) {
    profile.patientData = nextPatientData;
  }
  profile.labRecords = labRecords;
  profile.updatedAt = new Date().toISOString();
  saveProfiles();
  queueCloudProfileMetadataSave(profile);
}

function queueCloudProfileMetadataSave(profile = getActiveProfile()) {
  if (!cloudReady || !profile?.id) return;
  pendingCloudProfileSaves.set(profile.id, {
    id: profile.id,
    name: profile.name,
    metadata: { ...(profile.metadata || {}) },
    patientData: profile.patientData || ""
  });
  void saveCloudProfileMetadata();
}

async function saveCloudProfileMetadata() {
  if (!cloudReady || savingCloudProfile) return;

  savingCloudProfile = true;
  try {
    while (pendingCloudProfileSaves.size) {
      const [profileId, snapshot] = pendingCloudProfileSaves.entries().next().value;
      pendingCloudProfileSaves.delete(profileId);
      const { error } = await supabaseClient
        .from("patient_profiles")
        .update({
          display_name: snapshot.name,
          metadata: { ...(snapshot.metadata || {}), patientData: snapshot.patientData || "" }
        })
        .eq("id", profileId);

      if (error) {
        profileStatus.textContent = `Supabase: не удалось сохранить профиль (${error.message}).`;
      }
    }
  } finally {
    savingCloudProfile = false;
    if (pendingCloudProfileSaves.size) void saveCloudProfileMetadata();
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
  refreshDoctorConclusionParse(profile);
  geneticInputOpen = !patientData.value.trim();
  labRecords = profile.labRecords || [];
  vcfFile.value = "";
  labFiles.value = "";
  labText.value = "";
  doctorFile.value = "";
  doctorText.value = currentDoctorConclusion().text || "";
  drugSearch.value = "";
  renderProfiles();
  analyze();
  renderLabHistory();
  renderDoctorConclusion();
  renderLabDiagnostics([]);
  renderGeneticInputState();
  renderHealthBlocks();
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

  const profile = { id: createId(), name, metadata: {}, patientData: "", labRecords: [], createdAt: new Date().toISOString() };
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

function createDoctorConclusionId() {
  return `doctor-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
      fileStatus.textContent = "В этом VCF не нашлось поддерживаемых маркеров. Можно вставить фенотипы вручную ниже.";
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
    saveCurrentProfileData({ allowEmptyPatientData: true });
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

  const resolution = added.length ? await addLabRecordsWithConflictResolution(added) : { addedCount: 0 };

  labStatus.className = failed.length && !added.length ? "file-status error" : "file-status";
  labStatus.textContent = [
    formatLabUploadStatus(resolution, "отчет"),
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

  const resolutionResult = addLabRecordsWithConflictResolution([record]);
  const resolution = resolutionResult instanceof Promise ? await resolutionResult : resolutionResult;
  labStatus.className = "file-status";
  labStatus.textContent = formatLabUploadStatus(resolution, "показатель", record.values.length);
}

function addLabRecordsWithConflictResolution(incomingRecords) {
  const conflicts = findLabValueConflicts(labRecords, incomingRecords);
  const action = conflicts.length ? requestLabConflictResolution(conflicts) : "keep";

  if (action === "cancel") {
    return { action, addedCount: 0, conflictCount: conflicts.length };
  }

  const nextLabRecords = action === "replace"
    ? dedupeLabRecords([...removeConflictingLabValues(labRecords, conflicts), ...incomingRecords])
    : dedupeLabRecords([...labRecords, ...incomingRecords]);
  const result = {
    action,
    addedCount: incomingRecords.length,
    conflictCount: conflicts.length
  };

  const commit = () => {
    labRecords = nextLabRecords;
    saveCurrentProfileData();
    renderLabHistory();
    return result;
  };

  if (!cloudReady) return commit();

  return (async () => {
    if (action === "replace") await deleteCloudLabConflictingObservations(conflicts);
    await saveCloudLabRecords(incomingRecords);
    return commit();
  })();
}

function findLabValueConflicts(existingRecords, incomingRecords) {
  const existingByDateAndKey = new Map();

  for (const record of existingRecords) {
    for (const value of record.values || []) {
      const key = labConflictKey(record.date, value.key);
      if (!existingByDateAndKey.has(key)) existingByDateAndKey.set(key, []);
      existingByDateAndKey.get(key).push({ record, value });
    }
  }

  const conflicts = [];
  const seen = new Set();

  for (const record of incomingRecords) {
    for (const incoming of record.values || []) {
      const key = labConflictKey(record.date, incoming.key);
      const existingValues = existingByDateAndKey.get(key) || [];
      const differentValues = existingValues.filter((item) => !sameLabValue(item.value, incoming));
      if (!differentValues.length || seen.has(key)) continue;

      seen.add(key);
      conflicts.push({
        date: record.date,
        key: incoming.key,
        label: incoming.label,
        incoming,
        existing: differentValues.map((item) => item.value)
      });
    }
  }

  return conflicts;
}

function requestLabConflictResolution(conflicts) {
  const examples = conflicts.slice(0, 5).map((conflict) => {
    const oldValues = conflict.existing
      .map((value) => `${formatNumber(value.value)} ${value.unit || ""}`.trim())
      .join(", ");
    const newValue = `${formatNumber(conflict.incoming.value)} ${conflict.incoming.unit || ""}`.trim();
    return `${formatDate(conflict.date)} · ${conflict.label}: было ${oldValues}, новое ${newValue}`;
  }).join("\n");
  const extra = conflicts.length > 5 ? `\n...и ещё ${conflicts.length - 5}` : "";
  const message = [
    "В новых данных есть показатели, которые уже загружены на ту же дату, но с другим значением.",
    "",
    examples + extra,
    "",
    "Что сделать?",
    "1 — отменить загрузку новых данных",
    "2 — заменить старые значения новыми",
    "3 — оставить оба значения"
  ].join("\n");

  const answer = typeof window.prompt === "function" ? window.prompt(message, "3") : "3";
  const normalized = normalizeText(String(answer || ""));
  if (!answer || normalized === "1" || normalized.includes("отмен")) return "cancel";
  if (normalized === "2" || normalized.includes("замен")) return "replace";
  return "keep";
}

function removeConflictingLabValues(records, conflicts) {
  const conflictKeys = new Set(conflicts.map((conflict) => labConflictKey(conflict.date, conflict.key)));

  return records
    .map((record) => {
      const values = (record.values || []).filter((value) => !conflictKeys.has(labConflictKey(record.date, value.key)));
      return { ...record, values, id: labRecordId(record.date, record.sourceName, values) };
    })
    .filter((record) => record.values.length);
}

async function deleteCloudLabConflictingObservations(conflicts) {
  if (!cloudReady || !conflicts.length) return;
  const profile = getActiveProfile();
  const keysByDate = conflicts.reduce((acc, conflict) => {
    if (!acc.has(conflict.date)) acc.set(conflict.date, new Set());
    acc.get(conflict.date).add(conflict.key);
    return acc;
  }, new Map());

  for (const [date, keys] of keysByDate.entries()) {
    const { error } = await supabaseClient
      .from("lab_observations")
      .delete()
      .eq("profile_id", profile.id)
      .eq("observed_on", date)
      .in("analyte_key", [...keys]);

    if (error) {
      labStatus.textContent = `Supabase: старые значения не удалены (${error.message}).`;
      throw error;
    }
  }
}

function formatLabUploadStatus(resolution, itemType, manualValueCount = null) {
  if (resolution?.action === "cancel") {
    return `Загрузка отменена: найдено ${resolution.conflictCount} ${plural(resolution.conflictCount, "конфликт", "конфликта", "конфликтов")} по дате и показателю.`;
  }

  const addedCount = itemType === "показатель" && manualValueCount !== null ? manualValueCount : resolution?.addedCount || 0;
  if (!addedCount) return "";

  const addedText = `Добавлено ${addedCount} ${plural(addedCount, itemType, itemType === "отчет" ? "отчета" : "показателя", itemType === "отчет" ? "отчетов" : "показателей")}.`;
  if (!resolution?.conflictCount) return addedText;
  if (resolution.action === "replace") {
    return `${addedText} Заменено ${resolution.conflictCount} старых ${plural(resolution.conflictCount, "значение", "значения", "значений")}.`;
  }
  return `${addedText} Конфликтующие значения оставлены рядом: ${resolution.conflictCount}.`;
}

function labConflictKey(date, key) {
  return `${date}|${key}`;
}

function sameLabValue(left, right) {
  return Math.abs(Number(left.value) - Number(right.value)) < 0.000001;
}

async function loadDoctorConclusionFile() {
  const file = doctorFile.files?.[0];
  if (!file) {
    doctorStatus.className = "file-status error";
    doctorStatus.textContent = "Сначала выберите PDF или текстовый файл.";
    return;
  }

  try {
    const text = await extractTextFromFile(file);
    doctorText.value = text;
    const parsed = parseDoctorConclusion(text);
    saveDoctorConclusion(text, parsed, { reviewStatus: "pending", newId: true });
    reconcileDraftDoctorMedications(parsed, { doctorConclusionId: currentDoctorConclusion().id });
    doctorStatus.className = "file-status";
    doctorStatus.textContent = `Данные перенесены из файла: ${file.name}. Сверьте черновик и подтвердите перед добавлением лекарств в профиль.`;
    renderDoctorConclusion();
  } catch (error) {
    doctorStatus.className = "file-status error";
    doctorStatus.textContent = `Не удалось прочитать файл: ${error.message || "unknown error"}.`;
  }
}

function parseDoctorTextInput() {
  if (!doctorText.value.trim()) {
    doctorStatus.className = "file-status error";
    doctorStatus.textContent = "Вставьте текст заключения.";
    return;
  }

  const parsed = parseDoctorConclusion(doctorText.value);
  const previous = currentDoctorConclusion();
  saveDoctorConclusion(doctorText.value, parsed, {
    reviewStatus: "pending",
    newId: normalizeText(previous.text || "") !== normalizeText(doctorText.value)
  });
  reconcileDraftDoctorMedications(parsed, { doctorConclusionId: currentDoctorConclusion().id });
  doctorStatus.className = "file-status";
  doctorStatus.textContent = "Данные перенесены в черновик. Сверьте распознавание и подтвердите перед добавлением лекарств в профиль.";
  renderDoctorConclusion();
}

function clearDoctorConclusion() {
  doctorFile.value = "";
  doctorText.value = "";
  saveDoctorConclusion("", { diagnoses: [], medications: [] }, { reviewStatus: "" });
  doctorStatus.className = "file-status";
  doctorStatus.textContent = "Форма заключения очищена.";
  renderDoctorConclusion();
}

function deleteDoctorConclusion() {
  doctorFile.value = "";
  doctorText.value = "";
  const profile = getActiveProfile();
  const metadata = { ...(profile.metadata || {}) };
  delete metadata.doctorConclusion;
  profile.metadata = metadata;
  saveCurrentProfileData();
  doctorStatus.className = "file-status";
  doctorStatus.textContent = "Заключение удалено. Подтвержденные лекарства в лекарственном профиле сохранены.";
  renderDoctorConclusion();
  renderHealthBlocks();
}

function currentDoctorConclusion() {
  return getActiveProfile()?.metadata?.doctorConclusion || { id: "", text: "", parsed: { diagnoses: [], medications: [] }, reviewStatus: "" };
}

function refreshDoctorConclusionParse(profile = getActiveProfile()) {
  const conclusion = profile?.metadata?.doctorConclusion;
  if (!conclusion?.text?.trim() || conclusion.parserVersion === DOCTOR_CONCLUSION_PARSER_VERSION) return;
  profile.metadata = {
    ...(profile.metadata || {}),
    doctorConclusion: {
      ...conclusion,
      id: conclusion.id || createDoctorConclusionId(),
      parsed: parseDoctorConclusion(conclusion.text),
      reviewStatus: "pending",
      correctionOpen: false,
      parserVersion: DOCTOR_CONCLUSION_PARSER_VERSION,
      updatedAt: new Date().toISOString()
    }
  };
  reconcileDraftDoctorMedications(profile.metadata.doctorConclusion.parsed, { doctorConclusionId: profile.metadata.doctorConclusion.id });
  saveCurrentProfileData();
}

function saveDoctorConclusion(text, parsed, options = {}) {
  const profile = getActiveProfile();
  const previous = currentDoctorConclusion();
  const hasText = Boolean(text?.trim());
  const id = hasText
    ? options.id || (options.newId ? createDoctorConclusionId() : previous.id || createDoctorConclusionId())
    : "";
  profile.metadata = {
    ...(profile.metadata || {}),
    doctorConclusion: {
      id,
      text,
      parsed,
      reviewStatus: options.reviewStatus ?? previous.reviewStatus ?? "pending",
      correctionOpen: options.correctionOpen ?? previous.correctionOpen ?? false,
      confirmedDiagnosisKeys: options.newId ? [] : options.confirmedDiagnosisKeys ?? previous.confirmedDiagnosisKeys ?? [],
      confirmedMedicationKeys: options.newId ? [] : options.confirmedMedicationKeys ?? previous.confirmedMedicationKeys ?? [],
      parserVersion: DOCTOR_CONCLUSION_PARSER_VERSION,
      updatedAt: new Date().toISOString()
    }
  };
  saveCurrentProfileData();
}

function parseDoctorConclusion(text) {
  return {
    diagnoses: extractDoctorDiagnoses(text),
    medications: extractDoctorMedications(text)
  };
}

function extractDoctorDiagnoses(text) {
  const diagnosisText = doctorDiagnosisCandidateText(text);
  const normalized = normalizeText(diagnosisText);
  const diagnosisRules = [
    { key: "hypertension", label: "Артериальная гипертензия", patterns: ["артериальная гипертензия", "гипертоническая болезнь", "гипертензия", "i10"] },
    { key: "dyslipidemia", label: "Дислипидемия / высокий сердечно-сосудистый риск", patterns: ["дислипидемия", "гиперхолестеринемия", "атеросклероз", "ишемическая болезнь", "ибс", "e78", "i25"] },
    { key: "diabetes", label: "Нарушение углеводного обмена / диабет", patterns: ["сахарный диабет", "преддиабет", "нарушение толерантности к глюкозе", "e11", "e10"] },
    { key: "ckd", label: "Снижение функции почек / ХБП", patterns: ["хбп", "хроническая болезнь почек", "снижение скф", "почечная недостаточность", "n18"] },
    { key: "depression", label: "Депрессия / тревожное расстройство", patterns: ["депрессия", "тревожное расстройство", "паническое расстройство", "f32", "f33", "f41"] },
    { key: "gerd", label: "Гастроэзофагеальный рефлюкс / ГЭРБ", patterns: ["гэрб", "гастроэзофагеальная", "гастроэзофагеальный", "гастроэзофагеального", "рефлюкс", "рефлекс", "k21"] },
    { key: "erosive_esophagitis", label: "Эрозивный рефлюкс-эзофагит", patterns: ["эрозивный рефлюкс-эзофагит", "рефлюкс-эзофагит", "эзофагит", "la классификации", "ст а по la"] },
    { key: "hiatal_hernia", label: "Аксиальная хиатальная грыжа", patterns: ["хиатальная грыжа", "хиатальной грыжи", "аксиальная хиатальная", "аксиальной хиатальной"] },
    { key: "gastritis_bulbitis", label: "Поверхностный очаговый гастрит / бульбит", patterns: ["поверхностный очаговый гастрит", "очаговый гастрит", "гастрит", "бульбит", "k29"] },
    { key: "gastroduodenitis_erosive_ulcer", label: "Гастродуоденит с эрозиями и язвенным дефектом", patterns: ["гастродуоденит", "множественных эрозий", "язвенного дефекта", "препилорического отдела желудка"] },
    { key: "hp_positive", label: "Helicobacter pylori положительный", patterns: ["экспресс-тест на hp положительный", "hp положительный", "helicobacter pylori", "h. pylori", "hp +", "положительный (+)"] },
    { key: "oncology", label: "Онкологический диагноз / химиотерапия", patterns: ["злокачественное", "рак", "карцинома", "химиотерапия", "c18", "c50", "c61"] }
  ];

  return diagnosisRules
    .filter((rule) => rule.patterns.some((pattern) => normalized.includes(normalizeText(pattern))))
    .map((rule) => ({
      key: rule.key,
      label: rule.label,
      attention: diagnosisAttention(rule.key),
      sourceLine: findSourceLine(diagnosisText, rule.patterns) || "Найдено по тексту заключения"
    }))
    .sort((a, b) => diagnosisAttentionRank(b) - diagnosisAttentionRank(a));
}

function diagnosisAttention(key) {
  const attention = {
    hp_positive: {
      level: "high",
      label: "Требует скорейшего лечения",
      note: "Инфекция HP обычно требует согласованной схемы эрадикации и контроля результата."
    },
    erosive_esophagitis: {
      level: "high",
      label: "Требует лечения",
      note: "Эрозивное воспаление пищевода лучше не оставлять без терапии и контроля симптомов."
    },
    oncology: {
      level: "high",
      label: "Требует срочного маршрута",
      note: "Онкологический диагноз требует очного ведения профильным специалистом."
    },
    ckd: {
      level: "high",
      label: "Требует контроля",
      note: "Функция почек влияет на безопасность и дозирование многих препаратов."
    },
    gerd: {
      level: "moderate",
      label: "Требует наблюдения",
      note: "Обычно оценивают симптомы, ответ на терапию и факторы, усиливающие рефлюкс."
    },
    gastritis_bulbitis: {
      level: "moderate",
      label: "Требует наблюдения",
      note: "Важно сопоставить с HP-статусом, симптомами и назначенной терапией."
    },
    gastroduodenitis_erosive_ulcer: {
      level: "high",
      label: "Требует лечения",
      note: "Эрозии и язвенный дефект требуют согласованной терапии и контроля заживления."
    },
    hypertension: {
      level: "moderate",
      label: "Требует наблюдения",
      note: "Нужны контроль давления, факторов риска и регулярность терапии."
    },
    dyslipidemia: {
      level: "moderate",
      label: "Требует наблюдения",
      note: "Оценивают сердечно-сосудистый риск, ЛПНП и переносимость терапии."
    },
    diabetes: {
      level: "moderate",
      label: "Требует наблюдения",
      note: "Полезно отслеживать HbA1c, вес, почки и сердечно-сосудистые риски."
    },
    depression: {
      level: "moderate",
      label: "Требует наблюдения",
      note: "Важны динамика симптомов, переносимость и безопасность терапии."
    },
    hiatal_hernia: {
      level: "feature",
      label: "Физиологическая особенность",
      note: "Анатомический фактор может поддерживать рефлюкс, но сам по себе не повод для паники."
    }
  };
  return attention[key] || {
    level: "moderate",
    label: "Требует наблюдения",
    note: "Нужна клиническая интерпретация вместе с врачом."
  };
}

function doctorDiagnosisCandidateText(text) {
  const lines = cleanupExtractedText(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const collected = [];
  let inDiagnosisBlock = false;

  for (const line of lines) {
    if (/(диагноз|заключение|клинический диагноз|основной диагноз)/i.test(line)) {
      inDiagnosisBlock = true;
      const rest = line.replace(/^.*?(?:диагноз|заключение|клинический диагноз|основной диагноз)\s*[:\-]?\s*/i, "").trim();
      if (rest) collected.push(rest);
      continue;
    }
    if (inDiagnosisBlock && /(рекоменд|назнач|лечение|терапия|препарат|анамнез|семейн|наследствен|жалоб|осмотр|объективн|план|обследован|контроль)/i.test(line)) {
      inDiagnosisBlock = false;
    }
    if (!inDiagnosisBlock) continue;
    if (/(специализац|врач|пациент|прием|консультац|анамнез|семейн|наследствен|дед|бабуш|мать|отец|жалоб|осмотр|рекоменд|назнач|лечение|терапия|препарат)/i.test(line)) continue;
    collected.push(line);
  }

  if (collected.length) return collected.join("\n");

  const fallback = lines.filter((line) => !/(специализац|врач|пациент|прием|консультац|анамнез|семейн|наследствен|дед|бабуш|мать|отец|жалоб|осмотр|рекоменд|назнач|лечение|терапия|препарат)/i.test(line));

  return fallback.join("\n");
}

function extractDoctorMedications(text) {
  const lines = mergeDoctorMedicationContinuations(doctorMedicationCandidateLines(text));
  const found = [];
  const seen = new Set();
  const segments = doctorMedicationSegments(lines);

  for (const segment of segments) {
    const match = findMedicationForSegment(segment);
    if (!match || seen.has(match.medication.substance)) continue;
    const { medication, alias } = match;
    seen.add(medication.substance);
    const sourceLine = cleanDoctorMedicationLine(segment);
    found.push({
      id: `doctor-med-${medication.substance}`,
      name: medicationNameFromSegment(sourceLine, match.alias, medication.label),
      substance: medication.substance,
      substanceLabel: medication.label,
      group: medication.group,
      dose: extractMedicationDose(sourceLine, match.alias),
      note: "Из заключения врача",
      sourceLine
    });
  }

  return found;
}

function doctorMedicationCandidateLines(text) {
  const lines = cleanupExtractedText(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const candidates = [];
  const hasPrescriptionBlock = lines.some((line) => isPrescriptionBlockHeader(line));
  let inPrescriptionBlock = false;

  for (const line of lines) {
    const normalized = normalizeText(line);
    if (isPrescriptionBlockHeader(line)) {
      inPrescriptionBlock = true;
      const rest = line.replace(/^\s*(?:(?:общие\s+)?рекомендации|рекомендовано|назначено|назначения|медикаментозная\s+терапия|лечение|терапия|схема\s+лечения)\s*[:\-]?\s*/i, "").trim();
      if (rest) candidates.push(...splitDoctorMedicationParagraph(rest));
      continue;
    }
    if (inPrescriptionBlock && /(диагноз|жалоб|анамнез|объективн|осмотр|обследован|контроль|повторн|повторная\s+явка|заключение|анализ|узи|экг|консультац|врач\b|подпис|выдача\s+элн)/i.test(line)) {
      inPrescriptionBlock = false;
    }
    if (/(аллерг|не переносит|ранее принимал|принимал|принимает|принимать\s+не\s+начинал|не\s+начинал|отменен|отменить|анамнез|постоянной\s+основе|со слов)/i.test(line)) {
      continue;
    }
    if (hasPrescriptionBlock && !inPrescriptionBlock) {
      continue;
    }
    if (line.length > 180) {
      const chunks = splitDoctorMedicationParagraph(line);
      if (chunks.length) candidates.push(...chunks);
      continue;
    }
    if (inPrescriptionBlock || /^\s*(?:\d+[\).:-]|[-•*])\s*/.test(line) || /(мг|мкг|таб|кап|раз в день|утром|вечером|после еды|до еды)/i.test(line)) {
      candidates.push(line);
      continue;
    }
    if (medicationKnowledge.some((medication) => findAliasMatch(normalized, medication.aliases.filter((alias) => normalizeText(alias).length >= 5)))) {
      candidates.push(line);
    }
  }

  return [...new Set(candidates)];
}

function isPrescriptionBlockHeader(line) {
  return /^\s*(?:(?:общие\s+)?рекомендации|рекомендовано|назначено|назначения|медикаментозная\s+терапия|лечение|терапия|схема\s+лечения)\s*[:\-]/i.test(line);
}

function mergeDoctorMedicationContinuations(lines) {
  const merged = [];
  let current = "";

  for (const line of lines) {
    if (lineHasMedicationAlias(line)) {
      if (current) merged.push(current.trim());
      current = line;
      continue;
    }
    if (current && /(\d|раз\/дн|р\/д|внутрь|per os|завтрака|обеда|ужина|длительность|пак|таб|кап)/i.test(line)) {
      current = `${current} ${line}`;
      continue;
    }
    if (current) {
      merged.push(current.trim());
      current = "";
    }
  }

  if (current) merged.push(current.trim());
  return merged.length ? merged : lines;
}

function lineHasMedicationAlias(line) {
  const normalized = normalizeText(line || "");
  return medicationKnowledge.some((medication) => findAliasMatch(
    normalized,
    medication.aliases.filter((alias) => normalizeText(alias).length >= 4)
  ));
}

function splitDoctorMedicationParagraph(text) {
  const normalizedParagraph = normalizeText(text || "");
  const aliases = medicationKnowledge
    .flatMap((medication) => medication.aliases.map((alias) => ({ medication, alias })))
    .filter(({ alias }) => normalizeText(alias).length >= 4)
    .sort((a, b) => normalizeText(b.alias).length - normalizeText(a.alias).length);
  const hits = uniqueMedicationHits(aliases
    .map(({ medication, alias }) => ({ medication, alias, index: findAliasIndex(normalizedParagraph, normalizeText(alias)) }))
    .filter((hit) => hit.index >= 0)
    .sort((a, b) => a.index - b.index));

  if (!hits.length) return [];
  if (hits.length === 1) return [text.trim()];

  return hits.map((hit, index) => {
    const start = hit.index;
    const end = hits[index + 1]?.index ?? text.length;
    return text.slice(start, end).replace(/[;,]\s*$/g, "").trim();
  }).filter(Boolean);
}

function doctorMedicationSegments(lines) {
  const medicationAliases = medicationKnowledge
    .flatMap((medication) => medication.aliases.map((alias) => ({ medication, alias })))
    .filter(({ alias }) => normalizeText(alias).length >= 4)
    .sort((a, b) => normalizeText(b.alias).length - normalizeText(a.alias).length);
  const segments = [];

  for (const line of lines) {
    const cleaned = cleanDoctorMedicationLine(line);
    const normalizedLine = normalizeText(cleaned);
    const hits = uniqueMedicationHits(medicationAliases
      .map(({ medication, alias }) => ({ medication, alias, index: findAliasIndex(normalizedLine, normalizeText(alias)) }))
      .filter((hit) => hit.index >= 0)
      .sort((a, b) => a.index - b.index));

    if (hits.length <= 1) {
      segments.push(cleaned);
      continue;
    }

    for (let index = 0; index < hits.length; index += 1) {
      const start = hits[index].index;
      const end = hits[index + 1]?.index ?? normalizedLine.length;
      const segment = cleaned.slice(start, end).replace(/[;,]\s*$/g, "").trim();
      if (segment) segments.push(segment);
    }
  }

  return [...new Set(segments)];
}

function uniqueMedicationHits(hits) {
  const byMedication = new Map();

  for (const hit of hits) {
    const previous = byMedication.get(hit.medication.substance);
    if (!previous || hit.index < previous.index || (hit.index === previous.index && normalizeText(hit.alias).length > normalizeText(previous.alias).length)) {
      byMedication.set(hit.medication.substance, hit);
    }
  }

  return [...byMedication.values()].sort((a, b) => a.index - b.index);
}

function findMedicationForSegment(segment) {
  const normalizedLine = normalizeText(segment);
  const matches = medicationKnowledge.map((medication) => {
    const alias = findAliasMatch(normalizedLine, medication.aliases
      .filter((item) => normalizeText(item).length >= 4)
      .sort((a, b) => normalizeText(b).length - normalizeText(a).length));
    return alias ? { medication, alias, length: normalizeText(alias).length } : null;
  }).filter(Boolean);

  return matches.sort((a, b) => b.length - a.length)[0] || null;
}

function findAliasMatch(normalizedLine, aliases) {
  return aliases.find((alias) => findAliasIndex(normalizedLine, normalizeText(alias)) >= 0) || "";
}

function findAliasIndex(normalizedLine, normalizedAlias) {
  const index = normalizedLine.indexOf(normalizedAlias);
  if (index < 0) return -1;
  const before = normalizedLine[index - 1] || "";
  const after = normalizedLine[index + normalizedAlias.length] || "";
  const boundary = /[a-zа-я0-9]/i;
  if (boundary.test(before) || boundary.test(after)) {
    const nextIndex = normalizedLine.indexOf(normalizedAlias, index + 1);
    return nextIndex >= 0 ? findAliasIndex(normalizedLine.slice(nextIndex), normalizedAlias) + nextIndex : -1;
  }
  return index;
}

function cleanDoctorMedicationLine(line) {
  return line
    .replace(/^\s*(?:\d+[\).:-]|[-•*])\s*/, "")
    .replace(/^(?:препарат|назначено|рекомендовано|лечение|терапия)\s*[:\-]\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function medicationNameFromSegment(segment, alias, fallback) {
  const match = segment.match(new RegExp(escapeRegExp(alias), "i"));
  return match?.[0]?.trim() || fallback;
}

function extractMedicationDose(line, alias) {
  const cleaned = cleanDoctorMedicationLine(line);
  const afterAlias = cleaned.replace(new RegExp(`^.*?${escapeRegExp(alias)}`, "i"), "").trim();
  const doseSource = (afterAlias || cleaned)
    .replace(/^\([^)]{0,160}\)\s*,?\s*[-–—]?\s*/g, "")
    .replace(/^[\s,;:()\-–—]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (/\d+(?:[,.]\d+)?\s*(?:мг|мкг|г|ед|ме|мл|таб|кап|пак)|\b\d+\s*(?:р\/д|раз\/дн|раза?\s+в\s+день)/i.test(doseSource)) {
    return normalizeDoctorRegimen(doseSource);
  }
  const doseMatch = doseSource.match(/(\d+(?:[,.]\d+)?\s*(?:мг|мкг|г|ед|ме|мл|таб|кап)(?:\s*[-–—:]?\s*[^.;,\n]{0,90})?)/i);
  if (doseMatch) return normalizeDoctorRegimen(doseMatch[1]);
  return "";
}

function normalizeDoctorRegimen(value) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s*[-–—:]\s*/g, " - ")
    .replace(/(\d)\s+(мг|мкг|г|ед|ме|мл)(?![a-zа-я])/gi, "$1$2")
    .trim();
}

function findSourceLine(text, patterns) {
  const lines = cleanupExtractedText(text || "").split("\n").map((line) => line.trim()).filter(Boolean);
  return lines.find((line) => patterns.some((pattern) => normalizeText(line).includes(normalizeText(pattern)))) || "";
}

function addDoctorMedicationsToProfile() {
  const conclusion = currentDoctorConclusion();
  const parsed = conclusion.parsed || { medications: [] };
  const sync = syncDoctorMedicationsToProfile(parsed, {
    doctorConclusionId: conclusion.id,
    recognitionStatus: "confirmed",
    needsConfirmation: false
  });
  saveDoctorConclusion(conclusion.text || doctorText.value, parsed, { reviewStatus: "confirmed", correctionOpen: false });
  doctorStatus.className = "file-status";
  doctorStatus.textContent = sync.added
    ? `Распознавание подтверждено. Назначения добавлены в лекарственный профиль: ${sync.added}.`
    : "Распознавание подтверждено. Все распознанные назначения уже есть в лекарственном профиле.";
  renderDoctorConclusion();
  renderHealthBlocks();
}

function showDoctorCorrectionForm(options = {}) {
  const conclusion = currentDoctorConclusion();
  const parsed = conclusion.parsed || { diagnoses: [], medications: [] };
  const confirmedDiagnosisKeys = new Set(conclusion.confirmedDiagnosisKeys || []);
  const confirmedMedicationKeys = new Set(conclusion.confirmedMedicationKeys || []);
  if (options.type === "diagnosis" && options.key) confirmedDiagnosisKeys.delete(options.key);
  if (options.type === "medication" && options.key) confirmedMedicationKeys.delete(options.key);
  doctorDiagnosisEdit.value = (parsed.diagnoses || []).map((item) => item.label).join("\n");
  doctorMedicationEdit.value = (parsed.medications || [])
    .map((item) => [item.name, item.dose].filter(Boolean).join(" "))
    .join("\n");
  saveDoctorConclusion(conclusion.text || doctorText.value, parsed, {
    reviewStatus: "pending",
    correctionOpen: true,
    confirmedDiagnosisKeys: [...confirmedDiagnosisKeys],
    confirmedMedicationKeys: [...confirmedMedicationKeys]
  });
  renderDoctorConclusion();
}

function applyDoctorCorrections() {
  const diagnoses = parseManualDoctorDiagnoses(doctorDiagnosisEdit.value);
  const medications = extractDoctorMedications(`Рекомендовано:\n${doctorMedicationEdit.value}`);
  saveDoctorConclusion(doctorText.value || currentDoctorConclusion().text || "", { diagnoses, medications }, {
    reviewStatus: "pending",
    correctionOpen: false
  });
  reconcileDraftDoctorMedications({ diagnoses, medications }, { doctorConclusionId: currentDoctorConclusion().id });
  doctorStatus.className = "file-status";
  doctorStatus.textContent = "Исправления сохранены. Сверьте результат и подтвердите распознавание.";
  renderDoctorConclusion();
}

function parseManualDoctorDiagnoses(text) {
  const lines = cleanupExtractedText(text || "").split("\n").map((line) => line.trim()).filter(Boolean);
  const detected = extractDoctorDiagnoses(lines.join("\n"));
  const detectedLabels = new Set(detected.map((item) => normalizeText(item.label)));
  const custom = lines
    .filter((line) => !detectedLabels.has(normalizeText(line)))
    .map((line, index) => ({
      key: `manual_${index + 1}`,
      label: line,
      attention: diagnosisAttention("manual"),
      sourceLine: "Исправлено вручную"
    }));
  return [...detected, ...custom];
}

function syncDoctorMedicationsToProfile(parsed, options = {}) {
  const conclusion = currentDoctorConclusion();
  const doctorConclusionId = options.doctorConclusionId || conclusion.id || createDoctorConclusionId();
  const needsConfirmation = options.needsConfirmation ?? false;
  const recognitionStatus = options.recognitionStatus || (needsConfirmation ? "pending" : "confirmed");
  const additions = (parsed.medications || []).map((item) => enrichMedication({
    id: `med-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: item.name,
    dose: item.dose,
    note: item.note,
    substance: item.substance,
    substanceLabel: item.substanceLabel,
    group: item.group,
    sourceName: "doctor conclusion",
    doctorConclusionId,
    recognitionStatus,
    sourceLine: item.sourceLine,
    needsConfirmation
  }));
  if (!additions.length) return { added: 0, skipped: 0 };

  const existing = currentMedications();
  const additionsByKey = new Map(additions.map((item) => [medicationUniqueKey(item), item]));
  let updated = 0;
  const syncedExisting = existing.map((item) => {
    const replacement = additionsByKey.get(medicationUniqueKey(item));
    if (!replacement || !isDoctorConclusionMedication(item, doctorConclusionId)) return item;
    updated += 1;
    return enrichMedication({
      ...item,
      name: replacement.name,
      dose: replacement.dose,
      note: replacement.note,
      substance: replacement.substance,
      substanceLabel: replacement.substanceLabel,
      group: replacement.group,
      sourceName: "doctor conclusion",
      doctorConclusionId,
      recognitionStatus,
      sourceLine: replacement.sourceLine,
      needsConfirmation
    });
  });
  const existingKeys = new Set(syncedExisting.filter((item) => !item.archived).map(medicationUniqueKey));
  const fresh = additions.filter((item) => {
    const key = medicationUniqueKey(item);
    if (existingKeys.has(key) && !options.force) return false;
    existingKeys.add(key);
    return true;
  });
  const merged = [...syncedExisting, ...fresh];
  saveCurrentMedications(merged);
  return { added: fresh.length, updated, skipped: additions.length - fresh.length };
}

function medicationUniqueKey(item) {
  return normalizeText(item.substance || item.substanceLabel || item.name || "");
}

function reconcileDraftDoctorMedications(parsed, options = {}) {
  const doctorConclusionId = options.doctorConclusionId || currentDoctorConclusion().id || "";
  const expected = new Map((parsed.medications || []).map((item) => [medicationUniqueKey(item), item]));
  const current = currentMedications();
  let changed = false;
  const reconciled = [];

  for (const item of current) {
    if (!isDoctorConclusionMedication(item, doctorConclusionId)) {
      reconciled.push(item);
      continue;
    }

    const expectedItem = expected.get(medicationUniqueKey(item));
    if (!expectedItem) {
      changed = true;
      continue;
    }

    const updated = enrichMedication({
      ...item,
      name: expectedItem.name,
      dose: expectedItem.dose,
      note: expectedItem.note,
      substance: expectedItem.substance,
      substanceLabel: expectedItem.substanceLabel,
      group: expectedItem.group,
      sourceName: "doctor conclusion",
      doctorConclusionId: doctorConclusionId || item.doctorConclusionId || "",
      recognitionStatus: item.recognitionStatus || "draft",
      sourceLine: expectedItem.sourceLine,
      needsConfirmation: item.needsConfirmation ?? false
    });
    changed = changed || JSON.stringify(updated) !== JSON.stringify(item);
    reconciled.push(updated);
  }

  if (changed) saveCurrentMedications(reconciled);
}

function isDoctorConclusionMedication(item, doctorConclusionId = "") {
  if (item?.sourceName !== "doctor conclusion") return false;
  if (!doctorConclusionId) return true;
  if (!item.doctorConclusionId) return true;
  return item.doctorConclusionId === doctorConclusionId;
}

function parseLabReport(text, sourceName, fallbackTimestamp) {
  const normalized = text.replace(/\u00a0/g, " ");
  const reportDate = findReportDate(normalized, sourceName, fallbackTimestamp);
  const values = [];
  const now = new Date().toISOString();

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
    id: labRecordId(reportDate, sourceName, values),
    sourceName,
    date: reportDate,
    uploadedAt: now,
    updatedAt: now,
    processingStatus: values.length ? "ready" : "needs_reload",
    values
  };
}

function labRecordId(date, sourceName, values) {
  return `${date}-${sourceName}-${values.map((item) => `${item.key}:${item.value}`).join("|")}`;
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
      .select("id, status, created_at, updated_at")
      .single();

    if (documentError) {
      labStatus.textContent = `Supabase: документ не сохранен (${documentError.message}).`;
      continue;
    }

    record.documentId = documentRow.id;
    record.uploadedAt = record.uploadedAt || documentRow.created_at || new Date().toISOString();
    record.updatedAt = documentRow.updated_at || record.updatedAt || record.uploadedAt;
    record.processingStatus = documentRow.status || "parsed";

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
      record.processingStatus = "needs_reload";
    }
  }
}

function observationsToLabRecords(observations) {
  const byDocument = new Map();

  for (const item of observations) {
    const key = item.document_id || `${item.observed_on}-${item.analyte_key}`;
    if (!byDocument.has(key)) {
      const sourceDocument = Array.isArray(item.source_documents)
        ? item.source_documents[0] || {}
        : item.source_documents || {};
      byDocument.set(key, {
        id: key,
        documentId: item.document_id || "",
        sourceName: sourceDocument.file_name || "Supabase",
        date: item.observed_on,
        uploadedAt: sourceDocument.created_at || "",
        updatedAt: sourceDocument.updated_at || "",
        processingStatus: sourceDocument.status || "parsed",
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

function geneticFindingsToPatientData(findings = []) {
  const lines = [];
  const seen = new Set();

  for (const finding of findings) {
    const line = geneticFindingToProfileLine(finding);
    const key = normalizeText(line);
    if (!line || seen.has(key)) continue;
    seen.add(key);
    lines.push(line);
  }

  return lines.length
    ? ["# Из Supabase genetic_findings", ...lines].join("\n")
    : "";
}

function geneticDocumentsToPatientData(documents = []) {
  const blocks = documents
    .map((document) => ({
      label: document.file_name || document.kind || "genetic report",
      kind: document.kind || "",
      text: String(document.extracted_text || "").trim()
    }))
    .filter((document) => document.text && isGeneticSourceDocument(document));

  if (!blocks.length) return "";

  return blocks
    .flatMap((document) => [`# Из Supabase source_documents: ${document.label}`, document.text])
    .join("\n");
}

function isGeneticSourceDocument(document = {}) {
  if (["vcf", "genetic_report", "manual"].includes(document.kind)) return true;
  return looksLikeGeneticText(document.text || "");
}

function looksLikeGeneticText(text = "") {
  const normalized = String(text).toLowerCase();
  return [
    "cyp2c19",
    "cyp2d6",
    "slco1b1",
    "cyp2c9",
    "tpmt",
    "nudt15",
    "hla-b*57:01",
    "hla-b*58:01",
    "rs4149056",
    "rs1799853",
    "rs1057910"
  ].some((marker) => normalized.includes(marker));
}

function geneticFindingToProfileLine(finding = {}) {
  if (finding.raw_line?.trim()) return finding.raw_line.trim();

  const gene = finding.gene?.trim();
  if (!gene) return "";
  if (finding.diplotype?.trim()) return `${gene} ${finding.diplotype.trim()}`;
  if (finding.phenotype?.trim()) return `${gene} ${finding.phenotype.trim()}`;
  if (finding.rsid?.trim() && finding.genotype?.trim()) return `${gene} ${finding.rsid.trim()} ${finding.genotype.trim()}`;
  if (finding.genotype?.trim()) return `${gene} ${finding.genotype.trim()}`;
  return "";
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
    "мед/л": "мед\\/л|ме\\/л|мме\\/л|miu\\/l|uIU\\/ml|uIU\\/mL|mIU\\/l|mIU\\/L",
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

function requestClearLabHistory() {
  if (!labRecords.length) {
    labStatus.className = "file-status";
    labStatus.textContent = "История анализов уже пуста.";
    return;
  }
  showLabDeleteConfirmation({
    mode: "all",
    count: labRecords.length,
    title: "Удалить результаты анализа?"
  });
}

function requestDeleteLabRecord(recordId) {
  const record = labRecords.find((item) => item.id === recordId);
  if (!record) return;
  showLabDeleteConfirmation({
    mode: "single",
    recordId,
    count: 1,
    title: "Удалить результаты анализа?",
    recordLabel: `${formatDate(record.date)} · ${record.sourceName || "анализ"}`
  });
}

function showLabDeleteConfirmation(request) {
  pendingLabDelete = request;
  const countText = request.count > 1
    ? `Будут удалены ${request.count} ${plural(request.count, "результат", "результата", "результатов")} анализов.`
    : request.recordLabel
      ? `Будет удалён результат: ${request.recordLabel}.`
      : "Будет удалён 1 результат анализа.";
  const body = `${countText} После удаления результаты анализа будут безвозвратно удалены из приложения. Восстановить их не получится.`;

  if (!labDeleteDialog?.showModal) {
    const confirmed = typeof window.confirm === "function" ? window.confirm(`${request.title}\n\n${body}`) : false;
    if (confirmed) void confirmPendingLabDelete();
    else pendingLabDelete = null;
    return;
  }

  labDeleteTitle.textContent = request.title;
  labDeleteText.textContent = body;
  labDeleteDialog.showModal();
}

function closeLabDeleteDialog() {
  pendingLabDelete = null;
  if (labDeleteDialog?.open) labDeleteDialog.close();
}

async function confirmPendingLabDelete() {
  const request = pendingLabDelete;
  if (!request) return;
  pendingLabDelete = null;
  if (labDeleteDialog?.open) labDeleteDialog.close();

  if (request.mode === "single") {
    await deleteLabRecord(request.recordId);
    return;
  }
  await clearLabHistory();
}

async function deleteLabRecord(recordId) {
  const record = labRecords.find((item) => item.id === recordId);
  if (!record) return;

  if (cloudReady) {
    const deleted = await deleteCloudLabRecord(record);
    if (!deleted) return;
  }

  labRecords = labRecords.filter((item) => item.id !== recordId);
  saveCurrentProfileData();
  renderLabHistory();
  labStatus.className = "file-status";
  labStatus.textContent = "Результат анализа удалён.";
  renderLabDiagnostics([]);
}

async function deleteCloudLabRecord(record) {
  const profile = getActiveProfile();
  const documentId = record.documentId || record.id;

  if (isUuid(documentId)) {
    const { error: observationsError } = await supabaseClient
      .from("lab_observations")
      .delete()
      .eq("profile_id", profile.id)
      .eq("document_id", documentId);
    const { error: documentsError } = await supabaseClient
      .from("source_documents")
      .delete()
      .eq("profile_id", profile.id)
      .eq("id", documentId)
      .in("kind", ["lab_pdf", "lab_text"]);

    if (observationsError || documentsError) {
      labStatus.className = "file-status error";
      labStatus.textContent = `Supabase: не удалось удалить анализ (${observationsError?.message || documentsError?.message}).`;
      return false;
    }
    return true;
  }

  const keys = [...new Set((record.values || []).map((value) => value.key))];
  const { error } = await supabaseClient
    .from("lab_observations")
    .delete()
    .eq("profile_id", profile.id)
    .eq("observed_on", record.date)
    .in("analyte_key", keys);

  if (error) {
    labStatus.className = "file-status error";
    labStatus.textContent = `Supabase: не удалось удалить анализ (${error.message}).`;
    return false;
  }
  return true;
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
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
    updateLabsSectionMeta();
    labSummary.className = "summary empty";
    labSummary.textContent = "Загрузите анализы, чтобы увидеть показатели и динамику.";
    labMetric.innerHTML = "";
    labMetricList.innerHTML = "";
    setLabMetricListExpanded(false);
    labMetricCounter.textContent = "0";
    toggleLabMetrics.hidden = true;
    toggleLabMetrics.textContent = "Показать все параметры";
    labInsights.innerHTML = "";
    labResults.innerHTML = "";
    drawLabChart("");
    renderHealthBlocks();
    return;
  }

  const metricOptions = availableLabMetrics();
  const previousMetric = labMetric.value;
  labMetric.innerHTML = metricOptions
    .map((metric) => `<option value="${escapeHtml(metric.key)}">${escapeHtml(metric.label)}</option>`)
    .join("");
  labMetric.value = metricOptions.some((metric) => metric.key === previousMetric) ? previousMetric : metricOptions[0].key;
  labMetricCounter.textContent = String(metricOptions.length);
  labMetricList.innerHTML = renderLabMetricList(metricOptions, labMetric.value);
  setLabMetricListExpanded(false);
  toggleLabMetrics.hidden = metricOptions.length <= 4;
  toggleLabMetrics.textContent = "Показать все параметры";

  updateLabsSectionMeta();
  labSummary.className = "summary";
  labSummary.textContent = `В истории ${labRecords.length} ${plural(labRecords.length, "отчет", "отчета", "отчетов")} и ${totalValues} ${plural(totalValues, "показатель", "показателя", "показателей")}. Выберите показатель, чтобы увидеть динамику.`;
  labInsights.innerHTML = renderLabInsights();
  labResults.innerHTML = renderLabCollectionSummary() + renderLabRecordGroups();
  bindLabHistoryActions();
  drawLabChart(labMetric.value);
  renderHealthBlocks();
}

function renderDoctorConclusion() {
  const conclusion = currentDoctorConclusion();
  const parsed = conclusion.parsed || { diagnoses: [], medications: [] };
  const diagnoses = parsed.diagnoses || [];
  const medications = parsed.medications || [];
  const signals = doctorConclusionSignals(parsed);
  const total = diagnoses.length + medications.length;
  const hasConclusion = Boolean(conclusion.text?.trim());
  const confirmed = conclusion.reviewStatus === "confirmed";

  doctorCounter.textContent = `${total} ${plural(total, "пункт", "пункта", "пунктов")}`;
  if (doctorPanelTitle) doctorPanelTitle.textContent = hasConclusion ? "Сверьте черновик" : "Загрузите заключение";
  doctorReviewActions.hidden = !hasConclusion;
  addDoctorMedicationsButton.disabled = !medications.length || confirmed;
  addDoctorMedicationsButton.innerHTML = `${doctorIcon("check")}${confirmed ? "Лекарства добавлены" : "Подтвердить всё"}`;
  doctorCorrectionPanel.hidden = !hasConclusion || !conclusion.correctionOpen;
  updateDoctorSectionMeta(parsed, signals);

  if (!hasConclusion) {
    doctorSummary.className = "doctor-review-summary";
    doctorSummary.innerHTML = renderDoctorStartSummary();
    doctorParsed.innerHTML = "";
    doctorSignals.innerHTML = "";
    doctorReviewActions.hidden = true;
    doctorCorrectionPanel.hidden = true;
    bindDoctorContextActions();
    return;
  }

  doctorSummary.className = "doctor-review-summary";
  doctorSummary.innerHTML = renderDoctorSummary(conclusion, diagnoses, medications, signals);
  doctorParsed.innerHTML = renderDoctorParsed(parsed, conclusion);
  doctorSignals.innerHTML = confirmed
    ? `${renderDoctorContextPlan(parsed, signals, confirmed)}${signals.length ? renderPriorityGroups(signals, renderDoctorSignal) : ""}`
    : renderDoctorDraftChecks(parsed, signals);
  bindDoctorReviewActions();
  bindDoctorContextActions();
}

function renderDoctorSummary(conclusion, diagnoses, medications, signals) {
  const confirmed = conclusion.reviewStatus === "confirmed";
  const highCount = confirmed ? signals.filter((signal) => signal.severity === "high").length : 0;
  return `
    <div class="doctor-review-hero">
      <div class="doctor-review-copy">
        <div class="status-row">
          <span class="doctor-status-pill ${confirmed ? "confirmed" : "pending"}">${doctorIcon(confirmed ? "check" : "clock", "status-icon")}${confirmed ? "Распознавание подтверждено" : "Ожидает подтверждения"}</span>
        </div>
        <strong>${confirmed ? "Теперь можно собрать полную картину" : "Сверьте черновик"}</strong>
        <p>${confirmed ? "Мы добавили назначения в лекарственный профиль. Следующий шаг — понять, каких данных не хватает для уверенной проверки." : "Можно подтвердить все пункты сразу или каждый по отдельности."}</p>
        ${renderDoctorProgress(confirmed ? "context" : "review")}
        <div class="doctor-review-metrics" aria-label="Краткая сводка заключения">
          ${renderDoctorMetric("file", diagnoses.length, "диагнозов")}
          ${renderDoctorMetric("pill", medications.length, "назначения")}
          ${renderDoctorMetric("shield", signals.length, confirmed ? "сверено" : "будут сверены")}
          ${renderDoctorMetric("alert", highCount, "срочных вопросов")}
        </div>
      </div>
    </div>
  `;
}

function renderDoctorStartSummary() {
  return `
    <div class="doctor-review-hero">
      <div class="doctor-review-copy">
        <div class="status-row">
          <span class="doctor-status-pill pending">${doctorIcon("file", "status-icon")}После приёма врача</span>
        </div>
        <strong>Загрузите заключение</strong>
        <p>Сначала появится черновик. После проверки приложение подскажет, какие данные стоит добавить, чтобы увидеть связи с анализами, генетикой и лекарствами.</p>
        ${renderDoctorProgress("start")}
        <div class="context-cta-row">
          <button class="secondary-button" type="button" data-context-target="doctor-input">Загрузить заключение</button>
          <button class="secondary-button quiet" type="button" data-context-target="labs-input">Добавить анализы</button>
        </div>
      </div>
    </div>
  `;
}

function renderDoctorProgress(activeStep = "start") {
  const steps = [
    ["start", "Загрузка", "Заключение"],
    ["review", "Проверка", "Факты"],
    ["context", "Контекст", "Что добавить"],
    ["insights", "Вопросы", "К врачу"]
  ];
  const activeIndex = Math.max(0, steps.findIndex(([key]) => key === activeStep));
  return `
    <div class="doctor-flow-progress" aria-label="Путь работы">
      <div class="doctor-flow-head">
        <span>Путь работы</span>
        <span>${activeIndex + 1} из ${steps.length}</span>
      </div>
      <div class="doctor-flow-steps">
        ${steps.map(([key, title, subtitle], index) => `
          <span class="doctor-flow-step ${index < activeIndex ? "is-done" : ""} ${index === activeIndex ? "is-active" : ""}">
            <strong>${escapeHtml(title)}</strong>
            <small>${escapeHtml(subtitle)}</small>
          </span>
        `).join("")}
      </div>
    </div>
  `;
}

function renderDoctorMetric(iconName, value, label) {
  return `
    <span class="doctor-review-metric">
      ${doctorIcon(iconName, "summary-icon")}
      <strong>${escapeHtml(String(value))}</strong>
      <span>${escapeHtml(label)}</span>
    </span>
  `;
}

function renderDoctorParsed(parsed, conclusion = currentDoctorConclusion()) {
  const diagnoses = parsed.diagnoses || [];
  const medications = parsed.medications || [];
  return `
    <div class="doctor-grid">
      <section class="decision-section doctor-review-section">
        <div class="section-title">
          <div>
            <h3>Диагнозы</h3>
            <p>Сверьте пункты из заключения.</p>
          </div>
          <span class="mini-counter">${diagnoses.length}</span>
        </div>
        ${diagnoses.length ? diagnoses.map((item) => renderDoctorDiagnosisItem(item, conclusion)).join("") : `<p class="file-status">Диагнозы не распознаны. Можно уточнить текст вручную.</p>`}
      </section>
      <section class="decision-section doctor-review-section">
        <div class="section-title">
          <div>
            <h3>2. Назначения</h3>
            <p>Сверьте препарат и режим приёма.</p>
          </div>
          <span class="mini-counter">${medications.length}</span>
        </div>
        ${medications.length ? medications.map((item) => renderDoctorMedicationItem(item, conclusion)).join("") : `<p class="file-status">Назначения не распознаны. Можно добавить препараты вручную в лекарственном профиле.</p>`}
      </section>
    </div>
  `;
}

function renderDoctorDiagnosisItem(item, conclusion) {
  const key = doctorDiagnosisKey(item);
  const accepted = isDoctorReviewItemAccepted(conclusion, "diagnosis", key);
  const confirmed = conclusion.reviewStatus === "confirmed";
  return `
          <article class="doctor-review-item ${accepted ? "is-accepted" : ""}">
            <div class="doctor-review-main">
              <div class="doctor-review-title">
            <strong>${escapeHtml(item.label)}</strong>
                ${confirmed || accepted ? `<span class="diagnosis-tag ${escapeHtml(item.attention?.level || "moderate")}">${escapeHtml(item.attention?.label || "Требует наблюдения")}</span>` : `<span class="diagnosis-tag feature">диагноз</span>`}
              </div>
              <p class="review-detail">${escapeHtml(item.sourceLine || "Источник: заключение")}</p>
            </div>
            ${renderDoctorItemActions("diagnosis", key, accepted)}
          </article>
  `;
}

function renderDoctorMedicationItem(item, conclusion) {
  const key = doctorMedicationReviewKey(item);
  const accepted = isDoctorReviewItemAccepted(conclusion, "medication", key);
  return `
          <article class="doctor-review-item ${accepted ? "is-accepted" : ""}">
            <div class="doctor-review-main">
              <div class="doctor-review-title">
            <strong>${escapeHtml(item.name)}</strong>
                ${item.substanceLabel ? `<span class="diagnosis-tag feature">${escapeHtml(item.substanceLabel)}</span>` : `<span class="diagnosis-tag feature">вещество не определено</span>`}
              </div>
              <p class="review-detail">${escapeHtml(item.dose || "доза не распознана")}</p>
            </div>
            ${renderDoctorItemActions("medication", key, accepted)}
          </article>
  `;
}

function renderDoctorItemActions(type, key, accepted) {
  if (accepted) {
    return `
      <div class="doctor-review-actions compact">
        <button class="doctor-icon-button" type="button" data-doctor-edit-${type}="${escapeHtml(key)}" title="Изменить" aria-label="Изменить">${doctorIcon("pencil")}</button>
      </div>
    `;
  }
  return `
    <div class="doctor-review-actions">
      <button class="doctor-icon-button accept-item" type="button" data-doctor-confirm-${type}="${escapeHtml(key)}" title="Отметить как верное" aria-label="Отметить как верное">${doctorIcon("check")}</button>
      <button class="doctor-icon-button" type="button" data-doctor-edit-${type}="${escapeHtml(key)}" title="Изменить" aria-label="Изменить">${doctorIcon("pencil")}</button>
      <button class="doctor-icon-button danger-action" type="button" data-doctor-remove-${type}="${escapeHtml(key)}" title="Удалить" aria-label="Удалить">${doctorIcon("trash")}</button>
    </div>
  `;
}

function renderDoctorDraftChecks(parsed, signals = []) {
  return `
    <div class="doctor-draft-checks">
      <section class="decision-section">
        <div class="section-title">
          <div>
            <h3>Что будет после проверки</h3>
            <p>Пока распознавание не подтверждено, подсказки не показываются.</p>
          </div>
        </div>
        <div class="checklist">
          <div class="check-item"><span class="check-mark">1</span><span>Лекарства попадут в профиль с действующими веществами.</span></div>
          <div class="check-item"><span class="check-mark">2</span><span>Приложение покажет, каких данных не хватает для проверки назначений.</span></div>
          <div class="check-item"><span class="check-mark">3</span><span>После добавления контекста появятся связи с анализами, генетикой и лекарственным профилем.</span></div>
        </div>
      </section>
      ${renderDoctorContextPlan(parsed, signals, false)}
    </div>
  `;
}

function renderDoctorContextPlan(parsed, signals = [], confirmed = false) {
  const plan = doctorContextPlan(parsed, signals, confirmed);
  return `
    <section class="doctor-context-plan" aria-label="Что добавить для полной картины">
      <div class="section-title">
        <div>
          <h3>${confirmed ? "Что добавить для полной картины" : "Что понадобится для полной картины"}</h3>
          <p>${confirmed ? "Чем больше исходных данных, тем точнее список вопросов врачу." : "Сначала подтвердите черновик. Затем приложение проведёт вас по недостающим данным."}</p>
        </div>
        <span class="mini-counter">${plan.readyCount}/${plan.items.length}</span>
      </div>
      <div class="context-score" style="--context-progress: ${plan.percent}%">
        <div>
          <strong>${confirmed ? "Картина собрана" : "Пока это черновик"}</strong>
          <span>${confirmed ? `${plan.readyCount} из ${plan.items.length} блоков данных уже есть` : `${plan.readyCount} из ${plan.items.length} блоков уже есть, но проверки ещё не запущены`}</span>
        </div>
        <span>${plan.percent}%</span>
      </div>
      <div class="context-checklist">
        ${plan.items.map(renderDoctorContextItem).join("")}
      </div>
    </section>
  `;
}

function doctorContextPlan(parsed, signals = [], confirmed = false) {
  const medications = parsed.medications || [];
  const activeMedicationCount = activeMedications().length;
  const labCount = labRecords.length;
  const labMetricCount = Object.keys(labMetricCounts()).length;
  const labDynamicsCount = Object.values(labMetricCounts()).filter((count) => count > 1).length;
  const geneticCount = Object.keys(parseProfile(patientData.value || "").profile || {}).length;
  const highSignalCount = confirmed ? signals.filter((signal) => signal.severity === "high").length : 0;
  const hasConfirmedMeds = confirmed && medications.length > 0;
  const items = [
    {
      title: "Заключение врача",
      body: "Загружено. Из него получаем диагнозы, назначения и режим приёма.",
      status: "ready",
      priority: "needed",
      value: "есть"
    },
    {
      title: "Проверенный черновик",
      body: confirmed ? "Распознавание подтверждено. Можно использовать данные в проверках." : "Проверьте диагнозы, препараты и режим приёма перед подсказками.",
      status: confirmed ? "ready" : "missing",
      priority: "needed",
      value: confirmed ? "готово" : "нужно",
      action: confirmed ? "" : "Проверить",
      target: "doctor-review"
    },
    {
      title: "Лекарственный профиль",
      body: hasConfirmedMeds || activeMedicationCount
        ? `${activeMedicationCount} ${plural(activeMedicationCount, "препарат", "препарата", "препаратов")} в профиле. Проверяем сочетания и доказательность.`
        : "Добавьте текущие препараты, БАДы и лекарства, которые уже принимаете.",
      status: hasConfirmedMeds || activeMedicationCount ? "ready" : "missing",
      priority: "needed",
      value: hasConfirmedMeds || activeMedicationCount ? "есть" : "нужно",
      action: hasConfirmedMeds || activeMedicationCount ? "" : "Добавить",
      target: "medications-input"
    },
    {
      title: "Свежие анализы",
      body: labCount
        ? `${labCount} ${plural(labCount, "результат", "результата", "результатов")} и ${labMetricCount} ${plural(labMetricCount, "параметр", "параметра", "параметров")} уже доступны.`
        : "Для назначений часто важны креатинин/eGFR, АЛТ/АСТ, калий, липиды, КФК и воспалительные маркеры.",
      status: labCount ? "ready" : "missing",
      priority: "needed",
      value: labCount ? "есть" : "нужно",
      action: labCount ? "" : "Загрузить",
      target: "labs-input"
    },
    {
      title: "Генетика",
      body: geneticCount
        ? `${geneticCount} ${plural(geneticCount, "маркер", "маркера", "маркеров")} найдено. Проверяем PGx-связи с препаратами.`
        : "Если есть файл Genotek или список генотипов, приложение сможет проверить фармакогенетику.",
      status: geneticCount ? "ready" : "missing",
      priority: "helps",
      value: geneticCount ? "есть" : "усилит",
      action: geneticCount ? "" : "Добавить",
      target: "genetics-input"
    },
    {
      title: "Динамика анализов",
      body: labDynamicsCount
        ? `${labDynamicsCount} ${plural(labDynamicsCount, "показатель", "показателя", "показателей")} можно смотреть в динамике.`
        : "Старые анализы помогут увидеть, меняется ли показатель на фоне лечения.",
      status: labDynamicsCount ? "ready" : "missing",
      priority: "helps",
      value: labDynamicsCount ? "есть" : "потом",
      action: labDynamicsCount ? "" : "Добавить",
      target: "labs-input"
    },
    {
      title: "Вопросы врачу",
      body: highSignalCount
        ? `${highSignalCount} ${plural(highSignalCount, "срочный вопрос", "срочных вопроса", "срочных вопросов")} уже найдено.`
        : "Появятся после подтверждения и добавления контекста.",
      status: confirmed && signals.length ? "ready" : "missing",
      priority: "later",
      value: confirmed && signals.length ? "готово" : "потом"
    }
  ];
  const readyCount = items.filter((item) => item.status === "ready").length;
  const percent = Math.round((readyCount / items.length) * 100);
  return { items, readyCount, percent };
}

function renderDoctorContextItem(item) {
  return `
    <article class="context-item ${escapeHtml(item.status)} ${escapeHtml(item.priority)}">
      <span class="context-state">${item.status === "ready" ? doctorIcon("check") : doctorIcon("plus")}</span>
      <div>
        <div class="context-item-title">
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(item.value)}</span>
        </div>
        <p>${escapeHtml(item.body)}</p>
      </div>
      ${item.action && item.target ? `<button class="context-item-action" type="button" data-context-target="${escapeHtml(item.target)}">${escapeHtml(item.action)}</button>` : ""}
    </article>
  `;
}

function bindDoctorContextActions() {
  [doctorSummary, doctorSignals].forEach((root) => {
    if (!root || typeof root.querySelectorAll !== "function") return;
    root.querySelectorAll("[data-context-target]").forEach((button) => {
      button.addEventListener("click", () => openContextTarget(button.dataset.contextTarget));
    });
  });
}

function openContextTarget(target) {
  const targetConfig = {
    "doctor-input": { tab: "doctor", drawer: doctorInputDrawer },
    "doctor-review": { tab: "doctor", node: doctorParsed },
    "labs-input": { tab: "labs", drawer: labInputDrawer },
    "genetics-input": { tab: "genetics", drawer: geneticInputDrawer },
    "medications-input": { tab: "medications", drawer: medicationInputDrawer }
  }[target];
  if (!targetConfig) {
    navigateToTab(target);
    return;
  }

  navigateToTab(targetConfig.tab);
  if (targetConfig.drawer) targetConfig.drawer.open = true;
  const node = targetConfig.drawer || targetConfig.node;
  node?.scrollIntoView?.({ behavior: "smooth", block: "start" });
}

function bindDoctorReviewActions() {
  if (typeof doctorParsed.querySelectorAll !== "function") return;
  doctorParsed.querySelectorAll("[data-doctor-confirm-diagnosis]").forEach((button) => {
    button.addEventListener("click", () => confirmDoctorReviewItem("diagnosis", button.dataset.doctorConfirmDiagnosis));
  });
  doctorParsed.querySelectorAll("[data-doctor-confirm-medication]").forEach((button) => {
    button.addEventListener("click", () => confirmDoctorReviewItem("medication", button.dataset.doctorConfirmMedication));
  });
  doctorParsed.querySelectorAll("[data-doctor-remove-diagnosis]").forEach((button) => {
    button.addEventListener("click", () => removeDoctorReviewItem("diagnosis", button.dataset.doctorRemoveDiagnosis));
  });
  doctorParsed.querySelectorAll("[data-doctor-remove-medication]").forEach((button) => {
    button.addEventListener("click", () => removeDoctorReviewItem("medication", button.dataset.doctorRemoveMedication));
  });
  doctorParsed.querySelectorAll("[data-doctor-edit-diagnosis]").forEach((button) => {
    button.addEventListener("click", () => showDoctorCorrectionForm({ type: "diagnosis", key: button.dataset.doctorEditDiagnosis }));
  });
  doctorParsed.querySelectorAll("[data-doctor-edit-medication]").forEach((button) => {
    button.addEventListener("click", () => showDoctorCorrectionForm({ type: "medication", key: button.dataset.doctorEditMedication }));
  });
}

function doctorDiagnosisKey(item) {
  return item?.key || normalizeText(item?.label || "");
}

function doctorMedicationReviewKey(item) {
  return medicationUniqueKey(item);
}

function isDoctorReviewItemAccepted(conclusion, type, key) {
  if (conclusion.reviewStatus === "confirmed") return true;
  const keys = type === "diagnosis" ? conclusion.confirmedDiagnosisKeys : conclusion.confirmedMedicationKeys;
  return Array.isArray(keys) && keys.includes(key);
}

function confirmDoctorReviewItem(type, key) {
  const conclusion = currentDoctorConclusion();
  const parsed = conclusion.parsed || { diagnoses: [], medications: [] };
  const diagnosisKeys = new Set(conclusion.confirmedDiagnosisKeys || []);
  const medicationKeys = new Set(conclusion.confirmedMedicationKeys || []);

  if (type === "diagnosis") diagnosisKeys.add(key);
  if (type === "medication") {
    medicationKeys.add(key);
    const medication = (parsed.medications || []).find((item) => doctorMedicationReviewKey(item) === key);
    if (medication) {
      syncDoctorMedicationsToProfile({ medications: [medication] }, {
        doctorConclusionId: conclusion.id,
        recognitionStatus: "confirmed",
        needsConfirmation: false
      });
    }
  }

  const allDiagnosesAccepted = (parsed.diagnoses || []).every((item) => diagnosisKeys.has(doctorDiagnosisKey(item)));
  const allMedicationsAccepted = (parsed.medications || []).every((item) => medicationKeys.has(doctorMedicationReviewKey(item)));
  const allAccepted = allDiagnosesAccepted && allMedicationsAccepted && ((parsed.diagnoses || []).length + (parsed.medications || []).length > 0);

  if (allAccepted) {
    syncDoctorMedicationsToProfile(parsed, {
      doctorConclusionId: conclusion.id,
      recognitionStatus: "confirmed",
      needsConfirmation: false
    });
  }

  saveDoctorConclusion(conclusion.text || doctorText.value, parsed, {
    reviewStatus: allAccepted ? "confirmed" : "pending",
    correctionOpen: false,
    confirmedDiagnosisKeys: [...diagnosisKeys],
    confirmedMedicationKeys: [...medicationKeys]
  });
  doctorStatus.className = "file-status";
  doctorStatus.textContent = allAccepted
    ? "Все пункты подтверждены. Лекарства добавлены в профиль."
    : "Пункт подтверждён.";
  renderDoctorConclusion();
  renderHealthBlocks();
}

function removeDoctorReviewItem(type, key) {
  const conclusion = currentDoctorConclusion();
  const parsed = conclusion.parsed || { diagnoses: [], medications: [] };
  const nextParsed = {
    diagnoses: type === "diagnosis"
      ? (parsed.diagnoses || []).filter((item) => doctorDiagnosisKey(item) !== key)
      : parsed.diagnoses || [],
    medications: type === "medication"
      ? (parsed.medications || []).filter((item) => doctorMedicationReviewKey(item) !== key)
      : parsed.medications || []
  };
  const confirmedDiagnosisKeys = (conclusion.confirmedDiagnosisKeys || []).filter((item) => item !== key);
  const confirmedMedicationKeys = (conclusion.confirmedMedicationKeys || []).filter((item) => item !== key);
  saveDoctorConclusion(conclusion.text || doctorText.value, nextParsed, {
    reviewStatus: "pending",
    correctionOpen: false,
    confirmedDiagnosisKeys,
    confirmedMedicationKeys
  });
  reconcileDraftDoctorMedications(nextParsed, { doctorConclusionId: conclusion.id });
  doctorStatus.className = "file-status";
  doctorStatus.textContent = type === "diagnosis" ? "Диагноз удалён из распознавания." : "Назначение удалено из распознавания.";
  renderDoctorConclusion();
  renderHealthBlocks();
}

function doctorIcon(name, className = "button-icon") {
  const icons = {
    check: `<path d="M20 6 9 17l-5-5"></path>`,
    clock: `<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>`,
    pencil: `<path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>`,
    trash: `<path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v5"></path><path d="M14 11v5"></path>`,
    plus: `<path d="M12 5v14"></path><path d="M5 12h14"></path>`,
    file: `<path d="M8 3h8l2 3v15H6V6z"></path><path d="M9 11h6"></path><path d="M9 15h6"></path>`,
    pill: `<path d="M10 21 3 14a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7Z"></path><path d="m8 8 8 8"></path>`,
    shield: `<path d="M12 3 20 7v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"></path><path d="m9 12 2 2 4-5"></path>`,
    alert: `<path d="M12 9v4"></path><path d="M12 17h.01"></path><path d="M10.3 3h3.4L21 10.3v3.4L13.7 21h-3.4L3 13.7v-3.4z"></path>`
  };
  return `<svg class="${escapeHtml(className)}" viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.check}</svg>`;
}

function diagnosisSeverity(item) {
  return item.attention?.level === "high" ? "high" : "low";
}

function diagnosisAttentionRank(item) {
  const labelRank = {
    "Требует скорейшего лечения": 4,
    "Требует лечения": 3,
    "Требует наблюдения": 2,
    "Физиологическая особенность": 1
  };
  const levelRank = {
    high: 3,
    moderate: 2,
    feature: 1
  };
  return labelRank[item.attention?.label] || levelRank[item.attention?.level] || 0;
}

function renderDoctorSignal(signal) {
  return `
    <article class="result-card ${escapeHtml(signal.severity || "low")}">
      <div class="result-title">
        <strong>${escapeHtml(signal.title)}</strong>
        <span class="badge">${escapeHtml(signal.context || "заключение")}</span>
      </div>
      <p class="recommendation">${escapeHtml(signal.body)}</p>
      <p class="source">${escapeHtml(signal.source || "Локальная проверка заключения")}</p>
    </article>
  `;
}

function updateDoctorSectionMeta(parsed, signals) {
  if (!doctorSectionMeta) return;
  const conclusion = currentDoctorConclusion();
  if (!conclusion.text?.trim()) {
    doctorSectionMeta.textContent = "Нет заключения · загрузка открыта ниже";
    return;
  }

  const diagnoses = parsed.diagnoses || [];
  const medications = parsed.medications || [];
  const highCount = signals.filter((signal) => signal.severity === "high").length;
  const parts = [
    String(diagnoses.length) + " " + plural(diagnoses.length, "диагноз", "диагноза", "диагнозов"),
    String(medications.length) + " " + plural(medications.length, "назначение", "назначения", "назначений"),
    String(signals.length) + " " + plural(signals.length, "находка", "находки", "находок")
  ];
  if (highCount) parts.push("высокий приоритет: " + highCount);
  doctorSectionMeta.textContent = parts.join(" · ");
}

function availableLabMetrics() {
  const keys = new Set(labRecords.flatMap((record) => record.values.map((value) => value.key)));
  return labAnalytes.filter((analyte) => keys.has(analyte.key));
}

function renderLabMetricList(metrics, selectedKey) {
  const counts = labMetricCounts();
  const latest = latestLabValues();
  return metrics.map((metric) => {
    const latestValue = latest[metric.key];
    const valueText = latestValue ? formatNumber(latestValue.value) + " " + latestValue.unit : "Нет значения";
    const dateText = latestValue ? formatDate(latestValue.date) : "";
    const count = counts[metric.key] || 0;
    const details = String(count) + " " + plural(count, "значение", "значения", "значений") + (dateText ? " · последнее: " + valueText + " от " + dateText : "");
    return `
      <label class="metric-option">
        <input type="radio" name="labMetricRadio" value="${escapeHtml(metric.key)}" data-lab-metric ${metric.key === selectedKey ? "checked" : ""} />
        <span>
          <strong>${escapeHtml(metric.label)}</strong>
          <small>${escapeHtml(details)}</small>
        </span>
      </label>
    `;
  }).join("");
}

function labMetricCounts() {
  return labRecords.reduce((acc, record) => {
    for (const value of record.values) acc[value.key] = (acc[value.key] || 0) + 1;
    return acc;
  }, {});
}

function toggleLabMetricList() {
  const expanded = !labMetricList.className.includes("expanded");
  setLabMetricListExpanded(expanded);
  toggleLabMetrics.textContent = expanded ? "Свернуть список" : "Показать все параметры";
}

function setLabMetricListExpanded(expanded) {
  if (labMetricList.classList) {
    labMetricList.classList.toggle("expanded", expanded);
    return;
  }
  labMetricList.className = expanded ? "metric-list expanded" : "metric-list";
}

function bindLabHistoryActions() {
  if (typeof labResults.querySelectorAll !== "function") return;
  labResults.querySelectorAll("[data-delete-lab-record]").forEach((button) => {
    button.addEventListener("click", () => requestDeleteLabRecord(button.dataset.deleteLabRecord));
  });
}

function renderLabCollectionSummary() {
  const groups = labMetricCollectionGroups();
  if (!groups.length) return "";

  return `
    <section class="lab-collection" aria-label="Коллекция распознанных параметров">
      <div class="section-title">
        <div>
          <h3>Коллекция анализов</h3>
          <p>Параметры сгруппированы по годам, чтобы быстрее видеть историю.</p>
        </div>
        <span class="mini-counter">${groups.length}</span>
      </div>
      <div class="lab-collection-grid">
        ${groups.map((group) => `
          <article class="lab-collection-item">
            <strong>${escapeHtml(group.label)}</strong>
            <span>${escapeHtml(group.years.join(" · "))}</span>
            <small>${group.count} ${escapeHtml(plural(group.count, "значение", "значения", "значений"))}</small>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function labMetricCollectionGroups() {
  const byMetric = new Map();
  for (const record of labRecords) {
    const year = record.date.slice(0, 4);
    for (const value of record.values || []) {
      if (!byMetric.has(value.key)) {
        byMetric.set(value.key, {
          key: value.key,
          label: value.label,
          years: new Set(),
          count: 0
        });
      }
      const group = byMetric.get(value.key);
      group.years.add(year);
      group.count += 1;
    }
  }

  return [...byMetric.values()]
    .map((group) => ({
      ...group,
      years: [...group.years].sort((a, b) => b.localeCompare(a))
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "ru"));
}

function renderLabRecordGroups() {
  const byDate = new Map();
  for (const record of [...labRecords].sort((a, b) => b.date.localeCompare(a.date))) {
    if (!byDate.has(record.date)) byDate.set(record.date, []);
    byDate.get(record.date).push(record);
  }

  return [...byDate.entries()].map(([date, records]) => `
    <section class="lab-date-group">
      <div class="lab-date-heading">
        <strong>${escapeHtml(formatDate(date))}</strong>
        <span>${records.length} ${escapeHtml(plural(records.length, "результат", "результата", "результатов"))}</span>
      </div>
      ${records.map(renderLabRecord).join("")}
    </section>
  `).join("");
}

function renderLabRecord(record) {
  return `
    <article class="lab-record">
      <div class="lab-record-title">
        <div>
          <strong>${escapeHtml(record.sourceName || "Анализ")}</strong>
          <div class="lab-record-meta">
            ${renderLabRecordMeta(record).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
          </div>
        </div>
        <button class="doctor-icon-button danger-action" type="button" data-delete-lab-record="${escapeHtml(record.id)}" title="Удалить результат анализа" aria-label="Удалить результат анализа">${doctorIcon("trash")}</button>
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

function renderLabRecordMeta(record) {
  const items = [`Статус: ${labProcessingStatusLabel(record.processingStatus)}`];
  if (record.uploadedAt) items.push(`Загружено ${formatDateTime(record.uploadedAt)}`);
  if (record.updatedAt && record.updatedAt !== record.uploadedAt) items.push(`Обновлено ${formatDateTime(record.updatedAt)}`);
  return items;
}

function labProcessingStatusLabel(status) {
  const normalized = normalizeText(status || "");
  if (["ready", "parsed", "done", "complete", "completed"].includes(normalized)) return "Готово";
  if (["uploaded", "processing", "pending"].includes(normalized)) return "Обрабатывается";
  if (["needs_reload", "failed", "error"].includes(normalized)) return "Требует повторной загрузки";
  return "Готово";
}

function labDescription(key) {
  return labAnalytes.find((item) => item.key === key)?.description || "";
}

function renderLabInsights() {
  const signals = labClinicalSignals();
  if (!signals.length) return "";

  return renderPriorityGroups(signals, renderLabInsightCard);
}

function renderLabInsightCard(signal) {
  return `
    <article class="result-card ${signal.severity}">
      <div class="result-title">
        <strong>${escapeHtml(signal.title)}</strong>
        <span class="badge">${escapeHtml(signal.metric)}</span>
      </div>
      <p class="recommendation">${escapeHtml(signal.body)}</p>
      <p class="source">Основано на последнем значении: ${escapeHtml(signal.value)} от ${escapeHtml(formatDate(signal.date))}</p>
    </article>
  `;
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
    body: "Повышенная КФК важна при обсуждении статинов и жалоб на мышечные симптомы, особенно вместе с фармакогенетической находкой SLCO1B1."
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

function renderHealthBlocks() {
  const showDecisionPanel = currentUser?.email?.toLowerCase() === "pkureev@gmail.com";
  decisionPanel.hidden = !showDecisionPanel;

  const qualitySignals = dataQualitySignals();
  const clinicalSignals = expandedClinicalSignals();
  const pgxSignals = pgxCoverageSignals();
  const integrationSignals = integrationStatusSignals();
  const medicationSignals = medicationRiskSignals();
  const total = [
    ...qualitySignals.filter((item) => item.severity !== "low"),
    ...clinicalSignals.filter((item) => item.severity !== "low"),
    ...pgxSignals.filter((item) => item.severity !== "low"),
    ...medicationSignals
  ].length;

  if (showDecisionPanel) {
    decisionCounter.textContent = `${total} ${plural(total, "находка", "находки", "находок")}`;
    renderSignalList(qualityChecks, qualityCounter, qualitySignals);
    renderSignalList(clinicalChecks, clinicalCounter, clinicalSignals);
    renderSignalList(pgxCoverage, pgxCounter, pgxSignals);
    renderSignalList(integrationChecks, integrationCounter, integrationSignals);
  }
  renderSectionDrawers();
  renderDoctorConclusion();
  renderMedicationProfile(medicationSignals);
  renderNowActions({ medicationSignals, clinicalSignals, pgxSignals });
}

function renderNowActions({ medicationSignals = [], clinicalSignals = [], pgxSignals = [] } = {}) {
  if (!nowActions) return;

  const conclusion = currentDoctorConclusion();
  const parsed = conclusion.parsed || { diagnoses: [], medications: [] };
  const medications = activeMedications();
  const { profile } = parseProfile(patientData.value);
  const hasGeneticData = Boolean(patientData.value.trim());
  const hasLabData = Boolean(labRecords.length);
  const hasDoctorData = Boolean(conclusion.text?.trim());
  const hasMedicationData = Boolean(medications.length);
  const pendingConclusion = hasDoctorData && conclusion.reviewStatus !== "confirmed";
  const unconfirmedMedications = medications.filter((item) => item.needsConfirmation).length;
  const highMedicationSignals = medicationSignals.filter((item) => item.severity === "high").length;
  const activeClinicalSignals = clinicalSignals.filter((item) => item.severity !== "low").length;
  const geneCount = Object.keys(profile).length;

  const actions = [];
  if (pendingConclusion) {
    const total = (parsed.diagnoses || []).length + (parsed.medications || []).length;
    actions.push({
      icon: "file",
      title: "Проверьте распознавание",
      body: `${total} ${plural(total, "пункт", "пункта", "пунктов")} из заключения ждут подтверждения.`,
      target: "doctor",
      cta: "Проверить",
      priority: true
    });
  }
  if (unconfirmedMedications) {
    actions.push({
      icon: "medications",
      title: "Подтвердите препараты",
      body: `${unconfirmedMedications} ${plural(unconfirmedMedications, "препарат", "препарата", "препаратов")} требуют проверки вещества или режима.`,
      target: "medications",
      cta: "Открыть",
      priority: true
    });
  }
  if (highMedicationSignals) {
    actions.push({
      icon: "medications",
      title: "Есть лекарственные предупреждения",
      body: `${highMedicationSignals} ${plural(highMedicationSignals, "важный пункт", "важных пункта", "важных пунктов")} стоит обсудить с врачом.`,
      target: "medications",
      cta: "Смотреть",
      priority: true
    });
  }
  if (activeClinicalSignals) {
    actions.push({
      icon: "labs",
      title: "Проверьте важные находки в анализах",
      body: `${activeClinicalSignals} ${plural(activeClinicalSignals, "сигнал", "сигнала", "сигналов")} по динамике или порогам.`,
      target: "labs",
      cta: "К анализам"
    });
  }
  if (!hasDoctorData) {
    actions.push({
      icon: "file",
      title: "Загрузите заключение",
      body: "Получите черновик диагнозов и назначений для проверки.",
      target: "doctor",
      cta: "Загрузить"
    });
  }
  if (!hasLabData) {
    actions.push({
      icon: "labs",
      title: "Добавьте анализы",
      body: "Появятся графики динамики и лабораторные подсказки.",
      target: "labs",
      cta: "Добавить"
    });
  }
  if (!hasGeneticData) {
    actions.push({
      icon: "genetics",
      title: "Добавьте генетику",
      body: "PGx-маркеры помогут проверить лекарства и вопросы врачу.",
      target: "genetics",
      cta: "Добавить"
    });
  }
  if (!hasMedicationData) {
    actions.push({
      icon: "medications",
      title: "Заполните лекарства",
      body: "Профиль проверит действующие вещества, сочетания и справочные флаги.",
      target: "medications",
      cta: "Добавить"
    });
  }

  if (!actions.length) {
    actions.push(
      {
        icon: "now",
        title: "Данные собраны",
        body: `${geneCount} ${plural(geneCount, "генетический маркер", "генетических маркера", "генетических маркеров")}, ${labRecords.length} ${plural(labRecords.length, "отчёт", "отчёта", "отчётов")} и ${medications.length} ${plural(medications.length, "препарат", "препарата", "препаратов")}.`,
        target: "labs",
        cta: "Открыть"
      },
      {
        icon: "genetics",
        title: "Смотрите важные находки",
        body: `${pgxSignals.length + activeClinicalSignals + medicationSignals.length} ${plural(pgxSignals.length + activeClinicalSignals + medicationSignals.length, "подсказка", "подсказки", "подсказок")} по текущим данным.`,
        target: "genetics",
        cta: "Смотреть"
      }
    );
  }

  nowActions.innerHTML = actions.slice(0, 4).map(renderNowActionCard).join("");
  if (typeof nowActions.querySelectorAll === "function") {
    nowActions.querySelectorAll("[data-now-target]").forEach((button) => {
      button.addEventListener("click", () => navigateToTab(button.dataset.nowTarget));
    });
  }
}

function renderNowActionCard(action) {
  return `
    <article class="now-action-card ${action.priority ? "is-priority" : ""}">
      <span class="now-action-icon">${appNavigationIcon(action.icon, "summary-icon")}</span>
      <div>
        <strong>${escapeHtml(action.title)}</strong>
        <span>${escapeHtml(action.body)}</span>
      </div>
      <button class="${action.priority ? "primary-button" : "secondary-button"}" type="button" data-now-target="${escapeHtml(action.target)}">${escapeHtml(action.cta)}</button>
    </article>
  `;
}

function appNavigationIcon(name, className = "summary-icon") {
  const tabName = {
    now: "now",
    labs: "labs",
    genetics: "genetics",
    medications: "medications"
  }[name];
  if (!tabName) return doctorIcon(name, className);
  return `<span class="${escapeHtml(className)} ui-icon ui-icon-${escapeHtml(tabName)}" aria-hidden="true"></span>`;
}

function renderSectionDrawers() {
  const hasGeneticData = Boolean(patientData.value.trim());
  const hasLabData = Boolean(labRecords.length);
  const hasDoctorData = Boolean(currentDoctorConclusion().text?.trim());
  const hasMedicationData = Boolean(activeMedications().length);

  if (geneticsSection) geneticsSection.open = true;
  if (labsSection) labsSection.open = true;
  if (doctorSection) doctorSection.open = true;
  if (medicationsSection) medicationsSection.open = true;
  if (geneticInputDrawer) geneticInputDrawer.open = !hasGeneticData || geneticInputOpen;
  if (geneticFilterPanel) geneticFilterPanel.hidden = !hasGeneticData;
  if (labInputDrawer) labInputDrawer.open = !hasLabData;
  if (doctorInputDrawer) doctorInputDrawer.open = !hasDoctorData;
  if (medicationInputDrawer) medicationInputDrawer.open = !hasMedicationData;
}

function updateGeneticsSectionMeta(matches, genes) {
  if (!geneticsSectionMeta) return;
  if (!patientData.value.trim()) {
    geneticsSectionMeta.textContent = "Нет генетических данных · загрузка открыта ниже";
    return;
  }

  const highCount = matches.filter((match) => match.severity === "high").length;
  const parts = [
    String(genes.length) + " " + plural(genes.length, "маркер", "маркера", "маркеров"),
    String(matches.length) + " " + plural(matches.length, "находка", "находки", "находок")
  ];
  if (highCount) parts.push("высокий приоритет: " + highCount);
  geneticsSectionMeta.textContent = parts.join(" · ");
}

function updateLabsSectionMeta() {
  if (!labsSectionMeta) return;
  if (!labRecords.length) {
    labsSectionMeta.textContent = "Нет анализов · загрузка открыта ниже";
    return;
  }

  const metricCount = new Set(labRecords.flatMap((record) => record.values.map((value) => value.key))).size;
  const activeSignals = labClinicalSignals().filter((signal) => signal.severity !== "low").length;
  const latestDate = [...labRecords].map((record) => record.date).sort().at(-1);
  labsSectionMeta.textContent = [
    String(labRecords.length) + " " + plural(labRecords.length, "отчет", "отчета", "отчетов"),
    String(metricCount) + " " + plural(metricCount, "показатель", "показателя", "показателей"),
    latestDate ? "последний: " + formatDate(latestDate) : "",
    activeSignals ? "важные находки: " + activeSignals : "без важных пороговых находок"
  ].filter(Boolean).join(" · ");
}

function updateMedicationsSectionMeta(medications, signals) {
  if (!medicationsSectionMeta) return;
  const archivedCount = archivedMedications().length;
  if (!medications.length) {
    medicationsSectionMeta.textContent = archivedCount
      ? `Нет текущих препаратов · в архиве ${archivedCount}`
      : "Нет препаратов · добавление открыто ниже";
    return;
  }

  const identified = medications.filter((item) => item.substanceLabel).length;
  const unconfirmed = medications.filter((item) => item.needsConfirmation).length;
  const highCount = signals.filter((signal) => signal.severity === "high").length;
  const parts = [
    String(medications.length) + " " + plural(medications.length, "препарат", "препарата", "препаратов"),
    "вещество определено: " + identified + "/" + medications.length,
    String(signals.length) + " " + plural(signals.length, "предупреждение", "предупреждения", "предупреждений")
  ];
  if (unconfirmed) parts.push("нужно подтвердить: " + unconfirmed);
  if (highCount) parts.push("высокий приоритет: " + highCount);
  if (archivedCount) parts.push("архив: " + archivedCount);
  medicationsSectionMeta.textContent = parts.join(" · ");
}

function renderSignalList(container, counter, signals) {
  counter.textContent = signals.length;
  container.innerHTML = signals.length
    ? signals.map(renderSignalItem).join("")
    : renderSignalItem({
        severity: "low",
        title: "Пока нет важных находок",
        body: "Этот блок начнет заполняться после загрузки генетики, анализов или списка препаратов."
      });
}

function renderSignalItem(signal) {
  return `
    <article class="signal-item ${escapeHtml(signal.severity || "low")}">
      <strong>${escapeHtml(signal.title)}</strong>
      <p>${escapeHtml(signal.body)}</p>
    </article>
  `;
}

function dataQualitySignals() {
  const signals = [];
  const { profile } = parseProfile(patientData.value);
  const geneCount = Object.keys(profile).length;
  const totalValues = labRecords.reduce((sum, record) => sum + record.values.length, 0);

  signals.push({
    severity: geneCount ? "low" : "moderate",
    title: geneCount ? `Распознано ${geneCount} генетических маркеров` : "Нет генетических данных",
    body: geneCount
      ? "Фармакогенетический блок может сопоставлять найденные маркеры с поддерживаемыми правилами."
      : "Загрузите VCF Genotek или вставьте текст отчета, чтобы появились gene-drug проверки."
  });

  signals.push({
    severity: labRecords.length ? "low" : "moderate",
    title: labRecords.length ? `Загружено ${labRecords.length} отчетов` : "Нет истории анализов",
    body: labRecords.length
      ? `В истории найдено ${totalValues} ${plural(totalValues, "показатель", "показателя", "показателей")}.`
      : "Загрузите PDF или текстовые результаты, чтобы появились графики и клинические находки."
  });

  const duplicates = duplicateLabValues();
  if (duplicates.length) {
    signals.push({
      severity: "moderate",
      title: "Есть похожие дубли",
      body: `Найдено ${duplicates.length} ${plural(duplicates.length, "повтор", "повтора", "повторов")} с одинаковой датой, показателем и значением. Стоит проверить источники.`
    });
  }

  const outliers = suspiciousLabValues();
  if (outliers.length) {
    signals.push({
      severity: "moderate",
      title: "Есть подозрительные значения",
      body: outliers.slice(0, 3).map((item) => `${item.label}: ${formatNumber(item.value)} ${item.unit}`).join("; ")
    });
  }

  return signals;
}

function duplicateLabValues() {
  const seen = new Set();
  const duplicates = [];
  for (const record of labRecords) {
    for (const value of record.values) {
      const key = [record.date, value.key, value.value, value.unit].join("|");
      if (seen.has(key)) duplicates.push(value);
      else seen.add(key);
    }
  }
  return duplicates;
}

function suspiciousLabValues() {
  const suspicious = [];
  for (const record of labRecords) {
    for (const value of record.values) {
      const analyte = labAnalytes.find((item) => item.key === value.key);
      const reference = analyte?.reference || {};
      const high = reference.max;
      const low = reference.min;
      if (value.value < 0) suspicious.push(value);
      else if (high && value.value > high * 6) suspicious.push(value);
      else if (low && value.value < low / 6) suspicious.push(value);
    }
  }
  return suspicious;
}

function expandedClinicalSignals() {
  const signals = [...labClinicalSignals()];
  const latest = latestLabValues();

  if (latest.ferritin && latest.crp && latest.crp.value > 5) {
    signals.push({
      severity: "moderate",
      title: "Ферритин интерпретировать с воспалением",
      metric: "Ферритин + CRP",
      body: "При повышенном C-реактивном белке ферритин может отражать не только запас железа, но и воспалительный контекст.",
      value: `${formatNumber(latest.ferritin.value)} ${latest.ferritin.unit}`,
      date: latest.ferritin.date
    });
  }

  if (latest.alt && latest.ast && latest.alt.value > latest.ast.value * 2 && latest.alt.value > 41) {
    signals.push({
      severity: "moderate",
      title: "АЛТ выше АСТ",
      metric: "АЛТ/АСТ",
      body: "Такой паттерн полезно учитывать при препаратах с печеночным метаболизмом и при поиске причины повышения трансаминаз.",
      value: `${formatNumber(latest.alt.value)} / ${formatNumber(latest.ast.value)}`,
      date: latest.alt.date
    });
  }

  if (!signals.length) {
    signals.push({
      severity: "low",
      title: "Критичных отклонений не найдено",
      body: "По текущим поддерживаемым показателям нет важных пороговых находок. Это не заменяет медицинскую интерпретацию."
    });
  }

  return signals;
}

function doctorConclusionSignals(parsed = currentDoctorConclusion().parsed || {}) {
  const diagnoses = parsed.diagnoses || [];
  const medications = (parsed.medications || []).map((item) => enrichMedication(item));
  const signals = [];

  signals.push(...doctorMedicationSignals(medications));
  signals.push(...doctorDiagnosisMedicationSignals(diagnoses, medications));
  signals.push(...doctorDiagnosisLabSignals(diagnoses));
  signals.push(...doctorDiagnosisGeneticSignals(diagnoses));

  if (diagnoses.length && !signals.length) {
    signals.push({
      severity: "low",
      title: "Активных пересечений не найдено",
      context: "заключение",
      body: "По распознанным диагнозам и назначениям не найдено поддерживаемых пересечений с текущими анализами, PGx-правилами и лекарственным профилем.",
      source: "Локальная проверка заключения"
    });
  }

  return signals.sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
}

function doctorMedicationSignals(medications) {
  if (!medications.length) return [];
  return medicationRiskSignals(medications).map((signal) => ({
    ...signal,
    context: signal.medication || "назначение",
    source: `Заключение врача · ${signal.source}`
  }));
}

function doctorDiagnosisMedicationSignals(diagnoses, medications) {
  const hasDiagnosis = (key) => diagnoses.some((item) => item.key === key);
  const hasMedication = (...groups) => medications.some((item) => groups.includes(item.group));
  const signals = [];

  if (hasDiagnosis("hp_positive")) {
    const hasEradicationCore = hasMedication("ppi")
      && hasMedication("penicillin_combo")
      && hasMedication("macrolide")
      && hasMedication("bismuth");
    signals.push({
      severity: hasEradicationCore ? "low" : "moderate",
      title: "HP+ и схема эрадикации",
      context: "диагноз + назначения",
      body: hasEradicationCore
        ? "В заключении есть HP+, а среди назначений распознаны ИПП, амоксициллин/клавуланат, кларитромицин и висмут. Проверьте дозы, длительность и переносимость с врачом."
        : "В заключении есть HP+, но распознанная схема выглядит неполной для локальной проверки. Проверьте, все ли препараты и режимы распознаны корректно.",
      source: "Локальная сверка диагноза и назначений"
    });
  }

  if ((hasDiagnosis("gerd") || hasDiagnosis("erosive_esophagitis")) && hasMedication("ppi")) {
    signals.push({
      severity: "low",
      title: "Рефлюкс-эзофагит и ИПП",
      context: "диагноз + назначения",
      body: "При рефлюкс-эзофагите среди назначений распознан ингибитор протонной помпы. Проверьте режим приема до еды и длительность курса.",
      source: "Локальная сверка диагноза и назначений"
    });
  }

  return signals;
}

function doctorDiagnosisLabSignals(diagnoses) {
  const latest = latestLabValues();
  const hasDiagnosis = (key) => diagnoses.some((item) => item.key === key);
  const signals = [];

  if (hasDiagnosis("dyslipidemia") && latest.ldl) {
    signals.push({
      severity: latest.ldl.value > 1.8 ? "moderate" : "low",
      title: "Диагноз и ЛПНП",
      context: "анализы",
      body: latest.ldl.value > 1.8
        ? `В заключении есть сердечно-сосудистый/липидный контекст, а последний ЛПНП ${formatNumber(latest.ldl.value)} ${latest.ldl.unit} выше персональной цели 1.8 ммоль/л.`
        : `В заключении есть липидный контекст, последний ЛПНП ${formatNumber(latest.ldl.value)} ${latest.ldl.unit}.`,
      source: `Анализ от ${formatDate(latest.ldl.date)}`
    });
  }

  if (hasDiagnosis("hypertension")) {
    if (latest.potassium && (latest.potassium.value > 5.2 || latest.potassium.value < 3.5)) {
      signals.push({
        severity: "moderate",
        title: "Гипертензия и калий",
        context: "анализы",
        body: `При гипертензии и терапии БРА/иАПФ/диуретиками полезно учитывать калий. Последнее значение: ${formatNumber(latest.potassium.value)} ${latest.potassium.unit}.`,
        source: `Анализ от ${formatDate(latest.potassium.date)}`
      });
    }
    if (latest.egfr && latest.egfr.value < 60) {
      signals.push({
        severity: "high",
        title: "Гипертензия и eGFR",
        context: "анализы",
        body: `Сниженная eGFR ${formatNumber(latest.egfr.value)} ${latest.egfr.unit} важна для выбора антигипертензивной терапии, НПВС и ряда других препаратов.`,
        source: `Анализ от ${formatDate(latest.egfr.date)}`
      });
    }
  }

  if (hasDiagnosis("diabetes") && latest.hba1c) {
    signals.push({
      severity: latest.hba1c.value >= 6.5 ? "moderate" : "low",
      title: "Диагноз и HbA1c",
      context: "анализы",
      body: `В заключении есть углеводный контекст. Последний HbA1c: ${formatNumber(latest.hba1c.value)} ${latest.hba1c.unit}.`,
      source: `Анализ от ${formatDate(latest.hba1c.date)}`
    });
  }

  if (hasDiagnosis("ckd") && latest.egfr) {
    signals.push({
      severity: latest.egfr.value < 60 ? "high" : "low",
      title: "Диагноз и функция почек",
      context: "анализы",
      body: `Для почечного диагноза важно сверить eGFR в динамике. Последнее значение: ${formatNumber(latest.egfr.value)} ${latest.egfr.unit}.`,
      source: `Анализ от ${formatDate(latest.egfr.date)}`
    });
  }

  if (hasDiagnosis("liver") && ((latest.alt && latest.alt.value >= 80) || (latest.ast && latest.ast.value >= 80))) {
    signals.push({
      severity: "moderate",
      title: "Печеночный диагноз и трансаминазы",
      context: "анализы",
      body: "В заключении есть печеночный контекст, а последние АЛТ/АСТ повышены. Это важно для препаратов с печеночным метаболизмом и потенциальной гепатотоксичностью.",
      source: "История анализов"
    });
  }

  return signals;
}

function doctorDiagnosisGeneticSignals(diagnoses) {
  const { profile } = parseProfile(patientData.value);
  const genes = Object.keys(profile);
  if (!diagnoses.length || !genes.length) return [];

  const hasDiagnosis = (key) => diagnoses.some((item) => item.key === key);
  const signals = [];
  const addContext = (title, relevantGenes, body) => {
    const found = relevantGenes.filter((gene) => genes.includes(gene));
    if (!found.length) return;
    signals.push({
      severity: "low",
      title,
      context: "генетика",
      body: `${body} Найденные PGx-маркеры: ${found.join(", ")}. Это не подтверждает и не опровергает диагноз, а помогает обсуждать терапию.`,
      source: "PGx-контекст заключения"
    });
  };

  if (hasDiagnosis("dyslipidemia")) {
    addContext(
      "Липидный диагноз и PGx статинов",
      ["SLCO1B1", "ABCG2", "CYP2C9"],
      "При липидном/сердечно-сосудистом диагнозе фармакогенетика может быть полезна для выбора и переносимости статинов."
    );
  }

  if (hasDiagnosis("dyslipidemia") || hasDiagnosis("hypertension")) {
    addContext(
      "Сердечно-сосудистый контекст и антиагреганты/антикоагулянты",
      ["CYP2C19", "CYP2C9", "VKORC1", "CYP4F2"],
      "Для отдельных антиагрегантов и варфарина PGx может влиять на эффективность, дозирование или риск кровотечений."
    );
  }

  if (hasDiagnosis("depression")) {
    addContext(
      "Психиатрический диагноз и PGx антидепрессантов",
      ["CYP2D6", "CYP2C19"],
      "Для части антидепрессантов CYP2D6/CYP2C19 влияет на концентрации, переносимость и риск недостаточного ответа."
    );
  }

  if (hasDiagnosis("oncology")) {
    addContext(
      "Онкологический контекст и PGx",
      ["DPYD", "UGT1A1", "CYP2D6"],
      "Для отдельных онкопрепаратов PGx может быть критичен для риска токсичности или эффективности."
    );
  }

  return signals;
}

function pgxCoverageSignals() {
  const { profile } = parseProfile(patientData.value);
  const genes = Object.keys(profile);
  const signals = [];
  const coveredGenes = [...new Set(rules.map((rule) => rule.gene))];
  const foundCovered = genes.filter((gene) => coveredGenes.includes(gene));
  const missingHighValue = ["DPYD", "VKORC1", "CYP3A5", "UGT1A1", "HLA-A*31:01", "HLA-B*15:02", "ABCG2", "CYP4F2"]
    .filter((gene) => !genes.includes(gene));

  signals.push({
    severity: foundCovered.length ? "low" : "moderate",
    title: foundCovered.length ? `Покрыто ${foundCovered.length} gene-drug генов` : "Нет совпадений с поддерживаемыми правилами",
    body: foundCovered.length
      ? `Найдены: ${foundCovered.join(", ")}. Эти гены уже используются в рекомендациях.`
      : "После загрузки VCF появится сверка по клопидогрелу, статинам, НПВС, ИПП, опиоидам, тиопуринам и HLA-находкам."
  });

  signals.push({
    severity: "low",
    title: "Следующие расширения базы",
    body: `Полезно добавить: ${missingHighValue.slice(0, 6).join(", ")}. Это расширит онкологию, антикоагулянты, трансплантологию и HLA-риски.`
  });

  return signals;
}

function integrationStatusSignals() {
  return [
    {
      severity: cloudReady ? "low" : "moderate",
      title: cloudReady ? "Supabase подключен" : "Работа в локальном режиме",
      body: cloudReady
        ? "Профиль, имя и распознанные показатели сохраняются в базе аккаунта."
        : "Без входа данные хранятся только в этом браузере."
    },
    {
      severity: "moderate",
      title: "Исходные PDF пока не сохраняются",
      body: "Сейчас сохраняются распознанные показатели. Следующий шаг: Supabase Storage для исходных файлов и повторной проверки."
    },
    {
      severity: "moderate",
      title: "OCR не подключен",
      body: "Текстовые PDF читаются хорошо, но сканы требуют OCR-слоя перед разбором."
    },
    {
      severity: "low",
      title: "RLS включен в схеме",
      body: "Миграция использует Row Level Security; браузер работает только с publishable key."
    }
  ];
}

function currentMedications() {
  return (getActiveProfile()?.metadata?.medications || []).map((item) => enrichMedication(item));
}

function activeMedications() {
  return currentMedications().filter((item) => !item.archived);
}

function archivedMedications() {
  return currentMedications()
    .filter((item) => item.archived)
    .sort((a, b) => String(b.archivedAt || b.endedAt || "").localeCompare(String(a.archivedAt || a.endedAt || "")));
}

function saveCurrentMedications(medications) {
  const profile = getActiveProfile();
  profile.metadata = { ...(profile.metadata || {}), medications: medications.map((item) => enrichMedication(item)) };
  saveCurrentProfileData();
}

async function addMedication() {
  const name = medicationName.value.trim();
  if (!name) return;

  const id = `med-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const medications = [
    ...currentMedications(),
    {
      id,
      name,
      dose: medicationDose.value.trim(),
      startedAt: medicationStart?.value || "",
      endedAt: medicationEnd?.value || "",
      note: medicationNote.value.trim()
    }
  ];
  medicationName.value = "";
  medicationDose.value = "";
  if (medicationStart) medicationStart.value = "";
  if (medicationEnd) medicationEnd.value = "";
  updateDateInputTone(medicationStart);
  updateDateInputTone(medicationEnd);
  medicationNote.value = "";
  saveCurrentMedications(medications);
  renderHealthBlocks();
  await lookupMedicationById(id, { silent: true });
}

function enrichMedication(medication) {
  const known = identifyMedication(medication.name);
  const manualSubstanceLabel = cleanMedicationSubstanceLabel(medication.manualSubstanceLabel || "");
  const cleanedSubstanceLabel = cleanMedicationSubstanceLabel(medication.substanceLabel || medication.substance || "");
  const substanceLabel = manualSubstanceLabel || known?.label || cleanedSubstanceLabel || "";
  const manualKnown = manualSubstanceLabel ? identifyMedication(manualSubstanceLabel) : null;
  const group = manualKnown?.group || known?.group || medication.group || "";
  const sourceName = manualSubstanceLabel ? "manual" : medication.sourceName || "";
  const shotList = findShotListMedication(medication.name, substanceLabel, group);
  return {
    ...medication,
    archived: Boolean(medication.archived),
    startedAt: medication.startedAt || medication.startDate || "",
    endedAt: medication.endedAt || medication.endDate || "",
    archivedAt: medication.archivedAt || "",
    substance: manualSubstanceLabel || known?.substance || cleanMedicationSubstanceLabel(medication.substance || "") || "",
    substanceLabel,
    manualSubstanceLabel,
    group,
    sourceName,
    sourceUrl: medication.sourceUrl || "",
    lookupConfidence: medication.lookupConfidence ?? null,
    shotList
  };
}

function identifyMedication(name) {
  const normalized = normalizeText(name || "");
  return medicationKnowledge.find((item) => item.aliases.some((alias) => normalized.includes(normalizeText(alias)))) || null;
}

function findShotListMedication(name, substanceLabel = "", group = "") {
  const normalized = normalizeText([name, substanceLabel].filter(Boolean).join(" "));
  return shotListMedications.find((item) => {
    const aliasMatch = item.aliases.some((alias) => normalized.includes(normalizeText(alias)));
    const groupMatch = group && (item.groups || []).includes(group);
    return aliasMatch || groupMatch;
  }) || null;
}

function removeMedication(id) {
  saveCurrentMedications(currentMedications().filter((item) => item.id !== id));
  renderHealthBlocks();
}

function archiveMedication(id) {
  const today = todayIsoDate();
  const medications = currentMedications().map((item) => item.id === id
    ? enrichMedication({
        ...item,
        archived: true,
        archivedAt: new Date().toISOString(),
        endedAt: item.endedAt || today
      })
    : item);
  saveCurrentMedications(medications);
  medicationLookupStatus.textContent = "Препарат перенесён в архив.";
  renderHealthBlocks();
}

function restoreMedication(id) {
  const medications = currentMedications().map((item) => item.id === id
    ? enrichMedication({
        ...item,
        archived: false,
        archivedAt: ""
      })
    : item);
  saveCurrentMedications(medications);
  medicationLookupStatus.textContent = "Препарат возвращён в текущий список.";
  renderHealthBlocks();
}

function showMoreArchivedMedications() {
  medicationArchiveOpen = true;
  archivedMedicationVisibleCount += 10;
  renderHealthBlocks();
}

function updateMedicationSubstance(id) {
  const input = [...medicationList.querySelectorAll("[data-substance-edit]")].find((item) => item.dataset.substanceEdit === id);
  const manualSubstanceLabel = cleanMedicationSubstanceLabel(input?.value || "");
  const known = manualSubstanceLabel ? identifyMedication(manualSubstanceLabel) : null;
  const updated = currentMedications().map((item) => {
    if (item.id !== id) return item;
    return enrichMedication({
      ...item,
      manualSubstanceLabel,
      substanceLabel: manualSubstanceLabel,
      substance: manualSubstanceLabel,
      group: known?.group || "",
      sourceName: manualSubstanceLabel ? "manual" : "",
      lookupConfidence: manualSubstanceLabel ? 1 : null
    });
  });
  saveCurrentMedications(updated);
  medicationLookupStatus.textContent = manualSubstanceLabel ? "Действующее вещество сохранено вручную." : "Ручная правка действующего вещества очищена.";
  renderHealthBlocks();
}

function renderMedicationProfile(signals) {
  const medications = activeMedications();
  const archive = archivedMedications();
  medicationCounter.textContent = `${medications.length} ${plural(medications.length, "текущий препарат", "текущих препарата", "текущих препаратов")}`;
  medicationList.innerHTML = [
    medications.length
      ? medications.map((item) => renderMedicationRow(item)).join("")
      : `<p class="file-status">Добавьте текущие препараты, чтобы сопоставить их с генетикой и анализами.</p>`,
    renderMedicationArchive(archive)
  ].filter(Boolean).join("");

  if (typeof medicationList.querySelectorAll === "function") {
    medicationList.querySelectorAll("[data-medication-archive]").forEach((drawer) => {
      drawer.addEventListener("toggle", () => {
        medicationArchiveOpen = drawer.open;
      });
    });
    medicationList.querySelectorAll("[data-archive-medication]").forEach((button) => {
      button.addEventListener("click", () => archiveMedication(button.dataset.archiveMedication));
    });
    medicationList.querySelectorAll("[data-remove-medication]").forEach((button) => {
      button.addEventListener("click", () => removeMedication(button.dataset.removeMedication));
    });
    medicationList.querySelectorAll("[data-restore-medication]").forEach((button) => {
      button.addEventListener("click", () => restoreMedication(button.dataset.restoreMedication));
    });
    medicationList.querySelectorAll("[data-show-more-archived-medications]").forEach((button) => {
      button.addEventListener("click", showMoreArchivedMedications);
    });
    medicationList.querySelectorAll("[data-save-substance]").forEach((button) => {
      button.addEventListener("click", () => updateMedicationSubstance(button.dataset.saveSubstance));
    });
    medicationList.querySelectorAll("[data-confirm-medication]").forEach((button) => {
      button.addEventListener("click", () => confirmMedicationRecognition(button.dataset.confirmMedication));
    });
  }

  const identified = medications.filter((item) => item.substanceLabel).length;
  updateMedicationsSectionMeta(medications, signals);
  medicationSummary.hidden = !medications.length && !archive.length;
  medicationSummary.innerHTML = medications.length
    ? `<strong>Действующее вещество:</strong> определено для ${identified} из ${medications.length} ${plural(medications.length, "текущего препарата", "текущих препаратов", "текущих препаратов")}. Если поле не определилось, откройте проверку на ПоискЛекарств или введите международное название вместо торгового.`
    : archive.length
      ? `<strong>Архив:</strong> в истории сохранено ${archive.length} ${plural(archive.length, "препарат", "препарата", "препаратов")}. Архивные препараты не участвуют в текущих предупреждениях.`
    : "";
  if (!medications.length && !archive.length) medicationLookupStatus.textContent = "";
  medicationChecks.innerHTML = signals.length ? renderPriorityGroups(signals, renderMedicationSignal) : "";
}

function renderMedicationRow(item) {
  const flags = medicationCardFlags(item);
  const visibleFlags = flags.length > 4 ? [...flags.slice(0, 3), { code: "…", label: "Все метки" }] : flags;
  return `
    <details class="medication-card">
      <summary class="medication-card-cover">
        <span class="medication-card-copy">
          <strong>${escapeHtml(item.name)}</strong>
          <span class="medication-card-substance">${escapeHtml(item.substanceLabel || "Действующее вещество не определено")}</span>
          <span class="medication-card-dose">${escapeHtml(item.dose || "Доза не указана")}</span>
        </span>
        ${visibleFlags.length ? `<span class="medication-flags" aria-label="Важные метки">${visibleFlags.map(renderMedicationFlag).join("")}</span>` : ""}
        <span class="medication-card-chevron" aria-hidden="true">⌄</span>
      </summary>
      <div class="medication-card-body">
        <dl class="medication-card-details">
          <div><dt>Действующее вещество</dt><dd>${medicationSubstanceHtml(item)}</dd></div>
          <div><dt>Дозировка / режим</dt><dd>${escapeHtml(item.dose || "Не указаны")}</dd></div>
          <div><dt>Курс</dt><dd>${escapeHtml(medicationCourseText(item))}</dd></div>
          <div><dt>Комментарий</dt><dd>${escapeHtml(medicationRowNote(item))}</dd></div>
        </dl>
        ${medicationConfirmationHtml(item)}
        ${renderSubstanceEditControl(item)}
        ${flags.length ? `<div class="medication-flag-details">${flags.map(renderMedicationFlagDetail).join("")}</div>` : ""}
        <div class="medication-card-actions">
          <button class="secondary-button" type="button" data-archive-medication="${escapeHtml(item.id)}">В архив</button>
          <button class="secondary-button danger-button" type="button" data-remove-medication="${escapeHtml(item.id)}">Удалить</button>
        </div>
      </div>
    </details>
  `;
}

function medicationCardFlags(item) {
  const haystack = normalizeText([
    item.name,
    item.substance,
    item.substanceLabel,
    item.group,
    item.dose,
    item.note,
    item.comment
  ].filter(Boolean).join(" "));
  const flags = [];
  const add = (enabled, code, label) => {
    if (enabled) flags.push({ code, label });
  };

  add(medicationAlcoholFlag(haystack), "А", "Алкоголь: есть ограничение или стоит уточнить");
  add(medicationPregnancyFlag(haystack), "Б", "Беременность: есть важные ограничения");
  add(medicationSleepinessFlag(haystack), "С", "Сонливость или вождение: стоит проверить");
  add(medicationTimingFlag(haystack), "В", "Время приёма или еда: есть указание");

  const directSignals = medicationRiskSignals([item]);
  const interactionSignals = medicationInteractionSignals(activeMedications());
  const hasInteractionSignal = interactionSignals.some((signal) => normalizeText(signal.medication).includes(normalizeText(item.name)));
  add(directSignals.length > 0 || hasInteractionSignal, "!", "Есть сочетания, анализы или генетические сигналы");
  add(medicationPrescriptionFlag(haystack), "Р", "Рецептурный препарат");
  add(Boolean(item.shotList), "РС", "Входит в критический справочный список");
  return flags;
}

function renderMedicationFlag(flag) {
  return `<span class="medication-flag" title="${escapeHtml(flag.label)}" aria-label="${escapeHtml(flag.label)}">${escapeHtml(flag.code)}</span>`;
}

function renderMedicationFlagDetail(flag) {
  return `<div><span class="medication-flag" aria-hidden="true">${escapeHtml(flag.code)}</span><span>${escapeHtml(flag.label)}</span></div>`;
}

function medicationAlcoholFlag(haystack) {
  return /(метронидазол|тинидазол|дисульфирам|варфарин|антикоагулянт|опиоид|трамадол|кодеин|бензодиазепин|диазепам|алпразолам|снотвор|седатив)/.test(haystack);
}

function medicationPregnancyFlag(haystack) {
  return /(варфарин|ретиноид|изотретиноин|метотрексат|вальпроат|микофенолат|ингибитор апф|лозартан|валсартан|статин|талидомид)/.test(haystack);
}

function medicationSleepinessFlag(haystack) {
  return /(опиоид|трамадол|кодеин|бензодиазепин|диазепам|алпразолам|антигистамин|цетиризин|лоратадин|снотвор|седатив|прегабалин|габапентин|амитриптилин)/.test(haystack);
}

function medicationTimingFlag(haystack) {
  return /(до еды|после еды|во время еды|натощак|за 30|за 15|утром|вечером|перед сном|рабепразол|эзомепразол|омепразол|ганатон|итоприд|де-нол|де нол|висмут|левотироксин)/.test(haystack);
}

function medicationPrescriptionFlag(haystack) {
  return /(антибиотик|амоксициллин|азитромицин|кларитромицин|антикоагулянт|варфарин|апиксабан|ривароксабан|статин|антидепрессант|сертралин|эсциталопрам|опиоид|трамадол|кодеин|бензодиазепин|гормон|левотироксин|такролимус|метотрексат)/.test(haystack);
}

function renderMedicationArchive(archive) {
  if (!archive.length) return "";
  const visible = archive.slice(0, archivedMedicationVisibleCount);
  const remaining = Math.max(0, archive.length - visible.length);
  return `
    <details class="medication-archive" data-medication-archive ${medicationArchiveOpen ? "open" : ""}>
      <summary>
        <span>Архив препаратов</span>
        <span class="archive-toggle" aria-hidden="true">
          <span class="archive-count">${archive.length}</span>
          <span class="archive-chevron">⌄</span>
        </span>
      </summary>
      <div class="medication-archive-list">
        ${visible.map(renderArchivedMedicationRow).join("")}
      </div>
      ${remaining ? `<button class="compact-link-button" type="button" data-show-more-archived-medications>Показать ещё ${Math.min(10, remaining)}</button>` : ""}
    </details>
  `;
}

function renderArchivedMedicationRow(item) {
  return `
    <article class="medication-row archived">
      <strong>${escapeHtml(item.name)}</strong>
      <span class="medication-substance-cell">${medicationSubstanceHtml(item)}</span>
      <span>${escapeHtml(item.dose || "Доза не указана")}</span>
      <span>${escapeHtml(medicationCourseText(item))}</span>
      <span>${escapeHtml(medicationArchiveNote(item))}</span>
      <div class="medication-row-actions">
        <button class="secondary-button" type="button" data-restore-medication="${escapeHtml(item.id)}">Вернуть</button>
        <button class="secondary-button" type="button" data-remove-medication="${escapeHtml(item.id)}">Удалить</button>
      </div>
    </article>
  `;
}

function medicationConfirmationHtml(item) {
  if (!item.needsConfirmation) return "";
  return `
    <small class="recognition-note">Из заключения врача · проверьте</small>
    <button class="inline-confirm-button" type="button" data-confirm-medication="${escapeHtml(item.id)}">Подтвердить</button>
  `;
}

function renderSubstanceEditControl(item) {
  return `
    <details class="substance-edit">
      <summary>${item.substanceLabel ? "Изменить вещество" : "Указать вещество"}</summary>
      <input type="text" value="${escapeHtml(item.manualSubstanceLabel || item.substanceLabel || "")}" placeholder="Например: такролимус" data-substance-edit="${escapeHtml(item.id)}" />
      <button class="secondary-button" type="button" data-save-substance="${escapeHtml(item.id)}">Сохранить</button>
    </details>
  `;
}

function confirmMedicationRecognition(id) {
  const medications = currentMedications().map((item) => item.id === id ? { ...item, needsConfirmation: false } : item);
  saveCurrentMedications(medications);
  medicationLookupStatus.textContent = "Распознавание препарата подтверждено.";
  renderHealthBlocks();
}

function medicationSubstanceHtml(item) {
  if (item.substanceLabel) {
    const source = medicationSourceLabel(item);
    return `${escapeHtml(item.substanceLabel)}${source ? `<small>${escapeHtml(source)}</small>` : ""}`;
  }
  return `
    <span class="unknown-substance">Не определено</span>
    <small>
      <a href="${escapeHtml(googleMedicationSearchUrl(item.name))}" target="_blank" rel="noopener noreferrer">искать в Google</a>
    </small>
  `;
}

function medicationSourceLabel(item) {
  if (!item.sourceName) return "";
  const labels = {
    "local medication dictionary": "Справочник",
    "doctor conclusion": "Заключение врача",
    "poisklekarstv.com": "ПоискЛекарств",
    manual: "Вручную"
  };
  return `Источник: ${labels[item.sourceName] || item.sourceName}`;
}

async function lookupMissingMedicationSubstances() {
  const medications = activeMedications();
  const targets = medications.filter((item) => !item.substanceLabel);
  if (!medications.length) {
    medicationLookupStatus.textContent = "Добавьте препараты, чтобы уточнить действующие вещества.";
    return;
  }
  if (!targets.length) {
    medicationLookupStatus.textContent = "Для всех препаратов действующее вещество уже определено.";
    return;
  }

  medicationLookupStatus.textContent = `Уточняю ${targets.length} ${plural(targets.length, "препарат", "препарата", "препаратов")} через backend...`;
  let updated = 0;
  for (const item of targets) {
    const didUpdate = await lookupMedicationById(item.id, { silent: true });
    if (didUpdate) updated += 1;
  }
  medicationLookupStatus.textContent = updated
    ? `Обновлено ${updated} ${plural(updated, "препарат", "препарата", "препаратов")}.`
    : "Backend не нашел новых действующих веществ.";
}

async function lookupMedicationById(id, options = {}) {
  const medications = currentMedications();
  const medication = medications.find((item) => item.id === id);
  if (!medication || medication.substanceLabel) return false;

  const result = await lookupMedicationBackend(medication.name);
  if (!result?.substanceLabel && !result?.shotListCategory) {
    if (!options.silent) medicationLookupStatus.textContent = `Не удалось уточнить: ${medication.name}.`;
    return false;
  }

  const known = result.substanceLabel ? identifyMedication(result.substanceLabel) : null;
  const updated = medications.map((item) => {
    if (item.id !== id) return item;
    return enrichMedication({
      ...item,
      substance: result.substance || item.substance,
      substanceLabel: result.substanceLabel || item.substanceLabel,
      group: item.group || known?.group || "",
      sourceName: result.sourceName || item.sourceName,
      sourceUrl: result.sourceUrl || item.sourceUrl,
      lookupConfidence: result.confidence ?? item.lookupConfidence,
      shotList: result.shotListCategory
        ? {
            label: result.shotListMatch || item.name,
            category: result.shotListCategory,
            note: result.shotListNote || ""
          }
        : item.shotList
    });
  });
  saveCurrentMedications(updated);
  renderHealthBlocks();
  return true;
}

async function lookupMedicationBackend(name) {
  if (!supabaseClient || !window.PGX_SUPABASE?.url) {
    medicationLookupStatus.textContent = "Backend недоступен: Supabase SDK не загружен.";
    return null;
  }

  const { data } = await supabaseClient.auth.getSession();
  const token = data.session?.access_token || window.PGX_SUPABASE.anonJwt || "";
  const apiKey = window.PGX_SUPABASE.anonJwt || token;
  if (!token) {
    medicationLookupStatus.textContent = "Войдите в аккаунт, чтобы уточнять препараты через backend.";
    return null;
  }

  try {
    const response = await fetch(`${window.PGX_SUPABASE.url}/functions/v1/lookup-medication`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name })
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      medicationLookupStatus.textContent = `Backend не ответил: ${payload?.message || payload?.error || response.status}`;
      return null;
    }
    return payload;
  } catch (error) {
    medicationLookupStatus.textContent = `Backend недоступен: ${error.message}`;
    return null;
  }
}

function poiskLekarstvUrl(name) {
  const slug = transliterateForSlug(name);
  return slug
    ? `https://www.poisklekarstv.com/catalog/${encodeURIComponent(slug)}.html`
    : `https://www.poisklekarstv.com/`;
}

function googleMedicationSearchUrl(name) {
  const query = `${name} действующее вещество`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function cleanMedicationSubstanceLabel(value) {
  return String(value || "")
    .replace(/\s*poisklekarstv\.com\s*,?\s*\d+%?/gi, "")
    .replace(/\s+(категория|болезни|цена|цены|производитель|форма выпуска|фармакологическое действие|состав|аналоги|отзывы|инструкция)(\s|:|-|$).*$/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function transliterateForSlug(value) {
  const map = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y",
    к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
    х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya"
  };
  return normalizeText(value)
    .trim()
    .split("")
    .map((char) => map[char] ?? char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function medicationRowNote(item) {
  const parts = [];
  if (item.note) parts.push(item.note);
  if (item.shotList) parts.push(`РСП: ${item.shotList.category}`);
  return parts.join(" · ") || "Комментарий не указан";
}

function medicationArchiveNote(item) {
  const parts = [];
  if (item.archivedAt) parts.push(`Архивировано ${formatDateTime(item.archivedAt)}`);
  const note = medicationRowNote(item);
  if (note !== "Комментарий не указан") parts.push(note);
  return parts.join(" · ") || "Архивная запись";
}

function medicationCourseText(item) {
  if (item.startedAt && item.endedAt) return `Курс: ${formatDate(item.startedAt)} — ${formatDate(item.endedAt)}`;
  if (item.startedAt) return `С ${formatDate(item.startedAt)}`;
  if (item.endedAt) return `До ${formatDate(item.endedAt)}`;
  return "Сроки не указаны";
}

function renderMedicationSignal(signal) {
  return `
    <article class="result-card ${escapeHtml(signal.severity)}">
      <div class="result-title">
        <strong>${escapeHtml(signal.title)}</strong>
        <span class="badge">${escapeHtml(signal.evidenceLevel || signal.medication)}</span>
      </div>
      <p class="recommendation">${escapeHtml(signal.body)}</p>
      ${signal.evidenceLevel ? `<p class="source source-metadata">${escapeHtml([`Препарат: ${signal.medication}`, evidenceSummary(signal)].join(" · "))}</p>` : ""}
      <p class="source">${escapeHtml(signal.source)}</p>
    </article>
  `;
}

function medicationRiskSignals(sourceMedications) {
  const medications = sourceMedications || activeMedications();
  if (!medications.length) return [];

  const { profile, evidence } = parseProfile(patientData.value);
  const latest = latestLabValues();
  const signals = [];
  for (const medication of medications) {
    const name = normalizeText(medication.name);
    const has = (...needles) => needles.some((needle) => name.includes(normalizeText(needle)));
    const isGroup = (...groups) => groups.includes(medication.group);

    signals.push(...medicationPgxRuleSignals(medication, profile, evidence));

    if (medication.shotList) {
      signals.push({
        severity: medication.shotList.category === "гомеопатия" ? "high" : "moderate",
        medication: medication.name,
        title: `Расстрельный список: ${medication.shotList.category}`,
        body: `${medication.shotList.label}: ${medication.shotList.note}`,
        source: "Encyclopedia Pathologica, Расстрельный список препаратов"
      });
    }

    if (isGroup("statin", "statin_combo") || has("статин", "розувастатин", "аторвастатин", "симвастатин", "rosuvastatin", "atorvastatin", "simvastatin")) {
      if (["decreased function", "poor function"].includes(profile.SLCO1B1)) {
        signals.push({
          severity: profile.SLCO1B1 === "poor function" ? "high" : "moderate",
          medication: medication.name,
          title: "Статин + SLCO1B1",
          body: "Найдена фармакогенетическая находка повышенного риска мышечных симптомов для отдельных статинов.",
          source: "CPIC/FDA statin PGx"
        });
      }
      if (latest.ck && latest.ck.value > 190) {
        signals.push({
          severity: "moderate",
          medication: medication.name,
          title: "Статин + повышенная КФК",
          body: `Последняя КФК ${formatNumber(latest.ck.value)} ${latest.ck.unit}. Это полезный контекст для оценки переносимости статина.`,
          source: `Анализ от ${formatDate(latest.ck.date)}`
        });
      }
    }

    if (isGroup("antiplatelet") || has("клопидогрел", "clopidogrel", "плавикс")) {
      if (["poor metabolizer", "intermediate metabolizer"].includes(profile.CYP2C19)) {
        signals.push({
          severity: profile.CYP2C19 === "poor metabolizer" ? "high" : "moderate",
          medication: medication.name,
          title: "Клопидогрел + CYP2C19",
          body: "Сниженная функция CYP2C19 может уменьшать образование активного метаболита клопидогрела.",
          source: "CPIC/FDA CYP2C19-clopidogrel"
        });
      }
    }

    if (isGroup("nsaid") || has("нпвс", "ибупрофен", "диклофенак", "целекоксиб", "meloxicam", "ibuprofen", "diclofenac", "celecoxib")) {
      if (latest.egfr && latest.egfr.value < 60) {
        signals.push({
          severity: "high",
          medication: medication.name,
          title: "НПВС + сниженная eGFR",
          body: "Сниженная фильтрация почек может повышать риск нежелательных эффектов НПВС.",
          source: `Анализ от ${formatDate(latest.egfr.date)}`
        });
      }
      if (["poor metabolizer", "intermediate metabolizer"].includes(profile.CYP2C9)) {
        signals.push({
          severity: "moderate",
          medication: medication.name,
          title: "НПВС + CYP2C9",
          body: "Сниженная функция CYP2C9 может повышать экспозицию ряда НПВС.",
          source: "CPIC CYP2C9-NSAIDs"
        });
      }
    }

    if (isGroup("opioid_cyp2d6") || has("кодеин", "трамадол", "codeine", "tramadol")) {
      if (["poor metabolizer", "ultrarapid metabolizer"].includes(profile.CYP2D6)) {
        signals.push({
          severity: "high",
          medication: medication.name,
          title: "Опиоид + CYP2D6",
          body: "Для кодеина и трамадола крайние фенотипы CYP2D6 могут менять эффективность или риск токсичности.",
          source: "CPIC CYP2D6-opioids"
        });
      }
    }

    if (isGroup("ppi") || has("омепразол", "эзомепразол", "пантопразол", "omeprazole", "esomeprazole", "pantoprazole")) {
      if (["poor metabolizer", "rapid metabolizer", "ultrarapid metabolizer"].includes(profile.CYP2C19)) {
        signals.push({
          severity: "moderate",
          medication: medication.name,
          title: "ИПП + CYP2C19",
          body: "Фенотип CYP2C19 может влиять на экспозицию и эффект ингибиторов протонной помпы.",
          source: "CPIC CYP2C19-PPIs"
        });
      }
    }
  }

  return [...signals, ...medicationInteractionSignals(medications)];
}

function medicationPgxRuleSignals(medication, profile, evidence) {
  const coveredByLegacyChecks = new Set([
    "statins-slco1b1",
    "clopidogrel-cyp2c19",
    "nsaids-cyp2c9",
    "opioids-cyp2d6",
    "ppis-cyp2c19"
  ]);
  const haystack = medicationRuleHaystack(medication);

  return rules
    .filter((rule) => !coveredByLegacyChecks.has(rule.id))
    .map((rule) => {
      const phenotype = profile[rule.gene];
      const recommendation = phenotype ? rule.matches[phenotype] : null;
      if (!recommendation || !medicationMatchesRule(haystack, rule)) return null;

      return {
        severity: rule.severity,
        medication: medication.name,
        title: rule.drug + " + " + rule.gene,
        body: recommendation + " Найдено: " + (evidence[rule.gene] || phenotype) + ".",
        source: rule.source,
        evidenceLevel: rule.evidenceLevel,
        guidelineSource: rule.guidelineSource,
        regulatorySource: rule.regulatorySource,
        actionability: rule.actionability
      };
    })
    .filter(Boolean);
}

function medicationRuleHaystack(medication) {
  return normalizeText([
    medication.name,
    medication.substanceLabel,
    medication.substance,
    medication.group
  ].filter(Boolean).join(" "));
}

function medicationMatchesRule(haystack, rule) {
  return [rule.drug, ...(rule.aliases || [])]
    .map((value) => normalizeText(value))
    .filter(Boolean)
    .some((alias) => haystack.includes(alias) || alias.includes(haystack));
}

function medicationInteractionSignals(medications) {
  const signals = [];
  const groups = (group) => medications.filter((item) => item.group === group);
  const firstNames = (items) => items.map((item) => item.name).join(" + ");
  const nsaids = groups("nsaid");
  const antiplatelets = [...groups("antiplatelet"), ...groups("antiplatelet_asa")];
  const anticoagulants = groups("anticoagulant");
  const ppis = groups("ppi");
  const clopidogrels = groups("antiplatelet");

  if (nsaids.length > 1) {
    signals.push({
      severity: "high",
      medication: firstNames(nsaids),
      title: "Два НПВС одновременно",
      body: "Комбинация нескольких НПВС обычно повышает риск желудочно-кишечных, почечных и сердечно-сосудистых нежелательных эффектов без понятного выигрыша.",
      source: "Локальное правило medication profile"
    });
  }

  if (nsaids.length && antiplatelets.length) {
    signals.push({
      severity: "moderate",
      medication: firstNames([...nsaids, ...antiplatelets]),
      title: "НПВС + антиагрегант",
      body: "Такое сочетание может повышать риск кровотечений и повреждения ЖКТ; важны показания, срок приема и гастропротекция.",
      source: "Локальное правило medication profile"
    });
  }

  if (nsaids.length && anticoagulants.length) {
    signals.push({
      severity: "high",
      medication: firstNames([...nsaids, ...anticoagulants]),
      title: "НПВС + антикоагулянт",
      body: "Комбинация может существенно повышать риск кровотечений; требует отдельной оценки врачом.",
      source: "Локальное правило medication profile"
    });
  }

  if (anticoagulants.length && antiplatelets.length) {
    signals.push({
      severity: "high",
      medication: firstNames([...anticoagulants, ...antiplatelets]),
      title: "Антикоагулянт + антиагрегант",
      body: "Комбинация может быть оправдана только при конкретных показаниях и повышает риск кровотечений.",
      source: "Локальное правило medication profile"
    });
  }

  if (clopidogrels.length && ppis.some((item) => ["omeprazole", "esomeprazole"].includes(item.substance))) {
    signals.push({
      severity: "moderate",
      medication: firstNames([...clopidogrels, ...ppis]),
      title: "Клопидогрел + омепразол/эзомепразол",
      body: "Омепразол и эзомепразол могут быть нежелательны как сопутствующие ИПП при клопидогреле из-за CYP2C19-контекста; пантопразол часто рассматривают как более нейтральный вариант.",
      source: "Локальное правило medication profile + CYP2C19 context"
    });
  }

  return signals;
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

  context.strokeStyle = "#0e7c7b";
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
    context.strokeStyle = "#096766";
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
    context.fillStyle = "rgba(14, 124, 123, 0.08)";
    context.fillRect(plotLeft, Math.min(yMinRef, yMaxRef), plotRight - plotLeft, Math.abs(yMinRef - yMaxRef));
  }

  for (const item of [
    { value: min, label: "min" },
    { value: max, label: "max" }
  ]) {
    if (item.value === null) continue;
    const y = yFor(item.value);
    context.strokeStyle = item.label === "min" ? "#61a9a5" : "#b4413c";
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
  if (!value || !String(value).includes("-")) return String(value || "");
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
}

function formatShortDate(value) {
  const [, month, day] = value.split("-");
  return `${day}.${month}`;
}

function formatNumber(value) {
  return Number(value).toLocaleString("ru-RU", { maximumFractionDigits: 3 });
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
  updateGeneticsSectionMeta(matches, genes);

  if (!patientData.value.trim()) {
    summaryEl.className = "summary empty";
    summaryEl.textContent = "Загрузите пример или вставьте данные, чтобы увидеть важные gene-drug находки.";
    resultsEl.innerHTML = "";
    renderHealthBlocks();
    return;
  }

  if (matches.length === 0) {
    summaryEl.className = "summary empty";
    summaryEl.textContent = genes.length
      ? `Распознано: ${genes.join(", ")}. Для выбранного фильтра активных рекомендаций не найдено.`
      : "Не удалось надежно распознать генетические маркеры. Попробуйте формат вроде CYP2C19 *2/*2 или rs4149056 TC.";
    resultsEl.innerHTML = "";
    renderHealthBlocks();
    return;
  }

  const highCount = matches.filter((match) => match.severity === "high").length;
  summaryEl.className = "summary";
  summaryEl.textContent = `Найдено ${matches.length} ${plural(matches.length, "важная находка", "важные находки", "важных находок")}. ${highCount ? `Важно обсудить: ${highCount}. ` : ""}Обсудите эти пункты с врачом до любых изменений терапии.`;

  resultsEl.innerHTML = renderPriorityGroups(matches, renderCard);
  renderHealthBlocks();
}

function renderPriorityGroups(items, renderItem) {
  const groups = [
    {
      severity: "high",
      title: "Важно обсудить с врачом",
      note: "Важные находки, где возможны значимые ограничения, риски или необходимость альтернативы."
    },
    {
      severity: "moderate",
      title: "Учесть при наблюдении",
      note: "Контекст для выбора терапии, мониторинга анализов или проверки дозировок."
    },
    {
      severity: "low",
      title: "Справочно",
      note: "Низкоприоритетные подсказки и информационные совпадения."
    }
  ];

  return groups
    .map((group) => {
      const groupItems = items.filter((item) => (item.severity || "low") === group.severity);
      if (!groupItems.length) return "";
      return `
        <section class="priority-group priority-${group.severity}">
          <div class="priority-heading">
            <div>
              <strong>${group.title}</strong>
              <span>${group.note}</span>
            </div>
            <span class="mini-counter">${groupItems.length}</span>
          </div>
          <div class="priority-items">
            ${groupItems.map(renderItem).join("")}
          </div>
        </section>
      `;
    })
    .join("");
}

function renderCard(match) {
  return `
    <article class="result-card ${match.severity}">
      <div class="result-title">
        <strong>${escapeHtml(match.drug)}</strong>
        <span class="badge">${escapeHtml(match.evidenceLevel || `CPIC ${match.evidence}`)}</span>
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
        <div class="fact">
          <span>Источник</span>
          <strong>${escapeHtml(sourceLabel(match))}</strong>
        </div>
        <div class="fact">
          <span>Применимость</span>
          <strong>${escapeHtml(actionabilityLabel(match.actionability))}</strong>
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

function sourceLabel(item) {
  return [item.guidelineSource, item.regulatorySource].filter(Boolean).join(" + ") || "не указан";
}

function evidenceSummary(item) {
  return [
    item.evidenceLevel,
    sourceLabel(item),
    actionabilityLabel(item.actionability)
  ].filter(Boolean).join(" · ");
}

function actionabilityLabel(value) {
  return {
    actionable: "возможное действие",
    clinical_context: "контекст терапии",
    reference: "справочно"
  }[value] || "не указано";
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
