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

  // TEMP DEBUG
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    void initialize();
  }, []);

  async function initialize() {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo({
        stage: "initialize:start",
        apiBase: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000",
      });

      const data = await getState();

      setDebugInfo({
        stage: "initialize:success",
        apiBase: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000",
        hasWorld: !!data?.world,
        worldName: data?.world?.name,
        castCount: data?.cast?.length ?? 0,
        historyCount: data?.history?.length ?? 0,
        actionCount: data?.suggested_actions?.length ?? 0,
        keys: Object.keys(data || {}),
      });

      setState(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load world.";
      setError(message);
      setDebugInfo({
        stage: "initialize:error",
        apiBase: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000",
        error: message,
      });
    } finally {
      setLoading(false);
    }
  }

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

    setDebugInfo({
      stage: "applyStepResponse",
      worldName: data.world?.name,
      realmState: data.world?.realm_state,
      castCount: data.cast?.length ?? 0,
      historyCount: data.history?.length ?? 0,
      actionCount: data.suggested_actions?.length ?? 0,
      narrationProvider: data.narration?.provider ?? null,
    });
  }

  async function handleWorldAction(action: string) {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo({
        stage: "handleWorldAction:start",
        action,
      });

      const data = await stepWorld(action);
      applyStepResponse(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "World action failed.";
      setError(message);
      setDebugInfo({
        stage: "handleWorldAction:error",
        action,
        error: message,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCharacterAction(action: string, target: string) {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo({
        stage: "handleCharacterAction:start",
        action,
        target,
      });

      const data = await applyAction(action, target);
      applyStepResponse(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Character action failed.";
      setError(message);
      setDebugInfo({
        stage: "handleCharacterAction:error",
        action,
        target,
        error: message,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handlePass() {
    await handleWorldAction("boundary");
  }

  const auto = useAutoMode({
    intervalMs: 4000,
    enabled: true,
    onTick: async () => {
      const regimes = ["boundary", "fragmentation", "unity"];
      const next = regimes[Math.floor(Math.random() * regimes.length)];

      const data = await stepWorld(next);
      applyStepResponse(data);
    },
  });

  async function handlePreset(preset: string) {
    try {
      setLoading(true);
      setError(null);
      setLatestNarration(null);
      setDebugInfo({
        stage: "handlePreset:start",
        preset,
      });

      const data = await loadPreset(preset);
      setState(data);
      setDebugInfo({
        stage: "handlePreset:success",
        preset,
        worldName: data?.world?.name,
        castCount: data?.cast?.length ?? 0,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load preset.";
      setError(message);
      setDebugInfo({
        stage: "handlePreset:error",
        preset,
        error: message,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    try {
      setLoading(true);
      setError(null);
      setLatestNarration(null);
      setDebugInfo({
        stage: "handleReset:start",
      });

      const data = await resetWorld();
      setState(data);
      setDebugInfo({
        stage: "handleReset:success",
        worldName: data?.world?.name,
        castCount: data?.cast?.length ?? 0,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reset world.";
      setError(message);
      setDebugInfo({
        stage: "handleReset:error",
        error: message,
      });
    } finally {
      setLoading(false);
    }
  }

  if (!state && loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="panel p-6">
          <div className="text-sm text-muted">Loading world...</div>

          {debugInfo ? (
            <pre className="mt-4 overflow-auto text-xs text-muted whitespace-pre-wrap">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          ) : null}
        </div>

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

        {debugInfo ? (
          <pre className="mt-4 overflow-auto text-xs text-muted whitespace-pre-wrap">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        ) : null}

        <div className="mt-4">
          <button className="button primary" onClick={() => void initialize()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-h-[70vh] flex-col gap-4">
        {error ? (
          <div className="panel p-4 text-sm text-red-400">{error}</div>
        ) : null}

        <ChronicleFeed latestNarration={latestNarration} history={state.history} />
      </div>

      <div className="flex flex-col gap-4">
        <RealmStateCard world={state.world} />

        <div className="panel p-4">
          <div className="mb-2 flex justify-between items-center">
            <span className="label">Flow</span>
            <span className="text-xs text-muted">
              {auto.isAutoMode ? "Auto" : "Paused"}
            </span>
          </div>

          <button className="button w-full" onClick={auto.toggle}>
            {auto.isAutoMode ? "Pause World" : "Resume World"}
          </button>
        </div>

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

        <div className="panel p-4">
          <div className="label mb-2">Debug</div>
          <pre className="overflow-auto text-xs text-muted whitespace-pre-wrap">
            {JSON.stringify(
              {
                apiBase:
                  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000",
                worldName: state.world?.name,
                realmState: state.world?.realm_state,
                castCount: state.cast?.length ?? 0,
                historyCount: state.history?.length ?? 0,
                actionCount: state.suggested_actions?.length ?? 0,
                latestNarration,
                debugInfo,
              },
              null,
              2,
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
