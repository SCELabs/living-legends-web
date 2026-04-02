const API_BASE = "https://sce-engine.onrender.com";

const entitiesEl = document.getElementById("entities");
const latestEl = document.getElementById("latest");
const narrativeFeedEl = document.getElementById("narrative-feed");
const systemEl = document.getElementById("system");
const characterEl = document.getElementById("character");

let state = null;
let autoModeInterval = null;
let lastEntitiesSnapshot = null;

// ------------------------------------------------------------
// INIT
// ------------------------------------------------------------

async function init() {
  await loadState();
}

// ------------------------------------------------------------
// STATE LOADING
// ------------------------------------------------------------

async function loadState() {
  try {
    setLatest("Connecting... first load may take ~15 seconds.");
    const res = await fetch(`${API_BASE}/state`);
    if (!res.ok) {
      throw new Error(`GET /state failed (${res.status})`);
    }

    state = await res.json();
    renderState(state, { appendChronicle: true, eventType: "WORLD AWAKENING" });
  } catch (err) {
    setLatest(`Error:\n${err.message}`);
  }
}

// ------------------------------------------------------------
// RENDER
// ------------------------------------------------------------

function renderState(nextState, options = {}) {
  if (!nextState) return;

  const {
    appendChronicle = false,
    eventType = null,
  } = options;

  state = nextState;

  const entities = state.entities || {};
  const history = state.history || [];
  const latestTurn = history.length > 0 ? history[history.length - 1] : null;

  renderEntities(entities);

  if (latestTurn) {
    const changes = getEntityChanges(lastEntitiesSnapshot, latestTurn.entities || entities);
    const shiftText = formatChanges(changes);
    const pressureText = computePressureText(latestTurn.entities || entities);
    const latestEventType = eventType || classifyEvent(latestTurn);

    systemEl.textContent = latestTurn.current_regime.toUpperCase();
    systemEl.className = `status-value ${latestTurn.current_regime}`;

    latestEl.textContent =
      `[${latestEventType}]\n\n` +
      `${latestTurn.beat}\n\n` +
      (shiftText ? `Shifts:\n${shiftText}\n\n` : "") +
      `Pressure:\n${pressureText}`;

    if (appendChronicle) {
      appendChronicleEntry({
        type: latestEventType,
        tick: latestTurn.tick,
        beat: latestTurn.beat,
        shifts: shiftText,
        narration: state.narration || "",
      });
    } else if (narrativeFeedEl.children.length === 0) {
      rebuildChronicleFromHistory(history);
    }
  } else {
    systemEl.textContent = "INITIAL";
    systemEl.className = "status-value";
    latestEl.textContent = state.narration || "The world is quiet... for now.";

    if (narrativeFeedEl.children.length === 0) {
      narrativeFeedEl.innerHTML = `<div class="empty-feed">No events yet.</div>`;
    }
  }

  lastEntitiesSnapshot = { ...entities };
}

function renderEntities(entities) {
  entitiesEl.innerHTML = "";

  Object.entries(entities).forEach(([name, value]) => {
    const div = document.createElement("div");
    div.className = `entity ${value}`;
    div.innerText = `${name} — ${formatRole(value)}`;
    entitiesEl.appendChild(div);
  });
}

function rebuildChronicleFromHistory(history) {
  narrativeFeedEl.innerHTML = "";

  if (!history || history.length === 0) {
    narrativeFeedEl.innerHTML = `<div class="empty-feed">No events yet.</div>`;
    return;
  }

  let prev = null;
  history.forEach((turn) => {
    const shifts = formatChanges(getEntityChanges(prev, turn.entities || {}));
    appendChronicleEntry({
      type: classifyEvent(turn),
      tick: turn.tick,
      beat: turn.beat,
      shifts,
      narration: "",
    });
    prev = turn.entities || {};
  });
}

// ------------------------------------------------------------
// CHRONICLE
// ------------------------------------------------------------

function appendChronicleEntry({ type, tick, beat, shifts, narration }) {
  if (!narrativeFeedEl) return;

  const empty = narrativeFeedEl.querySelector(".empty-feed");
  if (empty) {
    empty.remove();
  }

  const entry = document.createElement("div");
  entry.className = "narrative-entry";

  const parts = [];

  if (type || tick) {
    parts.push(`[${type || "EVENT"}]${tick ? ` Tick ${tick}` : ""}`);
  }

  if (beat) {
    parts.push(beat);
  }

  if (shifts) {
    parts.push(`Shifts:\n${shifts}`);
  }

  if (narration) {
    parts.push(narration);
  }

  entry.innerText = parts.join("\n\n");
  narrativeFeedEl.appendChild(entry);
  narrativeFeedEl.scrollTop = narrativeFeedEl.scrollHeight;
}

// ------------------------------------------------------------
// HELPERS
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

function setLatest(text) {
  latestEl.textContent = text;
}

function getEntityChanges(prev, curr) {
  if (!prev || !curr) return [];

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
    .map((c) => `${c.name}: ${formatRole(c.from)} → ${formatRole(c.to)}`)
    .join("\n");
}

function computePressureText(entities) {
  const values = Object.values(entities || {});
  const stable = values.filter((v) => v === "stable_core").length;
  const soft = values.filter((v) => v === "soft_boundary").length;
  const contested = values.filter((v) => v === "contested_boundary").length;
  const collapsed = values.filter((v) => v === "collapse_edge").length;

  if (collapsed >= 2) {
    return "The realm is nearing collapse. Multiple fault lines are breaking at once.";
  }

  if (contested >= 2) {
    return "Power is unstable. Tension is spreading through the court.";
  }

  if (soft >= 2 && contested === 0) {
    return "The realm is uneasy. Loyalty is softening, but fracture has not yet begun.";
  }

  if (stable === values.length) {
    return "The realm is coherent. Power is consolidated around a stable center.";
  }

  return "The world holds in a fragile balance.";
}

function classifyEvent(turn) {
  if (!turn) return "EVENT";

  if (turn.action_mode === "stabilize") return "REALIGNMENT";
  if (turn.action_mode === "preserve") return "PERSISTENCE";
  if (turn.target_regime === "fragmentation") return "FRACTURE";
  if (turn.target_regime === "unity") return "CONSOLIDATION";
  if (turn.target_regime === "boundary") return "TENSION";

  return "SHIFT";
}

async function postJSON(path, body = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${path} failed (${res.status}): ${text}`);
  }

  return await res.json();
}

// ------------------------------------------------------------
// WORLD ACTIONS
// ------------------------------------------------------------

async function worldAction(targetRegime) {
  try {
    setLatest(`Applying world action: ${targetRegime}...`);
    const result = await postJSON("/world-action", {
      target_regime: targetRegime,
    });

    renderState(result.full_state, {
      appendChronicle: true,
      eventType: classifyWorldAction(targetRegime),
    });
  } catch (err) {
    setLatest(`Error:\n${err.message}`);
  }
}

function classifyWorldAction(targetRegime) {
  if (targetRegime === "fragmentation") return "FRACTURE";
  if (targetRegime === "unity") return "CONSOLIDATION";
  return "TENSION";
}

// ------------------------------------------------------------
// CHARACTER ACTIONS
// ------------------------------------------------------------

async function selectedCharacterAction(action) {
  try {
    const character = characterEl.value;
    setLatest(`Applying ${action} to ${character}...`);

    const result = await postJSON("/character-action", {
      action,
      character,
    });

    renderState(result.full_state, {
      appendChronicle: true,
      eventType: `INTERVENTION`,
    });
  } catch (err) {
    setLatest(`Error:\n${err.message}`);
  }
}

// ------------------------------------------------------------
// COMBO ACTIONS
// ------------------------------------------------------------

async function comboAction(action) {
  try {
    setLatest(`Applying combo action: ${action}...`);

    const result = await postJSON("/combo-action", {
      action,
    });

    renderState(result.full_state, {
      appendChronicle: true,
      eventType: "MAJOR INTERVENTION",
    });
  } catch (err) {
    setLatest(`Error:\n${err.message}`);
  }
}

// ------------------------------------------------------------
// PRESETS + RESET
// ------------------------------------------------------------

async function loadPreset(preset) {
  try {
    stopAutoMode();
    setLatest(`Loading preset: ${preset}...`);

    const result = await postJSON("/preset", {
      preset,
    });

    lastEntitiesSnapshot = null;
    narrativeFeedEl.innerHTML = "";
    renderState(result, {
      appendChronicle: true,
      eventType: "WORLD AWAKENING",
    });
  } catch (err) {
    setLatest(`Error:\n${err.message}`);
  }
}

async function resetWorld() {
  try {
    stopAutoMode();
    setLatest("Resetting world...");

    const result = await postJSON("/reset", {});

    lastEntitiesSnapshot = null;
    narrativeFeedEl.innerHTML = "";
    renderState(result, {
      appendChronicle: true,
      eventType: "REALM RESET",
    });
  } catch (err) {
    setLatest(`Error:\n${err.message}`);
  }
}

// ------------------------------------------------------------
// SIMULATION LOOP
// ------------------------------------------------------------

function chooseAutoRegime(currentState) {
  const history = currentState.history || [];

  if (history.length === 0) {
    return "boundary";
  }

  const latest = history[history.length - 1];
  const current = latest.current_regime;

  if (current === "unity") return "boundary";
  if (current === "boundary") return "fragmentation";
  return "unity";
}

async function nextTick() {
  try {
    setLatest("Advancing world...");
    const currentState = await getState();
    const target = chooseAutoRegime(currentState);
    await worldAction(target);
  } catch (err) {
    setLatest(`Error:\n${err.message}`);
  }
}

function startAutoMode() {
  if (autoModeInterval !== null) return;

  nextTick();
  autoModeInterval = setInterval(nextTick, 5000);
}

function stopAutoMode() {
  if (autoModeInterval !== null) {
    clearInterval(autoModeInterval);
    autoModeInterval = null;
  }
}

async function getState() {
  const res = await fetch(`${API_BASE}/state`);
  if (!res.ok) {
    throw new Error(`GET /state failed (${res.status})`);
  }
  return await res.json();
}

// ------------------------------------------------------------
// GLOBALS
// ------------------------------------------------------------

window.worldAction = worldAction;
window.selectedCharacterAction = selectedCharacterAction;
window.comboAction = comboAction;
window.loadPreset = loadPreset;
window.resetWorld = resetWorld;
window.nextTick = nextTick;
window.startAutoMode = startAutoMode;
window.stopAutoMode = stopAutoMode;

// ------------------------------------------------------------
// START
// ------------------------------------------------------------

init();
