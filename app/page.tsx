"use client";

import { useEffect, useState } from "react";
import {
  AppStateResponse,
  NarrationPayload,
  applyAction,
  getState,
  loadPreset,
  resetWorld,
  stepWorld,
} from "@/lib/api";
import ChronicleFeed from "@/components/chronicle/chronicle-feed";
import CastPanel from "@/components/world/cast-panel";
import RealmStateCard from "@/components/world/realm-state-card";
import SuggestedActions from "@/components/actions/suggested-actions";

export default function Page() {
  const [state, setState] = useState<AppStateResponse | null>(null);
  const [latestNarration, setLatestNarration] = useState<NarrationPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ------------------------------------------------------------
  // INIT
  // ------------------------------------------------------------

  useEffect(() => {
    void initialize();
  }, []);

  async function initialize() {
    try {
      setLoading(true);
      setError(null);

      const data = await getState();
      setState(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load world.");
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------------------------------------
  // HELPERS
  // ------------------------------------------------------------

  function applyStepResponse(data: {
    world: AppStateResponse["world"];
    cast: AppStateResponse["cast"];
    history: AppStateResponse["history"];
    suggested_actions: AppStateResponse["suggested_actions"];
    narration: NarrationPayload;
    relationships?: AppStateResponse["relationships"];
    meta?: AppStateResponse["meta"];
  }) {
    setState((prev) => ({
      world: data.world,
      cast: data.cast,
      history: data.history,
      suggested_actions: data.suggested_actions,
      relationships: data.relationships ?? prev?.relationships ?? [],
      meta: data.meta ?? prev?.meta ?? {},
    }));

    setLatestNarration(data.narration);
  }

  // ------------------------------------------------------------
  // WORLD ACTIONS
  // ------------------------------------------------------------

  async function handleWorldAction(action: string) {
    try {
      setLoading(true);
      setError(null);

      const data = await stepWorld(action);
      applyStepResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "World action failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCharacterAction(action: string, target: string) {
    try {
      setLoading(true);
      setError(null);

      const data = await applyAction(action, target);
      applyStepResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Character action failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePass() {
    await handleWorldAction("boundary");
  }

  // ------------------------------------------------------------
  // WORLD SETUP
  // ------------------------------------------------------------

  async function handlePreset(preset: string) {
    try {
      setLoading(true);
      setError(null);
      setLatestNarration(null);

      const data = await loadPreset(preset);
      setState(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load preset.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    try {
      setLoading(true);
      setError(null);
      setLatestNarration(null);

      const data = await resetWorld();
      setState(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset world.");
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------------------------------------
  // LOADING / ERROR
  // ------------------------------------------------------------

  if (!state && loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="panel p-6 text-sm text-muted">Loading world...</div>
        <div className="panel p-6 text-sm text-muted">Preparing the realm...</div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="panel p-6">
        <div className="mb-2 text-base font-semibold">Living Legends</div>
        <div className="text-sm text-muted">
          {error || "The world could not be loaded."}
        </div>

        <div className="mt-4">
          <button className="button primary" onClick={() => void initialize()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* LEFT — CHRONICLE */}
      <div className="flex min-h-[70vh] flex-col gap-4">
        {error ? (
          <div className="panel p-4 text-sm text-red-400">{error}</div>
        ) : null}

        <ChronicleFeed
          latestNarration={latestNarration}
          history={state.history}
        />
      </div>

      {/* RIGHT — WORLD / ACTIONS */}
      <div className="flex flex-col gap-4">
        <RealmStateCard world={state.world} />

        <div className="panel p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">World Setup</h2>
            <span className="text-xs text-muted">
              {loading ? "Working..." : "Ready"}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <button
              className="button"
              onClick={() => void handlePreset("royal_betrayal")}
              disabled={loading}
            >
              Royal Betrayal
            </button>
            <button
              className="button"
              onClick={() => void handlePreset("fractured_court")}
              disabled={loading}
            >
              Fractured Court
            </button>
            <button
              className="button"
              onClick={() => void handlePreset("collapse_edge")}
              disabled={loading}
            >
              Collapse Edge
            </button>
            <button
              className="button ghost"
              onClick={() => void handleReset()}
              disabled={loading}
            >
              Reset World
            </button>
          </div>
        </div>

        <SuggestedActions
          actions={state.suggested_actions}
          loading={loading}
          onWorldAction={(action) => void handleWorldAction(action)}
          onCharacterAction={(action, target) =>
            void handleCharacterAction(action, target)
          }
          onPassAction={() => void handlePass()}
        />

        <CastPanel cast={state.cast} />
      </div>
    </div>
  );
}
