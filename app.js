const API_BASE = "https://sce-engine.onrender.com";

let state = null;

// --------------------------------------------------
// INIT
// --------------------------------------------------

async function init() {
  await loadState();
}

async function loadState() {
  const res = await fetch(`${API_BASE}/state`);
  state = await res.json();

  renderState();
  appendNarration(state.narration);
}

// --------------------------------------------------
// RENDER
// --------------------------------------------------

function renderState() {
  const entitiesEl = document.getElementById("entities");
  entitiesEl.innerHTML = "";

  Object.entries(state.entities).forEach(([name, value]) => {
    const div = document.createElement("div");
    div.className = `entity ${value}`;
    div.innerText = `${name}: ${value}`;
    entitiesEl.appendChild(div);
  });
}

// --------------------------------------------------
// NARRATIVE FEED
// --------------------------------------------------

function appendNarration(text) {
  if (!text) return;

  const feed = document.getElementById("narrative-feed");

  const entry = document.createElement("div");
  entry.className = "narrative-entry";
  entry.innerText = text;

  feed.appendChild(entry);

  // auto scroll
  feed.scrollTop = feed.scrollHeight;
}

// --------------------------------------------------
// WORLD ACTIONS
// --------------------------------------------------

async function worldAction(regime) {
  const res = await fetch(`${API_BASE}/world-action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target_regime: regime }),
  });

  const data = await res.json();
  state = data.full_state;

  renderState();
  appendNarration(data.narration);
}

// --------------------------------------------------
// CHARACTER ACTIONS
// --------------------------------------------------

async function characterAction(action, character) {
  const res = await fetch(`${API_BASE}/character-action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, character }),
  });

  const data = await res.json();
  state = data.full_state;

  renderState();
  appendNarration(data.narration);
}

// --------------------------------------------------
// COMBO ACTIONS (HIGH LEVEL)
// --------------------------------------------------

async function comboAction(action) {
  const res = await fetch(`${API_BASE}/combo-action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });

  const data = await res.json();
  state = data.full_state;

  renderState();
  appendNarration(data.narration);
}

// --------------------------------------------------
// BUTTON HOOKS (GLOBAL)
// --------------------------------------------------

window.worldAction = worldAction;
window.characterAction = characterAction;
window.comboAction = comboAction;

// --------------------------------------------------

init();
