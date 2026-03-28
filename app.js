const stateKey = "trainersync-state";
const telemetryKey = "trainersync-telemetry";

const equipmentTutorials = {
  treadmill: { name: "跑步机", url: "https://www.youtube.com/results?search_query=跑步机+标准使用教程", icon: "TM" },
  bike: { name: "动感单车", url: "https://www.youtube.com/results?search_query=动感单车+正确姿势", icon: "BK" },
  rowing: { name: "划船机", url: "https://www.youtube.com/results?search_query=划船机+训练教程", icon: "RW" },
  dumbbell: { name: "哑铃区", url: "https://www.youtube.com/results?search_query=哑铃+训练课程", icon: "DB" },
  squat: { name: "深蹲架", url: "https://www.youtube.com/results?search_query=深蹲架+教学", icon: "SQ" },
  stretching: { name: "拉伸区", url: "https://www.youtube.com/results?search_query=拉伸+训练教程", icon: "ST" }
};

const badgeCatalog = ["treadmill", "bike", "rowing", "dumbbell", "squat", "stretching"];

const defaultState = {
  heartRate: 0,
  energy: 0,
  petLevel: 1,
  quests: ["treadmill", "bike", "rowing"],
  activeQuest: null,
  badges: [],
  lastQuestCompletedAt: null,
  lastBuff: null,
  buffMultiplier: 1,
  telemetryRunning: false
};

const state = loadState();

const tabTrainee = document.getElementById("tabTrainee");
const tabTrainer = document.getElementById("tabTrainer");
const traineeView = document.getElementById("traineeView");
const trainerView = document.getElementById("trainerView");
const heartRateText = document.getElementById("heartRateText");
const energyText = document.getElementById("energyText");
const petLevelText = document.getElementById("petLevelText");
const boostStateText = document.getElementById("boostStateText");
const toggleTelemetryBtn = document.getElementById("toggleTelemetryBtn");
const petAvatar = document.getElementById("petAvatar");
const petStatus = document.getElementById("petStatus");
const scanInput = document.getElementById("scanInput");
const scanBtn = document.getElementById("scanBtn");
const questList = document.getElementById("questList");
const completeEquipmentBtn = document.getElementById("completeEquipmentBtn");
const badgeWall = document.getElementById("badgeWall");
const traineeCard = document.getElementById("traineeCard");
const sendPaceBoostBtn = document.getElementById("sendPaceBoostBtn");
const sendDoubleExpBtn = document.getElementById("sendDoubleExpBtn");
const buffPopup = document.getElementById("buffPopup");
const buffMessage = document.getElementById("buffMessage");
const energyRingProgress = document.getElementById("energyRingProgress");

let telemetryTimer = null;
const ringCircumference = 2 * Math.PI * 52;

function loadState() {
  const stored = localStorage.getItem(stateKey);
  if (!stored) {
    localStorage.setItem(stateKey, JSON.stringify(defaultState));
    return { ...defaultState };
  }
  try {
    return { ...defaultState, ...JSON.parse(stored) };
  } catch (error) {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(stateKey, JSON.stringify(state));
}

function updateTelemetryStatus(running) {
  state.telemetryRunning = running;
  localStorage.setItem(telemetryKey, running ? "1" : "0");
  toggleTelemetryBtn.textContent = running ? "停止模拟心率流" : "启动模拟心率流";
}

function syncTelemetryFlag() {
  const stored = localStorage.getItem(telemetryKey);
  updateTelemetryStatus(stored === "1");
}

function calculatePetLevel(energy) {
  if (energy >= 200) return 3;
  if (energy >= 100) return 2;
  return 1;
}

function updateRing() {
  const maxEnergy = 200;
  const safeEnergy = Math.min(state.energy, maxEnergy);
  const progress = safeEnergy / maxEnergy;
  const dashOffset = ringCircumference * (1 - progress);
  energyRingProgress.style.strokeDasharray = `${ringCircumference}`;
  energyRingProgress.style.strokeDashoffset = `${dashOffset}`;

  if (state.heartRate >= 120 && state.heartRate <= 150) {
    const wrap = energyRingProgress.closest(".ring-wrap");
    wrap.classList.add("pulse");
    setTimeout(() => wrap.classList.remove("pulse"), 600);
  }
}

function applyEnergyGain() {
  const inTargetZone = state.heartRate >= 120 && state.heartRate <= 150;
  if (inTargetZone) {
    const gain = state.buffMultiplier === 2 ? 6 : 3;
    state.energy += gain;
  }
  state.petLevel = calculatePetLevel(state.energy);
}

function renderTrainee() {
  heartRateText.textContent = `${state.heartRate || "--"} bpm`;
  energyText.textContent = state.energy;
  petLevelText.textContent = `Lv.${state.petLevel}`;
  boostStateText.textContent = state.buffMultiplier === 2 ? "x2 Buff" : "Normal";
  petAvatar.classList.toggle("level-2", state.petLevel === 2);
  petAvatar.classList.toggle("level-3", state.petLevel === 3);
  petStatus.textContent = state.petLevel === 1 ? "状态：待机中" : state.petLevel === 2 ? "状态：成长中" : "状态：觉醒";

  updateRing();
  renderQuests();
  renderBadgeWall();
  saveState();
}

function renderQuests() {
  questList.innerHTML = "";
  state.quests.forEach((quest) => {
    const tutorial = equipmentTutorials[quest];
    const item = document.createElement("div");
    item.className = `quest-item ${state.activeQuest === quest ? "active" : ""}`;
    item.innerHTML = `<span>${tutorial?.icon || "🎯"} ${tutorial?.name ?? quest}</span><small>${state.activeQuest === quest ? "进行中" : "待打卡"}</small>`;
    questList.appendChild(item);
  });
}

function renderBadgeWall() {
  badgeWall.innerHTML = "";
  badgeCatalog.forEach((key) => {
    const info = equipmentTutorials[key];
    const unlocked = state.badges.includes(`${info.name} 精通徽章`);
    const tile = document.createElement("div");
    tile.className = `badge-tile ${unlocked ? "unlocked" : ""}`;
    tile.innerHTML = `
      <div class="badge-icon">${info.icon}</div>
      <div class="badge-name">${info.name}</div>
      <small>${unlocked ? "已点亮" : "未解锁"}</small>
    `;
    badgeWall.appendChild(tile);
  });
}

function renderTrainer() {
  const questStatus = state.activeQuest ? `正在使用 ${equipmentTutorials[state.activeQuest]?.name ?? state.activeQuest}` : "等待打卡";
  const isAlert = state.heartRate > 0 && (state.heartRate < 100 || state.heartRate > 165);
  traineeCard.className = `trainee-card ${isAlert ? "alert" : ""}`;
  traineeCard.innerHTML = `
    <div><strong>学员：Noah</strong></div>
    <div>心率：${state.heartRate || "--"} bpm</div>
    <div>活力值：${state.energy}</div>
    <div>任务：${questStatus}</div>
    <div>徽章数：${state.badges.length} / ${badgeCatalog.length}</div>
    <div>增益：${state.buffMultiplier === 2 ? "双倍生效中" : "无"}</div>
  `;
}

function showBuff(type) {
  buffMessage.textContent =
    type === "pace"
      ? "配速提升任务已下发，当前活力值获取翻倍"
      : "双倍经验卡已生效，当前活力值获取翻倍";
  buffPopup.classList.remove("hidden");
  setTimeout(() => buffPopup.classList.add("hidden"), 2000);
}

function startTelemetry() {
  stopTelemetry();
  telemetryTimer = setInterval(() => {
    state.heartRate = 90 + Math.floor(Math.random() * 80);
    applyEnergyGain();
    renderTrainee();
    renderTrainer();
  }, 1500);
  updateTelemetryStatus(true);
}

function stopTelemetry() {
  if (telemetryTimer) {
    clearInterval(telemetryTimer);
    telemetryTimer = null;
  }
  updateTelemetryStatus(false);
}

function handleScan() {
  const value = scanInput.value.trim().toLowerCase();
  if (!value || !equipmentTutorials[value]) {
    alert("请扫描有效的器械二维码");
    return;
  }

  state.activeQuest = value;
  state.lastQuestCompletedAt = Date.now();
  renderTrainee();
  renderTrainer();
  window.open(equipmentTutorials[value].url, "_blank");
}

function completeQuest() {
  if (!state.activeQuest) {
    alert("请先扫码激活器械");
    return;
  }

  const tutorial = equipmentTutorials[state.activeQuest];
  const badgeName = `${tutorial.name} 精通徽章`;

  if (!state.badges.includes(badgeName)) {
    state.badges.push(badgeName);
  }

  state.activeQuest = null;
  state.energy += 12;
  state.petLevel = calculatePetLevel(state.energy);
  renderTrainee();
  renderTrainer();
}

function sendBuff(type) {
  state.buffMultiplier = 2;
  state.lastBuff = type;
  state.buffActivatedAt = Date.now();
  saveState();
  showBuff(type);
  renderTrainee();
  renderTrainer();

  setTimeout(() => {
    state.buffMultiplier = 1;
    saveState();
    renderTrainee();
    renderTrainer();
  }, 120000);
}

function handleStorageSync(event) {
  if (event.key === stateKey && event.newValue) {
    const next = JSON.parse(event.newValue);
    Object.assign(state, next);
    renderTrainee();
    renderTrainer();
  }
}

function setupTabs() {
  tabTrainee.addEventListener("click", () => {
    tabTrainee.classList.add("active");
    tabTrainer.classList.remove("active");
    traineeView.classList.add("active");
    trainerView.classList.remove("active");
  });

  tabTrainer.addEventListener("click", () => {
    tabTrainer.classList.add("active");
    tabTrainee.classList.remove("active");
    trainerView.classList.add("active");
    traineeView.classList.remove("active");
  });
}

function setupEvents() {
  toggleTelemetryBtn.addEventListener("click", () => {
    if (state.telemetryRunning) {
      stopTelemetry();
    } else {
      startTelemetry();
    }
  });

  scanBtn.addEventListener("click", handleScan);
  completeEquipmentBtn.addEventListener("click", completeQuest);
  sendPaceBoostBtn.addEventListener("click", () => sendBuff("pace"));
  sendDoubleExpBtn.addEventListener("click", () => sendBuff("double"));
  buffPopup.addEventListener("click", () => buffPopup.classList.add("hidden"));
  window.addEventListener("storage", handleStorageSync);
}

function init() {
  syncTelemetryFlag();
  if (state.telemetryRunning) startTelemetry();
  renderTrainee();
  renderTrainer();
  setupTabs();
  setupEvents();
}

init();
