/**
 * TrainerSync demo: loads exercises and media paths from the main app's exercise-data.json.
 * Path handling matches app.js toAssetWebPath (backslashes in JSON become slashes).
 *
 * Live trainee map feature:
 * - When a trainee is on a given exercise, their dot appears on the gym map
 *   at the equipment position defined in gym-locations.js.
 * - All active trainees (user + nearby buddies) are rendered simultaneously.
 * - Switching exercises or navigating to Companion updates the map in real time.
 */
const DATA_URL = "./assets/exercise-data.json";
const ASSET_ROOT = "./";

const state = {
  persona: "user",
  screen: "home",
  heartAlert: false,
  exerciseData: [],
  selectedExercise: "",
  filters: { muscle: "all", equipment: "all", search: "" },
  exercisePickerStep: "muscle",  // "muscle" | "equipment" | "exercise"
  live: { hr: 142, progress: 58, reps: 22, elapsed: 22 },
  loaded: false,

  /** All trainees in the gym (user + buddies). */
  trainees: [
    {
      id: "me",
      name: "Na Li",
      initials: "NL",
      role: "user",
      exerciseId: "",        // filled in from selectedExercise when live
      exerciseName: "—",
      setInfo: "—",
      hr: 142,
      status: "normal",       // "normal" | "alert"
      dotColor: "var(--brand)",
      dotBg: "rgba(59,214,255,.9)",
      x: 0, y: 0,
      pos: null,
      online: true,
    },
    {
      id: "xm",
      name: "Xiao Ming",
      initials: "XM",
      role: "buddy",
      exerciseId: "eq_seated_chest_press",
      exerciseName: "Seated Chest Press",
      setInfo: "Set 3 / 5",
      hr: 142,
      status: "normal",
      dotColor: "#ff6b6b",
      dotBg: "rgba(255,107,107,.9)",
      x: 36.21, y: 64.57,
      pos: { x: 36.21, y: 64.57, label: "Seated Chest Press" },
      online: true,
    },
    {
      id: "xh",
      name: "Xiao Hong",
      initials: "XH",
      role: "buddy",
      exerciseId: "eq_seated_leg_press",
      exerciseName: "Seated Leg Press",
      setInfo: "Set 4 / 5",
      hr: 162,
      status: "alert",
      dotColor: "#ffd166",
      dotBg: "rgba(255,209,102,.9)",
      x: 27.80, y: 54.96,
      pos: { x: 27.80, y: 54.96, label: "Seated Leg Press" },
      online: true,
    },
    {
      id: "xg",
      name: "Xiao Gang",
      initials: "XG",
      role: "buddy",
      exerciseId: "eq_lat_pulldown",
      exerciseName: "Lat Pulldown",
      setInfo: "Resting",
      hr: 78,
      status: "normal",
      dotColor: "#a29bfe",
      dotBg: "rgba(162,155,254,.9)",
      x: 62.15, y: 68.12,
      pos: { x: 62.15, y: 68.12, label: "Lat Pulldown" },
      online: true,
    },
  ],
};

const screens = [...document.querySelectorAll(".screen")];
const navButtons = [...document.querySelectorAll(".nav-btn")];
const bottomItems = [...document.querySelectorAll(".bottom-item")];
const toast = document.getElementById("toast");
const emojiOverlay = document.getElementById("emojiOverlay");
const phoneFrame = document.getElementById("phoneFrame");
const liveMode = document.getElementById("liveMode");

function toAssetWebPath(path) {
  return String(path || "").replace(/\\/g, "/");
}

function resolveAssetUrl(relativePath) {
  const rel = toAssetWebPath(relativePath).replace(/^\//, "");
  if (!rel) return "";
  return ASSET_ROOT + rel;
}

function safeMediaPath(path) {
  const normalized = toAssetWebPath(path);
  return normalized && !normalized.endsWith("/") ? normalized : "";
}

function cap(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function mapTargetToFilter(targetGroup) {
  const map = {
    chest: "chest",
    back: "back",
    legs_glutes: "legs",
    core: "core",
    arms: "arms",
    shoulders: "shoulders"
  };
  return map[targetGroup] || "other";
}

function formatProgramming(programming) {
  if (!programming || !programming.beginner || !programming.advanced) return "";
  const b = programming.beginner;
  const a = programming.advanced;
  return `Beginner: ${b.sets} sets × ${b.reps} reps @ RPE ${b.rpe}. Advanced: ${a.sets} sets × ${a.reps} reps @ RPE ${a.rpe}.`;
}

function pickEquipmentRecord(ex, equipmentById) {
  const ids = ex.equipment_ids || [];
  const candidates = ids.map((id) => equipmentById[id]).filter(Boolean);
  if (!candidates.length) return null;
  const withGif = candidates.find((eq) => {
    const g = eq.ex_gif_paths && eq.ex_gif_paths[ex.id];
    return Boolean(g);
  });
  if (withGif) return withGif;
  const withImg = candidates.find((eq) => eq.ex_paths && eq.ex_paths[ex.id]);
  if (withImg) return withImg;
  return candidates[0];
}

function inferEquipmentCategory(equipmentId) {
  if (!equipmentId) return "machine";
  if (equipmentId.includes("cable")) return "cable";
  if (equipmentId.includes("free_weight")) return "free_weight";
  return "machine";
}

function prettifyEquipmentName(equipmentId) {
  return String(equipmentId || "")
    .replace(/^eq_/, "")
    .split("_")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

function buildFallbackEquipmentById(exercises) {
  const ids = new Set();
  exercises.forEach((ex) => (ex.equipment_ids || []).forEach((id) => ids.add(id)));
  const out = {};
  ids.forEach((id) => {
    out[id] = {
      id,
      name: prettifyEquipmentName(id),
      category: inferEquipmentCategory(id),
      path: `assets/equipment/${id}/${id}.jpeg`,
      ex_paths: {},
      ex_gif_paths: {}
    };
  });
  exercises.forEach((ex) => {
    (ex.equipment_ids || []).forEach((id) => {
      if (!out[id]) return;
      out[id].ex_paths[ex.id] = `assets/equipment/${id}/${ex.id}.jpeg`;
    });
  });
  return out;
}

function buildExerciseList(data) {
  const muscles = data.muscles || [];
  const equipment = data.equipment || [];
  const exercises = data.exercises || [];
  const muscleById = Object.fromEntries(muscles.map((m) => [m.id, m]));
  const equipmentById = Object.assign(
    {},
    buildFallbackEquipmentById(exercises),
    Object.fromEntries(equipment.map((e) => [e.id, e]))
  );

  return exercises
    .map((ex) => {
      const eq = pickEquipmentRecord(ex, equipmentById);
      if (!eq) return null;

      const primaryId = (ex.primary_muscle_ids && ex.primary_muscle_ids[0]) || "";
      const muscleDoc = muscleById[primaryId];
      const rawGroup = muscleDoc?.target_group || "";
      const muscleKey = mapTargetToFilter(rawGroup);
      const muscleLabel = muscleDoc?.name || cap(muscleKey);

      const gifRaw = eq.ex_gif_paths && eq.ex_gif_paths[ex.id];
      const level =
        ex.programming && ex.programming.beginner
          ? `Beginner ${ex.programming.beginner.sets}×${ex.programming.beginner.reps}`
          : "—";

      const searchHaystack = [
        ex.name,
        ex.description || "",
        ex.instructions || "",
        muscleLabel,
        eq.name,
        ...(ex.movement_pattern || [])
      ]
        .join(" ")
        .toLowerCase();

      return {
        id: ex.id,
        name: ex.name,
        muscle: muscleKey,
        muscleLabel,
        equipment: eq.category,
        equipmentLabel: eq.name,
        level,
        how: ex.instructions || ex.description || "",
        breathing: formatProgramming(ex.programming),
        media: {
          equipmentImg: resolveAssetUrl(eq.path),
          exerciseImg: resolveAssetUrl(eq.ex_paths[ex.id]),
          exerciseGif: gifRaw ? resolveAssetUrl(gifRaw) : ""
        },
        searchHaystack
      };
    })
    .filter(Boolean);
}

/** Update the current user's trainee entry from selected exercise. */
function syncUserTraineePosition() {
  const me = state.trainees.find((t) => t.id === "me");
  if (!me) return;

  me.exerciseId = state.selectedExercise;
  const ex = state.exerciseData.find((e) => e.id === state.selectedExercise);
  me.exerciseName = ex ? ex.name : "—";
  me.setInfo = "Set 1 / 5";

  const pos = getTraineePosition(state.selectedExercise, state.exerciseData);
  me.pos = pos;
  if (pos) {
    me.x = pos.x;
    me.y = pos.y;
  }
}

/** Sync Live Training header and user position. */
function syncLiveHeader() {
  const title = document.getElementById("liveExerciseTitle");
  const meta = document.getElementById("liveExerciseMeta");
  const item = state.exerciseData.find((x) => x.id === state.selectedExercise);
  if (!title || !meta) return;
  if (!item) {
    title.textContent = "—";
    meta.textContent = "Select an exercise";
    return;
  }
  title.textContent = item.name;
  meta.textContent = `Set 3 of 5 · ${item.muscleLabel} · ${item.equipmentLabel}`;

  // Update user's trainee entry from live screen exercise
  const me = state.trainees.find((t) => t.id === "me");
  if (me) {
    me.exerciseId = state.selectedExercise;
    me.exerciseName = item.name;
    me.setInfo = "Set 3 / 5";
    const pos = getTraineePosition(state.selectedExercise, state.exerciseData);
    me.pos = pos;
    if (pos) {
      me.x = pos.x;
      me.y = pos.y;
    }
  }

  updateGymMap();
}

/** Render ALL trainee dots on the gym map, plus equipment labels. */
function updateGymMap() {
  const container = document.getElementById("gymMapContainer");
  const dynamicLayer = document.getElementById("gymDynamicLayer");
  const traineeList = document.getElementById("gymTraineeList");

  if (!container) return;

  // ── Trainee dots ─────────────────────────────────────────────────────────
  // All dynamic dots go in the dedicated layer
  const layer = dynamicLayer || container;
  layer.querySelectorAll(".gym-trainee-dot").forEach((el) => el.remove());
  layer.querySelectorAll(".gym-dot-label").forEach((el) => el.remove());

  const onlineTrainees = state.trainees.filter((t) => t.online && t.pos);

  onlineTrainees.forEach((t) => {
    // Dot
    const dot = document.createElement("div");
    dot.className = "gym-trainee-dot";
    dot.id = `dot-${t.id}`;
    dot.style.left = t.x + "%";
    dot.style.top = t.y + "%";
    dot.style.background = t.dotBg;
    dot.style.borderColor = t.dotColor;
    dot.style.boxShadow = `0 0 0 3px ${t.dotColor}44, 0 4px 12px rgba(0,0,0,.5)`;
    dot.title = `${t.name} — ${t.exerciseName}`;
    layer.appendChild(dot);

    // Label above dot
    const label = document.createElement("div");
    label.className = "gym-dot-label";
    label.style.left = t.x + "%";
    label.style.top = (t.y - 7) + "%";
    label.style.color = t.dotColor;
    label.style.borderColor = t.dotColor + "66";
    label.textContent = t.name;
    layer.appendChild(label);
  });

  // ── Update trainee list in Companion sidebar ───────────────────────────────
  if (traineeList) {
    const me = state.trainees.find((t) => t.id === "me");
    const buddies = state.trainees.filter((t) => t.id !== "me");

    traineeList.innerHTML = "";

    if (me && me.pos) {
      const item = document.createElement("div");
      item.className = "map-trainee-item you";
      item.innerHTML = `
        <div class="map-trainee-avatar" style="background:${me.dotBg};border-color:${me.dotColor}">
          ${me.initials}
        </div>
        <div class="map-trainee-info">
          <strong>${me.name} <span class="you-tag">You</span></strong>
          <span>${me.exerciseName} · ${me.setInfo}</span>
        </div>
        <span class="map-trainee-hr ${me.status === "alert" ? "alert" : "ok"}">${me.hr} bpm</span>
      `;
      traineeList.appendChild(item);
    }

    buddies.forEach((t) => {
      if (!t.online || !t.pos) return;
      const item = document.createElement("div");
      item.className = "map-trainee-item";
      item.innerHTML = `
        <div class="map-trainee-avatar" style="background:${t.dotBg};border-color:${t.dotColor}">
          ${t.initials}
        </div>
        <div class="map-trainee-info">
          <strong>${t.name}</strong>
          <span>${t.exerciseName} · ${t.setInfo}</span>
        </div>
        <span class="map-trainee-hr ${t.status === "alert" ? "alert" : "ok"}">${t.hr} bpm</span>
      `;
      traineeList.appendChild(item);
    });
  }
}

/** Add a trainee to the live map when they start exercising. */
function startTraineeExercise(traineeId, exerciseId, exerciseName, setInfo, x, y) {
  const t = state.trainees.find((tr) => tr.id === traineeId);
  if (!t) return;
  t.exerciseId = exerciseId;
  t.exerciseName = exerciseName;
  t.setInfo = setInfo;
  t.pos = { x, y };
  t.x = x;
  t.y = y;
  t.online = true;
  updateGymMap();
}

/** Remove a trainee from the map when they stop exercising. */
function stopTraineeExercise(traineeId) {
  const t = state.trainees.find((tr) => tr.id === traineeId);
  if (!t) return;
  t.exerciseId = "";
  t.exerciseName = "—";
  t.setInfo = "—";
  t.pos = null;
  t.x = 0;
  t.y = 0;
  updateGymMap();
}

/** Update a trainee's heart-rate and status on the map. */
function updateTraineeHR(traineeId, hr, status) {
  const t = state.trainees.find((tr) => tr.id === traineeId);
  if (!t) return;
  t.hr = hr;
  t.status = status;
  updateGymMap();
}

/** "Next set" advances the user's set info on the map. */
function advanceUserSet() {
  const me = state.trainees.find((t) => t.id === "me");
  if (!me || !me.setInfo.includes("Set")) return;
  const parts = me.setInfo.split(" ");
  const cur = parseInt(parts[1], 10);
  const total = parseInt(parts[3], 10);
  if (isNaN(cur) || isNaN(total)) return;
  if (cur < total) {
    me.setInfo = `Set ${cur + 1} / ${total}`;
    updateGymMap();
  }
}

function showScreen(key) {
  state.screen = key;
  screens.forEach((el) => el.classList.toggle("active", el.id === `screen-${key}`));
  navButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.screen === key));
  bottomItems.forEach((btn) => btn.classList.toggle("active", btn.dataset.screen === key));
  if (key === "live") {
    syncLiveHeader();
  }
  if (key === "companion") {
    updateGymMap();
  }
}

function setPersona(persona) {
  state.persona = persona;
  document.querySelectorAll(".seg").forEach((btn) => btn.classList.toggle("active", btn.dataset.persona === persona));
  document.querySelectorAll(".user-only").forEach((el) => el.classList.toggle("hidden", persona !== "user"));
  document.querySelectorAll(".coach-only").forEach((el) => el.classList.toggle("hidden", persona !== "coach"));
  phoneFrame.classList.toggle("coach-mode", persona === "coach");
  showScreen(persona === "user" ? "home" : "coach-home");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function emojiBurst(emoji) {
  emojiOverlay.innerHTML = "";
  for (let i = 0; i < 16; i += 1) {
    const span = document.createElement("span");
    span.className = "emoji-float";
    span.textContent = emoji;
    span.style.left = `${8 + Math.random() * 80}%`;
    span.style.bottom = `${8 + Math.random() * 18}%`;
    span.style.animationDelay = `${Math.random() * 0.3}s`;
    emojiOverlay.appendChild(span);
  }
  clearTimeout(window.emojiTimer);
  window.emojiTimer = setTimeout(() => {
    emojiOverlay.innerHTML = "";
  }, 1800);
}

function updateLive() {
  document.getElementById("heartValue").textContent = state.live.hr;
  document.getElementById("workoutProgress").style.width = `${state.live.progress}%`;
  document.getElementById("workoutProgressLabel").textContent = `${state.live.progress}%`;
  document.getElementById("repValue").textContent = state.live.reps;
  document.getElementById("elapsedValue").textContent = `${state.live.elapsed} m`;
  document.getElementById("heartCaption").textContent = state.heartAlert ? "Heart rate elevated — slow down" : "In target zone";
  liveMode.classList.toggle("alert-live", state.heartAlert);

  // Sync user HR to map dot
  const me = state.trainees.find((t) => t.id === "me");
  if (me) {
    me.hr = state.live.hr;
    me.status = state.heartAlert ? "alert" : "normal";
    updateGymMap();
  }
}

function createPreviewMarkup(item) {
  const gif = safeMediaPath(item.media?.exerciseGif);
  const jpg = safeMediaPath(item.media?.exerciseImg || item.media?.equipmentImg);
  const src = gif || jpg;
  if (!src) {
    return `<span class="visual-fallback">${item.name}</span>`;
  }
  return `<img src="${src}" alt="${item.name} preview" loading="lazy" /><span class="visual-fallback hidden">${item.name}</span>`;
}

function renderExercises() {
  const container = document.getElementById("exerciseGrid");
  const query = state.filters.search.toLowerCase().trim();

  if (!state.loaded) {
    container.innerHTML = `<article class="exercise-card"><div class="exercise-visual"><span class="visual-fallback">Loading…</span></div><div class="exercise-copy"><h4>Reading exercise-data.json</h4><p class="muted">Please wait</p></div></article>`;
    return;
  }

  if (!state.exerciseData.length) {
    container.innerHTML = `<article class="exercise-card"><div class="exercise-visual"><span class="visual-fallback">No data</span></div><div class="exercise-copy"><h4>Could not load exercises</h4><p class="muted">Check that ../CPT208-TrainerSync-main/assets/exercise-data.json exists. If you opened this page via file://, use a local static server instead.</p></div></article>`;
    return;
  }

  const list = state.exerciseData.filter((item) => {
    const muscleOk = state.filters.muscle === "all" || item.muscle === state.filters.muscle;
    const equipOk = state.filters.equipment === "all" || item.equipment === state.filters.equipment;
    const searchOk = !query || item.searchHaystack.includes(query);
    return muscleOk && equipOk && searchOk;
  });

  container.innerHTML = "";
  if (!list.length) {
    container.innerHTML = `<article class="exercise-card"><div class="exercise-visual"><span class="visual-fallback">No matches</span></div><div class="exercise-copy"><h4>Try different filters</h4><p class="muted">Adjust muscle group or equipment type and try again.</p></div></article>`;
    return;
  }

  list.forEach((item) => {
    const btn = document.createElement("button");
    btn.className = `exercise-card ${item.id === state.selectedExercise ? "active" : ""}`;
    btn.innerHTML = `<div class="exercise-visual">${createPreviewMarkup(item)}</div><div class="exercise-copy"><h4>${item.name}</h4><p>${item.muscleLabel} · ${item.equipmentLabel}</p><div class="exercise-tags"><span>${item.level}</span><span>${item.muscleLabel}</span></div></div>`;
    btn.addEventListener("click", () => {
      state.selectedExercise = item.id;
      renderExercises();
      renderExerciseDetail();
      if (state.screen === "live") {
        syncLiveHeader();
      } else {
        // Update user position preview (Companion map)
        syncUserTraineePosition();
        updateGymMap();
      }
    });
    container.appendChild(btn);
  });

  container.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => {
      const fallback = img.nextElementSibling;
      if (fallback) fallback.classList.remove("hidden");
      img.remove();
    });
  });
}

function renderExerciseDetail() {
  const item = state.exerciseData.find((x) => x.id === state.selectedExercise) || state.exerciseData[0];
  if (!item) return;

  document.getElementById("detailLevel").textContent = item.level;
  document.getElementById("detailName").textContent = item.name;
  document.getElementById("detailSubtitle").textContent = `${item.muscleLabel} · ${item.equipmentLabel}`;
  document.getElementById("detailHow").textContent = item.how;
  document.getElementById("detailBreath").textContent = item.breathing || "(No programming fields in data)";

  const visual = document.querySelector("#screen-exercise .detail-visual");
  const gif = safeMediaPath(item.media?.exerciseGif);
  const image = safeMediaPath(item.media?.exerciseImg || item.media?.equipmentImg);
  const src = gif || image;
  if (!visual) return;

  if (!src) {
    visual.innerHTML = `<span class="visual-fallback">${item.name}</span>`;
    return;
  }

  visual.innerHTML = `<img src="${src}" alt="${item.name} detail media" loading="lazy" />${gif ? '<span class="detail-gif-tip">GIF</span>' : ""}`;
  const detailImg = visual.querySelector("img");
  if (detailImg) {
    detailImg.addEventListener("error", () => {
      visual.innerHTML = `<span class="visual-fallback">${item.name}</span>`;
    });
  }
}

document.body.addEventListener("click", (e) => {
  const goto = e.target.closest("[data-goto]");
  if (goto) showScreen(goto.dataset.goto);

  const nav = e.target.closest(".nav-btn, .bottom-item");
  if (nav && nav.dataset.screen) showScreen(nav.dataset.screen);

  const personaBtn = e.target.closest(".seg");
  if (personaBtn) setPersona(personaBtn.dataset.persona);

  const toastBtn = e.target.closest("[data-toast]");
  if (toastBtn) showToast(toastBtn.dataset.toast);

  const burstBtn = e.target.closest("[data-burst]");
  if (burstBtn) emojiBurst(burstBtn.dataset.burst);
});

document.getElementById("exerciseSearch").addEventListener("input", (e) => {
  state.filters.search = e.target.value;
  renderExercises();
});

document.getElementById("filterMuscle").addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-chip");
  if (!btn) return;
  state.filters.muscle = btn.dataset.value;
  setChip("filterMuscle", btn.dataset.value);
  renderExercises();
});

document.getElementById("filterEquipment").addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-chip");
  if (!btn) return;
  state.filters.equipment = btn.dataset.value;
  setChip("filterEquipment", btn.dataset.value);
  renderExercises();
});

function setChip(id, value) {
  document.querySelectorAll(`#${id} .filter-chip`).forEach((chip) => chip.classList.toggle("active", chip.dataset.value === value));
}

document.getElementById("triggerToast").addEventListener("click", () => showToast("Demo toast: Great pace. Keep your shoulders stable."));
document.getElementById("triggerBurst").addEventListener("click", () => emojiBurst("💪"));
document.getElementById("toggleHeart").addEventListener("click", () => {
  state.heartAlert = !state.heartAlert;
  state.live.hr = state.heartAlert ? 156 : 142;
  updateLive();
  showToast(state.heartAlert ? "Heart-rate alert mode enabled." : "Heart rate returned to the target zone.");
});

document.getElementById("nextSetBtn").addEventListener("click", () => {
  state.live.progress = Math.min(100, state.live.progress + 8);
  state.live.reps = Math.max(0, state.live.reps - 2);
  state.live.elapsed += 1;
  state.live.hr = state.heartAlert ? 156 : 145;
  updateLive();
  advanceUserSet();
  showToast("Moved to the next set. Rest timer recommended: 30 seconds.");
});

async function fetchExerciseData() {
  const candidates = [
    DATA_URL,
    "../assets/exercise-data.json",
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (data && Array.isArray(data.exercises) && data.exercises.length) return data;
    } catch (_) {
      // Try next candidate
    }
  }
  throw new Error("exercise-data.json not reachable");
}

async function init() {
  renderExercises();
  try {
    const data = await fetchExerciseData();
    state.exerciseData = buildExerciseList(data);
    state.selectedExercise = state.exerciseData[0]?.id || "";
    state.loaded = true;
    renderExercises();
    renderExerciseDetail();
    syncLiveHeader();
    updateGymMap();
  } catch (err) {
    state.loaded = true;
    state.exerciseData = [];
    renderExercises();
    const isFileProtocol = window.location.protocol === "file:";
    showToast(
      isFileProtocol
        ? "检测到 file:// 打开，浏览器会拦截 JSON 读取。请用本地 HTTP 服务打开 demo。"
        : "Could not load exercise-data.json. Check path and static server."
    );
  }
}

updateLive();
setPersona("user");
init();
