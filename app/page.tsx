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
import StoryRevealBlock from "@/components/story/story-reveal-block";
import InterventionPrompt from "@/components/story/intervention-prompt";
import StoryContinuingIndicator from "@/components/story/story-continuing-indicator";

import FiguresInMotion from "@/components/story/figures-in-motion";
import CourtPanel from "@/components/story/court-panel";

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
  getSpotlightCast,
} from "@/lib/story/cast";

type ActivePrompt = ReturnType<typeof buildPromptFromState>;
type ChoiceOption = NonNullable<ActivePrompt>["choices"][number];

export default function Page() {
  const [state, setState] = useState<AppStateResponse | null>(null);
  const [entries, setEntries] = useState<any[]>([]);
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

  const latestFocusCharacter = entries.length
    ? entries[entries.length - 1]?.focusCharacter
    : null;

  const spotlightCast = useMemo(
    () => getSpotlightCast(state, latestFocusCharacter),
    [state, latestFocusCharacter]
  );

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
      setError("Failed to load world.");
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
        setEntries((prev) => [...prev, latestIncoming]);
        setRevealingEntryId(latestIncoming.id);
      }

      setActivePrompt(buildPromptFromState(response));
    } catch {
      setError("Passive continuation failed.");
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
        setEntries((prev) => [...prev, latestIncoming]);
        setRevealingEntryId(latestIncoming.id);
      }

      setActivePrompt(buildPromptFromState(response));
    } catch {
      setError("Action failed.");
    } finally {
      setLoading(false);
      setShowContinuingIndicator(false);
    }
  }

  async function handleReset() {
    if (loading || revealingEntryId) return;

    const data = await resetWorld();
    setState(data);
    setEntries(buildEntriesFromState(data));
    setActivePrompt(buildPromptFromState(data));
    setRevealingEntryId(null);
  }

  if (!state) return null;

  const realmUI = getRealmUI(state.world?.realm_state ?? "");
  const relationshipText = relationshipLine(state);

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <section className="rounded-[2rem] border border-stone-800 bg-stone-900/90 shadow-xl">
          <StoryHeader
            worldName={state.world?.name}
            realmLabel={realmUI.label}
            onReset={() => void handleReset()}
            loading={loading}
          />

          <div className="px-6 py-6">
            <FiguresInMotion
              relationshipText={relationshipText}
              latestFocusCharacter={latestFocusCharacter}
              spotlightCast={spotlightCast}
              conditionTone={conditionTone}
            />

            <CourtPanel
              cast={state.cast}
              latestFocusCharacter={latestFocusCharacter}
              conditionTone={conditionTone}
              relationshipSummary={(name) =>
                compactRelationshipSummary(state, name)
              }
            />

            <div className="space-y-10 mt-6">
              {entries.map((entry, index) => (
                <StoryRevealBlock
                  key={entry.id}
                  entry={entry}
                  isLatest={index === entries.length - 1}
                  enabled={revealingEntryId === entry.id}
                  onComplete={() => setRevealingEntryId(null)}
                />
              ))}

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
