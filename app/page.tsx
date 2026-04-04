"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AppStateResponse,
  StepResponse,
  advanceWorld,
  applyAction,
  createWorld,
  resetWorld,
  stepWorld,
} from "@/lib/api";
import { getRealmUI } from "@/lib/labels";
import StoryHeader from "@/components/story/story-header";
import type { ChronicleEntry } from "@/components/story/narrative-block";
import InterventionPrompt from "@/components/story/intervention-prompt";
import StoryContinuingIndicator from "@/components/story/story-continuing-indicator";
import StoryRevealBlock from "@/components/story/story-reveal-block";
import StructuralFooter from "@/components/story/structural-footer";
import {
  buildEntriesFromState,
  buildPromptFromState,
  buildResolvedChoiceEntry,
  buildLatestEntryFromResponse,
  mergeStepIntoState,
  mapWorldActionFromChoice,
} from "@/lib/story/chronicle";
import {
  conditionTone,
  relationshipLine,
  compactRelationshipSummary,
} from "@/lib/story/cast";

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

export default function Page() {
  const [hasWorldStarted, setHasWorldStarted] = useState(false);
  const [theme, setTheme] = useState("");
  const [state, setState] = useState<AppStateResponse | null>(null);
  const [entries, setEntries] = useState<ChronicleEntry[]>([]);
  const [activePrompt, setActivePrompt] = useState<ActivePrompt>(null);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealingEntryId, setRevealingEntryId] = useState<string | null>(null);
  const [showContinuingIndicator, setShowContinuingIndicator] = useState(false);

  const passiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let indicatorTimer: ReturnType<typeof setTimeout> | null = null;

    if (!hasWorldStarted || !state || loading || revealingEntryId || activePrompt) {
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
  }, [hasWorldStarted, state, loading, revealingEntryId, activePrompt]);

  const latestFocusCharacter = entries.length
    ? entries[entries.length - 1]?.focusCharacter || null
    : null;

  const relationshipText = useMemo(() => relationshipLine(state), [state]);

  const courtData = useMemo(
    () => ({
      cast: state?.cast || [],
      latestFocusCharacter,
      conditionTone,
      relationshipSummary: (name: string) => compactRelationshipSummary(state, name),
    }),
    [state, latestFocusCharacter]
  );

  async function initializeWorld() {
    try {
      setBooting(true);
      setLoading(true);
      setError(null);

      const cleanTheme = theme.trim();
      const data = cleanTheme
        ? await createWorld({
            context: {
              theme: cleanTheme,
            },
          })
        : await createWorld();

      setState(data);
      setEntries(buildEntriesFromState(data));
      setActivePrompt(buildPromptFromState(data));
      setHasWorldStarted(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create world.";
      setError(message);
    } finally {
      setLoading(false);
      setBooting(false);
    }
  }

  async function handleCreateLegend() {
    await initializeWorld();
  }

  async function continuePassively() {
    if (loading || revealingEntryId || !hasWorldStarted) return;

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
    if (loading || revealingEntryId || !hasWorldStarted) return;

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
    if (loading || revealingEntryId || !hasWorldStarted) return;

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

  if (!hasWorldStarted) {
    return (
      <main className="min-h-screen bg-stone-950 text-stone-100">
        <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-16">
          <div className="w-full max-w-2xl rounded-3xl border border-stone-800 bg-stone-900/70 p-10 text-center shadow-2xl shadow-black/40 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-400/80">
              Living Legends
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-50 sm:text-5xl">
              Living Legends
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-stone-300">
              Every world begins with a fracture.
            </p>

            <div className="mx-auto mt-8 max-w-md">
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Whisper a theme (optional)"
                className="w-full rounded-2xl border border-stone-800 bg-stone-950/60 px-4 py-3 text-center text-sm text-stone-100 placeholder:text-stone-500 focus:border-amber-400/40 focus:outline-none"
              />
            </div>

            {error ? (
              <div className="mx-auto mt-6 max-w-md rounded-2xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <button
              onClick={() => void handleCreateLegend()}
              disabled={loading || booting}
              className="mt-8 rounded-full border border-amber-400/30 bg-amber-400/10 px-8 py-3 text-sm font-medium text-amber-100 transition hover:border-amber-300/50 hover:bg-amber-400/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading || booting ? "Summoning..." : "Create a Legend"}
            </button>
          </div>
        </div>
      </main>
    );
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
              onClick={() => void handleCreateLegend()}
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
      <div className="mx-auto max-w-5xl px-4 py-4 pb-40 sm:px-6 sm:py-6 sm:pb-44 lg:px-8 lg:py-8 lg:pb-48">
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

      <StructuralFooter
        cast={state.cast || []}
        latestFocusCharacter={latestFocusCharacter}
        relationshipText={relationshipText}
        courtData={courtData}
      />
    </main>
  );
}
