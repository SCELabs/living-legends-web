const API_BASE = "https://sce-engine.onrender.com";

const entitiesEl = document.getElementById("entities");
const latestEl = document.getElementById("latest");
const historyEl = document.getElementById("history");
const systemEl = document.getElementById("system");
const characterEl = document.getElementById("character");

let autoModeInterval = null;
let lastEntitiesSnapshot = null; // for change detection

// ------------------------------------------------------------
// RENDER
// ------------------------------------------------------------

function renderState(state) {
  if (!state) return;

  const entities = state.entities || {};
  const history = state.history || [];

  // LEFT PANEL (world state)
  entitiesEl.textContent = Object.entries(entities)
    .map(([name, role]) => `${name} — ${formatRole(role)}`)
    .join("\n");

  // LATEST + HISTORY
  if (history.length > 0) {
    const latest = history[history.length - 1];

    // --- CHANGE SUMMARY ---
    const changes = getEntityChanges(lastEntitiesSnapshot, entities);
    const changeText = formatChanges(changes);

    // --- PRESSURE TEXT ---
    const pressureText = computePressureText(history, entities);

    // --- EVENT TYPE ---
    const eventType = classifyEvent(latest);

    // --- LATEST CARD ---
    latestEl.textContent =
      `[${eventType}]\n\n` +
      `${latest.beat}\n\n` +
      (changeText ? `Shifts:\n${changeText}\n\n` : "") +
      `${pressureText}`;

    // --- SYSTEM STATE ---
    systemEl.textContent = latest.current_regime.toUpperCase();
    systemEl.className = `status-value ${latest.current_regime}`;

    // --- HISTORY FEED ---
    historyEl.textContent = history
      .map((turn, i) => {
        const prev = i > 0 ? history[i - 1].entities : null;
        const curr = turn.entities;
        const c = formatChanges(getEntityChanges(prev, curr));
        const type = classifyEvent(turn);

        return (
          `[${type}] Tick ${turn.tick}\n` +
          `${turn.beat}\n` +
          (c ? `\n${c}` : "")
        );
      })
      .join("\n\n— — —\n\n");

    // update snapshot
    lastEntitiesSnapshot = { ...entities };
  } else {
    latestEl.textContent = "The world is quiet... for now.";
    historyEl.textContent = "No events yet.";
    systemEl.textContent = "INITIAL";
    systemEl.className = "status-value";

    lastEntitiesSnapshot = { ...entities };
  }
}

// ------------------------------------------------------------
// ROLE LABELS
// ------------------------------------------------------------

function formatRole(role) {
  const map = {
    stable_core: "Stable Core",
    soft_boundary: "Soft Boundary",
    contested_boundary: "Contested Boundary",
    collapse_edge: "Collapse Edge",
  };
  return map[role] || role;
}

// ------------------------------------------------------------
// CHANGE DETECTION
// ------------------------------------------------------------

function getEntityChanges(prev, curr) {
  if (!prev) return [];

  const changes = [];

  for (const key in curr) {
    if (prev[key] !== curr[key]) {
      changes.push({
        name: key,
        from: prev[key],
        to: curr[key],
      });
    }
  }

  return changes;
}

function formatChanges(changes) {
  if (!changes || changes.length === 0) return "";

  return changes
    .map(
      (c) =>
        `${c.name}: ${formatRole(c.from)} → ${formatRole(c.to)}`
    )
    .join("\n");
}

// ------------------------------------------------------------
// PRESSURE SYSTEM (frontend heuristic for now)
// ------------------------------------------------------------

function computePressureText(history, entities) {
  const roles = Object.values(entities);

  const contested = roles.filter((r) => r === "contested_boundary").length;
  const collapsed = roles.filter((r) => r === "collapse_edge").length;
  const stable = roles.filter((r) => r === "stable_core").length;

  if (collapsed >= 2) {
    return "The realm is nearing collapse. Stability is rapidly dissolving.";
  }

  if (contested >= 2) {
    return "Tension is spreading across the court. Loyalties are no longer certain.";
  }

  if (stable === roles.length) {
    return "Power has consolidated. The realm moves as one.";
  }

  return "The world holds in a fragile balance.";
}

// ------------------------------------------------------------
// EVENT TYPE CLASSIFICATION
// ------------------------------------------------------------

function classifyEvent(turn) {
  if (!turn) return "EVENT";

  if (turn.action_mode === "stabilize") return "REALIGNMENT";
  if (turn.target_regime === "fragmentation") return "FRACTURE";
  if (turn.target_regime === "unity") return "CONSOLIDATION";

  return "SHIFT";
}

// ------------------------------------------------------------
// API HELPERS
// ------------------------------------------------------------

async function getState() {
  const res = await fetch(`${API_BASE}/state`);
  if (!res.ok) throw new Error("Failed to fetch state");
  return await res.json();
}

async function postJSON(path, body = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return await res.json();
}

// ------------------------------------------------------------
// CORE ACTIONS
// ------------------------------------------------------------

async function loadInitialState() {
  try {
    const state = await getState();
    renderState(state);
  } catch (err) {
    latestEl.textContent = "Failed to connect to world.";
  }
}

async function worldAction(targetRegime) {
  const result = await postJSON("/world-action", {
    target_regime: targetRegime,
  });

  renderState(result.full_state || (await getState()));
}

async function selectedCharacterAction(action) {
  const character = characterEl.value;

  const result = await postJSON("/character-action", {
    action,
    character,
  });

  renderState(result.full_state || (await getState()));
}

async function comboAction(action) {
  const result = await postJSON("/combo-action", { action });
  renderState(result.full_state || (await getState()));
}

async function loadPreset(preset) {
  stopAutoMode();
  const state = await postJSON("/preset", { preset });
  renderState(state);
}

async function resetWorld() {
  stopAutoMode();
  const state = await postJSON("/reset", {});
  renderState(state);
}

// ------------------------------------------------------------
// SIMULATION LOOP
// ------------------------------------------------------------

function chooseAutoRegime(state) {
  const history = state.history || [];
  if (history.length === 0) return "boundary";

  const current = history[history.length - 1].current_regime;

  if (current === "unity") return "boundary";
  if (current === "boundary") return "fragmentation";
  return "unity";
}

async function nextTick() {
  const state = await getState();
  const target = chooseAutoRegime(state);
  await worldAction(target);
}

function startAutoMode() {
  if (autoModeInterval) return;
  nextTick();
  autoModeInterval = setInterval(nextTick, 5000);
}

function stopAutoMode() {
  if (autoModeInterval) {
    clearInterval(autoModeInterval);
    autoModeInterval = null;
  }
}

// ------------------------------------------------------------
// INIT
// ------------------------------------------------------------

loadInitialState();
