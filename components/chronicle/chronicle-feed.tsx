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
  const previousEvents =
    history.length > 1 ? history.slice(0, history.length - 1).reverse() : [];

  const hasNarration = Boolean(latestNarration?.narration);
  const eventCountLabel = `${history.length} event${history.length === 1 ? "" : "s"}`;

  return (
    <section className="overflow-hidden rounded-3xl border border-stone-800 bg-stone-950/45">
      <div className="border-b border-stone-800/80 px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-amber-400/80">
              Latest Turning
            </p>
            <h2 className="mt-2 text-xl font-semibold text-stone-50">
              The Realm Speaks
            </h2>
          </div>

          {latestNarration?.event_type ? (
            <span className="rounded-full border border-stone-700 bg-stone-900/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-300">
              {getEventLabel(latestNarration.event_type)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="whitespace-pre-wrap text-[15px] leading-8 text-stone-100 sm:text-base">
          {hasNarration
            ? latestNarration?.narration
            : "The realm holds still for a breath. Beneath the silence, pressure gathers."}
        </div>

        {latestNarration?.pressure ? (
          <div className="mt-5 border-l-2 border-amber-500/30 pl-4">
            <p className="text-[11px] uppercase tracking-[0.25em] text-amber-300/80">
              Pressure
            </p>
            <p className="mt-2 text-sm leading-7 text-stone-300">
              {latestNarration.pressure}
            </p>
          </div>
        ) : null}
      </div>

      <div className="border-t border-stone-800/80 px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-amber-400/80">
              Chronicle
            </p>
            <h3 className="mt-2 text-lg font-semibold text-stone-50">
              What Has Been Set In Motion
            </h3>
          </div>

          <span className="rounded-full border border-stone-700 bg-stone-900/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-300">
            {eventCountLabel}
          </span>
        </div>
      </div>

      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        {latestEvent ? (
          <div className="space-y-3">
            <ChronicleEntry event={latestEvent} emphasized />

            {previousEvents.length > 0 ? (
              <div className="flex items-center gap-3 py-2">
                <div className="h-px flex-1 bg-stone-800" />
                <span className="text-[11px] uppercase tracking-[0.25em] text-stone-500">
                  Earlier
                </span>
                <div className="h-px flex-1 bg-stone-800" />
              </div>
            ) : null}

            {previousEvents.map((event, index) => (
              <ChronicleEntry
                key={`${event.tick}-${event.event_type}-${index}`}
                event={event}
              />
            ))}
          </div>
        ) : (
          <div className="border-l-2 border-stone-700 pl-4">
            <p className="text-sm leading-7 text-stone-300">
              No turning has been recorded yet. The realm stands at the threshold,
              waiting for its first visible shift.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
