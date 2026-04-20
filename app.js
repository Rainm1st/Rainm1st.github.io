const STORE_KEY = "trainerSync_state_v4";
const SYNC_CHANNEL_KEY = "trainerSync_state_channel_v1";
const AUTH_SESSION_KEY = "trainerSync_auth_session_v1";
const TRAINEE_USERS_KEY = "trainerSync_trainee_users_v1";
const COACH_BINDINGS_KEY = "trainerSync_coach_bindings_v1";
const LOGIN_DISABLED = false;
const $ = (id) => document.getElementById(id);
const COACH_ACCOUNTS = [
  { username: "coach_c3", password: "C3Coach@208" },
  { username: "coach_demo", password: "Demo@208" }
];

const PET_META = [
  { id: "panda", name: "铁铁熊", icon: "🐼" },
  { id: "fox", name: "疾风狐", icon: "🦊" },
  { id: "cat", name: "灵动猫", icon: "🐱" },
  { id: "dog", name: "冲刺犬", icon: "🐶" }
];

const MEDIA_FALLBACK_MAP = {
  eq_ab_crunch_machine: { equipment: "eq_ab_crunch_machine", exercise: "ex_ab_crunch_machine" },
  eq_assisted_pullup: { equipment: "eq_assisted_pullup", exercise: "ex_assisted_pullup" },
  eq_biceps_curl_machine: { equipment: "eq_biceps_curl_machine", exercise: "ex_biceps_curl_machine" },
  eq_cable_station: { equipment: "eq_cable_station", exercise: "ex_face_pull" },
  eq_free_weight: { equipment: "eq_free_weight", exercise: "ex_hip_thrust" },
  eq_high_row: { equipment: "eq_high_row", exercise: "ex_high_row" },
  eq_hip_abduction: { equipment: "eq_hip_abduction", exercise: "ex_hip_abduction" },
  eq_hip_adduction: { equipment: "eq_hip_adduction", exercise: "ex_hip_adduction" },
  eq_hip_thrust_machine: { equipment: "eq_hip_thrust_machine", exercise: "ex_hip_thrust" },
  eq_lat_pulldown: { equipment: "eq_lat_pulldown", exercise: "ex_lat_pulldown" },
  eq_leg_curl: { equipment: "eq_leg_curl", exercise: "ex_leg_curl" },
  eq_leg_extension: { equipment: "eq_leg_extension", exercise: "ex_leg_extension" },
  eq_seated_chest_press: { equipment: "eq_seated_chest_press", exercise: "ex_seated_chest_press" },
  eq_seated_leg_press: { equipment: "eq_seated_leg_press", exercise: "ex_leg_press" },
  eq_seated_row: { equipment: "eq_seated_row", exercise: "ex_seated_row" }
};


const FALLBACK_DATA = {
  muscleOptions: {
    chest: [{ key: "pectoralis_major", label: "胸大肌 Pectoralis major" }, { key: "pectoralis_minor", label: "胸小肌 Pectoralis minor" }],
    back: [{ key: "latissimus_dorsi", label: "背阔肌 Latissimus dorsi" }, { key: "trapezius", label: "斜方肌 Trapezius" }, { key: "rhomboids", label: "菱形肌 Rhomboids" }, { key: "erector_spinae", label: "竖脊肌 Erector spinae" }],
    shoulders: [{ key: "anterior_deltoid", label: "三角肌前束 Anterior deltoid" }, { key: "middle_deltoid", label: "三角肌中束 Middle deltoid" }, { key: "posterior_deltoid", label: "三角肌后束 Posterior deltoid" }],
    legs_glutes: [{ key: "quadriceps", label: "股四头肌 Quadriceps" }, { key: "hamstrings", label: "腘绳肌 Hamstrings" }, { key: "glute_max", label: "臀大肌 Gluteus maximus" }],
    arms: [{ key: "biceps", label: "肱二头肌 Biceps brachii" }, { key: "triceps", label: "肱三头肌 Triceps brachii" }],
    core: [{ key: "rectus_abdominis", label: "腹直肌 Rectus abdominis" }, { key: "obliques", label: "腹斜肌 Obliques" }]
  },
  exercises: [
    { id: "seated_chest_press", name: "坐姿推胸机 Seated chest press", group: "chest", secondary: ["pectoralis_major"], type: "fixed", movement: ["push"], focus: "胸大肌为主", ins: "座椅与中胸平齐，推起不锁肘，回程慢放。", beginnerPlan: "2-3组 x 10-12次，RPE 6-7", advancedPlan: "4组 x 6-10次，RPE 7-9" },
    { id: "lat_pulldown", name: "高位下拉机 Lat pulldown", group: "back", secondary: ["latissimus_dorsi", "trapezius"], type: "fixed", movement: ["pull"], focus: "背阔肌和上背部", ins: "先沉肩再下拉到上胸，避免后仰借力。", beginnerPlan: "2-3组 x 10-12次，RPE 6-7", advancedPlan: "4组 x 6-10次，RPE 7-9" },
    { id: "seated_row", name: "坐姿划船机 Seated row", group: "back", secondary: ["latissimus_dorsi", "rhomboids"], type: "fixed", movement: ["pull"], focus: "背阔肌、菱形肌", ins: "躯干稳定，拉向腹部，肩胛后缩后慢放。", beginnerPlan: "2-3组 x 10-12次，RPE 6-7", advancedPlan: "4组 x 8-12次，RPE 7-9" },
    { id: "face_pull", name: "绳索面拉 Face pull", group: "shoulders", secondary: ["posterior_deltoid"], type: "cable", movement: ["pull"], focus: "后三角与肩袖稳定", ins: "拉向额头，肘自然外展，肩胛后缩。", beginnerPlan: "2组 x 12-15次，RPE 6-7", advancedPlan: "3-4组 x 12-15次，RPE 7-8" },
    { id: "leg_press", name: "坐姿腿举机 Leg press", group: "legs_glutes", secondary: ["quadriceps", "glute_max"], type: "fixed", movement: ["knee_extend", "hip_extend"], focus: "股四头/臀部", ins: "背部贴垫，屈膝约90度后蹬伸，避免锁膝。", beginnerPlan: "2-3组 x 10-12次，RPE 6-7", advancedPlan: "4组 x 8-12次，RPE 7-9" },
    { id: "biceps_curl_machine", name: "二头弯举机 Biceps curl machine", group: "arms", secondary: ["biceps"], type: "fixed", movement: ["elbow_flex"], focus: "肱二头肌", ins: "肘轴对齐，屈肘卷起把手，离心慢放。", beginnerPlan: "2组 x 12次，RPE 6-7", advancedPlan: "3-4组 x 8-12次，RPE 7-9" },
    { id: "ab_crunch_machine", name: "卷腹机 Abdominal crunch machine", group: "core", secondary: ["rectus_abdominis"], type: "fixed", movement: ["push"], focus: "腹直肌", ins: "收紧核心卷曲躯干，避免只用手拉。", beginnerPlan: "2-3组 x 12-15次，RPE 6-7", advancedPlan: "4组 x 10-15次，RPE 7-8" }
  ]
};

let LIB = FALLBACK_DATA;

/** 心率曲线采样（仅内存，不写入 localStorage） */
const HR_HISTORY_MAX = 48;
let hrHistory = [];
let hrChart = null;

const MUSCLE_CHIPS = [
  { value: "all", label: "全部" },
  { value: "chest", label: "胸" },
  { value: "back", label: "背" },
  { value: "shoulders", label: "肩" },
  { value: "legs_glutes", label: "腿臀" },
  { value: "arms", label: "臂" },
  { value: "core", label: "核心" }
];

const SELECT_CHIP_BINDINGS = [
  { selectId: "secondaryFilter", chipsId: "secondaryChips", key: "selectedSecondary", resetEquipment: true },
  { selectId: "equipmentTypeFilter", chipsId: "equipmentTypeChips", key: "selectedEquipmentType", resetEquipment: true },
  { selectId: "movementFilter", chipsId: "movementChips", key: "selectedMovement", resetEquipment: true },
  { selectId: "levelFilter", chipsId: "levelChips", key: "level", resetEquipment: false },
  { selectId: "equipmentFilter", chipsId: "equipmentNameChips", key: "selectedEquipmentFilter", resetEquipment: false }
];

const defaultState = {
  trainee: {
    name: "学员A",
    hr: null,
    hrSimRunning: false,
    energy: 0,
    petLevel: 1,
    buff: false,
    buffUntil: 0,
    stage: "热身中",
    strategy: "未下发",
    completion: 0,
    level: "beginner",
    selectedMuscle: "all",
    selectedSecondary: "all",
    selectedEquipmentType: "all",
    selectedMovement: "all",
    selectedEquipmentFilter: "all",
    selectedEquipment: "",
    petId: "",
    challengeReps: 0,
    equipmentDone: {},
    log: []
  }
};

let authSession = null;
let authRole = "trainee";
let traineeAuthMode = "login";
let exerciseDataLoaded = false;
const authFailMap = { trainee: 0, coach: 0 };
const ENABLE_ACTION_TOASTS = false;
let coachSelectedTrainee = "";
let coachTargetSet = new Set();
let state = loadState();
let hrTimer = null;
let hrTickCount = 0;
let syncChannel = null;
const uiCache = {
  secondarySig: "",
  equipNameSig: "",
  equipListSig: "",
  badgeSig: "",
  coachUsersSig: "",
  coachLogSig: "",
  recoSig: ""
};

function loadState() {
  const raw = localStorage.getItem(getStoreKey());
  if (!raw) return structuredClone(defaultState);
  try { return JSON.parse(raw); } catch { return structuredClone(defaultState); }
}
function getStoreKey(username) {
  const user = username || (authSession && authSession.role === "trainee" ? authSession.username : "");
  return user ? `${STORE_KEY}_${user}` : STORE_KEY;
}
function saveState(fromSync) {
  localStorage.setItem(getStoreKey(), JSON.stringify(state));
  if (!fromSync && syncChannel) {
    syncChannel.postMessage({ type: "state-updated", at: Date.now() });
  }
}
function loadTraineeState(username) {
  const raw = localStorage.getItem(getStoreKey(username));
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
function saveTraineeState(username, snapshot) {
  localStorage.setItem(getStoreKey(username), JSON.stringify(snapshot));
  if (syncChannel) syncChannel.postMessage({ type: "state-updated", at: Date.now() });
}
function log(msg) {
  const t = new Date().toLocaleTimeString();
  state.trainee.log.unshift("[" + t + "] " + msg);
  state.trainee.log = state.trainee.log.slice(0, 30);
}

let toastSeq = 0;
function showToast(message, duration = 2600, variant) {
  if (!ENABLE_ACTION_TOASTS && variant !== "force") return;
  const box = $("toastRegion");
  if (!box || !message) return;
  const id = ++toastSeq;
  const el = document.createElement("div");
  el.className = "toast" + (variant ? ` toast-${variant}` : "");
  el.setAttribute("role", "status");
  el.textContent = message;
  box.appendChild(el);
  requestAnimationFrame(() => {
    el.classList.add("toast-visible");
  });
  window.setTimeout(() => {
    if (id !== toastSeq) return;
    el.classList.remove("toast-visible");
    window.setTimeout(() => el.remove(), 320);
  }, duration);
}

function loadSession() {
  const raw = localStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
function saveSession(session) {
  authSession = session;
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}
function clearSession() {
  authSession = null;
  localStorage.removeItem(AUTH_SESSION_KEY);
}
function loadTraineeUsers() {
  const raw = localStorage.getItem(TRAINEE_USERS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}
function saveTraineeUsers(users) {
  localStorage.setItem(TRAINEE_USERS_KEY, JSON.stringify(users));
}
function loadCoachBindings() {
  const raw = localStorage.getItem(COACH_BINDINGS_KEY);
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}
function saveCoachBindings(map) {
  localStorage.setItem(COACH_BINDINGS_KEY, JSON.stringify(map));
}
function getBoundTraineesForCoach(coachUsername) {
  const map = loadCoachBindings();
  const list = map[coachUsername] || [];
  return Array.from(new Set(list));
}
function setBoundTraineesForCoach(coachUsername, trainees) {
  const map = loadCoachBindings();
  map[coachUsername] = Array.from(new Set(trainees));
  saveCoachBindings(map);
}
function getBoundCoachesForTrainee(traineeUsername) {
  if (!traineeUsername) return [];
  const map = loadCoachBindings();
  const res = [];
  Object.keys(map).forEach((coach) => {
    if ((map[coach] || []).includes(traineeUsername)) res.push(coach);
  });
  return res;
}
function findTrainee(username, password) {
  return loadTraineeUsers().find((u) => u.username === username && u.password === password) || null;
}
function findCoach(username, password) {
  return COACH_ACCOUNTS.find((u) => u.username === username && u.password === password) || null;
}
function setView(tab) {
  document.querySelectorAll(".tab-btn").forEach((x) => x.classList.toggle("active", x.dataset.tab === tab));
  document.querySelectorAll(".view").forEach((v) => {
    const on = v.id === tab;
    v.classList.toggle("active", on);
    v.toggleAttribute("hidden", !on);
  });
}
function updateAuthPanel() {
  const modeRow = $("traineeModeRow");
  const extra = $("registerExtraRow");
  const hint = $("authHint");
  const quickTip = $("authQuickTip");
  const roleSel = $("authRoleSelect");
  const passwordInput = $("authPassword");
  const confirmInput = $("authPasswordConfirm");
  if (roleSel) roleSel.value = authRole;
  if (authRole === "coach") traineeAuthMode = "login";
  if (modeRow) modeRow.toggleAttribute("hidden", authRole !== "trainee");
  if (extra) extra.toggleAttribute("hidden", !(authRole === "trainee" && traineeAuthMode === "register"));
  if (hint) hint.textContent = authRole === "coach" ? "教练仅支持登录，账号由项目组发放。" : "学员可自由注册并登录。";
  if (quickTip) {
    if (authRole === "coach") {
      quickTip.textContent = "演示教练账号：coach_c3 / C3Coach@208";
    } else if (traineeAuthMode === "register") {
      quickTip.textContent = "注册成功后将自动进入学员端。";
    } else {
      quickTip.textContent = "首次使用请切换到“注册”，创建学员账号。";
    }
  }
  if (passwordInput) passwordInput.autocomplete = authRole === "trainee" && traineeAuthMode === "register" ? "new-password" : "current-password";
  if (confirmInput) confirmInput.autocomplete = "new-password";
  document.querySelectorAll(".auth-mode-btn").forEach((b) => b.classList.toggle("active", b.dataset.mode === traineeAuthMode));
}
function setAuthStatus(msg, ok) {
  const box = $("authStatus");
  if (!box) return;
  if (!msg) {
    box.hidden = true;
    box.textContent = "";
    box.classList.remove("ok");
    return;
  }
  box.hidden = false;
  box.textContent = msg;
  box.classList.toggle("ok", !!ok);
}
function togglePasswordInput(inputId, btnId) {
  const input = $(inputId);
  const btn = $(btnId);
  if (!input || !btn) return;
  const hidden = input.type === "password";
  input.type = hidden ? "text" : "password";
  btn.textContent = hidden ? "隐藏" : "显示";
}
function applySessionUI() {
  if (LOGIN_DISABLED) {
    document.body.classList.add("authed");
    const gate = $("authGate");
    const headerAccount = $("headerAccount");
    const tabs = document.querySelector(".header .tabs");
    if (gate) gate.hidden = true;
    if (headerAccount) headerAccount.hidden = true;
    if (tabs) tabs.hidden = true;
    return;
  }
  const authed = !!authSession;
  document.body.classList.toggle("authed", authed);
  const gate = $("authGate");
  const headerAccount = $("headerAccount");
  const tabs = document.querySelector(".header .tabs");
  const sessionPill = $("sessionPill");
  if (tabs) tabs.hidden = true;
  if (!authed) {
    if (gate) gate.hidden = false;
    if (headerAccount) headerAccount.hidden = true;
    return;
  }
  if (gate) gate.hidden = true;
  if (headerAccount) headerAccount.hidden = false;
  if (sessionPill) sessionPill.textContent = `${authSession.role === "coach" ? "教练" : "学员"}：${authSession.username}`;
  if (authSession.role === "coach") {
    setView("coachView");
  } else {
    state = loadState();
    ensure();
    setView("traineeView");
  }
}
function ensureExerciseDataLoaded() {
  if (exerciseDataLoaded) return;
  exerciseDataLoaded = true;
  loadExerciseData();
}
function attemptAuth() {
  if (LOGIN_DISABLED) return;
  const username = ($("authUsername")?.value || "").trim();
  const password = ($("authPassword")?.value || "").trim();
  const confirm = ($("authPasswordConfirm")?.value || "").trim();
  setAuthStatus("");
  if (!username || !password) {
    setAuthStatus("请填写账号和密码");
    showToast("请填写账号和密码", 2200, "force");
    return;
  }
  if (authRole === "coach") {
    if (username.length < 4) {
      setAuthStatus("教练账号格式不正确");
      showToast("教练账号格式不正确", 2200, "force");
      return;
    }
    const coach = findCoach(username, password);
    if (!coach) {
      authFailMap.coach += 1;
      setAuthStatus(`教练账号或密码错误（已失败 ${authFailMap.coach} 次）`);
      showToast("教练账号或密码错误", 2200, "force");
      return;
    }
    authFailMap.coach = 0;
    setAuthStatus("登录成功，正在进入教练端…", true);
    saveSession({ role: "coach", username, loginAt: Date.now() });
    const bound = getBoundTraineesForCoach(username);
    coachSelectedTrainee = bound[0] || "";
    coachTargetSet = new Set(bound.slice(0, 1));
    applySessionUI();
    showToast("教练登录成功", 1800, "force");
    renderAll();
    ensureExerciseDataLoaded();
    return;
  }
  if (traineeAuthMode === "register") {
    if (!/^[a-zA-Z0-9_]{4,20}$/.test(username)) {
      setAuthStatus("账号需为 4-20 位字母/数字/下划线");
      showToast("账号格式不正确", 2200, "force");
      return;
    }
    if (password.length < 4) {
      setAuthStatus("密码至少 4 位");
      showToast("密码至少 4 位", 2200, "force");
      return;
    }
    if (password !== confirm) {
      setAuthStatus("两次输入密码不一致");
      showToast("两次输入密码不一致", 2200, "force");
      return;
    }
    const users = loadTraineeUsers();
    if (users.some((u) => u.username === username)) {
      setAuthStatus("账号已存在，请直接登录");
      showToast("账号已存在，请直接登录", 2200, "force");
      return;
    }
    users.push({ username, password, createdAt: Date.now() });
    saveTraineeUsers(users);
    saveSession({ role: "trainee", username, loginAt: Date.now() });
    state = structuredClone(defaultState);
    state.trainee.name = username;
    log("新学员注册并登录：" + username);
    saveState(false);
    setAuthStatus("注册成功，正在进入学员端…", true);
    applySessionUI();
    showToast("注册成功，已进入学员端", 1800, "force");
    renderAll();
    ensureExerciseDataLoaded();
    return;
  }
  const trainee = findTrainee(username, password);
  if (!trainee) {
    authFailMap.trainee += 1;
    setAuthStatus(`学员账号不存在或密码错误（已失败 ${authFailMap.trainee} 次）`);
    showToast("学员账号不存在或密码错误", 2200, "force");
    return;
  }
  authFailMap.trainee = 0;
  saveSession({ role: "trainee", username, loginAt: Date.now() });
  state = loadState();
  ensure();
  state.trainee.name = username;
  setAuthStatus("登录成功，正在进入学员端…", true);
  applySessionUI();
  showToast("学员登录成功", 1800, "force");
  renderAll();
  ensureExerciseDataLoaded();
}
function bindAuthEvents() {
  if (LOGIN_DISABLED) return;
  const roleSel = $("authRoleSelect");
  if (roleSel) roleSel.addEventListener("change", (e) => { authRole = e.target.value; updateAuthPanel(); });
  document.querySelectorAll(".auth-mode-btn").forEach((btn) => btn.addEventListener("click", () => {
    traineeAuthMode = btn.dataset.mode;
    updateAuthPanel();
  }));
  bindClick("authSubmitBtn", attemptAuth);
  bindClick("toggleAuthPasswordBtn", () => togglePasswordInput("authPassword", "toggleAuthPasswordBtn"));
  bindClick("toggleAuthPasswordConfirmBtn", () => togglePasswordInput("authPasswordConfirm", "toggleAuthPasswordConfirmBtn"));
  ["authUsername", "authPassword", "authPasswordConfirm"].forEach((id) => {
    const el = $(id);
    if (!el) return;
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") attemptAuth();
    });
    el.addEventListener("input", () => setAuthStatus(""));
  });
  bindClick("logoutBtn", () => {
    stopSim({ silent: true });
    coachSelectedTrainee = "";
    coachTargetSet = new Set();
    clearSession();
    applySessionUI();
    showToast("已退出登录", 1500, "force");
  });
}

function setDynamicBackground(hr) {
  const root = document.documentElement;
  const z = zone(hr).k;
  root.dataset.zone = z;
  if (z === "high") {
    root.style.setProperty("--glow-speed", "4.5s");
    root.style.setProperty("--bg-heat", "1");
    return;
  }
  if (z === "target") {
    root.style.setProperty("--glow-speed", "7s");
    root.style.setProperty("--bg-heat", "0.45");
    return;
  }
  root.style.setProperty("--glow-speed", "10s");
  root.style.setProperty("--bg-heat", "0");
}

function initHrChart() {
  if (typeof Chart === "undefined") return;
  const canvas = document.getElementById("hrChartCanvas");
  if (!canvas || hrChart) return;
  const wrap = canvas.closest(".hr-chart-wrap");
  if (wrap) wrap.setAttribute("aria-hidden", "false");
  hrChart = new Chart(canvas, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "bpm",
        data: [],
        borderColor: "#5b7bff",
        backgroundColor: "rgba(91,123,255,0.14)",
        borderWidth: 2,
        tension: 0.35,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: { intersect: false, mode: "index" },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => (ctx.parsed.y != null ? `${ctx.parsed.y} bpm` : "")
          }
        }
      },
      scales: {
        x: { display: false },
        y: {
          min: 80,
          max: 185,
          grid: { color: "rgba(91,123,255,0.08)" },
          ticks: { maxTicksLimit: 5, font: { size: 10 } }
        }
      }
    }
  });
}

function pushHrSample(hr) {
  hrHistory.push(hr);
  if (hrHistory.length > HR_HISTORY_MAX) hrHistory.shift();
  if (!hrChart) initHrChart();
  if (!hrChart) return;
  hrChart.data.labels = hrHistory.map((_, i) => String(i + 1));
  hrChart.data.datasets[0].data = hrHistory.slice();
  hrChart.update("none");
}

function resetHrChartVisual() {
  hrHistory = [];
  if (hrChart) {
    hrChart.data.labels = [];
    hrChart.data.datasets[0].data = [];
    hrChart.update("none");
  }
  const wrap = document.querySelector(".hr-chart-wrap");
  if (wrap) wrap.setAttribute("aria-hidden", "true");
}

function getExercises() { return LIB.exercises || []; }
function getMuscleOptions(group) { return (LIB.muscleOptions && LIB.muscleOptions[group]) || []; }

function ensure() {
  if (!state.trainee.petId) state.trainee.petId = PET_META[Math.floor(Math.random() * PET_META.length)].id;
  if (!state.trainee.level) state.trainee.level = "beginner";
  if (!state.trainee.selectedSecondary) state.trainee.selectedSecondary = "all";
  if (!state.trainee.selectedEquipmentType) state.trainee.selectedEquipmentType = "all";
  if (!state.trainee.selectedMovement) state.trainee.selectedMovement = "all";
  if (!state.trainee.selectedEquipmentFilter) state.trainee.selectedEquipmentFilter = "all";
  getExercises().forEach(x => { if (typeof state.trainee.equipmentDone[x.id] !== "boolean") state.trainee.equipmentDone[x.id] = false; });
}

function zone(hr) {
  if (hr == null) return { k: "low", t: "状态：待检测" };
  if (hr < 120) return { k: "low", t: "状态：低于目标区间" };
  if (hr <= 150) return { k: "target", t: "状态：处于目标区间" };
  return { k: "high", t: "状态：高于目标区间" };
}

function filtered() {
  const t = state.trainee;
  return getExercises().filter(ex =>
    (t.selectedMuscle === "all" || ex.group === t.selectedMuscle) &&
    (t.selectedSecondary === "all" || (ex.secondary || []).includes(t.selectedSecondary)) &&
    (t.selectedEquipmentType === "all" || ex.type === t.selectedEquipmentType) &&
    (t.selectedMovement === "all" || (ex.movement || []).includes(t.selectedMovement)) &&
    (t.selectedEquipmentFilter === "all" || ex.id === t.selectedEquipmentFilter)
  );
}

function computeCompletion() {
  const total = getExercises().length || 1;
  const done = Object.values(state.trainee.equipmentDone).filter(Boolean).length;
  state.trainee.completion = Math.round((done / total) * 100);
}

function fillSecondary() {
  const sel = $("secondaryFilter");
  if (!sel) return;
  const opts = state.trainee.selectedMuscle === "all" ? [] : getMuscleOptions(state.trainee.selectedMuscle);
  const sig = `${state.trainee.selectedMuscle}|${opts.map((o) => o.key).join(",")}`;
  if (uiCache.secondarySig !== sig) {
    sel.innerHTML = `<option value="all">二级筛选：全部专业肌肉</option>` + opts.map((o) => `<option value="${o.key}">${o.label}</option>`).join("");
    uiCache.secondarySig = sig;
  }
  if (![...sel.options].some(o => o.value === state.trainee.selectedSecondary)) state.trainee.selectedSecondary = "all";
  sel.value = state.trainee.selectedSecondary;
}

function fillEquipmentName() {
  const sel = $("equipmentFilter");
  if (!sel) return;
  const sig = getExercises().map((ex) => ex.id).join("|");
  if (uiCache.equipNameSig !== sig) {
    sel.innerHTML = `<option value="all">器械名称：全部</option>` + getExercises().map((ex) => `<option value="${ex.id}">${ex.name}</option>`).join("");
    uiCache.equipNameSig = sig;
  }
  if (![...sel.options].some(o => o.value === state.trainee.selectedEquipmentFilter)) state.trainee.selectedEquipmentFilter = "all";
  sel.value = state.trainee.selectedEquipmentFilter;
}

function renderEquipList(list) {
  const box = $("equipList");
  if (!box) return;
  const sig = list.map((ex) => `${ex.id}:${state.trainee.equipmentDone[ex.id] ? 1 : 0}:${state.trainee.selectedEquipment === ex.id ? 1 : 0}`).join("|");
  if (sig === uiCache.equipListSig) return;
  uiCache.equipListSig = sig;
  box.innerHTML = list.map((ex) =>
    `<div class="equip ${state.trainee.selectedEquipment === ex.id ? "active" : ""}" data-equip="${ex.id}">
      <span>${ex.name}<br /><span class="small">${ex.type} | ${(ex.movement || []).join(", ")}</span></span>
      <span class="pill">${state.trainee.equipmentDone[ex.id] ? "已完成" : "未完成"}</span>
    </div>`
  ).join("") || '<div class="small">当前筛选下无器械，请调整筛选条件。</div>';
}

function renderBadgeWallCached() {
  const box = $("badgeWall");
  if (!box) return;
  const sig = getExercises().map((ex) => `${ex.id}:${state.trainee.equipmentDone[ex.id] ? 1 : 0}`).join("|");
  if (sig === uiCache.badgeSig) return;
  uiCache.badgeSig = sig;
  box.innerHTML = getExercises().slice(0, 12).map((ex) =>
    `<div class="badge ${state.trainee.equipmentDone[ex.id] ? "on" : ""}"><div style="font-size:22px;">${state.trainee.equipmentDone[ex.id] ? "🏅" : "⭕"}</div><div>${ex.name.split(" ")[0]}</div></div>`
  ).join("");
}

function computeCoachAdvice(t) {
  if (!t) return "指导建议：请先绑定并选择学员。";
  const z = zone(t.hr).k;
  if (z === "high") return "指导建议：当前心率偏高，建议将负荷降低 10%-20%，延长组间休息，并检查动作节奏。";
  if (z === "low") return "指导建议：当前刺激不足，建议提高阻力或缩短休息，并加入 1 组主力动作。";
  const equip = t.selectedEquipment || "未选择器械";
  return `指导建议：心率处于目标区间，维持当前节奏。当前器械：${equip}，可继续按既定计划推进。`;
}

function renderCoachBindings() {
  const select = $("coachTraineeSelect");
  const chips = $("boundTrainees");
  const targets = $("coachTargets");
  if (!select || !chips || !authSession || authSession.role !== "coach") return;
  const coach = authSession.username;
  const bound = getBoundTraineesForCoach(coach);
  const allTrainees = loadTraineeUsers().map((u) => u.username);
  select.innerHTML = `<option value="">请选择学员</option>` + allTrainees.map((name) => `<option value="${name}">${name}${bound.includes(name) ? "（已绑定）" : ""}</option>`).join("");
  if (!coachSelectedTrainee || !allTrainees.includes(coachSelectedTrainee)) coachSelectedTrainee = bound[0] || allTrainees[0] || "";
  select.value = coachSelectedTrainee;
  chips.innerHTML = bound.length ? bound.map((name) => `<span class="recommend-chip">${name}</span>`).join("") : `<span class="recommend-chip">当前无绑定学员</span>`;
  if (bound.length === 0) coachTargetSet = new Set();
  coachTargetSet = new Set([...coachTargetSet].filter((name) => bound.includes(name)));
  if (coachSelectedTrainee && bound.includes(coachSelectedTrainee)) coachTargetSet.add(coachSelectedTrainee);
  if (targets) {
    targets.innerHTML = bound.length
      ? bound.map((name) => `<button type="button" class="recommend-chip ${coachTargetSet.has(name) ? "active" : ""}" data-target="${name}">${name}</button>`).join("")
      : `<span class="recommend-chip">暂无可下发目标</span>`;
    if (targets.dataset.bound !== "1") {
      targets.dataset.bound = "1";
      targets.addEventListener("click", (e) => {
        const b = e.target.closest("[data-target]");
        if (!b) return;
        const name = b.dataset.target;
        if (coachTargetSet.has(name)) coachTargetSet.delete(name); else coachTargetSet.add(name);
        renderCoachBindings();
      });
    }
  }
}

function getCoachViewingTrainee() {
  if (!authSession || authSession.role !== "coach" || !coachSelectedTrainee) return null;
  const bound = getBoundTraineesForCoach(authSession.username);
  if (!bound.includes(coachSelectedTrainee)) return null;
  const snapshot = loadTraineeState(coachSelectedTrainee);
  return snapshot ? snapshot.trainee : null;
}

function renderCoachUsersCached() {
  const box = $("coachUsers");
  if (!box) return;
  const t = authSession && authSession.role === "coach" ? getCoachViewingTrainee() : state.trainee;
  if (!t) {
    box.innerHTML = `<div class="user-row"><div><b>未选择学员</b><div class="small">请先绑定并选择学员</div></div><span class="pill">心率：--</span><span class="pill">完成：--</span></div>`;
    const advice = $("coachAdvice");
    if (advice) advice.textContent = computeCoachAdvice(null);
    return;
  }
  const sig = `${t.hr}|${t.stage}|${t.strategy}|${t.completion}|${t.selectedMuscle}|${t.selectedSecondary}|${t.selectedEquipmentType}|${t.selectedMovement}|${t.level}|${t.selectedEquipment}|${Math.floor(t.energy)}`;
  if (sig === uiCache.coachUsersSig) return;
  uiCache.coachUsersSig = sig;
  box.innerHTML = `<div class="user-row"><div><b>${t.name}</b><div class="small">阶段：${t.stage} ｜ 策略：${t.strategy}</div></div><span class="pill">心率：${t.hr ?? "--"} bpm</span><span class="pill">完成：${t.completion}%</span></div><div class="user-row"><div><b>筛选状态</b><div class="small">一级：${t.selectedMuscle} ｜ 二级：${t.selectedSecondary}</div></div><span class="pill">器械：${t.selectedEquipmentType}</span><span class="pill">动作：${t.selectedMovement}</span></div><div class="user-row"><div><b>训练等级</b><div class="small">${t.level === "advanced" ? "进阶者" : "初学者"}</div></div><span class="pill">当前器械：${t.selectedEquipment || "未选择"}</span><span class="pill">活力：${Math.floor(t.energy)}</span></div>`;
  const advice = $("coachAdvice");
  if (advice) advice.textContent = computeCoachAdvice(t);
}

function renderCoachLogCached() {
  const box = $("coachLog");
  if (!box) return;
  const target = authSession && authSession.role === "coach" ? getCoachViewingTrainee() : state.trainee;
  if (!target) {
    box.innerHTML = "<p>暂无日志</p>";
    return;
  }
  const sig = target.log.join("\n");
  if (sig === uiCache.coachLogSig) return;
  uiCache.coachLogSig = sig;
  box.innerHTML = target.log.length ? target.log.slice(0, 20).map((x) => "<p>" + x + "</p>").join("") : "<p>暂无日志</p>";
}
function renderMyCoaches() {
  const box = $("myCoaches");
  if (!box || !authSession || authSession.role !== "trainee") return;
  const list = getBoundCoachesForTrainee(authSession.username);
  box.innerHTML = list.length ? list.map((c) => `<span class="recommend-chip">${c}</span>`).join("") : `<span class="recommend-chip">暂未绑定教练</span>`;
}

function toAssetWebPath(path) {
  return String(path || "").replace(/\\/g, "/");
}

function resolveMediaKey(ex) {
  if (!ex) return "";
  if (Array.isArray(ex.equipment_ids) && ex.equipment_ids.length) return ex.equipment_ids[0];
  const byId = {
    seated_chest_press: "eq_seated_chest_press",
    lat_pulldown: "eq_lat_pulldown",
    seated_row: "eq_seated_row",
    face_pull: "eq_cable_station",
    leg_press: "eq_seated_leg_press",
    biceps_curl_machine: "eq_biceps_curl_machine",
    ab_crunch_machine: "eq_ab_crunch_machine"
  };
  return byId[ex.id] || "";
}

function getMediaPaths(ex) {
  const key = resolveMediaKey(ex);
  const fallback = MEDIA_FALLBACK_MAP[key];
  if (!fallback) return null;
  return {
    equipmentImg: `./assets/equipment/${fallback.equipment}/eq_${fallback.equipment.replace(/^eq_/, "")}.jpeg`,
    exerciseImg: `./assets/equipment/${fallback.equipment}/${fallback.exercise}.jpeg`
  };
}

function renderGuide(ex) {
  const title = $("mediaTitle"), video = $("videoPlaceholder"), image = $("imagePlaceholder"), guide = $("exerciseGuide");
  if (!title || !video || !image || !guide) return;
  if (!ex) {
    title.innerHTML = "<b>动作指导占位：未选择器械</b>";
    video.innerHTML = "[ 视频占位符 ]<br />选择器械后展示对应视频区域";
    image.innerHTML = "[ 图片占位符 ]<br />选择器械后展示动作图解区域";
    guide.textContent = "文字版使用说明：请选择器械查看具体动作说明与训练目标。";
    return;
  }
  const level = state.trainee.level;
  const plan = level === "advanced" ? (ex.advancedPlan || "4组 x 6-10次，RPE 7-9") : (ex.beginnerPlan || "2-3组 x 10-12次，RPE 6-7");
  const media = getMediaPaths(ex);
  title.innerHTML = `<b>动作指导：${ex.name}</b>`;
  if (media) {
    video.innerHTML = `<div class="media-title">器械示意图</div><img class="media-img" src="${toAssetWebPath(media.equipmentImg)}" alt="${ex.name} 器械示意图" />`;
    image.innerHTML = `<div class="media-title">动作示意图</div><img class="media-img" src="${toAssetWebPath(media.exerciseImg)}" alt="${ex.name} 动作示意图" />`;
  } else {
    video.innerHTML = `[ 视频占位符 ]<br />${ex.name} 教学视频`;
    image.innerHTML = `[ 图片占位符 ]<br />${ex.name} 动作分解图`;
  }
  guide.textContent = `使用说明：${ex.ins} 目标：${ex.focus} 训练处方（${level === "advanced" ? "进阶者" : "初学者"}）：${plan}`;
}

function renderPet(ex) {
  const p = PET_META.find(x => x.id === state.trainee.petId) || PET_META[0];
  const id = $("petIdentity"), mode = $("petMode"), avatar = $("petAvatar"), text = $("petActionText");
  if (!id || !mode || !avatar || !text) return;
  id.textContent = "灵宠陪伴：" + p.name;
  avatar.classList.remove("active", "action-lift", "action-climb");
  avatar.textContent = p.icon;
  mode.textContent = "待机";
  text.textContent = "灵宠正在观察你的训练，准备同步动作。";
  if (!ex) return;
  avatar.classList.add("active");
  const running = state.trainee.hrSimRunning;
  const isCardio = ex.name.includes("跑步机") || ex.name.includes("单车");
  const isLift = (ex.movement || []).includes("elbow_flex") || (ex.movement || []).includes("push");
  if (isCardio) {
    mode.textContent = "爬坡";
    avatar.textContent = p.icon + "⛰️";
    text.textContent = running ? "灵宠正在爬坡冲刺，与你同步。" : "已选择有氧器械，开始模拟后灵宠爬坡。";
    if (running) avatar.classList.add("action-climb");
    return;
  }
  if (isLift) {
    mode.textContent = "举哑铃";
    avatar.textContent = p.icon + "🏋️";
    text.textContent = running ? "灵宠同步器械发力。" : "已选择力量器械，开始模拟后灵宠举重。";
    if (running) avatar.classList.add("action-lift");
    return;
  }
  mode.textContent = "专注";
  avatar.textContent = p.icon + "✨";
  text.textContent = "灵宠进入专注辅助状态。";
}

function renderChallenge() {
  const reps = state.trainee.challengeReps;
  const target = 20;
  if ($("challengeText")) $("challengeText").textContent = `${reps} / ${target} reps`;
  if ($("challengeBar")) $("challengeBar").style.width = Math.max(0, Math.min(100, reps / target * 100)) + "%";
}

function renderReco() {
  const box = $("recommendList");
  if (!box) return;
  const level = state.trainee.level === "advanced" ? "进阶" : "初学";
  const rec = filtered().slice(0, 3);
  const sig = `${level}|${rec.map((r) => r.id).join(",")}`;
  if (sig === uiCache.recoSig) return;
  uiCache.recoSig = sig;
  box.innerHTML = rec.length
    ? rec.map(r => `<span class="recommend-chip">${r.name}（${level}）</span>`).join("")
    : `<span class="recommend-chip">当前筛选无匹配动作，建议放宽筛选条件。</span>`;
}

function renderMuscleChips() {
  const box = $("muscleChips");
  if (!box) return;
  if (!box.dataset.bound) {
    box.innerHTML = MUSCLE_CHIPS.map((c) =>
      `<button type="button" class="filter-chip" data-muscle="${c.value}">${c.label}</button>`
    ).join("");
    box.dataset.bound = "1";
    box.addEventListener("click", (e) => {
      const b = e.target.closest(".filter-chip");
      if (!b || !box.contains(b)) return;
      state.trainee.selectedMuscle = b.dataset.muscle;
      state.trainee.selectedSecondary = "all";
      state.trainee.selectedEquipmentFilter = "all";
      log("一级筛选：" + state.trainee.selectedMuscle);
      showToast("已切换肌群筛选");
      renderAll();
    });
  }
  box.querySelectorAll(".filter-chip").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.muscle === state.trainee.selectedMuscle);
  });
}

function bindEquipListOnce() {
  const list = $("equipList");
  if (!list || list.dataset.bound === "1") return;
  list.dataset.bound = "1";
  list.addEventListener("click", (e) => {
    const node = e.target.closest(".equip");
    if (!node || !list.contains(node) || !node.dataset.equip) return;
    state.trainee.selectedEquipment = node.dataset.equip;
    log("选择器械：" + state.trainee.selectedEquipment);
    showToast("已选择器械");
    renderAll();
  });
}

function renderSelectChips({ selectId, chipsId, key, resetEquipment }) {
  const sel = $(selectId);
  const chips = $(chipsId);
  if (!sel || !chips) return;
  const opts = [...sel.options].map((o) => ({ value: o.value, text: o.textContent || o.value }));
  const sig = opts.map((o) => `${o.value}:${o.text}`).join("|");
  if (chips.dataset.sig !== sig) {
    chips.innerHTML = opts.map((o) => `<button type="button" class="filter-chip filter-chip-dense" data-value="${o.value}">${o.text.replace(/^[^：]*：/, "")}</button>`).join("");
    chips.dataset.sig = sig;
  }
  chips.querySelectorAll(".filter-chip").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.value === state.trainee[key]);
  });
  if (chips.dataset.bound === "1") return;
  chips.dataset.bound = "1";
  chips.addEventListener("click", (e) => {
    const b = e.target.closest(".filter-chip");
    if (!b || !chips.contains(b)) return;
    state.trainee[key] = b.dataset.value;
    sel.value = b.dataset.value;
    if (resetEquipment) state.trainee.selectedEquipmentFilter = "all";
    if (key === "selectedEquipmentFilter" && b.dataset.value !== "all") state.trainee.selectedEquipment = b.dataset.value;
    if (key === "selectedMuscle") state.trainee.selectedSecondary = "all";
    log("筛选更新：" + key + " => " + b.dataset.value);
    renderAll();
  });
}

function render() {
  ensure();
  computeCompletion();
  const t = state.trainee;
  renderVitals(t);

  if ($("muscleFilter")) $("muscleFilter").value = t.selectedMuscle;
  if ($("equipmentTypeFilter")) $("equipmentTypeFilter").value = t.selectedEquipmentType;
  if ($("movementFilter")) $("movementFilter").value = t.selectedMovement;
  if ($("levelFilter")) $("levelFilter").value = t.level;

  fillSecondary();
  fillEquipmentName();
  renderMuscleChips();
  SELECT_CHIP_BINDINGS.forEach(renderSelectChips);
  bindEquipListOnce();
  const list = filtered();
  renderEquipList(list);
  const selected = getExercises().find(ex => ex.id === t.selectedEquipment);
  renderGuide(selected);
  renderPet(selected);
  renderReco();
  renderChallenge();
  renderMyCoaches();
  renderBadgeWallCached();
  renderCoachBindings();
  renderCoachUsersCached();
  renderCoachLogCached();
  saveState(false);
}

function renderVitals(t) {
  if ($("hrNum")) $("hrNum").textContent = t.hr == null ? "--" : t.hr;
  if ($("hrRing")) $("hrRing").style.setProperty("--p", (t.hr == null ? 0 : Math.max(0, Math.min(100, ((t.hr - 80) / 100) * 100))) + "%");
  const z = zone(t.hr);
  setDynamicBackground(t.hr);
  if ($("zoneBadge")) { $("zoneBadge").className = "zone " + z.k; $("zoneBadge").textContent = z.t; }
  if ($("energyVal")) $("energyVal").textContent = Math.floor(t.energy);
  if ($("petLevel")) $("petLevel").textContent = "Lv." + t.petLevel;
  if ($("buffState")) $("buffState").textContent = t.buff ? "Double XP" : "Normal";
  if ($("completeRate")) $("completeRate").textContent = t.completion + "%";
  if ($("stageText")) $("stageText").textContent = t.stage;
  if ($("toggleSimBtn")) $("toggleSimBtn").textContent = t.hrSimRunning ? "停止模拟心率" : "启动模拟心率";
}

function renderRealtimeTick() {
  const t = state.trainee;
  renderVitals(t);
  const selected = getExercises().find((ex) => ex.id === t.selectedEquipment);
  renderPet(selected);
  renderCoachUsersCached();
  saveState(false);
}

function renderAll() { render(); }
function startSim() {
  if (hrTimer) return;
  state.trainee.hrSimRunning = true;
  resetHrChartVisual();
  initHrChart();
  hrTimer = setInterval(() => {
    if (document.hidden) return;
    hrTickCount += 1;
    const base = state.trainee.stage === "主训练" ? 138 : state.trainee.stage === "恢复" ? 112 : 125;
    const hr = Math.max(85, Math.min(178, base + Math.round((Math.random() - 0.5) * 22)));
    state.trainee.hr = hr;
    pushHrSample(hr);
    const zk = zone(hr).k;
    let gain = zk === "target" ? 2 : zk === "low" ? 0.5 : 0.2;
    if (Date.now() < state.trainee.buffUntil) { state.trainee.buff = true; gain *= 2; } else state.trainee.buff = false;
    state.trainee.energy = Math.min(9999, +(state.trainee.energy + gain).toFixed(1));
    state.trainee.petLevel = Math.max(1, Math.floor(state.trainee.energy / 80) + 1);
    if (hrTickCount % 3 === 0) log("心率更新：" + hr + " bpm");
    renderRealtimeTick();
  }, 1200);
  log("已启动模拟心率");
  showToast("心率模拟已启动，曲线实时更新");
  renderAll();
}
function stopSim(opts) {
  const silent = opts && opts.silent;
  state.trainee.hrSimRunning = false;
  clearInterval(hrTimer);
  hrTimer = null;
  log("已停止模拟心率");
  if (!silent) showToast("已停止心率模拟");
  renderAll();
}
function bindClick(id, fn) { const el = $(id); if (el) el.addEventListener("click", fn); }

document.querySelectorAll(".tab-btn").forEach((btn) => btn.addEventListener("click", () => {
  if (authSession) return;
  const tabs = document.querySelector(".header .tabs");
  if (tabs && tabs.hidden) return;
  document.querySelectorAll(".tab-btn").forEach((x) => x.classList.toggle("active", x === btn));
  document.querySelectorAll(".view").forEach((v) => {
    const on = v.id === btn.dataset.tab;
    v.classList.toggle("active", on);
    v.toggleAttribute("hidden", !on);
  });
  showToast(btn.dataset.tab === "coachView" ? "已切换到教练端" : "已切换到学员端");
}));

(function bindCoachStrategies() {
  const coach = document.getElementById("coachView");
  if (!coach) return;
  coach.addEventListener("click", (e) => {
    const s = e.target.closest(".strategy-btn");
    if (!s || !coach.contains(s)) return;
    const targets = [...coachTargetSet];
    if (targets.length === 0) return;
    const now = "[" + new Date().toLocaleTimeString() + "] ";
    targets.forEach((targetName) => {
      const target = loadTraineeState(targetName);
      if (!target || !target.trainee) return;
      target.trainee.strategy = s.dataset.strategy || "未下发";
      target.trainee.log = target.trainee.log || [];
      target.trainee.log.unshift(now + "教练策略：" + target.trainee.strategy);
      target.trainee.log = target.trainee.log.slice(0, 30);
      saveTraineeState(targetName, target);
    });
    renderAll();
  });
})();

bindClick("toggleSimBtn", () => state.trainee.hrSimRunning ? stopSim() : startSim());
bindClick("demoBtn", () => {
  showToast("正在播放一键 Demo…");
  const seq = ["热身中", "主训练", "主训练", "拉伸", "恢复"];
  const hrs = [118, 132, 146, 124, 108];
  seq.forEach((st, i) => setTimeout(() => {
    state.trainee.stage = st;
    state.trainee.hr = hrs[i];
    pushHrSample(hrs[i]);
    const f = filtered();
    if (f[i]) { state.trainee.selectedEquipment = f[i].id; state.trainee.equipmentDone[f[i].id] = true; }
    state.trainee.challengeReps = Math.min(20, state.trainee.challengeReps + 4);
    log("Demo阶段：" + st + "（" + hrs[i] + " bpm）");
    renderAll();
    if (i === seq.length - 1) showToast("Demo 完成：可继续手动操作");
  }, i * 800));
});
document.querySelectorAll(".stage").forEach(btn => btn.addEventListener("click", () => { state.trainee.stage = btn.dataset.stage; log("阶段切换：" + btn.dataset.stage); renderAll(); }));
bindClick("finishTaskBtn", () => {
  const id = state.trainee.selectedEquipment;
  if (!id) { log("请先选择器械"); showToast("请先选择一项器械"); renderAll(); return; }
  state.trainee.equipmentDone[id] = true;
  state.trainee.energy += 12;
  state.trainee.challengeReps = Math.min(20, state.trainee.challengeReps + 3);
  log("完成器械任务：" + id);
  showToast("已完成当前器械任务");
  renderAll();
});
bindClick("restBtn", () => { state.trainee.stage = "恢复"; log("切换到恢复节奏"); showToast("已切换到恢复节奏"); renderAll(); });
bindClick("recommendBtn", () => {
  const rec = filtered().slice(0, 3);
  log(rec.length ? "已生成个性化推荐：" + rec.map((x) => x.id).join(", ") : "当前筛选无推荐结果");
  showToast(rec.length ? "已生成今日训练建议" : "当前筛选无匹配，请放宽条件");
  renderAll();
});
bindClick("startGuideBtn", () => {
  if (state.trainee.selectedEquipment) {
    log("开始动作引导：" + state.trainee.selectedEquipment);
    showToast("动作引导已开始（占位流程）");
  } else {
    log("请先选择器械，再开始动作引导");
    showToast("请先选择器械");
  }
  renderAll();
});
bindClick("doRepBtn", () => {
  state.trainee.challengeReps = Math.min(20, state.trainee.challengeReps + 1);
  state.trainee.energy += 2;
  const done = state.trainee.challengeReps >= 20;
  log(done ? "挑战达成：今日 20 reps 完成" : "挑战进度 +1 reps");
  if (done) showToast("今日挑战 20 reps 达成！");
  renderAll();
});
bindClick("resetChallengeBtn", () => { state.trainee.challengeReps = 0; log("挑战进度已重置"); showToast("挑战进度已重置"); renderAll(); });
bindClick("buffBtn", () => {
  const targets = [...coachTargetSet];
  if (targets.length === 0) return;
  const now = "[" + new Date().toLocaleTimeString() + "] ";
  targets.forEach((targetName) => {
    const target = loadTraineeState(targetName);
    if (!target || !target.trainee) return;
    target.trainee.buffUntil = Date.now() + 60000;
    target.trainee.buff = true;
    target.trainee.log = target.trainee.log || [];
    target.trainee.log.unshift(now + "获得教练专注 Buff：双倍经验 60 秒");
    target.trainee.log = target.trainee.log.slice(0, 30);
    saveTraineeState(targetName, target);
  });
  renderAll();
});
bindClick("refreshCoachBtn", () => { state = loadState(); ensure(); renderAll(); });
bindClick("bindTraineeBtn", () => {
  if (!authSession || authSession.role !== "coach" || !coachSelectedTrainee) return;
  const list = getBoundTraineesForCoach(authSession.username);
  list.push(coachSelectedTrainee);
  setBoundTraineesForCoach(authSession.username, list);
  coachTargetSet.add(coachSelectedTrainee);
  renderAll();
});
bindClick("unbindTraineeBtn", () => {
  if (!authSession || authSession.role !== "coach" || !coachSelectedTrainee) return;
  const list = getBoundTraineesForCoach(authSession.username).filter((x) => x !== coachSelectedTrainee);
  setBoundTraineesForCoach(authSession.username, list);
  coachTargetSet.delete(coachSelectedTrainee);
  if (!list.includes(coachSelectedTrainee)) coachSelectedTrainee = list[0] || "";
  renderAll();
});
if ($("coachTraineeSelect")) $("coachTraineeSelect").addEventListener("change", (e) => { coachSelectedTrainee = e.target.value; if (coachSelectedTrainee) coachTargetSet.add(coachSelectedTrainee); renderAll(); });
bindClick("resetAllBtn", () => {
  stopSim({ silent: true });
  state = structuredClone(defaultState);
  ensure();
  resetHrChartVisual();
  log("演示数据已重置");
  showToast("本地演示数据已重置");
  renderAll();
});

if ($("muscleFilter")) $("muscleFilter").addEventListener("change", (e) => { state.trainee.selectedMuscle = e.target.value; state.trainee.selectedSecondary = "all"; state.trainee.selectedEquipmentFilter = "all"; log("一级筛选：" + e.target.value); renderAll(); });
if ($("secondaryFilter")) $("secondaryFilter").addEventListener("change", (e) => { state.trainee.selectedSecondary = e.target.value; state.trainee.selectedEquipmentFilter = "all"; log("二级筛选：" + e.target.value); renderAll(); });
if ($("equipmentTypeFilter")) $("equipmentTypeFilter").addEventListener("change", (e) => { state.trainee.selectedEquipmentType = e.target.value; state.trainee.selectedEquipmentFilter = "all"; log("器械标签：" + e.target.value); renderAll(); });
if ($("movementFilter")) $("movementFilter").addEventListener("change", (e) => { state.trainee.selectedMovement = e.target.value; state.trainee.selectedEquipmentFilter = "all"; log("动作目标：" + e.target.value); renderAll(); });
if ($("equipmentFilter")) $("equipmentFilter").addEventListener("change", (e) => { state.trainee.selectedEquipmentFilter = e.target.value; if (e.target.value !== "all") state.trainee.selectedEquipment = e.target.value; log("器械名称筛选：" + e.target.value); renderAll(); });
if ($("levelFilter")) $("levelFilter").addEventListener("change", (e) => { state.trainee.level = e.target.value; log("训练等级：" + (e.target.value === "advanced" ? "进阶者" : "初学者")); renderAll(); });

window.addEventListener("storage", (e) => {
  if (!e.key) return;
  if (e.key.startsWith(STORE_KEY) || e.key === COACH_BINDINGS_KEY) {
    if (authSession && authSession.role === "trainee") {
      state = loadState();
      ensure();
    }
    renderAll();
  }
});

if ("BroadcastChannel" in window) {
  syncChannel = new BroadcastChannel(SYNC_CHANNEL_KEY);
  syncChannel.addEventListener("message", (e) => {
    if (!e.data || e.data.type !== "state-updated") return;
    state = loadState();
    ensure();
    renderAll();
  });
}

async function loadExerciseData() {
  try {
    const resp = await fetch("./exercise-data.json", { cache: "no-store" });
    if (!resp.ok) throw new Error("http error");
    const data = await resp.json();
    if (data && Array.isArray(data.exercises) && data.muscleOptions) {
      LIB = data;
      ensure();
      log("已加载外部器械数据库 exercise-data.json");
      showToast("已加载 exercise-data.json");
      renderAll();
    }
  } catch {
    // file:// 或离线场景下使用内置回退数据
    console.warn("[TrainerSync] 无法加载 exercise-data.json，已使用内置数据。");
    renderAll();
  }
}

ensure();
bindAuthEvents();
authSession = LOGIN_DISABLED ? null : loadSession();
updateAuthPanel();
applySessionUI();
if (LOGIN_DISABLED || authSession) {
  renderAll();
  ensureExerciseDataLoaded();
}
