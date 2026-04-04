import { useState } from "react";

type CastMember = {
  role_id?: string;
  display_role?: string;
  name?: string;
  condition?: string;
  condition_label?: string;
  bio?: string;
  influence?: number;
  volatility?: number;
};

type CourtPanelProps = {
  cast: CastMember[];
  latestFocusCharacter: string | null;
  conditionTone: (condition?: string) => string;
  relationshipSummary: (name: string) => string | null;
};

export default function CourtPanel({
  cast,
  latestFocusCharacter,
  conditionTone,
  relationshipSummary,
}: CourtPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3 border-t border-stone-800/70 pt-3">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-xl border border-stone-800/80 bg-stone-900/25 px-3 py-2.5 text-left transition hover:border-stone-700/80 hover:bg-stone-900/40"
      >
        <div>
          <p className="text-[11px] uppercase tracking-[0.26em] text-stone-400">
            View the Court
          </p>
          <p className="mt-0.5 text-xs text-stone-500">
            Optional lore and structural details.
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-[0.18em] text-amber-200/80">
          {open ? "Hide" : "Open"}
        </span>
      </button>

      {open ? (
        <div className="mt-3 grid gap-2.5">
          {cast.map((member) => {
            const isFocused = latestFocusCharacter === member.name;
            const summary = relationshipSummary(member.name || "");

            return (
              <div
                key={member.role_id || member.name}
                className={`rounded-xl border px-3.5 py-3 ${
                  isFocused
                    ? "border-amber-400/15 bg-amber-400/5"
                    : "border-stone-800/80 bg-stone-900/25"
                }`}
              >
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.24em] text-stone-500">
                      {member.display_role}
                    </p>
                    <h3 className="mt-1.5 text-sm font-medium text-stone-100">
                      {member.name}
                    </h3>
                    <p className={`mt-1 text-xs ${conditionTone(member.condition)}`}>
                      {member.condition_label}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-stone-400 sm:min-w-[170px]">
                    <div className="rounded-lg border border-stone-800 bg-stone-950/30 px-2.5 py-2">
                      <p className="uppercase tracking-[0.16em] text-stone-500">
                        Influence
                      </p>
                      <p className="mt-0.5 text-xs text-stone-200">
                        {typeof member.influence === "number"
                          ? member.influence.toFixed(2)
                          : "—"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-stone-800 bg-stone-950/30 px-2.5 py-2">
                      <p className="uppercase tracking-[0.16em] text-stone-500">
                        Volatility
                      </p>
                      <p className="mt-0.5 text-xs text-stone-200">
                        {typeof member.volatility === "number"
                          ? member.volatility.toFixed(2)
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {member.bio ? (
                  <p className="mt-3 text-xs leading-5 text-stone-300">
                    {member.bio}
                  </p>
                ) : null}

                {summary ? (
                  <div className="mt-3 rounded-lg border border-stone-800/70 bg-stone-950/25 px-2.5 py-2">
                    <p className="text-[9px] uppercase tracking-[0.22em] text-stone-500">
                      Bonds
                    </p>
                    <p className="mt-0.5 text-xs text-stone-300">{summary}</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
