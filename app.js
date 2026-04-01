// app.js

const API_BASE = "https://sce-engine.onrender.com";

const entitiesEl = document.getElementById("entities");
const latestEl = document.getElementById("latest");
const historyEl = document.getElementById("history");
const characterEl = document.getElementById("character");

function renderState(state) {
  if (!state) return;

  const entities = state.entities || {};
  const history = state.history || [];

  entitiesEl.textContent = Object.entries(entities)
    .map(([name, role]) => `${name}: ${role}`)
    .join("\n");

  if (history.length > 0) {
    const latest = history[history.length - 1];
    latestEl.textContent =
      `Tick ${latest.tick}\n` +
      `Target Regime: ${latest.target_regime}\n` +
      `Current Regime: ${latest.current_regime}\n` +
      `Action Mode: ${latest.action_mode}\n\n` +
      `Beat:\n${latest.beat}`;

    historyEl.textContent = history
      .map((turn) => `Tick ${turn.tick} — ${turn.beat}`)
      .join("\n\n");
  } else {
    latestEl.textContent = "Choose a world action to begin.";
    historyEl.textContent = "No turns yet.";
  }
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
    setLoading("Connecting to Living Legends...");
    const state = await getState();
    renderState(state);
  } catch (err) {
    setError(
      `${err.message}\n\n` +
      `Make sure the Living Legends backend is running and API_BASE is correct.`
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
      const state = await getState();
      renderState(state);
    }
  } catch (err) {
    setError(err.message);
  }
}

async function characterAction(action) {
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
      const state = await getState();
      renderState(state);
    }
  } catch (err) {
    setError(err.message);
  }
}

async function resetWorld() {
  try {
    setLoading("Resetting world...");
    const state = await postJSON("/reset", {});
    renderState(state);
  } catch (err) {
    setError(err.message);
  }
}

loadInitialState();
