"use client";

import { useEffect, useRef, useState } from "react";
import {
  AppStateResponse,
  StepResponse,
  applyAction,
  getState,
  loadPreset,
  resetWorld,
  stepWorld,
} from "@/lib/api";
import { getRealmUI } from "@/lib/labels";

type ChronicleEntry = {
  id: string;
  kind: "prologue" | "narrative" | "resolved_influence" | "system";
  label?: string;
  body: string;
  pressure?: string;
  weight?: "minor" | "major";
  focusCharacter?: string;
};

type ActivePrompt = {
  momentId: string;
  prompt: string;
  choices: Array<{
    id: string;
    label: string;
    action: string;
    target?: string | null;
  }>;
} | null;

type ChoiceOption = NonNullable<ActivePrompt>["choices"][number];

function buildEntriesFromState(state: AppStateResponse): ChronicleEntry[] {
  const entries: ChronicleEntry[] = [];

  if (state.prologue?.body?.trim()) {
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

function buildPromptFromState(state: AppStateResponse): ActivePrompt {
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
      "The world hangs at an edge. Do you intervene, or remain unseen?",
    choices: choicePoint.choices.map((choice) => ({
      id: choice.id,
      label: choice.label,
      action: choice.action,
      target: choice.target,
    })),
  };
}

function buildResolvedChoiceEntry(choice: ChoiceOption): ChronicleEntry {
  const body =
    choice.action === "none"
      ? "You remained unseen."
      : choice.target
        ? `You chose to ${choice.label.toLowerCase()}.`
        : `You chose to ${choice.label.toLowerCase()}.`;

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
    return "boundary";
  }

  return null;
}

function StoryHeader({
  worldName,
  realmLabel,
  onReset,
  loading,
}: {
  worldName?: string;
  realmLabel?: string;
  onReset: () => void;
  loading: boolean;
}) {
  return (
    <header className="border-b border-stone-800/80 px-5 py-4 sm:px-8 lg:px-10">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.35em] text-amber-400/80">
            Living Legends
          </p>
          <h1 className="mt-2 truncate text-2xl font-semibold text-stone-50 sm:text-3xl">
            {worldName || "The Realm"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {realmLabel ? (
            <span className="rounded-full border border-stone-700 bg-stone-900/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-300">
              {realmLabel}
            </span>
          ) : null}

          <button
            onClick={onReset}
            disabled={loading}
            className="rounded-full border border-stone-700 bg-stone-900/70 px-4 py-2 text-sm text-stone-200 transition hover:border-stone-500 hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </div>
    </header>
  );
}

function NarrativeBlock({
  entry,
}: {
  entry: ChronicleEntry;
}) {
  const isPrologue = entry.kind === "prologue";
  const isResolved = entry.kind === "resolved_influence";
  const isMajor = entry.weight === "major";

  return (
    <article
      className={
        isPrologue
          ? "border-b border-stone-800/80 pb-8"
          : isResolved
            ? "border-l-2 border-amber-500/30 pl-4"
            : "border-b border-stone-800/60 pb-6 last:border-none"
      }
    >
      {entry.label ? (
        <p
          className={`text-[11px] uppercase tracking-[0.32em] ${
            isResolved
              ? "text-amber-300/80"
              : isPrologue
                ? "text-amber-400/80"
                : "text-stone-400"
          }`}
        >
          {entry.label}
        </p>
      ) : null}

      <div
        className={`mt-3 whitespace-pre-wrap ${
          isPrologue
            ? "text-base leading-8 text-stone-100 sm:text-lg"
            : isMajor
              ? "text-[15px] leading-8 text-stone-100 sm:text-base"
              : "text-[15px] leading-8 text-stone-200"
        }`}
      >
        {entry.body}
      </div>

      {entry.pressure ? (
        <div className="mt-4 border-l-2 border-stone-700/80 pl-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
            Pressure
          </p>
          <p className="mt-2 text-sm leading-7 text-stone-400">{entry.pressure}</p>
        </div>
      ) : null}
    </article>
  );
}

function InterventionPrompt({
  prompt,
  choices,
  loading,
  onChoose,
}: {
  prompt: string;
  choices: ChoiceOption[];
  loading: boolean;
  onChoose: (choice: ChoiceOption) => void;
}) {
  return (
    <section className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5">
      <p className="text-[11px] uppercase tracking-[0.3em] text-amber-300/85">
        Intervention
      </p>
      <p className="mt-3 text-[15px] leading-8 text-stone-100">{prompt}</p>

      <div className="mt-5 space-y-3">
        {choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            onClick={() => onChoose(choice)}
            disabled={loading}
            className="w-full rounded-2xl border border-stone-700 bg-stone-950/40 px-4 py-4 text-left text-sm text-stone-200 transition hover:border-amber-400/40 hover:bg-stone-900/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {choice.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function ScenarioGate({
  loading,
  onPreset,
}: {
  loading: boolean;
  onPreset: (preset: string) => void;
}) {
  return (
    <section className="border-t border-stone-800/80 pt-6">
      <p className="text-[11px] uppercase tracking-[0.35em] text-stone-500">
        Scenario
      </p>
      <div className="mt-4 space-y-3">
        <button
          onClick={() => onPreset("royal_betrayal")}
          disabled={loading}
          className="block w-full text-left text-sm text-stone-400 transition hover:text-stone-100 disabled:opacity-50"
        >
          Royal Betrayal
        </button>
        <button
          onClick={() => onPreset("fractured_court")}
          disabled={loading}
          className="block w-full text-left text-sm text-stone-400 transition hover:text-stone-100 disabled:opacity-50"
        >
          Fractured Court
        </button>
        <button
          onClick={() => onPreset("collapse_edge")}
          disabled={loading}
          className="block w-full text-left text-sm text-stone-400 transition hover:text-stone-100 disabled:opacity-50"
        >
          Collapse Edge
        </button>
      </div>
    </section>
  );
}

export default function Page() {
  const [state, setState] = useState<AppStateResponse | null>(null);
  const [entries, setEntries] = useState<ChronicleEntry[]>([]);
  const [activePrompt, setActivePrompt] = useState<ActivePrompt>(null);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    void initialize();
  }, []);

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

  async function handleChoice(choice: ChoiceOption) {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      setEntries((prev) => [...prev, buildResolvedChoiceEntry(choice)]);
      setActivePrompt(null);

      let response: StepResponse;

      if (choice.action === "none") {
        response = await stepWorld("boundary");
      } else if (choice.target) {
        response = await applyAction(choice.action, choice.target);
      } else {
        const worldAction = mapWorldActionFromChoice(choice.action);
        response = await stepWorld(worldAction || "boundary");
      }

      setState(response);

      const nextEntries = buildEntriesFromState(response);
      const latestIncoming = nextEntries[nextEntries.length - 1];

      if (latestIncoming) {
        setEntries((prev) => {
          const exists = prev.some((entry) => entry.id === latestIncoming.id);
          return exists ? prev : [...prev, latestIncoming];
        });
      }

      setActivePrompt(buildPromptFromState(response));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Action failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      const data = await resetWorld();
      setState(data);
      setEntries(buildEntriesFromState(data));
      setActivePrompt(buildPromptFromState(data));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reset world.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePreset(preset: string) {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      const data = await loadPreset(preset);
      setState(data);
      setEntries(buildEntriesFromState(data));
      setActivePrompt(buildPromptFromState(data));
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

            <div className="space-y-8">
              {entries.map((entry) => (
                <NarrativeBlock key={entry.id} entry={entry} />
              ))}

              {activePrompt ? (
                <InterventionPrompt
                  prompt={activePrompt.prompt}
                  choices={activePrompt.choices}
                  loading={loading}
                  onChoose={(choice) => void handleChoice(choice)}
                />
              ) : null}

              <ScenarioGate
                loading={loading}
                onPreset={(preset) => void handlePreset(preset)}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
