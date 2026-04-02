// ------------------------------------------------------------
// CONDITION → UI MAPPING
// ------------------------------------------------------------

export const CONDITION_UI: Record<
  string,
  {
    label: string;
    tone: "stable" | "unstable" | "conflict" | "critical";
  }
> = {
  loyal: {
    label: "Loyal",
    tone: "stable",
  },
  uncertain: {
    label: "Uncertain",
    tone: "unstable",
  },
  divided: {
    label: "Divided",
    tone: "conflict",
  },
  unraveling: {
    label: "Unraveling",
    tone: "critical",
  },
};


// ------------------------------------------------------------
// REALM STATE → UI
// ------------------------------------------------------------

export const REALM_UI: Record<
  string,
  {
    label: string;
    tone: "stable" | "unstable" | "conflict";
  }
> = {
  unified: {
    label: "Unified",
    tone: "stable",
  },
  under_tension: {
    label: "Under Tension",
    tone: "unstable",
  },
  fractured: {
    label: "Fractured",
    tone: "conflict",
  },
};


// ------------------------------------------------------------
// EVENT TYPES
// ------------------------------------------------------------

export const EVENT_UI: Record<string, string> = {
  fracture: "Fracture",
  consolidation: "Consolidation",
  tension: "Tension",
  intervention: "Intervention",
  shift: "Shift",
};


// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

export function getConditionUI(condition: string) {
  return (
    CONDITION_UI[condition] || {
      label: condition,
      tone: "unstable",
    }
  );
}

export function getRealmUI(state: string) {
  return (
    REALM_UI[state] || {
      label: state,
      tone: "unstable",
    }
  );
}

export function getEventLabel(type: string) {
  return EVENT_UI[type] || type;
}


// ------------------------------------------------------------
// TONE → CLASSNAME (ties into globals.css)
// ------------------------------------------------------------

export function toneClass(tone: string) {
  if (tone === "stable") return "state-stable";
  if (tone === "unstable") return "state-unstable";
  if (tone === "conflict") return "state-conflict";
  if (tone === "critical") return "state-critical";
  return "";
}
