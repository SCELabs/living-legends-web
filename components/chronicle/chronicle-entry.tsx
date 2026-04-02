import { EventRecord } from "@/lib/api";
import { getEventLabel, getRealmUI } from "@/lib/labels";

type ChronicleEntryProps = {
  event: EventRecord;
  emphasized?: boolean;
};

function formatActionLabel(action?: string | null) {
  if (!action) return null;

  return action
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatChangeLine(change: NonNullable<EventRecord["changes"]>[number]) {
  const fromLabel = change.from ? getRealmUI(change.from).label : "Unknown";
  const toLabel = change.to ? getRealmUI(change.to).label : "Unknown";
  const roleLabel = change.display_role?.trim() ? `, ${change.display_role}` : "";

  return `${change.name}${roleLabel} shifted from ${fromLabel} to ${toLabel}.`;
}

export default function ChronicleEntry({
  event,
  emphasized = false,
}: ChronicleEntryProps) {
  const eventLabel = getEventLabel(event.event_type);
  const actionLabel = formatActionLabel(event.action);
  const beforeUI = event.realm_state_before
    ? getRealmUI(event.realm_state_before)
    : null;
  const afterUI = event.realm_state_after
    ? getRealmUI(event.realm_state_after)
    : null;
  const changes = event.changes ?? [];

  return (
    <article
      className={`rounded-2xl border ${
        emphasized
          ? "border-amber-500/20 bg-amber-500/5"
          : "border-stone-800 bg-stone-950/30"
      } p-4`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={`text-[11px] uppercase tracking-[0.28em] ${
              emphasized ? "text-amber-300/90" : "text-stone-400"
            }`}
          >
            {eventLabel}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-stone-700 bg-stone-950/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-300">
              Turn {event.tick}
            </span>

            {actionLabel ? (
              <span className="rounded-full border border-stone-700 bg-stone-950/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-300">
                {actionLabel}
              </span>
            ) : null}

            {event.target ? (
              <span className="rounded-full border border-stone-700 bg-stone-950/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-300">
                {event.target}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {(beforeUI || afterUI) && (
        <div className="mt-4 rounded-xl border border-stone-800 bg-stone-950/40 px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">
            Realm Shift
          </p>
          <p className="mt-2 text-sm leading-7 text-stone-300">
            {beforeUI && afterUI
              ? `The realm moved from ${beforeUI.label} to ${afterUI.label}.`
              : afterUI
              ? `The realm now stands ${afterUI.label.toLowerCase()}.`
              : beforeUI
              ? `The realm departed from ${beforeUI.label.toLowerCase()}.`
              : null}
          </p>
        </div>
      )}

      {changes.length > 0 ? (
        <div className="mt-4 space-y-2">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">
            Consequences
          </p>

          <div className="space-y-2">
            {changes.map((change, index) => (
              <div
                key={`${change.name}-${change.from}-${change.to}-${index}`}
                className="rounded-xl border border-stone-800 bg-stone-950/30 px-3 py-3"
              >
                <p className="text-sm leading-7 text-stone-300">
                  {formatChangeLine(change)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {event.trigger ? (
        <div className="mt-4">
          <p className="text-xs leading-6 text-stone-500">
            Trigger: {event.trigger.replaceAll("_", " ")}
          </p>
        </div>
      ) : null}
    </article>
  );
}
