"use client";

import { useMemo, useState } from "react";
import FiguresInMotion from "@/components/story/figures-in-motion";
import CourtPanel from "@/components/story/court-panel";

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

type StructuralFooterProps = {
  cast: CastMember[];
  latestFocusCharacter: string | null;
  relationshipText: string | null;
  courtData: CourtData;
};

export default function StructuralFooter({
  cast,
  latestFocusCharacter,
  relationshipText,
  courtData,
}: StructuralFooterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const spotlightCast = useMemo(() => {
    const scored = [...cast].map((member) => {
      let score = member.influence || 0;

      if (member.name === latestFocusCharacter) score += 1.5;
      if (member.condition === "unraveling") score += 0.5;
      if (member.condition === "divided") score += 0.3;
      if (member.condition === "uncertain") score += 0.15;

      return { member, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.member);
  }, [cast, latestFocusCharacter]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70]">
      {isOpen ? (
        <div
          className="pointer-events-auto absolute inset-0 bg-black/20 backdrop-blur-[1px] transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      ) : null}

      <div className="pointer-events-none relative flex min-h-screen items-end justify-center px-3 pb-3 sm:px-6 sm:pb-4">
        <div
          className={`pointer-events-auto w-full max-w-5xl overflow-hidden rounded-t-3xl border border-stone-700/70 bg-stone-950/80 shadow-[0_-12px_36px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-300 ease-out ${
            isOpen ? "max-h-[78vh]" : "max-h-[132px]"
          }`}
        >
          {!isOpen ? (
            <>
              <div className="border-b border-stone-800/70 px-3 py-2 sm:px-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300/75">
                      Living Structure
                    </p>
                    <p className="mt-1 text-[11px] text-stone-500">
                      The structure remains in motion beneath the chronicle.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="shrink-0 rounded-full border border-stone-700/80 bg-stone-900/60 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-amber-200/80 transition hover:border-stone-600 hover:bg-stone-800/70"
                  >
                    View the Court
                  </button>
                </div>
              </div>

              <div className="p-3 sm:p-4">
                <FiguresInMotion
                  relationshipText={relationshipText}
                  latestFocusCharacter={latestFocusCharacter}
                  spotlightCast={spotlightCast}
                  conditionTone={courtData.conditionTone}
                  compact
                />
              </div>
            </>
          ) : (
            <>
              <div className="border-b border-stone-800/70 px-3 py-2 sm:px-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300/75">
                      Court Dossier
                    </p>
                    <p className="mt-1 text-[11px] text-stone-500">
                      Open the court dossier.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="shrink-0 rounded-full border border-stone-700/80 bg-stone-900/60 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-stone-200 transition hover:border-stone-600 hover:bg-stone-800/70"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="max-h-[calc(78vh-56px)] overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
                <CourtPanel
                  cast={courtData.cast}
                  latestFocusCharacter={courtData.latestFocusCharacter}
                  conditionTone={courtData.conditionTone}
                  relationshipSummary={courtData.relationshipSummary}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
