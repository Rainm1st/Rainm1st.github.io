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
const trainingPhases = [
  { key: "warmup", label: "热身中", progress: 33 },
  { key: "main", label: "主训练", progress: 66 },
  { key: "recovery", label: "拉伸恢复", progress: 100 }
];

const defaultState = {
  heartRate: 0,
  energy: 0,
  petLevel: 1,
  quests: ["treadmill", "bike", "rowing"],
  activeQuest: null,
  activeQuestStartedAt: null,
  badges: [],
  questTimeoutCount: 0,
  lastBuff: null,
  coachStrategy: "none",
  buffMultiplier: 1,
  telemetryRunning: false,
  phaseIndex: 0,
  telemetryTicks: 0,
  inZoneTicks: 0,
  buffUsedCount: 0,
  demoRunning: false
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
const phaseText = document.getElementById("phaseText");
const phaseProgress = document.getElementById("phaseProgress");
const toggleTelemetryBtn = document.getElementById("toggleTelemetryBtn");
const startDemoBtn = document.getElementById("startDemoBtn");
const petAvatar = document.getElementById("petAvatar");
const petStatus = document.getElementById("petStatus");
const scanInput = document.getElementById("scanInput");
const scanBtn = document.getElementById("scanBtn");
const questList = document.getElementById("questList");
const completeEquipmentBtn = document.getElementById("completeEquipmentBtn");
const badgeWall = document.getElementById("badgeWall");
const traineeCard = document.getElementById("traineeCard");
const coachMetrics = document.getElementById("coachMetrics");
const sendPaceBoostBtn = document.getElementById("sendPaceBoostBtn");
const sendFatBurnBtn = document.getElementById("sendFatBurnBtn");
const sendRecoveryBtn = document.getElementById("sendRecoveryBtn");
const sendDoubleExpBtn = document.getElementById("sendDoubleExpBtn");
const buffPopup = document.getElementById("buffPopup");
const buffMessage = document.getElementById("buffMessage");
const energyRingProgress = document.getElementById("energyRingProgress");

let telemetryTimer = null;
let demoTimer = null;
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

function setPhase(index) {
  const safeIndex = Math.min(Math.max(index, 0), trainingPhases.length - 1);
  state.phaseIndex = safeIndex;
  const phase = trainingPhases[safeIndex];
  phaseText.textContent = phase.label;
  phaseProgress.style.width = `${phase.progress}%`;
}

function updatePhaseFromTelemetry() {
  state.telemetryTicks += 1;
  if (state.telemetryTicks >= 16) {
    setPhase(2);
  } else if (state.telemetryTicks >= 8) {
    setPhase(1);
  } else {
    setPhase(0);
  }
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
    state.inZoneTicks += 1;
  }
  state.petLevel = calculatePetLevel(state.energy);
}

function checkQuestTimeout() {
  if (!state.activeQuest || !state.activeQuestStartedAt) return;
  const timeoutMs = 90000;
  if (Date.now() - state.activeQuestStartedAt > timeoutMs) {
    state.questTimeoutCount += 1;
    state.activeQuest = null;
    state.activeQuestStartedAt = null;
    showBuffMessage("任务超时：该器械节点已重置，请重新激活。", false);
  }
}

function renderTrainee() {
  heartRateText.textContent = `${state.heartRate || "--"} bpm`;
  energyText.textContent = state.energy;
  petLevelText.textContent = `Lv.${state.petLevel}`;
  boostStateText.textContent = state.buffMultiplier === 2 ? "x2 Buff" : strategyLabel(state.coachStrategy);
  petAvatar.classList.toggle("level-2", state.petLevel === 2);
  petAvatar.classList.toggle("level-3", state.petLevel === 3);
  petStatus.textContent = state.petLevel === 1 ? "状态：待机中" : state.petLevel === 2 ? "状态：成长中" : "状态：觉醒";

  setPhase(state.phaseIndex);
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
    tile.innerHTML = `<div class="badge-icon">${info.icon}</div><div class="badge-name">${info.name}</div><small>${unlocked ? "已点亮" : "未解锁"}</small>`;
    badgeWall.appendChild(tile);
  });
}

function renderCoachMetrics() {
  const avgHeartRate = state.telemetryTicks > 0 ? Math.round((state.heartRate + (state.lastHeartRate || 0)) / 2) : 0;
  const inZoneRate = state.telemetryTicks > 0 ? Math.round((state.inZoneTicks / state.telemetryTicks) * 100) : 0;

  coachMetrics.innerHTML = `
    <div class="metric-tile"><span>平均心率</span><strong>${avgHeartRate || "--"} bpm</strong></div>
    <div class="metric-tile"><span>区间占比</span><strong>${inZoneRate}%</strong></div>
    <div class="metric-tile"><span>任务超时</span><strong>${state.questTimeoutCount}</strong></div>
    <div class="metric-tile"><span>Buff次数</span><strong>${state.buffUsedCount}</strong></div>
  `;
}

function renderTrainer() {
  const questStatus = state.activeQuest ? `正在使用 ${equipmentTutorials[state.activeQuest]?.name ?? state.activeQuest}` : "等待打卡";
  const isAlert = state.heartRate > 0 && (state.heartRate < 100 || state.heartRate > 165 || state.questTimeoutCount > 0);
  traineeCard.className = `trainee-card ${isAlert ? "alert" : ""}`;
  traineeCard.innerHTML = `<div><strong>学员：Noah</strong></div><div>心率：${state.heartRate || "--"} bpm</div><div>活力值：${state.energy}</div><div>阶段：${trainingPhases[state.phaseIndex].label}</div><div>任务：${questStatus}</div><div>徽章数：${state.badges.length} / ${badgeCatalog.length}</div><div>策略：${strategyLabel(state.coachStrategy)}</div><div>增益：${state.buffMultiplier === 2 ? "双倍生效中" : "无"}</div>`;
  renderCoachMetrics();
}

function strategyLabel(strategy) {
  if (strategy === "pace") return "配速提升";
  if (strategy === "fatburn") return "稳态燃脂";
  if (strategy === "recovery") return "恢复训练";
  return "Normal";
}

function showBuffMessage(message, asBuff = true) {
  buffMessage.textContent = message;
  buffPopup.classList.remove("hidden");
  buffPopup.querySelector("h3").textContent = asBuff ? "获得教练专注 Buff！" : "系统提示";
  setTimeout(() => buffPopup.classList.add("hidden"), 2200);
}

function startTelemetry() {
  stopTelemetry();
  telemetryTimer = setInterval(() => {
    state.lastHeartRate = state.heartRate;

    if (state.coachStrategy === "pace") {
      state.heartRate = 128 + Math.floor(Math.random() * 25);
    } else if (state.coachStrategy === "fatburn") {
      state.heartRate = 120 + Math.floor(Math.random() * 20);
    } else if (state.coachStrategy === "recovery") {
      state.heartRate = 95 + Math.floor(Math.random() * 20);
    } else {
      state.heartRate = 90 + Math.floor(Math.random() * 80);
    }

    applyEnergyGain();
    updatePhaseFromTelemetry();
    checkQuestTimeout();
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

  if (!state.quests.includes(value)) {
    showBuffMessage("该二维码不是今日路线节点，请前往指定器械。", false);
    return;
  }

  state.activeQuest = value;
  state.activeQuestStartedAt = Date.now();
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
  state.activeQuestStartedAt = null;
  state.energy += 12;
  state.petLevel = calculatePetLevel(state.energy);
  renderTrainee();
  renderTrainer();
}

function sendBuff(type) {
  state.buffMultiplier = 2;
  state.lastBuff = type;
  state.buffUsedCount += 1;
  saveState();
  showBuffMessage(type === "pace" ? "配速提升任务已下发，活力值获取翻倍" : "双倍经验卡已生效，活力值获取翻倍");
  renderTrainee();
  renderTrainer();

  setTimeout(() => {
    state.buffMultiplier = 1;
    saveState();
    renderTrainee();
    renderTrainer();
  }, 120000);
}

function applyCoachStrategy(strategy) {
  state.coachStrategy = strategy;
  saveState();
  showBuffMessage(`教练策略切换为：${strategyLabel(strategy)}`);
  renderTrainee();
  renderTrainer();
}

function startDemoMode() {
  if (state.demoRunning) return;
  state.demoRunning = true;
  startDemoBtn.textContent = "Demo进行中...";
  startDemoBtn.disabled = true;

  if (!state.telemetryRunning) {
    startTelemetry();
  }

  const script = [
    () => applyCoachStrategy("fatburn"),
    () => { scanInput.value = "treadmill"; handleScan(); },
    () => completeQuest(),
    () => sendBuff("pace"),
    () => applyCoachStrategy("pace"),
    () => { scanInput.value = "bike"; handleScan(); },
    () => completeQuest(),
    () => applyCoachStrategy("recovery")
  ];

  let step = 0;
  demoTimer = setInterval(() => {
    if (step >= script.length) {
      clearInterval(demoTimer);
      demoTimer = null;
      state.demoRunning = false;
      startDemoBtn.textContent = "一键 Demo 演示";
      startDemoBtn.disabled = false;
      return;
    }
    script[step]();
    step += 1;
  }, 6000);
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

  startDemoBtn.addEventListener("click", startDemoMode);
  scanBtn.addEventListener("click", handleScan);
  completeEquipmentBtn.addEventListener("click", completeQuest);
  sendPaceBoostBtn.addEventListener("click", () => applyCoachStrategy("pace"));
  sendFatBurnBtn.addEventListener("click", () => applyCoachStrategy("fatburn"));
  sendRecoveryBtn.addEventListener("click", () => applyCoachStrategy("recovery"));
  sendDoubleExpBtn.addEventListener("click", () => sendBuff("double"));
  buffPopup.addEventListener("click", () => buffPopup.classList.add("hidden"));
  window.addEventListener("storage", handleStorageSync);
}

function init() {
  syncTelemetryFlag();
  setPhase(state.phaseIndex);
  if (state.telemetryRunning) startTelemetry();
  renderTrainee();
  renderTrainer();
  setupTabs();
  setupEvents();
}

init();
