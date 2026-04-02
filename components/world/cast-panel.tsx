import { CastMember } from "@/lib/api";
import { getConditionUI, getRoleLabel } from "@/lib/labels";

type CastPanelProps = {
  cast: CastMember[];
};

function getConditionHint(condition?: string) {
  if (condition === "stable") {
    return "Still holding position within the current order.";
  }

  if (condition === "pressured") {
    return "Under visible strain. Their next movement may carry consequence.";
  }

  if (condition === "fractured") {
    return "Destabilized, compromised, or no longer acting from solid ground.";
  }

  return "Their place in the realm is still taking shape.";
}

export default function CastPanel({ cast }: CastPanelProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-stone-800 bg-stone-950/50">
      <div className="border-b border-stone-800/80 px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-amber-400/80">
              Cast
            </p>
            <h2 className="mt-2 text-xl font-semibold text-stone-50">
              Figures Within the Realm
            </h2>
          </div>

          <span className="rounded-full border border-stone-700 bg-stone-900/80 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-300">
            {cast.length} present
          </span>
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        {cast.length > 0 ? (
          <div className="space-y-4">
            {cast.map((member, index) => {
              const conditionUI = getConditionUI(member.condition);

              return (
                <article
                  key={`${member.name}-${member.structural_role}-${index}`}
                  className="rounded-2xl border border-stone-800 bg-stone-900/40 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-stone-50">
                        {member.name}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-stone-700 bg-stone-950/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-300">
                          {getRoleLabel(member.structural_role)}
                        </span>

                        <span
                          className={`rounded-full border border-stone-700 bg-stone-950/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${conditionUI.tone}`}
                        >
                          {conditionUI.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-stone-300">
                    {member.description?.trim()
                      ? member.description
                      : `${member.name} remains part of the realm's active structure, and their next shift may alter the balance around them.`}
                  </p>

                  <div className="mt-4 rounded-xl border border-stone-800 bg-stone-950/40 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">
                      Current Standing
                    </p>
                    <p className="mt-2 text-sm leading-7 text-stone-300">
                      {getConditionHint(member.condition)}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-700 bg-stone-900/30 px-4 py-5">
            <p className="text-sm leading-7 text-stone-300">
              No figures have stepped clearly into view yet. The realm is present, but its
              human tensions have not fully revealed themselves.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
