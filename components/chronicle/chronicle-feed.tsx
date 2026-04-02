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
    <section className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-3xl border border-stone-800 bg-stone-950/50">
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
              <span className="rounded-full border border-stone-700 bg-stone-900/80 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-300">
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
            <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.25em] text-amber-300/80">
                Pressure
              </p>
              <p className="mt-2 text-sm leading-7 text-stone-300">
                {latestNarration.pressure}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-stone-800 bg-stone-950/40">
        <div className="border-b border-stone-800/80 px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-amber-400/80">
                Chronicle
              </p>
              <h3 className="mt-2 text-lg font-semibold text-stone-50">
                What Has Already Been Set In Motion
              </h3>
            </div>

            <span className="rounded-full border border-stone-700 bg-stone-900/80 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-300">
              {eventCountLabel}
            </span>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6">
          {latestEvent ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-stone-700/80 bg-stone-900/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.3em] text-amber-300/80">
                  Most Recent Event
                </p>
                <div className="mt-3">
                  <ChronicleEntry event={latestEvent} emphasized />
                </div>
              </div>

              {previousEvents.length > 0 ? (
                <div className="rounded-2xl border border-stone-800 bg-stone-900/30 p-4">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400">
                    Earlier Turns
                  </p>
                  <div className="mt-4 space-y-3">
                    {previousEvents.map((event, index) => (
                      <ChronicleEntry
                        key={`${event.tick}-${event.event_type}-${index}`}
                        event={event}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-700 bg-stone-900/30 px-4 py-5">
              <p className="text-sm leading-7 text-stone-300">
                No public turning has been recorded yet. The realm is poised at the threshold,
                waiting for its first visible shift.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
