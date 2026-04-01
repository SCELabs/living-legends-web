const API_BASE = "https://sce-engine.onrender.com"

const entitiesEl = document.getElementById("entities")
const latestEl = document.getElementById("latest")
const historyEl = document.getElementById("history")
const systemEl = document.getElementById("system")

function renderState(state) {
  if (!state) return

  const entities = state.entities || {}
  const history = state.history || []

  // Entities
  entitiesEl.textContent = Object.entries(entities)
    .map(([name, role]) => `${name} — ${formatRole(role)}`)
    .join("\n")

  if (history.length > 0) {
    const latest = history[history.length - 1]

    latestEl.textContent =
      `Tick ${latest.tick}\n` +
      `Target: ${latest.target_regime}\n` +
      `Current: ${latest.current_regime}\n\n` +
      latest.beat

    systemEl.textContent = latest.current_regime.toUpperCase()
    systemEl.className = latest.current_regime

    historyEl.textContent = history
      .map(h =>
        `Tick ${h.tick} — ${h.current_regime}\n${h.beat}`
      )
      .join("\n\n---\n\n")
  }
}

function formatRole(role) {
  const map = {
    "stable_core": "Stable Core (Anchor of Order)",
    "soft_boundary": "Soft Boundary (Shifting Loyalty)",
    "contested_boundary": "Contested Boundary (Conflict Zone)",
    "collapse_edge": "Collapse Edge (Breaking Point)"
  }

  return map[role] || role
}

async function fetchState() {
  const res = await fetch(`${API_BASE}/state`)
  const data = await res.json()
  renderState(data)
}

async function step(regime) {
  const res = await fetch(`${API_BASE}/step`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target_regime: regime })
  })

  const data = await res.json()
  renderState(data)
}

async function characterAction(action, character) {
  const res = await fetch(`${API_BASE}/character_action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: action,
      character: character
    })
  })

  const data = await res.json()
  renderState(data)
}

async function reset() {
  const res = await fetch(`${API_BASE}/reset`, {
    method: "POST"
  })

  const data = await res.json()
  renderState(data)
}

fetchState()
