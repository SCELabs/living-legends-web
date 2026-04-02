import { Role } from "@/lib/api";
import { getConditionUI, toneClass } from "@/lib/labels";

type CastPanelProps = {
  cast: Role[];
};

export default function CastPanel({ cast }: CastPanelProps) {
  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">Cast</h2>
        <span className="text-xs text-muted">{cast.length}</span>
      </div>

      <div className="flex flex-col gap-3">
        {cast.map((c) => {
          const ui = getConditionUI(c.condition);

          return (
            <div
              key={c.role_id}
              className="rounded-lg border border-border p-3 bg-panel"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-text">
                    {c.name}
                  </span>
                  <span className="text-xs text-muted">
                    {c.display_role}
                  </span>
                </div>

                <span
                  className={`text-xs font-medium ${toneClass(ui.tone)}`}
                >
                  {ui.label}
                </span>
              </div>

              {c.bio && (
                <p className="mt-2 text-xs text-muted line-clamp-2">
                  {c.bio}
                </p>
              )}

              {c.traits && c.traits.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.traits.slice(0, 3).map((trait, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-1 rounded bg-border text-muted"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {cast.length === 0 && (
          <div className="text-sm text-muted">No characters.</div>
        )}
      </div>
    </div>
  );
}
