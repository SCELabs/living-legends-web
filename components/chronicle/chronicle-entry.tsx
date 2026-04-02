import { EventRecord } from "@/lib/api";
import { getEventLabel, getRealmUI } from "@/lib/labels";

type ChronicleEntryProps = {
  event: EventRecord;
  emphasized?: boolean;
};

function formatActionLabel(action?: string | null) {
  if (!action || action === "none") return null;

  return action
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatTriggerLabel(trigger?: string) {
  if (!trigger) return null;

  return trigger
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getRealmShiftLine(event: EventRecord) {
  const before = event.realm_state_before;
  const after = event.realm_state_after;

  if (!before && !after) return null;
  if (before && after && before === after) return null;

  const beforeLabel = before ? getRealmUI(before).label : null;
  const afterLabel = after ? getRealmUI(after).label : null;

  if (beforeLabel && afterLabel) {
    return `The realm moved from ${beforeLabel} to ${afterLabel}.`;
  }

  if (afterLabel) {
    return `The realm now stands ${afterLabel.toLowerCase()}.`;
  }

  if (beforeLabel) {
    return `The realm departed from ${beforeLabel.toLowerCase()}.`;
  }

  return null;
}

function getChangeLine(change: NonNullable<EventRecord["changes"]>[number]) {
  const roleLabel = change.display_role?.trim() ? `, ${change.display_role}` : "";
  const fromLabel = change.from ? getRealmUI(change.from).label : "Unknown";
  const toLabel = change.to ? getRealmUI(change.to).label : "Unknown";

  if (change.from && change.to && change.from === change.to) {
    return `${change.name}${roleLabel} remained ${toLabel}.`;
  }

  return `${change.name}${roleLabel} shifted from ${fromLabel} to ${toLabel}.`;
}

export default function ChronicleEntry({
  event,
  emphasized = false,
}: ChronicleEntryProps) {
  const eventLabel = getEventLabel(event.event_type);
  const actionLabel = formatActionLabel(event.action);
  const triggerLabel = formatTriggerLabel(event.trigger);
  const realmShiftLine = getRealmShiftLine(event);
  const changes = event.changes ?? [];

  return (
    <article
      className={`rounded-2xl border px-4 py-4 ${
        emphasized
          ? "border-amber-500/20 bg-amber-500/5"
          : "border-stone-800 bg-stone-950/20"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <p
          className={`text-[11px] uppercase tracking-[0.28em] ${
            emphasized ? "text-amber-300/90" : "text-stone-400"
          }`}
        >
          {eventLabel}
        </p>

        <span className="rounded-full border border-stone-700 bg-stone-950/60 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-300">
          Turn {event.tick}
        </span>

        {actionLabel ? (
          <span className="rounded-full border border-stone-700 bg-stone-950/60 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-300">
            {actionLabel}
          </span>
        ) : null}

        {event.target ? (
          <span className="rounded-full border border-stone-700 bg-stone-950/60 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-300">
            {event.target}
          </span>
        ) : null}
      </div>

      {realmShiftLine ? (
        <p className="mt-4 text-sm leading-7 text-stone-200">{realmShiftLine}</p>
      ) : null}

      {changes.length > 0 ? (
        <div className="mt-4 space-y-2">
          {changes.map((change, index) => (
            <p
              key={`${change.name}-${change.from}-${change.to}-${index}`}
              className="text-sm leading-7 text-stone-300"
            >
              {getChangeLine(change)}
            </p>
          ))}
        </div>
      ) : null}

      {triggerLabel ? (
        <p className="mt-4 text-xs leading-6 text-stone-500">
          Trigger: {triggerLabel}
        </p>
      ) : null}
    </article>
  );
}
