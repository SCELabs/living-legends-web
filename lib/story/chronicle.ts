import type { AppStateResponse, StepResponse } from "@/lib/api";
import type { ChronicleEntry } from "@/components/story/narrative-block";

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

export function buildEntriesFromState(state: AppStateResponse): ChronicleEntry[] {
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

export function buildPromptFromState(
  state: AppStateResponse | StepResponse
): ActivePrompt {
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

export function buildResolvedChoiceEntry(
  choice: ChoiceOption
): ChronicleEntry {
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

export function mapWorldActionFromChoice(action: string): string | null {
  if (action === "unity" || action === "boundary" || action === "fragmentation") {
    return action;
  }

  if (action === "none") {
    return null;
  }

  return null;
}

export function buildLatestEntryFromResponse(
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

export function mergeStepIntoState(
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
