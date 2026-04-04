type RealmUI = {
  label: string;
  tone: "positive" | "neutral" | "negative";
};

type ConditionUI = {
  label: string;
  tone: string;
};

function normalizeCondition(condition?: string): string | undefined {
  if (!condition) return condition;

  if (condition === "loyal") return "anchored";
  if (condition === "uncertain") return "wavering";
  if (condition === "divided") return "wavering";
  if (condition === "unraveling") return "under_strain";

  return condition;
}

export function getRealmUI(realmState?: string): RealmUI {
  if (realmState === "unified") {
    return {
      label: "Unified",
      tone: "positive",
    };
  }

  if (realmState === "under_tension") {
    return {
      label: "Under Tension",
      tone: "neutral",
    };
  }

  if (realmState === "fractured") {
    return {
      label: "Fractured",
      tone: "negative",
    };
  }

  return {
    label: "Unclear",
    tone: "neutral",
  };
}

export function toneClass(tone: string) {
  if (tone === "positive") return "text-emerald-300";
  if (tone === "negative") return "text-red-300";
  return "text-amber-300";
}

export function getConditionUI(condition?: string): ConditionUI {
  const canonical = normalizeCondition(condition);

  if (canonical === "anchored") {
    return {
      label: "Anchored",
      tone: "text-emerald-300",
    };
  }

  if (canonical === "wavering") {
    return {
      label: "Wavering",
      tone: "text-amber-300",
    };
  }

  if (canonical === "under_strain") {
    return {
      label: "Under Strain",
      tone: "text-red-300",
    };
  }

  return {
    label: "Unclear",
    tone: "text-stone-400",
  };
}

export function getConditionLabel(
  condition?: string,
  fallbackLabel?: string
): string {
  const canonical = normalizeCondition(condition);

  if (canonical === "anchored") return "Anchored";
  if (canonical === "wavering") return "Wavering";
  if (canonical === "under_strain") return "Under Strain";

  if (fallbackLabel) {
    const normalizedFallback = normalizeCondition(
      fallbackLabel.toLowerCase().replaceAll(" ", "_")
    );

    if (normalizedFallback === "anchored") return "Anchored";
    if (normalizedFallback === "wavering") return "Wavering";
    if (normalizedFallback === "under_strain") return "Under Strain";
  }

  return "Unclear";
}

export function getRoleLabel(role?: string) {
  if (!role) return "Figure";

  if (role === "leader") return "King";
  if (role === "heir") return "Heir";
  if (role === "general") return "General";
  if (role === "advisor") return "Oracle";
  if (role === "rival") return "Rival";
  if (role === "wildcard") return "Wildcard";

  return role.replaceAll("_", " ");
}

export function getEventLabel(eventType?: string) {
  if (!eventType) return "Turning";

  if (eventType === "system_step") return "System Shift";
  if (eventType === "world_shift") return "World Shift";
  if (eventType === "character_action") return "Character Move";
  if (eventType === "relationship_change") return "Relationship Shift";

  return eventType.replaceAll("_", " ");
}
