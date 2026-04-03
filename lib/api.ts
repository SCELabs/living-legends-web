const RAW_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

const API_BASE = RAW_API_BASE.replace(/\/+$/, "");

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

export type CastMember = Role;

export type WorldState = {
  world_id?: string;
  name: string;
  type?: string;
  tone?: string;
  premise?: string;
  realm_state: string;
  resources?: Record<string, string | number | boolean | null>;
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

export type ProloguePayload = {
  title?: string;
  body?: string;
  atmosphere?: string;
};

export type ChronicleBlock = {
  id?: string;
  label?: string;
  body: string;
  pressure?: string;
  weight?: "minor" | "major";
  focus_character?: string;
};

export type ChoicePoint = {
  active: boolean;
  prompt?: string;
  choices: Array<{
    id: string;
    label: string;
    action: string;
    target?: string | null;
  }>;
};

export type AppStateResponse = {
  world: WorldState;
  cast: Role[];
  relationships: Relationship[];
  history: EventRecord[];
  suggested_actions: SuggestedAction[];
  meta?: Record<string, unknown>;
  prologue?: ProloguePayload;
  chronicle?: ChronicleBlock[];
  choice_point?: ChoicePoint;
};

export type StepResponse = {
  world: WorldState;
  cast: Role[];
  event: EventRecord;
  narration: NarrationPayload;
  history: EventRecord[];
  suggested_actions: SuggestedAction[];
  relationships: Relationship[];
  meta?: Record<string, unknown>;
  chronicle?: ChronicleBlock[];
  choice_point?: ChoicePoint;
};

type CreateWorldPayload = {
  world_type?: string;
  tone?: string;
  context?: Record<string, unknown>;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE}${normalizedPath}`;

  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
      cache: "no-store",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown network error";

    throw new Error(`Request failed for ${url}: ${message}`);
  }

  if (!response.ok) {
    let message = `API error: ${response.status}`;

    try {
      const data = await response.json();
      message = data?.detail || data?.message || message;
    } catch {
      try {
        const text = await response.text();
        if (text) message = text;
      } catch {
        // ignore secondary parsing failure
      }
    }

    throw new Error(`${message} (${url})`);
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid JSON response";

    throw new Error(`Failed to parse JSON from ${url}: ${message}`);
  }
}

export async function getState(): Promise<AppStateResponse> {
  return request<AppStateResponse>("/state", {
    method: "GET",
  });
}

export async function createWorld(
  payload?: CreateWorldPayload
): Promise<AppStateResponse> {
  return request<AppStateResponse>("/world", {
    method: "POST",
    body: JSON.stringify(payload || {}),
  });
}

export async function loadPreset(preset: string): Promise<AppStateResponse> {
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
  target_regime: string = "boundary"
): Promise<StepResponse> {
  return request<StepResponse>("/step", {
    method: "POST",
    body: JSON.stringify({ target_regime }),
  });
}

export async function applyAction(
  action: string,
  target: string
): Promise<StepResponse> {
  return request<StepResponse>("/action", {
    method: "POST",
    body: JSON.stringify({ action, target }),
  });
}

export { API_BASE };
