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
import { useAutoMode } from "@/hooks/use-auto-mode";

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
  // APPLY RESPONSE
  // ------------------------------------------------------------

  function applyStepResponse(data: any) {
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
  // ACTIONS
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
  // AUTO MODE (🔥 key upgrade)
  // ------------------------------------------------------------

  const auto = useAutoMode({
    intervalMs: 4000,
    enabled: true,
    onTick: async () => {
      // simple regime cycling (can upgrade later with SCE logic)
      const regimes = ["boundary", "fragmentation", "unity"];
      const next = regimes[Math.floor(Math.random() * regimes.length)];

      const data = await stepWorld(next);
      applyStepResponse(data);
    },
  });

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
  // LOADING
  // ------------------------------------------------------------

  if (!state) {
    return (
      <div className="panel p-6 text-sm text-muted">
        Loading world...
      </div>
    );
  }

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* LEFT — CHRONICLE */}
      <div className="flex flex-col gap-4">
        {error && (
          <div className="panel p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <ChronicleFeed
          latestNarration={latestNarration}
          history={state.history}
        />
      </div>

      {/* RIGHT */}
      <div className="flex flex-col gap-4">
        <RealmStateCard world={state.world} />

        {/* AUTO CONTROL */}
        <div className="panel p-4">
          <div className="mb-2 flex justify-between items-center">
            <span className="label">Flow</span>
            <span className="text-xs text-muted">
              {auto.isAutoMode ? "Auto" : "Paused"}
            </span>
          </div>

          <button
            className="button w-full"
            onClick={auto.toggle}
          >
            {auto.isAutoMode ? "Pause World" : "Resume World"}
          </button>
        </div>

        {/* SETUP */}
        <div className="panel p-4">
          <div className="label mb-2">World Setup</div>

          <div className="flex flex-col gap-2">
            <button className="button" onClick={() => handlePreset("royal_betrayal")}>
              Royal Betrayal
            </button>
            <button className="button" onClick={() => handlePreset("fractured_court")}>
              Fractured Court
            </button>
            <button className="button" onClick={() => handlePreset("collapse_edge")}>
              Collapse Edge
            </button>
            <button className="button ghost" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>

        {/* ACTIONS */}
        <SuggestedActions
          actions={state.suggested_actions}
          loading={loading}
          onWorldAction={(a) => handleWorldAction(a)}
          onCharacterAction={(a, t) => handleCharacterAction(a, t)}
          onPassAction={handlePass}
        />

        <CastPanel cast={state.cast} />
      </div>
    </div>
  );
}
