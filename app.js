const API_BASE = "https://sce-engine.onrender.com";

const entitiesEl = document.getElementById("entities");
const latestEl = document.getElementById("latest");
const historyEl = document.getElementById("history");
const systemEl = document.getElementById("system");
const characterEl = document.getElementById("character");

let autoModeInterval = null;

function renderState(state) {
  if (!state) return;

  const entities = state.entities || {};
  const history = state.history || [];

  entitiesEl.textContent = Object.entries(entities)
    .map(([name, role]) => `${name} — ${formatRole(role)}`)
    .join("\n");

  if (history.length > 0) {
    const latest = history[history.length - 1];

    latestEl.textContent =
      `Tick ${latest.tick}\n` +
      `Target: ${latest.target_regime}\n` +
      `Current: ${latest.current_regime}\n` +
      `Mode: ${latest.action_mode}\n\n` +
      `${latest.beat}`;

    systemEl.textContent = latest.current_regime.toUpperCase();
    systemEl.className = `status-value ${latest.current_regime}`;

    historyEl.textContent = history
      .map((turn) => `Tick ${turn.tick} — ${turn.current_regime}\n${turn.beat}`)
      .join("\n\n— — —\n\n");
  } else {
    latestEl.textContent = "Choose a world action to begin.";
    historyEl.textContent = "No turns yet.";
    systemEl.textContent = "INITIAL";
    systemEl.className = "status-value";
  }
}

function formatRole(role) {
  const map = {
    stable_core: "Stable Core",
    soft_boundary: "Soft Boundary",
    contested_boundary: "Contested Boundary",
    collapse_edge: "Collapse Edge",
  };

  return map[role] || role;
}

function setLoading(message = "Loading...") {
  latestEl.textContent = message;
}

function setError(message) {
  latestEl.textContent = `Error:\n${message}`;
}

async function getState() {
  const res = await fetch(`${API_BASE}/state`);
  if (!res.ok) {
    throw new Error(`GET /state failed (${res.status})`);
  }
  return await res.json();
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

async function loadInitialState() {
  try {
    setLoading("Connecting... first load may take ~15 seconds.");
    const state = await getState();
    renderState(state);
  } catch (err) {
    setError(
      `${err.message}\n\nMake sure the Living Legends backend is running and API_BASE is correct.`
    );
  }
}

async function worldAction(targetRegime) {
  try {
    setLoading(`Applying world action: ${targetRegime}...`);
    const result = await postJSON("/world-action", {
      target_regime: targetRegime,
    });

    if (result.full_state) {
      renderState(result.full_state);
    } else {
      renderState(await getState());
    }
  } catch (err) {
    setError(err.message);
  }
}

async function selectedCharacterAction(action) {
  try {
    const character = characterEl.value;
    setLoading(`Applying ${action} to ${character}...`);
    const result = await postJSON("/character-action", {
      action,
      character,
    });

    if (result.full_state) {
      renderState(result.full_state);
    } else {
      renderState(await getState());
    }
  } catch (err) {
    setError(err.message);
  }
}

async function comboAction(action) {
  try {
    setLoading(`Applying combo action: ${action}...`);
    const result = await postJSON("/combo-action", {
      action,
    });

    if (result.full_state) {
      renderState(result.full_state);
    } else {
      renderState(await getState());
    }
  } catch (err) {
    setError(err.message);
  }
}

async function loadPreset(preset) {
  try {
    stopAutoMode();
    setLoading(`Loading preset: ${preset}...`);
    const state = await postJSON("/preset", {
      preset,
    });
    renderState(state);
  } catch (err) {
    setError(err.message);
  }
}

async function resetWorld() {
  try {
    stopAutoMode();
    setLoading("Resetting world...");
    const state = await postJSON("/reset", {});
    renderState(state);
  } catch (err) {
    setError(err.message);
  }
}

function chooseAutoRegime(state) {
  const history = state.history || [];
  if (history.length === 0) {
    return "boundary";
  }

  const latest = history[history.length - 1];
  const current = latest.current_regime;

  if (current === "unity") {
    return "boundary";
  }

  if (current === "boundary") {
    return "fragmentation";
  }

  return "unity";
}

async function nextTick() {
  try {
    setLoading("Advancing world...");
    const state = await getState();
    const targetRegime = chooseAutoRegime(state);
    await worldAction(targetRegime);
  } catch (err) {
    setError(err.message);
  }
}

function startAutoMode() {
  if (autoModeInterval !== null) {
    return;
  }

  nextTick();
  autoModeInterval = setInterval(nextTick, 5000);
}

function stopAutoMode() {
  if (autoModeInterval !== null) {
    clearInterval(autoModeInterval);
    autoModeInterval = null;
  }
}

loadInitialState();
