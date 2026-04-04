"use client";

import { getConditionLabel } from "@/lib/labels";

type CastMember = {
  role_id?: string;
  display_role?: string;
  name?: string;
  condition?: string;
  condition_label?: string;
  influence?: number;
  volatility?: number;
};

type Props = {
  spotlightCast: CastMember[];
  latestFocusCharacter: string | null;
  relationshipText: string | null;
  onOpen: () => void;
};

function cue(member: CastMember, isFocus: boolean) {
  if (isFocus) return "locus";
  if ((member.volatility || 0) >= 0.65) return "strain";
  if ((member.influence || 0) >= 0.7) return "central";
  return getConditionLabel(member.condition, member.condition_label);
}

export default function StructuralPulseBar({
  spotlightCast,
  latestFocusCharacter,
  relationshipText,
  onOpen,
}: Props) {
  return (
    <div className="flex h-[60px] items-center gap-3 px-3 sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
        {spotlightCast.map((m) => {
          const isFocus = m.name === latestFocusCharacter;
          return (
            <div
              key={m.name || m.role_id}
              className={`min-w-0 rounded-md border px-2 py-1 text-[11px] leading-tight ${
                isFocus
                  ? "border-amber-400/40 bg-amber-500/10 text-amber-200"
                  : "border-stone-700/70 bg-stone-900/60 text-stone-200"
              }`}
              title={relationshipText || ""}
            >
              <div className="truncate font-medium">
                {m.display_role || m.name}
              </div>
              <div className="truncate text-[10px] text-stone-400">
                {cue(m, isFocus)}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="shrink-0 rounded-full border border-stone-700/80 bg-stone-900/60 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-amber-200/80 transition hover:border-stone-600 hover:bg-stone-800/70"
      >
        Court
      </button>
    </div>
  );
}
