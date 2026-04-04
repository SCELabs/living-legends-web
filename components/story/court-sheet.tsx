"use client";

import CourtPanel from "@/components/story/court-panel";
import { getConditionLabel } from "@/lib/labels";

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

type CourtData = {
  cast: CastMember[];
  latestFocusCharacter: string | null;
  conditionTone: (condition?: string) => string;
  relationshipSummary: (name: string) => string | null;
};

type Props = {
  courtData: CourtData;
  latestFocusCharacter: string | null;
  relationshipText: string | null;
  spotlightCast: CastMember[];
  onClose: () => void;
};

function cue(member: CastMember, isFocus: boolean) {
  if (isFocus) return "locus";
  if ((member.volatility || 0) >= 0.65) return "under strain";
  if ((member.influence || 0) >= 0.7) return "central";
  return getConditionLabel(member.condition, member.condition_label);
}

export default function CourtSheet({
  courtData,
  latestFocusCharacter,
  relationshipText,
  spotlightCast,
  onClose,
}: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-stone-800/70 px-4 py-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-amber-300/80">
            Court Dossier
          </p>
          <p className="mt-1 text-[11px] text-stone-500">
            The structure beneath the realm.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-stone-700/80 bg-stone-900/60 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-stone-200 transition hover:border-stone-600 hover:bg-stone-800/70"
        >
          Close
        </button>
      </div>

      <div className="border-b border-stone-800/60 px-3 py-3">
        <div className="flex flex-wrap gap-2">
          {spotlightCast.map((m) => {
            const isFocus = m.name === latestFocusCharacter;
            return (
              <div
                key={m.name || m.role_id}
                className={`rounded-md border px-2 py-1 text-[11px] ${
                  isFocus
                    ? "border-amber-400/40 bg-amber-500/10 text-amber-200"
                    : "border-stone-700/70 bg-stone-900/60 text-stone-200"
                }`}
                title={relationshipText || ""}
              >
                <div className="font-medium">
                  {m.display_role || m.name}
                </div>
                <div className="text-[10px] text-stone-400">
                  {cue(m, isFocus)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
        <CourtPanel
          cast={courtData.cast}
          latestFocusCharacter={courtData.latestFocusCharacter}
          conditionTone={courtData.conditionTone}
          relationshipSummary={courtData.relationshipSummary}
        />
      </div>
    </div>
  );
}
