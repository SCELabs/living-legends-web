import { EventRecord, NarrationPayload } from "@/lib/api";
import { getEventLabel } from "@/lib/labels";

type ChronicleFeedProps = {
  latestNarration: NarrationPayload | null;
  history: EventRecord[];
};

function ChronicleEntry({
  event,
  isLatest = false,
}: {
  event: EventRecord;
  isLatest?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-panel p-4 ${
        isLatest ? "shadow-panel" : ""
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="label">{getEventLabel(event.event_type)}</span>
        <span className="text-xs text-muted">Tick {event.tick}</span>
      </div>

      <div className="text-sm text-text">
        {event.trigger === "character_action" && event.action && event.target ? (
          <p>
            An intervention was made: <span className="text-text">{event.action}</span>{" "}
            affected <span className="text-text">{event.target}</span>.
          </p>
        ) : (
          <p>
            The realm shifted toward{" "}
            <span className="text-text">{event.realm_state_after || "change"}</span>.
          </p>
        )}
      </div>

      {event.changes && event.changes.length > 0 && (
        <div className="mt-3 space-y-1">
          <div className="label">Shifts</div>
          {event.changes.map((change, index) => (
            <div key={`${change.name}-${index}`} className="text-sm text-muted">
              {change.name}: {change.from} → {change.to}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChronicleFeed({
  latestNarration,
  history,
}: ChronicleFeedProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="panel p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="label">Latest Event</span>
          {latestNarration?.event_type ? (
            <span className="text-xs text-muted">
              {getEventLabel(latestNarration.event_type)}
            </span>
          ) : null}
        </div>

        <div className="whitespace-pre-wrap text-sm text-text">
          {latestNarration?.narration || "The world is quiet... for now."}
        </div>

        {latestNarration?.pressure ? (
          <div className="mt-3 text-xs text-muted">{latestNarration.pressure}</div>
        ) : null}
      </div>

      <div className="panel h-[520px] overflow-y-auto p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Chronicle</h2>
          <span className="text-xs text-muted">
            {history.length} event{history.length === 1 ? "" : "s"}
          </span>
        </div>

        {history.length === 0 ? (
          <div className="text-sm text-muted">No events yet.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {[...history].reverse().map((event, index) => (
              <ChronicleEntry
                key={`${event.tick}-${event.event_type}-${index}`}
                event={event}
                isLatest={index === 0}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
