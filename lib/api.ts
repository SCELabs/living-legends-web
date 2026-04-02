const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export type Role = {
  role_id: string;
  structural_role: string;
  display_role: string;
  name: string;
  condition: string;
  condition_label: string;
  bio?: string;
  traits?: string[];
  influence?: number;
  volatility?: number;
};

export type WorldState = {
  world_id?: string;
  name: string;
  type?: string;
  tone?: string;
  premise?: string;
  realm_state: string;
  resources?: Record<string, number>;
};

export type Relationship = {
  source: string;
  target: string;
  type: string;
  intensity?: number;
  public?: boolean;
  description?: string;
};

export type SuggestedAction = {
  label: string;
  kind: "character" | "world" | "pass";
  action: string;
  target?: string | null;
  priority?: number;
};

export type EventRecord = {
  tick: number;
  event_type: string;
  trigger?: string;
  realm_state_before?: string;
  realm_state_after?: string;
  target_regime?: string;
  changes?: Array<{
    role_id?: string;
    name: string;
    display_role?: string;
    from: string;
    to: string;
  }>;
  action?: string | null;
  target?: string | null;
};

export type NarrationPayload = {
  narration: string;
  pressure?: string;
  event_type?: string;
  provider?: string;
};

export type AppStateResponse = {
  world: WorldState;
  cast: Role[];
  relationships: Relationship[];
  history: EventRecord[];
  suggested_actions: SuggestedAction[];
  meta?: Record<string, unknown>;
};

export type StepResponse = {
  world: WorldState;
  cast: Role[];
  event: EventRecord;
  narration: NarrationPayload;
  history: EventRecord[];
  suggested_actions: SuggestedAction[];
};

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      message = data?.detail || message;
    } catch {
      try {
        message = await res.text();
      } catch {
        // ignore secondary parse failure
      }
    }
    throw new Error(message);
  }

  return res.json();
}

export async function getState(): Promise<AppStateResponse> {
  return request<AppStateResponse>("/state", {
    method: "GET",
  });
}

export async function createWorld(payload?: {
  world_type?: string;
  tone?: string;
  context?: Record<string, unknown>;
}): Promise<AppStateResponse> {
  return request<AppStateResponse>("/world", {
    method: "POST",
    body: JSON.stringify(payload || {}),
  });
}

export async function loadPreset(
  preset: string,
): Promise<AppStateResponse> {
  return request<AppStateResponse>("/preset", {
    method: "POST",
    body: JSON.stringify({ preset }),
  });
}

export async function resetWorld(): Promise<AppStateResponse> {
  return request<AppStateResponse>("/reset", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function stepWorld(
  target_regime: string = "boundary",
): Promise<StepResponse> {
  return request<StepResponse>("/step", {
    method: "POST",
    body: JSON.stringify({ target_regime }),
  });
}

export async function applyAction(
  action: string,
  target: string,
): Promise<StepResponse> {
  return request<StepResponse>("/action", {
    method: "POST",
    body: JSON.stringify({ action, target }),
  });
}
