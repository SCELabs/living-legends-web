import { EventRecord, NarrationPayload } from "@/lib/api";
import ChronicleEntry from "@/components/chronicle/chronicle-entry";
import { getEventLabel } from "@/lib/labels";

type ChronicleFeedProps = {
  latestNarration: NarrationPayload | null;
  history: EventRecord[];
};

export default function ChronicleFeed({
  latestNarration,
  history,
}: ChronicleFeedProps) {
  const latestEvent = history.length > 0 ? history[history.length - 1] : null;

  return (
    <section className="flex flex-col gap-4">
      <div className="panel p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="label">Latest Event</span>
          {latestNarration?.event_type ? (
            <span className="text-xs text-muted">
              {getEventLabel(latestNarration.event_type)}
            </span>
          ) : null}
        </div>

        <div className="whitespace-pre-wrap text-sm leading-relaxed text-text">
          {latestNarration?.narration || "The world is quiet... for now."}
        </div>

        {latestNarration?.pressure ? (
          <div className="mt-4 text-xs text-muted">
            {latestNarration.pressure}
          </div>
        ) : null}
      </div>

      <div className="panel h-[520px] overflow-y-auto p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Chronicle</h2>
          <span className="text-xs text-muted">
            {history.length} event{history.length === 1 ? "" : "s"}
          </span>
        </div>

        {history.length === 0 ? (
          <div className="text-sm text-muted">No events yet.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {[...history].reverse().map((event) => (
              <ChronicleEntry
                key={`${event.tick}-${event.event_type}`}
                event={event}
                isLatest={latestEvent?.tick === event.tick}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
