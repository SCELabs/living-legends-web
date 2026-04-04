type CastMember = {
  role_id?: string;
  display_role?: string;
  name?: string;
  condition?: string;
  condition_label?: string;
  influence?: number;
  volatility?: number;
};

type FiguresInMotionProps = {
  relationshipText: string | null;
  latestFocusCharacter: string | null;
  spotlightCast: CastMember[];
  conditionTone: (condition?: string) => string;
};

export default function FiguresInMotion({
  relationshipText,
  latestFocusCharacter,
  spotlightCast,
  conditionTone,
}: FiguresInMotionProps) {
  return (
    <section className="mb-4 rounded-2xl border border-stone-800/70 bg-stone-950/20 p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] uppercase tracking-[0.32em] text-amber-300/70">
            Figures in Motion
          </p>
          <p className="mt-1 text-xs leading-5 text-stone-400">
            {relationshipText ||
              "A few figures are quietly shaping the structure."}
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-2.5 md:grid-cols-3">
        {spotlightCast.map((member) => {
          const isFocused = latestFocusCharacter === member.name;
          const influence =
            typeof member.influence === "number" ? member.influence : null;
          const volatility =
            typeof member.volatility === "number" ? member.volatility : null;

          const highInfluence = influence !== null && influence >= 0.7;
          const highVolatility = volatility !== null && volatility >= 0.65;

          return (
            <div
              key={member.role_id || member.name}
              className={`rounded-xl border px-3 py-2.5 transition ${
                isFocused
                  ? "border-amber-400/20 bg-amber-400/6"
                  : highVolatility
                  ? "border-red-500/10 bg-stone-900/38"
                  : highInfluence
                  ? "border-amber-300/10 bg-stone-900/35"
                  : "border-stone-800/80 bg-stone-900/35"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[0.24em] text-stone-500">
                    {member.display_role}
                  </p>
                  <h3 className="mt-1 text-xs font-medium text-stone-100">
                    {member.name}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-1">
                  {isFocused ? (
                    <span className="rounded-full border border-amber-400/10 bg-amber-400/5 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-amber-200/70">
                      locus
                    </span>
                  ) : null}

                  {!isFocused && highInfluence ? (
                    <span className="rounded-full border border-amber-300/10 bg-amber-300/5 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-amber-100/65">
                      central
                    </span>
                  ) : null}

                  {highVolatility ? (
                    <span className="rounded-full border border-red-400/10 bg-red-400/5 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-red-200/65">
                      strain
                    </span>
                  ) : null}
                </div>
              </div>

              <p className={`mt-1.5 text-xs ${conditionTone(member.condition)}`}>
                {member.condition_label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
