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
        {latestFocusCharacter ? (
          <div className="hidden rounded-full border border-amber-400/10 bg-amber-400/5 px-2.5 py-0.5 text-[10px] text-amber-200/80 sm:block">
            Focus: {latestFocusCharacter}
          </div>
        ) : null}
      </div>

      <div className="mt-3 grid gap-2.5 md:grid-cols-3">
        {spotlightCast.map((member) => {
          const isFocused = latestFocusCharacter === member.name;

          return (
            <div
              key={member.role_id || member.name}
              className={`rounded-xl border px-3 py-2.5 transition ${
                isFocused
                  ? "border-amber-400/20 bg-amber-400/5"
                  : "border-stone-800/80 bg-stone-900/35"
              }`}
            >
              <p className="text-[9px] uppercase tracking-[0.24em] text-stone-500">
                {member.display_role}
              </p>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <h3 className="text-xs font-medium text-stone-100">
                  {member.name}
                </h3>
                {isFocused ? (
                  <span className="rounded-full border border-amber-400/10 bg-amber-400/5 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-amber-200/70">
                    focus
                  </span>
                ) : null}
              </div>
              <p className={`mt-1 text-xs ${conditionTone(member.condition)}`}>
                {member.condition_label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
