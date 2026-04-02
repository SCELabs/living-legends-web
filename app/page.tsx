"use client";

import { useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type Role = {
  role_id: string;
  name: string;
  display_role: string;
  condition: string;
  condition_label: string;
};

type Event = {
  tick: number;
  event_type: string;
};

type Narration = {
  narration: string;
  pressure: string;
  event_type: string;
};

type State = {
  world: {
    name: string;
    realm_state: string;
  };
  cast: Role[];
  history: Event[];
  suggested_actions: any[];
};

export default function Page() {
  const [state, setState] = useState<State | null>(null);
  const [latest, setLatest] = useState<Narration | null>(null);
  const [loading, setLoading] = useState(false);

  // ------------------------------------------------------------
  // INIT
  // ------------------------------------------------------------

  useEffect(() => {
    loadState();
  }, []);

  async function loadState() {
    const res = await fetch(`${API_BASE}/state`);
    const data = await res.json();
    setState(data);
  }

  // ------------------------------------------------------------
  // STEP
  // ------------------------------------------------------------

  async function step(target: string = "boundary") {
    setLoading(true);

    const res = await fetch(`${API_BASE}/step`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ target_regime: target }),
    });

    const data = await res.json();

    setState({
      world: data.world,
      cast: data.cast,
      history: data.history,
      suggested_actions: data.suggested_actions,
    });

    setLatest(data.narration);
    setLoading(false);
  }

  // ------------------------------------------------------------
  // ACTION
  // ------------------------------------------------------------

  async function act(action: string, target: string) {
    setLoading(true);

    const res = await fetch(`${API_BASE}/action`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, target }),
    });

    const data = await res.json();

    setState({
      world: data.world,
      cast: data.cast,
      history: data.history,
      suggested_actions: data.suggested_actions,
    });

    setLatest(data.narration);
    setLoading(false);
  }

  if (!state) {
    return <div>Loading world...</div>;
  }

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* LEFT — CHRONICLE */}
      <div className="col-span-2 flex flex-col gap-4">
        {/* Latest Event */}
        <div className="panel p-4">
          <div className="label mb-2">Latest Event</div>
          <div className="text-sm whitespace-pre-wrap">
            {latest?.narration || "The world is quiet..."}
          </div>

          {latest?.pressure && (
            <div className="mt-3 text-xs text-muted">
              {latest.pressure}
            </div>
          )}
        </div>

        {/* Chronicle Feed */}
        <div className="panel p-4 h-[500px] overflow-y-auto flex flex-col gap-3">
          {state.history.length === 0 && (
            <div className="text-muted text-sm">No events yet.</div>
          )}

          {state.history.map((e) => (
            <div key={e.tick} className="text-sm">
              <span className="text-muted mr-2">[{e.event_type}]</span>
              Tick {e.tick}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — WORLD + ACTIONS */}
      <div className="flex flex-col gap-4">
        {/* World State */}
        <div className="panel p-4">
          <div className="label mb-2">Realm</div>
          <div className="text-sm">{state.world.realm_state}</div>
        </div>

        {/* Cast */}
        <div className="panel p-4">
          <div className="label mb-2">Cast</div>

          <div className="flex flex-col gap-2">
            {state.cast.map((c) => (
              <div
                key={c.role_id}
                className="flex justify-between text-sm"
              >
                <span>{c.name}</span>
                <span className="text-muted">
                  {c.condition_label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Actions */}
        <div className="panel p-4">
          <div className="label mb-2">Suggested</div>

          <div className="flex flex-col gap-2">
            {state.suggested_actions.map((a, i) => (
              <button
                key={i}
                className="button"
                onClick={() => {
                  if (a.kind === "world") step(a.action);
                  if (a.kind === "character")
                    act(a.action, a.target);
                }}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Control */}
        <div className="panel p-4">
          <button
            className="button primary w-full"
            onClick={() => step()}
            disabled={loading}
          >
            {loading ? "Advancing..." : "Let It Unfold"}
          </button>
        </div>
      </div>
    </div>
  );
}
