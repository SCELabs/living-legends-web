type SuggestedActionItem = {
  label?: string;
  kind?: string;
  action?: string;
  target?: string | null;
};

type SuggestedActionsProps = {
  actions: SuggestedActionItem[];
  loading?: boolean;
  onWorldAction: (action: string) => void;
  onCharacterAction: (action: string, target: string) => void;
  onPassAction: () => void;
};

function getActionTitle(action: SuggestedActionItem) {
  if (action.label?.trim()) return action.label.trim();

  if (action.kind === "world") {
    if (action.action === "unity") return "Stabilize the Realm";
    if (action.action === "boundary") return "Increase Tension";
    if (action.action === "fragmentation") return "Drive Fracture";
  }

  if (action.kind === "character") {
    if (action.target) {
      return `${formatActionVerb(action.action)} ${action.target}`;
    }
    return formatActionVerb(action.action);
  }

  return "Apply Pressure";
}

function getActionDescription(action: SuggestedActionItem) {
  if (action.kind === "world") {
    if (action.action === "unity") {
      return "Encourage consolidation, alignment, and a stronger center.";
    }

    if (action.action === "boundary") {
      return "Lean into pressure and let strain gather at the edges of order.";
    }

    if (action.action === "fragmentation") {
      return "Push the world toward division, instability, and open fracture.";
    }

    return "Shift the pressure shaping the realm.";
  }

  if (action.kind === "character") {
    if (action.target) {
      return `Influence ${action.target} and alter the balance around them.`;
    }

    return "Place pressure on a key figure within the realm.";
  }

  return "Intervene in the realm and redirect the next turning.";
}

function formatActionVerb(action?: string) {
  if (!action) return "Influence";

  return action
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function SuggestedActions({
  actions,
  loading = false,
  onWorldAction,
  onCharacterAction,
  onPassAction,
}: SuggestedActionsProps) {
  const worldActions = actions.filter((action) => action.kind === "world");
  const characterActions = actions.filter((action) => action.kind === "character");

  return (
    <section className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-3xl border border-stone-800 bg-stone-950/50">
        <div className="border-b border-stone-800/80 px-5 py-4 sm:px-6">
          <p className="text-[11px] uppercase tracking-[0.35em] text-amber-400/80">
            Influence
          </p>
          <h2 className="mt-2 text-xl font-semibold text-stone-50">
            Choose How to Touch the Story
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">
            You are not issuing orders to a machine. You are applying pressure to a living
            structure and watching what answers back.
          </p>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <button
            type="button"
            onClick={onPassAction}
            disabled={loading}
            className="w-full rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-left transition hover:border-amber-400/50 hover:bg-amber-500/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-amber-300/90">
                  Passive Flow
                </p>
                <h3 className="mt-2 text-base font-semibold text-stone-50">
                  Let it unfold
                </h3>
                <p className="mt-2 text-sm leading-7 text-stone-300">
                  Release direct control and allow the realm to evolve according to its
                  present condition.
                </p>
              </div>

              <span className="rounded-full border border-amber-500/30 bg-stone-950/50 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-amber-200">
                Default
              </span>
            </div>
          </button>
        </div>
      </div>

      {worldActions.length > 0 ? (
        <div className="overflow-hidden rounded-3xl border border-stone-800 bg-stone-950/40">
          <div className="border-b border-stone-800/80 px-5 py-4 sm:px-6">
            <p className="text-[11px] uppercase tracking-[0.35em] text-amber-400/80">
              Realm Pressure
            </p>
            <h3 className="mt-2 text-lg font-semibold text-stone-50">
              Shape the World Directly
            </h3>
          </div>

          <div className="grid gap-3 px-5 py-5 sm:px-6">
            {worldActions.map((action, index) => (
              <button
                key={`${action.kind}-${action.action}-${action.target ?? "world"}-${index}`}
                type="button"
                onClick={() => action.action && onWorldAction(action.action)}
                disabled={loading || !action.action}
                className="rounded-2xl border border-stone-700 bg-stone-900/60 px-4 py-4 text-left transition hover:border-amber-400/40 hover:bg-stone-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <h4 className="text-sm font-semibold text-stone-50">
                  {getActionTitle(action)}
                </h4>
                <p className="mt-2 text-sm leading-7 text-stone-300">
                  {getActionDescription(action)}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {characterActions.length > 0 ? (
        <div className="overflow-hidden rounded-3xl border border-stone-800 bg-stone-950/40">
          <div className="border-b border-stone-800/80 px-5 py-4 sm:px-6">
            <p className="text-[11px] uppercase tracking-[0.35em] text-amber-400/80">
              Character Pressure
            </p>
            <h3 className="mt-2 text-lg font-semibold text-stone-50">
              Influence Key Figures
            </h3>
          </div>

          <div className="grid gap-3 px-5 py-5 sm:px-6">
            {characterActions.map((action, index) => (
              <button
                key={`${action.kind}-${action.action}-${action.target ?? "character"}-${index}`}
                type="button"
                onClick={() =>
                  action.action && action.target
                    ? onCharacterAction(action.action, action.target)
                    : undefined
                }
                disabled={loading || !action.action || !action.target}
                className="rounded-2xl border border-stone-700 bg-stone-900/60 px-4 py-4 text-left transition hover:border-amber-400/40 hover:bg-stone-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <h4 className="text-sm font-semibold text-stone-50">
                  {getActionTitle(action)}
                </h4>
                <p className="mt-2 text-sm leading-7 text-stone-300">
                  {getActionDescription(action)}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
