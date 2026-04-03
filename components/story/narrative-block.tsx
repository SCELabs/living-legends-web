export type ChronicleEntry = {
  id: string;
  kind: "prologue" | "narrative" | "resolved_influence" | "system";
  label?: string;
  body: string;
  pressure?: string;
  weight?: "minor" | "major";
  focusCharacter?: string;
};

type NarrativeBlockProps = {
  entry: ChronicleEntry;
};

export default function NarrativeBlock({ entry }: NarrativeBlockProps) {
  const isPrologue = entry.kind === "prologue";
  const isResolved = entry.kind === "resolved_influence";
  const isMajor = entry.weight === "major";

  return (
    <article
      className={`animate-[fadeIn_0.6s_ease-out] ${
        isPrologue
          ? "border-b border-stone-800/80 pb-8"
          : isResolved
            ? "border-l-2 border-amber-500/30 pl-4"
            : "border-b border-stone-800/60 pb-6 last:border-none"
      }`}
    >
      {entry.label ? (
        <p
          className={`text-[11px] uppercase tracking-[0.32em] ${
            isResolved
              ? "text-amber-300/80"
              : isPrologue
                ? "text-amber-400/80"
                : "text-stone-400"
          }`}
        >
          {entry.label}
        </p>
      ) : null}

      <div
        className={`mt-3 whitespace-pre-wrap ${
          isPrologue
            ? "text-base leading-8 text-stone-100 sm:text-lg"
            : isMajor
              ? "text-[15px] leading-8 text-stone-100 sm:text-base"
              : "text-[15px] leading-8 text-stone-200"
        }`}
      >
        {entry.body}
      </div>

      {entry.pressure ? (
        <div className="mt-4 border-l-2 border-stone-700/80 pl-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
            Pressure
          </p>
          <p className="mt-2 text-sm leading-7 text-stone-400">
            {entry.pressure}
          </p>
        </div>
      ) : null}
    </article>
  );
}
