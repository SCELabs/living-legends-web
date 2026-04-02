import { WorldState } from "@/lib/api";
import { getRealmUI, toneClass } from "@/lib/labels";

type RealmStateCardProps = {
  world: WorldState;
};

function formatResourceLabel(key: string) {
  return key.replaceAll("_", " ");
}

function getResourceHint(key: string) {
  if (key === "stability") return "How firmly the realm holds together";
  if (key === "tension") return "How much strain is building beneath the surface";
  if (key === "cohesion") return "How strongly the realm still moves as one";
  if (key === "fragmentation") return "How near the world is to visible fracture";
  if (key === "trust") return "How much faith still binds the court";
  if (key === "fear") return "How much dread is shaping decisions";
  return "A pressure currently shaping the realm";
}

export default function RealmStateCard({ world }: RealmStateCardProps) {
  const ui = getRealmUI(world.realm_state);
  const resources = world.resources ? Object.entries(world.resources) : [];

  return (
    <section>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-amber-400/80">
            Realm State
          </p>
          <h2 className="mt-2 text-xl font-semibold text-stone-50">
            The Shape of the World
          </h2>
        </div>

        <span
          className={`rounded-full border border-stone-700 bg-stone-900/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${toneClass(
            ui.tone
          )}`}
        >
          {ui.label}
        </span>
      </div>

      {world.name ? (
        <div className="mt-5">
          <p className="text-[11px] uppercase tracking-[0.28em] text-stone-400">
            Realm
          </p>
          <p className="mt-2 text-base font-medium text-stone-100">{world.name}</p>
        </div>
      ) : null}

      {world.premise ? (
        <div className="mt-5 border-l-2 border-stone-700 pl-4">
          <p className="text-[11px] uppercase tracking-[0.28em] text-stone-400">
            Premise
          </p>
          <p className="mt-2 text-sm leading-7 text-stone-300">{world.premise}</p>
        </div>
      ) : null}

      {resources.length > 0 ? (
        <div className="mt-6 border-t border-stone-800/80 pt-5">
          <p className="text-[11px] uppercase tracking-[0.28em] text-stone-400">
            Pressures in Motion
          </p>

          <div className="mt-4 space-y-4">
            {resources.map(([key, value]) => (
              <div key={key}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium capitalize text-stone-100">
                    {formatResourceLabel(key)}
                  </span>
                  <span className="text-sm text-stone-200">{String(value)}</span>
                </div>
                <p className="mt-1 text-xs leading-6 text-stone-400">
                  {getResourceHint(key)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 border-l-2 border-stone-700 pl-4">
          <p className="text-sm leading-7 text-stone-300">
            The realm is readable, but its deeper pressures have not yet surfaced into
            visible signals.
          </p>
        </div>
      )}
    </section>
  );
}
