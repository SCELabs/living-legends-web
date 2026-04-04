"use client";

import { useEffect, useRef, useState } from "react";
import {
  AppStateResponse,
  StepResponse,
  advanceWorld,
  applyAction,
  getState,
  loadPreset,
  resetWorld,
  stepWorld,
} from "@/lib/api";
import { getRealmUI } from "@/lib/labels";
import StoryHeader from "@/components/story/story-header";
import type { ChronicleEntry } from "@/components/story/narrative-block";
import InterventionPrompt from "@/components/story/intervention-prompt";
import ScenarioGate from "@/components/story/scenario-gate";
import StoryContinuingIndicator from "@/components/story/story-continuing-indicator";
import StoryRevealBlock from "@/components/story/story-reveal-block";

type ActivePrompt = {
  momentId: string;
  choices: Array<{
    id: string;
    label: string;
    action: string;
    target?: string | null;
  }>;
  prompt: string;
} | null;

type ChoiceOption = NonNullable<ActivePrompt>["choices"][number];

function buildEntriesFromState(state: AppStateResponse): ChronicleEntry[] {
  const entries: ChronicleEntry[] = [];

  const prologueBody = state.prologue?.body?.trim();
  const firstChronicleBody = state.chronicle?.[0]?.body?.trim();

  const shouldShowPrologue =
    !!prologueBody &&
    (!firstChronicleBody || firstChronicleBody !== prologueBody);

  if (shouldShowPrologue && state.prologue?.body) {
    entries.push({
      id: "prologue",
      kind: "prologue",
      label: state.prologue.title || "Prologue",
      body: state.prologue.body,
    });
  }

  if (state.chronicle?.length) {
    for (const block of state.chronicle) {
      entries.push({
        id: block.id || `chronicle-${entries.length + 1}`,
        kind: "narrative",
        label: block.label,
        body: block.body,
        pressure: block.pressure,
        weight: block.weight,
        focusCharacter: block.focus_character,
      });
    }
  } else if (state.history?.length) {
    const latest = state.history[state.history.length - 1];
    entries.push({
      id: `history-${latest.tick}`,
      kind: "narrative",
      label: latest.event_type,
      body: "The world shifts, though its meaning is not yet fully spoken.",
    });
  }

  return entries;
}

function buildPromptFromState(state: AppStateResponse | StepResponse): ActivePrompt {
  const choicePoint = state.choice_point;

  if (!choicePoint?.active || !choicePoint.choices?.length) {
    return null;
  }

  const lastChronicleId =
    state.chronicle?.[state.chronicle.length - 1]?.id || "prologue";

  return {
    momentId: lastChronicleId,
    prompt:
      choicePoint.prompt ||
      "The structure is under strain. Where will your influence take hold?",
    choices: choicePoint.choices.map((choice) => ({
      id: choice.id,
      label: choice.label,
      action: choice.action,
      target: choice.target,
    })),
  };
}

function buildResolvedChoiceEntry(choice: ChoiceOption): ChronicleEntry {
  let body = "You remained unseen.";

  if (choice.action === "none") {
    body = "You remained unseen.";
  } else if (choice.action === "pressure" && choice.target) {
    body = `You pressed upon ${choice.target}.`;
  } else if (
    (choice.action === "protect" || choice.action === "stabilize") &&
    choice.target
  ) {
    body = `You reinforced ${choice.target} against the gathering strain.`;
  } else if (
    (choice.action === "corrupt" || choice.action === "feed_ambition") &&
    choice.target
  ) {
    body = `You leaned into the unrest forming within ${choice.target}.`;
  } else if (choice.action === "restore" && choice.target) {
    body = `You drew ${choice.target} back toward steadier ground.`;
  } else if (choice.action === "collapse" && choice.target) {
    body = `You pushed ${choice.target} closer to the breaking edge.`;
  } else if (choice.action === "unity") {
    body = "You bent the realm gently back toward coherence.";
  } else if (choice.action === "boundary") {
    body = "You allowed tension to gather without forcing a break.";
  } else if (choice.action === "fragmentation") {
    body = "You gave fracture room to widen within the realm.";
  } else if (choice.target) {
    body = `Your influence fell upon ${choice.target}.`;
  } else {
    body = "Your influence entered the structure, and the world began to respond.";
  }

  return {
    id: `resolved-${choice.id}-${Date.now()}`,
    kind: "resolved_influence",
    label: "Your Influence",
    body,
  };
}

function mapWorldActionFromChoice(action: string): string | null {
  if (action === "unity" || action === "boundary" || action === "fragmentation") {
    return action;
  }

  if (action === "none") {
    return null;
  }

  return null;
}

function buildLatestEntryFromResponse(
  response: AppStateResponse | StepResponse
): ChronicleEntry | null {
  const latestBlock = response.chronicle?.[response.chronicle.length - 1];

  if (latestBlock) {
    return {
      id: latestBlock.id || `chronicle-${Date.now()}`,
      kind: "narrative",
      label: latestBlock.label,
      body: latestBlock.body,
      pressure: latestBlock.pressure,
      weight: latestBlock.weight,
      focusCharacter: latestBlock.focus_character,
    };
  }

  const latestHistory = response.history?.[response.history.length - 1];
  if (!latestHistory) return null;

  return {
    id: `history-${latestHistory.tick}`,
    kind: "narrative",
    label: latestHistory.event_type,
    body: "The world shifts, though its meaning is not yet fully spoken.",
  };
}

export default function Page() {
  const [state, setState] = useState<AppStateResponse | null>(null);
  const [entries, setEntries] = useState<ChronicleEntry[]>([]);
  const [activePrompt, setActivePrompt] = useState<ActivePrompt>(null);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContinuing, setIsContinuing] = useState(false);
  const [showContinuingIndicator, setShowContinuingIndicator] = useState(false);
  const [revealingEntryId, setRevealingEntryId] = useState<string | null>(null);

  const initializedRef = useRef(false);
  const passiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    void initialize();
  }, []);

  useEffect(() => {
    let indicatorTimer: ReturnType<typeof setTimeout> | null = null;

    if (!state || loading || booting || activePrompt || revealingEntryId) {
      setIsContinuing(false);
      setShowContinuingIndicator(false);

      if (passiveTimerRef.current) {
        clearTimeout(passiveTimerRef.current);
        passiveTimerRef.current = null;
      }

      return;
    }

    setIsContinuing(true);
    setShowContinuingIndicator(false);

    indicatorTimer = setTimeout(() => {
      setShowContinuingIndicator(true);
    }, 700);

    passiveTimerRef.current = setTimeout(() => {
      void continuePassively();
    }, 2200);

    return () => {
      if (indicatorTimer) {
        clearTimeout(indicatorTimer);
      }

      if (passiveTimerRef.current) {
        clearTimeout(passiveTimerRef.current);
        passiveTimerRef.current = null;
      }
    };
  }, [state, activePrompt, loading, booting, revealingEntryId]);

  function mergeStepIntoState(
    prev: AppStateResponse | null,
    response: StepResponse
  ): AppStateResponse | null {
    if (!prev) return null;

    return {
      ...prev,
      world: response.world,
      cast: response.cast,
      history: response.history,
      suggested_actions: response.suggested_actions,
      relationships: response.relationships ?? prev.relationships,
      meta: response.meta ?? prev.meta,
      prologue: prev.prologue,
      chronicle: response.chronicle,
      choice_point: response.choice_point,
    };
  }

  async function initialize() {
    try {
      setBooting(true);
      setLoading(true);
      setError(null);

      const data = await getState();
      setState(data);
      setEntries(buildEntriesFromState(data));
      setActivePrompt(buildPromptFromState(data));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load world.";
      setError(message);
    } finally {
      setLoading(false);
      setBooting(false);
    }
  }

  async function continuePassively() {
    if (loading || revealingEntryId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await advanceWorld();

      setState((prev) => mergeStepIntoState(prev, response));

      const latestIncoming = buildLatestEntryFromResponse(response);

      if (latestIncoming) {
        setEntries((prev) => {
          const exists = prev.some((entry) => entry.id === latestIncoming.id);
          return exists ? prev : [...prev, latestIncoming];
        });
        setRevealingEntryId(latestIncoming.id);
      }

      setActivePrompt(buildPromptFromState(response));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Passive continuation failed.";
      setError(message);
    } finally {
      setLoading(false);
      setIsContinuing(false);
      setShowContinuingIndicator(false);
    }
  }

  async function handleChoice(choice: ChoiceOption) {
    if (loading || revealingEntryId) return;

    try {
      setLoading(true);
      setError(null);

      setEntries((prev) => [...prev, buildResolvedChoiceEntry(choice)]);
      setActivePrompt(null);

      let response: StepResponse;

      if (choice.action === "none") {
        response = await advanceWorld();
      } else if (choice.target) {
        response = await applyAction(choice.action, choice.target);
      } else {
        const worldAction = mapWorldActionFromChoice(choice.action);
        response = worldAction
          ? await stepWorld(worldAction)
          : await advanceWorld();
      }

      setState((prev) => mergeStepIntoState(prev, response));

      const latestIncoming = buildLatestEntryFromResponse(response);

      if (latestIncoming) {
        setEntries((prev) => {
          const exists = prev.some((entry) => entry.id === latestIncoming.id);
          return exists ? prev : [...prev, latestIncoming];
        });
        setRevealingEntryId(latestIncoming.id);
      }

      setActivePrompt(buildPromptFromState(response));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Action failed.";
      setError(message);
    } finally {
      setLoading(false);
      setShowContinuingIndicator(false);
    }
  }

  async function handleReset() {
    if (loading || revealingEntryId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await resetWorld();
      setState(data);
      setEntries(buildEntriesFromState(data));
      setActivePrompt(buildPromptFromState(data));
      setRevealingEntryId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reset world.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePreset(preset: string) {
    if (loading || revealingEntryId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await loadPreset(preset);
      setState(data);
      setEntries(buildEntriesFromState(data));
      setActivePrompt(buildPromptFromState(data));
      setRevealingEntryId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load scenario.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (!state && booting) {
    return (
      <main className="min-h-screen bg-stone-950 text-stone-100">
        <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-16">
          <div className="w-full max-w-2xl rounded-3xl border border-stone-800 bg-stone-900/70 p-10 text-center shadow-2xl shadow-black/40 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-400/80">
              Living Legends
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-50">
              Entering the Realm
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-stone-300">
              The story gathers itself before you. Power, loyalty, and fracture are
              already taking shape.
            </p>
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
              The Chronicle Failed to Open
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
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <section className="overflow-hidden rounded-[2rem] border border-stone-800 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.10),transparent_35%),linear-gradient(180deg,rgba(28,25,23,0.96),rgba(12,10,9,0.99))] shadow-2xl shadow-black/40">
          <StoryHeader
            worldName={state.world?.name}
            realmLabel={realmUI.label}
            onReset={() => void handleReset()}
            loading={loading}
          />

          <div className="px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
            {error ? (
              <div className="mb-6 rounded-2xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <div className="space-y-12 pb-24">
              {entries.map((entry, index) => {
                const isLatest = index === entries.length - 1;
                const shouldReveal = revealingEntryId === entry.id;

                return (
                  <StoryRevealBlock
                    key={entry.id}
                    entry={entry}
                    isLatest={isLatest}
                    enabled={shouldReveal}
                    onComplete={() => {
                      if (revealingEntryId === entry.id) {
                        setRevealingEntryId(null);
                      }
                    }}
                  />
                );
              })}

              {activePrompt ? (
                <InterventionPrompt
                  prompt={activePrompt.prompt}
                  choices={activePrompt.choices}
                  loading={loading || !!revealingEntryId}
                  onChoose={(choice) => void handleChoice(choice)}
                />
              ) : showContinuingIndicator ? (
                <StoryContinuingIndicator />
              ) : null}

              <ScenarioGate
                loading={loading || !!revealingEntryId}
                onPreset={(preset) => void handlePreset(preset)}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
