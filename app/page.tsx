"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AppStateResponse,
  StepResponse,
  advanceWorld,
  applyAction,
  getState,
  resetWorld,
  stepWorld,
} from "@/lib/api";
import { getRealmUI } from "@/lib/labels";
import StoryHeader from "@/components/story/story-header";
import type { ChronicleEntry } from "@/components/story/narrative-block";
import InterventionPrompt from "@/components/story/intervention-prompt";
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
  } else if (choice.target) {
    body = `Your influence moved through ${choice.target}.`;
  } else {
    body = "Your influence entered the structure.";
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

  if (!latestBlock) return null;

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

function conditionTone(condition?: string): string {
  if (condition === "loyal") return "text-emerald-300";
  if (condition === "divided") return "text-amber-300";
  if (condition === "unraveling") return "text-red-300";
  return "text-stone-300";
}

function relationshipLine(state: AppStateResponse | null): string | null {
  if (!state?.relationships?.length) return null;
  const rel = state.relationships[0];
  if (rel.description) return rel.description;
  return `${rel.source} and ${rel.target} are bound by ${rel.type}.`;
}

export default function Page() {
  const [state, setState] = useState<AppStateResponse | null>(null);
  const [entries, setEntries] = useState<ChronicleEntry[]>([]);
  const [activePrompt, setActivePrompt] = useState<ActivePrompt>(null);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealingEntryId, setRevealingEntryId] = useState<string | null>(null);
  const [showContinuingIndicator, setShowContinuingIndicator] = useState(false);

  const initializedRef = useRef(false);
  const passiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    void initialize();
  }, []);

  useEffect(() => {
    let indicatorTimer: ReturnType<typeof setTimeout> | null = null;

    if (!state || loading || revealingEntryId || activePrompt) {
      setShowContinuingIndicator(false);

      if (passiveTimerRef.current) {
        clearTimeout(passiveTimerRef.current);
        passiveTimerRef.current = null;
      }

      return;
    }

    indicatorTimer = setTimeout(() => {
      setShowContinuingIndicator(true);
    }, 700);

    passiveTimerRef.current = setTimeout(() => {
      void continuePassively();
    }, 3000);

    return () => {
      if (indicatorTimer) clearTimeout(indicatorTimer);
      if (passiveTimerRef.current) {
        clearTimeout(passiveTimerRef.current);
        passiveTimerRef.current = null;
      }
    };
  }, [state, loading, revealingEntryId, activePrompt]);

  const spotlightCast = useMemo(() => {
    if (!state?.cast?.length) return [];
    return [...state.cast]
      .sort((a, b) => (b.influence || 0) - (a.influence || 0))
      .slice(0, 3);
  }, [state]);

  const latestFocusCharacter = entries.length
    ? entries[entries.length - 1]?.focusCharacter
    : null;

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
          const last = prev[prev.length - 1];
          const isSimilar =
            last &&
            last.label === latestIncoming.label &&
            last.body === latestIncoming.body;

          if (isSimilar) return prev;
          return [...prev, latestIncoming];
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
          const last = prev[prev.length - 1];
          const isSimilar =
            last &&
            last.label === latestIncoming.label &&
            last.body === latestIncoming.body;

          if (isSimilar) return prev;
          return [...prev, latestIncoming];
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
  const relationshipText = relationshipLine(state);

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

            <section className="mb-8 rounded-3xl border border-stone-800/80 bg-stone-950/35 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-amber-300/80">
                    Figures in Motion
                  </p>
                  <p className="mt-2 text-sm leading-6 text-stone-300">
                    {relationshipText ||
                      "Power has begun to gather around a few central figures."}
                  </p>
                </div>
                {latestFocusCharacter ? (
                  <div className="hidden rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-200 sm:block">
                    Focus: {latestFocusCharacter}
                  </div>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {spotlightCast.map((member) => (
                  <div
                    key={member.role_id}
                    className="rounded-2xl border border-stone-800 bg-stone-900/60 px-4 py-4"
                  >
                    <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
                      {member.display_role}
                    </p>
                    <h3 className="mt-2 text-lg font-medium text-stone-100">
                      {member.name}
                    </h3>
                    <p className={`mt-2 text-sm ${conditionTone(member.condition)}`}>
                      {member.condition_label}
                    </p>
                    {member.bio ? (
                      <p className="mt-3 text-sm leading-6 text-stone-400">
                        {member.bio}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>

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

              {activePrompt && !revealingEntryId ? (
                <InterventionPrompt
                  prompt={activePrompt.prompt}
                  choices={activePrompt.choices}
                  loading={loading}
                  onChoose={(choice) => void handleChoice(choice)}
                />
              ) : showContinuingIndicator ? (
                <StoryContinuingIndicator />
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
