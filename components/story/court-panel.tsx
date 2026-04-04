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
            const influence = typeof member.influence === "number" ? member.influence : null;
            const volatility =
              typeof member.volatility === "number" ? member.volatility : null;

            const highInfluence = influence !== null && influence >= 0.7;
            const highVolatility = volatility !== null && volatility >= 0.65;

            return (
              <div
                key={member.role_id || member.name}
                className={`rounded-xl border px-3.5 py-3 ${
                  isFocused
                    ? "border-amber-400/15 bg-amber-400/5"
                    : highVolatility
                    ? "border-red-500/10 bg-stone-900/30"
                    : highInfluence
                    ? "border-amber-300/10 bg-stone-900/28"
                    : "border-stone-800/80 bg-stone-900/25"
                }`}
              >
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-[0.24em] text-stone-500">
                      {member.display_role}
                    </p>

                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-medium text-stone-100">
                        {member.name}
                      </h3>

                      {isFocused ? (
                        <span className="rounded-full border border-amber-400/10 bg-amber-400/5 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-amber-200/70">
                          in motion
                        </span>
                      ) : null}

                      {highInfluence ? (
                        <span className="rounded-full border border-amber-300/10 bg-amber-300/5 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-amber-100/70">
                          central
                        </span>
                      ) : null}

                      {highVolatility ? (
                        <span className="rounded-full border border-red-400/10 bg-red-400/5 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-red-200/70">
                          under strain
                        </span>
                      ) : null}
                    </div>

                    <p className={`mt-1 text-xs ${conditionTone(member.condition)}`}>
                      {member.condition_label}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-stone-400 sm:min-w-[190px]">
                    <div
                      className={`rounded-lg border px-2.5 py-2 ${
                        highInfluence
                          ? "border-amber-300/15 bg-amber-300/5"
                          : "border-stone-800 bg-stone-950/30"
                      }`}
                    >
                      <p className="uppercase tracking-[0.16em] text-stone-500">
                        Influence
                      </p>
                      <p
                        className={`mt-0.5 text-xs ${
                          highInfluence ? "text-amber-100" : "text-stone-200"
                        }`}
                      >
                        {influence !== null ? influence.toFixed(2) : "—"}
                      </p>
                    </div>

                    <div
                      className={`rounded-lg border px-2.5 py-2 ${
                        highVolatility
                          ? "border-red-400/15 bg-red-400/5"
                          : "border-stone-800 bg-stone-950/30"
                      }`}
                    >
                      <p className="uppercase tracking-[0.16em] text-stone-500">
                        Volatility
                      </p>
                      <p
                        className={`mt-0.5 text-xs ${
                          highVolatility ? "text-red-100" : "text-stone-200"
                        }`}
                      >
                        {volatility !== null ? volatility.toFixed(2) : "—"}
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
                    <p className="text-[9px] uppercase tracking-[0.22em] text-amber-200/55">
                      Court Intelligence
                    </p>
                    <p className="mt-1 text-xs leading-5 text-stone-300">
                      {summary}
                    </p>
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
