import { EventRecord } from "@/lib/api";
import { getEventLabel } from "@/lib/labels";

type ChronicleEntryProps = {
  event: EventRecord;
  isLatest?: boolean;
};

export default function ChronicleEntry({
  event,
  isLatest = false,
}: ChronicleEntryProps) {
  return (
    <div
      className={`relative rounded-xl border border-border bg-panel p-4 ${
        isLatest ? "shadow-panel" : ""
      }`}
    >
      {/* subtle timeline indicator */}
      <div className="absolute left-0 top-4 bottom-4 w-[2px] bg-border" />

      <div className="pl-3">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <span className="label">{getEventLabel(event.event_type)}</span>
          <span className="text-xs text-muted">Tick {event.tick}</span>
        </div>

        {/* Narrative Summary */}
        <div className="text-sm text-text leading-relaxed">
          {event.trigger === "character_action" && event.action && event.target ? (
            <p>
              A force moves quietly.{" "}
              <span className="text-text">{event.target}</span> is affected.
            </p>
          ) : (
            <p>
              The structure shifts. The realm trends toward{" "}
              <span className="text-text">
                {event.realm_state_after || "change"}
              </span>.
            </p>
          )}
        </div>

        {/* Changes */}
        {event.changes && event.changes.length > 0 && (
          <div className="mt-3 space-y-1">
            <div className="label">Shifts</div>
            {event.changes.map((change, index) => (
              <div
                key={`${change.name}-${index}`}
                className="text-sm text-muted"
              >
                {change.name}: {change.from} → {change.to}
              </div>
            ))}
          </div>
        )}

        {/* subtle divider */}
        <div className="mt-4 h-px bg-border" />
      </div>
    </div>
  );
}
