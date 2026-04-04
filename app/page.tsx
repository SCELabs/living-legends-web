"use client";

import { useEffect, useRef, useState } from "react";
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
  };
}

export default function Page() {
  const [state, setState] = useState<AppStateResponse | null>(null);
  const [entries, setEntries] = useState<ChronicleEntry[]>([]);
  const [activePrompt, setActivePrompt] = useState<ActivePrompt>(null);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [revealingEntryId, setRevealingEntryId] = useState<string | null>(null);

  const initializedRef = useRef(false);
  const passiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    void initialize();
  }, []);

  useEffect(() => {
    if (!state || loading || activePrompt || revealingEntryId) return;

    passiveTimerRef.current = setTimeout(() => {
      void continuePassively();
    }, 3000);

    return () => {
      if (passiveTimerRef.current) {
        clearTimeout(passiveTimerRef.current);
        passiveTimerRef.current = null;
      }
    };
  }, [state, activePrompt, loading, revealingEntryId]);

  async function initialize() {
    setBooting(true);
    setLoading(true);

    const data = await getState();
    setState(data);
    setEntries(buildEntriesFromState(data));
    setActivePrompt(buildPromptFromState(data));

    setLoading(false);
    setBooting(false);
  }

  async function continuePassively() {
    if (loading || revealingEntryId) return;

    setLoading(true);

    const response = await advanceWorld();

    setState((prev) => (prev ? { ...prev, ...response } : prev));

    const latest = buildLatestEntryFromResponse(response);

    if (latest) {
      setEntries((prev) => [...prev, latest]);
      setRevealingEntryId(latest.id);
    }

    setActivePrompt(buildPromptFromState(response));
    setLoading(false);
  }

  async function handleChoice(choice: ChoiceOption) {
    if (loading || revealingEntryId) return;

    setLoading(true);

    setEntries((prev) => [...prev, buildResolvedChoiceEntry(choice)]);
    setActivePrompt(null);

    let response: StepResponse;

    if (choice.action === "none") {
      response = await advanceWorld();
    } else if (choice.target) {
      response = await applyAction(choice.action, choice.target);
    } else {
      response = await stepWorld(choice.action);
    }

    setState((prev) => (prev ? { ...prev, ...response } : prev));

    const latest = buildLatestEntryFromResponse(response);

    if (latest) {
      setEntries((prev) => [...prev, latest]);
      setRevealingEntryId(latest.id);
    }

    setActivePrompt(buildPromptFromState(response));
    setLoading(false);
  }

  async function handleReset() {
    if (loading) return;

    setLoading(true);

    const data = await resetWorld();
    setState(data);
    setEntries(buildEntriesFromState(data));
    setActivePrompt(buildPromptFromState(data));
    setRevealingEntryId(null);

    setLoading(false);
  }

  if (!state && booting) {
    return <div className="p-10 text-white">Entering the realm...</div>;
  }

  if (!state) {
    return <div className="p-10 text-white">Failed to load.</div>;
  }

  const realmUI = getRealmUI(state.world?.realm_state ?? "");

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <StoryHeader
          worldName={state.world?.name}
          realmLabel={realmUI.label}
          onReset={() => void handleReset()}
          loading={loading}
        />

        <div className="space-y-12 pt-6 pb-24">
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
          ) : (
            <StoryContinuingIndicator />
          )}
        </div>
      </div>
    </main>
  );
}
