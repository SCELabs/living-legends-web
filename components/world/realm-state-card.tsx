import { WorldState } from "@/lib/api";
import { getRealmUI, toneClass } from "@/lib/labels";

type RealmStateCardProps = {
  world: WorldState;
};

export default function RealmStateCard({ world }: RealmStateCardProps) {
  const ui = getRealmUI(world.realm_state);

  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">Realm</h2>
        <span className={`text-xs font-medium ${toneClass(ui.tone)}`}>
          {ui.label}
        </span>
      </div>

      {world.name && (
        <div className="text-sm text-text mb-2">{world.name}</div>
      )}

      {world.premise && (
        <p className="text-xs text-muted mb-3 line-clamp-3">
          {world.premise}
        </p>
      )}

      {world.resources && (
        <div className="mt-3 flex flex-col gap-2">
          {Object.entries(world.resources).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-muted capitalize">{key}</span>
              <span className="text-text">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
