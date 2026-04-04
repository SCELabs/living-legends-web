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
    <div className="mt-4 border-t border-stone-800/80 pt-4">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-2xl border border-stone-800 bg-stone-900/40 px-4 py-3 text-left transition hover:border-stone-700 hover:bg-stone-900/60"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-stone-400">
            View the Court
          </p>
          <p className="mt-1 text-sm text-stone-300">
            Optional lore and structural details.
          </p>
        </div>
        <span className="text-xs uppercase tracking-[0.2em] text-amber-200">
          {open ? "Hide" : "Open"}
        </span>
      </button>

      {open ? (
        <div className="mt-4 grid gap-3">
          {cast.map((member) => {
            const isFocused = latestFocusCharacter === member.name;
            const summary = relationshipSummary(member.name || "");

            return (
              <div
                key={member.role_id || member.name}
                className={`rounded-2xl border px-4 py-4 ${
                  isFocused
                    ? "border-amber-400/20 bg-amber-400/5"
                    : "border-stone-800 bg-stone-900/35"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-stone-500">
                      {member.display_role}
                    </p>
                    <h3 className="mt-2 text-base font-medium text-stone-100">
                      {member.name}
                    </h3>
                    <p className={`mt-1 text-sm ${conditionTone(member.condition)}`}>
                      {member.condition_label}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-stone-400 sm:min-w-[180px]">
                    <div className="rounded-xl border border-stone-800 bg-stone-950/40 px-3 py-2">
                      <p className="uppercase tracking-[0.18em] text-stone-500">
                        Influence
                      </p>
                      <p className="mt-1 text-sm text-stone-200">
                        {typeof member.influence === "number"
                          ? member.influence.toFixed(2)
                          : "—"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-stone-800 bg-stone-950/40 px-3 py-2">
                      <p className="uppercase tracking-[0.18em] text-stone-500">
                        Volatility
                      </p>
                      <p className="mt-1 text-sm text-stone-200">
                        {typeof member.volatility === "number"
                          ? member.volatility.toFixed(2)
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {member.bio ? (
                  <p className="mt-4 text-sm leading-6 text-stone-300">
                    {member.bio}
                  </p>
                ) : null}

                {summary ? (
                  <div className="mt-4 rounded-xl border border-stone-800/80 bg-stone-950/30 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">
                      Bonds
                    </p>
                    <p className="mt-1 text-sm text-stone-300">{summary}</p>
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
