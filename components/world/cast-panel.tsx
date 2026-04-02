import { Character } from "@/lib/api";
import { getRealmUI } from "@/lib/labels";

type CastPanelProps = {
  cast: Character[];
};

function getStateLine(member: Character) {
  if (!member.state) return null;

  const stateLabel = getRealmUI(member.state).label;
  return `${member.name} currently stands in ${stateLabel.toLowerCase()}.`;
}

export default function CastPanel({ cast }: CastPanelProps) {
  if (!cast || cast.length === 0) {
    return (
      <section>
        <p className="text-[11px] uppercase tracking-[0.35em] text-amber-400/80">
          Cast
        </p>
        <h2 className="mt-2 text-xl font-semibold text-stone-50">
          Figures in the Realm
        </h2>

        <div className="mt-5 border-l-2 border-stone-700 pl-4">
          <p className="text-sm leading-7 text-stone-300">
            No figures have emerged yet. The realm is still forming its first
            identities.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <p className="text-[11px] uppercase tracking-[0.35em] text-amber-400/80">
        Cast
      </p>
      <h2 className="mt-2 text-xl font-semibold text-stone-50">
        Figures in the Realm
      </h2>

      <div className="mt-5 space-y-5">
        {cast.map((member, index) => {
          const stateLine = getStateLine(member);

          return (
            <div
              key={`${member.name}-${index}`}
              className="border-b border-stone-800 pb-5 last:border-none last:pb-0"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-stone-100">
                    {member.name}
                  </h3>

                  {member.role ? (
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-stone-400">
                      {member.role}
                    </p>
                  ) : null}
                </div>

                {member.state ? (
                  <span className="rounded-full border border-stone-700 bg-stone-900/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-300">
                    {getRealmUI(member.state).label}
                  </span>
                ) : null}
              </div>

              <p className="mt-3 text-sm leading-7 text-stone-300">
                {member.description?.trim()
                  ? member.description
                  : `${member.name} remains part of the realm's active structure, and their next shift may alter the balance around them.`}
              </p>

              {stateLine ? (
                <p className="mt-2 text-xs leading-6 text-stone-500">
                  {stateLine}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
