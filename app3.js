const STORE_KEY = "trainerSync_state_v4";
const $ = (id) => document.getElementById(id);

const PET_META = [
  { id: "panda", name: "铁铁熊", icon: "🐼" },
  { id: "fox", name: "疾风狐", icon: "🦊" },
  { id: "cat", name: "灵动猫", icon: "🐱" },
  { id: "dog", name: "冲刺犬", icon: "🐶" }
];

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

let state = loadState();
let hrTimer = null;

function loadState() {
  const raw = localStorage.getItem(STORE_KEY);
  if (!raw) return structuredClone(defaultState);
  try { return JSON.parse(raw); } catch { return structuredClone(defaultState); }
}
function saveState() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
function log(msg) {
  const t = new Date().toLocaleTimeString();
  state.trainee.log.unshift("[" + t + "] " + msg);
  state.trainee.log = state.trainee.log.slice(0, 30);
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
  sel.innerHTML = `<option value="all">二级筛选：全部专业肌肉</option>` + opts.map(o => `<option value="${o.key}">${o.label}</option>`).join("");
  if (![...sel.options].some(o => o.value === state.trainee.selectedSecondary)) state.trainee.selectedSecondary = "all";
  sel.value = state.trainee.selectedSecondary;
}

function fillEquipmentName() {
  const sel = $("equipmentFilter");
  if (!sel) return;
  sel.innerHTML = `<option value="all">器械名称：全部</option>` + getExercises().map(ex => `<option value="${ex.id}">${ex.name}</option>`).join("");
  if (![...sel.options].some(o => o.value === state.trainee.selectedEquipmentFilter)) state.trainee.selectedEquipmentFilter = "all";
  sel.value = state.trainee.selectedEquipmentFilter;
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
  title.innerHTML = `<b>动作指导：${ex.name}</b>`;
  video.innerHTML = `[ 视频占位符 ]<br />${ex.name} 教学视频`;
  image.innerHTML = `[ 图片占位符 ]<br />${ex.name} 动作分解图`;
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
  box.innerHTML = rec.length
    ? rec.map(r => `<span class="recommend-chip">${r.name}（${level}）</span>`).join("")
    : `<span class="recommend-chip">当前筛选无匹配动作，建议放宽筛选条件。</span>`;
}

function render() {
  ensure();
  computeCompletion();
  const t = state.trainee;
  if ($("hrNum")) $("hrNum").textContent = t.hr == null ? "--" : t.hr;
  if ($("hrRing")) $("hrRing").style.setProperty("--p", (t.hr == null ? 0 : Math.max(0, Math.min(100, ((t.hr - 80) / 100) * 100))) + "%");
  const z = zone(t.hr);
  if ($("zoneBadge")) { $("zoneBadge").className = "zone " + z.k; $("zoneBadge").textContent = z.t; }
  if ($("energyVal")) $("energyVal").textContent = Math.floor(t.energy);
  if ($("petLevel")) $("petLevel").textContent = "Lv." + t.petLevel;
  if ($("buffState")) $("buffState").textContent = t.buff ? "Double XP" : "Normal";
  if ($("completeRate")) $("completeRate").textContent = t.completion + "%";
  if ($("stageText")) $("stageText").textContent = t.stage;
  if ($("toggleSimBtn")) $("toggleSimBtn").textContent = t.hrSimRunning ? "停止模拟心率" : "启动模拟心率";

  if ($("muscleFilter")) $("muscleFilter").value = t.selectedMuscle;
  if ($("equipmentTypeFilter")) $("equipmentTypeFilter").value = t.selectedEquipmentType;
  if ($("movementFilter")) $("movementFilter").value = t.selectedMovement;
  if ($("levelFilter")) $("levelFilter").value = t.level;

  fillSecondary();
  fillEquipmentName();
  const list = filtered();
  if ($("equipList")) {
    $("equipList").innerHTML = list.map(ex =>
      `<div class="equip ${t.selectedEquipment === ex.id ? "active" : ""}" data-equip="${ex.id}">
        <span>${ex.name}<br /><span class="small">${ex.type} | ${(ex.movement || []).join(", ")}</span></span>
        <span class="pill">${t.equipmentDone[ex.id] ? "已完成" : "未完成"}</span>
      </div>`
    ).join("") || '<div class="small">当前筛选下无器械，请调整筛选条件。</div>';
    $("equipList").querySelectorAll(".equip").forEach(node => node.addEventListener("click", () => {
      t.selectedEquipment = node.dataset.equip;
      log("选择器械：" + t.selectedEquipment);
      renderAll();
    }));
  }
  const selected = getExercises().find(ex => ex.id === t.selectedEquipment);
  renderGuide(selected);
  renderPet(selected);
  renderReco();
  renderChallenge();
  if ($("badgeWall")) {
    $("badgeWall").innerHTML = getExercises().slice(0, 12).map(ex =>
      `<div class="badge ${t.equipmentDone[ex.id] ? "on" : ""}"><div style="font-size:22px;">${t.equipmentDone[ex.id] ? "🏅" : "⭕"}</div><div>${ex.name.split(" ")[0]}</div></div>`
    ).join("");
  }
  if ($("coachUsers")) {
    $("coachUsers").innerHTML = `<div class="user-row"><div><b>${t.name}</b><div class="small">阶段：${t.stage} ｜ 策略：${t.strategy}</div></div><span class="pill">心率：${t.hr ?? "--"} bpm</span><span class="pill">完成：${t.completion}%</span></div><div class="user-row"><div><b>筛选状态</b><div class="small">一级：${t.selectedMuscle} ｜ 二级：${t.selectedSecondary}</div></div><span class="pill">器械：${t.selectedEquipmentType}</span><span class="pill">动作：${t.selectedMovement}</span></div><div class="user-row"><div><b>训练等级</b><div class="small">${t.level === "advanced" ? "进阶者" : "初学者"}</div></div><span class="pill">当前器械：${t.selectedEquipment || "未选择"}</span><span class="pill">活力：${Math.floor(t.energy)}</span></div>`;
  }
  if ($("coachLog")) $("coachLog").innerHTML = t.log.length ? t.log.slice(0, 20).map(x => "<p>" + x + "</p>").join("") : "<p>暂无日志</p>";
  saveState();
}

function renderAll() { render(); }
function startSim() {
  if (hrTimer) return;
  state.trainee.hrSimRunning = true;
  hrTimer = setInterval(() => {
    const base = state.trainee.stage === "主训练" ? 138 : state.trainee.stage === "恢复" ? 112 : 125;
    const hr = Math.max(85, Math.min(178, base + Math.round((Math.random() - 0.5) * 22)));
    state.trainee.hr = hr;
    const zk = zone(hr).k;
    let gain = zk === "target" ? 2 : zk === "low" ? 0.5 : 0.2;
    if (Date.now() < state.trainee.buffUntil) { state.trainee.buff = true; gain *= 2; } else state.trainee.buff = false;
    state.trainee.energy = Math.min(9999, +(state.trainee.energy + gain).toFixed(1));
    state.trainee.petLevel = Math.max(1, Math.floor(state.trainee.energy / 80) + 1);
    log("心率更新：" + hr + " bpm");
    renderAll();
  }, 1200);
  log("已启动模拟心率");
  renderAll();
}
function stopSim() {
  state.trainee.hrSimRunning = false;
  clearInterval(hrTimer);
  hrTimer = null;
  log("已停止模拟心率");
  renderAll();
}
function bindClick(id, fn) { const el = $(id); if (el) el.addEventListener("click", fn); }

document.querySelectorAll(".tab-btn").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll(".tab-btn").forEach(x => x.classList.toggle("active", x === btn));
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === btn.dataset.tab));
}));

bindClick("toggleSimBtn", () => state.trainee.hrSimRunning ? stopSim() : startSim());
bindClick("demoBtn", () => {
  const seq = ["热身中", "主训练", "主训练", "拉伸", "恢复"];
  const hrs = [118, 132, 146, 124, 108];
  seq.forEach((st, i) => setTimeout(() => {
    state.trainee.stage = st;
    state.trainee.hr = hrs[i];
    const f = filtered();
    if (f[i]) { state.trainee.selectedEquipment = f[i].id; state.trainee.equipmentDone[f[i].id] = true; }
    state.trainee.challengeReps = Math.min(20, state.trainee.challengeReps + 4);
    log("Demo阶段：" + st + "（" + hrs[i] + " bpm）");
    renderAll();
  }, i * 800));
});
document.querySelectorAll(".stage").forEach(btn => btn.addEventListener("click", () => { state.trainee.stage = btn.dataset.stage; log("阶段切换：" + btn.dataset.stage); renderAll(); }));
bindClick("finishTaskBtn", () => {
  const id = state.trainee.selectedEquipment;
  if (!id) { log("请先选择器械"); renderAll(); return; }
  state.trainee.equipmentDone[id] = true;
  state.trainee.energy += 12;
  state.trainee.challengeReps = Math.min(20, state.trainee.challengeReps + 3);
  log("完成器械任务：" + id);
  renderAll();
});
bindClick("restBtn", () => { state.trainee.stage = "恢复"; log("切换到恢复节奏"); renderAll(); });
bindClick("recommendBtn", () => { const rec = filtered().slice(0, 3); log(rec.length ? "已生成个性化推荐：" + rec.map(x => x.id).join(", ") : "当前筛选无推荐结果"); renderAll(); });
bindClick("startGuideBtn", () => { log(state.trainee.selectedEquipment ? "开始动作引导：" + state.trainee.selectedEquipment : "请先选择器械，再开始动作引导"); renderAll(); });
bindClick("doRepBtn", () => { state.trainee.challengeReps = Math.min(20, state.trainee.challengeReps + 1); state.trainee.energy += 2; log(state.trainee.challengeReps >= 20 ? "挑战达成：今日 20 reps 完成" : "挑战进度 +1 reps"); renderAll(); });
bindClick("resetChallengeBtn", () => { state.trainee.challengeReps = 0; log("挑战进度已重置"); renderAll(); });
bindClick("buffBtn", () => { state.trainee.buffUntil = Date.now() + 60000; state.trainee.buff = true; log("获得教练专注 Buff：双倍经验 60 秒"); renderAll(); });
bindClick("refreshCoachBtn", () => { state = loadState(); ensure(); renderAll(); });
bindClick("resetAllBtn", () => { stopSim(); state = structuredClone(defaultState); ensure(); log("演示数据已重置"); renderAll(); });

if ($("muscleFilter")) $("muscleFilter").addEventListener("change", (e) => { state.trainee.selectedMuscle = e.target.value; state.trainee.selectedSecondary = "all"; state.trainee.selectedEquipmentFilter = "all"; log("一级筛选：" + e.target.value); renderAll(); });
if ($("secondaryFilter")) $("secondaryFilter").addEventListener("change", (e) => { state.trainee.selectedSecondary = e.target.value; state.trainee.selectedEquipmentFilter = "all"; log("二级筛选：" + e.target.value); renderAll(); });
if ($("equipmentTypeFilter")) $("equipmentTypeFilter").addEventListener("change", (e) => { state.trainee.selectedEquipmentType = e.target.value; state.trainee.selectedEquipmentFilter = "all"; log("器械标签：" + e.target.value); renderAll(); });
if ($("movementFilter")) $("movementFilter").addEventListener("change", (e) => { state.trainee.selectedMovement = e.target.value; state.trainee.selectedEquipmentFilter = "all"; log("动作目标：" + e.target.value); renderAll(); });
if ($("equipmentFilter")) $("equipmentFilter").addEventListener("change", (e) => { state.trainee.selectedEquipmentFilter = e.target.value; if (e.target.value !== "all") state.trainee.selectedEquipment = e.target.value; log("器械名称筛选：" + e.target.value); renderAll(); });
if ($("levelFilter")) $("levelFilter").addEventListener("change", (e) => { state.trainee.level = e.target.value; log("训练等级：" + (e.target.value === "advanced" ? "进阶者" : "初学者")); renderAll(); });

window.addEventListener("storage", (e) => { if (e.key === STORE_KEY) { state = loadState(); ensure(); renderAll(); } });

async function loadExerciseData() {
  try {
    const resp = await fetch("./exercise-data.json", { cache: "no-store" });
    if (!resp.ok) throw new Error("http error");
    const data = await resp.json();
    if (data && Array.isArray(data.exercises) && data.muscleOptions) {
      LIB = data;
      ensure();
      log("已加载外部器械数据库 exercise-data.json");
      renderAll();
    }
  } catch {
    // file:// 或离线场景下使用内置回退数据
    renderAll();
  }
}

ensure();
renderAll();
loadExerciseData();
