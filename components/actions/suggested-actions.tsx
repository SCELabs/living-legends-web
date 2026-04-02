import { SuggestedAction } from "@/lib/api";

type SuggestedActionsProps = {
  actions: SuggestedAction[];
  loading?: boolean;
  onWorldAction: (action: string) => void;
  onCharacterAction: (action: string, target: string) => void;
  onPassAction?: () => void;
};

export default function SuggestedActions({
  actions,
  loading = false,
  onWorldAction,
  onCharacterAction,
  onPassAction,
}: SuggestedActionsProps) {
  function handleAction(action: SuggestedAction) {
    if (loading) return;

    if (action.kind === "world") {
      onWorldAction(action.action);
      return;
    }

    if (action.kind === "character" && action.target) {
      onCharacterAction(action.action, action.target);
      return;
    }

    if (action.kind === "pass") {
      if (onPassAction) {
        onPassAction();
      } else {
        onWorldAction("boundary");
      }
    }
  }

  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">Suggested Interventions</h2>
        <span className="text-xs text-muted">
          {actions.length} option{actions.length === 1 ? "" : "s"}
        </span>
      </div>

      <p className="mb-4 text-sm text-muted">
        The world suggests where pressure matters most.
      </p>

      <div className="flex flex-col gap-2">
        {actions.length === 0 ? (
          <button
            className="button w-full"
            onClick={onPassAction}
            disabled={loading}
          >
            {loading ? "Advancing..." : "Let It Unfold"}
          </button>
        ) : (
          actions.map((action, index) => (
            <button
              key={`${action.label}-${index}`}
              className={`button w-full text-left ${
                index === 0 ? "primary" : ""
              }`}
              onClick={() => handleAction(action)}
              disabled={loading}
            >
              {action.label}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
