"use client";

import { useEffect, useRef, useState } from "react";
import {
  AppStateResponse,
  NarrationPayload,
  applyAction,
  getState,
  loadPreset,
  resetWorld,
  stepWorld,
} from "@/lib/api";
import { getRealmUI } from "@/lib/labels";
import ChronicleFeed from "@/components/chronicle/chronicle-feed";
import CastPanel from "@/components/world/cast-panel";
import RealmStateCard from "@/components/world/realm-state-card";
import SuggestedActions from "@/components/actions/suggested-actions";
import { useAutoMode } from "@/hooks/use-auto-mode";

type StepLikeResponse = {
  world: AppStateResponse["world"];
  cast: AppStateResponse["cast"];
  history: AppStateResponse["history"];
  suggested_actions: AppStateResponse["suggested_actions"];
  narration: NarrationPayload;
  relationships?: AppStateResponse["relationships"];
  meta?: AppStateResponse["meta"];
};

function choosePassiveRegime(currentRealmState?: string): string {
  if (currentRealmState === "unified") {
    return "boundary";
  }

  if (currentRealmState === "under_tension") {
    return Math.random() < 0.7 ? "boundary" : "fragmentation";
  }

  if (currentRealmState === "fractured") {
    return Math.random() < 0.75 ? "fragmentation" : "unity";
  }

  return "boundary";
}

export default function Page() {
  const [state, setState] = useState<AppStateResponse | null>(null);
  const [latestNarration, setLatestNarration] = useState<NarrationPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasTriggeredOpeningMove = useRef(false);
  const actionLockRef = useRef(false);
  const stateRef = useRef<AppStateResponse | null>(null);
  const hasInitializedRef = useRef(false);

  const auto = useAutoMode({
    intervalMs: 5000,
    enabled: false,
    onTick: async () => {
      if (actionLockRef.current || loading) return;
      const next = choosePassiveRegime(stateRef.current?.world?.realm_state);
      await runWorldStep(next);
    },
  });

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    void initialize();
  }, []);

  function applyStepResponse(data: StepLikeResponse) {
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

  function isInteractionBlocked() {
    return actionLockRef.current || loading || auto.isTicking;
  }

  function pauseAutoModeIfNeeded() {
    if (auto.isAutoMode) {
      auto.toggle();
    }
  }

  async function runWorldStep(targetRegime: string) {
    if (isInteractionBlocked()) return;

    try {
      actionLockRef.current = true;
      setLoading(true);
      setError(null);

      const data = await stepWorld(targetRegime);
      applyStepResponse(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "World action failed.";
      setError(message);
    } finally {
      actionLockRef.current = false;
      setLoading(false);
    }
  }

  async function triggerOpeningMovement(realmState?: string) {
    const next = choosePassiveRegime(realmState ?? stateRef.current?.world?.realm_state);
    await runWorldStep(next || "boundary");
  }

  async function initialize() {
    let handedOffOpeningMovement = false;

    try {
      actionLockRef.current = true;
      setBooting(true);
      setLoading(true);
      setError(null);

      const data = await getState();
      stateRef.current = data;
      setState(data);

      const shouldOpenWithMovement =
        !hasTriggeredOpeningMove.current && (data.history?.length ?? 0) === 0;

      if (shouldOpenWithMovement) {
        hasTriggeredOpeningMove.current = true;
        handedOffOpeningMovement = true;
        actionLockRef.current = false;
        setBooting(false);
        setLoading(false);
        void triggerOpeningMovement(data.world?.realm_state);
        return;
      }

      if (data.history?.length) {
        const latestEvent = data.history[data.history.length - 1];
        setLatestNarration({
          narration:
            "The realm is already in motion. Listen closely and choose where to place your hand upon the scale.",
          pressure: latestEvent?.event_type
            ? `Most recent turning: ${latestEvent.event_type.replaceAll("_", " ")}`
            : undefined,
          event_type: latestEvent?.event_type,
          provider: "frontend",
        });
      } else {
        setLatestNarration({
          narration:
            "The realm holds its breath at the threshold. One subtle pressure is enough to change the fate of everyone within it.",
          pressure: "A first movement has begun.",
          provider: "frontend",
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load world.";
      setError(message);
    } finally {
      actionLockRef.current = false;

      if (!handedOffOpeningMovement) {
        setLoading(false);
        setBooting(false);
      }
    }
  }

  async function handleWorldAction(action: string) {
    if (isInteractionBlocked()) return;
    pauseAutoModeIfNeeded();
    await runWorldStep(action);
  }

  async function handleCharacterAction(action: string, target: string) {
    if (isInteractionBlocked()) return;

    pauseAutoModeIfNeeded();

    try {
      actionLockRef.current = true;
      setLoading(true);
      setError(null);

      const data = await applyAction(action, target);
      applyStepResponse(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Character action failed.";
      setError(message);
    } finally {
      actionLockRef.current = false;
      setLoading(false);
    }
  }

  async function handlePass() {
    if (isInteractionBlocked()) return;
    pauseAutoModeIfNeeded();
    const next = choosePassiveRegime(stateRef.current?.world?.realm_state);
    await runWorldStep(next);
  }

  async function handlePreset(preset: string) {
    if (isInteractionBlocked()) return;

    pauseAutoModeIfNeeded();

    try {
      actionLockRef.current = true;
      setLoading(true);
      setError(null);
      setLatestNarration(null);
      hasTriggeredOpeningMove.current = true;

      const data = await loadPreset(preset);
      stateRef.current = data;
      setState(data);

      actionLockRef.current = false;
      await triggerOpeningMovement(data.world?.realm_state);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load preset.";
      setError(message);
    } finally {
      actionLockRef.current = false;
      setLoading(false);
    }
  }

  async function handleReset() {
    if (isInteractionBlocked()) return;

    pauseAutoModeIfNeeded();

    try {
      actionLockRef.current = true;
      setLoading(true);
      setError(null);
      setLatestNarration(null);
      hasTriggeredOpeningMove.current = true;

      const data = await resetWorld();
      stateRef.current = data;
      setState(data);

      actionLockRef.current = false;
      await triggerOpeningMovement(data.world?.realm_state);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reset world.";
      setError(message);
    } finally {
      actionLockRef.current = false;
      setLoading(false);
    }
  }

  if (!state && booting) {
    return (
      <main className="min-h-screen bg-stone-950 text-stone-100">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <div className="w-full max-w-2xl rounded-3xl border border-stone-800 bg-stone-900/70 p-10 text-center shadow-2xl shadow-black/40 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-400/80">
              Living Legends
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-50">
              Entering the Realm
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-stone-300">
              The world is gathering its shape. Characters, pressure, and possibility
              are aligning into a single living structure.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3 text-sm text-stone-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
              Preparing the first movement...
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!state) {
    return (
      <main className="min-h-screen bg-stone-950 text-stone-100">
        <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-16">
          <div className="w-full max-w-2xl rounded-3xl border border-red-900/40 bg-stone-900/80 p-10 text-center shadow-2xl shadow-black/40">
            <p className="text-xs uppercase tracking-[0.35em] text-red-300/80">
              Living Legends
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-stone-50">
              The Realm Failed to Awaken
            </h1>
            <p className="mt-4 text-sm leading-7 text-stone-300">
              {error || "The world could not be loaded."}
            </p>
            <button
              onClick={() => void initialize()}
              className="mt-8 rounded-full border border-stone-700 bg-stone-800 px-6 py-3 text-sm font-medium text-stone-100 transition hover:border-amber-400/50 hover:bg-stone-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const realmUI = getRealmUI(state.world?.realm_state ?? "");

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <section className="overflow-hidden rounded-[2rem] border border-stone-800 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.12),transparent_35%),linear-gradient(180deg,rgba(28,25,23,0.96),rgba(12,10,9,0.98))] shadow-2xl shadow-black/40">
          <div className="border-b border-stone-800/80 px-5 py-4 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400">
                <span className="rounded-full border border-stone-700 bg-stone-900/70 px-3 py-1.5">
                  {realmUI.label}
                </span>
                <span className="rounded-full border border-stone-700 bg-stone-900/70 px-3 py-1.5">
                  {state.cast?.length ?? 0} cast
                </span>
                <span className="rounded-full border border-stone-700 bg-stone-900/70 px-3 py-1.5">
                  {state.history?.length ?? 0} events
                </span>
                <span className="rounded-full border border-stone-700 bg-stone-900/70 px-3 py-1.5">
                  {loading ? "Shifting..." : auto.isAutoMode ? "Auto Flow" : "Ready"}
                </span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
                <button
                  onClick={() => auto.toggle()}
                  className="rounded-full border border-stone-700 bg-stone-900/80 px-5 py-3 text-sm font-medium text-stone-100 transition hover:border-amber-400/50 hover:bg-stone-800"
                >
                  {auto.isAutoMode ? "Pause Flow" : "Begin Auto Flow"}
                </button>
                <button
                  onClick={() => void handleReset()}
                  disabled={loading}
                  className="rounded-full border border-stone-700 bg-stone-900/80 px-5 py-3 text-sm font-medium text-stone-100 transition hover:border-stone-500 hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reset World
                </button>
              </div>
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}
          </div>

          <div className="px-5 py-5 sm:px-8 sm:py-8 lg:px-10">
            <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-5">
                <div className="rounded-3xl border border-stone-800 bg-stone-900/70 p-4 sm:p-6">
                  <ChronicleFeed
                    latestNarration={latestNarration}
                    history={state.history ?? []}
                  />
                </div>

                <div className="rounded-3xl border border-stone-800 bg-stone-900/70 p-4 sm:p-6">
                  <SuggestedActions
                    actions={state.suggested_actions ?? []}
                    loading={loading || auto.isTicking}
                    onWorldAction={(action) => void handleWorldAction(action)}
                    onCharacterAction={(action, target) =>
                      void handleCharacterAction(action, target)
                    }
                    onPassAction={() => void handlePass()}
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-3xl border border-stone-800 bg-stone-900/70 p-4 sm:p-6">
                  <RealmStateCard world={state.world} />
                </div>

                <div className="rounded-3xl border border-stone-800 bg-stone-900/70 p-4 sm:p-6">
                  <CastPanel cast={state.cast ?? []} />
                </div>

                <div className="rounded-3xl border border-stone-800 bg-stone-900/70 p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.35em] text-amber-400/80">
                        Scenario Gate
                      </p>
                      <h2 className="mt-2 text-xl font-semibold text-stone-50">
                        Invoke a Different Tension
                      </h2>
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-7 text-stone-300">
                    Shift the opening structure and watch how the realm tells a different
                    story.
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <button
                      onClick={() => void handlePreset("royal_betrayal")}
                      disabled={loading}
                      className="rounded-2xl border border-stone-700 bg-stone-950/70 px-4 py-4 text-left text-sm text-stone-100 transition hover:border-amber-400/40 hover:bg-stone-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="font-medium">Royal Betrayal</div>
                      <div className="mt-1 text-xs leading-6 text-stone-400">
                        A throne destabilized by loyalty under strain.
                      </div>
                    </button>

                    <button
                      onClick={() => void handlePreset("fractured_court")}
                      disabled={loading}
                      className="rounded-2xl border border-stone-700 bg-stone-950/70 px-4 py-4 text-left text-sm text-stone-100 transition hover:border-amber-400/40 hover:bg-stone-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="font-medium">Fractured Court</div>
                      <div className="mt-1 text-xs leading-6 text-stone-400">
                        Influence splinters across a divided inner circle.
                      </div>
                    </button>

                    <button
                      onClick={() => void handlePreset("collapse_edge")}
                      disabled={loading}
                      className="rounded-2xl border border-stone-700 bg-stone-950/70 px-4 py-4 text-left text-sm text-stone-100 transition hover:border-amber-400/40 hover:bg-stone-900 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
                    >
                      <div className="font-medium">Collapse Edge</div>
                      <div className="mt-1 text-xs leading-6 text-stone-400">
                        A realm already leaning toward fracture and irreversible change.
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
