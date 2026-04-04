type CastMember = {
  role_id?: string;
  display_role?: string;
  name?: string;
  condition?: string;
  condition_label?: string;
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
    <section className="mb-6 rounded-3xl border border-stone-800/80 bg-stone-950/30 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-amber-300/80">
            Figures in Motion
          </p>
          <p className="mt-2 text-sm leading-6 text-stone-300">
            {relationshipText ||
              "A few figures pull the structure toward loyalty, fracture, and consequence."}
          </p>
        </div>
        {latestFocusCharacter ? (
          <div className="hidden rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-200 sm:block">
            Focus: {latestFocusCharacter}
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {spotlightCast.map((member) => {
          const isFocused = latestFocusCharacter === member.name;

          return (
            <div
              key={member.role_id || member.name}
              className={`rounded-2xl border px-4 py-3 transition ${
                isFocused
                  ? "border-amber-400/30 bg-amber-400/10 shadow-[0_0_0_1px_rgba(251,191,36,0.08)]"
                  : "border-stone-800 bg-stone-900/55"
              }`}
            >
              <p className="text-[10px] uppercase tracking-[0.28em] text-stone-500">
                {member.display_role}
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <h3 className="text-sm font-medium text-stone-100">
                  {member.name}
                </h3>
                {isFocused ? (
                  <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-amber-200">
                    active
                  </span>
                ) : null}
              </div>
              <p className={`mt-2 text-sm ${conditionTone(member.condition)}`}>
                {member.condition_label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
